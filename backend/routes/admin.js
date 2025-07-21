const express = require('express');
const User = require('../models/User');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get all users
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a user
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all blogs
router.get('/blogs', auth, admin, async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'username');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a blog
router.delete('/blogs/:id', auth, admin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 