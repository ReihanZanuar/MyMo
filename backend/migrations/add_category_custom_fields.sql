-- Migration: Add emoji, budget, and description fields to categories table
-- Date: 2026-07-02

-- Add emoji column (nullable, for emoji as alternative to icon)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS emoji VARCHAR(10);

-- Add budget column (nullable, for monthly budget limit)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS budget DECIMAL(15, 2);

-- Add description column (nullable, for category notes/description)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_categories_emoji ON categories(emoji) WHERE emoji IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_budget ON categories(budget) WHERE budget IS NOT NULL;
