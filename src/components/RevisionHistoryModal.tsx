import React, { useState, useEffect } from "react";
import {
  getRevisionHistory,
  getRevision,
  deleteRevision,
  RevisionMetadata,
  DocumentRevision,
} from "@/utils/revisionHistory";

interface RevisionHistoryModalProps {
  onClose: () => void;
  onRestore: (content: string, plainText: string, fileName: string) => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  onClose,
  onRestore,
}) => {
  const [revisions, setRevisions] = useState<RevisionMetadata[]>([]);
  const [selectedRevision, setSelectedRevision] =
    useState<DocumentRevision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRevisions();
  }, []);

  const loadRevisions = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getRevisionHistory(50);

    if (result.success && result.revisions) {
      setRevisions(result.revisions);
    } else {
      setError(result.error || "Failed to load revisions");
    }

    setIsLoading(false);
  };

  const handlePreview = async (revisionId: string) => {
    setIsLoadingPreview(true);
    const result = await getRevision(revisionId);

    if (result.success && result.revision) {
      setSelectedRevision(result.revision);
    } else {
      alert(`Failed to load revision: ${result.error}`);
    }

    setIsLoadingPreview(false);
  };

  const handleRestore = () => {
    if (!selectedRevision) return;

    if (
      window.confirm(
        `Are you sure you want to restore this revision?\n\nFile: ${
          selectedRevision.file_name
        }\nDate: ${new Date(
          selectedRevision.created_at
        ).toLocaleString()}\n\nThis will replace your current document.`
      )
    ) {
      onRestore(
        selectedRevision.content,
        selectedRevision.plain_text,
        selectedRevision.file_name
      );
      onClose();
    }
  };

  const handleDelete = async (revisionId: string, fileName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this revision?\n\nFile: ${fileName}\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    const result = await deleteRevision(revisionId);

    if (result.success) {
      // Reload the list
      loadRevisions();
      // Clear preview if deleted
      if (selectedRevision?.id === revisionId) {
        setSelectedRevision(null);
      }
    } else {
      alert(`Failed to delete revision: ${result.error}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#fef5e7",
          borderRadius: "12px",
          maxWidth: "1200px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
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
            background: "linear-gradient(to right, #fef5e7, #fff7ed)",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "24px", color: "#2c3e50" }}>
            📚 Revision History
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6b7280",
              padding: "4px 8px",
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            gap: "0",
          }}
        >
          {/* Revision List */}
          <div
            style={{
              width: selectedRevision ? "40%" : "100%",
              borderRight: selectedRevision ? "2px solid #e0c392" : "none",
              overflowY: "auto",
              padding: "16px",
            }}
          >
            {isLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>⏳</div>
                <p>Loading revisions...</p>
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#ef4444",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>⚠️</div>
                <p>{error}</p>
                <button
                  onClick={loadRevisions}
                  style={{
                    marginTop: "16px",
                    padding: "8px 16px",
                    backgroundColor: "#ef8432",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            ) : revisions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                  No revisions yet
                </p>
                <p style={{ fontSize: "14px" }}>
                  Revisions are automatically created when you export or
                  manually save your work.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {revisions.map((revision) => (
                  <div
                    key={revision.id}
                    onClick={() => handlePreview(revision.id)}
                    style={{
                      backgroundColor:
                        selectedRevision?.id === revision.id
                          ? "#f7e6d0"
                          : "#fff7ed",
                      border: "2px solid #e0c392",
                      borderRadius: "8px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRevision?.id !== revision.id) {
                        e.currentTarget.style.backgroundColor = "#f7e6d0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRevision?.id !== revision.id) {
                        e.currentTarget.style.backgroundColor = "#fff7ed";
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "8px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "#2c3e50",
                            fontSize: "16px",
                            marginBottom: "4px",
                          }}
                        >
                          {revision.auto_saved ? "🔄 " : "💾 "}
                          {revision.file_name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          {formatDate(revision.created_at)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(revision.id, revision.file_name);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "18px",
                          color: "#ef4444",
                          padding: "4px",
                        }}
                        title="Delete revision"
                      >
                        🗑️
                      </button>
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {revision.word_count.toLocaleString()} words
                      {revision.note && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "8px",
                            backgroundColor: "rgba(239, 132, 50, 0.1)",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: "#2c3e50",
                          }}
                        >
                          📝 {revision.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {selectedRevision && (
            <div
              style={{
                width: "60%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#fff",
              }}
            >
              {isLoadingPreview ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b7280",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "32px",
                        marginBottom: "16px",
                        textAlign: "center",
                      }}
                    >
                      ⏳
                    </div>
                    <p>Loading preview...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid #e0c392",
                      backgroundColor: "#fef5e7",
                    }}
                  >
                    <h3 style={{ margin: "0 0 8px 0", color: "#2c3e50" }}>
                      {selectedRevision.file_name}
                    </h3>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {new Date(selectedRevision.created_at).toLocaleString()} •{" "}
                      {selectedRevision.word_count.toLocaleString()} words
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "24px",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      color: "#2c3e50",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: selectedRevision.content,
                    }}
                  />
                  <div
                    style={{
                      padding: "16px",
                      borderTop: "2px solid #e0c392",
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "12px",
                      backgroundColor: "#fef5e7",
                    }}
                  >
                    <button
                      onClick={() => setSelectedRevision(null)}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#fef5e7",
                        color: "#2c3e50",
                        border: "2px solid #e0c392",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      Close Preview
                    </button>
                    <button
                      onClick={handleRestore}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#ef8432",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      ↩️ Restore This Version
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
