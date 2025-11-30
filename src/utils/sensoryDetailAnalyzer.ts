/**
 * Sensory Detail Density Analyzer
 * Tracks sensory language (sight, sound, smell, touch, taste) and flags low-sensory paragraphs
 */

export interface SensorySuggestion {
  position: number;
  paragraph: string;
  reason: string;
  sensoryType:
    | "visual"
    | "auditory"
    | "olfactory"
    | "tactile"
    | "gustatory"
    | "general";
  priority: "high" | "medium" | "low";
  sensoryDensity: number; // percentage of sensory words
  missingSenses: string[]; // which senses are missing
}

/**
 * Sensory word categories
 */
const VISUAL_WORDS = new Set([
  "see",
  "saw",
  "seen",
  "look",
  "looked",
  "stare",
  "stared",
  "glance",
  "glanced",
  "watch",
  "watched",
  "gaze",
  "gazed",
  "view",
  "viewed",
  "observe",
  "observed",
  "notice",
  "noticed",
  "glimpse",
  "glimpsed",
  "peer",
  "peered",
  "eye",
  "eyes",
  "color",
  "colour",
  "bright",
  "dark",
  "light",
  "shadow",
  "shine",
  "shined",
  "shining",
  "shines",
  "glow",
  "glowed",
  "sparkle",
  "sparkled",
  "glitter",
  "glittered",
  "shimmer",
  "shimmered",
  "gleam",
  "gleamed",
  "flash",
  "flashed",
  "blur",
  "blurred",
  "clear",
  "dim",
  "visible",
  "invisible",
  "appearance",
  "shape",
  "form",
  "figure",
  "outline",
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "black",
  "white",
  "brown",
  "gray",
  "grey",
  "golden",
  "silver",
  "crimson",
  "azure",
  "emerald",
  "pale",
  "vivid",
  "dull",
  "brilliant",
  "radiant",
  "translucent",
  "opaque",
]);

const AUDITORY_WORDS = new Set([
  "hear",
  "heard",
  "listen",
  "listened",
  "sound",
  "sounds",
  "noise",
  "noises",
  "voice",
  "voices",
  "echo",
  "echoed",
  "ring",
  "rang",
  "rung",
  "chime",
  "chimed",
  "whisper",
  "whispered",
  "murmur",
  "murmured",
  "shout",
  "shouted",
  "scream",
  "screamed",
  "yell",
  "yelled",
  "cry",
  "cried",
  "call",
  "called",
  "speak",
  "spoke",
  "spoken",
  "talk",
  "talked",
  "say",
  "said",
  "tell",
  "told",
  "ask",
  "asked",
  "answer",
  "answered",
  "reply",
  "replied",
  "hum",
  "hummed",
  "buzz",
  "buzzed",
  "hiss",
  "hissed",
  "bark",
  "barked",
  "barking",
  "barks",
  "growl",
  "growled",
  "growling",
  "howl",
  "howled",
  "howling",
  "click",
  "clicked",
  "clack",
  "clacked",
  "thud",
  "thudded",
  "thump",
  "thumped",
  "bang",
  "banged",
  "crash",
  "crashed",
  "slam",
  "slammed",
  "crack",
  "cracked",
  "creak",
  "creaked",
  "squeak",
  "squeaked",
  "rustle",
  "rustled",
  "splash",
  "splashed",
  "rumble",
  "rumbled",
  "roar",
  "roared",
  "howl",
  "howled",
  "growl",
  "growled",
  "silent",
  "silence",
  "quiet",
  "loud",
  "soft",
  "harsh",
  "melodic",
  "shrill",
]);

const OLFACTORY_WORDS = new Set([
  "smell",
  "smelled",
  "smelt",
  "scent",
  "scented",
  "odor",
  "odour",
  "aroma",
  "fragrance",
  "perfume",
  "stench",
  "stink",
  "stank",
  "reek",
  "reeked",
  "sniff",
  "sniffed",
  "inhale",
  "inhaled",
  "breathe",
  "breathed",
  "fresh",
  "stale",
  "musty",
  "moldy",
  "mouldy",
  "rotten",
  "putrid",
  "foul",
  "sweet",
  "sour",
  "bitter",
  "acrid",
  "pungent",
  "sharp",
  "smoky",
  "floral",
  "earthy",
  "woody",
  "musky",
  "spicy",
  "herbal",
]);

const TACTILE_WORDS = new Set([
  "feel",
  "felt",
  "touch",
  "touched",
  "texture",
  "textured",
  "smooth",
  "rough",
  "soft",
  "hard",
  "tender",
  "firm",
  "solid",
  "liquid",
  "sticky",
  "slippery",
  "grasp",
  "grasped",
  "grip",
  "gripped",
  "hold",
  "held",
  "squeeze",
  "squeezed",
  "press",
  "pressed",
  "push",
  "pushed",
  "pull",
  "pulled",
  "stroke",
  "stroked",
  "pat",
  "patted",
  "tap",
  "tapped",
  "rub",
  "rubbed",
  "scratch",
  "scratched",
  "warm",
  "hot",
  "cold",
  "cool",
  "freezing",
  "burning",
  "icy",
  "chilly",
  "wet",
  "dry",
  "damp",
  "moist",
  "soaked",
  "drenched",
  "sharp",
  "dull",
  "prickly",
  "fuzzy",
  "silky",
  "coarse",
  "velvety",
  "pain",
  "painful",
  "ache",
  "ached",
  "sting",
  "stung",
  "tingle",
  "tingled",
]);

const GUSTATORY_WORDS = new Set([
  "taste",
  "tasted",
  "flavor",
  "flavour",
  "savor",
  "savored",
  "savour",
  "savoured",
  "lick",
  "licked",
  "sip",
  "sipped",
  "swallow",
  "swallowed",
  "chew",
  "chewed",
  "bite",
  "bit",
  "bitten",
  "eat",
  "ate",
  "eaten",
  "drink",
  "drank",
  "drunk",
  "sweet",
  "salty",
  "sour",
  "bitter",
  "spicy",
  "tangy",
  "bland",
  "rich",
  "delicious",
  "tasty",
  "yummy",
  "savory",
  "savoury",
  "flavorful",
  "flavourful",
]);

export class SensoryDetailAnalyzer {
  /**
   * Analyze a paragraph for sensory detail density
   */
  static analyzeParagraph(
    text: string,
    position: number,
    prevPara: string = "",
    nextPara: string = ""
  ): SensorySuggestion[] {
    const suggestions: SensorySuggestion[] = [];
    const trimmedPara = text.trim();

    // Skip very short paragraphs
    if (trimmedPara.length < 50) return suggestions;

    const words = trimmedPara.toLowerCase().split(/\s+/);
    const wordCount = words.length;

    // Count sensory words by category
    let visualCount = 0;
    let auditoryCount = 0;
    let olfactoryCount = 0;
    let tactileCount = 0;
    let gustatoryCount = 0;

    words.forEach((word) => {
      // Split on hyphens to check each part of hyphenated words (e.g., "dim-lit" -> "dim", "lit")
      // This ensures compound words like "dim-lit" are recognized when "dim" is a sensory word
      const wordParts = word
        .toLowerCase()
        .split("-")
        .map((p) => p.replace(/[.,!?;:"'()[\]{}]/g, ""));

      // Track if we found any match for this word to avoid double-counting
      let foundVisual = false;
      let foundAuditory = false;
      let foundOlfactory = false;
      let foundTactile = false;
      let foundGustatory = false;

      wordParts.forEach((w) => {
        if (!foundVisual && VISUAL_WORDS.has(w)) {
          visualCount++;
          foundVisual = true;
        }
        if (!foundAuditory && AUDITORY_WORDS.has(w)) {
          auditoryCount++;
          foundAuditory = true;
        }
        if (!foundOlfactory && OLFACTORY_WORDS.has(w)) {
          olfactoryCount++;
          foundOlfactory = true;
        }
        if (!foundTactile && TACTILE_WORDS.has(w)) {
          tactileCount++;
          foundTactile = true;
        }
        if (!foundGustatory && GUSTATORY_WORDS.has(w)) {
          gustatoryCount++;
          foundGustatory = true;
        }
      });
    });

    const totalSensoryWords =
      visualCount +
      auditoryCount +
      olfactoryCount +
      tactileCount +
      gustatoryCount;
    const sensoryDensity = (totalSensoryWords / wordCount) * 100;

    // Identify missing senses
    const missingSenses: string[] = [];
    if (visualCount === 0) missingSenses.push("visual");
    if (auditoryCount === 0) missingSenses.push("auditory");
    if (olfactoryCount === 0) missingSenses.push("olfactory");
    if (tactileCount === 0) missingSenses.push("tactile");
    if (gustatoryCount === 0) missingSenses.push("gustatory");

    // Determine if paragraph needs more sensory details
    // If paragraph has ANY sensory word, consider it having sensory detail
    // Only flag if paragraph has ZERO sensory words and is substantial enough
    if (totalSensoryWords === 0 && wordCount >= 30) {
      const priority: "high" | "medium" | "low" =
        wordCount >= 50 ? "high" : "medium";
      const reason =
        "No sensory details found. Add sight, sound, smell, touch, or taste.";
      const sensoryType: SensorySuggestion["sensoryType"] = "general";

      suggestions.push({
        position,
        paragraph: trimmedPara.substring(0, 150) + "...",
        reason,
        sensoryType,
        priority,
        sensoryDensity: 0,
        missingSenses,
      });
    }

    return suggestions;
  }

  /**
   * Analyze full text and calculate overall sensory score
   */
  static analyzeForSensoryDetails(text: string): {
    suggestions: SensorySuggestion[];
    overallDensity: number;
    totalParagraphs: number;
    lowSensoryParagraphs: number;
  } {
    const suggestions: SensorySuggestion[] = [];
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 50);

    let totalSensoryWords = 0;
    let totalWords = 0;
    let lowSensoryParagraphs = 0;

    paragraphs.forEach((para, index) => {
      const words = para.toLowerCase().split(/\s+/);
      const wordCount = words.length;
      totalWords += wordCount;

      let sensoryCount = 0;
      words.forEach((word) => {
        const cleanWord = word.replace(/[.,!?;:"'()[\]{}]/g, "");
        if (
          VISUAL_WORDS.has(cleanWord) ||
          AUDITORY_WORDS.has(cleanWord) ||
          OLFACTORY_WORDS.has(cleanWord) ||
          TACTILE_WORDS.has(cleanWord) ||
          GUSTATORY_WORDS.has(cleanWord)
        ) {
          sensoryCount++;
        }
      });

      totalSensoryWords += sensoryCount;
      const density = (sensoryCount / wordCount) * 100;

      if (density < 12) {
        lowSensoryParagraphs++;
      }

      const paraSuggestions = this.analyzeParagraph(para, index);
      suggestions.push(...paraSuggestions);
    });

    const overallDensity =
      totalWords > 0 ? (totalSensoryWords / totalWords) * 100 : 0;

    return {
      suggestions,
      overallDensity: Math.round(overallDensity * 10) / 10,
      totalParagraphs: paragraphs.length,
      lowSensoryParagraphs,
    };
  }

  /**
   * Calculate sensory score (0-100)
   * Based on: overall density, paragraph consistency, variety of senses used
   */
  static calculateSensoryScore(
    overallDensity: number,
    lowSensoryCount: number,
    totalParagraphs: number
  ): number {
    // Base score from overall density (0-12% = 0-100)
    let score = Math.min(100, (overallDensity / 12) * 100);

    // Penalize for high percentage of low-sensory paragraphs
    if (totalParagraphs > 0) {
      const lowSensoryRatio = lowSensoryCount / totalParagraphs;
      if (lowSensoryRatio > 0.5) {
        score -= 20; // More than 50% low-sensory paragraphs
      } else if (lowSensoryRatio > 0.3) {
        score -= 10; // 30-50% low-sensory paragraphs
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
