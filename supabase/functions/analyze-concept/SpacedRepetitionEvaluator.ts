import {
  PrincipleEvaluation,
  Finding,
  Suggestion,
  Evidence,
  Chapter,
  ConceptGraph,
} from "./types.ts";

export class SpacedRepetitionEvaluator {
  static evaluate(
    chapter: Chapter,
    concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    console.log(
      "🔍 [SpacedRepetition] EVALUATOR STARTING - Total concepts:",
      concepts.concepts.length
    );

    const findings: Finding[] = [];
    const evidence: Evidence[] = [];

    // Pattern-based enhancement: Practice problems enable spaced retrieval
    if (patternAnalysis) {
      const practiceProblems =
        patternAnalysis.patternCounts?.practiceProblem || 0;
      if (practiceProblems > 5) {
        findings.push({
          type: "positive",
          message: `✓ ${practiceProblems} practice problems distributed throughout chapter support spaced retrieval`,
          severity: 0,
          evidence:
            "Regular problem sets encourage revisiting concepts at intervals",
        });
      }

      // Chemistry-specific: Lab procedures spaced across chapter
      const labProcedures =
        patternAnalysis.patterns?.filter(
          (p: any) => p.metadata?.procedureType === "laboratory"
        ) || [];
      if (labProcedures.length >= 2) {
        findings.push({
          type: "positive",
          message: `✓ Chemistry: ${labProcedures.length} lab procedures provide hands-on spaced practice`,
          severity: 0,
          evidence:
            "Laboratory activities spaced throughout chapter reinforce concepts over time",
        });
      }
    }

    // NEW: Optimal Spacing Interval Analysis
    const spacingIntervals = this.calculateOptimalSpacingIntervals(
      chapter,
      concepts
    );
    evidence.push({
      type: "metric",
      metric: "optimal_spacing_alignment",
      value: spacingIntervals.alignmentScore,
      threshold: 0.6,
      quality:
        spacingIntervals.alignmentScore >= 0.6
          ? "strong"
          : spacingIntervals.alignmentScore >= 0.4
          ? "moderate"
          : "weak",
    });

    if (spacingIntervals.alignmentScore < 0.4) {
      findings.push({
        type: "critical",
        message: `Poor spacing alignment (${(
          spacingIntervals.alignmentScore * 100
        ).toFixed(0)}%) - concepts not revisited at optimal intervals`,
        severity: 0.85,
        evidence: `Recommended: 1 day, 1 week, 1 month spacing. Found: ${spacingIntervals.actualPattern}`,
      });
    } else if (spacingIntervals.alignmentScore >= 0.7) {
      findings.push({
        type: "positive",
        message: `✓ Excellent spacing: ${(
          spacingIntervals.alignmentScore * 100
        ).toFixed(0)}% alignment with optimal intervals`,
        severity: 0,
        evidence: `Concepts revisited at approximately: ${spacingIntervals.actualPattern}`,
      });
    }

    // NEW: Forgetting Curve Analysis
    const forgettingCurve = this.analyzeForgettingCurve(chapter, concepts);
    evidence.push({
      type: "metric",
      metric: "forgetting_prevention_score",
      value: forgettingCurve.preventionScore,
      threshold: 0.65,
      quality: forgettingCurve.preventionScore >= 0.65 ? "strong" : "moderate",
    });

    if (forgettingCurve.preventionScore < 0.5) {
      findings.push({
        type: "warning",
        message:
          "High forgetting risk - concepts not reinforced before memory decay",
        severity: 0.75,
        evidence: `${forgettingCurve.conceptsAtRisk} concepts likely forgotten before re-encountered`,
      });
    }

    // NEW: Massed vs. Distributed Practice Detection
    const practiceType = this.detectMassedVsDistributed(chapter, concepts);
    console.log(
      "[SpacedRepetition] Practice type:",
      "massedRatio:",
      practiceType.massedRatio.toFixed(2),
      "distributedRatio:",
      practiceType.distributedRatio.toFixed(2),
      "massedSegments:",
      practiceType.massedSegments.length,
      "massedConcepts:",
      practiceType.massedConcepts
    );

    evidence.push({
      type: "metric",
      metric: "distributed_practice_ratio",
      value: practiceType.distributedRatio,
      threshold: 0.7,
      quality:
        practiceType.distributedRatio >= 0.7
          ? "strong"
          : practiceType.distributedRatio >= 0.5
          ? "moderate"
          : "weak",
    });

    if (practiceType.distributedRatio < 0.5) {
      findings.push({
        type: "critical",
        message: `Too much massed practice (${(
          practiceType.massedRatio * 100
        ).toFixed(0)}%) - cramming detected`,
        severity: 0.8,
        evidence: `${practiceType.massedSegments.length} segments show concept clustering without spacing`,
      });
    } else if (
      practiceType.distributedRatio < 0.7 &&
      practiceType.massedSegments.length > 0
    ) {
      findings.push({
        type: "warning",
        message: `Moderate massed practice detected (${(
          practiceType.massedRatio * 100
        ).toFixed(0)}%) - some concepts clustered too closely`,
        severity: 0.6,
        evidence: `${practiceType.massedSegments.length} segments could benefit from better spacing`,
      });
    } else if (practiceType.distributedRatio >= 0.7) {
      findings.push({
        type: "positive",
        message: `✓ Good distribution: ${(
          practiceType.distributedRatio * 100
        ).toFixed(0)}% of practice is spaced`,
        severity: 0,
        evidence: "Concepts spread throughout chapter rather than clustered",
      });
    }

    // Analyze concept mention patterns (existing)
    const conceptMentionStats = this.analyzeConceptMentionPatterns(
      chapter,
      concepts
    );

    console.log(
      "[SpacedRepetition] Concept mentions:",
      "avgMentions:",
      conceptMentionStats.avgMentions.toFixed(2),
      "totalConcepts:",
      concepts.concepts.length,
      "conceptsWithMultipleMentions:",
      concepts.concepts.filter((c) => c.mentions.length >= 2).length
    );

    evidence.push({
      type: "metric",
      metric: "avg_concept_mentions",
      value: conceptMentionStats.avgMentions,
      threshold: 3,
      quality:
        conceptMentionStats.avgMentions >= 3 &&
        conceptMentionStats.avgMentions <= 5
          ? "strong"
          : "moderate",
    });

    if (conceptMentionStats.avgMentions < 2) {
      findings.push({
        type: "warning",
        message: `Concepts mentioned too infrequently (avg ${conceptMentionStats.avgMentions.toFixed(
          1
        )} times)`,
        severity: 0.7,
        evidence: `Optimal spacing: 3-5 mentions per 10,000 word chapter`,
      });
    } else if (
      conceptMentionStats.avgMentions > 2 &&
      conceptMentionStats.avgMentions <= 5
    ) {
      findings.push({
        type: "positive",
        message: `✓ Good spacing: Concepts revisited ${conceptMentionStats.avgMentions.toFixed(
          1
        )} times on average`,
        severity: 0,
        evidence: "Follows spaced repetition principles",
      });
    } else if (conceptMentionStats.avgMentions > 5) {
      findings.push({
        type: "warning",
        message: `Concepts repeated too frequently (${conceptMentionStats.avgMentions.toFixed(
          1
        )} times)`,
        severity: 0.4,
        evidence: "May feel redundant; risk of passive reading",
      });
    }

    // Analyze spacing gaps
    const spacingAnalysis = this.analyzeSpacingGaps(chapter, concepts);
    console.log(
      "[SpacedRepetition] Spacing analysis:",
      "consistency:",
      spacingAnalysis.consistency.toFixed(2),
      "avgGap:",
      spacingAnalysis.avgGap.toFixed(0),
      "evenSpacing:",
      spacingAnalysis.evenSpacing,
      "unevenConcepts:",
      spacingAnalysis.unevenConcepts.length
    );

    evidence.push({
      type: "metric",
      metric: "spacing_gap_consistency",
      value: spacingAnalysis.consistency,
      threshold: 0.6,
      quality: spacingAnalysis.consistency > 0.6 ? "strong" : "weak",
    });

    if (spacingAnalysis.evenSpacing) {
      // Check if spacing is too short or too long even if consistent
      const idealMinGap = 500; // ~500 chars = few paragraphs
      const idealMaxGap = 5000; // ~5000 chars = few pages

      if (spacingAnalysis.avgGap < idealMinGap) {
        findings.push({
          type: "warning",
          message: `Spacing too tight: Concepts revisited every ${spacingAnalysis.avgGap} characters (recommend 500+ chars)`,
          severity: 0.6,
          evidence: `Concepts repeated too frequently - may feel redundant`,
        });
      } else if (spacingAnalysis.avgGap > idealMaxGap) {
        findings.push({
          type: "warning",
          message: `Spacing too wide: ${spacingAnalysis.avgGap} characters between revisits (recommend < 5000 chars)`,
          severity: 0.6,
          evidence: `Long gaps risk forgetting before re-encountering concept`,
        });
      } else {
        findings.push({
          type: "positive",
          message: "✓ Concepts spread evenly throughout chapter",
          severity: 0,
          evidence: `Spacing gaps are consistent and optimal (${spacingAnalysis.avgGap} characters)`,
        });
      }
    } else {
      findings.push({
        type: "warning",
        message:
          "Uneven spacing: Some concepts revisited early, others abandoned",
        severity: 0.5,
        evidence: spacingAnalysis.unevenConcepts.slice(0, 2).join(", "),
      });
    }

    // DEBUG: Check if any spacing-related warnings were generated
    const spacingWarnings = findings.filter(
      (f) => f.type === "warning" || f.type === "critical"
    ).length;

    console.log(
      `[SpacedRepetition] Generated ${spacingWarnings} warnings/critical findings out of ${findings.length} total findings`
    );

    // If we have concepts with multiple mentions but no warnings, something is wrong
    const conceptsWithSpacing = concepts.concepts.filter(
      (c) => c.mentions.length >= 2
    ).length;
    if (
      conceptsWithSpacing > 0 &&
      spacingWarnings === 0 &&
      findings.length > 0
    ) {
      // All findings are positive - this is suspicious, add a review suggestion
      findings.push({
        type: "neutral",
        message: `Spacing appears optimal - but manual review recommended for ${conceptsWithSpacing} concepts with multiple mentions`,
        severity: 0.2,
        evidence: `Automated analysis found no spacing issues, which may indicate very well-structured content`,
      });
    }

    // Calculate score (enhanced with new metrics)
    let score = 20; // Base score

    // Optimal spacing intervals (0-25 points)
    score += spacingIntervals.alignmentScore * 25;

    // Forgetting curve prevention (0-20 points)
    score += forgettingCurve.preventionScore * 20;

    // Distributed vs massed practice (0-20 points)
    score += practiceType.distributedRatio * 20;

    // Original metrics (0-35 points)
    score +=
      conceptMentionStats.avgMentions >= 2 &&
      conceptMentionStats.avgMentions <= 5
        ? 20
        : 8;
    score += spacingAnalysis.evenSpacing ? 15 : 5;
    score = Math.min(score, 100);

    const suggestions: Suggestion[] = [];

    if (spacingIntervals.alignmentScore < 0.4) {
      suggestions.push({
        id: "spaced-rep-0",
        principle: "spacedRepetition",
        priority: "high",
        title: "Implement Optimal Spacing Intervals",
        description:
          "Revisit concepts at scientifically-validated intervals: ~1 day, ~1 week, ~1 month",
        implementation:
          "For each core concept: (1) Initial introduction, (2) Revisit after 300-500 words (minutes later), (3) Mid-chapter callback (days), (4) End-chapter summary (weeks)",
        expectedImpact:
          "Aligns with memory consolidation research - maximizes retention with minimal repetition",
        relatedConcepts: concepts.hierarchy.core.map((c) => c.id),
        examples: [
          "Day 1: Introduce concept\\nDay 2-3: Brief review question\\nWeek 1: Apply in new context\\nMonth 1: Synthesis problem",
        ],
      });
    }

    if (practiceType.distributedRatio < 0.5) {
      suggestions.push({
        id: "spaced-rep-0.5",
        principle: "spacedRepetition",
        priority: "high",
        title: "Reduce Massed Practice",
        description:
          "Break up concept clusters - avoid presenting too much related content at once",
        implementation: `Redistribute the ${practiceType.massedSegments.length} massed practice segments throughout the chapter with spacing between repetitions`,
        expectedImpact:
          "Distributed practice produces 2-3x better long-term retention than cramming",
        relatedConcepts: practiceType.massedConcepts.slice(0, 5),
        examples: [
          "Instead of: A, A, A, B, B, B\\nUse: A, B, A, B, A, B (interleaved + spaced)",
        ],
      });
    }

    if (conceptMentionStats.avgMentions < 2) {
      suggestions.push({
        id: "spaced-rep-1",
        principle: "spacedRepetition",
        priority: "high",
        title: "Increase Concept Revisits",
        description:
          "Revisit core concepts at strategic intervals throughout the chapter",
        implementation:
          "After introducing a concept, plan to mention it again after 300-500 words, then again near the chapter conclusion",
        expectedImpact:
          "Spaced repetition strengthens neural pathways and prevents forgetting",
        relatedConcepts: concepts.hierarchy.core.map((c) => c.id),
        examples: [
          'Section 1: Introduce concept X\\nSection 3: "Recall that X is important because..."\\nSection 5 (conclusion): "We\'ve seen X applied in...',
        ],
      });
    }

    console.log(
      "[SpacedRepetition] FINAL RETURN - Findings:",
      findings.length,
      "items:",
      findings.map((f) => `${f.type}: ${f.message.substring(0, 50)}...`)
    );

    return {
      principle: "spacedRepetition",
      score,
      weight: 0.9,
      findings,
      suggestions,
      evidence,
    };
  }

  private static analyzeConceptMentionPatterns(
    _chapter: Chapter,
    concepts: ConceptGraph
  ) {
    const mentions = concepts.concepts.map((c) => c.mentions.length);
    const avgMentions =
      mentions.length > 0
        ? mentions.reduce((a, b) => a + b, 0) / mentions.length
        : 0;

    return {
      avgMentions,
      minMentions: Math.min(...mentions),
      maxMentions: Math.max(...mentions),
      totalMentions: mentions.reduce((a, b) => a + b, 0),
    };
  }

  private static analyzeSpacingGaps(_chapter: Chapter, concepts: ConceptGraph) {
    const gaps: number[] = [];
    const unevenConcepts: string[] = [];

    concepts.concepts.forEach((concept) => {
      if (concept.mentions.length < 2) return;

      const positions = concept.mentions.map((m) => m.position);
      const conceptGaps: number[] = [];

      for (let i = 1; i < positions.length; i++) {
        conceptGaps.push(positions[i] - positions[i - 1]);
      }

      gaps.push(...conceptGaps);

      // Check if gaps are too varied
      if (conceptGaps.length > 0) {
        const avgGap =
          conceptGaps.reduce((a, b) => a + b, 0) / conceptGaps.length;
        const variance =
          conceptGaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) /
          conceptGaps.length;
        if (variance > avgGap * avgGap) {
          unevenConcepts.push(concept.name);
        }
      }
    });

    const avgGap =
      gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
    const variance =
      gaps.length > 0
        ? gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) /
          gaps.length
        : 0;
    const stdDev = Math.sqrt(variance);
    const consistency = 1 - Math.min(stdDev / avgGap, 1);

    return {
      avgGap: Math.round(avgGap),
      evenSpacing: consistency > 0.6,
      consistency,
      unevenConcepts,
    };
  }

  // NEW: Calculate Optimal Spacing Intervals
  private static calculateOptimalSpacingIntervals(
    _chapter: Chapter,
    concepts: ConceptGraph
  ): {
    alignmentScore: number;
    actualPattern: string;
    optimalPattern: string;
  } {
    // Optimal spacing based on research: immediate, ~10min, ~1 day, ~1 week, ~1 month
    // In text: characters represent time (rough proxy)
    // Optimal gaps: 500 chars (minutes), 2000 chars (hours), 5000 chars (days)

    const optimalGaps = [500, 2000, 5000]; // Short, medium, long
    let totalAlignment = 0;
    let conceptsAnalyzed = 0;

    concepts.hierarchy.core.forEach((concept) => {
      if (concept.mentions.length < 2) return;

      const positions = concept.mentions
        .map((m) => m.position)
        .sort((a, b) => a - b);
      const gaps: number[] = [];

      for (let i = 1; i < positions.length; i++) {
        gaps.push(positions[i] - positions[i - 1]);
      }

      // Score each gap against optimal ranges
      gaps.forEach((gap) => {
        let bestMatch = 0;
        optimalGaps.forEach((optimalGap) => {
          const ratio = Math.min(gap, optimalGap) / Math.max(gap, optimalGap);
          bestMatch = Math.max(bestMatch, ratio);
        });
        totalAlignment += bestMatch;
      });

      conceptsAnalyzed += gaps.length;
    });

    const alignmentScore =
      conceptsAnalyzed > 0 ? totalAlignment / conceptsAnalyzed : 0;
    const avgActualGap =
      conceptsAnalyzed > 0 ? (totalAlignment / conceptsAnalyzed) * 2500 : 0;

    return {
      alignmentScore,
      actualPattern:
        avgActualGap > 0
          ? `~${Math.round(avgActualGap)} chars between revisits`
          : "no pattern",
      optimalPattern: "500 (min), 2000 (hours), 5000+ (days) chars",
    };
  }

  // NEW: Analyze Forgetting Curve Alignment
  private static analyzeForgettingCurve(
    _chapter: Chapter,
    concepts: ConceptGraph
  ): {
    preventionScore: number;
    conceptsAtRisk: number;
  } {
    // Forgetting curve: ~50% forgotten after 1 day, ~70% after 1 week without review
    // Estimate: concepts need revisit within ~3000 chars to prevent forgetting

    const FORGETTING_THRESHOLD = 3000; // chars before significant forgetting
    let conceptsAtRisk = 0;
    let totalGaps = 0;
    let safeGaps = 0;

    concepts.hierarchy.core.forEach((concept) => {
      if (concept.mentions.length < 2) {
        conceptsAtRisk++;
        return;
      }

      const positions = concept.mentions
        .map((m) => m.position)
        .sort((a, b) => a - b);

      for (let i = 1; i < positions.length; i++) {
        const gap = positions[i] - positions[i - 1];
        totalGaps++;

        if (gap <= FORGETTING_THRESHOLD) {
          safeGaps++;
        } else {
          // Long gap = forgetting likely occurred
          conceptsAtRisk++;
        }
      }
    });

    const preventionScore = totalGaps > 0 ? safeGaps / totalGaps : 0;

    return {
      preventionScore,
      conceptsAtRisk,
    };
  }

  // NEW: Detect Massed vs Distributed Practice
  private static detectMassedVsDistributed(
    _chapter: Chapter,
    concepts: ConceptGraph
  ): {
    massedRatio: number;
    distributedRatio: number;
    massedSegments: Array<{ concept: string; length: number }>;
    massedConcepts: string[];
  } {
    // Massed practice: 3+ mentions within 1000 characters
    // Distributed practice: mentions spread > 1000 characters apart

    const MASSED_THRESHOLD = 1000;
    let massedCount = 0;
    let distributedCount = 0;
    const massedSegments: Array<{ concept: string; length: number }> = [];
    const massedConcepts: string[] = [];

    concepts.concepts.forEach((concept) => {
      if (concept.mentions.length < 3) {
        distributedCount += concept.mentions.length;
        return;
      }

      const positions = concept.mentions
        .map((m) => m.position)
        .sort((a, b) => a - b);
      let massedStreak = 1;

      for (let i = 1; i < positions.length; i++) {
        const gap = positions[i] - positions[i - 1];

        if (gap <= MASSED_THRESHOLD) {
          massedStreak++;
        } else {
          if (massedStreak >= 3) {
            massedCount += massedStreak;
            massedSegments.push({
              concept: concept.name,
              length: massedStreak,
            });
            massedConcepts.push(concept.name);
          } else {
            distributedCount += massedStreak;
          }
          massedStreak = 1;
        }
      }

      // Handle final streak
      if (massedStreak >= 3) {
        massedCount += massedStreak;
        massedSegments.push({ concept: concept.name, length: massedStreak });
        if (!massedConcepts.includes(concept.name)) {
          massedConcepts.push(concept.name);
        }
      } else {
        distributedCount += massedStreak;
      }
    });

    const total = massedCount + distributedCount;
    const massedRatio = total > 0 ? massedCount / total : 0;
    const distributedRatio = total > 0 ? distributedCount / total : 1;

    return {
      massedRatio,
      distributedRatio,
      massedSegments,
      massedConcepts,
    };
  }
}
