const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/shops — list shops with optional location + category filters
router.get('/', protect, async (req, res) => {
  try {
    const { city, district, area, category, search, minRating, page = 1, limit = 20 } = req.query;

    const query = {};

    if (city) query.city = new RegExp(city, 'i');
    if (district) query.district = new RegExp(district, 'i');
    if (area) query.area = new RegExp(area, 'i');
    if (category && category !== 'All') query.category = category;
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { area: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const shops = await Shop.find(query)
      .sort({ averageRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Shop.countDocuments(query);

    res.json({ shops, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/shops/:id — get single shop
router.get('/:id', protect, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('addedBy', 'name');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ shop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/shops — create a new shop
router.post('/', protect, upload.array('photos', 5), async (req, res) => {
  try {
    const { name, category, address, city, district, area, description, phone } = req.body;

    if (!name || !category || !address || !city || !district || !area) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const photos = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const shop = await Shop.create({
      name,
      category,
      address,
      city,
      district,
      area,
      description,
      phone,
      photos,
      addedBy: req.user._id
    });

    res.status(201).json({ shop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
