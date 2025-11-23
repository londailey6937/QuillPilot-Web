# Chapter Checker - Project File Manifest & Structure

Complete reference for all files in the project with descriptions, purposes, and line counts.

## 📋 Quick Reference

**Total Files:** 26
**Total Lines of Code:** ~3,000+ (excluding config)
**Languages:** TypeScript (TSX, TS), CSS, JavaScript, HTML
**Build Tool:** Vite
**Framework:** React 18.2
**Styling:** Tailwind CSS 3.3
**Font:** Inter (Google Fonts)

---

## 📂 Configuration Files (Root Level)

### `package.json`

**Purpose:** Project metadata and dependency management
**Content:**

- Project name, version, description
- NPM scripts (dev, build, lint, type-check)
- Dependencies (React, React DOM, Recharts)
- Dev dependencies (Vite, Tailwind, TypeScript, etc.)
  **Lines:** 32
  **When to Edit:** Add new dependencies or change scripts
  **Key Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Lint code style
- `npm run type-check` - Check TypeScript types

### `vite.config.ts`

**Purpose:** Vite build tool configuration
**Content:**

- React plugin setup
- Path aliases (@/, @components, @types, @utils)
- Development server configuration (port 3000)
- Build optimization settings
  **Lines:** 28
  **When to Edit:** Change build behavior or add path aliases
  **Key Aliases:**
- `@/` → `./src/`
- `@components/` → `./src/components/`
- `@types/` → `./src/types/`
- `@utils/` → `./src/utils/`

### `tsconfig.json`

**Purpose:** TypeScript compiler configuration
**Content:**

- Compiler options (ES2020 target, strict mode)
- Module resolution settings
- Path mappings (same as vite.config)
- JSX support (react-jsx)
  **Lines:** 35
  **When to Edit:** Change TypeScript behavior or add strict checks
  **Important:** Strict mode enabled (strict: true)

### `tsconfig.node.json`

**Purpose:** TypeScript config for Node/build environment
**Content:**

- Build tool configuration
- Includes vite.config.ts
  **Lines:** 12
  **When to Edit:** Rarely needed

### `tailwind.config.ts`

**Purpose:** Tailwind CSS theme and configuration
**Content:**

- Content file patterns for purging
- Theme extensions (colors, borderRadius, shadows)
- Custom colors (primary, secondary)
- Google Fonts integration (Inter)
  **Lines:** 45
  **When to Edit:** Customize colors, spacing, or add new utilities
  **Key Customizations:**
- Primary colors (gradient indigo/purple)
- Secondary colors (blue tones)
- Custom shadows (soft, soft-lg, glow)
- Inter font family

### `postcss.config.js`

**Purpose:** PostCSS configuration for Tailwind processing
**Content:**

- Tailwind CSS plugin
- Autoprefixer plugin
  **Lines:** 6
  **When to Edit:** Add PostCSS plugins or configure processing
  **Usually:** No changes needed

### `index.html`

**Purpose:** HTML entry point for React application
**Content:**

- Meta tags (charset, viewport)
- Google Fonts link (Inter font)
- Root div for React mounting
- Script tag linking to main.tsx
  **Lines:** 20
  **When to Edit:** Add head content, change title, load external resources
  **Important:**
- Must include `<div id="root"></div>`
- Main.tsx script must reference `/src/main.tsx`

---

## 🚀 Source Files (src/)

### `src/main.tsx`

**Purpose:** React application entry point
**Content:**

- React DOM initialization
- Mounts App component to root
- Imports global CSS
  **Lines:** 15
  **Pattern:** Creates ReactDOM.createRoot and renders App
  **When to Edit:** Change global providers or app configuration

```tsx
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### `src/App.tsx`

**Purpose:** Root component managing application state and navigation
**Content:**

- Application state (analysis, isLoading)
- Header, main content, footer layout
- Navigation between input and dashboard views
- Handlers for analysis lifecycle
  **Lines:** 110
  **Parent Component:** None (root)
  **Children:** ChapterInput, ChapterAnalysisDashboard
  **Key State:**
- `analysis` - Current analysis result or null
- `isLoading` - Loading state during analysis
  **Key Functions:**
- `handleAnalysisStart()` - Called when analysis begins
- `handleAnalysisComplete()` - Called with analysis result
- `handleReset()` - Navigate back to input

---

## 🎨 Styling Files

### `src/styles/globals.css`

**Purpose:** Global Tailwind CSS with @layer directives
**Content:**

- Base layer (html, body, headings, paragraphs)
- Component layer (btn-_, card-_, input-_, badge-_)
- Utility layer (animations, utilities)
  **Lines:** 120
  **When to Edit:**
- Add new global styles
- Create reusable component classes
- Define custom animations
  **Key Component Classes:**
- `.btn-base` - Base button styles
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary button
- `.card` - Card component
- `.input-base` - Input field styles
- `.badge-*` - Badge variants

---

## 📝 Type Definitions

### `src/types/index.ts`

**Purpose:** Central TypeScript type definitions for entire application
**Content:**

- Concept & knowledge structures (Concept, ConceptGraph, ConceptRelationship)
- Chapter structures (Chapter, Section, ChapterMetadata)
- Principle evaluation types (PrincipleEvaluation, Finding, Suggestion)
- Analysis results (ChapterAnalysis, ConceptAnalysisResult)
- Visualization data types (ConceptNode, ConceptLink, CognitiveLoadPoint)
- Configuration interfaces (AnalysisConfig, ExportData)
  **Lines:** 380
  **When to Edit:** Add new data structures or modify existing interfaces
  **Important:** No runtime code, pure TypeScript definitions
  **Key Exports:**
- `interface ChapterAnalysis` - Main analysis result
- `type LearningPrinciple` - Union of 10 principle names
- `interface Recommendation` - Improvement suggestion

---

## 🔧 Utilities

### `src/utils/AnalysisEngine.ts`

**Purpose:** Core analysis logic and chapter evaluation
**Content:**

- `AnalysisEngine` class with static methods
- Concept extraction (stub)
- Principle evaluation (stub)
- Recommendation generation
- Score calculation
- Visualization data preparation
  **Lines:** 145
  **Key Methods:**
- `analyzeChapter()` - Main analysis entry point
- `extractConcepts()` - NLP concept identification
- `evaluateAllPrinciples()` - Evaluate 10 principles
- `generateRecommendations()` - Create recommendations
- `calculateOverallScore()` - Weighted score calculation
  **Status:** Stub implementation - extend with real analysis logic

---

## 🧩 Components (src/components/)

### Input Section

#### `src/components/ChapterInput/index.tsx`

**Purpose:** Main input form for chapter analysis
**Parent:** App
**Children:** TextAreaInput, FileUploadButton, AnalyzeButton, WordCounter, InfoCard, ErrorAlert
**State:**

- `chapterText` - Current chapter text
- `error` - Error message display
- `progress` - Analysis progress message
- `fileInputRef` - Reference to file input
  **Lines:** 180
  **Key Props Received from Parent:**
- `onAnalysisStart: () => void`
- `onAnalysisComplete: (analysis: ChapterAnalysis) => void`
- `isLoading: boolean`
  **Key Functions:**
- `validateChapter()` - Validates text length
- `handleAnalyze()` - Triggers analysis
- `handleFileUpload()` - Handles file upload
- `handleClear()` - Clears input

#### `src/components/Input/TextAreaInput.tsx`

**Purpose:** Controlled textarea input component
**Parent:** ChapterInput
**Props:**

- `value: string` - Current textarea value
- `onChange: (value: string) => void` - Change handler
- `placeholder: string` - Input placeholder
- `disabled: boolean` - Disabled state
  **Lines:** 30
  **Pattern:** Controlled component - value and onChange from parent

#### `src/components/Input/FileUploadButton.tsx`

**Purpose:** File upload button with hidden input
**Parent:** ChapterInput
**Props:**

- `onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void`
- `isDisabled: boolean`
- `fileInputRef: React.RefObject<HTMLInputElement>`
  **Lines:** 35
  **Accepts:** .docx and .obt files

#### `src/components/Input/AnalyzeButton.tsx`

**Purpose:** Primary analysis action button
**Parent:** ChapterInput
**Props:**

- `onClick: () => Promise<void>`
- `disabled: boolean`
- `isLoading: boolean`
- `progress: string`
  **Lines:** 45
  **Features:** Loading spinner, progress text, animation

#### `src/components/Input/WordCounter.tsx`

**Purpose:** Display word count with status
**Parent:** ChapterInput
**Props:**

- `count: number` - Current word count
  **Lines:** 25
  **Features:** Color-coded status (red if < 200 words)

#### `src/components/Input/InfoCard.tsx`

**Purpose:** Information card with list items
**Parent:** ChapterInput (used 3x)
**Props:**

- `title: string` - Card title
- `items: string[]` - List of items
  **Lines:** 30
  **Used For:** Features, tips, benefits display

### Alert Components

#### `src/components/Alerts/ErrorAlert.tsx`

**Purpose:** Error message display with dismiss
**Parent:** ChapterInput
**Props:**

- `message: string` - Error message
- `onDismiss: () => void` - Dismiss callback
  **Lines:** 30
  **Features:** Colored background, dismiss button

### Dashboard Section

#### `src/components/Dashboard/ChapterAnalysisDashboard.tsx`

**Purpose:** Main analysis results dashboard
**Parent:** App
**Children:** OverallScoreCard, PrincipleScoresGrid, ConceptAnalysisSection, RecommendationsSection
**Props:**

- `analysis: ChapterAnalysis` - Complete analysis result
- `onReset: () => void` - Reset callback
  **Lines:** 145
  **Sections:**

1. Header with reset button
2. Overall score card
3. Principle evaluations grid
4. Concept analysis
5. Structure analysis
6. Recommendations
7. Export functionality

#### `src/components/Dashboard/Components/OverallScoreCard.tsx`

**Purpose:** Display overall pedagogical score
**Parent:** ChapterAnalysisDashboard
**Props:**

- `score: number` - Score 0-100
  **Lines:** 85
  **Features:**
- Circular progress indicator
- Color-coded interpretation
- Score explanation text

#### `src/components/Dashboard/Components/PrincipleScoresGrid.tsx`

**Purpose:** Grid of all 10 principle scores
**Parent:** ChapterAnalysisDashboard
**Children:** PrincipleScoreCard
**Props:**

- `principles: PrincipleEvaluation[]` - Array of evaluations
  **Lines:** 45
  **Maps:** PrincipleScoreCard for each principle

#### `src/components/Dashboard/Components/PrincipleScoreCard.tsx`

**Purpose:** Individual principle score display
**Parent:** PrincipleScoresGrid
**Props:**

- `principle: PrincipleEvaluation` - Principle evaluation
  **Lines:** 95
  **Features:**
- Expandable card
- Progress bar
- Findings preview
- Top suggestion display
- Color-coded score

#### `src/components/Dashboard/Components/ConceptAnalysisSection.tsx`

**Purpose:** Concept extraction and analysis results
**Parent:** ChapterAnalysisDashboard
**Props:**

- `totalConcepts: number`
- `coreConcepts: number`
- `density: number`
- `balance: number`
  **Lines:** 90
  **Displays:**
- Total concepts identified
- Core concept count
- Concept density (per 1000 words)
- Hierarchy balance percentage

#### `src/components/Dashboard/Components/RecommendationsSection.tsx`

**Purpose:** Organize and display recommendations
**Parent:** ChapterAnalysisDashboard
**Children:** RecommendationCard
**Props:**

- `recommendations: Recommendation[]`
  **Lines:** 95
  **Groups:** By priority (high, medium, low)
  **Maps:** RecommendationCard for each recommendation

#### `src/components/Dashboard/Components/RecommendationCard.tsx`

**Purpose:** Individual recommendation display
**Parent:** RecommendationsSection
**Props:**

- `recommendation: Recommendation`
  **Lines:** 95
  **Displays:**
- Title and description
- Priority and effort badges
- Expected outcome
- Action items list
- Color-coded by priority

---

## 📊 File Statistics

### By Category

**Configuration Files:** 6 files

- HTML, JSON, JS, TS files
- ~180 lines total

**Component Files:** 18 files

- React/TypeScript components
- ~1,200 lines total
- Organized by feature

**Type Definitions:** 1 file

- ~380 lines
- Central type definitions

**Utilities:** 1 file

- ~145 lines
- Analysis logic

**Styles:** 1 file

- ~120 lines
- Global CSS with Tailwind

**Total:** 27 files
**Total Lines:** ~2,200+ (excluding node_modules)

### By Purpose

- **UI Components:** 18 files
- **Type Safety:** 1 file
- **Business Logic:** 1 file
- **Configuration:** 6 files
- **Styling:** 1 file

---

## 🔄 Component Hierarchy

```
App (root)
├── Header (sticky navigation)
├── Main Content
│   ├── ChapterInput (input section)
│   │   ├── TextAreaInput
│   │   ├── FileUploadButton
│   │   ├── AnalyzeButton
│   │   ├── WordCounter
│   │   ├── InfoCard × 3
│   │   └── ErrorAlert
│   │
│   └── ChapterAnalysisDashboard (results section)
│       ├── OverallScoreCard
│       ├── PrincipleScoresGrid
│       │   └── PrincipleScoreCard × 10
│       ├── ConceptAnalysisSection
│       ├── Structure Analysis
│       ├── RecommendationsSection
│       │   └── RecommendationCard × many
│       └── Export Section
│
└── Footer (static info)
```

---

## 📥 Dependency Map

```
App.tsx
├── imports ChapterInput/index.tsx
├── imports ChapterAnalysisDashboard.tsx
├── imports types (ChapterAnalysis)
└── imports AnalysisEngine

ChapterInput/index.tsx
├── imports TextAreaInput.tsx
├── imports FileUploadButton.tsx
├── imports AnalyzeButton.tsx
├── imports WordCounter.tsx
├── imports InfoCard.tsx
├── imports ErrorAlert.tsx
├── imports types (ChapterAnalysis)
└── imports AnalysisEngine

ChapterAnalysisDashboard.tsx
├── imports OverallScoreCard.tsx
├── imports PrincipleScoresGrid.tsx
├── imports ConceptAnalysisSection.tsx
├── imports RecommendationsSection.tsx
└── imports types (ChapterAnalysis)

PrincipleScoresGrid.tsx
└── imports PrincipleScoreCard.tsx

RecommendationsSection.tsx
└── imports RecommendationCard.tsx
```

---

## 🎯 Modification Guide

### To Add a New Component

1. Create file in appropriate `src/components/` subdirectory
2. Define Props interface
3. Add JSDoc comments
4. Implement with destructuring
5. Export default
6. Import in parent component

### To Add a New Type

1. Add to `src/types/index.ts`
2. Export from types file
3. Import in components that use it
4. Use in Props interfaces

### To Add Global Styles

1. Add CSS to `src/styles/globals.css`
2. Use `@layer` for proper Tailwind cascade
3. Reference in components via className

### To Modify Tailwind Theme

1. Edit `tailwind.config.ts`
2. Modify `theme.extend` section
3. Add custom colors, spacing, shadows
4. Restart dev server if needed

---

## 📦 Distribution

### File Sizes (Estimated)

- Configuration files: ~100 KB
- Source files: ~150 KB
- node_modules: ~500 MB (not distributed)
- Build output (dist/): ~50 KB (minified + gzipped)

### For Distribution

```bash
npm run build
# Creates optimized dist/ folder
# Ready for deployment to:
# - Vercel
# - Netlify
# - GitHub Pages
# - AWS S3
# - Any static host
```

---

## 🔗 Cross-References

**Types used across components:**

- `ChapterAnalysis` - Dashboard receives, App manages
- `PrincipleEvaluation` - Grid displays
- `Recommendation` - Section displays

**Props patterns:**

- Controlled inputs (TextAreaInput)
- Callbacks (onClick, onChange, onUpload)
- State management (App is state container)
- Conditional rendering (analysis ? dashboard : input)

**Styling patterns:**

- Tailwind utilities
- Component classes from globals.css
- Inline responsive classes

---

**Last Updated:** 2024
**Maintained By:** Chapter Checker Team
**License:** MIT

For questions about specific files, refer to component comments and type definitions.
