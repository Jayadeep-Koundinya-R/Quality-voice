const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// Wilson score lower bound — gives a confidence-adjusted rating
// Balances high ratings with review count (avoids 1-review 5-star shops dominating)
function wilsonScore(positiveRatings, totalRatings) {
  if (totalRatings === 0) return 0;
  const z = 1.96; // 95% confidence
  const phat = positiveRatings / totalRatings;
  return (
    (phat + (z * z) / (2 * totalRatings) -
      z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * totalRatings)) / totalRatings)) /
    (1 + (z * z) / totalRatings)
  );
}

// Trending score formula:
// score = (avgRating * 0.4) + (recencyBoost * 0.35) + (reviewVolume * 0.25)
// recencyBoost decays over 7 days
function trendingScore(shop, recentReviewCount) {
  const now = Date.now();
  const createdAt = new Date(shop.createdAt).getTime();
  const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

  // Recency boost: shops added in last 7 days get a boost, decays after
  const recencyBoost = Math.max(0, 1 - ageInDays / 14);

  // Volume factor: log scale so 100 reviews isn't 100x better than 1
  const volumeFactor = Math.log1p(recentReviewCount) / Math.log1p(50);

  // Rating factor: normalize 0-5 to 0-1
  const ratingFactor = (shop.averageRating || 0) / 5;

  return ratingFactor * 0.45 + recencyBoost * 0.30 + volumeFactor * 0.25;
}

// GET /api/feed
router.get('/', protect, async (req, res) => {
  try {
    const { city, district, area, category } = req.query;

    const locationQuery = {};
    if (city) locationQuery.city = new RegExp(city, 'i');
    if (district) locationQuery.district = new RegExp(district, 'i');
    if (area) locationQuery.area = new RegExp(area, 'i');

    const categoryQuery = category && category !== 'All' ? { category } : {};
    const baseQuery = { ...locationQuery, ...categoryQuery };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get all candidate shops
    const allShops = await Shop.find({ ...baseQuery, totalReviews: { $gt: 0 } }).lean();

    // Count recent reviews per shop for trending calculation
    const recentReviewCounts = await Review.aggregate([
      {
        $match: {
          shopId: { $in: allShops.map((s) => s._id) },
          createdAt: { $gte: oneWeekAgo }
        }
      },
      { $group: { _id: '$shopId', count: { $sum: 1 } } }
    ]);

    const recentCountMap = {};
    recentReviewCounts.forEach((r) => {
      recentCountMap[r._id.toString()] = r.count;
    });

    // Score and sort for trending
    const scoredShops = allShops.map((shop) => ({
      ...shop,
      _trendScore: trendingScore(shop, recentCountMap[shop._id.toString()] || 0)
    }));

    const trending = scoredShops
      .sort((a, b) => b._trendScore - a._trendScore)
      .slice(0, 10);

    // New shops: recently added
    const newShops = await Shop.find(baseQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Govt badge shops
    const badgeShops = await Shop.find({ ...baseQuery, hasGovtBadge: true })
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(10)
      .lean();

    res.json({ trending, newShops, badgeShops });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
