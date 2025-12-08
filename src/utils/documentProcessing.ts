/**
 * Document Processing Utility
 * Provides a promise-based API for the document processing Web Worker
 */

type ProgressCallback = (step: string, detail?: string) => void;

interface DocxProcessingResult {
  html: string;
  plainText: string;
  warnings: string[];
}

interface TextProcessingResult {
  html: string;
}

let workerInstance: Worker | null = null;

/**
 * Get or create the document processing worker
 */
function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(
      new URL("../workers/documentWorker.ts", import.meta.url),
      { type: "module" }
    );
  }
  return workerInstance;
}

/**
 * Process a DOCX file using the Web Worker
 * Falls back to main thread if workers aren't available
 */
export async function processDocxInWorker(
  arrayBuffer: ArrayBuffer,
  options?: {
    styleMap?: string[];
    onProgress?: ProgressCallback;
  }
): Promise<DocxProcessingResult> {
  // Check if workers are available
  if (typeof Worker === "undefined") {
    // Fallback to main thread processing
    const mammoth = await import("mammoth");

    const htmlResult = await mammoth.convertToHtml(
      { arrayBuffer: arrayBuffer.slice(0) },
      {
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true,
        styleMap: options?.styleMap,
      }
    );

    const textResult = await mammoth.extractRawText({
      arrayBuffer: arrayBuffer.slice(0),
    });

    return {
      html: htmlResult.value || "",
      plainText: textResult.value || "",
      warnings: htmlResult.messages
        .filter((m) => m.type === "warning")
        .map((m) => m.message),
    };
  }

  return new Promise((resolve, reject) => {
    const worker = getWorker();

    const messageHandler = (event: MessageEvent) => {
      const data = event.data;

      if (data.type === "progress" && options?.onProgress) {
        options.onProgress(data.step, data.detail);
      } else if (data.type === "docxResult") {
        worker.removeEventListener("message", messageHandler);
        worker.removeEventListener("error", errorHandler);
        resolve({
          html: data.html,
          plainText: data.plainText,
          warnings: data.warnings,
        });
      } else if (data.type === "error") {
        worker.removeEventListener("message", messageHandler);
        worker.removeEventListener("error", errorHandler);
        reject(new Error(data.message));
      }
    };

    const errorHandler = (error: ErrorEvent) => {
      worker.removeEventListener("message", messageHandler);
      worker.removeEventListener("error", errorHandler);
      reject(new Error(error.message));
    };

    worker.addEventListener("message", messageHandler);
    worker.addEventListener("error", errorHandler);

    // Transfer the ArrayBuffer to the worker
    worker.postMessage(
      {
        type: "processDocx",
        arrayBuffer,
        options: { styleMap: options?.styleMap },
      },
      [arrayBuffer]
    );
  });
}

/**
 * Process a plain text file using the Web Worker
 */
export async function processTextInWorker(
  text: string,
  options?: {
    onProgress?: ProgressCallback;
  }
): Promise<TextProcessingResult> {
  // Check if workers are available
  if (typeof Worker === "undefined") {
    // Fallback to main thread processing
    const htmlContent = text
      .split(/\n\n+/)
      .map((para) => {
        const preservedPara = para.replace(/^( +)/gm, (match) =>
          "&nbsp;".repeat(match.length)
        );
        return `<p style="white-space: pre-wrap; color: #000000;">${preservedPara.replace(
          /\n/g,
          "<br>"
        )}</p>`;
      })
      .join("\n");

    return { html: htmlContent };
  }

  return new Promise((resolve, reject) => {
    const worker = getWorker();

    const messageHandler = (event: MessageEvent) => {
      const data = event.data;

      if (data.type === "progress" && options?.onProgress) {
        options.onProgress(data.step, data.detail);
      } else if (data.type === "textResult") {
        worker.removeEventListener("message", messageHandler);
        worker.removeEventListener("error", errorHandler);
        resolve({ html: data.html });
      } else if (data.type === "error") {
        worker.removeEventListener("message", messageHandler);
        worker.removeEventListener("error", errorHandler);
        reject(new Error(data.message));
      }
    };

    const errorHandler = (error: ErrorEvent) => {
      worker.removeEventListener("message", messageHandler);
      worker.removeEventListener("error", errorHandler);
      reject(new Error(error.message));
    };

    worker.addEventListener("message", messageHandler);
    worker.addEventListener("error", errorHandler);

    worker.postMessage({
      type: "processText",
      text,
    });
  });
}

/**
 * Terminate the worker when no longer needed
 */
export function terminateDocumentWorker(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
}
