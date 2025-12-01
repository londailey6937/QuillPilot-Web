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
 * Extract document title from HTML content
 * Looks for: 1) book-title class, 2) first H1, 3) title-content class, 4) first heading
 */
function extractDocumentTitle(html: string | null | undefined): string | null {
  if (!html) return null;

  // Create a DOM parser to extract text content properly
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Priority 1: Look for book-title class
  const bookTitle = doc.querySelector(".book-title");
  if (bookTitle?.textContent?.trim()) {
    return bookTitle.textContent.trim();
  }

  // Priority 2: Look for first H1
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
  // Extract document title from content, fallback to filename, then to "Untitled Document"
  const extractedTitle = extractDocumentTitle(html);
  const fileNameTitle = fileName.replace(/\.[^/.]+$/, "");
  const documentTitle = extractedTitle || fileNameTitle || "Untitled Document";

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
