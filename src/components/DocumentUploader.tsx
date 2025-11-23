import React, { useRef } from "react";
import mammoth from "mammoth";
import { wmfToPng, getPlaceholderSvg } from "../utils/wmfUtils";
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

export interface UploadedDocumentPayload {
  fileName: string;
  fileType: string;
  format: "html" | "text";
  content: string;
  plainText: string;
  imageCount: number;
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

  const checkUploadLimit = (): boolean => {
    // Only enforce limit for free tier
    if (accessLevel !== "free") return true;

    const uploadKey = "tomeiq_upload_count";
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

    const uploadKey = "tomeiq_upload_count";
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
      if (fileType === "docx") {
        const sourceBuffer = await file.arrayBuffer();
        const htmlBuffer = sourceBuffer.slice(0);
        const textBuffer = sourceBuffer.slice(0);

        let imageCount = 0;
        const htmlResult = await mammoth.convertToHtml(
          { arrayBuffer: htmlBuffer },
          {
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

        const payload: UploadedDocumentPayload = {
          fileName,
          fileType,
          format: rawHtml ? "html" : "text",
          content: rawHtml || plainText,
          plainText: plainText || fallbackPlainText,
          imageCount,
        };

        // Document loaded successfully
        console.log("✅ Document processed, calling onDocumentLoad", {
          fileName,
          contentLength: payload.content.length,
          plainTextLength: payload.plainText.length,
        });
        incrementUploadCount();
        onDocumentLoad(payload);
      } else if (fileType === "obt") {
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

        // Estimate page count (approximately 350 words per page for textbooks)
        const wordCount = textContent
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
                  "Professional tier: Up to 1,000 pages (comprehensive texts)\n\n" +
                  "Please upgrade."
                : "Please split your document into smaller sections.")
          );
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        const payload: UploadedDocumentPayload = {
          fileName,
          fileType,
          format: "text",
          content: textContent,
          plainText: textContent,
          imageCount: 0,
        };

        console.log("✅ OBT document processed, calling onDocumentLoad", {
          fileName,
          contentLength: textContent.length,
        });
        incrementUploadCount();
        onDocumentLoad(payload);
      } else {
        alert("Please upload a .docx or .obt file");
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
    } catch (error) {
      console.error("❌ Error reading document:", error);
      alert("Error reading document. Please try again.");
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
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.obt"
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: "none" }}
        id="document-upload-input"
      />
      <label
        htmlFor="document-upload-input"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          backgroundColor: "white",
          color: disabled || isProcessing ? "#9ca3af" : "#c16659",
          border:
            disabled || isProcessing
              ? "1.5px solid #d1d5db"
              : "1.5px solid #c16659",
          borderRadius: "20px",
          cursor: disabled || isProcessing ? "not-allowed" : "pointer",
          fontWeight: "600",
          fontSize: "14px",
          transition: "all 0.2s",
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isProcessing) {
            e.currentTarget.style.backgroundColor = "#f7e6d0";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isProcessing) {
            e.currentTarget.style.backgroundColor = "#ffffff";
          }
        }}
      >
        {isProcessing ? (
          <>
            <span className="upload-spinner"></span>
            Processing...
          </>
        ) : (
          <>📄 Upload Document</>
        )}
      </label>
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
      <div
        style={{
          marginTop: "8px",
          fontSize: "12px",
          color: "#6b7280",
        }}
      >
        Supported: Word documents (.docx) and Open Library Text (.obt)
      </div>
    </div>
  );
};
