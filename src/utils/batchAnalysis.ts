/**
 * Batch Analysis Pipeline
 * Analyze multiple chapters/documents simultaneously
 */

import type { Chapter, ChapterAnalysis } from "../types";
import { AnalysisEngine } from "../components/AnalysisEngine";

export interface BatchAnalysisOptions {
  genre?: string;
  onProgress?: (current: number, total: number, currentFile: string) => void;
  onChapterComplete?: (index: number, analysis: ChapterAnalysis) => void;
  concurrency?: number; // Max parallel analyses
}

export interface BatchAnalysisResult {
  analyses: ChapterAnalysis[];
  summary: {
    totalChapters: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalWords: number;
    totalReadingTime: number;
    consistencyScore: number; // How consistent are scores across chapters
  };
  insights: {
    strongestAreas: string[];
    weakestAreas: string[];
    consistencyIssues: string[];
    recommendations: string[];
  };
  chapterComparisons: {
    chapterIndex: number;
    title: string;
    score: number;
    standout: "high" | "low" | "average";
  }[];
}

/**
 * Analyze multiple chapters in batch
 */
export async function batchAnalyzeChapters(
  chapters: Chapter[],
  options: BatchAnalysisOptions = {}
): Promise<BatchAnalysisResult> {
  const {
    genre = "general",
    onProgress,
    onChapterComplete,
    concurrency = 3,
  } = options;

  const analyses: ChapterAnalysis[] = [];
  const total = chapters.length;

  // Process chapters in batches for concurrency
  for (let i = 0; i < chapters.length; i += concurrency) {
    const batch = chapters.slice(i, Math.min(i + concurrency, chapters.length));

    const batchPromises = batch.map(async (chapter, batchIndex) => {
      const globalIndex = i + batchIndex;

      onProgress?.(
        globalIndex + 1,
        total,
        chapter.title || `Chapter ${globalIndex + 1}`
      );

      const analysis = await AnalysisEngine.analyzeChapter(
        chapter,
        undefined,
        genre
      );

      onChapterComplete?.(globalIndex, analysis);

      return analysis;
    });

    const batchResults = await Promise.all(batchPromises);
    analyses.push(...batchResults);
  }

  // Calculate summary statistics
  const scores = analyses.map((a) => a.overallScore);
  const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  const totalWords = analyses.reduce((sum, a) => sum + a.metrics.totalWords, 0);
  const totalReadingTime = analyses.reduce(
    (sum, a) => sum + a.metrics.readingTime,
    0
  );

  // Calculate consistency (standard deviation)
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - averageScore, 2), 0) /
    scores.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - stdDev * 2); // Lower stdDev = higher consistency

  // Aggregate metrics across all chapters
  const metricAggregates = new Map<string, number[]>();

  analyses.forEach((analysis) => {
    analysis.principleScores.forEach((ps) => {
      const key = String(ps.principleId);
      if (!metricAggregates.has(key)) {
        metricAggregates.set(key, []);
      }
      metricAggregates.get(key)!.push(ps.score);
    });
  });

  // Find strongest and weakest areas
  const metricAverages = Array.from(metricAggregates.entries()).map(
    ([metric, scores]) => ({
      metric,
      average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      name:
        analyses[0].principleScores.find(
          (ps) => String(ps.principleId) === metric
        )?.principle || metric,
    })
  );

  const strongestAreas = metricAverages
    .filter((m) => m.average >= 80)
    .sort((a, b) => b.average - a.average)
    .slice(0, 5)
    .map((m) => `${m.name} (${m.average.toFixed(1)})`);

  const weakestAreas = metricAverages
    .filter((m) => m.average < 60)
    .sort((a, b) => a.average - b.average)
    .slice(0, 5)
    .map((m) => `${m.name} (${m.average.toFixed(1)})`);

  // Identify consistency issues
  const consistencyIssues: string[] = [];
  metricAggregates.forEach((scores, metric) => {
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance =
      scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > 20) {
      // High variance
      const name =
        analyses[0].principleScores.find(
          (ps) => String(ps.principleId) === metric
        )?.principle || metric;
      consistencyIssues.push(
        `${name} varies significantly (std dev: ${stdDev.toFixed(1)})`
      );
    }
  });

  // Generate recommendations
  const recommendations: string[] = [];

  if (consistencyScore < 60) {
    recommendations.push(
      "Significant inconsistency detected across chapters - review for tone, style, and quality uniformity"
    );
  }

  if (weakestAreas.length > 0) {
    recommendations.push(
      `Focus revision efforts on: ${weakestAreas
        .slice(0, 3)
        .map((w) => w.split(" (")[0])
        .join(", ")}`
    );
  }

  if (highestScore - lowestScore > 30) {
    recommendations.push(
      `Large quality gap between chapters (${(
        highestScore - lowestScore
      ).toFixed(1)} points) - bring weaker chapters up to standard`
    );
  }

  const avgPacingScores = metricAggregates.get("pacing");
  if (avgPacingScores) {
    const avgPacing =
      avgPacingScores.reduce((sum, s) => sum + s, 0) / avgPacingScores.length;
    if (avgPacing < 60) {
      recommendations.push(
        "Pacing issues detected across multiple chapters - vary sentence length and paragraph density"
      );
    }
  }

  // Chapter-by-chapter comparisons
  const chapterComparisons = analyses.map((analysis, index) => {
    let standout: "high" | "low" | "average" = "average";

    if (analysis.overallScore >= averageScore + 10) {
      standout = "high";
    } else if (analysis.overallScore <= averageScore - 10) {
      standout = "low";
    }

    return {
      chapterIndex: index,
      title: chapters[index].title || `Chapter ${index + 1}`,
      score: analysis.overallScore,
      standout,
    };
  });

  return {
    analyses,
    summary: {
      totalChapters: chapters.length,
      averageScore: Math.round(averageScore * 10) / 10,
      highestScore,
      lowestScore,
      totalWords,
      totalReadingTime,
      consistencyScore: Math.round(consistencyScore),
    },
    insights: {
      strongestAreas,
      weakestAreas,
      consistencyIssues: consistencyIssues.slice(0, 5),
      recommendations,
    },
    chapterComparisons,
  };
}

/**
 * Generate batch analysis summary report
 */
export function generateBatchSummary(result: BatchAnalysisResult): string {
  let report = `Batch Analysis Summary\n`;
  report += `=====================\n\n`;

  report += `Total Chapters: ${result.summary.totalChapters}\n`;
  report += `Average Score: ${result.summary.averageScore}/100\n`;
  report += `Highest Score: ${result.summary.highestScore}/100\n`;
  report += `Lowest Score: ${result.summary.lowestScore}/100\n`;
  report += `Consistency Score: ${result.summary.consistencyScore}/100\n`;
  report += `Total Word Count: ${result.summary.totalWords.toLocaleString()}\n`;
  report += `Total Reading Time: ${Math.round(
    result.summary.totalReadingTime
  )} minutes\n\n`;

  if (result.insights.strongestAreas.length > 0) {
    report += `Strongest Areas:\n`;
    result.insights.strongestAreas.forEach((area) => {
      report += `  ✓ ${area}\n`;
    });
    report += `\n`;
  }

  if (result.insights.weakestAreas.length > 0) {
    report += `Weakest Areas:\n`;
    result.insights.weakestAreas.forEach((area) => {
      report += `  ✗ ${area}\n`;
    });
    report += `\n`;
  }

  if (result.insights.consistencyIssues.length > 0) {
    report += `Consistency Issues:\n`;
    result.insights.consistencyIssues.forEach((issue) => {
      report += `  ⚠ ${issue}\n`;
    });
    report += `\n`;
  }

  if (result.insights.recommendations.length > 0) {
    report += `Recommendations:\n`;
    result.insights.recommendations.forEach((rec) => {
      report += `  → ${rec}\n`;
    });
    report += `\n`;
  }

  report += `Chapter-by-Chapter Breakdown:\n`;
  result.chapterComparisons.forEach((chapter) => {
    const emoji =
      chapter.standout === "high"
        ? "⬆️"
        : chapter.standout === "low"
        ? "⬇️"
        : "•";
    report += `  ${emoji} ${chapter.title}: ${chapter.score}/100\n`;
  });

  return report;
}

/**
 * Find outlier chapters (significantly better or worse than average)
 */
export function findOutlierChapters(
  result: BatchAnalysisResult,
  threshold: number = 15
): {
  highPerformers: number[];
  lowPerformers: number[];
} {
  const avgScore = result.summary.averageScore;

  const highPerformers = result.chapterComparisons
    .filter((c) => c.score >= avgScore + threshold)
    .map((c) => c.chapterIndex);

  const lowPerformers = result.chapterComparisons
    .filter((c) => c.score <= avgScore - threshold)
    .map((c) => c.chapterIndex);

  return { highPerformers, lowPerformers };
}

/**
 * Compare specific metric across all chapters
 */
export function compareMetricAcrossChapters(
  result: BatchAnalysisResult,
  metricId: string
): {
  chapterIndex: number;
  title: string;
  score: number;
}[] {
  return result.analyses.map((analysis, index) => {
    const metric = analysis.principleScores.find(
      (ps) => String(ps.principleId) === metricId
    );

    return {
      chapterIndex: index,
      title: result.chapterComparisons[index].title,
      score: metric?.score || 0,
    };
  });
}

/**
 * Export batch results to CSV
 */
export function exportBatchResultsToCSV(result: BatchAnalysisResult): string {
  let csv = "Chapter,Score,Words,Reading Time (min),Status\n";

  result.chapterComparisons.forEach((chapter, index) => {
    const analysis = result.analyses[index];
    const status =
      chapter.standout === "high"
        ? "Above Average"
        : chapter.standout === "low"
        ? "Below Average"
        : "Average";

    csv += `"${chapter.title}",${chapter.score},${analysis.metrics.totalWords},${analysis.metrics.readingTime},"${status}"\n`;
  });

  return csv;
}
