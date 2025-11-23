import {
  PrincipleEvaluation,
  Finding,
  Suggestion,
  Evidence,
  Chapter,
  ConceptGraph,
} from "./types.ts";

export class InterleavingEvaluator {
  static evaluate(
    chapter: Chapter,
    concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    console.log(
      "🔍 [Interleaving] EVALUATOR STARTING - Total concepts:",
      concepts.concepts.length
    );

    const findings: Finding[] = [];
    const evidence: Evidence[] = [];

    // Pattern-based enhancement: Mixed problem sets
    if (patternAnalysis) {
      const mixedProblemSets = patternAnalysis.patterns?.filter(
        (p: any) =>
          p.type === "practiceProblem" && p.metadata?.isMixedReview === true
      ).length;

      if (mixedProblemSets > 0) {
        findings.push({
          type: "positive",
          message: `✓ ${mixedProblemSets} mixed review problem sets support interleaving`,
          severity: 0,
          evidence:
            "Mixed practice forces learners to discriminate between problem types",
        });
      }
    }

    // Analyze concept sequence for blocking vs interleaving
    const sequence = concepts.sequence;
    const blockingSegments = this.identifyBlockingSegments(sequence);
    const totalPositions = sequence.length;
    const blockedPositions = blockingSegments.reduce(
      (sum, seg) => sum + seg.length,
      0
    );
    const blockingRatio =
      totalPositions > 0 ? blockedPositions / totalPositions : 0;

    console.log(
      "[Interleaving] Blocking analysis:",
      "ratio:",
      blockingRatio.toFixed(2),
      "segments:",
      blockingSegments.length,
      "totalPositions:",
      totalPositions
    );

    // NEW: Interleaving Density Analysis
    const interleavingDensity = this.calculateInterleavingDensity(
      chapter,
      concepts
    );
    evidence.push({
      type: "metric",
      metric: "interleaving_density",
      value: interleavingDensity.densityScore,
      threshold: 0.6,
      quality:
        interleavingDensity.densityScore >= 0.6
          ? "strong"
          : interleavingDensity.densityScore >= 0.4
          ? "moderate"
          : "weak",
    });

    // NEW: Discrimination Practice Opportunities
    const discriminationPractice = this.detectDiscriminationPractice(
      chapter.content,
      concepts
    );
    evidence.push({
      type: "count",
      metric: "discrimination_opportunities",
      value: discriminationPractice.count,
      threshold: Math.max(3, Math.ceil(concepts.hierarchy.core.length / 3)),
      quality: discriminationPractice.count >= 3 ? "strong" : "weak",
    });

    if (discriminationPractice.count === 0) {
      findings.push({
        type: "warning",
        message:
          "No discrimination practice detected - learners may confuse similar concepts",
        severity: 0.7,
        evidence:
          "Comparing/contrasting similar concepts strengthens discrimination ability",
      });
    }

    evidence.push({
      type: "metric",
      metric: "blocking_ratio",
      value: blockingRatio,
      threshold: 0.4,
      quality:
        blockingRatio < 0.4
          ? "strong"
          : blockingRatio < 0.6
          ? "moderate"
          : "weak",
    });

    if (blockingRatio > 0.7) {
      findings.push({
        type: "critical",
        message: "Heavy blocking detected: Topics too isolated from each other",
        severity: 0.8,
        evidence: `${(blockingRatio * 100).toFixed(
          0
        )}% of content focuses on single topics`,
      });
    } else if (blockingRatio < 0.4) {
      findings.push({
        type: "positive",
        message: "✓ Excellent interleaving: Topics well-mixed",
        severity: 0,
        evidence: `Topics switch every ${(
          totalPositions / Math.max(blockingSegments.length, 1)
        ).toFixed(1)} concepts`,
      });
    }

    // Enhanced score calculation
    let score = 30; // Base
    score += (1 - blockingRatio) * 35; // Blocking ratio (0-35)
    score += interleavingDensity.densityScore * 20; // Density (0-20)
    score += Math.min(discriminationPractice.count * 3, 15); // Discrimination (0-15)

    const suggestions: Suggestion[] = [];
    if (blockingRatio > 0.6) {
      suggestions.push({
        id: "interleaving-1",
        principle: "interleaving",
        priority: "high",
        title: "Reduce Blocking - Mix Topics",
        description:
          "Break up blocked content segments and interleave different concepts",
        implementation: `Redistribute ${blockingSegments.length} blocked segments throughout chapter`,
        expectedImpact:
          "Interleaving produces 40-50% better long-term retention than blocking",
        relatedConcepts: blockingSegments.map((s) => s.topic).slice(0, 5),
        examples: ["Instead of: AAA BBB CCC, Use: ABC ABC ABC"],
      });
    }

    return {
      principle: "interleaving",
      score: Math.min(score, 100),
      weight: 0.85,
      findings,
      suggestions,
      evidence,
    };
  }

  private static identifyBlockingSegments(sequence: string[]) {
    const segments: { topic: string; length: number; start: number }[] = [];
    if (sequence.length === 0) return segments;
    let current: { topic: string; length: number; start: number } = {
      topic: sequence[0],
      length: 1,
      start: 0,
    };

    for (let i = 1; i < sequence.length; i++) {
      if (sequence[i] === current.topic) {
        current.length++;
      } else {
        if (current.length > 1) {
          segments.push(current);
        }
        current = { topic: sequence[i], length: 1, start: i };
      }
    }

    if (current.length > 1) {
      segments.push(current);
    }

    return segments;
  }

  // NEW: Calculate Interleaving Density
  private static calculateInterleavingDensity(
    chapter: Chapter,
    concepts: ConceptGraph
  ): {
    densityScore: number;
    sectionScores: number[];
  } {
    const sectionScores: number[] = [];

    chapter.sections.forEach((section) => {
      const sectionConcepts = new Set<string>();
      const sectionStart = chapter.content.indexOf(section.content);
      const sectionEnd = sectionStart + section.content.length;

      concepts.concepts.forEach((concept) => {
        concept.mentions.forEach((mention) => {
          if (
            mention.position >= sectionStart &&
            mention.position < sectionEnd
          ) {
            sectionConcepts.add(concept.name);
          }
        });
      });

      // Score based on concept diversity in section
      const diversityScore =
        sectionConcepts.size >= 3 ? 1 : sectionConcepts.size / 3;
      sectionScores.push(diversityScore);
    });

    const densityScore =
      sectionScores.length > 0
        ? sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length
        : 0;

    return { densityScore, sectionScores };
  }

  // NEW: Detect Discrimination Practice
  private static detectDiscriminationPractice(
    text: string,
    concepts: ConceptGraph
  ): {
    count: number;
    examples: string[];
  } {
    const patterns = [
      /(?:compare|contrast)\s+(?:and\s+contrast\s+)?/gi,
      /(?:difference|distinguish)\s+between/gi,
      /(?:similar|different)\s+(?:to|from)/gi,
      /(?:unlike|whereas|however)/gi,
    ];

    let count = 0;
    const examples: string[] = [];

    patterns.forEach((pattern) => {
      const matches = text.match(pattern) || [];
      count += matches.length;
    });

    // Check if core concepts are compared
    const coreConcepts = concepts.hierarchy.core.map((c) => c.name);
    for (let i = 0; i < coreConcepts.length - 1; i++) {
      for (let j = i + 1; j < coreConcepts.length; j++) {
        const regex = new RegExp(
          `${coreConcepts[i]}.{0,100}(?:vs|versus|and|compared to).{0,100}${coreConcepts[j]}`,
          "i"
        );
        if (regex.test(text)) {
          examples.push(`${coreConcepts[i]} vs ${coreConcepts[j]}`);
        }
      }
    }

    return { count, examples: examples.slice(0, 3) };
  }
}
