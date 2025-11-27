# Supabase Email Confirmation Redirect Setup

This guide will help you configure Supabase to properly redirect users after email confirmation.

## Problem
After clicking the email confirmation link, users see a blank page with tokens in the URL hash instead of being properly authenticated.

## Solution
We've created an auth callback route at `/auth/callback` that handles the confirmation tokens. Now you need to configure Supabase to redirect to this URL.

---

## Step 1: Configure Redirect URLs in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **zxjylofqvjpvnxxwcahz**
3. Navigate to **Authentication** → **URL Configuration**

### Configure Site URL (Default Redirect)

Set the **Site URL** to your production URL:
```
https://game-anak.vercel.app/auth/callback
```

This is the default URL used when no specific redirect is provided.

### Configure Redirect URLs (Allow List)

In the **Redirect URLs** section, add these URLs (one per line or separated by commas):

```
http://localhost:3000/auth/callback
http://localhost:5173/auth/callback
https://game-anak.vercel.app/auth/callback
```

**You can also use wildcards for flexibility:**
```
http://localhost:*/auth/callback
https://*.vercel.app/auth/callback
```

### Important Notes:
- Click **Save** after adding the URLs
- URLs must match exactly (including http/https)
- Wildcards (*) can be used for domains and ports
- All redirect URLs must be in the allow list for security

---

## Step 2: Update Email Templates (Optional)

By default, Supabase will use the redirect URLs you configured above. However, if you want to customize the email templates:

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Ensure the confirmation link uses: `{{ .ConfirmationURL }}`
4. The system will automatically append the correct redirect URL

---

## Step 3: Test the Flow

### Local Testing:
1. Start your development server: `npm run dev`
2. Register a new account at: http://localhost:5173/register
3. Check your email for the confirmation link
4. Click the link - you should be redirected to `/auth/callback`
5. After processing, you'll be redirected to the home page

### Production Testing:
1. Deploy to Vercel
2. Register at: https://game-anak.vercel.app/register
3. Click the confirmation email link
4. Verify proper redirect and authentication

---

## What We've Implemented

### 1. Auth Callback Route (`/auth/callback`)
- Extracts tokens from URL hash
- Establishes Supabase session
- Shows loading, success, or error states
- Redirects to home page after successful confirmation

### 2. Enhanced Layout
- Listens for auth state changes
- Automatically updates user session
- Handles token refresh events

### 3. User Experience
- **Processing**: Shows loading spinner while verifying
- **Success**: Shows success message and auto-redirects
- **Error**: Shows error message with option to return to login

---

## Troubleshooting

### Issue: Still seeing blank page
**Solution**: Make sure you've added the redirect URL in Supabase dashboard and clicked Save.

### Issue: "No authentication tokens found" error
**Solution**: The confirmation link might be expired or invalid. Request a new confirmation email.

### Issue: Session not persisting
**Solution**: Check that your `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are correctly set in:
- Local: `.env` file
- Production: Vercel environment variables

### Issue: Email not arriving
**Solution**: 
- Check spam folder
- Verify email settings in Supabase Dashboard → Authentication → Email
- Test with a different email provider

---

## Vercel Environment Variables

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

```env
PUBLIC_SUPABASE_URL=https://zxjylofqvjpvnxxwcahz.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Select all environments: Production, Preview, Development

---

## Next Steps

1. ✅ Code changes completed (auth callback route created)
2. ⏳ **Configure redirect URLs in Supabase Dashboard** (your action required)
3. ⏳ Test locally with a new registration
4. ⏳ Deploy to Vercel
5. ⏳ Test in production

Once you've completed Step 2 (configuring Supabase), test the registration flow to confirm everything works!
