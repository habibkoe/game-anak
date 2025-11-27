# Authentication & Multi-User Setup Guide

## Overview

This guide explains how to set up authentication and multi-user content management for the Game-Anak application using Supabase.

## Features Implemented

✅ **User Authentication**
- Email/password registration and login
- Secure session management
- Protected admin panel

✅ **User-Specific Content**
- Each user can create and manage their own categories, groups, and words
- Complete isolation between users' content
- Row Level Security (RLS) enforced at database level

✅ **Public Preview Mode**
- Unregistered users can try 1 sample group with 5-6 words
- Encourages registration for full access
- Public content managed separately

✅ **Admin Panel Protection**
- Only authenticated users can access `/admin` routes
- Automatic redirect to login if not authenticated
- User info display with logout functionality

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be set up (takes ~2 minutes)

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (a long string starting with `eyJ...`)

### 3. Configure Environment Variables

1. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase_migration.sql`
4. Paste into the SQL editor
5. Click **Run** to execute the migration

This will create:
- Tables: `categories`, `groups`, `words`, `public_content`
- Row Level Security (RLS) policies
- Indexes for performance
- Sample public preview content
- Auto-triggers for user_id management

### 5. Verify Database Setup

1. Go to **Table Editor** in Supabase
2. You should see 4 new tables:
   - `categories`
   - `groups`
   - `words`
   - `public_content`
3. Check `public_content` - it should have 1 sample row

### 6. Configure Vercel (if deploying)

If you're deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the two environment variables:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy your application

## How It Works

### Authentication Flow

1. **New Users**
   - Visit `/register`
   - Enter email and password
   - Receive verification email (check Supabase Auth settings)
   - Login at `/login`

2. **Existing Users**
   - Visit `/login`
   - Enter credentials
   - Redirected to `/admin` panel

3. **Guest Users**
   - Can access home page and view preview content
   - Limited to 1 sample group
   - Prompted to register for full access

### Content Management

**For Authenticated Users:**
- Full access to admin panel at `/admin`
- Can create unlimited categories, groups, and words
- Content is automatically associated with their user ID
- Can only see and manage their own content

**For Guest Users:**
- Can only access public preview content
- See sample group on select page
- Can play preview games
- Cannot access admin panel

### Security

**Row Level Security (RLS)**
- Enabled on all tables
- Users can only read/write their own data
- Public content is readable by everyone
- Enforced at database level (not bypassable from frontend)

**Protected Routes**
- `/admin` routes automatically redirect to `/login` if not authenticated
- Auth state managed globally via Svelte stores
- Session persisted in browser

## User Guide

### For End Users

1. **First Time Setup**
   - Register an account at `/register`
   - Verify email if required
   - Login at `/login`

2. **Creating Content**
   - Go to Admin Panel → Categories
   - Create a category (e.g., "Aktivitas Harian")
   - Go to Admin Panel → Groups
   - Create a group within your category
   - Go to Admin Panel → Words
   - Add words to your group

3. **Playing**
   - Return to home page
   - Click "Mulai Bermain"
   - Select your category/group
   - Start playing!

### For Developers

**Key Files:**
- `src/lib/supabaseClient.ts` - Supabase client initialization
- `src/lib/stores/auth.ts` - Authentication state management
- `src/lib/services/auth.ts` - Authentication operations
- `src/lib/services/supabaseStorage.ts` - Database operations
- `src/routes/admin/+layout.svelte` - Admin auth guard
- `supabase_migration.sql` - Database schema

**Adding New Features:**
1. Update types in `src/lib/types/game.ts`
2. Add database operations in `src/lib/services/supabaseStorage.ts`
3. Update UI components as needed
4. Add RLS policies if needed

## Troubleshooting

### "Failed to load data" Error
- Check your `.env` file has correct Supabase credentials
- Verify migration was run successfully in Supabase
- Check browser console for detailed errors

### Users Can't Login
- Check Supabase Auth settings
- Verify email confirmation is disabled (or email templates configured)
- Check that users table was created

### Can't See Content
- Verify RLS policies are set up correctly
- Check that user is authenticated
- Look for errors in browser console

### Admin Panel Not Accessible
- Ensure user is logged in
- Check `authStore` is initialized in root layout
- Verify `/admin/+layout.svelte` auth guard is working

## Testing

### Test Authentication
```bash
# Run development server
npm run dev

# Visit these pages
1. http://localhost:5173/register - Register new user
2. http://localhost:5173/login - Login
3. http://localhost:5173/admin - Access admin (should redirect if not logged in)
4. http://localhost:5173/ - Try preview mode (when logged out)
```

### Test Multi-User Isolation
1. Register User A, create some content
2. Logout, register User B, create different content
3. Verify User A cannot see User B's content
4. Verify User B cannot see User A's content

## Next Steps

- [ ] Configure email templates in Supabase (for password reset, etc.)
- [ ] Add profile management page
- [ ] Implement password reset functionality
- [ ] Add content sharing features (if needed)
- [ ] Set up monitoring and analytics
- [ ] Configure production environment variables

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Review browser console for errors
3. Verify environment variables are set correctly
4. Ensure database migration completed successfully

## Security Checklist

✅ Row Level Security enabled on all tables
✅ User data isolated by user_id
✅ Admin routes protected with auth guards
✅ Passwords hashed by Supabase Auth
✅ HTTPS enforced (via Vercel/Supabase)
✅ Environment variables for sensitive data
✅ Public content separated from user content

---

**Implementation Complete! 🎉**

Your application now supports:
- Multi-user authentication
- User-specific content management
- Public preview for unregistered users
- Secure, isolated data access
