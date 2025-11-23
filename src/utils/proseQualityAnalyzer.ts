/**
 * Prose Quality Analyzer
 * Advanced writing quality metrics for fiction manuscripts
 */

export interface WordFrequency {
  word: string;
  count: number;
  positions: number[]; // Character positions where word appears
}

export interface DialogueTag {
  speaker: string | null;
  dialogue: string;
  position: number;
  tag: string; // e.g., "said", "asked", "whispered"
  hasTag: boolean;
}

export interface PassiveVoiceInstance {
  sentence: string;
  position: number;
  verb: string; // The passive construction (e.g., "was given", "were taken")
  suggestion: string;
}

export interface AdverbInstance {
  adverb: string;
  position: number;
  context: string; // Surrounding text
  severity: "weak" | "moderate" | "strong"; // How problematic it is
}

export interface SentenceStats {
  length: number;
  words: number;
  position: number;
}

export interface ReadabilityScore {
  fleschKincaid: number; // Grade level (e.g., 8.5 = 8th grade)
  fleschReading: number; // Reading ease (0-100, higher = easier)
  averageSentenceLength: number;
  averageSyllablesPerWord: number;
  interpretation: string;
}

export interface ProseQualityResult {
  wordFrequency: {
    total: number;
    unique: number;
    topWords: WordFrequency[]; // Top 50 most common words
    overusedWords: WordFrequency[]; // Words used more than threshold
  };
  dialogue: {
    totalDialogueLines: number;
    taggedLines: number;
    untaggedLines: number;
    speakers: Map<string, number>; // Speaker -> count
    tags: DialogueTag[];
  };
  passiveVoice: {
    instances: PassiveVoiceInstance[];
    count: number;
    percentage: number; // % of sentences with passive voice
  };
  adverbs: {
    instances: AdverbInstance[];
    count: number;
    density: number; // Adverbs per 1000 words
    weakAdverbs: number; // Count of weak adverbs
  };
  sentenceVariety: {
    sentences: SentenceStats[];
    averageLength: number;
    shortSentences: number; // < 10 words
    mediumSentences: number; // 10-20 words
    longSentences: number; // > 20 words
    varietyScore: number; // 0-100, higher = better variety
  };
  readability: ReadabilityScore;
}

/**
 * Passive voice patterns to detect
 */
const PASSIVE_PATTERNS = [
  // to be + past participle
  /\b(was|were|is|are|am|be|been|being)\s+(\w+ed|given|taken|made|seen|found|told|shown|written|spoken|broken|chosen|driven|eaten|fallen|forgotten|gotten|hidden|known|ridden|risen|shaken|stolen|torn|worn)\b/gi,
  /\b(was|were|is|are|am|be|been|being)\s+(hit|put|cut|set|let|shut|split|spread|cast|cost|hurt|shed|quit|rid)\b/gi,
];

/**
 * Common weak adverbs to flag
 */
const WEAK_ADVERBS = new Set([
  "very",
  "really",
  "quite",
  "rather",
  "somewhat",
  "just",
  "actually",
  "literally",
  "basically",
  "essentially",
  "practically",
  "virtually",
]);

/**
 * Analyze prose quality across multiple dimensions
 */
export function analyzeProse(text: string): ProseQualityResult {
  // Word frequency analysis
  const wordFrequency = analyzeWordFrequency(text);

  // Dialogue detection and tagging
  const dialogue = analyzeDialogue(text);

  // Passive voice detection
  const passiveVoice = analyzePassiveVoice(text);

  // Adverb detection
  const adverbs = analyzeAdverbs(text);

  // Sentence variety analysis
  const sentenceVariety = analyzeSentenceVariety(text);

  // Readability scoring
  const readability = calculateReadability(text);

  return {
    wordFrequency,
    dialogue,
    passiveVoice,
    adverbs,
    sentenceVariety,
    readability,
  };
}

/**
 * Word Frequency Analysis
 */
function analyzeWordFrequency(
  text: string
): ProseQualityResult["wordFrequency"] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const frequencyMap = new Map<
    string,
    { count: number; positions: number[] }
  >();

  // Build frequency map with positions
  let position = 0;
  const lowerText = text.toLowerCase();

  words.forEach((word) => {
    // Find actual position in text
    const pos = lowerText.indexOf(word, position);
    if (pos !== -1) {
      position = pos + word.length;
    }

    if (!frequencyMap.has(word)) {
      frequencyMap.set(word, { count: 0, positions: [] });
    }
    const entry = frequencyMap.get(word)!;
    entry.count++;
    if (pos !== -1) {
      entry.positions.push(pos);
    }
  });

  // Convert to array and sort by frequency
  const allWords: WordFrequency[] = Array.from(frequencyMap.entries())
    .map(([word, data]) => ({
      word,
      count: data.count,
      positions: data.positions,
    }))
    .sort((a, b) => b.count - a.count);

  // Top 50 most common
  const topWords = allWords.slice(0, 50);

  // Overused words (appearing more than 0.5% of total words)
  const threshold = words.length * 0.005;
  const overusedWords = allWords.filter(
    (w) => w.count > threshold && w.count > 10 && w.word.length > 3
  );

  return {
    total: words.length,
    unique: frequencyMap.size,
    topWords,
    overusedWords,
  };
}

/**
 * Dialogue Analysis - Detect dialogue and identify speakers
 */
function analyzeDialogue(text: string): ProseQualityResult["dialogue"] {
  const tags: DialogueTag[] = [];
  const speakerCounts = new Map<string, number>();

  // Pattern: "dialogue text" followed by optional tag
  const dialoguePattern =
    /"([^"]+)"\s*,?\s*([^.!?]*(?:said|asked|replied|answered|whispered|shouted|muttered|exclaimed|yelled|cried|screamed|murmured|stammered|declared|announced|insisted|protested|demanded|pleaded|begged|suggested|offered|continued|added|interrupted|explained|remarked|observed|noted|mentioned|admitted|confessed|agreed|disagreed|argued|confirmed|denied|claimed|stated|responded)[^.!?]*[.!?])?/gi;

  let match;
  let position = 0;

  while ((match = dialoguePattern.exec(text)) !== null) {
    const dialogue = match[1];
    const tagText = match[2] || "";
    const hasTag = tagText.length > 0;

    // Try to extract speaker name (capitalized words before verb)
    let speaker: string | null = null;
    let tag = "";

    if (hasTag) {
      // Look for capitalized words (potential names) and dialogue tags
      const namePattern =
        /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(said|asked|replied|answered|whispered|shouted|muttered|exclaimed|yelled|cried|screamed|murmured|stammered|declared|announced|insisted|protested|demanded|pleaded|begged|suggested|offered|continued|added|interrupted|explained|remarked|observed|noted|mentioned|admitted|confessed|agreed|disagreed|argued|confirmed|denied|claimed|stated|responded)/i;
      const nameMatch = tagText.match(namePattern);

      if (nameMatch) {
        speaker = nameMatch[1];
        tag = nameMatch[2].toLowerCase();

        if (speaker) {
          speakerCounts.set(speaker, (speakerCounts.get(speaker) || 0) + 1);
        }
      } else {
        // Just extract the tag verb
        const verbPattern =
          /\b(said|asked|replied|answered|whispered|shouted|muttered|exclaimed|yelled|cried|screamed|murmured|stammered|declared|announced|insisted|protested|demanded|pleaded|begged|suggested|offered|continued|added|interrupted|explained|remarked|observed|noted|mentioned|admitted|confessed|agreed|disagreed|argued|confirmed|denied|claimed|stated|responded)\b/i;
        const verbMatch = tagText.match(verbPattern);
        if (verbMatch) {
          tag = verbMatch[1].toLowerCase();
        }
      }
    }

    tags.push({
      speaker,
      dialogue,
      position: match.index,
      tag,
      hasTag,
    });

    position = match.index + match[0].length;
  }

  const totalDialogueLines = tags.length;
  const taggedLines = tags.filter((t) => t.hasTag).length;
  const untaggedLines = totalDialogueLines - taggedLines;

  return {
    totalDialogueLines,
    taggedLines,
    untaggedLines,
    speakers: speakerCounts,
    tags,
  };
}

/**
 * Passive Voice Detection
 */
function analyzePassiveVoice(text: string): ProseQualityResult["passiveVoice"] {
  const instances: PassiveVoiceInstance[] = [];

  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  let position = 0;

  sentences.forEach((sentence) => {
    const trimmedSentence = sentence.trim();

    // Check each passive pattern
    for (const pattern of PASSIVE_PATTERNS) {
      const matches = trimmedSentence.matchAll(pattern);

      for (const match of matches) {
        if (match[0]) {
          const verb = match[0];

          instances.push({
            sentence: trimmedSentence,
            position: text.indexOf(trimmedSentence, position),
            verb,
            suggestion: `Consider active voice: Instead of "${verb}", try a more direct construction`,
          });
        }
      }
    }

    position += trimmedSentence.length;
  });

  return {
    instances,
    count: instances.length,
    percentage:
      sentences.length > 0 ? (instances.length / sentences.length) * 100 : 0,
  };
}

/**
 * Adverb Detection
 */
function analyzeAdverbs(text: string): ProseQualityResult["adverbs"] {
  const instances: AdverbInstance[] = [];

  // Pattern for -ly adverbs
  const adverbPattern = /\b(\w+ly)\b/gi;

  let match;
  const contextRadius = 30; // Characters before/after for context

  while ((match = adverbPattern.exec(text)) !== null) {
    const adverb = match[1].toLowerCase();
    const position = match.index;

    // Get context
    const start = Math.max(0, position - contextRadius);
    const end = Math.min(text.length, position + adverb.length + contextRadius);
    const context = text.substring(start, end);

    // Determine severity
    const isWeak = WEAK_ADVERBS.has(adverb);
    const severity = isWeak
      ? "weak"
      : adverb.length > 10
      ? "moderate"
      : "strong";

    instances.push({
      adverb,
      position,
      context,
      severity,
    });
  }

  const wordCount = text.split(/\s+/).length;
  const density = wordCount > 0 ? (instances.length / wordCount) * 1000 : 0;
  const weakAdverbs = instances.filter((i) => i.severity === "weak").length;

  return {
    instances,
    count: instances.length,
    density,
    weakAdverbs,
  };
}

/**
 * Sentence Variety Analysis
 */
function analyzeSentenceVariety(
  text: string
): ProseQualityResult["sentenceVariety"] {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  const stats: SentenceStats[] = [];
  let position = 0;

  sentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    const words = trimmed.split(/\s+/).filter((w) => w.length > 0);

    stats.push({
      length: trimmed.length,
      words: words.length,
      position: text.indexOf(trimmed, position),
    });

    position += trimmed.length;
  });

  const totalWords = stats.reduce((sum, s) => sum + s.words, 0);
  const averageLength = totalWords / stats.length || 0;

  const shortSentences = stats.filter((s) => s.words < 10).length;
  const mediumSentences = stats.filter(
    (s) => s.words >= 10 && s.words <= 20
  ).length;
  const longSentences = stats.filter((s) => s.words > 20).length;

  // Calculate variety score (0-100)
  // Good variety: balanced mix of short/medium/long
  const total = stats.length;
  const shortRatio = total > 0 ? shortSentences / total : 0;
  const mediumRatio = total > 0 ? mediumSentences / total : 0;
  const longRatio = total > 0 ? longSentences / total : 0;

  // Ideal: 30% short, 50% medium, 20% long
  const shortScore = 100 - Math.abs(shortRatio - 0.3) * 200;
  const mediumScore = 100 - Math.abs(mediumRatio - 0.5) * 200;
  const longScore = 100 - Math.abs(longRatio - 0.2) * 200;

  const varietyScore = Math.max(0, (shortScore + mediumScore + longScore) / 3);

  return {
    sentences: stats,
    averageLength,
    shortSentences,
    mediumSentences,
    longSentences,
    varietyScore,
  };
}

/**
 * Flesch-Kincaid Readability Scoring
 */
function calculateReadability(text: string): ReadabilityScore {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  const totalSentences = sentences.length || 1;
  const totalWords = words.length || 1;
  const totalSyllables = syllables || 1;

  const averageSentenceLength = totalWords / totalSentences;
  const averageSyllablesPerWord = totalSyllables / totalWords;

  // Flesch-Kincaid Grade Level
  const fleschKincaid =
    0.39 * averageSentenceLength + 11.8 * averageSyllablesPerWord - 15.59;

  // Flesch Reading Ease
  const fleschReading =
    206.835 - 1.015 * averageSentenceLength - 84.6 * averageSyllablesPerWord;

  // Interpretation
  let interpretation = "";
  if (fleschKincaid < 6) {
    interpretation = "Elementary school level - Very easy to read";
  } else if (fleschKincaid < 9) {
    interpretation = "Middle school level - Easy to read";
  } else if (fleschKincaid < 13) {
    interpretation = "High school level - Standard reading level";
  } else if (fleschKincaid < 16) {
    interpretation = "College level - Moderately difficult";
  } else {
    interpretation = "Graduate level - Difficult to read";
  }

  return {
    fleschKincaid: Math.max(0, fleschKincaid),
    fleschReading: Math.max(0, Math.min(100, fleschReading)),
    averageSentenceLength,
    averageSyllablesPerWord,
    interpretation,
  };
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");

  if (word.length <= 3) return 1;

  // Remove silent e
  word = word.replace(/e$/, "");

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  const syllableCount = vowelGroups ? vowelGroups.length : 1;

  return Math.max(1, syllableCount);
}
