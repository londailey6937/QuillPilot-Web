import React, { useEffect, useRef, useState, useCallback } from "react";
import { creamPalette as palette } from "../styles/palette";
import { analyzeParagraphSpacing, countWords } from "@/utils/spacingInsights";
import { SensoryDetailAnalyzer } from "@/utils/sensoryDetailAnalyzer";
import { Character, CharacterMapping } from "../types";
import { AdvancedToolsPanel } from "./AdvancedToolsPanel";

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
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);
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

      if (wrapperRef.current) {
        wrapperRef.current.scrollTo({
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
      marginTop: 1.5,
      marginBottom: 0.8,
    },
    heading2: {
      fontSize: 22,
      fontWeight: "bold" as "normal" | "bold",
      marginTop: 1.2,
      marginBottom: 0.6,
    },
    heading3: {
      fontSize: 18,
      fontWeight: "bold" as "normal" | "bold",
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
    const paragraphs = domParagraphs
      .map((p) => (p as HTMLElement).innerText || "")
      .filter((p) => p.trim());

    const spacingData: AnalysisData["spacing"] = [];
    const visualsData: AnalysisData["visuals"] = [];

    // For very large documents (>2000 paragraphs / ~800 pages), sample analysis
    // For medium-large documents (500-2000 paragraphs), analyze all but limit dual-coding
    const isVeryLarge = paragraphs.length > 2000;
    const isLarge = paragraphs.length > 500;

    if (isVeryLarge) {
      // Sample every 4th paragraph for extremely large documents
      paragraphs.forEach((para, index) => {
        if (index % 4 === 0) {
          const wordCount = countWords(para);
          if (wordCount > 0) {
            const spacingInfo = analyzeParagraphSpacing(wordCount);
            spacingData.push({
              index,
              wordCount,
              tone: spacingInfo.tone,
              label: spacingInfo.shortLabel,
            });
          }

          // Also analyze sensory details for sampled paragraphs with 50+ words
          if (wordCount >= 50) {
            const suggestions = SensoryDetailAnalyzer.analyzeParagraph(
              para,
              index
            );
            if (suggestions.length > 0) {
              visualsData.push({ index, suggestions });
            }
          }
        }
      });
    } else {
      // Normal or large documents: analyze all spacing, limit dual-coding for large docs
      paragraphs.forEach((para, index) => {
        const wordCount = countWords(para);
        if (wordCount > 0) {
          const spacingInfo = analyzeParagraphSpacing(wordCount);
          spacingData.push({
            index,
            wordCount,
            tone: spacingInfo.tone,
            label: spacingInfo.shortLabel,
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
            index
          );
          if (suggestions.length > 0) {
            visualsData.push({ index, suggestions });
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
      paragraphs: paragraphs.length,
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
      const customParagraphStyles = ["title", "subtitle"];

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
          p.className =
            tag === "title"
              ? "title-content book-title"
              : "title-content subtitle";
          p.removeAttribute("data-block");
        } else {
          // Create new styled paragraph
          const selectedText = selection.toString() || "Title";
          const className =
            tag === "title"
              ? "title-content book-title"
              : "title-content subtitle";
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

      // Only process keyboard shortcuts that use modifier keys
      // Let all other keys pass through without preventDefault for natural auto-repeat
      if (!modKey) {
        return; // Don't prevent default - let browser handle naturally
      }

      // Handle modifier+key shortcuts
      switch (e.key.toLowerCase()) {
        case "s":
          e.preventDefault();
          if (onSave) {
            onSave();
          }
          break;
        case "b":
          e.preventDefault();
          formatText("bold");
          break;
        case "i":
          e.preventDefault();
          formatText("italic");
          break;
        case "u":
          e.preventDefault();
          formatText("underline");
          break;
        case "k":
          e.preventDefault();
          setShowLinkModal(true);
          break;
        case "f":
          e.preventDefault();
          setShowFindReplace(true);
          break;
        case "z":
          if (e.shiftKey) {
            e.preventDefault();
            performRedo();
          } else {
            e.preventDefault();
            performUndo();
          }
          break;
        case "y":
          if (!isMac) {
            e.preventDefault();
            performRedo();
          }
          break;
      }
    },
    [formatText, performUndo, performRedo, firstLineIndent, leftMargin, onSave]
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
  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;
      const scrollTop = wrapperRef.current.scrollTop;
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

    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    wrapper.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => wrapper.removeEventListener("scroll", handleScroll);
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

  // Render spacing indicators
  const renderIndicators = () => {
    if (!editorRef.current || !showSpacingIndicators) return null;
    // In free mode, always show indicators. In paid mode, respect focus mode toggle.
    if (!isFreeMode && focusMode) return null;

    const paragraphs = Array.from(editorRef.current.querySelectorAll("p, div"));
    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    if (!wrapperRect) return null;

    const scrollTop = wrapperRef.current?.scrollTop || 0;

    // Use the pages container rect (the white page area) for alignment
    const pagesRect = pagesContainerRef.current?.getBoundingClientRect();
    if (!pagesRect) return null;

    return analysis.spacing.map((item, idx) => {
      const para = paragraphs[item.index];
      if (!para) return null;

      const rect = para.getBoundingClientRect();

      const colors = {
        compact: "bg-blue-100 text-blue-800 border-blue-200",
        extended: "bg-orange-100 text-orange-800 border-orange-200",
        balanced: "bg-green-100 text-green-800 border-green-200",
      };

      return (
        <div
          key={`spacing-${idx}`}
          className={`absolute text-xs px-2 py-0.5 rounded-full border shadow-sm z-10 ${
            colors[item.tone as keyof typeof colors] || colors.balanced
          } select-none whitespace-nowrap pointer-events-none`}
          style={{
            top: `${rect.top - wrapperRect.top + scrollTop - 24}px`,
            left: `${pagesRect.left - wrapperRect.left - 10}px`,
            transform: "translateX(-100%)",
          }}
        >
          {item.label} · {item.wordCount} words
        </div>
      );
    });
  };

  // Render visual suggestions
  const renderSuggestions = () => {
    if (!editorRef.current || !showVisualSuggestions) {
      return null;
    }
    // In free mode, always show suggestions. In paid mode, respect focus mode toggle.
    if (!isFreeMode && focusMode) {
      return null;
    }

    const paragraphs = Array.from(editorRef.current.querySelectorAll("p, div"));
    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    if (!wrapperRect) return null;

    const scrollTop = wrapperRef.current?.scrollTop || 0;

    // Use the pages container rect (the white page area) for alignment
    const pagesRect = pagesContainerRef.current?.getBoundingClientRect();
    if (!pagesRect) return null;

    return analysis.visuals.map((item, idx) => {
      const para = paragraphs[item.index];
      if (!para) {
        console.log(
          `[CustomEditor] renderSuggestions: paragraph ${item.index} not found in DOM`
        );
        return null;
      }

      const rect = para.getBoundingClientRect();

      return (
        <div
          key={`visual-${idx}`}
          className="absolute p-1.5 bg-yellow-50 border-l-3 border-yellow-400 rounded text-xs text-yellow-900 select-none pointer-events-none"
          style={{
            top: `${rect.top - wrapperRect.top + scrollTop - 24}px`,
            left: `${pagesRect.right - wrapperRect.left + 10}px`,
            maxWidth: "200px",
          }}
        >
          {item.suggestions.map((s, i) => (
            <div key={i} className="mb-1 last:mb-0">
              <div className="font-semibold mb-0.5 text-xs">
                💡 {s.visualType}
              </div>
              <div className="opacity-90 text-[11px]">{s.reason}</div>
            </div>
          ))}
        </div>
      );
    });
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
                  <option value="p">Paragraph</option>
                  <option value="title">Title</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="blockquote">Quote</option>
                  <option value="pre">Code</option>
                </optgroup>
                <optgroup label="Screenplay">
                  <option value="scene-heading">Scene Heading</option>
                  <option value="action">Action</option>
                  <option value="character">Character</option>
                  <option value="dialogue">Dialogue</option>
                  <option value="parenthetical">Parenthetical</option>
                </optgroup>
                <optgroup label="Book">
                  <option value="chapter-heading">Chapter Heading</option>
                  <option value="book-title">Book Title</option>
                  <option value="subtitle">Subtitle</option>
                </optgroup>
              </select>

              {/* Styles Panel Button */}
              <button
                onClick={() => setShowStylesPanel(true)}
                className="px-1.5 py-1 rounded border bg-white hover:bg-[#f7e6d0] text-[#2c3e50] transition-colors text-xs"
                title="Styles"
              >
                ⚙
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
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-200 text-gray-700"
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
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-200 text-gray-700"
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
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-200 text-gray-700"
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
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-200 text-gray-700"
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
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-200 text-gray-700"
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
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-200 text-gray-700"
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
                className="px-2 py-1 rounded hover:bg-gray-200 text-gray-700 transition-colors text-xs"
                title="Bullet List"
              >
                •
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText("insertOrderedList");
                }}
                className="px-2 py-1 rounded hover:bg-gray-200 text-gray-700 transition-colors text-xs"
                title="Numbered List"
              >
                1.
              </button>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Insert options */}
              <button
                onClick={() => setShowLinkModal(true)}
                className="px-2 py-1 rounded hover:bg-gray-200 text-gray-700 transition-colors text-xs"
                title="Link"
              >
                🔗
              </button>
              <label
                className="px-2 py-1 rounded hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer text-xs"
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
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-200 text-gray-700"
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
                className="px-2 py-1 rounded transition-colors text-xs"
                style={
                  focusMode
                    ? {
                        background: "#2c3e50",
                        color: "#ffffff",
                        border: "1px solid #2c3e50",
                      }
                    : {
                        background: "transparent",
                        color: "#374151",
                        border: "1px solid transparent",
                      }
                }
                title="Focus Mode"
              >
                🎯
              </button>
              <button
                onClick={() => setTypewriterMode(!typewriterMode)}
                className="px-2 py-1 rounded transition-colors text-xs"
                style={
                  typewriterMode
                    ? {
                        background: "#2c3e50",
                        color: "#ffffff",
                        border: "1px solid #2c3e50",
                      }
                    : {
                        background: "transparent",
                        color: "#374151",
                        border: "1px solid transparent",
                      }
                }
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
                      className="px-2 py-1 rounded transition-colors text-xs"
                      style={
                        showCharacterPopover
                          ? {
                              background: "#2c3e50",
                              color: "#ffffff",
                              border: "1px solid #2c3e50",
                            }
                          : {
                              background: "transparent",
                              color: "#374151",
                              border: "1px solid transparent",
                            }
                      }
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

      {/* Link Modal */}
      {showLinkModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") insertLink();
                if (e.key === "Escape") setShowLinkModal(false);
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles Panel Modal */}
      {showStylesPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[100] p-4 pt-16 overflow-y-auto">
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col"
            style={{ border: "2px solid #e0c392" }}
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
                      marginTop: 1.5,
                      marginBottom: 0.8,
                    },
                    heading2: {
                      fontSize: 22,
                      fontWeight: "bold",
                      marginTop: 1.2,
                      marginBottom: 0.6,
                    },
                    heading3: {
                      fontSize: 18,
                      fontWeight: "bold",
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
                  onClick={() => setShowStylesPanel(false)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
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
            className="px-3 py-1.5 hover:bg-gray-200 rounded transition-colors text-sm"
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
        {showThumbnailRail && (
          <aside
            ref={pageRailRef}
            className="page-thumbnail-rail"
            style={{
              position: "absolute",
              left: "8px",
              top: "8px",
              width: "220px",
              zIndex: 10,
              borderRadius: "18px",
              border: "1px solid #e0c392",
              background:
                "linear-gradient(180deg, rgba(254,245,231,0.98), rgba(247,230,208,0.92))",
              boxShadow: "0 16px 32px rgba(44, 62, 80, 0.12)",
              padding: "16px 12px",
              overflowY: "auto",
              maxHeight: "calc(100vh - 200px)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#92400e]">
                Page Rail
              </div>
              <span className="text-[11px] text-[#6b7280]">{pageCount}</span>
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

        {/* Main editor area - centers the ruler/page in full viewport */}
        <div
          ref={wrapperRef}
          className="editor-wrapper page-view"
          style={{
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
                    backgroundColor: "transparent",
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
                        backgroundColor: "rgba(255,255,255,0.6)",
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
                          <path d="M6 0L12 6H8V12H4V6H0L6 0Z" fill="#2c3e50" />
                        </svg>
                      </div>
                    </div>
                  </div>
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

          {/* Spacing indicators overlay */}
          {renderIndicators()}

          {/* Visual suggestions overlay */}
          {renderSuggestions()}
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
          margin: ${documentStyles.title.marginBottom}em 0 !important;
        }
        .editor-content p.book-title {
          text-align: ${documentStyles.title.textAlign} !important;
          text-indent: 0 !important;
          font-size: ${documentStyles.title.fontSize}px !important;
          font-weight: ${documentStyles.title.fontWeight} !important;
          margin: ${documentStyles.title.marginBottom}em 0 !important;
        }
        .editor-content p.subtitle {
          text-align: ${documentStyles.title.textAlign} !important;
          text-indent: 0 !important;
          font-size: ${documentStyles.title.fontSize * 0.7}px !important;
          font-style: italic !important;
          margin: 0.3em 0 !important;
        }
        .editor-content p.chapter-heading {
          text-align: center !important;
          text-indent: 0 !important;
          font-weight: bold;
          font-size: 1.2em;
          margin: 1.5em 0 0.8em 0 !important;
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
          margin: ${documentStyles.heading1.marginTop}em 0 ${
        documentStyles.heading1.marginBottom
      }em 0;
        }
        .editor-content h2 {
          font-size: ${documentStyles.heading2.fontSize}px;
          font-weight: ${documentStyles.heading2.fontWeight};
          margin: ${documentStyles.heading2.marginTop}em 0 ${
        documentStyles.heading2.marginBottom
      }em 0;
        }
        .editor-content h3 {
          font-size: ${documentStyles.heading3.fontSize}px;
          font-weight: ${documentStyles.heading3.fontWeight};
          margin: ${documentStyles.heading3.marginTop}em 0 ${
        documentStyles.heading3.marginBottom
      }em 0;
        }
        .editor-content h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1em 0;
        }
        .editor-content h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.5em 0;
        }
        .editor-content h6 {
          font-size: 0.67em;
          font-weight: bold;
          margin: 2em 0;
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

      {/* Advanced Tools Panel */}
      {viewMode === "writer" && !isFreeMode && (
        <AdvancedToolsPanel
          text={editorRef.current?.innerText || ""}
          selectedText={window.getSelection()?.toString() || ""}
          onInsertText={(text) => {
            // Replace the entire editor content's selected portion or insert at end
            if (editorRef.current) {
              // Try to get current selection
              const selection = window.getSelection();
              if (
                selection &&
                selection.rangeCount > 0 &&
                !selection.isCollapsed
              ) {
                const range = selection.getRangeAt(0);
                // Check if selection is within our editor
                if (editorRef.current.contains(range.commonAncestorContainer)) {
                  range.deleteContents();
                  range.insertNode(document.createTextNode(text));
                  // Collapse selection to end of inserted text
                  selection.collapseToEnd();
                  handleInput();
                  return;
                }
              }
              // Fallback: append to end of editor
              const textNode = document.createTextNode(text);
              editorRef.current.appendChild(document.createElement("br"));
              editorRef.current.appendChild(textNode);
              handleInput();
            }
          }}
          onReplaceText={(oldText, newText) => {
            if (editorRef.current && oldText) {
              // Escape special regex characters in the search text
              const escapedOldText = oldText.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              );
              const html = editorRef.current.innerHTML;
              // Try to replace in HTML first
              const newHtml = html.replace(
                new RegExp(escapedOldText, "gi"),
                newText
              );
              if (newHtml !== html) {
                editorRef.current.innerHTML = newHtml;
                handleInput();
              } else {
                // Fallback: try plain text replacement
                const plainText = editorRef.current.innerText;
                if (plainText.includes(oldText)) {
                  editorRef.current.innerText = plainText.replace(
                    oldText,
                    newText
                  );
                  handleInput();
                }
              }
            }
          }}
          onNavigate={(position) => {
            // Scroll to specific word position
            if (editorRef.current) {
              const words = editorRef.current.innerText.split(/\s+/);
              let charCount = 0;
              for (let i = 0; i < Math.min(position, words.length); i++) {
                charCount += words[i].length + 1;
              }
              // This is a simplified navigation - could be enhanced
              editorRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />
      )}
    </div>
  );
};
