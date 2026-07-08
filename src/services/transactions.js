import api from './api';

export const transactionService = {
  async getTransactions(filters = {}) {
    const params = new URLSearchParams();

    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  async getSummary(startDate, endDate) {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await api.get(`/transactions/summary?${params.toString()}`);
    return response.data;
  },

  async createTransaction(data) {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async updateTransaction(id, data) {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};
