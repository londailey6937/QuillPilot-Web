# Tester Access System

## Overview

QuillPilot uses a tester-based access control system that allows designated users (testers) to access all features for testing, while regular users see the UI but cannot use premium/professional features yet.

## How It Works

### For Testers (Full Access)

- **Email**: `londailey6937@gmail.com` (primary admin/developer)
- **Capabilities**:
  - Can manually switch between Free/Premium/Professional tiers using the dropdown
  - Can use ALL features regardless of tier setting
  - Can run full 10-principle analysis
  - Can export to DOCX and HTML
  - Can access Writer Mode
  - Tier switching works locally for testing different user experiences

### For Regular Users (Restricted)

- **Access**: Free tier features only
- **Restrictions**:
  - Can see Premium and Professional UI elements
  - **Cannot** run premium/professional analysis (blocked with "coming soon" message)
  - **Cannot** export documents (blocked with "coming soon" message)
  - **Cannot** use Writer Mode (blocked with "coming soon" message)
  - Tier dropdown is visible but premium/professional features are non-functional

## Adding Additional Testers

To grant full testing access to another user, add their email to the `TESTER_EMAILS` array in `types.ts`:

```typescript
export const TESTER_EMAILS = [
  "londailey6937@gmail.com", // Primary admin/developer
  "newtester@example.com", // Add new tester emails here
];
```

## Implementation Details

### Core Files

1. **`types.ts`** (lines 12-41):

   - `TESTER_EMAILS` array - list of authorized tester emails
   - `isTesterEmail()` - checks if an email has tester access
   - `canUseFeature()` - determines if user can actually use a feature

2. **`ChapterCheckerV2.tsx`**:
   - Import tester functions (line 17)
   - Profile loading with tester detection (lines 587-642)
   - Feature restrictions in:
     - `handleAnalyzeChapter` (line 1228-1238)
     - `handleExportDocx` (line 1470-1485)
     - `handleExportHtml` (line 1520-1535)
     - Writer Mode button (line 2071-2081)

### Feature Gates

Each restricted feature checks:

```typescript
const isTester = isTesterEmail(userProfile?.email);
if (!isTester) {
  alert(
    "🔒 [Feature] is coming soon!\\n\\n" +
      "This feature is currently available only to testers.\\n\\n" +
      "Full functionality will be available in the next release."
  );
  return;
}
```

### Automatic Tier Sync

- **Testers**: Can manually change tiers via dropdown for testing
- **Non-testers**: Access level automatically syncs from Supabase `user_profiles.access_level`
- Auth listener at lines 610-642 handles automatic updates when subscriptions change

## User Experience

### Tester Login Flow

1. Login with tester email (`londailey6937@gmail.com`)
2. Console shows: `🔓 Tester access granted: londailey6937@gmail.com`
3. All features unlocked
4. Can use dropdown to test different tier experiences

### Regular User Flow

1. Login with any other email
2. Access level syncs from Supabase profile
3. Can see Premium/Professional UI elements
4. Clicking restricted features shows "coming soon" alert
5. Only Free tier features are functional

## Testing Different Tiers

As a tester, you can test each tier's user experience:

1. **Test Free Tier**:

   - Switch dropdown to "Free"
   - Upload should work up to 200 pages
   - Analysis button should show upgrade prompt
   - No export or Writer Mode buttons

2. **Test Premium Tier**:

   - Switch dropdown to "Premium"
   - Upload works up to 650 pages
   - Full analysis runs (tester bypass)
   - Export buttons work (tester bypass)
   - No Writer Mode button

3. **Test Professional Tier**:
   - Switch dropdown to "Professional"
   - Upload works up to 1000 pages
   - All features work (tester bypass)
   - Writer Mode button visible and functional

## Future Release Plan

When ready to launch premium/professional features:

1. Remove tester checks from feature functions
2. Keep tier-based feature gating from `ACCESS_TIERS`
3. Regular users with premium/professional subscriptions will automatically get access
4. Tester system can remain for internal testing of new features

## Security Notes

- Tester emails are checked case-insensitive
- Feature restrictions are client-side (UI blocking only)
- Server-side validation should be added for production
- Supabase RLS policies control actual database access
