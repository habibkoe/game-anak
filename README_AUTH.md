# 🎮 Game Anak - Multi-User Authentication System

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Vercel account (for deployment)

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Supabase**
   - Create project at [supabase.com](https://supabase.com)
   - Get your credentials from Settings → API
   - Run the migration from `supabase_migration.sql`

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Supabase credentials.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Test the Application**
   - Visit `http://localhost:5173`
   - Try preview mode (guest user)
   - Register a new account
   - Login and create content
   - Test admin panel

## 📚 Documentation

- **[AUTH_SETUP_GUIDE.md](./AUTH_SETUP_GUIDE.md)** - Complete setup and configuration guide
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Technical architecture and database schema
- **[supabase_migration.sql](./supabase_migration.sql)** - Database schema and initial data

## ✨ Features

### For All Users
- **Preview Mode**: Try 1 sample group with 5 words (no registration required)
- **Modern UI**: Beautiful, kid-friendly interface
- **Speech Recognition**: Interactive reading practice

### For Registered Users
- **Personal Account**: Secure email/password authentication
- **Content Management**: Create unlimited categories, groups, and words
- **Full Admin Panel**: Complete CRUD operations for all content
- **Data Isolation**: Your content is private and secure

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (SvelteKit)               │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │   Login/   │  │   Select   │  │   Admin    │   │
│  │  Register  │  │   Groups   │  │   Panel    │   │
│  └────────────┘  └────────────┘  └────────────┘   │
│         │                │                │         │
│         └────────────────┴────────────────┘         │
│                        │                            │
└────────────────────────┼────────────────────────────┘
                         │
                         │ Supabase Client
                         │
┌────────────────────────▼────────────────────────────┐
│                  Supabase Backend                    │
│                                                      │
│  ┌──────────────┐  ┌───────────────────────────┐   │
│  │     Auth     │  │        Database           │   │
│  │   Service    │  │                           │   │
│  │              │  │  ├─ categories (RLS)      │   │
│  │  - Register  │  │  ├─ groups (RLS)          │   │
│  │  - Login     │  │  ├─ words (RLS)           │   │
│  │  - Sessions  │  │  └─ public_content        │   │
│  └──────────────┘  └───────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **User Isolation**: Each user only sees their own content
- **Auth Guards**: Protected routes with automatic redirects
- **Secure Sessions**: JWT-based authentication
- **Environment Variables**: Sensitive data kept secure
- **HTTPS Enforced**: All traffic encrypted

## 🗂️ Database Schema

### Tables

**categories**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `name` (TEXT)
- `description` (TEXT, nullable)
- `icon` (TEXT, nullable)
- `created_at` (TIMESTAMP)

**groups**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `category_id` (UUID, FK → categories)
- `name` (TEXT)
- `description` (TEXT, nullable)
- `final_reward_text` (TEXT)
- `final_reward_image` (TEXT, nullable)
- `created_at` (TIMESTAMP)

**words**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `group_id` (UUID, FK → groups)
- `text` (TEXT)
- `image_src` (TEXT)
- `order_position` (INTEGER)
- `created_at` (TIMESTAMP)

**public_content** (for preview)
- `id` (UUID, PK)
- `category_name` (TEXT)
- `group_name` (TEXT)
- `group_description` (TEXT, nullable)
- `final_reward_text` (TEXT)
- `final_reward_image` (TEXT, nullable)
- `words` (JSONB)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)

## 🛠️ Development

### Key Files

```
src/
├── lib/
│   ├── supabaseClient.ts          # Supabase initialization
│   ├── stores/
│   │   └── auth.ts                # Auth state management
│   ├── services/
│   │   ├── auth.ts                # Auth operations
│   │   └── supabaseStorage.ts    # Database operations
│   └── types/
│       └── game.ts                # TypeScript types
├── routes/
│   ├── +layout.svelte             # Root layout (auth init)
│   ├── +page.svelte               # Home page
│   ├── login/
│   │   └── +page.svelte           # Login page
│   ├── register/
│   │   └── +page.svelte           # Register page
│   ├── select/
│   │   └── +page.svelte           # Select group
│   ├── play/
│   │   └── +page.svelte           # Play game
│   └── admin/
│       ├── +layout.svelte         # Admin auth guard
│       └── +page.svelte           # Admin dashboard
```

### Adding New Features

1. Update TypeScript types in `src/lib/types/game.ts`
2. Add database operations in `src/lib/services/supabaseStorage.ts`
3. Create/update UI components
4. Add RLS policies in Supabase if needed
5. Test thoroughly

### Testing Checklist

- [ ] Register new user
- [ ] Login with existing user
- [ ] Logout functionality
- [ ] Admin panel access control
- [ ] Create category
- [ ] Create group
- [ ] Add words
- [ ] Play game with user content
- [ ] Try preview mode (logged out)
- [ ] Verify data isolation between users

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Environment Variables Required

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📖 User Flows

### Guest User Flow
1. Visit home page → See preview option
2. Click "Coba Sekarang" → See 1 sample group
3. Play sample game → Encouraged to register
4. Click "Daftar" → Registration page

### Registered User Flow
1. Visit home page → Login
2. Go to Admin Panel → Create categories/groups/words
3. Return to home → Select created content
4. Play game → Enjoy!

### Admin Management Flow
1. Login → Admin Panel
2. **Categories Tab**: Manage themes
3. **Groups Tab**: Manage word sets
4. **Words Tab**: Add/edit individual words
5. Save → Content ready to play

## 🐛 Troubleshooting

**Can't connect to Supabase**
- Check `.env` file exists and has correct values
- Verify Supabase project is active
- Check browser console for errors

**Login not working**
- Verify migration was run successfully
- Check Supabase Auth is enabled
- Disable email confirmation in Supabase for testing

**Can't see content**
- Ensure user is logged in
- Check RLS policies are active
- Verify content was created by the logged-in user

**Admin panel redirects to login**
- This is expected if not logged in
- Login first, then access admin panel

## 📊 Implementation Status

✅ **Completed**
- User authentication (register/login/logout)
- User-specific content management
- Public preview mode
- Admin panel protection
- Row Level Security
- Auth state management
- Login/Register UI
- Home page with auth status
- Select page with preview
- Database schema and migration
- Documentation

⏳ **Pending** (Optional Enhancements)
- Password reset functionality
- Profile management page
- Email verification templates
- Content sharing between users
- Social authentication (Google, etc.)
- Admin analytics dashboard

## 🤝 Contributing

When adding features:
1. Follow existing code structure
2. Update TypeScript types
3. Add proper error handling
4. Update documentation
5. Test authentication flows
6. Verify RLS policies work correctly

## 📝 License

Same as main project.

---

## 🎉 Summary

Your application now has:
- ✅ Secure multi-user authentication
- ✅ User-specific content management
- ✅ Public preview for guest users
- ✅ Protected admin panel
- ✅ Database-level security (RLS)
- ✅ Modern, intuitive UI

**Ready to deploy and use! 🚀**
