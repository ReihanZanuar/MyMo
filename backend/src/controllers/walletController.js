const Wallet = require('../models/Wallet');

exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.findByUserId(req.userId);
    res.json({ wallets });
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};

exports.createWallet = async (req, res) => {
  try {
    const { type, provider, name, balance, color } = req.body;

    const wallet = await Wallet.create({
      userId: req.userId,
      type,
      provider,
      name,
      balance,
      color
    });

    res.status(201).json({
      message: 'Wallet created successfully',
      wallet
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
};

exports.updateWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, provider, name, balance, color } = req.body;

    const wallet = await Wallet.update(id, req.userId, {
      type,
      provider,
      name,
      balance,
      color
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      message: 'Wallet updated successfully',
      wallet
    });
  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
};

exports.deleteWallet = async (req, res) => {
  try {
    const { id } = req.params;

    const wallet = await Wallet.delete(id, req.userId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      message: 'Wallet deleted successfully',
      wallet
    });
  } catch (error) {
    console.error('Delete wallet error:', error);
    res.status(500).json({ error: 'Failed to delete wallet' });
  }
};

exports.getWalletBalance = async (req, res) => {
  try {
    const { id } = req.params;

    const wallet = await Wallet.getBalance(id, req.userId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({ balance: wallet.balance });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
};
