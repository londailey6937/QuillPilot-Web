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
  // TableOfContents - replaced with manual TOC generation
  StyleLevel,
  PageBreak,
  convertInchesToTwip,
  PageNumber,
  Footer,
  Header,
  TabStopType,
  LeaderType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  Packer,
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

// Export mode determines the format of the output
export type ExportMode = "writer" | "analysis";

/**
 * Extract document title from HTML content
 * Looks for: 1) doc-title class, 2) book-title class, 3) first H1, 4) title-content class, 5) first heading
 */
function extractDocumentTitle(html: string | null | undefined): string | null {
  if (!html) return null;

  // Create a DOM parser to extract text content properly
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Priority 1: Look for doc-title class (user-applied title style)
  const docTitle = doc.querySelector(".doc-title");
  if (docTitle?.textContent?.trim()) {
    return docTitle.textContent.trim();
  }

  // Priority 2: Look for book-title class
  const bookTitle = doc.querySelector(".book-title");
  if (bookTitle?.textContent?.trim()) {
    return bookTitle.textContent.trim();
  }

  // Priority 3: Look for first H1
  const h1 = doc.querySelector("h1");
  if (h1?.textContent?.trim()) {
    return h1.textContent.trim();
  }

  // Priority 3: Look for title-content that might be the title
  const titleContent = doc.querySelector(".title-content");
  if (titleContent?.textContent?.trim()) {
    const text = titleContent.textContent.trim();
    // Only use if it's reasonably short (likely a title, not body text)
    if (text.length <= 100) {
      return text;
    }
  }

  // Priority 4: Look for any heading (H2-H6)
  const heading = doc.querySelector("h2, h3, h4, h5, h6");
  if (heading?.textContent?.trim()) {
    return heading.textContent.trim();
  }

  return null;
}

interface ExportDocxOptions {
  text: string;
  html?: string | null;
  fileName?: string;
  analysis?: ChapterAnalysis | null;
  includeHighlights?: boolean;
  mode?: ExportMode; // "writer" = clean document, "analysis" = with metrics
  includeToc?: boolean; // Include Table of Contents (auto-detected from content or explicit)
  headerText?: string; // Custom header text
  footerText?: string; // Custom footer text
  showPageNumbers?: boolean; // Show page numbers (default true)
  pageNumberPosition?: "header" | "footer"; // Where to show page numbers
  headerAlign?: "left" | "center" | "right" | "justify"; // Header alignment
  footerAlign?: "left" | "center" | "right" | "justify"; // Footer alignment
  facingPages?: boolean; // Mirror margins and alternate page numbers on outside edges
}

export const exportToDocx = async ({
  text,
  html,
  fileName = "edited-chapter",
  analysis,
  includeHighlights = true,
  mode = "analysis", // Default to analysis for backwards compatibility
  includeToc, // If undefined, auto-detect from content
  headerText = "",
  footerText = "",
  showPageNumbers = true,
  pageNumberPosition = "footer",
  headerAlign = "center",
  footerAlign = "center",
  facingPages = false,
}: ExportDocxOptions) => {
  console.log("[exportToDocx] Called with:", {
    textLength: text?.length,
    htmlLength: html?.length,
    fileName,
    mode,
  });

  try {
    // In writer mode, we export a clean document without analysis
    const isWriterMode = mode === "writer";
    const effectiveAnalysis = isWriterMode ? null : analysis;
    const effectiveIncludeHighlights = isWriterMode ? false : includeHighlights;

    console.log("[exportToDocx] Building HTML content...");
    // Build HTML content using shared builder for consistency
    const htmlContent = buildContentHtml({
      text,
      html,
      analysis: effectiveAnalysis,
      includeHighlights: effectiveIncludeHighlights,
    });
    console.log(
      "[exportToDocx] HTML content built, length:",
      htmlContent.length
    );

    // Check if content has a TOC placeholder or multiple headings
    const hasTocPlaceholder =
      html?.includes("toc-placeholder") ||
      htmlContent.includes("toc-placeholder");
    const headingMatches = htmlContent.match(/<h[1-6][^>]*>/gi) || [];
    const hasMultipleHeadings = headingMatches.length >= 3;

    // Auto-detect TOC: include if placeholder exists or if there are 3+ headings
    // DISABLED: TOC generation removed per user request
    const shouldIncludeToc = false;
    // const shouldIncludeToc =
    //   includeToc ?? (hasTocPlaceholder || hasMultipleHeadings);

    // Convert HTML to DOCX paragraphs
    const paragraphs: Paragraph[] = [];

    // Extract document title from content, fallback to filename, then to "Untitled Document"
    const extractedTitle = extractDocumentTitle(html);
    const fileNameTitle = sanitizeText(fileName.replace(/\.[^/.]+$/, ""));
    const documentTitle =
      extractedTitle || fileNameTitle || "Untitled Document";
    console.log("[exportToDocx] Document title:", documentTitle);

    // Check if HTML already contains a title element (doc-title, book-title, or h1)
    // If so, don't add a duplicate title - it will come through convertHtmlToParagraphs
    const htmlHasTitle = html
      ? /class="[^"]*(?:doc-title|book-title)[^"]*"|<h1[^>]*>/i.test(html)
      : false;

    // Only add title if the HTML doesn't already have one
    if (!htmlHasTitle) {
      paragraphs.push(
        new Paragraph({
          text: documentTitle,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    // Parse HTML and convert to paragraphs FIRST so we can calculate page numbers
    const htmlParagraphs = await convertHtmlToParagraphs(htmlContent);

    // Add Table of Contents if enabled - using manual TOC with calculated page numbers
    if (shouldIncludeToc) {
      // Add TOC title - NOT as a heading so it won't appear in the TOC itself
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Table of Contents",
              bold: true,
              size: 32, // 16pt
              color: "2c3e50",
            }),
          ],
          spacing: { before: 200, after: 300 },
        })
      );

      // Extract headings from HTML content and calculate their page positions
      const tocEntries = extractTocEntriesWithPageNumbers(
        htmlContent,
        htmlParagraphs
      );

      // Add manual TOC entries with calculated page numbers - justified with tab stops
      // Page width is 8.5" with 1" margins = 6.5" content width = 9360 twips
      const rightTabPosition = convertInchesToTwip(6.5);

      for (const entry of tocEntries) {
        const indent = (entry.level - 1) * 360; // 0.25 inch per level
        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: rightTabPosition - indent,
                leader: LeaderType.DOT,
              },
            ],
            children: [
              new TextRun({
                text: entry.text,
                size: entry.level === 1 ? 24 : entry.level === 2 ? 22 : 20,
                bold: entry.level === 1,
              }),
              new TextRun({
                text: "\t", // Tab character to trigger the dot leader
              }),
              new TextRun({
                text: `${entry.pageNumber}`,
                bold: true,
              }),
            ],
            indent: { left: indent },
            spacing: { after: 120 },
          })
        );
      }

      // Add a page break after TOC
      paragraphs.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }

    // Add the converted HTML paragraphs
    paragraphs.push(...htmlParagraphs);

    // Add analysis summary if available (only in analysis mode)
    if (effectiveAnalysis && effectiveIncludeHighlights) {
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
                `Overall Score: ${Math.round(
                  effectiveAnalysis.overallScore
                )}/100`
              ),
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        })
      );

      // Add Spacing and Dual Coding principle details
      const principleScores = (effectiveAnalysis as any).principleScores || [];
      const principles = effectiveAnalysis.principles || [];
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
      const highPriorityRecs = effectiveAnalysis.recommendations
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

    // Helper to convert alignment string to docx AlignmentType
    const getAlignment = (
      align: "left" | "center" | "right" | "justify"
    ): (typeof AlignmentType)[keyof typeof AlignmentType] => {
      switch (align) {
        case "left":
          return AlignmentType.LEFT;
        case "right":
          return AlignmentType.RIGHT;
        case "justify":
          return AlignmentType.JUSTIFIED;
        default:
          return AlignmentType.CENTER;
      }
    };

    // Create document with TOC-enabled features and proper page dimensions
    // Build header children for default (and odd pages if facing)
    const headerChildren: Paragraph[] = [];
    const headerChildrenEven: Paragraph[] = []; // For facing pages - even pages

    const buildHeaderParagraph = (
      alignment: (typeof AlignmentType)[keyof typeof AlignmentType],
      pageNumOnLeft: boolean
    ): Paragraph => {
      const children: TextRun[] = [];

      // Page number on left
      if (showPageNumbers && pageNumberPosition === "header" && pageNumOnLeft) {
        children.push(
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 20,
            color: "6b7280",
          })
        );
        if (headerText) {
          children.push(new TextRun({ text: "  |  ", color: "9ca3af" }));
        }
      }

      // Header text
      if (headerText) {
        const headerLines = headerText.split("\n");
        headerLines.forEach((line, idx) => {
          if (idx > 0) {
            children.push(new TextRun({ break: 1 }));
          }
          children.push(
            new TextRun({
              text: line,
              size: 20,
              color: "6b7280",
            })
          );
        });
      }

      // Page number on right
      if (
        showPageNumbers &&
        pageNumberPosition === "header" &&
        !pageNumOnLeft
      ) {
        if (headerText) {
          children.push(new TextRun({ text: "  |  ", color: "9ca3af" }));
        }
        children.push(
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 20,
            color: "6b7280",
          })
        );
      }

      return new Paragraph({ alignment, children });
    };

    // Default header (also used for odd pages in facing mode)
    if (headerText || (showPageNumbers && pageNumberPosition === "header")) {
      const defaultAlign = facingPages
        ? AlignmentType.RIGHT
        : getAlignment(headerAlign);
      headerChildren.push(buildHeaderParagraph(defaultAlign, false));
    }

    // Even page header (for facing pages - page number on left)
    if (
      facingPages &&
      (headerText || (showPageNumbers && pageNumberPosition === "header"))
    ) {
      headerChildrenEven.push(buildHeaderParagraph(AlignmentType.LEFT, true));
    }

    // Build footer children for default (and odd pages if facing)
    const footerChildren: Paragraph[] = [];
    const footerChildrenEven: Paragraph[] = []; // For facing pages - even pages

    const buildFooterParagraph = (
      alignment: (typeof AlignmentType)[keyof typeof AlignmentType],
      pageNumOnLeft: boolean
    ): Paragraph => {
      const children: TextRun[] = [];

      // Page number on left
      if (showPageNumbers && pageNumberPosition === "footer" && pageNumOnLeft) {
        children.push(
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 20,
            color: "6b7280",
          })
        );
        if (footerText) {
          children.push(new TextRun({ text: "  |  ", color: "9ca3af" }));
        }
      }

      // Footer text
      if (footerText) {
        const footerLines = footerText.split("\n");
        footerLines.forEach((line, idx) => {
          if (idx > 0) {
            children.push(new TextRun({ break: 1 }));
          }
          children.push(
            new TextRun({
              text: line,
              size: 20,
              color: "6b7280",
            })
          );
        });
      }

      // Page number on right
      if (
        showPageNumbers &&
        pageNumberPosition === "footer" &&
        !pageNumOnLeft
      ) {
        if (footerText) {
          children.push(new TextRun({ text: "  |  ", color: "9ca3af" }));
        }
        children.push(
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 20,
            color: "6b7280",
          })
        );
      }

      return new Paragraph({ alignment, children });
    };

    // Default footer (also used for odd pages in facing mode)
    if (footerText || (showPageNumbers && pageNumberPosition === "footer")) {
      const defaultAlign = facingPages
        ? AlignmentType.RIGHT
        : getAlignment(footerAlign);
      footerChildren.push(buildFooterParagraph(defaultAlign, false));
    }

    // Even page footer (for facing pages - page number on left)
    if (
      facingPages &&
      (footerText || (showPageNumbers && pageNumberPosition === "footer"))
    ) {
      footerChildrenEven.push(buildFooterParagraph(AlignmentType.LEFT, true));
    }

    const doc = new Document({
      features: {
        // Enable update fields on open - this makes Word update the TOC when opened
        updateFields: true,
      },
      sections: [
        {
          properties: {
            // US Letter size: 8.5" x 11"
            page: {
              size: {
                width: convertInchesToTwip(8.5),
                height: convertInchesToTwip(11),
              },
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
                // Mirror margins for facing pages (gutter on inside)
                ...(facingPages && { gutter: convertInchesToTwip(0.5) }),
              },
            },
          },
          headers:
            headerChildren.length > 0 || headerChildrenEven.length > 0
              ? {
                  default: new Header({
                    children: headerChildren,
                  }),
                  ...(facingPages && headerChildrenEven.length > 0
                    ? {
                        even: new Header({
                          children: headerChildrenEven,
                        }),
                      }
                    : {}),
                }
              : undefined,
          footers:
            footerChildren.length > 0 || footerChildrenEven.length > 0
              ? {
                  default: new Footer({
                    children: footerChildren,
                  }),
                  ...(facingPages && footerChildrenEven.length > 0
                    ? {
                        even: new Footer({
                          children: footerChildrenEven,
                        }),
                      }
                    : {}),
                }
              : undefined,
          children: paragraphs,
        },
      ],
    });

    // Generate and save - use File System Access API if available for "Save As" dialog
    console.log("[exportToDocx] Generating blob...");
    const blob = await Packager.toBlob(doc);
    console.log("[exportToDocx] Blob generated, size:", blob.size);
    const downloadName = normalizeDocxFileName(fileName);
    console.log("[exportToDocx] Download name:", downloadName);

    // Try to use the modern File System Access API (Chrome, Edge, Opera)
    // This gives users a proper "Save As" dialog to choose the location
    if ("showSaveFilePicker" in window) {
      try {
        console.log("[exportToDocx] Using File System Access API...");
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: downloadName,
          types: [
            {
              description: "Word Document",
              accept: {
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
              },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        console.log(
          "[exportToDocx] File saved successfully via File System Access API"
        );
        return; // Successfully saved with user-chosen location
      } catch (err: any) {
        // User cancelled the save dialog, or API not fully supported
        if (err.name === "AbortError") {
          console.log("[exportToDocx] User cancelled save dialog");
          return; // User cancelled - don't fall back to download
        }
        // For other errors, fall back to traditional download
        console.warn(
          "File System Access API failed, falling back to download:",
          err
        );
      }
    }

    // Fallback for Safari, Firefox, or if File System Access API fails
    console.log("[exportToDocx] Using saveAs fallback...");
    saveAs(blob, downloadName);
    console.log("[exportToDocx] saveAs called");
  } catch (error) {
    console.error("[exportToDocx] Export failed:", error);
    throw error;
  }
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

/**
 * Convert screenplay block elements to properly formatted DOCX paragraphs
 * following industry standard screenplay format
 */
function convertScreenplayBlock(element: HTMLElement): Paragraph[] {
  // Extract block type from data-block attribute or class names
  let blockType = element.dataset.block || element.getAttribute("data-block");

  // If no data-block, try to extract from class names
  if (!blockType) {
    const classes = element.className.split(" ");
    blockType =
      classes.find(
        (c) =>
          c !== "screenplay-block" &&
          [
            "scene-heading",
            "action",
            "character",
            "dialogue",
            "parenthetical",
            "transition",
            "spacer",
          ].includes(c)
      ) || "action";
  }

  const text = sanitizeText(element.textContent || "");

  if (!text && blockType !== "spacer") {
    return [];
  }

  // Courier or Courier New font at 12pt (24 half-points)
  const screenplayFont = "Courier New";
  const screenplaySize = 24; // 12pt in half-points

  switch (blockType) {
    case "scene-heading":
      // Scene headings: All caps, left aligned, bold
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: text.toUpperCase(),
              font: screenplayFont,
              size: screenplaySize,
              bold: true,
            }),
          ],
          spacing: { before: 240, after: 240, line: 240 },
        }),
      ];

    case "action":
      // Action/description: Normal text, left aligned
      return [
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: screenplayFont,
              size: screenplaySize,
            }),
          ],
          spacing: { after: 240, line: 240 },
        }),
      ];

    case "character":
      // Character name: All caps, indented 3.7 inches from left
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: text.toUpperCase(),
              font: screenplayFont,
              size: screenplaySize,
            }),
          ],
          indent: { left: 2664 }, // 3.7 inches in twips (1440 twips per inch)
          spacing: { before: 240, after: 0, line: 240 },
        }),
      ];

    case "parenthetical":
      // Parenthetical: Indented 3.1 inches from left
      return [
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: screenplayFont,
              size: screenplaySize,
            }),
          ],
          indent: { left: 2232 }, // 3.1 inches in twips
          spacing: { after: 0, line: 240 },
        }),
      ];

    case "dialogue":
      // Dialogue: Indented 2.5 inches from left, max width about 3.5 inches
      return [
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: screenplayFont,
              size: screenplaySize,
            }),
          ],
          indent: { left: 1800 }, // 2.5 inches in twips
          spacing: { after: 0, line: 240 },
        }),
      ];

    case "transition":
      // Transition: All caps, right aligned
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: text.toUpperCase(),
              font: screenplayFont,
              size: screenplaySize,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 240, after: 240, line: 240 },
        }),
      ];

    case "spacer":
      // Empty line for spacing
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: "",
              font: screenplayFont,
              size: screenplaySize,
            }),
          ],
          spacing: { after: 240, line: 240 },
        }),
      ];

    default:
      // Fallback to action format
      return [
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: screenplayFont,
              size: screenplaySize,
            }),
          ],
          spacing: { after: 240, line: 240 },
        }),
      ];
  }
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

  // Skip non-content elements that should not appear in the document
  if (
    tag === "style" ||
    tag === "script" ||
    tag === "link" ||
    tag === "meta" ||
    tag === "head" ||
    tag === "title" ||
    tag === "noscript"
  ) {
    return [];
  }

  // Handle special CSS classes for styled sections
  if (className.includes("spacing-indicator")) {
    return convertSpacingIndicator(element);
  }

  if (className.includes("dual-coding-callout")) {
    return convertDualCodingCallout(element);
  }

  // Skip TOC placeholder elements - real TOC is generated separately
  if (
    className.includes("toc-placeholder") ||
    className.includes("index-placeholder")
  ) {
    return [];
  }

  // Handle screenplay blocks with industry standard formatting
  if (className.includes("screenplay-block")) {
    return convertScreenplayBlock(element);
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

  // Handle page breaks (div.page-break or hr.page-break)
  if (className.includes("page-break")) {
    return [
      new Paragraph({
        children: [new PageBreak()],
      }),
    ];
  }

  // Handle column containers - convert to table for side-by-side layout
  if (className.includes("column-container")) {
    // Find all column-content divs within the container
    const columnContents = element.querySelectorAll(".column-content");

    if (columnContents.length > 1) {
      // Multiple columns - create a table for side-by-side layout
      const tableCells: TableCell[] = [];
      const columnWidth = Math.floor(100 / columnContents.length);

      for (const columnContent of Array.from(columnContents)) {
        // Process each column's content into paragraphs
        const cellParagraphs: Paragraph[] = [];
        for (const child of Array.from(columnContent.childNodes)) {
          const converted = await convertNodeToParagraphs(child, combinedStyle);
          cellParagraphs.push(...converted);
        }

        // Ensure at least one paragraph in the cell
        if (cellParagraphs.length === 0) {
          cellParagraphs.push(new Paragraph({ children: [] }));
        }

        tableCells.push(
          new TableCell({
            children: cellParagraphs,
            width: { size: columnWidth, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          })
        );
      }

      const table = new Table({
        rows: [
          new TableRow({
            children: tableCells,
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: {
            style: BorderStyle.NONE,
            size: 0,
            color: "FFFFFF",
          },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
      });

      // Return table wrapped - tables can be added directly to document sections
      return [table as unknown as Paragraph];
    } else if (columnContents.length === 1) {
      // Single column - just process the content normally
      const paragraphs: Paragraph[] = [];
      for (const child of Array.from(columnContents[0].childNodes)) {
        const converted = await convertNodeToParagraphs(child, combinedStyle);
        paragraphs.push(...converted);
      }
      return paragraphs;
    } else {
      // Fallback: process all children except drag handle
      const paragraphs: Paragraph[] = [];
      for (const child of Array.from(element.childNodes)) {
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          (child as HTMLElement).classList?.contains("column-drag-handle")
        ) {
          continue;
        }
        const converted = await convertNodeToParagraphs(child, combinedStyle);
        paragraphs.push(...converted);
      }
      return paragraphs;
    }
  }

  // Skip column drag handle elements - they're UI only
  if (className.includes("column-drag-handle")) {
    return [];
  }

  // Handle column content divs that might be processed individually
  if (className.includes("column-content")) {
    const paragraphs: Paragraph[] = [];
    for (const child of Array.from(element.childNodes)) {
      const converted = await convertNodeToParagraphs(child, combinedStyle);
      paragraphs.push(...converted);
    }
    return paragraphs;
  }

  // Handle generic wrapper divs with display:flex (column row wrappers)
  // These should just pass through to their children
  const style = element.getAttribute("style") || "";
  if (
    tag === "div" &&
    !className &&
    (style.includes("display: flex") || style.includes("display:flex"))
  ) {
    const paragraphs: Paragraph[] = [];
    for (const child of Array.from(element.childNodes)) {
      const converted = await convertNodeToParagraphs(child, combinedStyle);
      paragraphs.push(...converted);
    }
    return paragraphs;
  }

  if (tag === "ul" || tag === "ol") {
    return convertListElementToParagraphs(element, tag === "ol", combinedStyle);
  }

  if (tag === "table") {
    return convertTableElementToParagraphs(element, combinedStyle);
  }

  // Handle doc-title and doc-subtitle classes for round-trip fidelity with Word
  // These elements should be exported with Word's Title and Subtitle styles
  if (className.includes("doc-title")) {
    // Export as Word's Title style
    const runs = buildRunsFromInlineElement(element, combinedStyle);
    return [
      new Paragraph({
        children:
          runs.length > 0
            ? runs
            : ([createTextRun(element.textContent || "", combinedStyle)].filter(
                Boolean
              ) as TextRun[]),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
      }),
    ];
  }

  if (className.includes("doc-subtitle")) {
    // Export as Word's Subtitle style - use HEADING_2 which Word often uses for subtitles
    // or we can just use centered italic paragraph
    const runs = buildRunsFromInlineElement(element, {
      ...combinedStyle,
      italics: true,
    });
    return [
      new Paragraph({
        children:
          runs.length > 0
            ? runs
            : ([
                createTextRun(element.textContent || "", {
                  ...combinedStyle,
                  italics: true,
                }),
              ].filter(Boolean) as TextRun[]),
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 400 },
        style: "Subtitle", // Use Word's built-in Subtitle style
      }),
    ];
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
  let src = element.getAttribute("src");
  console.log(
    "[DOCX Export] createImageParagraph called with src:",
    src?.substring(0, 100)
  );
  if (!src) {
    console.log("[DOCX Export] No src attribute found");
    return null;
  }

  // Check if this is a WebP image and convert to PNG if so
  // The docx library doesn't support WebP format
  const isWebP =
    src.includes("image/webp") || src.toLowerCase().endsWith(".webp");
  if (isWebP) {
    console.log("[DOCX Export] WebP image detected, converting to PNG...");
    const convertedSrc = await convertWebPToPng(src);
    if (convertedSrc) {
      src = convertedSrc;
      console.log("[DOCX Export] WebP converted to PNG successfully");
    } else {
      console.warn("[DOCX Export] Failed to convert WebP to PNG");
    }
  }

  const payload = await loadImageData(src);
  console.log(
    "[DOCX Export] loadImageData result:",
    payload
      ? `${payload.data.length} bytes, mimeType: ${payload.mimeType}`
      : "null"
  );
  if (!payload || payload.data.length === 0) {
    console.log("[DOCX Export] No payload data, returning null");
    return null;
  }
  const { data, mimeType, byteSignature } = payload;

  const dimensions = await getImageDimensions(src);
  console.log("[DOCX Export] Image dimensions:", dimensions);

  // Try to get dimensions from multiple sources
  const widthAttribute = parseInt(element.getAttribute("width") || "", 10);
  const heightAttribute = parseInt(element.getAttribute("height") || "", 10);

  // Also check inline styles for width/height (used by image resize handles)
  const style = element.getAttribute("style") || "";
  const styleWidthMatch = style.match(/width:\s*(\d+)px/);
  const styleHeightMatch = style.match(/height:\s*(\d+)px/);
  const styleWidth = styleWidthMatch ? parseInt(styleWidthMatch[1], 10) : NaN;
  const styleHeight = styleHeightMatch
    ? parseInt(styleHeightMatch[1], 10)
    : NaN;

  const maxWidth = 480;
  const maxHeight = 600; // Increased max height for better aspect ratio

  // Priority: style > attribute > natural dimensions > max
  const inferredWidth = resolveDimension(
    !Number.isNaN(styleWidth)
      ? styleWidth
      : !Number.isNaN(widthAttribute)
      ? widthAttribute
      : undefined,
    dimensions?.width,
    maxWidth
  );
  const inferredHeight = resolveDimension(
    !Number.isNaN(styleHeight)
      ? styleHeight
      : !Number.isNaN(heightAttribute)
      ? heightAttribute
      : undefined,
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

  console.log(
    "[DOCX Export] ImageRun created successfully, type:",
    docxImageType
  );

  // Detect alignment from the image element or its parent
  const alignment = detectImageAlignment(element);
  console.log("[DOCX Export] Image alignment detected:", alignment);

  return new Paragraph({
    children: [imageRun],
    spacing: { after: 200 },
    alignment: alignment,
  });
}

/**
 * Detect alignment for an image element by checking its style and parent styles
 */
function detectImageAlignment(
  element: HTMLElement
): (typeof AlignmentType)[keyof typeof AlignmentType] {
  // Check the image's own style first
  const imgStyle = element.getAttribute("style") || "";

  // Check for margin: auto (common centering technique)
  if (imgStyle.includes("margin") && imgStyle.includes("auto")) {
    return AlignmentType.CENTER;
  }

  // Check for display: block with margin auto
  if (imgStyle.includes("display") && imgStyle.includes("block")) {
    if (
      imgStyle.includes("margin-left: auto") ||
      imgStyle.includes("margin: 0 auto") ||
      imgStyle.includes("margin:0 auto")
    ) {
      return AlignmentType.CENTER;
    }
  }

  // Check parent elements for text-align
  let parent = element.parentElement;
  let depth = 0;
  const maxDepth = 5; // Don't traverse too far up

  while (parent && depth < maxDepth) {
    const parentStyle = parent.getAttribute("style") || "";
    const computedAlign = parentStyle.match(
      /text-align\s*:\s*(left|center|right|justify)/i
    );

    if (computedAlign) {
      const alignValue = computedAlign[1].toLowerCase();
      console.log("[DOCX Export] Found text-align in parent:", alignValue);
      switch (alignValue) {
        case "center":
          return AlignmentType.CENTER;
        case "right":
          return AlignmentType.RIGHT;
        case "justify":
          return AlignmentType.JUSTIFIED;
        case "left":
        default:
          return AlignmentType.LEFT;
      }
    }

    // Also check for centering classes
    const parentClass = parent.className || "";
    if (parentClass.includes("center") || parentClass.includes("text-center")) {
      return AlignmentType.CENTER;
    }

    parent = parent.parentElement;
    depth++;
  }

  // Default to left alignment
  return AlignmentType.LEFT;
}

/**
 * Convert a WebP image to PNG format using canvas
 * Returns a PNG data URL or null on failure
 */
async function convertWebPToPng(src: string): Promise<string | null> {
  if (typeof document === "undefined" || typeof Image === "undefined") {
    return null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.warn("[DOCX Export] Could not get canvas context");
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const pngDataUrl = canvas.toDataURL("image/png");
        console.log(
          "[DOCX Export] WebP converted to PNG, size:",
          pngDataUrl.length
        );
        resolve(pngDataUrl);
      } catch (error) {
        console.warn("[DOCX Export] Failed to convert WebP to PNG:", error);
        resolve(null);
      }
    };

    img.onerror = (error) => {
      console.warn("[DOCX Export] Failed to load WebP image:", error);
      resolve(null);
    };

    img.src = src;
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
  console.log(
    "[DOCX Export] determineImageType called with mimeType:",
    mimeType
  );
  const normalizedMime = mimeType?.toLowerCase() ?? "";
  if (normalizedMime.includes("png")) {
    console.log("[DOCX Export] Detected PNG from mimeType");
    return "png";
  }
  if (normalizedMime.includes("jpeg") || normalizedMime.includes("jpg")) {
    console.log("[DOCX Export] Detected JPG from mimeType");
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
    console.log(
      "[DOCX Export] Checking byte signature:",
      byteSignature.slice(0, 4)
    );
    if (
      byteSignature[0] === 0x89 &&
      byteSignature[1] === 0x50 &&
      byteSignature[2] === 0x4e &&
      byteSignature[3] === 0x47
    ) {
      console.log("[DOCX Export] Detected PNG from byte signature");
      return "png";
    }
    if (byteSignature[0] === 0xff && byteSignature[1] === 0xd8) {
      console.log("[DOCX Export] Detected JPG from byte signature");
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

  console.log(
    "[DOCX Export] Could not determine image type, returning undefined"
  );
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

interface TocEntry {
  text: string;
  level: number;
  pageNumber: number;
}

/**
 * Extract headings from HTML content and calculate estimated page numbers
 * Based on US Letter (8.5" x 11") with 1" margins = ~54 lines per page at 12pt
 */
function extractTocEntriesWithPageNumbers(
  htmlContent: string,
  _paragraphs: Paragraph[]
): TocEntry[] {
  const entries: TocEntry[] = [];

  // Parse HTML to find headings
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  // Get all heading elements
  const headings = doc.querySelectorAll("h1, h2, h3");

  // Estimate page numbers based on position in content
  // US Letter with 1" margins: ~6.5" x 9" content area
  // At 12pt font with 1.5 line spacing: ~40-45 lines per page
  // Average ~500-600 words per page

  const fullText = doc.body.textContent || "";
  const totalChars = fullText.length;

  // Estimate: ~3000 characters per page (roughly 500 words)
  const CHARS_PER_PAGE = 3000;

  // TOC takes about 1 page, content starts on page 2
  const TOC_PAGES = 1;

  headings.forEach((heading) => {
    const text = heading.textContent?.trim() || "";
    if (!text) return;

    // Skip "Analysis Summary" and similar non-content headings
    if (
      text.toLowerCase().includes("analysis summary") ||
      text.toLowerCase().includes("edited chapter text")
    ) {
      return;
    }

    const level = parseInt(heading.tagName.charAt(1), 10);

    // Find position of this heading in the full text
    const headingText = heading.textContent || "";
    const position = fullText.indexOf(headingText);

    // Calculate page number based on character position
    // Add TOC_PAGES + 1 because TOC is on page 1, content starts on page 2
    const charsBefore = position >= 0 ? position : 0;
    const pageNumber = Math.max(
      1,
      Math.ceil(charsBefore / CHARS_PER_PAGE) + TOC_PAGES
    );

    entries.push({
      text: sanitizeText(text),
      level,
      pageNumber,
    });
  });

  return entries;
}

/**
 * Manuscript Format Settings Interface
 */
export interface ManuscriptSettings {
  authorName: string;
  authorAddress: string;
  authorCity: string;
  authorState: string;
  authorZip: string;
  authorEmail: string;
  authorPhone: string;
  title: string;
  penName?: string;
  wordCount: number;
  includeRunningHeaders: boolean;
  runningHeaderStyle: "author-title" | "title-only" | "custom";
  customRunningHeader?: string;
  fontFamily:
    | "courier-new"
    | "courier-prime"
    | "times-new-roman"
    | "georgia"
    | "garamond"
    | "palatino"
    | "book-antiqua"
    | "century-schoolbook"
    | "cambria";
  fontSize: 12;
  lineSpacing: "double";
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  firstLineIndent: number;
  paragraphSpacing: "none" | "single";
}

/**
 * Export to DOCX in Shunn Standard Manuscript Format
 * Full industry-standard formatting for fiction submissions
 */
export const exportToManuscriptDocx = async ({
  text,
  html,
  settings,
  fileName,
}: {
  text: string;
  html?: string | null;
  settings: ManuscriptSettings;
  fileName?: string;
}) => {
  const {
    authorName,
    authorAddress,
    authorCity,
    authorState,
    authorZip,
    authorEmail,
    authorPhone,
    title,
    penName,
    wordCount,
    includeRunningHeaders,
    runningHeaderStyle,
    customRunningHeader,
    fontFamily,
    margins,
    firstLineIndent,
  } = settings;

  // Get font family for docx
  const fontMap: Record<string, string> = {
    "courier-new": "Courier New",
    "courier-prime": "Courier Prime",
    "times-new-roman": "Times New Roman",
    georgia: "Georgia",
    garamond: "Garamond",
    palatino: "Palatino Linotype",
    "book-antiqua": "Book Antiqua",
    "century-schoolbook": "Century Schoolbook",
    cambria: "Cambria",
  };
  const docxFontFamily = fontMap[fontFamily] || "Times New Roman";

  // Round word count to nearest 100
  const roundedWordCount = Math.round(wordCount / 100) * 100;

  // Build running header text
  const getRunningHeaderText = (): string => {
    if (!includeRunningHeaders) return "";
    switch (runningHeaderStyle) {
      case "author-title":
        const lastName = authorName.split(" ").pop() || authorName;
        return `${lastName} / ${title.toUpperCase()}`;
      case "title-only":
        return title.toUpperCase();
      case "custom":
        return customRunningHeader || "";
      default:
        return "";
    }
  };

  const runningHeaderText = getRunningHeaderText();
  const displayName = penName || authorName;

  // Create title page paragraphs
  const titlePageParagraphs: Paragraph[] = [];

  // Author contact info (top-left)
  titlePageParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: authorName,
          font: docxFontFamily,
          size: 24, // 12pt
        }),
      ],
      spacing: { after: 0, line: 480 }, // Double spacing = 480 twips
    })
  );

  if (authorAddress) {
    titlePageParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: authorAddress,
            font: docxFontFamily,
            size: 24,
          }),
        ],
        spacing: { after: 0, line: 480 },
      })
    );
  }

  titlePageParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${authorCity}, ${authorState} ${authorZip}`,
          font: docxFontFamily,
          size: 24,
        }),
      ],
      spacing: { after: 0, line: 480 },
    })
  );

  if (authorEmail) {
    titlePageParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: authorEmail,
            font: docxFontFamily,
            size: 24,
          }),
        ],
        spacing: { after: 0, line: 480 },
      })
    );
  }

  if (authorPhone) {
    titlePageParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: authorPhone,
            font: docxFontFamily,
            size: 24,
          }),
        ],
        spacing: { after: 0, line: 480 },
      })
    );
  }

  // Add spacing to push title to center of page (approximately)
  for (let i = 0; i < 12; i++) {
    titlePageParagraphs.push(
      new Paragraph({
        children: [],
        spacing: { after: 0, line: 480 },
      })
    );
  }

  // Title (centered)
  titlePageParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: title.toUpperCase(),
          font: docxFontFamily,
          size: 24,
          bold: false,
        }),
      ],
      spacing: { after: 0, line: 480 },
    })
  );

  // "by" line
  titlePageParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "by",
          font: docxFontFamily,
          size: 24,
        }),
      ],
      spacing: { after: 0, line: 480 },
    })
  );

  // Author name (centered)
  titlePageParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: displayName,
          font: docxFontFamily,
          size: 24,
        }),
      ],
      spacing: { after: 0, line: 480 },
    })
  );

  // Page break after title page
  titlePageParagraphs.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // Convert content to manuscript-formatted paragraphs
  const contentParagraphs: Paragraph[] = [];

  // Parse HTML content or use plain text
  if (html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const elements = doc.body.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, blockquote"
    );

    elements.forEach((element) => {
      const elementText = element.textContent?.trim() || "";
      if (!elementText) return;

      const tagName = element.tagName.toLowerCase();
      const isHeading = tagName.startsWith("h");

      contentParagraphs.push(
        new Paragraph({
          alignment: isHeading ? AlignmentType.CENTER : AlignmentType.LEFT,
          indent: isHeading
            ? undefined
            : { firstLine: convertInchesToTwip(firstLineIndent) },
          children: [
            new TextRun({
              text: elementText,
              font: docxFontFamily,
              size: 24, // 12pt
              bold: isHeading,
            }),
          ],
          spacing: { after: 0, line: 480 }, // Double spacing
        })
      );

      // Add extra space after headings
      if (isHeading) {
        contentParagraphs.push(
          new Paragraph({
            children: [],
            spacing: { after: 0, line: 480 },
          })
        );
      }
    });
  } else {
    // Plain text fallback
    const paragraphs = text.split(/\n\n+/);
    paragraphs.forEach((para) => {
      const trimmed = para.trim();
      if (!trimmed) return;

      contentParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          indent: { firstLine: convertInchesToTwip(firstLineIndent) },
          children: [
            new TextRun({
              text: trimmed,
              font: docxFontFamily,
              size: 24,
            }),
          ],
          spacing: { after: 0, line: 480 },
        })
      );
    });
  }

  // Add end marker
  contentParagraphs.push(
    new Paragraph({
      children: [],
      spacing: { after: 0, line: 480 },
    })
  );
  contentParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "# # #",
          font: docxFontFamily,
          size: 24,
        }),
      ],
      spacing: { after: 0, line: 480 },
    })
  );

  // Create document with proper manuscript formatting
  const doc = new Document({
    sections: [
      // Title page section (no header)
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(margins.top),
              bottom: convertInchesToTwip(margins.bottom),
              left: convertInchesToTwip(margins.left),
              right: convertInchesToTwip(margins.right),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `About ${roundedWordCount.toLocaleString()} words`,
                    font: docxFontFamily,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        },
        children: titlePageParagraphs,
      },
      // Content section (with running headers)
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(margins.top),
              bottom: convertInchesToTwip(margins.bottom),
              left: convertInchesToTwip(margins.left),
              right: convertInchesToTwip(margins.right),
            },
          },
        },
        headers: includeRunningHeaders
          ? {
              default: new Header({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    tabStops: [
                      {
                        type: TabStopType.RIGHT,
                        position: convertInchesToTwip(6.5),
                      },
                    ],
                    children: [
                      new TextRun({
                        text: runningHeaderText,
                        font: docxFontFamily,
                        size: 24,
                      }),
                      new TextRun({
                        text: "\t",
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        font: docxFontFamily,
                        size: 24,
                      }),
                    ],
                  }),
                ],
              }),
            }
          : undefined,
        children: contentParagraphs,
      },
    ],
  });

  // Generate and save - use File System Access API if available for "Save As" dialog
  const blob = await Packer.toBlob(doc);
  const outputFileName = normalizeDocxFileName(
    fileName || title || "manuscript"
  );

  // Try to use the modern File System Access API (Chrome, Edge, Opera)
  // This gives users a proper "Save As" dialog to choose the location
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: outputFileName,
        types: [
          {
            description: "Word Document",
            accept: {
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return; // Successfully saved with user-chosen location
    } catch (err: any) {
      // User cancelled the save dialog, or API not fully supported
      if (err.name === "AbortError") {
        return; // User cancelled - don't fall back to download
      }
      // For other errors, fall back to traditional download
      console.warn(
        "File System Access API failed, falling back to download:",
        err
      );
    }
  }

  // Fallback for Safari, Firefox, or if File System Access API fails
  saveAs(blob, outputFileName);
};
