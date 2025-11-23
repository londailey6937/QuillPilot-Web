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
  if (wordCount < 60) {
    return {
      tone: "compact",
      shortLabel: "Expand detail",
      message:
        "This paragraph is compact—consider adding examples or explanation if the idea feels rushed.",
    };
  }

  if (wordCount > 160) {
    return {
      tone: "extended",
      shortLabel: "Consider splitting",
      message:
        "This paragraph is long—split it or add a subheading so readers can process the concept in steps.",
    };
  }

  return {
    tone: "balanced",
    shortLabel: "On target",
    message: "This paragraph sits in the target range—keep the current pacing.",
  };
}

import { clamp } from "lodash";
