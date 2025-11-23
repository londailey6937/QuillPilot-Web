# Story IQ - Creative Writing Analysis App

## Overview

Clone of Tome IQ adapted for creative writers. Analyzes manuscripts for story elements like character development, theme consistency, pacing, show vs tell, and dialogue quality.

## Core Architecture (Keep As-Is)

- ✅ **Document processing pipeline** - Already handles DOCX, paste, HTML
- ✅ **Worker-based analysis** - Perfect for long documents (novels, novellas)
- ✅ **Card-based UI system** - Modular, easy to swap analysis types
- ✅ **Supabase auth + storage** - Works for any content type
- ✅ **Tiered pricing model** - Same free/paid structure applies
- ✅ **Export system** - DOCX/HTML reports work for any analysis

## Domain Detection (Replace)

### Current System

Detects: Math, Science, Computer Science, History, Literature, Business, etc.

### New Creative Writing System

**Genre Detection:**

- Fantasy (wizard, magic, dragon, quest, realm, spell)
- Mystery (detective, clue, murder, suspect, investigation)
- Romance (love, heart, kiss, relationship, passion)
- Sci-Fi (spaceship, alien, planet, technology, future, robot)
- Thriller (danger, chase, escape, threat, suspense)
- Literary Fiction (introspection, memory, reflection, identity)
- Historical Fiction (era markers, historical figures, period details)
- Horror (terror, darkness, monster, scream, fear)

**Implementation:** Update `detectDomain()` in `AnalysisEngine.ts` with genre keywords

## Analysis Engine (Replace Core Logic)

### Replace Existing Educational Analysis

**Current Tome IQ Metrics:**

- Prerequisite checking
- Dual coding (text + visuals)
- Spacing patterns
- Concept density
- Missing examples

### New Story IQ Metrics

#### 1. Character Analysis

- **Character Introductions**: Track first mentions, introduction clarity
- **Character Development**: Measure character change across chapters
- **Voice Consistency**: Each character's dialogue/thought patterns
- **Protagonist/Antagonist Balance**: Screen time, importance weighting
- **Character Arc Tracking**: Beginning → middle → end state comparison
- **Proper Noun Extraction**: Identify all character names automatically

#### 2. Theme Analysis

- **Theme Introduction**: When themes first appear
- **Thematic Reinforcement**: Theme density across sections
- **Consistency Check**: Theme presence throughout manuscript
- **Symbolism Detection**: Repeated objects, colors, imagery
- **Message Clarity**: How explicitly themes are stated
- **Subtext Patterns**: Implied vs stated meaning

#### 3. Tone & Voice

- **Tone Consistency**: Mood shifts across chapters
- **Voice Distinctiveness**: Author voice strength
- **Mood Patterns**: Emotional trajectory mapping
- **Perspective Shifts**: POV consistency checking
- **Register Analysis**: Formal/informal language balance
- **Atmosphere Tracking**: Setting mood consistency

#### 4. Story Structure

- **Plot Pacing**: Sentence/paragraph length analysis
  - Fast: Short sentences, active verbs
  - Slow: Long sentences, descriptive passages
- **Scene Transitions**: Chapter/section flow quality
- **Tension Curves**: Build-release patterns
- **Hook Effectiveness**: Opening strength metrics
- **Act Structure**: Three-act or five-act breakdown
- **Chapter Balance**: Length consistency, cliffhangers

#### 5. Show vs Tell

- **Sensory Detail Density**: Five senses usage frequency
- **Action vs Description Ratio**: Active vs passive construction
- **Dialogue Balance**: Dialogue vs narrative proportion
- **Emotional Showing**: "He felt angry" vs "His fists clenched"
- **Telling Indicators**: Flag phrases like "felt", "realized", "thought"
- **Visual Scene Building**: Concrete vs abstract language

#### 6. Dialogue Quality

- **Attribution Patterns**: "Said" vs alternatives frequency
- **Dialogue Tag Variety**: Creative vs simple tags
- **Conversation Realism**: Natural speech patterns
- **Character Voice in Dialogue**: Distinct speaking styles
- **Subtext in Dialogue**: What's unsaid
- **Dialogue to Narrative Ratio**: Balance check

## Concept Library Replacement

### Current Educational Libraries

- `ConceptLibraryMath.ts`
- `ConceptLibraryScience.ts`
- `ConceptLibraryComputerScience.ts`
- etc.

### New Creative Writing Libraries

#### 1. CreativeElementsLibrary.ts

```typescript
{
  themes: [
    "redemption", "coming-of-age", "love vs duty", "good vs evil",
    "man vs nature", "identity", "sacrifice", "revenge", "justice"
  ],

  archetypes: [
    "hero", "mentor", "threshold guardian", "herald", "shapeshifter",
    "shadow", "ally", "trickster", "innocent", "sage"
  ],

  plotDevices: [
    "MacGuffin", "red herring", "Chekhov's gun", "deus ex machina",
    "in medias res", "flashback", "foreshadowing", "cliffhanger"
  ],

  conflicts: [
    "person vs self", "person vs person", "person vs society",
    "person vs nature", "person vs technology", "person vs fate"
  ]
}
```

#### 2. GenreConventions.ts

```typescript
{
  fantasy: {
    required: ["magic system", "worldbuilding", "quest structure"],
    common: ["chosen one", "mentor death", "power discovery"],
    avoid: ["info dumps", "deus ex machina"]
  },

  mystery: {
    required: ["clues", "red herrings", "detective/protagonist"],
    common: ["locked room", "least likely suspect", "revelation scene"],
    avoid: ["solution from nowhere", "unsolvable mysteries"]
  },

  romance: {
    required: ["meet cute", "conflict", "happy ending"],
    common: ["misunderstanding", "external obstacle", "grand gesture"],
    avoid: ["miscommunication as only conflict", "toxic relationships normalized"]
  }
}
```

#### 3. CharacterArchetypes.ts

Common character types and their typical traits, arcs, relationships

#### 4. StoryStructures.ts

- Three-Act Structure
- Hero's Journey (12 stages)
- Save the Cat (15 beats)
- Five-Act Structure
- Seven-Point Story Structure
- Freytag's Pyramid

## UI Cards Transformation

### Card Mapping (Old → New)

#### Free Tier Cards

**1. Spacing Analysis → Pacing Analysis**

```
Current: Checks for compact/balanced/extended spacing
New: Fast/Slow/Balanced pacing
- Fast sections: Short sentences, action verbs, dialogue
- Slow sections: Long sentences, descriptions, introspection
- Visual: Timeline with pacing waves
```

**2. Dual Coding Suggestions → Show vs Tell Indicators**

```
Current: Suggests adding visuals/diagrams
New: Flags "telling" phrases, suggests showing alternatives
- Highlight: "She felt angry" → Suggest: "Her fists clenched"
- Highlight: "The room was messy" → Suggest: "Clothes covered the floor"
- Inline suggestions in right margin (same position as current dual-coding)
```

**3. Concept Overview → Character Overview**

```
Current: Lists concepts extracted from text
New: Lists all characters with:
- First appearance location
- Total mentions count
- Click to highlight all mentions
- Scene presence timeline
```

#### Premium Cards

**4. Prerequisite Order Check → Character Arc Timeline**

```
Current: Checks concept prerequisites
New: Tracks character state changes
- Beginning state
- Mid-story development
- Ending state
- Flags: Characters who don't change, inconsistent behavior
```

**5. Concept Relationships → Character Relationship Map**

```
Current: Shows concept connections (not implemented, just mockup)
New: Interactive character relationship diagram
- Nodes: Characters
- Lines: Relationships (ally, enemy, family, romance)
- Conflicts visualization
- Relationship arcs over time
```

**6. 10-Principle Analysis → Story Elements Analysis**

```
New premium analysis:
- Character Development Score
- Theme Consistency Score
- Pacing Effectiveness Score
- Dialogue Quality Score
- Show vs Tell Ratio
- Structure Adherence Score
- Tone Consistency Score
- Voice Distinctiveness Score
- Emotional Arc Score
- Genre Convention Score
```

## Branding Changes

### Name Options

1. **Story IQ** (preferred - matches Tome IQ pattern)
2. Manuscript IQ
3. Draft Doctor
4. Narrative IQ
5. Fiction IQ
6. Plot Pulse

### Tagline Options

1. "Cognitive Science for Creative Writing"
2. "Learn the Science of Storytelling"
3. "Write Better Stories, Backed by Science"
4. "Story Analysis Meets Learning Science"

### Logo Adaptation

- Keep animated network style
- Change colors to creative palette
- Replace book icon with:
  - Quill + neuron combination
  - Open book with neural connections
  - Brain made of story elements

### Color Palette Options

**Option A: Keep Academic Feel**

- Tome Orange (#ef8432) + Navy (#2c3e50)
- Professional, trustworthy
- Shows connection to Tome IQ

**Option B: Creative Rebrand**

- Deep Purple (#8b5cf6) + Teal (#14b8a6)
- Creative, artistic feel
- Keep cream backgrounds (#fef5e7)
- Use purple for highlights instead of orange

**Recommendation:** Start with Option A for faster launch, can rebrand later

## Implementation Roadmap

### Phase 1: Clone & Setup (1 week)

```bash
# Clone repository
git clone your-repo story-iq
cd story-iq

# Rename project
- Update package.json: "story-iq"
- Update index.html: <title>Story IQ</title>
- Find/replace: "Tome IQ" → "Story IQ"
- Update vercel.json domain config
```

**Files to modify:**

- `/package.json` - name, description
- `/index.html` - title, meta description
- `/src/components/AnimatedLogo.tsx` - logo text
- `/src/components/ChapterCheckerV2.tsx` - all UI text
- `/docs/*` - all documentation
- `/README.md` - project description

### Phase 2: Genre Detection (1 week)

**Modify:** `/src/components/AnalysisEngine.ts`

```typescript
// Replace detectDomain() function
export function detectGenre(text: string): string | null {
  const genres = {
    fantasy: ["wizard", "magic", "dragon", "spell", "wand", "quest", "realm"],
    mystery: [
      "detective",
      "clue",
      "murder",
      "suspect",
      "investigation",
      "alibi",
    ],
    romance: ["love", "heart", "kiss", "passion", "relationship", "soulmate"],
    scifi: ["spaceship", "alien", "planet", "robot", "galaxy", "technology"],
    thriller: ["danger", "chase", "escape", "threat", "weapon", "pursuit"],
    horror: ["terror", "scream", "monster", "darkness", "blood", "fear"],
  };

  // Count keyword matches, return genre with most hits
}
```

**Update UI:**

- Domain selector dropdown → Genre selector
- Add genre icons (🧙‍♂️ 🔍 💕 🚀 😱)

### Phase 3: Core Analysis Engine (3-4 weeks)

**Create:** `/src/components/CreativeAnalysisEngine.ts`

**New analysis functions:**

```typescript
// 1. Character extraction
extractCharacters(text: string): Character[] {
  // Find proper nouns
  // Track first mentions
  // Count occurrences
  // Map to sections
}

// 2. Pacing analysis (reuse spacing logic)
analyzePacing(sections: Section[]): PacingAnalysis {
  // Sentence length averages
  // Paragraph density
  // Action verb frequency
  // Dialogue vs narrative ratio
}

// 3. Show vs Tell detection
detectTelling(text: string): TellingInstance[] {
  // Flag: "felt", "realized", "knew", "thought", "was [emotion]"
  // Suggest: Concrete alternatives
}

// 4. Character arc tracking
trackCharacterArcs(characters: Character[], text: string): CharacterArc[] {
  // Beginning state
  // Key events/changes
  // Ending state
}

// 5. Theme extraction
extractThemes(text: string): Theme[] {
  // Repeated concepts
  // Symbolic language
  // Abstract nouns
}
```

### Phase 4: UI Card Updates (2-3 weeks)

**Files to modify:**

1. **Pacing Card** (clone SpacingAnalysisCard.tsx)

   - `/src/components/PacingAnalysisCard.tsx`
   - Fast/Slow/Balanced indicators
   - Timeline visualization

2. **Show vs Tell Indicators** (modify CustomEditor.tsx)

   - `/src/components/CustomEditor.tsx`
   - Inline suggestions (reuse dual-coding position)
   - Yellow highlight for "telling" phrases

3. **Character Overview** (modify ConceptList.tsx)

   - `/src/components/CharacterList.tsx`
   - Character pills (reuse concept pill styling)
   - Click to highlight all mentions

4. **Character Arc Card** (modify PrerequisiteOrderCard.tsx)

   - `/src/components/CharacterArcCard.tsx`
   - Timeline of character changes
   - Beginning → Middle → End states

5. **Relationship Map** (modify TierTwoPreview.tsx)
   - `/src/components/CharacterRelationshipMap.tsx`
   - Interactive D3.js graph
   - Relationship types (ally, enemy, romance)

### Phase 5: New Content Libraries (1 week)

**Create:**

- `/src/data/CreativeElementsLibrary.ts`
- `/src/data/GenreConventions.ts`
- `/src/data/CharacterArchetypes.ts`
- `/src/data/StoryStructures.ts`

**Populate with:**

- Common themes
- Plot devices
- Character archetypes
- Story structure templates
- Genre-specific conventions

### Phase 6: Documentation Update (1 week)

**Update all docs:**

- `/docs/QUICK_START.md` - Creative writing focus
- `/docs/REFERENCE_LIBRARY.md` - Story analysis guide
- `/docs/PRICING_STRATEGY.md` - Writers market positioning
- `/docs/SYSTEM_OVERVIEW.md` - New architecture
- `/README.md` - Story IQ description

**New docs to create:**

- `/docs/GENRE_DETECTION.md`
- `/docs/CHARACTER_ANALYSIS.md`
- `/docs/PACING_GUIDE.md`
- `/docs/SHOW_VS_TELL.md`

### Phase 7: Testing & Polish (1-2 weeks)

- Test with real manuscripts
- Adjust analysis thresholds
- Refine UI copy
- Fix edge cases
- Add genre-specific tips

### Phase 8: Deploy & Launch (1 week)

- Set up new Vercel project
- Configure Supabase for Story IQ
- Update domain/branding
- Soft launch to beta users

**Total Timeline: 10-13 weeks**

## Quick Wins (Already Works)

### Reuse Without Changes

- ✅ Document upload (DOCX, paste, HTML)
- ✅ Section-by-section processing
- ✅ Worker architecture (handles 80k+ word novels)
- ✅ Inline highlighting system
- ✅ Click-to-navigate functionality
- ✅ Export to DOCX/HTML
- ✅ Save/load documents
- ✅ Authentication (Supabase)
- ✅ Pricing tiers (free/paid)
- ✅ Upgrade prompts
- ✅ Free tier limits (5000 words, 3 saves)

### Adapt with Minimal Changes

- **Spacing → Pacing**: Same paragraph analysis, different interpretation
- **Concept extraction → Character extraction**: Same NLP patterns, different targets
- **Dual coding → Show vs tell**: Similar inline suggestion system
- **Prerequisite checking → Arc consistency**: Similar ordering logic

## Competitive Analysis

### Existing Creative Writing Tools

**ProWritingAid**

- Grammar/style checker
- Generic advice
- Not AI-powered
- Expensive ($120/yr)

**Grammarly**

- Grammar focus
- Limited story analysis
- No character tracking

**Scrivener**

- Organizational tool
- No analysis
- Manual tracking

**AutoCrit**

- Genre-specific
- Basic metrics
- Outdated UI

**Hemingway App**

- Readability only
- No story elements
- Very basic

### Story IQ Competitive Advantages

1. **Learning Science Foundation**

   - "Cognitive science meets creative writing" is unique angle
   - Educational credibility from Tome IQ connection
   - Science-backed recommendations

2. **Comprehensive Analysis**

   - Character + Theme + Pacing + Dialogue all in one
   - No competitor does all of these
   - Holistic manuscript view

3. **Visual Feedback**

   - Inline indicators (competitors don't have this)
   - Character relationship maps
   - Pacing visualization
   - Arc timelines

4. **Novel-Length Capable**

   - Worker architecture handles 80k-150k words
   - Most tools crash on long documents
   - Section-by-section keeps it performant

5. **Freemium Model**

   - Free tier shows value (pacing + show/tell)
   - Competitors are paid-only or limited trials
   - Lower barrier to entry

6. **Modern UX**
   - Card-based interface
   - Click-to-highlight
   - Instant feedback
   - Competitors have cluttered/outdated UIs

## Market Positioning

### Target Audience

**Primary:**

- Fiction writers (novels, novellas, short stories)
- NaNoWriMo participants
- Writing students/classes
- Self-published authors
- Critique group members

**Secondary:**

- Creative writing teachers
- Developmental editors
- Writing coaches
- Literary agents (for client manuscripts)

### Pricing Strategy (Mirror Tome IQ)

**Free Tier:**

- 5,000 words per document (~20 pages)
- Pacing analysis
- Show vs tell indicators
- 3 saved manuscripts

**Starter: $9/month**

- 20 manuscripts/month
- Character overview
- Full pacing analysis
- Export reports

**Professional: $29/month**

- Unlimited manuscripts
- Character arc tracking
- Theme analysis
- Relationship maps
- Genre-specific tips
- Priority support

**Enterprise: Custom**

- Writing programs
- Publishing houses
- Creative writing MFAs
- Multiple users

### Marketing Angles

1. **"Learn from Your Own Writing"**

   - Analysis teaches craft principles
   - Show don't tell education
   - Instant feedback loop

2. **"Professional Editor in Your Pocket"**

   - Developmental edit insights
   - Before you hire an editor
   - Save $1000s on editing

3. **"Finish Your Novel"**

   - Track progress
   - See character arcs develop
   - Maintain consistency in long projects

4. **"Genre-Smart Analysis"**
   - Respects genre conventions
   - Fantasy vs Mystery have different rules
   - No generic advice

## Technical Considerations

### Performance Optimization

- Novels are 80k-150k words
- Current worker handles this fine
- May need chunking for 200k+ words (rare)
- Section-by-section keeps memory low

### Character Extraction Challenges

- Proper noun detection (already have NLP)
- Nicknames/aliases (need mapping)
- Pronouns tracking (complex but doable)
- Character name conflicts ("Grace" vs "grace")

### Theme Detection Complexity

- Abstract concepts harder than concrete
- Need semantic similarity
- May need AI assistance (GPT-4 API)
- Start with keyword-based, enhance later

### Genre Detection Accuracy

- Some manuscripts mix genres
- Literary fiction hardest to detect
- May need manual override option
- Default to "General Fiction" if unclear

## Future Enhancements (Post-Launch)

### Version 2.0 Features

- **AI Writing Coach**: GPT-4 powered suggestions
- **Comp Title Analysis**: "Your pacing matches [bestseller]"
- **Trope Detector**: Identify overused plot devices
- **Dialogue Coach**: Character voice training
- **Sensitivity Reader**: Flag problematic content
- **Market Analysis**: Genre trends, word count norms

### Integration Opportunities

- Scrivener plugin
- Google Docs add-on
- Microsoft Word integration
- Notion integration

### Community Features

- Share manuscripts with critique partners
- Collaborative analysis
- Writing challenges
- Progress tracking over time

## Technical Debt to Address

### From Tome IQ Codebase

1. **Worker error handling**: Already improved, good to go
2. **Edge Function fallback**: Works fine
3. **TypeScript strictness**: Tighten types for character/theme objects
4. **Code documentation**: Add JSDoc for new creative functions

### New Challenges

1. **Character extraction accuracy**: Test with diverse manuscripts
2. **Theme subjectivity**: Clear criteria needed
3. **Pacing thresholds**: What's "fast" vs "slow"? Genre-dependent
4. **Performance**: 150k word novels need testing

## File Structure Changes

### New Directories

```
/src/data/
  - CreativeElementsLibrary.ts
  - GenreConventions.ts
  - CharacterArchetypes.ts
  - StoryStructures.ts

/src/components/creative/
  - PacingAnalysisCard.tsx
  - CharacterList.tsx
  - CharacterArcCard.tsx
  - ShowVsTellIndicators.tsx
  - CharacterRelationshipMap.tsx
  - ThemeAnalysisCard.tsx

/src/utils/creative/
  - characterExtraction.ts
  - themeDetection.ts
  - pacingAnalysis.ts
  - arcTracking.ts
```

### Rename Existing

```
AnalysisEngine.ts → CreativeAnalysisEngine.ts
ConceptExtractor.ts → CharacterExtractor.ts
ChapterCheckerV2.tsx → ManuscriptAnalyzer.tsx (optional)
```

## Risk Mitigation

### Technical Risks

- **Character extraction accuracy**: Start conservative, improve iteratively
- **Performance with 150k words**: Test early, optimize if needed
- **Theme detection complexity**: Begin with simple keyword approach

### Business Risks

- **Market saturation**: Differentiate with learning science angle
- **ProWritingAid dominance**: Target underserved niches (genre fiction)
- **Pricing resistance**: Free tier proves value first

### User Experience Risks

- **Terminology confusion**: Clear explanations, tooltips, help docs
- **Analysis overwhelm**: Progressive disclosure, start simple
- **False positives**: Allow user feedback, refine algorithms

## Success Metrics

### Technical KPIs

- Document processing time < 30 seconds (80k words)
- Character extraction accuracy > 90%
- Zero crashes on novel-length manuscripts
- < 1% false positive rate on show vs tell

### Business KPIs

- 1,000 free tier signups (Month 1)
- 10% conversion to paid (Month 3)
- 50 Pro subscribers (Month 6)
- $1,500 MRR (Month 6)

### User Engagement

- Average document size: 40k words
- Return usage: 3+ analyses per user
- Feature usage: Pacing + Characters most popular
- Export rate: 30% of analyses

## Launch Strategy

### Soft Launch (Weeks 1-2)

- Writing communities (Reddit r/writing, r/fantasywriters)
- Personal network beta
- 50 users max
- Gather feedback

### Public Launch (Week 3)

- Product Hunt launch
- Writing subreddits
- NaNoWriMo forums (if November)
- Twitter writing community
- LinkedIn post

### Content Marketing

- Blog: "The Science of Show vs Tell"
- Blog: "Why Your Pacing Feels Off"
- Blog: "Character Arc 101"
- YouTube: Tool demonstrations
- Twitter: Writing tips + analysis examples

### Partnerships

- Writing podcasts (guest appearances)
- Creative writing YouTubers (sponsorships)
- Writing courses (affiliate deals)
- NaNoWriMo (official tool partner?)

## Summary

**Story IQ is 40% built already** because the core infrastructure from Tome IQ transfers directly:

- Document processing ✅
- UI framework ✅
- Authentication ✅
- Payments ✅
- Analysis architecture ✅

**Main work is adapting analysis logic** (3-4 weeks):

- Character extraction
- Pacing interpretation
- Show vs tell detection
- Arc tracking
- Theme identification

**UI modifications are mostly cosmetic** (2-3 weeks):

- Rename cards
- Adjust copy
- Rebrand colors (optional)

**Total development time: 10-13 weeks** from clone to launch.

**Investment required:**

- Development time (can do yourself)
- New domain + Vercel project (< $100/year)
- Separate Supabase project (free tier initially)
- Marketing/content (time investment)

**Competitive moat:**

- Learning science angle (unique)
- Comprehensive analysis (unmatched)
- Modern UX (better than competitors)
- Freemium model (lower barrier)

**Recommendation: Build this.** The creative writing market is larger than educational content, existing tools are outdated, and you have 40% of the work done already. The "cognitive science for creative writing" positioning is genuinely differentiated.
