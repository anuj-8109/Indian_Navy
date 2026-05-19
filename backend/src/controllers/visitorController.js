const Visitor = require('../models/Visitor');
const ActivityLog = require('../models/ActivityLog');
const QRCode = require('qrcode');
const { encrypt } = require('../utils/crypto');
const path = require('path');
const fs = require('fs');

// Helper to generate dynamic QR code based on client origin
const getDynamicQrCode = async (passNo, req) => {
  const urlSafePassNo = passNo.replace(/\//g, '_');
  let origin = req.headers.referer || req.headers.origin || 'http://localhost:5173';
  let clientOrigin = 'http://localhost:5173';
  try {
    const refUrl = new URL(origin);
    clientOrigin = refUrl.origin;
  } catch (err) {
    clientOrigin = origin;
  }
  const cleanOrigin = clientOrigin.endsWith('/') ? clientOrigin.slice(0, -1) : clientOrigin;
  const validationUrl = `${cleanOrigin}/#/visitor/${urlSafePassNo}`;
  return await QRCode.toDataURL(validationUrl, { width: 300, margin: 2 });
};

// Helper to generate sequential pass number
const generatePassNo = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `JLw/${currentYear}/`;
  
  // Find visitors with pass numbers starting with current year
  // Sort in descending order to get the highest one
  const latestVisitor = await Visitor.findOne({
    passNo: new RegExp(`^JLw/${currentYear}/`)
  })
  .sort({ passNo: -1 })
  .exec();

  let nextNumber = 1;

  if (latestVisitor && latestVisitor.passNo) {
    const parts = latestVisitor.passNo.split('/');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextNumber = lastSeq + 1;
    }
  }

  // Format sequence number to 4 digits (e.g., 0001)
  const sequenceStr = String(nextNumber).padStart(4, '0');
  return `${prefix}${sequenceStr}`;
};

// @desc    Register a new visitor
// @route   POST /api/visitors
// @access  Private (Admin only)
const registerVisitor = async (req, res) => {
  try {
    const visitorData = req.body;

    // Check if file is uploaded
    if (!req.file && !visitorData.capturedPhoto) {
      return res.status(400).json({ success: false, message: 'Visitor photo is required.' });
    }

    let photoPath = '';
    if (req.file) {
      // Saved via standard file upload
      photoPath = `/uploads/${req.file.filename}`;
    } else if (visitorData.capturedPhoto) {
      // Saved via base64 webcam capture
      const base64Data = visitorData.capturedPhoto.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `photo-cam-${uniqueSuffix}.png`;
      const uploadDir = path.join(__dirname, '../../uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      photoPath = `/uploads/${filename}`;
    }

    // Auto-generate pass number
    const passNo = await generatePassNo();
    
    // Generate QR Code data URL dynamically
    const qrCodeDataUrl = await getDynamicQrCode(passNo, req);

    // Create Visitor
    const visitor = new Visitor({
      ...visitorData,
      passNo,
      photoUrl: photoPath,
      qrCode: qrCodeDataUrl
    });

    await visitor.save();

    // Log Activity
    await ActivityLog.create({
      adminUsername: req.user.username,
      action: 'REGISTER_VISITOR',
      details: `Registered visitor ${visitor.fullName} with Pass No: ${passNo} [Role: ${visitor.role}]`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    res.status(201).json({
      success: true,
      visitor
    });
  } catch (error) {
    console.error('Register visitor error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error registering visitor' });
  }
};

// @desc    Get all visitors with search & filters
// @route   GET /api/visitors
// @access  Private (Admin only)
const getAllVisitors = async (req, res) => {
  try {
    const { search, role, dateFrom, dateTo, validityStatus } = req.query;
    let query = {};

    // Filter by Role
    if (role) {
      query.role = role;
    }

    // Search filter (fullName, phone, passNo, Aadhaar)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // We will perform deterministic encryption on search query to see if it matches Aadhaar exactly
      const encryptedSearch = encrypt(search);

      query.$or = [
        { fullName: searchRegex },
        { phone: searchRegex },
        { passNo: searchRegex },
        { aadhaarNumber: encryptedSearch } // Exact encrypted match
      ];
    }

    // Filter by Date of Reporting (DOR)
    if (dateFrom || dateTo) {
      query.dor = {};
      if (dateFrom) {
        query.dor.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Set to end of the day
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query.dor.$lte = endOfDay;
      }
    }

    // Filter by validity (active vs expired)
    if (validityStatus) {
      const now = new Date();
      if (validityStatus === 'active') {
        query.validityDate = { $gte: now };
      } else if (validityStatus === 'expired') {
        query.validityDate = { $lt: now };
      }
    }

    const visitors = await Visitor.find(query).sort({ createdAt: -1 });
    
    // Generate dynamic QR codes for each visitor returned
    const visitorsWithDynamicQr = await Promise.all(visitors.map(async (v) => {
      const visitorObj = v.toObject();
      try {
        visitorObj.qrCode = await getDynamicQrCode(v.passNo, req);
      } catch (err) {
        console.error('Error generating dynamic QR code:', err);
      }
      return visitorObj;
    }));

    res.json({
      success: true,
      visitors: visitorsWithDynamicQr
    });
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving visitors' });
  }
};

// @desc    Get visitor by ID
// @route   GET /api/visitors/:id
// @access  Private (Admin only)
const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }
    const visitorObj = visitor.toObject();
    visitorObj.qrCode = await getDynamicQrCode(visitor.passNo, req);
    res.json({ success: true, visitor: visitorObj });
  } catch (error) {
    console.error('Get visitor by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving visitor' });
  }
};

// @desc    Get visitor by Pass Number (for verification / QR link)
// @route   GET /api/visitors/pass/:passNo
// @access  Public (Allows scanning verify pages without login, or we can protect it)
// Note: Pass number in URL will have underscores instead of slashes
const getVisitorByPassNo = async (req, res) => {
  try {
    const passNo = req.params.passNo.replace(/_/g, '/');
    const visitor = await Visitor.findOne({ passNo });
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor pass verification failed. Invalid pass number.' });
    }
    
    // For public verification, we might want to hide sensitive details like Aadhaar
    // Let's create a public profile representation
    const publicProfile = {
      passNo: visitor.passNo,
      fullName: visitor.fullName,
      validityDate: visitor.validityDate,
      role: visitor.role,
      photoUrl: visitor.photoUrl,
      gender: visitor.gender,
      nationality: visitor.nationality,
      dor: visitor.dor,
      tor: visitor.tor,
      bg: visitor.bg
    };
    
    res.json({ success: true, visitor: publicProfile });
  } catch (error) {
    console.error('Get visitor by PassNo error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying visitor' });
  }
};

// @desc    Update visitor
// @route   PUT /api/visitors/:id
// @access  Private (Admin only)
const updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    const updateData = { ...req.body };

    // Handle photo update
    if (req.file) {
      updateData.photoUrl = `/uploads/${req.file.filename}`;
    } else if (updateData.capturedPhoto) {
      const base64Data = updateData.capturedPhoto.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `photo-cam-${uniqueSuffix}.png`;
      const uploadDir = path.join(__dirname, '../../uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      updateData.photoUrl = `/uploads/${filename}`;
      delete updateData.capturedPhoto; // Clean up payload
    }

    // Make sure we don't accidentally let them edit the Pass Number or QR Code unless necessary
    delete updateData.passNo;
    delete updateData.qrCode;

    // Update fields
    Object.keys(updateData).forEach(key => {
      visitor[key] = updateData[key];
    });

    await visitor.save();

    // Log Activity
    await ActivityLog.create({
      adminUsername: req.user.username,
      action: 'UPDATE_VISITOR',
      details: `Updated visitor details for ${visitor.fullName} (Pass No: ${visitor.passNo})`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    const visitorObj = visitor.toObject();
    visitorObj.qrCode = await getDynamicQrCode(visitor.passNo, req);
    res.json({ success: true, visitor: visitorObj });
  } catch (error) {
    console.error('Update visitor error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating visitor' });
  }
};

// @desc    Delete visitor
// @route   DELETE /api/visitors/:id
// @access  Private (Admin only)
const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    // Delete photo from disk if it exists
    if (visitor.photoUrl && visitor.photoUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../..', visitor.photoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const visitorName = visitor.fullName;
    const passNo = visitor.passNo;

    await visitor.deleteOne();

    // Log Activity
    await ActivityLog.create({
      adminUsername: req.user.username,
      action: 'DELETE_VISITOR',
      details: `Deleted visitor ${visitorName} (Pass No: ${passNo})`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    res.json({ success: true, message: 'Visitor deleted successfully' });
  } catch (error) {
    console.error('Delete visitor error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting visitor' });
  }
};

module.exports = {
  registerVisitor,
  getAllVisitors,
  getVisitorById,
  getVisitorByPassNo,
  updateVisitor,
  deleteVisitor
};
