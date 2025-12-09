# QuillPilot Power Features 🚀

Advanced capabilities for professional writers and manuscript development.

## Overview

QuillPilot Power Features extend the core analysis engine with professional-grade tools for manuscript comparison, batch processing, export capabilities, AI-powered suggestions, and real-time writing assistance.

## 📊 1. Manuscript Comparison Engine

### Purpose

Track improvem ents between manuscript versions and measure revision effectiveness.

### Features

- **Side-by-side metric comparison** - Before/after scores for all 33+ metrics
- **Category breakdown** - Core, Prose, Visual, Advanced, Fiction element analysis
- **Change detection** - Significant improvements and declines highlighted
- **Grade system** - A+ to F grading based on overall improvement
- **Smart recommendations** - Contextual advice based on change patterns

### Usage

```typescript
import {
  compareManuscripts,
  generateComparisonSummary,
} from "./utils/comparisonEngine";

const comparison = compareManuscripts(versionBefore, versionAfter);

console.log(comparison.summary.overallImprovement); // +12.5 points
console.log(comparison.summary.metricsImproved); // 18
console.log(comparison.summary.metricsDeclined); // 3

// Generate readable summary
const summary = generateComparisonSummary(comparison);
```

### Key Metrics

- **Overall Improvement Score** - Aggregate change across all metrics
- **Metrics Improved/Declined/Unchanged** - Count of each category
- **Significant Changes** - Top 5 largest metric shifts
- **Category Breakdown** - Average change by category (Core, Prose, etc.)
- **Strengths & Concerns** - Automatic identification of patterns

### Grading Scale

- **A+ (90+)**: Exceptional improvement
- **A (85-89)**: Strong revision work
- **B+ (80-84)**: Good progress
- **B (70-79)**: Minor improvements
- **C (60-69)**: Mixed results
- **D (50-59)**: Some regression
- **F (<50)**: Significant decline

---

## 📤 2. Advanced Export System

### Purpose

Export analysis results in multiple formats for documentation, reporting, and integration.

### Supported Formats

#### JSON Export

```typescript
import { exportToJSON, downloadFile } from "./utils/exportSystem";

const jsonData = exportToJSON(analysis, {
  format: "json",
  includeRecommendations: true,
  includeRawData: true,
  includeComparison: true,
  comparisonData: comparison,
});

downloadFile(jsonData, "analysis.json", "application/json");
```

**Includes:**

- Metadata (date, chapter ID, overall score)
- All principle scores with details
- Raw analysis data (character, prose, conflict, sensory)
- Comparison data (if provided)

#### CSV Export

```typescript
const csvData = exportToCSV(analysis);
downloadFile(csvData, "analysis.csv", "text/csv");
```

**Format:** Metric, Score, Weight, Category

#### Markdown Export

```typescript
const mdData = exportToMarkdown(analysis, {
  format: "markdown",
  includeRecommendations: true,
  includeRawData: true,
});

downloadFile(mdData, "analysis.md", "text/markdown");
```

**Includes:**

- Overall score with letter grade
- Metrics by category (Core, Prose, Visual, Advanced, Fiction)
- Character analysis details
- Prose quality breakdown
- Conflict & sensory balance data
- Prioritized recommendations
- Comparison data (if provided)

#### Excel Export (Multi-sheet CSV)

```typescript
const excelData = exportToExcel(analysis);
// Generates 3 separate CSV files:
// - overview.csv: Summary statistics
// - metrics.csv: All scores with details
// - details.csv: Component-specific data
```

### Auto-Download Function

```typescript
import { exportAnalysis } from "./utils/exportSystem";

exportAnalysis(analysis, {
  format: "markdown",
  includeRecommendations: true,
  includeRawData: true,
});
// Automatically generates filename with date: quillpilot-analysis-2025-11-23.md
```

---

## 🔄 3. Batch Analysis Pipeline

### Purpose

Analyze multiple chapters simultaneously with consistency checking and manuscript-wide insights.

### Features

- **Concurrent processing** - Analyze up to 3 chapters in parallel (configurable)
- **Progress tracking** - Real-time updates on current chapter
- **Consistency scoring** - Detect quality variations across chapters
- **Outlier detection** - Identify exceptionally strong/weak chapters
- **Aggregate insights** - Manuscript-wide strengths and weaknesses

### Usage

```typescript
import {
  batchAnalyzeChapters,
  generateBatchSummary,
} from "./utils/batchAnalysis";

const result = await batchAnalyzeChapters(chapters, {
  genre: "fantasy",
  concurrency: 3,
  onProgress: (current, total, fileName) => {
    console.log(`Analyzing ${current}/${total}: ${fileName}`);
  },
  onChapterComplete: (index, analysis) => {
    console.log(`Chapter ${index + 1} complete: ${analysis.overallScore}/100`);
  },
});

// View summary statistics
console.log(result.summary);
// {
//   totalChapters: 10,
//   averageScore: 78.5,
//   highestScore: 92,
//   lowestScore: 64,
//   totalWords: 85000,
//   totalReadingTime: 340,
//   consistencyScore: 82
// }

// Generate readable report
const report = generateBatchSummary(result);
```

### Key Insights

#### Summary Statistics

- Total chapters analyzed
- Average, highest, lowest scores
- Consistency score (0-100, based on standard deviation)
- Total word count and reading time

#### Strongest/Weakest Areas

- Aggregated metrics across all chapters
- Top 5 consistently strong areas
- Top 5 consistently weak areas

#### Consistency Issues

- Metrics with high variance between chapters
- Helps identify tone/quality shifts

#### Chapter Comparisons

- Each chapter marked as high/low/average performer
- Quick identification of outliers

### Advanced Functions

#### Find Outliers

```typescript
import { findOutlierChapters } from "./utils/batchAnalysis";

const { highPerformers, lowPerformers } = findOutlierChapters(result, 15);
// Returns chapter indices that differ significantly from average
```

#### Compare Metric Across Chapters

```typescript
import { compareMetricAcrossChapters } from "./utils/batchAnalysis";

const pacingComparison = compareMetricAcrossChapters(result, "pacing");
// Returns pacing scores for each chapter
```

#### Export Batch Results

```typescript
import { exportBatchResultsToCSV } from "./utils/batchAnalysis";

const csv = exportBatchResultsToCSV(result);
// CSV with: Chapter, Score, Words, Reading Time, Status
```

---

## 🤖 4. AI-Powered Improvement Suggestions

### Purpose

Generate specific, actionable rewrite suggestions with before/after examples for every weak area.

### Features

- **10+ Suggestion Types** - Covers all major writing issues
- **Priority Categorization** - Critical, High, Medium, Low
- **Concrete Examples** - Before/after rewrites for every suggestion
- **Improvement Plans** - Organized by immediate/short-term/long-term actions
- **Focus Area Detection** - Identifies top 3 categories needing attention

### Usage

```typescript
import {
  generateImprovementSuggestions,
  generateImprovementPlan,
  exportSuggestionsToMarkdown,
} from "./utils/improvementSuggestions";

const suggestions = generateImprovementSuggestions(analysis);

// Get structured improvement plan
const plan = generateImprovementPlan(suggestions);

console.log(plan.focusAreas); // ['dialogue', 'conflict', 'prose']
console.log(plan.immediateActions.length); // 3 critical fixes
console.log(plan.shortTerm.length); // 5 high-priority improvements
console.log(plan.longTerm.length); // 8 polish items

// Export to markdown
const md = exportSuggestionsToMarkdown(suggestions);
```

### Suggestion Categories

#### 1. Show vs Tell

- **Issue:** Abstract emotional statements
- **Fix:** Concrete actions and body language
- **Example:**
  - ❌ "Sarah was angry at her brother."
  - ✅ "Sarah's jaw clenched. She slammed the door behind her, rattling the picture frames."

#### 2. Dialogue Attribution

- **Issue:** Overusing "said" or redundant adverbs
- **Fix:** Vary tags, use action beats, omit when clear
- **Example:**
  - ❌ '"I don\'t know," she said. "Maybe we should go," she said.'
  - ✅ '"I don\'t know." She glanced at the door. "Maybe we should go."'

#### 3. Pacing & Rhythm

- **Issue:** Monotonous sentence lengths
- **Fix:** Vary deliberately for tension and reflection
- **Example:**
  - ❌ "The door opened slowly and she walked into the dark room where shadows filled every corner and she felt afraid."
  - ✅ "The door creaked open. She stepped into darkness. Shadows pressed in from every corner. Her heart raced."

#### 4. Character Development

- **Issue:** Flat character arcs
- **Fix:** Internal conflicts and emotional growth
- **Example:**
  - ❌ "John was a brave detective who always caught the criminal."
  - ✅ "John had been fearless once. Now, after losing his partner, every dark alley made his hands shake. But he couldn't let fear win."

#### 5. Active Voice

- **Issue:** Passive constructions weaken prose
- **Fix:** Convert to active for immediacy
- **Example:**
  - ❌ "The door was opened by Maria."
  - ✅ "Maria opened the door."

#### 6. Adverb Reduction

- **Issue:** Overuse indicates weak verb choices
- **Fix:** Stronger, more specific verbs
- **Example:**
  - ❌ "She walked quickly to the store."
  - ✅ "She hurried to the store."

#### 7. Conflict Presence

- **Issue:** Low tension, few obstacles
- **Fix:** Add stakes in every scene
- **Example:**
  - ❌ "They had lunch and talked about the weather."
  - ✅ 'They ordered lunch, but Sarah kept checking her phone. "Expecting someone?" Mark asked, trying to sound casual.'

#### 8. Internal Conflict

- **Issue:** No inner struggles
- **Fix:** Show doubts and moral dilemmas
- **Example:**
  - ❌ "Tom decided to help."
  - ✅ "Tom's stomach twisted. Helping meant betraying Sarah's trust. But doing nothing meant watching someone suffer."

#### 9. Sensory Details

- **Issue:** Visual-heavy descriptions
- **Fix:** Add sound, texture, smell, taste
- **Example:**
  - ❌ "The old house looked abandoned."
  - ✅ "The old house sagged against the sky. Rotting wood filled the air with sweetness. Rusted hinges groaned in the wind."

#### 10. Cliché Reduction

- **Issue:** Predictable phrases
- **Fix:** Original, specific descriptions
- **Example:**
  - ❌ "Her eyes sparkled like diamonds."
  - ✅ "Her eyes caught the lamplight, sharp and hungry."

### Priority Levels

- **Critical** - Score < 40, fundamental issues blocking reader engagement
- **High** - Score 40-59, significant weaknesses requiring attention
- **Medium** - Score 60-79, good foundation but needs refinement
- **Low** - Score 80+, minor polish for professional finish

### Improvement Plan Structure

```typescript
{
  immediateActions: [
    // Critical + top 2 high priority
  ],
  shortTerm: [
    // Remaining high + top 3 medium
  ],
  longTerm: [
    // Remaining medium + all low
  ],
  focusAreas: [
    // Top 3 categories needing most work
  ]
}
```

---

## ⚡ 5. Real-time Writing Assistant

### Purpose

Live feedback as you type with instant issue detection and inline suggestions.

### Features

- **8 Issue Types** - Passive voice, weak verbs, adverbs, filters, clichés, repetition, long sentences, telling
- **Severity Levels** - Error, Warning, Suggestion
- **Paragraph Metrics** - Live word count, complexity, readability
- **Pacing Detection** - Fast/medium/slow classification
- **Quick Feedback** - Instant paragraph quality score
- **Inline Highlighting** - Color-coded issue markers

### Usage

```typescript
import {
  analyzeRealtimeText,
  getQuickFeedback,
  getInlineSuggestion,
} from "./utils/realtimeAssistant";

// Analyze as user types
const result = analyzeRealtimeText(currentParagraph);

console.log(result.score); // 0-100 quality score
console.log(result.metrics);
// {
//   wordCount: 87,
//   sentenceCount: 5,
//   avgSentenceLength: 17.4,
//   complexityScore: 45,
//   readingLevel: 9.2,
//   pacing: 'medium'
// }

console.log(result.issues.length); // 7 issues found
console.log(result.suggestions); // Contextual tips

// Quick feedback for current paragraph
const feedback = getQuickFeedback(currentParagraph);
// "⚠️ Fair paragraph - consider revisions"

// Get suggestion at cursor position
const suggestion = getInlineSuggestion(text, cursorPos, result.issues);
if (suggestion) {
  console.log(suggestion.message);
  console.log(suggestion.suggestion);
}
```

### Issue Types

#### 1. Passive Voice

- **Pattern:** "was/were + past participle"
- **Severity:** Warning
- **Message:** "Consider using active voice for stronger prose"

#### 2. Weak Verbs

- **Pattern:** is, are, was, were, get, got, make, have, etc.
- **Severity:** Suggestion
- **Message:** "Use a more specific, vivid verb"

#### 3. Adverbs

- **Pattern:** Words ending in -ly
- **Severity:** Suggestion
- **Message:** "Consider replacing adverb with stronger verb"

#### 4. Filter Words

- **Pattern:** saw, heard, felt, noticed, seemed, realized, thought
- **Severity:** Warning
- **Message:** "Filter word creates distance"

#### 5. Clichés

- **Pattern:** Common phrases like "at the end of the day", "eyes sparkled"
- **Severity:** Warning
- **Message:** "Clichéd phrase detected"

#### 6. Repetition

- **Pattern:** Same word within 50 characters
- **Severity:** Suggestion
- **Message:** "Word repeated nearby"

#### 7. Long Sentences

- **Pattern:** Sentences > 35 words
- **Severity:** Suggestion
- **Message:** "Long sentence may be hard to follow"

#### 8. Telling vs Showing

- **Pattern:** "felt/was angry/sad/happy"
- **Severity:** Warning
- **Message:** "Show emotion through actions and body language"

### Paragraph Metrics

#### Word Count

Total words in paragraph

#### Sentence Count

Number of complete sentences

#### Average Sentence Length

Words per sentence (target: 12-20)

#### Complexity Score

0-100 scale based on sentence length, punctuation, and structure

- 0-30: Simple
- 31-60: Moderate
- 61-100: Complex

#### Reading Level

Flesch-Kincaid grade level

- 5-8: Easy to read
- 9-12: Standard
- 13+: College level

#### Pacing

- **Fast:** Avg sentence < 12 words
- **Medium:** Avg sentence 12-20 words
- **Slow:** Avg sentence > 20 words

### Score Calculation

```
score = 100
  - (error_count × 10)
  - (warning_count × 5)
  - (suggestion_count × 2)
```

### Quality Feedback

- **85-100:** ✅ Strong paragraph
- **70-84:** 👍 Good paragraph
- **50-69:** ⚠️ Fair paragraph
- **0-49:** 🔴 Needs work

### Customization

```typescript
import {
  RealtimeSettings,
  DEFAULT_REALTIME_SETTINGS,
} from "./utils/realtimeAssistant";

const settings: RealtimeSettings = {
  ...DEFAULT_REALTIME_SETTINGS,
  enablePassiveVoiceDetection: true,
  enableAdverbDetection: false, // Disable adverb checking
  minimumSeverity: "warning", // Only show warnings and errors
};
```

---

## 🎯 Integration Examples

### Complete Workflow

```typescript
// 1. Real-time analysis while writing
const liveResult = analyzeRealtimeText(currentParagraph);

// 2. Full analysis when done
const fullAnalysis = await AnalysisEngine.analyzeChapter(
  chapter,
  undefined,
  "fantasy"
);

// 3. Generate improvement suggestions
const suggestions = generateImprovementSuggestions(fullAnalysis);
const plan = generateImprovementPlan(suggestions);

// 4. Export results
exportAnalysis(fullAnalysis, {
  format: "markdown",
  includeRecommendations: true,
  includeRawData: true,
});

// 5. Compare with previous version
const comparison = compareManuscripts(oldAnalysis, fullAnalysis);
const summary = generateComparisonSummary(comparison);

// 6. Batch analyze full manuscript
const batchResult = await batchAnalyzeChapters(allChapters, {
  genre: "fantasy",
  concurrency: 3,
});
```

### React Component Integration

```typescript
import { useState, useEffect } from "react";
import { analyzeRealtimeText } from "./utils/realtimeAssistant";

function WritingEditor() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (text.length > 50) {
        const result = analyzeRealtimeText(text);
        setAnalysis(result);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [text]);

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      {analysis && (
        <div>
          <div>Score: {analysis.score}/100</div>
          <div>Pacing: {analysis.metrics.pacing}</div>
          <div>Issues: {analysis.issues.length}</div>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Performance Considerations

### Real-time Assistant

- Debounce input: 300-500ms recommended
- Only analyze if text > 50 characters
- Limit to current paragraph, not entire document

### Batch Analysis

- Default concurrency: 3 chapters
- Increase for faster machines: up to 5
- Progress callbacks prevent UI freezing

### Export

- JSON export: < 100KB for typical analysis
- Markdown export: Human-readable, ~50KB
- CSV export: Fastest, minimal size

---

## 🔒 Best Practices

### 1. Manuscript Comparison

- Compare drafts of same chapter, not different chapters
- Look for patterns, not individual metric changes
- Focus on category trends (Prose, Fiction Elements, etc.)

### 2. Batch Analysis

- Analyze entire manuscript at once for consistency insights
- Use outlier detection to find weak chapters
- Export batch CSV for tracking progress over time

### 3. Improvement Suggestions

- Start with immediate actions (critical priority)
- Tackle one focus area at a time
- Review examples before applying to your manuscript

### 4. Real-time Assistant

- Enable only while actively writing
- Disable during brainstorming/freewriting
- Customize severity threshold based on draft stage

### 5. Export

- Use JSON for programmatic access
- Use Markdown for readable reports
- Use Excel (CSV) for data analysis in spreadsheets

---

## 🚀 Future Enhancements

Planned additions to Power Features:

1. **AI Rewrite Engine** - Automatic text improvements
2. **Manuscript Timeline Tracking** - Version history with graphs
3. **Collaborative Comparison** - Compare with other writers' averages
4. **Custom Rule Builder** - Define your own style guidelines
5. **Integration APIs** - Connect to Scrivener, Google Docs, etc.

---

## 📝 Summary

QuillPilot Power Features transform the analysis engine into a comprehensive manuscript development suite. From tracking revisions to real-time writing assistance, these tools support writers at every stage from first draft to final polish.

**Quick Reference:**

- 📊 Compare versions → `comparisonEngine.ts`
- 📤 Export results → `exportSystem.ts`
- 🔄 Batch analyze → `batchAnalysis.ts`
- 🤖 Get suggestions → `improvementSuggestions.ts`
- ⚡ Live feedback → `realtimeAssistant.ts`

For technical implementation details, see the inline documentation in each utility file.
