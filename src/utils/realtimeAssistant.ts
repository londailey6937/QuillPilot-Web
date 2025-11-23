/**
 * Real-time Writing Assistant
 * Provides live analysis and suggestions as user types
 */

export interface RealtimeIssue {
  type:
    | "passive-voice"
    | "weak-verb"
    | "adverb"
    | "filter-word"
    | "cliche"
    | "repetition"
    | "long-sentence"
    | "telling"
    | "weak-dialogue";
  severity: "error" | "warning" | "suggestion";
  position: { start: number; end: number };
  message: string;
  suggestion?: string;
  category: "prose" | "style" | "clarity" | "impact";
}

export interface ParagraphMetrics {
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  complexityScore: number;
  readingLevel: number;
  pacing: "fast" | "medium" | "slow";
}

export interface RealtimeAnalysisResult {
  issues: RealtimeIssue[];
  metrics: ParagraphMetrics;
  score: number; // 0-100
  suggestions: string[];
}

// Patterns for real-time detection
const PASSIVE_VOICE_PATTERNS = [
  /\b(am|is|are|was|were|been|be|being)\s+\w+ed\b/gi,
  /\b(am|is|are|was|were|been|be|being)\s+\w+en\b/gi,
];

const WEAK_VERBS = [
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "get",
  "got",
  "make",
  "makes",
  "made",
];

const FILTER_WORDS = [
  "saw",
  "heard",
  "felt",
  "noticed",
  "seemed",
  "appeared",
  "looked like",
  "sounded like",
  "smelled like",
  "realized",
  "thought",
  "wondered",
  "decided",
];

const COMMON_CLICHES = [
  "at the end of the day",
  "think outside the box",
  "low-hanging fruit",
  "paradigm shift",
  "game changer",
  "it goes without saying",
  "last but not least",
  "time will tell",
  "only time will tell",
  "in this day and age",
  "at this point in time",
  "needless to say",
  "avoid like the plague",
  "crystal clear",
  "eyes sparkled",
  "diamond-like",
];

const WEAK_DIALOGUE_TAGS = [
  "said loudly",
  "said softly",
  "said angrily",
  "said happily",
  "said sadly",
  "whispered softly",
  "shouted loudly",
];

/**
 * Analyze text in real-time as user types
 */
export function analyzeRealtimeText(text: string): RealtimeAnalysisResult {
  const issues: RealtimeIssue[] = [];

  // Detect passive voice
  PASSIVE_VOICE_PATTERNS.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      issues.push({
        type: "passive-voice",
        severity: "warning",
        position: { start: match.index, end: match.index + match[0].length },
        message: "Consider using active voice for stronger prose",
        suggestion: "Rewrite to emphasize the actor: 'Subject performs action'",
        category: "prose",
      });
    }
  });

  // Detect weak verbs
  const words = text.split(/\s+/);
  let position = 0;

  words.forEach((word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");

    if (WEAK_VERBS.includes(cleanWord)) {
      issues.push({
        type: "weak-verb",
        severity: "suggestion",
        position: {
          start: text.indexOf(word, position),
          end: text.indexOf(word, position) + word.length,
        },
        message: `'${cleanWord}' is a weak verb`,
        suggestion: "Use a more specific, vivid verb",
        category: "prose",
      });
    }

    position += word.length + 1;
  });

  // Detect adverbs
  const adverbPattern = /\b\w+ly\b/gi;
  let match;
  while ((match = adverbPattern.exec(text)) !== null) {
    // Skip words like "early", "only", "likely"
    const word = match[0].toLowerCase();
    if (!["early", "only", "likely", "holy", "family"].includes(word)) {
      issues.push({
        type: "adverb",
        severity: "suggestion",
        position: { start: match.index, end: match.index + match[0].length },
        message: "Consider replacing adverb with stronger verb",
        suggestion: "Use a more specific verb instead of adverb+verb",
        category: "prose",
      });
    }
  }

  // Detect filter words
  FILTER_WORDS.forEach((filterWord) => {
    const pattern = new RegExp(`\\b${filterWord}\\b`, "gi");
    let match;
    while ((match = pattern.exec(text)) !== null) {
      issues.push({
        type: "filter-word",
        severity: "warning",
        position: { start: match.index, end: match.index + match[0].length },
        message: "Filter word creates distance",
        suggestion: "Show the experience directly without the filter",
        category: "style",
      });
    }
  });

  // Detect clichés
  COMMON_CLICHES.forEach((cliche) => {
    const index = text.toLowerCase().indexOf(cliche.toLowerCase());
    if (index !== -1) {
      issues.push({
        type: "cliche",
        severity: "warning",
        position: { start: index, end: index + cliche.length },
        message: "Clichéd phrase detected",
        suggestion: "Replace with original, specific description",
        category: "impact",
      });
    }
  });

  // Detect word repetition (same word within 50 characters)
  const wordMap = new Map<string, number[]>();
  let pos = 0;

  words.forEach((word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");

    if (cleanWord.length > 4) {
      // Only check words longer than 4 characters
      if (!wordMap.has(cleanWord)) {
        wordMap.set(cleanWord, []);
      }

      const positions = wordMap.get(cleanWord)!;
      const currentPos = text.indexOf(word, pos);

      // Check if word was used recently (within 50 chars)
      if (
        positions.length > 0 &&
        currentPos - positions[positions.length - 1] < 50
      ) {
        issues.push({
          type: "repetition",
          severity: "suggestion",
          position: { start: currentPos, end: currentPos + word.length },
          message: `'${word}' repeated nearby`,
          suggestion: "Use a synonym or restructure sentence",
          category: "style",
        });
      }

      positions.push(currentPos);
      pos = currentPos + word.length;
    }
  });

  // Detect long sentences
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  let sentencePos = 0;

  sentences.forEach((sentence) => {
    const wordCount = sentence.trim().split(/\s+/).length;

    if (wordCount > 35) {
      const startPos = text.indexOf(sentence.trim(), sentencePos);
      issues.push({
        type: "long-sentence",
        severity: "suggestion",
        position: { start: startPos, end: startPos + sentence.length },
        message: `Long sentence (${wordCount} words) may be hard to follow`,
        suggestion: "Consider breaking into shorter sentences for clarity",
        category: "clarity",
      });
    }

    sentencePos += sentence.length + 1;
  });

  // Detect telling vs showing
  const tellingPatterns = [
    /\b(felt|was|seemed|appeared)\s+(angry|sad|happy|afraid|nervous|worried)\b/gi,
    /\b(he|she|they)\s+was\s+(very|extremely|really)\s+\w+/gi,
  ];

  tellingPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      issues.push({
        type: "telling",
        severity: "warning",
        position: { start: match.index, end: match.index + match[0].length },
        message: "Show emotion through actions and body language",
        suggestion:
          "Describe physical reactions, dialogue, or behavior instead of naming emotions",
        category: "impact",
      });
    }
  });

  // Detect weak dialogue tags
  WEAK_DIALOGUE_TAGS.forEach((tag) => {
    const index = text.toLowerCase().indexOf(tag.toLowerCase());
    if (index !== -1) {
      issues.push({
        type: "weak-dialogue",
        severity: "suggestion",
        position: { start: index, end: index + tag.length },
        message: "Dialogue tag with redundant adverb",
        suggestion: "Use action beat or stronger verb instead",
        category: "prose",
      });
    }
  });

  // Calculate paragraph metrics
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  const sentenceCount = sentences.length;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  // Estimate complexity (0-100)
  const complexityScore = Math.min(
    100,
    Math.round(
      avgSentenceLength * 3 +
        (text.match(/[,;:]/g) || []).length * 2 +
        issues.filter((i) => i.type === "long-sentence").length * 10
    )
  );

  // Estimate reading level (Flesch-Kincaid approximation)
  const syllables = estimateSyllables(text);
  const readingLevel =
    0.39 * avgSentenceLength + 11.8 * (syllables / wordCount) - 15.59;

  // Determine pacing
  let pacing: "fast" | "medium" | "slow" = "medium";
  if (avgSentenceLength < 12) {
    pacing = "fast";
  } else if (avgSentenceLength > 20) {
    pacing = "slow";
  }

  const metrics: ParagraphMetrics = {
    wordCount,
    sentenceCount,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    complexityScore,
    readingLevel: Math.max(0, Math.round(readingLevel * 10) / 10),
    pacing,
  };

  // Calculate overall score
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const suggestionCount = issues.filter(
    (i) => i.severity === "suggestion"
  ).length;

  const score = Math.max(
    0,
    100 - errorCount * 10 - warningCount * 5 - suggestionCount * 2
  );

  // Generate contextual suggestions
  const suggestions: string[] = [];

  if (avgSentenceLength > 25) {
    suggestions.push(
      "Average sentence length is high - vary with shorter sentences for better pacing"
    );
  }

  if (issues.filter((i) => i.type === "passive-voice").length > 2) {
    suggestions.push(
      "Multiple passive constructions - strengthen with active voice"
    );
  }

  if (issues.filter((i) => i.type === "filter-word").length > 3) {
    suggestions.push("Remove filter words to create more immediate prose");
  }

  if (pacing === "slow" && wordCount > 100) {
    suggestions.push(
      "Slow pacing detected - consider tightening or adding action"
    );
  }

  if (issues.filter((i) => i.type === "telling").length > 1) {
    suggestions.push("Show emotions through actions rather than naming them");
  }

  return {
    issues,
    metrics,
    score,
    suggestions,
  };
}

/**
 * Get quick feedback for current paragraph
 */
export function getQuickFeedback(text: string): string {
  const result = analyzeRealtimeText(text);

  if (result.score >= 85) {
    return "✅ Strong paragraph - good clarity and impact";
  } else if (result.score >= 70) {
    return "👍 Good paragraph - minor improvements possible";
  } else if (result.score >= 50) {
    return "⚠️ Fair paragraph - consider revisions";
  } else {
    return "🔴 Needs work - multiple issues detected";
  }
}

/**
 * Estimate syllable count for readability calculation
 */
function estimateSyllables(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  let syllables = 0;

  words.forEach((word) => {
    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g) || [];
    syllables += vowelGroups.length;

    // Adjust for silent 'e'
    if (word.endsWith("e") && word.length > 2) {
      syllables--;
    }

    // Minimum 1 syllable per word
    syllables = Math.max(1, syllables);
  });

  return syllables;
}

/**
 * Highlight issues in text with color coding
 */
export function highlightIssues(
  text: string,
  issues: RealtimeIssue[]
): {
  text: string;
  highlights: { start: number; end: number; color: string }[];
} {
  const highlights = issues.map((issue) => ({
    start: issue.position.start,
    end: issue.position.end,
    color:
      issue.severity === "error"
        ? "#ef4444"
        : issue.severity === "warning"
        ? "#f59e0b"
        : "#3b82f6",
  }));

  return { text, highlights };
}

/**
 * Get inline suggestion for cursor position
 */
export function getInlineSuggestion(
  text: string,
  cursorPosition: number,
  issues: RealtimeIssue[]
): RealtimeIssue | null {
  // Find issue at cursor position
  const issueAtCursor = issues.find(
    (issue) =>
      cursorPosition >= issue.position.start &&
      cursorPosition <= issue.position.end
  );

  return issueAtCursor || null;
}

/**
 * Export real-time settings
 */
export interface RealtimeSettings {
  enablePassiveVoiceDetection: boolean;
  enableAdverbDetection: boolean;
  enableFilterWordDetection: boolean;
  enableClicheDetection: boolean;
  enableRepetitionDetection: boolean;
  enableSentenceLengthWarnings: boolean;
  enableShowVsTellDetection: boolean;
  minimumSeverity: "error" | "warning" | "suggestion";
}

export const DEFAULT_REALTIME_SETTINGS: RealtimeSettings = {
  enablePassiveVoiceDetection: true,
  enableAdverbDetection: true,
  enableFilterWordDetection: true,
  enableClicheDetection: true,
  enableRepetitionDetection: true,
  enableSentenceLengthWarnings: true,
  enableShowVsTellDetection: true,
  minimumSeverity: "warning",
};
