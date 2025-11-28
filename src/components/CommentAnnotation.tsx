import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface Comment {
  id: string;
  text: string;
  highlightText: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
  replies: Reply[];
  color: string;
}

interface Reply {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

interface CommentAnnotationProps {
  documentContent: string;
  selectedText: string;
  onClose: () => void;
  onHighlight?: (text: string, color: string) => void;
  fileName?: string;
}

const COMMENT_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Orange", value: "#fed7aa" },
];

export const CommentAnnotation: React.FC<CommentAnnotationProps> = ({
  documentContent,
  selectedText,
  onClose,
  onHighlight,
  fileName = "document",
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem("quillpilot-author") || "Author";
  });
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COMMENT_COLORS[0].value);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const storageKey = `quillpilot-comments-${fileName}`;

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
            replies: c.replies.map((r: any) => ({
              ...r,
              timestamp: new Date(r.timestamp),
            })),
          }))
        );
      } catch (e) {
        console.error("Failed to load comments:", e);
      }
    }
  }, [storageKey]);

  // Save comments to localStorage
  const saveComments = (newComments: Comment[]) => {
    setComments(newComments);
    localStorage.setItem(storageKey, JSON.stringify(newComments));
  };

  // Save author name
  useEffect(() => {
    localStorage.setItem("quillpilot-author", authorName);
  }, [authorName]);

  // Add a new comment
  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      highlightText: selectedText || "",
      author: authorName,
      timestamp: new Date(),
      resolved: false,
      replies: [],
      color: selectedColor,
    };

    saveComments([comment, ...comments]);
    setNewComment("");

    // Trigger highlight in editor if callback provided
    if (onHighlight && selectedText) {
      onHighlight(selectedText, selectedColor);
    }
  };

  // Add a reply
  const addReply = (commentId: string) => {
    if (!replyText.trim()) return;

    const reply: Reply = {
      id: Date.now().toString(),
      text: replyText.trim(),
      author: authorName,
      timestamp: new Date(),
    };

    const newComments = comments.map((c) =>
      c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
    );
    saveComments(newComments);
    setReplyText("");
    setReplyingTo(null);
  };

  // Toggle resolved
  const toggleResolved = (id: string) => {
    const newComments = comments.map((c) =>
      c.id === id ? { ...c, resolved: !c.resolved } : c
    );
    saveComments(newComments);
  };

  // Delete comment
  const deleteComment = (id: string) => {
    saveComments(comments.filter((c) => c.id !== id));
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

  // Filter comments
  const filteredComments = comments.filter((c) => {
    if (filter === "active") return !c.resolved;
    if (filter === "resolved") return c.resolved;
    return true;
  });

  const stats = {
    total: comments.length,
    active: comments.filter((c) => !c.resolved).length,
    resolved: comments.filter((c) => c.resolved).length,
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
        maxWidth: "600px",
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
          marginBottom: "16px",
        }}
      >
        <h2 style={{ margin: 0, color: palette.navy, fontSize: "20px" }}>
          💬 Comments & Annotations
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: palette.mutedText,
          }}
        >
          ×
        </button>
      </div>

      {/* Author name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
          fontSize: "14px",
        }}
      >
        <span style={{ color: palette.mutedText }}>Commenting as:</span>
        {editingAuthor ? (
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            onBlur={() => setEditingAuthor(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingAuthor(false)}
            autoFocus
            style={{
              padding: "4px 8px",
              border: `1px solid ${palette.border}`,
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        ) : (
          <button
            onClick={() => setEditingAuthor(true)}
            style={{
              padding: "4px 8px",
              background: palette.subtle,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500,
              color: palette.navy,
            }}
          >
            {authorName} ✏️
          </button>
        )}
      </div>

      {/* New comment form */}
      <div
        style={{
          padding: "16px",
          background: palette.subtle,
          borderRadius: "12px",
          marginBottom: "16px",
        }}
      >
        {selectedText && (
          <div
            style={{
              padding: "8px 12px",
              background: selectedColor,
              borderRadius: "6px",
              marginBottom: "12px",
              fontSize: "13px",
              fontStyle: "italic",
            }}
          >
            "{selectedText.substring(0, 100)}
            {selectedText.length > 100 && "..."}"
          </div>
        )}

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={
            selectedText
              ? "Add a comment about this text..."
              : "Add a general note..."
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${palette.border}`,
            borderRadius: "8px",
            fontSize: "14px",
            resize: "vertical",
            minHeight: "60px",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "12px",
          }}
        >
          {/* Color picker */}
          <div style={{ display: "flex", gap: "6px" }}>
            {COMMENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                title={color.name}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: color.value,
                  border:
                    selectedColor === color.value
                      ? `2px solid ${palette.navy}`
                      : "2px solid transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          <button
            onClick={addComment}
            disabled={!newComment.trim()}
            style={{
              padding: "8px 16px",
              background: newComment.trim()
                ? palette.accent
                : palette.mutedText,
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: newComment.trim() ? "pointer" : "not-allowed",
              fontWeight: 500,
            }}
          >
            Add Comment
          </button>
        </div>
      </div>

      {/* Stats and filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ fontSize: "13px", color: palette.mutedText }}>
          {stats.total} comments • {stats.active} active • {stats.resolved}{" "}
          resolved
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["all", "active", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                background: filter === f ? palette.navy : palette.subtle,
                color: filter === f ? "#fff" : palette.navy,
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Comments list */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {filteredComments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: palette.mutedText,
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
            <div>No comments yet</div>
            <div style={{ fontSize: "13px", marginTop: "8px" }}>
              {selectedText
                ? "Add a comment about your selected text"
                : "Select text in the editor, then add comments"}
            </div>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: "16px",
                  background: comment.resolved ? palette.subtle : "#fff",
                  border: `1px solid ${palette.border}`,
                  borderLeft: `4px solid ${comment.color}`,
                  borderRadius: "8px",
                  opacity: comment.resolved ? 0.7 : 1,
                }}
              >
                {/* Comment header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: palette.navy }}>
                      {comment.author}
                    </span>
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "12px",
                        color: palette.mutedText,
                      }}
                    >
                      {formatTime(comment.timestamp)}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => toggleResolved(comment.id)}
                      title={comment.resolved ? "Reopen" : "Resolve"}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      {comment.resolved ? "🔄" : "✅"}
                    </button>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      title="Delete"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Highlighted text */}
                {comment.highlightText && (
                  <div
                    style={{
                      padding: "8px",
                      background: comment.color,
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontStyle: "italic",
                      marginBottom: "8px",
                    }}
                  >
                    "{comment.highlightText.substring(0, 80)}
                    {comment.highlightText.length > 80 && "..."}"
                  </div>
                )}

                {/* Comment text */}
                <div style={{ fontSize: "14px", color: palette.navy }}>
                  {comment.text}
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingLeft: "16px",
                      borderLeft: `2px solid ${palette.border}`,
                    }}
                  >
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        style={{
                          padding: "8px 0",
                          fontSize: "13px",
                        }}
                      >
                        <span style={{ fontWeight: 500, color: palette.navy }}>
                          {reply.author}
                        </span>
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11px",
                            color: palette.mutedText,
                          }}
                        >
                          {formatTime(reply.timestamp)}
                        </span>
                        <div style={{ marginTop: "4px" }}>{reply.text}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply form */}
                {replyingTo === comment.id ? (
                  <div style={{ marginTop: "12px" }}>
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      autoFocus
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: `1px solid ${palette.border}`,
                        borderRadius: "4px",
                        fontSize: "13px",
                        boxSizing: "border-box",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addReply(comment.id);
                        if (e.key === "Escape") {
                          setReplyingTo(null);
                          setReplyText("");
                        }
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "8px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        style={{
                          padding: "4px 12px",
                          background: palette.subtle,
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => addReply(comment.id)}
                        style={{
                          padding: "4px 12px",
                          background: palette.accent,
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    style={{
                      marginTop: "8px",
                      padding: "4px 8px",
                      background: "none",
                      border: "none",
                      color: palette.accent,
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Reply
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
