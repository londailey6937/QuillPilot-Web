import { ChapterCheckerV2 } from "./ChapterCheckerV2";

/**
 * App Component - Root application component
 *
 * DOCX-first workflow: Upload → Analyze → Edit → Export
 *
 * @returns {JSX.Element} The main application interface
 */
function App(): JSX.Element {
  return <ChapterCheckerV2 />;
}

export default App;
