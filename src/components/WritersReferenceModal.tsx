import { useState, useMemo } from "react";
import { AnimatedLogo } from "./AnimatedLogo";

interface WritersReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * WritersReferenceModal Component - Comprehensive writer's guide
 *
 * Displays in-depth documentation for Writer Mode, Advanced Tools,
 * productivity features, and writing best practices.
 */
export function WritersReferenceModal({
  isOpen,
  onClose,
}: WritersReferenceModalProps): JSX.Element | null {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const sections = {
    overview: "Writer Mode Overview",
    toolbar: "Editor Toolbar",
    advancedTools: "Advanced Tools Panel",
    aiAssistant: "AI Writing Assistant",
    dialogue: "Dialogue Enhancer",
    versionHistory: "Version History",
    comments: "Comments & Annotations",
    beatSheet: "Beat Sheet Generator",
    povChecker: "POV Checker",
    readability: "Readability Metrics",
    cliche: "Cliché Detector",
    emotion: "Emotion Tracker",
    motif: "Motif & Symbol Tracker",
    productivity: "Productivity Features",
    characters: "Character Management",
    export: "Export Options",
    tips: "Tips & Best Practices",
    shortcuts: "Keyboard Shortcuts",
  };

  // Search functionality - must be before early return to follow React hooks rules
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, string> = {};
    Object.entries(sections).forEach(([key, label]) => {
      if (label.toLowerCase().includes(query)) {
        filtered[key] = label;
      }
    });
    return filtered;
  }, [searchQuery]);

  // Early return must come AFTER all hooks
  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="writers-ref-content">
            <h2>Writer Mode Overview</h2>
            <p>
              Writer Mode transforms QuillPilot from an analysis tool into a
              full-featured writing environment with real-time feedback.
            </p>

            <h3>What You Get in Writer Mode</h3>
            <ul>
              <li>
                <strong>Rich text editor</strong> with professional formatting
                tools
              </li>
              <li>
                <strong>Live analysis indicators</strong> showing pacing and
                sensory detail issues
              </li>
              <li>
                <strong>Real-time statistics</strong> (word count, reading time,
                reading level)
              </li>
              <li>
                <strong>Auto-save</strong> protection against lost work
              </li>
              <li>
                <strong>Advanced Tools Panel</strong> for deep manuscript
                analysis
              </li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Access Writer Mode by clicking the ✍️
              Writer tab after uploading a document. Writer Mode is available to
              Professional tier users.
            </div>

            <h3>Writer Mode Layout</h3>
            <div className="code-block">
              <pre>{`┌─────────────────────────────────────────────────────────────┐
│  [Toolbar: Formatting | Alignment | Insert | View]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Your Document                            │
│                                                             │
│  [Inline spacing indicators]                                │
│  [Sensory detail callouts]                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Word Count: 3,247  |  Reading Time: 13 min  |  Grade: 8.2  │
└─────────────────────────────────────────────────────────────┘`}</pre>
            </div>
          </div>
        );

      case "toolbar":
        return (
          <div className="writers-ref-content">
            <h2>The Editor Toolbar</h2>

            <h3>Text Formatting</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Button</th>
                  <th>Shortcut</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>B</strong>
                  </td>
                  <td>Cmd/Ctrl+B</td>
                  <td>Bold text</td>
                </tr>
                <tr>
                  <td>
                    <strong>I</strong>
                  </td>
                  <td>Cmd/Ctrl+I</td>
                  <td>Italic text</td>
                </tr>
                <tr>
                  <td>
                    <strong>U</strong>
                  </td>
                  <td>Cmd/Ctrl+U</td>
                  <td>Underline text</td>
                </tr>
                <tr>
                  <td>
                    <strong>S̶</strong>
                  </td>
                  <td>—</td>
                  <td>Strikethrough</td>
                </tr>
              </tbody>
            </table>

            <h3>Block Formatting</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Usage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Paragraph</td>
                  <td>Normal body text</td>
                </tr>
                <tr>
                  <td>Heading 1-6</td>
                  <td>Chapter titles and section headers</td>
                </tr>
                <tr>
                  <td>Quote</td>
                  <td>Block quotations</td>
                </tr>
                <tr>
                  <td>Pull Quote</td>
                  <td>Emphasized quotations</td>
                </tr>
                <tr>
                  <td>Code Block</td>
                  <td>Monospace text</td>
                </tr>
                <tr>
                  <td>Footnote</td>
                  <td>Reference notes</td>
                </tr>
              </tbody>
            </table>

            <h3>View Options</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Button</th>
                  <th>Function</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🎯</td>
                  <td>Focus Mode (hide distractions)</td>
                </tr>
                <tr>
                  <td>⌨️</td>
                  <td>Typewriter Mode (center current line)</td>
                </tr>
                <tr>
                  <td>⏱️</td>
                  <td>Word Sprint Timer</td>
                </tr>
              </tbody>
            </table>

            <div className="tip-box">
              <strong>💡 Tip:</strong> QuillPilot maintains a 50-state undo
              history, so don't worry about experimenting!
            </div>
          </div>
        );

      case "advancedTools":
        return (
          <div className="writers-ref-content">
            <h2>Advanced Tools Panel</h2>
            <p>
              Access by clicking the <strong>🛠️ Advanced Tools</strong> button.
              These professional-grade tools help you analyze and improve your
              manuscript.
            </p>

            <h3>Content Generation & Enhancement</h3>
            <ul>
              <li>
                <strong>✨ AI Writing Assistant</strong> — Rephrase, word
                choice, completion, enhancement
              </li>
              <li>
                <strong>💬 Dialogue Enhancer</strong> — Analyze dialogue for
                authenticity
              </li>
              <li>
                <strong>📜 Version History</strong>{" "}
                <span className="new-badge">NEW</span> — Save and compare drafts
              </li>
              <li>
                <strong>💬 Comments & Annotations</strong>{" "}
                <span className="new-badge">NEW</span> — Leave notes for
                yourself or beta readers
              </li>
            </ul>

            <h3>Structural Analysis</h3>
            <ul>
              <li>
                <strong>📖 Beat Sheet Generator</strong> — Detect story
                structure and plot points
              </li>
              <li>
                <strong>👁️ POV Checker</strong> — Find perspective
                inconsistencies
              </li>
            </ul>

            <h3>Analysis Tools</h3>
            <ul>
              <li>
                <strong>📊 Readability Metrics</strong> — Grade level and
                complexity analysis
              </li>
              <li>
                <strong>🚫 Cliché Detector</strong> — Find overused phrases
              </li>
              <li>
                <strong>💖 Emotion Tracker</strong> — Map emotional arcs
              </li>
              <li>
                <strong>🔮 Motif & Symbol Tracker</strong> — Identify recurring
                elements
              </li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Use Advanced Tools during revision, not
              first drafts. Write first, analyze later!
            </div>
          </div>
        );

      case "aiAssistant":
        return (
          <div className="writers-ref-content">
            <h2>✨ AI Writing Assistant</h2>
            <p>Get intelligent suggestions for improving your prose.</p>

            <h3>Modes</h3>
            <ul>
              <li>
                <strong>Rephrase:</strong> Generate alternative ways to express
                your ideas
              </li>
              <li>
                <strong>Word Choice:</strong> Find better synonyms and word
                alternatives
              </li>
              <li>
                <strong>Complete:</strong> Get sentence completion suggestions
              </li>
              <li>
                <strong>Enhance:</strong> Add sensory details and emotional
                depth
              </li>
            </ul>

            <h3>How to Use</h3>
            <ol>
              <li>Select text in your editor</li>
              <li>Open Advanced Tools → AI Writing Assistant</li>
              <li>Choose a mode</li>
              <li>Click any suggestion to replace your text</li>
            </ol>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>
                  Use Rephrase when a sentence feels clunky but you can't
                  pinpoint why
                </li>
                <li>Word Choice is great for reducing repetition</li>
                <li>
                  Enhance works best on action scenes lacking sensory detail
                </li>
              </ul>
            </div>
          </div>
        );

      case "dialogue":
        return (
          <div className="writers-ref-content">
            <h2>💬 Dialogue Enhancer</h2>
            <p>Analyze dialogue for authenticity and character voice.</p>

            <h3>What It Analyzes</h3>
            <ul>
              <li>
                <strong>Natural Flow:</strong> Detects stiff or unnatural
                dialogue
              </li>
              <li>
                <strong>Subtext Detection:</strong> Finds moments where
                characters say less than they mean
              </li>
              <li>
                <strong>Voice Consistency:</strong> Ensures each character
                sounds unique
              </li>
              <li>
                <strong>Dialogue Tags:</strong> Flags overused tags and suggests
                alternatives
              </li>
            </ul>

            <h3>Metrics</h3>
            <ul>
              <li>Flow Score (0-100%)</li>
              <li>Voice Consistency Score (0-100%)</li>
              <li>Subtext presence indicators</li>
              <li>Tag variety analysis</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Run this after writing dialogue-heavy scenes</li>
                <li>
                  Pay attention to Voice Consistency if characters blur together
                </li>
                <li>
                  Subtext is key for tension—aim for characters who don't say
                  exactly what they mean
                </li>
              </ul>
            </div>
          </div>
        );

      case "versionHistory":
        return (
          <div className="writers-ref-content">
            <h2>
              📜 Version History <span className="new-badge">NEW</span>
            </h2>
            <p>
              Save snapshots of your document and compare changes over time.
            </p>

            <h3>Features</h3>
            <ul>
              <li>
                <strong>Save Snapshots:</strong> Create named versions at any
                point
              </li>
              <li>
                <strong>Compare Drafts:</strong> See additions (green) and
                deletions (red) side-by-side
              </li>
              <li>
                <strong>Restore Versions:</strong> Roll back to any previous
                snapshot
              </li>
              <li>
                <strong>Auto-timestamps:</strong> Know exactly when each version
                was saved
              </li>
            </ul>

            <h3>How to Use</h3>
            <ol>
              <li>Open Advanced Tools → Version History</li>
              <li>Click "Save Snapshot" to capture current state</li>
              <li>Add a descriptive name (e.g., "Before killing darlings")</li>
              <li>Click any version to compare or restore</li>
            </ol>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Save a version before major cuts or rewrites</li>
                <li>
                  Name versions descriptively: "Chapter 5 - added flashback"
                </li>
                <li>Use compare mode to review what changed between drafts</li>
              </ul>
            </div>
          </div>
        );

      case "comments":
        return (
          <div className="writers-ref-content">
            <h2>
              💬 Comments & Annotations <span className="new-badge">NEW</span>
            </h2>
            <p>
              Leave notes for yourself or beta readers throughout your
              manuscript.
            </p>

            <h3>Categories</h3>
            <ul>
              <li>
                <strong>📝 General:</strong> General notes and reminders
              </li>
              <li>
                <strong>💡 Suggestion:</strong> Ideas for improvement
              </li>
              <li>
                <strong>❓ Question:</strong> Things to research or verify
              </li>
              <li>
                <strong>✏️ Correction:</strong> Errors to fix
              </li>
            </ul>

            <h3>Features</h3>
            <ul>
              <li>
                <strong>Beta Reader Mode:</strong> Toggle to show only comments
                meant for others
              </li>
              <li>
                <strong>Filter by Category:</strong> Focus on one type of
                comment
              </li>
              <li>
                <strong>Resolve Comments:</strong> Mark items as addressed
              </li>
              <li>
                <strong>Filter Resolved:</strong> Hide completed items
              </li>
            </ul>

            <h3>How to Use</h3>
            <ol>
              <li>Select text you want to annotate</li>
              <li>Open Advanced Tools → Comments</li>
              <li>Choose a category and write your note</li>
              <li>Toggle Beta Reader Mode when sharing with others</li>
            </ol>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Use Questions for facts you need to verify later</li>
                <li>Mark suggestions as resolved once you've addressed them</li>
                <li>Beta Reader Mode hides your personal notes when sharing</li>
              </ul>
            </div>
          </div>
        );

      case "beatSheet":
        return (
          <div className="writers-ref-content">
            <h2>📖 Beat Sheet Generator</h2>
            <p>Automatically detect story structure and major plot points.</p>

            <h3>Supported Structures</h3>

            <h4>Three-Act Structure</h4>
            <ul>
              <li>Opening</li>
              <li>Inciting Incident</li>
              <li>Lock In (Point of No Return)</li>
              <li>Midpoint</li>
              <li>All Is Lost</li>
              <li>Climax</li>
              <li>Resolution</li>
            </ul>

            <h4>Five-Act Structure</h4>
            <ul>
              <li>Exposition</li>
              <li>Rising Action</li>
              <li>Climax</li>
              <li>Falling Action</li>
              <li>Denouement</li>
            </ul>

            <h4>Hero's Journey (12 Stages)</h4>
            <p>
              Ordinary World → Call to Adventure → Refusal → Meeting the Mentor
              → Crossing the Threshold → Tests/Allies/Enemies → Approach →
              Ordeal → Reward → Road Back → Resurrection → Return with Elixir
            </p>

            <h3>What You'll See</h3>
            <ul>
              <li>Visual timeline showing beat positions</li>
              <li>Pacing breakdown (Act 1/2/3 percentages)</li>
              <li>Confidence scores for each detected beat</li>
              <li>Recommendations for structural improvements</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>
                  Click any beat to navigate to that location in your text
                </li>
                <li>
                  Missing beats aren't always bad—some stories subvert structure
                </li>
                <li>
                  Use this to identify if Act 2 is dragging (common issue)
                </li>
              </ul>
            </div>
          </div>
        );

      case "povChecker":
        return (
          <div className="writers-ref-content">
            <h2>👁️ POV Checker</h2>
            <p>Detect point-of-view inconsistencies and head-hopping.</p>

            <h3>Detects</h3>
            <ul>
              <li>POV shifts between first, second, and third person</li>
              <li>Head-hopping (switching perspective mid-scene)</li>
              <li>Mixing deep POV with distant narration</li>
              <li>Unclear perspective moments</li>
            </ul>

            <h3>Metrics</h3>
            <ul>
              <li>Dominant POV identification</li>
              <li>Consistency score (0-100%)</li>
              <li>Character perspective tracking</li>
              <li>Severity ratings for each issue</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>High consistency scores (90%+) indicate clean POV</li>
                <li>Intentional POV shifts should happen at scene breaks</li>
                <li>
                  Deep POV means readers only know what your POV character knows
                </li>
              </ul>
            </div>
          </div>
        );

      case "readability":
        return (
          <div className="writers-ref-content">
            <h2>📊 Readability Metrics</h2>
            <p>Understand your text's reading level and complexity.</p>

            <h3>Metrics Explained</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Range</th>
                  <th>What It Measures</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Flesch Reading Ease</td>
                  <td>0-100</td>
                  <td>Higher = easier to read</td>
                </tr>
                <tr>
                  <td>Flesch-Kincaid Grade</td>
                  <td>1-18+</td>
                  <td>U.S. grade level needed</td>
                </tr>
                <tr>
                  <td>Gunning Fog Index</td>
                  <td>1-20+</td>
                  <td>Years of education needed</td>
                </tr>
                <tr>
                  <td>SMOG Index</td>
                  <td>1-18+</td>
                  <td>Grade for 100% comprehension</td>
                </tr>
              </tbody>
            </table>

            <h3>Target Reading Levels by Genre</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Genre</th>
                  <th>Target Grade</th>
                  <th>Flesch Ease</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>YA Fiction</td>
                  <td>6-8</td>
                  <td>70-80</td>
                </tr>
                <tr>
                  <td>Commercial Fiction</td>
                  <td>7-9</td>
                  <td>60-70</td>
                </tr>
                <tr>
                  <td>Literary Fiction</td>
                  <td>9-12</td>
                  <td>50-65</td>
                </tr>
                <tr>
                  <td>Children's (MG)</td>
                  <td>4-6</td>
                  <td>80-90</td>
                </tr>
              </tbody>
            </table>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Most bestsellers score 7th-9th grade level</li>
                <li>High grade levels often mean sentences are too long</li>
                <li>
                  Vary sentence length for better flow, even if it raises the
                  score slightly
                </li>
              </ul>
            </div>
          </div>
        );

      case "cliche":
        return (
          <div className="writers-ref-content">
            <h2>🚫 Cliché Detector</h2>
            <p>Find overused phrases and get fresh alternatives.</p>

            <h3>Categories</h3>
            <ul>
              <li>Filler phrases ("at the end of the day")</li>
              <li>Emotional clichés ("heart skipped a beat")</li>
              <li>Descriptive clichés ("eyes like pools")</li>
              <li>Comparisons ("quiet as a mouse")</li>
              <li>Time expressions ("in the nick of time")</li>
            </ul>

            <h3>For Each Cliché Found</h3>
            <ul>
              <li>Original phrase highlighted</li>
              <li>3-5 alternative suggestions</li>
              <li>Click to replace instantly</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>
                  Not every cliché needs replacing—dialogue can use them
                  naturally
                </li>
                <li>Focus on narrative clichés first</li>
                <li>
                  Sometimes the "cliché" is intentional voice—trust your
                  instincts
                </li>
              </ul>
            </div>
          </div>
        );

      case "emotion":
        return (
          <div className="writers-ref-content">
            <h2>💖 Emotion Tracker</h2>
            <p>Map emotional arcs across your story.</p>

            <h3>Tracked Emotions</h3>
            <p>
              Joy, Anger, Fear, Sadness, Love, Tension, Surprise, Disgust, Hope,
              Despair
            </p>

            <h3>What You'll See</h3>
            <ul>
              <li>Emotional arc visualization by chapter/section</li>
              <li>Dominant emotions identified</li>
              <li>Intensity scoring (0-100%)</li>
              <li>High tension point markers</li>
              <li>Emotional variety analysis</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>
                  Stories need emotional variety—all tension is exhausting
                </li>
                <li>
                  Romance should show love building; thrillers should show fear
                  escalating
                </li>
                <li>Flat emotional arcs often indicate passive characters</li>
              </ul>
            </div>
          </div>
        );

      case "motif":
        return (
          <div className="writers-ref-content">
            <h2>🔮 Motif & Symbol Tracker</h2>
            <p>Identify recurring symbols and thematic elements.</p>

            <h3>Tracks</h3>
            <ul>
              <li>
                <strong>Symbols:</strong> Light/darkness, water/fire, birds,
                mirrors, etc.
              </li>
              <li>
                <strong>Themes:</strong> Identity, betrayal, redemption,
                sacrifice, etc.
              </li>
              <li>
                <strong>Recurring Phrases:</strong> 3-5 word phrases that repeat
              </li>
              <li>
                <strong>Images:</strong> Visual motifs throughout the text
              </li>
            </ul>

            <h3>For Each Motif</h3>
            <ul>
              <li>Occurrence count</li>
              <li>Locations in text (click to navigate)</li>
              <li>Significance explanation</li>
            </ul>

            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>
                  Unconscious repetition often reveals your story's true theme
                </li>
                <li>
                  Symbols should appear at least 3 times to register with
                  readers
                </li>
                <li>
                  Track your phrases—repetition can be powerful or annoying
                </li>
              </ul>
            </div>
          </div>
        );

      case "productivity":
        return (
          <div className="writers-ref-content">
            <h2>Productivity Features</h2>

            <h3>🔥 Writing Streak Tracker</h3>
            <p>Build momentum with daily writing habits.</p>
            <ul>
              <li>Calendar showing writing days</li>
              <li>Current streak and longest streak record</li>
              <li>Total words tracked</li>
              <li>Motivational messages</li>
            </ul>
            <div className="tip-box">
              <strong>💡 Tip:</strong> Even 100 words counts toward your streak.
              Show up every day!
            </div>

            <h3>🎯 Goal Setting & Progress</h3>
            <p>Set and track writing goals.</p>
            <ul>
              <li>
                <strong>Daily:</strong> Write X words today
              </li>
              <li>
                <strong>Weekly:</strong> Complete X words this week
              </li>
              <li>
                <strong>Project:</strong> Finish manuscript of X words
              </li>
            </ul>
            <div className="tip-box">
              <strong>💡 Tip:</strong> Set achievable daily goals. 500 words/day
              = 180,000 words/year!
            </div>

            <h3>🎯 Focus Mode</h3>
            <p>Eliminate distractions for deep writing.</p>
            <p>
              <strong>Hides:</strong> Analysis indicators, spacing callouts,
              statistics bar
            </p>
            <div className="tip-box">
              <strong>💡 Tip:</strong> Use Focus Mode for first drafts, disable
              it for revision.
            </div>

            <h3>⌨️ Typewriter Mode</h3>
            <p>
              Keep your current line centered on screen. Reduces neck strain
              from looking at bottom of screen.
            </p>
            <div className="tip-box">
              <strong>💡 Tip:</strong> Combine with Focus Mode for ultimate
              immersion.
            </div>

            <h3>⏱️ Word Sprint Timer</h3>
            <p>Timed writing sessions for maximum productivity.</p>
            <ol>
              <li>Click the ⏱️ button</li>
              <li>Set duration (default: 15 minutes)</li>
              <li>Write without stopping until timer ends</li>
              <li>See your stats: words written, words per minute</li>
            </ol>
            <div className="tip-box">
              <strong>💡 Tips:</strong>
              <ul>
                <li>Don't edit during sprints—just write</li>
                <li>15-20 minute sprints work best for most writers</li>
                <li>Track your WPM to see improvement over time</li>
              </ul>
            </div>

            <h3>🎤 Voice-to-Text</h3>
            <p>Dictate your story hands-free.</p>
            <p>
              <strong>Supported Browsers:</strong> Chrome, Edge, Safari
            </p>
            <ul>
              <li>Say "period" or "comma" for punctuation</li>
              <li>Say "new paragraph" for line breaks</li>
              <li>Works best in quiet environments</li>
            </ul>
          </div>
        );

      case "characters":
        return (
          <div className="writers-ref-content">
            <h2>Character Management</h2>

            <h3>Adding Characters</h3>
            <ol>
              <li>Click the 👥 Manage Characters button in Writer Mode</li>
              <li>Click "Add Character"</li>
              <li>
                Fill in details:
                <ul>
                  <li>
                    <strong>Name:</strong> Character's name
                  </li>
                  <li>
                    <strong>Role:</strong> Protagonist, Antagonist, Supporting,
                    etc.
                  </li>
                  <li>
                    <strong>Physical traits:</strong> Appearance details
                  </li>
                  <li>
                    <strong>Personality traits:</strong> Character qualities
                  </li>
                  <li>
                    <strong>Arc notes:</strong> How they change
                  </li>
                  <li>
                    <strong>Relationships:</strong> Connections to other
                    characters
                  </li>
                </ul>
              </li>
            </ol>

            <h3>Character Roles</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Protagonist</td>
                  <td>Main character driving the story</td>
                </tr>
                <tr>
                  <td>Antagonist</td>
                  <td>Opposition to protagonist's goals</td>
                </tr>
                <tr>
                  <td>Deuteragonist</td>
                  <td>Secondary main character</td>
                </tr>
                <tr>
                  <td>Love Interest</td>
                  <td>Romantic connection</td>
                </tr>
                <tr>
                  <td>Mentor</td>
                  <td>Guide figure</td>
                </tr>
                <tr>
                  <td>Sidekick</td>
                  <td>Loyal companion</td>
                </tr>
                <tr>
                  <td>Foil</td>
                  <td>Contrasts with protagonist</td>
                </tr>
                <tr>
                  <td>Supporting</td>
                  <td>Important but not central</td>
                </tr>
                <tr>
                  <td>Minor</td>
                  <td>Brief appearances</td>
                </tr>
              </tbody>
            </table>

            <h3>Linking Text to Characters</h3>
            <ol>
              <li>Select text that references a character</li>
              <li>Choose character from dropdown</li>
              <li>Click "🔗 Link"</li>
            </ol>

            <div className="tip-box">
              <strong>💡 Tip:</strong> Link important character moments—first
              appearances, key decisions, transformation points.
            </div>
          </div>
        );

      case "export":
        return (
          <div className="writers-ref-content">
            <h2>Export Options</h2>

            <h3>📄 PDF Export</h3>
            <p>
              <strong>Manuscript Format</strong> (for submissions):
            </p>
            <ul>
              <li>Courier 12pt font</li>
              <li>Double-spaced</li>
              <li>1.25" left/right margins</li>
              <li>1" top/bottom margins</li>
              <li>Automatic page numbers</li>
              <li>Word count on first page</li>
            </ul>
            <p>
              <strong>Standard Format</strong> (for sharing):
            </p>
            <ul>
              <li>Clean readable format</li>
              <li>Your chosen fonts</li>
              <li>Single or 1.5 spacing</li>
            </ul>
            <p>
              <strong>Optional:</strong> Include analysis summary page with
              scores and top recommendations.
            </p>

            <h3>📥 DOCX Export</h3>
            <ul>
              <li>Microsoft Word compatible</li>
              <li>Preserves all formatting</li>
              <li>Includes embedded analysis markers (colored backgrounds)</li>
              <li>Ready for further editing</li>
            </ul>

            <h3>🌐 HTML Export</h3>
            <ul>
              <li>Self-contained file</li>
              <li>Opens in any browser</li>
              <li>Print-ready styling</li>
              <li>Includes analysis callouts</li>
            </ul>

            <h3>📊 JSON Export</h3>
            <ul>
              <li>Complete analysis data</li>
              <li>Machine-readable format</li>
              <li>For tracking progress or building custom reports</li>
            </ul>
          </div>
        );

      case "tips":
        return (
          <div className="writers-ref-content">
            <h2>Tips & Best Practices</h2>

            <h3>When to Use Each Tool</h3>

            <h4>During First Drafts</h4>
            <ul>
              <li>Focus Mode (hide distractions)</li>
              <li>Word Sprint Timer (build momentum)</li>
              <li>Version History (save before major scenes)</li>
            </ul>

            <h4>During Revision</h4>
            <ul>
              <li>POV Checker (fix perspective issues)</li>
              <li>Dialogue Enhancer (sharpen conversations)</li>
              <li>Cliché Detector (freshen language)</li>
              <li>AI Writing Assistant (rephrase weak passages)</li>
            </ul>

            <h4>During Final Polish</h4>
            <ul>
              <li>Readability Metrics (target your audience)</li>
              <li>Motif Tracker (ensure thematic consistency)</li>
              <li>Emotion Tracker (verify arc works)</li>
              <li>Beat Sheet (confirm structure)</li>
            </ul>

            <h3>Performance Tips</h3>
            <ul>
              <li>Save versions before major edits</li>
              <li>Export regularly as backup</li>
              <li>For very large documents (50k+ words), work in chapters</li>
              <li>Close unused Advanced Tool panels</li>
            </ul>

            <h3>Common Issues</h3>
            <p>
              <strong>Analysis not updating?</strong>
            </p>
            <ul>
              <li>Ensure you have 200+ words</li>
              <li>Check that auto-analysis is enabled</li>
              <li>Try clicking "Analyze" manually</li>
            </ul>

            <p>
              <strong>Formatting lost on paste?</strong>
            </p>
            <ul>
              <li>Use Cmd/Ctrl+Shift+V for plain text paste</li>
              <li>Or paste normally and use "Clear Formatting" button</li>
            </ul>
          </div>
        );

      case "shortcuts":
        return (
          <div className="writers-ref-content">
            <h2>Keyboard Shortcuts</h2>

            <h3>Text Formatting</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Shortcut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cmd/Ctrl+B</td>
                  <td>Bold</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+I</td>
                  <td>Italic</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+U</td>
                  <td>Underline</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+K</td>
                  <td>Insert link</td>
                </tr>
              </tbody>
            </table>

            <h3>Editing</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Shortcut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cmd/Ctrl+Z</td>
                  <td>Undo</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+Shift+Z</td>
                  <td>Redo</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+F</td>
                  <td>Find & Replace</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+A</td>
                  <td>Select All</td>
                </tr>
              </tbody>
            </table>

            <h3>Navigation</h3>
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Shortcut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cmd/Ctrl+Home</td>
                  <td>Go to beginning</td>
                </tr>
                <tr>
                  <td>Cmd/Ctrl+End</td>
                  <td>Go to end</td>
                </tr>
                <tr>
                  <td>Option/Alt+↑↓</td>
                  <td>Move line up/down</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="writers-ref-content">
            <h2>Welcome to Writer's Reference</h2>
            <p>Select a topic from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "95%",
          maxWidth: "1200px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "2px solid #ef8432",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f7e6d0 0%, #fef5e7 100%)",
            color: "#2c3e50",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <AnimatedLogo size={64} animate={true} />
            <div>
              <span
                style={{
                  fontFamily: "'Georgia', 'Palatino', serif",
                  fontSize: "1.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                Writer's Reference
              </span>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  marginTop: "4px",
                }}
              >
                Complete guide to QuillPilot's writing tools
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0.5rem",
              borderRadius: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fee2e2";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar Navigation */}
          <div
            style={{
              width: "240px",
              borderRight: "1px solid #e0c392",
              display: "flex",
              flexDirection: "column",
              background: "#fef5e7",
              flexShrink: 0,
            }}
          >
            {/* Search Box */}
            <div style={{ padding: "1rem", borderBottom: "1px solid #e0c392" }}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.75rem 0.625rem 2.25rem",
                    border: "1px solid #e0c392",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    outline: "none",
                    background: "white",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#ef8432";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(239, 132, 50, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0c392";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                  }}
                >
                  🔍
                </span>
              </div>
            </div>

            {/* Navigation Items */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0.75rem",
              }}
            >
              {Object.keys(filteredSections).length === 0 ? (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                  }}
                >
                  No topics found
                </div>
              ) : (
                Object.entries(filteredSections).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.75rem",
                      marginBottom: "0.25rem",
                      background:
                        activeSection === key ? "#f7e6d0" : "transparent",
                      color: activeSection === key ? "#2c3e50" : "#4b5563",
                      border:
                        activeSection === key
                          ? "1px solid #ef8432"
                          : "1px solid transparent",
                      borderRadius: "8px",
                      fontSize: "0.8125rem",
                      fontWeight: activeSection === key ? "600" : "500",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== key) {
                        e.currentTarget.style.background = "#f7e6d0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== key) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {label}
                    {(key === "versionHistory" || key === "comments") && (
                      <span
                        style={{
                          fontSize: "0.625rem",
                          background: "#10b981",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "2rem",
              background: "white",
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .writers-ref-content h2 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
          font-size: 1.75rem;
          font-weight: 700;
          border-bottom: 2px solid #ef8432;
          padding-bottom: 0.75rem;
        }

        .writers-ref-content h3 {
          margin: 1.5rem 0 0.75rem 0;
          color: #2c3e50;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .writers-ref-content h4 {
          margin: 1.25rem 0 0.5rem 0;
          color: #4b5563;
          font-size: 1rem;
          font-weight: 600;
        }

        .writers-ref-content p {
          margin: 0 0 1rem 0;
          line-height: 1.7;
          color: #374151;
        }

        .writers-ref-content ul, .writers-ref-content ol {
          margin: 0 0 1rem 0;
          padding-left: 1.5rem;
          line-height: 1.8;
          color: #374151;
        }

        .writers-ref-content li {
          margin-bottom: 0.5rem;
        }

        .writers-ref-content strong {
          color: #1f2937;
        }

        .tip-box {
          background: linear-gradient(135deg, #fef5e7 0%, #fef9c3 100%);
          border-left: 4px solid #ef8432;
          padding: 1rem 1.25rem;
          border-radius: 0 8px 8px 0;
          margin: 1rem 0;
        }

        .tip-box strong {
          color: #ef8432;
        }

        .tip-box ul {
          margin: 0.5rem 0 0 0;
        }

        .new-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          font-size: 0.625rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          vertical-align: middle;
          margin-left: 6px;
        }

        .ref-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.875rem;
        }

        .ref-table th {
          background: #f7e6d0;
          color: #2c3e50;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border: 1px solid #e0c392;
        }

        .ref-table td {
          padding: 0.625rem 1rem;
          border: 1px solid #e5e7eb;
          color: #374151;
        }

        .ref-table tr:nth-child(even) {
          background: #fef5e7;
        }

        .code-block {
          background: #1f2937;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .code-block pre {
          margin: 0;
          color: #e5e7eb;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 0.8125rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
