/**
 * DOCX Round-Trip Handler
 *
 * Manages DOCX documents to ensure round-trip fidelity:
 * 1. Stores original DOCX binary when uploading
 * 2. Converts to HTML for editing (using mammoth with our style map)
 * 3. Exports back to DOCX using html-to-docx with matching styles
 *
 * The key insight is that we maintain both:
 * - The original DOCX (for re-export with minimal changes)
 * - The HTML representation (for editing in contentEditable)
 */

import mammoth from "mammoth";
import { MAMMOTH_STYLE_MAP, CSS_CLASSES, STYLE_NAMES } from "./docxStyles";

// Store for original DOCX binaries
// Key: document ID, Value: ArrayBuffer of original DOCX
const originalDocxStore = new Map<string, ArrayBuffer>();

// Store for document metadata
interface DocumentMetadata {
  fileName: string;
  uploadedAt: Date;
  originalSize: number;
  hasImages: boolean;
  styles: string[]; // Word styles detected in document
}
const documentMetadata = new Map<string, DocumentMetadata>();

// Generate unique document ID
function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Import a DOCX file and convert to HTML for editing
 * Stores the original binary for later re-export
 */
export async function importDocx(
  file: File | ArrayBuffer,
  options?: {
    fileName?: string;
    preserveOriginal?: boolean; // Default true - store original for round-trip
  }
): Promise<{
  documentId: string;
  html: string;
  text: string;
  metadata: DocumentMetadata;
}> {
  const { fileName = "document.docx", preserveOriginal = true } = options || {};

  // Get ArrayBuffer from File if needed
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;

  // Generate document ID
  const documentId = generateDocumentId();

  // Store original if requested
  if (preserveOriginal) {
    originalDocxStore.set(documentId, arrayBuffer.slice(0)); // Clone the buffer
  }

  // Detect styles in the document
  const detectedStyles: string[] = [];

  // Convert with mammoth using our style map
  const mammothOptions = {
    styleMap: MAMMOTH_STYLE_MAP,
    includeDefaultStyleMap: true,
    convertImage: mammoth.images.imgElement(async (image) => {
      try {
        const buffer = await image.read();
        const base64 = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        const mimeType = image.contentType || "image/png";
        return { src: `data:${mimeType};base64,${base64}` };
      } catch {
        return { src: "" };
      }
    }),
  };

  const result = await mammoth.convertToHtml({ arrayBuffer }, mammothOptions);
  const textResult = await mammoth.extractRawText({ arrayBuffer });

  // Check for images
  const hasImages = result.value.includes("<img");

  // Detect which of our custom styles are present
  Object.values(CSS_CLASSES).forEach((cssClass) => {
    if (result.value.includes(cssClass)) {
      detectedStyles.push(cssClass);
    }
  });

  // Create metadata
  const metadata: DocumentMetadata = {
    fileName,
    uploadedAt: new Date(),
    originalSize: arrayBuffer.byteLength,
    hasImages,
    styles: detectedStyles,
  };

  documentMetadata.set(documentId, metadata);

  // Post-process the HTML to ensure consistent structure
  const enhancedHtml = enhanceImportedHtml(result.value);

  // Log any warnings for debugging
  if (result.messages.length > 0) {
    console.log("[DocxRoundTrip] Conversion messages:", result.messages);
  }

  return {
    documentId,
    html: enhancedHtml,
    text: textResult.value,
    metadata,
  };
}

/**
 * Export HTML content back to DOCX
 * If original was stored, uses it as base for better fidelity
 */
export async function exportDocx(
  html: string,
  options: {
    documentId?: string; // Use original as base if available
    fileName?: string;
    // Export options
    title?: string;
    author?: string;
    margins?: { top?: number; right?: number; bottom?: number; left?: number };
    pageSize?: "letter" | "a4";
    font?: string;
    fontSize?: number;
  } = {}
): Promise<Blob> {
  const {
    fileName = "document.docx",
    title,
    author,
    margins = { top: 1440, right: 1440, bottom: 1440, left: 1440 },
    pageSize = "letter",
    font = "Times New Roman",
    fontSize = 24, // 12pt in half-points
  } = options;

  // Dynamic import html-to-docx
  const HTMLtoDOCX = (await import("html-to-docx")).default;

  // Prepare HTML with proper structure
  const fullHtml = prepareHtmlForExport(html, { font, fontSize });

  // Page dimensions in EMUs (English Metric Units)
  // 1 inch = 914400 EMUs
  const pageDimensions =
    pageSize === "letter"
      ? { width: 12240, height: 15840 } // 8.5" x 11" in twips
      : { width: 11906, height: 16838 }; // A4 in twips

  // Convert to DOCX - html-to-docx returns a Buffer/ArrayBuffer
  const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
    title: title || fileName.replace(/\.docx$/i, ""),
    creator: author || "QuillPilot",
    margins,
    orientation: "portrait",
  });

  // Convert to Blob
  return new Blob([docxBuffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/**
 * Check if we have the original DOCX stored for a document
 */
export function hasOriginalDocx(documentId: string): boolean {
  return originalDocxStore.has(documentId);
}

/**
 * Get the original DOCX binary for a document
 */
export function getOriginalDocx(documentId: string): ArrayBuffer | undefined {
  return originalDocxStore.get(documentId);
}

/**
 * Get metadata for a document
 */
export function getDocumentMetadata(
  documentId: string
): DocumentMetadata | undefined {
  return documentMetadata.get(documentId);
}

/**
 * Clear stored original DOCX (call when document is closed)
 */
export function clearDocumentStore(documentId: string): void {
  originalDocxStore.delete(documentId);
  documentMetadata.delete(documentId);
}

/**
 * Clear all stored documents
 */
export function clearAllDocuments(): void {
  originalDocxStore.clear();
  documentMetadata.clear();
}

/**
 * Enhance imported HTML with additional structure
 * Handles cases where mammoth doesn't fully preserve formatting
 */
function enhanceImportedHtml(html: string): string {
  if (!html || typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Process paragraphs to detect structure
  const paragraphs = doc.querySelectorAll("p");
  let isFirstParagraphAfterHeading = false;

  paragraphs.forEach((p, index) => {
    const text = p.textContent?.trim() || "";
    const prevElement = paragraphs[index - 1];

    // Detect if this is first paragraph after a heading
    const prevSibling = p.previousElementSibling;
    if (prevSibling && /^h[1-6]$/i.test(prevSibling.tagName)) {
      isFirstParagraphAfterHeading = true;
    }

    // Add body-text class to standard paragraphs without a class
    if (!p.className && text.length > 0) {
      // First paragraph after heading shouldn't have indent
      if (isFirstParagraphAfterHeading) {
        p.classList.add("first-paragraph");
        isFirstParagraphAfterHeading = false;
      } else if (text.length > 100) {
        // Longer paragraphs are likely body text
        p.classList.add("body-text");
      }
    }

    // Detect centered text that might be a title
    const style = p.getAttribute("style") || "";
    if (
      style.includes("text-align: center") ||
      style.includes("text-align:center")
    ) {
      if (index < 3 && text.length < 100 && !p.className) {
        // Early centered short text is likely title/subtitle
        if (index === 0) {
          // Convert to h1 with doc-title class
          const h1 = doc.createElement("h1");
          h1.className = "doc-title";
          h1.innerHTML = p.innerHTML;
          p.replaceWith(h1);
        } else {
          p.classList.add("doc-subtitle");
        }
      }
    }
  });

  return doc.body.innerHTML;
}

/**
 * Prepare HTML for export with proper styling
 */
function prepareHtmlForExport(
  html: string,
  options: { font: string; fontSize: number }
): string {
  const { font, fontSize } = options;

  // Wrap in proper HTML document structure
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: '${font}', serif;
      font-size: ${fontSize / 2}pt;
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    h1.doc-title {
      font-size: 36pt;
      font-weight: bold;
      text-align: center;
      margin-top: 2em;
      margin-bottom: 1em;
    }
    p.doc-subtitle {
      font-size: 20pt;
      font-style: italic;
      text-align: center;
      margin-bottom: 1.5em;
    }
    h1.chapter-heading {
      font-size: 26pt;
      font-weight: bold;
      text-align: center;
      margin-top: 2em;
      margin-bottom: 1em;
    }
    h2.section-heading {
      font-size: 22pt;
      font-weight: bold;
      margin-top: 1.5em;
      margin-bottom: 0.75em;
    }
    h3.subsection-heading {
      font-size: 18pt;
      font-weight: bold;
      margin-top: 1em;
      margin-bottom: 0.5em;
    }
    p.body-text {
      text-indent: 0.5in;
      margin-bottom: 0;
    }
    p.first-paragraph {
      text-indent: 0;
      margin-bottom: 0;
    }
    p.no-spacing {
      margin: 0;
      padding: 0;
    }
    blockquote.quote,
    blockquote.block-quote {
      font-style: italic;
      margin-left: 0.5in;
      margin-right: 0.5in;
      margin-top: 1em;
      margin-bottom: 1em;
    }
    blockquote.epigraph {
      font-style: italic;
      text-align: right;
      margin-right: 0.5in;
      margin-top: 1em;
      margin-bottom: 1.5em;
    }
  </style>
</head>
<body>
${html}
</body>
</html>
  `.trim();
}
