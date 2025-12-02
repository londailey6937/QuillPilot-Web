import React, { useState } from "react";
import { creamPalette as palette } from "../styles/palette";

interface ResearchNotesPanelProps {
  onClose: () => void;
  onOpenHelp?: () => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  created: Date;
  isPinned: boolean;
}

export const ResearchNotesPanel: React.FC<ResearchNotesPanelProps> = ({
  onClose,
  onOpenHelp,
}) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Victorian Era Fashion",
      content:
        "Women wore corsets and crinolines. Men: tailcoats, waistcoats, top hats.",
      tags: ["historical", "fashion"],
      category: "research",
      created: new Date(),
      isPinned: true,
    },
    {
      id: "2",
      title: "Medieval Weapons",
      content:
        "Longswords: 3-4 pounds. Crossbows: 200-300 yard range. Longbows required years of training.",
      tags: ["historical", "combat"],
      category: "reference",
      created: new Date(),
      isPinned: false,
    },
    {
      id: "3",
      title: "Sarah - Protagonist",
      content:
        "Age 28, journalist. Quirk: twirls hair when nervous. Goal: uncover the truth about her father's disappearance. Flaw: too trusting.",
      tags: ["protagonist", "female"],
      category: "characters",
      created: new Date(),
      isPinned: false,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: "",
    content: "",
    tags: [],
    category: "general",
    isPinned: false,
  });

  const categories = [
    { id: "general", label: "General", icon: "📝" },
    { id: "characters", label: "Characters", icon: "👤" },
    { id: "worldbuilding", label: "World Building", icon: "🌍" },
    { id: "plot", label: "Plot Notes", icon: "📖" },
    { id: "research", label: "Research", icon: "🔬" },
    { id: "reference", label: "Reference", icon: "📚" },
    { id: "ideas", label: "Ideas", icon: "💡" },
    { id: "quotes", label: "Quotes", icon: "💬" },
  ];

  const filteredNotes = notes
    .filter(
      (n) => selectedCategory === "all" || n.category === selectedCategory
    )
    .filter(
      (n) =>
        searchQuery === "" ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const createNote = () => {
    if (!newNote.title || !newNote.content) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags || [],
      category: newNote.category || "general",
      created: new Date(),
      isPinned: newNote.isPinned || false,
    };

    setNotes([...notes, note]);
    setNewNote({
      title: "",
      content: "",
      tags: [],
      category: "general",
      isPinned: false,
    });
    setIsCreating(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  return (
    <div
      className="research-notes-panel-modal"
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
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        maxWidth: "700px",
        maxHeight: "85vh",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <div className="mb-4 flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">📝 Writer's Notes</h2>
          <p className="text-sm" style={{ color: palette.mutedText }}>
            Characters, world building, research & ideas - all in one place
          </p>
        </div>
        <button
          onClick={onOpenHelp}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: palette.mutedText,
            padding: "4px 8px",
          }}
          title="Help"
        >
          ?
        </button>
      </div>

      <div className="space-y-4">
        {/* Search & Filter */}
        <div className="space-y-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full px-4 py-2 rounded border"
            style={{
              background: palette.base,
              borderColor: palette.border,
              color: palette.navy,
            }}
          />

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory("all")}
              className="px-3 py-1 rounded text-sm transition-colors"
              style={{
                background:
                  selectedCategory === "all" ? palette.accent : palette.base,
                color: selectedCategory === "all" ? "#ffffff" : palette.navy,
                border: `1px solid ${
                  selectedCategory === "all" ? palette.accent : palette.border
                }`,
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-3 py-1 rounded text-sm transition-colors"
                style={{
                  background:
                    selectedCategory === cat.id ? palette.accent : palette.base,
                  color: selectedCategory === cat.id ? "#ffffff" : palette.navy,
                  border: `1px solid ${
                    selectedCategory === cat.id
                      ? palette.accent
                      : palette.border
                  }`,
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* New Note Button */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{
              background: palette.accent,
              color: "#ffffff",
              border: `1px solid ${palette.accent}`,
            }}
          >
            + New Note
          </button>
        ) : (
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.subtle,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold mb-3" style={{ color: palette.navy }}>
              New Note
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
                placeholder="Note title..."
                className="w-full px-3 py-2 rounded border"
                style={{
                  background: palette.base,
                  borderColor: palette.border,
                  color: palette.navy,
                }}
              />

              <textarea
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                rows={3}
                placeholder="Note content..."
                className="w-full px-3 py-2 rounded border"
                style={{
                  background: palette.base,
                  borderColor: palette.border,
                  color: palette.navy,
                }}
              />

              <select
                value={newNote.category}
                onChange={(e) =>
                  setNewNote({ ...newNote, category: e.target.value })
                }
                className="w-full px-3 py-2 rounded border"
                style={{
                  background: palette.base,
                  borderColor: palette.border,
                  color: palette.navy,
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={createNote}
                  className="px-6 py-2 rounded font-semibold"
                  style={{
                    background: palette.accent,
                    color: "#ffffff",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-2 rounded"
                  style={{
                    background: palette.base,
                    border: `1px solid ${palette.border}`,
                    color: palette.navy,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: palette.mutedText }}
              >
                📌 Pinned
              </h3>
              <div className="space-y-2">
                {pinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border rounded-lg p-3"
                    style={{
                      background: palette.light,
                      borderColor: palette.lightBorder,
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4
                          className="font-bold"
                          style={{ color: palette.navy }}
                        >
                          {note.title}
                        </h4>
                        <div
                          className="text-xs mb-1"
                          style={{ color: palette.mutedText }}
                        >
                          {categories.find((c) => c.id === note.category)?.icon}{" "}
                          {
                            categories.find((c) => c.id === note.category)
                              ?.label
                          }
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePin(note.id)}
                          title="Unpin"
                        >
                          📌
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: palette.navy }}>
                      {note.content}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {note.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: palette.base,
                              border: `1px solid ${palette.lightBorder}`,
                              color: palette.mutedText,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: palette.mutedText }}
                >
                  All Notes
                </h3>
              )}
              <div className="space-y-2">
                {unpinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border rounded-lg p-3"
                    style={{
                      background: palette.subtle,
                      borderColor: palette.lightBorder,
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4
                          className="font-bold"
                          style={{ color: palette.navy }}
                        >
                          {note.title}
                        </h4>
                        <div
                          className="text-xs mb-1"
                          style={{ color: palette.mutedText }}
                        >
                          {categories.find((c) => c.id === note.category)?.icon}{" "}
                          {
                            categories.find((c) => c.id === note.category)
                              ?.label
                          }
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePin(note.id)}
                          title="Pin"
                          style={{ opacity: 0.5 }}
                        >
                          📌
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: palette.navy }}>
                      {note.content}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {note.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: palette.base,
                              border: `1px solid ${palette.lightBorder}`,
                              color: palette.mutedText,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredNotes.length === 0 && (
            <div
              className="text-center py-8"
              style={{ color: palette.mutedText }}
            >
              No notes found. Create your first one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
