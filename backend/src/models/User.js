const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, name, googleId = null }) {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const result = await pool.query(
      `INSERT INTO users (email, password, name, google_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, onboarding_completed, created_at`,
      [email, hashedPassword, name, googleId]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, name, avatar_url, onboarding_completed, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByGoogleId(googleId) {
    const result = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    return result.rows[0];
  }

  static async updateProfile(userId, { name, email }) {
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, email, name, avatar_url, onboarding_completed`,
      [name, email, userId]
    );
    return result.rows[0];
  }

  static async updateAvatar(userId, avatarUrl) {
    const result = await pool.query(
      `UPDATE users
       SET avatar_url = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, name, avatar_url, onboarding_completed`,
      [avatarUrl, userId]
    );
    return result.rows[0];
  }

  static async markOnboardingComplete(userId) {
    const result = await pool.query(
      `UPDATE users
       SET onboarding_completed = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, avatar_url, onboarding_completed`,
      [userId]
    );
    return result.rows[0];
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async changePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      `UPDATE users
       SET password = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id`,
      [hashedPassword, userId]
    );
    return result.rows[0];
  }

  static async deleteAccount(userId) {
    await pool.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM categories WHERE user_id = $1', [userId]);

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = User;
