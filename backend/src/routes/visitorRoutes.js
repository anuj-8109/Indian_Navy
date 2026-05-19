const express = require('express');
const router = express.Router();
const {
  registerVisitor,
  getAllVisitors,
  getVisitorById,
  getVisitorByPassNo,
  updateVisitor,
  deleteVisitor
} = require('../controllers/visitorController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protected admin routes for CRUD operations
router.post('/', protect, upload.single('photo'), registerVisitor);
router.get('/', protect, getAllVisitors);
router.get('/:id', protect, getVisitorById);
router.put('/:id', protect, upload.single('photo'), updateVisitor);
router.delete('/:id', protect, deleteVisitor);

// Public route for scanning QR codes
router.get('/pass/:passNo', getVisitorByPassNo);

module.exports = router;
