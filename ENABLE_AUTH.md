# Enable Supabase Authentication

Your app now has authentication and save functionality! Here's what you need to do to enable it:

## 1. Enable Email Authentication in Supabase

1. Go to https://supabase.com/dashboard/project/ecazijmazbptvyfqmjho/auth/providers
2. Find **Email** provider
3. Make sure **Enable Email provider** is turned ON
4. Disable "Confirm email" if you want instant signups (recommended for testing)
   - Or keep it enabled for production (users must click email link to confirm)
5. Click **Save**

## 2. Configure Email Templates (Optional)

Go to Auth > Email Templates to customize:

- Confirmation email
- Password reset email
- Magic link email

## 3. Test the Authentication

1. Open your app at http://localhost:5174/
2. Click the "Sign In" button in the top right
3. Create an account with your email and password
4. Run an analysis on a document
5. Click the "💾 Save Analysis" button
6. Check your database to see the saved data!

## Features Now Available

✅ **User Authentication**

- Sign up with email/password
- Sign in/Sign out
- User profile with access level

✅ **Save Analyses**

- Save analysis results to database
- Associate saves with user accounts
- Store document text, HTML, and analysis data

✅ **User Menu**

- Shows user email and profile
- Displays current access tier
- Sign out option

## Database Check

To see your saved data, run:
\`\`\`bash
node check-db-activity.mjs
\`\`\`

Or check directly in Supabase:
https://supabase.com/dashboard/project/ecazijmazbptvyfqmjho/editor

## Next Steps

- Add "My Saved Analyses" page to view all saves
- Add export/share functionality
- Implement access level restrictions tied to profiles
- Add Stripe integration for paid tiers

## Current Status

- ✅ Database schema deployed
- ✅ Supabase connection working
- ✅ Auth components created
- ✅ Save functionality implemented
- ⏳ Email provider needs to be enabled (see step 1)

Once you enable the Email provider, everything will work!
