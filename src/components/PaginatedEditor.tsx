/**
 * PaginatedEditor - Production Custom Pagination Engine
 *
 * A Word-like pagination engine that renders content across multiple page elements.
 * Uses overflow detection and content splitting for true paginated editing.
 *
 * Key Features:
 * - Real page elements (not just visual indicators)
 * - Overflow detection with content splitting
 * - Inline formatting preservation across page breaks
 * - Cursor position management during repagination
 * - Configurable margins and page size
 * - Header/footer support
 * - Ruler integration ready
 */

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { DocumentStylesState } from "../types/documentStyles";

// ============================================================================
// Types
// ============================================================================

export interface PageDimensions {
  pageWidthPx: number;
  pageHeightPx: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export interface PageData {
  id: number;
  content: string;
}

export interface CursorPosition {
  pageIndex: number;
  nodeIndex: number;
  offset: number;
  atEnd: boolean;
}

export interface PaginatedEditorRef {
  getContent: () => string;
  setContent: (html: string) => void;
  focus: () => void;
  getPageCount: () => number;
  goToPage: (pageIndex: number) => void;
  execCommand: (command: string, value?: string) => void;
}

export interface PaginatedEditorProps {
  initialContent?: string;
  onChange?: (content: { html: string; text: string }) => void;
  onPageCountChange?: (count: number) => void;
  isEditable?: boolean;
  // Dimensions
  pageWidthPx?: number;
  pageHeightPx?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  // First line indent
  firstLineIndent?: number;
  // Header/Footer
  headerText?: string;
  footerText?: string;
  showPageNumbers?: boolean;
  pageNumberPosition?: "header" | "footer";
  // Styling
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  // Ruler
  showRuler?: boolean;
  onLeftMarginChange?: (value: number) => void;
  onRightMarginChange?: (value: number) => void;
  onFirstLineIndentChange?: (value: number) => void;
  // Document Styles
  documentStyles?: DocumentStylesState;
  showStyleLabels?: boolean;
  // Page Rail
  activePage?: number;
  onActivePageChange?: (pageIndex: number) => void;
  onPageSnippetsChange?: (snippets: string[]) => void;
  // Jump to page callback
  onJumpToPage?: (pageIndex: number) => void;
}

// ============================================================================
// Constants
// ============================================================================

const INCH_PX = 96;
const DEFAULT_PAGE_WIDTH = INCH_PX * 8.5;
const DEFAULT_PAGE_HEIGHT = INCH_PX * 11;
const DEFAULT_MARGIN = INCH_PX * 1;
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_LINE_HEIGHT = 1.6;
const DEFAULT_FONT_FAMILY = "Georgia, serif";
const REPAGINATE_DEBOUNCE_MS = 50;
const MAX_PAGES = 200;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Deep clone a node while preserving all attributes and styles
 */
function deepCloneNode(node: Node): Node {
  return node.cloneNode(true);
}

/**
 * Serialize nodes to HTML string
 */
function nodesToHtml(nodes: Node[]): string {
  return nodes
    .map((n) =>
      n.nodeType === Node.ELEMENT_NODE
        ? (n as Element).outerHTML
        : n.nodeType === Node.TEXT_NODE
        ? n.textContent || ""
        : ""
    )
    .join("");
}

/**
 * Parse HTML string to nodes
 */
function htmlToNodes(html: string): Node[] {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return Array.from(temp.childNodes);
}

/**
 * Check if a node is a block element
 */
function isBlockElement(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = (node as Element).tagName.toLowerCase();
  return [
    "p",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "ul",
    "ol",
    "li",
    "pre",
    "table",
    "tr",
    "section",
    "article",
    "header",
    "footer",
  ].includes(tag);
}

/**
 * Split text while preserving inline formatting
 * This handles <p>Some <b>bold</b> text here</p> correctly
 */
function splitFormattedText(
  element: Element,
  splitAtWord: number
): [Element, Element | null] {
  const clone1 = element.cloneNode(false) as Element;
  const clone2 = element.cloneNode(false) as Element;

  let wordCount = 0;
  let foundSplit = false;

  function processNode(node: Node, target1: Node, target2: Node): void {
    if (foundSplit) {
      target2.appendChild(deepCloneNode(node));
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      const words = text.split(/(\s+)/); // Keep whitespace

      const part1Words: string[] = [];
      const part2Words: string[] = [];

      for (const word of words) {
        if (foundSplit) {
          part2Words.push(word);
        } else if (word.trim()) {
          wordCount++;
          if (wordCount <= splitAtWord) {
            part1Words.push(word);
          } else {
            foundSplit = true;
            part2Words.push(word);
          }
        } else {
          // Whitespace
          if (wordCount < splitAtWord) {
            part1Words.push(word);
          } else if (wordCount === splitAtWord && !foundSplit) {
            part1Words.push(word);
          } else {
            part2Words.push(word);
          }
        }
      }

      if (part1Words.length > 0) {
        target1.appendChild(document.createTextNode(part1Words.join("")));
      }
      if (part2Words.length > 0) {
        target2.appendChild(document.createTextNode(part2Words.join("")));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const newEl1 = el.cloneNode(false) as Element;
      const newEl2 = el.cloneNode(false) as Element;

      for (const child of Array.from(el.childNodes)) {
        processNode(child, newEl1, newEl2);
      }

      if (newEl1.childNodes.length > 0 || newEl1.textContent) {
        target1.appendChild(newEl1);
      }
      if (newEl2.childNodes.length > 0 || newEl2.textContent) {
        target2.appendChild(newEl2);
      }
    }
  }

  for (const child of Array.from(element.childNodes)) {
    processNode(child, clone1, clone2);
  }

  return [clone1, clone2.childNodes.length > 0 ? clone2 : null];
}

/**
 * Count words in an element
 */
function countWords(element: Element): number {
  const text = element.textContent || "";
  return text.split(/\s+/).filter((w) => w.trim().length > 0).length;
}

// ============================================================================
// Main Component
// ============================================================================

export const PaginatedEditor = forwardRef<
  PaginatedEditorRef,
  PaginatedEditorProps
>(
  (
    {
      initialContent = "",
      onChange,
      onPageCountChange,
      isEditable = true,
      pageWidthPx = DEFAULT_PAGE_WIDTH,
      pageHeightPx = DEFAULT_PAGE_HEIGHT,
      marginTop = DEFAULT_MARGIN,
      marginBottom = DEFAULT_MARGIN,
      marginLeft = DEFAULT_MARGIN,
      marginRight = DEFAULT_MARGIN,
      firstLineIndent = 0,
      headerText = "",
      footerText = "",
      showPageNumbers = true,
      pageNumberPosition = "footer",
      fontFamily = DEFAULT_FONT_FAMILY,
      fontSize = DEFAULT_FONT_SIZE,
      lineHeight = DEFAULT_LINE_HEIGHT,
      showRuler = false,
      onLeftMarginChange,
      onRightMarginChange,
      onFirstLineIndentChange,
      // Document Styles
      documentStyles,
      showStyleLabels = true,
      // Page Rail
      activePage,
      onActivePageChange,
      onPageSnippetsChange,
    },
    ref
  ) => {
    // ========================================================================
    // State & Refs
    // ========================================================================

    const measureRef = useRef<HTMLDivElement>(null);
    const pagesContainerRef = useRef<HTMLDivElement>(null);
    const rulerContainerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const repaginateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRepaginatingRef = useRef(false);
    const savedCursorRef = useRef<CursorPosition | null>(null);

    const [pages, setPages] = useState<PageData[]>([{ id: 1, content: "" }]);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [rulerDragging, setRulerDragging] = useState<
      "left" | "right" | "indent" | null
    >(null);

    // Notify parent when active page changes
    useEffect(() => {
      onActivePageChange?.(activePageIndex);
    }, [activePageIndex, onActivePageChange]);

    // Sync with external activePage prop (for thumbnail rail clicks)
    // Using a ref to track if we should skip the sync to prevent loops
    const skipSyncRef = useRef(false);
    useEffect(() => {
      if (skipSyncRef.current) {
        skipSyncRef.current = false;
        return;
      }
      if (activePage !== undefined && activePage !== activePageIndex) {
        skipSyncRef.current = true;
        setActivePageIndex(activePage);
        // Scroll to the page
        const pageRef = pageRefs.current.get(pages[activePage]?.id);
        if (pageRef) {
          pageRef.scrollIntoView({ behavior: "smooth", block: "start" });
          pageRef.focus();
        }
      }
    }, [activePage, activePageIndex, pages]);

    // Computed dimensions
    const contentWidth = pageWidthPx - marginLeft - marginRight;
    const contentHeight = pageHeightPx - marginTop - marginBottom;

    // ========================================================================
    // Measurement
    // ========================================================================

    const measureHeight = useCallback((html: string): number => {
      if (!measureRef.current) {
        console.warn("[PaginatedEditor] measureRef not ready");
        return 0;
      }
      measureRef.current.innerHTML = html;
      const height = measureRef.current.scrollHeight;
      return height;
    }, []);

    // ========================================================================
    // Content Splitting
    // ========================================================================

    const splitContentAtHeight = useCallback(
      (html: string, maxHeight: number): [string, string] => {
        const nodes = htmlToNodes(html);
        if (nodes.length === 0) return [html, ""];

        const fittingNodes: Node[] = [];
        const remainingNodes: Node[] = [];
        let foundSplit = false;

        for (const node of nodes) {
          if (foundSplit) {
            remainingNodes.push(deepCloneNode(node));
            continue;
          }

          // Test if adding this node exceeds height
          const testNodes = [...fittingNodes, deepCloneNode(node)];
          const testHtml = nodesToHtml(testNodes);
          const testHeight = measureHeight(testHtml);

          if (testHeight <= maxHeight) {
            fittingNodes.push(deepCloneNode(node));
          } else {
            // This node causes overflow
            if (isBlockElement(node)) {
              const element = node as Element;
              const totalWords = countWords(element);

              if (totalWords > 1) {
                // Binary search for split point
                let low = 1;
                let high = totalWords;
                let bestFit = 0;

                while (low <= high) {
                  const mid = Math.floor((low + high) / 2);
                  const [testPart] = splitFormattedText(element, mid);
                  const testHtml = nodesToHtml([...fittingNodes, testPart]);
                  const height = measureHeight(testHtml);

                  if (height <= maxHeight) {
                    bestFit = mid;
                    low = mid + 1;
                  } else {
                    high = mid - 1;
                  }
                }

                if (bestFit > 0) {
                  const [part1, part2] = splitFormattedText(element, bestFit);
                  fittingNodes.push(part1);
                  if (part2) {
                    remainingNodes.push(part2);
                  }
                } else {
                  // Can't fit any of it
                  remainingNodes.push(deepCloneNode(node));
                }
              } else {
                // Single word or empty - push whole to remaining
                remainingNodes.push(deepCloneNode(node));
              }
            } else {
              // Non-block element - push whole
              remainingNodes.push(deepCloneNode(node));
            }
            foundSplit = true;
          }
        }

        return [nodesToHtml(fittingNodes), nodesToHtml(remainingNodes)];
      },
      [measureHeight]
    );

    // ========================================================================
    // Cursor Management
    // ========================================================================

    const saveCursorPosition = useCallback((): CursorPosition | null => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;

      const range = selection.getRangeAt(0);

      // Find which page contains the cursor
      for (let i = 0; i < pages.length; i++) {
        const pageRef = pageRefs.current.get(pages[i].id);
        if (pageRef && pageRef.contains(range.startContainer)) {
          // Calculate position within page
          const walker = document.createTreeWalker(
            pageRef,
            NodeFilter.SHOW_TEXT,
            null
          );

          let node = walker.nextNode();
          let nodeIndex = 0;

          while (node) {
            if (node === range.startContainer) {
              return {
                pageIndex: i,
                nodeIndex,
                offset: range.startOffset,
                atEnd:
                  range.collapsed &&
                  range.startOffset === (node.textContent?.length || 0),
              };
            }
            nodeIndex++;
            node = walker.nextNode();
          }

          // Fallback: return page with end position
          return {
            pageIndex: i,
            nodeIndex: 0,
            offset: 0,
            atEnd: true,
          };
        }
      }

      return null;
    }, [pages]);

    const restoreCursorPosition = useCallback(
      (saved: CursorPosition | null) => {
        if (!saved) return;

        const pageRef = pageRefs.current.get(pages[saved.pageIndex]?.id);
        if (!pageRef) return;

        // Focus the page
        pageRef.focus();

        const selection = window.getSelection();
        if (!selection) return;

        const walker = document.createTreeWalker(
          pageRef,
          NodeFilter.SHOW_TEXT,
          null
        );

        let node = walker.nextNode();
        let nodeIndex = 0;

        while (node) {
          if (nodeIndex === saved.nodeIndex) {
            try {
              const range = document.createRange();
              const offset = Math.min(
                saved.offset,
                node.textContent?.length || 0
              );
              range.setStart(node, offset);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            } catch {
              // Cursor restoration failed
            }
            return;
          }
          nodeIndex++;
          node = walker.nextNode();
        }

        // Fallback: put cursor at end of page
        if (saved.atEnd && pageRef.lastChild) {
          try {
            const range = document.createRange();
            range.selectNodeContents(pageRef);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          } catch {
            // Fallback failed
          }
        }
      },
      [pages]
    );

    // ========================================================================
    // Repagination
    // ========================================================================

    const repaginate = useCallback(
      (fullHtml: string, preserveCursor = true) => {
        console.log(
          "[PaginatedEditor] repaginate called, html length:",
          fullHtml.length,
          "first 200 chars:",
          fullHtml.substring(0, 200)
        );

        if (isRepaginatingRef.current) {
          console.log("[PaginatedEditor] Already repaginating, skipping");
          return;
        }
        isRepaginatingRef.current = true;

        // Check if measure div is ready
        if (!measureRef.current) {
          console.warn(
            "[PaginatedEditor] measureRef not ready during repaginate"
          );
          isRepaginatingRef.current = false;
          return;
        }

        // Save cursor before repagination
        const savedCursor = preserveCursor ? saveCursorPosition() : null;

        const newPages: PageData[] = [];
        let remaining = fullHtml;
        let pageId = 1;

        while (remaining.trim()) {
          const [fitting, leftover] = splitContentAtHeight(
            remaining,
            contentHeight
          );

          console.log(
            "[PaginatedEditor] Page",
            pageId,
            "fitting length:",
            fitting.length,
            "leftover length:",
            leftover.length
          );

          if (!fitting.trim() && leftover.trim()) {
            // Force content onto page to prevent infinite loop
            const closeTagIndex = leftover.indexOf("</");
            const endIndex =
              closeTagIndex > -1
                ? closeTagIndex +
                  leftover.substring(closeTagIndex).indexOf(">") +
                  1
                : leftover.length;
            const forcedContent = leftover.substring(0, endIndex) || leftover;
            newPages.push({ id: pageId, content: forcedContent });
            remaining = leftover.substring(forcedContent.length);
          } else {
            newPages.push({ id: pageId, content: fitting });
            remaining = leftover;
          }

          pageId++;
          if (pageId > MAX_PAGES) break;
        }

        if (newPages.length === 0) {
          newPages.push({ id: 1, content: "" });
        }

        console.log(
          "[PaginatedEditor] Setting",
          newPages.length,
          "pages. First page content length:",
          newPages[0]?.content.length
        );

        setPages(newPages);
        onPageCountChange?.(newPages.length);

        // Generate page snippets for thumbnail rail
        if (onPageSnippetsChange) {
          const snippets = newPages.map((page) => {
            // Extract text from HTML and get first ~50 chars
            const temp = document.createElement("div");
            temp.innerHTML = page.content;
            const text = temp.textContent || "";
            return (
              text.substring(0, 50).trim() + (text.length > 50 ? "..." : "")
            );
          });
          onPageSnippetsChange(snippets);
        }

        // Schedule cursor restoration
        if (savedCursor) {
          savedCursorRef.current = savedCursor;
        }

        isRepaginatingRef.current = false;
      },
      [
        contentHeight,
        splitContentAtHeight,
        saveCursorPosition,
        onPageCountChange,
      ]
    );

    // Restore cursor after pages update
    useEffect(() => {
      if (savedCursorRef.current) {
        requestAnimationFrame(() => {
          restoreCursorPosition(savedCursorRef.current);
          savedCursorRef.current = null;
        });
      }
    }, [pages, restoreCursorPosition]);

    // ========================================================================
    // Event Handlers
    // ========================================================================

    const collectAllContent = useCallback((): string => {
      const allContent: string[] = [];
      pages.forEach((page) => {
        const ref = pageRefs.current.get(page.id);
        if (ref) {
          allContent.push(ref.innerHTML);
        }
      });
      return allContent.join("");
    }, [pages]);

    const handleInput = useCallback(() => {
      // Clear any pending repagination
      if (repaginateTimeoutRef.current) {
        clearTimeout(repaginateTimeoutRef.current);
      }

      // Debounce repagination
      repaginateTimeoutRef.current = setTimeout(() => {
        const fullHtml = collectAllContent();

        // Notify parent
        onChange?.({
          html: fullHtml,
          text: fullHtml.replace(/<[^>]*>/g, ""),
        });

        repaginate(fullHtml, true);
      }, REPAGINATE_DEBOUNCE_MS);
    }, [collectAllContent, onChange, repaginate]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, pageIndex: number) => {
        const pageRef = pageRefs.current.get(pages[pageIndex]?.id);
        if (!pageRef) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);

        // Check cursor position - handle empty pages too
        const isAtStart = (() => {
          if (!range.collapsed) return false;
          // If page is empty or has no text, consider it "at start"
          const walker = document.createTreeWalker(
            pageRef,
            NodeFilter.SHOW_TEXT,
            null
          );
          const firstText = walker.nextNode();
          if (!firstText) return true; // Empty page
          return range.startContainer === firstText && range.startOffset === 0;
        })();

        const isAtEnd = (() => {
          if (!range.collapsed) return false;
          const walker = document.createTreeWalker(
            pageRef,
            NodeFilter.SHOW_TEXT,
            null
          );
          let lastText: Node | null = null;
          let node = walker.nextNode();
          while (node) {
            lastText = node;
            node = walker.nextNode();
          }
          if (!lastText) return true; // Empty page
          return (
            range.endContainer === lastText &&
            range.endOffset === (lastText.textContent?.length || 0)
          );
        })();

        // Navigate to previous page - only if we're at start AND there IS a previous page
        if (
          (e.key === "ArrowUp" || e.key === "ArrowLeft") &&
          isAtStart &&
          pageIndex > 0
        ) {
          e.preventDefault();
          const prevRef = pageRefs.current.get(pages[pageIndex - 1]?.id);
          if (prevRef) {
            prevRef.focus();
            // Move to end
            const newRange = document.createRange();
            newRange.selectNodeContents(prevRef);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
            setActivePageIndex(pageIndex - 1);
            // Scroll into view
            prevRef.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }

        // Backspace at start merges with previous page
        if (e.key === "Backspace" && isAtStart && pageIndex > 0) {
          // Let default behavior handle content deletion, then repaginate
          return;
        }

        // Navigate to next page - only if we're at end AND there IS a next page
        if (
          (e.key === "ArrowDown" || e.key === "ArrowRight") &&
          isAtEnd &&
          pageIndex < pages.length - 1
        ) {
          e.preventDefault();
          const nextRef = pageRefs.current.get(pages[pageIndex + 1]?.id);
          if (nextRef) {
            nextRef.focus();
            // Move to start
            const newRange = document.createRange();
            newRange.selectNodeContents(nextRef);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            setActivePageIndex(pageIndex + 1);
            // Scroll into view
            nextRef.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }

        // All other key events - let default behavior handle (normal arrow navigation within page)
      },
      [pages]
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        e.preventDefault();

        // Get plain text or HTML
        const html = e.clipboardData.getData("text/html");
        const text = e.clipboardData.getData("text/plain");

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Insert content
        if (html) {
          const temp = document.createElement("div");
          temp.innerHTML = html;
          const frag = document.createDocumentFragment();
          while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
          }
          range.insertNode(frag);
        } else if (text) {
          // Convert plain text to paragraphs
          const paragraphs = text.split(/\n\n+/);
          const frag = document.createDocumentFragment();
          paragraphs.forEach((para) => {
            const p = document.createElement("p");
            p.textContent = para;
            frag.appendChild(p);
          });
          range.insertNode(frag);
        }

        // Trigger repagination
        handleInput();
      },
      [handleInput]
    );

    // ========================================================================
    // Imperative Handle
    // ========================================================================

    useImperativeHandle(
      ref,
      () => ({
        getContent: () => collectAllContent(),
        setContent: (html: string) => {
          // Ensure the measure div is ready before repaginating
          if (!measureRef.current) {
            // If measure div isn't ready, wait for next frame
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                repaginate(html, false);
              });
            });
          } else {
            repaginate(html, false);
          }
        },
        focus: () => {
          const firstPage = pageRefs.current.get(pages[0]?.id);
          if (firstPage) firstPage.focus();
        },
        getPageCount: () => pages.length,
        goToPage: (pageIndex: number) => {
          const pageRef = pageRefs.current.get(pages[pageIndex]?.id);
          if (pageRef) {
            pageRef.focus();
            setActivePageIndex(pageIndex);
            pageRef.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        },
        execCommand: (command: string, value?: string) => {
          document.execCommand(command, false, value);
          // Trigger repagination after formatting
          setTimeout(() => {
            const fullHtml = collectAllContent();
            repaginate(fullHtml, true);
          }, 0);
        },
      }),
      [collectAllContent, repaginate, pages]
    );

    // ========================================================================
    // Ruler Drag Handling
    // ========================================================================

    const handleRulerDragStart = useCallback(
      (type: "left" | "right" | "indent", e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setRulerDragging(type);
      },
      []
    );

    useEffect(() => {
      if (!rulerDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!rulerContainerRef.current) return;

        const rect = rulerContainerRef.current.getBoundingClientRect();
        const relativeX = Math.max(0, e.clientX - rect.left);
        const maxWidth = Math.min(rect.width, pageWidthPx);
        const constrainedX = Math.max(0, Math.min(relativeX, maxWidth));

        if (rulerDragging === "left") {
          const newLeft = Math.max(0, Math.min(constrainedX, 200));
          onLeftMarginChange?.(newLeft);
        } else if (rulerDragging === "right") {
          const fromRight = maxWidth - constrainedX;
          onRightMarginChange?.(Math.max(0, Math.min(fromRight, 200)));
        } else if (rulerDragging === "indent") {
          const rawAbsolutePos = Math.max(
            marginLeft,
            Math.min(constrainedX, maxWidth - marginRight)
          );
          const relativeIndent = rawAbsolutePos - marginLeft;
          const snappedIndent = Math.round(relativeIndent / 24) * 24;
          const newIndent = Math.max(
            0,
            Math.min(snappedIndent, maxWidth - marginRight - marginLeft)
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
      marginLeft,
      marginRight,
      pageWidthPx,
      onLeftMarginChange,
      onRightMarginChange,
      onFirstLineIndentChange,
    ]);

    // ========================================================================
    // Initialization
    // ========================================================================

    useEffect(() => {
      if (initialContent) {
        repaginate(initialContent, false);
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Focus first page on mount
    useEffect(() => {
      const timer = setTimeout(() => {
        const firstPage = pageRefs.current.get(1);
        if (firstPage && isEditable) {
          firstPage.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [isEditable]);

    // ========================================================================
    // Render
    // ========================================================================

    // Styles for page content
    const contentStyle: React.CSSProperties = {
      position: "absolute",
      top: `${marginTop}px`,
      left: `${marginLeft}px`,
      width: `${contentWidth}px`,
      height: `${contentHeight}px`,
      overflow: "hidden",
      outline: "none",
      fontSize: `${fontSize}px`,
      lineHeight: lineHeight,
      fontFamily: fontFamily,
      color: "#333",
      textIndent: `${firstLineIndent}px`,
    };

    return (
      <div
        className="paginated-editor-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#eddcc5", // Match writer-stage tan background
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "24px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Inline styles for first-line indent and document styles */}
        <style key={`indent-style-${firstLineIndent}`}>
          {`
            .paginated-page-content {
              text-indent: ${firstLineIndent}px !important;
            }
            .paginated-page-content p,
            .paginated-page-content div {
              text-indent: ${firstLineIndent}px !important;
              margin-bottom: 1em;
              margin-top: 0;
            }
            .paginated-page-content:focus {
              outline: none;
            }
            ${
              documentStyles?.["book-title"]?.color
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { color: ${documentStyles["book-title"].color} !important; }`
                : ""
            }
            ${
              documentStyles?.["book-title"]?.backgroundColor
                ? `.paginated-page-content .book-title, .paginated-page-content .doc-title { background-color: ${documentStyles["book-title"].backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.color
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { color: ${documentStyles["chapter-heading"].color} !important; }`
                : ""
            }
            ${
              documentStyles?.["chapter-heading"]?.backgroundColor
                ? `.paginated-page-content .chapter-heading, .paginated-page-content h1.chapter-heading { background-color: ${documentStyles["chapter-heading"].backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.color
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { color: ${documentStyles.subtitle.color} !important; }`
                : ""
            }
            ${
              documentStyles?.subtitle?.backgroundColor
                ? `.paginated-page-content .subtitle, .paginated-page-content .doc-subtitle { background-color: ${documentStyles.subtitle.backgroundColor} !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.color
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote) { color: ${documentStyles.paragraph.color} !important; }`
                : ""
            }
            ${
              documentStyles?.paragraph?.backgroundColor
                ? `.paginated-page-content p:not(.book-title):not(.doc-title):not(.chapter-heading):not(.subtitle):not(.doc-subtitle):not(.quote):not(.intense-quote) { background-color: ${documentStyles.paragraph.backgroundColor} !important; }`
                : ""
            }
          `}
        </style>

        {/* Hidden measurement div */}
        <div
          ref={measureRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            visibility: "hidden",
            width: `${contentWidth}px`,
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            fontFamily: fontFamily,
          }}
        />

        {/* Ruler */}
        {showRuler && (
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              width: `${pageWidthPx}px`,
              marginBottom: "8px",
              backgroundColor: "#eddcc5",
              paddingTop: "4px",
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
              {/* Ruler background */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
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
                {/* Inch marks */}
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
                {/* Left margin handle */}
                <div
                  style={{
                    position: "absolute",
                    left: `${(marginLeft / pageWidthPx) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: "2px",
                    backgroundColor: "#ef4444",
                    cursor: "ew-resize",
                    zIndex: 2,
                  }}
                  onMouseDown={(e) => handleRulerDragStart("left", e)}
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
                {/* Right margin handle */}
                <div
                  style={{
                    position: "absolute",
                    left: `${
                      ((pageWidthPx - marginRight) / pageWidthPx) * 100
                    }%`,
                    top: 0,
                    bottom: 0,
                    width: "2px",
                    backgroundColor: "#ef4444",
                    cursor: "ew-resize",
                    zIndex: 2,
                  }}
                  onMouseDown={(e) => handleRulerDragStart("right", e)}
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
                {/* First line indent handle */}
                <div
                  style={{
                    position: "absolute",
                    left: `${
                      ((marginLeft + firstLineIndent) / pageWidthPx) * 100
                    }%`,
                    top: "0",
                    transform: "translateX(-50%)",
                    cursor: "ew-resize",
                    zIndex: 3,
                    padding: "4px",
                  }}
                  onMouseDown={(e) => handleRulerDragStart("indent", e)}
                  title="First Line Indent"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ pointerEvents: "none" }}
                  >
                    <path d="M6 0L12 8H0L6 0Z" fill="#3b82f6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pages */}
        <div
          ref={pagesContainerRef}
          className="paginated-pages-stack"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            alignItems: "center",
          }}
        >
          {pages.map((page, index) => (
            <div
              key={page.id}
              className="paginated-page"
              style={{
                width: `${pageWidthPx}px`,
                height: `${pageHeightPx}px`,
                backgroundColor: "#ffffff",
                boxShadow:
                  activePageIndex === index
                    ? "0 0 0 3px #3b82f6, 0 8px 32px rgba(0, 0, 0, 0.2)"
                    : "0 4px 20px rgba(0, 0, 0, 0.15)",
                position: "relative",
                overflow: "hidden",
                transition: "box-shadow 0.15s ease",
              }}
            >
              {/* Header */}
              {headerText && (
                <div
                  style={{
                    position: "absolute",
                    top: `${marginTop / 3}px`,
                    left: `${marginLeft}px`,
                    right: `${marginRight}px`,
                    fontSize: "11px",
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  {headerText}
                  {showPageNumbers &&
                    pageNumberPosition === "header" &&
                    index > 0 && (
                      <span style={{ marginLeft: "16px" }}>{index + 1}</span>
                    )}
                </div>
              )}

              {/* Content */}
              <div
                ref={(el) => {
                  if (el) {
                    pageRefs.current.set(page.id, el);
                  } else {
                    pageRefs.current.delete(page.id);
                  }
                }}
                className="paginated-page-content"
                contentEditable={isEditable}
                suppressContentEditableWarning
                onInput={() => handleInput()}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={(e) => handlePaste(e)}
                onFocus={() => setActivePageIndex(index)}
                dangerouslySetInnerHTML={{ __html: page.content }}
                style={contentStyle}
              />

              {/* Footer / Page number */}
              <div
                style={{
                  position: "absolute",
                  bottom: `${marginBottom / 3}px`,
                  left: `${marginLeft}px`,
                  right: `${marginRight}px`,
                  fontSize: "11px",
                  color: "#666",
                  textAlign: "center",
                }}
              >
                {footerText}
                {showPageNumbers &&
                  pageNumberPosition === "footer" &&
                  index > 0 && <span>{index + 1}</span>}
              </div>

              {/* Page edge shadow for depth */}
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  background:
                    "linear-gradient(to right, transparent, rgba(0,0,0,0.05))",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "4px",
                  background:
                    "linear-gradient(to bottom, transparent, rgba(0,0,0,0.05))",
                  pointerEvents: "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div
          style={{
            position: "fixed",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(30, 41, 59, 0.95)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            zIndex: 100,
          }}
        >
          <span style={{ fontWeight: 500 }}>
            Page {activePageIndex + 1} of {pages.length}
          </span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ opacity: 0.8 }}>
            {
              collectAllContent()
                .replace(/<[^>]*>/g, "")
                .split(/\s+/)
                .filter((w) => w.length > 0).length
            }{" "}
            words
          </span>
        </div>
      </div>
    );
  }
);

PaginatedEditor.displayName = "PaginatedEditor";

export default PaginatedEditor;
