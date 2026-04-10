import api from './api';

const messageService = {
  async sendMessage({ recipientEmail, subject, body }) {
    const response = await api.post('/messages', { recipientEmail, subject, body });
    return response.data;
  },

  async getInbox(page = 1, limit = 20) {
    const response = await api.get(`/messages/inbox?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getSent(page = 1, limit = 20) {
    const response = await api.get(`/messages/sent?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getMessage(id) {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.patch(`/messages/${id}/read`);
    return response.data;
  },

  async toggleStar(id) {
    const response = await api.patch(`/messages/${id}/star`);
    return response.data;
  },

  async deleteMessage(id) {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/messages/unread-count');
    return response.data;
  },

  async analyzeMessage(id) {
    const response = await api.post(`/messages/${id}/analyze`);
    return response.data;
  },

  async searchUsers(query) {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async getPublicKey(userId) {
    const response = await api.get(`/users/${userId}/public-key`);
    return response.data;
  },
};

export default messageService;
