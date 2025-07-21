import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Quill modules to strip all inline styles on paste
const quillModules = {
  clipboard: {
    matchStyles: false,
    matchVisual: false,
    matchers: [
      ['*', (node, delta) => {
        if (node.removeAttribute) node.removeAttribute('style');
        return delta;
      }],
    ],
  },
};

export default function BlogEditor() {
  const user = useSelector(state => state.user.user);
  const token = useSelector(state => state.user.token);
  const navigate = useNavigate();
  const location = useLocation();
  const editingBlog = location.state?.blog || null;

  const [title, setTitle] = useState(editingBlog ? editingBlog.title : '');
  const [content, setContent] = useState(editingBlog ? editingBlog.content : '');
  const [category, setCategory] = useState(editingBlog ? editingBlog.category : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return <div className="text-center mt-10 text-lg">You must be logged in to create or edit a blog.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const blogData = { title, content, category };
      if (editingBlog) {
        await axios.put(`/api/blogs/${editingBlog._id}`, blogData, config);
      } else {
        await axios.post('/api/blogs', blogData, config);
      }
      setLoading(false);
      navigate('/blogs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save blog');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 font-apple">{editingBlog ? 'Edit Blog' : 'Create Blog'}</h1>
      <form onSubmit={handleSubmit} className="glass bg-white/80 p-6 rounded-2xl shadow-glass animate-fade-in">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded font-apple"
          required
        />
        <input
          type="text"
          placeholder="Category (optional)"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded font-apple"
        />
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="mb-4 font-apple"
          modules={quillModules}
        />
        {error && <div className="text-red-600 mb-2 font-apple">{error}</div>}
        <button type="submit" className="btn-apple bg-blue-900 text-white px-6 py-2 rounded-full font-semibold font-apple hover:bg-blue-800" disabled={loading}>
          {loading ? (editingBlog ? 'Saving...' : 'Creating...') : (editingBlog ? 'Save Changes' : 'Create Blog')}
        </button>
      </form>
    </div>
  );
} 