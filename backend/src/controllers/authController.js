const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'navy_secure_jwt_secret_key_987654321',
    { expiresIn: '30d' }
  );
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both username and password' });
  }

  try {
    // Find admin user
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Log login activity
    await ActivityLog.create({
      adminUsername: user.username,
      action: 'LOGIN',
      details: `Admin user logged in successfully.`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        isPasswordChanged: user.isPasswordChanged
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Change admin password
// @route   POST /api/auth/change-password
// @access  Private (Admin only)
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide both old and new passwords' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    // Update password
    user.password = newPassword;
    user.isPasswordChanged = true;
    await user.save();

    // Log password change activity
    await ActivityLog.create({
      adminUsername: user.username,
      action: 'PASSWORD_CHANGE',
      details: `Admin changed password.`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password update' });
  }
};

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private (Admin only)
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

module.exports = {
  login,
  changePassword,
  getMe
};
