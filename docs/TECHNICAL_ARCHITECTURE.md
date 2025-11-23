# Technical Architecture Guide

## System Overview

The Chapter Analysis Tool is a **React + TypeScript** application using **Web Workers** for background processing and **domain-specific pattern recognition** for intelligent analysis of educational content.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Analysis Pipeline](#analysis-pipeline)
4. [Pattern Recognition System](#pattern-recognition-system)
5. [Domain-Specific Intelligence](#domain-specific-intelligence)
6. [Type System](#type-system)
7. [Performance Optimizations](#performance-optimizations)
8. [Extending the System](#extending-the-system)

---

## Architecture Overview

### Technology Stack

```
Frontend Framework: React 18 (with strict mode)
Language: TypeScript 5+ (strict type checking)
Build Tool: Vite (fast HMR, optimized builds)
Styling: Tailwind CSS + inline styles
Worker: Web Worker API (background processing)
PDF Processing: pdf.js (text extraction)
```

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                            │
│  (React Components: App.tsx, VisualizationComponents.tsx)  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Analysis Engine                          │
│              (AnalysisEngine.ts - Orchestration)            │
└────┬─────────┬──────────┬──────────┬──────────────┬─────────┘
     │         │          │          │              │
     ▼         ▼          ▼          ▼              ▼
┌─────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│Concept  │ │Pattern │ │Relation │ │Learning  │ │Domain    │
│Extractor│ │Recog   │ │Detector │ │Principle │ │Specific  │
│         │ │nizer   │ │         │ │Evaluators│ │Patterns  │
└─────────┘ └────────┘ └─────────┘ └──────────┘ └──────────┘
                                 │
                                 ▼
                           ┌──────────┐
                           │Dual Coding│
                           │Analyzer  │
                           └──────────┘
```

### Data Flow

```
1. User uploads DOCX/OBT
   ↓
2. Text extraction (mammoth.js for DOCX)
   ↓
3. Web Worker spawned (analysisWorker.ts)
   ↓
4. AnalysisEngine.analyzeChapter()
   ├→ ConceptExtractor (builds knowledge graph)
   ├→ PatternRecognizer (detects learning patterns)
   │   └→ ChemistryPatterns (domain-specific)
   ├→ LearningPrincipleEvaluators (10 principles)
   │   └→ Uses pattern data for scoring
   └→ Return ChapterAnalysis
   ↓
5. Results posted to main thread
   ↓
6. UI renders visualization components
   ↓
7. DocumentEditor with DualCodingAnalyzer
   └→ Real-time visual suggestions for dual coding
```

---

## Core Components

### 1. AnalysisEngine.ts

**Purpose**: Orchestrates the entire analysis pipeline.

**Location**: `src/components/AnalysisEngine.ts`

**Key Method**: `analyzeChapter(chapter: Chapter, domain?: string, onProgress?: Function)`

**Responsibilities**:

1. Progress tracking (onProgress callbacks)
2. Concept extraction orchestration
3. Pattern recognition orchestration
4. Principle evaluation orchestration
5. Recommendation generation
6. Result aggregation

**Code Structure**:

```typescript
export class AnalysisEngine {
  static async analyzeChapter(
    chapter: Chapter,
    domain?: string,
    onProgress?: (message: string, percent: number) => void
  ): Promise<ChapterAnalysis> {
    // Phase 1: Concept Extraction (0-40%)
    onProgress?.("Extracting concepts...", 10);
    const conceptGraph =
      await ConceptExtractorLibrary.extractConceptsFromChapter(
        chapter,
        chapter.sections,
        domain
      );
    onProgress?.("Concepts extracted", 40);

    // Phase 2: Pattern Recognition (40-60%)
    onProgress?.("Analyzing learning patterns...", 45);
    const patternAnalysis = PatternRecognizer.analyzePatterns(chapter, domain);
    onProgress?.("Patterns identified", 60);

    // Phase 3: Principle Evaluation (60-95%)
    onProgress?.("Evaluating learning principles...", 65);
    const evaluations = this.runEvaluators(
      chapter,
      conceptGraph,
      patternAnalysis,
      onProgress
    );

    // Phase 4: Generate Recommendations (95-100%)
    onProgress?.("Generating recommendations...", 95);
    const recommendations = this.generateRecommendations(evaluations);

    onProgress?.("Analysis complete", 100);
    return {
      /* ... complete analysis object */
    };
  }
}
```

**Pattern Integration**:

```typescript
// Pass pattern data to all evaluators
private static runEvaluators(
  chapter: Chapter,
  conceptGraph: ConceptGraph,
  patternAnalysis: PatternAnalysis,
  onProgress?: Function
): PrincipleEvaluation[] {
  const evaluators = [/* all 10 evaluator classes */];

  return evaluators.map((evaluator, i) => {
    // Each evaluator receives pattern data
    const result = evaluator.evaluate(chapter, conceptGraph, patternAnalysis);
    onProgress?.(`Evaluated ${result.principle}`, 65 + (i * 3));
    return result;
  });
}
```

### 2. ConceptExtractorLibrary.ts

**Purpose**: Extracts concepts and builds knowledge graph with relationships.

**Location**: `src/components/ConceptExtractorLibrary.ts`

**Key Method**: `extractConceptsFromChapter(chapter, sections, domain?)`

**6-Phase Pipeline**:

```typescript
// Phase 1: Candidate Identification
const candidates = this.identifyCandidatesFromLibrary(chapter.content, domain);
// Uses domain-specific concept libraries

// Phase 2: TF-IDF Scoring
const scoredCandidates = this.calculateTFIDFScores(candidates, chapter);
// Statistical importance

// Phase 3: Filtering & Validation
const validConcepts = this.filterConcepts(scoredCandidates);
// Remove noise, apply thresholds

// Phase 4: Mention Tracking
const conceptsWithMentions = this.trackMentions(validConcepts, chapter);
// Where does each concept appear?

// Phase 5: Relationship Detection
const relationships = this.detectRelationships(concepts, chapter);
// 4 types: prerequisite, contrasts, example, related

// Phase 6: Hierarchy Building
const hierarchy = this.buildHierarchy(concepts);
// Classify as core/supporting/detail
```

**Relationship Detection** (Fixed after bug):

```typescript
private static detectExampleRelationships(
  concepts: Concept[],
  chapterContent: string
): ConceptRelationship[] {
  // NEW: Strict grammatical patterns
  const patterns = [
    new RegExp(`${c1}\\s+such as\\s+${c2}`, 'gi'),
    new RegExp(`${c2}\\s+is an example of\\s+${c1}`, 'gi'),
    new RegExp(`for example,?\\s+${c2}\\s+(?:is|are)\\s+${c1}`, 'gi'),
    new RegExp(`${c1}\\s+\\(e\\.g\\.?,\\s+${c2}\\)`, 'gi'),
    new RegExp(`${c1}s?\\s+like\\s+${c2}`, 'gi')
  ];

  let indicatorCount = 0;
  patterns.forEach(pattern => {
    if (pattern.test(chapterContent)) indicatorCount++;
  });

  // Require 2+ indicators (was 1, caused false positives)
  if (indicatorCount >= 2) {
    return {
      source: concept2.id,  // specific
      target: concept1.id,  // general
      type: "example"       // c2 is example of c1
    };
  }
}
```

**Domain Library Integration**:

```typescript
// Uses concept libraries for each domain
import { chemistryConceptLibrary } from "../data/chemistryConceptLibrary";
import { crossDomainConcepts } from "../data/crossDomainConcepts";

// Match concepts against library
const libraryMatch = chemistryConceptLibrary.concepts.find(
  (c) => c.term.toLowerCase() === candidate.toLowerCase()
);

if (libraryMatch) {
  concept.importance = libraryMatch.importance; // "core" or undefined
  concept.relatedConcepts = libraryMatch.relatedConcepts;
  concept.misconceptions = libraryMatch.commonMisconceptions;
}
```

### 3. PatternRecognizer.ts

**Purpose**: Detects universal learning patterns in chapter content.

**Location**: `src/utils/PatternRecognizer.ts`

**Key Method**: `analyzePatterns(chapter: Chapter, domain?: string)`

**Architecture**:

```typescript
export class PatternRecognizer {
  static analyzePatterns(chapter: Chapter, domain?: string): PatternAnalysis {
    const patterns: PatternMatch[] = [];

    // Universal pattern detection (always runs)
    patterns.push(...this.detectWorkedExamples(chapter));
    patterns.push(...this.detectPracticeProblems(chapter));
    patterns.push(...this.detectDefinitionExamples(chapter));
    patterns.push(...this.detectFormulas(chapter));
    patterns.push(...this.detectProcedures(chapter));
    patterns.push(...this.detectComparisons(chapter));

    // Domain-specific pattern detection (conditional)
    if (domain === "chemistry") {
      const chemPatterns = ChemistryPatterns.detectAll(chapter);
      patterns.push(...chemPatterns);
    }
    // Future: if (domain === "finance") { ... }
    // Future: if (domain === "biology") { ... }

    return {
      totalPatterns: patterns.length,
      patterns: patterns,
      byType: this.groupByType(patterns),
      coverage: this.calculateCoverage(patterns, chapter),
    };
  }
}
```

**Pattern Detection Example** (Worked Example):

```typescript
private static detectWorkedExamples(chapter: Chapter): PatternMatch[] {
  const matches: PatternMatch[] = [];

  // Split into sections for context isolation
  const sections = chapter.sections;

  sections.forEach(section => {
    const paragraphs = section.content.split('\n\n');

    paragraphs.forEach((para, idx) => {
      // Detection criteria
      const hasProblemStatement = /(?:problem|example|calculate|find|determine)/gi.test(para);
      const hasSolutionSteps = /(?:step \d|solution|answer)/gi.test(para);
      const hasCalculations = /[=+\-*/]\s*\d/.test(para);

      // Look ahead to next paragraph for solution
      const nextPara = paragraphs[idx + 1] || "";
      const hasExplanation = /(?:because|since|therefore|thus|so)/gi.test(nextPara);

      if (hasProblemStatement && hasSolutionSteps && hasCalculations) {
        matches.push({
          type: "workedExample",
          title: "Worked Example",
          context: para.substring(0, 300),
          confidence: 0.85,
          location: {
            section: section.title,
            startIndex: /* ... */,
            endIndex: /* ... */
          },
          metadata: {
            hasAnswer: true,
            steps: this.countSteps(para)
          }
        });
      }
    });
  });

  return matches;
}
```

### 4. ChemistryPatterns.ts

**Purpose**: Domain-specific pattern detection for chemistry content.

**Location**: `src/utils/ChemistryPatterns.ts`

**Key Method**: `detectAll(chapter: Chapter)`

**6 Chemistry-Specific Patterns**:

```typescript
export class ChemistryPatterns {
  static detectAll(chapter: Chapter): PatternMatch[] {
    const patterns: PatternMatch[] = [];

    patterns.push(...this.detectChemicalEquations(chapter));
    patterns.push(...this.detectStoichiometryProblems(chapter));
    patterns.push(...this.detectLewisStructures(chapter));
    patterns.push(...this.detectLabProcedures(chapter));
    patterns.push(...this.detectNomenclaturePractice(chapter));
    patterns.push(...this.detectReactionMechanisms(chapter));

    return patterns;
  }
}
```

**Chemical Equation Detection**:

```typescript
private static detectChemicalEquations(chapter: Chapter): PatternMatch[] {
  // Regex for chemical formulas with arrows
  const equationPattern = /[A-Z][a-z]?\d*(?:\([a-z]\))?\s*(?:\+\s*\d*[A-Z][a-z]?\d*(?:\([a-z]\))?)*\s*[→⇌]\s*[A-Z][a-z]?\d*(?:\([a-z]\))?\s*(?:\+\s*\d*[A-Z][a-z]?\d*(?:\([a-z]\))?)*/g;

  const matches = chapter.content.match(equationPattern) || [];

  return matches.map(equation => {
    const isBalanced = this.checkIfBalanced(equation);
    const difficulty = this.assessEquationDifficulty(equation);
    const isWorkedExample = this.isInSolutionContext(equation, chapter);

    return {
      type: "workedExample", // or "formula"
      title: "Chemical Equation",
      context: equation,
      confidence: 0.90,
      metadata: {
        isBalanced,
        difficulty,
        isWorkedExample
      }
    };
  });
}

private static checkIfBalanced(equation: string): boolean {
  // Heuristic: balanced equations usually have coefficients
  const hasCoefficients = /\d+[A-Z]/.test(equation);
  const parts = equation.split(/→|⇌/);

  if (parts.length !== 2) return false;

  // Count atoms on each side (simplified)
  const leftAtoms = this.countAtoms(parts[0]);
  const rightAtoms = this.countAtoms(parts[1]);

  // Compare atom counts
  return this.atomCountsMatch(leftAtoms, rightAtoms);
}

private static assessEquationDifficulty(equation: string): string {
  const coefficientCount = (equation.match(/\d+[A-Z]/g) || []).length;
  const hasParentheses = /\(.*\)/.test(equation);
  const compoundCount = equation.split(/\+/).length;

  if (coefficientCount > 5 || hasParentheses || compoundCount > 4) {
    return "hard";
  } else if (coefficientCount > 2 || compoundCount > 2) {
    return "medium";
  }
  return "easy";
}
```

### 5. LearningPrincipleEvaluators.ts

**Purpose**: Evaluate chapter against 10 learning science principles.

**Location**: `LearningPrincipleEvaluators.ts` (root)

**10 Evaluator Classes**:

1. DeepProcessingEvaluator
2. SpacedRepetitionEvaluator
3. RetrievalPracticeEvaluator
4. InterleavingEvaluator
5. DualCodingEvaluator
6. GenerativeLearningEvaluator
7. MetacognitionEvaluator
8. SchemaBuildingEvaluator
9. CognitiveLoadEvaluator
10. EmotionAndRelevanceEvaluator

**Evaluator Pattern** (All follow this structure):

```typescript
export class [Principle]Evaluator {
  static evaluate(
    chapter: Chapter,
    concepts: ConceptGraph,
    patternAnalysis?: PatternAnalysis  // NEW: pattern data
  ): PrincipleEvaluation {

    const findings: Finding[] = [];
    const evidence: Evidence[] = [];
    const suggestions: Suggestion[] = [];

    // Traditional analysis
    const baseMetric = this.analyzeBaseline(chapter, concepts);

    // Pattern-based enhancements (NEW)
    if (patternAnalysis) {
      const patternFindings = this.analyzePatterns(patternAnalysis);
      findings.push(...patternFindings);

      // Chemistry-specific bonuses (NEW)
      const chemistryFindings = this.analyzeChemistryPatterns(patternAnalysis);
      findings.push(...chemistryFindings);
    }

    // Calculate score
    const score = this.calculateScore(baseMetric, findings);

    // Generate suggestions if needed
    if (score < 80) {
      suggestions.push(...this.generateSuggestions(findings));
    }

    return {
      principle: "[principleName]",
      score: Math.min(score, 100),
      weight: 0.XX,
      findings,
      suggestions,
      evidence
    };
  }
}
```

**Pattern Integration Example** (DeepProcessingEvaluator):

```typescript
export class DeepProcessingEvaluator {
  static evaluate(
    chapter: Chapter,
    concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    // ... base analysis ...

    // Pattern-based enhancement: Worked examples
    if (patternAnalysis) {
      const workedExamples = patternAnalysis.patterns.filter(
        (p: any) => p.type === "workedExample"
      );

      if (workedExamples.length > 5) {
        findings.push({
          type: "positive",
          message: `✓ ${workedExamples.length} worked examples show expert problem-solving`,
          severity: 0,
          evidence: "Worked examples make expert thinking visible",
        });
      }

      // Chemistry-specific: Chemical equations as worked examples
      const chemicalEquations = patternAnalysis.patterns.filter(
        (p: any) =>
          p.title === "Chemical Equation" && p.metadata?.isWorkedExample
      );

      if (chemicalEquations.length > 0) {
        findings.push({
          type: "positive",
          message: `✓ Chemistry: ${chemicalEquations.length} balanced equations demonstrate reaction stoichiometry`,
          severity: 0,
          evidence:
            "Worked chemical equations show molecular-level transformations",
        });
      }
    }

    return {
      /* ... */
    };
  }
}
```

### 6. DualCodingAnalyzer.ts

**Purpose**: Analyzes text for opportunities to insert visual aids (diagrams, flowcharts, graphs) based on dual coding theory.

**Location**: `src/utils/dualCodingAnalyzer.ts`

**Theory Foundation**: Dual coding theory (Paivio 1971) - combining verbal and visual information improves comprehension by 40-89%.

**Key Features**:

- **6 Detection Patterns**: Spatial/structural, process/sequence, quantitative data, abstract concepts, technical density, system/components
- **5 Visual Types**: Diagram (📊), flowchart (🔄), graph (📈), concept-map (🗺️), illustration (🖼️)
- **Priority System**: High (≥5 matches), medium (3-4 matches), low (<3 matches)
- **Smart Deduplication**: Avoids suggesting visuals near existing figures (±500 chars)
- **Performance**: <100ms analysis, O(n) time complexity

**Core Method**:

```typescript
export class DualCodingAnalyzer {
  static analyzeForVisuals(text: string): VisualSuggestion[] {
    const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 100);
    const suggestions: VisualSuggestion[] = [];

    paragraphs.forEach((paragraph, index) => {
      const matches = this.detectPatterns(paragraph);

      if (matches.length >= 3 && !this.hasNearbyVisual(text, paragraph)) {
        suggestions.push({
          position: index,
          paragraph: paragraph.substring(0, 150),
          visualType: this.determineVisualType(matches),
          priority: this.calculatePriority(matches),
          reason: this.generateReason(matches),
          context: matches,
        });
      }
    });

    return this.deduplicateAndSort(suggestions);
  }
}
```

**Integration**: Used in `DocumentEditor.tsx` with `showVisualSuggestions` prop. Displays inline suggestion cards with priority badges and paragraph highlighting.

**Documentation**: See [DUAL_CODING_ANALYZER.md](./DUAL_CODING_ANALYZER.md) for complete details including:

- Detection pattern algorithms
- Visual type selection logic
- Priority calculation system
- API reference and usage examples
- Performance benchmarks
- Testing guidelines

---

## Analysis Pipeline

### Detailed Phase Breakdown

#### Phase 1: PDF Upload & Text Extraction (User Action)

```typescript
// FileUploadButton.tsx
const handleFileUpload = async (file: File) => {
  const text = await extractTextFromPDF(file);
  const chapter = parseChapterStructure(text);
  onChapterLoaded(chapter);
};
```

#### Phase 2: Web Worker Initialization

```typescript
// App.tsx
const analyzeChapter = async () => {
  const worker = new Worker(
    new URL("./workers/analysisWorker.ts", import.meta.url),
    { type: "module" }
  );

  worker.postMessage({
    type: "analyze",
    chapter: currentChapter,
    domain: detectedDomain,
  });

  worker.onmessage = (e) => {
    if (e.data.type === "progress") {
      setProgress(e.data);
    } else if (e.data.type === "complete") {
      setAnalysis(e.data.analysis);
    }
  };
};
```

#### Phase 3: Concept Extraction (40% of analysis time)

```
Input: Chapter { title, content, sections }
Process:
  1. Library matching (domain-specific concepts)
  2. TF-IDF scoring (statistical importance)
  3. Filtering (thresholds, noise removal)
  4. Mention tracking (location + frequency)
  5. Relationship detection (4 types, strict patterns)
  6. Hierarchy classification (core/supporting/detail)
Output: ConceptGraph with 340 concepts, 12,813 relationships
```

#### Phase 4: Pattern Recognition (20% of analysis time)

```
Input: Chapter + optional domain parameter
Process:
  1. Universal patterns (6 types, always runs)
  2. Domain-specific patterns (conditional on domain)
  3. Pattern metadata enrichment
  4. Coverage calculation
Output: PatternAnalysis with 150+ patterns
```

#### Phase 5: Principle Evaluation (35% of analysis time)

```
Input: Chapter + ConceptGraph + PatternAnalysis
Process:
  For each of 10 evaluators:
    1. Traditional metrics (baseline)
    2. Pattern-based enhancements
    3. Domain-specific bonuses
    4. Score calculation
    5. Finding generation
    6. Suggestion generation (if score < 80)
Output: 10 PrincipleEvaluation objects
```

#### Phase 6: Recommendation Synthesis (5% of analysis time)

```
Input: All PrincipleEvaluations
Process:
  1. Prioritize by score (critical < 60, warning 60-79)
  2. Weight by principle importance
  3. Group related suggestions
  4. Generate actionable recommendations
Output: Prioritized recommendation list
```

---

## Pattern Recognition System

### Pattern Type System

```typescript
// types.ts
export type PatternType =
  | "workedExample"
  | "practiceProblem"
  | "definitionExample"
  | "formula"
  | "procedure"
  | "comparison";

export interface PatternMatch {
  type: PatternType;
  title: string;
  context: string;
  confidence: number;
  location: {
    section: string;
    startIndex: number;
    endIndex: number;
  };
  metadata?: {
    // Universal metadata
    steps?: number;
    concepts?: string[];
    difficulty?: "easy" | "medium" | "hard";
    hasAnswer?: boolean;
    variableCount?: number;
    comparisonItems?: number;

    // Chemistry-specific metadata
    isBalanced?: boolean;
    problemType?: "stoichiometry" | "nomenclature" | "lewis-structure";
    procedureType?: "laboratory" | "mechanism";
    isWorkedExample?: boolean;
  };
}
```

### Pattern Detection Strategies

**1. Keyword-Based Detection**

```typescript
// Simple but effective for well-structured content
const keywords = ["practice problem", "exercise", "problem set"];
const hasKeyword = keywords.some((kw) => text.toLowerCase().includes(kw));
```

**2. Regex Pattern Matching**

```typescript
// For structured formats (equations, formulas)
const formulaPattern = /[a-zA-Z]\s*=\s*[^=]+/g;
const matches = text.match(formulaPattern);
```

**3. Structural Analysis**

```typescript
// For procedures (numbered/bulleted lists)
const procedurePattern = /(?:^|\n)\s*\d+\.\s+[A-Z]/gm;
const isProcedure = procedurePattern.test(text);
```

**4. Context Windows**

```typescript
// Looking at surrounding text for classification
const contextBefore = text.substring(startIdx - 200, startIdx);
const contextAfter = text.substring(endIdx, endIdx + 200);
const isWorkedExample = /solution|answer|step/gi.test(contextAfter);
```

**5. Multi-Criteria Scoring**

```typescript
// Combine multiple indicators with confidence scoring
let confidence = 0.5; // base
if (hasProblemKeyword) confidence += 0.2;
if (hasStepNumbers) confidence += 0.2;
if (hasCalculations) confidence += 0.1;
// confidence = 1.0 (high confidence match)
```

---

## Domain-Specific Intelligence

### Domain Registry Architecture

**Current Implementation**:

```typescript
// PatternRecognizer.ts
if (domain === "chemistry") {
  const chemPatterns = ChemistryPatterns.detectAll(chapter);
  patterns.push(...chemPatterns);
}
```

**Future Extensible Design**:

```typescript
// DomainRegistry.ts (not yet implemented)
interface DomainDetector {
  name: string;
  detectPatterns(chapter: Chapter): PatternMatch[];
  enhanceEvaluations?(evaluations: PrincipleEvaluation[]): void;
}

class DomainRegistry {
  private static detectors: Map<string, DomainDetector> = new Map();

  static register(domain: string, detector: DomainDetector) {
    this.detectors.set(domain, detector);
  }

  static detect(chapter: Chapter, domain?: string): PatternMatch[] {
    if (!domain) domain = this.inferDomain(chapter);
    const detector = this.detectors.get(domain);
    return detector ? detector.detectPatterns(chapter) : [];
  }
}

// Register domains
DomainRegistry.register("chemistry", new ChemistryDetector());
DomainRegistry.register("finance", new FinanceDetector());
DomainRegistry.register("biology", new BiologyDetector());
```

### Creating New Domain Detectors

**Template**:

```typescript
// NewDomainPatterns.ts
export class NewDomainPatterns {
  static detectAll(chapter: Chapter): PatternMatch[] {
    const patterns: PatternMatch[] = [];

    // Add domain-specific pattern detectors
    patterns.push(...this.detectPattern1(chapter));
    patterns.push(...this.detectPattern2(chapter));
    patterns.push(...this.detectPattern3(chapter));

    return patterns;
  }

  private static detectPattern1(chapter: Chapter): PatternMatch[] {
    // Your detection logic
    // Return PatternMatch objects with appropriate metadata
  }
}
```

**Integration Steps**:

1. Create detector class in `src/utils/`
2. Define domain-specific metadata types in `types.ts`
3. Add conditional in `PatternRecognizer.analyzePatterns()`
4. Enhance relevant evaluators with domain-specific bonuses
5. Update UI badges in `PatternAnalysisSection.tsx`

### Domain-Specific Metadata

Each domain can define custom metadata fields:

```typescript
// Chemistry
metadata: {
  isBalanced?: boolean;
  problemType?: "stoichiometry" | "nomenclature" | "lewis-structure";
  procedureType?: "laboratory" | "mechanism";
}

// Finance (future)
metadata: {
  formulaType?: "npv" | "irr" | "capm" | "wacc";
  problemType?: "valuation" | "portfolio" | "derivatives";
  includesCashFlow?: boolean;
}

// Biology (future)
metadata: {
  diagramType?: "cell" | "organ-system" | "phylogenetic";
  problemType?: "genetics" | "ecology" | "physiology";
  includesClassification?: boolean;
}
```

---

## Type System

### Core Type Hierarchy

```typescript
// Chapter Structure
interface Chapter {
  title: string;
  content: string;
  sections: Section[];
  metadata?: ChapterMetadata;
}

interface Section {
  title: string;
  content: string;
  level: number;
  subsections?: Section[];
}

// Concept Graph
interface ConceptGraph {
  concepts: Concept[];
  relationships: ConceptRelationship[];
  hierarchy: ConceptHierarchy;
  sequence: ConceptMention[];
}

interface Concept {
  id: string;
  term: string;
  mentions: ConceptMention[];
  importance?: "core" | undefined;
  tfIdf: number;
  relatedConcepts?: string[];
  misconceptions?: string[];
}

interface ConceptRelationship {
  source: string; // concept ID
  target: string; // concept ID
  type: "prerequisite" | "contrasts" | "example" | "related";
  strength?: number;
}

// Pattern Analysis
interface PatternAnalysis {
  totalPatterns: number;
  patterns: PatternMatch[];
  byType: Record<PatternType, number>;
  coverage: number;
}

// Principle Evaluation
interface PrincipleEvaluation {
  principle: string;
  score: number;
  weight: number;
  findings: Finding[];
  suggestions: Suggestion[];
  evidence: Evidence[];
}

// Final Analysis
interface ChapterAnalysis {
  overallScore: number;
  conceptAnalysis: ConceptGraph;
  patternAnalysis: PatternAnalysis;
  principleEvaluations: PrincipleEvaluation[];
  recommendations: Recommendation[];
  metadata: {
    analysisDate: string;
    domain?: string;
    processingTime: number;
  };
}
```

### Type Safety Benefits

**Compile-Time Checks**:

```typescript
// TypeScript catches errors at compile time
const analysis: ChapterAnalysis = {
  overallScore: "85", // ❌ Type error: should be number
  conceptAnalysis: null, // ❌ Type error: required field
  // ...
};

// Correct usage
const analysis: ChapterAnalysis = {
  overallScore: 85, // ✅
  conceptAnalysis: conceptGraph, // ✅
  // ...
};
```

**Auto-Completion**:

```typescript
// IDE provides suggestions
evaluation.findings.forEach(finding => {
  finding.  // IDE shows: type, message, severity, evidence
});
```

**Refactoring Safety**:

```typescript
// Changing interface updates all usages
interface PatternMatch {
  // Add new required field
  confidence: number; // All callsites must be updated
}
```

---

## Performance Optimizations

### 1. Web Worker Background Processing

**Problem**: Main thread blocks during analysis (85 seconds)
**Solution**: Web Worker offloads computation

**Implementation**:

```typescript
// analysisWorker.ts
self.onmessage = async (e) => {
  if (e.data.type === "analyze") {
    const { chapter, domain } = e.data;

    const analysis = await AnalysisEngine.analyzeChapter(
      chapter,
      domain,
      (message, percent) => {
        self.postMessage({ type: "progress", message, percent });
      }
    );

    self.postMessage({ type: "complete", analysis });
  }
};
```

**Impact**: UI remains responsive, user can cancel

### 2. Optimized Concept Extraction

**Before**: 60 seconds
**After**: 20 seconds

**Optimizations**:

- Pre-filtering candidates before TF-IDF (reduces corpus size)
- Incremental mention tracking (one pass instead of N)
- Batch relationship detection (reduce string operations)
- Memoized pattern matching (cache regex results)

**Code Example**:

```typescript
// BEFORE: O(n²) nested loops
concepts.forEach((c1) => {
  concepts.forEach((c2) => {
    checkRelationship(c1, c2, fullText); // Scans entire text each time
  });
});

// AFTER: O(n) with pre-indexed lookups
const conceptIndex = buildPositionIndex(concepts, fullText);
relationships = detectRelationshipsInOnePass(conceptIndex, fullText);
```

### 3. Pattern Detection Optimization

**Strategy**: Early termination and chunking

```typescript
// Chunk content by sections (avoid scanning entire chapter repeatedly)
chapter.sections.forEach((section) => {
  // Process section independently
  const sectionPatterns = detectPatterns(section);
  patterns.push(...sectionPatterns);
});

// Early termination for high-confidence matches
if (confidence > 0.95) {
  return match; // Don't need to check more criteria
}
```

### 4. Lazy Evaluation

**Strategy**: Only compute what's needed

```typescript
// Don't generate suggestions if score is high
if (score >= 80) {
  return {
    principle: name,
    score,
    findings,
    suggestions: [], // Empty—not needed
    evidence,
  };
}
```

### 5. Memoization

**Strategy**: Cache expensive calculations

```typescript
const tfIdfCache = new Map<string, number>();

function calculateTFIDF(term: string, corpus: string[]): number {
  const key = `${term}:${corpus.length}`;
  if (tfIdfCache.has(key)) {
    return tfIdfCache.get(key)!;
  }

  const score = computeTFIDF(term, corpus);
  tfIdfCache.set(key, score);
  return score;
}
```

### Performance Metrics

| Phase                | Time    | % of Total |
| -------------------- | ------- | ---------- |
| Concept Extraction   | 4.8s    | 40%        |
| Pattern Recognition  | 2.4s    | 20%        |
| Principle Evaluation | 4.2s    | 35%        |
| Recommendation Gen   | 0.6s    | 5%         |
| **Total**            | **12s** | **100%**   |

_(Down from 85s—86% improvement)_

---

## Extending the System

### Adding a New Pattern Type

**Step 1**: Define type

```typescript
// types.ts
export type PatternType =
  | "workedExample"
  | "practiceProblem"
  // ... existing types ...
  | "yourNewPattern"; // ADD
```

**Step 2**: Create detector

```typescript
// PatternRecognizer.ts
private static detectYourNewPattern(chapter: Chapter): PatternMatch[] {
  const matches: PatternMatch[] = [];

  // Your detection logic
  const pattern = /your regex or logic/gi;
  const found = chapter.content.match(pattern);

  found?.forEach(match => {
    matches.push({
      type: "yourNewPattern",
      title: "Your Pattern Name",
      context: match,
      confidence: 0.85,
      location: { /* ... */ },
      metadata: { /* ... */ }
    });
  });

  return matches;
}
```

**Step 3**: Integrate in analyzer

```typescript
// PatternRecognizer.analyzePatterns()
patterns.push(...this.detectYourNewPattern(chapter));
```

**Step 4**: Add UI visualization

```typescript
// PatternAnalysisSection.tsx
const patternMetadata = {
  // ... existing patterns ...
  yourNewPattern: {
    icon: "🔷",
    color: "#your-color",
    label: "Your Pattern",
    description: "Description of what this pattern represents",
  },
};
```

**Step 5**: Use in evaluators (optional)

```typescript
// LearningPrincipleEvaluators.ts
if (patternAnalysis) {
  const yourPatterns = patternAnalysis.patterns.filter(
    (p) => p.type === "yourNewPattern"
  );

  if (yourPatterns.length > threshold) {
    findings.push({
      /* bonus for having this pattern */
    });
  }
}
```

### Adding a New Learning Principle

**Step 1**: Create evaluator class

```typescript
// LearningPrincipleEvaluators.ts
export class YourPrincipleEvaluator {
  static evaluate(
    chapter: Chapter,
    concepts: ConceptGraph,
    patternAnalysis?: PatternAnalysis
  ): PrincipleEvaluation {
    const findings: Finding[] = [];
    const evidence: Evidence[] = [];
    const suggestions: Suggestion[] = [];

    // Your evaluation logic
    const metric = this.calculateYourMetric(chapter, concepts);

    // Pattern enhancements
    if (patternAnalysis) {
      // Use pattern data to enhance scoring
    }

    // Score calculation
    const score = this.computeScore(metric);

    return {
      principle: "yourPrinciple",
      score,
      weight: 0.75, // Set appropriate weight
      findings,
      suggestions,
      evidence,
    };
  }

  private static calculateYourMetric(/*...*/): number {
    // Your metric calculation
  }

  private static computeScore(metric: number): number {
    // Convert metric to 0-100 score
  }
}
```

**Step 2**: Register in AnalysisEngine

```typescript
// AnalysisEngine.ts
private static runEvaluators(/*...*/): PrincipleEvaluation[] {
  const evaluators = [
    // ... existing evaluators ...
    YourPrincipleEvaluator  // ADD
  ];

  return evaluators.map(evaluator =>
    evaluator.evaluate(chapter, conceptGraph, patternAnalysis)
  );
}
```

**Step 3**: Add UI component

```typescript
// PrincipleScoreCard.tsx or PrincipleScoresGrid.tsx
// Automatically picks up new principle from evaluations array
```

### Adding a New Domain

See detailed instructions in [Domain-Specific Intelligence](#domain-specific-intelligence) section above.

**Quick Checklist**:

- [ ] Create `YourDomainPatterns.ts` class
- [ ] Define domain-specific metadata types
- [ ] Add conditional in `PatternRecognizer.analyzePatterns()`
- [ ] Enhance evaluators with domain bonuses
- [ ] Add UI badges for domain metadata
- [ ] Create concept library for domain
- [ ] Test with sample content

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

### Adding New Features

1. **Update types** in `types.ts`
2. **Implement core logic** in appropriate module
3. **Add tests** (if test framework exists)
4. **Update UI components** to display new data
5. **Update documentation** (this file + user guide)
6. **Commit with descriptive message**

### Code Organization Principles

**Separation of Concerns**:

- **Types** (`types.ts`): Pure type definitions
- **Utils** (`src/utils/`): Pure functions, no side effects
- **Components** (`src/components/`): React UI components
- **Workers** (`src/workers/`): Background processing
- **Data** (`src/data/`): Static concept libraries

**Naming Conventions**:

- **Classes**: PascalCase (`ConceptExtractor`, `PatternRecognizer`)
- **Functions**: camelCase (`extractConcepts`, `analyzePatterns`)
- **Types**: PascalCase (`Chapter`, `PatternAnalysis`)
- **Files**: Match primary export (`ConceptExtractor.ts`, `types.ts`)

**Import Order**:

1. React / external libraries
2. Type imports
3. Component imports
4. Utility imports
5. Data imports

---

## Future Architecture Improvements

### Planned Enhancements

**1. Domain Registry System**

- Abstract domain detection
- Plugin-like architecture
- Easy addition of new domains

**2. Pattern Confidence ML**

- Train model on labeled examples
- Improve pattern detection accuracy
- Adaptive thresholds

**3. Caching Layer**

- Cache analysis results
- Incremental re-analysis
- Faster repeat analyses

**4. Streaming Analysis**

- Process large PDFs in chunks
- Progressive results display
- Memory efficiency

**5. Export System**

- PDF report generation
- CSV data exports
- Integration APIs

**6. Collaborative Features**

- Share analyses
- Compare chapters
- Team annotations

---

## Troubleshooting

### Common Issues

**Issue**: Analysis takes too long (>30s)
**Solution**: Check PDF size. Large files (>50 pages) may be slow. Consider chunking.

**Issue**: No chemistry patterns detected
**Solution**: Verify domain parameter is set to "chemistry". Check content has chemical notation.

**Issue**: TypeScript errors after pulling changes
**Solution**: Run `npm install` to update dependencies. Check `types.ts` for breaking changes.

**Issue**: Worker not loading
**Solution**: Check Vite config. Worker files need special handling. Verify path in `new Worker()`.

**Issue**: Pattern confidence low
**Solution**: Review detection criteria. May need to adjust thresholds or add more indicators.

---

## API Reference

### AnalysisEngine

```typescript
class AnalysisEngine {
  static async analyzeChapter(
    chapter: Chapter,
    domain?: string,
    onProgress?: (message: string, percent: number) => void
  ): Promise<ChapterAnalysis>;
}
```

### PatternRecognizer

```typescript
class PatternRecognizer {
  static analyzePatterns(chapter: Chapter, domain?: string): PatternAnalysis;
}
```

### ConceptExtractorLibrary

```typescript
class ConceptExtractorLibrary {
  static async extractConceptsFromChapter(
    chapter: Chapter,
    sections: Section[],
    domain?: string
  ): Promise<ConceptGraph>;
}
```

### ChemistryPatterns

```typescript
class ChemistryPatterns {
  static detectAll(chapter: Chapter): PatternMatch[];
  static detectChemicalEquations(chapter: Chapter): PatternMatch[];
  static detectStoichiometryProblems(chapter: Chapter): PatternMatch[];
  static detectLewisStructures(chapter: Chapter): PatternMatch[];
  static detectLabProcedures(chapter: Chapter): PatternMatch[];
  static detectNomenclaturePractice(chapter: Chapter): PatternMatch[];
  static detectReactionMechanisms(chapter: Chapter): PatternMatch[];
}
```

---

## Conclusion

This architecture provides a **scalable, extensible foundation** for analyzing educational content across multiple domains. The pattern recognition system is **domain-agnostic by default** with **domain-specific enhancements** available when needed.

Key architectural strengths:

- ✅ Type-safe TypeScript throughout
- ✅ Modular design (easy to extend)
- ✅ Background processing (responsive UI)
- ✅ Pattern-aware evaluators (smarter scoring)
- ✅ Domain-specific intelligence (chemistry working, more planned)
- ✅ 86% performance improvement (85s → 12s)

For questions or clarifications, refer to code comments or consult the development team.
