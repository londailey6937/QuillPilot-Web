/**
 * Screenplay Analyzer
 * Analyzes screenplay documents for industry-standard metrics
 */

export interface ScreenplayScene {
  type: "INT" | "EXT" | "INT/EXT" | "EST" | "OTHER";
  location: string;
  timeOfDay: string;
  pageNumber: number;
  lineNumber: number;
  heading: string;
}

export interface ScreenplayCharacter {
  name: string;
  dialogueCount: number;
  dialogueWordCount: number;
  firstAppearance: number;
  scenes: number[];
}

export interface ScreenplayMetrics {
  // Structure
  totalScenes: number;
  scenes: ScreenplayScene[];
  pageCount: number;
  averageSceneLength: number;

  // Location breakdown
  interiorScenes: number;
  exteriorScenes: number;

  // Time of day
  dayScenes: number;
  nightScenes: number;

  // Dialogue
  totalDialogueBlocks: number;
  totalActionBlocks: number;
  dialogueToActionRatio: number;
  averageDialogueLength: number;

  // Characters
  characters: Map<string, ScreenplayCharacter>;
  speakingCharacterCount: number;

  // Transitions
  transitionCount: number;

  // Formatting
  parentheticalCount: number;
  averageActionBlockLength: number;

  // Page distribution
  act1EndPage: number;
  act2EndPage: number;
  act3EndPage: number;

  // Issues
  longActionBlocks: number;
  formattingIssues: string[];
}

/**
 * Extract screenplay blocks from HTML content
 */
function extractScreenplayBlocks(
  html: string
): Array<{ type: string; text: string; lineNumber: number }> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks: Array<{ type: string; text: string; lineNumber: number }> = [];

  const screenplayElements = doc.querySelectorAll(".screenplay-block");
  screenplayElements.forEach((element, index) => {
    const classList = Array.from(element.classList);
    const type = classList.find((c) => c !== "screenplay-block") || "action";
    const text = element.textContent?.trim() || "";

    if (text) {
      blocks.push({ type, text, lineNumber: index + 1 });
    }
  });

  return blocks;
}

/**
 * Parse scene heading
 */
function parseSceneHeading(heading: string): {
  type: string;
  location: string;
  timeOfDay: string;
} {
  const upperHeading = heading.toUpperCase();

  // Determine scene type
  let type = "OTHER";
  if (upperHeading.startsWith("INT.") || upperHeading.startsWith("INT ")) {
    type = "INT";
  } else if (
    upperHeading.startsWith("EXT.") ||
    upperHeading.startsWith("EXT ")
  ) {
    type = "EXT";
  } else if (
    upperHeading.startsWith("INT/EXT") ||
    upperHeading.startsWith("INT./EXT")
  ) {
    type = "INT/EXT";
  } else if (
    upperHeading.startsWith("EST.") ||
    upperHeading.startsWith("EST ")
  ) {
    type = "EST";
  }

  // Extract time of day
  let timeOfDay = "UNSPECIFIED";
  if (upperHeading.includes("DAY")) timeOfDay = "DAY";
  else if (upperHeading.includes("NIGHT")) timeOfDay = "NIGHT";
  else if (upperHeading.includes("MORNING")) timeOfDay = "MORNING";
  else if (upperHeading.includes("EVENING")) timeOfDay = "EVENING";
  else if (upperHeading.includes("DUSK")) timeOfDay = "DUSK";
  else if (upperHeading.includes("DAWN")) timeOfDay = "DAWN";
  else if (upperHeading.includes("CONTINUOUS")) timeOfDay = "CONTINUOUS";
  else if (upperHeading.includes("LATER")) timeOfDay = "LATER";
  else if (upperHeading.includes("SAME")) timeOfDay = "SAME";

  // Extract location (text between type and time)
  let location = heading;
  if (type !== "OTHER") {
    location = heading.substring(type.length).trim();
    if (location.startsWith(".")) location = location.substring(1).trim();

    // Remove time of day from location
    const timeWords = [
      "DAY",
      "NIGHT",
      "MORNING",
      "EVENING",
      "DUSK",
      "DAWN",
      "CONTINUOUS",
      "LATER",
      "SAME",
    ];
    for (const timeWord of timeWords) {
      const regex = new RegExp(`\\s*-\\s*${timeWord}\\s*$`, "i");
      location = location.replace(regex, "");
    }
  }

  return { type, location: location.trim(), timeOfDay };
}

/**
 * Analyze screenplay content
 */
export function analyzeScreenplay(
  html: string,
  plainText: string
): ScreenplayMetrics {
  const blocks = extractScreenplayBlocks(html);
  const scenes: ScreenplayScene[] = [];
  const characters = new Map<string, ScreenplayCharacter>();
  const formattingIssues: string[] = [];

  let currentSceneIndex = -1;
  let totalDialogueBlocks = 0;
  let totalActionBlocks = 0;
  let totalDialogueWords = 0;
  let transitionCount = 0;
  let parentheticalCount = 0;
  let longActionBlocks = 0;
  let actionBlockLengths: number[] = [];

  // Rough page count estimation (1 page ≈ 55 lines or 3300 characters)
  const estimatedPages = Math.max(
    Math.round(blocks.length / 55),
    Math.round(plainText.length / 3300)
  );

  blocks.forEach((block, index) => {
    switch (block.type) {
      case "scene-heading":
        const parsed = parseSceneHeading(block.text);
        currentSceneIndex = scenes.length;
        scenes.push({
          type: parsed.type as any,
          location: parsed.location,
          timeOfDay: parsed.timeOfDay,
          pageNumber: Math.round((index / blocks.length) * estimatedPages),
          lineNumber: block.lineNumber,
          heading: block.text,
        });
        break;

      case "character":
        const charName = block.text.replace(/\(.*?\)/g, "").trim();
        if (!characters.has(charName)) {
          characters.set(charName, {
            name: charName,
            dialogueCount: 0,
            dialogueWordCount: 0,
            firstAppearance: block.lineNumber,
            scenes: [],
          });
        }

        const char = characters.get(charName)!;
        char.dialogueCount++;
        if (
          currentSceneIndex >= 0 &&
          !char.scenes.includes(currentSceneIndex)
        ) {
          char.scenes.push(currentSceneIndex);
        }
        break;

      case "dialogue":
        totalDialogueBlocks++;
        const wordCount = block.text.split(/\s+/).length;
        totalDialogueWords += wordCount;

        // Attribute to most recent character
        const lastChar = Array.from(characters.values()).pop();
        if (lastChar) {
          lastChar.dialogueWordCount += wordCount;
        }
        break;

      case "action":
        totalActionBlocks++;
        const lines = block.text.split("\n").length;
        actionBlockLengths.push(lines);

        // Flag long action blocks (>4 lines is harder to read)
        if (lines > 4) {
          longActionBlocks++;
        }
        break;

      case "parenthetical":
        parentheticalCount++;
        break;

      case "transition":
        transitionCount++;
        break;
    }
  });

  // Calculate metrics
  const interiorScenes = scenes.filter((s) => s.type === "INT").length;
  const exteriorScenes = scenes.filter((s) => s.type === "EXT").length;
  const dayScenes = scenes.filter((s) => s.timeOfDay === "DAY").length;
  const nightScenes = scenes.filter((s) => s.timeOfDay === "NIGHT").length;

  const totalScenes = scenes.length;
  const averageSceneLength = totalScenes > 0 ? blocks.length / totalScenes : 0;
  const dialogueToActionRatio =
    totalActionBlocks > 0 ? totalDialogueBlocks / totalActionBlocks : 0;
  const averageDialogueLength =
    totalDialogueBlocks > 0 ? totalDialogueWords / totalDialogueBlocks : 0;
  const averageActionBlockLength =
    actionBlockLengths.length > 0
      ? actionBlockLengths.reduce((a, b) => a + b, 0) /
        actionBlockLengths.length
      : 0;

  // Act structure (rough estimates based on page count)
  const act1EndPage = Math.round(estimatedPages * 0.25); // End of Act 1 around page 25-30
  const act2EndPage = Math.round(estimatedPages * 0.75); // End of Act 2 around page 75-90
  const act3EndPage = estimatedPages; // End of Act 3 is the end

  // Formatting validation
  if (estimatedPages < 90) {
    formattingIssues.push(
      `Script is short (${estimatedPages} pages). Industry standard is 90-120 pages.`
    );
  } else if (estimatedPages > 120) {
    formattingIssues.push(
      `Script is long (${estimatedPages} pages). Industry standard is 90-120 pages.`
    );
  }

  if (totalScenes < 30) {
    formattingIssues.push(
      `Low scene count (${totalScenes}). Most feature scripts have 40-60 scenes.`
    );
  } else if (totalScenes > 80) {
    formattingIssues.push(
      `High scene count (${totalScenes}). Scenes may be too short. Consider combining.`
    );
  }

  if (dialogueToActionRatio > 2) {
    formattingIssues.push(
      "Dialogue-heavy script. Consider adding more visual action."
    );
  } else if (dialogueToActionRatio < 0.5) {
    formattingIssues.push(
      "Action-heavy script. May need more dialogue for character development."
    );
  }

  if (longActionBlocks > totalActionBlocks * 0.2) {
    formattingIssues.push(
      `${longActionBlocks} action blocks exceed 4 lines. Break into smaller paragraphs for readability.`
    );
  }

  // Check character balance
  const sortedChars = Array.from(characters.values()).sort(
    (a, b) => b.dialogueWordCount - a.dialogueWordCount
  );
  if (
    sortedChars.length > 1 &&
    sortedChars[0].dialogueWordCount > totalDialogueWords * 0.4
  ) {
    formattingIssues.push(
      `Character "${sortedChars[0].name}" dominates dialogue (${Math.round(
        (sortedChars[0].dialogueWordCount / totalDialogueWords) * 100
      )}%). Consider balancing.`
    );
  }

  return {
    totalScenes,
    scenes,
    pageCount: estimatedPages,
    averageSceneLength: Math.round(averageSceneLength * 10) / 10,
    interiorScenes,
    exteriorScenes,
    dayScenes,
    nightScenes,
    totalDialogueBlocks,
    totalActionBlocks,
    dialogueToActionRatio: Math.round(dialogueToActionRatio * 100) / 100,
    averageDialogueLength: Math.round(averageDialogueLength * 10) / 10,
    characters,
    speakingCharacterCount: characters.size,
    transitionCount,
    parentheticalCount,
    averageActionBlockLength: Math.round(averageActionBlockLength * 10) / 10,
    act1EndPage,
    act2EndPage,
    act3EndPage,
    longActionBlocks,
    formattingIssues,
  };
}

/**
 * Generate analysis summary text
 */
export function generateScreenplaySummary(metrics: ScreenplayMetrics): string {
  const lines: string[] = [];

  lines.push("# Screenplay Analysis\n");

  // Structure
  lines.push("## Structure & Pacing");
  lines.push(`- **Total Scenes:** ${metrics.totalScenes}`);
  lines.push(`- **Estimated Pages:** ${metrics.pageCount}`);
  lines.push(
    `- **Average Scene Length:** ${metrics.averageSceneLength} blocks`
  );
  lines.push(`- **Act 1:** Pages 1-${metrics.act1EndPage}`);
  lines.push(
    `- **Act 2:** Pages ${metrics.act1EndPage + 1}-${metrics.act2EndPage}`
  );
  lines.push(
    `- **Act 3:** Pages ${metrics.act2EndPage + 1}-${metrics.act3EndPage}\n`
  );

  // Location & Time
  lines.push("## Settings");
  lines.push(
    `- **Interior Scenes:** ${metrics.interiorScenes} (${Math.round(
      (metrics.interiorScenes / metrics.totalScenes) * 100
    )}%)`
  );
  lines.push(
    `- **Exterior Scenes:** ${metrics.exteriorScenes} (${Math.round(
      (metrics.exteriorScenes / metrics.totalScenes) * 100
    )}%)`
  );
  lines.push(`- **Day Scenes:** ${metrics.dayScenes}`);
  lines.push(`- **Night Scenes:** ${metrics.nightScenes}\n`);

  // Dialogue
  lines.push("## Dialogue");
  lines.push(`- **Dialogue Blocks:** ${metrics.totalDialogueBlocks}`);
  lines.push(`- **Action Blocks:** ${metrics.totalActionBlocks}`);
  lines.push(`- **Dialogue/Action Ratio:** ${metrics.dialogueToActionRatio}:1`);
  lines.push(
    `- **Average Dialogue Length:** ${metrics.averageDialogueLength} words`
  );
  lines.push(`- **Parentheticals:** ${metrics.parentheticalCount}\n`);

  // Characters
  lines.push("## Characters");
  lines.push(`- **Speaking Characters:** ${metrics.speakingCharacterCount}`);

  const topCharacters = Array.from(metrics.characters.values())
    .sort((a, b) => b.dialogueWordCount - a.dialogueWordCount)
    .slice(0, 5);

  if (topCharacters.length > 0) {
    lines.push("\n**Top Speaking Characters:**");
    topCharacters.forEach((char, i) => {
      const percentage = Math.round(
        (char.dialogueWordCount / metrics.totalDialogueBlocks) * 100
      );
      lines.push(
        `${i + 1}. ${char.name}: ${char.dialogueCount} dialogue blocks, ${
          char.dialogueWordCount
        } words (${percentage}%)`
      );
    });
  }
  lines.push("");

  // Technical
  lines.push("## Technical Elements");
  lines.push(`- **Transitions:** ${metrics.transitionCount}`);
  lines.push(
    `- **Average Action Block Length:** ${metrics.averageActionBlockLength} lines`
  );
  lines.push(
    `- **Long Action Blocks (>4 lines):** ${metrics.longActionBlocks}\n`
  );

  // Issues
  if (metrics.formattingIssues.length > 0) {
    lines.push("## Recommendations");
    metrics.formattingIssues.forEach((issue) => {
      lines.push(`- ${issue}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}
