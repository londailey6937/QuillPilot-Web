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

// Words that look like past participles but are commonly used as adjectives
// These describe states rather than passive actions
const ADJECTIVE_PARTICIPLES = new Set([
  "divided",
  "united",
  "married",
  "divorced",
  "related",
  "connected",
  "interested",
  "bored",
  "tired",
  "excited",
  "confused",
  "worried",
  "surprised",
  "amazed",
  "pleased",
  "disappointed",
  "satisfied",
  "frustrated",
  "relaxed",
  "stressed",
  "depressed",
  "blessed",
  "cursed",
  "convinced",
  "determined",
  "committed",
  "dedicated",
  "devoted",
  "attached",
  "detached",
  "educated",
  "experienced",
  "qualified",
  "skilled",
  "trained",
  "practiced",
  "organized",
  "prepared",
  "dressed",
  "undressed",
  "armed",
  "unarmed",
  "closed",
  "opened",
  "locked",
  "unlocked",
  "hidden",
  "exposed",
  "crowded",
  "deserted",
  "populated",
  "inhabited",
  "located",
  "situated",
  "based",
  "focused",
  "concentrated",
  "scattered",
  "spread",
  "mixed",
  "broken",
  "damaged",
  "ruined",
  "destroyed",
  "wrecked",
  "shattered",
  "frozen",
  "melted",
  "heated",
  "cooled",
  "dried",
  "soaked",
  "drenched",
  "loaded",
  "unloaded",
  "filled",
  "emptied",
  "stacked",
  "piled",
  "reserved",
  "scheduled",
  "planned",
  "arranged",
  "organized",
  "wired",
  "connected",
  "linked",
  "joined",
  "separated",
  "isolated",
  "balanced",
  "tilted",
  "bent",
  "curved",
  "twisted",
  "tangled",
  "painted",
  "decorated",
  "furnished",
  "equipped",
  "supplied",
  "covered",
  "wrapped",
  "sealed",
  "marked",
  "labeled",
  "named",
  "numbered",
  "listed",
  "registered",
  "licensed",
  "certified",
  "known",
  "unknown",
  "proven",
  "unproven",
  "sworn",
  "grown",
  "born",
  "raised",
  "bred",
  "fed",
  "clothed",
  "drunk",
  "intoxicated",
  "sober",
  "awake",
  "asleep",
]);

// Passive patterns that usually indicate true passive voice (action by agent)
// These patterns look for "by [agent]" or context suggesting action
const TRUE_PASSIVE_INDICATORS = [
  /\bby\s+(the|a|an|\w+)\b/i, // "was eaten by the dog"
];

export function detectPassiveVoice(text: string): {
  hasPassive: boolean;
  count: number;
  examples: string[];
} {
  const examples: string[] = [];
  let totalCount = 0;

  // Find potential passive constructions
  const passiveRegex =
    /\b(is|are|was|were|been|being|be|got|get|gets|getting)\s+(\w*\s*)?(\w+ed|\w+en|made|done|seen|given|taken|written|spoken|chosen|broken|frozen|stolen|worn|torn|born|sworn|drawn|grown|known|shown|thrown|blown|flown)\b/gi;

  let match;
  while ((match = passiveRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const participle = match[3]?.toLowerCase();

    // Skip if the participle is commonly used as an adjective (describing state)
    if (participle && ADJECTIVE_PARTICIPLES.has(participle)) {
      // But include it if there's a "by [agent]" nearby (true passive)
      const contextAfter = text.slice(
        match.index,
        match.index + fullMatch.length + 30
      );
      const hasByAgent = TRUE_PASSIVE_INDICATORS.some((pattern) =>
        pattern.test(contextAfter)
      );
      if (!hasByAgent) {
        continue; // Skip this - it's likely a state, not passive voice
      }
    }

    totalCount++;
    // Get up to 3 unique examples
    if (examples.length < 3 && !examples.includes(fullMatch.toLowerCase())) {
      examples.push(fullMatch.toLowerCase());
    }
  }

  return {
    hasPassive: totalCount > 0,
    count: totalCount,
    examples,
  };
}

import { clamp } from "lodash";
