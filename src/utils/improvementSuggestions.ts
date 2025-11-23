/**
 * AI-Powered Improvement Suggestions
 * Generate specific, actionable rewrites for weak areas
 */

import type { ChapterAnalysis, PrincipleScore } from "../types";

export interface ImprovementSuggestion {
  area: string;
  currentIssue: string;
  suggestedFix: string;
  example: {
    before: string;
    after: string;
  };
  priority: "critical" | "high" | "medium" | "low";
  category:
    | "dialogue"
    | "description"
    | "pacing"
    | "character"
    | "conflict"
    | "prose";
}

/**
 * Generate improvement suggestions based on analysis
 */
export function generateImprovementSuggestions(
  analysis: ChapterAnalysis,
  manuscriptSample?: string
): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  // Analyze each principle score and generate specific suggestions
  analysis.principleScores.forEach((ps) => {
    if (ps.score < 60) {
      const specificSuggestions = generateSuggestionsForPrinciple(
        ps,
        analysis,
        manuscriptSample
      );
      suggestions.push(...specificSuggestions);
    }
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return suggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

/**
 * Generate suggestions for a specific principle
 */
function generateSuggestionsForPrinciple(
  principle: PrincipleScore,
  analysis: ChapterAnalysis,
  sample?: string
): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];
  const principleId = String(principle.principleId);

  // Show vs Tell
  if (
    principleId.includes("showVsTell") ||
    principleId.includes("dualCoding")
  ) {
    suggestions.push({
      area: "Show vs Tell",
      currentIssue:
        "Too much telling without showing. Readers need sensory details and actions to immerse in the story.",
      suggestedFix:
        "Replace abstract statements with concrete actions, sensory details, and dialogue that reveal character emotions.",
      example: {
        before: "Sarah was angry at her brother.",
        after:
          "Sarah's jaw clenched. She slammed the door behind her, rattling the picture frames on the wall.",
      },
      priority: principle.score < 40 ? "critical" : "high",
      category: "description",
    });
  }

  // Dialogue Quality
  if (principleId.includes("dialogue")) {
    const dialogueData = analysis.proseQuality?.dialogue;

    if (dialogueData && dialogueData.attributionVariety < 0.5) {
      suggestions.push({
        area: "Dialogue Attribution",
        currentIssue:
          'Overusing dialogue tags like "said" or repetitive attribution patterns.',
        suggestedFix:
          "Vary dialogue tags, use action beats, and sometimes omit tags when speakers are clear.",
        example: {
          before: '"I don\'t know," she said. "Maybe we should go," she said.',
          after:
            '"I don\'t know." She glanced at the door. "Maybe we should go."',
        },
        priority: "medium",
        category: "dialogue",
      });
    }

    if (dialogueData && dialogueData.totalLines > 0) {
      suggestions.push({
        area: "Dialogue Balance",
        currentIssue:
          "Dialogue needs to reveal character, advance plot, and create subtext.",
        suggestedFix:
          "Ensure each line of dialogue serves multiple purposes: characterization, conflict, and story progression.",
        example: {
          before: '"How are you?" "I\'m fine." "That\'s good."',
          after:
            '"How are you?" He didn\'t meet her eyes. "Fine." The word came out sharp, final.',
        },
        priority: "medium",
        category: "dialogue",
      });
    }
  }

  // Pacing
  if (principleId.includes("pacing")) {
    suggestions.push({
      area: "Pacing & Rhythm",
      currentIssue:
        "Monotonous pacing with similar paragraph and sentence lengths throughout.",
      suggestedFix:
        "Vary sentence length deliberately. Use short sentences for tension, longer ones for reflection.",
      example: {
        before:
          "The door opened slowly and she walked into the dark room where shadows filled every corner and she felt afraid.",
        after:
          "The door creaked open. She stepped into darkness. Shadows pressed in from every corner. Her heart raced.",
      },
      priority: principle.score < 50 ? "high" : "medium",
      category: "pacing",
    });
  }

  // Character Development
  if (principleId.includes("character")) {
    const characterData = analysis.characterAnalysis;

    if (characterData && characterData.characters.length > 0) {
      const flatCharacters = characterData.characters.filter(
        (c: any) => c.arcType === "flat" && c.role !== "minor"
      );

      if (flatCharacters.length > 0) {
        suggestions.push({
          area: "Character Development",
          currentIssue: `Major character(s) showing flat arc: ${flatCharacters
            .map((c: any) => c.name)
            .join(", ")}`,
          suggestedFix:
            "Give characters internal conflicts, goals that change, and emotional growth throughout the story.",
          example: {
            before:
              "John was a brave detective who always caught the criminal.",
            after:
              "John had been fearless once. Now, after losing his partner, every dark alley made his hands shake. But he couldn't let fear win.",
          },
          priority: "high",
          category: "character",
        });
      }
    }
  }

  // Passive Voice
  if (principleId.includes("voice") || principleId.includes("Active")) {
    const proseData = analysis.proseQuality;

    if (proseData?.passiveVoice && proseData.passiveVoice.percentage > 15) {
      suggestions.push({
        area: "Active Voice",
        currentIssue: `${proseData.passiveVoice.percentage.toFixed(
          0
        )}% passive voice detected - weakens prose and slows pacing.`,
        suggestedFix:
          "Convert passive constructions to active voice for stronger, more immediate prose.",
        example: {
          before: "The door was opened by Maria.",
          after: "Maria opened the door.",
        },
        priority: proseData.passiveVoice.percentage > 25 ? "high" : "medium",
        category: "prose",
      });
    }
  }

  // Adverb Overuse
  if (principleId.includes("adverb")) {
    const proseData = analysis.proseQuality;

    if (proseData?.adverbs && proseData.adverbs.totalAdverbs > 0) {
      const density = proseData.adverbs.adverbsPerThousand;

      if (density > 20) {
        suggestions.push({
          area: "Adverb Reduction",
          currentIssue: `High adverb usage (${density.toFixed(
            1
          )} per 1000 words) - often indicates weak verb choices.`,
          suggestedFix:
            "Replace adverb+verb combinations with stronger, more specific verbs.",
          example: {
            before: "She walked quickly to the store.",
            after: "She hurried to the store.",
          },
          priority: density > 30 ? "high" : "medium",
          category: "prose",
        });
      }
    }
  }

  // Conflict Tracking
  if (principleId.includes("conflict")) {
    const conflictData = analysis.conflictTracking;

    if (conflictData && conflictData.conflictDensity < 1) {
      suggestions.push({
        area: "Conflict Presence",
        currentIssue:
          "Low conflict density - story needs obstacles, tension, and stakes in every scene.",
        suggestedFix:
          "Add external obstacles, internal doubts, and interpersonal tensions. Every scene should have something at stake.",
        example: {
          before: "They had lunch and talked about the weather.",
          after:
            'They ordered lunch, but Sarah kept checking her phone. "Expecting someone?" Mark asked, trying to sound casual.',
        },
        priority: "critical",
        category: "conflict",
      });
    }

    if (conflictData && conflictData.internalCount === 0) {
      suggestions.push({
        area: "Internal Conflict",
        currentIssue:
          "No internal conflict detected - characters need doubts, fears, and moral dilemmas.",
        suggestedFix:
          "Show characters wrestling with decisions, confronting fears, or battling inner demons.",
        example: {
          before: "Tom decided to help.",
          after:
            "Tom's stomach twisted. Helping meant betraying Sarah's trust. But doing nothing meant watching someone suffer.",
        },
        priority: "high",
        category: "conflict",
      });
    }
  }

  // Sensory Balance
  if (principleId.includes("sensory")) {
    const sensoryData = analysis.sensoryBalance;

    if (sensoryData && sensoryData.sightPercentage > 70) {
      suggestions.push({
        area: "Sensory Details",
        currentIssue: `${sensoryData.sightPercentage.toFixed(
          0
        )}% of sensory details are visual - readers experience the world through all five senses.`,
        suggestedFix:
          "Add sounds, textures, smells, and tastes to create a richer, more immersive world.",
        example: {
          before: "The old house looked abandoned.",
          after:
            "The old house sagged against the sky. Rotting wood filled the air with sweetness. Rusted hinges groaned in the wind.",
        },
        priority: "medium",
        category: "description",
      });
    }

    if (sensoryData && sensoryData.smellCount < 2) {
      suggestions.push({
        area: "Smell & Taste",
        currentIssue:
          "Minimal use of smell and taste - the most memory-triggering senses.",
        suggestedFix:
          "Add scent and flavor details to ground readers in the world and evoke emotional responses.",
        example: {
          before: "She entered the kitchen.",
          after:
            "She entered the kitchen. The scent of burnt toast hung in the air, mixed with her mother's perfume.",
        },
        priority: "low",
        category: "description",
      });
    }
  }

  // Cliché Detection
  if (principleId.includes("cliche")) {
    const clicheData = analysis.clicheDetection;

    if (clicheData && clicheData.count > 5) {
      suggestions.push({
        area: "Cliché Reduction",
        currentIssue: `${clicheData.count} clichés detected - predictable phrases weaken originality.`,
        suggestedFix:
          "Replace clichés with fresh, specific descriptions that fit your unique story world.",
        example: {
          before: "Her eyes sparkled like diamonds.",
          after: "Her eyes caught the lamplight, sharp and hungry.",
        },
        priority: clicheData.count > 10 ? "high" : "medium",
        category: "prose",
      });
    }
  }

  // Filtering Words
  if (
    principleId.includes("filtering") ||
    principleId.includes("directProse")
  ) {
    const filteringData = analysis.filteringWords;

    if (filteringData && filteringData.count > 20) {
      suggestions.push({
        area: "Direct Prose",
        currentIssue: `${filteringData.count} filtering words detected - creates distance between reader and action.`,
        suggestedFix:
          'Remove "saw", "heard", "felt" filters and show the experience directly.',
        example: {
          before: "She saw the door open and heard footsteps approaching.",
          after: "The door swung open. Footsteps approached.",
        },
        priority: filteringData.count > 40 ? "high" : "medium",
        category: "prose",
      });
    }
  }

  // Backstory Balance
  if (principleId.includes("backstory")) {
    const backstoryData = analysis.backstoryDensity;

    if (backstoryData && backstoryData.percentage > 30) {
      suggestions.push({
        area: "Backstory Integration",
        currentIssue: `${backstoryData.percentage.toFixed(
          0
        )}% backstory - too much exposition slows forward momentum.`,
        suggestedFix:
          "Weave backstory into active scenes through dialogue, internal thought during action, and brief flashbacks.",
        example: {
          before:
            "Ten years ago, Sarah had lived in Paris where she studied art and fell in love with Jean-Pierre.",
          after:
            '"Paris," she whispered. Jean-Pierre\'s studio. The smell of oil paint. She shook her head, forcing herself back to the present.',
        },
        priority: backstoryData.percentage > 40 ? "high" : "medium",
        category: "pacing",
      });
    }
  }

  return suggestions;
}

/**
 * Generate category-specific improvement plans
 */
export function generateImprovementPlan(suggestions: ImprovementSuggestion[]): {
  immediateActions: ImprovementSuggestion[];
  shortTerm: ImprovementSuggestion[];
  longTerm: ImprovementSuggestion[];
  focusAreas: string[];
} {
  const critical = suggestions.filter((s) => s.priority === "critical");
  const high = suggestions.filter((s) => s.priority === "high");
  const medium = suggestions.filter((s) => s.priority === "medium");
  const low = suggestions.filter((s) => s.priority === "low");

  // Group by category to identify focus areas
  const categoryCount = new Map<string, number>();
  suggestions.forEach((s) => {
    categoryCount.set(s.category, (categoryCount.get(s.category) || 0) + 1);
  });

  const focusAreas = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  return {
    immediateActions: [...critical, ...high.slice(0, 2)],
    shortTerm: [...high.slice(2), ...medium.slice(0, 3)],
    longTerm: [...medium.slice(3), ...low],
    focusAreas,
  };
}

/**
 * Export improvement suggestions to markdown
 */
export function exportSuggestionsToMarkdown(
  suggestions: ImprovementSuggestion[]
): string {
  const plan = generateImprovementPlan(suggestions);

  let md = `# Manuscript Improvement Plan\n\n`;
  md += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  md += `---\n\n`;

  md += `## Focus Areas\n\n`;
  plan.focusAreas.forEach((area) => {
    md += `- ${area.charAt(0).toUpperCase() + area.slice(1)}\n`;
  });
  md += `\n`;

  if (plan.immediateActions.length > 0) {
    md += `## 🔴 Immediate Actions\n\n`;
    md += `Address these critical issues first:\n\n`;

    plan.immediateActions.forEach((suggestion, index) => {
      md += `### ${index + 1}. ${suggestion.area}\n\n`;
      md += `**Issue:** ${suggestion.currentIssue}\n\n`;
      md += `**Fix:** ${suggestion.suggestedFix}\n\n`;
      md += `**Example:**\n`;
      md += `\`\`\`\n❌ Before:\n${suggestion.example.before}\n\n`;
      md += `✅ After:\n${suggestion.example.after}\n\`\`\`\n\n`;
    });
  }

  if (plan.shortTerm.length > 0) {
    md += `## 🟡 Short-Term Improvements\n\n`;
    md += `Work on these over the next revision pass:\n\n`;

    plan.shortTerm.forEach((suggestion, index) => {
      md += `### ${index + 1}. ${suggestion.area}\n\n`;
      md += `**Issue:** ${suggestion.currentIssue}\n\n`;
      md += `**Fix:** ${suggestion.suggestedFix}\n\n`;
      md += `**Example:**\n`;
      md += `\`\`\`\n❌ ${suggestion.example.before}\n`;
      md += `✅ ${suggestion.example.after}\n\`\`\`\n\n`;
    });
  }

  if (plan.longTerm.length > 0) {
    md += `## 🟢 Long-Term Polish\n\n`;
    md += `Fine-tuning for later drafts:\n\n`;

    plan.longTerm.forEach((suggestion, index) => {
      md += `- **${suggestion.area}:** ${suggestion.suggestedFix}\n`;
    });
  }

  md += `\n---\n\n`;
  md += `*Generated by QuillPilot Improvement Engine*\n`;

  return md;
}
