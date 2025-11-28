import React, { useState, useRef } from "react";
import { creamPalette as palette } from "../styles/palette";

interface ImageMoodBoardProps {
  onClose: () => void;
}

interface MoodImage {
  id: string;
  url: string;
  filename: string;
  notes: string;
  tags: string[];
  category: "character" | "scene" | "mood" | "reference";
  created: Date;
}

export const ImageMoodBoard: React.FC<ImageMoodBoardProps> = ({ onClose }) => {
  const [images, setImages] = useState<MoodImage[]>([
    {
      id: "1",
      url: "https://via.placeholder.com/300x200/f5e6d3/2c3e50?text=Sample+Scene",
      filename: "forest-reference.jpg",
      notes: "Dense forest lighting for Chapter 3",
      tags: ["forest", "lighting"],
      category: "scene",
      created: new Date(),
    },
    {
      id: "2",
      url: "https://via.placeholder.com/300x200/eddcc5/2c3e50?text=Character+Ref",
      filename: "character-costume.jpg",
      notes: "Victorian-era dress inspiration",
      tags: ["costume", "victorian"],
      category: "character",
      created: new Date(),
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "character", label: "Characters", icon: "👤" },
    { id: "scene", label: "Scenes", icon: "🎬" },
    { id: "mood", label: "Mood", icon: "🎨" },
    { id: "reference", label: "Reference", icon: "📌" },
  ];

  const filteredImages =
    selectedCategory === "all"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: MoodImage = {
          id: Date.now().toString() + Math.random(),
          url: e.target?.result as string,
          filename: file.name,
          notes: "",
          tags: [],
          category: "reference",
          created: new Date(),
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const deleteImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const updateImage = (id: string, updates: Partial<MoodImage>) => {
    setImages(
      images.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  };

  const addTag = (id: string, tag: string) => {
    const image = images.find((img) => img.id === id);
    if (!image || !tag.trim()) return;
    const newTags = [...image.tags, tag.trim()];
    updateImage(id, { tags: newTags });
  };

  const removeTag = (id: string, tagIndex: number) => {
    const image = images.find((img) => img.id === id);
    if (!image) return;
    const newTags = image.tags.filter((_, idx) => idx !== tagIndex);
    updateImage(id, { tags: newTags });
  };

  return (
    <div
      className="image-mood-board-modal"
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
        maxWidth: "1000px",
        maxHeight: "85vh",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-black">🖼️ Image Mood Board</h2>
        <p className="text-sm" style={{ color: palette.mutedText }}>
          Visual references for scenes and characters
        </p>
      </div>

      <div className="space-y-4">
        {/* Upload & Filter */}
        <div className="flex gap-2 items-center flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 rounded-lg font-semibold transition-colors"
            style={{
              background: palette.accent,
              color: "#ffffff",
              border: `1px solid ${palette.accent}`,
            }}
          >
            📤 Upload Images
          </button>

          <div className="h-6 w-px" style={{ background: palette.border }} />

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
            All ({images.length})
          </button>
          {categories.map((cat) => {
            const count = images.filter(
              (img) => img.category === cat.id
            ).length;
            return (
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
                {cat.icon} {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div
            className="text-center py-12 border-2 border-dashed rounded-lg"
            style={{
              borderColor: palette.border,
              color: palette.mutedText,
            }}
          >
            <div className="text-4xl mb-2">📷</div>
            <p>No images yet. Upload your first reference!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="border rounded-lg overflow-hidden"
                style={{
                  background: palette.subtle,
                  borderColor: palette.lightBorder,
                }}
              >
                {/* Image */}
                <div
                  className="relative"
                  style={{
                    paddingTop: "66.67%", // 3:2 aspect ratio
                    background: palette.light,
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{
                      background: "rgba(239, 68, 68, 0.9)",
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>

                {/* Details */}
                <div className="p-3">
                  <div className="mb-2">
                    <select
                      value={image.category}
                      onChange={(e) =>
                        updateImage(image.id, {
                          category: e.target.value as MoodImage["category"],
                        })
                      }
                      className="w-full px-2 py-1 text-sm rounded border"
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
                  </div>

                  <textarea
                    value={image.notes}
                    onChange={(e) =>
                      updateImage(image.id, { notes: e.target.value })
                    }
                    placeholder="Add notes..."
                    rows={2}
                    className="w-full px-2 py-1 text-sm rounded border mb-2"
                    style={{
                      background: palette.base,
                      borderColor: palette.border,
                      color: palette.navy,
                    }}
                  />

                  {/* Tags */}
                  <div className="flex gap-1 flex-wrap mb-2">
                    {image.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded flex items-center gap-1"
                        style={{
                          background: palette.light,
                          border: `1px solid ${palette.lightBorder}`,
                          color: palette.navy,
                        }}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(image.id, idx)}
                          className="text-red-500 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {editingId === image.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Add tag..."
                        className="flex-1 px-2 py-1 text-sm rounded border"
                        style={{
                          background: palette.base,
                          borderColor: palette.border,
                          color: palette.navy,
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addTag(image.id, e.currentTarget.value);
                            e.currentTarget.value = "";
                            setEditingId(null);
                          } else if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(image.id)}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: palette.base,
                        border: `1px solid ${palette.border}`,
                        color: palette.mutedText,
                      }}
                    >
                      + Add Tag
                    </button>
                  )}

                  <div
                    className="text-xs mt-2"
                    style={{ color: palette.mutedText }}
                  >
                    {image.filename}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
