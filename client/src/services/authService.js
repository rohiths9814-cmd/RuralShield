import api from './api';

const authService = {
  async register({ username, email, password }) {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  async login({ email, password }) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
