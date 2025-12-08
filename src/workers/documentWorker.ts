/**
 * Web Worker for document processing
 * Handles heavy document parsing (DOCX via mammoth) off the main thread
 */
import mammoth from "mammoth";

// Types for messages
interface ProcessDocxMessage {
  type: "processDocx";
  arrayBuffer: ArrayBuffer;
  options?: {
    styleMap?: string[];
  };
}

interface ProcessTextMessage {
  type: "processText";
  text: string;
}

type IncomingMessage = ProcessDocxMessage | ProcessTextMessage;

interface DocxResult {
  type: "docxResult";
  html: string;
  plainText: string;
  warnings: string[];
}

interface TextResult {
  type: "textResult";
  html: string;
}

interface ErrorResult {
  type: "error";
  message: string;
}

interface ProgressResult {
  type: "progress";
  step: string;
  detail?: string;
}

// Default mammoth style map
const DEFAULT_STYLE_MAP = [
  "p[style-name='Title'] => h1.doc-title:fresh",
  "p[style-name='Subtitle'] => h2.doc-subtitle:fresh",
  "p[style-name='Heading 1'] => h1.chapter-heading:fresh",
  "p[style-name='Heading 2'] => h2.section-heading:fresh",
  "p[style-name='Quote'] => blockquote.quote:fresh",
  "p[style-name='Block Text'] => p.block-quote:fresh",
];

// Report progress to main thread
const reportProgress = (step: string, detail?: string) => {
  self.postMessage({
    type: "progress",
    step,
    detail,
  } as ProgressResult);
};

// Handle incoming messages
self.onmessage = async (evt: MessageEvent<IncomingMessage>) => {
  const message = evt.data;

  try {
    if (message.type === "processDocx") {
      reportProgress("start", "Starting DOCX processing");

      const { arrayBuffer, options } = message;
      const styleMap = options?.styleMap || DEFAULT_STYLE_MAP;

      // Process HTML extraction
      reportProgress("html", "Extracting HTML from document");
      const htmlResult = await mammoth.convertToHtml(
        { arrayBuffer: arrayBuffer.slice(0) },
        {
          includeDefaultStyleMap: true,
          includeEmbeddedStyleMap: true,
          styleMap,
        }
      );

      // Process plain text extraction
      reportProgress("text", "Extracting plain text");
      const textResult = await mammoth.extractRawText({
        arrayBuffer: arrayBuffer.slice(0),
      });

      reportProgress("complete", "Document processing complete");

      const result: DocxResult = {
        type: "docxResult",
        html: htmlResult.value || "",
        plainText: textResult.value || "",
        warnings: htmlResult.messages
          .filter((m) => m.type === "warning")
          .map((m) => m.message),
      };

      self.postMessage(result);
    } else if (message.type === "processText") {
      reportProgress("start", "Processing text file");

      const { text } = message;

      // Convert plain text to HTML paragraphs
      const htmlContent = text
        .split(/\n\n+/)
        .map((para) => {
          // Preserve leading spaces
          const preservedPara = para.replace(/^( +)/gm, (match) =>
            "&nbsp;".repeat(match.length)
          );
          return `<p style="white-space: pre-wrap; color: #000000;">${preservedPara.replace(
            /\n/g,
            "<br>"
          )}</p>`;
        })
        .join("\n");

      reportProgress("complete", "Text processing complete");

      const result: TextResult = {
        type: "textResult",
        html: htmlContent,
      };

      self.postMessage(result);
    }
  } catch (error) {
    const errorResult: ErrorResult = {
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(errorResult);
  }
};

export {};
