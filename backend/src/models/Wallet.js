const pool = require('../config/database');

class Wallet {
  static async create({ userId, type, provider, name, balance, color }) {
    const result = await pool.query(
      `INSERT INTO wallets (user_id, type, provider, name, balance, color)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, type, provider, name, balance || 0, color]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await pool.query(
      'SELECT * FROM wallets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }

  static async update(id, userId, { type, provider, name, balance, color }) {
    const result = await pool.query(
      `UPDATE wallets
       SET type = COALESCE($1, type),
           provider = COALESCE($2, provider),
           name = COALESCE($3, name),
           balance = COALESCE($4, balance),
           color = COALESCE($5, color),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [type, provider, name, balance, color, id, userId]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM wallets WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  }

  static async getBalance(id, userId) {
    const result = await pool.query(
      'SELECT balance FROM wallets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }
}

module.exports = Wallet;
