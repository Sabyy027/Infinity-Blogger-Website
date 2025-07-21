import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import avatars from '../../assets/avatars';
import { setUser } from './userSlice';
import { addNotification } from '../notification/notificationSlice';

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-lg p-6 min-w-[300px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-apple">{title}</h2>
          <button onClick={onClose} className="text-2xl font-bold text-gray-400 hover:text-gray-700">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { id } = useParams();
  const user = useSelector(state => state.user.user);
  const token = useSelector(state => state.user.token);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [myBlogs, setMyBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.profilePic || avatars[0]);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const isOwnProfile = !id || id === user?.id;
  const avatarMenuRef = useRef();

  useEffect(() => {
    async function fetchProfileAndBlogs() {
      try {
        let profileData = user;
        if (!isOwnProfile) {
          const res = await axios.get(`/api/users/${id}`);
          profileData = res.data;
          // Ensure profileData has both id and _id for consistency
          if (!profileData.id && profileData._id) profileData.id = profileData._id;
        }
        setProfile(profileData);
        const blogsRes = await axios.get('/api/blogs');
        setMyBlogs(blogsRes.data.filter(b => b.author?._id === (profileData.id || profileData._id)));
        const followersRes = await axios.get(`/api/users/${profileData.id || profileData._id}/followers`);
        setFollowers(followersRes.data);
        const followingRes = await axios.get(`/api/users/${profileData.id || profileData._id}/following`);
        setFollowing(followingRes.data);
      } catch {
        setMyBlogs([]);
        setFollowers([]);
        setFollowing([]);
      }
      setLoading(false);
    }
    if (user) fetchProfileAndBlogs();
  }, [user, id, isOwnProfile]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setShowAvatarMenu(false);
      }
    }
    if (showAvatarMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAvatarMenu]);

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setAvatarChanged(avatar !== user.profilePic);
  };

  const handleSaveAvatar = async () => {
    setSavingAvatar(true);
    try {
      await axios.put('/api/users/profile-pic', { profilePic: selectedAvatar }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = { ...user, profilePic: selectedAvatar };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch(setUser({ user: updatedUser, token }));
      setAvatarChanged(false);
      setShowAvatarMenu(false);
    } catch {}
    setSavingAvatar(false);
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      await axios.put(`/api/users/${profile._id}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const followersRes = await axios.get(`/api/users/${profile._id}/followers`);
      setFollowers(followersRes.data);
      const followingRes = await axios.get(`/api/users/${profile._id}/following`);
      setFollowing(followingRes.data);
      const isNowFollowing = followersRes.data.some(f => f._id === user.id);
      dispatch(addNotification({
        type: 'success',
        message: isNowFollowing ? `You are now following ${profile.username}.` : `You have unfollowed ${profile.username}.`,
      }));
    } catch {
      dispatch(addNotification({ type: 'error', message: 'Failed to update follow status.' }));
    }
    setFollowLoading(false);
  };

  if (!user || !profile) return <div className="text-center mt-10 text-lg font-apple">You must be logged in to view this profile.</div>;

  const isFollowing = followers.some(f => f._id === user.id);

  return (
    <div className="max-w-2xl mx-auto py-8 pt-24">
      <div className="glass bg-white/80 p-6 rounded-2xl shadow-glass mb-8 flex items-center gap-6 animate-fade-in relative">
        <img
          src={profile.profilePic || avatars[0]}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover shadow border-2 border-blue-200"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-2xl font-apple">{profile.username}</span>
            {isOwnProfile && (
              <button
                className="ml-2 text-2xl text-gray-500 hover:text-gray-800 px-2 py-1 rounded-full transition"
                onClick={() => setShowAvatarMenu(v => !v)}
                aria-label="Profile actions"
              >
                &#8942;
              </button>
            )}
          </div>
          <div className="text-gray-500 font-apple mb-2">{profile.email}</div>
          <div className="flex gap-6 items-center font-apple">
            <button className="hover:underline font-semibold" onClick={() => setShowFollowers(true)}>
              Followers <span className="font-normal">{followers.length}</span>
            </button>
            <button className="hover:underline font-semibold" onClick={() => setShowFollowing(true)}>
              Following <span className="font-normal">{following.length}</span>
            </button>
            {!isOwnProfile && (
              <button
                className={`btn-apple px-4 py-1 rounded-full font-apple ml-auto ${isFollowing ? 'bg-gray-300 text-gray-700' : 'bg-blue-900 text-white hover:bg-blue-800'}`}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>
        {/* Three-dot menu for avatar selection */}
        {isOwnProfile && showAvatarMenu && (
          <div ref={avatarMenuRef} className="absolute top-16 right-6 bg-white border rounded-xl shadow-lg p-4 z-20 min-w-[220px]">
            <h2 className="font-semibold font-apple mb-2">Choose your avatar</h2>
            <div className="flex gap-3 flex-wrap mb-3">
              {avatars.map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt={`avatar${i}`}
                  className={`w-12 h-12 rounded-full cursor-pointer border-2 ${selectedAvatar === avatar ? 'border-blue-600' : 'border-transparent'} hover:border-blue-400 transition`}
                  onClick={() => handleAvatarSelect(avatar)}
                  style={{ opacity: savingAvatar && selectedAvatar === avatar ? 0.5 : 1 }}
                />
              ))}
            </div>
            <button
              className="btn-apple bg-blue-900 text-white px-4 py-1 rounded-full font-semibold font-apple hover:bg-blue-800 disabled:opacity-50"
              onClick={handleSaveAvatar}
              disabled={!avatarChanged || savingAvatar}
            >
              {savingAvatar ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      {/* Followers Modal */}
      <Modal open={showFollowers} onClose={() => setShowFollowers(false)} title="Followers">
        <div className="flex flex-col gap-3">
          {followers.length === 0 && <span className="text-gray-400 font-apple text-sm">No followers yet.</span>}
          {followers.map(f => (
            <div key={f._id} className="flex items-center gap-3">
              <img src={f.profilePic || avatars[0]} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-blue-100" />
              <span className="font-apple text-base">{f.username}</span>
            </div>
          ))}
        </div>
      </Modal>
      {/* Following Modal */}
      <Modal open={showFollowing} onClose={() => setShowFollowing(false)} title="Following">
        <div className="flex flex-col gap-3">
          {following.length === 0 && <span className="text-gray-400 font-apple text-sm">Not following anyone yet.</span>}
          {following.map(f => (
            <div key={f._id} className="flex items-center gap-3">
              <img src={f.profilePic || avatars[0]} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-blue-100" />
              <span className="font-apple text-base">{f.username}</span>
            </div>
          ))}
        </div>
      </Modal>
      <h2 className="text-2xl font-bold mb-4 font-apple">{isOwnProfile ? 'My Blogs' : `${profile.username}'s Blogs`}</h2>
      {loading ? (
        <div className="font-apple">Loading...</div>
      ) : myBlogs.length === 0 ? (
        <div className="text-gray-500 font-apple">No blogs found.</div>
      ) : (
        myBlogs.map(blog => (
          <div key={blog._id} className="glass bg-white/80 p-4 rounded-2xl shadow-glass mb-4 animate-fade-in">
            <h3 className="text-xl font-semibold font-apple">{blog.title}</h3>
            <p className="text-gray-700 mt-2 font-apple" dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 120) + '...' }} />
            <div className="text-sm text-gray-500 mt-2 font-apple">{new Date(blog.createdAt).toLocaleString()}</div>
            {isOwnProfile && <Link to={`/blogs/edit/${blog._id}`} state={{ blog }} className="inline-block mt-2 btn-apple bg-yellow-500 text-white px-3 py-1 rounded-full font-apple hover:bg-yellow-600">Edit</Link>}
          </div>
        ))
      )}
    </div>
  );
} 