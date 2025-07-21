import { createSlice } from '@reduxjs/toolkit';

const userFromStorage = sessionStorage.getItem('user');
const initialState = {
  user: (userFromStorage && userFromStorage !== "undefined") ? JSON.parse(userFromStorage) : null,
  token: sessionStorage.getItem('token') || null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      sessionStorage.setItem('user', JSON.stringify(action.payload.user));
      sessionStorage.setItem('token', action.payload.token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setUser, logout, setError } = userSlice.actions;
export default userSlice.reducer;
