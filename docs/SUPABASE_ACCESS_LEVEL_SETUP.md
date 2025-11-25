# Setting Up Access Level Field in Supabase

## Current Status

Your `profiles` table already has an `access_level` field defined in `supabase_schema.sql`, but it needs to be updated to use `'premium'` instead of `'standard'`.

## Option 1: Update Existing Database (Recommended if already deployed)

If you've already created your Supabase database, run these SQL commands in the Supabase SQL Editor:

### Step 1: Update the CHECK constraint

```sql
-- Drop the old constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_access_level_check;

-- Add the new constraint with 'premium' instead of 'standard'
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_access_level_check
CHECK (access_level IN ('free', 'premium', 'professional'));
```

### Step 2: Update any existing 'standard' values to 'premium'

```sql
-- Update existing users who had 'standard' to 'premium'
UPDATE public.profiles
SET access_level = 'premium'
WHERE access_level = 'standard';
```

### Step 3: Verify the change

```sql
-- Check current access levels
SELECT access_level, COUNT(*) as count
FROM public.profiles
GROUP BY access_level;
```

## Option 2: Fresh Database Setup

If you're setting up a new database or want to recreate it, use the updated schema:

### Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"

### Step 2: Run the Updated Schema

Copy and paste the updated schema from `supabase_schema.sql` (which now has 'premium' instead of 'standard'):

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  access_level TEXT NOT NULL DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'professional')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', NULL)),
  subscription_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved analyses table
CREATE TABLE public.saved_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  chapter_text TEXT,
  editor_html TEXT,
  analysis_data JSONB,
  domain TEXT,
  is_template_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_analyses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Saved analyses policies
CREATE POLICY "Users can view own analyses"
  ON public.saved_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.saved_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON public.saved_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON public.saved_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, access_level)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_analyses_updated_at
  BEFORE UPDATE ON public.saved_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX idx_profiles_access_level ON public.profiles(access_level);
CREATE INDEX idx_saved_analyses_user_id ON public.saved_analyses(user_id);
```

### Step 3: Click "Run" or press Cmd/Ctrl + Enter

## Testing Access Levels

Once your database is set up, you can test different access levels by updating user records:

### Set User to Free Tier

```sql
UPDATE public.profiles
SET access_level = 'free'
WHERE email = 'your-test-email@example.com';
```

### Set User to Premium Tier (Tier 2)

```sql
UPDATE public.profiles
SET access_level = 'premium'
WHERE email = 'your-test-email@example.com';
```

### Set User to Professional Tier (Tier 3)

```sql
UPDATE public.profiles
SET access_level = 'professional'
WHERE email = 'your-test-email@example.com';
```

## Viewing All Users and Their Access Levels

```sql
SELECT
  email,
  full_name,
  access_level,
  subscription_status,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
```

## Common Issues & Solutions

### Issue: "relation public.profiles already exists"

**Solution:** The table already exists. Use Option 1 to update it instead of recreating it.

### Issue: Changes not reflecting in the app

**Solution:**

1. Make sure you're logged in with the test account
2. Sign out and sign back in to refresh the profile data
3. Check browser console for any errors
4. Verify the SQL update succeeded by running the "Viewing All Users" query above

### Issue: "permission denied for table profiles"

**Solution:** Make sure you're running the queries as a superuser in Supabase SQL Editor, not through the API.

## Next Steps

After setting up the database:

1. Create a test account or use your existing one
2. Set its `access_level` to `'premium'` or `'professional'` using the SQL commands above
3. Sign in to the app and verify:
   - The tier dropdown is locked (shows your tier but can't be changed)
   - Your UserMenu shows "premium plan" or "professional plan"
   - Writer Mode is accessible (for premium and professional tiers)

See `TIER_TESTING_GUIDE.md` for complete testing scenarios.
