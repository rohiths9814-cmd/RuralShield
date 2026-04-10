export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  INBOX: '/inbox',
  SENT: '/sent',
  COMPOSE: '/compose',
  MESSAGE: '/message',
};

export const MESSAGE_STATUS = {
  READ: 'read',
  UNREAD: 'unread',
  STARRED: 'starred',
};
