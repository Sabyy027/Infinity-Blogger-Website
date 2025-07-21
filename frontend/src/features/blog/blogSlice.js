import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  blogs: [],
  loading: false,
  error: null,
};

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    setBlogs(state, action) {
      state.blogs = action.payload;
      state.error = null;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setBlogs, setError } = blogSlice.actions;
export default blogSlice.reducer;
