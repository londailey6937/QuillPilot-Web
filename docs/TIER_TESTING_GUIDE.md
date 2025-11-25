# Tier Access Testing Guide

## Overview

The application now has proper tier gating that enforces access control based on the user's Supabase profile `access_level` field, not the dropdown selection.

## Tier Levels

### Tier 1 (Free)

- **No login required**
- Access: Spacing Analysis + Dual Coding Analysis
- Limitations: No full analysis, no export, no custom genres, no Writer Mode
- Max pages: 200

### Tier 2 (Premium)

- **Requires login & subscription**
- Access: Full Analysis (all 10 principles) + Export + Concept Graphs + Custom Genres + **Writer Mode**
- Max pages: 650

### Tier 3 (Professional)

- **Requires login & subscription**
- Access: Everything in Premium + Unlimited Analyses + Priority Support
- Max pages: 1000

## Key Changes Implemented

### 1. Profile Type Update

- Changed `access_level` from `"free" | "standard" | "professional"` to `"free" | "premium" | "professional"` to match the `AccessLevel` type

### 2. User Profile Sync

- Added `useEffect` in `ChapterCheckerV2.tsx` that:
  - Loads user profile on mount
  - Syncs `access_level` from Supabase to component state
  - Listens for auth state changes
  - Resets to "free" when user logs out

### 3. User Menu Display

- **Before:** Always showed "free plan" for unauthenticated users
- **After:** Only shows tier name if user has premium or professional access
- Free tier users don't see a plan label (since free doesn't require login)

### 4. Tier Dropdown Behavior

- **For Free Users (not logged in):** Dropdown is enabled, shows all tiers
  - Selecting premium/professional shows upgrade modal
- **For Paid Users (premium/professional):** Dropdown is replaced with a **locked** display showing their current tier
  - Cannot change tiers via dropdown
  - Alert shown if user tries to change: "Your tier is managed by your subscription. Please contact support to change your plan."

### 5. Writer Mode Access

- **Before:** Only professional tier had Writer Mode
- **After:** Both Premium (Tier 2) and Professional (Tier 3) have Writer Mode access
- Updated `types.ts` to set `writerMode: true` for premium tier

### 6. Tier Gating Logic

- `handleAccessLevelChange()` now checks:
  1. If user has paid subscription → prevent dropdown changes
  2. If user tries to select premium/professional without being logged in → show upgrade modal
  3. If user is logged in but has "free" access_level → show upgrade modal
  4. Only allows tier changes for truly free (not logged in) users in demo mode

## Testing Scenarios

### Test 1: Free User (Not Logged In)

1. Open app without logging in
2. **Expected:** No plan label in UserMenu dropdown
3. Try to select "Premium" from tier dropdown
4. **Expected:** Upgrade modal appears prompting to sign in
5. Click away from modal
6. **Expected:** Tier remains "Free"

### Test 2: Premium User (Logged In)

1. Sign in with account where `profiles.access_level = 'premium'`
2. **Expected:**
   - UserMenu shows "premium plan"
   - Tier dropdown is **replaced** with locked display: "Premium (Full Analysis)"
   - Cannot change tier via dropdown
3. Try to access Writer Mode
4. **Expected:** Writer Mode is accessible (button works, features enabled)
5. Upload a document > 200 pages
6. **Expected:** Accepted (max 650 pages)

### Test 3: Professional User (Logged In)

1. Sign in with account where `profiles.access_level = 'professional'`
2. **Expected:**
   - UserMenu shows "professional plan"
   - Tier dropdown is **replaced** with locked display: "Professional (Writer Mode)"
3. Access all features
4. **Expected:** Full access to Writer Mode, unlimited analyses, all features

### Test 4: Switching Accounts

1. Log in as Premium user
2. **Expected:** Tier shows "Premium", Writer Mode accessible
3. Log out
4. **Expected:** Tier resets to "Free", Writer Mode disabled
5. Log in as Professional user
6. **Expected:** Tier shows "Professional", all features accessible

## Database Setup for Testing

To test different tiers, update your Supabase `profiles` table:

```sql
-- Set user to Free (default)
UPDATE profiles
SET access_level = 'free'
WHERE email = 'test@example.com';

-- Set user to Premium (Tier 2)
UPDATE profiles
SET access_level = 'premium'
WHERE email = 'test@example.com';

-- Set user to Professional (Tier 3)
UPDATE profiles
SET access_level = 'professional'
WHERE email = 'test@example.com';
```

## Important Notes

1. **Free tier doesn't require login** - Users can use spacing and dual coding analysis without creating an account
2. **Tier changes are subscription-based** - Once a user has a paid subscription (premium/professional), they cannot change tiers via the UI dropdown
3. **Writer Mode is now available for Premium** - This is a tier 2 feature, not exclusive to tier 3
4. **Access level is enforced by database** - The dropdown is just a UI element; actual access control uses the Supabase profile's `access_level` field

## UI Behavior Summary

| User State               | Tier Dropdown  | UserMenu Display    | Writer Mode Access |
| ------------------------ | -------------- | ------------------- | ------------------ |
| Not logged in            | Enabled (demo) | No plan label       | ❌ Blocked         |
| Logged in (free)         | Enabled        | No plan label       | ❌ Blocked         |
| Logged in (premium)      | **Locked**     | "premium plan"      | ✅ Enabled         |
| Logged in (professional) | **Locked**     | "professional plan" | ✅ Enabled         |
