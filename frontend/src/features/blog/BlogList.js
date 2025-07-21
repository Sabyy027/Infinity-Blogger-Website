import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setBlogs, setError } from './blogSlice';
import { useNavigate, Link } from 'react-router-dom';
import Picker from 'emoji-picker-react';
import { addNotification } from '../../features/notification/notificationSlice';

function getInitials(name) {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function BlogList() {
  const dispatch = useDispatch();
  const { blogs, error } = useSelector(state => state.blogs);
  const user = useSelector(state => state.user.user);
  const token = useSelector(state => state.user.token);
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [showEmoji, setShowEmoji] = useState({});
  const [expanded, setExpanded] = useState({});
  const [followLoading, setFollowLoading] = useState({});
  const [followersMap, setFollowersMap] = useState({});

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await axios.get('/api/blogs');
        dispatch(setBlogs(res.data));
      } catch (err) {
        dispatch(setError('Failed to fetch blogs'));
      }
    }
    fetchBlogs();
  }, [dispatch]);

  // Fetch followers for all authors on mount
  useEffect(() => {
    async function fetchFollowers() {
      if (!user) return;
      const map = {};
      for (const blog of blogs) {
        if (blog.author?._id && blog.author._id !== user.id) {
          try {
            const res = await axios.get(`/api/users/${blog.author._id}/followers`);
            map[blog.author._id] = res.data;
          } catch {}
        }
      }
      setFollowersMap(map);
    }
    fetchFollowers();
    // eslint-disable-next-line
  }, [blogs, user]);

  const handleEdit = (blog) => {
    navigate(`/blogs/edit/${blog._id}`, { state: { blog } });
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await axios.delete(`/api/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh blogs
      const res = await axios.get('/api/blogs');
      dispatch(setBlogs(res.data));
    } catch (err) {
      dispatch(setError('Failed to delete blog'));
    }
  };

  const handleLike = async (blogId) => {
    setLikeLoading(l => ({ ...l, [blogId]: true }));
    try {
      await axios.post(`/api/blogs/${blogId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await axios.get('/api/blogs');
      dispatch(setBlogs(res.data));
    } catch (err) {
      dispatch(setError('Failed to like blog'));
    }
    setLikeLoading(l => ({ ...l, [blogId]: false }));
  };

  const handleComment = async (blogId) => {
    if (!commentText[blogId]) return;
    setCommentLoading(c => ({ ...c, [blogId]: true }));
    try {
      await axios.post(`/api/blogs/${blogId}/comment`, { text: commentText[blogId] }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentText(c => ({ ...c, [blogId]: '' }));
      setShowEmoji(e => ({ ...e, [blogId]: false }));
      const res = await axios.get('/api/blogs');
      dispatch(setBlogs(res.data));
    } catch (err) {
      dispatch(setError('Failed to add comment'));
    }
    setCommentLoading(c => ({ ...c, [blogId]: false }));
  };

  const handleEmojiClick = (blogId, emojiData) => {
    setCommentText(c => ({ ...c, [blogId]: (c[blogId] || '') + emojiData.emoji }));
  };

  const handleFollow = async (authorId) => {
    setFollowLoading(l => ({ ...l, [authorId]: true }));
    try {
      await axios.put(`/api/users/${authorId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh followers for this author
      const res = await axios.get(`/api/users/${authorId}/followers`);
      setFollowersMap(m => ({ ...m, [authorId]: res.data }));
      const isNowFollowing = res.data.some(f => f._id === user.id);
      dispatch(addNotification({
        type: 'success',
        message: isNowFollowing ? 'You are now following this user.' : 'You have unfollowed this user.',
      }));
    } catch {
      dispatch(addNotification({ type: 'error', message: 'Failed to update follow status.' }));
    }
    setFollowLoading(l => ({ ...l, [authorId]: false }));
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-3xl font-bold mb-6 font-apple">All Blogs</h1>
      {error && <div className="text-red-600 mb-4 font-apple">{error}</div>}
      {blogs.length === 0 ? (
        <div className="text-gray-500 font-apple flex flex-col items-center">
          No blogs yet. {user && (
            <>
              <span className="mb-4">Be the first to create one!</span>
              <button
                className="btn-apple bg-green-500 text-white px-6 py-2 rounded-full font-semibold font-apple hover:bg-green-600"
                onClick={() => navigate('/blogs/create')}
              >
                Create Blog
              </button>
            </>
          )}
        </div>
      ) : (
        blogs.map(blog => {
          // Split content into lines
          const lines = blog.content.split(/<br\s*\/?>|\n/);
          const isLong = lines.length > 20;
          const preview = lines.slice(0, 20).join('<br/>');
          const showFull = expanded[blog._id];
          const authorId = blog.author?._id;
          const isMe = user && authorId === user.id;
          const followers = followersMap[authorId] || [];
          const isFollowing = followers.some(f => f._id === user?.id);
          return (
            <div key={blog._id} className="glass bg-white/80 p-6 rounded-2xl shadow-glass mb-8 animate-fade-in">
              <div className="flex items-center mb-2">
                <Link to={authorId ? `/profile/${authorId}` : '#'} className="flex items-center group">
                  {blog.author?.profilePic ? (
                    <img
                      src={blog.author.profilePic}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover mr-3 shadow border-2 border-blue-200 group-hover:ring-2 group-hover:ring-blue-400 transition"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 mr-3 shadow group-hover:ring-2 group-hover:ring-blue-400 transition">
                      {getInitials(blog.author?.username)}
                    </div>
                  )}
                </Link>
                <div>
                  <Link to={authorId ? `/profile/${authorId}` : '#'} className="font-semibold text-gray-800 font-apple hover:underline">
                    {blog.author?.username || 'Unknown'}
                  </Link>
                  <div className="text-xs text-gray-500 font-apple">{new Date(blog.createdAt).toLocaleString()}</div>
                </div>
                {!isMe && authorId && user && (
                  <button
                    className={`ml-4 btn-apple px-4 py-1 rounded-full font-apple text-sm ${isFollowing ? 'bg-gray-300 text-gray-700' : 'bg-blue-900 text-white hover:bg-blue-800'}`}
                    onClick={() => handleFollow(authorId)}
                    disabled={followLoading[authorId]}
                  >
                    {followLoading[authorId] ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
              <h2 className="text-xl font-semibold font-apple mb-2">{blog.title}</h2>
              <p className="text-gray-700 mb-4 font-apple" dangerouslySetInnerHTML={{ __html: showFull ? blog.content : preview }} />
              {isLong && !showFull && (
                <button
                  className="btn-apple bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-apple hover:bg-blue-200 mb-4"
                  onClick={() => setExpanded(e => ({ ...e, [blog._id]: true }))}
                >
                  Read More
                </button>
              )}
              {isLong && showFull && (
                <button
                  className="btn-apple bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-apple hover:bg-gray-300 mb-4"
                  onClick={() => setExpanded(e => ({ ...e, [blog._id]: false }))}
                >
                  Show Less
                </button>
              )}
              {blog.media && blog.media.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4">
                  {blog.media.map((m, i) => m.type === 'image' ? (
                    <img key={i} src={m.url} alt="media" className="w-32 h-32 object-cover rounded-lg shadow" />
                  ) : (
                    <video key={i} src={m.url} controls className="w-32 h-32 rounded-lg shadow" />
                  ))}
                </div>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <button
                  onClick={() => handleLike(blog._id)}
                  className={`btn-apple px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${user ? 'bg-blue-100 text-blue-900 hover:bg-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  disabled={!user || likeLoading[blog._id]}
                  style={{ transition: 'transform 0.15s' }}
                >
                  <span className="text-xl">👍</span>
                  <span className="font-apple">{blog.likes.length}</span>
                </button>
                {user && blog.author?._id === user.id && (
                  <>
                    <button onClick={() => handleEdit(blog)} className="btn-apple bg-yellow-500 text-white px-3 py-1 rounded-full hover:bg-yellow-600">Edit</button>
                    <button onClick={() => handleDelete(blog._id)} className="btn-apple bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700">Delete</button>
                  </>
                )}
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2 font-apple">Comments</h3>
                {blog.comments && blog.comments.length > 0 ? (
                  blog.comments.map((c, i) => (
                    <div key={i} className="mb-2 text-sm text-gray-700 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {c.user?.profilePic ? (
                          <img
                            src={c.user.profilePic}
                            alt="avatar"
                            className="w-7 h-7 rounded-full object-cover border-2 border-blue-100"
                          />
                        ) : getInitials(c.user?.username)}
                      </div>
                      <span className="font-semibold font-apple">{c.user?.username || 'User'}:</span> {c.text}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm font-apple">No comments yet.</div>
                )}
                {user && (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleComment(blog._id);
                    }}
                    className="flex items-center mt-2 gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText[blog._id] || ''}
                      onChange={e => setCommentText(c => ({ ...c, [blog._id]: e.target.value }))}
                      className="flex-1 px-2 py-1 border rounded mr-2 font-apple"
                    />
                    <button
                      type="button"
                      className="btn-apple bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-apple hover:bg-gray-300"
                      onClick={() => setShowEmoji(e => ({ ...e, [blog._id]: !e[blog._id] }))}
                    >
                      😊
                    </button>
                    {showEmoji[blog._id] && (
                      <div className="absolute z-50 mt-12">
                        <Picker onEmojiClick={(_, emojiData) => handleEmojiClick(blog._id, emojiData)} />
                      </div>
                    )}
                    <button
                      type="submit"
                      className="btn-apple bg-blue-900 text-white px-3 py-1 rounded-full font-apple hover:bg-blue-800"
                      disabled={commentLoading[blog._id]}
                    >
                      {commentLoading[blog._id] ? 'Posting...' : 'Post'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
} 