/**
 * Manuscript Comparison Engine
 * Compare two versions of a manuscript to track improvements and changes
 */

import type { ChapterAnalysis } from "../types";

export interface ComparisonMetric {
  name: string;
  before: number;
  after: number;
  change: number;
  changePercent: number;
  improved: boolean;
  category: "core" | "prose" | "visual" | "advanced" | "fiction";
}

export interface ComparisonResult {
  summary: {
    overallImprovement: number; // -100 to +100
    metricsImproved: number;
    metricsDeclined: number;
    metricsUnchanged: number;
    significantChanges: ComparisonMetric[];
  };
  metrics: ComparisonMetric[];
  categoryBreakdown: {
    category: string;
    avgChange: number;
    metricsCount: number;
  }[];
  recommendations: string[];
  strengths: string[];
  concerns: string[];
}

/**
 * Compare two manuscript versions
 */
export function compareManuscripts(
  before: ChapterAnalysis,
  after: ChapterAnalysis
): ComparisonResult {
  const metrics: ComparisonMetric[] = [];

  // Extract all comparable metrics from principleScores
  before.principleScores.forEach((beforeScore) => {
    const afterScore = after.principleScores.find(
      (s) => s.principleId === beforeScore.principleId
    );

    if (afterScore) {
      const change = afterScore.score - beforeScore.score;
      const changePercent =
        beforeScore.score > 0
          ? (change / beforeScore.score) * 100
          : change > 0
          ? 100
          : 0;

      // Categorize the metric
      let category: ComparisonMetric["category"] = "core";
      const principleId = String(beforeScore.principleId);

      if (
        principleId.includes("word") ||
        principleId.includes("dialogue") ||
        principleId.includes("voice") ||
        principleId.includes("adverb") ||
        principleId.includes("sentence") ||
        principleId.includes("readability")
      ) {
        category = "prose";
      } else if (
        principleId.includes("emotion") ||
        principleId.includes("pov") ||
        principleId.includes("cliche") ||
        principleId.includes("filtering") ||
        principleId.includes("backstory")
      ) {
        category = "visual";
      } else if (
        principleId.includes("dialogueNarrative") ||
        principleId.includes("sceneSequel") ||
        principleId.includes("conflict") ||
        principleId.includes("sensory")
      ) {
        category = "advanced";
      } else if (
        principleId.includes("fiction") ||
        principleId.includes("Element")
      ) {
        category = "fiction";
      }

      metrics.push({
        name: afterScore.principle,
        before: beforeScore.score,
        after: afterScore.score,
        change,
        changePercent,
        improved: change > 0,
        category,
      });
    }
  });

  // Calculate summary statistics
  const improved = metrics.filter((m) => m.change > 2).length;
  const declined = metrics.filter((m) => m.change < -2).length;
  const unchanged = metrics.filter((m) => Math.abs(m.change) <= 2).length;

  // Find significant changes (>10 point change)
  const significantChanges = metrics
    .filter((m) => Math.abs(m.change) >= 10)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);

  // Calculate overall improvement
  const totalChange = metrics.reduce((sum, m) => sum + m.change, 0);
  const overallImprovement =
    Math.round((totalChange / metrics.length) * 100) / 100;

  // Category breakdown
  const categories = ["core", "prose", "visual", "advanced", "fiction"];
  const categoryBreakdown = categories.map((cat) => {
    const categoryMetrics = metrics.filter((m) => m.category === cat);
    const avgChange =
      categoryMetrics.length > 0
        ? categoryMetrics.reduce((sum, m) => sum + m.change, 0) /
          categoryMetrics.length
        : 0;

    return {
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      avgChange: Math.round(avgChange * 10) / 10,
      metricsCount: categoryMetrics.length,
    };
  });

  // Generate recommendations
  const recommendations: string[] = [];
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Identify top improvements
  const topImprovements = metrics
    .filter((m) => m.change >= 10)
    .sort((a, b) => b.change - a.change)
    .slice(0, 3);

  topImprovements.forEach((m) => {
    strengths.push(
      `${m.name} improved significantly (+${m.change.toFixed(1)} points)`
    );
  });

  // Identify areas of concern
  const topDeclines = metrics
    .filter((m) => m.change <= -10)
    .sort((a, b) => a.change - b.change)
    .slice(0, 3);

  topDeclines.forEach((m) => {
    concerns.push(
      `${m.name} declined (${m.change.toFixed(1)} points) - review changes`
    );
  });

  // Specific recommendations based on patterns
  const proseMetrics = metrics.filter((m) => m.category === "prose");
  const avgProseChange =
    proseMetrics.reduce((sum, m) => sum + m.change, 0) / proseMetrics.length;

  if (avgProseChange < -5) {
    recommendations.push(
      "Prose quality has declined overall - review dialogue, word choice, and sentence variety"
    );
  } else if (avgProseChange > 5) {
    recommendations.push(
      "Excellent prose improvements! Continue refining sentence structure and word choice"
    );
  }

  const conflictMetric = metrics.find((m) =>
    m.name.toLowerCase().includes("conflict")
  );
  if (conflictMetric && conflictMetric.change < -5) {
    recommendations.push(
      "Conflict tracking declined - ensure tension and obstacles remain present"
    );
  }

  const pacingMetric = metrics.find((m) =>
    m.name.toLowerCase().includes("pacing")
  );
  if (pacingMetric && pacingMetric.change > 5) {
    recommendations.push(
      "Pacing improvements detected - good balance of fast and slow sections"
    );
  }

  // Character development feedback
  const characterMetric = metrics.find((m) =>
    m.name.toLowerCase().includes("character")
  );
  if (characterMetric && characterMetric.change > 10) {
    strengths.push("Character development shows strong improvement");
  } else if (characterMetric && characterMetric.change < -10) {
    concerns.push("Character development may need more attention in revision");
  }

  // If overall improvement is positive
  if (overallImprovement > 3) {
    recommendations.push(
      `Overall manuscript quality improved by ${overallImprovement.toFixed(
        1
      )} points - excellent revision work!`
    );
  } else if (overallImprovement < -3) {
    recommendations.push(
      "Consider reviewing recent changes - some areas have regressed"
    );
  }

  // Add specific actionable recommendations
  const lowScoreMetrics = metrics.filter((m) => m.after < 60 && m.change <= 0);
  if (lowScoreMetrics.length > 0) {
    recommendations.push(
      `Focus on: ${lowScoreMetrics
        .slice(0, 3)
        .map((m) => m.name)
        .join(", ")}`
    );
  }

  return {
    summary: {
      overallImprovement,
      metricsImproved: improved,
      metricsDeclined: declined,
      metricsUnchanged: unchanged,
      significantChanges,
    },
    metrics: metrics.sort((a, b) => b.change - a.change),
    categoryBreakdown: categoryBreakdown.filter((c) => c.metricsCount > 0),
    recommendations,
    strengths,
    concerns,
  };
}

/**
 * Generate a comparison summary text
 */
export function generateComparisonSummary(
  comparison: ComparisonResult
): string {
  const { summary } = comparison;
  let text = `Manuscript Comparison Summary\n\n`;

  text += `Overall Change: ${
    summary.overallImprovement > 0 ? "+" : ""
  }${summary.overallImprovement.toFixed(1)} points\n`;
  text += `Metrics Improved: ${summary.metricsImproved}\n`;
  text += `Metrics Declined: ${summary.metricsDeclined}\n`;
  text += `Metrics Unchanged: ${summary.metricsUnchanged}\n\n`;

  if (summary.significantChanges.length > 0) {
    text += `Significant Changes:\n`;
    summary.significantChanges.forEach((change) => {
      text += `  • ${change.name}: ${change.before.toFixed(
        1
      )} → ${change.after.toFixed(1)} (${
        change.change > 0 ? "+" : ""
      }${change.change.toFixed(1)})\n`;
    });
    text += `\n`;
  }

  if (comparison.strengths.length > 0) {
    text += `Strengths:\n`;
    comparison.strengths.forEach((s) => {
      text += `  ✓ ${s}\n`;
    });
    text += `\n`;
  }

  if (comparison.concerns.length > 0) {
    text += `Areas of Concern:\n`;
    comparison.concerns.forEach((c) => {
      text += `  ⚠ ${c}\n`;
    });
    text += `\n`;
  }

  if (comparison.recommendations.length > 0) {
    text += `Recommendations:\n`;
    comparison.recommendations.forEach((r) => {
      text += `  → ${r}\n`;
    });
  }

  return text;
}

/**
 * Get comparison grade
 */
export function getComparisonGrade(overallImprovement: number): {
  grade: string;
  color: string;
  message: string;
} {
  if (overallImprovement >= 10) {
    return {
      grade: "A+",
      color: "#10b981",
      message: "Exceptional improvement!",
    };
  } else if (overallImprovement >= 5) {
    return {
      grade: "A",
      color: "#22c55e",
      message: "Strong revision work",
    };
  } else if (overallImprovement >= 2) {
    return {
      grade: "B+",
      color: "#84cc16",
      message: "Good progress",
    };
  } else if (overallImprovement >= 0) {
    return {
      grade: "B",
      color: "#eab308",
      message: "Minor improvements",
    };
  } else if (overallImprovement >= -2) {
    return {
      grade: "C",
      color: "#f59e0b",
      message: "Mixed results",
    };
  } else if (overallImprovement >= -5) {
    return {
      grade: "D",
      color: "#f97316",
      message: "Some regression",
    };
  } else {
    return {
      grade: "F",
      color: "#ef4444",
      message: "Significant decline",
    };
  }
}
