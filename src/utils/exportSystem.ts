/**
 * Advanced Export System
 * Export analysis to PDF, Excel, JSON, and Markdown formats
 */

import type { ChapterAnalysis } from "../types";
import type { ComparisonResult } from "./comparisonEngine";

export interface ExportOptions {
  format: "pdf" | "excel" | "json" | "markdown" | "csv";
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  includeRawData?: boolean;
  includeComparison?: boolean;
  comparisonData?: ComparisonResult;
}

/**
 * Export analysis to JSON
 */
export function exportToJSON(
  analysis: ChapterAnalysis,
  options: ExportOptions = { format: "json" }
): string {
  const exportData: any = {
    metadata: {
      exportDate: new Date().toISOString(),
      chapterId: analysis.chapterId,
      overallScore: analysis.overallScore,
      analysisDate: analysis.timestamp?.toISOString(),
    },
    scores: {
      overall: analysis.overallScore,
      principles: analysis.principleScores.map((ps) => ({
        id: ps.principleId,
        name: ps.principle,
        score: ps.score,
        weight: ps.weight,
        details: ps.details,
      })),
    },
    metrics: analysis.metrics,
  };

  if (options.includeRecommendations && analysis.recommendations) {
    exportData.recommendations = analysis.recommendations;
  }

  if (options.includeRawData) {
    exportData.rawAnalysis = {
      characterAnalysis: analysis.characterAnalysis,
      proseQuality: analysis.proseQuality,
      emotionHeatmap: analysis.emotionHeatmap,
      povConsistency: analysis.povConsistency,
      conflictTracking: analysis.conflictTracking,
      sensoryBalance: analysis.sensoryBalance,
    };
  }

  if (options.includeComparison && options.comparisonData) {
    exportData.comparison = options.comparisonData;
  }

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export analysis to CSV
 */
export function exportToCSV(analysis: ChapterAnalysis): string {
  let csv = "Metric,Score,Weight,Category\n";

  analysis.principleScores.forEach((ps) => {
    const category = categorizeMetric(String(ps.principleId));
    csv += `"${ps.principle}",${ps.score},${ps.weight},"${category}"\n`;
  });

  return csv;
}

/**
 * Export analysis to Markdown
 */
export function exportToMarkdown(
  analysis: ChapterAnalysis,
  options: ExportOptions = { format: "markdown" }
): string {
  let md = `# Manuscript Analysis Report\n\n`;
  md += `**Generated:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
  md += `---\n\n`;

  // Overall score
  md += `## Overall Score: ${analysis.overallScore}/100\n\n`;

  const grade = getScoreGrade(analysis.overallScore);
  md += `**Grade:** ${grade.letter} - ${grade.description}\n\n`;

  // Metrics by category
  const categories = {
    core: "Core Writing Metrics",
    prose: "Prose Quality",
    visual: "Visual & Style Analysis",
    advanced: "Advanced Metrics",
    fiction: "Fiction Elements",
  };

  Object.entries(categories).forEach(([catKey, catName]) => {
    const categoryMetrics = analysis.principleScores.filter(
      (ps) => categorizeMetric(String(ps.principleId)) === catKey
    );

    if (categoryMetrics.length > 0) {
      md += `## ${catName}\n\n`;

      categoryMetrics.forEach((ps) => {
        const emoji = ps.score >= 80 ? "🟢" : ps.score >= 60 ? "🟡" : "🔴";
        md += `### ${emoji} ${ps.principle} - ${ps.score}/100\n\n`;

        if (ps.details && ps.details.length > 0) {
          md += `**Details:**\n`;
          ps.details.forEach((detail) => {
            md += `- ${detail}\n`;
          });
          md += `\n`;
        }

        if (ps.suggestions && ps.suggestions.length > 0) {
          md += `**Suggestions:**\n`;
          ps.suggestions.forEach((suggestion) => {
            md += `- ${suggestion.title}: ${suggestion.description}\n`;
          });
          md += `\n`;
        }
      });
    }
  });

  // Character Analysis
  if (analysis.characterAnalysis) {
    md += `## Character Analysis\n\n`;
    md += `**Characters Detected:** ${analysis.characterAnalysis.characters.length}\n\n`;

    const majorCharacters = analysis.characterAnalysis.characters.filter(
      (c: any) => c.role === "protagonist" || c.role === "major"
    );

    if (majorCharacters.length > 0) {
      md += `### Major Characters\n\n`;
      majorCharacters.forEach((char: any) => {
        md += `#### ${char.name}\n`;
        md += `- **Role:** ${char.role}\n`;
        md += `- **Mentions:** ${char.mentions}\n`;
        md += `- **Arc Type:** ${char.arcType}\n`;
        md += `- **Development Score:** ${char.developmentScore}/100\n\n`;
      });
    }
  }

  // Prose Quality
  if (analysis.proseQuality && options.includeRawData) {
    md += `## Prose Quality Details\n\n`;

    if (analysis.proseQuality.wordFrequency) {
      md += `### Word Frequency\n`;
      md += `- **Unique Words:** ${analysis.proseQuality.wordFrequency.uniqueWords}\n`;
      md += `- **Total Words:** ${analysis.proseQuality.wordFrequency.totalWords}\n`;
      md += `- **Vocabulary Richness:** ${(
        analysis.proseQuality.wordFrequency.vocabularyRichness * 100
      ).toFixed(1)}%\n\n`;
    }

    if (analysis.proseQuality.readability) {
      md += `### Readability\n`;
      md += `- **Flesch-Kincaid Grade:** ${analysis.proseQuality.readability.gradeLevel}\n`;
      md += `- **Reading Ease:** ${analysis.proseQuality.readability.readingEase.toFixed(
        1
      )}\n\n`;
    }
  }

  // Conflict Tracking
  if (analysis.conflictTracking) {
    md += `## Conflict Analysis\n\n`;
    md += `- **Total Conflicts:** ${analysis.conflictTracking.totalConflicts}\n`;
    md += `- **Internal:** ${analysis.conflictTracking.internalCount}\n`;
    md += `- **External:** ${analysis.conflictTracking.externalCount}\n`;
    md += `- **Interpersonal:** ${analysis.conflictTracking.interpersonalCount}\n`;
    md += `- **Conflict Density:** ${analysis.conflictTracking.conflictDensity.toFixed(
      1
    )} per 1000 words\n\n`;
  }

  // Sensory Balance
  if (analysis.sensoryBalance) {
    md += `## Sensory Balance\n\n`;
    md += `| Sense | Percentage | Count |\n`;
    md += `|-------|-----------|-------|\n`;
    md += `| 👁️ Sight | ${analysis.sensoryBalance.sightPercentage.toFixed(
      1
    )}% | ${analysis.sensoryBalance.sightCount} |\n`;
    md += `| 👂 Sound | ${analysis.sensoryBalance.soundPercentage.toFixed(
      1
    )}% | ${analysis.sensoryBalance.soundCount} |\n`;
    md += `| ✋ Touch | ${analysis.sensoryBalance.touchPercentage.toFixed(
      1
    )}% | ${analysis.sensoryBalance.touchCount} |\n`;
    md += `| 👃 Smell | ${analysis.sensoryBalance.smellPercentage.toFixed(
      1
    )}% | ${analysis.sensoryBalance.smellCount} |\n`;
    md += `| 👅 Taste | ${analysis.sensoryBalance.tastePercentage.toFixed(
      1
    )}% | ${analysis.sensoryBalance.tasteCount} |\n\n`;
  }

  // Recommendations
  if (
    options.includeRecommendations &&
    analysis.recommendations &&
    analysis.recommendations.length > 0
  ) {
    md += `## Recommendations\n\n`;

    const highPriority = analysis.recommendations.filter(
      (r) => r.priority === "high"
    );
    const mediumPriority = analysis.recommendations.filter(
      (r) => r.priority === "medium"
    );
    const lowPriority = analysis.recommendations.filter(
      (r) => r.priority === "low"
    );

    if (highPriority.length > 0) {
      md += `### 🔴 High Priority\n\n`;
      highPriority.forEach((rec) => {
        md += `#### ${rec.title}\n`;
        md += `${rec.description}\n\n`;
      });
    }

    if (mediumPriority.length > 0) {
      md += `### 🟡 Medium Priority\n\n`;
      mediumPriority.forEach((rec) => {
        md += `#### ${rec.title}\n`;
        md += `${rec.description}\n\n`;
      });
    }

    if (lowPriority.length > 0) {
      md += `### 🟢 Low Priority\n\n`;
      lowPriority.forEach((rec) => {
        md += `#### ${rec.title}\n`;
        md += `${rec.description}\n\n`;
      });
    }
  }

  // Comparison data
  if (options.includeComparison && options.comparisonData) {
    md += `---\n\n`;
    md += `## Version Comparison\n\n`;
    const comp = options.comparisonData;

    md += `**Overall Change:** ${
      comp.summary.overallImprovement > 0 ? "+" : ""
    }${comp.summary.overallImprovement.toFixed(1)} points\n\n`;
    md += `- ✅ Metrics Improved: ${comp.summary.metricsImproved}\n`;
    md += `- ❌ Metrics Declined: ${comp.summary.metricsDeclined}\n`;
    md += `- ⚪ Metrics Unchanged: ${comp.summary.metricsUnchanged}\n\n`;

    if (comp.summary.significantChanges.length > 0) {
      md += `### Significant Changes\n\n`;
      md += `| Metric | Before | After | Change |\n`;
      md += `|--------|--------|-------|--------|\n`;
      comp.summary.significantChanges.forEach((change) => {
        const arrow = change.improved ? "⬆️" : "⬇️";
        md += `| ${change.name} | ${change.before.toFixed(
          1
        )} | ${change.after.toFixed(1)} | ${arrow} ${
          change.change > 0 ? "+" : ""
        }${change.change.toFixed(1)} |\n`;
      });
      md += `\n`;
    }
  }

  md += `---\n\n`;
  md += `*Generated by QuillPilot - Creative Writing Analysis Tool*\n`;

  return md;
}

/**
 * Export to Excel-compatible format (CSV with multiple sheets as separate files)
 */
export function exportToExcel(analysis: ChapterAnalysis): {
  overview: string;
  metrics: string;
  details: string;
} {
  // Overview sheet
  let overview = "Category,Value\n";
  overview += `"Overall Score",${analysis.overallScore}\n`;
  overview += `"Total Metrics",${analysis.principleScores.length}\n`;
  overview += `"Word Count",${analysis.metrics.totalWords}\n`;
  overview += `"Reading Time (min)",${analysis.metrics.readingTime}\n`;
  overview += `"Analysis Date","${analysis.timestamp?.toLocaleDateString()}"\n`;

  // Metrics sheet
  let metrics = "Metric,Score,Weight,Category,Details\n";
  analysis.principleScores.forEach((ps) => {
    const category = categorizeMetric(String(ps.principleId));
    const details = ps.details ? ps.details.join("; ") : "";
    metrics += `"${ps.principle}",${ps.score},${ps.weight},"${category}","${details}"\n`;
  });

  // Details sheet
  let details = "Analysis Component,Data\n";
  if (analysis.characterAnalysis) {
    details += `"Characters","${analysis.characterAnalysis.characters.length} detected"\n`;
  }
  if (analysis.proseQuality) {
    details += `"Unique Words","${
      analysis.proseQuality.wordFrequency?.uniqueWords || 0
    }"\n`;
    details += `"Dialogue Lines","${
      analysis.proseQuality.dialogue?.totalLines || 0
    }"\n`;
  }
  if (analysis.conflictTracking) {
    details += `"Total Conflicts","${analysis.conflictTracking.totalConflicts}"\n`;
    details += `"Conflict Density","${analysis.conflictTracking.conflictDensity.toFixed(
      2
    )}"\n`;
  }

  return { overview, metrics, details };
}

/**
 * Trigger browser download
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/plain"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export with automatic filename generation
 */
export function exportAnalysis(
  analysis: ChapterAnalysis,
  options: ExportOptions
): void {
  const timestamp = new Date().toISOString().split("T")[0];
  const baseFilename = `quillpilot-analysis-${timestamp}`;

  switch (options.format) {
    case "json":
      const jsonData = exportToJSON(analysis, options);
      downloadFile(jsonData, `${baseFilename}.json`, "application/json");
      break;

    case "csv":
      const csvData = exportToCSV(analysis);
      downloadFile(csvData, `${baseFilename}.csv`, "text/csv");
      break;

    case "markdown":
      const mdData = exportToMarkdown(analysis, options);
      downloadFile(mdData, `${baseFilename}.md`, "text/markdown");
      break;

    case "excel":
      const excelData = exportToExcel(analysis);
      downloadFile(
        excelData.overview,
        `${baseFilename}-overview.csv`,
        "text/csv"
      );
      downloadFile(
        excelData.metrics,
        `${baseFilename}-metrics.csv`,
        "text/csv"
      );
      downloadFile(
        excelData.details,
        `${baseFilename}-details.csv`,
        "text/csv"
      );
      break;

    default:
      console.error("Unsupported export format:", options.format);
  }
}

/**
 * Helper: Categorize metric by ID
 */
function categorizeMetric(principleId: string): string {
  if (
    principleId.includes("word") ||
    principleId.includes("dialogue") ||
    principleId.includes("voice") ||
    principleId.includes("adverb") ||
    principleId.includes("sentence") ||
    principleId.includes("readability")
  ) {
    return "prose";
  } else if (
    principleId.includes("emotion") ||
    principleId.includes("pov") ||
    principleId.includes("cliche") ||
    principleId.includes("filtering") ||
    principleId.includes("backstory")
  ) {
    return "visual";
  } else if (
    principleId.includes("dialogueNarrative") ||
    principleId.includes("sceneSequel") ||
    principleId.includes("conflict") ||
    principleId.includes("sensory")
  ) {
    return "advanced";
  } else if (
    principleId.includes("fiction") ||
    principleId.includes("Element")
  ) {
    return "fiction";
  } else {
    return "core";
  }
}

/**
 * Helper: Get grade for score
 */
function getScoreGrade(score: number): { letter: string; description: string } {
  if (score >= 90) {
    return { letter: "A+", description: "Exceptional" };
  } else if (score >= 85) {
    return { letter: "A", description: "Excellent" };
  } else if (score >= 80) {
    return { letter: "A-", description: "Very Good" };
  } else if (score >= 75) {
    return { letter: "B+", description: "Good" };
  } else if (score >= 70) {
    return { letter: "B", description: "Above Average" };
  } else if (score >= 65) {
    return { letter: "B-", description: "Average" };
  } else if (score >= 60) {
    return { letter: "C+", description: "Fair" };
  } else if (score >= 55) {
    return { letter: "C", description: "Below Average" };
  } else if (score >= 50) {
    return { letter: "C-", description: "Needs Work" };
  } else {
    return { letter: "D", description: "Requires Revision" };
  }
}
