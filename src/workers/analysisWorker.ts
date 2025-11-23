// Web Worker for offloading chapter analysis to avoid blocking UI
import { AnalysisEngine } from "../components/AnalysisEngine";
import type { Chapter } from "@/types";
import type { Domain, ConceptDefinition } from "@/data/conceptLibraryRegistry";

interface IncomingMessage {
  chapter: Chapter;
  options: {
    domain?: Domain;
    includeCrossDomain?: boolean;
    customConcepts?: ConceptDefinition[];
  };
}

interface SerializedError {
  name?: string;
  message?: string;
  stack?: string;
  cause?: unknown;
  [key: string]: unknown;
}

const serializeError = (err: unknown): SerializedError => {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message || err.toString(),
      stack: err.stack,
      cause: (err as any).cause,
    };
  }

  if (err && typeof err === "object") {
    try {
      return { ...(err as unknown as Record<string, unknown>) };
    } catch {
      return {
        name: err.constructor?.name,
        message: JSON.stringify(err),
      };
    }
  }

  return {
    message: err === undefined ? "Unknown error" : String(err),
  };
};

self.onmessage = async (evt: MessageEvent<IncomingMessage>) => {
  const { chapter, options } = evt.data;
  const {
    domain = "general", // Default genre for creative writing
  } = options || {};

  // Progress reporting function
  const reportProgress = (step: string, detail?: string) => {
    (self as any).postMessage({ type: "progress", step, detail });
  };

  reportProgress("received", "Chapter received by worker");

  try {
    reportProgress("analysis-start", "Starting analysis pipeline");

    // Run simplified analysis with genre parameter
    const result = await AnalysisEngine.analyzeChapter(
      chapter,
      reportProgress,
      domain // Pass as genre parameter
    );

    reportProgress("analysis-complete", "Analysis complete");
    (self as any).postMessage({ type: "complete", result });
  } catch (err) {
    const serialized = serializeError(err);
    console.error("[Worker] Analysis error:", serialized);

    (self as any).postMessage({
      type: "error",
      error: serialized.message || serialized.name || "Unknown analysis error",
      details: serialized,
    });
  }
};

self.addEventListener("error", (event: ErrorEvent) => {
  const serialized = serializeError(event.error ?? event.message);
  const payload = {
    ...serialized,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  };

  console.error("[Worker] Unhandled error event:", payload);
  event.preventDefault();

  (self as any).postMessage({
    type: "error",
    error:
      payload.message || event.message || "Unhandled worker error occurred",
    details: payload,
  });
});

self.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  const serialized = serializeError(event.reason);

  console.error("[Worker] Unhandled rejection:", serialized);
  event.preventDefault();

  (self as any).postMessage({
    type: "error",
    error:
      serialized.message || serialized.name || "Unhandled promise rejection",
    details: serialized,
  });
});

export {}; // ensure this is treated as a module
