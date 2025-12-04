/**
 * Chapter Library Component
 * Manages local chapters using File System Access API
 */

import React, { useState, useEffect } from "react";
import {
  isFileSystemAccessSupported,
  requestDirectoryAccess,
  getStoredDirectoryHandle,
  loadChaptersFromFolder,
  loadChapterFromFolder,
  saveChapterToFolder,
  deleteChapterFromFolder,
  clearStoredDirectory,
  generateChapterId,
  type ChapterFile,
  type ChapterMetadata,
} from "../utils/fileSystemStorage";

interface ChapterLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadChapter: (chapter: ChapterFile) => void;
  currentChapter: {
    id?: string;
    name: string;
    content: string;
    editorHtml?: string;
    analysis?: any;
  } | null;
}

export function ChapterLibrary({
  isOpen,
  onClose,
  onLoadChapter,
  currentChapter,
}: ChapterLibraryProps): JSX.Element | null {
  const [chapters, setChapters] = useState<ChapterMetadata[]>([]);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveAsName, setSaveAsName] = useState("");
  const [showSaveAs, setShowSaveAs] = useState(false);

  // Check for existing directory handle on mount
  useEffect(() => {
    if (isOpen) {
      loadStoredDirectory();
    }
  }, [isOpen]);

  const loadStoredDirectory = async () => {
    try {
      const handle = await getStoredDirectoryHandle();
      if (handle) {
        setDirHandle(handle);
        await refreshChapterList(handle);
      }
    } catch (err) {
      console.error("Error loading stored directory:", err);
    }
  };

  const refreshChapterList = async (handle: FileSystemDirectoryHandle) => {
    setLoading(true);
    setError(null);
    try {
      const chapterList = await loadChaptersFromFolder(handle);
      setChapters(chapterList);
    } catch (err) {
      setError("Failed to load chapters");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    setError(null);
    try {
      const handle = await requestDirectoryAccess();
      if (handle) {
        setDirHandle(handle);
        await refreshChapterList(handle);
      }
    } catch (err) {
      setError("Failed to access folder");
      console.error(err);
    }
  };

  const handleSaveChapter = async () => {
    if (!dirHandle || !currentChapter) return;

    setLoading(true);
    setError(null);
    try {
      const chapterData: ChapterFile = {
        id: currentChapter.id || generateChapterId(),
        name: saveAsName || currentChapter.name || "Untitled Chapter",
        content: currentChapter.content,
        editorHtml: currentChapter.editorHtml,
        analysis: currentChapter.analysis,
        lastModified: Date.now(),
        fileName:
          (saveAsName || currentChapter.name || "Untitled Chapter") + ".json",
      };

      await saveChapterToFolder(dirHandle, chapterData);
      await refreshChapterList(dirHandle);
      setShowSaveAs(false);
      setSaveAsName("");
    } catch (err) {
      setError("Failed to save chapter");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadChapter = async (fileName: string) => {
    if (!dirHandle) return;

    setLoading(true);
    setError(null);
    try {
      const chapter = await loadChapterFromFolder(dirHandle, fileName);
      if (chapter) {
        onLoadChapter(chapter);
        onClose();
      } else {
        setError("Failed to load chapter - file may be corrupted");
      }
    } catch (err) {
      setError("Failed to load chapter");
      console.error("[ChapterLibrary] Error loading chapter:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (fileName: string) => {
    if (!dirHandle) return;
    if (
      !confirm(
        "Are you sure you want to delete this chapter? This cannot be undone."
      )
    )
      return;

    setLoading(true);
    setError(null);
    try {
      await deleteChapterFromFolder(dirHandle, fileName);
      await refreshChapterList(dirHandle);
    } catch (err) {
      setError("Failed to delete chapter");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgetFolder = async () => {
    if (!confirm("Forget this folder? You can select it again later.")) return;
    await clearStoredDirectory();
    setDirHandle(null);
    setChapters([]);
  };

  if (!isOpen) return null;

  const isSupported = isFileSystemAccessSupported();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fef5e7",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
          width: "90%",
          maxWidth: "800px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          border: "2px solid #e0c392",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "2px solid #e0c392",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#2c3e50",
              fontSize: "24px",
              fontWeight: 600,
            }}
          >
            📚 Chapter Library
          </h2>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {!isSupported ? (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                backgroundColor: "#fff8dc",
                borderRadius: "8px",
                border: "1px solid #e0c392",
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  color: "#2c3e50",
                  marginBottom: "12px",
                }}
              >
                ⚠️ Not Supported
              </p>
              <p style={{ color: "#666", margin: 0 }}>
                Your browser doesn't support the File System Access API. Please
                use a modern browser like Chrome or Edge.
              </p>
            </div>
          ) : !dirHandle ? (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "18px",
                  color: "#2c3e50",
                  marginBottom: "24px",
                }}
              >
                Select a folder on your computer to save and manage your
                chapters.
              </p>
              <button
                onClick={handleSelectFolder}
                style={{
                  padding: "12px 32px",
                  backgroundColor: "#ef8432",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📁 Select Chapter Folder
              </button>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "16px" }}>
                Your chapters will be saved as JSON files in this folder.
              </p>
            </div>
          ) : (
            <>
              {/* Current Chapter Save */}
              {currentChapter && (
                <div
                  style={{
                    marginBottom: "24px",
                    padding: "16px",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #e0c392",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      color: "#2c3e50",
                    }}
                  >
                    💾 Current Chapter
                  </h3>
                  {showSaveAs ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        value={saveAsName}
                        onChange={(e) => setSaveAsName(e.target.value)}
                        placeholder="Chapter name..."
                        style={{
                          flex: 1,
                          padding: "8px",
                          border: "1px solid #e0c392",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }}
                      />
                      <button
                        onClick={handleSaveChapter}
                        disabled={loading}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#ef8432",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowSaveAs(false);
                          setSaveAsName("");
                        }}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#ccc",
                          color: "#333",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          setSaveAsName(currentChapter.name);
                          handleSaveChapter();
                        }}
                        disabled={loading}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#ef8432",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        💾 Save "{currentChapter.name}"
                      </button>
                      <button
                        onClick={() => setShowSaveAs(true)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#fff",
                          color: "#2c3e50",
                          border: "1px solid #e0c392",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Save As...
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Chapter List */}
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "16px", color: "#2c3e50" }}>
                  Chapter Library ({chapters.length})
                </h3>
                <button
                  onClick={() => refreshChapterList(dirHandle)}
                  disabled={loading}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#fff",
                    color: "#2c3e50",
                    border: "1px solid #e0c392",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  🔄 Refresh
                </button>
              </div>

              {loading && (
                <p style={{ textAlign: "center", color: "#666" }}>Loading...</p>
              )}

              {error && (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#ffe5e5",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    color: "#c00",
                  }}
                >
                  {error}
                </div>
              )}

              {chapters.length === 0 && !loading ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#666",
                    padding: "32px",
                  }}
                >
                  No chapters saved yet. Save your current chapter to get
                  started!
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      style={{
                        padding: "12px",
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                        border: "1px solid #e0c392",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#2c3e50",
                            marginBottom: "4px",
                          }}
                        >
                          {chapter.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {new Date(chapter.lastModified).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleLoadChapter(chapter.fileName)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#ef8432",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          📂 Load
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapter.fileName)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#d9534f",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Actions */}
              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e0c392",
                }}
              >
                <button
                  onClick={handleForgetFolder}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#fff",
                    color: "#666",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Forget This Folder
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
