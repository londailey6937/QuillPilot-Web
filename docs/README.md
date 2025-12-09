# QuillPilot 📝✨

**QuillPilot** is an advanced creative writing analysis tool that helps authors improve their manuscripts through comprehensive, genre-aware analysis.

## 🎯 Features

### 5 Core Analysis Metrics

1. **Pacing & Flow** - Analyzes paragraph spacing and narrative rhythm
2. **Show vs Tell** - Detects sensory details and immersive writing techniques
3. **Character Development** - Tracks character arcs, emotional trajectories, and protagonist identification
4. **Theme Depth** - Identifies recurring themes and symbolic patterns across 12 theme clusters
5. **Genre Conventions** - Detects genre-specific tropes and story beats

### 🚀 Power Features

Professional-grade tools for serious manuscript development:

- **📊 Manuscript Comparison** - Track improvements between drafts with before/after metrics
- **📤 Advanced Export** - Export to JSON, CSV, Markdown, and Excel with full data
- **🔄 Batch Analysis** - Analyze multiple chapters simultaneously with consistency checking
- **🤖 AI-Powered Suggestions** - Get specific rewrite examples for every weak area
- **⚡ Real-time Assistant** - Live feedback as you type with inline issue detection

[See Power Features Documentation →](docs/POWER_FEATURES.md)

### Genre Support

- **Romance** - 8 tropes, 6 story beats (Enemies to Lovers, Forced Proximity, Meet Cute, etc.)
- **Thriller** - 7 tropes, 6 story beats (Ticking Clock, Red Herring, Cat and Mouse, etc.)
- **Fantasy** - 8 tropes, 7 story beats (Chosen One, Quest, Magic System, etc.)
- **Mystery** - 6 tropes, 6 story beats (Locked Room, Detective with Flaw, etc.)
- **SciFi** - 7 tropes, 6 story beats (First Contact, AI Uprising, Time Paradox, etc.)
- **Horror** - 5 tropes, 5 story beats (Haunted Location, The Monster, etc.)
- **Literary** - General analysis
- **Historical** - Period-specific context
- **General Fiction** - Universal narrative elements

### Writer Mode

Professional tier includes a full-featured text editor with:

- Rich text formatting (bold, italic, underline, strikethrough)
- Headers (H1-H6) with keyboard shortcuts (Cmd/Ctrl+Alt+1-6)
- Lists (bulleted and numbered)
- Blockquotes and pull quotes
- Auto-save functionality
- Export to DOCX, HTML, and JSON
- **Keyboard shortcuts** for fast formatting ([see full list](docs/KEYBOARD_SHORTCUTS.md))

### Access Tiers

- **Free** - 200 pages per analysis
- **Premium** - 650 pages per analysis
- **Professional** - 1000 pages + Writer Mode access

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/QuillPilot.git
cd QuillPilot

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to access the application.

### Build for Production

```bash
npm run build
```

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase** - Backend (optional, demo mode available)
- **Web Workers** - Background analysis processing

## 📊 Analysis Capabilities

### Character Analysis

- Automatic character name extraction
- Mention frequency tracking
- Emotional trajectory analysis (early/middle/late sections)
- Arc type classification (dynamic/flat/unclear)
- Role determination (protagonist/major/supporting/minor)
- Development scoring (0-100)

### Theme Analysis

- 12 theme clusters with 15-20 keywords each
- 10 symbolic pattern categories
- Context-aware detection
- Thematic density calculation
- Distribution analysis (concentrated/scattered/balanced)
- Actionable recommendations

### Trope Detection

- Genre-specific keyword matching
- Pattern recognition for narrative conventions
- Story beat detection by section (early/middle/late)
- Convention adherence scoring
- Subversion detection
- Cliché identification

## 🔧 Configuration

The app runs in demo mode by default (no authentication required). To enable Supabase authentication:

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials
3. Follow instructions in `SUPABASE_SETUP.md`

## 📝 Usage

1. **Upload a document** - Supports TXT, DOCX formats
2. **Select genre** - Choose from 9 creative writing genres
3. **Analyze** - Get comprehensive analysis across 5 metrics
4. **Review insights** - Expandable sections with detailed feedback
5. **Writer Mode** - Edit and refine your manuscript (Professional tier)
6. **Export** - Download results in multiple formats

## 🎨 Demo Mode

QuillPilot runs in demo mode by default, allowing full access to all features without requiring authentication. Perfect for testing and evaluation.

## 📖 Documentation

- `docs/KEYBOARD_SHORTCUTS.md` - Complete keyboard shortcuts reference
- `docs/WRITERS_REFERENCE.md` - Complete guide to Writer Mode
- `docs/WRITER_MODE_IMPLEMENTATION.md` - Writer Mode architecture
- `docs/UNIFIED_EXPORT_SYSTEM.md` - Export functionality
- `docs/SYSTEM_OVERVIEW.md` - Technical overview
- `SUPABASE_SETUP.md` - Backend configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Acknowledgments

Originally based on Chapter-Analysis, transformed into a creative writing tool focused on genre-aware manuscript analysis.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ for writers by writers**
