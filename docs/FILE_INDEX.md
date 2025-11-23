# Chapter Checker - File Index & Project Structure

## 📋 Complete File Listing

### Core Implementation Files

#### `types.ts` (9.1 KB)

**Purpose**: TypeScript type definitions and interfaces
**Contains**:

- Concept, ConceptMention, ConceptGraph types
- Chapter, Section, ChapterMetadata types
- PrincipleEvaluation, Finding, Suggestion types
- Analysis results (ChapterAnalysis, ConceptAnalysisResult, StructureAnalysisResult)
- Visualization data structures
- Configuration and export interfaces

**When to use**: Import types in all other files for type safety
**Key exports**: `Concept`, `Chapter`, `ChapterAnalysis`, `PrincipleEvaluation`

---

#### `ConceptExtractor.ts` (15 KB)

**Purpose**: Extract and analyze concepts from chapter text using NLP
**Contains**:

- ConceptExtractor class with 6-phase extraction pipeline
- Candidate identification from patterns and structure
- TF-IDF scoring and filtering
- Concept object creation with mention tracking
- Relationship establishment between concepts
- Hierarchy building (core/supporting/detail)
- Helper methods for NLP analysis

**When to use**: First step in analysis pipeline to extract knowledge structure
**Key methods**:

- `ConceptExtractor.extractConceptsFromChapter(chapter, sections)`

**Example**:

```typescript
const graph = await ConceptExtractor.extractConceptsFromChapter(
  chapterText,
  sections
);
```

---

#### `LearningPrincipleEvaluators.ts` (28 KB)

**Purpose**: Evaluate chapter against 10 learning science principles
**Contains**:

- DeepProcessingEvaluator
- SpacedRepetitionEvaluator
- RetrievalPracticeEvaluator
- InterleavingEvaluator
- DualCodingEvaluator
- GenerativeLearningEvaluator
- MetacognitionEvaluator
- SchemaBuildingEvaluator
- CognitiveLoadEvaluator
- EmotionAndRelevanceEvaluator

**When to use**: After concept extraction; evaluates pedagogical quality
**Key method**: Each has `Evaluator.evaluate(chapter, concepts)`
**Returns**: PrincipleEvaluation with score, findings, suggestions

---

#### `AnalysisEngine.ts` (19 KB)

**Purpose**: Orchestrate full analysis pipeline and generate reports
**Contains**:

- AnalysisEngine class with main orchestration logic
- Concept structure analysis
- Chapter structure analysis
- Recommendation generation
- Visualization data generation
- Weighted score calculation
- Helper calculation methods

**When to use**: Main entry point for complete chapter analysis
**Key method**: `AnalysisEngine.analyzeChapter(chapter, config)`
**Returns**: Complete ChapterAnalysis object with all results

---

#### `VisualizationComponents.tsx` (2450 lines, 92 KB)

**Purpose**: React components for interactive visualizations
**Contains**:

- PrincipleScoresRadar (10-axis radar chart)
- CognitiveLoadCurve (line chart across sections)
- ConceptMentionFrequency (bar chart - conditionally rendered)
- ConceptMapVisualization (force-directed graph)
- InterleavingPattern (sequence visualization)
- ReviewScheduleTimeline (mention gaps)
- PrincipleFindings (expandable cards)
- ChapterAnalysisDashboard (complete dashboard with domain-aware sections)
- PatternAnalysisSection (learning patterns - conditionally rendered)

**When to use**: Display analysis results to users
**Key exports**: All components are React.FC
**Dependencies**: Recharts

**Recent additions** (November 2025):

- `hasDomain` prop for conditional section rendering
- Hides domain-specific sections when domain is "none" or null
- Lines 2120-2260: Conditional rendering logic

**Example**:

```tsx
<ChapterAnalysisDashboard
  analysis={analysis}
  concepts={concepts}
  hasDomain={selectedDomain !== "none" && selectedDomain !== null}
/>
```

---

#### `ChapterCheckerV2.tsx` (3477 lines, 117 KB)

**Purpose**: Main React application component with advanced features
**Contains**:

- Complete analysis orchestration
- Domain detection with auto/manual selection
- Writer Mode with AI template generation
- Auto-save and restore system
- Document editing with full-width template mode
- Section parsing and file upload handling
- Export functionality (JSON, DOCX, HTML)
- Responsive styling and mobile support
- General concept extraction for non-domain content

**When to use**: Drop-in React component for complete UI
**Key component**: `<ChapterCheckerV2 />`
**Features**:

- Domain auto-detection (v3 algorithm)
- "None/General Content" option
- AI template generation with [WRITER], [CLAUDE], [VISUAL] prompts
- Auto-save to localStorage with restore
- Full-width editor mode
- Domain-specific section hiding
- General concept generator (December 2024)

**Recent additions** (November-December 2025):

- Lines 2189-2315: AI template generation
- Lines 601-635: Auto-save logic
- Lines 460-507: Auto-restore prompt
- Lines 341-420: Domain detection v3
- Line 2604: hasDomain prop for conditional rendering
- Lines 1063-1076: General concept extraction on analysis complete
- Lines 2507-2520: GeneralConceptGenerator component integration

---

#### `GeneralConceptGenerator.tsx` (~180 lines)

**Purpose**: Display extracted concepts for general (non-domain) content
**Contains**:

- Category-grouped concept display (themes, entities, actions, qualities)
- Interactive concept pills with frequency badges
- Click-to-navigate functionality
- Color-coded categories with hover effects
- Stats footer and helpful tips

**When to use**: Automatically rendered when domain is "none" and concepts exist
**Props**:

- `concepts: GeneralConcept[]` - Extracted concepts array
- `onConceptClick: (position: number) => void` - Navigation handler

**Features**:

- 4 concept categories with distinct icons and colors
- Frequency count badges (e.g., "3×")
- Hover effects with color transitions
- Preview navigation on click
- Responsive pill layout

---

### Documentation Files

#### `RECENT_CHANGES.md` (18 KB)

**Purpose**: Track recent features and updates
**Contains**:

- November 2025 updates (AI template generation, auto-save, domain detection v3)
- Breaking changes and migration guide
- Configuration changes
- Performance notes
- API changes
- Testing recommendations
- Future enhancements roadmap

**When to use**: Understanding latest features and changes
**Best for**: Staying current with new functionality

#### `README.md` (13 KB)

**Purpose**: Comprehensive documentation and reference
**Contains**:

- Overview and goals
- 10 learning principles explained
- File structure breakdown
- Installation instructions
- Architecture overview
- Component explanations
- Usage examples
- Output structure reference
- Interpretation guide
- Customization tips
- Performance notes
- Research references

**When to use**: Reference for understanding the system
**Best for**: Learning how everything fits together

---

#### `QUICK_START.md` (13 KB)

**Purpose**: Get up and running in 10 minutes
**Contains**:

- Quick setup (2 steps)
- 5 detailed usage examples
- Custom dashboard example
- Batch analysis example
- Stream analysis example
- 10+ code recipes
- Common patterns
- API integration example
- Styling customization
- Data export examples
- Testing examples

**When to use**: Getting started quickly
**Best for**: Copy-paste solutions

---

#### `SYSTEM_OVERVIEW.md` (15 KB)

**Purpose**: Deep dive into complete system architecture
**Contains**:

- Complete system overview
- Detailed explanation of each file
- Data flow through system
- How to use each component
- Key metrics explained
- Customization points
- External system integration
- Performance characteristics
- Testing strategy
- Learning science references

**When to use**: Understanding the complete picture
**Best for**: System design and integration planning

---

#### `TECHNICAL_ARCHITECTURE.md` (50 KB)

**Purpose**: Deep technical implementation guide
**Contains**:

- Complete architecture diagrams
- Technology stack details
- Core component documentation (AnalysisEngine, ConceptExtractor, PatternRecognizer, etc.)
- Domain-specific intelligence system
- Type system hierarchy
- Performance optimizations
- Extension guidelines

**When to use**: Understanding implementation details
**Best for**: Developers extending or maintaining the system

---

#### `DUAL_CODING_ANALYZER.md` (18 KB)

**Purpose**: Documentation for visual suggestion system
**Contains**:

- Dual coding theory foundation (Paivio 1971)
- System architecture
- 6 detection patterns with algorithms
- Visual types and selection logic
- Priority system (high/medium/low)
- API reference with code examples
- Integration guide (DocumentEditor)
- Performance metrics (<100ms, O(n))
- Testing guidelines
- Future enhancements roadmap
- Academic references

**When to use**: Implementing or extending visual suggestions
**Best for**: Understanding dual coding analyzer feature

---

#### `GENERAL_CONCEPT_GENERATOR.md` (12 KB)

**Purpose**: Documentation for general content concept extraction
**Contains**:

- Feature overview and purpose
- Extraction algorithms (NLP patterns)
- 4 concept categories (themes, entities, actions, qualities)
- UI/UX design specifications
- Integration guide with code examples
- Testing scenarios
- Performance metrics
- Future enhancement roadmap

**When to use**: Understanding or extending general concept extraction
**Best for**: Non-domain content analysis (meditation, essays, creative writing)

---

### Utility Files

#### `generalConceptExtractor.ts` (~180 lines)

**Purpose**: Extract key concepts from general (non-academic) content
**Contains**:

- `extractGeneralConcepts(text)` - Main extraction function
- `GeneralConcept` interface definition
- NLP pattern matching (noun phrases, entities, actions, descriptors)
- Stop word filtering
- Context extraction
- Frequency tracking and position mapping
- Category helpers (`getConceptCategoryInfo`)

**When to use**: Analyzing content without a domain library
**Key exports**:

- `extractGeneralConcepts(text: string): GeneralConcept[]`
- `GeneralConcept` interface
- `getConceptCategoryInfo(category)` helper

**Algorithm**:

1. Extract noun phrases (2-4 words) → Themes 💡
2. Extract capitalized terms → Entities 🏷️
3. Extract action verbs → Actions ⚡
4. Extract quality descriptors → Qualities ✨
5. Filter stop words and noise
6. Track frequency and positions
7. Return top 20 concepts (min 2 occurrences)

---

#### `QUICK_START.md` (13 KB)

**Purpose**: Implementation guide with examples

---

## 🗂️ How Files Work Together

```
types.ts (Foundation - all types)
    ↓
ConceptExtractor.ts (Extract concepts)
    ↓
LearningPrincipleEvaluators.ts (Evaluate principles)
    ↓
AnalysisEngine.ts (Orchestrate)
    ↓
VisualizationComponents.tsx (Display)
    ↓
ChapterChecker.tsx (Complete app)
```

---

## 📊 File Statistics

| File                           | Size        | Lines     | Purpose              |
| ------------------------------ | ----------- | --------- | -------------------- |
| types.ts                       | 9.1 KB      | ~400      | Type definitions     |
| ConceptExtractor.ts            | 15 KB       | ~600      | Concept extraction   |
| LearningPrincipleEvaluators.ts | 28 KB       | ~1000     | Principle evaluation |
| AnalysisEngine.ts              | 19 KB       | ~700      | Orchestration        |
| VisualizationComponents.tsx    | 24 KB       | ~850      | React components     |
| ChapterChecker.tsx             | 17 KB       | ~600      | Main app             |
| **TOTAL CODE**                 | **~112 KB** | **~4150** | **Production-ready** |

---

## 🚀 Getting Started Workflow

### Step 1: Choose Your Path

**Option A: Use Complete App** (Easiest)

```
→ Import ChapterChecker.tsx
→ Add to React app
→ Done!
```

**Option B: Custom Integration** (Most Flexible)

```
→ Import types.ts
→ Use AnalysisEngine.analyzeChapter()
→ Add your own UI
```

**Option C: Specific Component** (Modular)

```
→ Import specific evaluator
→ Import visualization component
→ Build custom workflow
```

### Step 2: Read Documentation

1. **Start with**: QUICK_START.md (5 min)
2. **Then read**: README.md (15 min)
3. **For deep dive**: SYSTEM_OVERVIEW.md (20 min)

### Step 3: Implement

- Copy code examples from QUICK_START.md
- Customize as needed
- Test with sample chapter
- Deploy!

---

## 🔍 Finding What You Need

### "I want to..."

**...use the complete app immediately**
→ Import `ChapterChecker` from `ChapterChecker.tsx`
→ Add `<ChapterChecker />` to your page
→ See QUICK_START.md Example 1

**...analyze chapters programmatically**
→ Import `AnalysisEngine` from `AnalysisEngine.ts`
→ Use `AnalysisEngine.analyzeChapter()`
→ See QUICK_START.md Example 2

**...build a custom dashboard**
→ Import visualization components from `VisualizationComponents.tsx`
→ Import `ChapterAnalysis` type from `types.ts`
→ See QUICK_START.md Example 3

**...extract just concepts**
→ Import `ConceptExtractor` from `ConceptExtractor.ts`
→ Use `ConceptExtractor.extractConceptsFromChapter()`
→ See code in ConceptExtractor.ts

**...evaluate a specific principle**
→ Import evaluator from `LearningPrincipleEvaluators.ts`
→ Use `SomeEvaluator.evaluate(chapter, concepts)`
→ See class methods in LearningPrincipleEvaluators.ts

**...understand the architecture**
→ Read `SYSTEM_OVERVIEW.md` and `TECHNICAL_ARCHITECTURE.md`
→ Look at architecture diagrams
→ See data flow sections

**...customize scoring**
→ Read customization section in `README.md`
→ Modify evaluators in `LearningPrincipleEvaluators.ts`
→ Adjust weights in `AnalysisEngine.ts`

**...integrate with my backend**
→ See API integration example in `QUICK_START.md`
→ Use `AnalysisEngine` for backend processing
→ Return JSON to frontend

**...add visual suggestions to documents**
→ Read `DUAL_CODING_ANALYZER.md` for complete guide
→ Import `DualCodingAnalyzer` from `src/utils/dualCodingAnalyzer.ts`
→ See integration example in `DocumentEditor.tsx`

---

## 📦 Dependencies

### Required

- React >= 18.0
- Recharts >= 2.0

### Optional

- TypeScript (recommended, but not required)
- Any CSS framework (styling is included)

### Installation

```bash
npm install recharts
```

---

## 🎯 File Purposes at a Glance

| File                           | Purpose              | Complexity | Use When                         |
| ------------------------------ | -------------------- | ---------- | -------------------------------- |
| types.ts                       | Type safety          | Low        | Importing types into other files |
| ConceptExtractor.ts            | Extract concepts     | High       | Analyzing chapter structure      |
| LearningPrincipleEvaluators.ts | Score principles     | Medium     | Evaluating pedagogy              |
| AnalysisEngine.ts              | Orchestrate pipeline | High       | Running complete analysis        |
| VisualizationComponents.tsx    | Display results      | Medium     | Showing results to users         |
| ChapterChecker.tsx             | Complete app         | Low        | Using full UI                    |

---

## 🔄 Import Hierarchy

```
ChapterChecker.tsx
  ├─→ imports AnalysisEngine.ts
  │     ├─→ imports ConceptExtractor.ts
  │     ├─→ imports LearningPrincipleEvaluators.ts
  │     └─→ imports types.ts
  └─→ imports VisualizationComponents.tsx
        └─→ imports types.ts
```

To use ChapterChecker: Only need `ChapterChecker.tsx` (it imports everything)
To build custom: Import the individual files you need

---

## 📚 Documentation Reading Order

**For Quick Implementation** (30 min):

1. This file (5 min)
2. RECENT_CHANGES.md (10 min) - **NEW! Read first for latest features**
3. QUICK_START.md (15 min)
4. Start coding (10 min)

**For Complete Understanding** (2 hours):

1. This file (5 min)
2. RECENT_CHANGES.md (15 min) - **NEW! Latest features and changes**
3. QUICK_START.md (20 min)
4. README.md (30 min)
5. TECHNICAL_ARCHITECTURE.md (30 min)
6. SYSTEM_OVERVIEW.md (20 min)
7. Code review (15 min)

**For Customization** (2.5 hours):

1. SYSTEM_OVERVIEW.md (30 min)
2. TECHNICAL_ARCHITECTURE.md (40 min)
3. README.md customization section (20 min)
4. Code review (30 min)
5. Make changes (30 min)

**For Visual Suggestions Feature**:

1. DUAL_CODING_ANALYZER.md (20 min)
2. DocumentEditor.tsx integration (10 min)
3. Test with sample documents (10 min)

---

## ✅ Quality Checklist

Before using in production:

- [ ] Read QUICK_START.md
- [ ] Review types.ts to understand data structures
- [ ] Test with sample chapter
- [ ] Customize thresholds for your domain
- [ ] Test with 5+ different chapters
- [ ] Review recommendations quality
- [ ] Integrate with your backend/frontend
- [ ] Performance test with large chapters
- [ ] Deploy!

---

## 🚨 Common Files to Modify

### For Customization

1. **LearningPrincipleEvaluators.ts**: Change thresholds, add domain-specific rules
2. **AnalysisEngine.ts**: Adjust weights, change scoring logic
3. **VisualizationComponents.tsx**: Customize colors, layouts, charts

### For Integration

1. **ChapterChecker.tsx**: Add to your app
2. **AnalysisEngine.ts**: Call from backend

### For Understanding

1. **types.ts**: See data structures
2. **ConceptExtractor.ts**: Understand concept extraction
3. **README.md**: Get reference material

---

**You now have a complete, well-documented, production-ready system! 🎉**

Start with QUICK_START.md and go from there.

---

## 📞 Quick Reference Links

- **Latest Features**: See RECENT_CHANGES.md ⭐ **NEW!**
- **Getting Started**: See QUICK_START.md
- **Full Documentation**: See README.md
- **Architecture Details**: See SYSTEM_OVERVIEW.md
- **Code Examples**: See QUICK_START.md (Examples 1-5)
- **Type Definitions**: See types.ts
- **Principle Details**: See LearningPrincipleEvaluators.ts

---

## 🆕 November 2025 Features

**Must-read for existing users:**

1. **AI Template Generation** - Writer Mode now generates structured templates
2. **Auto-Save System** - Never lose your work again
3. **Domain Detection v3** - Ultra-strict to prevent false positives
4. **"None/General" Option** - Analyze non-academic content
5. **Smart Section Hiding** - Only shows relevant analysis sections

See RECENT_CHANGES.md for complete details and migration guide.

---

**Happy coding! 🚀**
