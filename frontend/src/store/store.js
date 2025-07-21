import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/auth/userSlice';
import blogReducer from '../features/blog/blogSlice';
import notificationReducer from '../features/notification/notificationSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    blogs: blogReducer,
    notification: notificationReducer,
  },
});

export default store; 