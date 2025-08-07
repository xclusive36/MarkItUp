# Plugin Quick Reference

## Available Plugins

### Core Plugins

#### Enhanced Word Count
**Features:**
- Detailed statistics (words, characters, reading time)
- Configurable reading speed (WPM)
- Real-time updates as you type

**Commands:**
- `Cmd+Shift+S` - Show detailed statistics

**Settings:**
- Reading Speed (default: 225 WPM)
- Show Character Count (default: true)

---

#### Markdown Export
**Features:**
- Export to PDF, HTML, DOCX formats
- Batch export multiple notes
- File system integration

**Commands:**
- `Cmd+E` - Export current note
- Batch Export - Export multiple notes

**Settings:**
- Default Export Format (PDF/HTML/DOCX)

---

### Productivity Plugins

#### Daily Notes
**Features:**
- Auto-create daily notes with templates
- Quick navigation between days
- Customizable folder organization

**Commands:**
- `Cmd+T` - Open today's note
- `Cmd+Shift+T` - Open yesterday's note

**Settings:**
- Notes Folder (default: "Daily Notes")
- Template with date variables
- Auto-create option

---

#### Table of Contents
**Features:**
- Auto-generate TOC from headings
- Configurable depth and numbering
- Auto-update on content changes

**Commands:**
- `Cmd+Shift+O` - Insert TOC
- Update TOC - Refresh existing TOC

**Settings:**
- Maximum Heading Depth (1-6)
- Auto-update TOC
- Include Numbers

---

#### Kanban Board
**Features:**
- Convert task lists to kanban boards
- Drag-and-drop task management
- Customizable columns

**Commands:**
- `Cmd+K` - Toggle kanban view
- Create Kanban Board - Convert note to board

**Settings:**
- Default Columns (comma-separated)
- Auto-archive Completed

---

### AI & Learning Plugins

#### AI Writing Assistant
**Features:**
- Grammar and spelling checks
- Writing improvement suggestions
- Content summarization
- Outline expansion

**Commands:**
- `Cmd+Shift+I` - Improve writing
- `Cmd+Shift+G` - Check grammar
- Summarize Note - Generate summary
- Expand Outline - Convert bullets to paragraphs

**Settings:**
- AI Provider (OpenAI/Claude/Local)
- API Key
- Auto Suggestions
- Suggestion Delay

---

#### Spaced Repetition System
**Features:**
- Create flashcards from notes
- Intelligent review scheduling
- Progress tracking and statistics

**Commands:**
- `Cmd+Shift+F` - Create flashcard
- `Cmd+R` - Start review session
- View Statistics - Show progress

**Settings:**
- Daily Review Time
- Cards per Session
- Difficulty Algorithm (SM-2/Anki/Simple)

---

### Utility Plugins

#### Auto Backup
**Features:**
- Scheduled backups to cloud or local
- Multiple backup destinations
- Backup history management

**Commands:**
- Backup Now - Create immediate backup
- Restore from Backup - Restore notes

**Settings:**
- Backup Interval (minutes)
- Backup Location (Local/Google Drive/Dropbox/GitHub)
- Maximum Backup Count

---

#### Citations & Bibliography
**Features:**
- Citation management
- Multiple citation styles
- Auto-bibliography generation

**Commands:**
- `Cmd+Shift+C` - Insert citation
- Generate Bibliography - Create reference list

**Settings:**
- Citation Style (APA/MLA/Chicago/Harvard)
- Bibliography Title

---

### Theming Plugins

#### Advanced Dark Theme
**Features:**
- Customizable dark theme
- Multiple accent colors
- Adjustable opacity settings

**Settings:**
- Accent Color (Blue/Green/Purple/Orange)
- Sidebar Opacity (0.1-1.0)

---

## Plugin Installation

### Via Plugin Store
1. Open the plugin store from the main menu
2. Browse available plugins or search by name/category
3. Click "Install" on desired plugins
4. Configure settings if needed

### Via File Upload
1. Obtain plugin manifest file (.json)
2. Open plugin store
3. Click "Choose File" in upload section
4. Select manifest file and install

### Programmatic Installation
```typescript
const pluginManager = pkm.getPluginManager();
await pluginManager.loadPlugin(pluginManifest);
```

## Plugin Management

### Viewing Installed Plugins
- Open Plugin Store → "Installed Plugins" tab
- Shows all loaded plugins with version info
- Access to uninstall and configure options

### Plugin Settings
- Click plugin name to access settings
- Modify configuration options
- Changes are saved automatically

### Keyboard Shortcuts
Most plugins add custom keyboard shortcuts:
- View all shortcuts in Command Palette
- Customize shortcuts in settings (future feature)

## Troubleshooting

### Plugin Won't Load
- Check plugin dependencies
- Verify minimum MarkItUp version
- Review error messages in console

### Permission Issues
- Some plugins require permissions (file-system, network)
- Grant permissions when prompted
- Check plugin permissions in settings

### Performance Issues
- Disable auto-suggestions if slow
- Reduce update frequencies in settings
- Unload unused plugins

## Development

For plugin development, see:
- `/docs/PLUGIN_DEVELOPMENT.md` - Comprehensive guide
- `/src/plugins/example-plugins.ts` - Example implementations
- `/src/lib/types.ts` - Type definitions

## Support

- **Issues**: Report bugs on GitHub
- **Feature Requests**: Submit via GitHub issues
- **Documentation**: This guide and development docs
- **Community**: Share plugins and get help
