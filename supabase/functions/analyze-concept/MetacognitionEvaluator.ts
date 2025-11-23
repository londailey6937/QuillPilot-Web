import {
  PrincipleEvaluation,
  Finding,
  Suggestion,
  Evidence,
  Chapter,
  ConceptGraph,
} from "./types.ts";

export class MetacognitionEvaluator {
  static evaluate(
    chapter: Chapter,
    _concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    const metacognitivePrompts = this.countMetacognitiveElements(
      chapter.content
    );
    const findings: Finding[] = [];
    const suggestions: Suggestion[] = [];
    const evidence: Evidence[] = [];

    // Pattern-based enhancement: Practice problems without answers encourage self-monitoring
    if (patternAnalysis) {
      const problemsWithoutAnswers =
        patternAnalysis.patterns?.filter(
          (p: any) =>
            p.type === "practiceProblem" && p.metadata?.hasAnswer === false
        ) || [];
      if (problemsWithoutAnswers.length > 5) {
        findings.push({
          type: "positive",
          message: `✓ ${problemsWithoutAnswers.length} problems without immediate answers promote self-assessment`,
          severity: 0,
          evidence:
            "Students must evaluate their own understanding before checking solutions",
        });
      }

      // Chemistry-specific: Lab safety requires metacognitive awareness
      const labProcedures =
        patternAnalysis.patterns?.filter(
          (p: any) => p.metadata?.procedureType === "laboratory"
        ) || [];
      if (labProcedures.length > 0) {
        findings.push({
          type: "positive",
          message: `✓ Chemistry: ${labProcedures.length} lab procedures require safety monitoring and self-evaluation`,
          severity: 0,
          evidence:
            "Laboratory work demands continuous metacognitive awareness of technique and hazards",
        });
      }
    }

    evidence.push({
      type: "count",
      metric: "Metacognitive Prompts",
      value: metacognitivePrompts,
      threshold: Math.ceil(chapter.sections.length / 2),
      quality:
        metacognitivePrompts >= Math.ceil(chapter.sections.length / 2)
          ? "strong"
          : "weak",
    });

    // Generate findings
    const minExpected = Math.ceil(chapter.sections.length / 2);

    if (metacognitivePrompts === 0) {
      findings.push({
        type: "critical",
        message:
          "No metacognitive prompts detected (self-monitoring, reflection)",
        severity: 0.8,
        evidence:
          "Metacognition helps students monitor their own understanding and identify confusion early",
      });
    } else if (metacognitivePrompts < minExpected) {
      findings.push({
        type: "warning",
        message: `Limited metacognitive support: ${metacognitivePrompts} prompts (recommend: ${minExpected})`,
        severity: 0.6,
        evidence:
          "More frequent self-checks help students recognize and address gaps",
      });
    } else {
      findings.push({
        type: "positive",
        message: `✓ Good metacognitive scaffolding: ${metacognitivePrompts} prompts found`,
        severity: 0,
        evidence:
          "Regular self-monitoring improves learning efficiency and reduces misconceptions",
      });
    }

    // Generate suggestions
    if (metacognitivePrompts < minExpected) {
      suggestions.push({
        id: "metacog-1",
        principle: "metacognition",
        priority: metacognitivePrompts === 0 ? "high" : "medium",
        title: "Add Metacognitive Checkpoints",
        description:
          "Include prompts that encourage students to monitor their own understanding",
        implementation:
          'Add checkpoints: "Does this make sense?", "Can you explain this in your own words?", "What parts are confusing?", "Check your understanding"',
        expectedImpact:
          "Metacognitive prompts help students identify and address confusion before it compounds",
        relatedConcepts: [],
        examples: [
          "After complex section: 'Pause and check—can you explain this to a friend?'",
          "Before moving on: 'If you're confused, review the worked example above'",
          "Self-test: 'Cover the solution and try to solve this yourself'",
          "Reflection: 'What was the most challenging concept in this section?'",
        ],
      });
    }

    let score = 50 + metacognitivePrompts * 5;

    return {
      principle: "metacognition",
      score: Math.min(score, 100),
      weight: 0.75,
      findings,
      suggestions,
      evidence,
    };
  }

  private static countMetacognitiveElements(text: string): number {
    const patterns = [
      /do you understand/gi,
      /confused/gi,
      /misconception/gi,
      /self-test/gi,
      /check your understanding/gi,
      /reflect/gi,
    ];

    return patterns.reduce((sum, pattern) => {
      return sum + (text.match(pattern) || []).length;
    }, 0);
  }
}
