# Multi-User Authentication & Content Management Implementation Plan

## Overview
Transform the game into a multi-user system with:
- Supabase authentication (email/password)
- User-specific content management
- Public preview mode (1 group with 5-6 samples)
- Admin panel protected by auth

## Database Schema Design

### Users Table (Supabase Auth built-in)
- id (uuid)
- email
- created_at

### Categories Table
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- name (text)
- description (text, nullable)
- icon (text, nullable)
- created_at (timestamp)

### Groups Table
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- category_id (uuid, foreign key to categories)
- name (text)
- description (text, nullable)
- final_reward_text (text)
- final_reward_image (text, nullable)
- created_at (timestamp)

### Words Table
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- group_id (uuid, foreign key to groups)
- text (text)
- image_src (text)
- order_position (integer)
- created_at (timestamp)

### Public Content Table
- id (uuid, primary key)
- category_name (text)
- group_name (text)
- group_description (text)
- final_reward_text (text)
- final_reward_image (text)
- words (jsonb) - array of word objects
- is_active (boolean)
- created_at (timestamp)

## Implementation Steps

### Phase 1: Setup & Configuration
1. ✅ Analyze current codebase
2. Install @supabase/supabase-js
3. Create Supabase client configuration
4. Setup environment variables

### Phase 2: Database Setup
5. Create SQL migration for tables
6. Setup Row Level Security (RLS) policies
7. Create sample public content

### Phase 3: Authentication Layer
8. Create auth service
9. Create auth store (Svelte store)
10. Build Login component
11. Build Register component
12. Build auth layout wrapper

### Phase 4: Backend Services
13. Update storage service to use Supabase
14. Create user-specific CRUD operations
15. Implement public content fetching
16. Add auth guards/middleware

### Phase 5: UI Updates
17. Add login/register pages
18. Update admin panel with auth protection
19. Add user profile/logout
20. Update home page with preview mode
21. Show upgrade message for unregistered users

### Phase 6: Testing & Refinement
22. Test authentication flow
23. Test user-specific content isolation
24. Test public preview access
25. Handle edge cases

## Security Considerations
- Row Level Security (RLS) enabled on all tables
- Users can only read/write their own content
- Public content table readable by everyone
- Admin panel accessible only to authenticated users
