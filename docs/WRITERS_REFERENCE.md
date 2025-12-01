# QuillPilot Writer's Reference

Your complete guide to mastering QuillPilot's writing tools and features.

---

## Table of Contents

1. [Writer Mode Overview](#writer-mode-overview)
2. [The Editor Toolbar](#the-editor-toolbar)
3. [Advanced Tools Panel](#advanced-tools-panel)
4. [Productivity Features](#productivity-features)
5. [Character Management](#character-management)
6. [Export Options](#export-options)
7. [Tips & Best Practices](#tips--best-practices)

---

## Writer Mode Overview

Writer Mode transforms QuillPilot from an analysis tool into a full-featured writing environment with real-time feedback. Access it by clicking the **✍️ Writer** tab after uploading a document.

### What You Get in Writer Mode

- **Rich text editor** with professional formatting tools
- **Live analysis indicators** showing pacing and sensory detail issues
- **Real-time statistics** (word count, reading time, reading level)
- **Auto-save** protection against lost work
- **Advanced Tools Panel** for deep manuscript analysis

### Writer Mode Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Toolbar: Formatting | Alignment | Insert | View]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Your Document                            │
│                                                             │
│  [Inline spacing indicators]                                │
│  [Sensory detail callouts]                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Word Count: 3,247  |  Reading Time: 13 min  |  Grade: 8.2  │
└─────────────────────────────────────────────────────────────┘
```

---

## The Editor Toolbar

### Text Formatting

| Button | Shortcut   | Description    |
| ------ | ---------- | -------------- |
| **B**  | Cmd/Ctrl+B | Bold text      |
| **I**  | Cmd/Ctrl+I | Italic text    |
| **U**  | Cmd/Ctrl+U | Underline text |
| **S̶**  | —          | Strikethrough  |

### Block Formatting

| Option                | Usage                                      |
| --------------------- | ------------------------------------------ |
| Paragraph             | Normal body text                           |
| Title                 | Centered book/chapter title                |
| Subtitle              | Centered subtitle                          |
| Heading 1-6           | Chapter titles and section headers         |
| Quote                 | Block quotations                           |
| Pull Quote            | Emphasized quotations (centered, bordered) |
| Code Block            | Monospace text                             |
| Footnote              | Reference notes                            |
| Citation              | Bibliography/citation format               |
| **Table of Contents** | TOC placeholder or heading marker          |
| Index                 | Index placeholder                          |
| Figure                | Figure with caption                        |

#### Table of Contents (TOC)

The TOC option in the block format dropdown has two behaviors:

1. **With text selected**: Formats the selected text as a TOC entry heading (styled as Heading 1 with special TOC marker)
2. **Without selection**: Inserts a TOC placeholder that shows where auto-generated TOC will appear on export

**How to use:**

- To mark a chapter title for TOC: Select your chapter heading text → Choose "Table of Contents" from dropdown
- To insert TOC placeholder: Place cursor where you want TOC → Choose "Table of Contents" (no selection)

**Note**: The actual Table of Contents is generated automatically during export based on your Heading 1-6 elements.

### Text Alignment

| Button      | Effect               |
| ----------- | -------------------- |
| ≡ (left)    | Left-align (default) |
| ≡ (center)  | Center text          |
| ≡ (right)   | Right-align          |
| ≡ (justify) | Justify margins      |

### Lists

| Button | Creates        |
| ------ | -------------- |
| •      | Bulleted list  |
| 1.     | Numbered list  |
| ↔      | Indent/outdent |

### Insert Tools

| Button | Inserts                               |
| ------ | ------------------------------------- |
| 🔖     | Bookmark (mark important passages)    |
| 🔗     | Cross-Reference (link related scenes) |
| 📋     | View Bookmarks & References panel     |
| 📷     | Upload or paste image                 |
| ―      | Horizontal rule                       |
| 📊     | Data table                            |

### Bookmarks & Cross-References ⭐ NEW

A powerful system for creative writers to mark important passages and link related scenes.

**Bookmarks (🔖):**

- Mark important passages to return to later
- Color-code by category (plot points, character moments, etc.)
- Click in the panel to jump to any bookmark

**Cross-References (🔗):**

- Link related scenes (foreshadowing, callbacks, parallel moments)
- Connect new passages to existing bookmarks
- Add notes explaining the connection
- Navigate between linked scenes instantly

**How to Use:**

1. **Create a Bookmark:**

   - Select text in your editor (e.g., "He pocketed the old key")
   - Click 🔖 in the toolbar
   - Name it (e.g., "Chekhov's key - Chapter 3")
   - Choose a color for organization
   - Click "Add Bookmark"

2. **Create a Cross-Reference:**

   - Later, select related text (e.g., "The key! He'd almost forgotten...")
   - Click 🔗 in the toolbar
   - Name the connection (e.g., "Key payoff")
   - Select which bookmark this links to
   - Add notes ("Payoff from Ch.3 setup")
   - Click "Add Reference"

3. **Navigate:**
   - Click 📋 to open the Bookmarks & References panel
   - Click any bookmark or reference to jump to that passage
   - Hover to reveal delete button (✕)

**💡 Tips:**

- Use bookmarks for: character introductions, plot setups, key information
- Use cross-references for: foreshadowing payoffs, parallel scenes, thematic echoes
- Color-code bookmarks: gold for plot, blue for character, purple for theme

### View Options

| Button | Function                              |
| ------ | ------------------------------------- |
| 🎯     | Focus Mode (hide distractions)        |
| ⌨️     | Typewriter Mode (center current line) |
| ⏱️     | Word Sprint Timer                     |

### History

| Button | Shortcut         | Function |
| ------ | ---------------- | -------- |
| ↩️     | Cmd/Ctrl+Z       | Undo     |
| ↪️     | Cmd/Ctrl+Shift+Z | Redo     |

**💡 Tip**: QuillPilot maintains a 50-state undo history, so don't worry about experimenting!

---

## Advanced Tools Panel

Access by clicking the **🛠️ Advanced Tools** button. These professional-grade tools help you analyze and improve your manuscript.

> 📖 **For comprehensive tool documentation**, see the [Advanced Tools Guide](./ADVANCED_TOOLS_GUIDE.md) which covers each tool in detail with usage examples, scoring explanations, and troubleshooting.

### Content Generation & Enhancement

#### ✨ AI Writing Assistant

Get intelligent suggestions for improving your prose.

**Modes:**

- **Rephrase**: Generate alternative ways to express your ideas
- **Word Choice**: Find better synonyms and word alternatives
- **Complete**: Get sentence completion suggestions
- **Enhance**: Add sensory details and emotional depth

**How to Use:**

1. Select text in your editor
2. Open Advanced Tools → AI Writing Assistant
3. Choose a mode
4. Click any suggestion to replace your text

**💡 Tips:**

- Use Rephrase when a sentence feels clunky but you can't pinpoint why
- Word Choice is great for reducing repetition
- Enhance works best on action scenes lacking sensory detail

---

#### 💬 Dialogue Enhancer

Analyze dialogue for authenticity and character voice.

**What It Analyzes:**

- **Natural Flow**: Detects stiff or unnatural dialogue
- **Subtext Detection**: Finds moments where characters say less than they mean
- **Voice Consistency**: Ensures each character sounds unique
- **Dialogue Tags**: Flags overused tags and suggests alternatives

**Metrics:**

- Flow Score (0-100%)
- Voice Consistency Score (0-100%)
- Subtext presence indicators
- Tag variety analysis

**💡 Tips:**

- Run this after writing dialogue-heavy scenes
- Pay attention to Voice Consistency if characters blur together
- Subtext is key for tension—aim for characters who don't say exactly what they mean

---

#### 📜 Version History ⭐ NEW

Save snapshots of your document and compare changes over time.

**Features:**

- **Save Snapshots**: Create named versions at any point
- **Compare Drafts**: See additions (green) and deletions (red) side-by-side
- **Restore Versions**: Roll back to any previous snapshot
- **Auto-timestamps**: Know exactly when each version was saved

**How to Use:**

1. Open Advanced Tools → Version History
2. Click "Save Snapshot" to capture current state
3. Add a descriptive name (e.g., "Before killing darlings")
4. Click any version to compare or restore

**💡 Tips:**

- Save a version before major cuts or rewrites
- Name versions descriptively: "Chapter 5 - added flashback"
- Use compare mode to review what changed between drafts

---

#### 💬 Comments & Annotations ⭐ NEW

Leave notes for yourself or beta readers throughout your manuscript.

**Categories:**

- 📝 **General**: General notes and reminders
- 💡 **Suggestion**: Ideas for improvement
- ❓ **Question**: Things to research or verify
- ✏️ **Correction**: Errors to fix

**Features:**

- **Beta Reader Mode**: Toggle to show only comments meant for others
- **Filter by Category**: Focus on one type of comment
- **Resolve Comments**: Mark items as addressed
- **Filter Resolved**: Hide completed items

**How to Use:**

1. Select text you want to annotate
2. Open Advanced Tools → Comments
3. Choose a category and write your note
4. Toggle Beta Reader Mode when sharing with others

**💡 Tips:**

- Use Questions for facts you need to verify later
- Mark suggestions as resolved once you've addressed them
- Beta Reader Mode hides your personal notes when sharing

---

### Structural Analysis Tools

#### 📖 Beat Sheet Generator

Automatically detect story structure and major plot points.

**Supported Structures:**

**Three-Act Structure:**

- Opening
- Inciting Incident
- Lock In (Point of No Return)
- Midpoint
- All Is Lost
- Climax
- Resolution

**Five-Act Structure:**

- Exposition
- Rising Action
- Climax
- Falling Action
- Denouement

**Hero's Journey (12 Stages):**

- Ordinary World → Call to Adventure → Refusal → Meeting the Mentor → Crossing the Threshold → Tests/Allies/Enemies → Approach → Ordeal → Reward → Road Back → Resurrection → Return with Elixir

**What You'll See:**

- Visual timeline showing beat positions
- Pacing breakdown (Act 1/2/3 percentages)
- Confidence scores for each detected beat
- Recommendations for structural improvements

**💡 Tips:**

- Click any beat to navigate to that location in your text
- Missing beats aren't always bad—some stories subvert structure
- Use this to identify if Act 2 is dragging (common issue)

---

#### 👁️ POV Checker

Detect point-of-view inconsistencies and head-hopping.

**Detects:**

- POV shifts between first, second, and third person
- Head-hopping (switching perspective mid-scene)
- Mixing deep POV with distant narration
- Unclear perspective moments

**Metrics:**

- Dominant POV identification
- Consistency score (0-100%)
- Character perspective tracking
- Severity ratings for each issue

**💡 Tips:**

- High consistency scores (90%+) indicate clean POV
- Intentional POV shifts should happen at scene breaks
- Deep POV means readers only know what your POV character knows

---

### Analysis Tools

#### 📊 Readability Metrics

Understand your text's reading level and complexity.

> 📖 **For complete metric details**, see the [Reference Library - Readability Section](./REFERENCE_LIBRARY.md#complete-analysis-metrics-33-total) which covers all 33 analysis dimensions.

**Metrics Explained:**

| Metric               | Range | What It Measures             |
| -------------------- | ----- | ---------------------------- |
| Flesch Reading Ease  | 0-100 | Higher = easier to read      |
| Flesch-Kincaid Grade | 1-18+ | U.S. grade level needed      |
| Gunning Fog Index    | 1-20+ | Years of education needed    |
| SMOG Index           | 1-18+ | Grade for 100% comprehension |

**Target Reading Levels by Genre:**

| Genre              | Target Grade | Flesch Ease |
| ------------------ | ------------ | ----------- |
| YA Fiction         | 6-8          | 70-80       |
| Commercial Fiction | 7-9          | 60-70       |
| Literary Fiction   | 9-12         | 50-65       |
| Children's (MG)    | 4-6          | 80-90       |

**💡 Tips:**

- Most bestsellers score 7th-9th grade level
- High grade levels often mean sentences are too long
- Vary sentence length for better flow, even if it raises the score slightly

---

#### 🚫 Cliché Detector

Find overused phrases and get fresh alternatives.

**Categories:**

- Filler phrases ("at the end of the day")
- Emotional clichés ("heart skipped a beat")
- Descriptive clichés ("eyes like pools")
- Comparisons ("quiet as a mouse")
- Time expressions ("in the nick of time")

**For Each Cliché Found:**

- Original phrase highlighted
- 3-5 alternative suggestions
- Click to replace instantly

**💡 Tips:**

- Not every cliché needs replacing—dialogue can use them naturally
- Focus on narrative clichés first
- Sometimes the "cliché" is intentional voice—trust your instincts

---

#### 💖 Emotion Tracker

Map emotional arcs across your story.

**Tracked Emotions:**
Joy, Anger, Fear, Sadness, Love, Tension, Surprise, Disgust, Hope, Despair

**What You'll See:**

- Emotional arc visualization by chapter/section
- Dominant emotions identified
- Intensity scoring (0-100%)
- High tension point markers
- Emotional variety analysis

**💡 Tips:**

- Stories need emotional variety—all tension is exhausting
- Romance should show love building; thrillers should show fear escalating
- Flat emotional arcs often indicate passive characters

---

#### 🔮 Motif & Symbol Tracker

Identify recurring symbols and thematic elements.

**Tracks:**

- **Symbols**: Light/darkness, water/fire, birds, mirrors, etc.
- **Themes**: Identity, betrayal, redemption, sacrifice, etc.
- **Recurring Phrases**: 3-5 word phrases that repeat
- **Images**: Visual motifs throughout the text

**For Each Motif:**

- Occurrence count
- Locations in text (click to navigate)
- Significance explanation

**💡 Tips:**

- Unconscious repetition often reveals your story's true theme
- Symbols should appear at least 3 times to register with readers
- Track your phrases—repetition can be powerful or annoying

---

## Productivity Features

### 🔥 Writing Streak Tracker

Build momentum with daily writing habits.

**Features:**

- Calendar showing writing days
- Current streak count
- Longest streak record
- Total words tracked
- Motivational messages

**💡 Tip**: Even 100 words counts toward your streak. Show up every day!

---

### 🎯 Goal Setting & Progress

Set and track writing goals.

**Goal Types:**

- **Daily**: Write X words today
- **Weekly**: Complete X words this week
- **Project**: Finish manuscript of X words

**Features:**

- Visual progress bars
- Estimated completion dates
- Multiple simultaneous goals
- Add current session words to any goal

**💡 Tip**: Set achievable daily goals. 500 words/day = 180,000 words/year!

---

### 🎯 Focus Mode

Eliminate distractions for deep writing.

**Location:** Editor toolbar (🎯 button) — see [The Editor Toolbar](#the-editor-toolbar) for all toolbar options.

**What It Hides:**

- Analysis indicators
- Spacing callouts
- Statistics bar
- Everything except your text

**How to Use:** Click the 🎯 button in the editor toolbar to toggle on/off.

**💡 Tip**: Use Focus Mode for first drafts, disable it for revision.

---

### ⌨️ Typewriter Mode

Keep your current line centered on screen.

**Location:** Editor toolbar (⌨️ button) — see [The Editor Toolbar](#the-editor-toolbar) for all toolbar options.

**How It Works:**

- Your cursor line stays vertically centered
- Text scrolls up as you type
- Reduces neck strain from looking at bottom of screen

**💡 Tip**: Combine with Focus Mode for ultimate immersion.

---

### ⏱️ Word Sprint Timer

Timed writing sessions for maximum productivity.

**How to Use:**

1. Click the ⏱️ button
2. Set duration (default: 15 minutes)
3. Write without stopping until timer ends
4. See your stats: words written, words per minute

**💡 Tips:**

- Don't edit during sprints—just write
- 15-20 minute sprints work best for most writers
- Track your WPM to see improvement over time

---

### 🎤 Voice-to-Text

Dictate your story hands-free.

**Supported Browsers:** Chrome, Edge, Safari

**How to Use:**

1. Click the 🎤 button
2. Speak naturally
3. Say "period" or "comma" for punctuation
4. Say "new paragraph" for line breaks

**💡 Tips:**

- Works best in quiet environments
- Great for capturing dialogue naturally
- Edit after—don't worry about perfection while speaking

---

## Character Management

### Adding Characters

1. Click the **👥 Manage Characters** button in Writer Mode
2. Click "Add Character"
3. Fill in details:
   - **Name**: Character's name
   - **Role**: Protagonist, Antagonist, Supporting, etc.
   - **Physical traits**: Appearance details
   - **Personality traits**: Character qualities
   - **Arc notes**: How they change
   - **Relationships**: Connections to other characters

### Character Roles

| Role          | Description                       |
| ------------- | --------------------------------- |
| Protagonist   | Main character driving the story  |
| Antagonist    | Opposition to protagonist's goals |
| Deuteragonist | Secondary main character          |
| Love Interest | Romantic connection               |
| Mentor        | Guide figure                      |
| Sidekick      | Loyal companion                   |
| Foil          | Contrasts with protagonist        |
| Supporting    | Important but not central         |
| Minor         | Brief appearances                 |

### Linking Text to Characters

1. Select text that references a character
2. Choose character from dropdown
3. Click "🔗 Link"

This helps track character appearances and ensures consistency.

**💡 Tip**: Link important character moments—first appearances, key decisions, transformation points.

---

## Export Options

### 📄 PDF Export

**Manuscript Format** (for submissions):

- Courier 12pt font
- Double-spaced
- 1.25" left/right margins
- 1" top/bottom margins
- Automatic page numbers
- Word count on first page

**Standard Format** (for sharing):

- Clean readable format
- Your chosen fonts
- Single or 1.5 spacing

**Optional:** Include analysis summary page with scores and top recommendations.

### 📥 DOCX Export

- Microsoft Word compatible
- Preserves all formatting
- Includes embedded analysis markers (colored backgrounds)
- Ready for further editing

### 🌐 HTML Export

- Self-contained file
- Opens in any browser
- Print-ready styling
- Includes analysis callouts

### 📊 JSON Export

- Complete analysis data
- Machine-readable format
- For tracking progress or building custom reports

---

## Tips & Best Practices

### When to Use Each Tool

**During First Drafts:**

- Focus Mode (hide distractions)
- Word Sprint Timer (build momentum)
- Version History (save before major scenes)

**During Revision:**

- POV Checker (fix perspective issues)
- Dialogue Enhancer (sharpen conversations)
- Cliché Detector (freshen language)
- AI Writing Assistant (rephrase weak passages)

**During Final Polish:**

- Readability Metrics (target your audience)
- Motif Tracker (ensure thematic consistency)
- Emotion Tracker (verify arc works)
- Beat Sheet (confirm structure)

### Keyboard Shortcuts Reference

| Shortcut         | Action         |
| ---------------- | -------------- |
| Cmd/Ctrl+B       | Bold           |
| Cmd/Ctrl+I       | Italic         |
| Cmd/Ctrl+U       | Underline      |
| Cmd/Ctrl+K       | Add Bookmark   |
| Cmd/Ctrl+Z       | Undo           |
| Cmd/Ctrl+Shift+Z | Redo           |
| Cmd/Ctrl+F       | Find & Replace |

### Performance Tips

- Save versions before major edits
- Export regularly as backup
- For very large documents (50k+ words), work in chapters
- Close unused Advanced Tool panels

### Common Issues

**Analysis not updating?**

- Ensure you have 200+ words
- Check that auto-analysis is enabled
- Try clicking "Analyze" manually

**Formatting lost on paste?**

- Use Cmd/Ctrl+Shift+V for plain text paste
- Or paste normally and use "Clear Formatting" button

**Can't find a feature?**

- Most advanced features are in the 🛠️ Advanced Tools panel
- Some features require Premium or Professional tier

---

## Need More Help?

- **[Quick Start Guide](../public/QUICK_START.md)**: Basic getting-started steps for new users
- **[Reference Library](./REFERENCE_LIBRARY.md)**: Complete analysis metrics (33 total), scoring details, and technical specifications
- **[Advanced Tools Guide](./ADVANCED_TOOLS_GUIDE.md)**: In-depth documentation for all advanced writing tools
- **[Writer Productivity Features](./WRITER_PRODUCTIVITY_FEATURES.md)**: Technical details on Focus Mode, Typewriter Mode, Sprint Timer, and more
- **Support**: support@quillpilot.com

---

_Last Updated: November 2025_
