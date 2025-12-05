import React from "react";
import { DocumentStylesState } from "../types/documentStyles";

type RulerDragHandle = "left" | "right" | "indent" | null;

interface PagesSurfaceProps {
  wrapperRef: React.RefObject<HTMLDivElement>;
  scrollShellRef: React.RefObject<HTMLDivElement>;
  pagesContainerRef: React.RefObject<HTMLDivElement>;
  editorRef: React.RefObject<HTMLDivElement>;
  rulerFrameRef: React.RefObject<HTMLDivElement>;
  rulerContainerRef: React.RefObject<HTMLDivElement>;
  analysisLegendElement: React.ReactNode | null;
  showToolbarRow: boolean;
  focusMode: boolean;
  showRuler: boolean;
  showSpacingIndicators: boolean;
  showVisualSuggestions: boolean;
  showStyleLabels: boolean;
  isFreeMode: boolean;
  spacingIndicators: React.ReactNode;
  visualSuggestions: React.ReactNode;
  bookmarkIndicators: React.ReactNode;
  isEditable: boolean;
  onEditorInput: React.FormEventHandler<HTMLDivElement>;
  onEditorPaste: React.ClipboardEventHandler<HTMLDivElement>;
  onEditorKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  onEditorBeforeInput?: (e: InputEvent) => void;
  editorClassName?: string;
  leftMargin: number;
  rightMargin: number;
  firstLineIndent: number;
  documentStyles: DocumentStylesState;
  rulerDragging: RulerDragHandle;
  onRulerDragStart: (
    type: Exclude<RulerDragHandle, null>,
    event: React.MouseEvent
  ) => void;
  pageCount: number;
  showHeaderFooter: boolean;
  showPageNumbers: boolean;
  facingPages: boolean;
  pageWidthPx: number;
  pageHeightPx: number;
  inchInPx: number;
  headerReservedPx: number;
  footerReservedPx: number;
  rulerBackgroundLeftOverhang: number;
  rulerBackgroundRightOverhang: number;
  headerText: string;
  footerText: string;
  headerAlign: "left" | "center" | "right" | "justify";
  footerAlign: "left" | "center" | "right" | "justify";
  pageNumberPosition: "header" | "footer";
}

export const PagesSurface: React.FC<PagesSurfaceProps> = ({
  wrapperRef,
  scrollShellRef,
  pagesContainerRef,
  editorRef,
  rulerFrameRef,
  rulerContainerRef,
  analysisLegendElement,
  showToolbarRow,
  focusMode,
  showRuler,
  showSpacingIndicators,
  showVisualSuggestions,
  showStyleLabels,
  isFreeMode,
  spacingIndicators,
  visualSuggestions,
  bookmarkIndicators,
  isEditable,
  onEditorInput,
  onEditorPaste,
  onEditorKeyDown,
  onEditorBeforeInput,
  editorClassName,
  leftMargin,
  rightMargin,
  firstLineIndent,
  documentStyles,
  rulerDragging,
  onRulerDragStart,
  pageCount,
  showHeaderFooter,
  showPageNumbers,
  facingPages,
  pageWidthPx,
  pageHeightPx,
  inchInPx,
  headerReservedPx,
  footerReservedPx,
  rulerBackgroundLeftOverhang,
  rulerBackgroundRightOverhang,
  headerText,
  footerText,
  headerAlign,
  footerAlign,
  pageNumberPosition,
}) => {
  const shouldShowLegendFallback =
    !showRuler &&
    showStyleLabels &&
    (showSpacingIndicators || showVisualSuggestions) &&
    !(!isFreeMode && focusMode);

  // Attach beforeinput listener
  React.useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !onEditorBeforeInput) return;

    const handler = (e: Event) => onEditorBeforeInput(e as InputEvent);
    editor.addEventListener("beforeinput", handler);
    return () => editor.removeEventListener("beforeinput", handler);
  }, [editorRef, onEditorBeforeInput]);

  return (
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
            width: `${pageWidthPx}px`,
            maxWidth: "100%",
            paddingTop: "0px",
            paddingBottom: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "0px",
          }}
        >
          {!showToolbarRow && !focusMode && analysisLegendElement && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                paddingBottom: "8px",
              }}
            >
              {analysisLegendElement}
            </div>
          )}

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
                    left: `-${rulerBackgroundLeftOverhang}px`,
                    right: `-${rulerBackgroundRightOverhang}px`,
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
                  <div
                    style={{
                      position: "absolute",
                      left: `${(leftMargin / pageWidthPx) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: "2px",
                      backgroundColor: "#ef4444",
                      cursor: "ew-resize",
                      zIndex: 2,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onRulerDragStart("left", e);
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
                  <div
                    style={{
                      position: "absolute",
                      left: `${
                        ((pageWidthPx - rightMargin) / pageWidthPx) * 100
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
                      onRulerDragStart("right", e);
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
                  <div
                    style={{
                      position: "absolute",
                      left: `${
                        ((leftMargin + firstLineIndent) / pageWidthPx) * 100
                      }%`,
                      top: "2px",
                      transform: "translateX(-50%)",
                      cursor: "ew-resize",
                      zIndex: 3,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onRulerDragStart("indent", e);
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
                      <path d="M6 12L0 6H4V0H8V6H12L6 12Z" fill="#2c3e50" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {shouldShowLegendFallback && (
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
            {spacingIndicators}
            {visualSuggestions}
            {bookmarkIndicators}

            <div
              ref={editorRef}
              contentEditable={isEditable}
              onInput={onEditorInput}
              onPaste={onEditorPaste}
              onKeyDown={onEditorKeyDown}
              className={`editor-content page-editor focus:outline-none ${
                editorClassName || ""
              }`}
              style={{
                width: "100%",
                boxSizing: "border-box",
                backgroundColor: "#ffffff",
                caretColor: "#2c3e50",
                cursor: isEditable ? "text" : "default",
                position: "relative",
                zIndex: 5,
                minHeight: `${pageHeightPx}px`,
                paddingLeft: `${leftMargin}px`,
                paddingRight: `${rightMargin}px`,
                paddingTop: `${headerReservedPx}px`,
                paddingBottom: `${footerReservedPx}px`,
                boxShadow:
                  "0 14px 32px rgba(44, 62, 80, 0.16), 0 2px 6px rgba(44, 62, 80, 0.08)",
                borderRadius: "2px",
                ["--first-line-indent" as string]: `${documentStyles.paragraph.firstLineIndent}px`,
              }}
              suppressContentEditableWarning
            />

            {pageCount > 1 &&
              Array.from({ length: pageCount - 1 }, (_, i) => (
                <div
                  key={`page-break-${i}`}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${(i + 1) * pageHeightPx - footerReservedPx}px`,
                    height: "1px",
                    borderTop: "1px dashed #e0c392",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />
              ))}

            {/* Header and Footer display - visible when showStyleLabels is true */}
            {showStyleLabels &&
              Array.from({ length: pageCount }, (_, pageIndex) => {
                const isEvenPage = pageIndex % 2 === 0;
                const pageNumAlignment = facingPages
                  ? isEvenPage
                    ? "left"
                    : "right"
                  : "center";

                // Build header content
                const headerContent: React.ReactNode[] = [];
                if (headerText) {
                  const headerLines = headerText.split("\n");
                  headerLines.forEach((line, idx) => {
                    headerContent.push(
                      <div key={`header-line-${idx}`}>{line}</div>
                    );
                  });
                }
                // Don't show page number on first page
                if (
                  showPageNumbers &&
                  pageNumberPosition === "header" &&
                  pageIndex > 0
                ) {
                  headerContent.push(
                    <span
                      key="header-page"
                      style={{
                        position: "absolute",
                        left: pageNumAlignment === "left" ? "0" : "auto",
                        right: pageNumAlignment === "right" ? "0" : "auto",
                        ...(pageNumAlignment === "center" && {
                          left: "50%",
                          transform: "translateX(-50%)",
                        }),
                      }}
                    >
                      {pageIndex + 1}
                    </span>
                  );
                }

                // Build footer content
                const footerContent: React.ReactNode[] = [];
                if (footerText) {
                  const footerLines = footerText.split("\n");
                  footerLines.forEach((line, idx) => {
                    footerContent.push(
                      <div key={`footer-line-${idx}`}>{line}</div>
                    );
                  });
                }
                // Don't show page number on first page
                if (
                  showPageNumbers &&
                  pageNumberPosition === "footer" &&
                  pageIndex > 0
                ) {
                  footerContent.push(
                    <span
                      key="footer-page"
                      style={{
                        position: "absolute",
                        left: pageNumAlignment === "left" ? "0" : "auto",
                        right: pageNumAlignment === "right" ? "0" : "auto",
                        ...(pageNumAlignment === "center" && {
                          left: "50%",
                          transform: "translateX(-50%)",
                        }),
                      }}
                    >
                      {pageIndex + 1}
                    </span>
                  );
                }

                return (
                  <React.Fragment key={`header-footer-${pageIndex}`}>
                    {/* Header and footer text hidden in editor, shown only in export */}
                  </React.Fragment>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
