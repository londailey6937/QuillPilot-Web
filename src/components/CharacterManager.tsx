import React from "react";
import { Character } from "../types";
import { getTemplateById } from "@/utils/templateLibrary";

interface CharacterManagerProps {
  characters: Character[];
  onSave: (characters: Character[]) => void;
  onClose: () => void;
  onOpenTemplate?: (templateHtml: string, characterId?: string) => void;
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({
  onClose,
  onOpenTemplate,
}) => {
  const handleCreateCharacter = () => {
    if (onOpenTemplate) {
      const template = getTemplateById("fiction");
      if (template) {
        const templateHtml = template.generateTemplate({}, "");
        onOpenTemplate(templateHtml);
        onClose();
      }
    }
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
          maxWidth: "500px",
          width: "100%",
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
            👤 Character Template
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6b7280",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          <p style={{ margin: "0 0 16px 0", color: "#2c3e50", fontSize: "15px", lineHeight: "1.6" }}>
            Create a rich, multi-dimensional character using our comprehensive 22-step character arc template.
          </p>
          
          <div style={{ 
            backgroundColor: "#fff7ed", 
            border: "1px solid #e0c392", 
            borderRadius: "8px", 
            padding: "16px",
            marginBottom: "20px"
          }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#92400e", fontSize: "14px" }}>
              Template Includes:
            </h4>
            <ul style={{ 
              margin: 0, 
              paddingLeft: "20px", 
              color: "#2c3e50", 
              fontSize: "13px",
              lineHeight: "1.8"
            }}>
              <li>Character Identity & Role</li>
              <li>Origin & Formation</li>
              <li>Skills & Capabilities</li>
              <li>Personality Architecture</li>
              <li>Relationships & Connections</li>
              <li>Psychology & Inner Need</li>
              <li>22-Step Character Arc</li>
              <li>Thematic Resonance</li>
            </ul>
          </div>

          <p style={{ margin: "0 0 20px 0", color: "#6b7280", fontSize: "13px" }}>
            Your characters will appear in the sidebar above the Advanced Tools rail.
          </p>

          <button
            onClick={handleCreateCharacter}
            style={{
              width: "100%",
              padding: "14px 24px",
              backgroundColor: "#ef8432",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#d97706";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ef8432";
            }}
          >
            + Create New Character
          </button>
        </div>
      </div>
    </div>
  );
};
