/**
 * Character Arc Analyzer
 * Tracks character mentions, emotional trajectory, and development throughout manuscript
 */

export interface CharacterMention {
  name: string;
  position: number;
  context: string; // surrounding text
  sentiment: "positive" | "negative" | "neutral";
  inDialogue: boolean;
}

export interface CharacterProfile {
  name: string;
  mentions: CharacterMention[];
  totalMentions: number;
  firstAppearance: number;
  lastAppearance: number;
  emotionalTrajectory: {
    early: number; // sentiment score 0-100
    middle: number;
    late: number;
  };
  dialogueRatio: number; // % of mentions in dialogue
  role: "protagonist" | "major" | "supporting" | "minor";
  arcType: "dynamic" | "flat" | "unclear";
  developmentScore: number; // 0-100
}

export interface CharacterAnalysisResult {
  characters: CharacterProfile[];
  protagonists: string[];
  totalCharacters: number;
  averageDevelopment: number;
  recommendations: string[];
}

/**
 * Sentiment word lists for emotional trajectory analysis
 */
const POSITIVE_WORDS = new Set([
  "happy",
  "joy",
  "smile",
  "laugh",
  "love",
  "delight",
  "pleased",
  "wonderful",
  "excellent",
  "perfect",
  "beautiful",
  "amazing",
  "brilliant",
  "fantastic",
  "hope",
  "excited",
  "thrilled",
  "grateful",
  "proud",
  "confident",
  "warm",
  "gentle",
  "kind",
  "caring",
  "peaceful",
  "calm",
  "relieved",
  "content",
]);

const NEGATIVE_WORDS = new Set([
  "sad",
  "angry",
  "fear",
  "hate",
  "terrible",
  "awful",
  "horrible",
  "bad",
  "worse",
  "worst",
  "cruel",
  "harsh",
  "pain",
  "hurt",
  "wound",
  "blood",
  "death",
  "die",
  "kill",
  "scream",
  "cry",
  "tears",
  "grief",
  "despair",
  "anxious",
  "worried",
  "scared",
  "frightened",
  "terrified",
  "nervous",
  "bitter",
  "resentful",
  "jealous",
  "guilty",
  "ashamed",
  "disgusted",
]);

/**
 * Common pronouns to track when associated with named characters
 */
const PRONOUNS = new Set([
  "he",
  "she",
  "they",
  "him",
  "her",
  "them",
  "his",
  "hers",
  "their",
]);

/**
 * Extract potential character names (capitalized words, not common words)
 */
function extractCharacterNames(text: string): Map<string, number> {
  const commonWords = new Set([
    "The",
    "A",
    "An",
    "This",
    "That",
    "These",
    "Those",
    "I",
    "You",
    "We",
    "It",
    "He",
    "She",
    "They",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);

  // Find all capitalized words
  const capitalizedPattern = /\b[A-Z][a-z]{2,}\b/g;
  const matches = text.match(capitalizedPattern) || [];

  const nameCounts = new Map<string, number>();

  for (const match of matches) {
    if (!commonWords.has(match) && match.length > 2) {
      nameCounts.set(match, (nameCounts.get(match) || 0) + 1);
    }
  }

  // Filter to names mentioned at least 3 times (likely characters, not places/objects)
  const characters = new Map<string, number>();
  for (const [name, count] of nameCounts.entries()) {
    if (count >= 3) {
      characters.set(name, count);
    }
  }

  return characters;
}

/**
 * Detect if text is dialogue (simple heuristic)
 */
function isInDialogue(context: string): boolean {
  return (
    context.includes('"') ||
    context.includes("'") ||
    context.includes('"') ||
    context.includes('"')
  );
}

/**
 * Calculate sentiment score for text context
 */
function calculateSentiment(text: string): "positive" | "negative" | "neutral" {
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) positiveCount++;
    if (NEGATIVE_WORDS.has(word)) negativeCount++;
  }

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

/**
 * Get sentiment as numeric score (0-100)
 */
function sentimentToScore(
  sentiment: "positive" | "negative" | "neutral"
): number {
  if (sentiment === "positive") return 70;
  if (sentiment === "negative") return 30;
  return 50;
}

/**
 * Extract all mentions of a character with context
 */
function extractCharacterMentions(
  text: string,
  characterName: string
): CharacterMention[] {
  const mentions: CharacterMention[] = [];
  const contextRadius = 100; // characters before/after

  // Find all occurrences
  const regex = new RegExp(`\\b${characterName}\\b`, "gi");
  let match;

  while ((match = regex.exec(text)) !== null) {
    const position = match.index;
    const start = Math.max(0, position - contextRadius);
    const end = Math.min(
      text.length,
      position + characterName.length + contextRadius
    );
    const context = text.substring(start, end);

    mentions.push({
      name: characterName,
      position,
      context,
      sentiment: calculateSentiment(context),
      inDialogue: isInDialogue(context),
    });
  }

  return mentions;
}

/**
 * Calculate emotional trajectory across manuscript
 */
function calculateEmotionalTrajectory(mentions: CharacterMention[]): {
  early: number;
  middle: number;
  late: number;
} {
  if (mentions.length === 0) {
    return { early: 50, middle: 50, late: 50 };
  }

  const third = Math.floor(mentions.length / 3);

  const earlyMentions = mentions.slice(0, third);
  const middleMentions = mentions.slice(third, third * 2);
  const lateMentions = mentions.slice(third * 2);

  const avgSentiment = (mentions: CharacterMention[]) => {
    if (mentions.length === 0) return 50;
    const sum = mentions.reduce(
      (acc, m) => acc + sentimentToScore(m.sentiment),
      0
    );
    return Math.round(sum / mentions.length);
  };

  return {
    early: avgSentiment(earlyMentions),
    middle: avgSentiment(middleMentions),
    late: avgSentiment(lateMentions),
  };
}

/**
 * Determine character arc type based on emotional trajectory
 */
function determineArcType(trajectory: {
  early: number;
  middle: number;
  late: number;
}): "dynamic" | "flat" | "unclear" {
  const change = Math.abs(trajectory.late - trajectory.early);

  if (change > 20) return "dynamic"; // Significant change
  if (change < 10) return "flat"; // Little change
  return "unclear"; // Moderate change
}

/**
 * Calculate character development score
 */
function calculateDevelopmentScore(
  arcType: "dynamic" | "flat" | "unclear",
  trajectory: { early: number; middle: number; late: number },
  mentions: number
): number {
  let score = 50; // Base score

  // Reward dynamic arcs
  if (arcType === "dynamic") {
    const change = Math.abs(trajectory.late - trajectory.early);
    score += Math.min(30, change);
  }

  // Reward consistent presence
  if (mentions > 20) score += 10;
  if (mentions > 50) score += 10;

  // Penalize unclear arcs for major characters
  if (arcType === "unclear" && mentions > 30) score -= 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Determine character role based on mention frequency
 */
function determineRole(
  mentions: number,
  totalMentions: number
): "protagonist" | "major" | "supporting" | "minor" {
  const ratio = mentions / totalMentions;

  if (ratio > 0.15) return "protagonist"; // >15% of all mentions
  if (ratio > 0.08) return "major"; // >8%
  if (ratio > 0.03) return "supporting"; // >3%
  return "minor";
}

/**
 * Main character analysis function
 */
export function analyzeCharacters(text: string): CharacterAnalysisResult {
  // Extract character names
  const characterNames = extractCharacterNames(text);

  if (characterNames.size === 0) {
    return {
      characters: [],
      protagonists: [],
      totalCharacters: 0,
      averageDevelopment: 0,
      recommendations: [
        "No characters detected. Ensure character names are capitalized and mentioned multiple times.",
      ],
    };
  }

  // Calculate total mentions across all characters
  const totalMentions = Array.from(characterNames.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  // Analyze each character
  const characters: CharacterProfile[] = [];

  for (const [name, count] of characterNames.entries()) {
    const mentions = extractCharacterMentions(text, name);
    const trajectory = calculateEmotionalTrajectory(mentions);
    const arcType = determineArcType(trajectory);
    const role = determineRole(count, totalMentions);
    const developmentScore = calculateDevelopmentScore(
      arcType,
      trajectory,
      count
    );

    const dialogueMentions = mentions.filter((m) => m.inDialogue).length;
    const dialogueRatio =
      mentions.length > 0 ? dialogueMentions / mentions.length : 0;

    characters.push({
      name,
      mentions,
      totalMentions: count,
      firstAppearance: mentions[0]?.position || 0,
      lastAppearance: mentions[mentions.length - 1]?.position || 0,
      emotionalTrajectory: trajectory,
      dialogueRatio,
      role,
      arcType,
      developmentScore,
    });
  }

  // Sort by mention count (most mentioned first)
  characters.sort((a, b) => b.totalMentions - a.totalMentions);

  // Identify protagonists (top characters with protagonist role)
  const protagonists = characters
    .filter((c) => c.role === "protagonist")
    .map((c) => c.name);

  // Calculate average development
  const avgDevelopment =
    characters.length > 0
      ? Math.round(
          characters.reduce((sum, c) => sum + c.developmentScore, 0) /
            characters.length
        )
      : 0;

  // Generate recommendations
  const recommendations: string[] = [];

  if (protagonists.length === 0) {
    recommendations.push(
      "No clear protagonist detected. Consider giving your main character more presence."
    );
  }

  const flatProtagonists = characters.filter(
    (c) => c.role === "protagonist" && c.arcType === "flat"
  );
  if (flatProtagonists.length > 0) {
    recommendations.push(
      `${flatProtagonists[0].name} shows little emotional change. Consider adding character development.`
    );
  }

  const minorCharacterCount = characters.filter(
    (c) => c.role === "minor"
  ).length;
  if (minorCharacterCount > characters.length * 0.7) {
    recommendations.push(
      "Many minor characters detected. Consider consolidating or giving some more depth."
    );
  }

  if (avgDevelopment < 50) {
    recommendations.push(
      "Character development scores are low. Add more emotional depth and transformation."
    );
  }

  return {
    characters,
    protagonists,
    totalCharacters: characters.length,
    averageDevelopment: avgDevelopment,
    recommendations,
  };
}
