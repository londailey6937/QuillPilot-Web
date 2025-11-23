import { ChapterAnalysis } from "@/types";
import { buildHtmlFromTemplate } from "./htmlBuilder";

interface HtmlExportOptions {
  text: string;
  html?: string | null;
  fileName?: string;
  analysis?: ChapterAnalysis | null;
  includeHighlights?: boolean;
}

/**
 * Export document as styled HTML using template
 */
export const exportToHtml = ({
  text,
  html,
  fileName = "edited-chapter",
  analysis,
  includeHighlights = true,
}: HtmlExportOptions): void => {
  const documentTitle = fileName.replace(/\.[^/.]+$/, "") || "Edited Chapter";

  // Build HTML using shared builder
  const finalHtml = buildHtmlFromTemplate({
    text,
    html,
    fileName,
    analysis,
    includeHighlights,
  });

  // Download
  downloadHtmlFile(finalHtml, documentTitle);
};

/**
 * Download HTML string as a file
 */
function downloadHtmlFile(htmlContent: string, baseFileName: string): void {
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = normalizeHtmlFileName(baseFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function normalizeHtmlFileName(fileName: string | null | undefined): string {
  const fallback = "edited-chapter.html";
  if (!fileName || typeof fileName !== "string") {
    return fallback;
  }

  const trimmed = fileName.trim();
  if (!trimmed) {
    return fallback;
  }

  const sanitized = trimmed.replace(/[<>:"/\\|?*]+/g, "-");
  const hasExtension = sanitized.toLowerCase().endsWith(".html");
  return hasExtension ? sanitized : `${sanitized}.html`;
}
