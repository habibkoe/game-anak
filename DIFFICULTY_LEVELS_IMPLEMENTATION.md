# Difficulty Levels Implementation

## Overview
Added a difficulty level system to groups allowing content creators to categorize their groups as Easy, Medium, or Hard. This helps users choose appropriate difficulty levels for different learning stages.

## Changes Made

### 1. Type System Updates
**File: `src/lib/types/game.ts`**
- Added `DifficultyLevel` type with three options: `'easy' | 'medium' | 'hard'`
- Added `difficulty` field to `Group` type (required field)

### 2. Storage Service Updates
**File: `src/lib/services/storage.ts`**
- Updated default group to include `difficulty: 'medium'`
- All localStorage operations now support the difficulty field

### 3. Supabase Service Updates
**File: `src/lib/services/supabaseGame.ts`**
- Updated `SupabaseGroup` interface to include `difficulty` field
- Modified `toGroup()` converter to handle difficulty with fallback to 'medium'
- Updated `addGroup()` to save difficulty to database
- Updated `updateGroup()` to support difficulty updates

### 4. Admin Groups Page
**File: `src/routes/admin/groups/+page.svelte`**
- Added difficulty selector with three visual buttons (⭐ Mudah, ⭐⭐ Sedang, ⭐⭐⭐ Sulit)
- Added difficulty badges to group cards
- Updated form data to include difficulty field
- Added `getDifficultyBadge()` helper function for consistent styling

**Visual Elements:**
- Easy: Green badge with 1 star (⭐)
- Medium: Yellow badge with 2 stars (⭐⭐)
- Hard: Red badge with 3 stars (⭐⭐⭐)

### 5. Select Page
**File: `src/routes/select/+page.svelte`**
- Added difficulty badges to group cards
- Added `getDifficultyBadge()` helper function
- Shows difficulty level prominently on each group card

### 6. Play Page
**File: `src/routes/play/+page.svelte`**
- Updated to handle difficulty field in preview mode (defaults to 'medium')
- Future enhancement: Can be used to adjust gameplay based on difficulty

### 7. Database Migration
**File: `add_difficulty_to_groups.sql`**
- Adds `difficulty` column to `groups` table
- Sets default value to 'medium'
- Adds CHECK constraint to ensure only valid values
- Creates index for better query performance
- Updates existing records to have 'medium' difficulty

## How to Apply the Migration

### Using Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of `add_difficulty_to_groups.sql`
5. Run the query
6. Verify the migration by checking the `groups` table structure

### Using Supabase CLI:
```bash
supabase db push
```

## Usage Guide

### For Content Creators (Admin Panel):
1. Go to Admin Panel → Kelola Grup
2. When creating or editing a group, you'll see three difficulty buttons:
   - ⭐ Mudah (Easy)
   - ⭐⭐ Sedang (Medium)
   - ⭐⭐⭐ Sulit (Hard)
3. Select the appropriate difficulty level for your group
4. The difficulty badge will be displayed on the group card

### For Players (Select Page):
1. Groups now display difficulty badges
2. Players can choose groups based on their skill level
3. Easy groups are marked with a green badge (⭐)
4. Medium groups have a yellow badge (⭐⭐)
5. Hard groups show a red badge (⭐⭐⭐)

## Future Enhancements

### Gameplay Adjustments Based on Difficulty:
The difficulty level can be used to adjust gameplay mechanics:

**Easy Mode:**
- More time for recognition
- More lenient matching (higher tolerance for pronunciation errors)
- Shorter words/sentences
- More visual hints

**Medium Mode:**
- Standard time and matching
- Default behavior (current implementation)

**Hard Mode:**
- Stricter pronunciation matching
- Longer, more complex sentences
- Less visual feedback
- Faster pace

### Example Implementation for Play Page:
```javascript
// In checkAnswer function
function checkAnswer(spoken: string) {
  const currentWord = getCurrentWord();
  if (!currentWord) return;

  const targetNorm = normalize(currentWord.text);
  const spokenNorm = normalize(spoken);
  
  // Adjust tolerance based on difficulty
  let matchThreshold = 0.8; // default
  if (group?.difficulty === 'easy') {
    matchThreshold = 0.6; // more lenient
  } else if (group?.difficulty === 'hard') {
    matchThreshold = 0.95; // stricter
  }
  
  const similarity = calculateSimilarity(spokenNorm, targetNorm);
  const fullyCorrect = similarity >= matchThreshold;
  
  // ... rest of the logic
}
```

## Testing Checklist

- [x] Create new group with Easy difficulty
- [x] Create new group with Medium difficulty
- [x] Create new group with Hard difficulty
- [x] Edit existing group to change difficulty
- [x] Verify difficulty badges appear on admin groups page
- [x] Verify difficulty badges appear on select page
- [x] Verify database stores difficulty correctly
- [x] Verify existing groups default to 'medium'

## Notes

- All existing groups will automatically be set to 'medium' difficulty after migration
- The difficulty field is required when creating new groups
- Default difficulty is 'medium' if not specified
- The system is extensible for future gameplay adjustments based on difficulty

## Related Files
- `src/lib/types/game.ts` - Type definitions
- `src/lib/services/storage.ts` - Local storage service
- `src/lib/services/supabaseGame.ts` - Supabase service
- `src/routes/admin/groups/+page.svelte` - Admin interface
- `src/routes/select/+page.svelte` - Group selection interface
- `src/routes/play/+page.svelte` - Gameplay interface
- `add_difficulty_to_groups.sql` - Database migration
