/**
 * Screenplay Format Detector and Converter
 * Automatically detects screenplay documents and converts to industry standard format
 */

/**
 * Detect if text contains screenplay formatting indicators
 */
export function isScreenplay(text: string): boolean {
  const normalizedText = text.replace(/\r\n?/g, "\n");
  const upperText = normalizedText.toUpperCase();

  const screenplayIndicators = [
    /\bINT\.?\s+/,
    /\bEXT\.?\s+/,
    /\bEST\.?\s+/,
    /\bINT\.?\/?EXT\.?\s+/,
    /\bFADE IN:?/,
    /\bFADE OUT:?/,
    /\bCUT TO:?/,
    /\bDISSOLVE TO:?/,
    /\bSMASH CUT:?/,
    /\bMATCH CUT:?/,
    /\bCONTINUOUS\b/,
    /\bMONTAGE\b/,
    /\bSUPER:\b/,
    /\bTITLE:\b/,
    /\b\(V\.O\.\)/,
    /\b\(O\.S\.\)/,
    /(beat)/i,
    /(pause)/i,
  ];

  let indicatorCount = 0;
  for (const pattern of screenplayIndicators) {
    if (pattern.test(upperText)) {
      indicatorCount++;
    }
  }

  if (indicatorCount >= 2) {
    return true;
  }

  const sceneHeadingRegex = /^(INT|EXT|EST|INT\/EXT)[^\n]*$/gim;
  const sceneHeadings = normalizedText.match(sceneHeadingRegex);
  if (sceneHeadings && sceneHeadings.length >= 3) {
    return true;
  }

  const lines = normalizedText.split("\n");
  let capsLineCount = 0;
  let dialogueAfterCaps = 0;

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const nextLine = lines[i + 1].trim();

    if (
      line === line.toUpperCase() &&
      line.length > 0 &&
      line.length < 30 &&
      !line.startsWith("INT") &&
      !line.startsWith("EXT") &&
      !line.startsWith("FADE") &&
      !line.endsWith(":")
    ) {
      capsLineCount++;

      if (nextLine.length > 0 && nextLine !== nextLine.toUpperCase()) {
        dialogueAfterCaps++;
      }
    }
  }

  if (capsLineCount >= 3 && dialogueAfterCaps / (capsLineCount || 1) > 0.4) {
    return true;
  }

  return false;
}

type ScreenplayBlockType =
  | "scene-heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "spacer";

/**
 * Convert plain text screenplay to formatted HTML with screenplay blocks
 */
export function convertScreenplayToHtml(text: string): string {
  const normalizedText = text.replace(/\r\n?/g, "\n");
  const lines = normalizedText.split("\n");
  const blocks: { type: ScreenplayBlockType; html: string }[] = [];

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const makeBlock = (type: ScreenplayBlockType, content: string) =>
    `<p class="screenplay-block ${type}" data-block="${type}">${escapeHtml(
      content
    )}</p>`;

  const lastBlockType = (): ScreenplayBlockType | null => {
    for (let i = blocks.length - 1; i >= 0; i--) {
      if (blocks[i].type === "spacer") continue;
      return blocks[i].type;
    }
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const upperLine = trimmed.toUpperCase();

    if (!trimmed) {
      blocks.push({
        type: "spacer",
        html: '<p class="screenplay-block spacer" data-block="spacer"><br></p>',
      });
      continue;
    }

    if (
      upperLine.startsWith("INT") ||
      upperLine.startsWith("EXT") ||
      upperLine.startsWith("INT./EXT") ||
      upperLine.startsWith("INT/EXT") ||
      upperLine.startsWith("EST")
    ) {
      blocks.push({
        type: "scene-heading",
        html: makeBlock("scene-heading", trimmed),
      });
      continue;
    }

    if (
      upperLine === trimmed &&
      (upperLine.endsWith(":") ||
        upperLine.includes("CUT TO") ||
        upperLine.includes("FADE") ||
        upperLine.includes("DISSOLVE TO") ||
        upperLine.includes("SMASH CUT"))
    ) {
      blocks.push({
        type: "transition",
        html: makeBlock("transition", trimmed),
      });
      continue;
    }

    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      blocks.push({
        type: "parenthetical",
        html: makeBlock("parenthetical", trimmed),
      });
      continue;
    }

    if (
      upperLine === trimmed &&
      trimmed.length < 30 &&
      !trimmed.endsWith(":") &&
      !trimmed.includes("CUT TO") &&
      !trimmed.includes("FADE")
    ) {
      let isCharacterName = false;
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (!nextLine) continue;
        const nextUpper = nextLine.toUpperCase();
        if (
          nextLine !== nextUpper ||
          (nextLine.startsWith("(") && nextLine.endsWith(")"))
        ) {
          isCharacterName = true;
          break;
        }
        break;
      }

      if (isCharacterName) {
        blocks.push({
          type: "character",
          html: makeBlock("character", trimmed),
        });
        continue;
      }
    }

    const previousType = lastBlockType();
    if (
      previousType &&
      ["character", "parenthetical", "dialogue"].includes(previousType) &&
      upperLine !== trimmed
    ) {
      blocks.push({
        type: "dialogue",
        html: makeBlock("dialogue", trimmed),
      });
      continue;
    }

    blocks.push({ type: "action", html: makeBlock("action", trimmed) });
  }

  return blocks.map((blockEntry) => blockEntry.html).join("\n");
}

/**
 * Convert screenplay HTML back to industry-standard plain text format
 */
export function convertScreenplayToPlainText(html: string): string {
  const lines: string[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const elements = doc.body.querySelectorAll<HTMLElement>("[data-block]");

  elements.forEach((element) => {
    const blockType =
      (element.dataset.block as ScreenplayBlockType) || "action";
    const text = element.textContent?.trim() || "";

    switch (blockType) {
      case "scene-heading":
        lines.push("");
        lines.push(text.toUpperCase());
        lines.push("");
        break;
      case "action":
        lines.push(text);
        lines.push("");
        break;
      case "character":
        lines.push("");
        lines.push(" ".repeat(37) + text.toUpperCase());
        break;
      case "parenthetical":
        lines.push(" ".repeat(31) + text);
        break;
      case "dialogue":
        lines.push(" ".repeat(25) + text);
        break;
      case "transition":
        lines.push("");
        lines.push(" ".repeat(60) + text.toUpperCase());
        lines.push("");
        break;
      case "spacer":
        lines.push("");
        break;
      default:
        lines.push(text);
        lines.push("");
    }
  });

  return lines.join("\n");
}

/**
 * Process uploaded document - detect and convert screenplay if needed
 */
export function processScreenplayDocument(
  content: string,
  plainText: string,
  fileName: string
): { content: string; plainText: string; isScreenplay: boolean } {
  // Check if it's a screenplay
  const isScreenplayDoc = isScreenplay(plainText);

  if (!isScreenplayDoc) {
    return { content, plainText, isScreenplay: false };
  }

  console.log(`🎬 Screenplay detected: ${fileName}`);
  console.log("🔄 Converting to industry standard format...");

  // Convert to formatted HTML with screenplay tags
  const formattedHtml = convertScreenplayToHtml(plainText);

  // Also update plain text for consistent formatting
  const formattedPlainText = convertScreenplayToPlainText(formattedHtml);

  console.log("✅ Screenplay conversion complete");

  return {
    content: formattedHtml,
    plainText: formattedPlainText,
    isScreenplay: true,
  };
}
