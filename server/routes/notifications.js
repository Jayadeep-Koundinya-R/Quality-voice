const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET /api/notifications — get current user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate('actorId', 'name avatar')
      .populate('shopId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user._id,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/notifications/mark-all-read
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { read: true }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
