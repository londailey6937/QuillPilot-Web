import {
  PrincipleEvaluation,
  Finding,
  Suggestion,
  Evidence,
  Chapter,
  ConceptGraph,
} from "./types.ts";

export class RetrievalPracticeEvaluator {
  static evaluate(
    chapter: Chapter,
    concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    console.log(
      "🔍 [RetrievalPractice] EVALUATOR STARTING - Total concepts:",
      concepts.concepts.length
    );

    const findings: Finding[] = [];
    const evidence: Evidence[] = [];

    // Pattern-based enhancement: Practice problems are explicit retrieval
    if (patternAnalysis) {
      const practiceProblems =
        patternAnalysis.patternCounts?.practiceProblem || 0;
      if (practiceProblems > 0) {
        findings.push({
          type: "positive",
          message: `✓ ${practiceProblems} practice problems provide explicit retrieval opportunities`,
          severity: 0,
          evidence:
            "Active problem solving requires retrieving concepts from memory",
        });
      }

      // Chemistry-specific: Prediction tasks
      const predictionTasks =
        patternAnalysis.patterns?.filter(
          (p: any) =>
            p.content.toLowerCase().includes("predict") ||
            p.content.toLowerCase().includes("what would happen")
        ) || [];
      if (predictionTasks.length > 0) {
        findings.push({
          type: "positive",
          message: `✓ ${predictionTasks.length} prediction tasks engage generative retrieval`,
          severity: 0,
          evidence:
            "Predicting outcomes forces learners to generate answers from mental models",
        });
      }
    }

    // NEW: Recall vs. Recognition Analysis
    const recallAnalysis = this.analyzeRecallVsRecognition(chapter);
    evidence.push({
      type: "metric",
      metric: "recall_opportunity_ratio",
      value: recallAnalysis.recallRatio,
      threshold: 0.4,
      quality: recallAnalysis.recallRatio >= 0.4 ? "strong" : "weak",
    });

    if (recallAnalysis.recallRatio < 0.3) {
      findings.push({
        type: "critical",
        message: `Low retrieval opportunity (${(
          recallAnalysis.recallRatio * 100
        ).toFixed(0)}%) - mostly passive recognition`,
        severity: 0.8,
        evidence: `Found ${recallAnalysis.recallPrompts} recall prompts vs ${recallAnalysis.recognitionPrompts} recognition statements`,
      });
    } else {
      findings.push({
        type: "positive",
        message: `✓ Good balance of recall prompts (${(
          recallAnalysis.recallRatio * 100
        ).toFixed(0)}%)`,
        severity: 0,
        evidence: "Active retrieval encouraged over passive reading",
      });
    }

    // NEW: Testing Effect Integration
    const testingEffect = this.analyzeTestingEffect(chapter);
    evidence.push({
      type: "metric",
      metric: "testing_effect_score",
      value: testingEffect.score,
      threshold: 0.5,
      quality: testingEffect.score >= 0.5 ? "strong" : "weak",
    });

    if (testingEffect.score < 0.4) {
      findings.push({
        type: "warning",
        message: "Limited testing effect - few self-check opportunities",
        severity: 0.6,
        evidence: `Only ${testingEffect.questionCount} questions found in text`,
      });
    }

    // Analyze question density (existing)
    const questionStats = this.analyzeQuestionDensity(chapter);
    console.log(
      "[RetrievalPractice] Question stats:",
      "density:",
      questionStats.density.toFixed(2),
      "totalQuestions:",
      questionStats.totalQuestions,
      "distribution:",
      questionStats.distribution
    );

    evidence.push({
      type: "metric",
      metric: "question_density",
      value: questionStats.density,
      threshold: 2,
      quality: questionStats.density >= 2 ? "strong" : "weak",
    });

    if (questionStats.density < 1.5) {
      findings.push({
        type: "warning",
        message: `Low question density (${questionStats.density.toFixed(
          1
        )} per 1000 words)`,
        severity: 0.6,
        evidence: "Retrieval practice requires frequent prompts",
      });
    } else {
      findings.push({
        type: "positive",
        message: `✓ Good question density (${questionStats.density.toFixed(
          1
        )} per 1000 words)`,
        severity: 0,
        evidence: "Frequent prompts support retrieval practice",
      });
    }

    // Analyze retrieval types
    const retrievalTypes = this.analyzeRetrievalTypes(chapter);
    console.log(
      "[RetrievalPractice] Retrieval types:",
      "generative:",
      retrievalTypes.generative,
      "discriminative:",
      retrievalTypes.discriminative,
      "simple:",
      retrievalTypes.simple
    );

    if (retrievalTypes.generative === 0) {
      findings.push({
        type: "warning",
        message: "No generative retrieval prompts found",
        severity: 0.7,
        evidence:
          'Missing "explain", "describe", "why" prompts that require answer generation',
      });
    } else {
      findings.push({
        type: "positive",
        message: `✓ Found ${retrievalTypes.generative} generative retrieval prompts`,
        severity: 0,
        evidence:
          "Prompts require generating answers rather than just selecting",
      });
    }

    // Calculate score
    let score = 20; // Base score

    // Recall vs Recognition (0-30 points)
    score += recallAnalysis.recallRatio * 30;

    // Testing Effect (0-20 points)
    score += testingEffect.score * 20;

    // Question Density (0-15 points)
    score += Math.min(questionStats.density * 5, 15);

    // Generative Retrieval (0-15 points)
    score += Math.min(retrievalTypes.generative * 3, 15);

    score = Math.min(score, 100);

    const suggestions: Suggestion[] = [];

    if (recallAnalysis.recallRatio < 0.3) {
      suggestions.push({
        id: "retrieval-0",
        principle: "retrievalPractice",
        priority: "high",
        title: "Convert Recognition to Recall",
        description:
          "Change statements into questions to force active retrieval",
        implementation:
          "Instead of stating facts, ask the learner to retrieve them. E.g., change 'Mitochondria is the powerhouse' to 'What is the function of mitochondria?'",
        expectedImpact:
          "Recall strengthens memory traces significantly more than re-reading (recognition)",
        relatedConcepts: concepts.hierarchy.core.map((c) => c.id),
        examples: [
          "Statement: The atomic number equals proton count.\\nQuestion: How does atomic number relate to proton count?",
        ],
      });
    }

    if (testingEffect.score < 0.4) {
      suggestions.push({
        id: "retrieval-1",
        principle: "retrievalPractice",
        priority: "high",
        title: "Add 'Stop and Think' Questions",
        description: "Insert low-stakes questions every 500-800 words",
        implementation:
          "Add short, open-ended questions that require the learner to summarize the previous section from memory",
        expectedImpact:
          "The 'Testing Effect' shows that the act of retrieval itself improves learning",
        relatedConcepts: concepts.hierarchy.core.map((c) => c.id),
        examples: [
          "Close the book and explain the concept of X in your own words.",
          "What are the three main components of Y?",
        ],
      });
    }

    if (retrievalTypes.generative === 0) {
      suggestions.push({
        id: "retrieval-2",
        principle: "retrievalPractice",
        priority: "medium",
        title: "Include Generative Prompts",
        description:
          "Add prompts that require generating an explanation, not just a label",
        implementation:
          "Use 'Why', 'How', and 'Explain' prompts rather than 'What is' or multiple choice",
        expectedImpact:
          "Generative retrieval builds stronger, more flexible mental models",
        relatedConcepts: concepts.hierarchy.core.map((c) => c.id),
        examples: [
          "Why does reaction rate increase with temperature?",
          "Explain the mechanism of action for...",
        ],
      });
    }

    console.log(
      "[RetrievalPractice] FINAL RETURN - Findings:",
      findings.length,
      "items:",
      findings.map((f) => `${f.type}: ${f.message.substring(0, 50)}...`)
    );

    return {
      principle: "retrievalPractice",
      score,
      weight: 0.9,
      findings,
      suggestions,
      evidence,
    };
  }

  private static analyzeQuestionDensity(chapter: Chapter) {
    const questionMarks = (chapter.content.match(/\?/g) || []).length;
    const wordCount = chapter.content.split(/\s+/).length;
    const density = (questionMarks / wordCount) * 1000; // Questions per 1000 words

    // Analyze distribution
    const segments = 5;
    const segmentLength = Math.floor(chapter.content.length / segments);
    const distribution = Array(segments)
      .fill(0)
      .map((_, i) => {
        const segment = chapter.content.substr(
          i * segmentLength,
          segmentLength
        );
        return (segment.match(/\?/g) || []).length;
      });

    return {
      density,
      totalQuestions: questionMarks,
      distribution,
    };
  }

  private static analyzeRetrievalTypes(chapter: Chapter) {
    const content = chapter.content.toLowerCase();

    // Generative: requires producing an answer
    const generative = (
      content.match(
        /\b(explain|describe|why|how does|what causes|predict|design)\b/g
      ) || []
    ).length;

    // Discriminative: requires choosing/distinguishing
    const discriminative = (
      content.match(
        /\b(which|choose|select|identify|distinguish|compare|contrast)\b/g
      ) || []
    ).length;

    // Simple: factual recall
    const simple = (
      content.match(/\b(what is|define|list|name|state)\b/g) || []
    ).length;

    return {
      generative,
      discriminative,
      simple,
    };
  }

  // NEW: Analyze Recall vs Recognition
  private static analyzeRecallVsRecognition(chapter: Chapter): {
    recallRatio: number;
    recallPrompts: number;
    recognitionPrompts: number;
  } {
    const content = chapter.content.toLowerCase();

    // Recall: Open-ended questions, fill-in-the-blank (without bank)
    const recallPrompts = (
      content.match(
        /\b(recall|remember|what was|explain from memory|without looking)\b/g
      ) || []
    ).length;

    // Recognition: Multiple choice, matching, true/false
    const recognitionPrompts = (
      content.match(
        /\b(which of the following|match|true or false|select the correct)\b/g
      ) || []
    ).length;

    // Also count question types as proxy
    const openEnded = (content.match(/\b(why|how|explain|describe)\b/g) || [])
      .length; // Recall-ish
    const closed = (content.match(/\b(is it|does it|can you)\b/g) || []).length; // Recognition-ish

    const totalRecall = recallPrompts + openEnded;
    const totalRecognition = recognitionPrompts + closed;
    const total = totalRecall + totalRecognition;

    return {
      recallRatio: total > 0 ? totalRecall / total : 0,
      recallPrompts: totalRecall,
      recognitionPrompts: totalRecognition,
    };
  }

  // NEW: Analyze Testing Effect
  private static analyzeTestingEffect(chapter: Chapter): {
    score: number;
    questionCount: number;
  } {
    // Testing effect relies on frequent low-stakes testing
    // Look for "Check your understanding", "Quiz", "Review", etc.

    const content = chapter.content.toLowerCase();
    const explicitTests = (
      content.match(
        /\b(quiz|test|check|review|practice|exercise|problem set)\b/g
      ) || []
    ).length;

    const questionCount = (content.match(/\?/g) || []).length;

    // Score based on presence of explicit testing sections AND question density
    let score = 0;

    if (explicitTests > 2) score += 0.4;
    if (explicitTests > 5) score += 0.2;

    if (questionCount > 5) score += 0.2;
    if (questionCount > 10) score += 0.2;

    return {
      score: Math.min(score, 1.0),
      questionCount,
    };
  }
}
