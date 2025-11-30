-- =============================================
-- Add Math Support to Game-Anak
-- =============================================

-- Add new columns to words table for math support
ALTER TABLE words 
ADD COLUMN content_type TEXT DEFAULT 'word' CHECK (content_type IN ('word', 'math')),
ADD COLUMN math_question TEXT,
ADD COLUMN math_answer TEXT,
ADD COLUMN math_operator TEXT CHECK (math_operator IS NULL OR math_operator IN ('+', '-', '×', '÷'));

-- Add index for content type filtering
CREATE INDEX idx_words_content_type ON words(content_type);

-- Update existing words to have 'word' content type
UPDATE words SET content_type = 'word' WHERE content_type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN words.content_type IS 'Type of content: word (for reading) or math (for math problems)';
COMMENT ON COLUMN words.math_question IS 'Math question display text (e.g., "4 + 5")';
COMMENT ON COLUMN words.math_answer IS 'Correct answer for math problems (e.g., "9")';
COMMENT ON COLUMN words.math_operator IS 'Math operator: +, -, ×, or ÷';
