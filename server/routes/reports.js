const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Shop = require('../models/Shop');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/reports — submit a report
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    const { shopId, reason, description } = req.body;

    if (!shopId || !reason || !description) {
      return res.status(400).json({ message: 'shopId, reason, and description are required' });
    }

    if (description.length < 30) {
      return res.status(400).json({ message: 'Description must be at least 30 characters' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const photo = req.file ? `/uploads/${req.file.filename}` : '';

    const report = await Report.create({
      shopId,
      userId: req.user._id,
      reason,
      description,
      photo
    });

    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/reports — temporary local access for authenticated users
router.get('/', protect, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('shopId', 'name city category')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/reports/:id/status — temporary local access for authenticated users
router.put('/:id/status', protect, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'reviewed' },
      { new: true }
    );

    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
