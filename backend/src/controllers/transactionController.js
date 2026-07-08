const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
  try {
    const { limit, offset, type, startDate, endDate } = req.query;

    const transactions = await Transaction.findByUserId(req.userId, {
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      type,
      startDate,
      endDate
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { walletId, toWalletId, categoryId, amount, type, description, paymentMethod, date } = req.body;

    const transaction = await Transaction.create({
      userId: req.userId,
      walletId,
      toWalletId,
      categoryId,
      amount,
      type,
      description,
      paymentMethod,
      date
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { walletId, toWalletId, categoryId, amount, type, description, paymentMethod, date } = req.body;

    const transaction = await Transaction.update(id, req.userId, {
      walletId,
      toWalletId,
      categoryId,
      amount,
      type,
      description,
      paymentMethod,
      date
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.delete(id, req.userId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      message: 'Transaction deleted successfully',
      transaction
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const summary = await Transaction.getSummary(req.userId, startDate, endDate);

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};
