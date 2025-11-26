# QuillPilot Tester Guide

Use this checklist to exercise every major surface before a release. Record PASS/FAIL for each row and drop screenshots or console logs into the shared tester folder when something looks off.

## 1. Environment & Access

| #   | Area           | How to Test                                                                                 | Expected Result                                                                                                                   |
| --- | -------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Login/Session  | Launch the app logged out, trigger any feature that requires auth (e.g., Save Analysis).    | Auth modal appears and blocks gated actions until sign-in completes.                                                              |
| 1.2 | Tier detection | Sign in with Free, Premium, and Professional tester accounts. Reload after switching tiers. | Header pills and gated buttons reflect the tier (e.g., writer mode disabled on Free, AI template button visible on Professional). |
| 1.3 | Tester bypass  | Sign in with a tester email.                                                                | All premium/pro features unlock without upgrade prompts.                                                                          |

## 2. Appearance & Layout

| #   | Area                 | How to Test                                                                                       | Expected Result                                                                                                     |
| --- | -------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Dashboard shell      | Verify header stats bar, navigation menu, and view-mode toggle in both Analysis and Writer modes. | Layout stays aligned, stats update live, compact AI Template button shows whenever writer mode + professional tier. |
| 2.2 | Theme consistency    | Switch between light/dark OS themes (if supported) and resize from 1280px down to 960px width.    | Typography and spacing remain legible, no overlapping elements.                                                     |
| 2.3 | Loading/empty states | Load the app with no chapter data.                                                                | Friendly empty state prompts, no console errors.                                                                    |

## 3. Document Intake & Autosave

| #   | Area               | How to Test                                                                            | Expected Result                                                                                      |
| --- | ------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 3.1 | DOCX upload        | Upload a multi-chapter DOCX (with headings + images).                                  | Parser populates chapter text, counts images, and sets writer mode rich-text content.                |
| 3.2 | Copy/paste (Word)  | Paste rich prose from Microsoft Word, including centered paragraphs and inline images. | Text sanitizes but keeps italics, bold, and text-align styles; embedded images appear in the editor. |
| 3.3 | Finder/Plain paste | Paste plain text from Finder/Preview.                                                  | No rogue HTML; paragraph spacing preserved.                                                          |
| 3.4 | Autosave           | Type for 10+ seconds, refresh tab.                                                     | Autosave banner prompts to restore last work; accepting restores text, rejecting stores skip token.  |

## 4. Writer Mode Editing

| #   | Area                    | How to Test                                              | Expected Result                                                                            |
| --- | ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 4.1 | Formatting controls     | Use bold/italic/underline, lists, alignment buttons.     | Commands apply to selected text without DOM glitches.                                      |
| 4.2 | Goal & progress widgets | Set a session goal (word count/time) and type.           | Progress bars update live; hitting goal surfaces success state.                            |
| 4.3 | AI Template shortcut    | In writer mode + Professional tier, click the 🤖 button. | Template selector modal opens instantly; existing content stays untouched until confirmed. |

## 5. Analysis Pipeline

| #   | Area               | How to Test                                                                 | Expected Result                                                                                                |
| --- | ------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 5.1 | Manual analysis    | Load ~2,000-word chapter, run analysis.                                     | Progress bar cycles through stages, results populate with spacing, trope, and metrics cards.                   |
| 5.2 | Auto-analysis      | Enable auto-analysis toggle, type 250+ words, pause.                        | Worker kicks off automatically after debounce, same results as manual run.                                     |
| 5.3 | Domain selection   | Switch between detected domain, manual domain, and "none" (general).        | Analysis results mention the chosen domain; general mode also fills the general concepts panel.                |
| 5.4 | Worker diagnostics | Open DevTools console before running analysis on a large file (10k+ words). | `[Analysis Worker]` logs show diagnostic/progress events; failures surface detailed error messages with stats. |

## 6. Recommendations & Reference Tools

| #   | Area                 | How to Test                                           | Expected Result                                                             |
| --- | -------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| 6.1 | Concept list & pills | Hover/click suggested concepts after analysis.        | Tooltips show counts, clicking scrolls to relevant sections.                |
| 6.2 | Reference Library    | Open the Reference Library modal, search for a topic. | Results filter instantly, links open in new tab.                            |
| 6.3 | Inline indicators    | Toggle visual suggestions / spacing indicators.       | Editor overlays update without lag, and toggles remember state per session. |

## 7. Export & Sharing

| #   | Area                      | How to Test                                      | Expected Result                                                                              |
| --- | ------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 7.1 | DOCX export (tester-only) | With tester account, export the current chapter. | Download completes, resulting DOCX contains editor text plus analysis appendix.              |
| 7.2 | HTML export               | Trigger HTML export.                             | New tab or download supplies a styled HTML package, images embedded or referenced correctly. |
| 7.3 | JSON analysis export      | Use "Export Analysis" button.                    | JSON downloads with complete analysis payload and timestamps.                                |

## 8. Reliability & Error Handling

| #   | Area                    | How to Test                                                                               | Expected Result                                                                    |
| --- | ----------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 8.1 | Worker failure handling | Force a failure (e.g., kill worker via DevTools or exceed memory with extra-large paste). | UI surfaces clear error banner, worker terminates, no infinite spinners.           |
| 8.2 | Network offline         | Toggle browser offline while editing.                                                     | Autosave continues locally, analysis attempts fail gracefully with retry guidance. |
| 8.3 | Auth expiration         | Let session expire or sign out from another tab, then attempt save/export.                | App prompts for re-auth without losing unsaved text.                               |

## 9. Usability & Accessibility

| #   | Area                   | How to Test                                                     | Expected Result                                                        |
| --- | ---------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 9.1 | Keyboard navigation    | Tab through primary controls (upload, analyze, writer toolbar). | Focus order is logical; visible focus ring appears.                    |
| 9.2 | Screen reader labels   | Inspect buttons/modals with VoiceOver/NVDA.                     | ARIA labels describe actions; modals announce when opened.             |
| 9.3 | Performance perception | Load a 50k-word document and scroll/edit.                       | Typing latency stays acceptable (<150ms); memory usage remains stable. |

## 10. Reporting Checklist

- Capture browser/OS/tier for every bug.
- Attach console logs (look for `[Analysis Worker]` diagnostics) and network captures when analysis fails.
- Include minimal reproduction steps plus any test files used.
- Tag regressions vs. new features so triage knows severity.

Happy testing! Keep the issue tracker updated daily during the sprint.
