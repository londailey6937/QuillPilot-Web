/**
 * Genre Registry for Creative Writing Analysis
 * Replaces domain-based concept libraries with genre-specific keyword detection
 */

export type Genre =
  | "fantasy"
  | "mystery"
  | "romance"
  | "scifi"
  | "thriller"
  | "horror"
  | "literary"
  | "historical"
  | "western"
  | "metaphysical"
  | "screenplay"
  | "general";

export interface GenreDefinition {
  id: Genre;
  name: string;
  description: string;
  keywords: string[];
  icon: string;
}

export const GENRE_DEFINITIONS: Record<Genre, GenreDefinition> = {
  fantasy: {
    id: "fantasy",
    name: "Fantasy",
    description: "Magic, mythical creatures, and fantastical worlds",
    keywords: [
      "wizard",
      "magic",
      "magical",
      "dragon",
      "spell",
      "wand",
      "quest",
      "realm",
      "potion",
      "enchant",
      "enchanted",
      "enchantment",
      "sorcerer",
      "witch",
      "elf",
      "dwarf",
      "prophecy",
      "artifact",
      "rune",
      "mythical",
      "legendary",
      "mystical",
      "arcane",
      "fairy",
      "fairies",
      "gnome",
      "pixie",
      "sprite",
      "goblin",
      "troll",
      "unicorn",
      "griffin",
      "phoenix",
      "wyvern",
      "curse",
      "cursed",
      "bewitched",
      "transform",
      "transformation",
      "shapeshifter",
      "oracle",
      "crystal",
      "amulet",
      "talisman",
      "charm",
      "incantation",
      "conjure",
      "summon",
      "portal",
      "otherworld",
      "fae",
      "warlock",
      "mage",
      "seer",
      "immortal",
      "elixir",
      "familiar",
    ],
    icon: "🧙‍♂️",
  },
  mystery: {
    id: "mystery",
    name: "Mystery",
    description: "Crime solving, detectives, and investigations",
    keywords: [
      "detective",
      "clue",
      "murder",
      "suspect",
      "investigation",
      "alibi",
      "evidence",
      "witness",
      "crime",
      "interrogate",
      "forensic",
      "perpetrator",
      "motive",
      "sleuth",
      "case",
      "solve",
      "deduce",
      "cipher",
      "riddle",
      "revelation",
    ],
    icon: "🔍",
  },
  romance: {
    id: "romance",
    name: "Romance",
    description: "Love stories and relationships",
    keywords: [
      "love",
      "heart",
      "kiss",
      "passion",
      "relationship",
      "soulmate",
      "attraction",
      "desire",
      "affection",
      "embrace",
      "romantic",
      "beloved",
      "sweetheart",
      "courtship",
      "infatuation",
      "devotion",
      "longing",
      "chemistry",
      "intimate",
      "tender",
    ],
    icon: "💕",
  },
  scifi: {
    id: "scifi",
    name: "Science Fiction",
    description: "Futuristic technology and space exploration",
    keywords: [
      "spaceship",
      "alien",
      "planet",
      "robot",
      "galaxy",
      "technology",
      "cyborg",
      "android",
      "laser",
      "spacecraft",
      "extraterrestrial",
      "colonize",
      "starship",
      "quantum",
      "teleport",
      "hologram",
      "artificial intelligence",
      "warp",
      "orbit",
      "dimension",
    ],
    icon: "🚀",
  },
  thriller: {
    id: "thriller",
    name: "Thriller",
    description: "Suspense, danger, and high-stakes action",
    keywords: [
      "danger",
      "chase",
      "escape",
      "threat",
      "weapon",
      "pursuit",
      "assassin",
      "hostage",
      "conspiracy",
      "betrayal",
      "survival",
      "adrenaline",
      "ambush",
      "tension",
      "deadly",
      "explosive",
      "raid",
      "infiltrate",
      "sniper",
      "covert",
    ],
    icon: "⚡",
  },
  horror: {
    id: "horror",
    name: "Horror",
    description: "Fear, supernatural elements, and terror",
    keywords: [
      "terror",
      "scream",
      "monster",
      "darkness",
      "blood",
      "fear",
      "nightmare",
      "ghost",
      "haunt",
      "demon",
      "vampire",
      "zombie",
      "creature",
      "supernatural",
      "sinister",
      "dread",
      "macabre",
      "eerie",
      "ominous",
      "grotesque",
    ],
    icon: "😱",
  },
  literary: {
    id: "literary",
    name: "Literary Fiction",
    description: "Character-driven stories with literary themes",
    keywords: [
      "introspection",
      "memory",
      "reflection",
      "identity",
      "consciousness",
      "existential",
      "philosophy",
      "metaphor",
      "symbolism",
      "narrative",
      "prose",
      "contemplation",
      "humanity",
      "mortality",
      "truth",
      "meaning",
      "essence",
      "profound",
      "nuanced",
      "complex",
    ],
    icon: "📖",
  },
  historical: {
    id: "historical",
    name: "Historical Fiction",
    description: "Stories set in specific historical periods",
    keywords: [
      "century",
      "era",
      "war",
      "king",
      "queen",
      "empire",
      "revolution",
      "colonial",
      "medieval",
      "ancient",
      "victorian",
      "regiment",
      "battle",
      "dynasty",
      "monarchy",
      "treaty",
      "rebellion",
      "aristocrat",
      "peasant",
      "chronicle",
    ],
    icon: "🏛️",
  },
  western: {
    id: "western",
    name: "Western",
    description: "American frontier stories with cowboys and outlaws",
    keywords: [
      "cowboy",
      "sheriff",
      "saloon",
      "frontier",
      "outlaw",
      "gunslinger",
      "ranch",
      "cattle",
      "deputy",
      "marshal",
      "desperado",
      "lasso",
      "saddle",
      "gunfight",
      "prairie",
      "wagon",
      "homestead",
      "posse",
      "bandit",
      "stagecoach",
    ],
    icon: "🤠",
  },
  metaphysical: {
    id: "metaphysical",
    name: "Metaphysical/Spiritual",
    description: "Stories exploring spiritual awakening and consciousness",
    keywords: [
      "zen",
      "chan",
      "prana",
      "chakra",
      "karma",
      "meditation",
      "enlightenment",
      "consciousness",
      "awakening",
      "spiritual",
      "transcendence",
      "mindfulness",
      "dharma",
      "nirvana",
      "soul",
      "cosmic",
      "divine",
      "mysticism",
      "aura",
      "energy",
    ],
    icon: "🧘",
  },
  screenplay: {
    id: "screenplay",
    name: "Screenplay",
    description: "Film and television scripts with scene direction and dialogue",
    keywords: [
      "int.",
      "ext.",
      "fade in",
      "fade out",
      "cut to",
      "dissolve",
      "montage",
      "voice over",
      "v.o.",
      "o.s.",
      "continuous",
      "later",
      "angle on",
      "close up",
      "wide shot",
      "establishing",
      "intercut",
      "flashback",
      "super",
      "title card",
      "smash cut",
      "match cut",
      "pan to",
      "zoom",
      "tracking",
      "crane shot",
      "pov",
      "insert",
      "beat",
      "parenthetical",
    ],
    icon: "🎬",
  },
  general: {
    id: "general",
    name: "General Fiction",
    description: "Stories that don't fit specific genre categories",
    keywords: [],
    icon: "📚",
  },
};

export function getAvailableGenres(): GenreDefinition[] {
  return Object.values(GENRE_DEFINITIONS);
}

export function getGenreById(id: Genre): GenreDefinition | undefined {
  return GENRE_DEFINITIONS[id];
}

/**
 * Detect the genre of a text based on keyword matching
 */
export function detectGenre(text: string): Genre | null {
  const lowerText = text.toLowerCase();
  const scores: Partial<Record<Genre, number>> = {};

  // Count keyword matches for each genre
  for (const genre of Object.keys(GENRE_DEFINITIONS) as Genre[]) {
    if (genre === "general") continue;

    const definition = GENRE_DEFINITIONS[genre];
    let score = 0;

    for (const keyword of definition.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    scores[genre] = score;
  }

  // Find genre with highest score
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topGenre = sortedScores[0];

  // Require minimum score and lead over second place
  const minScore = 5;
  const minLead = 1.5;
  const secondPlace = sortedScores[1];

  if (
    topGenre &&
    topGenre[1] >= minScore &&
    (!secondPlace || topGenre[1] >= secondPlace[1] * minLead)
  ) {
    return topGenre[0] as Genre;
  }

  return null;
}
