const pool = require('../config/database');

class Category {
  static async create({ userId, name, type, color, icon, emoji, budget, description }) {
    const result = await pool.query(
      `INSERT INTO categories (user_id, name, type, color, icon, emoji, budget, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, name, type, color, icon, emoji, budget, description]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findByUserIdWithCounts(userId) {
    const result = await pool.query(
      `SELECT c.*, COUNT(t.id)::int as transaction_count
       FROM categories c
       LEFT JOIN transactions t ON c.id = t.category_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }

  static async update(id, userId, { name, type, color, icon, emoji, budget, description }) {
    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           color = COALESCE($3, color),
           icon = COALESCE($4, icon),
           emoji = COALESCE($5, emoji),
           budget = COALESCE($6, budget),
           description = COALESCE($7, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [name, type, color, icon, emoji, budget, description, id, userId]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  }
}

module.exports = Category;
