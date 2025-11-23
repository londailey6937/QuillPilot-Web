import {
  PrincipleEvaluation,
  Finding,
  Suggestion,
  Evidence,
  Chapter,
  ConceptGraph,
} from "./types.ts";

export class GenerativeLearningEvaluator {
  static evaluate(
    chapter: Chapter,
    _concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    const generativePrompts = this.countGenerativePrompts(chapter.content);
    const findings: Finding[] = [];
    const suggestions: Suggestion[] = [];
    const evidence: Evidence[] = [];

    // Pattern-based enhancement: Practice problems without answers promote generation
    if (patternAnalysis) {
      const practiceProblems =
        patternAnalysis.patternCounts?.practiceProblem || 0;
      const procedures = patternAnalysis.patternCounts?.procedure || 0;

      // Practice problems without provided answers require generation
      const practicePatterns =
        patternAnalysis.patterns?.filter(
          (p: any) => p.type === "practiceProblem"
        ) || [];
      const problemsWithoutAnswers = practicePatterns.filter(
        (p: any) => !p.metadata?.hasAnswer
      ).length;

      if (problemsWithoutAnswers > 0) {
        evidence.push({
          type: "count",
          metric: "Generative Practice Problems",
          value: problemsWithoutAnswers,
          threshold: chapter.sections.length,
          quality:
            problemsWithoutAnswers >= chapter.sections.length
              ? "strong"
              : "moderate",
        });

        findings.push({
          type: "positive",
          message: `✓ ${problemsWithoutAnswers} practice problems require students to generate solutions independently`,
          severity: 0,
          evidence:
            "Self-generation strengthens encoding and reveals understanding gaps",
        });
      }

      // Procedures provide scaffolding for generation
      if (procedures > 0) {
        findings.push({
          type: "positive",
          message: `✓ ${procedures} procedures guide students in generating systematic solutions`,
          severity: 0,
          evidence: "Step-by-step procedures scaffold complex generative tasks",
        });
      }
    }

    evidence.push({
      type: "count",
      metric: "Generative Prompts",
      value: generativePrompts,
      threshold: chapter.sections.length,
      quality: generativePrompts >= chapter.sections.length ? "strong" : "weak",
    });

    // Generate findings
    if (generativePrompts === 0) {
      findings.push({
        type: "critical",
        message: "No generative learning prompts detected",
        severity: 0.85,
        evidence:
          "Generative activities (predict, create, construct) improve retention by 50% vs passive reading",
      });
    } else if (generativePrompts < chapter.sections.length) {
      findings.push({
        type: "warning",
        message: `Limited generative prompts: ${generativePrompts} found (recommend: ${chapter.sections.length})`,
        severity: 0.6,
        evidence: "Aim for at least one generative activity per section",
      });
    } else {
      findings.push({
        type: "positive",
        message: `✓ Good use of generative learning: ${generativePrompts} prompts found`,
        severity: 0,
        evidence:
          "Generating output deepens encoding and reveals gaps in understanding",
      });
    }

    // Generate suggestions
    if (generativePrompts < chapter.sections.length) {
      suggestions.push({
        id: "generative-1",
        principle: "generativeLearning",
        priority: generativePrompts === 0 ? "high" : "medium",
        title: "Add Generative Learning Activities",
        description:
          "Include prompts that require students to produce their own responses, predictions, or solutions",
        implementation:
          'Add prompts like: "Predict what happens if...", "Create your own example of...", "Write a summary in your own words", "Design a solution that..."',
        expectedImpact:
          "Active generation forces deeper processing and reveals misconceptions early",
        relatedConcepts: [],
        examples: [
          "Before revealing answer: Ask students to predict the outcome",
          "After explanation: Request students create their own example",
          "Mid-section: Prompt students to summarize key points in own words",
          "Problem-solving: Have students design alternative approaches",
        ],
      });
    }

    let score = 50 + generativePrompts * 5;

    return {
      principle: "generativeLearning",
      score: Math.min(score, 100),
      weight: 0.85,
      findings,
      suggestions,
      evidence,
    };
  }

  private static countGenerativePrompts(text: string): number {
    const patterns = [
      /predict/gi,
      /generate/gi,
      /create/gi,
      /write/gi,
      /construct/gi,
      /solve/gi,
      /design/gi,
    ];

    return patterns.reduce((sum, pattern) => {
      return sum + (text.match(pattern) || []).length;
    }, 0);
  }
}
