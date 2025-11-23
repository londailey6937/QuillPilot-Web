# Supabase Setup Guide

Complete instructions for setting up Supabase backend for Tome IQ (Chapter Analysis Tool).

---

## 🚀 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**

   - Sign up or log in
   - Click **"New Project"**

2. **Project Settings:**

   - **Name:** `tome-iq` (or your preferred name)
   - **Database Password:** Create a strong password (save it securely!)
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan:** Start with Free tier
   - Click **"Create new project"**

3. **Wait 2-3 minutes** for project to initialize

---

## 📊 Step 2: Set Up Database Schema

1. **Open SQL Editor:**

   - In your Supabase dashboard, click **SQL Editor** (left sidebar)
   - Click **"New query"**

2. **Copy and paste the entire contents** of `supabase_schema.sql` from this repository

3. **Run the query** (click "Run" or press Cmd/Ctrl + Enter)

4. **Verify setup:**
   - Click **Table Editor** (left sidebar)
   - You should see:
     - `profiles` table
     - `saved_analyses` table

---

## 🔐 Step 3: Configure Authentication

1. **Go to Authentication → Providers:**

   - Click **Authentication** in left sidebar
   - Click **Providers** tab

2. **Enable Email provider:**

   - **Email** should be enabled by default
   - Toggle on **"Confirm email"** if you want email verification
   - Click **Save**

3. **Optional - Enable social providers:**

   - **Google OAuth:** Add Client ID & Secret
   - **GitHub OAuth:** Add Client ID & Secret
   - Each requires creating OAuth apps in respective platforms

4. **Email Templates (Optional):**
   - Click **Email Templates** tab
   - Customize confirmation and reset password emails with your branding

---

## 🔑 Step 4: Get API Credentials

1. **Go to Project Settings:**

   - Click ⚙️ **Settings** → **API**

2. **Copy these values:**

   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** Long string starting with `eyJ...`

3. **Keep these secure!** You'll add them to Netlify next.

---

## 🌐 Step 5: Add Environment Variables to Netlify

1. **Go to your Netlify dashboard:**

   - Open your site: **Site settings** → **Environment variables**

2. **Add two variables:**

   **Variable 1:**

   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** Your Project URL from Step 4
   - **Scopes:** All scopes selected
   - Click **Create variable**

   **Variable 2:**

   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** Your anon public key from Step 4
   - **Scopes:** All scopes selected
   - Click **Create variable**

3. **Trigger a new deploy:**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**

---

## ✅ Step 6: Verify Setup

### Test in Supabase Dashboard:

1. **Create a test user:**

   - Go to **Authentication** → **Users**
   - Click **Add user** → **Create new user**
   - Enter email/password
   - Click **Create user**

2. **Check profile creation:**
   - Go to **Table Editor** → **profiles**
   - You should see the new user automatically created
   - Default `access_level` should be `free`

### Test on Your Deployed Site:

1. Visit your Netlify URL
2. Look for authentication features (if implemented)
3. Sign up with a test account
4. Check Supabase dashboard for new user

---

## 🔧 Local Development Setup (Optional)

If you want to test Supabase locally:

1. **Create `.env.local` file** in project root:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

2. **Add to `.gitignore`** (already there):

```
.env.local
```

3. **Restart dev server:**

```bash
npm run dev
```

---

## 📋 What This Enables

With Supabase set up, your app now has:

### ✅ User Features:

- **Sign up / Login** with email & password
- **Email verification** (optional)
- **Password reset** functionality
- **User profiles** with subscription tiers

### ✅ Data Features:

- **Save analyses** to cloud (not just browser)
- **Cross-device sync** (access from anywhere)
- **Analysis history** (view past chapters analyzed)
- **Subscription tracking** (free/standard/professional tiers)

### ✅ Security:

- **Row Level Security (RLS)** - Users only see their own data
- **Automatic profile creation** on signup
- **Secure authentication** with JWT tokens

---

## 🎯 Next Steps

### 1. Test Authentication:

```bash
# Check if Supabase client initializes
# Look in browser console for any errors
```

### 2. Add UI for Auth (if not already present):

- Sign up form
- Login form
- Profile page
- Saved analyses list

### 3. Monitor Usage:

- Go to **Project Settings** → **Usage**
- Free tier limits: 500MB database, 50K monthly active users, 2GB bandwidth

### 4. Set up Stripe (for paid tiers):

- Add Stripe webhook endpoint
- Handle subscription events
- Update `profiles` table with subscription status

---

## 🆘 Troubleshooting

### Environment variables not working:

- Make sure variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Redeploy after adding variables
- Check Netlify build logs for errors

### Users not being created:

- Check **Supabase → Logs** for errors
- Verify SQL schema was run completely
- Check if trigger `on_auth_user_created` exists

### RLS Policies blocking access:

- In development, you can disable RLS temporarily: `ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;`
- Re-enable for production: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`

### Connection errors:

- Verify Project URL is correct (no trailing slash)
- Check anon key is the public key, not service role key
- Ensure Netlify environment variables are saved and deployed

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with React](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui-react)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase + Stripe Integration](https://supabase.com/docs/guides/integrations/stripe)

---

## 💡 Current App Status

**Before Supabase:**

- ✅ All analysis runs locally
- ✅ Custom domains stored in localStorage
- ❌ No user accounts
- ❌ No cross-device sync
- ❌ No saved history

**After Supabase:**

- ✅ All analysis runs locally (unchanged)
- ✅ Custom domains stored in localStorage (unchanged)
- ✅ User accounts with authentication
- ✅ Cross-device sync for analyses
- ✅ Cloud-saved analysis history
- ✅ Subscription tier management

Your app will continue to work without Supabase - it just adds these extra features!
