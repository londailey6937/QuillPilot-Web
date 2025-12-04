/**
 * File System Access API utilities for local chapter management
 * DOCX is the main format for the app - HTML, MD, JSON, PDF are export options only
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  ImageRun,
  convertInchesToTwip,
} from "docx";
import mammoth from "mammoth";

export interface ChapterFile {
  id: string;
  name: string;
  content: string;
  editorHtml?: string;
  analysis?: any;
  lastModified: number;
  fileName: string;
}

export interface ChapterMetadata {
  id: string;
  name: string;
  fileName: string;
  lastModified: number;
}

// Check if File System Access API is supported
export function isFileSystemAccessSupported(): boolean {
  return "showDirectoryPicker" in window;
}

// Request directory access from user
export async function requestDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
  try {
    if (!isFileSystemAccessSupported()) {
      throw new Error("File System Access API not supported in this browser");
    }

    const dirHandle = await (window as any).showDirectoryPicker({
      mode: "readwrite",
      startIn: "documents",
    });

    // Store directory handle permission
    await storeDirectoryHandle(dirHandle);
    return dirHandle;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      // User cancelled the picker
      return null;
    }
    console.error("Error requesting directory access:", error);
    throw error;
  }
}

// Store directory handle in IndexedDB for persistence
async function storeDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(["settings"], "readwrite");
    const store = transaction.objectStore("settings");
    await store.put({ key: "chapterDirectory", handle: dirHandle });
  } catch (error) {
    console.error("Error storing directory handle:", error);
  }
}

// Retrieve stored directory handle
export async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(["settings"], "readonly");
    const store = transaction.objectStore("settings");

    return new Promise((resolve, reject) => {
      const request = store.get("chapterDirectory");

      request.onsuccess = async () => {
        const result = request.result;
        if (result?.handle) {
          try {
            // Verify we still have permission
            const permission = await (result.handle as any).queryPermission({
              mode: "readwrite",
            });
            if (permission === "granted") {
              resolve(result.handle);
            } else if (permission === "prompt") {
              const newPermission = await (
                result.handle as any
              ).requestPermission({ mode: "readwrite" });
              if (newPermission === "granted") {
                resolve(result.handle);
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error("Error checking permissions:", error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error retrieving directory handle:", error);
    return null;
  }
}

// Open IndexedDB for storing handles
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("QuillPilotDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("chapters")) {
        db.createObjectStore("chapters", { keyPath: "id" });
      }
    };
  });
}

/**
 * Convert HTML content to DOCX paragraphs with proper style mapping
 */
function htmlToDocxParagraphs(html: string): (Paragraph | ImageRun)[] {
  const paragraphs: Paragraph[] = [];

  // Create a temporary container to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Get all block-level elements
  const elements = temp.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, div, blockquote"
  );

  if (elements.length === 0) {
    // No block elements - treat content as single paragraph
    const textContent = temp.textContent || "";
    if (textContent.trim()) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(textContent.trim())],
          spacing: { after: 200 },
        })
      );
    }
  } else {
    // Process each block element
    for (const el of elements) {
      const element = el as HTMLElement;
      const textRuns: TextRun[] = [];

      // Process child nodes to preserve inline formatting
      processNodeForDocx(element, textRuns, {});

      // Map CSS classes to DOCX styles
      const className = element.className || "";
      const style = element.getAttribute("style") || "";
      const tagName = element.tagName.toLowerCase();

      // Determine alignment
      let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] =
        AlignmentType.LEFT;
      if (
        className.includes("book-title") ||
        className.includes("chapter-heading") ||
        className.includes("scene-break") ||
        className.includes("subtitle") ||
        style.includes("text-align: center") ||
        style.includes("text-align:center")
      ) {
        alignment = AlignmentType.CENTER;
      } else if (
        style.includes("text-align: right") ||
        className.includes("epigraph")
      ) {
        alignment = AlignmentType.RIGHT;
      }

      // Determine heading level and font size
      let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
      let fontSize: number | undefined;
      let bold = false;
      let italic = false;

      if (className.includes("book-title") || tagName === "h1") {
        heading = HeadingLevel.TITLE;
        fontSize = 48; // 24pt
        bold = true;
      } else if (className.includes("chapter-heading") || tagName === "h2") {
        heading = HeadingLevel.HEADING_1;
        fontSize = 36; // 18pt
        bold = true;
      } else if (className.includes("subtitle")) {
        fontSize = 26; // 13pt
        italic = true;
      } else if (className.includes("epigraph") || tagName === "blockquote") {
        italic = true;
      }

      // Apply formatting to text runs if needed
      const formattedRuns = textRuns.map((run) => {
        const runProps: any = {};
        if (fontSize) runProps.size = fontSize;
        if (bold) runProps.bold = true;
        if (italic) runProps.italics = true;

        // If run already has formatting, preserve it
        return run;
      });

      paragraphs.push(
        new Paragraph({
          children:
            formattedRuns.length > 0 ? formattedRuns : [new TextRun("")],
          alignment,
          heading,
          spacing: { after: 200 },
        })
      );
    }
  }

  return paragraphs.length > 0
    ? paragraphs
    : [new Paragraph({ children: [new TextRun("")] })];
}

/**
 * Process a DOM node and its children to create TextRun objects with formatting
 */
function processNodeForDocx(
  node: Node,
  textRuns: TextRun[],
  formatting: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
  }
): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    if (text) {
      textRuns.push(
        new TextRun({
          text,
          bold: formatting.bold,
          italics: formatting.italic,
          underline: formatting.underline ? {} : undefined,
          strike: formatting.strike,
        })
      );
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    // Update formatting based on tag
    const newFormatting = { ...formatting };
    if (tagName === "b" || tagName === "strong") {
      newFormatting.bold = true;
    }
    if (tagName === "i" || tagName === "em") {
      newFormatting.italic = true;
    }
    if (tagName === "u") {
      newFormatting.underline = true;
    }
    if (tagName === "s" || tagName === "strike" || tagName === "del") {
      newFormatting.strike = true;
    }

    // Handle line breaks
    if (tagName === "br") {
      textRuns.push(new TextRun({ text: "", break: 1 }));
      return;
    }

    // Skip nested block elements (they'll be processed separately)
    if (
      ["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"].includes(
        tagName
      )
    ) {
      return;
    }

    // Process children
    for (const child of node.childNodes) {
      processNodeForDocx(child, textRuns, newFormatting);
    }
  }
}

/**
 * Create a DOCX document from chapter content
 */
async function createDocxFromChapter(chapter: ChapterFile): Promise<Blob> {
  const html = chapter.editorHtml || `<p>${chapter.content}</p>`;
  const paragraphs = htmlToDocxParagraphs(html);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs as Paragraph[],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Convert DOCX file to HTML using mammoth with style mapping
 */
async function docxToHtml(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      // Map Word styles to CSS classes for better preservation
      styleMap: [
        "p[style-name='Title'] => p.book-title:fresh",
        "p[style-name='Heading 1'] => p.chapter-heading:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Subtitle'] => p.subtitle:fresh",
        "p[style-name='Quote'] => p.epigraph:fresh",
        "p[style-name='Intense Quote'] => p.epigraph:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
      ],
    }
  );
  return result.value;
}

// Save a chapter to the selected directory as DOCX
export async function saveChapterToFolder(
  dirHandle: FileSystemDirectoryHandle,
  chapter: ChapterFile
): Promise<void> {
  try {
    // Save the DOCX file
    const docxFileName = sanitizeFileName(
      chapter.fileName || chapter.name,
      ".docx"
    );
    const docxHandle = await dirHandle.getFileHandle(docxFileName, {
      create: true,
    });
    const docxWritable = await docxHandle.createWritable();

    const docxBlob = await createDocxFromChapter(chapter);
    await docxWritable.write(docxBlob);
    await docxWritable.close();

    // Save metadata as a separate JSON file (for analysis results, id, etc.)
    // IMPORTANT: Also save the editorHtml and content here since mammoth can't reliably
    // read back DOCX files created by the docx library
    const metaFileName = sanitizeFileName(
      chapter.fileName || chapter.name,
      ".qpmeta.json"
    );
    const metaHandle = await dirHandle.getFileHandle(metaFileName, {
      create: true,
    });
    const metaWritable = await metaHandle.createWritable();

    const metadata = JSON.stringify(
      {
        id: chapter.id,
        name: chapter.name,
        content: chapter.content, // Store plain text content
        editorHtml: chapter.editorHtml, // Store HTML for round-trip fidelity
        analysis: chapter.analysis,
        lastModified: Date.now(),
        docxFileName: docxFileName,
      },
      null,
      2
    );

    await metaWritable.write(metadata);
    await metaWritable.close();
  } catch (error) {
    console.error("Error saving chapter:", error);
    throw error;
  }
}

// Load all chapters from the directory
export async function loadChaptersFromFolder(
  dirHandle: FileSystemDirectoryHandle
): Promise<ChapterMetadata[]> {
  const chapters: ChapterMetadata[] = [];
  const seenNames = new Set<string>();

  try {
    for await (const entry of (dirHandle as any).values()) {
      if (entry.kind === "file") {
        // Look for DOCX files (main format)
        if (entry.name.endsWith(".docx") && !entry.name.startsWith("~$")) {
          const baseName = entry.name.replace(".docx", "");
          if (seenNames.has(baseName)) continue;
          seenNames.add(baseName);

          try {
            const fileHandle = await dirHandle.getFileHandle(entry.name);
            const file = await fileHandle.getFile();

            // Try to load metadata
            let metadata: any = null;
            try {
              const metaHandle = await dirHandle.getFileHandle(
                baseName + ".qpmeta.json"
              );
              const metaFile = await metaHandle.getFile();
              metadata = JSON.parse(await metaFile.text());
            } catch {
              // No metadata file, that's OK
            }

            chapters.push({
              id: metadata?.id || generateChapterId(),
              name: metadata?.name || baseName.replace(/_/g, " "),
              fileName: entry.name,
              lastModified: metadata?.lastModified || file.lastModified,
            });
          } catch (error) {
            console.error(`Error loading chapter ${entry.name}:`, error);
          }
        }
        // Support legacy JSON files
        else if (
          entry.name.endsWith(".json") &&
          !entry.name.endsWith(".qpmeta.json")
        ) {
          try {
            const fileHandle = await dirHandle.getFileHandle(entry.name);
            const file = await fileHandle.getFile();
            const text = await file.text();
            const data = JSON.parse(text);

            const baseName = entry.name.replace(".json", "");
            if (!seenNames.has(baseName)) {
              seenNames.add(baseName);
              chapters.push({
                id: data.id,
                name: data.name,
                fileName: entry.name,
                lastModified: data.lastModified || file.lastModified,
              });
            }
          } catch (error) {
            console.error(`Error loading chapter ${entry.name}:`, error);
          }
        }
      }
    }

    chapters.sort((a, b) => b.lastModified - a.lastModified);
    return chapters;
  } catch (error) {
    console.error("Error loading chapters:", error);
    throw error;
  }
}

// Load a specific chapter
export async function loadChapterFromFolder(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<ChapterFile | null> {
  try {
    // Handle DOCX files (main format)
    if (fileName.endsWith(".docx")) {
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const arrayBuffer = await file.arrayBuffer();

      // Try to load metadata first - it contains the original content/HTML
      const baseName = fileName.replace(".docx", "");
      let metadata: any = null;
      try {
        const metaHandle = await dirHandle.getFileHandle(
          baseName + ".qpmeta.json"
        );
        const metaFile = await metaHandle.getFile();
        metadata = JSON.parse(await metaFile.text());
      } catch {
        // No metadata file found, will use mammoth conversion
      }

      // If metadata has content/editorHtml, use that (round-trip from our own saves)
      // Otherwise, fall back to mammoth conversion (for external DOCX files)
      let content: string;
      let html: string;

      if (metadata?.editorHtml || metadata?.content) {
        // Use metadata content for round-trip fidelity
        content = metadata.content || "";
        html = metadata.editorHtml || "";

        // If we have content but no HTML, convert content to HTML
        if (content && !html) {
          html = content
            .split(/\n\n+/)
            .map((para: string) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
            .join("");
        }
      } else {
        // Convert DOCX to HTML with style mapping (for external DOCX files)
        html = await docxToHtml(arrayBuffer);

        // Extract plain text
        const temp = document.createElement("div");
        temp.innerHTML = html;
        content = temp.textContent || "";
      }

      return {
        id: metadata?.id || generateChapterId(),
        name: metadata?.name || baseName.replace(/_/g, " "),
        content: content,
        editorHtml: html,
        analysis: metadata?.analysis,
        lastModified: metadata?.lastModified || file.lastModified,
        fileName: fileName,
      };
    }

    // Handle legacy JSON files
    if (fileName.endsWith(".json")) {
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);

      return {
        id: data.id,
        name: data.name,
        content: data.content,
        editorHtml: data.editorHtml,
        analysis: data.analysis,
        lastModified: data.lastModified || file.lastModified,
        fileName: fileName,
      };
    }

    return null;
  } catch (error) {
    console.error("Error loading chapter:", error);
    return null;
  }
}

// Delete a chapter from the directory
export async function deleteChapterFromFolder(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<void> {
  try {
    await dirHandle.removeEntry(fileName);

    // Also try to delete the metadata file if it exists
    const baseName = fileName.replace(/\.(docx|json)$/, "");
    try {
      await dirHandle.removeEntry(baseName + ".qpmeta.json");
    } catch {
      // Metadata file might not exist
    }
  } catch (error) {
    console.error("Error deleting chapter:", error);
    throw error;
  }
}

// Sanitize filename for safe file system usage
function sanitizeFileName(name: string, extension: string = ".docx"): string {
  // Remove any existing extension
  let sanitized = name
    .replace(/\.(json|docx|html|qpmeta\.json)$/i, "")
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .trim();

  // Add the correct extension
  sanitized += extension;

  // Limit length
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    sanitized =
      sanitized.substring(0, maxLength - extension.length) + extension;
  }

  return sanitized;
}

// Generate unique ID for chapters
export function generateChapterId(): string {
  return `chapter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Clear stored directory handle (forget folder)
export async function clearStoredDirectory(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(["settings"], "readwrite");
    const store = transaction.objectStore("settings");
    await store.delete("chapterDirectory");
  } catch (error) {
    console.error("Error clearing stored directory:", error);
  }
}
