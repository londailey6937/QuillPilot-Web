import React, { useState } from "react";
import { creamPalette as palette } from "../styles/palette";

interface WorldBuildingNotebookProps {
  onClose: () => void;
}

interface Entry {
  id: string;
  type: "character" | "place" | "magic" | "history" | "creature";
  title: string;
  content: string;
  tags: string[];
  created: Date;
}

export const WorldBuildingNotebook: React.FC<WorldBuildingNotebookProps> = ({
  onClose,
}) => {
  const [entries, setEntries] = useState<Entry[]>([
    {
      id: "1",
      type: "character",
      title: "The Shadow King",
      content:
        "Mysterious ruler of the Northern Wastes. Known for his ability to manipulate darkness.",
      tags: ["antagonist", "magic-user"],
      created: new Date(),
    },
    {
      id: "2",
      type: "place",
      title: "Silverfall City",
      content:
        "Ancient metropolis built into a waterfall. Home to the Council of Mages.",
      tags: ["city", "magical"],
      created: new Date(),
    },
  ]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [newEntry, setNewEntry] = useState<Partial<Entry>>({
    type: "character",
    title: "",
    content: "",
    tags: [],
  });
  const [isCreating, setIsCreating] = useState(false);

  const entryTypes = [
    { id: "character", icon: "👤", label: "Characters" },
    { id: "place", icon: "🏛️", label: "Places" },
    { id: "magic", icon: "✨", label: "Magic System" },
    { id: "history", icon: "📜", label: "History" },
    { id: "creature", icon: "🐉", label: "Creatures" },
  ];

  const filteredEntries =
    selectedType === "all"
      ? entries
      : entries.filter((e) => e.type === selectedType);

  const createEntry = () => {
    if (!newEntry.title || !newEntry.content) return;

    const entry: Entry = {
      id: Date.now().toString(),
      type: newEntry.type as Entry["type"],
      title: newEntry.title,
      content: newEntry.content,
      tags: newEntry.tags || [],
      created: new Date(),
    };

    setEntries([...entries, entry]);
    setNewEntry({ type: "character", title: "", content: "", tags: [] });
    setIsCreating(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div
      className="world-building-notebook-modal"
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
        maxWidth: "900px",
        maxHeight: "85vh",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-black">
          📚 World-Building Notebook
        </h2>
      </div>

      <div className="space-y-6">
        {/* Type Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedType("all")}
            className="px-4 py-2 rounded transition-colors"
            style={{
              background:
                selectedType === "all" ? palette.accent : palette.base,
              color: selectedType === "all" ? "#ffffff" : palette.navy,
              border: `1px solid ${
                selectedType === "all" ? palette.accent : palette.border
              }`,
            }}
          >
            All ({entries.length})
          </button>
          {entryTypes.map((type) => {
            const count = entries.filter((e) => e.type === type.id).length;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="px-4 py-2 rounded transition-colors"
                style={{
                  background:
                    selectedType === type.id ? palette.accent : palette.base,
                  color: selectedType === type.id ? "#ffffff" : palette.navy,
                  border: `1px solid ${
                    selectedType === type.id ? palette.accent : palette.border
                  }`,
                }}
              >
                {type.icon} {type.label} ({count})
              </button>
            );
          })}
        </div>

        {/* New Entry Form */}
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
            + Add New Entry
          </button>
        ) : (
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.subtle,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">New Entry</h3>
            <div className="space-y-3">
              <div>
                <label
                  className="text-sm font-semibold mb-1 block"
                  style={{ color: palette.navy }}
                >
                  Type
                </label>
                <select
                  value={newEntry.type}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      type: e.target.value as Entry["type"],
                    })
                  }
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    background: palette.base,
                    borderColor: palette.border,
                    color: palette.navy,
                  }}
                >
                  {entryTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="text-sm font-semibold mb-1 block"
                  style={{ color: palette.navy }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={newEntry.title}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border"
                  placeholder="Name or title..."
                  style={{
                    background: palette.base,
                    borderColor: palette.border,
                    color: palette.navy,
                  }}
                />
              </div>

              <div>
                <label
                  className="text-sm font-semibold mb-1 block"
                  style={{ color: palette.navy }}
                >
                  Description
                </label>
                <textarea
                  value={newEntry.content}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 rounded border"
                  placeholder="Details, characteristics, lore..."
                  style={{
                    background: palette.base,
                    borderColor: palette.border,
                    color: palette.navy,
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={createEntry}
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

        {/* Entries List */}
        <div
          className="border rounded-lg p-4"
          style={{
            background: palette.base,
            borderColor: palette.border,
          }}
        >
          <h3 className="font-bold text-lg mb-3 text-black">
            Entries ({filteredEntries.length})
          </h3>
          {filteredEntries.length === 0 ? (
            <div
              className="text-center py-8"
              style={{ color: palette.mutedText }}
            >
              No entries yet. Create your first one!
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4"
                  style={{
                    background: palette.subtle,
                    borderColor: palette.lightBorder,
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {entryTypes.find((t) => t.id === entry.type)?.icon}
                      </span>
                      <div>
                        <h4
                          className="font-bold text-lg"
                          style={{ color: palette.navy }}
                        >
                          {entry.title}
                        </h4>
                        <div
                          className="text-xs"
                          style={{ color: palette.mutedText }}
                        >
                          {entry.type}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-500"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-sm mb-2" style={{ color: palette.navy }}>
                    {entry.content}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {entry.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: palette.light,
                            border: `1px solid ${palette.lightBorder}`,
                            color: palette.navy,
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
          )}
        </div>
      </div>
    </div>
  );
};
