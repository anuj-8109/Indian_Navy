const ActivityLog = require('../models/ActivityLog');

// @desc    Get all activity logs
// @route   GET /api/logs
// @access  Private (Admin only)
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving logs' });
  }
};

module.exports = {
  getActivityLogs
};
