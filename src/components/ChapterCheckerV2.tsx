/**
 * Simplified Chapter Checker - DOCX First Workflow
 * Upload DOCX/TXT → Analyze → Edit → Export
 */

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  lazy,
  Suspense,
  useCallback,
} from "react";
import { DocumentUploader, UploadedDocumentPayload } from "./DocumentUploader";
import { NavigationMenu } from "./NavigationMenu";
import { DarkModeToggle } from "./ThemeProvider";
import { ChapterAnalysis, Section } from "@/types";

// Lazy load large modal components for better initial load performance
const HelpModal = lazy(() =>
  import("./HelpModal").then((m) => ({ default: m.HelpModal }))
);
const ReferenceLibraryModal = lazy(() =>
  import("./ReferenceLibraryModal").then((m) => ({
    default: m.ReferenceLibraryModal,
  }))
);
const WritersReferenceModal = lazy(() =>
  import("./WritersReferenceModal").then((m) => ({
    default: m.WritersReferenceModal,
  }))
);
const QuickStartModal = lazy(() =>
  import("./QuickStartModal").then((m) => ({ default: m.QuickStartModal }))
);
const ManuscriptFormatModal = lazy(() => import("./ManuscriptFormatModal"));

// Regular imports for components that render during auth state changes
// (Lazy loading these causes React error #426 during synchronous updates)
import { DocumentEditor } from "./DocumentEditor";
import { ChapterAnalysisDashboard } from "./VisualizationComponents";
import { UpgradePrompt, InlineUpgradePrompt } from "./UpgradePrompt";
import { TierTwoPreview } from "./TierTwoPreview";
import { MissingConceptSuggestions } from "./MissingConceptSuggestions";
import { CharacterManager } from "./CharacterManager";

import {
  AccessLevel,
  ACCESS_TIERS,
  Character,
  CharacterMapping,
  CharacterRole,
} from "../../types";
import type { Genre } from "@/data/genreRegistry";
import { detectGenre, getAvailableGenres } from "@/data/genreRegistry";
import type { ConceptDefinition } from "@/data/conceptLibraryRegistry";
import {
  analyzeAllCharacterArcs,
  CharacterArcProgress,
  CHARACTER_ARC_STEPS,
  getStepColor,
  POSITION_LABELS,
} from "@/utils/characterAnalyzer";
import {
  supabase,
  getCurrentUser,
  getUserProfile,
  saveAnalysis,
  getSavedAnalyses,
} from "@/utils/supabase";
import {
  loadCustomDomains,
  saveCustomDomain,
  getCustomDomain,
  convertToConceptDefinitions,
} from "@/utils/customDomainStorage";
import AnalysisWorker from "@/workers/analysisWorker?worker";
import { buildTierOneAnalysisSummary } from "@/utils/tierOneAnalysis";
// Dynamic imports for export functions (code-splitting)
import type { ManuscriptSettings } from "@/utils/pdfExport";
import {
  TEMPLATE_LIBRARY,
  type Template,
  getTemplateById,
} from "@/utils/templateLibrary";
import {
  processClaudePrompts,
  getStoredClaudeKey,
  storeClaudeKey,
  validateClaudeKey,
} from "@/utils/claudeIntegration";
import {
  extractGeneralConcepts,
  type GeneralConcept,
} from "@/utils/generalConceptExtractor";
import { AnimatedLogo } from "./AnimatedLogo";
import { AuthModal } from "./AuthModal";
import { UserMenu } from "./UserMenu";

const HEADING_LENGTH_LIMIT = 120;
const MAX_FALLBACK_SECTIONS = 8;
const STICKY_HEADER_OFFSET = 140;

type AutosaveSnapshot = {
  content?: {
    plainText?: string;
    editorHtml?: string;
  };
  fileName?: string;
  timestamp: string;
  analysis?: ChapterAnalysis | null;
  isTemplateMode?: boolean;
};

// Custom Dropdown Component
interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "6px 30px 6px 12px",
          backgroundColor: "#fef5e7",
          color: "#2c3e50",
          border: "1.5px solid #2c3e50",
          borderRadius: "16px",
          cursor: "pointer",
          fontSize: "0.875rem",
          minWidth: "0",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232c3e50' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          whiteSpace: "nowrap",
        }}
      >
        {selectedOption?.label}
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "#fef5e7",
            border: "1.5px solid #ef8432",
            borderRadius: "16px",
            overflow: "hidden",
            zIndex: 1000,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "#2c3e50",
                backgroundColor: option.value === value ? "#f7e6d0" : "#fef5e7",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (option.value !== value) {
                  e.currentTarget.style.backgroundColor = "#f7e6d0";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  option.value === value ? "#f7e6d0" : "#fef5e7";
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

type LayoutMode = "desktop" | "laptop" | "tablet";
type SelectedDomain = Genre | "none" | "custom";
type Domain = Genre; // Alias for compatibility

const resolveLayoutMode = (width: number): LayoutMode => {
  // Tablet: ≤1024px (iPad and smaller)
  if (width <= 1024) {
    return "tablet";
  }
  // Laptop: 1025-1920px (13-16 inch laptops)
  if (width <= 1920) {
    return "laptop";
  }
  // Desktop: >1920px (27 inch and larger monitors)
  return "desktop";
};

const countWordsQuick = (value: string): number => {
  if (!value.trim()) {
    return 0;
  }
  const matches = value.trim().match(/[A-Za-z0-9'’]+/g);
  return matches ? matches.length : 0;
};

const normalizeHeadingLabel = (
  value: string | null | undefined,
  fallback: string
): string => {
  const raw = (value || "")
    .replace(/\\[A-Za-z]+/g, " ")
    .replace(/[_*#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) {
    return fallback;
  }
  const limited = raw.slice(0, HEADING_LENGTH_LIMIT).trim();
  return /[A-Za-z0-9]/.test(limited) ? limited : fallback;
};

type SectionCandidate = {
  heading: string;
  start: number;
  contentStart: number;
  depth: number;
};

const looksLikeHeading = (
  line: string,
  prevBlank: boolean,
  nextBlank: boolean
) => {
  if (!prevBlank) return false;
  if (line.length > HEADING_LENGTH_LIMIT) return false;
  const noTerminalPunctuation = !/[.!?]$/.test(line);
  const uppercaseCount = (line.match(/[A-Z]/g) || []).length;
  const letterCount = (line.match(/[A-Za-z]/g) || []).length || 1;
  const uppercaseRatio = uppercaseCount / letterCount;
  return (
    uppercaseRatio > 0.6 ||
    (nextBlank &&
      /^[A-Z][A-Za-z0-9 ,:'\-]{3,}$/.test(line) &&
      noTerminalPunctuation)
  );
};

const buildSectionsFromCandidates = (
  text: string,
  candidates: SectionCandidate[]
): Section[] => {
  if (candidates.length === 0) {
    return [];
  }

  const normalized = [...candidates];

  if (normalized[0].start > 0) {
    normalized.unshift({
      heading: "Introduction",
      start: 0,
      contentStart: 0,
      depth: 1,
    });
  }

  const sections: Section[] = [];

  normalized.forEach((candidate, idx) => {
    const nextStart = normalized[idx + 1]?.start ?? text.length;
    const content = text.slice(candidate.contentStart, nextStart).trim();
    if (!content) {
      return;
    }

    const sectionId = sections.length + 1;
    sections.push({
      id: `section-${sectionId}`,
      heading: normalizeHeadingLabel(candidate.heading, `Section ${sectionId}`),
      content,
      startPosition: candidate.start,
      endPosition: nextStart,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      conceptsIntroduced: [],
      conceptsRevisited: [],
      depth: candidate.depth,
    });
  });

  return sections;
};

const buildFallbackSections = (text: string): Section[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const desiredSections = Math.max(
    1,
    Math.min(
      MAX_FALLBACK_SECTIONS,
      Math.round(trimmed.split(/\s+/).length / 350)
    )
  );
  const chunkSize = Math.max(1, Math.floor(text.length / desiredSections));
  const sections: Section[] = [];

  for (let start = 0; start < text.length; start += chunkSize) {
    const end = Math.min(text.length, start + chunkSize);
    const content = text.slice(start, end).trim();
    if (!content) continue;

    const sectionId = sections.length + 1;
    sections.push({
      id: `auto-section-${sectionId}`,
      heading: normalizeHeadingLabel(
        `Segment ${sectionId}`,
        `Segment ${sectionId}`
      ),
      content,
      startPosition: start,
      endPosition: end,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      conceptsIntroduced: [],
      conceptsRevisited: [],
      depth: 1,
    });
  }

  if (sections.length === 0) {
    sections.push({
      id: "auto-section-1",
      heading: normalizeHeadingLabel("Full Chapter", "Full Chapter"),
      content: trimmed,
      startPosition: 0,
      endPosition: text.length,
      wordCount: trimmed.split(/\s+/).filter(Boolean).length,
      conceptsIntroduced: [],
      conceptsRevisited: [],
      depth: 1,
    });
  }

  return sections;
};

const deriveSectionsFromText = (rawText: string): Section[] => {
  const text = rawText.replace(/\r\n?/g, "\n");
  if (!text.trim()) return [];

  const lines = text.split("\n");
  const candidates: SectionCandidate[] = [];
  let cursor = 0;

  const pushCandidate = (
    heading: string,
    start: number,
    contentStart: number,
    depth: number
  ) => {
    candidates.push({
      heading: heading.trim() || `Section ${candidates.length + 1}`,
      start,
      contentStart: Math.min(contentStart, text.length),
      depth,
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineStart = cursor;
    const nextStart = Math.min(text.length, cursor + line.length + 1);
    const prevBlank = i === 0 || !lines[i - 1].trim();
    const nextBlank = i + 1 >= lines.length || !lines[i + 1].trim();

    let detectedHeading: string | null = null;
    let depth = 1;

    if (!trimmed) {
      cursor = nextStart;
      continue;
    }

    const markdownMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (markdownMatch) {
      depth = markdownMatch[1].length;
      detectedHeading = markdownMatch[2];
    } else {
      const numberedMatch = trimmed.match(
        /^(\d+(?:\.\d+){0,3}[).\-]?)\s+(.*)$/
      );
      if (numberedMatch) {
        depth = numberedMatch[1].split(".").length;
        detectedHeading = numberedMatch[2];
      } else if (looksLikeHeading(trimmed, prevBlank, nextBlank)) {
        detectedHeading = trimmed.replace(/[:\-]+$/, "");
      }
    }

    if (detectedHeading) {
      pushCandidate(detectedHeading, lineStart, nextStart, depth);
    }

    cursor = nextStart;
  }

  const sections = buildSectionsFromCandidates(text, candidates);
  if (sections.length > 0) {
    return sections;
  }

  return buildFallbackSections(text);
};

export const ChapterCheckerV2: React.FC = () => {
  // Access control state - initialize from localStorage cache to prevent UI jerk
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("quillpilot_access_level");
      if (cached === "premium" || cached === "professional") {
        return cached;
      }
    }
    return "free";
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(() => {
    // Only show loading if we don't have a cached access level
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("quillpilot_access_level");
      return !cached; // If no cache, we're loading; if cached, no loading screen needed
    }
    return true;
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showTierTwoPreview, setShowTierTwoPreview] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<
    "premium" | "professional"
  >("premium");
  const [upgradeFeature, setUpgradeFeature] = useState("");

  // Document state
  const [chapterText, setChapterText] = useState<string | null>(null);
  const [chapterData, setChapterData] = useState<{
    html: string;
    plainText: string;
    originalPlainText: string;
    isHybridDocx: boolean;
    imageCount: number;
    editorHtml?: string;
  } | null>(null); // Single source of truth - extracted at upload
  const [documentInstanceKey, setDocumentInstanceKey] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  // Store file handle and format for "re-save" functionality (File System Access API)
  const savedFileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const savedFormatRef = useRef<
    "docx" | "pdf" | "html" | "json" | "txt" | "md" | null
  >(null);
  // Refs to track current values for keyboard shortcuts (avoid stale closures)
  const chapterDataRef = useRef(chapterData);
  // Keep refs in sync with state
  useEffect(() => {
    chapterDataRef.current = chapterData;
  }, [chapterData]);
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  // Preserve document state when entering template mode
  const preTemplateDocumentRef = useRef<{
    chapterText: string | null;
    chapterData: typeof chapterData;
    fileName: string;
  } | null>(null);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(
    null
  ); // Track which character is being edited in template
  // Template selector removed - Character Template now in CharacterManager
  const [showClaudeKeyDialog, setShowClaudeKeyDialog] = useState(false);
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [isProcessingClaude, setIsProcessingClaude] = useState(false);
  const [claudeProgress, setClaudeProgress] = useState({
    current: 0,
    total: 0,
  });
  const [selectedTemplateForClaude, setSelectedTemplateForClaude] =
    useState<Template | null>(null);

  // Analysis state
  const [selectedDomain, setSelectedDomain] = useState<SelectedDomain | null>(
    null
  );
  const [generalConcepts, setGeneralConcepts] = useState<GeneralConcept[]>([]);
  const [detectedDomain, setDetectedDomain] = useState<Domain | null>(null);
  const [customConcepts, setCustomConcepts] = useState<ConceptDefinition[]>([]);
  const [customDomainName, setCustomDomainName] = useState("");
  const [showCustomDomainDialog, setShowCustomDomainDialog] = useState(false);
  const [showDomainSelector, setShowDomainSelector] = useState(false);
  const [analysis, setAnalysis] = useState<ChapterAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(false);
  const autoAnalysisTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastExtractedTitleRef = useRef<string>("");

  // UI state - viewMode initialized based on cached access level (tier 3 = writer mode)
  const [viewMode, setViewMode] = useState<"analysis" | "writer">(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("quillpilot_access_level");
      // Tier 3 (professional) users default to writer mode
      if (cached === "professional") {
        return "writer";
      }
    }
    return "analysis";
  });
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isReferenceLibraryModalOpen, setIsReferenceLibraryModalOpen] =
    useState(false);
  const [isWritersReferenceModalOpen, setIsWritersReferenceModalOpen] =
    useState(false);
  const [writersReferenceSection, setWritersReferenceSection] = useState<
    string | undefined
  >(undefined);
  const [isQuickStartModalOpen, setIsQuickStartModalOpen] = useState(false);

  // Ruler and margin state
  const [leftMargin, setLeftMargin] = useState(48); // pixels
  const [rightMargin, setRightMargin] = useState(48); // pixels
  const [firstLineIndent, setFirstLineIndent] = useState(32); // pixels - 4 spaces
  const [editorPageCount, setEditorPageCount] = useState(1); // Actual page count from editor
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [highlightedConceptId, setHighlightedConceptId] = useState<
    string | null
  >(null);
  const [currentMentionIndex, setCurrentMentionIndex] = useState<number>(0);
  const [highlightPosition, setHighlightPosition] = useState<number | null>(
    null
  );
  const [layoutVersion, setLayoutVersion] = useState(0); // Force re-render of positioned elements
  const [searchWord, setSearchWord] = useState<string | null>(null);
  const [searchOccurrence, setSearchOccurrence] = useState<number>(0); // Which occurrence to find
  const [scrollToTopSignal, setScrollToTopSignal] = useState(0);
  const [windowScrolled, setWindowScrolled] = useState(false);
  const [contentScrolled, setContentScrolled] = useState(false);
  const [pendingAutosave, setPendingAutosave] =
    useState<AutosaveSnapshot | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Document autosave status (for visible "Saved" indicator)
  const [documentSaveStatus, setDocumentSaveStatus] = useState<
    "saved" | "saving" | "unsaved" | "error"
  >("saved");
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Unified Save dialog state
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Shunn Manuscript Format modal state
  const [isManuscriptModalOpen, setIsManuscriptModalOpen] = useState(false);

  // Character management (Tier 3)
  const [characters, setCharacters] = useState<Character[]>([]);
  const bumpDocumentInstanceKey = useCallback(() => {
    setDocumentInstanceKey((prev) => prev + 1);
  }, []);
  const handleClearDocument = useCallback(() => {
    const blankHtml = "<p><br></p>";

    setChapterData({
      html: blankHtml,
      plainText: "",
      originalPlainText: "",
      isHybridDocx: false,
      imageCount: 0,
      editorHtml: blankHtml,
    });
    setChapterText("");
    setAnalysis(null);
    setFileName("");
    setFileType("");
    setError("");
    setGeneralConcepts([]);
    setSelectedDomain("none");
    setDetectedDomain(null);
    setCustomDomainName("");
    setCustomConcepts([]);
    setIsTemplateMode(false);
    setPendingAutosave(null);
    // Clear saved file handle and format so next save prompts for new location
    savedFileHandleRef.current = null;
    savedFormatRef.current = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("quillpilot_autosave");
      localStorage.removeItem("quillpilot_autosave_skip");
    }

    bumpDocumentInstanceKey();
  }, [bumpDocumentInstanceKey]);
  const [characterMappings, setCharacterMappings] = useState<
    CharacterMapping[]
  >([]);
  const [isCharacterManagerOpen, setIsCharacterManagerOpen] = useState(false);

  // Character Arc Analysis (22-Step) - Tier 3
  const [characterArcAnalysis, setCharacterArcAnalysis] = useState<
    CharacterArcProgress[]
  >([]);
  const [isCharacterArcExpanded, setIsCharacterArcExpanded] = useState(false);

  // Ref to store editor's insertAtCursor function
  const editorInsertRef = useRef<{
    insertAtCursor: (html: string) => void;
  } | null>(null);

  // Header/Footer settings for export (received from editor)
  const [headerFooterSettings, setHeaderFooterSettings] = useState<{
    headerText: string;
    footerText: string;
    showPageNumbers: boolean;
    pageNumberPosition: "header" | "footer";
    headerAlign: "left" | "center" | "right" | "justify";
    footerAlign: "left" | "center" | "right" | "justify";
    facingPages: boolean;
  }>({
    headerText: "",
    footerText: "",
    showPageNumbers: true,
    pageNumberPosition: "footer",
    headerAlign: "center",
    footerAlign: "center",
    facingPages: false,
  });

  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    if (typeof window === "undefined") {
      return "desktop";
    }
    return resolveLayoutMode(window.innerWidth);
  });

  const statisticsText =
    chapterText ??
    chapterData?.plainText ??
    chapterData?.originalPlainText ??
    "";
  const currentChapterText = chapterText ?? "";
  // Ref to track currentChapterText for keyboard shortcuts (avoid stale closures)
  const currentChapterTextRef = useRef(currentChapterText);
  useEffect(() => {
    currentChapterTextRef.current = currentChapterText;
  }, [currentChapterText]);
  // Ref to track handleUnifiedSave for keyboard shortcuts (avoid stale closures)
  const handleUnifiedSaveRef = useRef<() => Promise<void>>(async () => {});
  const wordCount = useMemo(
    () => countWordsQuick(statisticsText),
    [statisticsText]
  );
  const charCount = statisticsText.length;

  // Calculate reading level using Flesch-Kincaid Grade Level
  const readingLevel = useMemo(() => {
    if (!statisticsText || wordCount < 10) return 0;

    const sentences = statisticsText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;

    if (sentences === 0) return 0;

    const syllables = statisticsText.split(/\s+/).reduce((count, word) => {
      return count + Math.max(1, word.match(/[aeiouy]{1,2}/gi)?.length || 1);
    }, 0);

    const grade =
      0.39 * (wordCount / sentences) + 11.8 * (syllables / wordCount) - 15.59;
    return Math.max(0, Math.round(grade * 10) / 10);
  }, [statisticsText, wordCount]);

  const hasDocumentStats = statisticsText.trim().length > 0;

  const autosaveTimestampLabel = useMemo(() => {
    if (!pendingAutosave?.timestamp) {
      return "";
    }
    const parsedDate = new Date(pendingAutosave.timestamp);
    if (Number.isNaN(parsedDate.getTime())) {
      return pendingAutosave.timestamp;
    }
    return parsedDate.toLocaleString();
  }, [pendingAutosave]);

  // Ref for analysis panel
  const analysisPanelRef = useRef<HTMLDivElement>(null);
  const analysisControlsRef = useRef<HTMLDivElement>(null);
  const documentHeaderRef = useRef<HTMLDivElement>(null);

  // Detect document genre based on keywords
  const detectDomain = (text: string): Genre | null => {
    return detectGenre(text);
  };

  // Get and sort genres alphabetically
  const sortedDomains = useMemo(() => {
    return getAvailableGenres()
      .filter((g) => g.id !== "general")
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({ id: g.id, label: g.name, icon: g.icon }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleWindowScroll = () => {
      setWindowScrolled(window.scrollY > 200);
    };

    handleWindowScroll();
    window.addEventListener("scroll", handleWindowScroll);
    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateLayout = () => {
      setLayoutMode(resolveLayoutMode(window.innerWidth));
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // Sync user profile and access level from Supabase
  useEffect(() => {
    let isMounted = true;
    let initialSessionHandled = false;
    let signedInBeforeInitial = false;

    // Helper to load profile and update state - pass userId to avoid session fetch
    const loadAndSetProfile = async (userId: string, userEmail?: string) => {
      try {
        const profile = await getUserProfile(userId);
        if (!isMounted) return;

        if (profile) {
          console.log(
            "📋 Full profile data:",
            JSON.stringify(profile, null, 2)
          );
          setUserProfile(profile);
          const level = (profile.access_level as AccessLevel) || "free";
          console.log(
            "📋 Profile loaded, access_level:",
            level,
            "raw:",
            profile.access_level
          );
          setAccessLevel(level);
          localStorage.setItem("quillpilot_access_level", level);
          if (level === "professional" && !chapterData) {
            setViewMode("writer");
          }
        } else {
          console.warn("⚠️ User exists but no profile found for:", userEmail);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    // Listen for auth state changes - this is the primary way to get auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state change:", event, session?.user?.email);

      if (!isMounted) return;

      try {
        if (event === "INITIAL_SESSION") {
          initialSessionHandled = true;
          if (session?.user) {
            console.log("📋 Initial session found for:", session.user.email);
            await loadAndSetProfile(session.user.id, session.user.email);
          } else {
            console.log("📋 No initial session - user not logged in");
            // No session - but keep cached value for returning users
          }
          setIsLoadingProfile(false);
        } else if (event === "SIGNED_IN" && session?.user) {
          // If INITIAL_SESSION hasn't fired yet, skip - it will handle the profile load
          // This avoids the race condition where SIGNED_IN fires before session is ready
          if (!initialSessionHandled) {
            console.log(
              "📋 SIGNED_IN before INITIAL_SESSION - deferring to INITIAL_SESSION"
            );
            signedInBeforeInitial = true;
            return;
          }
          // Skip if we already have a profile loaded for this user (avoid redundant fetches after HMR)
          if (userProfile && userProfile.email === session.user.email) {
            console.log(
              "📋 Profile already loaded for:",
              session.user.email,
              "- skipping redundant fetch"
            );
            return;
          }
          console.log("📋 User signed in:", session.user.email);
          await loadAndSetProfile(session.user.id, session.user.email);
        } else if (event === "SIGNED_OUT") {
          console.log("📋 Signed out - clearing cache");
          setUserProfile(null);
          setAccessLevel("free");
          setViewMode("analysis");
          localStorage.removeItem("quillpilot_access_level");
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          // Token refresh - profile might have changed, reload it
          console.log("📋 Token refreshed for:", session.user.email);
          await loadAndSetProfile(session.user.id, session.user.email);
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
      }
    });

    // Fallback: if INITIAL_SESSION doesn't fire within 5 seconds, stop loading
    const fallbackTimeout = setTimeout(() => {
      if (!initialSessionHandled && isMounted) {
        console.log("📋 Auth initialization timeout - using cached state");
        setIsLoadingProfile(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Force layout recalculation when tier or view mode changes
  useEffect(() => {
    setLayoutVersion((prev) => prev + 1);
  }, [accessLevel, viewMode]);

  // Load saved custom domains on startup
  useEffect(() => {
    try {
      // Load custom domain from localStorage if user has access
      const features = ACCESS_TIERS[accessLevel];
      if (features.customGenres) {
        const savedDomains = loadCustomDomains();

        // Try to restore last used custom domain if it exists
        const lastCustomDomain = localStorage.getItem(
          "tomeiq_last_custom_domain"
        );
        if (lastCustomDomain) {
          const domain = getCustomDomain(lastCustomDomain);
          if (domain) {
            setCustomDomainName(domain.name);
            setCustomConcepts(convertToConceptDefinitions(domain));
            // Don't auto-select, just load it for availability
          }
        }
      }
    } catch (error) {
      console.error("Error loading custom domains:", error);
    }
  }, [accessLevel]);

  // Check for auto-saved work on startup
  useEffect(() => {
    if (chapterData) {
      return;
    }
    try {
      const autosaved = localStorage.getItem("quillpilot_autosave");
      if (!autosaved) {
        return;
      }
      const saved: AutosaveSnapshot = JSON.parse(autosaved);
      if (!saved || !saved.timestamp) {
        return;
      }
      const skipToken = localStorage.getItem("quillpilot_autosave_skip");
      if (skipToken && skipToken === saved.timestamp) {
        return;
      }
      setPendingAutosave(saved);
    } catch (error) {
      console.error("Error loading auto-saved work:", error);
    }
  }, [chapterData]);

  // Characters are now only loaded from documents (JSON files), not from localStorage
  // This prevents deleted characters from reappearing across sessions
  // One-time cleanup of old localStorage character data
  useEffect(() => {
    try {
      if (localStorage.getItem("quillpilot_characters")) {
        localStorage.removeItem("quillpilot_characters");
        console.log("🧹 Cleaned up old localStorage character data");
      }
      if (localStorage.getItem("quillpilot_character_mappings")) {
        localStorage.removeItem("quillpilot_character_mappings");
        console.log("🧹 Cleaned up old localStorage character mappings");
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }, []);

  // Listen for jump-to-position events (from dual coding buttons, etc.)
  useEffect(() => {
    const handleJumpToPosition = (event: CustomEvent) => {
      const position = event.detail?.position;
      console.log("🎯 Jump-to-position event received:", event.detail);
      if (typeof position === "number") {
        console.log("🎯 Setting highlight position to:", position);
        setHighlightPosition(position);
      } else {
        console.warn("⚠️ Invalid position in jump event:", position);
      }
    };

    window.addEventListener(
      "jump-to-position" as any,
      handleJumpToPosition as any
    );

    return () => {
      window.removeEventListener(
        "jump-to-position" as any,
        handleJumpToPosition as any
      );
    };
  }, []);

  // Listen for save character template button click (both custom event and direct click)
  useEffect(() => {
    const handleSaveCharacterTemplate = () => {
      // Collect the ENTIRE template HTML from paginated pages
      // IMPORTANT: Only get pages from inside the paginated-pages-stack (the actual editor)
      const pagesStack = document.querySelector(".paginated-pages-stack");
      if (!pagesStack) {
        console.error("[CharSave] No paginated-pages-stack found");
        return;
      }

      const containers = pagesStack.querySelectorAll(".paginated-page-content");
      let fullTemplateHtml = "";
      containers.forEach((container) => {
        fullTemplateHtml += container.innerHTML;
      });

      // Helper to get field from the LAST container (live contenteditable content)
      const getField = (id: string): HTMLElement | null => {
        for (let i = containers.length - 1; i >= 0; i--) {
          const field = containers[i].querySelector(`#${id}`) as HTMLElement;
          if (field) return field;
        }
        return null;
      };

      // Get the character name for display purposes
      const nameField = getField("character-name");
      const characterName =
        nameField?.textContent?.trim() || "Unnamed Character";
      const nameIsDefault = characterName === "Alex Ross Applegate";

      // Get the role from dropdown
      const roleSelect = getField("character-role") as HTMLSelectElement | null;
      const role = (roleSelect?.value as CharacterRole) || "supporting";

      // Get a few key fields for the Character object (for display in manager)
      const backgroundField = getField("character-background");
      const traitsField = getField("character-traits");
      const notesField = getField("character-notes");
      const goalsField = getField("character-goals");
      const conflictsField = getField("character-conflicts");
      const arcField = getField("character-arc");

      const background = backgroundField?.textContent?.trim() || "";
      const traitsText = traitsField?.textContent?.trim() || "";
      const notesRaw = notesField?.textContent?.trim() || "";
      const goals = goalsField?.textContent?.trim() || "";
      const conflicts = conflictsField?.textContent?.trim() || "";
      const arc = arcField?.textContent?.trim() || "";

      // Clean notes if it's the default placeholder
      const notes =
        notesRaw === "Add any additional notes about this character here..."
          ? ""
          : notesRaw;

      // Parse traits for display
      const traits = traitsText
        ? traitsText
            .split(/[,;]/)
            .map((t) => t.trim())
            .filter((t) => t.length > 0 && t.length < 50)
        : [];

      // Get aliases
      const aliasesListEl = getField("aliases-list");
      const linkedNames: string[] = [];
      if (aliasesListEl) {
        aliasesListEl.querySelectorAll("div").forEach((div) => {
          const alias = div.textContent?.trim();
          if (alias && alias !== "No aliases defined yet.") {
            linkedNames.push(alias);
          }
        });
      }

      console.log(
        "[CharSave] Saving full template HTML, length:",
        fullTemplateHtml.length,
        "name:",
        characterName
      );

      // Check if we're editing an existing character
      if (editingCharacterId) {
        // Update the existing character - include templateHtml for full restoration
        const updatedCharacters = characters.map((c) => {
          if (c.id === editingCharacterId) {
            return {
              ...c,
              name: nameIsDefault ? c.name : characterName,
              role: role,
              background: background || c.background,
              traits: traits.length > 0 ? traits : c.traits,
              goals: goals || c.goals,
              conflicts: conflicts || c.conflicts,
              arc: arc || c.arc,
              linkedNames: linkedNames.length > 0 ? linkedNames : c.linkedNames,
              notes: notes || c.notes,
              templateHtml: fullTemplateHtml, // Save the ENTIRE template
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        });
        setCharacters(updatedCharacters);
        // Characters will be persisted when document is saved (JSON format)
        setSaveMessage(
          `✅ Character "${
            nameIsDefault
              ? characters.find((c) => c.id === editingCharacterId)?.name
              : characterName
          }" updated!`
        );
      } else {
        // Create a new character with data from the template
        const newCharacter: Character = {
          id: `char-${Date.now()}`,
          name: nameIsDefault ? "Unnamed Character" : characterName,
          role: role,
          traits,
          background,
          goals,
          conflicts,
          arc,
          relationships: [],
          linkedNames,
          notes,
          templateHtml: fullTemplateHtml, // Save the ENTIRE template
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to characters list - will be persisted when document is saved
        const updatedCharacters = [...characters, newCharacter];
        setCharacters(updatedCharacters);
        // Characters will be persisted when document is saved (JSON format)
        setSaveMessage(`✅ Character "${characterName}" saved!`);
      }

      // Restore the previous document if we had one, otherwise set to blank
      if (preTemplateDocumentRef.current) {
        const preserved = preTemplateDocumentRef.current;
        setChapterText(preserved.chapterText);
        setChapterData(preserved.chapterData);
        setFileName(preserved.fileName);
        preTemplateDocumentRef.current = null; // Clear the preserved state
      } else {
        // No previous document - set editor to blank
        setChapterText("");
        setChapterData({
          html: "",
          plainText: "",
          originalPlainText: "",
          isHybridDocx: false,
          imageCount: 0,
          editorHtml: "",
        });
      }

      setIsTemplateMode(false);
      setEditingCharacterId(null);
      bumpDocumentInstanceKey();

      setTimeout(() => setSaveMessage(null), 3000);
    };

    // Handler for adding a relationship
    const handleAddRelationship = () => {
      const relationshipName = prompt(
        "Enter the character name for this relationship:"
      );
      if (!relationshipName?.trim()) return;

      const relationshipType = prompt(
        "Enter relationship type (ally, enemy, family, romantic, mentor, rival, neutral):"
      );
      if (!relationshipType?.trim()) return;

      const relationshipDesc = prompt("Describe this relationship (optional):");

      // Find the relationships list in the DOM and add to it
      const relList = document.querySelector("#relationships-list");
      if (relList) {
        // Remove the "No relationships" placeholder if present
        const placeholder = relList.querySelector("p");
        if (placeholder) placeholder.remove();

        const newRelDiv = document.createElement("div");
        newRelDiv.style.cssText =
          "padding: 4px 8px; background: #fff7ed; border: 1px solid #e0c392; border-radius: 4px; margin-bottom: 4px; font-size: 13px;";
        newRelDiv.innerHTML = `<strong>${relationshipName}</strong> - ${relationshipType}${
          relationshipDesc ? `: ${relationshipDesc}` : ""
        }`;
        relList.appendChild(newRelDiv);
      }
    };

    // Handler for adding an alias
    const handleAddAlias = () => {
      const alias = prompt("Enter an alternative name or alias:");
      if (!alias?.trim()) return;

      // Find the aliases list in the DOM and add to it
      const aliasesList = document.querySelector("#aliases-list");
      if (aliasesList) {
        // Remove the "No aliases" placeholder if present
        const placeholder = aliasesList.querySelector("p");
        if (placeholder) placeholder.remove();

        const newAliasDiv = document.createElement("div");
        newAliasDiv.style.cssText =
          "padding: 4px 8px; background: #fff7ed; border: 1px solid #e0c392; border-radius: 4px; margin-bottom: 4px; font-size: 13px;";
        newAliasDiv.textContent = alias;
        aliasesList.appendChild(newAliasDiv);
      }
    };

    window.addEventListener(
      "saveCharacterTemplate",
      handleSaveCharacterTemplate
    );
    window.addEventListener("addCharacterRelationship", handleAddRelationship);
    window.addEventListener("addCharacterAlias", handleAddAlias);

    // Also add document click handler as fallback for buttons in contenteditable="false" areas
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button =
        target.tagName === "BUTTON" ? target : target.closest("button");
      if (button) {
        const onclickAttr = button.getAttribute("onclick");
        if (onclickAttr?.includes("saveCharacterTemplate")) {
          e.preventDefault();
          e.stopPropagation();
          handleSaveCharacterTemplate();
        } else if (onclickAttr?.includes("addCharacterRelationship")) {
          e.preventDefault();
          e.stopPropagation();
          handleAddRelationship();
        } else if (onclickAttr?.includes("addCharacterAlias")) {
          e.preventDefault();
          e.stopPropagation();
          handleAddAlias();
        }
      }
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener(
        "saveCharacterTemplate",
        handleSaveCharacterTemplate
      );
      window.removeEventListener(
        "addCharacterRelationship",
        handleAddRelationship
      );
      window.removeEventListener("addCharacterAlias", handleAddAlias);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [characters, editingCharacterId]);

  const handleDocumentScrollDepthChange = (hasScrolled: boolean) => {
    setContentScrolled(hasScrolled);
  };

  const handleBackToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (analysisPanelRef.current) {
      analysisPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    setScrollToTopSignal(Date.now());

    // Hide the prev/next concept navigation dialog
    setHighlightedConceptId(null);
    setCurrentMentionIndex(0);
  };

  const shouldShowBackToTop = windowScrolled || contentScrolled;
  const isStackedLayout = layoutMode === "tablet";
  const layoutGap = layoutMode === "desktop" ? 16 : 16;
  const documentFlexGrow = isStackedLayout
    ? 1
    : layoutMode === "desktop"
    ? 1.5
    : 1.45;
  const analysisFlexGrow = isStackedLayout
    ? 1
    : layoutMode === "desktop"
    ? 1
    : 1.1;
  const documentMinWidth = isStackedLayout
    ? "auto"
    : layoutMode === "desktop"
    ? "0px"
    : "560px";
  const analysisMinWidth = isStackedLayout
    ? "auto"
    : layoutMode === "desktop"
    ? "0px"
    : "360px";
  const isCompactEditorLayout = layoutMode !== "desktop";

  const handleDocumentLoad = (payload: UploadedDocumentPayload) => {
    const {
      content,
      plainText,
      fileName: incomingName,
      fileType,
      format,
      imageCount,
      characters: loadedCharacters,
      characterMappings: loadedMappings,
    } = payload;

    // Clear saved file handle and format for new document
    // (so next save prompts for location, not overwriting previous file)
    savedFileHandleRef.current = null;
    savedFormatRef.current = null;

    const normalizedPlainText = plainText?.trim().length
      ? plainText.trim()
      : content
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/\s+/g, " ")
          .trim();

    // Check document size limit for free users
    const tierFeatures = ACCESS_TIERS[accessLevel];
    if (!tierFeatures.fullAnalysis) {
      const wordCount = normalizedPlainText.split(/\s+/).length;
      const FREE_TIER_WORD_LIMIT = 70000; // 200 pages × ~350 words/page

      if (wordCount > FREE_TIER_WORD_LIMIT) {
        const errorMsg = `Free tier limit: ${FREE_TIER_WORD_LIMIT.toLocaleString()} words per document. This document has ${wordCount.toLocaleString()} words. Upgrade to Premium for unlimited document size.`;
        console.error("❌ Document rejected:", errorMsg);
        setError(errorMsg);
        return;
      }
    }

    setChapterText(normalizedPlainText);
    setFileName(incomingName);
    setFileType(fileType);
    setError(null);
    setAnalysis(null); // Clear previous analysis

    // Set the extracted title ref to the incoming filename to prevent
    // handleEditorContentChange from extracting and overwriting it
    lastExtractedTitleRef.current = incomingName;

    // Remember the format of the loaded file for subsequent saves
    // This allows Cmd+S to save in the same format without dialog
    if (fileType) {
      const formatMap: Record<
        string,
        "docx" | "txt" | "json" | "md" | "html" | "pdf" | null
      > = {
        docx: "docx",
        txt: "txt",
        text: "txt", // DocumentUploader may pass "text" instead of "txt"
        json: "json",
        md: "md",
        markdown: "md", // In case markdown extension is passed
        html: "html",
        pdf: null, // PDF can't be edited, so don't set as save format
      };
      const detectedFormat = formatMap[fileType.toLowerCase()];
      if (detectedFormat) {
        savedFormatRef.current = detectedFormat;
        console.log(
          `💾 File format detected: ${detectedFormat} - Cmd+S will save in this format`
        );
      } else {
        console.warn(`⚠️ Unknown file type: ${fileType} - save format not set`);
      }
    }

    // Load characters from document if present, otherwise clear
    if (loadedCharacters && Array.isArray(loadedCharacters)) {
      setCharacters(loadedCharacters);
      console.log(
        `👤 Loaded ${loadedCharacters.length} character(s) from document`
      );
    } else {
      setCharacters([]); // Clear characters when loading a new document without characters
    }

    // Load character mappings from document if present, otherwise clear
    if (loadedMappings && Array.isArray(loadedMappings)) {
      setCharacterMappings(loadedMappings);
    } else {
      setCharacterMappings([]);
    }

    const hasHtmlContent = format === "html" && content.trim().length > 0;
    console.log(
      `📄 Stored ${
        hasHtmlContent ? "hybrid (HTML + text)" : "plain text"
      } document`
    );
    if (imageCount > 0) {
      console.log(`  📷 Embedded images: ${imageCount}`);
    }

    setChapterData({
      html: hasHtmlContent ? content : normalizedPlainText,
      plainText: normalizedPlainText,
      originalPlainText: normalizedPlainText,
      isHybridDocx: hasHtmlContent,
      imageCount,
      editorHtml: hasHtmlContent ? content : undefined,
    });
    bumpDocumentInstanceKey();

    if (isTemplateMode) {
      setIsTemplateMode(false);
    }

    const detected = detectDomain(normalizedPlainText);
    console.log(`🎭 Detected genre: ${detected || "none"}`);
    setDetectedDomain(detected);
    setSelectedDomain(detected);

    // Auto-analyze for free tier (spacing + dual coding only)
    const autoAnalyzeFeatures = ACCESS_TIERS[accessLevel];
    if (
      !autoAnalyzeFeatures.fullAnalysis &&
      normalizedPlainText.trim().length >= 200
    ) {
      console.log(
        "🆓 Free tier: Auto-running spacing + sensory detail analysis"
      );

      // Run tier one analysis immediately
      const tierOneAnalysis = buildTierOneAnalysisSummary({
        plainText: normalizedPlainText,
        htmlContent: hasHtmlContent ? content : null,
        fileName: incomingName,
      });

      if (tierOneAnalysis) {
        setAnalysis(tierOneAnalysis);
        console.log("✓ Free tier analysis complete");
      }
    }
  };

  // Handler for inserting uploaded document content at cursor position
  const handleInsertAtCursor = (payload: UploadedDocumentPayload) => {
    const { content, format } = payload;

    if (editorInsertRef.current) {
      // Insert HTML content at cursor
      const htmlContent =
        format === "html"
          ? content
          : `<p>${content.replace(/\n/g, "</p><p>")}</p>`;
      editorInsertRef.current.insertAtCursor(htmlContent);
      console.log("📥 Inserted document content at cursor position");
    } else {
      console.warn("❌ Editor insert function not available");
      // Fallback to appending if editor ref not available
      alert(
        "Please click in the document first to set cursor position, then try again."
      );
    }
  };

  const handleTextChange = (newText: string) => {
    setChapterText(newText);
    // Don't clear HTML content when text changes in plain text mode
    // This preserves images and formatting from original document
    setChapterData((prev) =>
      prev
        ? {
            ...prev,
            plainText: newText,
            originalPlainText: newText,
            html: prev.html ?? newText,
            // Keep editorHtml, isHybridDocx, and imageCount if they exist
          }
        : {
            html: newText,
            plainText: newText,
            originalPlainText: newText,
            isHybridDocx: false,
            imageCount: 0,
            editorHtml: undefined,
          }
    );
  };

  const handleEditorContentChange = (content: {
    plainText: string;
    html: string;
  }) => {
    setChapterText(content.plainText);
    const updatedData = {
      plainText: content.plainText,
      originalPlainText: content.plainText,
      editorHtml: content.html,
      lastSaved: new Date().toISOString(),
    };

    // Extract book title from HTML if present
    // Use more flexible regex to handle inner elements and whitespace
    // Check for both book-title and doc-title classes on p or h1 elements
    const bookTitleMatch = content.html.match(
      /<(?:p|h1)[^>]*class="[^"]*(?:book-title|doc-title)[^"]*"[^>]*>([\s\S]*?)<\/(?:p|h1)>/i
    );
    if (bookTitleMatch && bookTitleMatch[1]) {
      // Strip HTML tags and clean up whitespace
      const extractedTitle = bookTitleMatch[1]
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (
        extractedTitle &&
        extractedTitle !== "Book Title" &&
        extractedTitle.length > 0 &&
        extractedTitle !== lastExtractedTitleRef.current
      ) {
        // Only update if the title actually changed to prevent UI jumps
        lastExtractedTitleRef.current = extractedTitle;
        setFileName(extractedTitle);
      }
    }

    setChapterData((prev) =>
      prev
        ? {
            ...prev,
            ...updatedData,
          }
        : {
            html: content.html,
            plainText: content.plainText,
            originalPlainText: content.plainText,
            isHybridDocx: true,
            imageCount: 0,
            editorHtml: content.html,
          }
    );

    // Auto-save to localStorage
    setDocumentSaveStatus("saving");
    try {
      localStorage.setItem(
        "quillpilot_autosave",
        JSON.stringify({
          content: updatedData,
          fileName: fileName || "untitled",
          timestamp: new Date().toISOString(),
        })
      );
      setDocumentSaveStatus("saved");
      setLastSavedTime(new Date());
    } catch (error) {
      console.error("Failed to auto-save:", error);
      setDocumentSaveStatus("error");
    }

    // Trigger auto-analysis if enabled (debounced 3 seconds after typing stops)
    if (autoAnalysisEnabled && !isAnalyzing) {
      if (autoAnalysisTimerRef.current) {
        clearTimeout(autoAnalysisTimerRef.current);
      }
      autoAnalysisTimerRef.current = setTimeout(() => {
        const wordCount =
          updatedData.plainText?.trim().split(/\s+/).length || 0;
        if (wordCount >= 200) {
          console.log("🔄 Auto-triggering analysis after typing stopped...");
          handleAnalyzeChapter();
        }
      }, 3000); // 3 second delay after user stops typing
    }
  };

  const restoreAutosavedWork = (saved: AutosaveSnapshot) => {
    const plainText = saved.content?.plainText || "";
    const editorHtml = saved.content?.editorHtml || "";

    setFileName(saved.fileName || "Autosaved chapter");
    setChapterData({
      html: editorHtml,
      plainText,
      originalPlainText: plainText,
      isHybridDocx: true,
      imageCount: 0,
      editorHtml,
    });
    bumpDocumentInstanceKey();
    setChapterText(plainText);

    if (saved.isTemplateMode) {
      setIsTemplateMode(true);
    } else {
      setIsTemplateMode(false);
    }

    if (saved.analysis) {
      setAnalysis(saved.analysis);
    }

    setViewMode("writer");
    setPendingAutosave(null);

    // Mark as saved since we just restored from localStorage
    setDocumentSaveStatus("saved");
    setLastSavedTime(saved.timestamp ? new Date(saved.timestamp) : new Date());
  };

  const handleRestoreAutosave = () => {
    if (!pendingAutosave) {
      return;
    }
    restoreAutosavedWork(pendingAutosave);
  };

  const handleDismissAutosave = () => {
    if (!pendingAutosave) {
      return;
    }
    if (pendingAutosave.timestamp) {
      localStorage.setItem(
        "quillpilot_autosave_skip",
        pendingAutosave.timestamp
      );
    }
    setPendingAutosave(null);
  };

  // Helper function to open Writers Reference to a specific section
  const openHelpSection = (section: string) => {
    setWritersReferenceSection(section);
    setIsWritersReferenceModalOpen(true);
  };

  // Character management handlers (Tier 3)
  // Characters are saved to the document on file save, not to localStorage
  const handleSaveCharacters = (updatedCharacters: Character[]) => {
    setCharacters(updatedCharacters);
    // Characters will be persisted when document is saved (JSON format includes characters)
    console.log(
      `📝 Characters updated: ${updatedCharacters.length} character(s)`
    );
  };

  const handleCharacterLink = (textOccurrence: string, characterId: string) => {
    const newMapping: CharacterMapping = {
      textOccurrence,
      characterId,
      position: 0, // Could calculate actual position if needed
    };

    const updatedMappings = [
      ...characterMappings.filter((m) => m.textOccurrence !== textOccurrence),
      newMapping,
    ];

    setCharacterMappings(updatedMappings);

    try {
      localStorage.setItem(
        "quillpilot_character_mappings",
        JSON.stringify(updatedMappings)
      );
    } catch (error) {
      console.error("Failed to save character mapping:", error);
    }
  };

  const handleAcceptMissingConcept = (
    concept: ConceptDefinition,
    insertionPoint: number,
    contextSnippet: string,
    searchKeyword: string
  ) => {
    console.log("🔍 handleAcceptMissingConcept called:");
    console.log("  Concept:", concept.name);
    console.log("  Position:", insertionPoint);
    console.log("  Context:", contextSnippet);
    console.log("  Keyword:", searchKeyword);
    console.log("  Current viewMode:", viewMode);

    // Switch to analysis mode first
    if (viewMode === "writer") {
      setViewMode("analysis");
      console.log("  ✓ Switched to analysis mode");

      // Wait for view mode switch to complete, then set highlight
      setTimeout(() => {
        setHighlightPosition(insertionPoint);
        setSearchWord(searchKeyword || "");
        console.log(
          "  ✓ Highlight set - position:",
          insertionPoint,
          "keyword:",
          searchKeyword
        );
      }, 200);
    } else {
      // Already in analysis mode, set highlight immediately
      setHighlightPosition(insertionPoint);
      setSearchWord(searchKeyword || "");
      console.log(
        "  ✓ Highlight set - position:",
        insertionPoint,
        "keyword:",
        searchKeyword
      );
    }
  };
  const handleConceptClick = (concept: any, mentionIndex: number) => {
    console.log(
      "🎯 CONCEPT CLICKED:",
      concept.name,
      "mentionIndex:",
      mentionIndex
    );

    // Set the highlighted concept and mention index
    setHighlightedConceptId(concept.id);
    setCurrentMentionIndex(mentionIndex);

    // With the new Embedded Highlight system, we don't need to calculate positions manually.
    // The editor already knows where the concepts are.
    // We just need to tell the editor to scroll to the first occurrence of this concept.

    // However, to maintain compatibility with the existing "jump" effect (yellow flash),
    // we can still pass the position if we have it, OR we can rely on the editor's internal search.

    // For now, let's try to use the existing position logic as a hint,
    // but the editor's "ConceptHighlighter" will handle the visual persistence.

    const mention = concept.mentions?.[mentionIndex];
    if (mention && mention.position !== undefined) {
      const pos = Number.isFinite(mention.position)
        ? (mention.position as number)
        : 0;
      setHighlightPosition(pos);
      setSearchWord(concept.name);
      setSearchOccurrence(-1);
    } else {
      // Fallback: just search for the word
      setHighlightPosition(null);
      setSearchWord(concept.name);
      setSearchOccurrence(0);
    }
  };

  const handleAnalyzeChapter = async () => {
    if (!currentChapterText.trim()) {
      setError("Please upload or enter chapter text");
      return;
    }

    if (currentChapterText.trim().split(/\s+/).length < 200) {
      setError("Chapter should be at least 200 words");
      return;
    }

    // Check if domain was detected or manually set to "none"
    if (!selectedDomain || selectedDomain === "none") {
      // If explicitly set to "none", allow analysis without domain
      if (selectedDomain !== "none") {
        setError(
          "⚠️ Domain not detected. Please select a domain, choose 'None / General', or create a custom domain."
        );
        return;
      }
    }

    // Check if user has access to full analysis based on subscription
    const features = ACCESS_TIERS[accessLevel];
    if (!features.fullAnalysis) {
      setUpgradeFeature("Full 10-Principle Analysis");
      setUpgradeTarget("premium");
      setShowUpgradePrompt(true);
      return;
    }

    // Premium/Professional tier: Run full analysis
    setIsAnalyzing(true);
    setError(null);
    setProgress("Analyzing chapter...");

    try {
      // Use normalized chapter data - no need to re-parse
      if (!chapterData) {
        throw new Error("No chapter data loaded");
      }

      // Use PLAIN TEXT everywhere - no HTML
      const textForAnalysis = chapterData.plainText; // Plain text
      const displayText = chapterData.plainText; // Same plain text for display
      const isHybridDocx = chapterData.isHybridDocx;

      console.log("📄 Using normalized plain text for analysis");
      console.log("  Text length:", textForAnalysis.length);

      const sections = deriveSectionsFromText(textForAnalysis);
      console.log(
        `[ChapterCheckerV2] Derived ${sections.length} sections for analysis`
      );

      const analysisDomain: Domain = (() => {
        if (selectedDomain === "none" || selectedDomain === "custom") {
          return "general" as Domain; // Default to general for non-genre selections
        }
        if (selectedDomain) {
          return selectedDomain;
        }
        if (detectedDomain) {
          return detectedDomain;
        }
        return "general" as Domain;
      })();

      // Create Chapter object with plain text
      const htmlSourceCandidate = chapterData?.isHybridDocx
        ? chapterData?.editorHtml ?? chapterData?.html ?? ""
        : "";
      const normalizedHtmlSource = htmlSourceCandidate?.trim().length
        ? htmlSourceCandidate
        : undefined;

      const chapter = {
        id: `chapter-${Date.now()}`,
        title: fileName || "Untitled Chapter",
        content: textForAnalysis, // Plain text
        wordCount: textForAnalysis.split(/\s+/).length,
        sections,
        conceptGraph: {
          concepts: [],
          relationships: [],
          hierarchy: { core: [], supporting: [], detail: [] },
          sequence: [],
        },
        metadata: {
          readingLevel: "college",
          domain: selectedDomain === "none" ? "general" : analysisDomain,
          targetAudience: "adult learners",
          estimatedReadingTime: Math.ceil(
            textForAnalysis.split(/\s+/).length / 200
          ),
          createdAt: new Date(),
          lastAnalyzed: new Date(),
          embeddedImageCount: chapterData?.imageCount ?? 0,
          hasHtmlContent: Boolean(chapterData?.isHybridDocx),
          originalFormat: chapterData?.isHybridDocx ? "html" : "text",
        },
      };

      const workerStats = {
        wordCount: chapter.wordCount,
        contentLength: chapter.content.length,
        sectionCount: sections.length,
        htmlLength: normalizedHtmlSource?.length ?? 0,
        hasHtmlContent: Boolean(chapterData?.isHybridDocx),
        embeddedImageCount: chapterData?.imageCount ?? 0,
        timestamp: new Date().toISOString(),
      };

      console.log("[Analysis Worker] Prepared chapter payload", workerStats);

      // Run analysis in worker (with cache-busting timestamp for dev)
      const worker = new AnalysisWorker();
      const workerPayload = {
        chapter,
        options: {
          domain: analysisDomain,
          includeCrossDomain: false,
          customConcepts,
          userCharacters:
            accessLevel === "professional" ? characters : undefined,
          characterMappings:
            accessLevel === "professional" ? characterMappings : undefined,
        },
      };

      try {
        worker.postMessage(workerPayload);
      } catch (postMessageError) {
        const message =
          postMessageError instanceof Error
            ? postMessageError.message
            : String(postMessageError);
        console.error("[Analysis Worker] Failed to start", {
          error: postMessageError,
          workerStats,
        });
        setError(`Failed to start analysis worker: ${message}`);
        setProgress("");
        setIsAnalyzing(false);
        worker.terminate();
        return;
      }

      worker.onmessage = (e) => {
        if (e.data?.type === "progress") {
          const label = e.data.detail || e.data.step || "Running analysis...";
          setProgress(label);
          console.info("[Analysis Worker] progress", {
            step: e.data.step,
            detail: e.data.detail,
            timestamp: e.data.timestamp,
            stats: e.data.stats,
          });
          return;
        }

        if (e.data?.type === "diagnostic") {
          console.info("[Analysis Worker] diagnostic", e.data);
          return;
        }

        if (e.data.type === "complete") {
          setAnalysis(e.data.result);

          // Run Character Arc Analysis (22-Step) for Tier 3
          if (accessLevel === "professional") {
            const textToAnalyze =
              chapterData?.plainText ?? chapterData?.originalPlainText ?? "";
            const arcResults = analyzeAllCharacterArcs(
              textToAnalyze,
              characters
            );
            setCharacterArcAnalysis(arcResults);
            console.log(
              `[CharacterArc] Analyzed ${arcResults.length} characters`
            );
          }

          // Extract general concepts if domain is "none"
          if (selectedDomain === "none") {
            const textToAnalyze =
              chapterData?.plainText ?? chapterData?.originalPlainText ?? "";
            const extracted = extractGeneralConcepts(textToAnalyze);
            setGeneralConcepts(extracted);
            console.log(
              `[GeneralConcepts] Extracted ${extracted.length} concepts from general content`
            );
          } else {
            setGeneralConcepts([]); // Clear if domain is selected
          }

          // Force layout recalculation for pills/boxes positioning
          requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
          });

          // DEBUG: Show first mention positions for all concepts
          const concepts = e.data.result?.conceptGraph?.concepts || [];
          console.log("🔍 === CONCEPT FIRST MENTION POSITIONS ===");
          concepts.forEach((c: any) => {
            const firstPos = c.mentions?.[0]?.position ?? "undefined";
            console.log(
              `  ${c.name}: position ${firstPos} (${
                c.mentions?.length || 0
              } total mentions)`
            );
          });
          console.log("🔍 =========================================");

          setProgress("");
          setIsAnalyzing(false);
          worker.terminate();
          // Scroll analysis panel to top
          setTimeout(() => {
            if (analysisPanelRef.current) {
              analysisPanelRef.current.scrollTop = 0;
            }
          }, 100);
        } else if (e.data.type === "error") {
          const details = (e.data as { details?: unknown }).details;
          if (details) {
            console.error("[Analysis Worker] error details:", details);
          }

          const fallbackMessage = (() => {
            if (typeof e.data.error === "string" && e.data.error.trim()) {
              return e.data.error;
            }

            if (details && typeof details === "object") {
              const detailRecord = details as Record<string, unknown>;
              const detailName =
                typeof detailRecord.name === "string"
                  ? detailRecord.name
                  : undefined;
              const detailMessage =
                typeof detailRecord.message === "string"
                  ? detailRecord.message
                  : undefined;

              if (detailName || detailMessage) {
                return [detailName, detailMessage]
                  .filter(Boolean)
                  .join(": ")
                  .trim();
              }
            }

            return "Analysis failed";
          })();

          setError(fallbackMessage);
          setProgress("");
          setIsAnalyzing(false);
          worker.terminate();
        }
      };

      worker.onerror = (err) => {
        console.error("Worker error event:", {
          message: err.message,
          filename: err.filename,
          lineno: err.lineno,
          colno: err.colno,
          error: err.error,
        });

        let detailMessage = "";
        const rawError = err.error as unknown;

        if (typeof err.message === "string" && err.message.trim()) {
          detailMessage = err.message;
        }

        if (!detailMessage) {
          if (rawError instanceof Error) {
            detailMessage = rawError.message;
            if (rawError.stack) {
              console.error("Worker error stack:", rawError.stack);
            }
          } else if (typeof rawError === "string") {
            detailMessage = rawError;
          } else if (err instanceof Event) {
            detailMessage =
              "Script loading error. The worker script could not be loaded or executed. Check console for 404s or syntax errors.";
          }
        }

        // Only show error UI if we have a real error message
        if (detailMessage?.trim()) {
          const finalMessage = detailMessage.trim();
          setError(`Worker error: ${finalMessage}`);
          setProgress("");
          setIsAnalyzing(false);
          worker.terminate();
        } else {
          // Log with full context for debugging but don't disrupt user experience
          console.warn(
            "Worker error event with no details - ignoring as likely false positive",
            {
              filename: err.filename,
              lineno: err.lineno,
              colno: err.colno,
              hasError: !!err.error,
              errorType: typeof err.error,
            }
          );
        }
      };

      worker.onmessageerror = (event) => {
        console.error("Worker message error:", event);
        setError("Worker message error: Failed to decode message from worker");
        setProgress("");
        setIsAnalyzing(false);
        worker.terminate();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setProgress("");
      setIsAnalyzing(false);
    }
  };
  // Unified Save function - auto-saves to previous location/format, or opens dialog for first save
  const handleUnifiedSave = async () => {
    // Use refs to get current values (avoids stale closures in keyboard handlers)
    let currentData = chapterDataRef.current;
    let currentText = currentChapterTextRef.current;

    // Fallback: if state is empty, try to get content directly from editor DOM
    if (!currentData && !currentText.trim()) {
      const editorContent = document.querySelector(".paginated-page-content");
      if (editorContent) {
        const domText = editorContent.textContent?.trim() || "";
        const domHtml = editorContent.innerHTML || "";
        if (domText) {
          currentText = domText;
          currentData = {
            html: domHtml,
            plainText: domText,
            originalPlainText: domText,
            isHybridDocx: false,
            imageCount: 0,
            editorHtml: domHtml,
          };
          console.log(
            "[Save] Retrieved content from DOM:",
            domText.substring(0, 100)
          );
        }
      }
    }

    // Extract and update title from document content before saving
    // This ensures specs panel reflects any doc-title style applied
    const htmlToCheck = currentData?.editorHtml || currentData?.html || "";
    if (htmlToCheck) {
      const titleMatch = htmlToCheck.match(
        /<(?:p|h[1-6])[^>]*class="[^"]*(?:book-title|doc-title)[^"]*"[^>]*>([\s\S]*?)<\/(?:p|h[1-6])>/i
      );
      if (titleMatch && titleMatch[1]) {
        const extractedTitle = titleMatch[1]
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (
          extractedTitle &&
          extractedTitle !== "Book Title" &&
          extractedTitle.length > 0 &&
          extractedTitle !== lastExtractedTitleRef.current
        ) {
          lastExtractedTitleRef.current = extractedTitle;
          setFileName(extractedTitle);
        }
      }
    }

    // Check if there's content to save - either chapterData or currentChapterText
    if (!currentData && !currentText.trim()) {
      alert("No document to save");
      return;
    }

    // Always show the format selection dialog (user requested - no quick save bypass)
    console.log("💾 Showing format selection dialog");
    setIsSaveDialogOpen(true);
  };
  // Keep ref updated so keyboard shortcut always uses latest version
  useEffect(() => {
    handleUnifiedSaveRef.current = handleUnifiedSave;
  });

  // Quick save to previously saved file handle (no dialog)
  const handleQuickSave = async () => {
    if (
      !savedFileHandleRef.current ||
      !savedFormatRef.current ||
      !chapterData
    ) {
      throw new Error("No saved file handle");
    }

    const format = savedFormatRef.current;
    const rawFileName = fileName || "untitled-document";
    const baseFileName = rawFileName.replace(/\.[^/.]+$/, "");
    const richHtmlContent =
      chapterData.editorHtml ??
      (chapterData.isHybridDocx ? chapterData.html : null) ??
      null;
    const isWriterMode = viewMode === "writer";

    let blob: Blob;

    switch (format) {
      case "docx": {
        const { exportToDocx } = await import("@/utils/docxExport");
        const fallbackAnalysis = isWriterMode
          ? null
          : analysis ??
            buildTierOneAnalysisSummary({
              plainText: chapterData.plainText || currentChapterText,
              htmlContent: richHtmlContent,
            });
        // exportToDocx handles its own saving, so we need to create blob manually
        const { Document, Packer, Paragraph, TextRun } = await import("docx");
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({ children: [new TextRun(currentChapterText)] }),
              ],
            },
          ],
        });
        blob = await Packer.toBlob(doc);
        break;
      }
      case "json": {
        const jsonData = {
          name: baseFileName,
          content: currentChapterText,
          editorHtml: richHtmlContent,
          analysis: analysis,
          characters: characters,
          characterMappings: characterMappings,
          savedAt: new Date().toISOString(),
        };
        blob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });
        break;
      }
      case "txt": {
        blob = new Blob([currentChapterText], { type: "text/plain" });
        break;
      }
      case "md": {
        const TurndownService = (await import("turndown")).default;
        const turndown = new TurndownService({
          headingStyle: "atx",
          codeBlockStyle: "fenced",
        });
        const markdownContent = richHtmlContent
          ? turndown.turndown(richHtmlContent)
          : currentChapterText;
        blob = new Blob([markdownContent], { type: "text/markdown" });
        break;
      }
      case "html": {
        const fallbackAnalysis =
          analysis ??
          buildTierOneAnalysisSummary({
            plainText: chapterData.plainText || currentChapterText,
            htmlContent: richHtmlContent,
          });
        // For HTML, create a simple blob
        blob = new Blob([richHtmlContent || currentChapterText], {
          type: "text/html",
        });
        break;
      }
      case "pdf": {
        // PDF requires special handling - fall back to dialog
        throw new Error("PDF quick save not supported");
      }
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Write to saved handle
    const writable = await savedFileHandleRef.current.createWritable();
    await writable.write(blob);
    await writable.close();
    console.log(`💾 Quick saved to ${format}`);
  };

  // Save to specific format with File System Access API (user chooses location)
  const handleSaveAs = async (
    format: "docx" | "pdf" | "html" | "json" | "txt" | "md"
  ) => {
    if (!chapterData) {
      alert("No document to save");
      return;
    }

    // Check if user has export access based on subscription
    const features = ACCESS_TIERS[accessLevel];
    console.log(
      "[Export] Access level:",
      accessLevel,
      "features.exportResults:",
      features.exportResults
    );

    if (!features.exportResults) {
      alert(
        "🔒 Save features require a Premium or Professional subscription.\n\n" +
          "Upgrade to save your documents."
      );
      return;
    }

    setIsSaveDialogOpen(false);

    // Strip extension from fileName if present (e.g., "MyStory.docx" -> "MyStory")
    const rawFileName = fileName || "untitled-document";
    const baseFileName = rawFileName.replace(/\.[^/.]+$/, "");
    console.log(
      "[Export] chapterData:",
      chapterData
        ? {
            hasPlainText: !!chapterData.plainText,
            plainTextLength: chapterData.plainText?.length,
            hasEditorHtml: !!chapterData.editorHtml,
            editorHtmlLength: chapterData.editorHtml?.length,
            hasHtml: !!chapterData.html,
            isHybridDocx: chapterData.isHybridDocx,
          }
        : null
    );

    const richHtmlContent =
      chapterData.editorHtml ??
      (chapterData.isHybridDocx ? chapterData.html : null) ??
      null;
    const isWriterMode = viewMode === "writer";

    try {
      console.log("[Export] Starting export to", format);
      console.log(
        "[Export] richHtmlContent length:",
        richHtmlContent?.length || 0
      );
      console.log(
        "[Export] currentChapterText length:",
        currentChapterText.length
      );
      console.log("[Export] baseFileName:", baseFileName);

      switch (format) {
        case "docx": {
          console.log("[Export] Importing docxExport...");
          const { exportToDocx } = await import("@/utils/docxExport");
          console.log("[Export] exportToDocx imported successfully");

          const fallbackAnalysis = isWriterMode
            ? null
            : analysis ??
              buildTierOneAnalysisSummary({
                plainText: chapterData.plainText || currentChapterText,
                htmlContent: richHtmlContent,
              });

          console.log("[Export] Calling exportToDocx...");
          await exportToDocx({
            text: currentChapterText,
            html: richHtmlContent,
            fileName: baseFileName,
            analysis: fallbackAnalysis,
            includeHighlights: !isWriterMode,
            mode: isWriterMode ? "writer" : "analysis",
            headerText: headerFooterSettings.headerText,
            footerText: headerFooterSettings.footerText,
            showPageNumbers: headerFooterSettings.showPageNumbers,
            pageNumberPosition: headerFooterSettings.pageNumberPosition,
            headerAlign: headerFooterSettings.headerAlign,
            footerAlign: headerFooterSettings.footerAlign,
            facingPages: headerFooterSettings.facingPages,
          });
          break;
        }
        case "pdf": {
          const fallbackAnalysis =
            analysis ??
            buildTierOneAnalysisSummary({
              plainText: chapterData.plainText || currentChapterText,
              htmlContent: richHtmlContent,
            });

          console.log("[Export PDF] Importing pdfExport...");
          const { exportToPdf } = await import("@/utils/pdfExport");
          console.log("[Export PDF] exportToPdf imported successfully");
          console.log("[Export PDF] Calling exportToPdf...");
          await exportToPdf({
            text: currentChapterText,
            html: richHtmlContent,
            fileName: baseFileName,
            analysis: fallbackAnalysis,
            includeAnalysis: true,
            format: "manuscript",
          });
          console.log("[Export PDF] exportToPdf completed");
          break;
        }
        case "html": {
          const fallbackAnalysis =
            analysis ??
            buildTierOneAnalysisSummary({
              plainText: chapterData.plainText || currentChapterText,
              htmlContent: richHtmlContent,
            });

          const { exportToHtml } = await import("@/utils/htmlExport");
          exportToHtml({
            text: currentChapterText,
            html: richHtmlContent,
            fileName: baseFileName,
            analysis: fallbackAnalysis,
            includeHighlights: true,
          });
          break;
        }
        case "json": {
          // Save as JSON with all document data including characters
          const jsonData = {
            name: baseFileName,
            content: currentChapterText,
            editorHtml: richHtmlContent,
            analysis: analysis,
            characters: characters,
            characterMappings: characterMappings,
            savedAt: new Date().toISOString(),
          };
          const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
            type: "application/json",
          });

          // Try File System Access API first
          if ("showSaveFilePicker" in window) {
            try {
              const handle = await (window as any).showSaveFilePicker({
                suggestedName: `${baseFileName}.json`,
                types: [
                  {
                    description: "JSON Document",
                    accept: { "application/json": [".json"] },
                  },
                ],
              });
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
              // Store handle for quick re-save
              savedFileHandleRef.current = handle;
              savedFormatRef.current = "json";
              return;
            } catch (err: any) {
              if (err.name === "AbortError") return;
            }
          }
          // Fallback
          const { saveAs } = await import("file-saver");
          saveAs(blob, `${baseFileName}.json`);
          break;
        }
        case "txt": {
          const blob = new Blob([currentChapterText], { type: "text/plain" });

          // Try File System Access API first
          if ("showSaveFilePicker" in window) {
            try {
              const handle = await (window as any).showSaveFilePicker({
                suggestedName: `${baseFileName}.txt`,
                types: [
                  {
                    description: "Plain Text",
                    accept: { "text/plain": [".txt"] },
                  },
                ],
              });
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
              // Store handle for quick re-save
              savedFileHandleRef.current = handle;
              savedFormatRef.current = "txt";
              return;
            } catch (err: any) {
              if (err.name === "AbortError") return;
            }
          }
          // Fallback
          const { saveAs } = await import("file-saver");
          saveAs(blob, `${baseFileName}.txt`);
          break;
        }
        case "md": {
          // Convert HTML to Markdown using turndown
          const TurndownService = (await import("turndown")).default;
          const turndown = new TurndownService({
            headingStyle: "atx",
            codeBlockStyle: "fenced",
          });

          // Convert HTML content to Markdown, or use plain text if no HTML
          let markdownContent: string;
          if (richHtmlContent) {
            markdownContent = turndown.turndown(richHtmlContent);
          } else {
            // For plain text, just use it directly with minimal formatting
            markdownContent = currentChapterText;
          }

          const blob = new Blob([markdownContent], { type: "text/markdown" });
          console.log(
            "[Export MD] Markdown content length:",
            markdownContent.length
          );

          // Try File System Access API first
          if ("showSaveFilePicker" in window) {
            try {
              console.log("[Export MD] Using File System Access API...");
              const handle = await (window as any).showSaveFilePicker({
                suggestedName: `${baseFileName}.md`,
                types: [
                  {
                    description: "Markdown Document",
                    accept: { "text/markdown": [".md"] },
                  },
                ],
              });
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
              // Store handle for quick re-save
              savedFileHandleRef.current = handle;
              savedFormatRef.current = "md";
              console.log(
                "[Export MD] Save completed via File System Access API"
              );
              return;
            } catch (err: any) {
              console.log("[Export MD] File System Access API error:", err);
              if (err.name === "AbortError") return;
            }
          }
          // Fallback
          console.log("[Export MD] Using saveAs fallback...");
          const { saveAs } = await import("file-saver");
          saveAs(blob, `${baseFileName}.md`);
          console.log("[Export MD] saveAs called");
          break;
        }
      }
      // Store the format for quick re-save (even if we couldn't store a handle)
      savedFormatRef.current = format;
    } catch (err) {
      console.error("[Export] Error:", err);
      alert(
        "Error saving: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  // Handler for Shunn Manuscript Format export
  const handleManuscriptExport = async (
    settings: ManuscriptSettings,
    format: "pdf" | "docx"
  ) => {
    if (!chapterData) {
      alert("No document to export");
      return;
    }

    const richHtmlContent =
      chapterData.editorHtml ??
      (chapterData.isHybridDocx ? chapterData.html : null) ??
      null;

    try {
      // Use setTimeout to allow UI to update before heavy processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (format === "pdf") {
        const { exportToManuscriptPdf } = await import("@/utils/pdfExport");
        await exportToManuscriptPdf({
          text: currentChapterText,
          html: richHtmlContent,
          settings,
          fileName: settings.title || fileName || "manuscript",
        });
      } else {
        const { exportToManuscriptDocx } = await import("@/utils/docxExport");
        await exportToManuscriptDocx({
          text: currentChapterText,
          html: richHtmlContent,
          settings,
          fileName: settings.title || fileName || "manuscript",
        });
      }

      // Close the modal after successful export
      setIsManuscriptModalOpen(false);
    } catch (err) {
      console.error("Manuscript export failed:", err);
      alert(
        "Error exporting manuscript: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleExport = () => {
    if (!analysis) return;

    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analysis-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveAnalysis = async () => {
    const user = await getCurrentUser();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!analysis || !chapterData) {
      setSaveMessage("No analysis to save");
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    // Check save limits for free users
    if (accessLevel === "free") {
      try {
        const savedDocs = await getSavedAnalyses();
        if (savedDocs.length >= 3) {
          setSaveMessage(
            "❌ Free tier limit: 3 saved documents. Upgrade to Pro for unlimited saves."
          );
          setTimeout(() => setSaveMessage(null), 7000);
          return;
        }
      } catch (error) {
        console.error("Error checking saved documents:", error);
      }
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await saveAnalysis({
        file_name: fileName || "Untitled",
        chapter_text: chapterData.plainText,
        editor_html: chapterData.editorHtml || chapterData.html,
        analysis_data: analysis,
        domain:
          selectedDomain === "none" ? "General" : selectedDomain || "General",
        is_template_mode: isTemplateMode,
      });

      setSaveMessage("✅ Analysis saved successfully!");
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (error: any) {
      console.error("Save error:", error);
      setSaveMessage(`❌ Error: ${error.message}`);
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const tierFeatures = ACCESS_TIERS[accessLevel];
  const canEditChapter =
    viewMode === "writer" && tierFeatures.writerMode && !isAnalyzing;

  const handlePrint = () => {
    // Extract just the editor content and print in a clean window
    const editorContent = document.querySelector('[contenteditable="true"]');
    if (!editorContent) {
      alert("No content to print");
      return;
    }

    // Get the HTML content with styles
    const content = editorContent.innerHTML;

    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    // Get the iframe's document
    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      alert("Could not create print frame");
      document.body.removeChild(iframe);
      return;
    }

    // Write clean HTML with just the content
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName || "Document"}</title>
        <style>
          @page {
            margin: 1in;
            size: letter;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: black;
            background: white;
            margin: 0;
            padding: 20px;
          }
          h1 { font-size: 24pt; font-weight: bold; margin: 0.5em 0; }
          h2 { font-size: 18pt; font-weight: bold; margin: 0.5em 0; }
          h3 { font-size: 14pt; font-weight: bold; margin: 0.5em 0; }
          h4 { font-size: 12pt; font-weight: bold; margin: 0.5em 0; }
          p { margin: 0.5em 0; text-indent: ${firstLineIndent}in; }
          blockquote { margin: 1em 2em; font-style: italic; }
          ul, ol { margin: 0.5em 0; padding-left: 2em; }
          a { color: black; text-decoration: underline; }
          /* Preserve inline styles */
          [style] { /* inline styles preserved */ }
          @media print {
            body { padding: 0; }
            h1, h2, h3 { page-break-after: avoid; }
            p { orphans: 3; widows: 3; }
          }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    iframeDoc.close();

    const doPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error("Print failed", e);
      } finally {
        // Cleanup: Remove iframe after printing
        if (iframe.contentWindow) {
          iframe.contentWindow.onafterprint = () => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          };
        }

        // Fallback cleanup (long timeout to be safe)
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 60000);
      }
    };

    // Wait for content to load
    if (iframe.contentWindow) {
      iframe.contentWindow.onload = () => setTimeout(doPrint, 100);
    } else {
      setTimeout(doPrint, 500);
    }
  };

  // Handle Cmd+P / Ctrl+P to trigger custom print
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl + P (case insensitive)
      if (
        (e.metaKey || e.ctrlKey) &&
        (e.key.toLowerCase() === "p" || e.code === "KeyP")
      ) {
        e.preventDefault();
        e.stopPropagation();
        console.log("🖨️ Custom print triggered via keyboard shortcut");
        handlePrint();
      }
      // Check for Cmd/Ctrl + S to open Save dialog
      if (
        (e.metaKey || e.ctrlKey) &&
        (e.key.toLowerCase() === "s" || e.code === "KeyS")
      ) {
        e.preventDefault();
        e.stopPropagation();
        console.log("💾 Save triggered via keyboard shortcut");
        // Use ref to get latest version of the function (avoids stale closure)
        handleUnifiedSaveRef.current();
      }
    };

    // Use capture phase to ensure we intercept before browser default
    // No dependencies needed since we use refs for all dynamic values
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // Show loading screen while profile is being fetched to prevent UI jerk

  if (isLoadingProfile) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#dce4ec",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #e0c392",
            borderTopColor: "#ef8432",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#2c3e50", fontSize: "14px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          padding: "15px",
          paddingBottom: "0px",
          backgroundColor: "#dce4ec",
          marginBottom: 0,
        }}
      >
        <header
          role="banner"
          style={{
            padding: "1rem",
            backgroundColor: "#f7e6d0",
            color: "#2c3e50",
            border: "1px solid #e0c392",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            borderRadius: "24px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Top row: Logo and Stats */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                minHeight: "100px",
              }}
            >
              {/* Left: Logo and Brand */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  position: "absolute",
                  left: 0,
                  flex: "0 1 auto",
                  minWidth: "280px",
                }}
              >
                <button
                  onClick={() => setIsNavigationOpen(true)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f7e6d0",
                    color: "#2c3e50",
                    border: "2px solid #ef8432",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ☰
                </button>

                <div style={{ minWidth: 0 }}>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "1.5rem",
                      color: "#2c3e50",
                      fontWeight: "700",
                      lineHeight: "1.2",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    Quill
                    <span style={{ fontStyle: "italic", fontWeight: "700" }}>
                      Pilot
                    </span>
                    <AnimatedLogo size={60} animate={true} />
                  </h1>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      opacity: 1,
                      color: "#2c3e50",
                    }}
                  >
                    AI-Powered Writing and Analysis
                  </p>
                  <p
                    style={{
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.75rem",
                      opacity: 1,
                      color: "#2c3e50",
                    }}
                  >
                    For Fiction • Nonfiction • Poetry • Screenplays
                  </p>
                </div>
              </div>

              {/* Document Specs in Header - Centered */}
              <div
                style={{
                  fontSize: "13px",
                  color: "#2c3e50",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  minWidth: "240px",
                  padding: "10px 18px",
                  backgroundColor: "#f5ead9",
                  borderRadius: "12px",
                  border: "1.5px solid #e0c392",
                  maxWidth: "500px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    📄{" "}
                    {fileName ||
                      (hasDocumentStats
                        ? "Untitled Document"
                        : "Document Specs")}
                  </span>
                  {hasDocumentStats && (
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        backgroundColor:
                          documentSaveStatus === "saved"
                            ? "#e8f4e8"
                            : documentSaveStatus === "saving"
                            ? "#fff3cd"
                            : "#f8d7da",
                        color:
                          documentSaveStatus === "saved"
                            ? "#2d5a2d"
                            : documentSaveStatus === "saving"
                            ? "#856404"
                            : "#721c24",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        cursor: "help",
                      }}
                      title={
                        documentSaveStatus === "saved"
                          ? "Draft auto-protected in browser. Press Cmd/Ctrl+S to save to your computer."
                          : documentSaveStatus === "saving"
                          ? "Saving draft to browser..."
                          : "Changes not yet saved"
                      }
                    >
                      {documentSaveStatus === "saved" && <>✓ Draft protected</>}
                      {documentSaveStatus === "saving" && <>⏳ Saving...</>}
                      {documentSaveStatus === "unsaved" && <>● Unsaved</>}
                    </span>
                  )}
                </div>
                {hasDocumentStats ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      fontSize: "12px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>
                      {wordCount.toLocaleString()} words
                    </span>
                    <span style={{ color: "#9ca3af" }}>•</span>
                    <span style={{ fontWeight: 500 }}>
                      {editorPageCount.toLocaleString()} page
                      {editorPageCount !== 1 ? "s" : ""}
                    </span>
                    <span style={{ color: "#9ca3af" }}>•</span>
                    <span style={{ fontWeight: 500 }}>
                      {charCount.toLocaleString()} chars
                    </span>
                    <span style={{ color: "#9ca3af" }}>•</span>
                    <span style={{ fontWeight: 500 }}>
                      {(() => {
                        const totalMinutes = Math.ceil(wordCount / 200);
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        if (hours > 0) {
                          return `~${hours}h ${minutes}m read`;
                        }
                        return `~${minutes}m read`;
                      })()}
                    </span>
                    {readingLevel > 0 && (
                      <>
                        <span style={{ color: "#9ca3af" }}>•</span>
                        <span style={{ fontWeight: 500 }}>
                          Grade {readingLevel}
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      textAlign: "center",
                    }}
                  >
                    Upload a manuscript or start writing to see live document
                    stats.
                  </div>
                )}
                {hasDocumentStats &&
                  selectedDomain &&
                  selectedDomain !== "none" && (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        fontSize: "12px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        marginTop: "4px",
                        padding: "6px 12px",
                        backgroundColor: "#fef5e7",
                        borderRadius: "12px",
                        border: "1px solid #f7d8a8",
                      }}
                    >
                      <span style={{ fontWeight: 500, color: "#64748b" }}>
                        Genre:
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#ef8432",
                          textTransform: "capitalize",
                        }}
                      >
                        {selectedDomain === "custom"
                          ? customDomainName || "Custom"
                          : selectedDomain}
                      </span>
                    </div>
                  )}
                {hasDocumentStats && analysis && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      fontSize: "12px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          analysis.overallScore > 70
                            ? "#10b981"
                            : analysis.overallScore > 50
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      Overall Score: {Math.round(analysis.overallScore)}/100
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Navigation Controls */}
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                {/* Dark Mode Toggle */}
                <DarkModeToggle className="text-sm" />

                {/* Mode Toggle Buttons - Show when document is loaded */}
                {chapterData && accessLevel === "professional" && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() => {
                        setViewMode("analysis");
                        setHighlightPosition(null);
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor:
                          viewMode === "analysis" ? "#ef8432" : "#fef5e7",
                        color: viewMode === "analysis" ? "white" : "#2c3e50",
                        border:
                          viewMode === "analysis"
                            ? "2px solid #ef8432"
                            : "2px solid #e0c392",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: viewMode === "analysis" ? "700" : "600",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      📊 Analysis
                      {viewMode === "analysis" && " ✓"}
                    </button>
                    <button
                      onClick={() => {
                        // Check if user has writer mode access based on subscription
                        const features = ACCESS_TIERS[accessLevel];
                        if (!features.writerMode) {
                          alert(
                            "🔒 Writer Mode requires a Professional subscription.\n\n" +
                              "Upgrade to access the full writing environment with advanced tools."
                          );
                          return;
                        }
                        setViewMode("writer");
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor:
                          viewMode === "writer" ? "#ef8432" : "#fef5e7",
                        color: viewMode === "writer" ? "white" : "#2c3e50",
                        border:
                          viewMode === "writer"
                            ? "2px solid #ef8432"
                            : "2px solid #e0c392",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: viewMode === "writer" ? "700" : "600",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ✍️ Writer
                      {viewMode === "writer" && " ✓"}
                    </button>
                  </div>
                )}

                {/* User Menu / Auth - Far Right */}
                <UserMenu onAuthRequired={() => setIsAuthModalOpen(true)} />
              </div>
            </div>
          </div>
        </header>
      </div>

      <NavigationMenu
        isOpen={isNavigationOpen}
        onClose={() => setIsNavigationOpen(false)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenReferenceLibrary={() => setIsReferenceLibraryModalOpen(true)}
        onOpenWritersReference={() => setIsWritersReferenceModalOpen(true)}
        onOpenQuickStart={() => setIsQuickStartModalOpen(true)}
      />

      {/* Lazy-loaded modals with Suspense */}
      <Suspense fallback={null}>
        {isQuickStartModalOpen && (
          <QuickStartModal
            isOpen={isQuickStartModalOpen}
            onClose={() => setIsQuickStartModalOpen(false)}
          />
        )}

        {isHelpModalOpen && (
          <HelpModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
          />
        )}

        {isReferenceLibraryModalOpen && (
          <ReferenceLibraryModal
            isOpen={isReferenceLibraryModalOpen}
            onClose={() => setIsReferenceLibraryModalOpen(false)}
          />
        )}

        {isWritersReferenceModalOpen && (
          <WritersReferenceModal
            isOpen={isWritersReferenceModalOpen}
            onClose={() => {
              setIsWritersReferenceModalOpen(false);
              setWritersReferenceSection(undefined);
            }}
            initialSection={writersReferenceSection}
          />
        )}

        {isManuscriptModalOpen && (
          <ManuscriptFormatModal
            isOpen={isManuscriptModalOpen}
            onClose={() => setIsManuscriptModalOpen(false)}
            onExport={handleManuscriptExport}
            documentTitle={fileName || undefined}
            documentWordCount={
              currentChapterText.split(/\s+/).filter(Boolean).length
            }
          />
        )}
      </Suspense>

      {/* Save Dialog - Unified Save with format selection */}
      {isSaveDialogOpen && (
        <>
          <div
            onClick={() => setIsSaveDialogOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9999,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fef5e7",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
              zIndex: 10000,
              width: "90%",
              maxWidth: "400px",
              padding: "24px",
              border: "2px solid #e0c392",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px 0",
                color: "#2c3e50",
                fontSize: "20px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              💾 Save Document
            </h2>
            <p
              style={{
                margin: "0 0 20px 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Choose a format and save location
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {/* Shunn Manuscript Format - Featured option */}
              <button
                onClick={() => {
                  setIsSaveDialogOpen(false);
                  setIsManuscriptModalOpen(true);
                }}
                style={{
                  padding: "14px 16px",
                  background:
                    "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
                  color: "#2c3e50",
                  border: "2px solid #ef8432",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.01)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(239, 132, 50, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: "20px" }}>📜</span>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Shunn Manuscript Format
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        backgroundColor: "#ef8432",
                        color: "white",
                        borderRadius: "4px",
                        fontWeight: 500,
                      }}
                    >
                      PRO
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Industry-standard submission format with title page
                  </div>
                </div>
              </button>

              <div
                style={{
                  borderTop: "1px solid #e0c392",
                  margin: "4px 0",
                  paddingTop: "4px",
                  fontSize: "11px",
                  color: "#9ca3af",
                  textAlign: "center",
                }}
              >
                Standard Formats
              </div>

              <button
                onClick={() => handleSaveAs("docx")}
                style={{
                  padding: "14px 16px",
                  backgroundColor: "#fff",
                  color: "#2c3e50",
                  border: "1.5px solid #e0c392",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7e6d0";
                  e.currentTarget.style.borderColor = "#ef8432";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.borderColor = "#e0c392";
                }}
              >
                <span style={{ fontSize: "20px" }}>📄</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Word Document (.docx)</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Microsoft Word format - most compatible
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSaveAs("pdf")}
                style={{
                  padding: "14px 16px",
                  backgroundColor: "#fff",
                  color: "#2c3e50",
                  border: "1.5px solid #e0c392",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7e6d0";
                  e.currentTarget.style.borderColor = "#ef8432";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.borderColor = "#e0c392";
                }}
              >
                <span style={{ fontSize: "20px" }}>📕</span>
                <div>
                  <div style={{ fontWeight: 600 }}>PDF Document (.pdf)</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Manuscript format - for submission
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSaveAs("txt")}
                style={{
                  padding: "14px 16px",
                  backgroundColor: "#fff",
                  color: "#2c3e50",
                  border: "1.5px solid #e0c392",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7e6d0";
                  e.currentTarget.style.borderColor = "#ef8432";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.borderColor = "#e0c392";
                }}
              >
                <span style={{ fontSize: "20px" }}>📝</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Plain Text (.txt)</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Simple text - no formatting
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSaveAs("html")}
                style={{
                  padding: "14px 16px",
                  backgroundColor: "#fff",
                  color: "#2c3e50",
                  border: "1.5px solid #e0c392",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7e6d0";
                  e.currentTarget.style.borderColor = "#ef8432";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.borderColor = "#e0c392";
                }}
              >
                <span style={{ fontSize: "20px" }}>🌐</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Web Page (.html)</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Open in any browser
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSaveAs("json")}
                style={{
                  padding: "14px 16px",
                  backgroundColor: "#fff",
                  color: "#2c3e50",
                  border: "1.5px solid #e0c392",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7e6d0";
                  e.currentTarget.style.borderColor = "#ef8432";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.borderColor = "#e0c392";
                }}
              >
                <span style={{ fontSize: "20px" }}>📦</span>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    QuillPilot Project (.json)
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Full backup with analysis data
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSaveAs("md")}
                style={{
                  padding: "14px 16px",
                  backgroundColor: "#fff",
                  color: "#2c3e50",
                  border: "1.5px solid #e0c392",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7e6d0";
                  e.currentTarget.style.borderColor = "#ef8432";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.borderColor = "#e0c392";
                }}
              >
                <span style={{ fontSize: "20px" }}>📑</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Markdown (.md)</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    For GitHub, Obsidian, notes
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setIsSaveDialogOpen(false)}
              style={{
                marginTop: "16px",
                padding: "10px 16px",
                backgroundColor: "transparent",
                color: "#64748b",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                width: "100%",
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setSaveMessage("✅ Signed in! You can now save your analyses.");
          setTimeout(() => setSaveMessage(null), 5000);
        }}
      />

      {/* Character Manager (Tier 3) */}
      {isCharacterManagerOpen && (
        <CharacterManager
          characters={characters}
          onSave={handleSaveCharacters}
          onClose={() => setIsCharacterManagerOpen(false)}
          onOpenTemplate={(templateHtml, characterId) => {
            // If editing an existing character, use their saved templateHtml if available
            let finalHtml = templateHtml;
            if (characterId) {
              const existingChar = characters.find((c) => c.id === characterId);
              if (existingChar) {
                // If we have saved templateHtml, use it directly (preserves ALL fields)
                if (existingChar.templateHtml) {
                  console.log(
                    "[CharLoad] Using saved templateHtml for:",
                    existingChar.name
                  );
                  finalHtml = existingChar.templateHtml;
                } else {
                  // Fallback: field-by-field population for old characters without templateHtml
                  console.log(
                    "[CharLoad] No templateHtml, using field-by-field for:",
                    existingChar.name
                  );
                  const tempDiv = document.createElement("div");
                  tempDiv.innerHTML = templateHtml;

                  // Pre-fill the character name using the specific ID
                  const nameField = tempDiv.querySelector("#character-name");
                  if (nameField && existingChar.name) {
                    nameField.textContent = existingChar.name;
                    nameField.removeAttribute("data-sample");
                  }

                  // Pre-fill the role dropdown
                  const roleSelect = tempDiv.querySelector(
                    "#character-role"
                  ) as HTMLSelectElement | null;
                  if (roleSelect && existingChar.role) {
                    roleSelect.value = existingChar.role;
                  }

                  // Pre-fill background if exists
                  const backgroundField = tempDiv.querySelector(
                    "#character-background"
                  );
                  if (backgroundField && existingChar.background) {
                    backgroundField.textContent = existingChar.background;
                    backgroundField.removeAttribute("data-sample");
                  }

                  // Pre-fill traits if exists
                  const traitsField =
                    tempDiv.querySelector("#character-traits");
                  if (
                    traitsField &&
                    existingChar.traits &&
                    existingChar.traits.length > 0
                  ) {
                    traitsField.textContent = existingChar.traits.join(", ");
                    traitsField.removeAttribute("data-sample");
                  }

                  // Pre-fill goals if exists
                  const goalsField = tempDiv.querySelector("#character-goals");
                  if (goalsField && existingChar.goals) {
                    goalsField.textContent = existingChar.goals;
                    goalsField.removeAttribute("data-sample");
                  }

                  // Pre-fill conflicts if exists
                  const conflictsField = tempDiv.querySelector(
                    "#character-conflicts"
                  );
                  if (conflictsField && existingChar.conflicts) {
                    conflictsField.textContent = existingChar.conflicts;
                    conflictsField.removeAttribute("data-sample");
                  }

                  // Pre-fill arc if exists
                  const arcField = tempDiv.querySelector("#character-arc");
                  if (arcField && existingChar.arc) {
                    arcField.textContent = existingChar.arc;
                    arcField.removeAttribute("data-sample");
                  }

                  // Pre-fill notes if exists
                  const notesField = tempDiv.querySelector("#character-notes");
                  if (notesField && existingChar.notes) {
                    notesField.textContent = existingChar.notes;
                    notesField.removeAttribute("data-sample");
                  }

                  // Pre-fill relationships if any
                  if (
                    existingChar.relationships &&
                    existingChar.relationships.length > 0
                  ) {
                    const relList = tempDiv.querySelector(
                      "#relationships-list"
                    );
                    if (relList) {
                      const relHtml = existingChar.relationships
                        .map((rel) => {
                          const relChar = characters.find(
                            (c) => c.id === rel.characterId
                          );
                          return `<div style="padding: 4px 8px; background: #fff7ed; border: 1px solid #e0c392; border-radius: 4px; margin-bottom: 4px; font-size: 13px;"><strong>${
                            relChar?.name || "Unknown"
                          }</strong> - ${rel.type}${
                            rel.description ? `: ${rel.description}` : ""
                          }</div>`;
                        })
                        .join("");
                      relList.innerHTML = relHtml;
                    }
                  }

                  // Pre-fill aliases if any
                  if (
                    existingChar.linkedNames &&
                    existingChar.linkedNames.length > 0
                  ) {
                    const aliasesList = tempDiv.querySelector("#aliases-list");
                    if (aliasesList) {
                      const aliasesHtml = existingChar.linkedNames
                        .map(
                          (alias) =>
                            `<div style="padding: 4px 8px; background: #fff7ed; border: 1px solid #e0c392; border-radius: 4px; margin-bottom: 4px; font-size: 13px;">${alias}</div>`
                        )
                        .join("");
                      aliasesList.innerHTML = aliasesHtml;
                    }
                  }

                  finalHtml = tempDiv.innerHTML;
                }
              }
              setEditingCharacterId(characterId);
            } else {
              setEditingCharacterId(null);
            }

            // Load the template into the editor
            const plainTextContent = finalHtml.replace(/<[^>]*>/g, "");

            // Preserve current document state before entering template mode
            if (!isTemplateMode && chapterData) {
              preTemplateDocumentRef.current = {
                chapterText,
                chapterData,
                fileName,
              };
            }

            setChapterText(plainTextContent);
            setChapterData((prev) =>
              prev
                ? {
                    ...prev,
                    plainText: plainTextContent,
                    editorHtml: finalHtml,
                    originalPlainText: plainTextContent,
                  }
                : {
                    html: finalHtml,
                    plainText: plainTextContent,
                    originalPlainText: plainTextContent,
                    isHybridDocx: true,
                    imageCount: 0,
                    editorHtml: finalHtml,
                  }
            );
            setIsTemplateMode(true);
            bumpDocumentInstanceKey();
            setIsCharacterManagerOpen(false);

            // Scroll to top of editor after template loads
            setTimeout(() => {
              const editorContainer = document.querySelector(
                ".paginated-pages-stack"
              );
              if (editorContainer) {
                editorContainer.scrollTop = 0;
              }
              // Also try the editor shell container
              const editorShell = document.querySelector(
                '[style*="overflow-y: auto"]'
              );
              if (editorShell) {
                (editorShell as HTMLElement).scrollTop = 0;
              }
            }, 100);
          }}
        />
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: isStackedLayout ? "column" : "row",
          alignItems: "stretch",
          padding: "16px",
          boxSizing: "border-box",
          gap: "16px",
          backgroundColor: "#dce4ec",
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {/* Left: Document Column (60% desktop, 70% laptop) */}
        <div
          style={{
            flex: isStackedLayout
              ? "1 1 100%"
              : layoutMode === "desktop"
              ? "60 1 0"
              : "70 1 0",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div
            className="app-panel"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              padding: 0,
              backgroundColor: "#eddcc5",
              background: "#eddcc5",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "16px",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              {chapterData ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                    <DocumentEditor
                      key={`${documentInstanceKey}-${layoutVersion}`} // Force remount when switching documents or layout modes
                      initialText={
                        chapterData.originalPlainText ?? chapterData.plainText
                      }
                      htmlContent={
                        chapterData.editorHtml
                          ? chapterData.editorHtml
                          : chapterData.isHybridDocx
                          ? chapterData.html
                          : null
                      }
                      searchText={
                        chapterData.originalPlainText ?? chapterData.plainText
                      }
                      leftMargin={leftMargin}
                      rightMargin={rightMargin}
                      firstLineIndent={firstLineIndent}
                      showRuler={true}
                      onLeftMarginChange={setLeftMargin}
                      onRightMarginChange={setRightMargin}
                      onFirstLineIndentChange={setFirstLineIndent}
                      onTextChange={(text) => {
                        if (viewMode === "writer" && !tierFeatures.writerMode) {
                          setUpgradeFeature("Writer Mode");
                          setUpgradeTarget("professional");
                          setShowUpgradePrompt(true);
                          return;
                        }
                        if (!canEditChapter) {
                          return;
                        }
                        handleTextChange(text);
                      }}
                      onContentChange={(content) => {
                        if (viewMode === "writer" && !tierFeatures.writerMode) {
                          setUpgradeFeature("Writer Mode");
                          setUpgradeTarget("professional");
                          setShowUpgradePrompt(true);
                          return;
                        }
                        if (!canEditChapter) {
                          return;
                        }
                        handleEditorContentChange(content);
                      }}
                      showSpacingIndicators={true}
                      showVisualSuggestions={true}
                      highlightPosition={highlightPosition}
                      searchWord={searchWord}
                      searchOccurrence={searchOccurrence}
                      isFreeMode={!tierFeatures.writerMode}
                      characters={characters}
                      onCharacterLink={handleCharacterLink}
                      onOpenCharacterManager={() =>
                        setIsCharacterManagerOpen(true)
                      }
                      onEditCharacter={(characterId) => {
                        // Edit character - open template with this character
                        const char = characters.find(
                          (c) => c.id === characterId
                        );
                        if (!char) return;
                        const template = getTemplateById("fiction");
                        if (template) {
                          let finalHtml = template.generateTemplate({}, "");
                          if (char.templateHtml) {
                            finalHtml = char.templateHtml;
                          }
                          setEditingCharacterId(char.id);
                          const plainTextContent = finalHtml.replace(
                            /<[^>]*>/g,
                            ""
                          );
                          if (!isTemplateMode && chapterData) {
                            preTemplateDocumentRef.current = {
                              chapterText,
                              chapterData,
                              fileName,
                            };
                          }
                          setChapterText(plainTextContent);
                          setChapterData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  plainText: plainTextContent,
                                  editorHtml: finalHtml,
                                  originalPlainText: plainTextContent,
                                }
                              : {
                                  html: finalHtml,
                                  plainText: plainTextContent,
                                  originalPlainText: plainTextContent,
                                  isHybridDocx: true,
                                  imageCount: 0,
                                  editorHtml: finalHtml,
                                }
                          );
                          setIsTemplateMode(true);
                          bumpDocumentInstanceKey();
                        }
                      }}
                      isProfessionalTier={accessLevel === "professional"}
                      concepts={
                        analysis?.conceptGraph?.concepts?.map(
                          (c: any) => c.name
                        ) || []
                      }
                      onConceptClick={(conceptName) => {
                        // Find the concept object
                        const concept = analysis?.conceptGraph?.concepts?.find(
                          (c: any) => c.name === conceptName
                        );
                        if (concept) {
                          // Trigger the same logic as clicking in the sidebar
                          handleConceptClick(concept, 0);
                        }
                      }}
                      onSave={
                        analysis && viewMode === "writer"
                          ? () => {
                              // Save to localStorage
                              try {
                                const saveData = {
                                  content: {
                                    plainText: chapterData?.plainText || "",
                                    editorHtml: chapterData?.editorHtml || "",
                                  },
                                  fileName: fileName || "untitled",
                                  timestamp: new Date().toISOString(),
                                  analysis: analysis,
                                  isTemplateMode: isTemplateMode,
                                };
                                localStorage.setItem(
                                  "quillpilot_autosave",
                                  JSON.stringify(saveData)
                                );
                                const time = new Date().toLocaleTimeString();
                                alert(
                                  `✅ Changes saved locally at ${time}!\n\nYour work will persist across browser sessions.`
                                );
                              } catch (error) {
                                alert(
                                  "❌ Failed to save. Storage may be full."
                                );
                              }
                            }
                          : undefined
                      }
                      readOnly={!canEditChapter}
                      scrollToTopSignal={scrollToTopSignal}
                      onScrollDepthChange={handleDocumentScrollDepthChange}
                      isCompactLayout={isCompactEditorLayout}
                      analysisResult={analysis}
                      viewMode={viewMode}
                      isTemplateMode={isTemplateMode}
                      onExitTemplateMode={() => setIsTemplateMode(false)}
                      onHeaderFooterChange={setHeaderFooterSettings}
                      onOpenHelp={openHelpSection}
                      onEditorReady={(editor) => {
                        editorInsertRef.current = editor;
                      }}
                      documentTools={
                        <>
                          <DocumentUploader
                            onDocumentLoad={handleDocumentLoad}
                            onInsertAtCursor={handleInsertAtCursor}
                            disabled={isAnalyzing}
                            accessLevel={accessLevel}
                          />

                          {viewMode === "writer" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleClearDocument();
                              }}
                              disabled={isAnalyzing}
                              style={{
                                padding: "4px 10px",
                                backgroundColor: !isAnalyzing
                                  ? "#fef5e7"
                                  : "#e2e8f0",
                                color: !isAnalyzing ? "#2c3e50" : "#9ca3af",
                                border: "1.5px solid #e0c392",
                                borderRadius: "8px",
                                cursor: !isAnalyzing
                                  ? "pointer"
                                  : "not-allowed",
                                fontSize: "11px",
                                fontWeight: "600",
                                transition: "all 0.2s",
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                              onMouseEnter={(e) => {
                                if (!isAnalyzing) {
                                  e.currentTarget.style.backgroundColor =
                                    "#f7e6d0";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isAnalyzing) {
                                  e.currentTarget.style.backgroundColor =
                                    "#fef5e7";
                                }
                              }}
                              title="Clear document and start fresh"
                            >
                              🗑️
                            </button>
                          )}

                          {!isAnalyzing && (
                            <>
                              <button
                                onClick={handleUnifiedSave}
                                style={{
                                  padding: "4px 10px",
                                  backgroundColor: "#fef5e7",
                                  color: "#2c3e50",
                                  border: "1.5px solid #e0c392",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  transition: "all 0.2s",
                                  whiteSpace: "nowrap",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#f7e6d0";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#fef5e7";
                                }}
                                title="Save document to file (⌘S)"
                              >
                                💾 Save
                              </button>
                              <button
                                onClick={handlePrint}
                                style={{
                                  padding: "4px 10px",
                                  backgroundColor: "#fef5e7",
                                  color: "#2c3e50",
                                  border: "1.5px solid #e0c392",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  transition: "all 0.2s",
                                  whiteSpace: "nowrap",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#f7e6d0";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#fef5e7";
                                }}
                                title="Print Document"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <rect
                                    x="6"
                                    y="2"
                                    width="12"
                                    height="6"
                                    rx="1"
                                    stroke="#2c3e50"
                                    strokeWidth="1.5"
                                    fill="none"
                                  />
                                  <rect
                                    x="4"
                                    y="8"
                                    width="16"
                                    height="8"
                                    rx="2"
                                    stroke="#2c3e50"
                                    strokeWidth="1.5"
                                    fill="#f7e6d0"
                                  />
                                  <rect
                                    x="7"
                                    y="14"
                                    width="10"
                                    height="8"
                                    rx="1"
                                    stroke="#2c3e50"
                                    strokeWidth="1.5"
                                    fill="white"
                                  />
                                  <circle cx="7" cy="11" r="1" fill="#ef8432" />
                                  <line
                                    x1="9"
                                    y1="17"
                                    x2="15"
                                    y2="17"
                                    stroke="#2c3e50"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                  />
                                  <line
                                    x1="9"
                                    y1="19"
                                    x2="15"
                                    y2="19"
                                    stroke="#2c3e50"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </button>

                              {viewMode === "writer" && (
                                <button
                                  onClick={() => {
                                    try {
                                      const saveData = {
                                        content: {
                                          plainText:
                                            chapterData?.plainText || "",
                                          editorHtml:
                                            chapterData?.editorHtml || "",
                                        },
                                        fileName: fileName || "untitled",
                                        timestamp: new Date().toISOString(),
                                        analysis: analysis,
                                        isTemplateMode: isTemplateMode,
                                      };
                                      localStorage.setItem(
                                        "quillpilot_autosave",
                                        JSON.stringify(saveData)
                                      );
                                      const time =
                                        new Date().toLocaleTimeString();
                                      alert(
                                        `✅ Changes saved locally at ${time}!\n\nYour work will persist across browser sessions.`
                                      );
                                    } catch (error) {
                                      alert(
                                        "❌ Failed to save. Storage may be full."
                                      );
                                    }
                                  }}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    try {
                                      const autosaved = localStorage.getItem(
                                        "quillpilot_autosave"
                                      );
                                      if (autosaved) {
                                        const saved = JSON.parse(autosaved);
                                        const savedTime = new Date(
                                          saved.timestamp
                                        ).toLocaleString();
                                        const clear = window.confirm(
                                          `💾 Auto-save Status\n\nLast saved: ${savedTime}\nFile: ${saved.fileName}\n\nClick OK to clear auto-saved data, or Cancel to keep it.`
                                        );
                                        if (clear) {
                                          localStorage.removeItem(
                                            "quillpilot_autosave"
                                          );
                                          alert("🗑️ Auto-saved data cleared!");
                                        }
                                      } else {
                                        alert(
                                          "ℹ️ No auto-saved data found.\n\nYour work is automatically saved as you edit in Writer Mode."
                                        );
                                      }
                                    } catch (error) {
                                      alert(
                                        "⚠️ Error checking auto-save status"
                                      );
                                    }
                                  }}
                                  style={{
                                    padding: "4px 10px",
                                    backgroundColor: "#fef5e7",
                                    color: "#2c3e50",
                                    border: "1.5px solid #e0c392",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    transition: "all 0.2s",
                                    whiteSpace: "nowrap",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#f7e6d0";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#fef5e7";
                                  }}
                                  title="Click: Save work locally | Right-click: View/clear auto-save status"
                                >
                                  💾
                                </button>
                              )}
                            </>
                          )}
                        </>
                      }
                      onPageCountChange={setEditorPageCount}
                    />
                  </div>
                </div>
              ) : viewMode === "writer" ? (
                // Writer mode with no document - show Start Writing prompt
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2c3e50",
                    flexDirection: "column",
                    gap: "1.5rem",
                    padding: "2rem",
                  }}
                >
                  <div style={{ fontSize: "64px" }}>✍️</div>
                  <div style={{ fontSize: "20px", fontWeight: "600" }}>
                    Ready to write?
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      textAlign: "center",
                      maxWidth: "400px",
                      marginBottom: "1rem",
                    }}
                  >
                    Click the button below to begin crafting your story, or
                    upload an existing document to continue editing.
                  </div>
                  <button
                    onClick={() => {
                      // Start with blank document
                      const blankContent = "";
                      setChapterText(blankContent);
                      setChapterData({
                        html: "",
                        plainText: blankContent,
                        originalPlainText: blankContent,
                        isHybridDocx: false,
                        imageCount: 0,
                        editorHtml: "",
                      });
                      bumpDocumentInstanceKey();
                      setViewMode("writer");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "16px 32px",
                      backgroundColor: "#ef8432",
                      color: "white",
                      border: "none",
                      borderRadius: "24px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "16px",
                      transition: "all 0.2s",
                      boxShadow: "0 4px 12px rgba(239, 132, 50, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#d97326";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 16px rgba(239, 132, 50, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#ef8432";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(239, 132, 50, 0.3)";
                    }}
                  >
                    ✍️ Start Writing
                  </button>
                </div>
              ) : (
                // Analysis mode with no document
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2c3e50",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div style={{ fontSize: "64px" }}>📄</div>
                  <div style={{ fontSize: "18px", fontWeight: "600" }}>
                    Upload a document to get started
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Analysis Panel (responsive: 40% desktop, 30% laptop) */}
        {/* Hide sidebar in writer mode for professional tier - give full page to editor */}
        {!(viewMode === "writer" && accessLevel === "professional") && (
          <div
            className="app-panel"
            style={{
              flex: isStackedLayout
                ? "1 1 100%"
                : layoutMode === "desktop"
                ? "40 1 0"
                : "30 1 0",
              maxWidth: "100%",
              minWidth: analysisMinWidth,
              display: "flex",
              flexDirection: "column",
              marginTop: isStackedLayout ? "16px" : 0,
              backgroundColor: "transparent",
              background: "transparent",
              border: "none",
              borderRadius: 0,
              boxShadow: "none",
              padding: 0,
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            {!tierFeatures.fullAnalysis ? (
              <div
                ref={analysisControlsRef}
                className="app-panel"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  padding: chapterData ? "18px" : "22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  justifyContent: "flex-start",
                  backgroundColor: "#f5e6d3",
                  border: "1.5px solid #ef8432",
                  boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#000000",
                  }}
                >
                  Analysis Controls
                </h2>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    color: "#2c3e50",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    listStyleType: "disc",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li>
                    <strong style={{ color: "#111827" }}>
                      Tier 1 · Limited Analysis
                    </strong>
                    <p style={{ margin: "4px 0" }}>
                      Upload manuscripts up to 200 pages to get instant pacing
                      analysis and show-vs-tell insights for your creative
                      writing.
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "18px",
                        lineHeight: 1.6,
                        listStyleType: "circle",
                      }}
                    >
                      <li>
                        <strong>Usage limit:</strong> 3 manuscript uploads (no
                        signup required).
                      </li>
                      <li>
                        <strong>Upload limit:</strong> Up to 200 pages per
                        manuscript (short stories, novellas, or novel chapters).
                      </li>
                      <li>
                        Pacing analysis shows paragraph density and rhythm
                        patterns.
                      </li>
                      <li>
                        Show-vs-tell detection highlights opportunities for
                        sensory details and immersive description.
                      </li>
                      <li>
                        Genre auto-detection for fantasy, mystery, romance,
                        sci-fi, and more.
                      </li>
                      <li>
                        <strong>Save analyses:</strong> Sign up for free to save
                        up to 3 manuscripts.
                      </li>
                    </ul>
                  </li>

                  <li>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <strong style={{ color: "#111827" }}>
                        Tier 2 · Full Analysis
                      </strong>
                      <button
                        onClick={() => {
                          setUpgradeFeature("Premium Author");
                          setUpgradeTarget("premium");
                          setShowUpgradePrompt(true);
                        }}
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "white",
                          color: "#2c3e50",
                          border: "1.5px solid #ef8432",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f7e6d0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                        }}
                      >
                        Upgrade
                      </button>
                    </div>
                    <p style={{ margin: "4px 0" }}>
                      Complete manuscript analysis up to 650 pages with advanced
                      writing insights and export capabilities for serious
                      authors.
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "18px",
                        lineHeight: 1.6,
                        listStyleType: "circle",
                      }}
                    >
                      <li>
                        <strong>Upload limit:</strong> Up to 650 pages
                        (full-length novels, memoirs, creative nonfiction
                        books).
                      </li>
                      <li>
                        Detailed pacing scores with rhythm analysis throughout
                        your manuscript.
                      </li>
                      <li>
                        Show-vs-tell heatmaps identify where to add sensory
                        immersion.
                      </li>
                      <li>
                        Auto-generated writing recommendations with specific
                        improvement suggestions.
                      </li>
                      <li>
                        Export results as DOCX, JSON, or HTML for revision
                        planning and beta reader sharing.
                      </li>
                      <li>
                        Create and save custom genre profiles for specialized
                        fiction subgenres.
                      </li>
                    </ul>
                  </li>

                  <li>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <strong style={{ color: "#111827" }}>
                        Tier 3 · Professional Writer
                      </strong>
                      <button
                        onClick={() => {
                          setUpgradeFeature("Professional Writer");
                          setUpgradeTarget("professional");
                          setShowUpgradePrompt(true);
                        }}
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "white",
                          color: "#2c3e50",
                          border: "1.5px solid #ef8432",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f7e6d0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                        }}
                      >
                        Upgrade
                      </button>
                    </div>
                    <p style={{ margin: "4px 0" }}>
                      Everything in Premium plus Writer Mode with advanced
                      productivity tools for real-time editing, unlimited
                      analyses (up to 1,000 pages), and full support for
                      screenplays and poetry—perfect for professional authors.
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "18px",
                        lineHeight: 1.6,
                        listStyleType: "circle",
                      }}
                    >
                      <li>
                        <strong>Upload limit:</strong> Up to 1,000 pages (epic
                        fantasy series, comprehensive memoirs, anthology
                        collections).
                      </li>
                      <li>
                        <strong>Writer Mode:</strong> Full word processor with
                        live analysis updates as you draft and revise.
                      </li>
                      <li>
                        <strong>AI Writing Assistant:</strong> Get contextual
                        suggestions for word choice, sentence structure, and
                        style improvements.
                      </li>
                      <li>
                        <strong>Dialogue Enhancer:</strong> Polish character
                        dialogue with voice consistency and subtext suggestions.
                      </li>
                      <li>
                        <strong>Beat Sheet Generator:</strong> Create story
                        structure outlines based on your genre and narrative
                        arc.
                      </li>
                      <li>
                        <strong>Focus Mode & Typewriter Mode:</strong>{" "}
                        Distraction-free writing environments for deep work.
                      </li>
                      <li>
                        <strong>Screenplay & Poetry Support:</strong> Industry
                        formatting for scripts and specialized analysis for
                        verse, rhythm, and imagery.
                      </li>
                      <li>
                        Unlimited manuscript analyses with no upload
                        restrictions or quotas.
                      </li>
                      <li>
                        Comprehensive export options (PDF, DOCX, HTML) for
                        agent/editor submission workflows.
                      </li>
                    </ul>
                  </li>
                </ul>

                {!chapterData && (
                  <div
                    style={{
                      marginTop: "16px",
                      fontSize: "13px",
                      color: "#2c3e50",
                      backgroundColor: "#e0c392",
                      padding: "12px",
                      borderRadius: "20px",
                    }}
                  >
                    Upload a manuscript to see pacing analysis and show-vs-tell
                    insights for your creative writing.
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  minHeight: 0,
                  padding: 0,
                  margin: 0,
                }}
              >
                <div
                  ref={analysisControlsRef}
                  className="app-panel"
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f5e6d3",
                    background: "#f5e6d3",
                    border: "1.5px solid #e0c392",
                    boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
                  }}
                >
                  {/* Header with inline buttons for space efficiency */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ flex: "0 0 70%" }}>
                      <h2
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "18px",
                          color: "#000000",
                        }}
                      >
                        Analysis Controls
                      </h2>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          color: "#64748b",
                          lineHeight: "1.3",
                        }}
                      >
                        Select genre • Configure settings • Run analysis
                      </p>
                    </div>
                    <div
                      style={{
                        flex: "0 0 30%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <button
                        onClick={handleAnalyzeChapter}
                        disabled={
                          !currentChapterText.trim() ||
                          isAnalyzing ||
                          (!selectedDomain && selectedDomain !== "none")
                        }
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          backgroundColor: "white",
                          color:
                            currentChapterText.trim() &&
                            !isAnalyzing &&
                            (selectedDomain || selectedDomain === "none")
                              ? "#ef8432"
                              : "#2c3e50",
                          border:
                            currentChapterText.trim() &&
                            !isAnalyzing &&
                            (selectedDomain || selectedDomain === "none")
                              ? "2px solid #ef8432"
                              : "2px solid #e0c392",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor:
                            currentChapterText.trim() &&
                            !isAnalyzing &&
                            (selectedDomain || selectedDomain === "none")
                              ? "pointer"
                              : "not-allowed",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (
                            currentChapterText.trim() &&
                            !isAnalyzing &&
                            (selectedDomain || selectedDomain === "none")
                          )
                            e.currentTarget.style.backgroundColor = "#f7e6d0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                        }}
                      >
                        {isAnalyzing ? "⏳ Analyzing..." : "🔍 Analyze"}
                      </button>
                      {chapterData && analysis && !isAnalyzing && (
                        <button
                          onClick={() =>
                            setAutoAnalysisEnabled(!autoAnalysisEnabled)
                          }
                          style={{
                            width: "100%",
                            padding: "6px 12px",
                            backgroundColor: autoAnalysisEnabled
                              ? "#ef8432"
                              : "white",
                            color: autoAnalysisEnabled ? "white" : "#2c3e50",
                            border: `1.5px solid ${
                              autoAnalysisEnabled ? "#ef8432" : "#e0c392"
                            }`,
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (!autoAnalysisEnabled) {
                              e.currentTarget.style.backgroundColor = "#f7e6d0";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!autoAnalysisEnabled) {
                              e.currentTarget.style.backgroundColor = "white";
                            }
                          }}
                        >
                          {autoAnalysisEnabled ? "✓ Auto" : "Auto"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "600",
                        marginBottom: "4px",
                        color: "#2c3e50",
                      }}
                    >
                      Genre:
                    </label>{" "}
                    {!showDomainSelector ? (
                      <div
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: selectedDomain
                            ? "2px solid #ef8432"
                            : "2px solid #c16659",
                          borderRadius: "20px",
                          fontSize: "13px",
                          backgroundColor: "white",
                          color: selectedDomain ? "#ef8432" : "#c16659",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        {selectedDomain === "none" ? (
                          <>
                            <span>📝 None / General Content</span>
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "normal",
                                }}
                              >
                                ✓ Manual selection
                              </span>
                              <button
                                onClick={() => setShowDomainSelector(true)}
                                disabled={isAnalyzing}
                                style={{
                                  padding: "4px 10px",
                                  backgroundColor: "white",
                                  color: "#2c3e50",
                                  border: "1.5px solid #2c3e50",
                                  borderRadius: "16px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  cursor: isAnalyzing
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity: isAnalyzing ? 0.5 : 1,
                                  transition: "background-color 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isAnalyzing)
                                    e.currentTarget.style.backgroundColor =
                                      "#f7e6d0";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "white";
                                }}
                              >
                                Change
                              </button>
                            </div>
                          </>
                        ) : selectedDomain ? (
                          <>
                            <span>
                              {selectedDomain === "custom" ? (
                                <>🎨 {customDomainName || "Custom Domain"}</>
                              ) : (
                                <>
                                  {
                                    sortedDomains.find(
                                      (d) => d.id === selectedDomain
                                    )?.icon
                                  }{" "}
                                  {sortedDomains.find(
                                    (d) => d.id === selectedDomain
                                  )?.label || selectedDomain}
                                </>
                              )}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "normal",
                                }}
                              >
                                {selectedDomain === "custom"
                                  ? "✓ Custom"
                                  : "✓ Auto-detected"}
                              </span>
                              <button
                                onClick={() => setShowDomainSelector(true)}
                                disabled={isAnalyzing}
                                style={{
                                  padding: "4px 10px",
                                  backgroundColor: "white",
                                  color: "#2c3e50",
                                  border: "1.5px solid #2c3e50",
                                  borderRadius: "16px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  cursor: isAnalyzing
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity: isAnalyzing ? 0.5 : 1,
                                  transition: "background-color 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isAnalyzing)
                                    e.currentTarget.style.backgroundColor =
                                      "#f7e6d0";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "white";
                                }}
                              >
                                Change
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span>⚠️ Domain not detected: upload document</span>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => setShowDomainSelector(true)}
                                style={{
                                  padding: "4px 12px",
                                  backgroundColor: "white",
                                  color: "#2c3e50",
                                  border: "1.5px solid #2c3e50",
                                  borderRadius: "16px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "background-color 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#f7e6d0";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "white";
                                }}
                              >
                                Select Domain
                              </button>
                              <button
                                onClick={() => {
                                  // Check access level for custom domains
                                  const features = ACCESS_TIERS[accessLevel];
                                  if (!features.customGenres) {
                                    setUpgradeFeature("Custom Domains");
                                    setUpgradeTarget("premium");
                                    setShowUpgradePrompt(true);
                                    return;
                                  }
                                  setShowCustomDomainDialog(true);
                                }}
                                style={{
                                  padding: "4px 12px",
                                  backgroundColor: "#f2ebe3",
                                  color: "#2c3e50",
                                  border: "1.5px solid #2c3e50",
                                  borderRadius: "16px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: ACCESS_TIERS[accessLevel].customGenres
                                    ? "pointer"
                                    : "not-allowed",
                                  transition: "background-color 0.2s",
                                  opacity: ACCESS_TIERS[accessLevel]
                                    .customGenres
                                    ? 1
                                    : 0.6,
                                }}
                                onMouseEnter={(e) => {
                                  if (ACCESS_TIERS[accessLevel].customGenres)
                                    e.currentTarget.style.backgroundColor =
                                      "#e0d5c7";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#f2ebe3";
                                }}
                              >
                                Create Custom{" "}
                                {!ACCESS_TIERS[accessLevel].customGenres &&
                                  "🔒"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <select
                          value={selectedDomain || ""}
                          onChange={(e) => {
                            const value = e.target.value;

                            // Handle "none" selection - clear domain
                            if (value === "none") {
                              setSelectedDomain("none");
                              setDetectedDomain(null);
                              setShowDomainSelector(false);
                              return;
                            }

                            // Check if it's a saved custom domain
                            if (value.startsWith("custom:")) {
                              const domainName = value.substring(7); // Remove "custom:" prefix
                              const savedDomain = getCustomDomain(domainName);
                              if (savedDomain) {
                                setCustomDomainName(savedDomain.name);
                                setCustomConcepts(
                                  convertToConceptDefinitions(savedDomain)
                                );
                                setSelectedDomain("custom");
                                localStorage.setItem(
                                  "quillpilot_last_custom_domain",
                                  savedDomain.name
                                );
                              }
                            } else {
                              setSelectedDomain(value as Domain);
                            }
                            setShowDomainSelector(false);
                          }}
                          disabled={isAnalyzing}
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "2px solid #2c3e50",
                            borderRadius: "20px",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        >
                          <option value="">-- Select a domain --</option>
                          <option value="none">
                            📝 None / General Content
                          </option>
                          {sortedDomains.map((domain) => (
                            <option key={domain.id} value={domain.id}>
                              {domain.icon} {domain.label}
                            </option>
                          ))}
                          {/* Show saved custom domains if user has access */}
                          {ACCESS_TIERS[accessLevel].customGenres &&
                            loadCustomDomains().length > 0 && (
                              <>
                                <option disabled>──────────</option>
                                <optgroup label="📁 Your Custom Domains">
                                  {loadCustomDomains().map((domain) => (
                                    <option
                                      key={`custom:${domain.name}`}
                                      value={`custom:${domain.name}`}
                                    >
                                      🎨 {domain.name}
                                    </option>
                                  ))}
                                </optgroup>
                              </>
                            )}
                        </select>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => setShowDomainSelector(false)}
                            style={{
                              flex: 1,
                              padding: "6px",
                              backgroundColor: "white",
                              color: "#2c3e50",
                              border: "1.5px solid #2c3e50",
                              borderRadius: "16px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f7e6d0";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "white";
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              // Check access level for custom domains
                              const features = ACCESS_TIERS[accessLevel];
                              if (!features.customGenres) {
                                setUpgradeFeature("Custom Domains");
                                setUpgradeTarget("premium");
                                setShowUpgradePrompt(true);
                                setShowDomainSelector(false);
                                return;
                              }
                              setShowCustomDomainDialog(true);
                            }}
                            style={{
                              flex: 1,
                              padding: "6px",
                              backgroundColor: "#f2ebe3",
                              color: "#2c3e50",
                              border: "1.5px solid #2c3e50",
                              borderRadius: "16px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: ACCESS_TIERS[accessLevel].customGenres
                                ? "pointer"
                                : "not-allowed",
                              transition: "background-color 0.2s",
                              opacity: ACCESS_TIERS[accessLevel].customGenres
                                ? 1
                                : 0.6,
                            }}
                            onMouseEnter={(e) => {
                              if (ACCESS_TIERS[accessLevel].customGenres)
                                e.currentTarget.style.backgroundColor =
                                  "#e0d5c7";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f2ebe3";
                            }}
                          >
                            Create Custom{" "}
                            {!ACCESS_TIERS[accessLevel].customGenres && "🔒"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Free tier info */}
                  {accessLevel === "free" &&
                    currentChapterText &&
                    !isAnalyzing && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px",
                          backgroundColor: "white",
                          borderLeft: "4px solid #2c3e50",
                          borderRadius: "20px",
                          fontSize: "13px",
                          lineHeight: 1.6,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "600",
                            marginBottom: "6px",
                            color: "#2c3e50",
                          }}
                        >
                          🎁 Free Preview Available
                        </div>
                        <div style={{ color: "#1e3a8a" }}>
                          <strong>Spacing Analysis:</strong> See optimal concept
                          repetition patterns for better retention.
                          <br />
                          <strong>Dual Coding:</strong> Get AI suggestions for
                          where to add visuals, diagrams, and illustrations.
                          <br />
                          <br />
                          <span style={{ fontSize: "12px", opacity: 0.9 }}>
                            💡 Upgrade to Premium for full 10-principle analysis
                            with concept graphs, pattern recognition, and
                            detailed recommendations.
                          </span>
                        </div>
                      </div>
                    )}

                  {error && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        backgroundColor: "white",
                        color: "#991b1b",
                        borderRadius: "20px",
                        fontSize: "14px",
                      }}
                    >
                      ⚠️ {error}
                    </div>
                  )}

                  {progress && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        backgroundColor: "white",
                        color: "#2c3e50",
                        borderRadius: "20px",
                        fontSize: "14px",
                      }}
                    >
                      {progress}
                    </div>
                  )}

                  {/* Characters Panel - Professional Tier */}
                  {accessLevel === "professional" && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        backgroundColor: "white",
                        borderRadius: "16px",
                        border: "1.5px solid #e0c392",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: characters.length > 0 ? "10px" : "0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>👤</span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#2c3e50",
                              fontSize: "14px",
                            }}
                          >
                            Characters
                          </span>
                          {characters.length > 0 && (
                            <span
                              style={{
                                backgroundColor: "#fef3c7",
                                color: "#92400e",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontWeight: 500,
                              }}
                            >
                              {characters.length}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setIsCharacterManagerOpen(true)}
                          style={{
                            padding: "4px 10px",
                            backgroundColor: "#ef8432",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          + New
                        </button>
                      </div>
                      {characters.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {characters.map((char) => (
                            <div
                              key={char.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: "#fef5e7",
                                border: "1px solid #e0c392",
                                borderRadius: "20px",
                                padding: "6px 10px",
                                fontSize: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "#2c3e50",
                                  maxWidth: "100px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {char.name}
                              </span>
                              {char.role && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    color: "#64748b",
                                    backgroundColor: "white",
                                    padding: "2px 6px",
                                    borderRadius: "8px",
                                  }}
                                >
                                  {char.role}
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  // Edit character - open template with this character
                                  const template = getTemplateById("fiction");
                                  if (template) {
                                    const templateHtml =
                                      template.generateTemplate({}, "");
                                    // Load template and set editing character
                                    let finalHtml = templateHtml;
                                    if (char.templateHtml) {
                                      finalHtml = char.templateHtml;
                                    }
                                    setEditingCharacterId(char.id);
                                    const plainTextContent = finalHtml.replace(
                                      /<[^>]*>/g,
                                      ""
                                    );
                                    if (!isTemplateMode && chapterData) {
                                      preTemplateDocumentRef.current = {
                                        chapterText,
                                        chapterData,
                                        fileName,
                                      };
                                    }
                                    setChapterText(plainTextContent);
                                    setChapterData((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            plainText: plainTextContent,
                                            editorHtml: finalHtml,
                                            originalPlainText: plainTextContent,
                                          }
                                        : {
                                            html: finalHtml,
                                            plainText: plainTextContent,
                                            originalPlainText: plainTextContent,
                                            isHybridDocx: true,
                                            imageCount: 0,
                                            editorHtml: finalHtml,
                                          }
                                    );
                                    setIsTemplateMode(true);
                                    bumpDocumentInstanceKey();
                                  }
                                }}
                                title="Edit character"
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: "2px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  opacity: 0.6,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = "0.6";
                                }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(`Delete character "${char.name}"?`)
                                  ) {
                                    setCharacters((prev) =>
                                      prev.filter((c) => c.id !== char.id)
                                    );
                                  }
                                }}
                                title="Delete character"
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: "2px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  opacity: 0.6,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = "0.6";
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Character Arc Analysis (22-Step) - Tier 3 */}
                  {accessLevel === "professional" &&
                    analysis &&
                    characterArcAnalysis.length > 0 && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px",
                          backgroundColor: "white",
                          borderRadius: "16px",
                          border: "1.5px solid #e0c392",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setIsCharacterArcExpanded(!isCharacterArcExpanded)
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span style={{ fontSize: "16px" }}>🎭</span>
                            <span
                              style={{
                                fontWeight: 600,
                                color: "#2c3e50",
                                fontSize: "14px",
                              }}
                            >
                              Character Arc Analysis
                            </span>
                            <span
                              style={{
                                backgroundColor: "#dbeafe",
                                color: "#1e40af",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontWeight: 500,
                              }}
                            >
                              22-Step
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                              }}
                            >
                              {characterArcAnalysis.length} character
                              {characterArcAnalysis.length !== 1 ? "s" : ""}
                            </span>
                            <span
                              style={{ color: "#64748b", fontSize: "12px" }}
                            >
                              {isCharacterArcExpanded ? "▼" : "▶"}
                            </span>
                          </div>
                        </div>

                        {isCharacterArcExpanded && (
                          <div
                            style={{
                              marginTop: "12px",
                              maxHeight: "400px",
                              overflowY: "auto",
                              scrollbarWidth: "none", // Firefox
                              msOverflowStyle: "none", // IE/Edge
                            }}
                            className="hide-scrollbar"
                          >
                            {characterArcAnalysis.map((charArc, idx) => (
                              <div
                                key={charArc.characterId || idx}
                                style={{
                                  padding: "10px",
                                  backgroundColor: "#fef5e7",
                                  borderRadius: "12px",
                                  marginBottom:
                                    idx < characterArcAnalysis.length - 1
                                      ? "8px"
                                      : 0,
                                  border: "1px solid #e0c392",
                                }}
                              >
                                {/* Character Header */}
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        color: "#111827",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {charArc.characterName}
                                    </span>
                                    <span
                                      style={{
                                        backgroundColor: getStepColor(
                                          charArc.currentPhase
                                        ),
                                        color: "white",
                                        padding: "2px 8px",
                                        borderRadius: "10px",
                                        fontSize: "10px",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {POSITION_LABELS[charArc.currentPhase]}
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      color:
                                        charArc.completionPercentage >= 60
                                          ? "#10b981"
                                          : charArc.completionPercentage >= 30
                                          ? "#f59e0b"
                                          : "#ef4444",
                                    }}
                                  >
                                    {charArc.completionPercentage}% complete
                                  </span>
                                </div>

                                {/* Trait Pills */}
                                {charArc.traits.length > 0 && (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: "4px",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    {charArc.traits
                                      .slice(0, 5)
                                      .map((trait, tIdx) => (
                                        <span
                                          key={tIdx}
                                          style={{
                                            backgroundColor: "#dbeafe",
                                            color: "#1e40af",
                                            padding: "2px 6px",
                                            borderRadius: "8px",
                                            fontSize: "10px",
                                          }}
                                        >
                                          {trait}
                                        </span>
                                      ))}
                                    {charArc.traits.length > 5 && (
                                      <span
                                        style={{
                                          color: "#64748b",
                                          fontSize: "10px",
                                        }}
                                      >
                                        +{charArc.traits.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Arc Progress Bar */}
                                <div
                                  style={{
                                    height: "6px",
                                    backgroundColor: "#e5e7eb",
                                    borderRadius: "3px",
                                    marginBottom: "8px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${charArc.completionPercentage}%`,
                                      background: `linear-gradient(90deg, ${getStepColor(
                                        "beginning"
                                      )}, ${getStepColor(
                                        "middle"
                                      )}, ${getStepColor("end")})`,
                                      borderRadius: "3px",
                                      transition: "width 0.3s ease",
                                    }}
                                  />
                                </div>

                                {/* Arc Summary */}
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "11px",
                                    color: "#64748b",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {charArc.arcSummary}
                                </p>

                                {/* Detected Steps Preview */}
                                {charArc.detectedSteps.length > 0 && (
                                  <div style={{ marginTop: "8px" }}>
                                    <div
                                      style={{
                                        fontSize: "10px",
                                        color: "#64748b",
                                        marginBottom: "4px",
                                        fontWeight: 500,
                                      }}
                                    >
                                      Detected arc steps:
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "4px",
                                      }}
                                    >
                                      {charArc.detectedSteps
                                        .filter((s) => s.confidence >= 25)
                                        .slice(0, 6)
                                        .map((detected, dIdx) => (
                                          <span
                                            key={dIdx}
                                            title={`${detected.step.name}: ${detected.step.description}`}
                                            style={{
                                              backgroundColor: getStepColor(
                                                detected.step.storyPosition
                                              ),
                                              color: "white",
                                              padding: "2px 6px",
                                              borderRadius: "6px",
                                              fontSize: "9px",
                                              cursor: "help",
                                              opacity:
                                                detected.confidence >= 50
                                                  ? 1
                                                  : 0.7,
                                            }}
                                          >
                                            {detected.step.shortName}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}

                            {/* Link to Character Manager */}
                            <button
                              onClick={() => setIsCharacterManagerOpen(true)}
                              style={{
                                marginTop: "8px",
                                width: "100%",
                                padding: "8px",
                                backgroundColor: "#fef5e7",
                                color: "#ef8432",
                                border: "1.5px solid #ef8432",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#f7e6d0";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#fef5e7";
                              }}
                            >
                              Open Character Manager to Edit Traits
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Analysis Results */}
                {analysis && (
                  <div
                    ref={analysisPanelRef}
                    className="app-panel"
                    style={{
                      flex: 1,
                      overflow: "auto",
                      padding: "16px",
                      backgroundColor:
                        viewMode === "analysis" ? "#ead6c1" : "#f5e0c4",
                      border:
                        viewMode === "analysis"
                          ? "1.5px solid #e0c392"
                          : "1.5px solid #f7d8a8",
                    }}
                  >
                    <button
                      onClick={handleExport}
                      disabled={!ACCESS_TIERS[accessLevel].exportResults}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "white",
                        color: ACCESS_TIERS[accessLevel].exportResults
                          ? "#2c3e50"
                          : "#2c3e50",
                        border: ACCESS_TIERS[accessLevel].exportResults
                          ? "1.5px solid #2c3e50"
                          : "1.5px solid #e0c392",
                        borderRadius: "20px",
                        cursor: ACCESS_TIERS[accessLevel].exportResults
                          ? "pointer"
                          : "not-allowed",
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (ACCESS_TIERS[accessLevel].exportResults)
                          e.currentTarget.style.backgroundColor = "#f7e6d0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      📥 Export JSON{" "}
                      {!ACCESS_TIERS[accessLevel].exportResults && "🔒"}
                    </button>

                    {viewMode === "analysis" ? (
                      <>
                        {!ACCESS_TIERS[accessLevel].fullAnalysis && (
                          <InlineUpgradePrompt
                            targetLevel="premium"
                            feature="Full Manuscript Analysis"
                            description="Unlock comprehensive pacing analysis, show-vs-tell insights, dialogue balance, and detailed writing recommendations for your entire manuscript."
                            onUpgrade={() => {
                              setUpgradeFeature("Full Analysis");
                              setUpgradeTarget("premium");
                              setShowUpgradePrompt(true);
                            }}
                          />
                        )}
                        <ChapterAnalysisDashboard
                          analysis={analysis}
                          concepts={analysis.conceptGraph?.concepts || []}
                          onConceptClick={handleConceptClick}
                          highlightedConceptId={highlightedConceptId}
                          currentMentionIndex={currentMentionIndex}
                          accessLevel={accessLevel}
                          hasDomain={
                            selectedDomain !== "none" && selectedDomain !== null
                          }
                          activeDomain={selectedDomain}
                          relationships={
                            analysis.conceptGraph?.relationships || []
                          }
                          generalConcepts={
                            selectedDomain === "none"
                              ? generalConcepts
                              : undefined
                          }
                          onGeneralConceptClick={(position, term) => {
                            setHighlightPosition(position);
                            setSearchWord(term);
                            setSearchOccurrence(0);
                          }}
                        />
                      </>
                    ) : (
                      <div
                        style={{
                          padding: "20px",
                          backgroundColor: "transparent",
                          borderRadius: "24px",
                          overflowY: "auto",
                          overflowX: "hidden",
                          maxHeight: "calc(100vh - 220px)",
                          WebkitOverflowScrolling: "touch",
                        }}
                        tabIndex={0}
                      >
                        <h3 className="section-header">
                          ✍️ Writing Suggestions
                        </h3>

                        {/* Principle Scores */}
                        <div style={{ marginBottom: "24px" }}>
                          <h4
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              marginBottom: "12px",
                              color: "#2c3e50",
                            }}
                          >
                            Writing Metrics
                          </h4>
                          {analysis.principles
                            ?.slice(0, 5)
                            .map((principle: any) => (
                              <div
                                key={principle.principle}
                                style={{
                                  marginBottom: "8px",
                                  padding: "8px 12px",
                                  backgroundColor: "#fef5e7",
                                  borderRadius: "20px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {principle.principle
                                    .replace(/([A-Z])/g, " $1")
                                    .trim()}
                                </span>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color:
                                      principle.score > 70
                                        ? "#10b981"
                                        : principle.score > 50
                                        ? "#f59e0b"
                                        : "#ef4444",
                                  }}
                                >
                                  {Math.round(principle.score)}/100
                                </span>
                              </div>
                            ))}
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              marginBottom: "12px",
                              color: "#2c3e50",
                            }}
                          >
                            Top Recommendations
                          </h4>
                          {analysis.recommendations
                            ?.slice(0, 8)
                            .map((rec: any) => (
                              <div
                                key={rec.id}
                                style={{
                                  marginBottom: "12px",
                                  padding: "12px",
                                  backgroundColor: "#fff",
                                  border: `2px solid ${
                                    rec.priority === "high"
                                      ? "#ef4444"
                                      : rec.priority === "medium"
                                      ? "#f59e0b"
                                      : "#e0c392"
                                  }`,
                                  borderRadius: "20px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "start",
                                    gap: "8px",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "600",
                                      padding: "2px 6px",
                                      borderRadius: "16px",
                                      backgroundColor:
                                        rec.priority === "high"
                                          ? "#fee2e2"
                                          : rec.priority === "medium"
                                          ? "#fef3c7"
                                          : "#f2ebe3",
                                      color:
                                        rec.priority === "high"
                                          ? "#991b1b"
                                          : rec.priority === "medium"
                                          ? "#92400e"
                                          : "#2c3e50",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {rec.priority}
                                  </span>
                                  <h5
                                    style={{
                                      margin: 0,
                                      fontSize: "13px",
                                      fontWeight: "600",
                                      flex: 1,
                                    }}
                                  >
                                    {rec.title}
                                  </h5>
                                </div>
                                <p
                                  style={{
                                    margin: "0",
                                    fontSize: "12px",
                                    color: "#2c3e50",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  {rec.description}
                                </p>
                              </div>
                            ))}
                        </div>

                        {/* Missing Concepts - Removed in MVP */}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {shouldShowBackToTop && (
          <button
            type="button"
            onClick={handleBackToTop}
            style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "12px 20px",
              borderRadius: "999px",
              border: "2px solid #e0c392",
              background: "linear-gradient(135deg, #f5ead9 0%, #f5e6d3 100%)",
              color: "#2c3e50",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "0 4px 16px rgba(44, 62, 80, 0.15)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              zIndex: 1200,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateX(-50%) translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(44, 62, 80, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(-50%)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(44, 62, 80, 0.15)";
            }}
            aria-label="Back to top"
          >
            <span style={{ fontSize: "16px" }}>↑</span>
            Back to top
          </button>
        )}
      </div>

      {/* Custom Domain Dialog */}
      {showCustomDomainDialog && (
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
            zIndex: 1000,
          }}
          onClick={() => setShowCustomDomainDialog(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "600px",
              width: "90%",
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              🎨 Create Custom Domain
            </h3>
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: "14px",
                color: "#2c3e50",
                lineHeight: "1.6",
              }}
            >
              Create a custom domain for documents that don't fit existing
              categories. You can add specific concepts relevant to your field
              of study.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#2c3e50",
                }}
              >
                Domain Name:
              </label>
              <input
                type="text"
                value={customDomainName}
                onChange={(e) => setCustomDomainName(e.target.value)}
                placeholder="e.g., Music Theory, Architecture, Law"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e0c392",
                  borderRadius: "20px",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2c3e50";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0c392";
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#2c3e50",
                }}
              >
                Key Concepts (optional):
              </label>
              <textarea
                placeholder="Enter key concepts, one per line..."
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "12px",
                  border: "2px solid #e0c392",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  outline: "none",
                  resize: "vertical",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2c3e50";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0c392";
                }}
              />
              <div
                style={{ fontSize: "12px", color: "#2c3e50", marginTop: "6px" }}
              >
                💡 You can add concepts now or after creating the domain
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowCustomDomainDialog(false);
                  setCustomDomainName("");
                }}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#f2ebe3",
                  color: "#2c3e50",
                  border: "1.5px solid #2c3e50",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customDomainName.trim()) {
                    try {
                      // Save custom domain to localStorage
                      saveCustomDomain(customDomainName, customConcepts);

                      // Remember last used custom domain
                      localStorage.setItem(
                        "tomeiq_last_custom_domain",
                        customDomainName
                      );

                      setSelectedDomain("custom");
                      setShowCustomDomainDialog(false);
                      setShowDomainSelector(false);

                      // Success message
                      alert(
                        `✅ Custom domain "${customDomainName}" saved successfully!\n\n` +
                          `It will be available next time you open the app.`
                      );
                    } catch (error) {
                      console.error("Error saving custom domain:", error);
                      alert(
                        "❌ Failed to save custom domain. Please try again."
                      );
                    }
                  }
                }}
                disabled={!customDomainName.trim()}
                style={{
                  padding: "10px 24px",
                  backgroundColor: customDomainName.trim()
                    ? "#10b981"
                    : "#e0c392",
                  color: "#2c3e50",
                  border: "1.5px solid #2c3e50",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: customDomainName.trim() ? "pointer" : "not-allowed",
                }}
              >
                Create Domain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claude API Key Dialog */}
      {showClaudeKeyDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1600,
            padding: "20px",
          }}
          onClick={() => {
            if (!isProcessingClaude) {
              setShowClaudeKeyDialog(false);
              setClaudeApiKey("");
            }
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "24px",
                fontWeight: "700",
                color: "#2c3e50",
              }}
            >
              🤖 Claude AI Integration
            </h2>
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: "14px",
                color: "#2c3e50",
                lineHeight: "1.6",
              }}
            >
              Enter your Claude API key to automatically generate content for
              [CLAUDE] prompts. Your key is stored locally and never sent to our
              servers.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#2c3e50",
                }}
              >
                Claude API Key:
              </label>
              <input
                type="password"
                value={claudeApiKey || getStoredClaudeKey() || ""}
                onChange={(e) => setClaudeApiKey(e.target.value)}
                placeholder="sk-ant-..."
                disabled={isProcessingClaude}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e0c392",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2c3e50";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0c392";
                }}
              />
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "12px",
                  color: "#2c3e50",
                }}
              >
                Get your API key from{" "}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2c3e50", textDecoration: "underline" }}
                >
                  console.anthropic.com
                </a>
              </p>
            </div>

            {isProcessingClaude && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "16px",
                  backgroundColor: "white",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "3px solid #2c3e50",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2c3e50",
                      }}
                    >
                      Generating content with Claude AI...
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#2c3e50",
                        marginTop: "4px",
                      }}
                    >
                      Processing prompt {claudeProgress.current} of{" "}
                      {claudeProgress.total}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  setShowClaudeKeyDialog(false);
                  setClaudeApiKey("");
                }}
                disabled={isProcessingClaude}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f2ebe3",
                  color: "#2c3e50",
                  border: "1.5px solid #2c3e50",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isProcessingClaude ? "not-allowed" : "pointer",
                  opacity: isProcessingClaude ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const apiKey = claudeApiKey || getStoredClaudeKey();

                  if (!apiKey) {
                    alert("Please enter your Claude API key");
                    return;
                  }

                  if (!validateClaudeKey(apiKey)) {
                    alert(
                      "Invalid API key format. Claude keys start with 'sk-ant-'"
                    );
                    return;
                  }

                  if (!selectedTemplateForClaude) return;

                  try {
                    setIsProcessingClaude(true);

                    // Store the API key
                    storeClaudeKey(apiKey);

                    // Use empty analysis if none exists
                    const safeAnalysis = analysis || {
                      principles: [],
                      wordCount: currentChapterText.split(/\s+/).length,
                      sentenceCount: currentChapterText.split(/[.!?]+/).length,
                    };

                    // Generate base template
                    const generatedTemplate =
                      selectedTemplateForClaude.generateTemplate(
                        safeAnalysis,
                        currentChapterText
                      );

                    // Process Claude prompts
                    const processedTemplate = await processClaudePrompts(
                      generatedTemplate,
                      currentChapterText,
                      { apiKey },
                      (current, total) => {
                        setClaudeProgress({ current, total });
                      }
                    );

                    const plainTextContent = processedTemplate.replace(
                      /<[^>]*>/g,
                      ""
                    );

                    setChapterText(plainTextContent);
                    setChapterData((prev) =>
                      prev
                        ? {
                            ...prev,
                            plainText: plainTextContent,
                            editorHtml: processedTemplate,
                            originalPlainText: plainTextContent,
                          }
                        : {
                            html: processedTemplate,
                            plainText: plainTextContent,
                            originalPlainText: plainTextContent,
                            isHybridDocx: true,
                            imageCount: 0,
                            editorHtml: processedTemplate,
                          }
                    );

                    setIsTemplateMode(true);
                    setShowClaudeKeyDialog(false);
                    setClaudeApiKey("");
                    setSelectedTemplateForClaude(null);

                    alert(
                      `✅ ${selectedTemplateForClaude.name} Template Generated with Claude AI!\n\nAI-generated content has been added to [CLAUDE] sections.`
                    );
                  } catch (error) {
                    console.error("Claude processing error:", error);
                    alert(
                      `❌ Error: ${
                        error instanceof Error
                          ? error.message
                          : "Failed to process with Claude AI"
                      }`
                    );
                  } finally {
                    setIsProcessingClaude(false);
                    setClaudeProgress({ current: 0, total: 0 });
                  }
                }}
                disabled={
                  isProcessingClaude || (!claudeApiKey && !getStoredClaudeKey())
                }
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor:
                    isProcessingClaude ||
                    (!claudeApiKey && !getStoredClaudeKey())
                      ? "#e0c392"
                      : "#2c3e50",
                  color: "#2c3e50",
                  border: "1.5px solid #2c3e50",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor:
                    isProcessingClaude ||
                    (!claudeApiKey && !getStoredClaudeKey())
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isProcessingClaude ? "Processing..." : "Generate with AI"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          currentLevel={accessLevel}
          targetLevel={upgradeTarget}
          feature={upgradeFeature}
          onUpgrade={() => {
            // In production, this would redirect to payment page
            alert(`Upgrade to ${upgradeTarget} would happen here!`);
            setShowUpgradePrompt(false);
          }}
          onDismiss={() => setShowUpgradePrompt(false)}
        />
      )}

      {/* Tier Two Preview Modal */}
      {showTierTwoPreview && (
        <TierTwoPreview
          onClose={() => setShowTierTwoPreview(false)}
          onUpgrade={() => {
            setShowTierTwoPreview(false);
            setUpgradeFeature("Full 10-Principle Analysis");
            setUpgradeTarget("premium");
            setShowUpgradePrompt(true);
          }}
        />
      )}
    </div>
  );
};
