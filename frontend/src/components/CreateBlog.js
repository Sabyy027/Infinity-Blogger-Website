import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createBlog } from '../features/blog/blogSlice';

export default function CreateBlog() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createBlog({
      title,
      content,
      categories: categories.split(',').map(c => c.trim())
    }));
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        required
        className="border p-2 w-full"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        className="border p-2 w-full"
        placeholder="Categories (comma separated)"
        value={categories}
        onChange={e => setCategories(e.target.value)}
      />
      <ReactQuill value={content} onChange={setContent} />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">Publish</button>
    </form>
  );
}
