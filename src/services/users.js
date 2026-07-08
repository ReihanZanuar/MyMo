import api from './api';

export const userService = {
  async getProfile() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  async changePassword(data) {
    const response = await api.put('/users/me/password', data);
    return response.data;
  },

  async updateAvatar(avatarUrl) {
    const response = await api.put('/users/me/avatar', { avatarUrl });
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/users/me');
    return response.data;
  },
};
