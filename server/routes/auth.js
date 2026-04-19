const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('mobile')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 10, max: 15 })
      .withMessage('Enter a valid mobile number')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { name, email, password, mobile } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'This email is already registered. Try logging in.' });
      }

      const user = await User.create({
        name,
        email,
        password,
        mobile: mobile || ''
      });

      const token = generateToken(user._id);

      res.status(201).json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          location: user.location,
          isVerifiedBadge: user.isVerifiedBadge,
          avatar: user.avatar
        }
      });
    } catch (err) {
      console.error('Signup error:', err.message);
      res.status(500).json({ message: 'Something went wrong on our end. Please try again.' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Wrong email or password. Give it another try.' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Wrong email or password. Give it another try.' });
      }

      const token = generateToken(user._id);

      res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          location: user.location,
          isVerifiedBadge: user.isVerifiedBadge,
          avatar: user.avatar
        }
      });
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ message: 'Something went wrong on our end. Please try again.' });
    }
  }
);

module.exports = router;
