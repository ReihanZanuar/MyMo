const pool = require('../config/database');

class Transaction {
  static async create({ userId, walletId, toWalletId, categoryId, amount, type, description, paymentMethod, date }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert transaction
      const result = await client.query(
        `INSERT INTO transactions (user_id, wallet_id, to_wallet_id, category_id, amount, type, description, payment_method, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [userId, walletId, toWalletId, categoryId, amount, type, description, paymentMethod, date]
      );

      // Update wallet balances
      if (type === 'income') {
        await client.query(
          'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
          [amount, walletId]
        );
      } else if (type === 'expense') {
        await client.query(
          'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
          [amount, walletId]
        );
      } else if (type === 'transfer') {
        await client.query(
          'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
          [amount, walletId]
        );
        await client.query(
          'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
          [amount, toWalletId]
        );
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByUserId(userId, { limit = 50, offset = 0, type = null, startDate = null, endDate = null } = {}) {
    let query = `
      SELECT t.*,
             c.name as category_name, c.color as category_color,
             w.name as wallet_name, w.color as wallet_color,
             tw.name as to_wallet_name, tw.color as to_wallet_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN wallets w ON t.wallet_id = w.id
      LEFT JOIN wallets tw ON t.to_wallet_id = tw.id
      WHERE t.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (type) {
      query += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND t.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND t.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY t.date DESC, t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }

  static async update(id, userId, { walletId, toWalletId, categoryId, amount, type, description, paymentMethod, date }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get old transaction data
      const oldResult = await client.query(
        'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (!oldResult.rows[0]) {
        await client.query('ROLLBACK');
        return null;
      }

      const oldTxn = oldResult.rows[0];

      // Reverse old wallet balance changes
      if (oldTxn.type === 'income') {
        await client.query(
          'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
          [oldTxn.amount, oldTxn.wallet_id]
        );
      } else if (oldTxn.type === 'expense') {
        await client.query(
          'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
          [oldTxn.amount, oldTxn.wallet_id]
        );
      } else if (oldTxn.type === 'transfer') {
        await client.query(
          'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
          [oldTxn.amount, oldTxn.wallet_id]
        );
        await client.query(
          'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
          [oldTxn.amount, oldTxn.to_wallet_id]
        );
      }

      // Update transaction
      const result = await client.query(
        `UPDATE transactions
         SET wallet_id = COALESCE($1, wallet_id),
             to_wallet_id = COALESCE($2, to_wallet_id),
             category_id = COALESCE($3, category_id),
             amount = COALESCE($4, amount),
             type = COALESCE($5, type),
             description = COALESCE($6, description),
             payment_method = COALESCE($7, payment_method),
             date = COALESCE($8, date),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9 AND user_id = $10
         RETURNING *`,
        [walletId, toWalletId, categoryId, amount, type, description, paymentMethod, date, id, userId]
      );

      const newTxn = result.rows[0];

      // Apply new wallet balance changes
      if (newTxn.type === 'income') {
        await client.query(
          'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
          [newTxn.amount, newTxn.wallet_id]
        );
      } else if (newTxn.type === 'expense') {
        await client.query(
          'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
          [newTxn.amount, newTxn.wallet_id]
        );
      } else if (newTxn.type === 'transfer') {
        await client.query(
          'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
          [newTxn.amount, newTxn.wallet_id]
        );
        await client.query(
          'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
          [newTxn.amount, newTxn.to_wallet_id]
        );
      }

      await client.query('COMMIT');
      return newTxn;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id, userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get transaction data before deleting
      const result = await client.query(
        'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (!result.rows[0]) {
        await client.query('ROLLBACK');
        return null;
      }

      const txn = result.rows[0];

      // Reverse wallet balance changes
      if (txn.type === 'income') {
        await client.query(
          'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
          [txn.amount, txn.wallet_id]
        );
      } else if (txn.type === 'expense') {
        await client.query(
          'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
          [txn.amount, txn.wallet_id]
        );
      } else if (txn.type === 'transfer') {
        await client.query(
          'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
          [txn.amount, txn.wallet_id]
        );
        await client.query(
          'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
          [txn.amount, txn.to_wallet_id]
        );
      }

      // Delete transaction
      await client.query(
        'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      await client.query('COMMIT');
      return txn;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getSummary(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT
         type,
         COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = $1
         AND date >= $2
         AND date <= $3
       GROUP BY type`,
      [userId, startDate, endDate]
    );

    const summary = {
      income: 0,
      expense: 0,
      balance: 0
    };

    result.rows.forEach(row => {
      summary[row.type] = parseFloat(row.total);
    });

    summary.balance = summary.income - summary.expense;
    return summary;
  }

  static async getHourlyBreakdown(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT
         EXTRACT(HOUR FROM created_at) as hour,
         COALESCE(SUM(amount), 0) as total_amount,
         COUNT(*) as count
       FROM transactions
       WHERE user_id = $1
         AND date >= $2
         AND date <= $3
       GROUP BY EXTRACT(HOUR FROM created_at)
       ORDER BY hour`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  static async getDailyBreakdown(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT
         DATE(date) as date,
         COALESCE(SUM(amount), 0) as total_amount,
         COUNT(*) as count
       FROM transactions
       WHERE user_id = $1
         AND date >= $2
         AND date <= $3
       GROUP BY DATE(date)
       ORDER BY date`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  static async getWeeklyPattern(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT
         EXTRACT(DOW FROM date) as day_of_week,
         COALESCE(SUM(amount), 0) as total_amount,
         COUNT(*) as count
       FROM transactions
       WHERE user_id = $1
         AND date >= $2
         AND date <= $3
       GROUP BY EXTRACT(DOW FROM date)
       ORDER BY day_of_week`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  static async getCategoryBreakdown(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT
         c.id,
         c.name,
         c.color,
         t.type,
         COALESCE(SUM(t.amount), 0) as total,
         COUNT(*) as count
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
         AND t.date >= $2
         AND t.date <= $3
       GROUP BY c.id, c.name, c.color, t.type
       ORDER BY total DESC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  static async getWalletBreakdown(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT
         w.id,
         w.name as wallet_name,
         w.color,
         COALESCE(SUM(t.amount), 0) as total_amount,
         COUNT(*) as count
       FROM transactions t
       LEFT JOIN wallets w ON t.wallet_id = w.id
       WHERE t.user_id = $1
         AND t.date >= $2
         AND t.date <= $3
       GROUP BY w.id, w.name, w.color
       ORDER BY total_amount DESC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  static async getPaymentMethodBreakdown(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT
         payment_method,
         COALESCE(SUM(amount), 0) as total_amount,
         COUNT(*) as count
       FROM transactions
       WHERE user_id = $1
         AND date >= $2
         AND date <= $3
         AND payment_method IS NOT NULL
       GROUP BY payment_method
       ORDER BY total_amount DESC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  static async getSpendingTrend(userId, days = 30) {
    const result = await pool.query(
      `SELECT
         DATE(date) as day,
         type,
         COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = $1
         AND date >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(date), type
       ORDER BY day DESC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = Transaction;
