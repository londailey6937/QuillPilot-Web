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
  // Tier 3 - Character management
  characters?: Character[];
  onCharacterLink?: (textOccurrence: string, characterId: string) => void;
  onOpenCharacterManager?: () => void;
  isProfessionalTier?: boolean;
  onLayoutChange?: (layout: { width: number; left: number }) => void;
}

const INCH_IN_PX = 96;
const PAGE_WIDTH_PX = INCH_IN_PX * 8;

interface AnalysisData {
  spacing: Array<{
    index: number;
    wordCount: number;
    tone: string;
    label: string;
  }>;
  visuals: Array<{ index: number; suggestions: any[] }>;
}

type TextMatch = {
  start: number;
  end: number;
};

interface TextNodeMap {
  node: Text;
  start: number;
  end: number;
}

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
  firstLineIndent = 96,
  characters = [],
  onCharacterLink,
  onOpenCharacterManager,
  isProfessionalTier = false,
  onLayoutChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
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
  }, [selectedCharacterId, onCharacterLink]);

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
  }, [onUpdate, saveToHistory, analyzeContent]);

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

    // Restore scroll position after DOM update
    requestAnimationFrame(() => {
      if (wrapperRef.current) {
        wrapperRef.current.scrollTop = scrollTop;
      }
    });

    // Update button states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [onUpdate, analyzeContent]);

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

    // Restore scroll position after DOM update
    requestAnimationFrame(() => {
      if (wrapperRef.current) {
        wrapperRef.current.scrollTop = scrollTop;
      }
    });

    // Update button states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [onUpdate, analyzeContent]);

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
      if (wrapperRef.current) {
        const scrollTop = wrapperRef.current.scrollTop;
        setShowBackToTop(scrollTop > 300);
      }
    };

    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener("scroll", handleScroll);
      return () => wrapper.removeEventListener("scroll", handleScroll);
    }
  }, []);

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
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  // Render spacing indicators
  const renderIndicators = () => {
    if (!editorRef.current || !showSpacingIndicators) return null;
    // In free mode, always show indicators. In paid mode, respect focus mode toggle.
    if (!isFreeMode && focusMode) return null;

    const paragraphs = Array.from(editorRef.current.querySelectorAll("p, div"));
    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    if (!wrapperRect) return null;

    const scrollTop = wrapperRef.current?.scrollTop || 0;

    return analysis.spacing.map((item, idx) => {
      const para = paragraphs[item.index];
      if (!para) return null;

      const rect = para.getBoundingClientRect();
      const container = editorRef.current?.getBoundingClientRect();
      if (!container) return null;

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
            left: `${container.left - wrapperRect.left - 10}px`,
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

    return analysis.visuals.map((item, idx) => {
      const para = paragraphs[item.index];
      if (!para) {
        console.log(
          `[CustomEditor] renderSuggestions: paragraph ${item.index} not found in DOM`
        );
        return null;
      }

      const rect = para.getBoundingClientRect();
      const container = editorRef.current?.getBoundingClientRect();
      if (!container) return null;

      return (
        <div
          key={`visual-${idx}`}
          className="absolute p-1.5 bg-yellow-50 border-l-3 border-yellow-400 rounded text-xs text-yellow-900 select-none pointer-events-none"
          style={{
            top: `${rect.top - wrapperRect.top + scrollTop - 24}px`,
            left: `${container.right - wrapperRect.left + 10}px`,
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
      {/* Toolbar */}
      {viewMode === "writer" && !isFreeMode && (
        <div
          className="writer-toolbar-shell"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            margin: "0 auto 12px",
            width: "fit-content",
            maxWidth: "calc(100% - 24px)",
            padding: "10px 14px",
            borderRadius: "28px",
            background: "linear-gradient(135deg, #fffaf3 0%, #fef5e7 100%)",
            border: "1.5px solid #e0c392",
            boxShadow: "0 10px 24px rgba(239, 132, 50, 0.18)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              borderRadius: "18px",
              margin: "-2px",
              padding: "2px",
            }}
          >
            <div
              className="toolbar flex items-center gap-2"
              style={{
                flexWrap: "nowrap",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
              }}
            >
              {/* Block type dropdown */}
              <select
                value={blockType}
                onChange={(e) => changeBlockType(e.target.value)}
                className="px-2 py-1.5 rounded border bg-white hover:bg-gray-50 transition-colors text-sm"
                title="Block Type"
              >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
                <option value="blockquote">Quote</option>
                <option value="pullquote">Pull Quote</option>
                <option value="pre">Code Block</option>
                <option value="footnote">Footnote</option>
                <option value="citation">Bibliography/Citation</option>
                <option value="toc">Table of Contents</option>
                <option value="index">Index</option>
                <option value="figure">Figure</option>
                <optgroup label="Screenplay Format">
                  <option value="scene-heading">Scene Heading (INT/EXT)</option>
                  <option value="action">Action</option>
                  <option value="character">Character Name</option>
                  <option value="dialogue">Dialogue</option>
                  <option value="parenthetical">Parenthetical</option>
                  <option value="transition">Transition</option>
                </optgroup>
              </select>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Font family dropdown */}
              <select
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  if (editorRef.current) {
                    editorRef.current.style.fontFamily =
                      e.target.value === "default" ? "" : e.target.value;
                  }
                }}
                className="px-2 py-1.5 rounded border bg-white hover:bg-gray-50 transition-colors text-sm"
                title="Font Family"
              >
                <option value="default">Default</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', Times, serif">
                  Times New Roman
                </option>
                <option value="'Courier New', Courier, monospace">
                  Courier New
                </option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Comic Sans MS', cursive">Comic Sans</option>
                <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif">
                  Palatino
                </option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet</option>
                <option value="'Lucida Console', Monaco, monospace">
                  Lucida Console
                </option>
              </select>

              {/* Font size dropdown */}
              <select
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  if (editorRef.current) {
                    editorRef.current.style.fontSize = e.target.value;
                  }
                }}
                className="px-2 py-1.5 rounded border bg-white hover:bg-gray-50 transition-colors text-sm"
                title="Font Size"
              >
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="22px">22px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
                <option value="36px">36px</option>
              </select>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Text formatting */}
              <div className="flex gap-1">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("bold");
                  }}
                  className={`px-3 py-1.5 rounded font-bold transition-colors ${
                    isBold
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                  title="Bold (⌘B / Ctrl+B)"
                >
                  B
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("italic");
                  }}
                  className={`px-3 py-1.5 rounded italic transition-colors ${
                    isItalic
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                  title="Italic (⌘I / Ctrl+I)"
                >
                  I
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("underline");
                  }}
                  className={`px-3 py-1.5 rounded underline transition-colors ${
                    isUnderline
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                  title="Underline (⌘U / Ctrl+U)"
                >
                  U
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("strikeThrough");
                  }}
                  className="px-3 py-1.5 rounded line-through hover:bg-gray-200 text-gray-700 transition-colors"
                  title="Strikethrough"
                >
                  S
                </button>
              </div>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Text alignment */}
              <div className="flex gap-1">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    alignText("left");
                  }}
                  className={`px-2 py-1.5 rounded transition-colors ${
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
                  className={`px-2 py-1.5 rounded transition-colors ${
                    textAlign === "center"
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                  title="Align Center"
                >
                  ≡
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    alignText("right");
                  }}
                  className={`px-2 py-1.5 rounded transition-colors ${
                    textAlign === "right"
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                  title="Align Right"
                >
                  ≡
                </button>
              </div>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Lists */}
              <div className="flex gap-1">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("insertUnorderedList");
                  }}
                  className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("insertOrderedList");
                  }}
                  className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                  title="Numbered List"
                >
                  1. List
                </button>
              </div>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Insert options */}
              <div className="flex gap-1">
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                  title="Insert Link (⌘K / Ctrl+K)"
                >
                  🔗
                </button>
                <button
                  onClick={removeLink}
                  className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                  title="Remove Link"
                >
                  ⛓️‍💥
                </button>
                <label
                  className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                  title="Upload Image"
                >
                  📸
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={insertTable}
                  className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                  title="Insert Table"
                >
                  ⊞
                </button>
              </div>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* Utilities */}
              <div className="flex gap-1">
                <button
                  onClick={clearFormatting}
                  className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors text-sm"
                  title="Clear Formatting"
                >
                  ⌫
                </button>
                <button
                  onClick={() => setShowFindReplace(!showFindReplace)}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    showFindReplace
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                  title="Find & Replace (⌘F / Ctrl+F)"
                >
                  🔍
                </button>
              </div>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* History */}
              <div className="flex gap-1">
                <button
                  onClick={performUndo}
                  disabled={!canUndo}
                  className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  title="Undo (⌘Z / Ctrl+Z)"
                >
                  ↶
                </button>
                <button
                  onClick={performRedo}
                  disabled={!canRedo}
                  className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  title="Redo (⌘⇧Z / Ctrl+Y)"
                >
                  ↷
                </button>
              </div>

              <div style={toolbarDividerStyle} aria-hidden="true" />

              {/* View options */}
              <div className="flex gap-1">
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className="px-3 py-1.5 rounded transition-colors text-sm hover:bg-gray-200 text-gray-700"
                  style={
                    focusMode
                      ? {
                          background: palette.subtle,
                          color: palette.navy,
                          border: `1px solid ${palette.border}`,
                        }
                      : { border: "1px solid transparent" }
                  }
                  title="Focus Mode (Hide Indicators)"
                >
                  🎯
                </button>
                <button
                  onClick={() => setTypewriterMode(!typewriterMode)}
                  className="px-3 py-1.5 rounded transition-colors text-sm hover:bg-gray-200 text-gray-700"
                  style={
                    typewriterMode
                      ? {
                          background: palette.base,
                          color: palette.navy,
                          border: `1px solid ${palette.lightBorder}`,
                        }
                      : { border: "1px solid transparent" }
                  }
                  title="Typewriter Mode (Center Current Line)"
                >
                  ⌨️
                </button>
              </div>

              {/* Character Management (Tier 3 only) */}
              {isProfessionalTier && (
                <>
                  <div style={toolbarDividerStyle} aria-hidden="true" />
                  <div className="flex gap-1 items-center">
                    {characters && characters.length > 0 ? (
                      <>
                        <span className="text-xs text-gray-600 mr-1">
                          Characters:
                        </span>
                        <select
                          value={selectedCharacterId}
                          onChange={(e) =>
                            setSelectedCharacterId(e.target.value)
                          }
                          className="px-2 py-1.5 rounded border bg-white hover:bg-gray-50 transition-colors text-sm"
                          title="Select character to link"
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
                                (roleOrder[a.role] || 999) -
                                (roleOrder[b.role] || 999)
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
                          className="px-3 py-1.5 rounded transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{
                            background: palette.subtle,
                            color: palette.navy,
                            border: `1px solid ${palette.lightBorder}`,
                          }}
                          title="Link selected text to character"
                        >
                          🔗 Link
                        </button>
                      </>
                    ) : null}
                    {onOpenCharacterManager && (
                      <button
                        onClick={onOpenCharacterManager}
                        className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors text-sm"
                        title="Manage Characters"
                      >
                        👥
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
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

      {/* Editor area with indicators */}
      <div
        ref={wrapperRef}
        className="editor-wrapper"
        style={{ position: "relative", flex: 1, overflow: "auto" }}
      >
        <div
          ref={editorRef}
          contentEditable={isEditable}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className={`editor-content p-12 focus:outline-none ${
            className || ""
          }`}
          style={{
            minHeight: "300px",
            width: `${PAGE_WIDTH_PX}px`,
            maxWidth: "calc(100% - 8px)",
            margin: "20px auto",
            paddingLeft: `${leftMargin}px`,
            paddingRight: `${rightMargin}px`,
            boxSizing: "border-box",
            border: isEditable ? "2px solid #10b981" : "1px solid #d1d5db",
            backgroundColor: isEditable ? "#ffffff" : "#fafafa",
            boxShadow: isEditable
              ? "0 2px 8px rgba(16, 185, 129, 0.2)"
              : "0 1px 3px rgba(0,0,0,0.1)",
            caretColor: "#2c3e50",
            cursor: isEditable ? "text" : "default",
            transition: "all 0.2s ease",
          }}
          suppressContentEditableWarning
        />

        {/* Spacing indicators overlay */}
        {renderIndicators()}

        {/* Visual suggestions overlay */}
        {renderSuggestions()}
      </div>

      <style>{`
        .editor-content {
          color: #000000;
        }
        .editor-content p {
          margin: 0.5em 0;
          line-height: 1.2;
          text-indent: ${firstLineIndent - leftMargin}px;
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
        /* Center copyright/boilerplate text (all caps, short lines) */
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
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        .editor-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        .editor-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
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
          border-left: 4px solid #ddd;
          padding-left: 1em;
          margin: 1em 0;
          color: #666;
          font-style: italic;
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
