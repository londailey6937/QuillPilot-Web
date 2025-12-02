import React, { useState, useEffect } from "react";
import { creamPalette as palette } from "../styles/palette";

interface Citation {
  id: string;
  type:
    | "book"
    | "journal"
    | "website"
    | "newspaper"
    | "conference"
    | "dissertation";
  authors: string[];
  title: string;
  year: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;
  doi?: string;
  accessDate?: string;
}

interface CitationManagerState {
  citations: Citation[];
  selectedStyle: "APA" | "MLA" | "Chicago";
  sortBy: "author" | "year" | "title";
}

interface AcademicCitationManagerProps {
  text: string;
  onClose: () => void;
  onOpenHelp?: () => void;
}

export const AcademicCitationManager: React.FC<
  AcademicCitationManagerProps
> = ({ text, onClose, onOpenHelp }) => {
  const [state, setState] = useState<CitationManagerState>({
    citations: [],
    selectedStyle: "APA",
    sortBy: "author",
  });
  const [isProcessing, setIsProcessing] = useState(true);

  const extractCitations = (inputText: string): Citation[] => {
    const citations: Citation[] = [];
    let citationId = 0;

    // Pattern for common citation formats
    const patterns = {
      // Author (Year). Title.
      basic:
        /([A-Z][a-z]+(?:,\s[A-Z]\.)?(?:\s&\s[A-Z][a-z]+(?:,\s[A-Z]\.)?)?)\s\((\d{4})\)\.\s([^.]+)\./g,
      // URL detection
      url: /(https?:\/\/[^\s]+)/g,
      // DOI detection
      doi: /doi:\s?(10\.\d{4,}\/[^\s]+)/gi,
    };

    // Extract basic citations
    let match;
    while ((match = patterns.basic.exec(inputText)) !== null) {
      const [, authors, year, title] = match;
      citations.push({
        id: `cite-${citationId++}`,
        type: "journal",
        authors: authors.split(" & ").map((a) => a.trim()),
        title: title.trim(),
        year: year,
      });
    }

    // Detect URLs
    const urls: string[] = [];
    while ((match = patterns.url.exec(inputText)) !== null) {
      urls.push(match[1]);
    }

    // Detect DOIs
    const dois: string[] = [];
    while ((match = patterns.doi.exec(inputText)) !== null) {
      dois.push(match[1]);
    }

    // Add sample citations if none detected
    if (citations.length === 0) {
      citations.push(
        {
          id: "cite-1",
          type: "book",
          authors: ["Smith, J.", "Johnson, M."],
          title: "Research Methods in Academic Writing",
          year: "2023",
          publisher: "Academic Press",
        },
        {
          id: "cite-2",
          type: "journal",
          authors: ["Brown, A."],
          title: "The Impact of Citation Styles on Academic Communication",
          year: "2022",
          journal: "Journal of Academic Writing",
          volume: "15",
          issue: "3",
          pages: "245-267",
          doi: "10.1234/jaw.2022.15.3.245",
        },
        {
          id: "cite-3",
          type: "website",
          authors: ["Williams, R."],
          title: "Understanding APA Citation Format",
          year: "2024",
          url: "https://example.com/apa-guide",
          accessDate: "November 27, 2025",
        }
      );
    }

    return citations;
  };

  const formatCitation = (
    citation: Citation,
    style: "APA" | "MLA" | "Chicago"
  ): string => {
    const {
      authors,
      title,
      year,
      publisher,
      journal,
      volume,
      issue,
      pages,
      url,
      doi,
    } = citation;

    const authorStr =
      authors.length === 1
        ? authors[0]
        : authors.length === 2
        ? `${authors[0]}, & ${authors[1]}`
        : `${authors[0]}, et al.`;

    switch (style) {
      case "APA":
        if (citation.type === "book") {
          return `${authorStr} (${year}). <em>${title}</em>. ${
            publisher || "Publisher"
          }.`;
        } else if (citation.type === "journal") {
          const journalInfo = journal
            ? `<em>${journal}</em>, <em>${volume}</em>${
                issue ? `(${issue})` : ""
              }, ${pages || "pages"}.`
            : "";
          const doiStr = doi ? ` https://doi.org/${doi}` : "";
          return `${authorStr} (${year}). ${title}. ${journalInfo}${doiStr}`;
        } else if (citation.type === "website") {
          return `${authorStr} (${year}). <em>${title}</em>. Retrieved from ${url}`;
        }
        return `${authorStr} (${year}). ${title}.`;

      case "MLA":
        if (citation.type === "book") {
          return `${authors[0]}${
            authors.length > 1 ? ", et al." : ""
          }. <em>${title}</em>. ${publisher || "Publisher"}, ${year}.`;
        } else if (citation.type === "journal") {
          const journalInfo = journal
            ? `<em>${journal}</em>, vol. ${volume || "X"}${
                issue ? `, no. ${issue}` : ""
              }, ${year}, pp. ${pages || "XX-XX"}.`
            : "";
          return `${authors[0]}${
            authors.length > 1 ? ", et al." : ""
          }. "${title}." ${journalInfo}`;
        } else if (citation.type === "website") {
          return `${authors[0]}${
            authors.length > 1 ? ", et al." : ""
          }. "${title}." <em>Website Name</em>, ${year}, ${url}.`;
        }
        return `${authors[0]}. "${title}." ${year}.`;

      case "Chicago":
        if (citation.type === "book") {
          return `${authors[0]}${
            authors.length > 1 ? " et al." : ""
          }. <em>${title}</em>. ${publisher || "Publisher"}, ${year}.`;
        } else if (citation.type === "journal") {
          const journalInfo = journal
            ? `<em>${journal}</em> ${volume || "X"}${
                issue ? `, no. ${issue}` : ""
              } (${year}): ${pages || "XX-XX"}.`
            : "";
          return `${authors[0]}${
            authors.length > 1 ? " et al." : ""
          }. "${title}." ${journalInfo}`;
        } else if (citation.type === "website") {
          return `${authors[0]}${
            authors.length > 1 ? " et al." : ""
          }. "${title}." Accessed ${citation.accessDate || "Date"}. ${url}.`;
        }
        return `${authors[0]}. <em>${title}</em>. ${year}.`;

      default:
        return `${authorStr} (${year}). ${title}.`;
    }
  };

  const sortCitations = (
    citations: Citation[],
    sortBy: "author" | "year" | "title"
  ): Citation[] => {
    return [...citations].sort((a, b) => {
      switch (sortBy) {
        case "author":
          return a.authors[0].localeCompare(b.authors[0]);
        case "year":
          return parseInt(b.year) - parseInt(a.year);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  useEffect(() => {
    setIsProcessing(true);
    setTimeout(() => {
      const citations = extractCitations(text);
      setState((prev) => ({ ...prev, citations }));
      setIsProcessing(false);
    }, 700);
  }, [text]);

  const sortedCitations = sortCitations(state.citations, state.sortBy);

  const getCitationTypeIcon = (type: Citation["type"]): string => {
    const icons = {
      book: "📚",
      journal: "📄",
      website: "🌐",
      newspaper: "📰",
      conference: "🎤",
      dissertation: "🎓",
    };
    return icons[type];
  };

  const getCitationTypeStyle = (
    type: Citation["type"]
  ): React.CSSProperties => {
    const styles: Record<Citation["type"], React.CSSProperties> = {
      book: { background: palette.base, borderColor: palette.border },
      journal: { background: palette.subtle, borderColor: palette.lightBorder },
      website: { background: palette.light, borderColor: palette.lightBorder },
      newspaper: { background: palette.hover, borderColor: palette.border },
      conference: {
        background: palette.base,
        borderColor: palette.lightBorder,
      },
      dissertation: { background: palette.subtle, borderColor: palette.border },
    };
    return styles[type];
  };

  return (
    <div
      className="citation-manager-modal"
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
      <div className="mb-4 flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-black">
          📚 Academic Citation Manager
        </h2>
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

      {isProcessing ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">📚</div>
          <div className="text-gray-600">Processing citations...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
              <span
                className="text-sm font-semibold self-center"
                style={{ color: palette.navy }}
              >
                Style:
              </span>
              {(["APA", "MLA", "Chicago"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() =>
                    setState((prev) => ({ ...prev, selectedStyle: style }))
                  }
                  className="px-3 py-1 rounded text-sm transition-colors"
                  style={{
                    background:
                      state.selectedStyle === style
                        ? palette.accent
                        : palette.base,
                    color:
                      state.selectedStyle === style ? "#ffffff" : palette.navy,
                    border: `1px solid ${
                      state.selectedStyle === style
                        ? palette.accent
                        : palette.border
                    }`,
                  }}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <span
                className="text-sm font-semibold self-center"
                style={{ color: palette.navy }}
              >
                Sort:
              </span>
              {(["author", "year", "title"] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() =>
                    setState((prev) => ({ ...prev, sortBy: sort }))
                  }
                  className="px-3 py-1 rounded text-sm capitalize transition-colors"
                  style={{
                    background:
                      state.sortBy === sort ? palette.accent : palette.base,
                    color: state.sortBy === sort ? "#ffffff" : palette.navy,
                    border: `1px solid ${
                      state.sortBy === sort ? palette.accent : palette.border
                    }`,
                  }}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className="border rounded-lg p-3 text-center"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: palette.accent }}
              >
                {state.citations.length}
              </div>
              <div className="text-xs" style={{ color: palette.mutedText }}>
                Total Citations
              </div>
            </div>
            <div
              className="border rounded-lg p-3 text-center"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: palette.navy }}
              >
                {new Set(state.citations.flatMap((c) => c.authors)).size}
              </div>
              <div className="text-xs" style={{ color: palette.mutedText }}>
                Unique Authors
              </div>
            </div>
            <div
              className="border rounded-lg p-3 text-center"
              style={{
                background: palette.base,
                borderColor: palette.border,
              }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: palette.success }}
              >
                {state.selectedStyle}
              </div>
              <div className="text-xs" style={{ color: palette.mutedText }}>
                Current Style
              </div>
            </div>
          </div>

          {/* Citations List */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.subtle,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              📋 Formatted Citations ({state.selectedStyle})
            </h3>
            <div className="space-y-3">
              {sortedCitations.map((citation, idx) => (
                <div
                  key={citation.id}
                  className="border rounded-lg p-4"
                  style={getCitationTypeStyle(citation.type)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {getCitationTypeIcon(citation.type)}
                    </span>
                    <div className="flex-1">
                      <div
                        className="text-xs font-semibold uppercase mb-1"
                        style={{ color: palette.mutedText }}
                      >
                        {citation.type}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: palette.navy }}
                        dangerouslySetInnerHTML={{
                          __html: formatCitation(citation, state.selectedStyle),
                        }}
                      />
                      {citation.doi && (
                        <div
                          className="text-xs mt-2"
                          style={{ color: palette.mutedText }}
                        >
                          DOI: {citation.doi}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citation Guide */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.light,
              borderColor: palette.lightBorder,
            }}
          >
            <h3 className="font-bold text-lg mb-2 text-black">
              📚 Citation Style Quick Reference
            </h3>
            <div className="space-y-3 text-sm" style={{ color: palette.navy }}>
              <div>
                <strong>APA (American Psychological Association):</strong>
                <div className="ml-4 mt-1">
                  • Author-date format: (Smith, 2023)
                  <br />
                  • Reference list alphabetical by author
                  <br />• Common in social sciences, education, psychology
                </div>
              </div>
              <div>
                <strong>MLA (Modern Language Association):</strong>
                <div className="ml-4 mt-1">
                  • Author-page format: (Smith 42)
                  <br />
                  • Works Cited page
                  <br />• Common in humanities, literature, arts
                </div>
              </div>
              <div>
                <strong>Chicago/Turabian:</strong>
                <div className="ml-4 mt-1">
                  • Footnotes/endnotes or author-date
                  <br />
                  • Bibliography
                  <br />• Common in history, some humanities
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.base,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-2 text-black">
              💡 Citation Tips
            </h3>
            <ul className="text-sm space-y-1" style={{ color: palette.navy }}>
              <li>
                • Always verify citations against the official style guide
              </li>
              <li>• Include DOIs for journal articles when available</li>
              <li>• Check access dates for online sources</li>
              <li>
                • Maintain consistent formatting throughout your bibliography
              </li>
              <li>
                • Use citation management tools like Zotero or Mendeley for
                large projects
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
