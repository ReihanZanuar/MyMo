# MyMo - Database Schema Documentation

## Database Overview

**Database Type:** PostgreSQL 15
**Connection Pool:** pg (node-postgres) dengan max 20 connections
**Schema Management:** SQL migrations dalam `backend/src/config/initDb.js`

---

## Tables

### 1. users

Menyimpan data user accounts.

**Table Definition:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment user ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password | VARCHAR(255) | NULL | Bcrypt hashed password (NULL for Google OAuth users) |
| name | VARCHAR(255) | NOT NULL | User display name |
| google_id | VARCHAR(255) | UNIQUE | Google OAuth ID (NULL for email/password users) |
| avatar_url | TEXT | NULL | URL to user avatar image |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last profile update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE index on `email`
- UNIQUE index on `google_id`

**Relationships:**
- One-to-many with `categories` (user has many categories)
- One-to-many with `transactions` (user has many transactions)

**Business Rules:**
- Email must be unique across all users
- Password can be NULL for Google OAuth users
- Google ID can be NULL for email/password users
- At least one of (password, google_id) must be non-NULL

---

### 2. categories

Menyimpan kategori transaksi per user.

**Table Definition:**
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  color VARCHAR(50),
  icon VARCHAR(100),
  emoji VARCHAR(10),
  budget DECIMAL(15, 2),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment category ID |
| user_id | INTEGER | FK to users, NOT NULL, ON DELETE CASCADE | Owner user ID |
| name | VARCHAR(255) | NOT NULL | Category name (e.g., "Makanan & Minuman") |
| type | VARCHAR(50) | NOT NULL, CHECK constraint | Type: "income", "expense", or "transfer" |
| color | VARCHAR(50) | NULL | Hex color code (e.g., "#FF6B6B") |
| icon | VARCHAR(100) | NULL | Icon name or SVG identifier |
| emoji | VARCHAR(10) | NULL | Emoji character (e.g., "🍔") |
| budget | DECIMAL(15,2) | NULL | Monthly budget limit for this category |
| description | TEXT | NULL | Additional notes about category |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Category creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id` (for efficient user-scoped queries)

**Relationships:**
- Many-to-one with `users` (category belongs to one user)
- One-to-many with `transactions` (category has many transactions)

**Business Rules:**
- Type must be one of: "income", "expense", "transfer"
- Budget must be non-negative if specified
- User can have multiple categories with same name but different types
- Cascade delete when user is deleted

**Default Categories:**
Created automatically on user registration (15 categories total).

---

### 3. transactions

Menyimpan transaksi keuangan per user.

**Table Definition:**
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  payment_method VARCHAR(100),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment transaction ID |
| user_id | INTEGER | FK to users, NOT NULL, ON DELETE CASCADE | Owner user ID |
| category_id | INTEGER | FK to categories, NULL, ON DELETE SET NULL | Associated category (optional) |
| amount | DECIMAL(15,2) | NOT NULL, CHECK >= 0 | Transaction amount (non-negative) |
| type | VARCHAR(50) | NOT NULL, CHECK constraint | Type: "income" or "expense" |
| description | TEXT | NULL | Transaction description/notes |
| payment_method | VARCHAR(100) | NULL | Payment method (cash, card, transfer, etc.) |
| date | DATE | NOT NULL | Transaction date (when it occurred) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id` (for user-scoped queries)
- INDEX on `date` (for date range queries)
- COMPOSITE INDEX on `(user_id, date)` (for optimized user+date queries)

**Relationships:**
- Many-to-one with `users` (transaction belongs to one user)
- Many-to-one with `categories` (transaction may belong to one category)

**Business Rules:**
- Amount must be non-negative (>= 0)
- Type must be "income" or "expense"
- category_id is optional (can be NULL)
- When category is deleted, category_id is set to NULL (not cascade delete)
- Cascade delete when user is deleted
- Date is required (cannot be NULL)

---

## Entity Relationship Diagram

```
users (1) ────< (many) categories
  │
  │
  └─────< (many) transactions >──── (optional) categories
```

**Relationships:**
1. **users → categories**: One-to-many (one user has many categories)
2. **users → transactions**: One-to-many (one user has many transactions)
3. **categories → transactions**: One-to-many optional (category can have many transactions, but transaction can exist without category)

---

## Common Queries

### Get User with Profile
```sql
SELECT id, email, name, avatar_url, created_at
FROM users
WHERE id = $1;
```

### Get Categories with Transaction Count
```sql
SELECT c.*, COUNT(t.id)::int as transaction_count
FROM categories c
LEFT JOIN transactions t ON c.id = t.category_id
WHERE c.user_id = $1
GROUP BY c.id
ORDER BY c.created_at DESC;
```

### Get Transactions with Category Info
```sql
SELECT 
  t.*,
  c.name as category_name,
  c.color as category_color
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = $1
ORDER BY t.date DESC, t.created_at DESC
LIMIT $2 OFFSET $3;
```

### Get Transaction Summary for Period
```sql
SELECT
  type,
  COALESCE(SUM(amount), 0) as total
FROM transactions
WHERE user_id = $1
  AND date >= $2
  AND date <= $3
GROUP BY type;
```

### Create Transaction
```sql
INSERT INTO transactions (
  user_id, category_id, amount, type, 
  description, payment_method, date
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
```

---

## Data Types & Constraints

### DECIMAL(15, 2)
- Used for: `amount`, `budget`
- Precision: 15 digits total, 2 after decimal point
- Range: -9,999,999,999,999.99 to 9,999,999,999,999.99
- Why: Prevents floating-point precision errors in financial calculations

### VARCHAR vs TEXT
- VARCHAR(n): Fixed maximum length, faster for small strings
- TEXT: Unlimited length, used for descriptions
- VARCHAR used for: email, name, type, icon, emoji, payment_method
- TEXT used for: description, avatar_url

### TIMESTAMP vs DATE
- TIMESTAMP: Full date and time (created_at, updated_at)
- DATE: Date only without time (transaction date)
- Why: Transaction date is user-facing and doesn't need time precision

### SERIAL
- Auto-incrementing integer primary key
- Equivalent to: `INTEGER NOT NULL DEFAULT nextval('sequence')`
- Automatically creates sequence for each SERIAL column

---

## Cascade Behaviors

### ON DELETE CASCADE
Applied to: `categories.user_id`, `transactions.user_id`

When user is deleted:
1. All their categories are deleted
2. All their transactions are deleted
3. Order: transactions → categories → user

### ON DELETE SET NULL
Applied to: `transactions.category_id`

When category is deleted:
1. Transactions with that category_id are NOT deleted
2. Their category_id is set to NULL
3. Historical transactions remain intact

---

## Indexes Strategy

### Primary Keys (Automatic)
- users.id
- categories.id
- transactions.id

### Foreign Keys
- categories.user_id
- transactions.user_id
- transactions.category_id

### Query Optimization
- transactions.date (for date range queries)
- Composite (user_id, date) for common filtered queries

### Unique Constraints
- users.email (prevent duplicate accounts)
- users.google_id (prevent duplicate OAuth accounts)

---

## Database Initialization

File: `backend/src/config/initDb.js`

```javascript
const pool = require('./database');

async function initDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        google_id VARCHAR(255) UNIQUE,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
        color VARCHAR(50),
        icon VARCHAR(100),
        emoji VARCHAR(10),
        budget DECIMAL(15, 2),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
        description TEXT,
        payment_method VARCHAR(100),
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = initDatabase;
```

---

## Migration Strategy

### Current Approach
- `IF NOT EXISTS` checks in initDb.js
- Run on application startup
- No versioned migrations yet

### Future Migration System
For production, consider:
- Versioned migration files (e.g., node-pg-migrate, Knex.js)
- Up/down migration support
- Migration history table
- Rollback capability
- CI/CD integration

---

## Backup & Recovery

### Backup Strategy (Production)
```bash
# Full database backup
pg_dump -h localhost -U postgres -d mymo_db > backup.sql

# Backup with compression
pg_dump -h localhost -U postgres -d mymo_db | gzip > backup.sql.gz

# Schema-only backup
pg_dump -h localhost -U postgres -d mymo_db --schema-only > schema.sql
```

### Restore
```bash
# Restore from backup
psql -h localhost -U postgres -d mymo_db < backup.sql

# Restore from compressed backup
gunzip -c backup.sql.gz | psql -h localhost -U postgres -d mymo_db
```

### Docker Volume Backup
```bash
# Backup PostgreSQL Docker volume
docker run --rm -v mymo_pgdata:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/pgdata-backup.tar.gz /data
```

---

## Performance Considerations

### Connection Pooling
```javascript
const pool = new Pool({
  max: 20,                    // Maximum 20 connections
  idleTimeoutMillis: 30000,   // Close idle after 30s
  connectionTimeoutMillis: 2000  // Error after 2s
});
```

### Query Performance
- Use parameterized queries (prevents SQL injection + prepared statements)
- Limit result sets with LIMIT/OFFSET
- Index on frequently queried columns
- Use LEFT JOIN for optional relationships

### Monitoring Queries
```sql
-- Find slow queries
SELECT query, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Security Best Practices

### Implemented
- Parameterized queries (SQL injection prevention)
- User-scoped queries (WHERE user_id = $userId)
- Password hashing (bcryptjs, never store plaintext)
- Cascade delete (data cleanup)

### Recommended for Production
- SSL/TLS for database connections
- Separate database users for application vs admin
- Read-only replicas for reporting queries
- Regular security audits
- Encrypted backups
- Row-level security policies (RLS) for additional layer

---

## Data Retention

### Current Policy
- Data retained indefinitely
- User controls deletion via account deletion
- Cascade delete ensures complete removal

### Future Considerations
- GDPR compliance (right to be forgotten)
- Data export functionality
- Soft delete option
- Archival strategy for old data
- Audit logs for compliance
