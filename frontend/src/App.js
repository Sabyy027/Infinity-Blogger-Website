import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import BlogList from './features/blog/BlogList';
import BlogEditor from './features/blog/BlogEditor';
import UserProfile from './features/auth/UserProfile';
import AdminDashboard from './features/admin/AdminDashboard';
import Notification from './components/Notification';

function Home() {
  const user = useSelector(state => state.user.user);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-12">
      <h1 className="text-4xl font-bold mb-2 font-apple">Welcome to InfinityBlogger</h1>
      {user && <p className="text-lg text-gray-700 mb-8 font-apple">Hi, {user.username}!</p>}
      <div className="w-full max-w-3xl">
        <BlogList />
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const user = useSelector(state => state.user.user);
  return user ? children : <Login />;
}

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-white to-blue-200 text-center py-2 fixed bottom-0 left-0 z-40 text-gray-700 text-sm font-apple shadow-none">
      © 2025 InfinityBlogger. Website created by <a href="https://www.linkedin.com/in/sabeer-anwer-meeran/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sabeer Anwer Meeran</a>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Notification />
      <div className="pt-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<Navigate to="/" />} />
          <Route path="/blogs/create" element={<PrivateRoute><BlogEditor /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}
