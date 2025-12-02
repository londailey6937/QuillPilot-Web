import React, { useRef } from "react";
import mammoth from "mammoth";
import { wmfToPng, getPlaceholderSvg } from "../utils/wmfUtils";
import {
  processScreenplayDocument,
  isScreenplay,
} from "../utils/screenplayConverter";
import { AccessLevel, ACCESS_TIERS } from "../../types";

// Helper to detect magic numbers
function detectMimeType(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const headerBytes = bytes.subarray(0, 4);
  const header = Array.from(headerBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  switch (header) {
    case "89504e47":
      return "image/png";
    case "ffd8ffe0":
    case "ffd8ffe1":
    case "ffd8ffe2":
      return "image/jpeg";
    case "47494638":
      return "image/gif";
    case "52494646":
      return "image/webp"; // RIFF
    case "49492a00":
      return "image/tiff"; // Little-endian
    case "4d4d002a":
      return "image/tiff"; // Big-endian
    case "d7cdc69a":
      return "image/x-wmf"; // WMF
    case "01000900":
      return "image/x-wmf"; // WMF (Standard)
    case "02000900":
      return "image/x-wmf"; // WMF (Standard)
    case "01000000": {
      // Possible EMF (Record Type 1). Check for " EMF" signature at offset 40
      if (bytes.length >= 44) {
        const signature = String.fromCharCode(...bytes.subarray(40, 44));
        if (signature === " EMF") {
          return "image/x-emf";
        }
      }
      return "";
    }
    default:
      if (header.startsWith("424d")) return "image/bmp";
      return ""; // Unknown, rely on extension
  }
}

function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Post-process HTML from mammoth to add proper formatting classes
 * for title pages, chapter headings, and body text.
 * Mammoth doesn't preserve Word alignment/indentation, so we infer it from content.
 */
function enhanceDocumentFormatting(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const paragraphs = doc.querySelectorAll("p");

  let foundBodyText = false; // Track when we've passed title/front matter
  let consecutiveShortLines = 0; // Track clusters of short lines (front matter)

  paragraphs.forEach((p, index) => {
    const text = p.textContent?.trim() || "";
    const hasImage = p.querySelector("img") !== null;
    const hasOnlyBold =
      p.children.length > 0 &&
      Array.from(p.childNodes).every(
        (node) =>
          (node.nodeType === Node.ELEMENT_NODE &&
            ((node as Element).tagName === "STRONG" ||
              (node as Element).tagName === "B" ||
              ((node as Element).tagName === "EM" &&
                (node as Element).querySelector("strong")))) ||
          (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === "")
      );
    const hasOnlyItalic =
      p.children.length === 1 &&
      (p.children[0].tagName === "EM" || p.children[0].tagName === "I");
    const isShortLine = text.length < 80;
    const isVeryShortLine = text.length < 50;
    const isAllCaps = text === text.toUpperCase() && text.length > 2;
    const looksLikeChapterHeading =
      /^(chapter|part|book|section|prologue|epilogue|introduction|preface|contents|foreword)\s*\d*/i.test(
        text
      );
    const looksLikeCopyright =
      /copyright|©|all rights reserved|published by|printed in/i.test(text);
    const looksLikeFrontMatter =
      /^(by |illustrations|dedication|acknowledgments|table of contents)/i.test(
        text
      ) || looksLikeCopyright;

    // Track consecutive short lines (indicates front matter block)
    if (isShortLine && text.length > 0) {
      consecutiveShortLines++;
    } else if (text.length > 100) {
      consecutiveShortLines = 0;
    }

    // Detect title page content (centered, no indent)
    if (!foundBodyText) {
      // Front matter indicators: short lines, all caps, images, copyright text, etc.
      const isFrontMatter =
        hasImage ||
        looksLikeChapterHeading ||
        looksLikeFrontMatter ||
        text === "" ||
        (isVeryShortLine && isAllCaps) ||
        (isShortLine && (hasOnlyBold || hasOnlyItalic)) ||
        (consecutiveShortLines > 3 && isShortLine); // In a cluster of short lines

      if (isFrontMatter) {
        p.classList.add("title-content");
        // Check for main title (largest/first bold text)
        if (hasOnlyBold && index < 5) {
          p.classList.add("book-title");
        }
      } else if (text.length > 150) {
        // Long paragraph = body text has started
        foundBodyText = true;
        p.classList.add("body-text");
      } else if (text.length > 80) {
        // Medium paragraph in front matter - might be dedication or intro
        p.classList.add("title-content");
      }
    } else {
      // After title page, mark chapter headings and body text
      if (looksLikeChapterHeading || (isVeryShortLine && isAllCaps)) {
        p.classList.add("chapter-heading");
      } else if (hasImage) {
        p.classList.add("image-paragraph");
      } else if (text.length > 0) {
        p.classList.add("body-text");
      }
    }
  });

  return doc.body.innerHTML;
}

export interface UploadedDocumentPayload {
  fileName: string;
  fileType: string;
  format: "html" | "text";
  content: string;
  plainText: string;
  imageCount: number;
  isScreenplay?: boolean;
}

interface DocumentUploaderProps {
  onDocumentLoad: (payload: UploadedDocumentPayload) => void;
  disabled?: boolean;
  accessLevel?: AccessLevel;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onDocumentLoad,
  disabled = false,
  accessLevel = "free",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastIncrementTime = useRef<number>(0);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [hasScreenplay, setHasScreenplay] = React.useState(false);

  const checkUploadLimit = (): boolean => {
    // Only enforce limit for free tier
    if (accessLevel !== "free") return true;

    const uploadKey = "quillpilot_upload_count";
    const uploadCount = parseInt(localStorage.getItem(uploadKey) || "0", 10);

    if (uploadCount >= 3) {
      alert(
        "Free tier limit: 3 document uploads.\n\n" +
          "You've used all 3 free uploads. Upgrade to Premium for unlimited uploads and full analysis features.\n\n" +
          "Premium tier includes:\n" +
          "• Unlimited document uploads\n" +
          "• Up to 650 pages per document\n" +
          "• Full 10-principle analysis\n" +
          "• Export results (HTML, DOCX, JSON)\n" +
          "• Custom domain creation"
      );
      return false;
    }

    return true;
  };

  const incrementUploadCount = () => {
    if (accessLevel !== "free") return;

    // Prevent duplicate increments within 2 seconds
    const now = Date.now();
    if (now - lastIncrementTime.current < 2000) {
      console.log("⏭️ Skipping duplicate upload count increment");
      return;
    }
    lastIncrementTime.current = now;

    const uploadKey = "quillpilot_upload_count";
    const uploadCount = parseInt(localStorage.getItem(uploadKey) || "0", 10);
    localStorage.setItem(uploadKey, String(uploadCount + 1));

    const remaining = 3 - (uploadCount + 1);
    if (remaining > 0) {
      console.log(
        `📊 Free tier: ${remaining} upload${
          remaining === 1 ? "" : "s"
        } remaining`
      );
    } else {
      console.log(
        `📊 Free tier: All 3 uploads used. Upgrade to Premium for unlimited uploads.`
      );
    }
  };

  const loadSampleStory = async () => {
    if (!checkUploadLimit()) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/sample-story.docx");
      if (!response.ok) {
        throw new Error("Failed to load sample story");
      }

      const arrayBuffer = await response.arrayBuffer();
      const file = new File([arrayBuffer], "The Firelight Fairy Book.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Process the file using the same logic as handleFileChange
      const fileName = file.name;
      const fileType = "docx";

      const sourceBuffer = arrayBuffer;
      const htmlBuffer = sourceBuffer.slice(0);
      const textBuffer = sourceBuffer.slice(0);

      let imageCount = 0;
      const htmlResult = await mammoth.convertToHtml(
        { arrayBuffer: htmlBuffer },
        {
          includeDefaultStyleMap: true,
          includeEmbeddedStyleMap: true,
          styleMap: [
            "p => p:fresh",
            "p[style-name='Normal'] => p:fresh",
            // Preserve indentation
            "p => p.preserve-indent:fresh",
          ].join("\n"),
          convertImage: mammoth.images.imgElement((image) => {
            imageCount += 1;
            return image.read("base64").then((base64String) => {
              const buffer = base64ToArrayBuffer(base64String);
              const detectedType = detectMimeType(buffer);

              if (
                ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
                  detectedType
                )
              ) {
                return {
                  src: `data:${detectedType};base64,${base64String}`,
                  alt: `Embedded image ${imageCount} (${detectedType})`,
                  class: "mammoth-image",
                };
              }

              const isExplicitWmf =
                detectedType === "image/x-wmf" ||
                detectedType === "image/x-emf" ||
                image.contentType?.includes("wmf") ||
                image.contentType?.includes("emf");

              if (isExplicitWmf || !detectedType) {
                try {
                  const convertedSrc = wmfToPng(buffer);
                  if (convertedSrc) {
                    return {
                      src: convertedSrc,
                      alt: `Embedded Equation/Image ${imageCount} (Converted)`,
                      class: "mammoth-image wmf-converted",
                    };
                  }
                } catch (err) {
                  // Silently handle WMF conversion errors
                }

                if (isExplicitWmf) {
                  return {
                    src: getPlaceholderSvg("WMF/EMF"),
                    alt: `Embedded Equation/Image ${imageCount} (Conversion Failed)`,
                    class: "mammoth-image wmf-failed",
                  };
                }
              }

              const finalMime = image.contentType || "image/png";
              return {
                src: `data:${finalMime};base64,${base64String}`,
                alt: `Embedded image ${imageCount} (${finalMime})`,
                class: "mammoth-image",
              };
            });
          }),
        }
      );

      const textResult = await mammoth.extractRawText({
        arrayBuffer: textBuffer,
      });

      // Auto-detect and convert screenplay format using plain text as source
      const detectionText = textResult.value || htmlResult.value || "";
      const screenplayResult = processScreenplayDocument(
        detectionText,
        detectionText,
        fileName
      );

      // Enhance HTML with proper formatting classes (title pages, body text, etc.)
      const enhancedHtml = screenplayResult.isScreenplay
        ? screenplayResult.content
        : enhanceDocumentFormatting(htmlResult.value);

      const payload: UploadedDocumentPayload = {
        fileName,
        fileType,
        format: screenplayResult.isScreenplay ? "html" : "html",
        content: enhancedHtml,
        plainText: screenplayResult.plainText,
        imageCount,
        isScreenplay: screenplayResult.isScreenplay,
      };

      console.log("Sample story loaded:", {
        fileName,
        htmlLength: htmlResult.value.length,
        plainTextLength: textResult.value.length,
        htmlPreview: htmlResult.value.substring(0, 500),
        plainTextPreview: textResult.value.substring(0, 200),
      });

      setHasScreenplay(screenplayResult.isScreenplay);
      incrementUploadCount();
      onDocumentLoad(payload);
    } catch (error) {
      console.error("Error loading sample story:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      alert(
        "Failed to load sample story. Please try again or upload your own document."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check upload limit before processing
    if (!checkUploadLimit()) {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsProcessing(true);

    // Allow UI to update before starting heavy processing
    await new Promise((resolve) => setTimeout(resolve, 50));

    const fileName = file.name;
    const fileType = file.name.split(".").pop()?.toLowerCase() || "";

    try {
      // Handle plain text files (.txt)
      if (fileType === "txt") {
        const text = await file.text();
        const plainText = text; // Don't trim - preserve formatting

        // Convert to simple HTML paragraphs, preserving indentation
        const htmlContent = plainText
          .split(/\n\n+/)
          .map((para) => {
            // Preserve leading spaces by converting them to &nbsp;
            const preservedPara = para.replace(/^( +)/gm, (match) =>
              "&nbsp;".repeat(match.length)
            );
            return `<p style="white-space: pre-wrap; color: #000000;">${preservedPara.replace(
              /\n/g,
              "<br>"
            )}</p>`;
          })
          .join("\n");

        incrementUploadCount();

        onDocumentLoad({
          fileName,
          fileType: "text",
          format: "html",
          content: htmlContent,
          plainText,
          imageCount: 0,
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Handle Markdown files (.md)
      if (fileType === "md" || fileType === "markdown") {
        const text = await file.text();
        const plainText = text; // Don't trim - preserve formatting

        // Basic Markdown to HTML conversion
        let htmlContent = plainText
          // Headers
          .replace(/^### (.*$)/gim, "<h3>$1</h3>")
          .replace(/^## (.*$)/gim, "<h2>$1</h2>")
          .replace(/^# (.*$)/gim, "<h1>$1</h1>")
          // Bold
          .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
          .replace(/__(.*?)__/gim, "<strong>$1</strong>")
          // Italic
          .replace(/\*(.*?)\*/gim, "<em>$1</em>")
          .replace(/_(.*?)_/gim, "<em>$1</em>")
          // Code
          .replace(/`(.*?)`/gim, "<code>$1</code>")
          // Line breaks and paragraphs
          .split(/\n\n+/)
          .map((para) => {
            // Skip if already an HTML tag
            if (para.trim().startsWith("<h") || para.trim().startsWith("<")) {
              return para;
            }
            // Preserve leading spaces by converting them to &nbsp;
            const preservedPara = para.replace(/^( +)/gm, (match) =>
              "&nbsp;".repeat(match.length)
            );
            return `<p style="white-space: pre-wrap; color: #000000;">${preservedPara.replace(
              /\n/g,
              "<br>"
            )}</p>`;
          })
          .join("\n");

        // Strip Markdown for plain text
        const strippedText = plainText
          .replace(/^#{1,6}\s+/gm, "")
          .replace(/\*\*/g, "")
          .replace(/__/g, "")
          .replace(/\*/g, "")
          .replace(/_/g, "")
          .replace(/`/g, "");

        incrementUploadCount();

        onDocumentLoad({
          fileName,
          fileType: "markdown",
          format: "html",
          content: htmlContent,
          plainText: strippedText.trim(),
          imageCount: 0,
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      if (fileType === "docx") {
        const sourceBuffer = await file.arrayBuffer();
        const htmlBuffer = sourceBuffer.slice(0);
        const textBuffer = sourceBuffer.slice(0);

        let imageCount = 0;
        const htmlResult = await mammoth.convertToHtml(
          { arrayBuffer: htmlBuffer },
          {
            includeDefaultStyleMap: true,
            includeEmbeddedStyleMap: true,
            styleMap: [
              "p => p:fresh",
              "p[style-name='Normal'] => p:fresh",
              // Preserve indentation
              "p => p.preserve-indent:fresh",
            ].join("\n"),
            convertImage: mammoth.images.imgElement((image) => {
              imageCount += 1;
              return image.read("base64").then((base64String) => {
                const buffer = base64ToArrayBuffer(base64String);
                const detectedType = detectMimeType(buffer);

                // Only log for non-WMF images to reduce console noise
                const isWmfType =
                  detectedType === "image/x-wmf" ||
                  detectedType === "image/x-emf" ||
                  image.contentType?.includes("wmf") ||
                  image.contentType?.includes("emf");

                if (!isWmfType) {
                  // Image extracted silently
                }

                // 1. If it's a known web-safe format, render it directly.
                if (
                  [
                    "image/png",
                    "image/jpeg",
                    "image/gif",
                    "image/webp",
                  ].includes(detectedType)
                ) {
                  return {
                    src: `data:${detectedType};base64,${base64String}`,
                    alt: `Embedded image ${imageCount} (${detectedType})`,
                    class: "mammoth-image",
                  };
                }

                // 2. If it's WMF/EMF (detected or declared) OR unknown (likely raw WMF), try conversion.
                const isExplicitWmf =
                  detectedType === "image/x-wmf" ||
                  detectedType === "image/x-emf" ||
                  image.contentType?.includes("wmf") ||
                  image.contentType?.includes("emf");

                // If we don't know what it is, it's often a WMF in disguise (Word does this).
                if (isExplicitWmf || !detectedType) {
                  try {
                    const convertedSrc = wmfToPng(buffer);
                    if (convertedSrc) {
                      return {
                        src: convertedSrc,
                        alt: `Embedded Equation/Image ${imageCount} (Converted)`,
                        class: "mammoth-image wmf-converted",
                      };
                    }
                  } catch (err) {
                    // Silently handle WMF conversion errors (known issue with MathType equations)
                  }

                  // If conversion failed AND it was explicitly WMF, show the error placeholder.
                  // If it was just "unknown", we fall through to the generic handler just in case it's something else.
                  if (isExplicitWmf) {
                    return {
                      src: getPlaceholderSvg("WMF/EMF"),
                      alt: `Embedded Equation/Image ${imageCount} (Conversion Failed)`,
                      class: "mammoth-image wmf-failed",
                    };
                  }
                }

                // 3. Fallback: Trust the declared type or default to PNG.
                // This handles cases where detection failed but the browser might still understand it,
                // or if it's a format we don't have a magic number for yet.
                const finalMime = image.contentType || "image/png";
                return {
                  src: `data:${finalMime};base64,${base64String}`,
                  alt: `Embedded image ${imageCount} (${finalMime})`,
                  class: "mammoth-image",
                };
              });
            }),
          }
        );

        const textResult = await mammoth.extractRawText({
          arrayBuffer: textBuffer,
        });
        const rawHtml = htmlResult.value?.trim() ?? "";
        const plainText = textResult.value?.trim() ?? "";

        // Check if the DOCX has styling/indentation (indicates already formatted screenplay)
        const hasInlineStyles =
          rawHtml.includes("style=") || rawHtml.includes("margin-left");
        const hasParagraphIndents = /margin-left:\s*\d+/.test(rawHtml);

        console.log("[DocumentUploader] DOCX analysis:", {
          hasInlineStyles,
          hasParagraphIndents,
          htmlLength: rawHtml.length,
          htmlPreview: rawHtml.substring(0, 300),
        });

        // Estimate page count (approximately 350 words per page for textbooks)
        const wordCount = plainText
          .split(/\s+/)
          .filter((w) => w.length > 0).length;
        const estimatedPages = Math.ceil(wordCount / 350);
        const maxPages = ACCESS_TIERS[accessLevel].maxPages;

        // Check page limit
        if (estimatedPages > maxPages) {
          const tierName =
            accessLevel === "free"
              ? "Free (Single Chapter)"
              : accessLevel === "premium"
              ? "Premium (Full Textbook)"
              : "Professional";
          alert(
            `Document too large: ~${estimatedPages} pages detected.\n\n` +
              `Your ${tierName} tier allows up to ${maxPages} pages.\n\n` +
              (accessLevel === "free"
                ? "Free tier: Up to 200 pages (multiple chapters)\n" +
                  "Premium tier: Up to 650 pages (full textbooks)\n" +
                  "Professional tier: Up to 1,000 pages (large comprehensive texts)\n\n" +
                  "Please upgrade or split your document into smaller sections."
                : accessLevel === "premium"
                ? "Premium tier: Up to 650 pages (typical undergraduate textbook)\n" +
                  "Professional tier: Up to 1,000 pages (reference books, handbooks)\n\n" +
                  "Please upgrade or split your document."
                : "Please split your document into smaller sections.")
          );
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        const fallbackPlainText = rawHtml
          ? rawHtml
              .replace(
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                ""
              )
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/&nbsp;/g, " ")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&")
              .replace(/\s+/g, " ")
              .trim()
          : "";

        if (!rawHtml && !plainText && !fallbackPlainText) {
          throw new Error("No content extracted from DOCX");
        }

        // Auto-detect screenplay format
        // Extract text line-by-line from HTML to preserve paragraph structure
        const extractTextFromHtml = (html: string): string => {
          // First, replace <br> tags with newlines to preserve line breaks within paragraphs
          const htmlWithNewlines = html
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>\s*<p[^>]*>/gi, "\n");

          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlWithNewlines, "text/html");
          const text = doc.body.textContent || "";

          // Clean up excessive blank lines but preserve intentional spacing
          return text
            .split("\n")
            .map((line) => line.trim())
            .join("\n");
        };

        const textForDetection = rawHtml
          ? extractTextFromHtml(rawHtml)
          : plainText || fallbackPlainText || "";

        const lines = textForDetection.split("\n");
        console.log("[DocumentUploader] Text extraction debug:");
        console.log("  Total lines:", lines.length);
        console.log("  Total chars:", textForDetection.length);
        console.log("  First 20 lines:");
        lines.slice(0, 20).forEach((line, i) => {
          console.log(`    ${i}: "${line}"`);
        });

        const screenplayResult = processScreenplayDocument(
          textForDetection,
          textForDetection,
          fileName
        );

        console.log("[DocumentUploader] Screenplay result:", {
          isScreenplay: screenplayResult.isScreenplay,
          contentLength: screenplayResult.content.length,
          alreadyFormatted: hasParagraphIndents,
          textPreview: textForDetection.substring(0, 200),
        });

        if (screenplayResult.isScreenplay) {
          console.log("[DocumentUploader] Screenplay HTML sample:");
          console.log(screenplayResult.content.substring(0, 1500));
          console.log("\n[DocumentUploader] Screenplay HTML (lines 50-100):");
          const htmlLines = screenplayResult.content.split("\n");
          console.log(htmlLines.slice(50, 100).join("\n"));
        }

        // Case 1: Already formatted DOCX screenplay - preserve Word HTML with inline styles
        // Case 2: Unformatted screenplay - use our converted HTML with CSS classes
        const shouldUseWordFormatting =
          screenplayResult.isScreenplay && hasParagraphIndents && rawHtml;

        // Enhance HTML with proper formatting classes for non-screenplay documents
        const enhancedHtml =
          !screenplayResult.isScreenplay && rawHtml
            ? enhanceDocumentFormatting(rawHtml)
            : rawHtml;

        const payload: UploadedDocumentPayload = {
          fileName,
          fileType,
          format: screenplayResult.isScreenplay || rawHtml ? "html" : "text",
          content: shouldUseWordFormatting
            ? rawHtml
            : screenplayResult.isScreenplay
            ? screenplayResult.content
            : enhancedHtml || plainText,
          plainText: screenplayResult.plainText,
          imageCount,
          isScreenplay: screenplayResult.isScreenplay,
        };

        // Document loaded successfully
        console.log("✅ Document processed, calling onDocumentLoad", {
          fileName,
          contentLength: payload.content.length,
          plainTextLength: payload.plainText.length,
        });
        setHasScreenplay(screenplayResult.isScreenplay);
        incrementUploadCount();
        onDocumentLoad(payload);
      } else if (fileType === "txt") {
        const textContent = await file.text();

        if (!textContent.trim()) {
          alert(
            "Could not extract text from the document. Please try a different file."
          );
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        // Estimate page count (approximately 350 words per page)
        const wordCount = textContent
          .split(/\s+/)
          .filter((w) => w.length > 0).length;
        const estimatedPages = Math.ceil(wordCount / 350);
        const maxPages = ACCESS_TIERS[accessLevel].maxPages;

        // Check page limit
        if (estimatedPages > maxPages) {
          const tierName =
            accessLevel === "free"
              ? "Free"
              : accessLevel === "premium"
              ? "Premium"
              : "Professional";
          alert(
            `Document too large: ~${estimatedPages} pages detected.\n\n` +
              `Your ${tierName} tier allows up to ${maxPages} pages.\n\n` +
              "Please upgrade or split your document."
          );
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        // Auto-detect and convert screenplay format
        const screenplayResult = processScreenplayDocument(
          textContent,
          textContent,
          fileName
        );

        const payload: UploadedDocumentPayload = {
          fileName,
          fileType,
          format: screenplayResult.isScreenplay ? "html" : "text",
          content: screenplayResult.isScreenplay
            ? screenplayResult.content
            : textContent,
          plainText: screenplayResult.plainText,
          imageCount: 0,
          isScreenplay: screenplayResult.isScreenplay,
        };

        console.log("✅ TXT document processed, calling onDocumentLoad", {
          fileName,
          contentLength: textContent.length,
        });
        setHasScreenplay(screenplayResult.isScreenplay);
        incrementUploadCount();
        onDocumentLoad(payload);
      } else {
        alert(
          "Please upload a .docx or .txt file.\n\n" +
            "Note: Legacy .doc files are not supported. Please save as .docx or convert to .txt first."
        );
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
    } catch (error) {
      console.error("❌ Error reading document:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check if it's a .doc file error
      if (fileType === "doc" || errorMessage.toLowerCase().includes("doc")) {
        alert(
          "Cannot process .doc files.\n\n" +
            "Legacy .doc format is not supported. Please:\n" +
            "• Open the file in Microsoft Word\n" +
            "• Save As → Choose .docx format\n" +
            "• Or export as .txt file\n\n" +
            "Then upload the converted file."
        );
      } else {
        alert(
          "Error reading document.\n\n" +
            "Please ensure:\n" +
            "• File is not corrupted\n" +
            "• File is in .docx or .txt format\n" +
            "• File size is reasonable\n\n" +
            "Try again or convert to a supported format."
        );
      }
      // Reset file input after error
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsProcessing(false);
      // Always reset input so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.txt,.md,.markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: "none" }}
        id="document-upload-input"
      />
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <label
          htmlFor="document-upload-input"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "4px 10px",
            backgroundColor: disabled || isProcessing ? "#e2e8f0" : "#fef5e7",
            color: disabled || isProcessing ? "#9ca3af" : "#2c3e50",
            border: "1.5px solid #e0c392",
            borderRadius: "8px",
            cursor: disabled || isProcessing ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "11px",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isProcessing) {
              e.currentTarget.style.backgroundColor = "#f7e6d0";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !isProcessing) {
              e.currentTarget.style.backgroundColor = "#fef5e7";
            }
          }}
        >
          {isProcessing ? (
            <>
              <span className="upload-spinner"></span>
              Processing...
            </>
          ) : (
            <>📄 Upload</>
          )}
        </label>

        {/* Sample Story Button - Hidden when screenplay is loaded or for paid tiers */}
        {!hasScreenplay && accessLevel === "free" && (
          <button
            onClick={loadSampleStory}
            disabled={disabled || isProcessing}
            style={{
              padding: "10px 24px",
              backgroundColor: "#f7e6d0",
              color: "#8b5a3c",
              border: "1.5px solid #c16659",
              borderRadius: "20px",
              cursor: disabled || isProcessing ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s",
              opacity: disabled || isProcessing ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!disabled && !isProcessing) {
                e.currentTarget.style.backgroundColor = "#f7e6d0";
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !isProcessing) {
                e.currentTarget.style.backgroundColor = "#fef5e7";
              }
            }}
          >
            📖 Use Our Sample Story
          </button>
        )}
      </div>
      <style>{`
        .upload-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #c16659;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};
