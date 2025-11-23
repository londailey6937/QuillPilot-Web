/**
 * PatternRecognizer - Detects learning patterns in educational content
 *
 * Identifies common pedagogical structures like worked examples, practice problems,
 * definitions with examples, formulas, procedures, and comparisons.
 *
 * Works across concept-heavy disciplines (STEM, Finance, Medicine, CS)
 */

import type {
  PatternMatch,
  PatternType,
  PatternAnalysis,
  Chapter,
} from "../../types";
import { ChemistryPatterns } from "./ChemistryPatterns";

export class PatternRecognizer {
  /**
   * Analyze chapter text for learning patterns
   */
  static analyzePatterns(chapter: Chapter, domain?: string): PatternAnalysis {
    const text = chapter.content;
    const patterns: PatternMatch[] = [];

    // Detect general patterns
    patterns.push(...this.detectWorkedExamples(text));
    patterns.push(...this.detectPracticeProblems(text));
    patterns.push(...this.detectDefinitionExamples(text));
    patterns.push(...this.detectFormulas(text));
    patterns.push(...this.detectProcedures(text));
    patterns.push(...this.detectComparisons(text));

    // Add domain-specific patterns
    if (domain === "chemistry") {
      patterns.push(...ChemistryPatterns.detectAll(text));
    }
    // Future: Add other domains (finance, biology, CS, etc.)

    // Sort by position
    patterns.sort((a, b) => a.startPosition - b.startPosition);

    // Calculate pattern counts by type
    const patternCounts: Record<PatternType, number> = {
      workedExample: 0,
      practiceProblem: 0,
      definitionExample: 0,
      formula: 0,
      procedure: 0,
      comparison: 0,
    };

    patterns.forEach((p) => patternCounts[p.type]++);

    // Calculate coverage (% of chapter with patterns)
    const patternCharCount = patterns.reduce(
      (sum, p) => sum + (p.endPosition - p.startPosition),
      0
    );
    const coverage = text.length > 0 ? patternCharCount / text.length : 0;

    // Distribution across sections
    const distribution = chapter.sections.map((section) => {
      const hasBounds =
        typeof section.startPosition === "number" &&
        typeof section.endPosition === "number" &&
        section.startPosition <= section.endPosition;

      return {
        sectionId: section.id,
        patternCount: hasBounds
          ? patterns.filter(
              (p) =>
                p.startPosition >= (section.startPosition as number) &&
                p.endPosition <= (section.endPosition as number)
            ).length
          : 0,
      };
    });

    return {
      totalPatterns: patterns.length,
      patternCounts,
      patterns,
      coverage,
      distribution,
    };
  }

  /**
   * Detect worked examples: Problem → Solution sequences with step-by-step explanations
   */
  private static detectWorkedExamples(text: string): PatternMatch[] {
    const patterns: PatternMatch[] = [];

    // Pattern indicators for worked examples
    const exampleMarkers = [
      /\bexample\s+\d+\.?\d*\s*:?/gi,
      /\bsample\s+problem\s*:?/gi,
      /\blet'?s\s+(solve|calculate|find|determine)\b/gi,
      /\bsolution\s*:?\s*\n/gi,
      /\bconsider\s+the\s+(following|problem)\b/gi,
      /\bworked\s+example\b/gi,
    ];

    // Step indicators (shows it's a walkthrough)
    const stepIndicators = [
      /\bstep\s+\d+/gi,
      /\bfirst[,\s]/gi,
      /\bthen[,\s]/gi,
      /\bnext[,\s]/gi,
      /\bfinally[,\s]/gi,
      /\d+\.\s+[A-Z]/g, // Numbered steps
    ];

    exampleMarkers.forEach((marker) => {
      let match;
      const regex = new RegExp(marker);

      while ((match = regex.exec(text)) !== null) {
        const startPos = match.index;

        // Look ahead to find the extent of the example (up to 2000 chars)
        const lookAhead = text.substring(startPos, startPos + 2000);

        // Count step indicators in the lookahead
        let stepCount = 0;
        stepIndicators.forEach((stepPattern) => {
          const steps = lookAhead.match(new RegExp(stepPattern)) || [];
          stepCount += steps.length;
        });

        // If we have multiple steps, it's likely a worked example
        if (stepCount >= 2) {
          // Find reasonable end point (next heading, double newline, or end of steps)
          const endMatch = lookAhead.search(
            /\n\n[A-Z]|^\d+\.\d+\s+[A-Z]|^#{1,3}\s+/m
          );
          const endPos =
            startPos +
            (endMatch > 0 ? endMatch : Math.min(1500, lookAhead.length));

          const context = text.substring(
            startPos,
            Math.min(startPos + 200, endPos)
          );

          patterns.push({
            type: "workedExample",
            confidence: Math.min(0.6 + stepCount * 0.1, 0.95),
            startPosition: startPos,
            endPosition: endPos,
            context: context.trim(),
            title: match[0].trim(),
            metadata: {
              steps: stepCount,
              difficulty: this.estimateDifficulty(lookAhead),
            },
          });
        }
      }
    });

    return patterns;
  }

  /**
   * Detect practice problems: Exercises for students to solve independently
   */
  private static detectPracticeProblems(text: string): PatternMatch[] {
    const patterns: PatternMatch[] = [];

    const problemMarkers = [
      /\b(exercise|exercises)\s*\d*\s*:?/gi,
      /\bproblem\s+set\b/gi,
      /\bpractice\s+(problems?|questions?)\b/gi,
      /\btry\s+(this|these|it)\s*:?/gi,
      /\byour\s+turn\s*:?/gi,
      /\bproblem\s+\d+\.?\d*\s*:?/gi,
      /\bcalculate\s*:?\s*$/gim, // Calculate: at end of line
      /\bdetermine\s*:?\s*$/gim,
      /\bfind\s*:?\s*$/gim,
    ];

    problemMarkers.forEach((marker) => {
      let match;
      const regex = new RegExp(marker);

      while ((match = regex.exec(text)) !== null) {
        const startPos = match.index;
        const lookAhead = text.substring(startPos, startPos + 1000);

        // Check if there's an answer provided (reduces confidence)
        const hasAnswer =
          /\banswer\s*:?/gi.test(lookAhead) ||
          /\bsolution\s*:?/gi.test(lookAhead);

        // Find problem extent
        const endMatch = lookAhead.search(/\n\n|\n[A-Z][a-z]+\s+\d+/);
        const endPos =
          startPos +
          (endMatch > 0 ? endMatch : Math.min(800, lookAhead.length));

        const context = text.substring(
          startPos,
          Math.min(startPos + 200, endPos)
        );

        // Higher confidence if no answer provided (it's truly practice)
        const confidence = hasAnswer ? 0.5 : 0.8;

        patterns.push({
          type: "practiceProblem",
          confidence,
          startPosition: startPos,
          endPosition: endPos,
          context: context.trim(),
          title: match[0].trim(),
          metadata: {
            hasAnswer,
            difficulty: this.estimateDifficulty(lookAhead),
          },
        });
      }
    });

    return patterns;
  }

  /**
   * Detect definition-example pairs: Concept defined followed by concrete example
   */
  private static detectDefinitionExamples(text: string): PatternMatch[] {
    const patterns: PatternMatch[] = [];

    // Definition markers followed by example markers
    const defExamplePatterns = [
      /\b(is defined as|refers to|means|is called)\b[^.]+\.\s*For (example|instance)/gi,
      /\b(definition|define)\s*:?[^.]+\.\s*(e\.g\.|for example|such as)/gi,
      /\b[A-Z][a-z]+\s+(is|are)\s+[^.]+\.\s*For (example|instance)/gi,
    ];

    defExamplePatterns.forEach((pattern) => {
      let match;
      const regex = new RegExp(pattern);

      while ((match = regex.exec(text)) !== null) {
        const startPos = match.index;
        const lookAhead = text.substring(startPos, startPos + 800);

        const endMatch = lookAhead.search(/\n\n|^\d+\.\d+\s+/m);
        const endPos =
          startPos +
          (endMatch > 0 ? endMatch : Math.min(600, lookAhead.length));

        const context = this.extractSentenceContext(text, startPos, endPos);

        patterns.push({
          type: "definitionExample",
          confidence: 0.85,
          startPosition: startPos,
          endPosition: endPos,
          context,
        });
      }
    });

    return patterns;
  }

  private static extractSentenceContext(
    text: string,
    matchStart: number,
    matchEnd: number,
    minSentences = 2,
    maxChars = 500
  ): string {
    const windowStart = Math.max(0, matchStart - 200);
    const windowEnd = Math.min(text.length, matchEnd + 400);
    const maxWindowEnd = Math.min(windowEnd, windowStart + maxChars);

    const sentences: Array<{ start: number; end: number }> = [];
    let sentenceStart = windowStart;

    for (let i = windowStart; i < maxWindowEnd; i++) {
      const char = text[i];
      if (char === "." || char === "!" || char === "?") {
        sentences.push({ start: sentenceStart, end: i + 1 });
        sentenceStart = i + 1;
      }
    }

    if (sentenceStart < maxWindowEnd) {
      sentences.push({ start: sentenceStart, end: maxWindowEnd });
    }

    if (sentences.length === 0) {
      const fallback = text.slice(windowStart, maxWindowEnd).trim();
      return this.ensureLeadingCapital(fallback);
    }

    const containingIndex = sentences.findIndex(
      (segment) => matchStart >= segment.start && matchStart < segment.end
    );

    const startIndex = containingIndex !== -1 ? containingIndex : 0;
    let endIndex = startIndex;
    let totalChars = sentences[endIndex].end - sentences[endIndex].start;
    let sentencesIncluded = 1;

    while (
      (sentencesIncluded < minSentences || totalChars < 200) &&
      endIndex + 1 < sentences.length
    ) {
      endIndex += 1;
      totalChars += sentences[endIndex].end - sentences[endIndex].start;
      sentencesIncluded += 1;
      if (totalChars >= maxChars) {
        break;
      }
    }

    const snippet = sentences
      .slice(startIndex, endIndex + 1)
      .map((segment) => text.slice(segment.start, segment.end))
      .join("")
      .trim();

    return this.ensureLeadingCapital(snippet);
  }

  private static ensureLeadingCapital(snippet: string): string {
    if (!snippet) {
      return snippet;
    }

    const match = snippet.match(/[a-zA-Z]/);
    if (!match || !match[0]) {
      return snippet;
    }

    const index = match.index ?? 0;
    const char = match[0];
    if (char === char.toUpperCase()) {
      return snippet;
    }

    return (
      snippet.slice(0, index) + char.toUpperCase() + snippet.slice(index + 1)
    );
  }

  /**
   * Detect formulas and equations: Mathematical relationships
   */
  private static detectFormulas(text: string): PatternMatch[] {
    const patterns: PatternMatch[] = [];

    // Look for equation-like structures
    const formulaPatterns = [
      /\b[A-Z]\s*=\s*[A-Z0-9\+\-\*\/\(\)\^]+/g, // E = mc^2 style
      /\b(equation|formula)\s*\d*\s*:?\s*[A-Z]/gi,
      /\b\w+\s*=\s*\d+\s*[\+\-\*\/×÷]\s*\d+/g, // numeric formulas
      /\b[a-z]\s*=\s*[a-z0-9\+\-\*\/\(\)]+\s*[a-z]/gi, // algebraic
    ];

    formulaPatterns.forEach((pattern) => {
      let match;
      const regex = new RegExp(pattern);

      while ((match = regex.exec(text)) !== null) {
        const startPos = match.index;
        const matchText = match[0];

        // Count variables in formula
        const variableCount = (matchText.match(/[A-Za-z]/g) || []).length;

        // Skip if it's likely just prose (too many variables)
        if (variableCount > 10) continue;

        const lookAhead = text.substring(startPos, startPos + 500);
        const endPos = startPos + matchText.length;

        const context = text.substring(
          Math.max(0, startPos - 50),
          Math.min(text.length, endPos + 150)
        );

        patterns.push({
          type: "formula",
          confidence: 0.75,
          startPosition: startPos,
          endPosition: endPos,
          context: context.trim(),
          metadata: {
            variableCount,
          },
        });
      }
    });

    return patterns;
  }

  /**
   * Detect procedures and algorithms: Step-by-step methods
   */
  private static detectProcedures(text: string): PatternMatch[] {
    const patterns: PatternMatch[] = [];

    // Procedure indicators
    const procedureMarkers = [
      /\b(procedure|algorithm|method|process)\s+for\b/gi,
      /\bsteps?\s+to\s+(calculate|determine|find|solve)/gi,
      /\bhow\s+to\s+[a-z\s]{5,30}\s*:/gi,
    ];

    // Sequential step patterns
    const stepPattern = /^\s*\d+\.\s+[A-Z]/gm;

    procedureMarkers.forEach((marker) => {
      let match;
      const regex = new RegExp(marker);

      while ((match = regex.exec(text)) !== null) {
        const startPos = match.index;
        const lookAhead = text.substring(startPos, startPos + 1500);

        // Count numbered steps
        const steps = lookAhead.match(stepPattern) || [];
        const stepCount = steps.length;

        if (stepCount >= 2) {
          // Find end of procedure
          const endMatch = lookAhead.search(/\n\n[A-Z]|^\d+\.\d+\s+/m);
          const endPos =
            startPos +
            (endMatch > 0 ? endMatch : Math.min(1200, lookAhead.length));

          const context = text.substring(
            startPos,
            Math.min(startPos + 250, endPos)
          );

          patterns.push({
            type: "procedure",
            confidence: 0.85,
            startPosition: startPos,
            endPosition: endPos,
            context: context.trim(),
            title: match[0].trim(),
            metadata: {
              steps: stepCount,
            },
          });
        }
      }
    });

    return patterns;
  }

  /**
   * Detect comparison patterns: Side-by-side analysis of concepts
   */
  private static detectComparisons(text: string): PatternMatch[] {
    const patterns: PatternMatch[] = [];

    const comparisonMarkers = [
      /\b(compare|comparison)\s+(of|between)\b/gi,
      /\b(unlike|whereas|in contrast to|however|but)\b.*\b(while|though)\b/gi,
      /\b(difference|differences)\s+between\b/gi,
      /\b(similarly|likewise|in the same way)\b/gi,
      /\b[A-Z][a-z]+\s+vs\.?\s+[A-Z][a-z]+/g,
    ];

    comparisonMarkers.forEach((marker) => {
      let match;
      const regex = new RegExp(marker);

      while ((match = regex.exec(text)) !== null) {
        const startPos = match.index;
        const lookAhead = text.substring(startPos, startPos + 800);

        const endMatch = lookAhead.search(/\n\n|^\d+\.\d+\s+/m);
        const endPos =
          startPos +
          (endMatch > 0 ? endMatch : Math.min(600, lookAhead.length));

        const context = text.substring(
          startPos,
          Math.min(startPos + 300, endPos)
        );

        // Try to extract what's being compared
        const comparisonItems = this.extractComparisonItems(context);

        patterns.push({
          type: "comparison",
          confidence: 0.75,
          startPosition: startPos,
          endPosition: endPos,
          context: context.trim(),
          metadata: {
            comparisonItems,
          },
        });
      }
    });

    return patterns;
  }

  /**
   * Helper: Estimate difficulty based on content
   */
  private static estimateDifficulty(text: string): "easy" | "medium" | "hard" {
    // Count complexity indicators
    let complexity = 0;

    // Long equations/formulas
    if ((text.match(/[=\+\-\*\/\(\)]{5,}/g) || []).length > 3) complexity++;

    // Multiple steps
    if ((text.match(/\bstep\s+\d+/gi) || []).length > 5) complexity++;

    // Technical terms (capitalized or complex words)
    if ((text.match(/[A-Z][a-z]{8,}/g) || []).length > 10) complexity++;

    // Greek letters or special symbols
    if (/[αβγδεζηθλμπρσφψω∑∏∫]/i.test(text)) complexity++;

    if (complexity >= 3) return "hard";
    if (complexity >= 1) return "medium";
    return "easy";
  }

  /**
   * Helper: Extract items being compared
   */
  private static extractComparisonItems(text: string): string[] {
    const items: string[] = [];

    // Look for "X vs Y" or "X and Y" patterns
    const vsMatch = text.match(/([A-Z][a-z]+)\s+vs\.?\s+([A-Z][a-z]+)/);
    if (vsMatch) {
      items.push(vsMatch[1], vsMatch[2]);
    }

    // Look for "between X and Y"
    const betweenMatch = text.match(
      /between\s+([A-Z][a-z]+)\s+and\s+([A-Z][a-z]+)/
    );
    if (betweenMatch) {
      items.push(betweenMatch[1], betweenMatch[2]);
    }

    return items;
  }
}
