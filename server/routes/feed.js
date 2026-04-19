const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const { protect } = require('../middleware/auth');

// GET /api/feed — returns trending, new, and badge shops by location
router.get('/', protect, async (req, res) => {
  try {
    const { city, district, area, category } = req.query;

    const locationQuery = {};
    if (city) locationQuery.city = new RegExp(city, 'i');
    if (district) locationQuery.district = new RegExp(district, 'i');
    if (area) locationQuery.area = new RegExp(area, 'i');

    const categoryQuery =
      category && category !== 'All' ? { category } : {};

    const baseQuery = { ...locationQuery, ...categoryQuery };

    // One week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Trending: top rated this week (shops with reviews in last 7 days, sorted by rating)
    const trending = await Shop.find({
      ...baseQuery,
      totalReviews: { $gt: 0 }
    })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(10);

    // New shops: added recently
    const newShops = await Shop.find(baseQuery)
      .sort({ createdAt: -1 })
      .limit(10);

    // Govt badge shops
    const badgeShops = await Shop.find({ ...baseQuery, hasGovtBadge: true })
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(10);

    res.json({ trending, newShops, badgeShops });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
