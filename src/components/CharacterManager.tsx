import React, { useState } from "react";
import { Character, CharacterRole, CharacterRelationship } from "../types";
import { getTemplateById } from "@/utils/templateLibrary";

interface CharacterManagerProps {
  characters: Character[];
  onSave: (characters: Character[]) => void;
  onClose: () => void;
  onOpenTemplate?: (templateHtml: string, characterId?: string) => void; // Callback to open template in editor, with optional character ID for editing
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({
  characters,
  onSave,
  onClose,
  onOpenTemplate,
}) => {
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [localCharacters, setLocalCharacters] = useState<Character[]>([
    ...characters,
  ]);

  const CHARACTER_ROLES: { value: CharacterRole; label: string }[] = [
    { value: "protagonist", label: "Protagonist" },
    { value: "antagonist", label: "Antagonist" },
    { value: "deuteragonist", label: "Deuteragonist (Secondary Lead)" },
    { value: "love-interest", label: "Love Interest" },
    { value: "mentor", label: "Mentor" },
    { value: "sidekick", label: "Sidekick" },
    { value: "foil", label: "Foil" },
    { value: "supporting", label: "Supporting Character" },
    { value: "minor", label: "Minor Character" },
  ];

  const RELATIONSHIP_TYPES: Array<CharacterRelationship["type"]> = [
    "ally",
    "enemy",
    "family",
    "romantic",
    "mentor",
    "rival",
    "neutral",
  ];

  const handleAddNew = () => {
    const newCharacter: Character = {
      id: `char-${Date.now()}`,
      name: "",
      role: "supporting",
      traits: [],
      background: "",
      goals: "",
      conflicts: "",
      arc: "",
      relationships: [],
      linkedNames: [],
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingCharacter(newCharacter);
    setIsAddingNew(true);
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter({ ...character });
    setIsAddingNew(false);
  };

  const handleDelete = (characterId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this character? This action cannot be undone."
      )
    ) {
      const updated = localCharacters.filter((c) => c.id !== characterId);
      setLocalCharacters(updated);
      // Immediately persist the deletion
      onSave(updated);
    }
  };

  const handleSaveCharacter = () => {
    if (!editingCharacter) return;

    if (!editingCharacter.name.trim()) {
      alert("Character name is required");
      return;
    }

    editingCharacter.updatedAt = new Date().toISOString();

    if (isAddingNew) {
      setLocalCharacters([...localCharacters, editingCharacter]);
    } else {
      const updated = localCharacters.map((c) =>
        c.id === editingCharacter.id ? editingCharacter : c
      );
      setLocalCharacters(updated);
    }

    setEditingCharacter(null);
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingCharacter(null);
    setIsAddingNew(false);
  };

  const handleSaveAll = () => {
    onSave(localCharacters);
    onClose();
  };

  const updateEditingField = <K extends keyof Character>(
    field: K,
    value: Character[K]
  ) => {
    if (editingCharacter) {
      setEditingCharacter({ ...editingCharacter, [field]: value });
    }
  };

  const addTrait = () => {
    if (!editingCharacter) return;
    const trait = prompt(
      "Enter a character trait (e.g., brave, cunning, loyal):"
    );
    if (trait && trait.trim()) {
      updateEditingField("traits", [...editingCharacter.traits, trait.trim()]);
    }
  };

  const removeTrait = (index: number) => {
    if (!editingCharacter) return;
    const updated = editingCharacter.traits.filter((_, i) => i !== index);
    updateEditingField("traits", updated);
  };

  const addLinkedName = () => {
    if (!editingCharacter) return;
    const name = prompt(
      "Enter an alternative name or alias (e.g., 'Johnny' for 'John', 'Mr. Smith'):"
    );
    if (name && name.trim()) {
      updateEditingField("linkedNames", [
        ...editingCharacter.linkedNames,
        name.trim(),
      ]);
    }
  };

  const removeLinkedName = (index: number) => {
    if (!editingCharacter) return;
    const updated = editingCharacter.linkedNames.filter((_, i) => i !== index);
    updateEditingField("linkedNames", updated);
  };

  const addRelationship = () => {
    if (!editingCharacter) return;

    const otherCharacters = localCharacters.filter(
      (c) => c.id !== editingCharacter.id
    );
    if (otherCharacters.length === 0) {
      alert("No other characters available to create a relationship with.");
      return;
    }

    const characterOptions = otherCharacters
      .map((c, i) => `${i + 1}. ${c.name} (${c.role})`)
      .join("\n");
    const selection = prompt(
      `Select a character:\n${characterOptions}\n\nEnter the number:`
    );

    if (!selection) return;

    const index = parseInt(selection) - 1;
    if (index < 0 || index >= otherCharacters.length) {
      alert("Invalid selection");
      return;
    }

    const selectedCharacter = otherCharacters[index];

    const typeOptions = RELATIONSHIP_TYPES.map((t, i) => `${i + 1}. ${t}`).join(
      "\n"
    );
    const typeSelection = prompt(
      `Select relationship type:\n${typeOptions}\n\nEnter the number:`
    );

    if (!typeSelection) return;

    const typeIndex = parseInt(typeSelection) - 1;
    if (typeIndex < 0 || typeIndex >= RELATIONSHIP_TYPES.length) {
      alert("Invalid selection");
      return;
    }

    const description = prompt("Describe this relationship (optional):") || "";

    const newRelationship: CharacterRelationship = {
      characterId: selectedCharacter.id,
      type: RELATIONSHIP_TYPES[typeIndex],
      description,
    };

    updateEditingField("relationships", [
      ...editingCharacter.relationships,
      newRelationship,
    ]);
  };

  const removeRelationship = (index: number) => {
    if (!editingCharacter) return;
    const updated = editingCharacter.relationships.filter(
      (_, i) => i !== index
    );
    updateEditingField("relationships", updated);
  };

  const getCharacterName = (id: string): string => {
    const char = localCharacters.find((c) => c.id === id);
    return char ? char.name : "Unknown";
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
          maxWidth: "900px",
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
            Character Manager
          </h2>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {editingCharacter ? (
            // Edit Form
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#2c3e50",
                  }}
                >
                  Character Name *
                </label>
                <input
                  type="text"
                  value={editingCharacter.name}
                  onChange={(e) => updateEditingField("name", e.target.value)}
                  placeholder="e.g., Elizabeth Bennet"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0c392",
                    borderRadius: "6px",
                    fontSize: "16px",
                    backgroundColor: "#fff",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#2c3e50",
                  }}
                >
                  Role
                </label>
                <select
                  value={editingCharacter.role}
                  onChange={(e) =>
                    updateEditingField("role", e.target.value as CharacterRole)
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0c392",
                    borderRadius: "6px",
                    fontSize: "16px",
                    backgroundColor: "#fff",
                  }}
                >
                  {CHARACTER_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#2c3e50",
                  }}
                >
                  Traits
                </label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {editingCharacter.traits.map((trait, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: "#dbeafe",
                        color: "#1e40af",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {trait}
                      <button
                        onClick={() => removeTrait(index)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#1e40af",
                          fontSize: "16px",
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={addTrait}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#ef8432",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  + Add Trait
                </button>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Alternative Names / Aliases
                </label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {editingCharacter.linkedNames.map((name, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {name}
                      <button
                        onClick={() => removeLinkedName(index)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#92400e",
                          fontSize: "16px",
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={addLinkedName}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#f59e0b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  + Add Name
                </button>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Background
                </label>
                <textarea
                  value={editingCharacter.background}
                  onChange={(e) =>
                    updateEditingField("background", e.target.value)
                  }
                  placeholder="Character's backstory, history, upbringing..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Goals
                </label>
                <textarea
                  value={editingCharacter.goals}
                  onChange={(e) => updateEditingField("goals", e.target.value)}
                  placeholder="What does this character want? What are they trying to achieve?"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Conflicts
                </label>
                <textarea
                  value={editingCharacter.conflicts}
                  onChange={(e) =>
                    updateEditingField("conflicts", e.target.value)
                  }
                  placeholder="Internal and external conflicts..."
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#2c3e50",
                  }}
                >
                  Character Arc
                </label>
                <textarea
                  value={editingCharacter.arc}
                  onChange={(e) => updateEditingField("arc", e.target.value)}
                  placeholder="How does this character change throughout the story?"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0c392",
                    borderRadius: "6px",
                    fontSize: "14px",
                    resize: "vertical",
                    backgroundColor: "#fff",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Relationships
                </label>
                {editingCharacter.relationships.length > 0 ? (
                  <div style={{ marginBottom: "8px" }}>
                    {editingCharacter.relationships.map((rel, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: "#f3f4f6",
                          padding: "12px",
                          borderRadius: "6px",
                          marginBottom: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <div>
                          <strong>{getCharacterName(rel.characterId)}</strong> -{" "}
                          <em style={{ color: "#6b7280" }}>{rel.type}</em>
                          {rel.description && (
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#4b5563",
                                marginTop: "4px",
                              }}
                            >
                              {rel.description}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeRelationship(index)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            fontSize: "18px",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      margin: "0 0 8px",
                    }}
                  >
                    No relationships defined yet.
                  </p>
                )}
                <button
                  onClick={addRelationship}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#8b5cf6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  + Add Relationship
                </button>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#2c3e50",
                  }}
                >
                  Notes
                </label>
                <textarea
                  value={editingCharacter.notes}
                  onChange={(e) => updateEditingField("notes", e.target.value)}
                  placeholder="Additional notes, ideas, or reminders..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0c392",
                    borderRadius: "6px",
                    fontSize: "14px",
                    resize: "vertical",
                    backgroundColor: "#fff",
                  }}
                />
              </div>

              {/* Edit Form Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleCancelEdit}
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
                  Cancel
                </button>
                <button
                  onClick={handleSaveCharacter}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#ef8432",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Save Character
                </button>
              </div>
            </div>
          ) : (
            // Character List
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ margin: 0, color: "#2c3e50" }}>
                  Characters ({localCharacters.length})
                </h3>
                <button
                  onClick={() => {
                    if (onOpenTemplate) {
                      const template = getTemplateById("fiction");
                      if (template) {
                        const templateHtml = template.generateTemplate({}, "");
                        onOpenTemplate(templateHtml);
                        onClose();
                      }
                    } else {
                      handleAddNew();
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#ef8432",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  title="Create a new character using the detailed character template"
                >
                  + New Character
                </button>
              </div>

              {localCharacters.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6b7280",
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                    📝
                  </div>
                  <p style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
                    No characters yet. Click <strong>+ New Character</strong> to
                    create one using the detailed character template.
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#92400e" }}>
                    The template includes sections for identity, origin, skills,
                    psychology, relationships, and more.
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
                  {localCharacters.map((character) => (
                    <div
                      key={character.id}
                      style={{
                        backgroundColor: "#fff7ed",
                        border: "2px solid #e0c392",
                        borderRadius: "8px",
                        padding: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            margin: "0 0 8px 0",
                            color: "#2c3e50",
                            fontSize: "18px",
                          }}
                        >
                          {character.name}
                        </h4>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginBottom: "8px",
                          }}
                        >
                          <strong>Role:</strong>{" "}
                          {CHARACTER_ROLES.find(
                            (r) => r.value === character.role
                          )?.label || character.role}
                        </div>
                        {character.traits.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            {character.traits.map((trait, i) => (
                              <span
                                key={i}
                                style={{
                                  backgroundColor: "#dbeafe",
                                  color: "#1e40af",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  fontSize: "12px",
                                }}
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            if (onOpenTemplate) {
                              const template = getTemplateById("fiction");
                              if (template) {
                                const templateHtml = template.generateTemplate(
                                  {},
                                  ""
                                );
                                onOpenTemplate(templateHtml, character.id);
                                onClose();
                              }
                            } else {
                              handleEdit(character);
                            }
                          }}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#ef8432",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(character.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!editingCharacter && localCharacters.length > 0 && (
          <div
            style={{
              padding: "24px",
              borderTop: "2px solid #e0c392",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleSaveAll}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ef8432",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Save All & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
