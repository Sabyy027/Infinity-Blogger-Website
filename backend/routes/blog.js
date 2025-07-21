const express = require('express');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

const router = express.Router();

// Create blog
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const blog = new Blog({
      title,
      content,
      category,
      author: req.user.id
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'username profilePic')
      .populate('comments.user', 'username profilePic')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profilePic')
      .populate('comments.user', 'username profilePic');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update blog
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, content, category } = req.body;
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete blog
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await blog.deleteOne();
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like or unlike a blog
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    const userId = req.user.id;
    const index = blog.likes.indexOf(userId);
    if (index === -1) {
      blog.likes.push(userId);
    } else {
      blog.likes.splice(index, 1);
    }
    await blog.save();
    res.json({ likes: blog.likes.length, liked: index === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a comment to a blog
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    const comment = {
      user: req.user.id,
      text: req.body.text,
    };
    blog.comments.push(comment);
    await blog.save();
    await blog.populate('comments.user', 'username profilePic');
    res.json(blog.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
