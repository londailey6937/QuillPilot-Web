# Quill Pilot Reference Library

**Complete feature reference and technical documentation**

> 📖 **Related Guides:**
>
> - **Getting Started**: [Quick Start Guide](../public/QUICK_START.md) for new users
> - **Writer Mode**: [Writer's Reference](./WRITERS_REFERENCE.md) for complete editing guide
> - **Advanced Tools**: [Advanced Tools Guide](./ADVANCED_TOOLS_GUIDE.md) for AI Writing Assistant, Beat Sheet, POV Checker, etc.

---

## Table of Contents

1. [Complete Analysis Metrics (33 Total)](#complete-analysis-metrics-33-total)
2. [Auto-Analysis Explained](#auto-analysis-explained)
3. [Spacing Analysis Reference](#spacing-analysis-reference)
4. [Sensory Detail Density Analysis Reference](#sensory-detail-density-analysis-reference)
5. [Export Formats Guide](#export-formats-guide)
6. [Domain Libraries Explained](#domain-libraries-explained)
7. [Concept Matching Strategy](#concept-matching-strategy)
8. [Access Tiers & Features](#access-tiers--features)
9. [Writer Mode Workflow](#writer-mode-workflow)
10. [Color Coding System](#color-coding-system)
11. [Technical Specifications](#technical-specifications)

---

## Complete Analysis Metrics (33 Total)

QuillPilot analyzes your manuscript across **33 different writing dimensions** to provide comprehensive feedback. Here's what each metric measures:

### Core Writing Fundamentals (5 Metrics)

1. **Pacing & Flow** - Paragraph length variety and rhythm

   - Analyzes compact (<60 words), balanced (60-160), and extended (>160 words) paragraphs
   - Target: 40-60% balanced paragraphs with good variety
   - Score: 35-98 based on balance and distribution

2. **Sensory Detail Density** - Immersive sensory language

   - Tracks visual, auditory, tactile, olfactory, and gustatory words
   - Measures percentage of sensory language per paragraph
   - Target: >12% sensory word density

3. **Character Development** - Character arcs and emotional trajectories

   - Tracks all characters and their mention frequency
   - Identifies protagonist(s) and arc types (growth, fall, flat)
   - Provides emotional trajectory charts showing character emotions over time

4. **Theme Depth** - Recurring themes and symbolic patterns

   - Detects 12 theme clusters (identity, power, love, loss, etc.)
   - Tracks theme frequency and intensity
   - Identifies dominant theme and symbolic patterns

5. **Genre Conventions** - Genre-specific tropes and story beats
   - Detects genre (Romance, Thriller, Fantasy, Mystery, SciFi, Horror, etc.)
   - Identifies tropes (e.g., Enemies to Lovers, Ticking Clock, Chosen One)
   - Tracks story beats (Meet Cute, Dark Night of the Soul, etc.)
   - Measures convention adherence vs. subversion

### Prose Quality (7 Metrics)

6. **Word Choice & Variety** - Vocabulary richness

   - Unique words / total words ratio
   - Detects overused words (mentioned >5 times per 1000 words)
   - Target: >25% vocabulary richness

7. **Dialogue & Attribution** - Speaker clarity

   - Counts dialogue lines, tagged vs. untagged
   - Tracks unique speakers
   - Flags unclear speaker attribution

8. **Active Voice Usage** - Sentence strength

   - Detects passive voice patterns ("was/were [verb]")
   - Calculates passive voice percentage
   - Target: <10% passive voice

9. **Adverb Economy** - Verb strength

   - Counts total adverbs and weak adverbs (very, really, quite)
   - Measures density per 1000 words
   - Target: <15 adverbs per 1000 words

10. **Sentence Variety** - Reading rhythm

    - Analyzes sentence length distribution
    - Categorizes as short (<10), medium (10-20), long (>20 words)
    - Target: 30% short, 50% medium, 20% long

11. **Readability** - Audience appropriateness

    - Flesch-Kincaid grade level
    - Flesch Reading Ease score
    - Average sentence length and syllables per word
    - Target: 8th-10th grade for most fiction

12. **Emotional Pacing** - Tension and release rhythm
    - Tracks emotional intensity throughout manuscript
    - Identifies peaks, valleys, and emotional progression
    - Maps dominant emotions by section

### Advanced Narrative Analysis (6 Metrics)

13. **POV Consistency** - Point of view control

    - Detects POV shifts and potential head-hops
    - Identifies dominant POV (first, third limited, third omniscient)
    - Counts perspective changes

14. **Originality (Cliché Avoidance)** - Fresh language

    - Detects 100+ common clichés
    - Categorizes by type (metaphors, descriptions, dialogue)
    - Measures density per 1000 words

15. **Direct Prose (Filtering Words)** - Narrative immediacy

    - Detects filter words (saw, heard, felt, seemed, realized)
    - Counts by type
    - Target: <10 per 1000 words for immersive prose

16. **Backstory Balance** - Flashback management

    - Identifies backstory sections
    - Calculates percentage of total manuscript
    - Flags excessive backstory in opening chapters
    - Target: <20% overall, <15% in first chapters

17. **Dialogue-to-Narrative Balance** - Genre-appropriate pacing

    - Measures dialogue %, description %, action %
    - Compares to genre targets (e.g., Thriller: 40% dialogue, 30% description, 30% action)
    - Provides genre-specific recommendations

18. **Scene vs Sequel Structure** - Story rhythm
    - Identifies scenes (action/conflict) vs. sequels (reflection/decision)
    - Calculates scene:sequel ratio
    - Measures average lengths
    - Target: 2-3:1 scene:sequel ratio for most fiction

### Deep Fiction Analysis (8 Metrics)

19. **Conflict Tracking** - Tension maintenance

    - Detects internal, external, and interpersonal conflicts
    - Measures conflict density per 1000 words
    - Calculates average intensity
    - Identifies low-conflict sections

20. **Sensory Balance** - Multi-sensory immersion
    - Tracks sight, sound, touch, smell, taste details
    - Calculates percentage for each sense
    - Target: Balanced sensory palette (not 80%+ visual)

21-32. **12 Core Fiction Elements** - Narrative completeness
Each scored individually (0-100): - **Plot** - Story structure and progression - **Setting** - World-building and atmosphere - **Dialogue** - Conversation quality and purpose - **Description** - Scene and character visualization - **Conflict** - Obstacles and tension - **Stakes** - What's at risk / consequences - **Voice** - Narrative style and tone - **Subtext** - Underlying meaning and implications - **Foreshadowing** - Setup and payoff - **Symbolism** - Deeper meaning layers - **Imagery** - Vivid sensory writing - **Resonance** - Emotional impact and memorability

33. **Fiction Elements Balance** - Overall narrative health
    - Measures balance across all 12 elements
    - Identifies strong elements and weak areas
    - Provides holistic narrative assessment

---

## Auto-Analysis Explained

### What Triggers Auto-Analysis?

Auto-analysis runs automatically in two scenarios:

#### 1. **On Document Upload** (All Tiers)

When you upload a document with 200+ words:

- **Free Tier**: Runs basic analysis (Pacing & Sensory Detail Density only)
- **Premium/Professional**: Runs full 33-metric analysis

#### 2. **While Typing in Writer Mode** (Professional Tier Only)

When auto-analysis toggle is enabled:

- Waits 3 seconds after you stop typing
- Requires minimum 200 words
- Re-runs full analysis with updated text
- Updates inline indicators and analysis panel in real-time

### Why the 3-Second Delay?

The debounced delay prevents performance issues:

- Running 33 analyses per keystroke would freeze the editor
- 3 seconds ensures you've paused, not just mid-sentence
- Balances responsiveness with system performance

### What You'll See After Auto-Analysis

**In the Editor:**

- Color-coded paragraph spacing indicators
- Yellow callout boxes for show-vs-tell suggestions
- Inline recommendations with priority badges

**In Analysis Panel:**

- 33 writing metrics with scores
- Character list with emotional arcs
- Theme clusters detected
- Genre tropes identified
- Specific recommendations with examples
- "Jump to location" links for each issue

### Enabling/Disabling Auto-Analysis

Toggle the "Auto-analyze" checkbox near the Analyze button:

- ✅ **On**: Re-analyzes 3 seconds after typing stops
- ❌ **Off**: Manual analysis only (click Analyze button)

**Note:** Auto-analysis is only available in Professional tier with Writer Mode access.

---

## Writing Metrics Explained (All 33 Metrics in Detail)

The Analysis Panel displays **Writing Metrics** - here's what each one measures and how to improve it:

### 📊 Core Story Fundamentals

#### 1. **Pacing & Flow**

**What it measures:** Paragraph length variety and narrative rhythm

**How it's scored:**

- Analyzes compact (<60 words), balanced (60-160), extended (>160 words) paragraphs
- Best scores: 40-60% balanced paragraphs with good variety
- Range: 35-98

**What you'll see:**

- Number of compact, balanced, and extended paragraphs
- Distribution analysis
- **Inline pill indicators** next to each paragraph in Writer Mode:
  - **"Expand detail"** - paragraph < 60 words (compact, may feel rushed)
  - **"On target"** - paragraph 60-160 words (balanced, good pacing)
  - **"Consider splitting"** - paragraph > 160 words (too long, may overwhelm readers)

**How to improve:**

- Mix short punchy paragraphs with longer flowing ones
- Break up walls of text >160 words
- Expand thin paragraphs <60 words with details
- Aim for variety: action scenes use shorter paragraphs, reflection uses longer

#### 2. **Sensory Detail Density**

**What it measures:** Immersive sensory language across all five senses

**How it's scored:**

- Tracks visual, auditory, tactile, olfactory, and gustatory words
- Measures percentage of sensory words in each paragraph
- Target: >12% sensory word density
- Score based on % of paragraphs below threshold

**What you'll see:**

- Yellow callout boxes on low-sensory paragraphs (<12% density)
- Specific sense recommendations (e.g., "No visual details found")
- Density percentages and missing senses identified

**Sensory word categories:**

1. **Visual** (200+ words): see, look, watch, gaze, color, bright, dark, shimmer, gleam, red, blue, pale, vivid, shadow
2. **Auditory** (150+ words): hear, listen, sound, voice, echo, whisper, shout, scream, buzz, click, crash, silent, loud
3. **Olfactory** (50+ words): smell, scent, aroma, stench, sniff, fresh, musty, smoky, floral, earthy
4. **Tactile** (100+ words): feel, touch, smooth, rough, soft, hard, warm, cold, wet, dry, pain, ache, grasp, stroke
5. **Gustatory** (40+ words): taste, flavor, lick, sweet, salty, sour, bitter, delicious, eat, drink

**How to improve:**

- Add visual details: colors, shapes, movement, light/shadow
- Include sounds: dialogue, environmental noise, silence
- Use tactile sensations: temperature, texture, physical feeling
- Incorporate smells: especially for memory and atmosphere
- Mention taste: in eating scenes or metaphorically
- Aim for 3-5 sensory details per paragraph in descriptive passages
- Use sensory language in action scenes to ground readers

#### 3. **Character Development**

**What it measures:** Character arcs, emotional trajectories, and presence

**How it's scored:**

- Tracks all character mentions
- Identifies protagonist(s) and arc types
- Measures emotional progression
- Range: 0-100 based on arc depth

**What you'll see:**

- Total characters detected
- Protagonist identification
- Character arcs: Growth, Fall, or Flat
- Emotional trajectory charts

**How to improve:**

- Give protagonists clear goals and obstacles
- Show character change through actions, not just statements
- Track emotional progression from beginning to end
- Ensure supporting characters have purpose beyond serving plot

#### 4. **Theme Depth**

**What it measures:** Recurring themes and symbolic patterns

**How it's scored:**

- Detects 12 theme clusters (identity, power, love, loss, etc.)
- Tracks frequency and intensity
- Identifies dominant theme
- Range: 0-100 based on thematic richness

**What you'll see:**

- Primary themes detected
- Dominant theme
- Symbolic patterns found
- Theme frequency and intensity percentages

**How to improve:**

- Weave themes through character decisions and plot events
- Use symbolism to reinforce themes subtly
- Revisit themes in different contexts
- Don't state themes explicitly - let them emerge

#### 5. **Genre Conventions**

**What it measures:** Genre-specific tropes and story beats

**How it's scored:**

- Detects genre (Romance, Thriller, Fantasy, Mystery, etc.)
- Identifies tropes (Enemies to Lovers, Ticking Clock, Chosen One)
- Tracks story beats completion
- Measures convention adherence vs. subversion
- Range: 0-100

**What you'll see:**

- Genre identification
- Convention adherence score
- Subversion score
- Trope overuse warning
- Detected tropes with strength percentages
- Story beats present vs. missing

**How to improve:**

- Include expected genre beats readers anticipate
- Subvert 1-2 tropes to feel fresh
- Don't overuse the same trope repeatedly
- Balance meeting expectations with surprising readers

### ✍️ Prose Quality Metrics

#### 6. **Word Choice & Variety**

**What it measures:** Vocabulary richness and word repetition

**How it's scored:**

- Unique words ÷ total words × 300 (capped at 100)
- Flags overused words (>5 times per 1000 words)
- Target: >25% vocabulary richness

**What you'll see:**

- Total and unique word counts
- Vocabulary richness percentage
- List of overused words

**How to improve:**

- Use a thesaurus for overused words
- Vary description methods
- Don't repeat distinctive words close together
- Build vocabulary through reading

#### 7. **Dialogue & Attribution**

**What it measures:** Speaker clarity in dialogue

**How it's scored:**

- Tagged lines ÷ total dialogue lines × 100
- Tracks unique speakers
- Range: 0-100 (50 if no dialogue)

**What you'll see:**

- Total dialogue lines
- Tagged vs. untagged lines
- Number of unique speakers

**How to improve:**

- Add dialogue tags every 3-4 exchanges
- Use action beats to identify speakers
- Vary tags beyond "said" occasionally
- Ensure readers always know who's speaking

#### 8. **Active Voice Usage**

**What it measures:** Sentence strength and directness

**How it's scored:**

- Detects passive voice ("was/were [verb]")
- Score: 100 - (passive % × 2)
- Target: <10% passive voice

**What you'll see:**

- Passive voice count and percentage
- Rating: Excellent (<10%), Good (10-20%), Needs Work (>20%)

**How to improve:**

- Change "The door was opened by John" to "John opened the door"
- Put subject before verb
- Use passive voice intentionally for specific effects
- Strong subjects + strong verbs = active voice

#### 9. **Adverb Economy**

**What it measures:** Verb strength and modifier overuse

**How it's scored:**

- Score: 100 - (adverb density × 2)
- Flags weak adverbs (very, really, quite, etc.)
- Target: <15 per 1000 words

**What you'll see:**

- Total adverbs
- Density per 1000 words
- Weak adverb count

**How to improve:**

- Replace "ran quickly" with "sprinted"
- Replace "very big" with "enormous"
- Cut weak intensifiers (very, really, quite)
- Use strong verbs that don't need modification

#### 10. **Sentence Variety**

**What it measures:** Reading rhythm and flow

**How it's scored:**

- Analyzes short (<10), medium (10-20), long (>20 words)
- Calculates variety score based on distribution
- Target: 30% short, 50% medium, 20% long

**What you'll see:**

- Average sentence length
- Counts for short, medium, long sentences
- Variety score

**How to improve:**

- Mix sentence lengths intentionally
- Use short sentences for impact: "He ran."
- Use long sentences for complexity and flow
- Vary especially in dialogue and action

#### 11. **Readability**

**What it measures:** Audience appropriateness

**How it's scored:**

- Flesch-Kincaid grade level
- Flesch Reading Ease (0-100)
- Penalizes being too complex OR too simple
- Target: 8th-10th grade for most fiction

**What you'll see:**

- Grade level
- Reading ease score
- Interpretation
- Average sentence length
- Average syllables per word

**How to improve:**

- Too complex? Shorten sentences, simplify vocabulary
- Too simple? Add sentence variety, richer vocabulary
- Match target audience reading level
- Test with actual readers

#### 12. **Emotional Pacing**

**What it measures:** Tension and release rhythm

**How it's scored:**

- Tracks emotional intensity throughout
- Identifies peaks, valleys, flat sections
- Range: Based on average intensity × 2

**What you'll see:**

- Average emotional intensity
- Number of emotional peaks and valleys
- Dominant emotions
- Pacing issues flagged

**How to improve:**

- Alternate high-tension and low-tension scenes
- Build to emotional peaks gradually
- Give readers breathing room after intense scenes
- Vary emotional intensity - not all high or all flat

### 🎯 Advanced Narrative Techniques

#### 13. **POV Consistency**

**What it measures:** Point of view control and perspective shifts

**How it's scored:**

- Tracks POV shifts and head-hops
- Identifies dominant POV
- Range: 0-100 based on consistency

**What you'll see:**

- Dominant POV (first, third limited, omniscient)
- Number of POV shifts
- Consistency score
- Potential head-hop locations

**How to improve:**

- Stick to one character's perspective per scene
- Use scene breaks for POV changes
- Avoid "head-hopping" mid-scene
- Be intentional about omniscient narrative

#### 14. **Originality (Cliché Avoidance)**

**What it measures:** Fresh vs. overused language

**How it's scored:**

- Detects 100+ common clichés
- Score: 100 - (density × 20)
- Target: <5 clichés per manuscript

**What you'll see:**

- Cliché count and density
- Most common cliché categories
- Specific phrases flagged

**How to improve:**

- Replace "white as snow" with unique comparisons
- Find fresh ways to express ideas
- Avoid tired metaphors and descriptions
- Create original imagery

#### 15. **Direct Prose (Filtering Words)**

**What it measures:** Narrative immediacy vs. distance

**How it's scored:**

- Detects filter words (saw, heard, felt, seemed, realized)
- Score: 100 - (density × 5)
- Target: <10 per 1000 words

**What you'll see:**

- Filtering word count and density
- Most common filter types
- Direct vs. filtered prose rating

**How to improve:**

- Change "She saw the door open" to "The door opened"
- Change "He heard a noise" to "A crash echoed"
- Remove perception filters for immersion
- Show events directly, not through character perception layer

#### 16. **Backstory Balance**

**What it measures:** Flashback management and pacing

**How it's scored:**

- Identifies backstory sections
- Score: 100 - (percentage × 2)
- Target: <20% overall, <15% in opening

**What you'll see:**

- Number of backstory sections
- Total backstory percentage
- Opening chapters backstory percentage
- Heavy backstory warnings

**How to improve:**

- Weave backstory gradually through dialogue
- Don't dump backstory in opening chapters
- Reveal past only when relevant to present
- Use flashbacks sparingly and purposefully

#### 17. **Dialogue-to-Narrative Balance**

**What it measures:** Genre-appropriate content mix

**How it's scored:**

- Measures dialogue %, description %, action %
- Compares to genre targets
- Range: Based on deviation from targets

**What you'll see:**

- Current percentages for each type
- Genre-specific targets
- Balance rating

**How to improve:**

- Thriller: 40% dialogue, 30% description, 30% action
- Literary: 30% dialogue, 50% description, 20% action
- Romance: 50% dialogue, 30% description, 20% action
- Match your genre expectations

#### 18. **Scene vs Sequel Structure**

**What it measures:** Action/reflection rhythm (Scene-Sequel units)

**How it's scored:**

- Identifies scenes (conflict/action) vs. sequels (reflection/decision)
- Calculates ratio and averages
- Target: 2-3:1 scene:sequel ratio

**What you'll see:**

- Scene count
- Sequel count
- Scene:sequel ratio
- Average lengths for each

**How to improve:**

- Scene: Goal → Conflict → Disaster
- Sequel: Reaction → Dilemma → Decision
- Follow action scenes with reflection moments
- Don't skip emotional processing

### 🔍 Deep Fiction Analysis

#### 19. **Conflict Tracking**

**What it measures:** Tension maintenance throughout

**How it's scored:**

- Detects internal, external, interpersonal conflicts
- Base 40 + density×10 + intensity/2
- Identifies low-conflict sections

**What you'll see:**

- Total conflicts
- Types: Internal, External, Interpersonal
- Conflict density per 1000 words
- Average intensity
- Low-conflict section warnings

**How to improve:**

- Include conflict in every scene
- Vary conflict types
- Escalate conflicts progressively
- Don't let tension drop for too long

#### 20. **Sensory Balance**

**What it measures:** Multi-sensory immersion depth

**How it's scored:**

- Tracks sight, sound, touch, smell, taste
- Rates balance (Excellent/Good/Visual-heavy)
- Penalizes >60% visual

**What you'll see:**

- Total sensory details
- Percentage for each sense
- Balance rating

**How to improve:**

- Add sounds: dialogue, ambient noise, music
- Add textures: rough wood, smooth silk
- Add smells: cooking, perfume, decay
- Add tastes when relevant
- Don't rely solely on visual description

#### 21-32. **12 Core Fiction Elements**

Each element scored 0-100 individually:

**21. Plot** - Story structure and causality

- Events build on each other logically
- Clear beginning, middle, end
- Cause and effect relationships

**22. Setting** - World-building and atmosphere

- Vivid sense of place
- Consistent world rules
- Atmosphere matches tone

**23. Dialogue** - Conversation quality

- Sounds natural and purposeful
- Reveals character
- Advances plot or deepens relationships

**24. Description** - Scene visualization

- Paints pictures without slowing pacing
- Uses specific details
- Engages multiple senses

**25. Conflict** - Obstacles and tension

- Present in every scene
- Escalates toward climax
- Multiple conflict types

**26. Stakes** - What's at risk

- Clear consequences
- Personal significance to protagonist
- Escalating importance

**27. Voice** - Narrative style

- Distinctive tone
- Consistent throughout
- Matches genre and character

**28. Subtext** - Underlying meaning

- Says one thing, means another
- Implications beyond surface
- Emotional undercurrents

**29. Foreshadowing** - Setup and payoff

- Early hints of later events
- Satisfying revelations
- Fair to readers

**30. Symbolism** - Deeper meaning layers

- Objects/events represent themes
- Patterns reinforce meaning
- Not heavy-handed

**31. Imagery** - Vivid sensory writing

- Concrete specific details
- Fresh comparisons
- Evocative language

**32. Resonance** - Emotional impact

- Memorable moments
- Emotional authenticity
- Reader connection

#### 33. **Fiction Elements Balance**

**What it measures:** Overall narrative health

**How it's scored:**

- Calculates balance across all 12 elements
- Identifies strongest and weakest areas
- Range: 0-100

**What you'll see:**

- Overall balance score
- Strong elements list
- Weak elements list

**How to improve:**

- Focus on weakest elements first
- Don't let one element dominate others
- Balanced stories feel more complete
- Maintain strengths while improving weaknesses

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

## Sensory Detail Density Analysis Reference

### What is Sensory Detail Density?

**Sensory detail density** measures the percentage of sensory words in your prose that create immersive, concrete experiences for readers. Rather than telling readers what happens, sensory details show through sight, sound, smell, touch, and taste.

### Five Sensory Categories (540+ Words Tracked)

The analyzer tracks sensory language across all five senses:

| Sense Category           | Word Count | Example Words                                    |
| ------------------------ | ---------- | ------------------------------------------------ |
| 👁️ **Visual (Sight)**    | 200+ words | shimmer, gleaming, shadowy, vibrant, translucent |
| 👂 **Auditory (Sound)**  | 150+ words | whisper, thunder, crackling, melodic, resonant   |
| 👃 **Olfactory (Smell)** | 50+ words  | fragrant, musty, acrid, earthy, pungent          |
| ✋ **Tactile (Touch)**   | 100+ words | rough, silky, cold, prickly, clammy              |
| 👅 **Gustatory (Taste)** | 40+ words  | bitter, sweet, tangy, savory, bland              |

### Density Thresholds

Each paragraph is analyzed for sensory word density:

| Density Range | Priority Level  | Badge Color | Meaning                                                   |
| ------------- | --------------- | ----------- | --------------------------------------------------------- |
| **<5%**       | High Priority   | 🔴 Red      | Very low sensory detail, needs concrete descriptions      |
| **5-8%**      | Medium Priority | 🟡 Orange   | Low sensory detail, consider adding more sensory language |
| **8-12%**     | Low Priority    | ⚪ Gray     | Moderate sensory detail, could benefit from enhancement   |
| **>12%**      | Good            | ✅ Green    | Strong sensory engagement                                 |

**Target**: Aim for at least 12% sensory word density across your manuscript. Descriptive passages may reach 15-20%, while dialogue-heavy scenes naturally have lower density.

### How Sensory Detail Scores Are Calculated

**Score Range: 0-100**

Score is based on the ratio of paragraphs needing more sensory details:

- **95 (Excellent)**: <10% of paragraphs need improvement
- **85 (Very Good)**: 10-20% of paragraphs need improvement
- **75 (Good)**: 20-30% of paragraphs need improvement
- **65 (Fair)**: 30-40% of paragraphs need improvement
- **55 (Needs Work)**: 40-50% of paragraphs need improvement
- **45 (Poor)**: >50% of paragraphs need improvement

### Sensory Detail Callouts Structure

When you see a yellow callout box in Writer Mode or exports, it contains:

1. **Icon + Title**: Sensory detail alert with priority level
2. **Reason**: Which senses are missing (e.g., "Missing auditory, olfactory, and tactile details")
3. **Context**: The paragraph lacking sensory richness
4. **Current Density**: Percentage of sensory words in the paragraph
5. **Suggested Action**: Specific recommendation to add sensory details from missing categories

**Pro Tip**: A well-rounded scene engages multiple senses, not just sight. Try adding sound, smell, or tactile details to create immersive experiences.

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
- Sensory detail callouts inline
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
- ✅ Mode-aware export (Writer vs Analysis)
- ✅ **Automatic Table of Contents** with page numbers
- ✅ Professional formatting

**Export Modes:**

| Mode              | When                         | Output                                                      |
| ----------------- | ---------------------------- | ----------------------------------------------------------- |
| **Writer Mode**   | Exporting from Writer view   | Clean Word document (no analysis, no highlights)            |
| **Analysis Mode** | Exporting from Analysis view | Full document with analysis summary, scores, and highlights |

**Table of Contents (Auto-Generated):**

- Automatically included if document has 3+ headings or a TOC placeholder
- Includes all H1, H2, and H3 headings with page references
- Clickable links to jump to sections
- Word prompts to update page numbers when opened

**Analysis Mode Contains:**

- Document title
- Table of Contents (if applicable)
- Analysis summary with colored scoring
- Spacing indicators (blue/orange/red shaded paragraphs)
- Sensory detail callouts (yellow shaded boxes)
- Full chapter text

**Writer Mode Contains:**

- Document title
- Table of Contents (if applicable)
- Clean, formatted text only
- No analysis metrics or highlights
- Ready for submission or further editing

**Color Coding (Analysis Mode only):**

- Blue background = Good spacing
- Orange background = Compact spacing warning
- Red background = Extended spacing warning
- Yellow background = Sensory detail suggestion

**How to Use:**

1. Switch to your desired view mode (Writer or Analysis)
2. Click "📄 Export DOCX" button (Premium/Pro only)
3. Open in Microsoft Word
4. When prompted, click "Yes" to update fields (populates TOC page numbers)
5. Edit directly in Word
6. Save or share as needed

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
- ✅ Sensory detail density analysis (full)
- ✅ Upload DOCX/TXT files
- ✅ View analysis dashboard
- ✅ Access all built-in domains
- ✅ **Save up to 3 analyzed documents** (requires free account)
- ✅ Read-only document viewer
- ❌ No exports (HTML/DOCX/JSON)
- ❌ No Writer Mode (no editing capabilities)
- ❌ No rich text editor
- ❌ No custom domains
- ❌ Limited to spacing + sensory detail density only

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
- Live sensory detail callouts appear inline
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

1. **Upload a document** (DOCX or TXT)
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
│  [Edit your text here...]  │  • Sensory Detail Alerts │
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
- Toggle sensory detail visual callouts on/off
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
- Single-slot autosave stored in browser localStorage (`quillpilot_autosave`)
- Export with full formatting preserved

#### Autosave Behavior & Recovery

- Only the most recent chapter snapshot is stored. Each new edit replaces the previous `quillpilot_autosave` entry, so keep manual exports for critical drafts.
- Autosave lives entirely in the current browser profile. Closing or restarting the browser keeps the snapshot unless site data is cleared.
- To skip a stale snapshot, click "Dismiss" on the restore prompt; this writes a skip token so the same draft will not prompt again.
- Multiple drafts are not retained—use **Save Analysis**, **Export DOCX/HTML/JSON**, or duplicate the browser tab before starting a new document if you need separate backups.

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

### Sensory Detail Callouts

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

| Format         | Extension | Max Size | Notes                       |
| -------------- | --------- | -------- | --------------------------- |
| Microsoft Word | `.docx`   | 200 MB   | Tested up to 800-1200 pages |
| Plain Text     | `.txt`    | 200 MB   | Simple text files           |

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

**Q: Why is my sensory detail score low?**
A: Common causes:

- Telling emotions instead of showing reactions
- Lack of sensory details (sight, sound, smell, touch, taste)
- Character traits stated rather than demonstrated
- Summarizing events instead of dramatizing scenes

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

**Q: What file formats are supported?**
A: DOCX (Microsoft Word) and TXT (plain text) formats are supported. Markdown (.md) files are also accepted.

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
