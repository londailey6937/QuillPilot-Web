import React, { useEffect, useRef, useState, useCallback } from "react";
import { creamPalette as palette } from "../styles/palette";
import {
  analyzeParagraphSpacing,
  countWords,
  detectPassiveVoice,
} from "@/utils/spacingInsights";
import { SensoryDetailAnalyzer } from "@/utils/sensoryDetailAnalyzer";
import { Character, CharacterMapping } from "../types";
import { AIWritingAssistant } from "./AIWritingAssistant";
import { DialogueEnhancer } from "./DialogueEnhancer";
import { ReadabilityAnalyzer } from "./ReadabilityAnalyzer";
import { ClicheDetector } from "./ClicheDetector";
import { BeatSheetGenerator } from "./BeatSheetGenerator";
import { POVChecker } from "./POVChecker";
import { EmotionTracker } from "./EmotionTracker";
import { MotifTracker } from "./MotifTracker";
import { PoetryMeterAnalyzer } from "./PoetryMeterAnalyzer";
import { NonFictionOutlineGenerator } from "./NonFictionOutlineGenerator";
import { AcademicCitationManager } from "./AcademicCitationManager";
import { CharacterNameGenerator } from "./CharacterNameGenerator";
import { WorldBuildingNotebook } from "./WorldBuildingNotebook";
import { ResearchNotesPanel } from "./ResearchNotesPanel";
import { ImageMoodBoard } from "./ImageMoodBoard";
import { VersionHistory } from "./VersionHistory";
import { CommentAnnotation } from "./CommentAnnotation";

interface CustomEditorProps {
  content: string;
  onUpdate?: (content: { html: string; text: string }) => void;
  onSave?: () => void;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showSpacingIndicators?: boolean;
  showVisualSuggestions?: boolean;
  concepts?: string[];
  onConceptClick?: (concept: string) => void;
  isFreeMode?: boolean;
  viewMode?: "analysis" | "writer";
  leftMargin?: number;
  rightMargin?: number;
  firstLineIndent?: number;
  // Ruler and margin callbacks
  showRuler?: boolean;
  onLeftMarginChange?: (value: number) => void;
  onRightMarginChange?: (value: number) => void;
  onFirstLineIndentChange?: (value: number) => void;
  // Tier 3 - Character management
  characters?: Character[];
  onCharacterLink?: (textOccurrence: string, characterId: string) => void;
  onOpenCharacterManager?: () => void;
  isProfessionalTier?: boolean;
  onLayoutChange?: (layout: { width: number; left: number }) => void;
  // Header/Footer settings callback for export
  onHeaderFooterChange?: (settings: {
    headerText: string;
    footerText: string;
    showPageNumbers: boolean;
    pageNumberPosition: "header" | "footer";
    headerAlign: "left" | "center" | "right" | "justify";
    footerAlign: "left" | "center" | "right" | "justify";
    facingPages: boolean;
  }) => void;
}

const INCH_IN_PX = 96;
const PAGE_WIDTH_PX = INCH_IN_PX * 8;
const PAGE_HEIGHT_PX = INCH_IN_PX * 11; // 11 inches for US Letter
const RULER_BACKGROUND_LEFT_OVERHANG = 0;
const RULER_BACKGROUND_RIGHT_OVERHANG = 0;

interface TextNodeMap {
  node: Text;
  start: number;
  end: number;
}

type SpacingTone = "compact" | "balanced" | "extended";

interface SpacingIndicator {
  index: number;
  wordCount: number;
  tone: SpacingTone;
  label: string;
  hasPassive?: boolean;
  passiveCount?: number;
}

interface VisualIndicator {
  visualType?: string;
  sensoryType?: string;
  reason: string;
  priority?: "high" | "medium" | "low";
  context?: string;
}

interface VisualAnalysisEntry {
  index: number;
  suggestions: VisualIndicator[];
}

interface AnalysisData {
  spacing: SpacingIndicator[];
  visuals: VisualAnalysisEntry[];
}

interface TextMatch {
  start: number;
  end: number;
}

const buildSnippet = (raw: string) => {
  const normalized = (raw || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const words = normalized.split(" ").filter(Boolean);
  const previewWords = words.slice(0, 35);
  const preview = previewWords.join(" ");
  return words.length > previewWords.length ? `${preview}…` : preview;
};

const extractTextWithMap = (root: Node) => {
  let text = "";
  const map: TextNodeMap[] = [];

  const traverse = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const content = node.textContent || "";
      if (content.length > 0) {
        map.push({
          node: node as Text,
          start: text.length,
          end: text.length + content.length,
        });
        text += content;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = (node as Element).tagName;
      const isBlock = [
        "P",
        "DIV",
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "LI",
        "BR",
        "UL",
        "OL",
        "BLOCKQUOTE",
        "PRE",
        "TR",
      ].includes(tagName);

      if (tagName === "BR") {
        text += "\n";
        return;
      }

      if (isBlock && text.length > 0 && !text.endsWith("\n")) {
        text += "\n";
      }

      node.childNodes.forEach(traverse);

      if (isBlock && text.length > 0 && !text.endsWith("\n")) {
        text += "\n";
      }
    }
  };

  traverse(root);
  return { text, map };
};

export const CustomEditor: React.FC<CustomEditorProps> = ({
  content,
  onUpdate,
  onSave,
  isEditable = true,
  className,
  style,
  showSpacingIndicators = true,
  showVisualSuggestions = true,
  concepts = [],
  onConceptClick,
  isFreeMode = false,
  viewMode = "analysis",
  leftMargin = 48,
  rightMargin = 48,
  firstLineIndent = 32,
  showRuler = false,
  onLeftMarginChange,
  onRightMarginChange,
  onFirstLineIndentChange,
  characters = [],
  onCharacterLink,
  onOpenCharacterManager,
  isProfessionalTier = false,
  onLayoutChange,
  onHeaderFooterChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollShellRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const rulerFrameRef = useRef<HTMLDivElement>(null);
  // Header/footer preview inputs removed - ref no longer needed
  const [analysis, setAnalysis] = useState<AnalysisData>({
    spacing: [],
    visuals: [],
  });
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Undo/Redo history
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);
  const textMapRef = useRef<{ fullText: string; map: TextNodeMap[] } | null>(
    null
  );
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New feature states
  const [blockType, setBlockType] = useState("p");
  const [fontFamily, setFontFamily] = useState("default");
  const [fontSize, setFontSize] = useState("16px");
  const [showStyleLabels, setShowStyleLabels] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);

  // Bookmarks and Cross-References
  interface Bookmark {
    id: string;
    name: string;
    selectedText: string;
    color: string;
    timestamp: number;
  }
  interface CrossReference {
    id: string;
    name: string;
    sourceText: string;
    targetBookmarkId: string;
    note: string;
    timestamp: number;
  }
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([]);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  // Advanced Tools state
  type ActiveTool =
    | "ai-assistant"
    | "dialogue"
    | "readability"
    | "cliche"
    | "beats"
    | "pov"
    | "emotion"
    | "motif"
    | "poetry-meter"
    | "nonfiction-outline"
    | "citation-manager"
    | "name-generator"
    | "world-building"
    | "research-notes"
    | "mood-board"
    | "version-history"
    | "comments"
    | null;
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [showCrossRefModal, setShowCrossRefModal] = useState(false);
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState("");
  const [newBookmarkColor, setNewBookmarkColor] = useState("#fbbf24");
  const [newCrossRefName, setNewCrossRefName] = useState("");
  const [newCrossRefTarget, setNewCrossRefTarget] = useState("");
  const [newCrossRefNote, setNewCrossRefNote] = useState("");
  const [selectedTextForBookmark, setSelectedTextForBookmark] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(false);
  const [sprintMode, setSprintMode] = useState(false);
  const [sprintDuration, setSprintDuration] = useState(15); // minutes
  const [sprintTimeRemaining, setSprintTimeRemaining] = useState(0);
  const [sprintStartWords, setSprintStartWords] = useState(0);
  const [textAlign, setTextAlign] = useState("left");
  const [findMatches, setFindMatches] = useState<TextMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [statistics, setStatistics] = useState({
    words: 0,
    characters: 0,
    paragraphs: 0,
    readingTime: 0,
    readingLevel: 0,
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [showCharacterPopover, setShowCharacterPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, right: 0 });
  const characterPopoverRef = useRef<HTMLDivElement>(null);
  const characterButtonRef = useRef<HTMLButtonElement>(null);
  const [rulerAlignedLeft, setRulerAlignedLeft] = useState<number | null>(null);
  const pageRailRef = useRef<HTMLDivElement>(null);
  const [footerAlignmentOffset, setFooterAlignmentOffset] = useState(0);

  // Pagination state
  const [pageCount, setPageCount] = useState(1);
  const [pageSnippets, setPageSnippets] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(0);
  const showThumbnailRail = viewMode === "writer" && !isFreeMode;
  const activePageRef = useRef(0);
  const selectionSyncLockRef = useRef(false);

  // Ruler dragging state
  const [rulerDragging, setRulerDragging] = useState<
    "left" | "right" | "indent" | null
  >(null);
  const rulerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    if (!showRuler) {
      setRulerAlignedLeft(null);
      return;
    }

    const computeAlignment = () => {
      if (!rulerContainerRef.current || !wrapperRef.current) {
        setRulerAlignedLeft(null);
        return;
      }

      const rulerRect = rulerContainerRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      let paddingLeft = 0;

      if (typeof window !== "undefined") {
        const styles = window.getComputedStyle(wrapperRef.current);
        paddingLeft = parseFloat(styles.paddingLeft || "0") || 0;
      }

      const relativeLeft = rulerRect.left - wrapperRect.left - paddingLeft;

      if (!Number.isFinite(relativeLeft)) {
        setRulerAlignedLeft(null);
        return;
      }

      setRulerAlignedLeft(relativeLeft);
    };

    computeAlignment();

    window.addEventListener("resize", computeAlignment);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => computeAlignment())
        : null;

    if (resizeObserver && rulerContainerRef.current) {
      resizeObserver.observe(rulerContainerRef.current);
    }
    if (resizeObserver && wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      window.removeEventListener("resize", computeAlignment);
      resizeObserver?.disconnect();
    };
  }, [showRuler]);

  // Ruler alignment is now handled by CSS flexbox centering - no dynamic shift needed
  const alignRulerToPage = useCallback(() => {
    // No-op: ruler and editor are both centered by the parent flex container
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    alignRulerToPage();

    window.addEventListener("resize", alignRulerToPage);

    // Debounce the ResizeObserver to prevent rapid recalculations during paste/input
    let debounceTimer: NodeJS.Timeout;
    const debouncedAlign = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => alignRulerToPage(), 150);
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(debouncedAlign)
        : null;

    const observerTargets = [
      scrollShellRef.current,
      wrapperRef.current,
      pagesContainerRef.current,
      editorRef.current,
    ].filter((el): el is HTMLDivElement => Boolean(el));

    observerTargets.forEach((target) => resizeObserver?.observe(target));

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener("resize", alignRulerToPage);
      resizeObserver?.disconnect();
    };
  }, [alignRulerToPage]);

  useEffect(() => {
    alignRulerToPage();
  }, [
    alignRulerToPage,
    pageCount,
    showThumbnailRail,
    showFindReplace,
    viewMode,
  ]);

  const updatePageSnippets = useCallback((pages: number) => {
    const safePages = Math.max(1, pages);
    const editor = editorRef.current;

    if (!editor) {
      setPageSnippets(Array.from({ length: safePages }, () => ""));
      return;
    }

    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    const scrollOffset = wrapperRef.current?.scrollTop ?? 0;
    const blocks = Array.from(
      editor.querySelectorAll<HTMLElement>(
        "p, div, h1, h2, h3, h4, h5, h6, blockquote, ul, ol, li, pre"
      )
    ).filter((block) => block.innerText && block.innerText.trim().length);

    const buckets = Array.from({ length: safePages }, () => "");

    if (blocks.length === 0) {
      buckets[0] = editor.innerText || "";
    } else {
      blocks.forEach((block) => {
        const text = block.innerText || "";
        if (!text.trim()) return;

        const rect = block.getBoundingClientRect();
        const relativeMid =
          rect.top - (wrapperRect?.top ?? 0) + scrollOffset + rect.height / 2;

        const bucketIndex = Math.min(
          Math.max(Math.floor(relativeMid / PAGE_HEIGHT_PX), 0),
          safePages - 1
        );

        buckets[bucketIndex] += `${text}\n`;
      });
    }

    setPageSnippets(buckets.map((chunk) => buildSnippet(chunk)));
  }, []);

  const recomputePagination = useCallback(() => {
    if (!editorRef.current) return;

    const contentHeight = editorRef.current.scrollHeight;
    const pages = Math.max(1, Math.ceil(contentHeight / PAGE_HEIGHT_PX));
    setPageCount(pages);

    updatePageSnippets(pages);
  }, [updatePageSnippets]);

  const jumpToPage = useCallback(
    (pageIndex: number, options?: { suppressSelectionSync?: boolean }) => {
      if (pageCount <= 0) {
        setActivePage(0);
        return;
      }

      const target = Math.min(Math.max(pageIndex, 0), pageCount - 1);

      if (options?.suppressSelectionSync) {
        selectionSyncLockRef.current = true;
        window.setTimeout(() => {
          selectionSyncLockRef.current = false;
        }, 200);
      }

      // scrollShellRef is the actual scrollable container (wrapperRef has overflow:hidden)
      if (scrollShellRef.current) {
        scrollShellRef.current.scrollTo({
          top: target * PAGE_HEIGHT_PX,
          behavior: "smooth",
        });
      }

      setActivePage(target);
    },
    [pageCount]
  );

  useEffect(() => {
    setActivePage((prev) =>
      Math.min(Math.max(prev, 0), Math.max(0, pageCount - 1))
    );
  }, [pageCount]);

  useEffect(() => {
    if (!showThumbnailRail) {
      setFooterAlignmentOffset(0);
      return;
    }

    const computeOffset = () => {
      if (!pageRailRef.current || !wrapperRef.current) {
        setFooterAlignmentOffset(0);
        return;
      }

      const railRect = pageRailRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const diff = Math.round(wrapperRect.bottom - railRect.bottom);
      setFooterAlignmentOffset(diff > 0 ? diff : 0);
    };

    computeOffset();
    window.addEventListener("resize", computeOffset);

    const observers: ResizeObserver[] = [];
    if (typeof ResizeObserver !== "undefined") {
      const attachObserver = (element: Element | null) => {
        if (!element) return;
        const observer = new ResizeObserver(() => computeOffset());
        observer.observe(element);
        observers.push(observer);
      };

      attachObserver(pageRailRef.current);
      attachObserver(wrapperRef.current);
    }

    return () => {
      window.removeEventListener("resize", computeOffset);
      observers.forEach((observer) => observer.disconnect());
    };
  }, [showThumbnailRail, pageCount]);

  // Format Painter state
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<{
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
  } | null>(null);

  // Styles Panel state
  const [showStylesPanel, setShowStylesPanel] = useState(false);
  const [documentStyles, setDocumentStyles] = useState({
    paragraph: {
      firstLineIndent: 32,
      lineHeight: 1.5,
      marginBottom: 0.5,
      textAlign: "left" as "left" | "center" | "right" | "justify",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold" as "normal" | "bold",
      textAlign: "center" as "left" | "center" | "right" | "justify",
      marginBottom: 0.5,
    },
    heading1: {
      fontSize: 28,
      fontWeight: "bold" as "normal" | "bold",
      textAlign: "left" as "left" | "center",
      marginTop: 1.5,
      marginBottom: 0.8,
    },
    heading2: {
      fontSize: 22,
      fontWeight: "bold" as "normal" | "bold",
      textAlign: "left" as "left" | "center",
      marginTop: 1.2,
      marginBottom: 0.6,
    },
    heading3: {
      fontSize: 18,
      fontWeight: "bold" as "normal" | "bold",
      textAlign: "left" as "left" | "center",
      marginTop: 1,
      marginBottom: 0.5,
    },
    blockquote: {
      fontStyle: "italic" as "normal" | "italic",
      marginLeft: 40,
      borderLeftWidth: 4,
      borderLeftColor: "#e0c392",
    },
  });

  // Active style template tracking
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Header/Footer state - preview panels removed, keeping export functionality
  const [showHeaderFooter] = useState(false);
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [pageNumberPosition, setPageNumberPosition] = useState<
    "header" | "footer"
  >("footer");
  const [headerAlign, setHeaderAlign] = useState<
    "left" | "center" | "right" | "justify"
  >("center");
  const [footerAlign, setFooterAlign] = useState<
    "left" | "center" | "right" | "justify"
  >("center");
  // Facing pages: alternate left/right positioning for page numbers on odd/even pages
  const [facingPages, setFacingPages] = useState(false);

  // Notify parent of header/footer changes for export
  useEffect(() => {
    if (onHeaderFooterChange) {
      onHeaderFooterChange({
        headerText,
        footerText,
        showPageNumbers,
        pageNumberPosition,
        headerAlign,
        footerAlign,
        facingPages,
      });
    }
  }, [
    headerText,
    footerText,
    showPageNumbers,
    pageNumberPosition,
    headerAlign,
    footerAlign,
    facingPages,
    onHeaderFooterChange,
  ]);

  const toolbarDividerStyle = {
    width: "1px",
    height: "28px",
    backgroundColor: "#e0c392",
    opacity: 0.7,
    flexShrink: 0,
  } as const;

  // Character linking handler
  const linkSelectedTextToCharacter = useCallback(() => {
    if (!selectedCharacterId || !onCharacterLink) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      alert("Please select text to link to a character");
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      alert("Please select text to link to a character");
      return;
    }

    onCharacterLink(selectedText, selectedCharacterId);

    // Visual feedback
    alert(`Linked "${selectedText}" to character`);
    setShowCharacterPopover(false);
  }, [selectedCharacterId, onCharacterLink]);

  // Close character popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        characterPopoverRef.current &&
        !characterPopoverRef.current.contains(event.target as Node)
      ) {
        setShowCharacterPopover(false);
      }
    };

    if (showCharacterPopover) {
      // Use setTimeout to avoid the click that opened the popover from immediately closing it
      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("click", handleClickOutside);
      };
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showCharacterPopover]);

  // Sync firstLineIndent prop with documentStyles AND apply directly to DOM
  useEffect(() => {
    console.log(
      "[CustomEditor] firstLineIndent prop changed to:",
      firstLineIndent
    );

    // Update the documentStyles state
    setDocumentStyles((prev) => ({
      ...prev,
      paragraph: {
        ...prev.paragraph,
        firstLineIndent: firstLineIndent,
      },
    }));

    // Also apply directly to DOM for immediate visual feedback
    const applyIndentToDOM = () => {
      if (editorRef.current) {
        console.log("[CustomEditor] Applying indent to DOM:", firstLineIndent);
        // Update CSS variable
        editorRef.current.style.setProperty(
          "--first-line-indent",
          `${firstLineIndent}px`
        );
        // Also directly update all paragraphs for immediate effect
        // Use setProperty with 'important' to override CSS !important rules
        const paragraphs = editorRef.current.querySelectorAll(
          "p:not(.screenplay-block):not(.title-content):not(.book-title):not(.subtitle):not(.chapter-heading):not(.image-paragraph)"
        );
        console.log("[CustomEditor] Found paragraphs:", paragraphs.length);
        paragraphs.forEach((p) => {
          (p as HTMLElement).style.setProperty(
            "text-indent",
            `${firstLineIndent}px`,
            "important"
          );
        });
      }
    };

    applyIndentToDOM();
    // Also try after a brief delay in case ref isn't ready
    const timer = setTimeout(applyIndentToDOM, 0);
    return () => clearTimeout(timer);
  }, [firstLineIndent]);

  // Gap between pages in pixels
  const PAGE_GAP = 24;

  // Calculate page count based on content height (accounting for page gaps)
  useEffect(() => {
    recomputePagination();

    // Recalculate on input and resize
    const resizeObserver = new ResizeObserver(() => recomputePagination());
    if (editorRef.current) {
      resizeObserver.observe(editorRef.current);
    }

    // Also recalculate on mutation (content changes)
    const mutationObserver = new MutationObserver(() => recomputePagination());
    if (editorRef.current) {
      mutationObserver.observe(editorRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [recomputePagination]);

  // Analyze content for spacing and dual-coding
  const analyzeContent = useCallback((text: string) => {
    if (!editorRef.current) return;

    // Get paragraphs from the actual DOM to match rendering
    const domParagraphs = Array.from(
      editorRef.current.querySelectorAll("p, div")
    );
    // Map to {text, domIndex} to preserve original DOM indices after filtering
    const paragraphsWithIndices = domParagraphs
      .map((p, domIndex) => ({
        text: (p as HTMLElement).innerText || "",
        domIndex,
      }))
      .filter((p) => p.text.trim());

    const spacingData: AnalysisData["spacing"] = [];
    const visualsData: AnalysisData["visuals"] = [];

    // For very large documents (>2000 paragraphs / ~800 pages), sample analysis
    // For medium-large documents (500-2000 paragraphs), analyze all but limit dual-coding
    const isVeryLarge = paragraphsWithIndices.length > 2000;
    const isLarge = paragraphsWithIndices.length > 500;

    if (isVeryLarge) {
      // Sample every 4th paragraph for extremely large documents
      paragraphsWithIndices.forEach(({ text: para, domIndex }, arrayIndex) => {
        if (arrayIndex % 4 === 0) {
          const wordCount = countWords(para);
          // Skip paragraphs with fewer than 5 words
          if (wordCount >= 5) {
            const spacingInfo = analyzeParagraphSpacing(wordCount);
            const passiveInfo = detectPassiveVoice(para);
            spacingData.push({
              index: domIndex, // Use original DOM index
              wordCount,
              tone: spacingInfo.tone,
              label: spacingInfo.shortLabel,
              hasPassive: passiveInfo.hasPassive,
              passiveCount: passiveInfo.count,
            });
          }

          // Also analyze sensory details for sampled paragraphs with 50+ words
          if (wordCount >= 50) {
            const suggestions = SensoryDetailAnalyzer.analyzeParagraph(
              para,
              domIndex // Use original DOM index
            );
            if (suggestions.length > 0) {
              visualsData.push({ index: domIndex, suggestions });
            }
          }
        }
      });
    } else {
      // Normal or large documents: analyze all spacing, limit dual-coding for large docs
      paragraphsWithIndices.forEach(({ text: para, domIndex }) => {
        const wordCount = countWords(para);

        // Skip paragraphs with fewer than 5 words
        if (wordCount >= 5) {
          const spacingInfo = analyzeParagraphSpacing(wordCount);
          const passiveInfo = detectPassiveVoice(para);
          spacingData.push({
            index: domIndex, // Use original DOM index
            wordCount,
            tone: spacingInfo.tone,
            label: spacingInfo.shortLabel,
            hasPassive: passiveInfo.hasPassive,
            passiveCount: passiveInfo.count,
          });
        }

        // For large docs, analyze sensory details for paragraphs with 50+ words
        // For normal docs, analyze all paragraphs with >10 chars
        const shouldAnalyzeDualCoding = isLarge
          ? wordCount >= 50
          : para.length >= 10;

        if (shouldAnalyzeDualCoding) {
          const suggestions = SensoryDetailAnalyzer.analyzeParagraph(
            para,
            domIndex // Use original DOM index
          );
          if (suggestions.length > 0) {
            visualsData.push({ index: domIndex, suggestions });
          }
        }
      });
    }

    setAnalysis({ spacing: spacingData, visuals: visualsData });

    // Calculate statistics (lightweight for all sizes)
    // Use regex to match ChapterCheckerV2 logic and handle smart quotes
    const words = (text.match(/[A-Za-z0-9'’]+/g) || []).length;
    const characters = text.length;
    const readingTime = Math.ceil(words / 200); // 200 words per minute

    // Skip complex calculations for very large documents (>2000 paragraphs)
    let readingLevel = 0;
    if (!isVeryLarge) {
      const sentences = text
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0).length;
      const syllables = text.split(/\s+/).reduce((count, word) => {
        return count + Math.max(1, word.match(/[aeiouy]{1,2}/gi)?.length || 1);
      }, 0);
      readingLevel =
        sentences > 0 && words > 0
          ? 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
          : 0;
    }

    setStatistics({
      words,
      characters,
      paragraphs: paragraphsWithIndices.length,
      readingTime,
      readingLevel: Math.max(0, Math.round(readingLevel * 10) / 10),
    });
  }, []);

  // Save to history
  const saveToHistory = useCallback((html: string) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    // Remove any history after current index
    historyRef.current = historyRef.current.slice(
      0,
      historyIndexRef.current + 1
    );

    // Add new state
    historyRef.current.push(html);
    historyIndexRef.current = historyRef.current.length - 1;

    // Limit history to 50 states
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }

    // Update button states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText;

    // Debounce save to history to prevent performance issues
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToHistory(html);
    }, 500);

    // Debounce updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      onUpdate?.({ html, text });
      analyzeContent(text);
    }, 300);
    recomputePagination();
  }, [onUpdate, saveToHistory, analyzeContent, recomputePagination]);

  // Initialize content (only on mount)
  useEffect(() => {
    if (editorRef.current && content) {
      const isHtml = /<[^>]+>/.test(content);

      // Show loading state initially
      setIsLoading(true);

      // Use requestAnimationFrame to allow UI to update (show spinner)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!editorRef.current) return;

          if (isHtml) {
            editorRef.current.innerHTML = content;
            console.log(
              "[CustomEditor] Set HTML content, first 500 chars:",
              content.substring(0, 500)
            );
            console.log(
              "[CustomEditor] Editor DOM structure:",
              editorRef.current.firstChild
            );
          } else {
            editorRef.current.innerHTML = content
              .split("\n\n")
              .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
              .join("");
          }

          recomputePagination();

          // Initialize history with initial content
          const html = editorRef.current.innerHTML;
          historyRef.current = [html];
          historyIndexRef.current = 0;
          setCanUndo(false);
          setCanRedo(false);

          // Defer analysis to avoid blocking
          setTimeout(() => {
            if (!editorRef.current) return;
            const text = editorRef.current.innerText;
            analyzeContent(text);
            setIsLoading(false);
          }, 100);
        });
      });
    } else if (editorRef.current && !content) {
      // Initialize empty editor with a paragraph
      editorRef.current.innerHTML = `<p><br></p>`;
      recomputePagination();

      // Place cursor in the paragraph
      const range = document.createRange();
      const sel = window.getSelection();
      const firstP = editorRef.current.querySelector("p");
      if (firstP) {
        range.setStart(firstP, 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount - content is captured from closure

  useEffect(() => {
    if (!onLayoutChange) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const notifyLayout = () => {
      if (!editorRef.current) {
        return;
      }
      const rect = editorRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        onLayoutChange({ width: rect.width, left: rect.left });
      }
    };

    notifyLayout();

    if (typeof ResizeObserver !== "undefined" && editorRef.current) {
      const observer = new ResizeObserver(() => notifyLayout());
      observer.observe(editorRef.current);
      return () => observer.disconnect();
    }

    const handleResize = () => notifyLayout();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onLayoutChange]);

  // Apply concept underlining
  useEffect(() => {
    if (!editorRef.current) return;

    const applyConceptUnderlines = () => {
      if (!editorRef.current) return;

      // Remove existing wrappers so repeated passes don't nest spans
      const existingUnderlines =
        editorRef.current.querySelectorAll(".concept-underline");
      existingUnderlines.forEach((span) => {
        const fragment = document.createDocumentFragment();
        while (span.firstChild) {
          fragment.appendChild(span.firstChild);
        }
        span.replaceWith(fragment);
      });

      if (concepts.length === 0) {
        return;
      }

      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || "";
        if (!text.trim()) return;

        const matches: {
          start: number;
          end: number;
          concept: string;
          canonicalConcept: string;
        }[] = [];

        // Sort concepts by length (longest first) to avoid partial matches
        const sortedConcepts = [...concepts].sort(
          (a, b) => b.length - a.length
        );

        sortedConcepts.forEach((concept) => {
          const escapedConcept = concept.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`\\b(${escapedConcept})\\b`, "gi");

          let match;
          while ((match = regex.exec(text)) !== null) {
            const start = match.index;
            const end = start + match[0].length;

            // Check for overlap with existing matches
            const isOverlapping = matches.some(
              (m) => start < m.end && end > m.start
            );

            if (!isOverlapping) {
              matches.push({
                start,
                end,
                concept: match[0], // The actual text in the document
                canonicalConcept: concept, // The concept ID/name
              });
            }
          }
        });

        if (matches.length === 0) return;

        // Sort matches by position
        matches.sort((a, b) => a.start - b.start);

        let newHtml = "";
        let lastIndex = 0;

        const escapeHtml = (str: string) => {
          return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        };

        matches.forEach((m) => {
          // Append text before match (escaped)
          newHtml += escapeHtml(text.substring(lastIndex, m.start));

          // Append replacement
          newHtml += `<span class="concept-underline" data-concept="${escapeHtml(
            m.canonicalConcept
          )}">${escapeHtml(m.concept)}</span>`;

          lastIndex = m.end;
        });

        // Append remaining text (escaped)
        newHtml += escapeHtml(text.substring(lastIndex));

        if (textNode.parentElement) {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = newHtml;
          const fragment = document.createDocumentFragment();
          while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
          }
          textNode.parentElement.replaceChild(fragment, textNode);
        }
      });

      // Add click handlers to underlined concepts
      const underlinedElements =
        editorRef.current.querySelectorAll(".concept-underline");
      underlinedElements.forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          const conceptName = (e.target as HTMLElement).getAttribute(
            "data-concept"
          );
          if (conceptName && onConceptClick) {
            onConceptClick(conceptName);
          }
        });
      });
    };

    // Delay to ensure content is loaded
    const timer = setTimeout(applyConceptUnderlines, 100);
    return () => clearTimeout(timer);
  }, [concepts, content, onConceptClick]);

  // Undo function
  const performUndo = useCallback(() => {
    if (!editorRef.current || historyIndexRef.current <= 0) return;

    // Save current scroll position
    const scrollTop = wrapperRef.current?.scrollTop || 0;

    historyIndexRef.current--;
    const html = historyRef.current[historyIndexRef.current];

    isUndoRedoRef.current = true;
    editorRef.current.innerHTML = html;

    const text = editorRef.current.innerText;
    onUpdate?.({ html, text });
    analyzeContent(text);
    recomputePagination();

    // Restore scroll position after DOM update
    requestAnimationFrame(() => {
      if (wrapperRef.current) {
        wrapperRef.current.scrollTop = scrollTop;
      }
    });

    // Update button states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [onUpdate, analyzeContent, recomputePagination]);

  // Redo function
  const performRedo = useCallback(() => {
    if (
      !editorRef.current ||
      historyIndexRef.current >= historyRef.current.length - 1
    )
      return;

    // Save current scroll position
    const scrollTop = wrapperRef.current?.scrollTop || 0;

    historyIndexRef.current++;
    const html = historyRef.current[historyIndexRef.current];

    isUndoRedoRef.current = true;
    editorRef.current.innerHTML = html;

    const text = editorRef.current.innerText;
    onUpdate?.({ html, text });
    analyzeContent(text);
    recomputePagination();

    // Restore scroll position after DOM update
    requestAnimationFrame(() => {
      if (wrapperRef.current) {
        wrapperRef.current.scrollTop = scrollTop;
      }
    });

    // Update button states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [onUpdate, analyzeContent, recomputePagination]);

  // Format text
  const formatText = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      updateFormatState();
      editorRef.current?.focus();
      // Trigger input to save to history
      setTimeout(() => handleInput(), 0);
    },
    [handleInput]
  );

  // Change block type (heading, paragraph, etc.)
  const changeBlockType = useCallback(
    (tag: string) => {
      // Screenplay elements use custom tags
      const screenplayElements = [
        "scene-heading",
        "action",
        "character",
        "dialogue",
        "parenthetical",
        "transition",
      ];

      // Custom paragraph styles (not native HTML tags)
      const customParagraphStyles = [
        "title",
        "subtitle",
        "book-title",
        "chapter-heading",
        "part-title",
        "epigraph",
        "dedication",
        "acknowledgments",
        "copyright",
        "verse",
        "abstract",
        "keywords",
        "bibliography",
        "references",
        "appendix",
        "author-info",
        "date-info",
        "address",
        "salutation",
        "closing",
        "signature",
        "sidebar",
        "callout",
        "lead",
      ];

      // Special block elements (TOC, Index, Figure)
      const specialBlockElements = ["toc", "index", "figure"];

      if (specialBlockElements.includes(tag)) {
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;

        // Get selected text content (for TOC entries or figure captions)
        const selectedText = selection.toString().trim();

        // Get the current paragraph/block element
        let currentBlock = selection.anchorNode;
        while (
          currentBlock &&
          currentBlock.nodeName !== "P" &&
          currentBlock !== editorRef.current
        ) {
          currentBlock = currentBlock.parentNode;
        }

        if (tag === "toc") {
          // For TOC: if text is selected, treat it as a heading that should be in TOC
          // If no text selected, insert a TOC placeholder
          if (selectedText) {
            // Apply h1 style to selected text (making it a TOC entry)
            if (currentBlock && currentBlock.nodeName === "P") {
              const p = currentBlock as HTMLElement;
              p.className = "toc-entry heading-1";
              p.setAttribute("data-toc-level", "1");
            } else {
              const escapedText = selectedText
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
              const blockHtml = `<p class="toc-entry heading-1" data-toc-level="1">${escapedText}</p>`;
              document.execCommand("insertHTML", false, blockHtml);
            }
          } else {
            // No text selected - insert TOC placeholder block
            const tocHtml = `<div class="toc-placeholder" contenteditable="false" style="background: #fef5e7; border: 2px dashed #e0c392; border-radius: 8px; padding: 1em; margin: 1em 0; text-align: center; color: #6b7280;">
              <strong style="color: #2c3e50;">📋 Table of Contents</strong><br/>
              <span style="font-size: 0.9em;">TOC will be generated from headings on export</span>
            </div><p><br></p>`;
            document.execCommand("insertHTML", false, tocHtml);
          }
        } else if (tag === "index") {
          const indexHtml = `<div class="index-placeholder" contenteditable="false" style="background: #f5ead9; border: 2px dashed #e0c392; border-radius: 8px; padding: 1em; margin: 1em 0; text-align: center; color: #6b7280;">
            <strong style="color: #2c3e50;">📑 Index</strong><br/>
            <span style="font-size: 0.9em;">Index will be generated on export</span>
          </div><p><br></p>`;
          document.execCommand("insertHTML", false, indexHtml);
        } else if (tag === "figure") {
          const caption = selectedText || "Figure caption";
          const figureHtml = `<figure style="margin: 1.5em 0; text-align: center;">
            <div style="background: #f0f0f0; padding: 2em; border: 1px dashed #ccc; color: #666;">[Image placeholder]</div>
            <figcaption style="font-style: italic; color: #666; margin-top: 0.5em;">${caption}</figcaption>
          </figure><p><br></p>`;
          document.execCommand("insertHTML", false, figureHtml);
        }
        setTimeout(() => handleInput(), 0);
        setBlockType(tag);
        return;
      }

      if (screenplayElements.includes(tag)) {
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;

        // Get the current paragraph/block element
        let currentBlock = selection.anchorNode;
        while (
          currentBlock &&
          currentBlock.nodeName !== "P" &&
          currentBlock !== editorRef.current
        ) {
          currentBlock = currentBlock.parentNode;
        }

        if (currentBlock && currentBlock.nodeName === "P") {
          // Convert existing paragraph to screenplay block
          const p = currentBlock as HTMLElement;
          const text = p.textContent || "";
          p.className = `screenplay-block ${tag}`;
          p.setAttribute("data-block", tag);
        } else {
          // Create new screenplay block if no paragraph found
          const selectedText = selection.toString() || "TYPE HERE";
          const escapedText = selectedText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

          const blockHtml = `<p class="screenplay-block ${tag}" data-block="${tag}">${escapedText}</p>`;
          document.execCommand("insertHTML", false, blockHtml);
        }
        setTimeout(() => handleInput(), 0);
      } else if (customParagraphStyles.includes(tag)) {
        // Handle custom paragraph styles (title, subtitle)
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;

        // Get the current paragraph/block element
        let currentBlock = selection.anchorNode;
        while (
          currentBlock &&
          currentBlock.nodeName !== "P" &&
          currentBlock !== editorRef.current
        ) {
          currentBlock = currentBlock.parentNode;
        }

        if (currentBlock && currentBlock.nodeName === "P") {
          // Convert existing paragraph to styled paragraph
          const p = currentBlock as HTMLElement;

          // Map tags to their CSS classes
          const styleMap: { [key: string]: string } = {
            title: "title-content",
            "book-title": "title-content book-title",
            subtitle: "title-content subtitle",
            "chapter-heading": "chapter-heading",
            "part-title": "part-title",
            epigraph: "epigraph",
            dedication: "dedication",
            acknowledgments: "acknowledgments",
            copyright: "copyright",
            verse: "verse",
            abstract: "abstract",
            keywords: "keywords",
            bibliography: "bibliography",
            references: "references",
            appendix: "appendix",
            "author-info": "author-info",
            "date-info": "date-info",
            address: "address",
            salutation: "salutation",
            closing: "closing",
            signature: "signature",
            sidebar: "sidebar",
            callout: "callout",
            lead: "lead",
          };

          p.className = styleMap[tag] || "";
          p.removeAttribute("data-block");
          // Trigger handleInput to update stats panel
          setTimeout(() => handleInput(), 0);
        } else {
          // Create new styled paragraph
          const placeholders: { [key: string]: string } = {
            title: "Section Title",
            "book-title": "Book Title",
            subtitle: "Subtitle",
            "chapter-heading": "Chapter 1",
            "part-title": "Part I",
            epigraph: "Epigraph text...",
            dedication: "For...",
            acknowledgments: "I would like to thank...",
            copyright: "© 2025",
            verse: "Poetry line...",
            abstract: "Abstract...",
            keywords: "Keywords: ",
            bibliography: "Bibliography entry...",
            references: "Reference...",
            appendix: "Appendix content...",
            "author-info": "Author Name",
            "date-info": "Date",
            address: "Address...",
            salutation: "Dear...",
            closing: "Sincerely,",
            signature: "Name",
            sidebar: "Sidebar content...",
            callout: "Important note...",
            lead: "Lead paragraph...",
          };

          const styleMap: { [key: string]: string } = {
            title: "title-content",
            "book-title": "title-content book-title",
            subtitle: "title-content subtitle",
            "chapter-heading": "chapter-heading",
            "part-title": "part-title",
            epigraph: "epigraph",
            dedication: "dedication",
            acknowledgments: "acknowledgments",
            copyright: "copyright",
            verse: "verse",
            abstract: "abstract",
            keywords: "keywords",
            bibliography: "bibliography",
            references: "references",
            appendix: "appendix",
            "author-info": "author-info",
            "date-info": "date-info",
            address: "address",
            salutation: "salutation",
            closing: "closing",
            signature: "signature",
            sidebar: "sidebar",
            callout: "callout",
            lead: "lead",
          };

          const selectedText =
            selection.toString() || placeholders[tag] || "Text";
          const className = styleMap[tag] || "";
          const blockHtml = `<p class="${className}">${selectedText}</p>`;
          document.execCommand("insertHTML", false, blockHtml);
        }
        setTimeout(() => handleInput(), 0);
      } else {
        // Standard HTML elements use formatBlock
        formatText("formatBlock", tag);
      }
      setBlockType(tag);
    },
    [formatText, handleInput]
  );

  // Insert link
  const insertLink = useCallback(() => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    formatText("createLink", url);
    setShowLinkModal(false);
    setLinkUrl("");
  }, [linkUrl, formatText]);

  // Remove link
  const removeLink = useCallback(() => {
    formatText("unlink");
  }, [formatText]);

  // Add Bookmark
  const addBookmark = useCallback(() => {
    if (!newBookmarkName.trim() || !selectedTextForBookmark) return;

    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      name: newBookmarkName.trim(),
      selectedText: selectedTextForBookmark,
      color: newBookmarkColor,
      timestamp: Date.now(),
    };

    setBookmarks((prev) => [...prev, newBookmark]);
    setShowBookmarkModal(false);
    setNewBookmarkName("");
    setSelectedTextForBookmark("");
  }, [newBookmarkName, selectedTextForBookmark, newBookmarkColor]);

  // Delete Bookmark
  const deleteBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    // Also remove any cross-references pointing to this bookmark
    setCrossReferences((prev) =>
      prev.filter((cr) => cr.targetBookmarkId !== id)
    );
  }, []);

  // Add Cross-Reference
  const addCrossReference = useCallback(() => {
    if (
      !newCrossRefName.trim() ||
      !selectedTextForBookmark ||
      !newCrossRefTarget
    )
      return;

    const newCrossRef: CrossReference = {
      id: `cr-${Date.now()}`,
      name: newCrossRefName.trim(),
      sourceText: selectedTextForBookmark,
      targetBookmarkId: newCrossRefTarget,
      note: newCrossRefNote.trim(),
      timestamp: Date.now(),
    };

    setCrossReferences((prev) => [...prev, newCrossRef]);
    setShowCrossRefModal(false);
    setNewCrossRefName("");
    setNewCrossRefTarget("");
    setNewCrossRefNote("");
    setSelectedTextForBookmark("");
  }, [
    newCrossRefName,
    selectedTextForBookmark,
    newCrossRefTarget,
    newCrossRefNote,
  ]);

  // Delete Cross-Reference
  const deleteCrossReference = useCallback((id: string) => {
    setCrossReferences((prev) => prev.filter((cr) => cr.id !== id));
  }, []);

  // Jump to bookmark text in editor
  const jumpToBookmark = useCallback((bookmark: Bookmark) => {
    if (!editorRef.current) return;

    const searchText = bookmark.selectedText;
    const editorContent = editorRef.current.innerHTML;
    const textContent = editorRef.current.textContent || "";
    const index = textContent.indexOf(searchText);

    if (index === -1) return;

    // Find and select the text
    const selection = window.getSelection();
    if (!selection) return;

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentPos = 0;
    let node: Text | null = null;

    while ((node = walker.nextNode() as Text)) {
      const nodeLength = node.textContent?.length || 0;
      if (currentPos + nodeLength > index) {
        const range = document.createRange();
        const startOffset = index - currentPos;
        range.setStart(node, startOffset);

        // Find end of selection
        let endNode = node;
        let endOffset = startOffset + searchText.length;
        let remaining = searchText.length;

        if (startOffset + remaining <= nodeLength) {
          endOffset = startOffset + remaining;
        } else {
          remaining -= nodeLength - startOffset;
          while ((endNode = walker.nextNode() as Text) && remaining > 0) {
            const endNodeLength = endNode.textContent?.length || 0;
            if (remaining <= endNodeLength) {
              endOffset = remaining;
              break;
            }
            remaining -= endNodeLength;
          }
        }

        if (endNode) {
          range.setEnd(endNode, endOffset);
          selection.removeAllRanges();
          selection.addRange(range);

          // Scroll into view
          const rect = range.getBoundingClientRect();
          const editorRect = editorRef.current.getBoundingClientRect();
          if (rect.top < editorRect.top || rect.bottom > editorRect.bottom) {
            node.parentElement?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
        break;
      }
      currentPos += nodeLength;
    }

    setShowBookmarksPanel(false);
  }, []);

  // Open bookmark modal with current selection
  const openBookmarkModal = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelectedTextForBookmark("");
    } else {
      const text = selection.toString().trim();
      setSelectedTextForBookmark(text.substring(0, 200)); // Limit to 200 chars
    }
    setShowBookmarkModal(true);
  }, []);

  // Open cross-reference modal with current selection
  const openCrossRefModal = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelectedTextForBookmark("");
    } else {
      const text = selection.toString().trim();
      setSelectedTextForBookmark(text.substring(0, 200));
    }
    setShowCrossRefModal(true);
  }, []);

  // Format Painter - Copy formatting from selection
  const copyFormat = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let element = range.startContainer as HTMLElement;

    // Get the element with styles (walk up to find an element node)
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentElement as HTMLElement;
    }

    if (!element) return;

    const computedStyle = window.getComputedStyle(element);

    setCopiedFormat({
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      fontStyle: computedStyle.fontStyle,
      textDecoration: computedStyle.textDecoration,
      color: computedStyle.color,
      backgroundColor:
        computedStyle.backgroundColor === "rgba(0, 0, 0, 0)"
          ? undefined
          : computedStyle.backgroundColor,
      textAlign: computedStyle.textAlign,
    });

    setFormatPainterActive(true);
  }, []);

  // Format Painter - Apply copied formatting to selection
  const applyFormat = useCallback(() => {
    if (!copiedFormat || !editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setFormatPainterActive(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) {
      setFormatPainterActive(false);
      return;
    }

    // Create a span with the copied formatting
    const span = document.createElement("span");
    span.textContent = selectedText;

    if (copiedFormat.fontFamily)
      span.style.fontFamily = copiedFormat.fontFamily;
    if (copiedFormat.fontSize) span.style.fontSize = copiedFormat.fontSize;
    if (copiedFormat.fontWeight)
      span.style.fontWeight = copiedFormat.fontWeight;
    if (copiedFormat.fontStyle) span.style.fontStyle = copiedFormat.fontStyle;
    if (copiedFormat.textDecoration && copiedFormat.textDecoration !== "none") {
      span.style.textDecoration = copiedFormat.textDecoration;
    }
    if (copiedFormat.color) span.style.color = copiedFormat.color;
    if (copiedFormat.backgroundColor)
      span.style.backgroundColor = copiedFormat.backgroundColor;

    range.deleteContents();
    range.insertNode(span);

    // Move cursor to end of inserted span
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    newRange.collapse(false);
    selection.addRange(newRange);

    setFormatPainterActive(false);
    setTimeout(() => handleInput(), 0);
  }, [copiedFormat, handleInput]);

  // Handle click when Format Painter is active
  useEffect(() => {
    if (!formatPainterActive || !editorRef.current) return;

    const handleMouseUp = () => {
      // Small delay to let selection complete
      setTimeout(() => {
        applyFormat();
      }, 10);
    };

    editorRef.current.addEventListener("mouseup", handleMouseUp);
    return () => {
      editorRef.current?.removeEventListener("mouseup", handleMouseUp);
    };
  }, [formatPainterActive, applyFormat]);

  // Insert table
  const insertTable = useCallback(() => {
    const table = `
      <table border="1" style="border-collapse: collapse; width: 100%; margin: 1em 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 1</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 2</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 3</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 4</td>
        </tr>
      </table>
    `;
    document.execCommand("insertHTML", false, table);
    setTimeout(() => handleInput(), 0);
  }, [handleInput]);

  const findAllMatches = useCallback(() => {
    if (!editorRef.current || !findText) {
      setFindMatches([]);
      setCurrentMatchIndex(0);
      return [] as TextMatch[];
    }

    const { text, map } = extractTextWithMap(editorRef.current);
    textMapRef.current = { fullText: text, map };

    const content = text.toLowerCase();
    const search = findText.toLowerCase();
    const matches: TextMatch[] = [];

    let index = 0;
    while (index < content.length) {
      const foundAt = content.indexOf(search, index);
      if (foundAt === -1) break;
      matches.push({ start: foundAt, end: foundAt + findText.length });
      index = foundAt + findText.length; // Avoid overlapping matches
    }

    setFindMatches(matches);
    setCurrentMatchIndex(-1);
    return matches;
  }, [findText]);

  // Find text
  const findInText = useCallback(() => {
    if (!findText) return;

    // Use native window.find for better reliability in contentEditable
    // Arguments: aString, aCaseSensitive, aBackwards, aWrapAround, aWholeWord, aSearchInFrames, aShowDialog
    const found = (window as any).find(
      findText,
      false,
      false,
      true,
      false,
      false,
      false
    );

    if (found) {
      // Ensure editor has focus so the selection is visible
      editorRef.current?.focus();
      // Update match index for UI (approximate)
      setCurrentMatchIndex((prev) => prev + 1);
    } else {
      // Try resetting selection to start and search again (in case wrap didn't work as expected)
      const selection = window.getSelection();
      if (selection) {
        selection.collapse(editorRef.current, 0);
        const foundRetry = (window as any).find(
          findText,
          false,
          false,
          true,
          false,
          false,
          false
        );
        if (foundRetry) {
          editorRef.current?.focus();
          setCurrentMatchIndex(0);
          return;
        }
      }
      alert("Text not found");
    }
  }, [findText]);

  const replaceOne = useCallback(() => {
    if (!editorRef.current || !findText) return;

    const matches = findMatches.length > 0 ? findMatches : findAllMatches();
    if (matches.length === 0) return;

    const safeIndex =
      currentMatchIndex === -1
        ? 0
        : Math.min(currentMatchIndex, matches.length - 1);
    const match = matches[safeIndex];

    // Ensure map is available
    if (!textMapRef.current) {
      const { text, map } = extractTextWithMap(editorRef.current);
      textMapRef.current = { fullText: text, map };
    }

    const { map } = textMapRef.current;

    // Find start node
    const startNodeEntry = map.find(
      (n) => n.start <= match.start && n.end > match.start
    );
    // Find end node
    const endNodeEntry = map.find(
      (n) => n.start < match.end && n.end >= match.end
    );

    if (!startNodeEntry || !endNodeEntry) {
      setFindMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const range = document.createRange();
    range.setStart(startNodeEntry.node, match.start - startNodeEntry.start);
    range.setEnd(endNodeEntry.node, match.end - endNodeEntry.start);

    range.deleteContents();
    range.insertNode(document.createTextNode(replaceText));

    setFindMatches([]);
    setCurrentMatchIndex(-1);
    handleInput();
  }, [
    editorRef,
    findText,
    replaceText,
    findMatches,
    currentMatchIndex,
    findAllMatches,
    handleInput,
  ]);

  // Replace all occurrences
  const replaceInText = useCallback(() => {
    if (!editorRef.current || !findText) return;

    const { text, map } = extractTextWithMap(editorRef.current);
    const content = text.toLowerCase();
    const search = findText.toLowerCase();
    const matches: TextMatch[] = [];

    let index = 0;
    while (index < content.length) {
      const foundAt = content.indexOf(search, index);
      if (foundAt === -1) break;
      matches.push({ start: foundAt, end: foundAt + findText.length });
      index = foundAt + findText.length;
    }

    // Process matches in reverse order to preserve indices
    [...matches].reverse().forEach((match) => {
      const startNodeEntry = map.find(
        (n) => n.start <= match.start && n.end > match.start
      );
      const endNodeEntry = map.find(
        (n) => n.start < match.end && n.end >= match.end
      );

      if (startNodeEntry && endNodeEntry) {
        const range = document.createRange();
        range.setStart(startNodeEntry.node, match.start - startNodeEntry.start);
        range.setEnd(endNodeEntry.node, match.end - endNodeEntry.start);
        range.deleteContents();
        range.insertNode(document.createTextNode(replaceText));
      }
    });

    setFindMatches([]);
    setCurrentMatchIndex(-1);
    handleInput();
  }, [editorRef, findText, replaceText, handleInput]);

  useEffect(() => {
    if (!findText) {
      setFindMatches([]);
      setCurrentMatchIndex(0);
    } else {
      setFindMatches([]);
      setCurrentMatchIndex(-1);
    }
  }, [findText]);

  // Clear formatting
  const clearFormatting = useCallback(() => {
    formatText("removeFormat");
  }, [formatText]);

  // Text alignment
  const alignText = useCallback(
    (alignment: string) => {
      formatText(
        `justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`
      );
      setTextAlign(alignment);
    },
    [formatText]
  );

  // Insert image
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editorRef.current) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgHtml = `<p><img src="${event.target?.result}" style="max-width: 100%; height: auto; display: block; margin: 1rem 0;" /></p>`;

        // Focus editor and insert
        editorRef.current?.focus();
        document.execCommand("insertHTML", false, imgHtml);

        // Trigger input to save to history
        setTimeout(() => handleInput(), 0);
      };
      reader.readAsDataURL(file);

      // Reset input
      e.target.value = "";
    },
    [handleInput]
  );

  const sanitizeClipboardHtml = useCallback((rawHtml: string) => {
    if (!rawHtml) return "";

    let workingHtml = rawHtml.trim();

    const htmlIndex = workingHtml.toLowerCase().indexOf("<html");
    if (htmlIndex > -1) {
      workingHtml = workingHtml.slice(htmlIndex);
    }

    const startMarker = "<!--StartFragment-->";
    const endMarker = "<!--EndFragment-->";
    let fragmentHtml = workingHtml;

    const startIndex = workingHtml.indexOf(startMarker);
    const endIndex = workingHtml.indexOf(endMarker);
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      fragmentHtml = workingHtml.slice(
        startIndex + startMarker.length,
        endIndex
      );
    } else {
      const bodyMatch = workingHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        fragmentHtml = bodyMatch[1];
      }
    }

    if (typeof window === "undefined" || typeof document === "undefined") {
      return fragmentHtml;
    }

    const container = document.createElement("div");
    container.innerHTML = fragmentHtml;

    container
      .querySelectorAll("style, meta, link, xml, script, head, title")
      .forEach((node) => node.remove());

    container.querySelectorAll("*").forEach((el) => {
      const attributes = Array.from(el.attributes);
      attributes.forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value;

        if (name.startsWith("xmlns") || name === "lang") {
          el.removeAttribute(attr.name);
          return;
        }

        if (name === "class" && /mso/i.test(value)) {
          el.removeAttribute(attr.name);
          return;
        }

        if (name === "style") {
          const cleanedStyle = value
            .split(";")
            .map((rule) => rule.trim())
            .filter(
              (rule) =>
                rule &&
                !rule.toLowerCase().startsWith("mso-") &&
                !rule.toLowerCase().includes("font-variant-east-asian") &&
                !rule.toLowerCase().includes("font-family")
            )
            .join("; ");

          if (cleanedStyle) {
            el.setAttribute("style", cleanedStyle);
          } else {
            el.removeAttribute("style");
          }
          return;
        }

        if (name === "width" || name === "height") {
          el.removeAttribute(attr.name);
        }
      });

      if (
        el.tagName.toLowerCase() === "span" &&
        !el.attributes.length &&
        (el.textContent || "").trim() === ""
      ) {
        el.remove();
      }
    });

    return container.innerHTML.replace(/&nbsp;/g, " ").replace(/<\/?o:p>/g, "");
  }, []);

  // Handle paste with images
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const html = e.clipboardData.getData("text/html");
      if (html) {
        e.preventDefault();
        const cleanHtml = sanitizeClipboardHtml(html);
        if (cleanHtml.trim().length > 0) {
          document.execCommand("insertHTML", false, cleanHtml);
          setTimeout(() => handleInput(), 0);
          return;
        }
      }

      // Get plain text and insert it
      const text = e.clipboardData.getData("text/plain");
      if (text) {
        e.preventDefault();
        // Insert text properly by using the browser's natural paste or insertHTML
        // This preserves line breaks and formatting
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Convert line breaks to proper HTML
        const lines = text.split("\n");
        const fragment = document.createDocumentFragment();

        lines.forEach((line, index) => {
          const textNode = document.createTextNode(line);
          fragment.appendChild(textNode);

          // Add <br> between lines (but not after the last line)
          if (index < lines.length - 1) {
            fragment.appendChild(document.createElement("br"));
          }
        });

        range.insertNode(fragment);

        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        setTimeout(() => handleInput(), 0);
        return;
      }

      // No HTML/text content; allow image pastes (e.g., screenshots)
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (!blob) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const imgHtml = `<p><img src="${event.target?.result}" style="max-width: 100%; height: auto; display: block; margin: 1rem 0;" /></p>`;
            document.execCommand("insertHTML", false, imgHtml);
            setTimeout(() => handleInput(), 0);
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    },
    [handleInput, sanitizeClipboardHtml]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Handle Tab key for indentation
      if (e.key === "Tab") {
        e.preventDefault();
        document.execCommand("insertHTML", false, "\u00A0\u00A0\u00A0\u00A0"); // 4 non-breaking spaces
        return;
      }

      // Handle Enter key - reset title/heading styles to paragraph after Enter
      if (e.key === "Enter" && !e.shiftKey && !modKey) {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          let node = selection.anchorNode.parentElement;
          while (node && node !== editorRef.current) {
            const tag = node.tagName?.toLowerCase();
            const className = node.className || "";
            // Check for heading or special title elements
            if (
              ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag || "") ||
              className.includes("book-title") ||
              className.includes("chapter-heading") ||
              className.includes("subtitle") ||
              className.includes("title-content") ||
              className.includes("part-title")
            ) {
              // Let the Enter happen, then reset to paragraph
              setTimeout(() => {
                const newSelection = window.getSelection();
                if (newSelection && newSelection.anchorNode) {
                  let newNode = newSelection.anchorNode;
                  if (newNode.nodeType === Node.TEXT_NODE) {
                    newNode = newNode.parentNode as Node;
                  }
                  // Check if we're now in a new element that inherited the heading style
                  const newElement = newNode as HTMLElement;
                  if (newElement && newElement.tagName) {
                    const newTag = newElement.tagName.toLowerCase();
                    const newClass = newElement.className || "";
                    if (
                      ["h1", "h2", "h3", "h4", "h5", "h6"].includes(newTag) ||
                      newClass.includes("book-title") ||
                      newClass.includes("chapter-heading") ||
                      newClass.includes("subtitle") ||
                      newClass.includes("title-content") ||
                      newClass.includes("part-title")
                    ) {
                      // Convert this element to a paragraph
                      document.execCommand("formatBlock", false, "p");
                      // Remove any special classes
                      const updatedSelection = window.getSelection();
                      if (updatedSelection && updatedSelection.anchorNode) {
                        let pNode = updatedSelection.anchorNode;
                        if (pNode.nodeType === Node.TEXT_NODE) {
                          pNode = pNode.parentNode as Node;
                        }
                        const pElement = pNode as HTMLElement;
                        if (pElement) {
                          pElement.className = "";
                        }
                      }
                      handleInput();
                    }
                  }
                }
              }, 0);
              return; // Let browser handle the Enter naturally
            }
            node = node.parentElement;
          }
        }
      }

      // Only process keyboard shortcuts that use modifier keys (Cmd/Ctrl or Alt)
      // Let all other keys pass through without preventDefault for natural auto-repeat
      if (!modKey && !e.altKey && !e.shiftKey) {
        return; // Don't prevent default - let browser handle naturally
      }

      // Use e.code for reliable key detection (especially with Alt on Mac)
      const code = e.code;
      const key = e.key.toLowerCase();

      // Handle modifier+key shortcuts
      // First check code-based shortcuts (for Alt combinations that change key output)
      if (modKey && e.altKey) {
        switch (code) {
          case "Digit1":
            e.preventDefault();
            changeBlockType("h1");
            return;
          case "Digit2":
            e.preventDefault();
            changeBlockType("h2");
            return;
          case "Digit3":
            e.preventDefault();
            changeBlockType("h3");
            return;
          case "Digit4":
            e.preventDefault();
            changeBlockType("h4");
            return;
          case "Digit5":
            e.preventDefault();
            changeBlockType("h5");
            return;
          case "Digit6":
            e.preventDefault();
            changeBlockType("h6");
            return;
          case "Digit0":
            e.preventDefault();
            changeBlockType("p");
            return;
        }
      }

      // Quote shortcut - Cmd/Ctrl + Shift + .
      if (modKey && e.shiftKey && (code === "Period" || key === ".")) {
        e.preventDefault();
        changeBlockType("blockquote");
        return;
      }

      // Standard shortcuts (key-based)
      switch (key) {
        case "s":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            if (onSave) {
              onSave();
            }
          }
          break;
        case "b":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            formatText("bold");
          }
          break;
        case "i":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            formatText("italic");
          }
          break;
        case "u":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            formatText("underline");
          }
          break;
        case "k":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            setShowLinkModal(true);
          }
          break;
        case "f":
          if (modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            setShowFindReplace(true);
          }
          break;
        case "z":
          if (modKey && !e.altKey) {
            if (e.shiftKey) {
              e.preventDefault();
              performRedo();
            } else {
              e.preventDefault();
              performUndo();
            }
          }
          break;
        case "y":
          if (!isMac && modKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            performRedo();
          }
          break;
      }
    },
    [formatText, performUndo, performRedo, changeBlockType, onSave, handleInput]
  );

  // Update format state
  const updateFormatState = useCallback(() => {
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsUnderline(document.queryCommandState("underline"));

    // Get current block type
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      let node = selection.anchorNode.parentElement;
      while (node && node !== editorRef.current) {
        const tag = node.tagName?.toLowerCase();
        if (
          [
            "p",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "blockquote",
            "pullquote",
            "pre",
            "footnote",
            "citation",
          ].includes(tag)
        ) {
          setBlockType(tag);
          break;
        }
        node = node.parentElement;
      }
    }
  }, []);

  // Track selection changes for toolbar
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateFormatState();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateFormatState]);

  // Track scroll position for back to top button
  // NOTE: scrollShellRef is the actual scrollable container (wrapperRef has overflow:hidden)
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollShellRef.current) return;
      const scrollTop = scrollShellRef.current.scrollTop;
      setShowBackToTop(scrollTop > 300);

      const currentPage = Math.min(
        Math.max(
          0,
          Math.floor((scrollTop + PAGE_HEIGHT_PX / 2) / PAGE_HEIGHT_PX)
        ),
        Math.max(0, pageCount - 1)
      );
      if (currentPage !== activePageRef.current) {
        setActivePage(currentPage);
      }
    };

    const scrollShell = scrollShellRef.current;
    if (!scrollShell) {
      return;
    }

    scrollShell.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => scrollShell.removeEventListener("scroll", handleScroll);
  }, [pageCount]);

  // Typewriter mode - center current line
  useEffect(() => {
    if (!typewriterMode || !editorRef.current || !wrapperRef.current) return;

    const centerCursor = () => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const wrapperRect = wrapperRef.current!.getBoundingClientRect();
      const wrapperMiddle = wrapperRect.height / 2;

      // Scroll to keep cursor in middle of screen
      const offset = rect.top - wrapperRect.top - wrapperMiddle;
      if (Math.abs(offset) > 50) {
        wrapperRef.current!.scrollBy({ top: offset, behavior: "smooth" });
      }
    };

    // Handle typing
    const handleInput = () => centerCursor();

    // Handle cursor movement (arrow keys, clicks, etc.)
    const handleSelectionChange = () => {
      // Only center if the selection is within our editor
      const selection = window.getSelection();
      if (selection && editorRef.current?.contains(selection.anchorNode)) {
        centerCursor();
      }
    };

    // Handle clicks
    const handleClick = () => centerCursor();

    editorRef.current.addEventListener("input", handleInput);
    editorRef.current.addEventListener("click", handleClick);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      editorRef.current?.removeEventListener("input", handleInput);
      editorRef.current?.removeEventListener("click", handleClick);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [typewriterMode]);

  // Listen for selection changes and sync the active page when typing flows past a page break
  useEffect(() => {
    if (!showThumbnailRail) return;

    const handleSelectionSync = () => {
      if (selectionSyncLockRef.current) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      if (!editorRef.current || !wrapperRef.current) {
        return;
      }

      if (!editorRef.current.contains(selection.anchorNode)) {
        return;
      }

      const range = selection.getRangeAt(0).cloneRange();
      range.collapse(true);
      const rect = range.getClientRects()[0] || range.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const scrollTop = wrapperRef.current.scrollTop;
      const relativeTop = rect.top - wrapperRect.top + scrollTop;
      const inferredPage = Math.min(
        Math.max(Math.floor(relativeTop / PAGE_HEIGHT_PX), 0),
        Math.max(0, pageCount - 1)
      );

      if (inferredPage !== activePageRef.current) {
        setActivePage(inferredPage);
      }
    };

    document.addEventListener("selectionchange", handleSelectionSync);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionSync);
  }, [showThumbnailRail, pageCount]);

  // Sprint timer
  useEffect(() => {
    if (!sprintMode || sprintTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setSprintTimeRemaining((prev) => {
        if (prev <= 1) {
          setSprintMode(false);
          // Show completion message
          const wordsWritten = statistics.words - sprintStartWords;
          alert(
            `Sprint Complete! 🎉\nYou wrote ${wordsWritten} words in ${sprintDuration} minutes!\nThat's ${Math.round(
              wordsWritten / sprintDuration
            )} words per minute!`
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    sprintMode,
    sprintTimeRemaining,
    statistics.words,
    sprintStartWords,
    sprintDuration,
  ]);

  // Start sprint
  const startSprint = useCallback(() => {
    setSprintMode(true);
    setSprintTimeRemaining(sprintDuration * 60);
    setSprintStartWords(statistics.words);
  }, [sprintDuration, statistics.words]);

  // Stop sprint
  const stopSprint = useCallback(() => {
    setSprintMode(false);
    setSprintTimeRemaining(0);
  }, []);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    jumpToPage(0, { suppressSelectionSync: true });
  }, [jumpToPage]);

  // Render spacing indicators - small colored dots inside the left margin
  const renderIndicators = () => {
    if (
      !editorRef.current ||
      !pagesContainerRef.current ||
      !showSpacingIndicators ||
      !showStyleLabels
    )
      return null;
    // In free mode, always show indicators. In paid mode, respect focus mode toggle.
    if (!isFreeMode && focusMode) return null;

    const paragraphs = Array.from(editorRef.current.querySelectorAll("p, div"));

    // Get the editor's offset from the pages container
    const editorOffset = editorRef.current.offsetTop;

    // Only show dots for paragraphs that need attention:
    // - Orange: Long paragraphs (>150 words)
    // - Purple: Passive voice detected
    const indicators: React.ReactNode[] = [];

    analysis.spacing.forEach((item, idx) => {
      const para = paragraphs[item.index] as HTMLElement;
      if (!para) return;

      // Calculate position relative to pages container
      // para.offsetTop is relative to the editor, so add editor's offset
      const paraTop = para.offsetTop + editorOffset;

      // Show orange dot for long paragraphs
      if (item.tone === "extended") {
        indicators.push(
          <div
            key={`long-${idx}`}
            className="absolute pointer-events-none z-20"
            style={{
              top: `${paraTop + 4}px`,
              left: "12px",
            }}
            title={`Long paragraph · ${item.wordCount} words - consider breaking up`}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#f97316", // orange
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        );
      }

      // Show purple dot for passive voice (offset slightly if also long)
      if (item.hasPassive && item.passiveCount && item.passiveCount > 0) {
        indicators.push(
          <div
            key={`passive-${idx}`}
            className="absolute pointer-events-none z-20"
            style={{
              top: `${paraTop + 4}px`,
              left: item.tone === "extended" ? "24px" : "12px", // offset if also long
            }}
            title={`Passive voice detected (${item.passiveCount}× ) - consider active voice`}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#8b5cf6", // purple
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        );
      }
    });

    return indicators;
  };

  // Render visual suggestions - small yellow dots inside the right margin
  const renderSuggestions = () => {
    if (
      !editorRef.current ||
      !pagesContainerRef.current ||
      !showVisualSuggestions ||
      !showStyleLabels
    ) {
      return null;
    }
    // In free mode, always show suggestions. In paid mode, respect focus mode toggle.
    if (!isFreeMode && focusMode) {
      return null;
    }

    const paragraphs = Array.from(editorRef.current.querySelectorAll("p, div"));

    // Get the editor's offset from the pages container
    const editorOffset = editorRef.current.offsetTop;

    return analysis.visuals.map((item, idx) => {
      const para = paragraphs[item.index] as HTMLElement;
      if (!para) return null;

      // Calculate position relative to pages container
      const paraTop = para.offsetTop + editorOffset;

      // Combine all suggestions into a tooltip
      const tooltipText = item.suggestions
        .map((s) => `${s.visualType}: ${s.reason}`)
        .join("\n");

      return (
        <div
          key={`visual-${idx}`}
          className="absolute pointer-events-none z-20"
          style={{
            top: `${paraTop + 4}px`,
            right: "12px",
          }}
          title={tooltipText}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#eab308", // yellow
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      );
    });
  };

  // Render the analysis legend (positioned in toolbar row)
  const renderAnalysisLegend = () => {
    if (!showStyleLabels) return null;
    if (!showSpacingIndicators && !showVisualSuggestions) return null;
    if (!isFreeMode && focusMode) return null;

    return (
      <div
        className="analysis-legend"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "6px 12px",
          fontSize: "11px",
          fontWeight: 500,
          color: "#78716c",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #fffaf3 0%, #fef5e7 100%)",
          border: "1.5px solid #e0c392",
          boxShadow: "0 4px 12px rgba(239, 132, 50, 0.12)",
        }}
      >
        {showSpacingIndicators && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#f97316",
                }}
              />
              <span>Long ¶</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#8b5cf6",
                }}
              />
              <span>Passive?</span>
            </div>
          </>
        )}
        {showVisualSuggestions && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#eab308",
              }}
            />
            <span>Senses?</span>
          </div>
        )}
      </div>
    );
  };

  // Ruler drag start handler
  const handleRulerDragStart = useCallback(
    (type: "left" | "right" | "indent", e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setRulerDragging(type);
    },
    []
  );

  // Ruler drag effect
  useEffect(() => {
    if (!rulerDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!rulerContainerRef.current) return;

      const rect = rulerContainerRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, e.clientX - rect.left);
      const maxWidth = Math.min(rect.width, PAGE_WIDTH_PX);
      const constrainedX = Math.max(0, Math.min(relativeX, maxWidth));

      if (rulerDragging === "left") {
        const newLeft = Math.max(0, Math.min(constrainedX, 200));
        onLeftMarginChange?.(newLeft);
      } else if (rulerDragging === "right") {
        const fromRight = maxWidth - constrainedX;
        onRightMarginChange?.(Math.max(0, Math.min(fromRight, 200)));
      } else if (rulerDragging === "indent") {
        const rawAbsolutePos = Math.max(
          leftMargin,
          Math.min(constrainedX, maxWidth - rightMargin)
        );
        const relativeIndent = rawAbsolutePos - leftMargin;
        const snappedIndent = Math.round(relativeIndent / 24) * 24;
        const newIndent = Math.max(
          0,
          Math.min(snappedIndent, maxWidth - rightMargin - leftMargin)
        );
        onFirstLineIndentChange?.(newIndent);
      }
    };

    const handleMouseUp = () => {
      setRulerDragging(null);
    };

    document.addEventListener("mousemove", handleMouseMove, true);
    document.addEventListener("mouseup", handleMouseUp, true);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("mouseup", handleMouseUp, true);
    };
  }, [
    rulerDragging,
    leftMargin,
    rightMargin,
    onLeftMarginChange,
    onRightMarginChange,
    onFirstLineIndentChange,
  ]);

  return (
    <div
      className="custom-editor-container"
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Toolbar Row - spread to edges */}
      {viewMode === "writer" && !isFreeMode && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 12px",
            position: "sticky",
            top: 0,
            zIndex: 20,
            backgroundColor: "transparent",
            transform: "translateY(-10px)",
          }}
        >
          {/* Left Toolbar Half */}
          <div
            className="writer-toolbar-shell"
            style={{
              padding: "6px 10px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #fffaf3 0%, #fef5e7 100%)",
              border: "1.5px solid #e0c392",
              boxShadow: "0 4px 12px rgba(239, 132, 50, 0.12)",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              className="toolbar flex items-center gap-1"
              style={{
                flexWrap: "nowrap",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
              }}
            >
              {/* Block type dropdown */}
              <select
                value={blockType}
                onChange={(e) => changeBlockType(e.target.value)}
                className="px-1.5 py-1 rounded border bg-white hover:bg-gray-50 transition-colors text-xs"
                title="Block Type"
              >
                <optgroup label="Basic">
                  <option value="p">Paragraph (⌘⌥0)</option>
                  <option value="h1">Heading 1 (⌘⌥1)</option>
                  <option value="h2">Heading 2 (⌘⌥2)</option>
                  <option value="h3">Heading 3 (⌘⌥3)</option>
                  <option value="h4">Heading 4 (⌘⌥4)</option>
                  <option value="h5">Heading 5 (⌘⌥5)</option>
                  <option value="h6">Heading 6 (⌘⌥6)</option>
                  <option value="blockquote">Quote (⌘⇧.)</option>
                  <option value="pre">Code Block</option>
                  <option value="lead">Lead Paragraph</option>
                </optgroup>
                <optgroup label="Academic">
                  <option value="abstract">Abstract</option>
                  <option value="keywords">Keywords</option>
                  <option value="bibliography">Bibliography</option>
                  <option value="references">References</option>
                  <option value="appendix">Appendix</option>
                  <option value="footnote">Footnote</option>
                  <option value="citation">Citation</option>
                </optgroup>
                <optgroup label="Professional">
                  <option value="author-info">Author Info</option>
                  <option value="date-info">Date</option>
                  <option value="address">Address</option>
                  <option value="salutation">Salutation</option>
                  <option value="closing">Closing</option>
                  <option value="signature">Signature Line</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="callout">Callout/Alert</option>
                </optgroup>
                <optgroup label="Book Publishing">
                  <option value="book-title">Book Title</option>
                  <option value="title">Section Title</option>
                  <option value="subtitle">Subtitle</option>
                  <option value="chapter-heading">Chapter Heading</option>
                  <option value="part-title">Part Title</option>
                  <option value="epigraph">Epigraph</option>
                  <option value="dedication">Dedication</option>
                  <option value="acknowledgments">Acknowledgments</option>
                  <option value="copyright">Copyright Notice</option>
                  <option value="verse">Verse/Poetry</option>
                </optgroup>
                <optgroup label="Screenplay">
                  <option value="scene-heading">Scene Heading</option>
                  <option value="action">Action</option>
                  <option value="character">Character</option>
                  <option value="dialogue">Dialogue</option>
                  <option value="parenthetical">Parenthetical</option>
                  <option value="transition">Transition</option>
                </optgroup>
              </select>

              {/* Styles Panel Button */}
              <button
                onClick={() => setShowStylesPanel(true)}
                className="px-1.5 py-1 rounded border border-[#e0c392] bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs"
                title="Styles"
              >
                ⚙
              </button>

              {/* Font Family dropdown */}
              <select
                value={fontFamily}
                onChange={(e) => {
                  const newFont = e.target.value;
                  setFontFamily(newFont);
                  if (newFont === "default") {
                    formatText("fontName", "inherit");
                  } else {
                    formatText("fontName", newFont);
                  }
                }}
                className="px-1.5 py-1 rounded border bg-white hover:bg-gray-50 transition-colors text-xs"
                title="Font Family"
                style={{ maxWidth: "100px" }}
              >
                <option value="default">Default</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Palatino Linotype, serif">Palatino</option>
                <option value="Garamond, serif">Garamond</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Courier New, monospace">Courier New</option>
                <option value="Courier Prime, monospace">Courier Prime</option>
              </select>

              {/* Font Size Controls */}
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  const selection = window.getSelection();
                  if (!selection || selection.rangeCount === 0) return;

                  const currentSize = parseInt(fontSize) || 16;
                  const newSize = Math.max(8, currentSize - 1);
                  setFontSize(`${newSize}px`);

                  // Apply inline style for precise control
                  document.execCommand("fontSize", false, "7");

                  // Capture selection AFTER execCommand but BEFORE manual replacement
                  // The selection is now on the text nodes inside the <font> tags
                  let preservedRange: Range | null = null;
                  const selAfterExec = window.getSelection();
                  if (selAfterExec && selAfterExec.rangeCount > 0) {
                    preservedRange = selAfterExec.getRangeAt(0).cloneRange();
                  }

                  const fontElements =
                    editorRef.current?.querySelectorAll('font[size="7"]');
                  fontElements?.forEach((el) => {
                    const span = document.createElement("span");
                    span.style.fontSize = `${newSize}px`;
                    // Moving children preserves the Range if it points to the children
                    while (el.firstChild) {
                      span.appendChild(el.firstChild);
                    }
                    el.parentNode?.replaceChild(span, el);
                  });

                  // Restore focus and selection
                  editorRef.current?.focus();
                  if (preservedRange) {
                    const newSelection = window.getSelection();
                    if (newSelection) {
                      newSelection.removeAllRanges();
                      newSelection.addRange(preservedRange);
                    }
                  }
                }}
                className="px-1.5 py-1 rounded border border-[#e0c392] bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs font-bold"
                title="Decrease Font Size"
              >
                A-
              </button>
              <span
                className="px-1 py-1 text-xs text-[#2c3e50] min-w-[32px] text-center"
                title="Current Font Size"
              >
                {parseInt(fontSize) || 16}
              </span>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  const selection = window.getSelection();
                  if (!selection || selection.rangeCount === 0) return;

                  const currentSize = parseInt(fontSize) || 16;
                  const newSize = Math.min(72, currentSize + 1);
                  setFontSize(`${newSize}px`);

                  // Apply inline style for precise control
                  document.execCommand("fontSize", false, "7");

                  // Capture selection AFTER execCommand but BEFORE manual replacement
                  // The selection is now on the text nodes inside the <font> tags
                  let preservedRange: Range | null = null;
                  const selAfterExec = window.getSelection();
                  if (selAfterExec && selAfterExec.rangeCount > 0) {
                    preservedRange = selAfterExec.getRangeAt(0).cloneRange();
                  }

                  const fontElements =
                    editorRef.current?.querySelectorAll('font[size="7"]');
                  fontElements?.forEach((el) => {
                    const span = document.createElement("span");
                    span.style.fontSize = `${newSize}px`;
                    // Moving children preserves the Range if it points to the children
                    while (el.firstChild) {
                      span.appendChild(el.firstChild);
                    }
                    el.parentNode?.replaceChild(span, el);
                  });

                  // Restore focus and selection
                  editorRef.current?.focus();
                  if (preservedRange) {
                    const newSelection = window.getSelection();
                    if (newSelection) {
                      newSelection.removeAllRanges();
                      newSelection.addRange(preservedRange);
                    }
                  }
                }}
                className="px-1.5 py-1 rounded border border-[#e0c392] bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs font-bold"
                title="Increase Font Size"
              >
                A+
              </button>

              {/* Style Labels Toggle */}
              <button
                onClick={() => setShowStyleLabels(!showStyleLabels)}
                className={`px-1.5 py-1 rounded border transition-colors text-xs ${
                  showStyleLabels
                    ? "bg-[#f7e6d0] text-[#ef8432] border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] border-[#e0c392]"
                }`}
                title={
                  showStyleLabels
                    ? "Hide Style Labels & Indicators"
                    : "Show Style Labels & Indicators"
                }
              >
                🏷️
              </button>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Text formatting */}
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("bold");
                }}
                className={`px-2 py-1 rounded font-bold transition-colors text-xs ${
                  isBold
                    ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                }`}
                title="Bold"
              >
                B
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("italic");
                }}
                className={`px-2 py-1 rounded italic transition-colors text-xs ${
                  isItalic
                    ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                }`}
                title="Italic"
              >
                I
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("underline");
                }}
                className={`px-2 py-1 rounded underline transition-colors text-xs ${
                  isUnderline
                    ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                }`}
                title="Underline"
              >
                U
              </button>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Text alignment */}
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  alignText("left");
                }}
                className={`px-1.5 py-1 rounded transition-colors text-xs ${
                  textAlign === "left"
                    ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                }`}
                title="Align Left"
              >
                ≡
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  alignText("center");
                }}
                className={`px-1.5 py-1 rounded transition-colors text-xs ${
                  textAlign === "center"
                    ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                }`}
                title="Center"
              >
                ≡
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  alignText("right");
                }}
                className={`px-1.5 py-1 rounded transition-colors text-xs ${
                  textAlign === "right"
                    ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                }`}
                title="Align Right"
              >
                ≡
              </button>
            </div>
          </div>

          {/* Right Toolbar Half */}
          <div
            className="writer-toolbar-shell"
            style={{
              padding: "6px 10px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #fffaf3 0%, #fef5e7 100%)",
              border: "1.5px solid #e0c392",
              boxShadow: "0 4px 12px rgba(239, 132, 50, 0.12)",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              className="toolbar flex items-center gap-1"
              style={{
                flexWrap: "nowrap",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
              }}
            >
              {/* Lists */}
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("insertUnorderedList");
                }}
                className="px-2 py-1 rounded bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs"
                title="Bullet List"
              >
                •
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("insertOrderedList");
                }}
                className="px-2 py-1 rounded bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs"
                title="Numbered List"
              >
                1.
              </button>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Bookmarks & Cross-References */}
              <button
                onClick={openBookmarkModal}
                className={`px-2 py-1 rounded transition-colors text-xs ${
                  bookmarks.length > 0
                    ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                }`}
                title="Add Bookmark"
              >
                🔖
              </button>
              <button
                onClick={openCrossRefModal}
                className={`px-2 py-1 rounded transition-colors text-xs ${
                  crossReferences.length > 0
                    ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                }`}
                title="Add Cross-Reference"
              >
                🔗
              </button>
              <button
                onClick={() => setShowBookmarksPanel(!showBookmarksPanel)}
                className={`px-2 py-1 rounded transition-colors text-xs ${
                  showBookmarksPanel
                    ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                }`}
                title={`View Bookmarks & References (${
                  bookmarks.length + crossReferences.length
                })`}
              >
                📋
              </button>
              <label
                className="px-2 py-1 rounded bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors cursor-pointer text-xs"
                title="Image"
              >
                📸
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Utilities */}
              <button
                onClick={() => setShowFindReplace(!showFindReplace)}
                className={`px-2 py-1 rounded transition-colors text-xs ${
                  showFindReplace
                    ? "bg-[#f7e6d0] text-[#ef8432] border border-[#ef8432]"
                    : "bg-[#fef5e7] hover:bg-[#f7e6d0] text-[#2c3e50]"
                }`}
                title="Find"
              >
                🔍
              </button>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* History */}
              <button
                onClick={performUndo}
                disabled={!canUndo}
                className="px-2 py-1 rounded hover:bg-gray-200 text-gray-700 transition-colors text-xs disabled:opacity-30"
                title="Undo"
              >
                ↶
              </button>
              <button
                onClick={performRedo}
                disabled={!canRedo}
                className="px-2 py-1 rounded hover:bg-gray-200 text-gray-700 transition-colors text-xs disabled:opacity-30"
                title="Redo"
              >
                ↷
              </button>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* View options */}
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`px-2 py-1 rounded transition-colors text-xs toolbar-view-button ${
                  focusMode ? "active" : ""
                }`}
                title="Focus Mode"
              >
                🎯
              </button>
              <button
                onClick={() => setTypewriterMode(!typewriterMode)}
                className={`px-2 py-1 rounded transition-colors text-xs toolbar-view-button ${
                  typewriterMode ? "active" : ""
                }`}
                title="Typewriter Mode"
              >
                ⌨️
              </button>

              {/* Character Management (Tier 3 only) */}
              {isProfessionalTier && onOpenCharacterManager && (
                <>
                  <div style={toolbarDividerStyle} aria-hidden="true" />
                  <div ref={characterPopoverRef}>
                    <button
                      ref={characterButtonRef}
                      onClick={() => {
                        if (
                          !showCharacterPopover &&
                          characterButtonRef.current
                        ) {
                          const rect =
                            characterButtonRef.current.getBoundingClientRect();
                          setPopoverPosition({
                            top: rect.bottom + 4,
                            right: window.innerWidth - rect.right,
                          });
                        }
                        setShowCharacterPopover(!showCharacterPopover);
                      }}
                      className={`px-2 py-1 rounded transition-colors text-xs toolbar-view-button ${
                        showCharacterPopover ? "active" : ""
                      }`}
                      title="Character Tools"
                    >
                      👥
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Character Popover - rendered outside toolbar to avoid overflow:hidden */}
      {showCharacterPopover && isProfessionalTier && (
        <div
          ref={characterPopoverRef}
          style={{
            position: "fixed",
            top: popoverPosition.top,
            right: popoverPosition.right,
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            border: `1px solid ${palette.lightBorder}`,
            padding: "12px",
            minWidth: "280px",
            zIndex: 9999,
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <button
              onClick={() => {
                onOpenCharacterManager?.();
                setShowCharacterPopover(false);
              }}
              className="w-full px-3 py-2 rounded transition-colors text-sm text-left hover:bg-gray-100"
              style={{
                border: `1px solid ${palette.lightBorder}`,
              }}
            >
              👥 Manage Characters...
            </button>
          </div>

          {characters && characters.length > 0 && (
            <>
              <div
                style={{
                  borderTop: `1px solid ${palette.lightBorder}`,
                  paddingTop: "12px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  🔗 Link Selection to Character
                </div>
                <select
                  value={selectedCharacterId}
                  onChange={(e) => setSelectedCharacterId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border bg-white hover:bg-gray-50 transition-colors text-sm mb-2"
                >
                  <option value="">Select character...</option>
                  {characters
                    .sort((a, b) => {
                      const roleOrder: Record<string, number> = {
                        protagonist: 1,
                        antagonist: 2,
                        deuteragonist: 3,
                        "love-interest": 4,
                        mentor: 5,
                        sidekick: 6,
                        foil: 7,
                        supporting: 8,
                        minor: 9,
                      };
                      return (
                        (roleOrder[a.role] || 999) - (roleOrder[b.role] || 999)
                      );
                    })
                    .map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name} ({char.role})
                      </option>
                    ))}
                </select>
                <button
                  onClick={linkSelectedTextToCharacter}
                  disabled={!selectedCharacterId}
                  className="w-full px-3 py-1.5 rounded transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: selectedCharacterId
                      ? palette.accent
                      : palette.subtle,
                    color: selectedCharacterId ? "white" : palette.navy,
                    border: `1px solid ${
                      selectedCharacterId ? palette.accent : palette.lightBorder
                    }`,
                  }}
                >
                  🔗 Link Selected Text
                </button>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    marginTop: "8px",
                    fontStyle: "italic",
                  }}
                >
                  Select text in editor, then click Link
                </div>
              </div>
            </>
          )}

          {(!characters || characters.length === 0) && (
            <div
              style={{
                fontSize: "12px",
                color: "#888",
                fontStyle: "italic",
              }}
            >
              No characters yet. Click above to add some!
            </div>
          )}
        </div>
      )}

      {/* Sprint Timer Display */}
      {sprintMode && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "16px 24px",
            backgroundColor: "#10b981",
            color: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            zIndex: 1100,
            fontSize: "24px",
            fontWeight: 700,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div>
            {Math.floor(sprintTimeRemaining / 60)}:
            {String(sprintTimeRemaining % 60).padStart(2, "0")}
          </div>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>
            {statistics.words - sprintStartWords} words written
          </div>
          <button
            onClick={stopSprint}
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "6px",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Stop Sprint
          </button>
        </div>
      )}

      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            style={{ border: "2px solid #fbbf24" }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🔖</span> Add Bookmark
            </h3>
            {selectedTextForBookmark ? (
              <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
                <div className="text-xs text-amber-700 mb-1">
                  Selected text:
                </div>
                <div className="text-sm text-gray-700 italic">
                  "{selectedTextForBookmark.substring(0, 100)}
                  {selectedTextForBookmark.length > 100 ? "..." : ""}"
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-500 italic">
                No text selected. Select text in the editor first to bookmark a
                specific passage.
              </div>
            )}
            <input
              type="text"
              value={newBookmarkName}
              onChange={(e) => setNewBookmarkName(e.target.value)}
              placeholder="Bookmark name (e.g., 'Important plot point')"
              className="w-full px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  newBookmarkName.trim() &&
                  selectedTextForBookmark
                )
                  addBookmark();
                if (e.key === "Escape") setShowBookmarkModal(false);
              }}
            />
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-gray-600">Color:</label>
              <div className="flex gap-2">
                {[
                  "#fbbf24",
                  "#ef4444",
                  "#22c55e",
                  "#3b82f6",
                  "#a855f7",
                  "#ec4899",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewBookmarkColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      newBookmarkColor === color
                        ? "scale-125 border-gray-800"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowBookmarkModal(false);
                  setNewBookmarkName("");
                  setSelectedTextForBookmark("");
                }}
                className="px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addBookmark}
                disabled={!newBookmarkName.trim() || !selectedTextForBookmark}
                className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Bookmark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Reference Modal */}
      {showCrossRefModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            style={{ border: "2px solid #a855f7" }}
          >
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <span>🔗</span> Add Cross-Reference
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Link this passage to a bookmarked scene (foreshadowing, callbacks,
              related elements)
            </p>
            {selectedTextForBookmark ? (
              <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
                <div className="text-xs text-purple-700 mb-1">Source text:</div>
                <div className="text-sm text-gray-700 italic">
                  "{selectedTextForBookmark.substring(0, 100)}
                  {selectedTextForBookmark.length > 100 ? "..." : ""}"
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-500 italic">
                No text selected. Select text to mark as a reference point.
              </div>
            )}
            <input
              type="text"
              value={newCrossRefName}
              onChange={(e) => setNewCrossRefName(e.target.value)}
              placeholder="Reference name (e.g., 'Foreshadows ending')"
              className="w-full px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            {bookmarks.length > 0 ? (
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">
                  Links to bookmark:
                </label>
                <select
                  value={newCrossRefTarget}
                  onChange={(e) => setNewCrossRefTarget(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a bookmark...</option>
                  {bookmarks.map((bm) => (
                    <option key={bm.id} value={bm.id}>
                      🔖 {bm.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="text-sm text-yellow-700 mb-2">
                  ⚠️ No bookmarks yet. Create bookmarks first to link passages
                  together.
                </div>
                <button
                  onClick={() => {
                    setShowCrossRefModal(false);
                    setShowBookmarkModal(true);
                  }}
                  className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                >
                  🔖 Create a Bookmark First
                </button>
              </div>
            )}
            <textarea
              value={newCrossRefNote}
              onChange={(e) => setNewCrossRefNote(e.target.value)}
              placeholder="Notes (optional) - e.g., 'This scene connects to...'"
              className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCrossRefModal(false);
                  setNewCrossRefName("");
                  setNewCrossRefTarget("");
                  setNewCrossRefNote("");
                  setSelectedTextForBookmark("");
                }}
                className="px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCrossReference}
                disabled={
                  !newCrossRefName.trim() ||
                  !selectedTextForBookmark ||
                  !newCrossRefTarget
                }
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !selectedTextForBookmark
                    ? "Select text in editor first"
                    : !newCrossRefName.trim()
                    ? "Enter a reference name"
                    : !newCrossRefTarget
                    ? "Select a bookmark to link to"
                    : "Create cross-reference"
                }
              >
                Add Reference
              </button>
            </div>
            {/* Help text showing what's needed */}
            {(!selectedTextForBookmark ||
              !newCrossRefName.trim() ||
              !newCrossRefTarget) && (
              <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                <strong>To add a reference:</strong>
                <ul className="mt-1 ml-4 list-disc space-y-0.5">
                  {!selectedTextForBookmark && (
                    <li className="text-red-500">Select text in the editor</li>
                  )}
                  {!newCrossRefName.trim() && (
                    <li className="text-red-500">
                      Enter a reference name above
                    </li>
                  )}
                  {bookmarks.length === 0 && (
                    <li className="text-red-500">
                      Create a bookmark first (🔖 button)
                    </li>
                  )}
                  {bookmarks.length > 0 && !newCrossRefTarget && (
                    <li className="text-red-500">
                      Select a bookmark to link to
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookmarks & Cross-References Panel */}
      {showBookmarksPanel && (
        <div
          className="fixed right-4 top-20 bg-white rounded-lg shadow-2xl z-[90] overflow-hidden"
          style={{
            width: "320px",
            maxHeight: "70vh",
            border: "2px solid #e0c392",
          }}
        >
          <div className="p-3 bg-gradient-to-r from-[#fef5e7] to-[#fff7ed] border-b flex items-center justify-between">
            <h3 className="font-semibold text-[#2c3e50]">
              📋 Bookmarks & References
            </h3>
            <button
              onClick={() => setShowBookmarksPanel(false)}
              className="text-gray-500 hover:text-gray-700 text-lg"
            >
              ×
            </button>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(70vh - 50px)" }}
          >
            {/* Bookmarks Section */}
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 mb-2">
                <span>🔖</span>
                <span className="font-medium text-sm text-gray-700">
                  Bookmarks ({bookmarks.length})
                </span>
              </div>
              {bookmarks.length === 0 ? (
                <div className="text-xs text-gray-500 italic py-2">
                  No bookmarks yet. Select text and click 🔖 to add one.
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="p-2 rounded border hover:bg-gray-50 cursor-pointer group"
                      style={{ borderLeft: `4px solid ${bookmark.color}` }}
                      onClick={() => jumpToBookmark(bookmark)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {bookmark.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBookmark(bookmark.id);
                          }}
                          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate italic">
                        "{bookmark.selectedText.substring(0, 60)}
                        {bookmark.selectedText.length > 60 ? "..." : ""}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cross-References Section */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <span>🔗</span>
                <span className="font-medium text-sm text-gray-700">
                  Cross-References ({crossReferences.length})
                </span>
              </div>
              {crossReferences.length === 0 ? (
                <div className="text-xs text-gray-500 italic py-2">
                  No cross-references yet. Link related scenes or foreshadowing
                  elements.
                </div>
              ) : (
                <div className="space-y-2">
                  {crossReferences.map((crossRef) => {
                    const targetBookmark = bookmarks.find(
                      (b) => b.id === crossRef.targetBookmarkId
                    );
                    return (
                      <div
                        key={crossRef.id}
                        className="p-2 rounded border border-purple-200 bg-purple-50 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-purple-800">
                            {crossRef.name}
                          </span>
                          <button
                            onClick={() => deleteCrossReference(crossRef.id)}
                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 mt-1 italic">
                          "{crossRef.sourceText.substring(0, 40)}
                          {crossRef.sourceText.length > 40 ? "..." : ""}"
                        </div>
                        {targetBookmark && (
                          <div
                            className="text-xs mt-2 flex items-center gap-1 text-amber-700 cursor-pointer hover:underline"
                            onClick={() => jumpToBookmark(targetBookmark)}
                          >
                            <span>→</span>
                            <span style={{ color: targetBookmark.color }}>
                              🔖
                            </span>
                            <span>{targetBookmark.name}</span>
                          </div>
                        )}
                        {crossRef.note && (
                          <div className="text-xs text-gray-500 mt-1 bg-white rounded px-2 py-1">
                            {crossRef.note}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styles Panel Modal */}
      {showStylesPanel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[100] p-4 pt-16 overflow-y-auto"
          onClick={() => setShowStylesPanel(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col"
            style={{ border: "2px solid #e0c392" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b bg-gradient-to-r from-[#fef5e7] to-[#fff7ed] flex-shrink-0">
              <h2 className="text-lg font-bold text-[#2c3e50]">
                Modify Styles
              </h2>
            </div>

            <div className="p-3 overflow-y-auto flex-1">
              {/* Paragraph Style */}
              <div className="mb-4 p-3 border rounded-lg bg-[#fef5e7]">
                <h3 className="font-semibold text-[#2c3e50] mb-2 text-sm flex items-center gap-2">
                  <span>¶</span> Paragraph
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Indent (px)
                    </label>
                    <input
                      type="number"
                      value={documentStyles.paragraph.firstLineIndent}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          paragraph: {
                            ...prev.paragraph,
                            firstLineIndent: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-[#ef8432]"
                      min="0"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Line Height
                    </label>
                    <select
                      value={documentStyles.paragraph.lineHeight}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          paragraph: {
                            ...prev.paragraph,
                            lineHeight: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-[#ef8432]"
                    >
                      <option value="1">Single</option>
                      <option value="1.15">1.15</option>
                      <option value="1.5">1.5</option>
                      <option value="2">Double</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      After (em)
                    </label>
                    <input
                      type="number"
                      value={documentStyles.paragraph.marginBottom}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          paragraph: {
                            ...prev.paragraph,
                            marginBottom: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-[#ef8432]"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Align
                    </label>
                    <select
                      value={documentStyles.paragraph.textAlign}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          paragraph: {
                            ...prev.paragraph,
                            textAlign: e.target.value as
                              | "left"
                              | "center"
                              | "right"
                              | "justify",
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-[#ef8432]"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                      <option value="justify">Justify</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Title Style */}
              <div className="mb-4 p-3 border rounded-lg bg-[#fef5e7]">
                <h3 className="font-semibold text-[#2c3e50] mb-2 text-sm flex items-center gap-2">
                  <span>T</span> Title
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Size (px)
                    </label>
                    <input
                      type="number"
                      value={documentStyles.title.fontSize}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          title: {
                            ...prev.title,
                            fontSize: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-[#ef8432]"
                      min="12"
                      max="72"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Weight
                    </label>
                    <select
                      value={documentStyles.title.fontWeight}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          title: {
                            ...prev.title,
                            fontWeight: e.target.value as "normal" | "bold",
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-[#ef8432]"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Align
                    </label>
                    <select
                      value={documentStyles.title.textAlign}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          title: {
                            ...prev.title,
                            textAlign: e.target.value as
                              | "left"
                              | "center"
                              | "right"
                              | "justify",
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-[#ef8432]"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      After (em)
                    </label>
                    <input
                      type="number"
                      value={documentStyles.title.marginBottom}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          title: {
                            ...prev.title,
                            marginBottom: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-[#ef8432]"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Heading Styles */}
              <div className="mb-4 p-3 border rounded-lg bg-[#fef5e7]">
                <h3 className="font-semibold text-[#2c3e50] mb-2 text-sm">
                  Headings
                </h3>
                {["heading1", "heading2", "heading3"].map((heading, idx) => (
                  <div key={heading} className="mb-2 last:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600 w-10">
                        H{idx + 1}
                      </span>
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        <input
                          type="number"
                          value={
                            (
                              documentStyles[
                                heading as keyof typeof documentStyles
                              ] as any
                            ).fontSize
                          }
                          onChange={(e) =>
                            setDocumentStyles((prev) => ({
                              ...prev,
                              [heading]: {
                                ...(prev as any)[heading],
                                fontSize: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                          title="Font Size (px)"
                          placeholder="Size"
                          min="12"
                          max="48"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400">
                          Wt
                        </label>
                        <select
                          value={
                            (
                              documentStyles[
                                heading as keyof typeof documentStyles
                              ] as any
                            ).fontWeight
                          }
                          onChange={(e) =>
                            setDocumentStyles((prev) => ({
                              ...prev,
                              [heading]: {
                                ...(prev as any)[heading],
                                fontWeight: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-1 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400">
                          Before
                        </label>
                        <input
                          type="number"
                          value={
                            (
                              documentStyles[
                                heading as keyof typeof documentStyles
                              ] as any
                            ).marginTop
                          }
                          onChange={(e) =>
                            setDocumentStyles((prev) => ({
                              ...prev,
                              [heading]: {
                                ...(prev as any)[heading],
                                marginTop: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-1 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                          min="0"
                          max="5"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400">
                          After
                        </label>
                        <input
                          type="number"
                          value={
                            (
                              documentStyles[
                                heading as keyof typeof documentStyles
                              ] as any
                            ).marginBottom
                          }
                          onChange={(e) =>
                            setDocumentStyles((prev) => ({
                              ...prev,
                              [heading]: {
                                ...(prev as any)[heading],
                                marginBottom: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-1 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                          min="0"
                          max="5"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400">
                          Align
                        </label>
                        <select
                          value={
                            (
                              documentStyles[
                                heading as keyof typeof documentStyles
                              ] as any
                            ).textAlign || "left"
                          }
                          onChange={(e) =>
                            setDocumentStyles((prev) => ({
                              ...prev,
                              [heading]: {
                                ...(prev as any)[heading],
                                textAlign: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-1 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blockquote Style */}
              <div className="mb-3 p-2 border rounded-lg bg-[#fef5e7]">
                <h3 className="font-medium text-sm text-[#2c3e50] mb-2 flex items-center gap-2">
                  <span>"</span> Block Quote
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400">Style</label>
                    <select
                      value={documentStyles.blockquote.fontStyle}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          blockquote: {
                            ...prev.blockquote,
                            fontStyle: e.target.value as "normal" | "italic",
                          },
                        }))
                      }
                      className="w-full px-1 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">
                      Indent
                    </label>
                    <input
                      type="number"
                      value={documentStyles.blockquote.marginLeft}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          blockquote: {
                            ...prev.blockquote,
                            marginLeft: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-1 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">
                      Border
                    </label>
                    <input
                      type="number"
                      value={documentStyles.blockquote.borderLeftWidth}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          blockquote: {
                            ...prev.blockquote,
                            borderLeftWidth: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-1 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400">Color</label>
                    <input
                      type="color"
                      value={documentStyles.blockquote.borderLeftColor}
                      onChange={(e) =>
                        setDocumentStyles((prev) => ({
                          ...prev,
                          blockquote: {
                            ...prev.blockquote,
                            borderLeftColor: e.target.value,
                          },
                        }))
                      }
                      className="w-full h-6 px-1 border rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Header & Footer */}
              <div className="mb-3 p-2 border rounded-lg bg-[#fef5e7]">
                <h3 className="font-medium text-sm text-[#2c3e50] mb-2 flex items-center gap-2">
                  📄 Header & Footer
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400">
                        Header
                      </label>
                      <input
                        type="text"
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="Header text"
                        className="w-full px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400">
                        Align
                      </label>
                      <select
                        value={headerAlign}
                        onChange={(e) =>
                          setHeaderAlign(
                            e.target.value as
                              | "left"
                              | "center"
                              | "right"
                              | "justify"
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                        <option value="justify">Justify</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400">
                        Footer
                      </label>
                      <input
                        type="text"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        placeholder="Footer text"
                        className="w-full px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400">
                        Align
                      </label>
                      <select
                        value={footerAlign}
                        onChange={(e) =>
                          setFooterAlign(
                            e.target.value as
                              | "left"
                              | "center"
                              | "right"
                              | "justify"
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                        <option value="justify">Justify</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPageNumbers}
                        onChange={(e) => setShowPageNumbers(e.target.checked)}
                        className="w-3 h-3 rounded border-gray-300 text-[#ef8432] focus:ring-[#ef8432]"
                      />
                      <span className="text-gray-600">Page #s</span>
                    </label>
                    {showPageNumbers && (
                      <>
                        <select
                          value={pageNumberPosition}
                          onChange={(e) =>
                            setPageNumberPosition(
                              e.target.value as "header" | "footer"
                            )
                          }
                          className="px-1 py-0.5 border rounded text-xs focus:ring-1 focus:ring-[#ef8432]"
                        >
                          <option value="header">In Header</option>
                          <option value="footer">In Footer</option>
                        </select>
                        <label
                          className="flex items-center gap-1 cursor-pointer"
                          title="Alternate page numbers on outside edges (left on even pages, right on odd pages)"
                        >
                          <input
                            type="checkbox"
                            checked={facingPages}
                            onChange={(e) => setFacingPages(e.target.checked)}
                            className="w-3 h-3 rounded border-gray-300 text-[#ef8432] focus:ring-[#ef8432]"
                          />
                          <span className="text-gray-600">Facing Pages</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => {
                  // Reset to defaults
                  setDocumentStyles({
                    paragraph: {
                      firstLineIndent: 32,
                      lineHeight: 1.5,
                      marginBottom: 0.5,
                      textAlign: "left",
                    },
                    title: {
                      fontSize: 24,
                      fontWeight: "bold",
                      textAlign: "center",
                      marginBottom: 0.5,
                    },
                    heading1: {
                      fontSize: 28,
                      fontWeight: "bold",
                      textAlign: "left",
                      marginTop: 1.5,
                      marginBottom: 0.8,
                    },
                    heading2: {
                      fontSize: 22,
                      fontWeight: "bold",
                      textAlign: "left",
                      marginTop: 1.2,
                      marginBottom: 0.6,
                    },
                    heading3: {
                      fontSize: 18,
                      fontWeight: "bold",
                      textAlign: "left",
                      marginTop: 1,
                      marginBottom: 0.5,
                    },
                    blockquote: {
                      fontStyle: "italic",
                      marginLeft: 40,
                      borderLeftWidth: 4,
                      borderLeftColor: "#e0c392",
                    },
                  });
                  setHeaderText("");
                  setFooterText("");
                  setShowPageNumbers(true);
                  setPageNumberPosition("footer");
                  setHeaderAlign("center");
                  setFooterAlign("center");
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Reset to Defaults
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Apply styles to CSS variables and close
                    if (editorRef.current) {
                      editorRef.current.style.setProperty(
                        "--first-line-indent",
                        `${documentStyles.paragraph.firstLineIndent}px`
                      );
                    }
                    setShowStylesPanel(false);
                  }}
                  className="px-3 py-1.5 text-sm bg-[#ef8432] text-white rounded hover:bg-[#d97320] transition-colors"
                >
                  Apply Styles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Find & Replace Panel */}
      {showFindReplace && (
        <div className="border-b bg-yellow-50 p-3 flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Find..."
            className="px-3 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") findInText();
              if (e.key === "Escape") setShowFindReplace(false);
            }}
          />
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace with..."
            className="px-3 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowFindReplace(false);
            }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={findInText}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              disabled={!findText}
            >
              Find Next
            </button>
            {findMatches.length > 0 && (
              <span className="text-xs text-gray-600">
                {Math.max(0, currentMatchIndex + 1)} / {findMatches.length}
              </span>
            )}
          </div>
          <button
            onClick={replaceOne}
            disabled={!findText}
            className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Replace
          </button>
          <button
            onClick={replaceInText}
            disabled={!findText}
            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Replace All
          </button>
          <button
            onClick={() => setShowFindReplace(false)}
            className="px-3 py-1.5 hover:bg-gray-200 text-gray-700 rounded transition-colors text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* Editor area with page view - tan background with white pages */}
      <div
        className="writer-stage"
        style={{
          position: "relative",
          minHeight: 0,
          flex: 1,
          backgroundColor: "#eddcc5",
          marginTop:
            viewMode === "writer" && !showFindReplace ? "-12px" : "0px",
        }}
      >
        {/* Page Rail - absolutely positioned to not affect centering */}
        {showThumbnailRail && !focusMode && (
          <aside
            ref={pageRailRef}
            className="page-thumbnail-rail hide-scrollbar"
            style={{
              position: "absolute",
              left: "8px",
              top: "8px",
              bottom: "8px",
              width: "220px",
              zIndex: 10,
              borderRadius: "18px",
              border: "1px solid #e0c392",
              background:
                "linear-gradient(180deg, rgba(254,245,231,0.98), rgba(247,230,208,0.92))",
              boxShadow: "0 16px 32px rgba(44, 62, 80, 0.12)",
              padding: "16px 12px",
              paddingBottom: "16px",
              overflowY: "auto",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#92400e]">
                Page Rail
              </div>
              <span className="text-[11px] text-[#6b7280]">
                {pageCount} {pageCount === 1 ? "Page" : "Pages"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: pageCount }, (_, index) => {
                const snippet = pageSnippets[index] || "";
                const isActive = index === activePage;
                return (
                  <button
                    key={`thumbnail-${index}`}
                    type="button"
                    onClick={() =>
                      jumpToPage(index, { suppressSelectionSync: true })
                    }
                    className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                    style={{
                      border: isActive
                        ? "2px solid #ef8432"
                        : "1px solid #f5d1ab",
                      borderRadius: "16px",
                      padding: "10px",
                      backgroundColor: isActive ? "#fff" : "#fefdf9",
                      boxShadow: isActive
                        ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                        : "0 6px 14px rgba(44, 62, 80, 0.08)",
                      transition: "border 0.2s ease, box-shadow 0.2s ease",
                      cursor: "pointer",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#2c3e50]">
                        Page {index + 1}
                      </span>
                      {isActive && (
                        <span className="text-[10px] text-[#ef8432] font-semibold">
                          Live
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        border: "1px solid rgba(224,195,146,0.9)",
                        aspectRatio: "8.5 / 11",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: "8px",
                          fontSize: "10px",
                          lineHeight: 1.25,
                          color: "#374151",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {snippet || "Start writing to fill this page."}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Advanced Tools Rail - Right Side */}
        {showThumbnailRail && !focusMode && (
          <aside
            className="advanced-tools-rail hide-scrollbar"
            style={{
              position: "absolute",
              right: "8px",
              top: "8px",
              bottom: "8px",
              width: "220px",
              zIndex: 10,
              borderRadius: "18px",
              border: "1px solid #e0c392",
              background:
                "linear-gradient(180deg, rgba(254,245,231,0.98), rgba(247,230,208,0.92))",
              boxShadow: "0 16px 32px rgba(44, 62, 80, 0.12)",
              padding: "16px 12px",
              paddingBottom: "16px",
              overflowY: "auto",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#92400e]">
                Advanced Tools
              </div>
              <span className="text-[11px] text-[#6b7280]">17 Tools</span>
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-[#92400e] mb-2 mt-1">
              Analysis Tools
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveTool("ai-assistant")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "ai-assistant"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "ai-assistant" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "ai-assistant"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== "ai-assistant") {
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(44, 62, 80, 0.15)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== "ai-assistant") {
                    e.currentTarget.style.boxShadow =
                      "0 6px 14px rgba(44, 62, 80, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">✨</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    AI Assistant
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Get suggestions and completions
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTool("dialogue")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "dialogue"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "dialogue" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "dialogue"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== "dialogue") {
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(44, 62, 80, 0.15)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== "dialogue") {
                    e.currentTarget.style.boxShadow =
                      "0 6px 14px rgba(44, 62, 80, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">💬</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Dialogue
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Analyze dialogue flow
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTool("readability")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "readability"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "readability" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "readability"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (activeTool !== "readability") {
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(44, 62, 80, 0.15)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTool !== "readability") {
                    e.currentTarget.style.boxShadow =
                      "0 6px 14px rgba(44, 62, 80, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📊</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Readability
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Check reading level
                </div>
              </button>
              {/* Cliché Detector */}
              <button
                type="button"
                onClick={() => setActiveTool("cliche")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "cliche"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor: activeTool === "cliche" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "cliche"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🚫</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Cliché Detector
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Find overused phrases
                </div>
              </button>
              {/* Beat Sheet */}
              <button
                type="button"
                onClick={() => setActiveTool("beats")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "beats"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor: activeTool === "beats" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "beats"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📖</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Beat Sheet
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Story structure analysis
                </div>
              </button>
              {/* POV Checker */}
              <button
                type="button"
                onClick={() => setActiveTool("pov")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "pov"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor: activeTool === "pov" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "pov"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">👁️</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    POV Checker
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Detect perspective shifts
                </div>
              </button>
              {/* Emotion Tracker */}
              <button
                type="button"
                onClick={() => setActiveTool("emotion")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "emotion"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "emotion" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "emotion"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">💖</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Emotion Tracker
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Map emotional arcs
                </div>
              </button>
              {/* Motif Tracker */}
              <button
                type="button"
                onClick={() => setActiveTool("motif")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "motif"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor: activeTool === "motif" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "motif"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🔮</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Motif Tracker
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Find recurring themes
                </div>
              </button>
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-[#92400e] mb-2 mt-3">
              Genre Tools
            </div>
            <div className="flex flex-col gap-2">
              {/* Poetry Meter */}
              <button
                type="button"
                onClick={() => setActiveTool("poetry-meter")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "poetry-meter"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "poetry-meter" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "poetry-meter"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📖</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Poetry Meter
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Scan rhythm and rhyme schemes
                </div>
              </button>
              {/* Non-Fiction Outline */}
              <button
                type="button"
                onClick={() => setActiveTool("nonfiction-outline")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "nonfiction-outline"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "nonfiction-outline" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "nonfiction-outline"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📝</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Non-Fiction Outline
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Structure arguments and evidence
                </div>
              </button>
              {/* Citation Manager */}
              <button
                type="button"
                onClick={() => setActiveTool("citation-manager")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "citation-manager"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "citation-manager" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "citation-manager"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📚</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Citation Manager
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Format references (APA/MLA/Chicago)
                </div>
              </button>
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-[#92400e] mb-2 mt-3">
              Content Tools
            </div>
            <div className="flex flex-col gap-2">
              {/* Name Generator */}
              <button
                type="button"
                onClick={() => setActiveTool("name-generator")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "name-generator"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "name-generator" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "name-generator"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">👤</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Name Generator
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Generate names by genre & culture
                </div>
              </button>
              {/* World-Building */}
              <button
                type="button"
                onClick={() => setActiveTool("world-building")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "world-building"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "world-building" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "world-building"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🗺️</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    World-Building
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Integrated wiki for characters & places
                </div>
              </button>
              {/* Writer's Notes */}
              <button
                type="button"
                onClick={() => setActiveTool("research-notes")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "research-notes"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "research-notes" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "research-notes"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📝</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Writer's Notes
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Quick notes without leaving editor
                </div>
              </button>
              {/* Mood Board */}
              <button
                type="button"
                onClick={() => setActiveTool("mood-board")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "mood-board"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "mood-board" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "mood-board"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🖼️</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Mood Board
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Upload reference images for scenes
                </div>
              </button>
              {/* Version History */}
              <button
                type="button"
                onClick={() => setActiveTool("version-history")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "version-history"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "version-history" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "version-history"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">📜</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Version History
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Save snapshots, compare drafts
                </div>
              </button>
              {/* Comments */}
              <button
                type="button"
                onClick={() => setActiveTool("comments")}
                className="text-left focus-visible:ring-2 focus-visible:ring-[#ef8432]"
                style={{
                  border:
                    activeTool === "comments"
                      ? "2px solid #ef8432"
                      : "1px solid #f5d1ab",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    activeTool === "comments" ? "#fff" : "#fefdf9",
                  boxShadow:
                    activeTool === "comments"
                      ? "0 10px 24px rgba(239, 132, 50, 0.25)"
                      : "0 6px 14px rgba(44, 62, 80, 0.08)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">💬</span>
                  <span className="text-xs font-semibold text-[#2c3e50]">
                    Comments
                  </span>
                </div>
                <div className="text-[10px] text-[#6b7280] leading-tight">
                  Leave notes for yourself or beta readers
                </div>
              </button>
            </div>
          </aside>
        )}

        {/* Main editor area - centers the ruler/page in full viewport */}
        <div
          ref={wrapperRef}
          className="editor-wrapper page-view"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowX: "hidden",
            overflowY: "hidden",
          }}
        >
          {/* Scrollable page container - contains both ruler and page */}
          <div
            ref={scrollShellRef}
            className="hide-scrollbar"
            style={{
              flex: 1,
              width: "100%",
              overflowY: "auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              className="pages-stack-shell"
              style={{
                width: `${PAGE_WIDTH_PX}px`,
                maxWidth: "100%",
                paddingTop: "0px",
                paddingBottom: "16px",
              }}
            >
              {/* Analysis Legend - centered above the ruler */}
              {showStyleLabels &&
                (showSpacingIndicators || showVisualSuggestions) &&
                !focusMode && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                      paddingBottom: "8px",
                    }}
                  >
                    {renderAnalysisLegend()}
                  </div>
                )}
              {/* Ruler - inside the same container as the page */}
              {showRuler && (
                <div
                  ref={rulerFrameRef}
                  style={{
                    width: "100%",
                    flexShrink: 0,
                    paddingTop: 0,
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    backgroundColor: "#eddcc5",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "24px",
                      display: "flex",
                      alignItems: "flex-end",
                      marginBottom: "2px",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: `-${RULER_BACKGROUND_LEFT_OVERHANG}px`,
                        right: `-${RULER_BACKGROUND_RIGHT_OVERHANG}px`,
                        backgroundColor: "#fffaf3",
                        borderRadius: "4px",
                        border: "1px solid #e0c392",
                        boxShadow: "0 4px 12px rgba(44, 62, 80, 0.12)",
                        pointerEvents: "none",
                        zIndex: 0,
                      }}
                    />
                    <div
                      ref={rulerContainerRef}
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        userSelect: rulerDragging ? "none" : "auto",
                        cursor: rulerDragging ? "ew-resize" : "default",
                        zIndex: 1,
                      }}
                    >
                      {/* Ruler tick marks */}
                      {Array.from({ length: 9 }, (_, i) => i).map((inch) => (
                        <div
                          key={inch}
                          style={{
                            position: "absolute",
                            left: `${(inch / 8) * 100}%`,
                            bottom: 0,
                            width: "1px",
                            height: inch === 0 || inch === 8 ? "16px" : "12px",
                            backgroundColor:
                              inch === 0 || inch === 8 ? "#b45309" : "#d97706",
                          }}
                        />
                      ))}
                      {/* Half-inch marks */}
                      {Array.from({ length: 8 }, (_, i) => i).map((i) => (
                        <div
                          key={`half-${i}`}
                          style={{
                            position: "absolute",
                            left: `${((i + 0.5) / 8) * 100}%`,
                            bottom: 0,
                            width: "1px",
                            height: "8px",
                            backgroundColor: "#f59e0b",
                          }}
                        />
                      ))}
                      {/* Inch labels */}
                      {Array.from({ length: 9 }, (_, i) => i).map((inch) => (
                        <div
                          key={`label-${inch}`}
                          style={{
                            position: "absolute",
                            left: `${(inch / 8) * 100}%`,
                            top: "0px",
                            transform:
                              inch === 0
                                ? "translateX(0)"
                                : inch === 8
                                ? "translateX(-100%)"
                                : "translateX(-50%)",
                            fontSize: "9px",
                            fontWeight: 600,
                            color: "#92400e",
                          }}
                        >
                          {inch}
                        </div>
                      ))}
                      {/* Left margin indicator */}
                      <div
                        style={{
                          position: "absolute",
                          left: `${(leftMargin / PAGE_WIDTH_PX) * 100}%`,
                          top: 0,
                          bottom: 0,
                          width: "2px",
                          backgroundColor: "#ef4444",
                          cursor: "ew-resize",
                          zIndex: 2,
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setRulerDragging("left");
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "-2px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "8px",
                            height: "8px",
                            backgroundColor: "#ef4444",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                      {/* Right margin indicator */}
                      <div
                        style={{
                          position: "absolute",
                          left: `${
                            ((PAGE_WIDTH_PX - rightMargin) / PAGE_WIDTH_PX) *
                            100
                          }%`,
                          top: 0,
                          bottom: 0,
                          width: "2px",
                          backgroundColor: "#ef4444",
                          cursor: "ew-resize",
                          zIndex: 2,
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setRulerDragging("right");
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "-2px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "8px",
                            height: "8px",
                            backgroundColor: "#ef4444",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                      {/* First line indent indicator */}
                      <div
                        style={{
                          position: "absolute",
                          left: `${
                            ((leftMargin + firstLineIndent) / PAGE_WIDTH_PX) *
                            100
                          }%`,
                          top: "2px",
                          transform: "translateX(-50%)",
                          cursor: "ew-resize",
                          zIndex: 3,
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setRulerDragging("indent");
                        }}
                        title="First Line Indent"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ display: "block" }}
                        >
                          {/* Down-pointing triangle (like Word's first-line indent marker) */}
                          <path d="M6 12L0 6H4V0H8V6H12L6 12Z" fill="#2c3e50" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Legend fallback when ruler is hidden */}
              {!showRuler &&
                showStyleLabels &&
                (showSpacingIndicators || showVisualSuggestions) &&
                !(!isFreeMode && focusMode) && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      padding: "2px 8px",
                      fontSize: "9px",
                      color: "#78716c",
                    }}
                  >
                    {showSpacingIndicators && (
                      <>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            marginRight: "8px",
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              backgroundColor: "#3b82f6",
                              display: "inline-block",
                            }}
                          />
                          Short
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            marginRight: "8px",
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              backgroundColor: "#f97316",
                              display: "inline-block",
                            }}
                          />
                          Long
                        </span>
                      </>
                    )}
                    {showVisualSuggestions && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "2px",
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            backgroundColor: "#eab308",
                            display: "inline-block",
                          }}
                        />
                        Senses
                      </span>
                    )}
                  </div>
                )}

              <div
                ref={pagesContainerRef}
                className="pages-container"
                style={{
                  width: "100%",
                  position: "relative",
                }}
              >
                {/* Spacing indicators - inside pages container for natural scrolling */}
                {renderIndicators()}

                {/* Visual suggestions - inside pages container for natural scrolling */}
                {renderSuggestions()}

                {/* The actual editable content - single continuous page */}
                <div
                  ref={editorRef}
                  contentEditable={isEditable}
                  onInput={handleInput}
                  onPaste={handlePaste}
                  onKeyDown={handleKeyDown}
                  className={`editor-content page-editor focus:outline-none ${
                    className || ""
                  }`}
                  style={{
                    width: "100%",
                    minHeight: `${PAGE_HEIGHT_PX}px`,
                    paddingLeft: `${leftMargin}px`,
                    paddingRight: `${rightMargin}px`,
                    paddingTop: `${INCH_IN_PX}px`,
                    paddingBottom: `${INCH_IN_PX}px`,
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                    caretColor: "#2c3e50",
                    cursor: isEditable ? "text" : "default",
                    position: "relative",
                    zIndex: 5,
                    boxShadow:
                      "0 14px 32px rgba(44, 62, 80, 0.16), 0 2px 6px rgba(44, 62, 80, 0.08)",
                    borderRadius: "2px",
                    // CSS variable for dynamic text-indent
                    ["--first-line-indent" as string]: `${documentStyles.paragraph.firstLineIndent}px`,
                  }}
                  suppressContentEditableWarning
                />

                {/* Page break lines (visual indicators only) */}
                {pageCount > 1 &&
                  Array.from({ length: pageCount - 1 }, (_, i) => (
                    <div
                      key={`page-break-${i}`}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: `${(i + 1) * PAGE_HEIGHT_PX}px`,
                        height: "1px",
                        borderTop: "1px dashed #e0c392",
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    >
                      {/* Page number indicator */}
                      <div
                        style={{
                          position: "absolute",
                          right: "8px",
                          top: "-20px",
                          fontSize: "10px",
                          color: "#9ca3af",
                          backgroundColor: "#ffffff",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        End of page {i + 1}
                      </div>
                    </div>
                  ))}

                {/* Legacy footer with page numbers (when showHeaderFooter is off but page numbers are on) */}
                {!showHeaderFooter &&
                  showPageNumbers &&
                  Array.from({ length: pageCount }, (_, pageIndex) => {
                    const isEvenPage = pageIndex % 2 === 0;
                    const alignment = facingPages
                      ? isEvenPage
                        ? "left"
                        : "right"
                      : "center";

                    return (
                      <div
                        key={`footer-${pageIndex}`}
                        style={{
                          position: "absolute",
                          left: `${leftMargin}px`,
                          right: `${rightMargin}px`,
                          top: `${
                            (pageIndex + 1) * PAGE_HEIGHT_PX - INCH_IN_PX * 0.6
                          }px`,
                          textAlign: alignment,
                          fontSize: "11px",
                          color: "#6b7280",
                          pointerEvents: "none",
                          zIndex: 5,
                          paddingLeft: alignment === "left" ? "8px" : "0",
                          paddingRight: alignment === "right" ? "8px" : "0",
                        }}
                      >
                        {pageIndex + 1}
                      </div>
                    );
                  })}
              </div>
            </div>
            {/* End pages-container and pages-stack-shell */}
          </div>
          {/* End scrollable page container */}
        </div>
      </div>

      <style
        key={`editor-styles-${documentStyles.paragraph.firstLineIndent}-${documentStyles.paragraph.lineHeight}`}
      >{`
        .editor-content {
          color: #000000;
        }
        /* Page editor styling */
        .page-editor {
          position: relative;
          background-color: #ffffff;
        }
        /* Pages container */
        .pages-container {
          position: relative;
        }
        /* Apply text-indent to all block-level children for first line indent */
        .editor-content > p,
        .editor-content > div:not(.toc-placeholder):not(.index-placeholder) {
          margin: ${documentStyles.paragraph.marginBottom}em 0;
          line-height: ${documentStyles.paragraph.lineHeight};
          text-indent: ${documentStyles.paragraph.firstLineIndent}px;
          text-align: ${documentStyles.paragraph.textAlign};
        }
        .editor-content p {
          margin: ${documentStyles.paragraph.marginBottom}em 0;
          line-height: ${documentStyles.paragraph.lineHeight};
          text-indent: ${documentStyles.paragraph.firstLineIndent}px;
          text-align: ${documentStyles.paragraph.textAlign};
        }
        .editor-content p.body-text {
          text-indent: ${documentStyles.paragraph.firstLineIndent}px !important;
          line-height: ${documentStyles.paragraph.lineHeight} !important;
        }
        /* Screenplay block formatting - highest priority */
        .editor-content p.screenplay-block {
          text-indent: 0 !important;
          font-family: "Courier Prime", "Courier New", Courier, monospace !important;
          font-size: 16px !important;
          line-height: 1.35 !important;
          margin: 0 !important;
          margin-bottom: 12px !important;
          white-space: pre-wrap !important;
          max-width: 700px !important;
        }
        .editor-content p.screenplay-block.scene-heading {
          font-weight: bold !important;
          text-transform: uppercase !important;
          margin-top: 20px !important;
          margin-bottom: 12px !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        .editor-content p.screenplay-block.character {
          margin-left: auto !important;
          margin-right: auto !important;
          margin-top: 20px !important;
          margin-bottom: 4px !important;
          text-transform: uppercase !important;
          font-weight: bold !important;
          text-align: center !important;
          width: 100% !important;
          letter-spacing: 1px !important;
        }
        .editor-content p.screenplay-block.dialogue {
          margin-left: auto !important;
          margin-right: auto !important;
          margin-bottom: 16px !important;
          margin-top: 0 !important;
          width: 50% !important;
          text-align: left !important;
        }
        .editor-content p.screenplay-block.parenthetical {
          margin-left: auto !important;
          margin-right: auto !important;
          margin-bottom: 10px !important;
          margin-top: 0 !important;
          width: 40% !important;
          font-style: italic !important;
          text-align: center !important;
        }
        .editor-content p.screenplay-block.action {
          margin-left: 0 !important;
          margin-right: 0 !important;
          margin-bottom: 12px !important;
          margin-top: 0 !important;
        }
        /* Center action blocks at the start (title page) - before first scene heading */
        .screenplay-block.action {
          text-align: left !important;
        }
        .screenplay-block.scene-heading ~ .screenplay-block.action {
          text-align: left !important;
        }
        .screenplay-block.action:not(.screenplay-block.scene-heading ~ .screenplay-block.action) {
          text-align: center !important;
        }
        .editor-content p.screenplay-block.transition {
          text-align: right !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          text-transform: uppercase !important;
        }
        .editor-content p.screenplay-block.spacer {
          height: 1rem !important;
          margin: 0 !important;
          margin-bottom: 0 !important;
          text-indent: 0 !important;
        }
        .editor-content p:first-child {
          margin-top: 0;
        }
        /* Center images */
        .editor-content img {
          display: block !important;
          margin-left: auto !important;
          margin-right: auto !important;
          margin-top: 1em !important;
          margin-bottom: 1em !important;
          max-width: 100%;
        }
        /* Center paragraphs containing images */
        .editor-content p > img {
          display: block !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        /* Center title paragraphs that only contain bold/strong text */
        .editor-content p:has(> strong:only-child),
        .editor-content p:has(> em:only-child),
        .editor-content p:has(> strong > em:only-child) {
          text-align: center;
          text-indent: 0 !important;
        }
        /* Center short paragraphs (likely titles/headings) - under 100 characters */
        .editor-content p:has(> strong) {
          /* Only center if it's short text (title-like) */
        }
        /* Reset body text to left-align with indent */
        .editor-content p:not(:has(> strong:only-child)):not(:has(> em:only-child)):not(:has(> strong > em:only-child)) {
          text-align: left;
        }
        /* Center paragraphs that only contain images */
        .editor-content p:has(> img:only-child) {
          text-align: center;
          text-indent: 0 !important;
        }
        /* Title page content - centered, no indent */
        .editor-content p.title-content {
          text-align: ${documentStyles.title.textAlign} !important;
          text-indent: 0 !important;
          font-size: ${documentStyles.title.fontSize * 0.85}px !important;
          margin: ${documentStyles.title.marginBottom * 0.7}em 0 !important;
          position: relative;
        }
        .editor-content p.book-title {
          text-align: ${documentStyles.title.textAlign} !important;
          text-indent: 0 !important;
          font-size: ${documentStyles.title.fontSize}px !important;
          font-weight: ${documentStyles.title.fontWeight} !important;
          margin: ${documentStyles.title.marginBottom}em 0 !important;
          margin-top: 1.5em !important;
          position: relative;
          overflow: visible !important;
        }
        .editor-content p.subtitle {
          text-align: ${documentStyles.title.textAlign} !important;
          text-indent: 0 !important;
          font-size: ${documentStyles.title.fontSize * 0.7}px !important;
          font-style: italic !important;
          margin: 0.3em 0 !important;
          position: relative;
        }
        .editor-content p.chapter-heading {
          text-align: center !important;
          text-indent: 0 !important;
          font-weight: bold;
          font-size: 1.2em;
          margin: 1.5em 0 0.8em 0 !important;
          position: relative;
        }
        .editor-content p.image-paragraph {
          text-align: center !important;
          text-indent: 0 !important;
          margin: 1em 0 !important;
        }
        .editor-content p.body-text {
          text-align: ${documentStyles.paragraph.textAlign} !important;
          text-indent: ${documentStyles.paragraph.firstLineIndent}px !important;
        }
        /* Copyright/boilerplate text (all caps, short lines) */
        .editor-content p:has(> strong:only-child):not(:has(em)),
        .editor-content p > strong:only-child {
          text-align: center;
        }
        /* Also center paragraphs with strong at start and only a few words (likely titles) */
        .editor-content p > strong:first-child:last-child {
          display: block;
          text-align: center;
        }
        .editor-content h1 {
          font-size: ${documentStyles.heading1.fontSize}px;
          font-weight: ${documentStyles.heading1.fontWeight};
          text-align: ${documentStyles.heading1.textAlign || "left"};
          margin: ${documentStyles.heading1.marginTop}em 0 ${
        documentStyles.heading1.marginBottom
      }em 0;
          position: relative;
        }
        .editor-content h2 {
          font-size: ${documentStyles.heading2.fontSize}px;
          font-weight: ${documentStyles.heading2.fontWeight};
          text-align: ${documentStyles.heading2.textAlign || "left"};
          margin: ${documentStyles.heading2.marginTop}em 0 ${
        documentStyles.heading2.marginBottom
      }em 0;
          position: relative;
        }
        .editor-content h3 {
          font-size: ${documentStyles.heading3.fontSize}px;
          font-weight: ${documentStyles.heading3.fontWeight};
          text-align: ${documentStyles.heading3.textAlign || "left"};
          margin: ${documentStyles.heading3.marginTop}em 0 ${
        documentStyles.heading3.marginBottom
      }em 0;
          position: relative;
        }

        /* Labels for styled elements - conditional on showStyleLabels */
        .editor-content h1::before {
          content: "H1";
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          background: #fef5e7;
          color: #ef8432;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e0c392;
          pointer-events: none;
          transition: background 0.2s;
          display: ${showStyleLabels ? "block" : "none"};
        }
        .editor-content h1:hover::before {
          background: #f7e6d0;
        }
        .editor-content h2::before {
          content: "H2";
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          background: #fef5e7;
          color: #ef8432;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e0c392;
          pointer-events: none;
          transition: background 0.2s;
          display: ${showStyleLabels ? "block" : "none"};
        }
        .editor-content h2:hover::before {
          background: #f7e6d0;
        }
        .editor-content h3::before {
          content: "H3";
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          background: #fef5e7;
          color: #ef8432;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e0c392;
          pointer-events: none;
          transition: background 0.2s;
          display: ${showStyleLabels ? "block" : "none"};
        }
        .editor-content h3:hover::before {
          background: #f7e6d0;
        }
        .editor-content p.chapter-heading::before {
          content: "CH";
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          background: #fef5e7;
          color: #2c3e50;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e0c392;
          pointer-events: none;
          white-space: nowrap;
          transition: background 0.2s;
          display: ${showStyleLabels ? "block" : "none"};
        }
        .editor-content p.chapter-heading:hover::before {
          background: #f7e6d0;
        }
        .editor-content p.title-content::before {
          content: "T";
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          background: #fef5e7;
          color: #6b7280;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e0c392;
          pointer-events: none;
          white-space: nowrap;
          transition: background 0.2s;
          display: ${showStyleLabels ? "block" : "none"};
        }
        .editor-content p.title-content:hover::before {
          background: #f7e6d0;
        }
        .editor-content p.subtitle::before {
          content: "ST";
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          background: #fef5e7;
          color: #6b7280;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e0c392;
          pointer-events: none;
          white-space: nowrap;
          transition: background 0.2s;
          display: ${showStyleLabels ? "block" : "none"};
        }
        .editor-content p.subtitle:hover::before {
          background: #f7e6d0;
        }
        .editor-content p.book-title::before {
          content: "BT";
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          background: #fef5e7;
          color: #2c3e50;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e0c392;
          pointer-events: none;
          white-space: nowrap;
          transition: background 0.2s;
          display: ${showStyleLabels ? "block" : "none"};
        }
        .editor-content p.book-title:hover::before {
          background: #f7e6d0;
        }
        /* Position relative for labels */
        .editor-content p.book-title,
        .editor-content p.chapter-heading,
        .editor-content p.title-content,
        .editor-content p.subtitle,
        .editor-content p.part-title {
          position: relative;
        }
        .editor-content p.part-title::before {
          content: "PT";
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          background: #fef5e7;
          color: #2c3e50;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e0c392;
          pointer-events: none;
          white-space: nowrap;
          transition: background 0.2s;
          display: ${showStyleLabels ? "block" : "none"};
        }
        .editor-content p.part-title:hover::before {
          background: #f7e6d0;
        }
        .editor-content h4 {
          font-size: 1.1em;
          font-weight: bold;
          margin: 1.2em 0 0.6em 0;
          color: #2c3e50;
        }
        .editor-content h5 {
          font-size: 1em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          color: #2c3e50;
        }
        .editor-content h6 {
          font-size: 0.9em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          color: #2c3e50;
          text-transform: uppercase;
        }
        /* Academic Styles */
        .editor-content p.abstract {
          font-size: 0.95em;
          margin: 1.5em 3em;
          text-align: justify;
          text-indent: 0 !important;
          line-height: 1.6;
        }
        .editor-content p.keywords {
          font-size: 0.9em;
          margin: 1em 3em;
          text-indent: 0 !important;
          font-style: italic;
        }
        .editor-content p.bibliography,
        .editor-content p.references {
          margin-left: 3em;
          text-indent: -2em;
          margin-bottom: 0.5em;
          font-size: 0.95em;
        }
        .editor-content p.appendix {
          margin: 1em 0;
          text-indent: ${documentStyles.paragraph.firstLineIndent}px !important;
        }
        /* Professional Styles */
        .editor-content p.author-info {
          text-align: right;
          text-indent: 0 !important;
          margin: 0.5em 0;
          font-weight: 500;
        }
        .editor-content p.date-info {
          text-align: right;
          text-indent: 0 !important;
          margin: 0.5em 0;
          font-size: 0.95em;
        }
        .editor-content p.address {
          text-indent: 0 !important;
          margin: 0.3em 0;
          line-height: 1.4;
        }
        .editor-content p.salutation {
          text-indent: 0 !important;
          margin: 1.5em 0 1em 0;
        }
        .editor-content p.closing {
          text-indent: 0 !important;
          margin: 1.5em 0 0.5em 0;
        }
        .editor-content p.signature {
          text-indent: 0 !important;
          margin: 3em 0 0.5em 0;
          font-weight: 500;
        }
        .editor-content p.sidebar {
          background: #f5ead9;
          border-left: 4px solid #ef8432;
          padding: 1em;
          margin: 1.5em 0;
          text-indent: 0 !important;
          font-size: 0.95em;
          border-radius: 4px;
        }
        .editor-content p.callout {
          background: #fef5e7;
          border: 2px solid #ef8432;
          padding: 1em 1.5em;
          margin: 1.5em 0;
          text-indent: 0 !important;
          border-radius: 6px;
          font-weight: 500;
        }
        .editor-content p.lead {
          font-size: 1.15em;
          font-weight: 400;
          line-height: 1.6;
          margin: 1em 0 1.5em 0;
          text-indent: 0 !important;
          color: #374151;
        }
        /* Book Publishing Styles */
        .editor-content p.part-title {
          position: relative;
          text-align: center;
          text-indent: 0 !important;
          font-size: 1.8em;
          font-weight: bold;
          margin: 3em 0 2em 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .editor-content p.epigraph {
          position: relative;
          text-align: right;
          text-indent: 0 !important;
          font-style: italic;
          margin: 2em 4em 2em auto;
          max-width: 60%;
          font-size: 0.95em;
        }
        .editor-content p.dedication {
          position: relative;
          text-align: center;
          text-indent: 0 !important;
          font-style: italic;
          margin: 4em 2em;
          font-size: 1.1em;
        }
        .editor-content p.acknowledgments {
          position: relative;
          text-indent: ${documentStyles.paragraph.firstLineIndent}px !important;
          margin: 0.8em 0;
        }
        .editor-content p.copyright {
          position: relative;
          text-align: center;
          text-indent: 0 !important;
          font-size: 0.85em;
          margin: 0.5em 0;
          color: #666;
        }
        .editor-content p.verse {
          position: relative;
          white-space: pre-wrap;
          font-family: 'Georgia', serif;
          text-indent: 0 !important;
          margin: 0.5em 0 0.5em 3em;
          line-height: 1.8;
        }
        /* Screenplay Transition */
        .editor-content p.transition {
          position: relative;
          text-align: right;
          text-indent: 0 !important;
          margin: 1em 0;
          font-weight: bold;
        }
        .editor-content blockquote {
          border-left: ${documentStyles.blockquote.borderLeftWidth}px solid ${
        documentStyles.blockquote.borderLeftColor
      };
          padding-left: 1em;
          margin: 1em 0 1em ${documentStyles.blockquote.marginLeft}px;
          color: #666;
          font-style: ${documentStyles.blockquote.fontStyle};
        }
        .editor-content pullquote {
          border-left: 4px solid #ef8432;
          border-right: 4px solid #ef8432;
          padding: 1em 1.5em;
          margin: 1.5em 0;
          color: #2c3e50;
          font-style: italic;
          font-size: 1.25em;
          text-align: center;
          background-color: #fef5e7;
        }
        .editor-content pre {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 1em;
          margin: 1em 0;
          overflow-x: auto;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9em;
          line-height: 1.4;
        }
        .editor-content footnote {
          display: block;
          font-size: 0.85em;
          color: #666;
          border-top: 1px solid #e0e0e0;
          padding-top: 0.5em;
          margin: 1.5em 0 0.5em 0;
        }
        .editor-content footnote::before {
          content: "Note: ";
          font-weight: bold;
          color: #2c3e50;
        }
        .editor-content citation {
          display: block;
          font-size: 0.9em;
          color: #2c3e50;
          padding-left: 2em;
          text-indent: -2em;
          margin: 0.5em 0;
          line-height: 1.6;
        }
        .editor-content toc {
          display: block;
          background-color: #fef5e7;
          border: 2px solid #e0c392;
          border-radius: 8px;
          padding: 1.5em;
          margin: 2em 0;
        }
        .editor-content toc::before {
          content: "Table of Contents";
          display: block;
          font-size: 1.25em;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 1em;
          border-bottom: 2px solid #ef8432;
          padding-bottom: 0.5em;
        }
        .editor-content .toc-entry {
          font-weight: bold;
          color: #2c3e50;
          margin: 1.5em 0 0.5em 0;
        }
        .editor-content .toc-entry.heading-1 {
          font-size: 1.5em;
          border-bottom: 2px solid #e0c392;
          padding-bottom: 0.25em;
        }
        .editor-content .toc-placeholder {
          user-select: none;
        }
        .editor-content index {
          display: block;
          background-color: #f5ead9;
          border: 2px solid #e0c392;
          border-radius: 8px;
          padding: 1.5em;
          margin: 2em 0;
          column-count: 2;
          column-gap: 2em;
        }
        .editor-content index::before {
          content: "Index";
          display: block;
          font-size: 1.25em;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 1em;
          border-bottom: 2px solid #ef8432;
          padding-bottom: 0.5em;
          column-span: all;
        }
        .editor-content figure {
          display: block;
          margin: 2em auto;
          padding: 1em;
          background-color: #ffffff;
          border: 2px solid #e0c392;
          border-radius: 8px;
          text-align: center;
          max-width: 90%;
        }
        .editor-content figure img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto 0.5em auto;
        }
        .editor-content figcaption {
          font-size: 0.9em;
          color: #374151;
          font-style: italic;
          margin-top: 0.5em;
          padding-top: 0.5em;
          border-top: 1px solid #e0c392;
        }
        .editor-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem 0;
        }
        .editor-content ul {
          list-style-type: disc;
          margin: 1em 0;
          padding-left: 2em;
        }
        .editor-content ol {
          list-style-type: decimal;
          margin: 1em 0;
          padding-left: 2em;
        }
        .editor-content li {
          margin: 0.5em 0;
        }
        .editor-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .editor-content table td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        .editor-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .editor-content a:hover {
          color: #1d4ed8;
        }
      `}</style>

      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(2px)",
          }}
        >
          <div className="editor-spinner"></div>
          <p style={{ marginTop: "1rem", color: "#2c3e50", fontWeight: 500 }}>
            Loading document...
          </p>
          <style>{`
            .editor-spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="back-to-top-button"
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
          title="Back to top"
          aria-label="Scroll to top"
        >
          <span style={{ fontSize: "16px" }}>↑</span>
          Back to top
        </button>
      )}

      {/* Backdrop for closing tools - click outside to close */}
      {viewMode === "writer" && !isFreeMode && activeTool && (
        <div
          onClick={() => setActiveTool(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49,
          }}
        />
      )}

      {/* Advanced Tool Components */}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "ai-assistant" && (
          <AIWritingAssistant
            selectedText={window.getSelection()?.toString() || ""}
            onInsertText={(text) => {
              if (editorRef.current) {
                const selection = window.getSelection();
                if (
                  selection &&
                  selection.rangeCount > 0 &&
                  !selection.isCollapsed
                ) {
                  const range = selection.getRangeAt(0);
                  if (
                    editorRef.current.contains(range.commonAncestorContainer)
                  ) {
                    range.deleteContents();
                    range.insertNode(document.createTextNode(text));
                    selection.collapseToEnd();
                    handleInput();
                    return;
                  }
                }
                const textNode = document.createTextNode(text);
                editorRef.current.appendChild(document.createElement("br"));
                editorRef.current.appendChild(textNode);
                handleInput();
              }
            }}
            onClose={() => setActiveTool(null)}
          />
        )}
      {viewMode === "writer" && !isFreeMode && activeTool === "dialogue" && (
        <DialogueEnhancer
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "readability" && (
        <ReadabilityAnalyzer
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "cliche" && (
        <ClicheDetector
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "beats" && (
        <BeatSheetGenerator
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "pov" && (
        <POVChecker
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "emotion" && (
        <EmotionTracker
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
        />
      )}
      {viewMode === "writer" && !isFreeMode && activeTool === "motif" && (
        <MotifTracker
          text={editorRef.current?.innerText || ""}
          onClose={() => setActiveTool(null)}
        />
      )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "poetry-meter" && (
          <PoetryMeterAnalyzer
            text={editorRef.current?.innerText || ""}
            onClose={() => setActiveTool(null)}
          />
        )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "nonfiction-outline" && (
          <NonFictionOutlineGenerator
            text={editorRef.current?.innerText || ""}
            onClose={() => setActiveTool(null)}
          />
        )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "citation-manager" && (
          <AcademicCitationManager
            text={editorRef.current?.innerText || ""}
            onClose={() => setActiveTool(null)}
          />
        )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "name-generator" && (
          <CharacterNameGenerator onClose={() => setActiveTool(null)} />
        )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "world-building" && (
          <WorldBuildingNotebook onClose={() => setActiveTool(null)} />
        )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "research-notes" && (
          <ResearchNotesPanel onClose={() => setActiveTool(null)} />
        )}
      {viewMode === "writer" && !isFreeMode && activeTool === "mood-board" && (
        <ImageMoodBoard onClose={() => setActiveTool(null)} />
      )}
      {viewMode === "writer" &&
        !isFreeMode &&
        activeTool === "version-history" && (
          <VersionHistory
            currentContent={editorRef.current?.innerText || ""}
            onRestore={(text) => {
              if (editorRef.current) {
                editorRef.current.innerText = text;
                handleInput();
              }
            }}
            onClose={() => setActiveTool(null)}
          />
        )}
      {viewMode === "writer" && !isFreeMode && activeTool === "comments" && (
        <CommentAnnotation
          documentContent={editorRef.current?.innerText || ""}
          selectedText={window.getSelection()?.toString() || ""}
          onClose={() => setActiveTool(null)}
        />
      )}
    </div>
  );
};
