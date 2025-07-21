import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

export default function AdminDashboard() {
  const user = useSelector(state => state.user.user);
  const token = useSelector(state => state.user.token);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [usersRes, blogsRes] = await Promise.all([
          axios.get('/api/admin/users', config),
          axios.get('/api/admin/blogs', config),
        ]);
        setUsers(usersRes.data);
        setBlogs(blogsRes.data);
      } catch (err) {
        setError('Failed to fetch admin data');
      }
      setLoading(false);
    }
    if (user?.isAdmin) fetchData();
  }, [user, token]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users => users.filter(u => u._id !== id));
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setBlogs(blogs => blogs.filter(b => b._id !== id));
    } catch {
      alert('Failed to delete blog');
    }
  };

  if (!user?.isAdmin) return <div className="text-center mt-10 text-lg">Admin access required.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 pt-16">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
        <>
          <h2 className="text-2xl font-bold mb-4">Users</h2>
          <div className="bg-white p-4 rounded shadow mb-8">
            {users.length === 0 ? <div>No users found.</div> : users.map(u => (
              <div key={u._id} className="flex justify-between items-center border-b py-2">
                <span>{u.username} ({u.email}) {u.isAdmin && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded ml-2">Admin</span>}</span>
                <button
                  onClick={() => handleDeleteUser(u._id)}
                  className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold hover:bg-red-600 hover:text-white transition"
                  title="Delete user"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Delete
                </button>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-4">Blogs</h2>
          <div className="bg-white p-4 rounded shadow">
            {blogs.length === 0 ? <div>No blogs found.</div> : blogs.map(b => (
              <div key={b._id} className="flex justify-between items-center border-b py-2">
                <span>{b.title} by {b.author?.username || 'Unknown'}</span>
                <button
                  onClick={() => handleDeleteBlog(b._id)}
                  className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold hover:bg-red-600 hover:text-white transition"
                  title="Delete blog"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 