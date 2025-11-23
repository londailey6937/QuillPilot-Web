import {
  PrincipleEvaluation,
  Finding,
  Suggestion,
  Evidence,
  Chapter,
  ConceptGraph,
} from "./types.ts";

export class CognitiveLoadEvaluator {
  static evaluate(
    chapter: Chapter,
    _concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    const segmentAnalysis = this.analyzeSectionSegmentation(chapter);
    const findings: Finding[] = [];
    const evidence: Evidence[] = [];
    const suggestions: Suggestion[] = [];

    // Pattern-based enhancement: Worked examples reduce cognitive load
    if (patternAnalysis) {
      const workedExamples =
        patternAnalysis.patterns?.filter(
          (p: any) => p.type === "workedExample"
        ) || [];
      const practiceProblems =
        patternAnalysis.patterns?.filter(
          (p: any) => p.type === "practiceProblem"
        ) || [];

      const ratio =
        practiceProblems.length > 0
          ? workedExamples.length / practiceProblems.length
          : 0;

      if (ratio >= 0.5) {
        findings.push({
          type: "positive",
          message: `✓ Good worked-to-practice ratio (${workedExamples.length}:${practiceProblems.length}) reduces cognitive load`,
          severity: 0,
          evidence:
            "Sufficient worked examples before practice reduces extraneous cognitive load",
        });
      } else if (ratio < 0.3 && practiceProblems.length > 5) {
        findings.push({
          type: "warning",
          message: `Too few worked examples (${workedExamples.length}) for ${practiceProblems.length} practice problems may overload beginners`,
          severity: 0.5,
          evidence:
            "Novice learners need more worked examples to reduce problem-solving cognitive load",
        });
      }

      // Chemistry-specific: Complex mechanisms increase intrinsic load
      const mechanisms =
        patternAnalysis.patterns?.filter(
          (p: any) =>
            p.metadata?.procedureType === "mechanism" &&
            p.metadata?.difficulty === "hard"
        ) || [];
      if (mechanisms.length > 3) {
        findings.push({
          type: "warning",
          message: `Chemistry: ${mechanisms.length} complex reaction mechanisms may cause cognitive overload`,
          severity: 0.5,
          evidence:
            "Multi-step mechanisms have high intrinsic complexity—ensure adequate scaffolding",
        });
      }
    }

    evidence.push({
      type: "metric",
      metric: "Avg Section Length",
      value: Math.round(segmentAnalysis.avgLength),
      threshold: 500,
      quality: segmentAnalysis.avgLength < 800 ? "strong" : "moderate",
    });

    evidence.push({
      type: "count",
      metric: "Sections Over 1000 Words",
      value: segmentAnalysis.tooLong,
      quality:
        segmentAnalysis.tooLong === 0
          ? "strong"
          : segmentAnalysis.tooLong < 3
          ? "moderate"
          : "weak",
    });

    // Generate findings based on section lengths
    if (segmentAnalysis.avgLength < 600) {
      findings.push({
        type: "positive",
        severity: 0.2,
        message: `Excellent section sizing: Average section length of ${Math.round(
          segmentAnalysis.avgLength
        )} words prevents cognitive overload and maintains focus.`,
        evidence: `Sections average ${Math.round(
          segmentAnalysis.avgLength
        )} words, well within the optimal 400-600 word range for maintaining working memory capacity.`,
      });
    } else if (segmentAnalysis.avgLength < 1000) {
      findings.push({
        type: "warning",
        severity: 0.5,
        message: `Moderate section lengths: Average of ${Math.round(
          segmentAnalysis.avgLength
        )} words. Consider breaking longer sections to reduce cognitive load.`,
        evidence: `At ${Math.round(
          segmentAnalysis.avgLength
        )} words average, sections approach the upper limit where working memory begins to strain.`,
      });
    } else {
      findings.push({
        type: "critical",
        severity: 0.9,
        message: `High cognitive load risk: Average section length of ${Math.round(
          segmentAnalysis.avgLength
        )} words may overwhelm working memory. Sections should ideally be under 800 words.`,
        evidence: `Average section length of ${Math.round(
          segmentAnalysis.avgLength
        )} words significantly exceeds the 800-word threshold for effective cognitive processing.`,
      });
    }

    if (segmentAnalysis.tooLong > 0) {
      findings.push({
        type: "warning",
        severity: segmentAnalysis.tooLong > 3 ? 0.8 : 0.6,
        message: `${segmentAnalysis.tooLong} section${
          segmentAnalysis.tooLong > 1 ? "s" : ""
        } exceed${
          segmentAnalysis.tooLong === 1 ? "s" : ""
        } 1000 words. Long sections increase extraneous cognitive load and reduce retention.`,
        evidence: `${segmentAnalysis.tooLong} section${
          segmentAnalysis.tooLong > 1 ? "s exceed" : " exceeds"
        } 1000 words, forcing students to maintain too much information in working memory simultaneously.`,
      });

      suggestions.push({
        id: "cl-break-long",
        principle: "cognitiveLoad",
        title: "Break up long sections",
        description: `Divide the ${segmentAnalysis.tooLong} lengthy section${
          segmentAnalysis.tooLong > 1 ? "s" : ""
        } into smaller chunks of 400-800 words. Use clear subheadings to mark transitions and give students mental "breathing room."`,
        priority: segmentAnalysis.tooLong > 3 ? "high" : "medium",
        implementation:
          "Insert subheadings every 400-600 words, creating natural pause points. Each subsection should cover one key idea.",
        expectedImpact:
          "Reduces cognitive overload and improves comprehension by chunking information into manageable units.",
        relatedConcepts: [],
        examples: [
          "Section 1: Introduction (400 words)",
          "Section 2: Key Concept A (500 words)",
          "Section 3: Example & Application (400 words)",
        ],
      });
    }

    if (segmentAnalysis.avgLength > 800) {
      suggestions.push({
        id: "cl-reduce-average",
        principle: "cognitiveLoad",
        title: "Reduce average section length",
        description:
          "Aim for 400-600 words per section. Add strategic breaks with summaries, examples, or practice problems to prevent cognitive overload and improve information processing.",
        priority: "medium",
        implementation:
          "Review longer sections and divide them at natural conceptual boundaries. Add transition sentences to maintain flow between subsections.",
        expectedImpact:
          "Improves retention by keeping content within working memory limits and providing mental processing breaks.",
        relatedConcepts: [],
        examples: [
          "Break at: Change of topic",
          "Break at: Introduction of new term",
          "Break at: Transition from theory to practice",
        ],
      });
    }

    let score = 50;
    if (segmentAnalysis.avgLength < 600) score += 30;
    else if (segmentAnalysis.avgLength < 1000) score += 15;

    // Penalize for too many long sections
    if (segmentAnalysis.tooLong > 5) score -= 15;
    else if (segmentAnalysis.tooLong > 2) score -= 10;

    return {
      principle: "cognitiveLoad",
      score: Math.min(Math.max(score, 0), 100),
      weight: 0.8,
      findings,
      suggestions,
      evidence,
    };
  }

  private static analyzeSectionSegmentation(chapter: Chapter) {
    const lengths = chapter.sections.map((s) => s.wordCount);
    const avgLength =
      lengths.length > 0
        ? lengths.reduce((a, b) => a + b, 0) / lengths.length
        : 0;
    const tooLong = lengths.filter((l) => l > 1000).length;

    return { avgLength, tooLong };
  }
}
