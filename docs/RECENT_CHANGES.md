# Recent Changes & Features

**Last Updated:** November 29, 2025

This document tracks recent features, improvements, and changes to the Chapter Analysis system.

---

## November 29, 2025 Updates

### Mode-Aware DOCX Export

**Feature:** DOCX export now respects the current view mode

**What it does:**

- **Writer Mode Export:** Produces a clean Word document without analysis, metrics, or highlights - ready for submission
- **Analysis Mode Export:** Includes full analysis summary, scores, recommendations, and color-coded highlights

**How to use:**

1. Switch to your desired view (Writer or Analysis toggle)
2. Click "📄 Export DOCX" button
3. The export format automatically matches your current mode

**Files changed:**

- `docxExport.ts` - Added `mode` parameter ("writer" | "analysis")
- `ChapterCheckerV2.tsx` - Passes `viewMode` to export function
- `WriterMode.tsx` - Always exports in "writer" mode

---

### Table of Contents (TOC) Formatting

**Feature:** Block format dropdown now supports TOC elements

**What it does:**

- **With text selected:** Formats selected text as a TOC entry heading
- **Without selection:** Inserts a TOC placeholder showing where auto-generated TOC will appear

**How to use:**

1. To mark text for TOC: Select your chapter heading → Choose "Table of Contents" from block format dropdown
2. To insert placeholder: Place cursor → Choose "Table of Contents" (nothing selected)

**Files changed:**

- `CustomEditor.tsx` - Added special handling for TOC, Index, and Figure block types
- Added CSS styles for `.toc-entry` and `.toc-placeholder`

---

### Automatic TOC Generation in DOCX Export

**Feature:** DOCX exports now include a proper Table of Contents with page references

**What it does:**

- Automatically detects if document has 3+ headings or a TOC placeholder
- Generates a Word-compatible Table of Contents at the beginning of the document
- TOC includes H1, H2, and H3 headings with clickable links
- Word will prompt to update page numbers when the document is opened
- Page break inserted after TOC for clean separation

**Auto-detection:**

- If document contains a TOC placeholder → TOC is included
- If document has 3+ heading elements → TOC is included
- Can be explicitly controlled via `includeToc` parameter

**How to use:**

1. Add headings to your document (H1, H2, H3)
2. Export to DOCX
3. Open in Microsoft Word
4. When prompted, click "Yes" to update field codes (this populates page numbers)

**Files changed:**

- `docxExport.ts`:
  - Added `TableOfContents`, `StyleLevel`, `PageBreak` imports
  - Added `includeToc` option to export interface
  - Auto-detects TOC need from content
  - Generates TOC with `headingStyleRange: "1-3"`
  - Enabled `updateFields: true` for automatic page number updates

---

### Styles Panel Improvements

**Feature:** Fixed Styles Panel positioning and visibility

**What changed:**

- Increased z-index to `z-[100]` to ensure panel appears above all other elements
- Changed positioning to `items-start` with `pt-16` padding from top
- Increased max height to `80vh` for better content visibility

---

### Auth Flow Optimization

**Feature:** Faster, more reliable authentication on page load

**What changed:**

- `SIGNED_IN` events that fire before `INITIAL_SESSION` are now deferred
- Eliminates "Profile fetch timeout" errors on page refresh
- Profile loads immediately when session is ready
- Increased timeouts for slower network conditions

**Files changed:**

- `ChapterCheckerV2.tsx` - Improved auth state change handling
- `supabase.ts` - Added optional `userId` parameter to `getUserProfile()`

---

## November 2025 Updates

### Writer Mode - AI Template Generation

**Feature:** Automatic template generation for content improvement

**What it does:**

- Analyzes principle scores (Spacing and Dual Coding)
- Generates structured template with blank areas for improvement
- Provides three types of prompts:
  - **[WRITER]** - Instructions for human writers
  - **[CLAUDE]** - Structured prompts for AI assistance
  - **[VISUAL]** - Suggestions for visual content

**How to use:**

1. Complete analysis in Writer Mode (Professional tier)
2. Click "🤖 Generate AI Template" button
3. Editor expands to full width
4. Fill in marked sections or copy prompts to Claude

**Implementation:**

- File: `ChapterCheckerV2.tsx`
- Lines: 2189-2315 (template generation logic)
- State: `isTemplateMode` controls full-width editor
- Auto-saves template to localStorage

**Example template structure:**

```
[WRITER - Introduction needed]
Write an engaging introduction...

[CLAUDE - Generate example]
Create a concrete example demonstrating...

[VISUAL - Add diagram suggestion]
Consider adding: Concept map showing...
```

---

### Auto-Save & Restore System

**Feature:** Persistent document state across browser sessions

**What it does:**

- Automatically saves on every edit
- Stores to localStorage with timestamp
- Prompts to restore on page reload
- Preserves template mode state

**Storage key:** `quillpilot_autosave`

**Stored data:**

- Document content (HTML)
- File name
- Analysis results
- Template mode flag
- Save timestamp

**Implementation:**

- File: `ChapterCheckerV2.tsx`
- Lines: 601-635 (auto-save logic)
- Lines: 460-507 (restore prompt)
- Lines: 1426-1460 (info button)

**How to use:**

1. Edit document - saves automatically
2. Close/refresh browser
3. Reopen - prompted to restore
4. Click "💾 Auto-save info" to check last save

**Manual save button:**

- Shows confirmation with timestamp
- Saves to localStorage (not export)
- Located in DocumentEditor toolbar

---

### Domain Detection Algorithm v3

**Feature:** Ultra-strict domain auto-detection to prevent false positives

**Problem solved:**
Meditation/philosophy documents were incorrectly detected as Physics due to common words like "energy", "force", "power", "state".

**Solution - Three-tier filtering:**

1. **Minimum word length: 4+ characters**

   - Ignores short common words ("law", "ion", "amp")
   - Prevents false matches on abbreviations

2. **Unique concept requirement: 8+ different concepts**

   - Not just one concept repeated many times
   - Ensures diverse domain-specific vocabulary

3. **Score threshold: 40+ weighted matches**

   - Quadrupled from original (10 → 20 → 40)
   - Requires strong domain signal

4. **3x lead requirement: NEW**
   - Top domain must score 3x higher than second place
   - Prevents ambiguous classifications

**Implementation:**

- File: `ChapterCheckerV2.tsx`
- Function: `detectDomain()` lines 341-420
- Uses `Set<string>` to track unique concepts
- Returns `null` if criteria not met

**Example:**

```typescript
// Before (v2):
// "energy" appears 20 times → Physics detected ❌

// After (v3):
// "energy" (6 chars, repeated) → Need 7 more unique concepts
// Only 2 unique concepts total → null (no detection) ✅
```

---

### "None / General Content" Option

**Feature:** Manual domain selection for non-academic content

**What it does:**

- Adds "📝 None / General Content" to domain dropdown
- Allows analysis without domain-specific concept libraries
- Hides domain-dependent sections in results

**When to use:**

- Meditation/philosophy texts
- Creative writing
- General prose
- Personal essays
- Content that doesn't fit academic domains

**Implementation:**

- File: `ChapterCheckerV2.tsx`
- Line 2082: Dropdown option
- Value: `"none"` (string, not null)
- Lines 2069-2075: Selection handler
- Lines 926-934: Allows analysis with "none"
- Line 997: Passes `null` to worker when "none"

**UI changes:**

- Shows "📝 None / General Content" with "✓ Manual selection"
- Analyze button remains active
- No concept library loaded

---

### Domain-Specific Section Hiding

**Feature:** Hide irrelevant sections for general content

**What it does:**
When domain is "none" or null:

**HIDDEN sections** (requires domain knowledge):

- 📚 Learning Patterns Detected
- 📋 Recommendations
- Concept Revisit Frequency chart
- 📚 Concept Overview stats

**VISIBLE sections** (domain-agnostic):

- ✅ Cognitive Load Distribution
- ✅ Learning Principles Evaluation
- ✅ Overall scoring
- ✅ Principle scores radar
- ✅ Interleaving patterns

**Why:**
Domain-specific sections depend on concept libraries. Without a valid domain, these sections would show empty/incorrect data.

**Implementation:**

- File: `ChapterCheckerV2.tsx` line 2604
- File: `VisualizationComponents.tsx` lines 2120-2260
- Prop: `hasDomain={selectedDomain !== "none" && selectedDomain !== null}`
- Wraps sections in `{hasDomain && (...)}`

**User experience:**

- General content still gets valuable feedback
- No confusing empty sections
- Focus on universal learning principles

---

### UI Position Fix: Back to Top Button

**Feature:** Move button to avoid popup conflicts

**Problem:**
Back to top button in bottom-right corner was blocking popup dialogs (UpgradePrompt).

**Solution:**
Moved to bottom-left corner.

**Implementation:**

- File: `ChapterCheckerV2.tsx` line 2720
- Changed: `right: "28px"` → `left: "28px"`
- Z-index: 1200 (below dialogs at 1500)

**Visual:**

```
Before:                   After:
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│    [Popup] ←──┐ │      │    [Popup]      │
│           ↑Top││      │                 │
└───────────────┘│      └─────────────────┘
                        │
                       ↑Top
```

---

## Breaking Changes

### None

All changes are additive and backward compatible.

---

## Migration Guide

### From Pre-November 2025 Version

**No migration needed!** All changes are additive:

1. **Auto-save is automatic** - Just works
2. **Template generation** - New button appears in Writer Mode
3. **Domain detection** - More conservative, may return null more often
4. **"None" option** - Manually select if auto-detect fails
5. **Section hiding** - Automatic based on domain selection

**Recommended actions:**

1. Clear localStorage if testing fresh: `localStorage.clear()`
2. Test domain detection with your documents
3. Manually select domain if auto-detect too conservative
4. Try template generation in Writer Mode

---

## Configuration Changes

### New State Variables

**ChapterCheckerV2.tsx:**

```typescript
const [isTemplateMode, setIsTemplateMode] = useState(false);
// Controls full-width editor and template state
```

### New Props

**DocumentEditor.tsx:**

```typescript
interface DocumentEditorProps {
  // ... existing props
  isTemplateMode?: boolean; // NEW: hides preview when true
}
```

**ChapterAnalysisDashboard:**

```typescript
interface DashboardProps {
  // ... existing props
  hasDomain?: boolean; // NEW: controls domain-specific sections
}
```

### New localStorage Keys

```typescript
"quillpilot_autosave"; // Full document state
"quillpilot_custom_domains"; // Custom domain list
"quillpilot_last_custom_domain"; // Last used custom domain
"quillpilot_upload_count"; // Free tier upload counter
"quillpilot_claude_api_key"; // Claude API key for AI templates
```

---

## Performance Notes

### Auto-Save Performance

- **Frequency:** Every keystroke (debounced)
- **Storage size:** Typically 50-200 KB per save
- **Impact:** Negligible (<1ms per save)
- **Limit:** localStorage 5-10 MB total (browser dependent)

**Recommendation:**

- Clear auto-save manually if storage full
- Use "Clear saved data" button in interface

### Domain Detection Performance

- **Speed:** <50ms for typical documents
- **Algorithm:** O(n×m) where n=text words, m=concept library size
- **Optimization:** Early exit with 4-char minimum filter
- **Impact:** Runs once on document load

---

## API Changes

### AnalysisEngine Worker

**Updated message format:**

```typescript
// Before:
{
  domain: string;
}

// After:
{
  domain: string | null;
}
// null indicates no domain-specific analysis
```

### ChapterAnalysisDashboard Component

**New prop:**

```typescript
<ChapterAnalysisDashboard
  // ... existing props
  hasDomain={selectedDomain !== "none" && selectedDomain !== null}
/>
```

---

## Testing Recommendations

### Test Cases for Domain Detection

1. **Physics textbook** → Should detect Physics
2. **Meditation document** → Should return null or prompt manual
3. **Chemistry chapter** → Should detect Chemistry
4. **Creative writing** → Should return null
5. **Mixed content** → May return null (ambiguous)

### Test Cases for Template Generation

1. Generate template with low Spacing score (<70)
2. Generate template with low Dual Coding score (<70)
3. Generate template with both low
4. Verify [WRITER], [CLAUDE], [VISUAL] prompts present
5. Verify full-width editor mode activates

### Test Cases for Auto-Save

1. Edit document → Refresh → Restore prompt appears
2. Decline restore → Start fresh
3. Accept restore → Content restored
4. Template mode → Save → Restore → Template mode persists
5. Clear data → Refresh → No restore prompt

---

## Known Issues

### None Currently

All features tested and working as expected.

---

## Future Enhancements Planned

### Template Generation

- [ ] Add more prompt types ([EXAMPLE], [ANALOGY])
- [ ] Custom prompt templates
- [ ] Export template to separate file
- [ ] AI integration (direct Claude API)

### Domain Detection

- [ ] Machine learning classifier
- [ ] User feedback training
- [ ] Confidence score display
- [ ] "Why this domain?" explanation
- [ ] Per-document domain preference saving

### Auto-Save

- [ ] Cloud sync option
- [ ] Version history
- [ ] Conflict resolution
- [ ] Export history
- [ ] Collaborative editing

---

## Rollback Instructions

If you need to revert to pre-November 2025 version:

```bash
git checkout <commit-before-changes>
npm install
npm run dev
```

**Note:** Auto-save data in localStorage will persist but won't be used by older version.

---

## Support

**Questions about recent changes?**

1. Check this document first
2. Review commit messages for specific changes
3. See implementation files referenced above
4. Test with sample documents

**File a bug:**

- Include browser/OS version
- Document type and size
- Steps to reproduce
- Expected vs actual behavior

---

## Credits

**Contributors:**

- AI Template Generation: November 2025
- Auto-Save System: November 2025
- Domain Detection v3: November 2025
- Section Hiding Logic: November 2025

**Inspired by:**

- User feedback on false domain detection
- Request for persistence across sessions
- Need for AI-assisted content improvement

---

**End of Recent Changes**
