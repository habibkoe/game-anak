# Math Feature Implementation Guide

## Overview

The game has been enhanced to support **Math Problems** in addition to word/reading content. Children can now solve math problems by typing their answers instead of using speech recognition.

## Features Added

### 1. **Dual Content Types**
- **Word/Reading**: Original functionality using speech recognition
- **Math Problems**: New functionality with text input for answers

### 2. **Math Operations Supported**
- ➕ Addition (+)
- ➖ Subtraction (-)
- ✖️ Multiplication (×)
- ➗ Division (÷)

### 3. **User Interface**
- **Admin Interface**: Create and manage math problems with operator selection
- **Play Interface**: Kids input their answers via keyboard/touch
- **Visual Feedback**: Different colors for math (purple) vs word (blue) content

## Database Changes

### SQL Migration

Run the `add_math_support.sql` file to update your database:

```sql
-- Add new columns to words table
ALTER TABLE words 
ADD COLUMN content_type TEXT DEFAULT 'word' CHECK (content_type IN ('word', 'math')),
ADD COLUMN math_question TEXT,
ADD COLUMN math_answer TEXT,
ADD COLUMN math_operator TEXT CHECK (math_operator IS NULL OR math_operator IN ('+', '-', '×', '÷'));
```

**Important**: Execute this SQL in your Supabase SQL Editor to enable math support.

## How to Use

### Creating Math Content

1. **Go to Admin Panel** → `/admin/words`

2. **Click "Tambah Kata"** button

3. **Select Content Type**:
   - Choose "🔢 Soal Matematika" radio button

4. **Fill in Math Problem Details**:
   - **Grup**: Select the group (e.g., "Matematika Dasar")
   - **Operator**: Choose +, -, ×, or ÷
   - **Soal Matematika**: Enter the question (e.g., "4 + 5")
   - **Jawaban yang Benar**: Enter the correct answer (e.g., "9")
   - **Upload Gambar** (Optional): Add a reward image shown when correct

5. **Click "Tambah"** to save

### Example Math Problems

#### Easy Addition
```
Operator: +
Question: 2 + 3
Answer: 5
```

#### Subtraction
```
Operator: -
Question: 10 - 4
Answer: 6
```

#### Multiplication
```
Operator: ×
Question: 3 × 4
Answer: 12
```

#### Division
```
Operator: ÷
Question: 8 ÷ 2
Answer: 4
```

### Playing Math Problems

1. **Select a Math Group** from the game selection screen

2. **Read the Problem**: The math question is displayed in large text
   - Example: "4 + 5 = ?"

3. **Type Your Answer**: Enter the answer in the input field

4. **Submit**: Click "Cek Jawaban ✓" or press Enter

5. **Feedback**:
   - ✅ **Correct**: "Benar! Hebat! 🎉" + reward image (if set)
   - ❌ **Wrong**: "Belum tepat, coba lagi 😄"

6. **Auto-Advance**: Automatically moves to next problem after correct answer

## Content Type Comparison

| Feature | Word/Reading | Math Problems |
|---------|-------------|---------------|
| Input Method | 🎤 Speech Recognition | ⌨️ Text Input |
| Validation | Voice matching | Exact answer match |
| Image | Required | Optional (reward only) |
| Use Case | Reading practice | Math practice |
| Color Theme | Blue | Purple |

## Creating a Math Category

For better organization, create a dedicated math category:

1. **Go to** `/admin/categories`
2. **Click** "Tambah Kategori"
3. **Fill in**:
   - Name: "Matematika"
   - Icon: 🔢
   - Description: "Latihan soal matematika"
4. **Create Groups** under this category:
   - "Penjumlahan Mudah" (Easy Addition)
   - "Pengurangan" (Subtraction)
   - "Perkalian" (Multiplication)
   - etc.

## Example Curriculum

### Grade 1 - Easy Math
- **Group**: "Penjumlahan 1-10"
  - 1 + 1 = 2
  - 2 + 3 = 5
  - 4 + 5 = 9
  - 3 + 6 = 9
  - 7 + 2 = 9

- **Group**: "Pengurangan 1-10"
  - 5 - 2 = 3
  - 8 - 4 = 4
  - 10 - 3 = 7
  - 9 - 1 = 8
  - 6 - 6 = 0

### Grade 2 - Medium Math
- **Group**: "Perkalian Dasar"
  - 2 × 2 = 4
  - 3 × 3 = 9
  - 4 × 5 = 20
  - 5 × 6 = 30

- **Group**: "Pembagian Sederhana"
  - 6 ÷ 2 = 3
  - 9 ÷ 3 = 3
  - 12 ÷ 4 = 3
  - 15 ÷ 5 = 3

## Tips for Content Creators

### Best Practices

1. **Progressive Difficulty**:
   - Start with single-digit operations
   - Gradually increase complexity
   - Group similar problems together

2. **Visual Rewards**:
   - Use reward images for motivation
   - Choose fun, colorful images
   - Make rewards exciting for kids

3. **Problem Writing**:
   - Keep questions clear and simple
   - Use proper spacing: "4 + 5" not "4+5"
   - Ensure answers are correct!

4. **Testing**:
   - Test each problem before publishing
   - Verify all answers are accurate
   - Check for typos

### Mixing Content Types

You can mix word and math problems in the same group:
- Problem 1: Word reading
- Problem 2: Math problem
- Problem 3: Word reading
- Problem 4: Math problem

The game automatically detects content type and switches interface accordingly.

## Technical Details

### Type Definitions

```typescript
export type ContentType = 'word' | 'math';

export type GameWord = {
  id: string;
  text: string;
  imageSrc: string;
  groupId: string;
  order: number;
  contentType: ContentType;
  mathQuestion?: string;
  mathAnswer?: string;
  mathOperator?: '+' | '-' | '×' | '÷';
};
```

### Validation Logic

```typescript
// Math answer validation
const userAnswer = mathAnswer.trim();
const correctAnswer = currentWord.mathAnswer?.trim() || '';

if (userAnswer === correctAnswer) {
  // Correct!
} else {
  // Try again
}
```

## Troubleshooting

### Common Issues

**Q: Math problems not showing in admin?**
- Ensure you've run the SQL migration
- Refresh the page after running migration

**Q: Can't see content type selector?**
- Make sure you've updated `src/lib/types/game.ts`
- Check browser console for errors

**Q: Answers not validating?**
- Ensure answer matches exactly (no spaces)
- Check for typos in stored answer
- Answer comparison is case-sensitive

**Q: Existing words disappeared?**
- They're still there! They default to 'word' type
- Use the group filter to find them

## Future Enhancements

Potential improvements:
- Support for decimal answers
- Multiple correct answer formats (e.g., "9" or "nine")
- Timer for speed challenges
- Hints system
- Step-by-step solution explanations
- Math games/mini-games

## Support

If you need help:
- Check the documentation
- Review example problems
- Test in preview mode first
- Verify database migration succeeded

---

**Version**: 1.0  
**Last Updated**: November 30, 2025  
**Feature**: Math Problems Support
