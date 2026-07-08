import api from './api'

export const analyticsService = {
  async getHourlyBreakdown(startDate, endDate) {
    const response = await api.get('/analytics/hourly', {
      params: { startDate, endDate }
    })
    return response.data.breakdown
  },

  async getDailyBreakdown(startDate, endDate) {
    const response = await api.get('/analytics/daily', {
      params: { startDate, endDate }
    })
    return response.data.breakdown
  },

  async getWeeklyPattern(startDate, endDate) {
    const response = await api.get('/analytics/weekly', {
      params: { startDate, endDate }
    })
    return response.data.pattern
  },

  async getCategoryBreakdown(startDate, endDate) {
    const response = await api.get('/analytics/category', {
      params: { startDate, endDate }
    })
    return response.data.breakdown
  },

  async getWalletBreakdown(startDate, endDate) {
    const response = await api.get('/analytics/wallet', {
      params: { startDate, endDate }
    })
    return response.data.breakdown
  },

  async getPaymentMethodBreakdown(startDate, endDate) {
    const response = await api.get('/analytics/payment-method', {
      params: { startDate, endDate }
    })
    return response.data.breakdown
  },

  async getSpendingTrend(days = 30) {
    const response = await api.get('/analytics/trend', {
      params: { days }
    })
    return response.data.trend
  }
}
