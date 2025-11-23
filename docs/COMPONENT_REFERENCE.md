# Component Reference

## Overview

This document provides a comprehensive overview of the React component architecture in the Chapter Analysis Tool, including component hierarchy, responsibilities, props interfaces, and state management patterns.

## Architecture Overview

```
App.tsx (Root)
└── ChapterCheckerV2.tsx (Main Container)
    ├── NavigationMenu
    │   ├── AnimatedLogo
    │   └── UserMenu
    ├── AuthModal
    ├── HelpModal
    ├── ReferenceLibraryModal
    ├── DocumentUploader
    │   └── FileUploadButton
    ├── DocumentEditor (Syncfusion)
    ├── CustomEditor (Analysis/Writer Mode)
    ├── AnalyzeButton
    ├── ChapterAnalysisDashboard
    │   ├── OverallScoreCard
    │   ├── PrincipleScoresGrid
    │   │   └── PrincipleScoreCard (x10)
    │   ├── PatternAnalysisSection
    │   ├── ConceptAnalysisSection
    │   │   ├── ConceptList
    │   │   │   └── ConceptPill
    │   │   └── MissingConceptSuggestions
    │   ├── ConceptRelationshipsSection
    │   ├── PrerequisiteOrderCard
    │   └── RecommendationsSection
    │       └── RecommendationCard
    ├── WriterMode
    │   ├── TextAreaInput
    │   └── WordCounter
    ├── UpgradePrompt
    ├── TierTwoPreview
    └── ServerAnalysisTest
```

## Core Components

### App.tsx

**Purpose**: Root application component
**Responsibility**: Renders main ChapterCheckerV2 component
**State**: None
**Location**: `src/components/App.tsx`

```tsx
function App(): JSX.Element {
  return <ChapterCheckerV2 />;
}
```

### ChapterCheckerV2.tsx

**Purpose**: Main application container and orchestrator
**Responsibility**:

- Document upload and parsing
- Domain selection
- Analysis workflow management
- Mode switching (Analysis vs Writer)
- Export functionality
- State management for entire app

**Key State**:

```tsx
- uploadedDocument: UploadedDocumentPayload | null
- selectedDomain: Domain
- analysisResult: ChapterAnalysis | null
- isAnalyzing: boolean
- viewMode: "analysis" | "writer"
- accessLevel: AccessLevel
- user: User | null
```

**Key Methods**:

- `handleDocumentUpload()` - Process uploaded files
- `handleAnalyze()` - Trigger analysis worker
- `handleExportHtml()` - Export to HTML
- `handleExportDocx()` - Export to DOCX
- `toggleViewMode()` - Switch between modes

**Location**: `src/components/ChapterCheckerV2.tsx` (4334 lines)

---

## Navigation Components

### NavigationMenu.tsx

**Purpose**: Top navigation bar
**Responsibility**: Logo, mode switcher, user menu, help button

**Props**:

```tsx
interface NavigationMenuProps {
  mode: "analysis" | "writer";
  onModeChange: (mode: "analysis" | "writer") => void;
  onHelpClick: () => void;
  onLibraryClick: () => void;
  user: User | null;
  accessLevel: AccessLevel;
}
```

**Location**: `src/components/NavigationMenu.tsx`

### AnimatedLogo.tsx

**Purpose**: Animated application logo
**Responsibility**: Display animated brain icon with "Tome IQ" text

**Props**: None (static component)

**Location**: `src/components/AnimatedLogo.tsx`

### UserMenu.tsx

**Purpose**: User profile dropdown
**Responsibility**:

- Display user email and avatar
- Show current tier
- Sign out functionality
- Subscription management link

**Props**:

```tsx
interface UserMenuProps {
  user: User;
  profile: Profile | null;
}
```

**Location**: `src/components/UserMenu.tsx`

---

## Modal Components

### AuthModal.tsx

**Purpose**: Authentication modal
**Responsibility**:

- Sign in form
- Sign up form
- Password reset
- Form validation

**Props**:

```tsx
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}
```

**State**:

- `mode: "signin" | "signup" | "reset"`
- `email: string`
- `password: string`
- `error: string | null`
- `loading: boolean`

**Location**: `src/components/AuthModal.tsx`

### HelpModal.tsx

**Purpose**: Help and documentation modal
**Responsibility**: Display feature explanations, keyboard shortcuts, tips

**Props**:

```tsx
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Location**: `src/components/HelpModal.tsx`

### ReferenceLibraryModal.tsx

**Purpose**: Concept library browser
**Responsibility**: Display available domains and concept lists

**Props**:

```tsx
interface ReferenceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDomain?: Domain;
}
```

**Location**: `src/components/ReferenceLibraryModal.tsx`

---

## Document Handling Components

### DocumentUploader.tsx

**Purpose**: File upload and text input interface
**Responsibility**:

- Handle .docx, .obt, .pdf uploads
- Parse documents using mammoth/pdf.js
- Extract images and WMF graphics
- Text area for direct input

**Props**:

```tsx
interface DocumentUploaderProps {
  onUpload: (payload: UploadedDocumentPayload) => void;
  onTextInput: (text: string) => void;
  isProcessing?: boolean;
}
```

**Output Type**:

```tsx
interface UploadedDocumentPayload {
  plainText: string;
  fileName: string;
  editorHtml?: string;
  images?: ImageData[];
}
```

**Location**: `src/components/DocumentUploader.tsx`

### DocumentEditor.tsx

**Purpose**: Syncfusion rich text editor wrapper
**Responsibility**: Full-featured document editing (deprecated in favor of CustomEditor)

**Props**:

```tsx
interface DocumentEditorProps {
  content: string;
  onContentChange?: (content: string) => void;
  readOnly?: boolean;
}
```

**Location**: `src/components/DocumentEditor.tsx`

### CustomEditor.tsx

**Purpose**: Custom rich text editor with analysis integration
**Responsibility**:

- Content-editable HTML editing
- Live spacing indicators
- Dual-coding suggestions
- Concept highlighting
- Image support
- Focus mode

**Props**:

```tsx
interface CustomEditorProps {
  content: string;
  onUpdate?: (content: { html: string; text: string }) => void;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showSpacingIndicators?: boolean;
  showVisualSuggestions?: boolean;
  concepts?: string[];
  onConceptClick?: (concept: string) => void;
  isFreeMode?: boolean;
  viewMode?: "analysis" | "writer";
}
```

**Key Features**:

- Real-time paragraph analysis
- Inline indicator rendering
- Toolbar with formatting controls
- Keyboard shortcut support
- Auto-save integration

**Location**: `src/components/CustomEditor.tsx` (1501 lines)

---

## Analysis Components

### AnalyzeButton.tsx

**Purpose**: Analysis trigger button with progress feedback
**Responsibility**:

- Start analysis
- Show progress states
- Display error messages
- Handle cancellation

**Props**:

```tsx
interface AnalyzeButtonProps {
  onClick: () => void;
  isAnalyzing: boolean;
  progress?: number;
  disabled?: boolean;
}
```

**Location**: `src/components/AnalyzeButton.tsx`

### ChapterAnalysisDashboard.tsx

**Purpose**: Complete analysis results visualization
**Responsibility**: Coordinate display of all analysis sections

**Props**:

```tsx
interface ChapterAnalysisDashboardProps {
  analysis: ChapterAnalysis;
  onConceptClick?: (concept: string) => void;
  onRecommendationClick?: (rec: Recommendation) => void;
}
```

**Location**: `src/components/VisualizationComponents.tsx`

---

## Scoring & Metrics Components

### OverallScoreCard.tsx

**Purpose**: Display aggregate analysis score
**Responsibility**: Show 0-100 overall quality score with visual gauge

**Props**:

```tsx
interface OverallScoreCardProps {
  score: number; // 0-100
  label?: string;
}
```

**Visual**: Circular progress indicator with color coding:

- 80-100: Green (Excellent)
- 60-79: Yellow (Good)
- 40-59: Orange (Needs Work)
- 0-39: Red (Poor)

**Location**: `src/components/OverallScoreCard.tsx`

### PrincipleScoresGrid.tsx

**Purpose**: Grid layout for all 10 principle scores
**Responsibility**: Display principle cards in responsive grid

**Props**:

```tsx
interface PrincipleScoresGridProps {
  principles: PrincipleEvaluation[];
  onPrincipleClick?: (principle: PrincipleEvaluation) => void;
}
```

**Location**: `src/components/PrincipleScoresGrid.tsx`

### PrincipleScoreCard.tsx

**Purpose**: Individual learning principle score display
**Responsibility**: Show score, findings, and recommendations for one principle

**Props**:

```tsx
interface PrincipleScoreCardProps {
  principle: PrincipleEvaluation;
  onClick?: () => void;
}
```

**Type**:

```tsx
interface PrincipleEvaluation {
  name: string;
  score: number; // 0-100
  findings: Finding[];
  suggestions: Suggestion[];
  status: "excellent" | "good" | "needs-improvement" | "poor";
}
```

**Location**: `src/components/PrincipleScoreCard.tsx`

---

## Concept Analysis Components

### ConceptAnalysisSection.tsx

**Purpose**: Display extracted concepts and analysis
**Responsibility**: Show concept graph, statistics, and insights

**Props**:

```tsx
interface ConceptAnalysisSectionProps {
  conceptGraph: ConceptGraph;
  onConceptClick?: (conceptId: string) => void;
}
```

**Location**: `src/components/ConceptAnalysisSection.tsx`

### ConceptList.tsx

**Purpose**: Filterable list of concepts
**Responsibility**: Display concepts by category/importance with filters

**Props**:

```tsx
interface ConceptListProps {
  concepts: Concept[];
  onConceptClick?: (concept: Concept) => void;
  filterBy?: "importance" | "category";
}
```

**Location**: `src/components/ConceptList.tsx`

### ConceptPill.tsx

**Purpose**: Individual concept tag/badge
**Responsibility**: Clickable concept indicator with importance color coding

**Props**:

```tsx
interface ConceptPillProps {
  concept: Concept;
  onClick?: () => void;
  size?: "small" | "medium" | "large";
}
```

**Styling**:

- Core: Blue background
- Supporting: Green background
- Detail: Gray background

**Location**: `src/components/ConceptPill.tsx`

### MissingConceptSuggestions.tsx

**Purpose**: Show concepts from library not found in document
**Responsibility**: Suggest important missing concepts for coverage gaps

**Props**:

```tsx
interface MissingConceptSuggestionsProps {
  missingConcepts: ConceptDefinition[];
  domain: Domain;
}
```

**Location**: `src/components/MissingConceptSuggestions.tsx`

---

## Pattern & Structure Components

### PatternAnalysisSection.tsx

**Purpose**: Display domain-specific pattern detections
**Responsibility**: Show recognized patterns (equations, reactions, code, etc.)

**Props**:

```tsx
interface PatternAnalysisSectionProps {
  patterns: RecognizedPattern[];
  domain: Domain;
}
```

**Location**: `src/components/PatternAnalysisSection.tsx`

### ConceptRelationshipsSection.tsx

**Purpose**: Visualize concept relationships
**Responsibility**: Show prerequisite chains, related concepts, contrasts

**Props**:

```tsx
interface ConceptRelationshipsSectionProps {
  relationships: ConceptRelationship[];
  concepts: Concept[];
}
```

**Location**: `src/components/ConceptRelationshipsSection.tsx`

### PrerequisiteOrderCard.tsx

**Purpose**: Display prerequisite violations
**Responsibility**: Highlight concepts introduced before prerequisites

**Props**:

```tsx
interface PrerequisiteOrderCardProps {
  violations: PrerequisiteViolation[];
}
```

**Type**:

```tsx
interface PrerequisiteViolation {
  concept: string;
  prerequisite: string;
  conceptPosition: number;
  prerequisitePosition: number;
  severity: "critical" | "moderate" | "minor";
}
```

**Location**: `src/components/PrerequisiteOrderCard.tsx`

---

## Recommendations Components

### RecommendationsSection.tsx

**Purpose**: Display all actionable recommendations
**Responsibility**: Group and present suggestions by priority

**Props**:

```tsx
interface RecommendationsSectionProps {
  recommendations: Recommendation[];
  onRecommendationClick?: (rec: Recommendation) => void;
}
```

**Location**: `src/components/RecommendationsSection.tsx`

### RecommendationCard.tsx

**Purpose**: Individual recommendation display
**Responsibility**: Show issue, impact, and suggested action

**Props**:

```tsx
interface RecommendationCardProps {
  recommendation: Recommendation;
  onClick?: () => void;
}
```

**Type**:

```tsx
interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  issue: string;
  impact: string;
  suggestion: string;
  location?: string;
}
```

**Location**: `src/components/RecommendationCard.tsx`

---

## Writer Mode Components

### WriterMode.tsx

**Purpose**: Distraction-free writing interface
**Responsibility**:

- Plain text editor
- Template insertion
- AI integration
- Suggestion sidebar
- Word count stats

**Props**:

```tsx
interface WriterModeProps {
  extractedText: string;
  analysisResult: ChapterAnalysis | null;
  onTextChange?: (newText: string) => void;
  fileName?: string;
}
```

**Features**:

- Template library browser
- Claude AI auto-fill
- Collapsible sidebar
- Responsive layout
- Export integration

**Location**: `src/components/WriterMode.tsx` (526 lines)

### TextAreaInput.tsx

**Purpose**: Enhanced textarea with features
**Responsibility**: Syntax highlighting, line numbers, shortcuts

**Props**:

```tsx
interface TextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

**Location**: `src/components/TextAreaInput.tsx`

### WordCounter.tsx

**Purpose**: Real-time text statistics
**Responsibility**: Show word count, character count, reading time

**Props**:

```tsx
interface WordCounterProps {
  text: string;
  showReadingTime?: boolean;
  showCharacterCount?: boolean;
}
```

**Location**: `src/components/WordCounter.tsx`

---

## Access Control Components

### UpgradePrompt.tsx

**Purpose**: Tier upgrade call-to-action
**Responsibility**: Show feature comparison and upgrade button

**Props**:

```tsx
interface UpgradePromptProps {
  currentTier: AccessLevel;
  featureBlocked: string;
  onUpgrade: () => void;
}
```

**Variants**:

- Full modal (blocking)
- Inline banner (non-blocking)

**Location**: `src/components/UpgradePrompt.tsx`

### TierTwoPreview.tsx

**Purpose**: Feature preview for locked features
**Responsibility**: Show blurred/limited preview with upgrade prompt

**Props**:

```tsx
interface TierTwoPreviewProps {
  featureName: string;
  currentTier: AccessLevel;
  requiredTier: AccessLevel;
}
```

**Location**: `src/components/TierTwoPreview.tsx`

---

## Utility Components

### ErrorAlert.tsx

**Purpose**: Error message display
**Responsibility**: Show dismissible error alerts

**Props**:

```tsx
interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  severity?: "error" | "warning" | "info";
}
```

**Location**: `src/components/ErrorAlert.tsx`

### InfoCard.tsx

**Purpose**: Informational card with icon
**Responsibility**: Display tips, info, or status messages

**Props**:

```tsx
interface InfoCardProps {
  title: string;
  message: string;
  icon?: string;
  variant?: "info" | "success" | "warning";
}
```

**Location**: `src/components/InfoCard.tsx`

### FileUploadButton.tsx

**Purpose**: Styled file input button
**Responsibility**: Trigger file picker with custom styling

**Props**:

```tsx
interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  accept?: string; // ".docx,.obt,.pdf"
  disabled?: boolean;
  label?: string;
}
```

**Location**: `src/components/FileUploadButton.tsx`

---

## State Management Patterns

### Local State (useState)

Used for:

- Component-specific UI state (modals open/closed)
- Form inputs
- Temporary data

### Lifted State

- `ChapterCheckerV2` holds most app state
- Props drilling for 1-2 levels deep
- Callback props for updates

### Auto-Save State

```tsx
// In ChapterCheckerV2
useEffect(() => {
  const snapshot = {
    content: { plainText, editorHtml },
    fileName,
    timestamp: new Date().toISOString(),
    analysis: analysisResult,
  };
  localStorage.setItem("tomeiq_autosave", JSON.stringify(snapshot));
}, [plainText, editorHtml, fileName, analysisResult]);
```

### Zustand (Future)

Currently not used, but planned for:

- Global theme settings
- User preferences
- Cache management

---

## Performance Optimizations

### React.memo

Used on:

- `ConceptPill` - Prevents re-render of concept tags
- `PrincipleScoreCard` - Expensive chart renders
- `RecommendationCard` - Long lists

### useMemo

```tsx
const sortedConcepts = useMemo(
  () => concepts.sort((a, b) => b.mentions.length - a.mentions.length),
  [concepts]
);
```

### useCallback

```tsx
const handleConceptClick = useCallback(
  (conceptId: string) => {
    // Navigate to concept location
  },
  [dependencies]
);
```

### Web Workers

Analysis runs in worker to prevent UI blocking:

```tsx
const worker = new AnalysisWorker();
worker.postMessage({ text, domain });
worker.onmessage = (e) => setAnalysis(e.data);
```

---

## Component Communication

### Props Down, Events Up

```tsx
// Parent
<CustomEditor
  content={text}
  onUpdate={handleUpdate}
  showSpacingIndicators={true}
/>;

// Child emits
props.onUpdate?.({ html, text });
```

### Context (Not Currently Used)

Future consideration for:

- Theme provider
- Auth context
- Feature flags

---

## Testing Recommendations

### Unit Tests

Focus on:

- Pure utility functions
- Component prop handling
- State updates

### Integration Tests

Test:

- Upload → Parse → Analyze workflow
- Edit → Export workflow
- Auth → Save workflow

### E2E Tests

Critical paths:

1. Sign up → Upload → Analyze → Export
2. Template insert → AI fill → Save
3. Upgrade → Payment → Feature unlock

---

## Common Patterns

### Modal Pattern

```tsx
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsOpen(true)}>Open</button>
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {/* content */}
    </Modal>
  </>
);
```

### Async Data Loading

```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  load();
}, [dependencies]);
```

### Conditional Rendering

```tsx
{
  accessLevel === "free" && <UpgradePrompt />;
}
{
  analysisResult ? (
    <ChapterAnalysisDashboard analysis={analysisResult} />
  ) : (
    <EmptyState />
  );
}
```

---

## File Locations Summary

```
src/components/
├── Core
│   ├── App.tsx
│   └── ChapterCheckerV2.tsx
├── Navigation
│   ├── NavigationMenu.tsx
│   ├── AnimatedLogo.tsx
│   └── UserMenu.tsx
├── Modals
│   ├── AuthModal.tsx
│   ├── HelpModal.tsx
│   └── ReferenceLibraryModal.tsx
├── Document
│   ├── DocumentUploader.tsx
│   ├── DocumentEditor.tsx
│   ├── CustomEditor.tsx
│   └── FileUploadButton.tsx
├── Analysis
│   ├── AnalyzeButton.tsx
│   ├── VisualizationComponents.tsx
│   ├── OverallScoreCard.tsx
│   ├── PrincipleScoresGrid.tsx
│   └── PrincipleScoreCard.tsx
├── Concepts
│   ├── ConceptAnalysisSection.tsx
│   ├── ConceptList.tsx
│   ├── ConceptPill.tsx
│   ├── MissingConceptSuggestions.tsx
│   ├── ConceptRelationshipsSection.tsx
│   └── PrerequisiteOrderCard.tsx
├── Patterns
│   └── PatternAnalysisSection.tsx
├── Recommendations
│   ├── RecommendationsSection.tsx
│   └── RecommendationCard.tsx
├── Writer
│   ├── WriterMode.tsx
│   ├── TextAreaInput.tsx
│   └── WordCounter.tsx
├── Access
│   ├── UpgradePrompt.tsx
│   └── TierTwoPreview.tsx
└── Utility
    ├── ErrorAlert.tsx
    ├── InfoCard.tsx
    └── GeneralConceptGenerator.tsx
```

---

## Next Steps

For component development:

1. Follow existing patterns
2. Use TypeScript strictly
3. Document props with JSDoc
4. Add loading/error states
5. Consider accessibility (ARIA)
6. Test with different access levels

For debugging:

1. Check React DevTools
2. Inspect component props
3. Monitor state changes
4. Review console errors
5. Test with different data
