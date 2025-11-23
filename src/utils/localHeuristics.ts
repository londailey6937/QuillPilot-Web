import { PrincipleEvaluation, Finding, LearningPrinciple } from "@/types";

/**
 * Local Heuristics for Offline Analysis
 * Provides approximate scores for learning principles when server analysis is unavailable.
 */

const KEYWORD_LISTS: Record<string, string[]> = {
  deepProcessing: [
    "why",
    "how",
    "explain",
    "compare",
    "contrast",
    "analyze",
    "relationship",
    "cause",
    "effect",
    "because",
    "therefore",
    "conclude",
  ],
  retrievalPractice: [
    "quiz",
    "test",
    "check",
    "verify",
    "recall",
    "remember",
    "exercise",
    "practice",
    "problem",
    "solve",
    "question",
    "?",
  ],
  metacognition: [
    "think",
    "reflect",
    "monitor",
    "plan",
    "strategy",
    "understand",
    "confused",
    "clear",
    "goal",
    "objective",
    "evaluate",
  ],
  emotionAndRelevance: [
    "you",
    "your",
    "we",
    "our",
    "imagine",
    "consider",
    "feel",
    "exciting",
    "important",
    "crucial",
    "real-world",
    "example",
    "application",
    "story",
  ],
  generativeLearning: [
    "create",
    "generate",
    "write",
    "draw",
    "design",
    "build",
    "construct",
    "compose",
    "formulate",
    "invent",
    "produce",
  ],
  schemaBuilding: [
    "structure",
    "framework",
    "category",
    "type",
    "class",
    "group",
    "hierarchy",
    "organize",
    "pattern",
    "model",
    "system",
  ],
};

function countKeywords(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  return keywords.reduce((count, word) => {
    // Simple inclusion check is faster than regex for many words
    return count + (lowerText.split(word).length - 1);
  }, 0);
}

function generateFindings(
  principle: string,
  score: number,
  matchCount: number
): Finding[] {
  if (score > 70) {
    return [
      {
        type: "positive",
        message: `Strong presence of ${principle} cues (${matchCount} matches found).`,
        severity: 0.2,
        evidence: "Keyword analysis",
        location: { sectionId: "general", position: 0 },
      },
    ];
  } else if (score < 40) {
    return [
      {
        type: "warning",
        message: `Limited evidence of ${principle}. Consider adding more explicit prompts or cues.`,
        severity: 0.5,
        evidence: "Keyword analysis",
        location: { sectionId: "general", position: 0 },
      },
    ];
  }
  return [
    {
      type: "neutral",
      message: `Moderate usage of ${principle} detected.`,
      severity: 0.3,
      evidence: "Keyword analysis",
      location: { sectionId: "general", position: 0 },
    },
  ];
}

export function evaluateCognitiveLoad(text: string): PrincipleEvaluation {
  // Heuristic: Average sentence length
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const totalWords = text.split(/\s+/).length;
  const avgSentenceLength = totalWords / Math.max(1, sentences.length);

  // Target: 15-20 words per sentence is good. >25 is high load.
  let score = 100;
  if (avgSentenceLength > 25) score = 60;
  if (avgSentenceLength > 35) score = 40;
  if (avgSentenceLength < 10) score = 80; // Too simple?

  return {
    principle: "cognitiveLoad",
    score,
    weight: 1,
    findings: [
      {
        type: score < 50 ? "warning" : "positive",
        message: `Average sentence length is ${Math.round(
          avgSentenceLength
        )} words. ${
          score < 50
            ? "This may be difficult to read."
            : "This is a good range."
        }`,
        severity: score < 50 ? 0.6 : 0.2,
        evidence: `Avg: ${Math.round(avgSentenceLength)} words/sentence`,
        location: { sectionId: "general", position: 0 },
      },
    ],
    suggestions: [],
    evidence: [],
  };
}

export function evaluateKeywordPrinciple(
  text: string,
  principle: LearningPrinciple,
  keywordKey: string
): PrincipleEvaluation {
  const keywords = KEYWORD_LISTS[keywordKey];
  if (!keywords)
    return {
      principle,
      score: 0,
      weight: 0,
      findings: [],
      suggestions: [],
      evidence: [],
    };

  const wordCount = text.split(/\s+/).length;
  const matches = countKeywords(text, keywords);

  // Normalize: 1 match per 200 words = decent (50 score)
  // 1 match per 100 words = good (80 score)
  const density = matches / Math.max(1, wordCount);
  const score = Math.min(100, Math.round(density * 100 * 100)); // Scaling factor

  return {
    principle,
    score: Math.max(20, score), // Floor at 20
    weight: 1,
    findings: generateFindings(principle, score, matches),
    suggestions: [],
    evidence: [],
  };
}

export function evaluateInterleaving(text: string): PrincipleEvaluation {
  // Hard to do locally without concept graph history, return neutral
  return {
    principle: "interleaving",
    score: 50,
    weight: 1,
    findings: [
      {
        type: "neutral",
        message:
          "Interleaving analysis requires server connection for full concept mapping.",
        severity: 0.1,
        evidence: "Offline mode",
        location: { sectionId: "system", position: 0 },
      },
    ],
    suggestions: [],
    evidence: [],
  };
}
