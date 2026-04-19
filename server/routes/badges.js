const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const Shop = require('../models/Shop');
const { protect, govtOrAdmin } = require('../middleware/auth');

// POST /api/badges/:shopId — give badge to a shop
router.post('/:shopId', protect, govtOrAdmin, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    if (shop.hasGovtBadge) {
      return res.status(400).json({ message: 'Shop already has a govt badge' });
    }

    const badge = await Badge.create({
      shopId: req.params.shopId,
      givenBy: req.user._id
    });

    await Shop.findByIdAndUpdate(req.params.shopId, { hasGovtBadge: true });

    res.status(201).json({ badge, message: 'Govt badge awarded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/badges/:shopId — remove badge from a shop
router.delete('/:shopId', protect, govtOrAdmin, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    if (!shop.hasGovtBadge) {
      return res.status(400).json({ message: 'Shop does not have a govt badge' });
    }

    await Badge.findOneAndUpdate(
      { shopId: req.params.shopId, isActive: true },
      { isActive: false, removedAt: new Date() }
    );

    await Shop.findByIdAndUpdate(req.params.shopId, { hasGovtBadge: false });

    res.json({ message: 'Govt badge removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
