import React, { useState, useEffect, useCallback, useRef } from "react";

interface MarginComment {
  id: string;
  text: string;
  highlightText: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
  color: string;
  // Position info
  top: number; // Relative to document
  highlightId: string; // ID of the highlight span in the document
}

interface MarginCommentsProps {
  fileName?: string;
  editorRef: React.RefObject<HTMLDivElement | null>;
  paginatedEditorRef: React.RefObject<{
    getPageContentElements: () => HTMLDivElement[];
    getScrollContainer: () => HTMLDivElement | null;
  } | null>;
  isVisible: boolean;
  onToggle: () => void;
}

const COMMENT_COLORS = [
  { name: "Yellow", value: "#fef08a", border: "#eab308" },
  { name: "Green", value: "#bbf7d0", border: "#22c55e" },
  { name: "Blue", value: "#bfdbfe", border: "#3b82f6" },
  { name: "Pink", value: "#fbcfe8", border: "#ec4899" },
  { name: "Orange", value: "#fed7aa", border: "#f97316" },
];

export const MarginComments: React.FC<MarginCommentsProps> = ({
  fileName = "document",
  editorRef,
  paginatedEditorRef,
  isVisible,
  onToggle,
}) => {
  const [comments, setComments] = useState<MarginComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem("quillpilot-author") || "Author";
  });
  const [selectedColor, setSelectedColor] = useState(COMMENT_COLORS[0].value);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [showAddComment, setShowAddComment] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    range: Range | null;
    top: number;
  } | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const storageKey = `quillpilot-margin-comments-${fileName}`;

  // Load comments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setComments(
          parsed.map((c: any) => ({
            ...c,
            timestamp: new Date(c.timestamp),
          }))
        );
      } catch (e) {
        console.error("Failed to load margin comments:", e);
      }
    }
  }, [storageKey]);

  // Save comments to localStorage
  const saveComments = useCallback(
    (newComments: MarginComment[]) => {
      setComments(newComments);
      localStorage.setItem(storageKey, JSON.stringify(newComments));
    },
    [storageKey]
  );

  // Save author name
  useEffect(() => {
    localStorage.setItem("quillpilot-author", authorName);
  }, [authorName]);

  // Listen for text selection to enable adding comments
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        // Don't clear if we're focused on the comment input
        if (document.activeElement !== commentInputRef.current) {
          setSelectionInfo(null);
          setShowAddComment(false);
        }
        return;
      }

      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();

      if (!text) {
        setSelectionInfo(null);
        setShowAddComment(false);
        return;
      }

      // Check if selection is within the editor
      const pageElements =
        paginatedEditorRef.current?.getPageContentElements() || [];
      const isInEditor = pageElements.some(
        (el) =>
          el.contains(range.startContainer) || el.contains(range.endContainer)
      );

      if (!isInEditor) {
        return;
      }

      // Get position of selection
      const rect = range.getBoundingClientRect();
      const scrollContainer = paginatedEditorRef.current?.getScrollContainer();
      const scrollTop = scrollContainer?.scrollTop || 0;
      const containerRect = scrollContainer?.getBoundingClientRect();
      const relativeTop = rect.top - (containerRect?.top || 0) + scrollTop;

      setSelectionInfo({
        text,
        range: range.cloneRange(),
        top: relativeTop,
      });
    };

    document.addEventListener("selectionchange", handleSelection);
    return () =>
      document.removeEventListener("selectionchange", handleSelection);
  }, [paginatedEditorRef]);

  // Add a highlight span around selected text
  const addHighlight = useCallback(
    (range: Range, color: string, highlightId: string) => {
      try {
        const highlight = document.createElement("mark");
        highlight.id = highlightId;
        highlight.className = "margin-comment-highlight";
        highlight.style.backgroundColor = color;
        highlight.style.borderBottom = `2px solid ${
          COMMENT_COLORS.find((c) => c.value === color)?.border || color
        }`;
        highlight.style.cursor = "pointer";
        highlight.dataset.commentId = highlightId;

        // Surround the selection with the highlight
        range.surroundContents(highlight);

        // Add click handler to highlight
        highlight.addEventListener("click", () => {
          setActiveCommentId(highlightId);
        });

        return true;
      } catch (e) {
        console.error("Failed to add highlight:", e);
        return false;
      }
    },
    []
  );

  // Remove highlight from document
  const removeHighlight = useCallback((highlightId: string) => {
    const highlight = document.getElementById(highlightId);
    if (highlight) {
      const parent = highlight.parentNode;
      while (highlight.firstChild) {
        parent?.insertBefore(highlight.firstChild, highlight);
      }
      parent?.removeChild(highlight);
    }
  }, []);

  // Add a new comment
  const addComment = useCallback(() => {
    if (!newComment.trim() || !selectionInfo?.range) return;

    const highlightId = `comment-highlight-${Date.now()}`;

    // Add visual highlight to document
    const success = addHighlight(
      selectionInfo.range,
      selectedColor,
      highlightId
    );
    if (!success) {
      alert(
        "Could not highlight this selection. Try selecting text within a single paragraph."
      );
      return;
    }

    const comment: MarginComment = {
      id: highlightId,
      text: newComment.trim(),
      highlightText: selectionInfo.text,
      author: authorName,
      timestamp: new Date(),
      resolved: false,
      color: selectedColor,
      top: selectionInfo.top,
      highlightId,
    };

    saveComments([...comments, comment]);
    setNewComment("");
    setShowAddComment(false);
    setSelectionInfo(null);
    setActiveCommentId(highlightId);

    // Clear selection
    window.getSelection()?.removeAllRanges();
  }, [
    newComment,
    selectionInfo,
    selectedColor,
    authorName,
    addHighlight,
    comments,
    saveComments,
  ]);

  // Delete comment
  const deleteComment = useCallback(
    (id: string) => {
      removeHighlight(id);
      saveComments(comments.filter((c) => c.id !== id));
      if (activeCommentId === id) {
        setActiveCommentId(null);
      }
    },
    [comments, activeCommentId, removeHighlight, saveComments]
  );

  // Toggle resolved
  const toggleResolved = useCallback(
    (id: string) => {
      const newComments = comments.map((c) =>
        c.id === id ? { ...c, resolved: !c.resolved } : c
      );
      saveComments(newComments);
    },
    [comments, saveComments]
  );

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

  // Scroll to highlight when clicking comment
  const scrollToHighlight = useCallback((highlightId: string) => {
    const highlight = document.getElementById(highlightId);
    if (highlight) {
      highlight.scrollIntoView({ behavior: "smooth", block: "center" });
      // Flash the highlight
      const originalBg = highlight.style.backgroundColor;
      highlight.style.backgroundColor = "#ef8432";
      setTimeout(() => {
        highlight.style.backgroundColor = originalBg;
      }, 1000);
    }
  }, []);

  // Re-apply highlights when comments load (for persisted comments)
  useEffect(() => {
    // This would need DOM mutation handling - simplified for now
    // In production, you'd store text position markers and re-apply
  }, [comments]);

  const sortedComments = [...comments].sort((a, b) => a.top - b.top);
  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      className="margin-comments-panel hide-scrollbar"
      style={{
        position: "absolute",
        right: "-280px",
        top: 0,
        bottom: 0,
        width: "260px",
        overflowY: "auto",
        padding: "8px",
        scrollbarWidth: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background:
            "linear-gradient(180deg, #fef5e7 0%, #fef5e7 90%, transparent 100%)",
          paddingBottom: "8px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#92400e",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            💬 Comments {unresolvedCount > 0 && `(${unresolvedCount})`}
          </span>
          <button
            onClick={onToggle}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: "#6b7280",
              padding: "2px",
            }}
            title="Hide comments"
          >
            ✕
          </button>
        </div>

        {/* Add comment prompt */}
        {selectionInfo && !showAddComment && (
          <button
            onClick={() => {
              setShowAddComment(true);
              setTimeout(() => commentInputRef.current?.focus(), 50);
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "linear-gradient(135deg, #ef8432 0%, #f97316 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "8px",
            }}
          >
            <span>+</span>
            <span>Add comment on "{selectionInfo.text.slice(0, 20)}..."</span>
          </button>
        )}

        {/* Add comment form */}
        {showAddComment && selectionInfo && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e0c392",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#6b7280",
                marginBottom: "6px",
              }}
            >
              On: "{selectionInfo.text.slice(0, 40)}
              {selectionInfo.text.length > 40 ? "..." : ""}"
            </div>
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your comment..."
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #e0c392",
                borderRadius: "6px",
                fontSize: "12px",
                resize: "none",
                minHeight: "60px",
                fontFamily: "inherit",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  addComment();
                }
                if (e.key === "Escape") {
                  setShowAddComment(false);
                  setNewComment("");
                }
              }}
            />
            {/* Color picker */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                margin: "8px 0",
              }}
            >
              {COMMENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    background: c.value,
                    border:
                      selectedColor === c.value
                        ? `2px solid ${c.border}`
                        : "1px solid #e0c392",
                    cursor: "pointer",
                  }}
                  title={c.name}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: newComment.trim() ? "#ef8432" : "#e2e8f0",
                  color: newComment.trim() ? "#fff" : "#9ca3af",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: newComment.trim() ? "pointer" : "not-allowed",
                }}
              >
                Add (⌘↵)
              </button>
              <button
                onClick={() => {
                  setShowAddComment(false);
                  setNewComment("");
                }}
                style={{
                  padding: "6px 10px",
                  background: "#fef5e7",
                  color: "#6b7280",
                  border: "1px solid #e0c392",
                  borderRadius: "6px",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {sortedComments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px 12px",
              color: "#6b7280",
            }}
          >
            <div
              style={{ fontSize: "24px", marginBottom: "8px", opacity: 0.5 }}
            >
              💬
            </div>
            <p style={{ fontSize: "11px", lineHeight: 1.5 }}>
              Select text in your document to add a comment
            </p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div
              key={comment.id}
              onClick={() => {
                setActiveCommentId(
                  activeCommentId === comment.id ? null : comment.id
                );
                scrollToHighlight(comment.highlightId);
              }}
              style={{
                background: activeCommentId === comment.id ? "#fff" : "#fefdf9",
                border: `1px solid ${
                  activeCommentId === comment.id ? "#ef8432" : "#f5d1ab"
                }`,
                borderLeft: `3px solid ${comment.color}`,
                borderRadius: "8px",
                padding: "10px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                opacity: comment.resolved ? 0.6 : 1,
              }}
            >
              {/* Highlighted text preview */}
              <div
                style={{
                  fontSize: "10px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontStyle: "italic",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                "{comment.highlightText.slice(0, 30)}
                {comment.highlightText.length > 30 ? "..." : ""}"
              </div>

              {/* Comment text */}
              <div
                style={{
                  fontSize: "12px",
                  color: "#2c3e50",
                  lineHeight: 1.4,
                  marginBottom: "6px",
                  textDecoration: comment.resolved ? "line-through" : "none",
                }}
              >
                {comment.text}
              </div>

              {/* Meta info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "10px",
                  color: "#9ca3af",
                }}
              >
                <span>
                  {comment.author} · {formatTime(comment.timestamp)}
                </span>
                {comment.resolved && (
                  <span style={{ color: "#10b981" }}>✓ Resolved</span>
                )}
              </div>

              {/* Actions - shown when active */}
              {activeCommentId === comment.id && (
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: "1px solid #f5d1ab",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleResolved(comment.id);
                    }}
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      background: comment.resolved ? "#fef5e7" : "#dcfce7",
                      color: comment.resolved ? "#6b7280" : "#166534",
                      border: "1px solid",
                      borderColor: comment.resolved ? "#e0c392" : "#86efac",
                      borderRadius: "4px",
                      fontSize: "10px",
                      cursor: "pointer",
                    }}
                  >
                    {comment.resolved ? "Reopen" : "✓ Resolve"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this comment?")) {
                        deleteComment(comment.id);
                      }
                    }}
                    style={{
                      padding: "4px 8px",
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: "4px",
                      fontSize: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default MarginComments;
