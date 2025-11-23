/**
 * QuillPilot Power Features - Usage Examples
 *
 * This file demonstrates how to use all 5 power features:
 * 1. Manuscript Comparison Engine
 * 2. Advanced Export System
 * 3. Batch Analysis Pipeline
 * 4. AI-Powered Improvement Suggestions
 * 5. Real-time Writing Assistant
 */

import { AnalysisEngine } from "../components/AnalysisEngine";
import type { Chapter, ChapterAnalysis } from "../types";

// ============================================================================
// 1. MANUSCRIPT COMPARISON ENGINE
// ============================================================================

import {
  compareManuscripts,
  generateComparisonSummary,
  getComparisonGrade,
} from "../utils/comparisonEngine";

async function compareVersionsExample() {
  // Analyze version 1
  const version1: Chapter = {
    id: "ch1-v1",
    title: "Chapter 1 - Draft 1",
    content: `Your original manuscript text here...`,
    wordCount: 2500,
    sections: [],
    conceptGraph: {
      concepts: [],
      relationships: [],
      hierarchy: { core: [], supporting: [], detail: [] },
      sequence: [],
    },
    metadata: {
      readingLevel: "intermediate",
      genre: "fantasy",
      targetAudience: "adult",
      estimatedReadingTime: 10,
      createdAt: new Date(),
      lastAnalyzed: new Date(),
    },
  };

  const analysis1 = await AnalysisEngine.analyzeChapter(
    version1,
    undefined,
    "fantasy"
  );

  // Analyze version 2 (after revision)
  const version2: Chapter = {
    ...version1,
    id: "ch1-v2",
    title: "Chapter 1 - Draft 2",
    content: `Your revised manuscript text here...`,
  };

  const analysis2 = await AnalysisEngine.analyzeChapter(
    version2,
    undefined,
    "fantasy"
  );

  // Compare the two versions
  const comparison = compareManuscripts(analysis1, analysis2);

  console.log("=== MANUSCRIPT COMPARISON ===");
  console.log(
    `Overall Improvement: ${
      comparison.summary.overallImprovement > 0 ? "+" : ""
    }${comparison.summary.overallImprovement.toFixed(1)} points`
  );
  console.log(`Metrics Improved: ${comparison.summary.metricsImproved}`);
  console.log(`Metrics Declined: ${comparison.summary.metricsDeclined}`);

  // Get grade
  const grade = getComparisonGrade(comparison.summary.overallImprovement);
  console.log(`Grade: ${grade.grade} - ${grade.message}`);

  // Print significant changes
  console.log("\nSignificant Changes:");
  comparison.summary.significantChanges.forEach((change) => {
    const arrow = change.improved ? "⬆️" : "⬇️";
    console.log(
      `${arrow} ${change.name}: ${change.before.toFixed(
        1
      )} → ${change.after.toFixed(1)}`
    );
  });

  // Generate readable summary
  const summary = generateComparisonSummary(comparison);
  console.log("\n" + summary);
}

// ============================================================================
// 2. ADVANCED EXPORT SYSTEM
// ============================================================================

import {
  exportToJSON,
  exportToCSV,
  exportToMarkdown,
  exportToExcel,
  exportAnalysis,
  downloadFile,
} from "../utils/exportSystem";

async function exportExample(analysis: ChapterAnalysis) {
  console.log("=== EXPORT EXAMPLES ===");

  // Export to JSON (with all data)
  const jsonData = exportToJSON(analysis, {
    format: "json",
    includeRecommendations: true,
    includeRawData: true,
  });
  console.log("JSON Export length:", jsonData.length, "bytes");

  // Export to CSV (simple metrics table)
  const csvData = exportToCSV(analysis);
  console.log("CSV Export:", csvData.split("\n").length, "rows");

  // Export to Markdown (full report)
  const mdData = exportToMarkdown(analysis, {
    format: "markdown",
    includeRecommendations: true,
    includeRawData: true,
  });
  console.log("Markdown Export length:", mdData.length, "characters");

  // Export to Excel (3 CSV files)
  const excelData = exportToExcel(analysis);
  console.log("Excel Export - 3 sheets:", Object.keys(excelData).join(", "));

  // Auto-download (triggers browser download)
  exportAnalysis(analysis, {
    format: "markdown",
    includeRecommendations: true,
    includeRawData: true,
  });
  console.log("✓ Markdown file downloaded");

  // Manual download with custom filename
  downloadFile(jsonData, "my-custom-analysis.json", "application/json");
  console.log("✓ Custom JSON file downloaded");
}

// ============================================================================
// 3. BATCH ANALYSIS PIPELINE
// ============================================================================

import {
  batchAnalyzeChapters,
  generateBatchSummary,
  findOutlierChapters,
  compareMetricAcrossChapters,
  exportBatchResultsToCSV,
} from "../utils/batchAnalysis";

async function batchAnalysisExample(chapters: Chapter[]) {
  console.log("=== BATCH ANALYSIS ===");
  console.log(`Analyzing ${chapters.length} chapters...`);

  const result = await batchAnalyzeChapters(chapters, {
    genre: "fantasy",
    concurrency: 3,
    onProgress: (current, total, fileName) => {
      console.log(`Progress: ${current}/${total} - ${fileName}`);
    },
    onChapterComplete: (index, analysis) => {
      console.log(`✓ Chapter ${index + 1}: ${analysis.overallScore}/100`);
    },
  });

  // View summary
  console.log("\n=== SUMMARY ===");
  console.log(`Total Chapters: ${result.summary.totalChapters}`);
  console.log(`Average Score: ${result.summary.averageScore}/100`);
  console.log(`Highest Score: ${result.summary.highestScore}/100`);
  console.log(`Lowest Score: ${result.summary.lowestScore}/100`);
  console.log(`Consistency: ${result.summary.consistencyScore}/100`);
  console.log(`Total Words: ${result.summary.totalWords.toLocaleString()}`);

  // Find outliers
  const { highPerformers, lowPerformers } = findOutlierChapters(result, 15);
  console.log(
    "\nHigh Performers:",
    highPerformers.map((i) => `Ch${i + 1}`).join(", ")
  );
  console.log(
    "Low Performers:",
    lowPerformers.map((i) => `Ch${i + 1}`).join(", ")
  );

  // Compare specific metric
  const pacingScores = compareMetricAcrossChapters(result, "pacing");
  console.log("\nPacing Across Chapters:");
  pacingScores.forEach(({ title, score }) => {
    console.log(`  ${title}: ${score}/100`);
  });

  // Generate report
  const report = generateBatchSummary(result);
  console.log("\n" + report);

  // Export to CSV
  const csv = exportBatchResultsToCSV(result);
  downloadFile(csv, "batch-analysis-results.csv", "text/csv");
}

// ============================================================================
// 4. AI-POWERED IMPROVEMENT SUGGESTIONS
// ============================================================================

import {
  generateImprovementSuggestions,
  generateImprovementPlan,
  exportSuggestionsToMarkdown,
} from "../utils/improvementSuggestions";

function improvementSuggestionsExample(analysis: ChapterAnalysis) {
  console.log("=== IMPROVEMENT SUGGESTIONS ===");

  // Generate all suggestions
  const suggestions = generateImprovementSuggestions(analysis);
  console.log(`Total Suggestions: ${suggestions.length}`);

  // Count by priority
  const critical = suggestions.filter((s) => s.priority === "critical").length;
  const high = suggestions.filter((s) => s.priority === "high").length;
  const medium = suggestions.filter((s) => s.priority === "medium").length;
  const low = suggestions.filter((s) => s.priority === "low").length;

  console.log(`Priority Breakdown:`);
  console.log(`  🔴 Critical: ${critical}`);
  console.log(`  🟠 High: ${high}`);
  console.log(`  🟡 Medium: ${medium}`);
  console.log(`  🟢 Low: ${low}`);

  // Get structured improvement plan
  const plan = generateImprovementPlan(suggestions);
  console.log(`\nFocus Areas: ${plan.focusAreas.join(", ")}`);
  console.log(`Immediate Actions: ${plan.immediateActions.length}`);
  console.log(`Short-term: ${plan.shortTerm.length}`);
  console.log(`Long-term: ${plan.longTerm.length}`);

  // Show first immediate action
  if (plan.immediateActions.length > 0) {
    const first = plan.immediateActions[0];
    console.log(`\n=== TOP PRIORITY ===`);
    console.log(`Area: ${first.area}`);
    console.log(`Issue: ${first.currentIssue}`);
    console.log(`Fix: ${first.suggestedFix}`);
    console.log(`\nExample:`);
    console.log(`❌ Before: ${first.example.before}`);
    console.log(`✅ After: ${first.example.after}`);
  }

  // Export to markdown
  const md = exportSuggestionsToMarkdown(suggestions);
  downloadFile(md, "improvement-plan.md", "text/markdown");
  console.log("\n✓ Improvement plan exported to markdown");
}

// ============================================================================
// 5. REAL-TIME WRITING ASSISTANT
// ============================================================================

import {
  analyzeRealtimeText,
  getQuickFeedback,
  getInlineSuggestion,
  highlightIssues,
  DEFAULT_REALTIME_SETTINGS,
  type RealtimeSettings,
} from "../utils/realtimeAssistant";

function realtimeAssistantExample(
  currentParagraph: string,
  cursorPosition: number
) {
  console.log("=== REAL-TIME ASSISTANT ===");

  // Analyze current paragraph
  const result = analyzeRealtimeText(currentParagraph);

  console.log(`Score: ${result.score}/100`);
  console.log(`\nMetrics:`);
  console.log(`  Words: ${result.metrics.wordCount}`);
  console.log(`  Sentences: ${result.metrics.sentenceCount}`);
  console.log(`  Avg Sentence Length: ${result.metrics.avgSentenceLength}`);
  console.log(`  Complexity: ${result.metrics.complexityScore}/100`);
  console.log(`  Reading Level: Grade ${result.metrics.readingLevel}`);
  console.log(`  Pacing: ${result.metrics.pacing}`);

  console.log(`\nIssues Found: ${result.issues.length}`);

  // Count by type
  const issueTypes = new Map<string, number>();
  result.issues.forEach((issue) => {
    issueTypes.set(issue.type, (issueTypes.get(issue.type) || 0) + 1);
  });

  console.log("Issue Breakdown:");
  issueTypes.forEach((count, type) => {
    console.log(`  ${type}: ${count}`);
  });

  // Quick feedback
  const feedback = getQuickFeedback(currentParagraph);
  console.log(`\nQuick Feedback: ${feedback}`);

  // Contextual suggestions
  if (result.suggestions.length > 0) {
    console.log(`\nSuggestions:`);
    result.suggestions.forEach((s) => console.log(`  • ${s}`));
  }

  // Get suggestion at cursor
  const cursorSuggestion = getInlineSuggestion(
    currentParagraph,
    cursorPosition,
    result.issues
  );

  if (cursorSuggestion) {
    console.log(`\nAt cursor position:`);
    console.log(`  Type: ${cursorSuggestion.type}`);
    console.log(`  Message: ${cursorSuggestion.message}`);
    console.log(`  Suggestion: ${cursorSuggestion.suggestion}`);
  }

  // Highlight issues (for UI integration)
  const highlighted = highlightIssues(currentParagraph, result.issues);
  console.log(`\nHighlights: ${highlighted.highlights.length} regions marked`);

  // Custom settings example
  const customSettings: RealtimeSettings = {
    ...DEFAULT_REALTIME_SETTINGS,
    enableAdverbDetection: false, // Disable during first draft
    minimumSeverity: "warning", // Only show warnings and errors
  };
  console.log("\n✓ Custom settings applied");
}

// ============================================================================
// COMPLETE WORKFLOW EXAMPLE
// ============================================================================

async function completeWorkflowExample() {
  console.log("=== COMPLETE WORKFLOW ===\n");

  // 1. Real-time analysis while writing
  const currentText = "She walked quickly through the dark room.";
  console.log("1. Real-time feedback:");
  realtimeAssistantExample(currentText, 20);

  // 2. Full analysis when chapter is complete
  console.log("\n2. Full chapter analysis:");
  const chapter: Chapter = {
    id: "ch1",
    title: "Chapter 1",
    content: `Full chapter text here...`,
    wordCount: 3000,
    sections: [],
    conceptGraph: {
      concepts: [],
      relationships: [],
      hierarchy: { core: [], supporting: [], detail: [] },
      sequence: [],
    },
    metadata: {
      readingLevel: "intermediate",
      genre: "fantasy",
      targetAudience: "adult",
      estimatedReadingTime: 12,
      createdAt: new Date(),
      lastAnalyzed: new Date(),
    },
  };

  const analysis = await AnalysisEngine.analyzeChapter(
    chapter,
    undefined,
    "fantasy"
  );
  console.log(`Overall Score: ${analysis.overallScore}/100`);

  // 3. Get improvement suggestions
  console.log("\n3. Improvement suggestions:");
  improvementSuggestionsExample(analysis);

  // 4. Export results
  console.log("\n4. Export analysis:");
  await exportExample(analysis);

  // 5. Compare with previous version (if exists)
  console.log("\n5. Compare with previous draft:");
  // await compareVersionsExample();

  // 6. Batch analyze entire manuscript
  console.log("\n6. Batch analysis (when multiple chapters ready):");
  // const allChapters = [chapter1, chapter2, chapter3];
  // await batchAnalysisExample(allChapters);

  console.log("\n✅ Complete workflow demonstrated!");
}

// ============================================================================
// EXPORT EXAMPLES
// ============================================================================

export {
  compareVersionsExample,
  exportExample,
  batchAnalysisExample,
  improvementSuggestionsExample,
  realtimeAssistantExample,
  completeWorkflowExample,
};

// Usage in your app:
// import { completeWorkflowExample } from './powerFeaturesExamples';
// completeWorkflowExample();
