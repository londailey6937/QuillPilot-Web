# Tome IQ Reference Library

**Complete feature reference and technical documentation**

---

## Table of Contents

1. [Spacing Analysis Reference](#spacing-analysis-reference)
2. [Dual Coding Analysis Reference](#dual-coding-analysis-reference)
3. [Export Formats Guide](#export-formats-guide)
4. [Domain Libraries Explained](#domain-libraries-explained)
5. [Concept Matching Strategy](#concept-matching-strategy)
6. [Access Tiers & Features](#access-tiers--features)
7. [Writer Mode Workflow](#writer-mode-workflow)
8. [Color Coding System](#color-coding-system)
9. [Technical Specifications](#technical-specifications)

---

## Spacing Analysis Reference

### What is Spacing Analysis?

Spacing analysis evaluates how concepts are distributed across your chapter to support **spaced repetition** - a proven learning technique where information is revisited at optimal intervals.

### Paragraph Spacing Indicators

When you upload a document, spacing indicators appear between paragraphs showing word counts and density:

| Indicator Color          | Word Count Range | Meaning                               | Action                    |
| ------------------------ | ---------------- | ------------------------------------- | ------------------------- |
| 🟢 **Green** (Good)      | 60-160 words     | Optimal paragraph length for learning | Keep this density         |
| 🟡 **Amber** (Compact)   | <60 words        | Too brief, may lack detail            | Consider expanding        |
| 🔴 **Orange** (Extended) | >160 words       | Too long, cognitive overload risk     | Split into smaller chunks |

### How Spacing Scores Are Calculated

**Score Range: 0-100**

- **80-100 (High)**: Strong spaced repetition with concepts revisited 3-5 times at good intervals
- **50-79 (Medium)**: Moderate spacing, some concepts repeated but intervals could be better
- **0-49 (Low)**: Poor spacing, concepts either mentioned once or clustered together

### Optimal Spacing Patterns

**Good Example:**

```
Introduction → Concept A introduced
Section 2 → Concept A mentioned in context (80 words later)
Section 4 → Concept A applied in example (200 words later)
Summary → Concept A reviewed (300 words later)
```

**Poor Example:**

```
Section 1 → Concept A introduced
Section 1 → Concept A mentioned 3 times in rapid succession
[Never mentioned again in rest of chapter]
```

### Spacing Targets Explained

The dashed lines between paragraphs mark "spacing targets" - ideal locations where concepts should be revisited. The system analyzes:

- **Gap size** between concept mentions
- **Distribution** across chapter sections
- **Density** of paragraphs (words per paragraph)
- **Cognitive load** based on paragraph length

---

## Dual Coding Analysis Reference

### What is Dual Coding?

**Dual coding** combines verbal (text) and visual (images, diagrams) representations to enhance learning and memory retention.

### Visual Suggestion Types

The analyzer detects passages that would benefit from visuals and suggests specific formats:

| Visual Type         | When Suggested                    | Example Text Patterns                      |
| ------------------- | --------------------------------- | ------------------------------------------ |
| 📊 **Diagram**      | Spatial relationships, structures | "consists of three layers", "connected to" |
| 🧭 **Flowchart**    | Processes, sequences, steps       | "first step", "then proceed", "finally"    |
| 📈 **Graph**        | Data, trends, comparisons         | "increased by 40%", "correlation between"  |
| 🎨 **Illustration** | Physical descriptions             | "shaped like", "appears as", "resembles"   |
| 🧠 **Concept Map**  | Abstract relationships            | "relates to", "category of", "consists of" |

### Priority Levels

Each suggestion has a priority indicating urgency:

| Priority            | Badge Color | Meaning                                           | When Assigned                                  |
| ------------------- | ----------- | ------------------------------------------------- | ---------------------------------------------- |
| **High Priority**   | 🔴 Red      | Critical - Complex content suffers without visual | Dense technical passages, multi-step processes |
| **Medium Priority** | 🟡 Orange   | Beneficial - Would improve comprehension          | Comparisons, moderate complexity               |
| **Low Priority**    | ⚪ Gray     | Optional - Minor enhancement                      | Simple descriptions, supplementary details     |

### How Dual Coding Scores Are Calculated

**Score Range: 0-100**

- **80-100 (High)**: Excellent visual support with diagrams/images for complex concepts
- **50-79 (Medium)**: Some visual elements present but opportunities missed
- **0-49 (Low)**: Text-heavy with little to no visual representation

### Dual Coding Callouts Structure

When you see a yellow callout box in Writer Mode or exports, it contains:

1. **Icon + Title**: Visual type (e.g., "📊 Diagram - High Priority")
2. **Reason**: Why this visual is needed (e.g., "Complex spatial relationships detected")
3. **Context**: Quote from your text triggering the suggestion
4. **Suggested Action**: Specific recommendation (e.g., "Create a diagram showing the three-layer architecture")

---

## Export Formats Guide

### HTML Export (.html)

**Best for**: Sharing, viewing in browser, printing

**Features:**

- ✅ Self-contained file (CSS embedded)
- ✅ Works in any browser
- ✅ Color-coded indicators and callouts
- ✅ Print-optimized styles
- ✅ Responsive design (desktop/tablet/mobile)

**Contains:**

- Analysis summary (scores + brief summaries)
- Key recommendations (top 3 high-priority)
- Full chapter text with spacing indicators
- Dual-coding callouts inline
- Color-coded badges

**How to Use:**

1. Click "🌐 Export HTML" button
2. Save the downloaded `.html` file
3. Open in Chrome, Firefox, Safari, or any browser
4. Print using Ctrl/Cmd+P if needed

---

### DOCX Export (.docx)

**Best for**: Editing in Word, collaborating, formal documents

**Features:**

- ✅ Editable in Microsoft Word
- ✅ Colored shaded backgrounds (Nov 2025 update!)
- ✅ Same structure as HTML export
- ✅ Professional formatting

**Contains:**

- Document title
- Analysis summary with colored scoring
- Spacing indicators (blue/orange/red shaded paragraphs)
- Dual-coding callouts (yellow shaded boxes)
- Full chapter text

**Color Coding:**

- Blue background = Good spacing
- Orange background = Compact spacing warning
- Red background = Extended spacing warning
- Yellow background = Dual-coding suggestion

**How to Use:**

1. Click "📄 Export DOCX" button (Premium/Pro only)
2. Open in Microsoft Word
3. Edit directly in Word
4. Save or share as needed

---

### JSON Export (.json)

**Best for**: Developers, data analysis, integrations

**Features:**

- ✅ Complete raw analysis data
- ✅ Machine-readable format
- ✅ All scores, findings, suggestions
- ✅ Can be re-imported or processed programmatically

**Contains:**

- Overall score
- 10 principle evaluations with detailed findings
- Concept extraction results
- All recommendations with priorities
- Visualization data
- Metadata (timestamps, configuration)

**How to Use:**

1. Click "Export JSON" button (Premium/Pro)
2. Use for:
   - Building custom reports
   - Tracking progress over time
   - Integrating with other tools
   - Batch analysis workflows

---

## Domain Libraries Explained

### What Are Domain Libraries?

Domain libraries are pre-built concept dictionaries tailored to specific subject areas. They help the analyzer:

- **Recognize** subject-specific terminology
- **Extract** domain concepts more accurately
- **Evaluate** content relevance to the field

### Built-in Domains

| Domain             | Concept Count | Best For                                                  |
| ------------------ | ------------- | --------------------------------------------------------- |
| **Chemistry**      | 377           | General chemistry, organic, reactions, lab techniques     |
| **Algebra & Trig** | 102           | Mathematical concepts, equations, functions               |
| **Computing**      | 52            | Programming, data structures, algorithms, systems         |
| **Finance**        | 652           | Financial concepts, markets, accounting, economics        |
| **React**          | 47            | React.js development, hooks, components, state management |
| **JavaScript**     | 57            | JavaScript language features, syntax, DOM                 |
| **Cross Domain**   | 50            | General academic terms, common verbs                      |

### Selecting the Right Domain

**Best Practices:**

1. **Choose the primary subject** - If your chapter covers multiple topics, pick the dominant one
2. **Use "General"** - For interdisciplinary or non-technical content
3. **Create Custom Domain** - For specialized fields not covered by built-in libraries

### Auto-Detection Feature

When you upload a document, Chapter Checker analyzes your content and suggests the most likely domain based on:

- **Keyword analysis** - Detecting domain-specific terminology
- **Concept frequency** - How often domain concepts appear
- **Confidence scoring** - Accuracy of the detection

**💡 Detected Domain**

After uploading, you'll see a **"Detected Domain"** section showing the auto-detected subject area. You can:

- ✅ Accept the detected domain if it looks correct
- 🔄 Click "Change Domain" to select a different one
- 🎯 Use the dropdown to choose from all available domains

**Tip:** Always verify the detected domain matches your chapter's primary subject for best results!

### How Domains Affect Analysis

**With Correct Domain:**

```
Text: "The activation energy determines reaction rate"
Recognized: ✅ "activation energy", "reaction rate" (both core chemistry concepts)
Score Impact: Higher concept density, better evaluation
```

**Without Domain (or wrong domain):**

```
Text: "The activation energy determines reaction rate"
Recognized: ❌ Generic terms only
Score Impact: Lower scores, missed learning opportunities
```

---

## Custom Domain Creation

### When to Create Custom Domains

- Teaching specialized subjects (e.g., marine biology, ancient history, medical terminology)
- Corporate training materials with industry-specific jargon
- Academic research with novel terminology
- K-12 curricula with grade-appropriate concepts

### Creating a Custom Domain

**Professional Tier Only**

1. **Upload your chapter** first
2. **Click "Custom Domains"** in the navigation
3. **Name your domain** (e.g., "Marine Biology 101")
4. **Add concepts manually** or bulk import:
   - Enter concept name
   - Add definition (optional)
   - Set category: Core, Supporting, or Detail
5. **Save domain** to browser storage
6. **Select your custom domain** from dropdown

### Custom Domain Format

**Core Concepts** - Foundation ideas (10-15 per chapter):

- Example: "photosynthesis", "cell membrane", "DNA replication"

**Supporting Concepts** - Important but not central (20-30):

- Example: "chloroplast", "phospholipid bilayer", "base pairs"

**Detail Concepts** - Specific terms (40-60):

- Example: "thylakoid", "glycerol molecule", "adenine"

### Best Practices

- **Start with 50-100 concepts** for a typical domain
- **Use consistent terminology** - match your textbook's language
- **Include synonyms** if concepts have multiple names
- **Test with sample chapter** before finalizing
- **Update as you discover missed terms**

---

## Concept Matching Strategy

### How We Identify Concepts

Our analysis engine uses a sophisticated **Two-Pass Logic** to ensure both accuracy and flexibility when identifying concepts in your text.

### The Matching Workflow

> 📋 **Display Note:** This section appears with Cream background (#fef5e7) and Tan border (#e0c392) in the UI.

1. **Strict Match (Pass 1):** We first look for the exact, canonical name of the concept (e.g., "Real option exercise rule"). This ensures the most specific terminology is recognized.
2. **Flexible Match (Pass 2):** If the exact name isn't found, we scan for approved aliases and variations (e.g., "exercise rule"). This captures natural language usage while mapping it back to the core concept.

### False Positive Reporting

Language is complex, and sometimes a word might be matched out of context (e.g., "Bond" as a name vs. "Bond" as a financial instrument).

You can now **Report False Positives** directly from the concept list. Look for the flag icon on any concept pill to flag it for review. This helps us refine our libraries and improve accuracy for everyone.

---

## Access Tiers & Features

### Free Tier

**What You Get:**

- ✅ **3 document uploads** (no login required)
- ✅ Up to 200 pages per document
- ✅ Spacing analysis (full)
- ✅ Dual coding analysis (full)
- ✅ Upload DOCX/OBT files
- ✅ View analysis dashboard
- ✅ Access all built-in domains
- ✅ **Save up to 3 analyzed documents** (requires free account)
- ✅ Read-only document viewer
- ❌ No exports (HTML/DOCX/JSON)
- ❌ No Writer Mode (no editing capabilities)
- ❌ No rich text editor
- ❌ No custom domains
- ❌ Limited to spacing + dual coding only

**Best for:** Trying out the tool, quick checks, students

**Note:** Upload limit resets when you sign up or upgrade to Premium.

---

### Premium Tier 👑

**What You Get:**

- ✅ Everything in Free
- ✅ **Full 10-principle analysis**
- ✅ **Export results** (HTML, DOCX, JSON)
- ✅ Concept graphs and visualizations
- ✅ **Custom domain creation**
- ✅ Comprehensive recommendations
- ✅ Priority support
- ❌ No Writer Mode (view-only)

**Best for:** Educators, content creators, analysts

**Additional Principles Unlocked:**

- Deep Processing
- Retrieval Practice
- Interleaving
- Generative Learning
- Metacognition
- Schema Building
- Cognitive Load
- Emotion & Relevance

---

### Professional Tier 💼

**What You Get:**

- ✅ Everything in Premium
- ✅ **Writer Mode** (full rich text editing + live analysis)
- ✅ **Professional rich text editor** with formatting toolbar
- ✅ **Real-time analysis indicators** as you type
- ✅ **Unlimited analyses**
- ✅ **Advanced exports** (HTML + DOCX with embedded analysis)
- ✅ **Template library** with AI integration (Claude)
- ✅ Priority support + consultation

**Best for:** Publishers, textbook authors, instructional designers, professional content creators

**Writer Mode Features:**

- Rich text editing with full formatting toolbar
- Bold, italic, underline, headings, lists
- Image upload and paste support
- Tables, links, and alignment controls
- Keyboard shortcuts (Cmd/Ctrl+B, I, U, K, F, Z)
- Real-time spacing indicators update as you type
- Live dual-coding callouts appear inline
- Search and highlight concept mentions
- Find & replace functionality
- Undo/redo with 50-state history
- Statistics panel (word count, reading time, Flesch-Kincaid level)
- Focus mode (hide indicators for distraction-free writing)
- Auto-save to browser storage
- Export with embedded analysis and styling

---

## Writer Mode Workflow

### Accessing Writer Mode

1. **Upload a document** (DOCX or OBT)
2. **Run analysis** (select domain first)
3. **Click "✍️ Writer" tab** (Professional tier required)
4. **Editor opens** with your document text

### Writer Mode Layout

**Desktop (>1520px):**

```
┌────────────────────────────┬────────────────────────┐
│  Editable Document (65%)   │  Analysis Panel (35%)  │
│  [Formatting Toolbar]      │                        │
│                            │  • Spacing Overview    │
│  [Edit your text here...]  │  • Dual Coding Alerts  │
│                            │  • Concept Mentions    │
│  [Live indicators appear]  │  • Search/Highlight    │
│                            │  • Statistics          │
└────────────────────────────┴────────────────────────┘
```

**Tablet (≤1024px):**

```
┌────────────────────────────┐
│  Editable Document (100%)  │
│  [Formatting Toolbar]      │
│                            │
│  [Edit your text here...]  │
│                            │
│  [Tap ▶ to show analysis]  │
└────────────────────────────┘
```

### Editing Features (Professional Tier Only)

**Rich Text Formatting:**

- **Bold** (Cmd/Ctrl+B), **Italic** (Cmd/Ctrl+I), **Underline** (Cmd/Ctrl+U)
- Headings (H1, H2, H3) and paragraph styles
- Bulleted and numbered lists
- Text alignment (left, center, right, justify)
- Insert links (Cmd/Ctrl+K) and tables
- Upload or paste images directly
- Clear formatting option
- Undo (Cmd/Ctrl+Z) / Redo (Cmd/Ctrl+Shift+Z or Ctrl+Y)
- 50-state undo/redo history

**Live Analysis Integration:**

- Toggle spacing indicators on/off
- Dashed lines show paragraph boundaries
- Color badges (cream/tan backgrounds) indicate paragraph health
- Toggle dual-coding visual callouts on/off
- Yellow boxes appear inline showing suggestions
- Priority badges (high/medium/low) guide urgency
- Real-time updates as you type

**Search & Navigation:**

- Find & Replace (Cmd/Ctrl+F) with full-text search
- Search for specific concepts from analysis
- Click concept names to highlight all mentions
- Navigate between occurrences
- See frequency counts
- Match highlighting with navigation

**Statistics & Tools:**

- Live word count and character count
- Reading time estimation
- Flesch-Kincaid reading level calculation
- Paragraph count tracking
- Focus mode toggle (hide indicators for distraction-free writing)
- Auto-save to browser localStorage
- Statistics panel toggle

**Content Management:**

- Copy/paste preserves formatting
- Paste images from clipboard
- Drag and drop functionality
- Auto-save every edit (300ms debounce)
- Browser storage backup
- Export with full formatting preserved

**Keyboard Shortcuts:**

- **Cmd/Ctrl+B** - Bold
- **Cmd/Ctrl+I** - Italic
- **Cmd/Ctrl+U** - Underline
- **Cmd/Ctrl+K** - Insert link
- **Cmd/Ctrl+F** - Find & replace
- **Cmd/Ctrl+Z** - Undo
- **Cmd/Ctrl+Shift+Z** (Mac) or **Ctrl+Y** (Windows) - Redo

💡 **Pro Tip:** Use keyboard shortcuts for faster editing, or click the toolbar buttons for visual feedback!

### Export from Writer Mode

**Export Options:**

1. **📄 Export DOCX** - Save your edits as Word document with embedded analysis
2. **🌐 Export HTML** - Generate styled HTML with highlights
3. **📊 Export JSON** - Download raw analysis data

**Tip:** Use Writer Mode's full formatting capabilities and export to preserve all styling and analysis markers!

---

## Color Coding System

### Score Badges

| Color                | Range  | Principle Performance |
| -------------------- | ------ | --------------------- |
| 🟢 **Green**         | 80-100 | Strong application    |
| 🟡 **Yellow/Orange** | 50-79  | Moderate application  |
| 🔴 **Red**           | 0-49   | Needs improvement     |

### Spacing Indicators

**Colors match docs/colorPalette.md - Cream & Tan Backgrounds**

| Background Color    | Border           | Meaning                              |
| ------------------- | ---------------- | ------------------------------------ |
| Cream (#FEF5E7)     | Tan (#E0C392)    | Good paragraph length (60-160 words) |
| Light Tan (#F7E6D0) | Orange (#EF8432) | Too compact (<60 words)              |
| Pale Tan (#F5EAD9)  | Orange (#EF8432) | Too extended (>160 words)            |

### Dual Coding Callouts

| Background             | Border           | Priority Badge                          |
| ---------------------- | ---------------- | --------------------------------------- |
| Cream/Yellow (#FEF9C3) | Orange (#EF8432) | Red (High), Orange (Medium), Gray (Low) |

### Priority Badges

| Badge Text          | Color               | When Used              |
| ------------------- | ------------------- | ---------------------- |
| **High Priority**   | 🔴 Red (#EF4444)    | Critical suggestions   |
| **Medium Priority** | 🟡 Orange (#F97316) | Beneficial suggestions |
| **Low Priority**    | ⚪ Gray (#6B7280)   | Optional suggestions   |

### Card & UI Backgrounds

**Following docs/colorPalette.md standards:**

- **Main cards**: Cream (#FEF5E7)
- **Hover states**: Light Tan (#F7E6D0)
- **Borders**: Soft Tan (#E0C392)
- **Primary CTA**: Tome Orange (#EF8432)
- **Text**: Navy (#2C3E50)

---

## Technical Specifications

### Supported File Formats

| Format         | Extension | Max Size | Notes                            |
| -------------- | --------- | -------- | -------------------------------- |
| Microsoft Word | `.docx`   | 200 MB   | Tested up to 800-1200 pages      |
| Open Book Text | `.obt`    | 200 MB   | Proprietary format for textbooks |

**Typical Sizes:**

- 500-page textbook with moderate images: 50-80 MB
- 200-page academic paper: 10-20 MB
- 50-page chapter: 2-5 MB

### Browser Requirements

**Minimum:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Recommended:**

- Chrome 120+ or Firefox 115+ for best performance
- 8GB RAM for large documents (>100 pages)
- Modern processor (2018+ for smooth analysis)

### Analysis Performance

| Document Size  | Analysis Time | Memory Usage |
| -------------- | ------------- | ------------ |
| ~5,000 words   | 1-2 seconds   | ~40 MB       |
| ~28,000 words  | 4-6 seconds   | ~80 MB       |
| ~210,000 words | 25-35 seconds | ~400 MB      |
| ~350,000 words | 40-60 seconds | ~650 MB      |

**Tips for Large Documents:**

- Close other browser tabs
- Upload sections separately if document >100 pages
- Use desktop/laptop (not mobile) for very large files

### Data Privacy

**Local Storage:**

- ✅ All analysis runs **in your browser**
- ✅ Documents **never uploaded** to servers
- ✅ Custom domains saved **locally** only
- ✅ No tracking or analytics

**What's Stored:**

- Browser cache: Temporary file data (cleared on close)
- localStorage: Custom domain definitions
- sessionStorage: Analysis results (cleared when tab closes)

---

## Quick Reference Tables

### When to Use Each View Mode

| View Mode    | Purpose                           | Best For                                 |
| ------------ | --------------------------------- | ---------------------------------------- |
| **Analysis** | Review scores and recommendations | Initial evaluation, understanding issues |
| **Writer**   | Edit text with live feedback      | Revision, improving content              |

### Common Score Meanings

| Score Range | Overall Quality | Next Steps                   |
| ----------- | --------------- | ---------------------------- |
| 90-100      | Excellent       | Minor tweaks only            |
| 75-89       | Good            | Review medium priority items |
| 60-74       | Acceptable      | Address high priority issues |
| 45-59       | Needs Work      | Significant revision needed  |
| 0-44        | Poor            | Major restructuring required |

### Recommendation Priority Actions

| Priority | Action Timeframe         | Impact                             |
| -------- | ------------------------ | ---------------------------------- |
| High     | Address immediately      | Critical to learning effectiveness |
| Medium   | Address in next revision | Notable improvement opportunity    |
| Low      | Address if time permits  | Minor enhancement                  |

---

## Frequently Asked Questions

### General Questions

**Q: How long does analysis take?**
A: 2-5 seconds for typical chapters (1000-5000 words). Very large documents may take 15-30 seconds.

**Q: Can I analyze multiple chapters at once?**
A: Currently one at a time. Open multiple browser tabs for parallel analysis (Premium/Pro).

**Q: Does this work offline?**
A: Yes! Once loaded, the app runs entirely in your browser without internet.

**Q: Is my document secure?**
A: Completely. Nothing uploads to servers - all analysis happens locally in your browser.

---

### Analysis Questions

**Q: Why is my spacing score low?**
A: Common causes:

- Concepts mentioned only once (no repetition)
- Concepts clustered in one section
- Very short or very long paragraphs
- Lack of review/summary sections

**Q: Why is my dual coding score low?**
A: Common causes:

- No images, diagrams, or visual elements
- Text-heavy descriptions of visual concepts
- Processes described without flowcharts
- Data presented without graphs

**Q: Can I disagree with a recommendation?**
A: Yes! The analyzer uses heuristics that may not fit your pedagogical approach. Use professional judgment.

---

### Export Questions

**Q: Which export format should I use?**
A:

- **HTML** for quick sharing, viewing, printing
- **DOCX** for editing, collaboration, formal submission
- **JSON** for data analysis, tracking, automation

**Q: Can I import a JSON file back into the app?**
A: Not currently, but JSON contains all data needed for custom processing.

**Q: Do exports include my edits from Writer Mode?**
A: Yes! DOCX and HTML exports include your final edited text.

---

### Technical Questions

**Q: What's the difference between OBT and DOCX?**
A: OBT is a proprietary format for open textbooks. Functionally, both work the same in this app.

**Q: Can I use this for languages other than English?**
A: Currently optimized for English. Other languages may have reduced accuracy in concept extraction.

**Q: Why doesn't my custom domain appear?**
A: Custom domains are stored per-browser. If you clear browser data or switch computers, you'll need to recreate them.

---

## Need More Help?

### Documentation Resources

- **Quick Start Guide** - [`docs/QUICK_START.md`](./QUICK_START.md) - 10-minute setup
- **System Overview** - [`docs/SYSTEM_OVERVIEW.md`](./SYSTEM_OVERVIEW.md) - Architecture deep dive
- **Export Guide** - [`docs/UNIFIED_EXPORT_SYSTEM.md`](./UNIFIED_EXPORT_SYSTEM.md) - Export technical details
- **HTML Export** - [`docs/HTML_EXPORT_GUIDE.md`](./HTML_EXPORT_GUIDE.md) - HTML customization

### In-App Help

- Click **"❓ Help"** button in navigation for context-sensitive guidance
- Hover over info icons (ℹ️) for quick tips
- Check upgrade prompts for feature explanations

---

## Changelog

**November 2025:**

- ✨ Added colored backgrounds to DOCX exports
- ✨ Simplified analysis summaries (brief instead of detailed)
- ✨ Increased heading sizes in exports
- ✨ Fixed priority labels to two words
- ✨ Created unified HTML builder system

**Earlier Updates:**

- Responsive design for tablets/iPads
- Custom domain support
- Writer Mode with live editing
- Export to HTML/DOCX/JSON

---

**Last Updated:** November 15, 2025
**Version:** 2.0

---

## Concept Manifest

For a complete list of all concepts currently available in the system, including their IDs and importance levels, please refer to the [Concept Library Manifest](./CONCEPT_LIBRARY_MANIFEST.md).

This manifest is auto-generated and reflects the exact state of the codebase.
