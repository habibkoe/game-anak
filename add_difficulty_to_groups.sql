-- Migration: Add difficulty level to groups table
-- Date: 2025-11-28

-- Add difficulty column to groups table
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'medium' 
CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_groups_difficulty ON groups(difficulty);

-- Update existing groups to have medium difficulty if NULL
UPDATE groups 
SET difficulty = 'medium' 
WHERE difficulty IS NULL;

-- Add comment to column
COMMENT ON COLUMN groups.difficulty IS 'Difficulty level: easy, medium, or hard';
