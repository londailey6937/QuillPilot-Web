import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface Version {
  id: string;
  timestamp: Date;
  title: string;
  content: string;
  wordCount: number;
  autoSave: boolean;
}

interface VersionHistoryProps {
  currentContent: string;
  onRestore: (content: string) => void;
  onClose: () => void;
  onOpenHelp?: () => void;
  fileName?: string;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  currentContent,
  onRestore,
  onClose,
  onOpenHelp,
  fileName = "document",
}) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);
  const [snapshotTitle, setSnapshotTitle] = useState("");

  const storageKey = `quillpilot-versions-${fileName}`;

  // Load versions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setVersions(
          parsed.map((v: any) => ({
            ...v,
            timestamp: new Date(v.timestamp),
          }))
        );
      } catch (e) {
        console.error("Failed to load versions:", e);
      }
    }
  }, [storageKey]);

  // Save versions to localStorage
  const saveVersions = (newVersions: Version[]) => {
    setVersions(newVersions);
    localStorage.setItem(storageKey, JSON.stringify(newVersions));
  };

  // Create a new snapshot
  const createSnapshot = (isAutoSave = false) => {
    const wordCount = currentContent.trim().split(/\s+/).filter(Boolean).length;
    const newVersion: Version = {
      id: Date.now().toString(),
      timestamp: new Date(),
      title: isAutoSave
        ? `Auto-save`
        : snapshotTitle ||
          `Snapshot ${versions.filter((v) => !v.autoSave).length + 1}`,
      content: currentContent,
      wordCount,
      autoSave: isAutoSave,
    };

    const newVersions = [newVersion, ...versions].slice(0, 50); // Keep max 50 versions
    saveVersions(newVersions);
    setSnapshotTitle("");
  };

  // Delete a version
  const deleteVersion = (id: string) => {
    const newVersions = versions.filter((v) => v.id !== id);
    saveVersions(newVersions);
    if (selectedVersion?.id === id) {
      setSelectedVersion(null);
    }
    if (compareVersion?.id === id) {
      setCompareVersion(null);
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Simple diff visualization
  const renderDiff = () => {
    if (!selectedVersion || !compareVersion) return null;

    const lines1 = selectedVersion.content.split("\n");
    const lines2 = compareVersion.content.split("\n");
    const maxLines = Math.max(lines1.length, lines2.length);

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          fontSize: "13px",
          fontFamily: "monospace",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 600,
              marginBottom: "8px",
              color: palette.navy,
            }}
          >
            {selectedVersion.title} ({formatTime(selectedVersion.timestamp)})
          </div>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${palette.border}`,
              borderRadius: "8px",
              padding: "12px",
              maxHeight: "300px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {lines1.map((line, i) => (
              <div
                key={i}
                style={{
                  background:
                    lines2[i] !== line
                      ? "rgba(239, 68, 68, 0.1)"
                      : "transparent",
                  padding: "2px 4px",
                  borderRadius: "2px",
                }}
              >
                {line || " "}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div
            style={{
              fontWeight: 600,
              marginBottom: "8px",
              color: palette.navy,
            }}
          >
            {compareVersion.title} ({formatTime(compareVersion.timestamp)})
          </div>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${palette.border}`,
              borderRadius: "8px",
              padding: "12px",
              maxHeight: "300px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {lines2.map((line, i) => (
              <div
                key={i}
                style={{
                  background:
                    lines1[i] !== line
                      ? "rgba(16, 185, 129, 0.1)"
                      : "transparent",
                  padding: "2px 4px",
                  borderRadius: "2px",
                }}
              >
                {line || " "}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: palette.base,
        border: `2px solid ${palette.border}`,
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 20px 60px rgba(44, 62, 80, 0.2)",
        width: "90%",
        maxWidth: "800px",
        maxHeight: "85vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, color: palette.navy, fontSize: "20px" }}>
          📜 Version History
        </h2>
        <button
          onClick={onOpenHelp}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: palette.mutedText,
          }}
          title="Help"
        >
          ?
        </button>
      </div>

      {/* Create snapshot */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          padding: "12px",
          background: palette.subtle,
          borderRadius: "8px",
        }}
      >
        <input
          type="text"
          value={snapshotTitle}
          onChange={(e) => setSnapshotTitle(e.target.value)}
          placeholder="Snapshot name (optional)"
          style={{
            flex: 1,
            padding: "8px 12px",
            border: `1px solid ${palette.border}`,
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
        <button
          onClick={() => createSnapshot(false)}
          style={{
            padding: "8px 16px",
            background: palette.accent,
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          💾 Save Snapshot
        </button>
      </div>

      {/* Toggle compare mode */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "14px",
            color: palette.navy,
          }}
        >
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(e) => {
              setCompareMode(e.target.checked);
              if (!e.target.checked) {
                setCompareVersion(null);
              }
            }}
          />
          Compare two versions
        </label>
      </div>

      {/* Version list or comparison */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {compareMode && selectedVersion && compareVersion ? (
          renderDiff()
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {versions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: palette.mutedText,
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📜</div>
                <div>No saved versions yet</div>
                <div style={{ fontSize: "13px", marginTop: "8px" }}>
                  Click "Save Snapshot" to create your first version
                </div>
              </div>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  onClick={() => {
                    if (compareMode) {
                      if (!selectedVersion) {
                        setSelectedVersion(version);
                      } else if (
                        !compareVersion &&
                        version.id !== selectedVersion.id
                      ) {
                        setCompareVersion(version);
                      }
                    } else {
                      setSelectedVersion(
                        selectedVersion?.id === version.id ? null : version
                      );
                    }
                  }}
                  style={{
                    padding: "12px 16px",
                    background:
                      selectedVersion?.id === version.id ||
                      compareVersion?.id === version.id
                        ? palette.light
                        : "#fff",
                    border: `1px solid ${
                      selectedVersion?.id === version.id ||
                      compareVersion?.id === version.id
                        ? palette.accent
                        : palette.border
                    }`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 500,
                          color: palette.navy,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {version.title}
                        {version.autoSave && (
                          <span
                            style={{
                              fontSize: "11px",
                              background: palette.subtle,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              color: palette.mutedText,
                            }}
                          >
                            auto
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: palette.mutedText,
                          marginTop: "4px",
                        }}
                      >
                        {formatTime(version.timestamp)} • {version.wordCount}{" "}
                        words
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {!compareMode && selectedVersion?.id === version.id && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestore(version.content);
                              onClose();
                            }}
                            style={{
                              padding: "6px 12px",
                              background: palette.success,
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Restore
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteVersion(version.id);
                            }}
                            style={{
                              padding: "6px 12px",
                              background: palette.danger,
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {!compareMode && selectedVersion?.id === version.id && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#fff",
                        border: `1px solid ${palette.border}`,
                        borderRadius: "6px",
                        fontSize: "13px",
                        maxHeight: "150px",
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                        color: palette.navy,
                      }}
                    >
                      {version.content.substring(0, 500)}
                      {version.content.length > 500 && "..."}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Compare mode instructions */}
      {compareMode && (!selectedVersion || !compareVersion) && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            background: palette.info + "20",
            borderRadius: "8px",
            fontSize: "13px",
            color: palette.info,
            textAlign: "center",
          }}
        >
          {!selectedVersion
            ? "Select the first version to compare"
            : "Now select the second version to compare"}
        </div>
      )}

      {/* Compare mode actions */}
      {compareMode && selectedVersion && compareVersion && (
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            gap: "8px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => {
              setSelectedVersion(null);
              setCompareVersion(null);
            }}
            style={{
              padding: "8px 16px",
              background: palette.subtle,
              color: palette.navy,
              border: `1px solid ${palette.border}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};
