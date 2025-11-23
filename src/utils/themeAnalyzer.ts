/**
 * Theme Detection Analyzer
 * Identifies recurring abstract concepts, symbolic patterns, and thematic elements
 */

export interface ThematicConcept {
  theme: string;
  frequency: number;
  examples: string[]; // Sample sentences where theme appears
  intensity: number; // 0-100, how strongly the theme is present
  distribution: "concentrated" | "scattered" | "balanced"; // How evenly distributed
}

export interface SymbolicPattern {
  symbol: string;
  occurrences: number;
  contexts: string[]; // Where it appears
  possibleMeaning: string;
}

export interface ThemeAnalysisResult {
  primaryThemes: ThematicConcept[];
  secondaryThemes: ThematicConcept[];
  symbolicPatterns: SymbolicPattern[];
  thematicDensity: number; // 0-100, how theme-rich the text is
  dominantTheme: string | null;
  recommendations: string[];
}

/**
 * Core thematic word clusters - abstract concepts common in fiction
 */
const THEME_CLUSTERS: Record<string, string[]> = {
  "Love & Connection": [
    "love",
    "loved",
    "loving",
    "heart",
    "passion",
    "romance",
    "affection",
    "devotion",
    "desire",
    "longing",
    "connection",
    "bond",
    "relationship",
    "intimacy",
    "attachment",
    "warmth",
    "tenderness",
    "caring",
    "cherish",
  ],
  "Identity & Self": [
    "identity",
    "self",
    "who",
    "am",
    "become",
    "belong",
    "find",
    "discover",
    "myself",
    "yourself",
    "himself",
    "herself",
    "purpose",
    "meaning",
    "exist",
    "authentic",
    "true",
    "real",
    "mask",
    "pretend",
    "facade",
    "persona",
  ],
  "Power & Control": [
    "power",
    "control",
    "authority",
    "command",
    "rule",
    "dominate",
    "submit",
    "obey",
    "resist",
    "rebel",
    "force",
    "strength",
    "weak",
    "helpless",
    "manipulate",
    "influence",
    "dominance",
    "subordinate",
    "master",
    "servant",
  ],
  "Justice & Morality": [
    "justice",
    "injustice",
    "right",
    "wrong",
    "moral",
    "immoral",
    "ethical",
    "fair",
    "unfair",
    "deserve",
    "punish",
    "reward",
    "guilt",
    "innocent",
    "sin",
    "virtue",
    "evil",
    "good",
    "conscience",
    "principle",
    "honor",
  ],
  "Freedom & Captivity": [
    "freedom",
    "free",
    "liberty",
    "escape",
    "trap",
    "trapped",
    "prison",
    "cage",
    "bound",
    "chains",
    "release",
    "liberate",
    "captive",
    "confined",
    "restricted",
    "limit",
    "break free",
    "independence",
    "autonomy",
    "constrained",
  ],
  "Loss & Grief": [
    "loss",
    "lose",
    "lost",
    "grief",
    "mourn",
    "mourning",
    "death",
    "dead",
    "die",
    "dying",
    "gone",
    "absence",
    "missing",
    "empty",
    "void",
    "sorrow",
    "ache",
    "pain",
    "hurt",
    "regret",
    "farewell",
    "goodbye",
    "end",
  ],
  "Hope & Despair": [
    "hope",
    "hopeful",
    "hopeless",
    "despair",
    "desperate",
    "optimism",
    "pessimism",
    "dream",
    "nightmare",
    "wish",
    "fear",
    "dread",
    "dark",
    "light",
    "future",
    "fate",
    "destiny",
    "promise",
    "impossible",
    "possible",
  ],
  "Truth & Deception": [
    "truth",
    "true",
    "lie",
    "lied",
    "lies",
    "lying",
    "deceive",
    "deceit",
    "deception",
    "honest",
    "dishonest",
    "fake",
    "false",
    "real",
    "illusion",
    "secret",
    "hide",
    "hidden",
    "reveal",
    "conceal",
    "expose",
    "betrayal",
  ],
  "Survival & Struggle": [
    "survive",
    "survival",
    "struggle",
    "fight",
    "battle",
    "endure",
    "persevere",
    "overcome",
    "challenge",
    "threat",
    "danger",
    "risk",
    "peril",
    "adversity",
    "hardship",
    "suffer",
    "sacrifice",
    "conquer",
    "victory",
    "defeat",
  ],
  "Change & Transformation": [
    "change",
    "changed",
    "changing",
    "transform",
    "transformation",
    "evolve",
    "evolution",
    "growth",
    "develop",
    "different",
    "new",
    "old",
    "before",
    "after",
    "become",
    "was",
    "now",
    "then",
    "shift",
    "transition",
  ],
  "Isolation & Belonging": [
    "alone",
    "lonely",
    "solitude",
    "isolation",
    "isolated",
    "together",
    "belong",
    "belonging",
    "outsider",
    "stranger",
    "community",
    "family",
    "home",
    "exile",
    "outcast",
    "separate",
    "apart",
    "connect",
    "disconnect",
  ],
  "Memory & Forgetting": [
    "remember",
    "remembering",
    "memory",
    "memories",
    "forget",
    "forgotten",
    "forgetting",
    "recall",
    "reminisce",
    "past",
    "nostalgia",
    "history",
    "remind",
    "recollection",
    "flashback",
    "haunt",
    "linger",
    "erase",
  ],
};

/**
 * Common symbolic objects/elements that often carry thematic weight
 */
const SYMBOLIC_OBJECTS: Record<string, string[]> = {
  "Light/Dark": [
    "light",
    "lights",
    "darkness",
    "shadow",
    "shadows",
    "sun",
    "moon",
    "stars",
    "dawn",
    "dusk",
    "twilight",
  ],
  Water: [
    "water",
    "ocean",
    "sea",
    "river",
    "rain",
    "storm",
    "wave",
    "waves",
    "flood",
    "drown",
    "drowning",
  ],
  Fire: [
    "fire",
    "flame",
    "flames",
    "burn",
    "burning",
    "ash",
    "ashes",
    "smoke",
    "ember",
    "blaze",
  ],
  Nature: [
    "tree",
    "trees",
    "flower",
    "flowers",
    "garden",
    "forest",
    "woods",
    "mountain",
    "valley",
    "leaf",
    "leaves",
  ],
  Birds: [
    "bird",
    "birds",
    "wing",
    "wings",
    "fly",
    "flying",
    "feather",
    "feathers",
    "nest",
    "flight",
  ],
  Barriers: [
    "wall",
    "walls",
    "door",
    "doors",
    "window",
    "windows",
    "gate",
    "gates",
    "fence",
    "barrier",
    "threshold",
  ],
  Paths: [
    "road",
    "path",
    "journey",
    "crossroads",
    "bridge",
    "bridges",
    "way",
    "direction",
    "destination",
  ],
  Mirrors: [
    "mirror",
    "mirrors",
    "reflection",
    "reflections",
    "reflect",
    "glass",
    "image",
  ],
  Blood: [
    "blood",
    "bleeding",
    "bleed",
    "wound",
    "wounds",
    "scar",
    "scars",
    "cut",
  ],
  Time: [
    "clock",
    "clocks",
    "time",
    "hour",
    "hours",
    "minute",
    "minutes",
    "second",
    "seconds",
    "watch",
    "watches",
  ],
};

/**
 * Extract sentences containing thematic keywords
 */
function extractThematicSentences(text: string, keywords: string[]): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const examples: string[] = [];

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    for (const keyword of keywords) {
      if (lowerSentence.includes(keyword.toLowerCase())) {
        examples.push(sentence.trim());
        break; // One example per sentence
      }
    }
    if (examples.length >= 3) break; // Max 3 examples per theme
  }

  return examples;
}

/**
 * Calculate how evenly distributed mentions are across the text
 */
function calculateDistribution(
  positions: number[],
  textLength: number
): "concentrated" | "scattered" | "balanced" {
  if (positions.length < 3) return "scattered";

  const third = textLength / 3;
  const early = positions.filter((p) => p < third).length;
  const middle = positions.filter((p) => p >= third && p < third * 2).length;
  const late = positions.filter((p) => p >= third * 2).length;

  const variance =
    Math.max(early, middle, late) - Math.min(early, middle, late);

  if (variance > positions.length * 0.5) return "concentrated";
  if (variance < positions.length * 0.2) return "balanced";
  return "scattered";
}

/**
 * Find all positions where keywords appear
 */
function findKeywordPositions(text: string, keywords: string[]): number[] {
  const positions: number[] = [];
  const lowerText = text.toLowerCase();

  for (const keyword of keywords) {
    let index = 0;
    while ((index = lowerText.indexOf(keyword.toLowerCase(), index)) !== -1) {
      positions.push(index);
      index += keyword.length;
    }
  }

  return positions.sort((a, b) => a - b);
}

/**
 * Analyze thematic word clusters
 */
function extractThematicConcepts(text: string): ThematicConcept[] {
  const themes: ThematicConcept[] = [];
  const textLength = text.length;

  for (const [themeName, keywords] of Object.entries(THEME_CLUSTERS)) {
    const positions = findKeywordPositions(text, keywords);
    const frequency = positions.length;

    if (frequency > 0) {
      const examples = extractThematicSentences(text, keywords);
      const distribution = calculateDistribution(positions, textLength);

      // Calculate intensity based on frequency relative to text length
      const wordsPerOccurrence =
        text.split(/\s+/).length / Math.max(1, frequency);
      let intensity = 100;
      if (wordsPerOccurrence > 500) intensity = 40;
      else if (wordsPerOccurrence > 300) intensity = 60;
      else if (wordsPerOccurrence > 150) intensity = 80;

      themes.push({
        theme: themeName,
        frequency,
        examples,
        intensity,
        distribution,
      });
    }
  }

  // Sort by frequency
  themes.sort((a, b) => b.frequency - a.frequency);

  return themes;
}

/**
 * Analyze symbolic patterns
 */
function analyzeSymbols(text: string): SymbolicPattern[] {
  const symbols: SymbolicPattern[] = [];

  for (const [symbolCategory, keywords] of Object.entries(SYMBOLIC_OBJECTS)) {
    const positions = findKeywordPositions(text, keywords);
    const occurrences = positions.length;

    if (occurrences >= 3) {
      // Only track if mentioned multiple times
      const contexts = extractThematicSentences(text, keywords);

      symbols.push({
        symbol: symbolCategory,
        occurrences,
        contexts,
        possibleMeaning: getMeaningForSymbol(symbolCategory),
      });
    }
  }

  // Sort by occurrences
  symbols.sort((a, b) => b.occurrences - a.occurrences);

  return symbols;
}

/**
 * Get possible thematic meaning for symbolic pattern
 */
function getMeaningForSymbol(category: string): string {
  const meanings: Record<string, string> = {
    "Light/Dark":
      "Often represents hope vs. despair, knowledge vs. ignorance, or good vs. evil",
    Water: "May symbolize emotions, cleansing, life/death, or the unconscious",
    Fire: "Could represent destruction, passion, transformation, or purification",
    Nature:
      "Often symbolizes growth, life cycles, or connection to something larger",
    Birds: "May represent freedom, transcendence, perspective, or the soul",
    Barriers:
      "Could symbolize obstacles, boundaries, transitions, or protection vs. confinement",
    Paths: "Often represents choices, life journey, or destiny",
    Mirrors: "May symbolize self-reflection, truth, identity, or duality",
    Blood: "Could represent life force, sacrifice, violence, or family bonds",
    Time: "Often symbolizes mortality, pressure, or the inevitability of change",
  };

  return (
    meanings[category] || "Symbolic significance may vary based on context"
  );
}

/**
 * Generate recommendations based on theme analysis
 */
function generateRecommendations(result: ThemeAnalysisResult): string[] {
  const recommendations: string[] = [];

  if (result.primaryThemes.length === 0) {
    recommendations.push(
      "No clear themes detected. Consider adding deeper thematic layers to strengthen your narrative."
    );
  }

  if (result.primaryThemes.length > 5) {
    recommendations.push(
      "Many themes detected. Consider focusing on 2-3 core themes for stronger impact."
    );
  }

  const concentratedThemes = result.primaryThemes.filter(
    (t) => t.distribution === "concentrated"
  );
  if (concentratedThemes.length > 0) {
    recommendations.push(
      `Theme "${concentratedThemes[0].theme}" is concentrated in one section. Consider distributing it more evenly.`
    );
  }

  if (result.symbolicPatterns.length === 0) {
    recommendations.push(
      "No recurring symbolic patterns detected. Consider using recurring imagery to reinforce themes."
    );
  }

  if (result.thematicDensity < 30) {
    recommendations.push(
      "Low thematic density. Add more thematic depth to give readers something to contemplate."
    );
  }

  if (result.thematicDensity > 80) {
    recommendations.push(
      "Very high thematic density. Ensure themes enhance rather than overwhelm the story."
    );
  }

  const weakThemes = result.primaryThemes.filter((t) => t.intensity < 50);
  if (weakThemes.length > 0) {
    recommendations.push(
      `Theme "${weakThemes[0].theme}" is present but weak. Develop it further or remove it.`
    );
  }

  return recommendations;
}

/**
 * Main theme analysis function
 */
export function analyzeThemes(text: string): ThemeAnalysisResult {
  const thematicConcepts = extractThematicConcepts(text);
  const symbols = analyzeSymbols(text);

  // Split into primary (top 3-5) and secondary themes
  const primaryThemes = thematicConcepts.slice(0, 5);
  const secondaryThemes = thematicConcepts.slice(5, 10);

  // Calculate thematic density (0-100)
  const wordCount = text.split(/\s+/).length;
  const totalThematicMentions = thematicConcepts.reduce(
    (sum, t) => sum + t.frequency,
    0
  );
  const thematicDensity = Math.min(
    100,
    Math.round((totalThematicMentions / wordCount) * 100)
  );

  // Identify dominant theme
  const dominantTheme =
    primaryThemes.length > 0 ? primaryThemes[0].theme : null;

  const result: ThemeAnalysisResult = {
    primaryThemes,
    secondaryThemes,
    symbolicPatterns: symbols.slice(0, 5), // Top 5 symbols
    thematicDensity,
    dominantTheme,
    recommendations: [],
  };

  result.recommendations = generateRecommendations(result);

  return result;
}
