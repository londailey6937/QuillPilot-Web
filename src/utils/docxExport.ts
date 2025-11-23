import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  ImageRun,
  ShadingType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { ChapterAnalysis, PrincipleEvaluation, Recommendation } from "@/types";
import {
  analyzeParagraphSpacing,
  extractParagraphs,
  ParagraphSpacingAssessment,
  ParagraphSummary,
  SpacingTone,
} from "@/utils/spacingInsights";
import {
  DualCodingAnalyzer,
  VisualSuggestion,
} from "@/utils/dualCodingAnalyzer";
import { buildContentHtml } from "./htmlBuilder";

interface ExportDocxOptions {
  text: string;
  html?: string | null;
  fileName?: string;
  analysis?: ChapterAnalysis | null;
  includeHighlights?: boolean;
}

export const exportToDocx = async ({
  text,
  html,
  fileName = "edited-chapter",
  analysis,
  includeHighlights = true,
}: ExportDocxOptions) => {
  // Build HTML content using shared builder for consistency
  const htmlContent = buildContentHtml({
    text,
    html,
    analysis,
    includeHighlights,
  });

  // Convert HTML to DOCX paragraphs
  const paragraphs: Paragraph[] = [];

  // Add title
  const safeTitle = sanitizeText(fileName.replace(/\.[^/.]+$/, ""));
  paragraphs.push(
    new Paragraph({
      text: safeTitle || "Edited Chapter",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Parse HTML and convert to paragraphs
  const htmlParagraphs = await convertHtmlToParagraphs(htmlContent);
  paragraphs.push(...htmlParagraphs);

  // Add analysis summary if available
  if (analysis && includeHighlights) {
    paragraphs.push(
      new Paragraph({
        text: sanitizeText("Analysis Summary"),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sanitizeText(
              `Overall Score: ${Math.round(analysis.overallScore)}/100`
            ),
            bold: true,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    // Add Spacing and Dual Coding principle details
    const principleScores = (analysis as any).principleScores || [];
    const principles = analysis.principles || [];
    const spacingEvaluation = principles.find(
      (p) => p.principle === "spacedRepetition"
    );
    const dualCodingEvaluation = principles.find(
      (p) => p.principle === "dualCoding"
    );

    const spacingPrinciple =
      principleScores.find(
        (p: any) =>
          p.principleId === "spacing" ||
          p.principle?.toLowerCase().includes("spacing")
      ) || principles.find((p) => p.principle === "spacedRepetition");
    const dualCodingPrinciple =
      principleScores.find(
        (p: any) =>
          p.principleId === "dualCoding" ||
          p.principle?.toLowerCase().includes("dual coding")
      ) || principles.find((p) => p.principle === "dualCoding");

    if (spacingPrinciple) {
      paragraphs.push(
        new Paragraph({
          text: sanitizeText("Spacing Analysis"),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sanitizeText(`Score: ${spacingPrinciple.score}/100`),
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      // Handle both PrincipleScore (details) and PrincipleEvaluation (findings) types
      const details =
        (spacingPrinciple as any).details ||
        (spacingPrinciple as any).findings?.map((f: any) => f.message) ||
        [];

      if (details.length > 0) {
        details.forEach((detail: string) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: sanitizeText(`• ${detail}`),
                }),
              ],
              spacing: { after: 80 },
            })
          );
        });
      }

      const suggestions = (spacingPrinciple as any).suggestions || [];

      if (suggestions.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sanitizeText("Suggestions:"),
                bold: true,
                italics: true,
              }),
            ],
            spacing: { before: 100, after: 80 },
          })
        );

        suggestions.forEach((suggestion: any) => {
          const suggestionText =
            typeof suggestion === "string"
              ? suggestion
              : suggestion.text || suggestion.message || "";
          if (suggestionText) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeText(`  → ${suggestionText}`),
                    color: "2563EB",
                  }),
                ],
                spacing: { after: 80 },
              })
            );
          }
        });
      }

      addContextSection(
        paragraphs,
        "Spacing context from original text",
        collectFindingContexts(spacingEvaluation),
        {
          fill: "DBEAFE",
          accent: "1D4ED8",
        }
      );
    }

    if (dualCodingPrinciple) {
      paragraphs.push(
        new Paragraph({
          text: sanitizeText("Dual Coding Analysis"),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sanitizeText(`Score: ${dualCodingPrinciple.score}/100`),
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      // Handle both PrincipleScore (details) and PrincipleEvaluation (findings) types
      const dcDetails =
        (dualCodingPrinciple as any).details ||
        (dualCodingPrinciple as any).findings?.map((f: any) => f.message) ||
        [];

      if (dcDetails.length > 0) {
        dcDetails.forEach((detail: string) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: sanitizeText(`• ${detail}`),
                }),
              ],
              spacing: { after: 80 },
            })
          );
        });
      }

      const dcSuggestions = (dualCodingPrinciple as any).suggestions || [];

      if (dcSuggestions.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sanitizeText("Suggestions:"),
                bold: true,
                italics: true,
              }),
            ],
            spacing: { before: 100, after: 80 },
          })
        );

        dcSuggestions.forEach((suggestion: any) => {
          const suggestionText =
            typeof suggestion === "string"
              ? suggestion
              : suggestion.text || suggestion.message || "";
          if (suggestionText) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeText(`  → ${suggestionText}`),
                    color: "2563EB",
                  }),
                ],
                spacing: { after: 80 },
              })
            );
          }
        });
      }

      addContextSection(
        paragraphs,
        "Dual-coding context from original text",
        collectFindingContexts(dualCodingEvaluation),
        {
          fill: "FEF9C3",
          accent: "92400E",
        }
      );
    }

    // Add high-priority recommendations
    const highPriorityRecs = analysis.recommendations
      ?.filter((rec: Recommendation) => rec.priority === "high")
      .slice(0, 3);

    if (highPriorityRecs && highPriorityRecs.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: sanitizeText("Key Recommendations:"),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      highPriorityRecs.forEach((rec: Recommendation) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sanitizeText(`• ${rec.title}: `),
                bold: true,
              }),
              new TextRun({ text: sanitizeText(rec.description || "") }),
            ],
            spacing: { after: 100 },
          })
        );
      });
    }

    paragraphs.push(
      new Paragraph({
        text: sanitizeText("─".repeat(50)),
        spacing: { before: 400, after: 400 },
      })
    );

    paragraphs.push(
      new Paragraph({
        text: sanitizeText("Edited Chapter Text"),
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      })
    );
  }

  const trimmedText = text?.trim() ?? "";

  // Note: The HTML content from htmlBuilder already includes analysis summary
  // and highlighting, so we don't need the old manual building logic anymore.
  // Just parse the generated HTML directly.
  // The htmlContent variable already contains everything from buildContentHtml()

  // Skip building paragraphs manually, use the HTML we already generated
  // (The convertHtmlToParagraphs call above already added them)

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  // Generate and download
  const blob = await Packager.toBlob(doc);
  const downloadName = normalizeDocxFileName(fileName);
  saveAs(blob, downloadName);
};

// For importing Packager
import { Packer as Packager } from "docx";

type FindingContext = {
  message: string;
  evidence: string;
};

function collectFindingContexts(
  evaluation?: PrincipleEvaluation | null
): FindingContext[] {
  if (!evaluation || !evaluation.findings?.length) {
    return [];
  }

  return evaluation.findings
    .map((finding) => {
      const evidence = normalizeEvidence(finding.evidence);
      if (!evidence) {
        return null;
      }

      return {
        message: finding.message || "Context",
        evidence,
      };
    })
    .filter(Boolean) as FindingContext[];
}

function normalizeEvidence(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return "";
}

function addContextSection(
  target: Paragraph[],
  title: string,
  contexts: FindingContext[],
  options: { fill: string; accent: string }
) {
  if (!contexts.length) {
    return;
  }

  target.push(
    new Paragraph({
      children: [
        new TextRun({
          text: sanitizeText(title),
          bold: true,
          color: options.accent,
        }),
      ],
      shading: {
        type: ShadingType.CLEAR,
        fill: options.fill,
        color: "auto",
      },
      spacing: { before: 160, after: 60 },
    })
  );

  contexts.slice(0, 4).forEach((context) => {
    target.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sanitizeText(context.message),
            bold: true,
            color: options.accent,
          }),
        ],
        spacing: { before: 40, after: 20 },
      })
    );

    target.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sanitizeText(context.evidence),
            italics: true,
            color: "111827",
          }),
        ],
        shading: {
          type: ShadingType.CLEAR,
          fill: options.fill,
          color: "auto",
        },
        spacing: { after: 100 },
        indent: { left: 400 },
      })
    );
  });
}

type DocumentViewOptions = {
  text: string;
  html?: string | null;
  includeSpacingOverlays?: boolean;
};

async function buildDocumentViewParagraphs({
  text,
  html,
  includeSpacingOverlays = false,
}: DocumentViewOptions): Promise<Paragraph[]> {
  const summaries = extractParagraphs(text);
  if (!summaries.length) {
    if (html?.trim()) {
      return convertHtmlToParagraphs(html.trim());
    }
    return buildPlainTextParagraphs(text, false);
  }

  const visualSource = html?.trim()?.length ? html : text;
  const visualSuggestions = visualSource
    ? DualCodingAnalyzer.analyzeForVisuals(visualSource)
    : [];
  const suggestionMap = mapSuggestionsToParagraphs(
    summaries,
    visualSuggestions
  );

  const paragraphs: Paragraph[] = [];
  summaries.forEach((summary) => {
    if (includeSpacingOverlays) {
      const spacingAssessment = analyzeParagraphSpacing(summary.wordCount);
      paragraphs.push(
        createSpacingIndicatorParagraph(summary, spacingAssessment)
      );
    }

    paragraphs.push(createTextParagraph(summary.text));

    const suggestions = suggestionMap.get(summary.id) || [];
    suggestions.forEach((suggestion) => {
      paragraphs.push(...buildDualCodingCalloutParagraphs(suggestion));
    });
  });

  return paragraphs;
}

function mapSuggestionsToParagraphs(
  paragraphs: ParagraphSummary[],
  suggestions: VisualSuggestion[]
): Map<number, VisualSuggestion[]> {
  const map = new Map<number, VisualSuggestion[]>();
  if (!paragraphs.length || !suggestions.length) {
    return map;
  }

  suggestions.forEach((suggestion) => {
    const target =
      paragraphs.find(
        (paragraph) =>
          suggestion.position >= paragraph.startIndex &&
          suggestion.position <= paragraph.endIndex
      ) || paragraphs[paragraphs.length - 1];

    if (!target) {
      return;
    }

    const bucket = map.get(target.id) || [];
    bucket.push(suggestion);
    map.set(target.id, bucket);
  });

  return map;
}

type SpacingPalette = {
  fill: string;
  text: string;
  accent: string;
};

function createSpacingIndicatorParagraph(
  summary: ParagraphSummary,
  assessment: ParagraphSpacingAssessment
): Paragraph {
  const palette = getSpacingPalette(assessment.tone);
  return new Paragraph({
    children: [
      new TextRun({
        text: `Spacing target · Paragraph ${summary.id + 1}`,
        bold: true,
        color: palette.text,
        size: 20,
      }),
      new TextRun({
        text: ` · ${summary.wordCount} words · ${assessment.shortLabel}`,
        color: palette.text,
        size: 20,
      }),
      new TextRun({ break: 1 }),
      new TextRun({
        text: assessment.message,
        italics: true,
        color: palette.accent,
        size: 18,
      }),
    ],
    shading: {
      type: ShadingType.CLEAR,
      fill: palette.fill,
      color: "auto",
    },
    spacing: { before: 160, after: 100 },
  });
}

function getSpacingPalette(tone: SpacingTone): SpacingPalette {
  switch (tone) {
    case "compact":
      return { fill: "D1FAE5", text: "065F46", accent: "047857" };
    case "extended":
      return { fill: "FEF3C7", text: "92400E", accent: "B45309" };
    default:
      return { fill: "DBEAFE", text: "1D4ED8", accent: "2563EB" };
  }
}

function buildDualCodingCalloutParagraphs(
  suggestion: VisualSuggestion
): Paragraph[] {
  const fill = "FEF9C3";
  const text = "92400E";
  const accent = "B45309";

  const header = new Paragraph({
    children: [
      new TextRun({
        text: formatVisualSuggestionTitle(suggestion),
        bold: true,
        color: text,
      }),
      new TextRun({
        text: ` · Priority: ${suggestion.priority.toUpperCase()}`,
        color: accent,
        italics: true,
        size: 20,
      }),
    ],
    shading: { type: ShadingType.CLEAR, fill, color: "auto" },
    spacing: { before: 160, after: 60 },
  });

  const body = new Paragraph({
    children: [
      new TextRun({ text: suggestion.reason, color: text, size: 20 }),
      new TextRun({ break: 1 }),
      new TextRun({
        text: suggestion.paragraph,
        color: text,
        size: 20,
      }),
      new TextRun({ break: 1 }),
      new TextRun({
        text: formatVisualActionDocx(suggestion),
        italics: true,
        color: accent,
        size: 18,
      }),
    ],
    shading: { type: ShadingType.CLEAR, fill, color: "auto" },
    spacing: { after: 120 },
  });

  return [header, body];
}

function formatVisualSuggestionTitle(suggestion: VisualSuggestion): string {
  const typeLabel = suggestion.visualType
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const priorityLabel =
    suggestion.priority === "high"
      ? "High Priority"
      : suggestion.priority === "medium"
      ? "Medium Priority"
      : "Low Priority";

  return `${typeLabel} - ${priorityLabel}`;
}

function formatVisualActionDocx(suggestion: VisualSuggestion): string {
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

function buildPlainTextParagraphs(
  text: string,
  includeHighlights: boolean
): Paragraph[] {
  const results: Paragraph[] = [];
  const textParagraphs = text.split(/\n\n+/);

  textParagraphs.forEach((para, index) => {
    const trimmedPara = para.trim();
    if (!trimmedPara) return;

    const nextPara = textParagraphs[index + 1]?.trim();
    const currentLength = trimmedPara.length;
    const needsMoreSpacing =
      nextPara &&
      ((currentLength > 500 && nextPara.length > 500) ||
        (currentLength < 100 && nextPara.length > 200) ||
        (/[.!?]$/.test(trimmedPara) && nextPara.match(/^[A-Z]/)));

    results.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sanitizeText(trimmedPara),
            size: 24,
          }),
        ],
        spacing: {
          after: needsMoreSpacing ? 400 : 200,
          line: 360,
        },
      })
    );

    if (needsMoreSpacing && includeHighlights) {
      results.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sanitizeText(
                "⚠️ Consider adding more spacing here (topic/section break detected)"
              ),
              color: "F59E0B",
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }
  });

  return results;
}

function createTextParagraph(text: string): Paragraph {
  const safeText = sanitizeText(text);
  if (!safeText) {
    return new Paragraph({ text: "", spacing: { after: 200, line: 360 } });
  }
  return new Paragraph({
    children: [
      new TextRun({
        text: safeText,
        size: 24,
      }),
    ],
    spacing: { after: 200, line: 360 },
  });
}

type HeadingLevelValue = (typeof HeadingLevel)[keyof typeof HeadingLevel];
type AlignmentTypeValue = (typeof AlignmentType)[keyof typeof AlignmentType];
type UnderlineTypeValue = (typeof UnderlineType)[keyof typeof UnderlineType];

type ParagraphBuildOptions = {
  heading?: HeadingLevelValue;
  spacing?: {
    before?: number;
    after?: number;
    line?: number;
  };
  alignment?: AlignmentTypeValue;
  indent?: { left?: number; hanging?: number };
};

type InlineStyleFlags = {
  bold?: boolean;
  italics?: boolean;
  underline?: UnderlineTypeValue;
  strike?: boolean;
  color?: string;
  font?: string;
  superScript?: boolean;
  subScript?: boolean;
};

async function convertHtmlToParagraphs(html: string): Promise<Paragraph[]> {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return buildPlainTextParagraphs(html, false);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const nodes = Array.from(doc.body.childNodes);
  const paragraphs: Paragraph[] = [];

  for (const node of nodes) {
    const converted = await convertNodeToParagraphs(node);
    paragraphs.push(...converted);
  }

  return paragraphs.length > 0
    ? paragraphs
    : buildPlainTextParagraphs(doc.body.textContent || "", false);
}

async function convertNodeToParagraphs(
  node: ChildNode,
  inheritedStyle: InlineStyleFlags = {}
): Promise<Paragraph[]> {
  if (node.nodeType === Node.TEXT_NODE) {
    const textRun = createTextRun(node.textContent || "", inheritedStyle);
    if (!textRun) {
      return [];
    }
    return [
      new Paragraph({
        children: [textRun],
        spacing: { after: 200, line: 360 },
      }),
    ];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const className = element.className || "";
  const combinedStyle = deriveStyleForElement(element, inheritedStyle);

  // Handle special CSS classes for styled sections
  if (className.includes("spacing-indicator")) {
    return convertSpacingIndicator(element);
  }

  if (className.includes("dual-coding-callout")) {
    return convertDualCodingCallout(element);
  }

  if (tag === "img") {
    const imageParagraph = await createImageParagraph(element);
    return imageParagraph ? [imageParagraph] : [];
  }

  if (tag === "br") {
    return [
      new Paragraph({
        children: [new TextRun({ text: "", break: 1 })],
        spacing: { after: 0 },
      }),
    ];
  }

  if (tag === "ul" || tag === "ol") {
    return convertListElementToParagraphs(element, tag === "ol", combinedStyle);
  }

  if (tag === "table") {
    return convertTableElementToParagraphs(element, combinedStyle);
  }

  const heading = headingTagToLevel(tag);
  const spacing = getSpacingForTag(tag);
  const paragraphOptions: ParagraphBuildOptions = {
    heading,
    spacing,
    alignment: inferParagraphAlignment(element),
    indent: tag === "blockquote" ? { left: 720 } : undefined,
  };

  if (heading || isBlockElement(tag) || tag === "blockquote") {
    return convertBlockElementToParagraphs(
      element,
      paragraphOptions,
      combinedStyle
    );
  }

  if (isInlineTag(tag)) {
    const runs = buildRunsFromInlineElement(element, combinedStyle);
    if (!runs.length) {
      return [];
    }
    return [
      new Paragraph({
        children: runs,
        spacing: { after: 200, line: 360 },
      }),
    ];
  }

  const fallback: Paragraph[] = [];
  for (const child of Array.from(element.childNodes)) {
    const nested = await convertNodeToParagraphs(child, combinedStyle);
    fallback.push(...nested);
  }
  return fallback;
}

async function convertBlockElementToParagraphs(
  element: HTMLElement,
  options: ParagraphBuildOptions = {},
  inheritedStyle: InlineStyleFlags = {}
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];
  let currentRuns: TextRun[] = [];

  const flushRuns = () => {
    if (!currentRuns.length) {
      return;
    }
    paragraphs.push(
      new Paragraph({
        children: currentRuns,
        spacing: options.spacing ?? { after: 200, line: 360 },
        heading: options.heading,
        alignment: options.alignment ?? inferParagraphAlignment(element),
        indent: options.indent,
      })
    );
    currentRuns = [];
  };

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const run = createTextRun(child.textContent || "", inheritedStyle);
      if (run) {
        currentRuns.push(run);
      }
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    const childElement = child as HTMLElement;
    const childTag = childElement.tagName.toLowerCase();
    const nextStyle = deriveStyleForElement(childElement, inheritedStyle);

    if (childTag === "br") {
      currentRuns.push(new TextRun({ text: "", break: 1 }));
      continue;
    }

    if (childTag === "img") {
      flushRuns();
      const imageParagraph = await createImageParagraph(childElement);
      if (imageParagraph) {
        paragraphs.push(imageParagraph);
      }
      continue;
    }

    if (isInlineTag(childTag)) {
      const inlineRuns = buildRunsFromInlineElement(childElement, nextStyle);
      currentRuns.push(...inlineRuns);
      continue;
    }

    flushRuns();
    const nested = await convertNodeToParagraphs(childElement, nextStyle);
    paragraphs.push(...nested);
  }

  flushRuns();

  if (!paragraphs.length) {
    const fallbackText = collapseWhitespace(element.textContent || "");
    const fallbackRun = createTextRun(fallbackText, inheritedStyle);
    if (fallbackRun) {
      paragraphs.push(
        new Paragraph({
          children: [fallbackRun],
          spacing: options.spacing ?? { after: 200, line: 360 },
          heading: options.heading,
          alignment: options.alignment ?? inferParagraphAlignment(element),
          indent: options.indent,
        })
      );
    }
  }

  return paragraphs;
}

async function convertListElementToParagraphs(
  element: HTMLElement,
  ordered: boolean,
  inheritedStyle: InlineStyleFlags
): Promise<Paragraph[]> {
  const items = Array.from(element.children).filter(
    (child) => child.tagName.toLowerCase() === "li"
  );
  const paragraphs: Paragraph[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const li = items[index] as HTMLElement;
    let contentRuns = extractListItemRuns(li, inheritedStyle);

    if (!contentRuns.length) {
      const fallback = collapseWhitespace(li.textContent || "");
      const fallbackRun = createTextRun(fallback, inheritedStyle);
      if (!fallbackRun) {
        continue;
      }
      contentRuns = [fallbackRun];
    }

    const prefix = ordered ? `${index + 1}. ` : "• ";
    const prefixRun = new TextRun({
      text: prefix,
      bold: ordered,
      size: 24,
    });

    paragraphs.push(
      new Paragraph({
        children: [prefixRun, ...contentRuns],
        spacing: { after: 120, line: 360 },
        indent: { left: 360 },
        alignment: inferParagraphAlignment(li),
      })
    );
  }

  return paragraphs;
}

async function convertTableElementToParagraphs(
  table: HTMLElement,
  inheritedStyle: InlineStyleFlags
): Promise<Paragraph[]> {
  const rows = Array.from(table.querySelectorAll("tr"));
  const paragraphs: Paragraph[] = [];

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll("th,td"));
    if (!cells.length) {
      return;
    }
    const rowText = cells
      .map((cell) => collapseWhitespace(cell.textContent || ""))
      .filter(Boolean)
      .join(" | ");
    if (!rowText) {
      return;
    }
    const run = createTextRun(rowText, inheritedStyle);
    if (run) {
      paragraphs.push(
        new Paragraph({
          children: [run],
          spacing: { after: 120, line: 360 },
          alignment: inferParagraphAlignment(row as HTMLElement),
        })
      );
    }
  });

  return paragraphs;
}

function extractListItemRuns(
  li: HTMLElement,
  inheritedStyle: InlineStyleFlags
): TextRun[] {
  const runs: TextRun[] = [];

  const visit = (node: ChildNode, style: InlineStyleFlags) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const run = createTextRun(node.textContent || "", style);
      if (run) {
        runs.push(run);
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const nextStyle = deriveStyleForElement(el, style);

    if (tag === "br") {
      runs.push(new TextRun({ text: "", break: 1 }));
      return;
    }

    if (tag === "img") {
      runs.push(
        new TextRun({
          text: "[image]",
          italics: true,
          size: 24,
        })
      );
      return;
    }

    if (isInlineTag(tag)) {
      Array.from(el.childNodes).forEach((child) => visit(child, nextStyle));
      return;
    }

    runs.push(new TextRun({ text: "", break: 1 }));
    Array.from(el.childNodes).forEach((child) => visit(child, nextStyle));
  };

  Array.from(li.childNodes).forEach((child) => visit(child, inheritedStyle));
  return runs;
}

function buildRunsFromInlineElement(
  element: HTMLElement,
  inheritedStyle: InlineStyleFlags
): TextRun[] {
  const runs: TextRun[] = [];
  const style = deriveStyleForElement(element, inheritedStyle);

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const run = createTextRun(child.textContent || "", style);
      if (run) {
        runs.push(run);
      }
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    const childElement = child as HTMLElement;
    const childTag = childElement.tagName.toLowerCase();

    if (childTag === "br") {
      runs.push(new TextRun({ text: "", break: 1 }));
      continue;
    }

    if (isInlineTag(childTag)) {
      runs.push(...buildRunsFromInlineElement(childElement, style));
      continue;
    }

    const fallback = collapseWhitespace(childElement.textContent || "");
    const fallbackRun = createTextRun(fallback, style);
    if (fallbackRun) {
      runs.push(fallbackRun);
    }
  }

  return runs;
}

function deriveStyleForElement(
  element: HTMLElement,
  base: InlineStyleFlags = {}
): InlineStyleFlags {
  const tag = element.tagName.toLowerCase();
  const next: InlineStyleFlags = { ...base };

  if (tag === "strong" || tag === "b") {
    next.bold = true;
  }
  if (tag === "em" || tag === "i") {
    next.italics = true;
  }
  if (tag === "u" || tag === "ins") {
    next.underline = UnderlineType.SINGLE;
  }
  if (tag === "del") {
    next.strike = true;
  }
  if (tag === "code" || tag === "pre") {
    next.font = "Courier New";
  }
  if (tag === "sup") {
    next.superScript = true;
    delete next.subScript;
  }
  if (tag === "sub") {
    next.subScript = true;
    delete next.superScript;
  }
  if (tag === "a") {
    next.underline = UnderlineType.SINGLE;
    next.color = next.color ?? "1155CC";
  }

  const styleAttr = element.getAttribute("style");
  if (styleAttr) {
    const declarations = parseStyleAttribute(styleAttr);
    const fontWeight = declarations["font-weight"];
    if (fontWeight) {
      const numericWeight = parseInt(fontWeight, 10);
      if (fontWeight.includes("bold") || numericWeight >= 600) {
        next.bold = true;
      }
    }

    const fontStyle = declarations["font-style"];
    if (fontStyle?.includes("italic")) {
      next.italics = true;
    }

    const textDecoration = declarations["text-decoration"];
    if (textDecoration) {
      if (textDecoration.includes("underline")) {
        next.underline = UnderlineType.SINGLE;
      }
      if (textDecoration.includes("line-through")) {
        next.strike = true;
      }
    }

    const color = declarations["color"];
    if (color) {
      const normalized = cssColorToHex(color);
      if (normalized) {
        next.color = normalized;
      }
    }
  }

  return next;
}

function parseStyleAttribute(value: string): Record<string, string> {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const [prop, val] = part.split(":");
      if (prop && val) {
        acc[prop.trim().toLowerCase()] = val.trim().toLowerCase();
      }
      return acc;
    }, {});
}

function cssColorToHex(value: string): string | undefined {
  const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return hex
        .split("")
        .map((c) => c + c)
        .join("")
        .toUpperCase();
    }
    return hex.toUpperCase();
  }

  const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch
      .slice(1, 4)
      .map((n) => Number.parseInt(n ?? "0", 10));
    return [r, g, b]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }
  return undefined;
}

function createTextRun(
  value: string,
  style: InlineStyleFlags = {}
): TextRun | null {
  if (!value) {
    return null;
  }
  const normalized = value.replace(/\s+/g, " ");
  if (!normalized.trim()) {
    return null;
  }
  const safeText = sanitizeText(normalized);
  if (!safeText) {
    return null;
  }
  return new TextRun({
    text: safeText,
    size: 24,
    bold: style.bold,
    italics: style.italics,
    underline: style.underline ? { type: style.underline } : undefined,
    strike: style.strike,
    color: style.color,
    font: style.font,
    superScript: style.superScript,
    subScript: style.subScript,
  });
}

function headingTagToLevel(tag: string): HeadingLevelValue | undefined {
  switch (tag) {
    case "h1":
      return HeadingLevel.HEADING_1;
    case "h2":
      return HeadingLevel.HEADING_2;
    case "h3":
      return HeadingLevel.HEADING_3;
    case "h4":
      return HeadingLevel.HEADING_4;
    case "h5":
      return HeadingLevel.HEADING_5;
    case "h6":
      return HeadingLevel.HEADING_6;
    default:
      return undefined;
  }
}

function inferParagraphAlignment(
  element?: HTMLElement | null
): AlignmentTypeValue | undefined {
  if (!element) {
    return undefined;
  }
  const alignAttr = element.getAttribute("align")?.toLowerCase();
  if (alignAttr) {
    if (alignAttr.includes("center")) return AlignmentType.CENTER;
    if (alignAttr.includes("right")) return AlignmentType.RIGHT;
    if (alignAttr.includes("justify")) return AlignmentType.JUSTIFIED;
  }
  const styleAttr = element.getAttribute("style")?.toLowerCase() ?? "";
  const match = styleAttr.match(/text-align\s*:\s*(left|right|center|justify)/);
  if (match) {
    const value = match[1];
    if (value === "center") return AlignmentType.CENTER;
    if (value === "right") return AlignmentType.RIGHT;
    if (value === "justify") return AlignmentType.JUSTIFIED;
    return AlignmentType.LEFT;
  }
  return undefined;
}

function getSpacingForTag(tag: string): { before?: number; after?: number } {
  switch (tag) {
    case "h1":
      return { before: 400, after: 240 };
    case "h2":
      return { before: 320, after: 160 };
    case "h3":
      return { before: 240, after: 120 };
    case "blockquote":
      return { before: 160, after: 160 };
    default:
      return { after: 200 };
  }
}

function isInlineTag(tag: string): boolean {
  return [
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "a",
    "code",
    "mark",
    "small",
    "sup",
    "sub",
    "del",
    "ins",
  ].includes(tag);
}

// eslint-disable-next-line no-control-regex -- strip non-printable control characters Word rejects
const CONTROL_CHAR_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function sanitizeText(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(CONTROL_CHAR_REGEX, "");
}

function collapseWhitespace(value: string): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/\r\n|\r/g, "\n")
    .split("\n")
    .map((segment) => segment.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((segment) => sanitizeText(segment))
    .join("\n");
}

function isBlockElement(tag: string): boolean {
  return (
    tag === "p" ||
    tag === "div" ||
    tag === "section" ||
    tag === "article" ||
    tag === "blockquote" ||
    tag === "header" ||
    tag === "footer" ||
    tag === "figure" ||
    tag === "h1" ||
    tag === "h2" ||
    tag === "h3" ||
    tag === "h4" ||
    tag === "h5" ||
    tag === "h6"
  );
}

/**
 * Convert spacing indicator to styled paragraph
 */
function convertSpacingIndicator(element: HTMLElement): Paragraph[] {
  const className = element.className || "";
  const isCompact = className.includes("compact");
  const isExtended = className.includes("extended");

  const labelElement = element.querySelector(".spacing-label");
  const messageElement = element.querySelector(".spacing-message");

  const labelText = labelElement?.textContent?.trim() || "";
  const messageText = messageElement?.textContent?.trim() || "";

  // Determine background color based on type
  let fillColor = "DBEAFE"; // Default blue
  let textColor = "1E40AF";

  if (isCompact) {
    fillColor = "FEF3C7"; // Orange/yellow
    textColor = "92400E";
  } else if (isExtended) {
    fillColor = "FEE2E2"; // Red
    textColor = "991B1B";
  }

  const paragraphs: Paragraph[] = [];

  // Add spacing indicator with colored background
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: labelText,
          bold: true,
          size: 22,
          color: textColor,
        }),
      ],
      spacing: { before: 240, after: 80 },
      shading: {
        type: ShadingType.CLEAR,
        fill: fillColor,
      },
      border: {
        left: {
          color: textColor,
          space: 1,
          style: "single",
          size: 24,
        },
      },
    })
  );

  if (messageText) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: messageText,
            size: 20,
            color: textColor,
          }),
        ],
        spacing: { after: 160 },
        shading: {
          type: ShadingType.CLEAR,
          fill: fillColor,
        },
        indent: { left: 240 },
      })
    );
  }

  return paragraphs;
}

/**
 * Convert dual-coding callout to styled paragraph
 */
function convertDualCodingCallout(element: HTMLElement): Paragraph[] {
  const iconElement = element.querySelector(".callout-icon");
  const titleElement = element.querySelector(".callout-title");
  const priorityElement = element.querySelector(".callout-priority");
  const reasonElement = element.querySelector(".callout-reason");
  const contextElement = element.querySelector(".callout-context");
  const actionElement = element.querySelector(".callout-action");

  const icon = iconElement?.textContent?.trim() || "💡";
  const title = titleElement?.textContent?.trim() || "";
  const priority = priorityElement?.textContent?.trim() || "";
  const reason = reasonElement?.textContent?.trim() || "";
  const context = contextElement?.textContent?.trim() || "";
  const action = actionElement?.textContent?.trim() || "";

  const paragraphs: Paragraph[] = [];

  // Yellow background for visual suggestion callout
  const fillColor = "FEF9C3";
  const borderColor = "F59E0B";
  const textColor = "92400E";

  // Header with icon and title
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${icon} ${title}`,
          bold: true,
          size: 24,
          color: textColor,
        }),
        new TextRun({
          text: ` [${priority}]`,
          bold: true,
          size: 20,
          color: priority.toLowerCase().includes("high")
            ? "DC2626"
            : priority.toLowerCase().includes("medium")
            ? "F59E0B"
            : "6B7280",
        }),
      ],
      spacing: { before: 240, after: 100 },
      shading: {
        type: ShadingType.CLEAR,
        fill: fillColor,
      },
      border: {
        left: {
          color: borderColor,
          space: 1,
          style: "single",
          size: 24,
        },
      },
    })
  );

  // Reason
  if (reason) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: reason,
            size: 20,
            color: textColor,
          }),
        ],
        spacing: { after: 100 },
        shading: {
          type: ShadingType.CLEAR,
          fill: fillColor,
        },
        indent: { left: 240 },
      })
    );
  }

  // Context excerpt
  if (context) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `"${context}"`,
            italics: true,
            size: 20,
            color: "78716C",
          }),
        ],
        spacing: { after: 100 },
        shading: {
          type: ShadingType.CLEAR,
          fill: fillColor,
        },
        indent: { left: 360 },
      })
    );
  }

  // Action
  if (action) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: action,
            bold: true,
            size: 20,
            color: "2563EB",
          }),
        ],
        spacing: { after: 200 },
        shading: {
          type: ShadingType.CLEAR,
          fill: fillColor,
        },
        indent: { left: 240 },
      })
    );
  }

  return paragraphs;
}

async function createImageParagraph(
  element: HTMLElement
): Promise<Paragraph | null> {
  const src = element.getAttribute("src");
  if (!src) {
    return null;
  }

  const payload = await loadImageData(src);
  if (!payload || payload.data.length === 0) {
    return null;
  }
  const { data, mimeType, byteSignature } = payload;

  const dimensions = await getImageDimensions(src);
  const widthAttribute = parseInt(element.getAttribute("width") || "", 10);
  const heightAttribute = parseInt(element.getAttribute("height") || "", 10);
  const maxWidth = 480;
  const maxHeight = 320;

  const inferredWidth = resolveDimension(
    Number.isNaN(widthAttribute) ? undefined : widthAttribute,
    dimensions?.width,
    maxWidth
  );
  const inferredHeight = resolveDimension(
    Number.isNaN(heightAttribute) ? undefined : heightAttribute,
    dimensions?.height,
    maxHeight
  );

  const aspectRatio =
    inferredWidth && inferredHeight
      ? inferredWidth / inferredHeight
      : maxWidth / maxHeight;

  let finalWidth = Math.min(inferredWidth, maxWidth);
  let finalHeight = finalWidth / aspectRatio;

  if (finalHeight > maxHeight) {
    finalHeight = maxHeight;
    finalWidth = finalHeight * aspectRatio;
  }

  finalWidth = resolveDimension(finalWidth, maxWidth, maxWidth);
  finalHeight = resolveDimension(finalHeight, maxHeight, maxHeight);

  const type = determineImageType({ src, mimeType, byteSignature });

  // Fallback to jpg when the type is missing; docx library expects a concrete literal.
  const docxImageType: SupportedImageType = type ?? "jpg";
  const imageRun = new ImageRun({
    data,
    transformation: {
      width: finalWidth,
      height: finalHeight,
    },
    type: docxImageType,
  });

  return new Paragraph({
    children: [imageRun],
    spacing: { after: 200 },
  });
}

type LoadedImageData = {
  data: Uint8Array;
  mimeType?: string | null;
  byteSignature: Uint8Array;
};

async function loadImageData(src: string): Promise<LoadedImageData | null> {
  try {
    if (src.startsWith("data:")) {
      const { bytes, mimeType } = dataUrlToUint8Array(src) ?? {};
      if (!bytes || !bytes.length) {
        return null;
      }
      return {
        data: bytes,
        mimeType,
        byteSignature: bytes.slice(0, 16),
      };
    }

    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (!bytes.length) {
      return null;
    }
    return {
      data: bytes,
      mimeType: response.headers.get("content-type"),
      byteSignature: bytes.slice(0, 16),
    };
  } catch (error) {
    console.warn("Unable to load image for DOCX export", error);
    return null;
  }
}

async function getImageDimensions(
  src: string
): Promise<{ width: number; height: number } | null> {
  if (typeof Image === "undefined") {
    return null;
  }

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function dataUrlToUint8Array(
  dataUrl: string
): { bytes: Uint8Array; mimeType?: string | null } | null {
  const match = dataUrl.match(/^data:([^;,]+)?;base64,(.+)$/i);
  if (!match) {
    return null;
  }
  const [, mimeType, base64Data] = match;
  if (!base64Data || !base64Data.trim()) {
    return null;
  }

  try {
    const sanitizedBase64 = base64Data.replace(/\s+/g, "").trim();
    const binary = atob(sanitizedBase64);
    if (!binary.length) {
      return null;
    }

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { bytes, mimeType };
  } catch (error) {
    console.warn("Invalid base64 data for DOCX export", error);
    return null;
  }
}

type SupportedImageType = "png" | "jpg" | "gif" | "bmp";

function determineImageType({
  src,
  mimeType,
  byteSignature,
}: {
  src: string;
  mimeType?: string | null;
  byteSignature?: Uint8Array;
}): SupportedImageType | undefined {
  const normalizedMime = mimeType?.toLowerCase() ?? "";
  if (normalizedMime.includes("png")) return "png";
  if (normalizedMime.includes("jpeg") || normalizedMime.includes("jpg")) {
    return "jpg";
  }
  if (normalizedMime.includes("gif")) return "gif";
  if (normalizedMime.includes("bmp")) return "bmp";

  const lowerSrc = src.toLowerCase();
  if (/\.png(?:[?#]|$)/.test(lowerSrc)) return "png";
  if (/\.(jpe?g)(?:[?#]|$)/.test(lowerSrc)) return "jpg";
  if (/\.gif(?:[?#]|$)/.test(lowerSrc)) return "gif";
  if (/\.bmp(?:[?#]|$)/.test(lowerSrc)) return "bmp";

  if (byteSignature && byteSignature.length >= 4) {
    if (
      byteSignature[0] === 0x89 &&
      byteSignature[1] === 0x50 &&
      byteSignature[2] === 0x4e &&
      byteSignature[3] === 0x47
    ) {
      return "png";
    }
    if (byteSignature[0] === 0xff && byteSignature[1] === 0xd8) {
      return "jpg";
    }
    if (
      byteSignature[0] === 0x47 &&
      byteSignature[1] === 0x49 &&
      byteSignature[2] === 0x46
    ) {
      return "gif";
    }
    if (byteSignature[0] === 0x42 && byteSignature[1] === 0x4d) {
      return "bmp";
    }
  }

  return undefined;
}

function resolveDimension(
  primary: number | null | undefined,
  secondary: number | null | undefined,
  max: number,
  min = 1
): number {
  const clamp = (value?: number | null) => {
    if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
      return null;
    }
    const bounded = Math.min(value, max);
    const rounded = Math.round(bounded);
    return Math.max(rounded, min);
  };

  return clamp(primary) ?? clamp(secondary) ?? Math.max(min, Math.round(max));
}

function normalizeDocxFileName(fileName: string | null | undefined): string {
  const fallback = "edited-chapter.docx";
  if (!fileName || typeof fileName !== "string") {
    return fallback;
  }

  const trimmed = fileName.trim();
  if (!trimmed) {
    return fallback;
  }

  const sanitized = trimmed.replace(/[<>:"/\\|?*]+/g, "-");
  const hasExtension = sanitized.toLowerCase().endsWith(".docx");
  return hasExtension ? sanitized : `${sanitized}.docx`;
}
