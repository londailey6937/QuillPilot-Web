import { ChapterAnalysis } from "@/types";
import { buildHtmlFromTemplate } from "./htmlBuilder";
import { saveAs } from "file-saver";

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
export const exportToHtml = async ({
  text,
  html,
  fileName = "edited-chapter",
  analysis,
  includeHighlights = true,
}: HtmlExportOptions): Promise<void> => {
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

  // Download with file picker
  await downloadHtmlFile(finalHtml, documentTitle);
};

/**
 * Download HTML string as a file using File System Access API or fallback
 */
async function downloadHtmlFile(
  htmlContent: string,
  baseFileName: string
): Promise<void> {
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const downloadName = normalizeHtmlFileName(baseFileName);

  // Try to use the modern File System Access API (Chrome, Edge, Opera)
  // This gives users a proper "Save As" dialog to choose the location
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: downloadName,
        types: [
          {
            description: "HTML Document",
            accept: { "text/html": [".html"] },
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
  saveAs(blob, downloadName);
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
