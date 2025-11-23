/**
 * Genre-Specific Trope Analyzer
 * Detects common tropes, story beats, and narrative conventions across different genres
 */

export interface Trope {
  name: string;
  keywords: string[];
  patterns: string[]; // Narrative patterns or situations that indicate this trope
  strength: number; // 0-100, how strongly this trope is detected
}

export interface StoryBeat {
  name: string;
  position: "early" | "middle" | "late" | "any";
  keywords: string[];
  detected: boolean;
  confidence: number; // 0-100
}

export interface TropeAnalysisResult {
  genre: string;
  detectedTropes: Trope[];
  storyBeats: StoryBeat[];
  conventionScore: number; // 0-100, how well it adheres to genre conventions
  subversionScore: number; // 0-100, how much it subverts expectations
  tropeOveruseScore: number; // 0-100, higher means too many clichés
  recommendations: string[];
}

// Trope libraries organized by genre
const ROMANCE_TROPES = {
  tropes: [
    {
      name: "Enemies to Lovers",
      keywords: ["hate", "rival", "enemy", "antagonist", "despise", "loathe", "animosity", "conflict", "tension"],
      patterns: ["initial conflict", "forced proximity", "gradual attraction", "turning point"],
    },
    {
      name: "Forced Proximity",
      keywords: ["trapped", "stuck", "confined", "forced", "nowhere", "escape", "together", "alone"],
      patterns: ["confined space", "shared quarters", "isolated location"],
    },
    {
      name: "Second Chance Romance",
      keywords: ["ex", "past", "again", "return", "years", "once", "mistake", "regret", "reunion"],
      patterns: ["past relationship", "separation", "reunion", "growth"],
    },
    {
      name: "Fake Relationship",
      keywords: ["pretend", "fake", "act", "charade", "arrangement", "contract", "deal", "agreement"],
      patterns: ["fake dating", "marriage of convenience", "developing real feelings"],
    },
    {
      name: "Love Triangle",
      keywords: ["two", "both", "choice", "torn", "choose", "competing", "jealous", "jealousy"],
      patterns: ["multiple suitors", "difficult choice", "emotional conflict"],
    },
    {
      name: "Forbidden Love",
      keywords: ["forbidden", "secret", "hide", "wrong", "shouldn't", "family", "opposed", "disapprove"],
      patterns: ["social barriers", "family opposition", "secret relationship"],
    },
    {
      name: "Grumpy x Sunshine",
      keywords: ["grumpy", "gruff", "cheerful", "optimist", "pessimist", "opposite", "smile", "brighten"],
      patterns: ["personality contrast", "emotional thawing", "opposites attract"],
    },
    {
      name: "Slow Burn",
      keywords: ["slowly", "gradual", "time", "patient", "eventually", "finally", "realize", "feelings"],
      patterns: ["prolonged tension", "delayed gratification", "emotional buildup"],
    },
  ],
  storyBeats: [
    { name: "Meet Cute", position: "early" as const, keywords: ["meet", "first", "encounter", "bump", "unexpected"] },
    { name: "Initial Attraction", position: "early" as const, keywords: ["notice", "drawn", "attracted", "beautiful", "handsome"] },
    { name: "Conflict/Obstacle", position: "middle" as const, keywords: ["obstacle", "problem", "conflict", "misunderstanding", "fight"] },
    { name: "Dark Moment", position: "middle" as const, keywords: ["apart", "break", "leave", "ending", "over", "goodbye"] },
    { name: "Grand Gesture", position: "late" as const, keywords: ["realize", "gesture", "prove", "declaration", "choose", "sacrifice"] },
    { name: "Happily Ever After", position: "late" as const, keywords: ["together", "forever", "marry", "commitment", "future", "always"] },
  ],
};

const THRILLER_TROPES = {
  tropes: [
    {
      name: "Ticking Clock",
      keywords: ["time", "deadline", "hours", "minutes", "running out", "before", "too late", "countdown"],
      patterns: ["urgent deadline", "race against time", "mounting pressure"],
    },
    {
      name: "Red Herring",
      keywords: ["suspect", "misleading", "distraction", "wrong", "seemed", "thought", "actually", "turns out"],
      patterns: ["false clue", "misdirection", "revealed truth"],
    },
    {
      name: "Conspiracy Theory",
      keywords: ["conspiracy", "cover-up", "government", "organization", "powerful", "secret", "corrupt", "truth"],
      patterns: ["hidden agenda", "web of lies", "dangerous knowledge"],
    },
    {
      name: "Cat and Mouse",
      keywords: ["chase", "pursuit", "hunter", "prey", "escape", "catch", "evade", "track"],
      patterns: ["pursuit sequence", "narrow escape", "strategic moves"],
    },
    {
      name: "The Reveal",
      keywords: ["reveal", "twist", "actually", "truth", "secret", "discover", "hidden", "shocking"],
      patterns: ["major revelation", "truth exposed", "paradigm shift"],
    },
    {
      name: "Double Agent",
      keywords: ["betray", "traitor", "spy", "double", "working for", "secretly", "loyal", "trust"],
      patterns: ["hidden allegiance", "betrayal", "trust broken"],
    },
    {
      name: "Innocent Accused",
      keywords: ["innocent", "framed", "wrongly", "accused", "didn't", "prove", "clear name", "truth"],
      patterns: ["false accusation", "fight for justice", "proving innocence"],
    },
  ],
  storyBeats: [
    { name: "Inciting Incident", position: "early" as const, keywords: ["attack", "murder", "threat", "danger", "crime", "incident"] },
    { name: "Call to Action", position: "early" as const, keywords: ["investigate", "pursue", "hunt", "find", "stop", "prevent"] },
    { name: "False Victory", position: "middle" as const, keywords: ["solved", "caught", "safe", "over", "relief", "celebrate"] },
    { name: "Major Setback", position: "middle" as const, keywords: ["worse", "wrong", "trap", "ambush", "lose", "fail"] },
    { name: "Final Confrontation", position: "late" as const, keywords: ["face", "confront", "showdown", "final", "end this", "battle"] },
    { name: "Resolution", position: "late" as const, keywords: ["justice", "caught", "safe", "peace", "truth", "exposed"] },
  ],
};

const FANTASY_TROPES = {
  tropes: [
    {
      name: "Chosen One",
      keywords: ["chosen", "prophecy", "destiny", "special", "only one", "save", "foretold", "meant to"],
      patterns: ["prophetic selection", "special powers", "heroic destiny"],
    },
    {
      name: "Magic System",
      keywords: ["magic", "spell", "enchant", "power", "mana", "energy", "cast", "channel", "ability"],
      patterns: ["magical abilities", "power source", "limitations and costs"],
    },
    {
      name: "Coming of Age",
      keywords: ["young", "learn", "train", "become", "grow", "discover", "journey", "transformation"],
      patterns: ["inexperienced hero", "mentor relationship", "personal growth"],
    },
    {
      name: "Quest",
      keywords: ["quest", "journey", "search", "find", "artifact", "retrieve", "mission", "travel"],
      patterns: ["long journey", "companions", "obstacles", "goal"],
    },
    {
      name: "Dark Lord",
      keywords: ["dark lord", "evil", "tyrant", "ruler", "dark", "shadow", "corrupt", "malevolent"],
      patterns: ["powerful antagonist", "evil empire", "threatened world"],
    },
    {
      name: "Ancient Evil Awakens",
      keywords: ["ancient", "awaken", "return", "forgotten", "sealed", "dormant", "rise again", "slumber"],
      patterns: ["long-dormant threat", "ancient power", "resurgence"],
    },
    {
      name: "Mentor's Death",
      keywords: ["mentor", "teacher", "master", "die", "death", "sacrifice", "loss", "killed"],
      patterns: ["wise guide", "hero alone", "tragic loss"],
    },
    {
      name: "Hidden Heritage",
      keywords: ["bloodline", "ancestry", "heritage", "royal", "descendant", "lineage", "secret", "true identity"],
      patterns: ["noble birth", "revealed identity", "rightful heir"],
    },
  ],
  storyBeats: [
    { name: "Ordinary World", position: "early" as const, keywords: ["normal", "simple", "peaceful", "village", "home", "routine"] },
    { name: "Call to Adventure", position: "early" as const, keywords: ["summon", "call", "need", "must", "leave", "journey"] },
    { name: "Crossing Threshold", position: "early" as const, keywords: ["leave", "depart", "beyond", "enter", "cross", "new world"] },
    { name: "Trials and Tests", position: "middle" as const, keywords: ["challenge", "test", "trial", "prove", "overcome", "struggle"] },
    { name: "Approach the Cave", position: "middle" as const, keywords: ["stronghold", "fortress", "lair", "approach", "prepare", "final"] },
    { name: "Ordeal", position: "late" as const, keywords: ["battle", "fight", "confront", "face", "defeat", "victory"] },
    { name: "Return with Prize", position: "late" as const, keywords: ["return", "home", "changed", "victory", "peace", "restored"] },
  ],
};

const MYSTERY_TROPES = {
  tropes: [
    {
      name: "Locked Room Mystery",
      keywords: ["locked", "sealed", "impossible", "closed", "no way", "inside", "escape", "entry"],
      patterns: ["impossible crime", "sealed environment", "clever solution"],
    },
    {
      name: "Detective with Flaw",
      keywords: ["detective", "investigator", "flaw", "quirk", "obsessed", "troubled", "past", "demons"],
      patterns: ["flawed protagonist", "personal struggle", "complexity"],
    },
    {
      name: "Hidden Clue",
      keywords: ["clue", "evidence", "overlooked", "missed", "notice", "detail", "important", "significant"],
      patterns: ["subtle hint", "reader can solve", "fair play"],
    },
    {
      name: "Unreliable Narrator",
      keywords: ["remember", "recall", "confused", "maybe", "perhaps", "thought", "seemed", "unclear"],
      patterns: ["questionable perspective", "memory issues", "truth revealed"],
    },
    {
      name: "Multiple Suspects",
      keywords: ["suspect", "motive", "opportunity", "means", "could have", "might be", "each", "all"],
      patterns: ["cast of suspects", "competing theories", "process of elimination"],
    },
    {
      name: "Dying Message",
      keywords: ["dying", "last words", "final", "before death", "gasped", "whispered", "cryptic", "clue"],
      patterns: ["cryptic message", "victim's hint", "decoded meaning"],
    },
  ],
  storyBeats: [
    { name: "Crime Discovery", position: "early" as const, keywords: ["found", "body", "murder", "crime", "dead", "discovered"] },
    { name: "Initial Investigation", position: "early" as const, keywords: ["examine", "investigate", "scene", "evidence", "witness", "question"] },
    { name: "Gathering Suspects", position: "middle" as const, keywords: ["suspect", "interview", "alibi", "motive", "opportunity"] },
    { name: "False Solution", position: "middle" as const, keywords: ["arrest", "solved", "guilty", "confession", "caught"] },
    { name: "True Revelation", position: "late" as const, keywords: ["actually", "real", "truth", "discover", "reveal", "expose"] },
    { name: "Denouement", position: "late" as const, keywords: ["explain", "how", "why", "confession", "evidence", "proof"] },
  ],
};

const SCIFI_TROPES = {
  tropes: [
    {
      name: "First Contact",
      keywords: ["alien", "extraterrestrial", "first contact", "species", "encounter", "communicate", "unknown"],
      patterns: ["meeting aliens", "communication challenges", "cultural exchange"],
    },
    {
      name: "AI Uprising",
      keywords: ["artificial intelligence", "robot", "machine", "sentient", "uprising", "rebellion", "control"],
      patterns: ["AI gains consciousness", "human vs machine", "existential threat"],
    },
    {
      name: "Time Paradox",
      keywords: ["time", "paradox", "past", "future", "timeline", "causality", "loop", "alternate"],
      patterns: ["time travel", "consequences", "butterfly effect"],
    },
    {
      name: "Dystopia",
      keywords: ["dystopia", "totalitarian", "oppressive", "control", "surveillance", "regime", "government"],
      patterns: ["oppressive society", "resistance", "fight for freedom"],
    },
    {
      name: "Space Opera",
      keywords: ["galaxy", "empire", "fleet", "star", "planet", "space", "ship", "universe"],
      patterns: ["grand scale", "multiple worlds", "epic conflict"],
    },
    {
      name: "Cyberpunk",
      keywords: ["cyber", "hack", "corporation", "augment", "implant", "virtual", "matrix", "network"],
      patterns: ["high tech low life", "corporate control", "body modification"],
    },
    {
      name: "Post-Apocalyptic",
      keywords: ["apocalypse", "wasteland", "survivor", "ruins", "collapse", "destroyed", "remnant"],
      patterns: ["world ended", "survival", "rebuilding"],
    },
  ],
  storyBeats: [
    { name: "Technological Wonder", position: "early" as const, keywords: ["technology", "advanced", "innovation", "discover", "invention"] },
    { name: "Scientific Discovery", position: "early" as const, keywords: ["discover", "breakthrough", "science", "research", "experiment"] },
    { name: "Ethical Dilemma", position: "middle" as const, keywords: ["should", "ethics", "right", "wrong", "consequence", "moral"] },
    { name: "System Failure", position: "middle" as const, keywords: ["malfunction", "fail", "error", "corrupt", "breach", "crisis"] },
    { name: "Paradigm Shift", position: "late" as const, keywords: ["change", "revolution", "transform", "new era", "evolution"] },
    { name: "New Understanding", position: "late" as const, keywords: ["understand", "realize", "truth", "meaning", "purpose", "future"] },
  ],
};

const HORROR_TROPES = {
  tropes: [
    {
      name: "Jump Scare",
      keywords: ["sudden", "suddenly", "burst", "jumped", "startled", "scream", "shock", "appeared"],
      patterns: ["sudden appearance", "tension release", "shock moment"],
    },
    {
      name: "Haunted Location",
      keywords: ["haunted", "cursed", "evil", "house", "place", "atmosphere", "presence", "spirits"],
      patterns: ["sinister setting", "dark history", "trapped"],
    },
    {
      name: "The Monster",
      keywords: ["creature", "monster", "beast", "thing", "entity", "horror", "inhuman", "nightmare"],
      patterns: ["threatening entity", "unknown nature", "deadly danger"],
    },
    {
      name: "Unreliable Reality",
      keywords: ["hallucination", "imagined", "real", "sanity", "insane", "madness", "dream", "nightmare"],
      patterns: ["questioned reality", "psychological horror", "uncertain truth"],
    },
    {
      name: "Forbidden Knowledge",
      keywords: ["forbidden", "shouldn't know", "curse", "price", "knowledge", "discover", "secret", "truth"],
      patterns: ["dangerous information", "cursed discovery", "terrible cost"],
    },
  ],
  storyBeats: [
    { name: "Ominous Setup", position: "early" as const, keywords: ["wrong", "strange", "unsettling", "eerie", "feeling", "sense"] },
    { name: "First Encounter", position: "early" as const, keywords: ["see", "glimpse", "hear", "sound", "shadow", "movement"] },
    { name: "Escalating Terror", position: "middle" as const, keywords: ["worse", "more", "again", "closer", "intense", "fear"] },
    { name: "False Safety", position: "middle" as const, keywords: ["safe", "relief", "escape", "away", "over"] },
    { name: "Final Horror", position: "late" as const, keywords: ["face", "confront", "final", "truth", "reveal", "ultimate"] },
  ],
};

// Map genres to their trope libraries
const GENRE_LIBRARIES: Record<string, typeof ROMANCE_TROPES> = {
  romance: ROMANCE_TROPES,
  thriller: THRILLER_TROPES,
  fantasy: FANTASY_TROPES,
  mystery: MYSTERY_TROPES,
  scifi: SCIFI_TROPES,
  horror: HORROR_TROPES,
};

/**
 * Analyze text for genre-specific tropes and conventions
 */
export function analyzeTropes(text: string, genre: string): TropeAnalysisResult {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const totalWords = words.length;

  // Get genre library (default to general analysis if genre not in library)
  const library = GENRE_LIBRARIES[genre.toLowerCase()];
  
  if (!library) {
    return {
      genre,
      detectedTropes: [],
      storyBeats: [],
      conventionScore: 50,
      subversionScore: 50,
      tropeOveruseScore: 0,
      recommendations: [
        `Genre "${genre}" doesn't have a specialized trope library yet.`,
        "Analysis will be available for: Romance, Thriller, Fantasy, Mystery, SciFi, Horror",
      ],
    };
  }

  // Detect tropes
  const detectedTropes: Trope[] = library.tropes.map(trope => {
    let matches = 0;
    trope.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
      const keywordMatches = (lowerText.match(regex) || []).length;
      matches += keywordMatches;
    });

    // Calculate strength based on frequency relative to text length
    const frequency = (matches / totalWords) * 1000; // per 1000 words
    const strength = Math.min(100, frequency * 20); // Scale to 0-100

    return {
      name: trope.name,
      keywords: trope.keywords,
      patterns: trope.patterns,
      strength: Math.round(strength),
    };
  }).filter(trope => trope.strength > 5); // Only include tropes with some presence

  // Sort by strength
  detectedTropes.sort((a, b) => b.strength - a.strength);

  // Detect story beats
  const sections = divideIntoSections(text);
  const storyBeats: StoryBeat[] = library.storyBeats.map(beat => {
    const sectionToCheck = 
      beat.position === "early" ? sections.early :
      beat.position === "middle" ? sections.middle :
      beat.position === "late" ? sections.late :
      text;

    let matches = 0;
    beat.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
      matches += (sectionToCheck.toLowerCase().match(regex) || []).length;
    });

    const detected = matches > 0;
    const confidence = Math.min(100, (matches / beat.keywords.length) * 50);

    return {
      name: beat.name,
      position: beat.position,
      keywords: beat.keywords,
      detected,
      confidence: Math.round(confidence),
    };
  });

  // Calculate scores
  const conventionScore = calculateConventionScore(detectedTropes, storyBeats);
  const subversionScore = calculateSubversionScore(detectedTropes, storyBeats, library);
  const tropeOveruseScore = calculateOveruseScore(detectedTropes);

  // Generate recommendations
  const recommendations = generateTropeRecommendations(
    detectedTropes,
    storyBeats,
    conventionScore,
    subversionScore,
    tropeOveruseScore,
    genre
  );

  return {
    genre,
    detectedTropes,
    storyBeats,
    conventionScore,
    subversionScore,
    tropeOveruseScore,
    recommendations,
  };
}

/**
 * Divide text into early, middle, late sections for story beat detection
 */
function divideIntoSections(text: string): { early: string; middle: string; late: string } {
  const length = text.length;
  const thirdPoint = Math.floor(length / 3);
  const twoThirdsPoint = Math.floor((length * 2) / 3);

  return {
    early: text.substring(0, thirdPoint),
    middle: text.substring(thirdPoint, twoThirdsPoint),
    late: text.substring(twoThirdsPoint),
  };
}

/**
 * Calculate how well the text adheres to genre conventions
 */
function calculateConventionScore(tropes: Trope[], beats: StoryBeat[]): number {
  if (tropes.length === 0 && beats.filter(b => b.detected).length === 0) {
    return 30; // Low if no genre markers detected
  }

  // Strong tropes (>30 strength) count more
  const strongTropes = tropes.filter(t => t.strength > 30).length;
  const tropeScore = Math.min(100, (tropes.length * 10) + (strongTropes * 15));

  // Detected beats
  const detectedBeats = beats.filter(b => b.detected).length;
  const beatScore = Math.min(100, (detectedBeats / beats.length) * 100);

  // Weighted average
  return Math.round((tropeScore * 0.6) + (beatScore * 0.4));
}

/**
 * Calculate how much the text subverts genre expectations
 */
function calculateSubversionScore(tropes: Trope[], beats: StoryBeat[], library: typeof ROMANCE_TROPES): number {
  // Higher subversion when:
  // - Few expected tropes present
  // - Expected story beats missing
  // - Unusual combination of tropes

  const expectedTropeCount = library.tropes.length;
  const detectedTropeCount = tropes.length;
  const tropeAbsenceScore = ((expectedTropeCount - detectedTropeCount) / expectedTropeCount) * 100;

  const expectedBeatCount = library.storyBeats.length;
  const detectedBeatCount = beats.filter(b => b.detected).length;
  const beatAbsenceScore = ((expectedBeatCount - detectedBeatCount) / expectedBeatCount) * 100;

  // Average of both
  return Math.round((tropeAbsenceScore + beatAbsenceScore) / 2);
}

/**
 * Calculate if tropes are overused (cliché detection)
 */
function calculateOveruseScore(tropes: Trope[]): number {
  if (tropes.length === 0) return 0;

  // Multiple strong tropes might indicate clichéd writing
  const veryStrongTropes = tropes.filter(t => t.strength > 50).length;
  const strongTropes = tropes.filter(t => t.strength > 30).length;

  const overuseScore = (veryStrongTropes * 25) + (strongTropes * 10);
  return Math.min(100, Math.round(overuseScore));
}

/**
 * Generate actionable recommendations based on trope analysis
 */
function generateTropeRecommendations(
  tropes: Trope[],
  beats: StoryBeat[],
  conventionScore: number,
  subversionScore: number,
  overuseScore: number,
  genre: string
): string[] {
  const recommendations: string[] = [];

  // Convention adherence feedback
  if (conventionScore < 40) {
    recommendations.push(
      `Your ${genre} story has few recognizable genre markers. Consider incorporating more ${genre}-specific elements to meet reader expectations.`
    );
  } else if (conventionScore > 80) {
    recommendations.push(
      `Strong genre adherence detected. Your story hits key ${genre} conventions effectively.`
    );
  }

  // Subversion feedback
  if (subversionScore > 70) {
    recommendations.push(
      `High subversion detected. You're breaking genre conventions significantly - ensure this is intentional and readers are prepared for it.`
    );
  } else if (subversionScore < 30) {
    recommendations.push(
      `Low subversion detected. Consider adding unique twists to avoid predictability.`
    );
  }

  // Overuse feedback
  if (overuseScore > 60) {
    recommendations.push(
      `Warning: Multiple common tropes detected at high frequency. Consider reducing clichés or adding fresh twists to familiar elements.`
    );
  } else if (overuseScore < 20 && tropes.length > 0) {
    recommendations.push(
      `Good balance of trope usage - familiar elements present without overwhelming the narrative.`
    );
  }

  // Specific trope feedback
  if (tropes.length > 0) {
    const topTrope = tropes[0];
    recommendations.push(
      `Primary trope detected: "${topTrope.name}" (${topTrope.strength}% strength). This is a strong genre marker.`
    );
  }

  // Story beat feedback
  const detectedBeats = beats.filter(b => b.detected);
  const missingBeats = beats.filter(b => !b.detected);
  
  if (detectedBeats.length > 0) {
    recommendations.push(
      `Story beats found: ${detectedBeats.map(b => b.name).join(", ")}. These provide good narrative structure.`
    );
  }
  
  if (missingBeats.length > 0 && missingBeats.length <= 3) {
    recommendations.push(
      `Consider adding: ${missingBeats.slice(0, 2).map(b => b.name).join(", ")}. These beats can strengthen your ${genre} narrative arc.`
    );
  }

  return recommendations;
}
