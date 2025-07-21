import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../features/notification/notificationSlice';

export default function Notification() {
  const notifications = useSelector(state => state.notification);
  const dispatch = useDispatch();

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notifications[0].id));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 items-end">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`glass px-6 py-3 rounded-xl shadow-lg font-apple text-base flex items-center gap-3 animate-fade-in ${n.type === 'success' ? 'bg-green-100 text-green-900' : n.type === 'error' ? 'bg-red-100 text-red-900' : 'bg-white/90 text-gray-900'}`}
          style={{ minWidth: 220 }}
        >
          <span>{n.message}</span>
          <button
            className="ml-2 text-lg text-gray-400 hover:text-gray-700 font-bold"
            onClick={() => dispatch(removeNotification(n.id))}
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
} 