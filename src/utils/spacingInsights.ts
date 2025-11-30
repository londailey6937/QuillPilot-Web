export type SpacingTone = "compact" | "balanced" | "extended";

export type ParagraphSpacingAssessment = {
  tone: SpacingTone;
  shortLabel: string;
  message: string;
};

export type ParagraphSummary = {
  id: number;
  text: string;
  startIndex: number;
  endIndex: number;
  charCount: number;
  wordCount: number;
};

export function countWords(text: string): number {
  const matches = text.match(/[A-Za-z0-9'’]+/g);
  return matches ? matches.length : 0;
}

export function extractParagraphs(text: string): ParagraphSummary[] {
  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.trim().length) {
    return [];
  }

  const rawParagraphs = normalized.split(/\n\s*\n+/);
  const summaries: ParagraphSummary[] = [];
  let searchIndex = 0;

  rawParagraphs.forEach((raw) => {
    const trimmed = raw.trim();
    if (!trimmed.length) {
      searchIndex += raw.length;
      return;
    }

    const start = normalized.indexOf(trimmed, searchIndex);
    if (start === -1) {
      return;
    }

    const end = start + trimmed.length;

    summaries.push({
      id: summaries.length,
      text: trimmed,
      startIndex: start,
      endIndex: end,
      charCount: trimmed.length,
      wordCount: countWords(trimmed),
    });

    searchIndex = end;
    while (
      searchIndex < normalized.length &&
      /\s/.test(normalized.charAt(searchIndex))
    ) {
      searchIndex += 1;
    }
  });

  return summaries;
}

export function analyzeParagraphSpacing(
  wordCount: number
): ParagraphSpacingAssessment {
  // Long paragraphs: suggest condensing or splitting (over 150 words)
  if (wordCount > 150) {
    return {
      tone: "extended",
      shortLabel: "Long ¶",
      message:
        "This paragraph is long—consider splitting it into smaller sections so readers can absorb it in steps.",
    };
  }

  // Well-paced paragraphs (most paragraphs)
  return {
    tone: "balanced",
    shortLabel: "Good pace",
    message: "This paragraph is well-paced—keep the current flow.",
  };
}

// Passive voice detection patterns
const PASSIVE_PATTERNS = [
  /\b(is|are|was|were|been|being|be)\s+(\w+ed|\w+en)\b/gi,
  /\b(is|are|was|were|been|being|be)\s+\w+\s+(\w+ed|\w+en)\b/gi,
  /\b(got|get|gets|getting)\s+(\w+ed|\w+en)\b/gi,
];

export function detectPassiveVoice(text: string): {
  hasPassive: boolean;
  count: number;
  examples: string[];
} {
  const examples: string[] = [];
  let totalCount = 0;

  // Common passive constructions
  const matches = text.match(
    /\b(is|are|was|were|been|being|be|got|get|gets|getting)\s+\w*\s*(\w+ed|\w+en|made|done|seen|given|taken|written|spoken|chosen|broken|frozen|stolen|worn|torn|born|sworn|drawn|grown|known|shown|thrown|blown|flown)\b/gi
  );

  if (matches) {
    totalCount = matches.length;
    // Get up to 3 unique examples
    const uniqueMatches = [...new Set(matches.map((m) => m.toLowerCase()))];
    examples.push(...uniqueMatches.slice(0, 3));
  }

  return {
    hasPassive: totalCount > 0,
    count: totalCount,
    examples,
  };
}

import { clamp } from "lodash";
