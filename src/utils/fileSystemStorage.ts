/**
 * File System Access API utilities for local chapter management
 * Allows users to save/load chapters to/from a local folder
 */

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

// Save a chapter to the selected directory
export async function saveChapterToFolder(
  dirHandle: FileSystemDirectoryHandle,
  chapter: ChapterFile
): Promise<void> {
  try {
    const fileName = sanitizeFileName(chapter.fileName || chapter.name);
    const fileHandle = await dirHandle.getFileHandle(fileName, {
      create: true,
    });
    const writable = await fileHandle.createWritable();

    const data = JSON.stringify(
      {
        id: chapter.id,
        name: chapter.name,
        content: chapter.content,
        editorHtml: chapter.editorHtml,
        analysis: chapter.analysis,
        lastModified: Date.now(),
        fileName: fileName,
      },
      null,
      2
    );

    await writable.write(data);
    await writable.close();
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

  try {
    // TypeScript doesn't know about the async iteration protocol on FileSystemDirectoryHandle
    for await (const entry of (dirHandle as any).values()) {
      if (entry.kind === "file" && entry.name.endsWith(".json")) {
        try {
          const fileHandle = await dirHandle.getFileHandle(entry.name);
          const file = await fileHandle.getFile();
          const text = await file.text();
          const data = JSON.parse(text);

          chapters.push({
            id: data.id,
            name: data.name,
            fileName: entry.name,
            lastModified: data.lastModified || file.lastModified,
          });
        } catch (error) {
          console.error(`Error loading chapter ${entry.name}:`, error);
        }
      }
    }

    // Sort by last modified (newest first)
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
  } catch (error) {
    console.error("Error deleting chapter:", error);
    throw error;
  }
}

// Sanitize filename for safe file system usage
function sanitizeFileName(name: string): string {
  // Remove or replace invalid characters
  let sanitized = name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .trim();

  // Ensure it ends with .json
  if (!sanitized.toLowerCase().endsWith(".json")) {
    sanitized += ".json";
  }

  // Limit length
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    const ext = ".json";
    sanitized = sanitized.substring(0, maxLength - ext.length) + ext;
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
