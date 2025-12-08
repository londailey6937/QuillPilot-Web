import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { ChapterAnalysis } from "@/types";

/**
 * Helper to save PDF using File System Access API (with folder picker) or fallback to download
 */
const savePdfWithPicker = async (
  doc: jsPDF,
  fileName: string
): Promise<void> => {
  const pdfBlob = doc.output("blob");
  const downloadName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;

  // Try to use the modern File System Access API (Chrome, Edge, Opera)
  // This gives users a proper "Save As" dialog to choose the location
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: downloadName,
        types: [
          {
            description: "PDF Document",
            accept: { "application/pdf": [".pdf"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(pdfBlob);
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
  saveAs(pdfBlob, downloadName);
};

interface ExportPdfOptions {
  text: string;
  html?: string | null;
  fileName?: string;
  analysis?: ChapterAnalysis | null;
  includeAnalysis?: boolean;
  format?: "manuscript" | "standard" | "screenplay";
}

/**
 * Detect element type from HTML classes for rich formatting
 */
function getElementType(
  element: Element
): "title" | "subtitle" | "chapter" | "quote" | "normal" {
  const className = element.className || "";
  const tagName = element.tagName.toLowerCase();

  if (
    className.includes("doc-title") ||
    className.includes("book-title") ||
    className.includes("title-content")
  ) {
    return "title";
  }
  if (className.includes("doc-subtitle") || className.includes("subtitle")) {
    return "subtitle";
  }
  if (
    className.includes("chapter-heading") ||
    tagName === "h1" ||
    tagName === "h2"
  ) {
    return "chapter";
  }
  if (
    className.includes("quote") ||
    className.includes("intense-quote") ||
    tagName === "blockquote"
  ) {
    return "quote";
  }
  return "normal";
}

export const exportToPdf = async ({
  text,
  html,
  fileName = "document",
  analysis,
  includeAnalysis = true,
  format = "manuscript",
}: ExportPdfOptions) => {
  // Auto-detect screenplay format from HTML
  const isScreenplay =
    html?.includes("screenplay-block") || format === "screenplay";
  const actualFormat = isScreenplay ? "screenplay" : format;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter",
  });

  // Manuscript formatting (Shugart standard)
  const margins = {
    top: actualFormat === "manuscript" ? 1 : 0.75,
    bottom: actualFormat === "manuscript" ? 1 : 0.75,
    left:
      actualFormat === "manuscript"
        ? 1.25
        : actualFormat === "screenplay"
        ? 1.5
        : 1,
    right:
      actualFormat === "manuscript"
        ? 1.25
        : actualFormat === "screenplay"
        ? 1.0
        : 1,
  };

  const pageWidth = 8.5;
  const pageHeight = 11;
  const contentWidth = pageWidth - margins.left - margins.right;

  let yPosition = margins.top;
  const lineHeight =
    actualFormat === "manuscript"
      ? 0.24
      : actualFormat === "screenplay"
      ? 0.17
      : 0.2;
  const fontSize =
    actualFormat === "manuscript"
      ? 12
      : actualFormat === "screenplay"
      ? 12
      : 11;

  // Set font - Times New Roman for nicer formatting (falls back to times)
  doc.setFont("times", "normal");
  doc.setFontSize(fontSize);

  // Helper to add new page if needed
  const checkPageBreak = (extraSpace = 0) => {
    if (yPosition + extraSpace > pageHeight - margins.bottom) {
      doc.addPage();
      yPosition = margins.top;

      // Add page number (centered at bottom for manuscript)
      if (format === "manuscript") {
        const pageNum = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        doc.text(`${pageNum}`, pageWidth / 2, pageHeight - 0.5, {
          align: "center",
        });
        doc.setFontSize(fontSize);
      }
    }
  };

  // Process rich HTML content if available
  if (html && !isScreenplay) {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(html, "text/html");

    // Get all block elements (paragraphs, headings, page breaks, etc.)
    const blockElements = htmlDoc.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, blockquote, div.quote, div.intense-quote, div.page-break, hr.page-break"
    );

    let isFirstElement = true;

    blockElements.forEach((element) => {
      // Handle page breaks (div or hr with page-break class)
      if (element.classList.contains("page-break")) {
        doc.addPage();
        yPosition = margins.top;
        return;
      }

      const elementText = element.textContent?.trim() || "";
      if (!elementText) return;

      const elementType = getElementType(element);

      switch (elementType) {
        case "title":
          // Title: Large, bold, centered
          if (!isFirstElement) {
            yPosition += lineHeight;
          }
          checkPageBreak(0.6);
          doc.setFont("times", "bold");
          doc.setFontSize(24);

          // Center the title
          const titleLines = doc.splitTextToSize(
            elementText.toUpperCase(),
            contentWidth
          );
          titleLines.forEach((line: string) => {
            checkPageBreak();
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
            yPosition += 0.35;
          });

          yPosition += lineHeight; // Space after title
          doc.setFont("times", "normal");
          doc.setFontSize(fontSize);
          break;

        case "subtitle":
          // Subtitle: Medium, italic, centered
          checkPageBreak(0.4);
          doc.setFont("times", "italic");
          doc.setFontSize(14);

          const subtitleLines = doc.splitTextToSize(elementText, contentWidth);
          subtitleLines.forEach((line: string) => {
            checkPageBreak();
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
            yPosition += 0.25;
          });

          yPosition += lineHeight * 1.5; // Space after subtitle
          doc.setFont("times", "normal");
          doc.setFontSize(fontSize);
          break;

        case "chapter":
          // Chapter heading: Bold, centered
          yPosition += lineHeight * 1.5; // Space before chapter
          checkPageBreak(0.5);
          doc.setFont("times", "bold");
          doc.setFontSize(16);

          const chapterLines = doc.splitTextToSize(
            elementText.toUpperCase(),
            contentWidth
          );
          chapterLines.forEach((line: string) => {
            checkPageBreak();
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
            yPosition += 0.3;
          });

          yPosition += lineHeight; // Space after chapter heading
          doc.setFont("times", "normal");
          doc.setFontSize(fontSize);
          break;

        case "quote":
          // Quote: Indented, italic
          checkPageBreak();
          doc.setFont("times", "italic");

          const quoteIndent = 0.5;
          const quoteWidth = contentWidth - quoteIndent * 2;
          const quoteLines = doc.splitTextToSize(elementText, quoteWidth);

          quoteLines.forEach((line: string) => {
            checkPageBreak();
            doc.text(line, margins.left + quoteIndent, yPosition);
            yPosition += lineHeight;
          });

          yPosition += lineHeight * 0.5; // Space after quote
          doc.setFont("times", "normal");
          break;

        default:
          // Normal paragraph: Indented first line
          checkPageBreak();
          doc.setFont("times", "normal");
          doc.setFontSize(fontSize);

          const indent = 0.5; // First line indent
          const words = elementText.split(/\s+/);
          let currentLine = "";
          let isFirstLine = true;

          for (let i = 0; i < words.length; i++) {
            const testLine = currentLine
              ? `${currentLine} ${words[i]}`
              : words[i];
            const maxWidth = contentWidth - (isFirstLine ? indent : 0);
            const lineWidth = doc.getTextWidth(testLine);

            if (lineWidth > maxWidth && currentLine !== "") {
              checkPageBreak();
              const xPos = margins.left + (isFirstLine ? indent : 0);
              doc.text(currentLine, xPos, yPosition);
              yPosition += lineHeight;
              currentLine = words[i];
              isFirstLine = false;
            } else {
              currentLine = testLine;
            }
          }

          // Print remaining line
          if (currentLine) {
            checkPageBreak();
            const xPos = margins.left + (isFirstLine ? indent : 0);
            doc.text(currentLine, xPos, yPosition);
            yPosition += lineHeight;
          }

          yPosition += lineHeight * 0.5; // Paragraph spacing
      }

      isFirstElement = false;
    });
  } else if (actualFormat === "screenplay" && html) {
    // Handle screenplay format
    processScreenplayPdf(
      doc,
      html,
      margins,
      pageWidth,
      pageHeight,
      lineHeight,
      fontSize
    );
  } else {
    // Fallback to plain text processing (original behavior)
    // Title at top
    if (actualFormat === "manuscript") {
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text(fileName.toUpperCase(), margins.left, margins.top);

      // Word count (if available)
      const wordCount = text.trim().split(/\s+/).length;
      doc.setFont("times", "normal");
      doc.text(`${wordCount} words`, pageWidth - margins.right, margins.top, {
        align: "right",
      });

      yPosition = margins.top + 0.5;
    }

    // Split text into paragraphs
    const paragraphs = text.split(/\n\n+/);

    // Process each paragraph
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;

      // Indent first line for manuscript
      const indent = actualFormat === "manuscript" ? 0.5 : 0;

      // Split paragraph into lines that fit
      const words = paragraph.trim().split(/\s+/);
      let currentLine = "";
      let isFirstLine = true;

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const lineWidth = doc.getTextWidth(testLine);
        const maxWidth = contentWidth - (isFirstLine ? indent : 0);

        if (lineWidth > maxWidth && currentLine !== "") {
          // Line is full, print it
          checkPageBreak();
          const xPos = margins.left + (isFirstLine ? indent : 0);
          doc.text(currentLine, xPos, yPosition);
          yPosition += lineHeight;
          currentLine = words[i];
          isFirstLine = false;
        } else {
          currentLine = testLine;
        }
      }

      // Print remaining line
      if (currentLine) {
        checkPageBreak();
        const xPos = margins.left + (isFirstLine ? indent : 0);
        doc.text(currentLine, xPos, yPosition);
        yPosition += lineHeight;
      }

      // Paragraph spacing
      yPosition +=
        actualFormat === "manuscript" ? lineHeight : lineHeight * 0.5;
    }
  }

  // Add analysis summary if requested
  if (includeAnalysis && analysis) {
    doc.addPage();
    yPosition = margins.top;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Analysis Summary", margins.left, yPosition);
    yPosition += 0.4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Overall score
    if (analysis.overallScore !== undefined) {
      checkPageBreak();
      doc.text(
        `Overall Score: ${Math.round(analysis.overallScore)}%`,
        margins.left,
        yPosition
      );
      yPosition += 0.3;
    }

    // Key metrics
    if (analysis.metrics) {
      const metrics = analysis.metrics;
      checkPageBreak();
      doc.text(
        `Word Count: ${metrics.totalWords || 0}`,
        margins.left,
        yPosition
      );
      yPosition += 0.25;

      if (metrics.readingTime) {
        checkPageBreak();
        doc.text(
          `Reading Time: ${metrics.readingTime} minutes`,
          margins.left,
          yPosition
        );
        yPosition += 0.25;
      }

      if (metrics.readabilityScore !== undefined) {
        checkPageBreak();
        doc.text(
          `Readability Score: ${Math.round(metrics.readabilityScore)}`,
          margins.left,
          yPosition
        );
        yPosition += 0.25;
      }
    }

    yPosition += 0.2;

    // Top recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      checkPageBreak();
      doc.setFont("helvetica", "bold");
      doc.text("Key Recommendations:", margins.left, yPosition);
      yPosition += 0.3;

      doc.setFont("helvetica", "normal");
      const topRecs = analysis.recommendations.slice(0, 5);

      for (const rec of topRecs) {
        checkPageBreak();

        // Wrap recommendation text
        const recText = `• ${rec.title}: ${rec.description}`;
        const lines = doc.splitTextToSize(recText, contentWidth);

        for (const line of lines) {
          checkPageBreak();
          doc.text(line, margins.left, yPosition);
          yPosition += 0.25;
        }

        yPosition += 0.1;
      }
    }
  }

  // Add page numbers for standard format
  if (format === "standard") {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 0.5, {
        align: "center",
      });
    }
  }

  // Save the PDF with file picker dialog
  await savePdfWithPicker(doc, fileName);
};

/**
 * Process screenplay HTML and format to PDF with proper screenplay formatting
 */
function processScreenplayPdf(
  doc: jsPDF,
  html: string,
  margins: { top: number; bottom: number; left: number; right: number },
  pageWidth: number,
  pageHeight: number,
  lineHeight: number,
  fontSize: number
): void {
  let yPosition = margins.top;

  const checkPageBreak = () => {
    if (yPosition > pageHeight - margins.bottom) {
      doc.addPage();
      yPosition = margins.top;
      const pageNum = doc.getNumberOfPages();
      doc.setFontSize(12);
      doc.text(`${pageNum}.`, pageWidth - margins.right, pageHeight - 0.5, {
        align: "right",
      });
      doc.setFontSize(fontSize);
    }
  };

  // Parse HTML to extract screenplay blocks
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(html, "text/html");
  const blocks = htmlDoc.querySelectorAll("[data-block]");

  blocks.forEach((block) => {
    const blockType = block.getAttribute("data-block") || "action";
    const text = block.textContent?.trim() || "";

    if (!text && blockType !== "spacer") return;

    checkPageBreak();

    switch (blockType) {
      case "scene-heading":
        // Scene heading: bold, all caps, left margin
        doc.setFont("courier", "bold");
        doc.text(text.toUpperCase(), margins.left, yPosition);
        doc.setFont("courier", "normal");
        yPosition += lineHeight * 2; // Extra space after scene heading
        break;

      case "action":
        // Action: normal text, left margin, wrap at 6 inches
        const actionLines = doc.splitTextToSize(text, 6);
        actionLines.forEach((line: string) => {
          checkPageBreak();
          doc.text(line, margins.left, yPosition);
          yPosition += lineHeight;
        });
        yPosition += lineHeight; // Blank line after action
        break;

      case "character":
        // Character: all caps, indented 3.7 inches from left
        yPosition += lineHeight; // Blank line before character
        checkPageBreak();
        doc.text(text.toUpperCase(), margins.left + 2.2, yPosition);
        yPosition += lineHeight;
        break;

      case "parenthetical":
        // Parenthetical: indented 3.1 inches from left
        checkPageBreak();
        doc.text(text, margins.left + 1.6, yPosition);
        yPosition += lineHeight;
        break;

      case "dialogue":
        // Dialogue: indented 2.5 inches, max width 3.5 inches
        const dialogueLines = doc.splitTextToSize(text, 3.5);
        dialogueLines.forEach((line: string) => {
          checkPageBreak();
          doc.text(line, margins.left + 1, yPosition);
          yPosition += lineHeight;
        });
        break;

      case "transition":
        // Transition: all caps, right aligned
        yPosition += lineHeight; // Blank line before transition
        checkPageBreak();
        doc.text(
          text.toUpperCase(),
          pageWidth - margins.right - 0.5,
          yPosition,
          {
            align: "right",
          }
        );
        yPosition += lineHeight * 2; // Extra space after transition
        break;

      case "spacer":
        // Spacer: blank line
        yPosition += lineHeight;
        break;

      default:
        // Default to action formatting
        const defaultLines = doc.splitTextToSize(text, 6);
        defaultLines.forEach((line: string) => {
          checkPageBreak();
          doc.text(line, margins.left, yPosition);
          yPosition += lineHeight;
        });
        yPosition += lineHeight;
    }
  });
}

/**
 * Manuscript Format Settings Interface (matches docxExport)
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
 * Export to PDF in Shunn Standard Manuscript Format
 * Full industry-standard formatting for fiction submissions
 */
export const exportToManuscriptPdf = async ({
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

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter",
  });

  // Set font - jsPDF has limited built-in fonts, map to closest match
  // Serif fonts (Georgia, Garamond, Palatino, Book Antiqua, Century, Cambria, Times) -> times
  // Monospace fonts (Courier New, Courier Prime) -> courier
  const serifFonts = [
    "times-new-roman",
    "georgia",
    "garamond",
    "palatino",
    "book-antiqua",
    "century-schoolbook",
    "cambria",
  ];
  const pdfFontFamily = serifFonts.includes(fontFamily) ? "times" : "courier";
  doc.setFont(pdfFontFamily, "normal");
  doc.setFontSize(12);

  const pageWidth = 8.5;
  const pageHeight = 11;
  const contentWidth = pageWidth - margins.left - margins.right;
  const lineHeight = 0.24; // Double spacing for 12pt

  // Round word count to nearest 100
  const roundedWordCount = Math.round(wordCount / 100) * 100;
  const displayName = penName || authorName;

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

  // ===== TITLE PAGE =====
  let yPosition = margins.top;

  // Author contact info (top-left)
  doc.text(authorName, margins.left, yPosition);
  yPosition += lineHeight;

  if (authorAddress) {
    doc.text(authorAddress, margins.left, yPosition);
    yPosition += lineHeight;
  }

  doc.text(
    `${authorCity}, ${authorState} ${authorZip}`,
    margins.left,
    yPosition
  );
  yPosition += lineHeight;

  if (authorEmail) {
    doc.text(authorEmail, margins.left, yPosition);
    yPosition += lineHeight;
  }

  if (authorPhone) {
    doc.text(authorPhone, margins.left, yPosition);
    yPosition += lineHeight;
  }

  // Word count (top-right)
  doc.text(
    `About ${roundedWordCount.toLocaleString()} words`,
    pageWidth - margins.right,
    margins.top,
    { align: "right" }
  );

  // Title (centered, halfway down the page)
  const titleY = pageHeight / 2 - 0.5;
  doc.text(title.toUpperCase(), pageWidth / 2, titleY, { align: "center" });

  // "by" line
  doc.text("by", pageWidth / 2, titleY + lineHeight * 2, { align: "center" });

  // Author name
  doc.text(displayName, pageWidth / 2, titleY + lineHeight * 4, {
    align: "center",
  });

  // ===== CONTENT PAGES =====
  doc.addPage();
  yPosition = margins.top;
  let currentPage = 2;

  // Helper function to add running header and check page breaks
  const checkPageBreak = () => {
    if (yPosition > pageHeight - margins.bottom) {
      doc.addPage();
      currentPage++;
      yPosition = margins.top;

      // Add running header on new page
      if (includeRunningHeaders) {
        doc.setFontSize(12);
        doc.text(runningHeaderText, margins.left, 0.5);
        doc.text(`${currentPage}`, pageWidth - margins.right, 0.5, {
          align: "right",
        });
      }
    }
  };

  // Add running header to first content page
  if (includeRunningHeaders) {
    doc.text(runningHeaderText, margins.left, 0.5);
    doc.text(`${currentPage}`, pageWidth - margins.right, 0.5, {
      align: "right",
    });
  }

  // Process content
  const contentSource = html || text;
  let paragraphs: string[] = [];

  if (html) {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(html, "text/html");
    const elements = htmlDoc.body.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, blockquote"
    );

    elements.forEach((element) => {
      const elementText = element.textContent?.trim() || "";
      if (elementText) {
        paragraphs.push(elementText);
      }
    });
  } else {
    paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  }

  // Render each paragraph
  for (const para of paragraphs) {
    if (!para.trim()) continue;

    // Word wrap with first-line indent
    const words = para.trim().split(/\s+/);
    let currentLine = "";
    let isFirstLine = true;
    const indent = firstLineIndent;

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const maxWidth = contentWidth - (isFirstLine ? indent : 0);
      const lineWidth = doc.getTextWidth(testLine);

      if (lineWidth > maxWidth && currentLine !== "") {
        checkPageBreak();
        const xPos = margins.left + (isFirstLine ? indent : 0);
        doc.text(currentLine, xPos, yPosition);
        yPosition += lineHeight;
        currentLine = words[i];
        isFirstLine = false;
      } else {
        currentLine = testLine;
      }
    }

    // Print remaining line
    if (currentLine) {
      checkPageBreak();
      const xPos = margins.left + (isFirstLine ? indent : 0);
      doc.text(currentLine, xPos, yPosition);
      yPosition += lineHeight;
    }

    // Double-space between paragraphs (blank line)
    yPosition += lineHeight;
  }

  // Add end marker
  yPosition += lineHeight;
  checkPageBreak();
  doc.text("# # #", pageWidth / 2, yPosition, { align: "center" });

  // Save the PDF with file picker dialog
  const outputFileName = fileName || title || "manuscript";
  await savePdfWithPicker(doc, outputFileName);
};
