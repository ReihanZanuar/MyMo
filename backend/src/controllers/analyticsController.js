const Transaction = require('../models/Transaction');

exports.getHourlyBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const breakdown = await Transaction.getHourlyBreakdown(req.userId, startDate, endDate);
    res.json({ breakdown });
  } catch (error) {
    console.error('Get hourly breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch hourly breakdown' });
  }
};

exports.getDailyBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const breakdown = await Transaction.getDailyBreakdown(req.userId, startDate, endDate);
    res.json({ breakdown });
  } catch (error) {
    console.error('Get daily breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch daily breakdown' });
  }
};

exports.getWeeklyPattern = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const pattern = await Transaction.getWeeklyPattern(req.userId, startDate, endDate);
    res.json({ pattern });
  } catch (error) {
    console.error('Get weekly pattern error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly pattern' });
  }
};

exports.getCategoryBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const breakdown = await Transaction.getCategoryBreakdown(req.userId, startDate, endDate);
    res.json({ breakdown });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
};

exports.getWalletBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const breakdown = await Transaction.getWalletBreakdown(req.userId, startDate, endDate);
    res.json({ breakdown });
  } catch (error) {
    console.error('Get wallet breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet breakdown' });
  }
};

exports.getPaymentMethodBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const breakdown = await Transaction.getPaymentMethodBreakdown(req.userId, startDate, endDate);
    res.json({ breakdown });
  } catch (error) {
    console.error('Get payment method breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch payment method breakdown' });
  }
};

exports.getSpendingTrend = async (req, res) => {
  try {
    const { days } = req.query;
    const trend = await Transaction.getSpendingTrend(req.userId, days ? parseInt(days) : 30);
    res.json({ trend });
  } catch (error) {
    console.error('Get spending trend error:', error);
    res.status(500).json({ error: 'Failed to fetch spending trend' });
  }
};
