import { jsPDF } from "jspdf";
import { ChapterAnalysis } from "@/types";

interface ExportPdfOptions {
  text: string;
  html?: string | null;
  fileName?: string;
  analysis?: ChapterAnalysis | null;
  includeAnalysis?: boolean;
  format?: "manuscript" | "standard";
}

export const exportToPdf = async ({
  text,
  fileName = "document",
  analysis,
  includeAnalysis = true,
  format = "manuscript",
}: ExportPdfOptions) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter",
  });

  // Manuscript formatting (Shugart standard)
  const margins = {
    top: format === "manuscript" ? 1 : 0.75,
    bottom: format === "manuscript" ? 1 : 0.75,
    left: format === "manuscript" ? 1.25 : 1,
    right: format === "manuscript" ? 1.25 : 1,
  };

  const pageWidth = 8.5;
  const pageHeight = 11;
  const contentWidth = pageWidth - margins.left - margins.right;

  let yPosition = margins.top;
  const lineHeight = format === "manuscript" ? 0.24 : 0.2; // Double-spaced for manuscript
  const fontSize = format === "manuscript" ? 12 : 11;

  // Set font
  doc.setFont("courier", "normal"); // Courier for manuscript, can be changed
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
  if (format === "manuscript") {
    doc.setFontSize(12);
    doc.text(fileName.toUpperCase(), margins.left, margins.top);

    // Word count (if available)
    const wordCount = text.trim().split(/\s+/).length;
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
    const indent = format === "manuscript" ? 0.5 : 0;

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
    yPosition += format === "manuscript" ? lineHeight : lineHeight * 0.5;
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
