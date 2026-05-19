const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getActivityLogs);

module.exports = router;
