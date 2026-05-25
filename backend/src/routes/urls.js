const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createUrl,
  getUserUrls,
  deleteUrl,
  updateUrl,
  getUrlAnalytics,
  getPublicStats,
} = require('../controllers/urlController');

// Protected routes
router.post('/', protect, createUrl);
router.get('/', protect, getUserUrls);
router.delete('/:id', protect, deleteUrl);
router.patch('/:id', protect, updateUrl);
router.get('/:id/analytics', protect, getUrlAnalytics);

// Public route
router.get('/:shortCode/public-stats', getPublicStats);

module.exports = router;
