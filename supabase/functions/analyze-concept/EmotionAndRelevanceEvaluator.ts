import {
  PrincipleEvaluation,
  Finding,
  Suggestion,
  Evidence,
  Chapter,
  ConceptGraph,
} from "./types.ts";

export class EmotionAndRelevanceEvaluator {
  static evaluate(
    chapter: Chapter,
    _concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    const emotionalElements = this.countEmotionalElements(chapter.content);
    const relevanceElements = this.countRelevanceStatements(chapter.content);
    const findings: Finding[] = [];
    const evidence: Evidence[] = [];

    // Pattern-based enhancement: Real-world examples increase relevance
    if (patternAnalysis) {
      const workedExamples =
        patternAnalysis.patterns?.filter(
          (p: any) => p.type === "workedExample"
        ) || [];
      const definitionExamples =
        patternAnalysis.patterns?.filter(
          (p: any) => p.type === "definitionExample"
        ) || [];

      const totalExamples = workedExamples.length + definitionExamples.length;
      if (totalExamples > 10) {
        findings.push({
          type: "positive",
          message: `✓ ${totalExamples} concrete examples increase emotional engagement and relevance`,
          severity: 0,
          evidence:
            "Real examples make abstract concepts tangible and personally meaningful",
        });
      }

      // Chemistry-specific: Lab procedures create hands-on relevance
      const labProcedures =
        patternAnalysis.patterns?.filter(
          (p: any) => p.metadata?.procedureType === "laboratory"
        ) || [];
      if (labProcedures.length > 0) {
        findings.push({
          type: "positive",
          message: `✓ Chemistry: ${labProcedures.length} laboratory procedures connect theory to hands-on experience`,
          severity: 0,
          evidence:
            "Lab work creates emotional investment through direct sensory engagement",
        });
      }

      // Chemistry-specific: Real chemical equations show practical relevance
      const chemicalEquations =
        patternAnalysis.patterns?.filter(
          (p: any) => p.title === "Chemical Equation"
        ) || [];
      if (chemicalEquations.length > 15) {
        findings.push({
          type: "positive",
          message: `✓ Chemistry: ${chemicalEquations.length} reactions demonstrate real-world chemical processes`,
          severity: 0,
          evidence:
            "Seeing actual reactions makes chemistry tangible and relevant to daily life",
        });
      }
    }

    evidence.push({
      type: "count",
      metric: "emotional_elements",
      value: emotionalElements,
      quality: emotionalElements > 0 ? "moderate" : "weak",
    });

    evidence.push({
      type: "count",
      metric: "relevance_statements",
      value: relevanceElements,
      quality: relevanceElements > 0 ? "moderate" : "weak",
    });

    let score = 50 + emotionalElements * 3 + relevanceElements * 3;

    return {
      principle: "emotionAndRelevance",
      score: Math.min(score, 100),
      weight: 0.7,
      findings,
      suggestions: [],
      evidence,
    };
  }

  private static countEmotionalElements(text: string): number {
    const patterns = [/story/gi, /example/gi, /imagine/gi, /visualize/gi];
    return patterns.reduce((sum, pattern) => {
      return sum + (text.match(pattern) || []).length;
    }, 0);
  }

  private static countRelevanceStatements(text: string): number {
    const patterns = [
      /matters/gi,
      /important/gi,
      /applies to/gi,
      /real-world/gi,
    ];
    return patterns.reduce((sum, pattern) => {
      return sum + (text.match(pattern) || []).length;
    }, 0);
  }
}
