const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin, profilePic: user.profilePic } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile picture
router.put('/profile-pic', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.profilePic = req.body.profilePic;
    await user.save();
    res.json({ profilePic: user.profilePic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow or unfollow a user
router.put('/:id/follow', auth, async (req, res) => {
  try {
    if (req.user.id === req.params.id) return res.status(400).json({ message: 'You cannot follow yourself' });
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (!userToFollow || !currentUser) return res.status(404).json({ message: 'User not found' });
    const isFollowing = currentUser.following.includes(userToFollow._id);
    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(userToFollow._id);
      userToFollow.followers.pull(currentUser._id);
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }
    await currentUser.save();
    await userToFollow.save();
    res.json({ following: currentUser.following, followers: userToFollow.followers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get followers
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username profilePic');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get following
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username profilePic');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      _id: user._id,
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      profilePic: user.profilePic
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
