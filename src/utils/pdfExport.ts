import { jsPDF } from "jspdf";
import { ChapterAnalysis } from "@/types";

interface ExportPdfOptions {
  text: string;
  html?: string | null;
  fileName?: string;
  analysis?: ChapterAnalysis | null;
  includeAnalysis?: boolean;
  format?: "manuscript" | "standard" | "screenplay";
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

  // Set font - Courier for manuscripts and screenplays
  doc.setFont("courier", "normal");
  doc.setFontSize(fontSize);

  // Helper to add new page if needed
  const checkPageBreak = () => {
    if (yPosition > pageHeight - margins.bottom) {
      doc.addPage();
      yPosition = margins.top;

      // Add page number (centered at bottom for manuscript)
      if (format === "manuscript") {
        const pageNum = doc.getNumberOfPages();
        doc.setFontSize(12);
        doc.text(`${pageNum}`, pageWidth / 2, pageHeight - 0.5, {
          align: "center",
        });
        doc.setFontSize(fontSize);
      }
    }
  };

  // Title page for manuscript format
  if (actualFormat === "manuscript") {
    doc.setFontSize(12);
    doc.text(fileName.toUpperCase(), margins.left, margins.top);

    // Word count (if available)
    const wordCount = text.trim().split(/\s+/).length;
    doc.text(`${wordCount} words`, pageWidth - margins.right, margins.top, {
      align: "right",
    });

    yPosition = margins.top + 0.5;
  }

  // Handle screenplay format differently
  if (actualFormat === "screenplay" && html) {
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

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const lineWidth = doc.getTextWidth(testLine);
        const maxWidth = contentWidth - (currentLine === "" ? indent : 0);

        if (lineWidth > maxWidth && currentLine !== "") {
          // Line is full, print it
          checkPageBreak();
          const xPos =
            margins.left +
            (currentLine === paragraph.trim().split(/\s+/)[0] ? indent : 0);
          doc.text(currentLine, xPos, yPosition);
          yPosition += lineHeight;
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }

      // Print remaining line
      if (currentLine) {
        checkPageBreak();
        const xPos = margins.left + indent;
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

  // Save the PDF
  doc.save(`${fileName}.pdf`);
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
