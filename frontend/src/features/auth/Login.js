import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setUser, setError } from './userSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/users/login', { email, password });
      dispatch(setUser(res.data));
      setLoading(false);
      window.location.href = '/blogs';
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Login failed'));
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded font-semibold hover:bg-blue-800" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
} 