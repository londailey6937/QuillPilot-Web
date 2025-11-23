/**
 * Dual Coding Analyzer
 * Identifies locations in text where visual aids (images, diagrams) should be added
 */

export interface VisualSuggestion {
  position: number;
  paragraph: string;
  reason: string;
  visualType: string; // "diagram", "chart", "graph", "illustration", "concept-map"
  priority: "high" | "medium" | "low";
  context: string; // Surrounding text for context
}

export interface DualCodingAnalyzerOptions {
  treatAsHtml?: boolean;
}

export class DualCodingAnalyzer {
  /**
   * Strip HTML tags from text for analysis
   */
  private static stripHtml(html: string): string {
    // Check if content appears to be HTML
    if (!html.includes("<")) {
      return html;
    }

    // Use regex to strip HTML tags instead of DOM parsing to avoid warnings
    // This is safer and doesn't trigger HTML parsing warnings
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags and content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove style tags and content
      .replace(/<[^>]+>/g, "") // Remove all other HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .trim();
  }

  /**
   * Count existing images in content
   */
  static countExistingImages(text: string): number {
    // Count <img tags for HTML content
    const imgMatches = text.match(/<img[^>]*>/gi);
    return imgMatches ? imgMatches.length : 0;
  }

  /**
   * Analyze a single paragraph for visual suggestions
   */
  static analyzeParagraph(
    text: string,
    position: number,
    prevPara: string = "",
    nextPara: string = ""
  ): VisualSuggestion[] {
    const suggestions: VisualSuggestion[] = [];
    const trimmedPara = text.trim();

    // Skip very short paragraphs
    if (trimmedPara.length < 50) return suggestions;

    // Debug: log first few paragraphs to see what we're analyzing
    if (position < 5) {
      console.log(
        `[DualCoding] Analyzing paragraph ${position}, length: ${trimmedPara.length}`
      );
      console.log(`[DualCoding] Preview:`, trimmedPara.substring(0, 100));
    }

    // Pattern 1: Descriptive spatial/structural language
    const spatialPatterns = [
      /\b(above|below|beneath|adjacent|parallel|perpendicular|horizontal|vertical|diagonal)\b/gi,
      /\b(left|right|top|bottom|center|middle|side|corner)\b/gi,
      /\b(structure|shape|form|arrangement|configuration|layout|position)\b/gi,
      /\b(connected|attached|linked|joined|bonded|between)\b/gi,
    ];

    const spatialMatches = spatialPatterns.reduce(
      (sum, pattern) => sum + (trimmedPara.match(pattern) || []).length,
      0
    );

    if (position < 5 && spatialMatches > 0) {
      console.log(
        `[DualCoding] Para ${position}: ${spatialMatches} spatial matches`
      );
    }

    if (spatialMatches >= 2 && trimmedPara.length > 80) {
      if (position < 10)
        console.log(
          `[DualCoding] Para ${position}: Adding spatial suggestion!`
        );
      suggestions.push({
        position: position,
        paragraph: trimmedPara.substring(0, 150) + "...",
        reason: "Contains spatial/structural descriptions",
        visualType: "diagram",
        priority: spatialMatches >= 4 ? "high" : "medium",
        context: this.getContext(prevPara, trimmedPara, nextPara),
      });
    }

    // Pattern 2: Process or sequence descriptions
    const processPatterns = [
      /\b(first|second|third|next|then|finally|subsequently|afterward)\b/gi,
      /\b(step|stage|phase|process|procedure|sequence|cycle)\b/gi,
      /\b(begins|starts|initiates|leads to|results in|produces|forms)\b/gi,
    ];

    const processMatches = processPatterns.reduce(
      (sum, pattern) => sum + (trimmedPara.match(pattern) || []).length,
      0
    );

    if (processMatches >= 2 && trimmedPara.length > 80) {
      suggestions.push({
        position: position,
        paragraph: trimmedPara.substring(0, 150) + "...",
        reason: "Describes a process or sequence",
        visualType: "flowchart",
        priority: processMatches >= 4 ? "high" : "medium",
        context: this.getContext(prevPara, trimmedPara, nextPara),
      });
    }

    // Pattern 3: Quantitative data or comparisons
    const quantitativePatterns = [
      /\b\d+(\.\d+)?\s*(percent|%|times|fold|ratio|proportion)\b/gi,
      /\b(increase|decrease|higher|lower|greater|less|more|fewer)\b/gi,
      /\b(compare|comparison|versus|vs\.|contrast|difference|similar)\b/gi,
      /\b(data|values|measurements|results|statistics)\b/gi,
    ];

    const quantMatches = quantitativePatterns.reduce(
      (sum, pattern) => sum + (trimmedPara.match(pattern) || []).length,
      0
    );

    if (quantMatches >= 2 && trimmedPara.length > 60) {
      suggestions.push({
        position: position,
        paragraph: trimmedPara.substring(0, 150) + "...",
        reason: "Contains quantitative data or comparisons",
        visualType: "graph",
        priority: quantMatches >= 4 ? "high" : "medium",
        context: this.getContext(prevPara, trimmedPara, nextPara),
      });
    }

    // Pattern 4: Abstract concept definitions
    const conceptPatterns = [
      /\b(concept|theory|principle|law|hypothesis|model)\b/gi,
      /\b(relationship|interaction|correlation|connection)\b/gi,
      /\b(defined as|refers to|means|represents|symbolizes)\b/gi,
      /\b(consists of|composed of|made up of|includes)\b/gi,
    ];

    const conceptMatches = conceptPatterns.reduce(
      (sum, pattern) => sum + (trimmedPara.match(pattern) || []).length,
      0
    );

    if (
      conceptMatches >= 2 &&
      trimmedPara.length > 100
      // Note: hasNearbyVisual check removed for single paragraph analysis as it requires full text context
    ) {
      suggestions.push({
        position: position,
        paragraph: trimmedPara.substring(0, 150) + "...",
        reason: "Explains abstract concepts",
        visualType: "concept-map",
        priority: "medium",
        context: this.getContext(prevPara, trimmedPara, nextPara),
      });
    }

    // Pattern 5: Complex terminology dense paragraphs
    const technicalDensity = this.calculateTechnicalDensity(trimmedPara);
    if (
      technicalDensity > 0.12 &&
      trimmedPara.length > 120
      // Note: hasNearbyVisual check removed for single paragraph analysis
    ) {
      suggestions.push({
        position: position,
        paragraph: trimmedPara.substring(0, 150) + "...",
        reason: "High density of technical terms",
        visualType: "illustration",
        priority: technicalDensity > 0.2 ? "high" : "medium",
        context: this.getContext(prevPara, trimmedPara, nextPara),
      });
    }

    // Pattern 6: System or component descriptions
    const systemPatterns = [
      /\b(system|component|part|element|unit|module)\b/gi,
      /\b(contains|comprises|consists of|includes)\b/gi,
      /\b(function|role|purpose|operates|works)\b/gi,
    ];

    const systemMatches = systemPatterns.reduce(
      (sum, pattern) => sum + (trimmedPara.match(pattern) || []).length,
      0
    );

    if (systemMatches >= 3 && trimmedPara.length > 100) {
      suggestions.push({
        position: position,
        paragraph: trimmedPara.substring(0, 150) + "...",
        reason: "Describes system or components",
        visualType: "diagram",
        priority: "medium",
        context: this.getContext(prevPara, trimmedPara, nextPara),
      });
    }

    return suggestions;
  }

  /**
   * Analyze text and identify where visual aids should be inserted
   * Works with both plain text and HTML - positions returned are for the original input
   */
  static analyzeForVisuals(
    text: string,
    options?: DualCodingAnalyzerOptions
  ): VisualSuggestion[] {
    const suggestions: VisualSuggestion[] = [];

    // Safety check for very large documents
    let textToAnalyze = text;
    if (text.length > 500000) {
      console.warn(
        "[DualCodingAnalyzer] Text too large, analyzing first 500k chars only."
      );
      textToAnalyze = text.substring(0, 500000);
    }

    // Check if input is HTML by looking for common HTML paragraph/block tags
    const inferredHtml =
      textToAnalyze.includes("<p>") ||
      textToAnalyze.includes("<div>") ||
      textToAnalyze.includes("<h1>");
    const isHtml =
      typeof options?.treatAsHtml === "boolean"
        ? options.treatAsHtml
        : inferredHtml;

    console.log(
      "[DualCodingAnalyzer] isHtml:",
      isHtml,
      "text length:",
      textToAnalyze.length
    );

    let paragraphs: { text: string; position: number }[] = [];

    if (isHtml) {
      // Parse HTML and extract paragraphs with their positions
      // Match opening tags for block elements like <p>, <h1>, <h2>, etc.
      const blockElementRegex = /<(p|h[1-6]|div|li|td|th)[^>]*>/gi;
      let match;
      let lastIndex = 0;

      while ((match = blockElementRegex.exec(textToAnalyze)) !== null) {
        const startPos = match.index + match[0].length; // Position after opening tag
        const tagName = match[1];

        // Find the closing tag
        const closingTagRegex = new RegExp(`</${tagName}>`, "i");
        const closeMatch = closingTagRegex.exec(
          textToAnalyze.substring(startPos)
        );

        if (closeMatch) {
          const endPos = startPos + closeMatch.index;
          const content = textToAnalyze.substring(startPos, endPos);
          const plainContent = this.stripHtml(content).trim();

          if (plainContent.length > 50) {
            // Only include substantial paragraphs
            paragraphs.push({
              text: plainContent,
              position: match.index, // Position of the opening tag
            });
          }
        }
      }

      console.log(
        "[DualCodingAnalyzer] Extracted",
        paragraphs.length,
        "HTML paragraphs"
      );
    } else {
      // Plain text: split by double newlines
      const plainParagraphs = textToAnalyze.split(/\n\n+/);
      let currentPosition = 0;

      console.log("[DualCodingAnalyzer] Plain text mode");
      console.log("  Total paragraphs from split:", plainParagraphs.length);
      console.log("  Text preview:", textToAnalyze.substring(0, 300));

      plainParagraphs.forEach((para) => {
        const trimmed = para.trim();
        if (trimmed.length > 50) {
          paragraphs.push({
            text: trimmed,
            position: currentPosition,
          });
        }
        currentPosition += para.length + 2; // +2 for the \n\n
      });

      console.log(
        "[DualCodingAnalyzer] Extracted",
        paragraphs.length,
        "plain text paragraphs"
      );
    }

    paragraphs.forEach((para, index) => {
      const trimmedPara = para.text;
      const currentPosition = para.position;

      const nextPara = paragraphs[index + 1]?.text || "";
      const prevPara = paragraphs[index - 1]?.text || "";

      // Check for nearby visuals before analyzing
      if (this.hasNearbyVisual(textToAnalyze, currentPosition)) {
        return;
      }

      const paraSuggestions = this.analyzeParagraph(
        trimmedPara,
        currentPosition,
        prevPara,
        nextPara
      );
      suggestions.push(...paraSuggestions);
    });

    // Remove duplicates (same position) and sort by priority
    const uniqueSuggestions = this.deduplicateAndSort(suggestions);
    return uniqueSuggestions;
  }

  /**
   * Check if there's already a visual reference nearby (within 500 characters)
   */
  private static hasNearbyVisual(text: string, position: number): boolean {
    const searchRange = 500;
    const start = Math.max(0, position - searchRange);
    const end = Math.min(text.length, position + searchRange);
    const nearbyText = text.substring(start, end);

    const visualPatterns = [
      /\bfigure\s+\d+/i,
      /\bdiagram\s+\d+/i,
      /\bchart\s+\d+/i,
      /\bgraph\s+\d+/i,
      /\bimage\s+\d+/i,
      /\bfig\.\s*\d+/i,
    ];

    return visualPatterns.some((pattern) => pattern.test(nearbyText));
  }

  /**
   * Calculate density of technical/complex terms
   */
  private static calculateTechnicalDensity(text: string): number {
    const words = text.split(/\s+/);
    const technicalWords = words.filter((word) => {
      // Technical indicators: long words, capital letters, hyphens, parentheses
      return (
        word.length > 10 ||
        /[A-Z]{2,}/.test(word) ||
        word.includes("-") ||
        /\([^)]+\)/.test(word)
      );
    });

    return technicalWords.length / words.length;
  }

  /**
   * Get surrounding context for a paragraph
   */
  private static getContext(
    prevPara: string,
    currentPara: string,
    nextPara: string
  ): string {
    const prev = prevPara ? prevPara.substring(0, 100) + "..." : "";
    const current = currentPara.substring(0, 150) + "...";
    const next = nextPara ? "..." + nextPara.substring(0, 100) : "";

    return [prev, current, next].filter(Boolean).join(" ");
  }

  /**
   * Remove duplicate suggestions at same position and sort by priority
   */
  private static deduplicateAndSort(
    suggestions: VisualSuggestion[]
  ): VisualSuggestion[] {
    const positionMap = new Map<number, VisualSuggestion>();

    // Keep highest priority suggestion for each position
    suggestions.forEach((suggestion) => {
      const existing = positionMap.get(suggestion.position);
      if (!existing || this.comparePriority(suggestion, existing) > 0) {
        positionMap.set(suggestion.position, suggestion);
      }
    });

    // Sort by priority (high > medium > low) then by position
    return Array.from(positionMap.values()).sort((a, b) => {
      const priorityDiff =
        this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
      return priorityDiff !== 0 ? priorityDiff : a.position - b.position;
    });
  }

  private static comparePriority(
    a: VisualSuggestion,
    b: VisualSuggestion
  ): number {
    return (
      this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority)
    );
  }

  private static getPriorityValue(priority: string): number {
    switch (priority) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 0;
    }
  }
}
