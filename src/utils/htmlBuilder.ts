import { ChapterAnalysis, Recommendation } from "@/types";
import {
  analyzeParagraphSpacing,
  extractParagraphs,
  ParagraphSummary,
} from "@/utils/spacingInsights";
import {
  DualCodingAnalyzer,
  VisualSuggestion,
} from "@/utils/dualCodingAnalyzer";
import templateHtml from "@/templates/exportTemplate.html?raw";

interface HtmlBuildOptions {
  text: string;
  html?: string | null;
  fileName?: string;
  analysis?: ChapterAnalysis | null;
  includeHighlights?: boolean;
}

/**
 * Build complete HTML document using template
 * This is used by both HTML and DOCX exports for consistency
 */
export function buildHtmlFromTemplate({
  text,
  html,
  fileName = "edited-chapter",
  analysis,
  includeHighlights = true,
}: HtmlBuildOptions): string {
  const documentTitle = sanitizeHtml(
    fileName.replace(/\.[^/.]+$/, "") || "Edited Chapter"
  );

  let contentHtml = "";

  // Add analysis summary if available
  if (analysis && includeHighlights) {
    contentHtml += buildAnalysisSummaryHtml(analysis);
    contentHtml += '<hr class="content-divider">';
    contentHtml += "<h1>Edited Chapter Text</h1>";
  }

  // Build main content
  const trimmedText = text?.trim() ?? "";
  if (includeHighlights && trimmedText) {
    contentHtml += buildDocumentWithHighlights(trimmedText, html);
  } else if (html?.trim()) {
    contentHtml += sanitizeAndWrapHtml(html);
  } else {
    contentHtml += `<div class="chapter-content">${sanitizeAndWrapHtml(
      trimmedText
    )}</div>`;
  }

  // Apply template
  const finalHtml = templateHtml
    .replace("{{DOCUMENT_TITLE}}", documentTitle)
    .replace("{{CONTENT}}", contentHtml);

  return finalHtml;
}

/**
 * Build just the content HTML without template wrapper
 * Useful when you need the body content only
 */
export function buildContentHtml({
  text,
  html,
  analysis,
  includeHighlights = true,
}: Omit<HtmlBuildOptions, "fileName">): string {
  let contentHtml = "";

  // Add analysis summary if available
  if (analysis && includeHighlights) {
    contentHtml += buildAnalysisSummaryHtml(analysis);
    contentHtml += '<hr class="content-divider">';
    contentHtml += "<h1>Edited Chapter Text</h1>";
  }

  // Build main content
  const trimmedText = text?.trim() ?? "";
  if (includeHighlights && trimmedText) {
    contentHtml += buildDocumentWithHighlights(trimmedText, html);
  } else if (html?.trim()) {
    contentHtml += sanitizeAndWrapHtml(html);
  } else {
    contentHtml += `<div class="chapter-content">${sanitizeAndWrapHtml(
      trimmedText
    )}</div>`;
  }

  return contentHtml;
}

/**
 * Build analysis summary HTML section
 */
function buildAnalysisSummaryHtml(analysis: ChapterAnalysis): string {
  let html = '<div class="analysis-summary">';
  html += "<h2>Analysis Summary</h2>";
  html += `<div class="score-display">Overall Score: ${Math.round(
    analysis.overallScore
  )}/100</div>`;

  // Get principle evaluations
  const principles = analysis.principles || [];
  const spacingPrinciple = principles.find(
    (p) => p.principle === "spacedRepetition"
  );
  const dualCodingPrinciple = principles.find(
    (p) => p.principle === "dualCoding"
  );

  // Spacing Analysis
  if (spacingPrinciple) {
    html += buildPrincipleHtml(spacingPrinciple, "Spacing Analysis");
  }

  // Dual Coding Analysis
  if (dualCodingPrinciple) {
    html += buildPrincipleHtml(dualCodingPrinciple, "Dual Coding Analysis");
  }

  // High priority recommendations
  const highPriorityRecs = analysis.recommendations
    ?.filter((rec: Recommendation) => rec.priority === "high")
    .slice(0, 3);

  if (highPriorityRecs && highPriorityRecs.length > 0) {
    html += '<div class="recommendations-section">';
    html += "<h3>Key Recommendations</h3>";
    highPriorityRecs.forEach((rec: Recommendation) => {
      html += `<div class="recommendation high">`;
      html += `<div class="recommendation-title">${sanitizeHtml(
        rec.title
      )}</div>`;
      html += `<div class="recommendation-description">${sanitizeHtml(
        rec.description || ""
      )}</div>`;
      html += "</div>";
    });
    html += "</div>";
  }

  html += "</div>";
  return html;
}

/**
 * Build individual principle section (simplified summary only)
 */
function buildPrincipleHtml(principle: any, title: string): string {
  const score = Math.round(Number(principle.score));
  const scoreClass = score >= 80 ? "high" : score >= 50 ? "medium" : "low";

  let html = '<div class="principle-section">';
  html += '<div class="principle-header">';
  html += `<div class="principle-title">${sanitizeHtml(title)}</div>`;
  html += `<div class="principle-score ${scoreClass}">${score}/100</div>`;
  html += "</div>";

  // Just show a brief summary instead of all details
  let summaryText = "";
  if (score >= 80) {
    summaryText =
      "Strong application of this principle. See highlighted sections below for details.";
  } else if (score >= 50) {
    summaryText =
      "Moderate application. Review highlighted sections below for improvement opportunities.";
  } else {
    summaryText =
      "Significant opportunities for improvement. See highlighted sections below for specific suggestions.";
  }

  html += `<p class="principle-summary">${sanitizeHtml(summaryText)}</p>`;
  html += "</div>";
  return html;
}

/**
 * Build document content with spacing and dual-coding highlights
 * Preserves images from original HTML while adding analysis indicators
 */
function buildDocumentWithHighlights(
  text: string,
  html?: string | null
): string {
  const paragraphs = extractParagraphs(text);
  if (!paragraphs.length) {
    return sanitizeAndWrapHtml(html || text);
  }

  const visualSource = html?.trim()?.length ? html : text;
  const visualSuggestions = visualSource
    ? DualCodingAnalyzer.analyzeForVisuals(visualSource)
    : [];

  const suggestionMap = new Map<number, VisualSuggestion[]>();
  visualSuggestions.forEach((suggestion) => {
    const target =
      paragraphs.find(
        (p) =>
          suggestion.position >= p.startIndex &&
          suggestion.position <= p.endIndex
      ) || paragraphs[paragraphs.length - 1];

    if (target) {
      const bucket = suggestionMap.get(target.id) || [];
      bucket.push(suggestion);
      suggestionMap.set(target.id, bucket);
    }
  });

  let contentHtml = '<div class="chapter-content">';

  // If we have HTML with images, parse and enhance it
  if (html?.trim()?.length && html.includes("<img")) {
    contentHtml += buildHighlightsWithImages(html, paragraphs, suggestionMap);
  } else {
    // Plain text or HTML without images - use existing logic
    paragraphs.forEach((paragraph, index) => {
      // Spacing indicator
      if (index > 0) {
        const spacingInfo = analyzeParagraphSpacing(paragraph.wordCount);
        const toneClass =
          spacingInfo.tone === "compact"
            ? "compact"
            : spacingInfo.tone === "extended"
            ? "extended"
            : "";

        contentHtml += `<div class="spacing-indicator ${toneClass}">`;
        contentHtml += `<div class="spacing-label">Spacing Target · Paragraph ${
          paragraph.id + 1
        } · ${paragraph.wordCount} words · ${spacingInfo.shortLabel}</div>`;
        contentHtml += `<div class="spacing-message">${sanitizeHtml(
          spacingInfo.message
        )}</div>`;
        contentHtml += "</div>";
      }

      // Paragraph text
      contentHtml += `<p>${sanitizeHtml(paragraph.text)}</p>`;

      // Dual coding callouts
      const suggestions = suggestionMap.get(paragraph.id) || [];
      suggestions.forEach((suggestion) => {
        contentHtml += buildDualCodingCalloutHtml(suggestion);
      });
    });
  }

  contentHtml += "</div>";
  return contentHtml;
}

/**
 * Parse HTML and inject analysis indicators while preserving images
 */
function buildHighlightsWithImages(
  html: string,
  paragraphs: ParagraphSummary[],
  suggestionMap: Map<number, VisualSuggestion[]>
): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    // Server-side fallback
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  let resultHtml = "";
  let paragraphIndex = 0;

  // Process each child node in the body
  Array.from(doc.body.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tag = element.tagName.toLowerCase();

      // Preserve images (check both standalone and nested)
      if (tag === "img") {
        resultHtml += element.outerHTML;
        return;
      }

      // Check if element contains images - preserve full element if so
      const hasNestedImages = element.querySelector("img") !== null;
      if (hasNestedImages) {
        resultHtml += element.outerHTML;
        return;
      }

      // Skip image placeholder paragraphs (they're for editor display only)
      const isImagePlaceholder =
        element.classList.contains("image-placeholder") ||
        element.textContent?.includes("[📸 Image");
      if (isImagePlaceholder) {
        return; // Don't include placeholders in export
      }

      // For paragraph-like elements without images, add spacing indicators
      if (tag === "p" || tag === "div") {
        const textContent = element.textContent?.trim() || "";
        if (textContent.length > 0 && paragraphIndex > 0) {
          const paragraph = paragraphs[paragraphIndex];
          if (paragraph) {
            const spacingInfo = analyzeParagraphSpacing(paragraph.wordCount);
            const toneClass =
              spacingInfo.tone === "compact"
                ? "compact"
                : spacingInfo.tone === "extended"
                ? "extended"
                : "";

            resultHtml += `<div class="spacing-indicator ${toneClass}">`;
            resultHtml += `<div class="spacing-label">Spacing Target · Paragraph ${
              paragraph.id + 1
            } · ${paragraph.wordCount} words · ${spacingInfo.shortLabel}</div>`;
            resultHtml += `<div class="spacing-message">${sanitizeHtml(
              spacingInfo.message
            )}</div>`;
            resultHtml += "</div>";
          }
        }

        // Add the paragraph
        resultHtml += element.outerHTML;

        // Add dual coding callouts
        if (textContent.length > 0) {
          const paragraph = paragraphs[paragraphIndex];
          if (paragraph) {
            const suggestions = suggestionMap.get(paragraph.id) || [];
            suggestions.forEach((suggestion) => {
              resultHtml += buildDualCodingCalloutHtml(suggestion);
            });
          }
          paragraphIndex++;
        }
        return;
      }

      // Preserve other elements as-is
      resultHtml += element.outerHTML;
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        resultHtml += `<p>${sanitizeHtml(text)}</p>`;
      }
    }
  });

  return resultHtml;
}

/**
 * Build dual coding callout HTML
 */
function buildDualCodingCalloutHtml(suggestion: VisualSuggestion): string {
  const icon = getVisualIcon(suggestion.visualType);
  const title = formatVisualSuggestionTitle(suggestion);
  const action = formatVisualAction(suggestion);

  let html = '<div class="dual-coding-callout">';
  html += '<div class="callout-header">';
  html += `<span class="callout-icon">${icon}</span>`;
  html += `<span class="callout-title">${sanitizeHtml(title)}</span>`;
  html += `<span class="callout-priority ${suggestion.priority}">${suggestion.priority}</span>`;
  html += "</div>";
  html += `<div class="callout-reason">${sanitizeHtml(
    suggestion.reason
  )}</div>`;
  html += `<div class="callout-context">${sanitizeHtml(
    suggestion.paragraph
  )}</div>`;
  html += `<div class="callout-action"><strong>Suggested action:</strong> ${sanitizeHtml(
    action
  )}</div>`;
  html += "</div>";

  return html;
}

/**
 * Helper functions
 */
const VISUAL_TYPE_ICON: Record<string, string> = {
  diagram: "📊",
  flowchart: "🧭",
  graph: "📈",
  illustration: "🎨",
  "concept-map": "🧠",
};

function getVisualIcon(type: string): string {
  return VISUAL_TYPE_ICON[type] || "✨";
}

function formatVisualSuggestionTitle(suggestion: VisualSuggestion): string {
  const typeLabel = suggestion.visualType
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const priorityLabel =
    suggestion.priority === "high"
      ? "High priority"
      : suggestion.priority === "medium"
      ? "Medium priority"
      : "Low priority";

  return `${typeLabel} - ${priorityLabel}`;
}

function formatVisualAction(suggestion: VisualSuggestion): string {
  switch (suggestion.visualType) {
    case "diagram":
      return "Create a diagram that maps the structure or spatial relationships described.";
    case "flowchart":
      return "Lay out the steps as a flowchart so learners can follow the process visually.";
    case "graph":
      return "Plot the data in a graph to expose the comparison or trend you mention.";
    case "concept-map":
      return "Draft a concept map linking the key ideas to show how they interrelate.";
    case "illustration":
      return "Provide a labeled illustration to anchor the dense terminology in a visual reference.";
    default:
      return "Add the recommended visual aid to reinforce this explanation.";
  }
}

export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeAndWrapHtml(content: string): string {
  // If content looks like HTML, use it as-is (already has tags)
  if (/<[^>]+>/.test(content)) {
    return content;
  }

  // Otherwise, wrap plain text in paragraphs
  return content
    .split(/\n\n+/)
    .map((para) => `<p>${sanitizeHtml(para.trim())}</p>`)
    .join("\n");
}
