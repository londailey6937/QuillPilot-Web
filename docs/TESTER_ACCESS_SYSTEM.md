# Tester Access System

## Overview

QuillPilot uses a **tier-based access control system** where user access is determined by their `access_level` in Supabase. There is no separate "tester email" whitelist - testers are simply users with their `access_level` set to `professional` in the database.

## How It Works

### Access Tiers

| Tier             | Access Level   | Features                                                |
| ---------------- | -------------- | ------------------------------------------------------- |
| **Free**         | `free`         | Basic spacing & dual-coding analysis, 200 page limit    |
| **Premium**      | `premium`      | Full 10-principle analysis, all exports, 650 page limit |
| **Professional** | `professional` | All Premium features + Writer Mode, 1000 page limit     |

### For Testers (Full Access)

To grant full testing access to a user:

1. Go to Supabase Dashboard → Table Editor → `user_profiles`
2. Find the user by email
3. Set `access_level` to `professional`
4. User now has full access to all features

**Current testers:**

- `londailey6937@gmail.com` - Primary admin/developer
- `lonwdailey@icloud.com` - Alternate account (access_level: professional)

### For Regular Users

- **Free tier**: Limited analysis, no exports
- **Premium tier**: Full analysis + exports (DOCX, PDF, HTML, JSON, TXT, MD)
- **Professional tier**: All features including Writer Mode

## Export Formats Available

Premium and Professional users can export to:

| Format             | Extension | Description                      |
| ------------------ | --------- | -------------------------------- |
| Word Document      | `.docx`   | Full formatting preserved        |
| PDF                | `.pdf`    | Print-ready format               |
| Web Page           | `.html`   | Open in any browser              |
| Plain Text         | `.txt`    | Simple text, no formatting       |
| Markdown           | `.md`     | For GitHub, Obsidian, notes apps |
| QuillPilot Project | `.json`   | Full backup with analysis data   |

## Implementation Details

### Core Files

1. **`types.ts`**:

   - `AccessLevel` type: `"free" | "premium" | "professional"`
   - `canUseFeature()` - checks if user tier meets required tier
   - `ACCESS_TIERS` - defines features available at each tier

2. **`ChapterCheckerV2.tsx`**:
   - Profile loading from Supabase (`user_profiles.access_level`)
   - Feature restrictions based on `ACCESS_TIERS[accessLevel]`
   - Export handler checks `features.exportResults`

### Feature Gates

Features are gated by checking the user's access tier:

```typescript
const features = ACCESS_TIERS[accessLevel];
if (!features.exportResults) {
  alert("🔒 Save features require a Premium or Professional subscription.");
  return;
}
```

### Access Tier Configuration

From `types.ts`:

```typescript
export const ACCESS_TIERS: Record<AccessLevel, AccessFeatures> = {
  free: {
    spacingAnalysis: true,
    dualCodingAnalysis: true,
    fullAnalysis: false,
    exportResults: false,
    writerMode: false,
    maxPages: 200,
  },
  premium: {
    spacingAnalysis: true,
    dualCodingAnalysis: true,
    fullAnalysis: true,
    exportResults: true,
    writerMode: false,
    maxPages: 650,
  },
  professional: {
    spacingAnalysis: true,
    dualCodingAnalysis: true,
    fullAnalysis: true,
    exportResults: true,
    writerMode: true,
    maxPages: 1000,
  },
};
```

## Adding New Testers

### Via Supabase Dashboard

1. User signs up or logs into QuillPilot
2. Admin goes to Supabase Dashboard
3. Navigate to Table Editor → `user_profiles`
4. Find user by email
5. Edit row, set `access_level` to `professional`
6. Save changes

### Via SQL

```sql
UPDATE user_profiles
SET access_level = 'professional'
WHERE email = 'newtester@example.com';
```

## User Experience

### Login Flow

1. User logs in with email
2. App fetches profile from `user_profiles` table
3. `access_level` determines available features
4. Console shows: `📋 Profile loaded, access_level: professional`

### Feature Access

| Feature                    | Free           | Premium        | Professional    |
| -------------------------- | -------------- | -------------- | --------------- |
| Upload documents           | ✅ (200 pages) | ✅ (650 pages) | ✅ (1000 pages) |
| Spacing analysis           | ✅             | ✅             | ✅              |
| Dual-coding analysis       | ✅             | ✅             | ✅              |
| Full 10-principle analysis | ❌             | ✅             | ✅              |
| Export (all formats)       | ❌             | ✅             | ✅              |
| Writer Mode                | ❌             | ❌             | ✅              |
| AI Templates               | ✅             | ✅             | ✅              |

## Security Notes

- Access levels are stored in Supabase `user_profiles` table
- Client-side feature gating is for UX (hiding/showing features)
- Supabase RLS policies control actual database access
- Feature checks happen before any action is performed

## Troubleshooting

### User can't access features they should have

1. Check Supabase `user_profiles` for their `access_level`
2. Check browser console for profile loading messages
3. Ensure user is logged in (not anonymous session)
4. Try logging out and back in to refresh profile

### "No profile found" error

User exists in auth but not in `user_profiles` table. Either:

- Create profile manually in Supabase
- Or trigger profile creation by having user complete signup flow
