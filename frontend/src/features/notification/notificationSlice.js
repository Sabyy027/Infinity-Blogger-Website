import { createSlice } from '@reduxjs/toolkit';

let nextId = 1;

const notificationSlice = createSlice({
  name: 'notification',
  initialState: [],
  reducers: {
    addNotification: {
      reducer(state, action) {
        state.push(action.payload);
      },
      prepare({ type, message }) {
        return { payload: { id: nextId++, type, message } };
      },
    },
    removeNotification(state, action) {
      return state.filter(n => n.id !== action.payload);
    },
    clearNotifications() {
      return [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer; 