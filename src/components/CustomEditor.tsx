import React, { useEffect, useRef, useState, useCallback } from "react";
import { analyzeParagraphSpacing, countWords } from "@/utils/spacingInsights";
import { DualCodingAnalyzer } from "@/utils/dualCodingAnalyzer";

interface CustomEditorProps {
  content: string;
  onUpdate?: (content: { html: string; text: string }) => void;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showSpacingIndicators?: boolean;
  showVisualSuggestions?: boolean;
  concepts?: string[];
  onConceptClick?: (concept: string) => void;
  isFreeMode?: boolean;
  viewMode?: "analysis" | "writer";
}

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

export const CustomEditor: React.FC<CustomEditorProps> = ({
  content,
  onUpdate,
  isEditable = true,
  className,
  style,
  showSpacingIndicators = true,
  showVisualSuggestions = true,
  concepts = [],
  onConceptClick,
  isFreeMode = false,
  viewMode = "analysis",
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
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New feature states
  const [blockType, setBlockType] = useState("p");
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

          // Also analyze dual-coding for sampled paragraphs with 50+ words
          if (wordCount >= 50) {
            const suggestions = DualCodingAnalyzer.analyzeParagraph(
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

        // For large docs, analyze dual-coding for paragraphs with 50+ words
        // For normal docs, analyze all paragraphs with >10 chars
        const shouldAnalyzeDualCoding = isLarge
          ? wordCount >= 50
          : para.length >= 10;

        if (shouldAnalyzeDualCoding) {
          const suggestions = DualCodingAnalyzer.analyzeParagraph(para, index);
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
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount - content is captured from closure

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

    historyIndexRef.current--;
    const html = historyRef.current[historyIndexRef.current];

    isUndoRedoRef.current = true;
    editorRef.current.innerHTML = html;

    const text = editorRef.current.innerText;
    onUpdate?.({ html, text });
    analyzeContent(text);
    editorRef.current.focus();

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

    historyIndexRef.current++;
    const html = historyRef.current[historyIndexRef.current];

    isUndoRedoRef.current = true;
    editorRef.current.innerHTML = html;

    const text = editorRef.current.innerText;
    onUpdate?.({ html, text });
    analyzeContent(text);
    editorRef.current.focus();

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
      formatText("formatBlock", tag);
      setBlockType(tag);
    },
    [formatText]
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

  const createRangeFromOffsets = useCallback((start: number, end: number) => {
    if (!editorRef.current || start === end) return null;

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let charIndex = 0;
    let currentNode = walker.nextNode() as Text | null;
    let rangeStartNode: Text | null = null;
    let rangeStartOffset = 0;
    let rangeEndNode: Text | null = null;
    let rangeEndOffset = 0;

    while (currentNode) {
      const textLength = currentNode.textContent?.length ?? 0;
      const nextIndex = charIndex + textLength;

      if (!rangeStartNode && start >= charIndex && start <= nextIndex) {
        rangeStartNode = currentNode;
        rangeStartOffset = start - charIndex;
      }

      if (!rangeEndNode && end >= charIndex && end <= nextIndex) {
        rangeEndNode = currentNode;
        rangeEndOffset = end - charIndex;
        break;
      }

      charIndex = nextIndex;
      currentNode = walker.nextNode() as Text | null;
    }

    if (rangeStartNode && rangeEndNode) {
      const range = document.createRange();
      range.setStart(rangeStartNode, rangeStartOffset);
      range.setEnd(rangeEndNode, rangeEndOffset);
      return range;
    }

    return null;
  }, []);

  const findAllMatches = useCallback(() => {
    if (!editorRef.current || !findText) {
      setFindMatches([]);
      setCurrentMatchIndex(0);
      return [] as TextMatch[];
    }

    const content = editorRef.current.innerText.toLowerCase();
    const search = findText.toLowerCase();
    const matches: TextMatch[] = [];

    let index = 0;
    while (index < content.length) {
      const foundAt = content.indexOf(search, index);
      if (foundAt === -1) break;
      matches.push({ start: foundAt, end: foundAt + findText.length });
      index = foundAt + 1; // allow overlaps
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
    const range = createRangeFromOffsets(match.start, match.end);

    if (!range) {
      setFindMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

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
    createRangeFromOffsets,
    handleInput,
  ]);

  // Replace all occurrences
  const replaceInText = useCallback(() => {
    if (!editorRef.current || !findText) return;

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToProcess: {
      node: Text;
      matches: Array<{ start: number; end: number }>;
    }[] = [];

    let nodeCount = 0;
    const MAX_NODES = 500;

    let currentNode = walker.nextNode() as Text;
    while (currentNode && nodeCount < MAX_NODES) {
      const text = currentNode.textContent || "";
      const matches: Array<{ start: number; end: number }> = [];

      let searchIndex = 0;
      while (searchIndex < text.length) {
        const index = text
          .toLowerCase()
          .indexOf(findText.toLowerCase(), searchIndex);
        if (index === -1) break;

        matches.push({ start: index, end: index + findText.length });
        searchIndex = index + 1;
      }

      if (matches.length > 0) {
        nodesToProcess.push({ node: currentNode, matches });
      }

      currentNode = walker.nextNode() as Text;
      nodeCount++;
    }

    nodesToProcess.reverse();

    nodesToProcess.forEach(({ node, matches }) => {
      const text = node.textContent || "";
      let newText = text;

      [...matches].reverse().forEach(({ start, end }) => {
        newText =
          newText.substring(0, start) + replaceText + newText.substring(end);
      });

      node.textContent = newText;
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

  // Handle paste with images
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
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
    [handleInput]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (!modKey) return;

      switch (e.key.toLowerCase()) {
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
    [formatText, performUndo, performRedo]
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
          ["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"].includes(tag)
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
      {/* Writer Mode Active Banner */}
      {isEditable && viewMode === "writer" && !isFreeMode && (
        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "#10b981",
            color: "white",
            fontSize: "13px",
            fontWeight: 600,
            textAlign: "center",
            borderBottom: "2px solid #059669",
          }}
        >
          ✍️ Writer Mode Active - Click anywhere to start editing • Auto-saves
          your work
        </div>
      )}

      {/* Read-Only Mode Notice */}
      {!isEditable && viewMode === "analysis" && (
        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "#f59e0b",
            color: "white",
            fontSize: "13px",
            fontWeight: 600,
            textAlign: "center",
            borderBottom: "2px solid #d97706",
          }}
        >
          📊 Analysis Mode - Document is read-only • Switch to Writer Mode to
          edit
        </div>
      )}

      {/* Toolbar */}
      {viewMode === "writer" && !isFreeMode && (
        <div className="toolbar flex flex-wrap items-center gap-2 p-2 border-b bg-gray-50 sticky top-0 z-20 shadow-sm">
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
          </select>

          <div className="w-px h-6 bg-gray-300" />

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

          <div className="w-px h-6 bg-gray-300" />

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

          <div className="w-px h-6 bg-gray-300" />

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

          <div className="w-px h-6 bg-gray-300" />

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
            <label className="px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer">
              📸
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                title="Insert Image"
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

          <div className="w-px h-6 bg-gray-300" />

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

          <div className="w-px h-6 bg-gray-300" />

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

          <div className="w-px h-6 bg-gray-300" />

          {/* View options */}
          <div className="flex gap-1">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`px-3 py-1.5 rounded transition-colors text-sm ${
                focusMode
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              title="Focus Mode (Hide Indicators)"
            >
              🎯
            </button>
            <button
              onClick={() => setTypewriterMode(!typewriterMode)}
              className={`px-3 py-1.5 rounded transition-colors text-sm ${
                typewriterMode
                  ? "bg-purple-100 text-purple-700"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              title="Typewriter Mode (Center Current Line)"
            >
              ⌨️
            </button>
            <button
              onClick={() => {
                if (sprintMode) {
                  stopSprint();
                } else {
                  startSprint();
                }
              }}
              className={`px-3 py-1.5 rounded transition-colors text-sm ${
                sprintMode
                  ? "bg-green-100 text-green-700"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
              title={
                sprintMode
                  ? "Stop Sprint"
                  : `Start ${sprintDuration} Min Sprint`
              }
            >
              {sprintMode ? "⏹️" : "⏱️"}
            </button>
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
            maxWidth: "800px",
            margin: "20px auto",
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
        .editor-content p {
          margin: 1em 0;
        }
        .editor-content p:first-child {
          margin-top: 0;
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
    </div>
  );
};
