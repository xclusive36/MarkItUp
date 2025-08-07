# MarkItUp PKM – Personal Knowledge Management System

***MarkItUp PKM** is a powerful, self-hosted Personal Knowledge Management system that rivals Obsidian. Built with Next.js and TypeScript, it transforms markdown editing into a comprehensive second brain for organizing, linking, and discovering your thoughts.*

![Screenshot](/docs/screenshot.png)

## 🚀 Features

### 🧠 Personal Knowledge Management

* **Wikilinks & Bidirectional Linking** - Connect notes with `[[Note Name]]` syntax, automatic backlink tracking
* **Interactive Graph View** - Force-directed graph visualization of your knowledge network
* **Advanced Search Engine** - Full-text search with special operators (`tag:`, `folder:`, exact phrases)
* **Smart Tagging System** - Organize with `#tags`, automatic indexing and filtering
* **Real-time Analytics** - Track notes, links, connections, and knowledge growth
* **Frontmatter Support** - YAML metadata for advanced note properties

### 📝 Advanced Markdown Editing

* **Multi-mode Editor** - Edit, preview, or split-view modes
* **Wikilink Resolution** - Automatic linking to existing notes with intelligent matching
* **Block References** - Reference specific blocks within notes with `^block-id`
* **GitHub Flavored Markdown (GFM)** support with tables, task lists, and more
* **LaTeX Math Rendering** - Inline `$math$` and block `$$math$$` equations
* **TikZ Diagrams** - Create vector graphics and diagrams directly in markdown

### Theme Support

* Light and dark modes with smooth transitions
* Auto-detects system theme on first load
* Respects system theme preference on first visit

### File Management

* Save/load/delete `.md` files from the `/markdown` directory
* Auto-generated file list with timestamps
* Server-side storage with secure access

### Technical Highlights

* Built with **Next.js 15** and **TypeScript**
* Fully responsive across devices
* Syntax highlighting for code blocks
* Accessible via ARIA labels and keyboard navigation

### Math Equations

* LaTeX syntax support for mathematical equations
* Real-time rendering of inline math using `$...$`
* Block math using `$$...$$`
* Support for complex mathematical notations and symbols

### SVG Generation

* Create vector graphics directly in markdown
* Customizable shapes (circles, rectangles, paths)
* Color support for fills and strokes
* Responsive and scalable graphics
* Perfect for diagrams and illustrations

### Plugin System

* **Extensible Architecture** - Comprehensive plugin system for custom functionality
* **Rich Plugin API** - Access to notes, UI, events, and file system
* **Settings Management** - Configurable plugin settings with persistence
* **Content Processors** - Transform content during import/export operations
* **Custom Commands** - Add keyboard shortcuts and menu items
* **Event System** - Plugin communication through events
* **Security Model** - Permission-based access control for plugins

## 📁 File Structure

```
markitup/
├── markdown/                  # Server-side Markdown file storage
├── public/                    # Static assets
├── src/
│   ├── app/                   # App and API routes
│   ├── components/            # Reusable UI components
│   └── contexts/              # Theme context
├── docker-compose.yml         # Docker Compose configuration
├── Dockerfile                 # Dockerfile for building the image
├── package.json
└── tailwind.config.js
```

## ⚙️ Getting Started

### Requirements

* Node.js 18+
* npm / yarn / pnpm

### Setup

```bash
git clone https://github.com/xclusive36/MarkItUp.git
cd MarkItUp
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🧠 Using the PKM Features

### Wikilinks and Note Connections

Create connections between notes using the `[[Note Name]]` syntax:

```markdown
# My Research Project

This project builds on ideas from [[Previous Research]] and connects to [[Future Plans]].

## Related Topics
- [[Machine Learning Basics]]
- [[Data Visualization Techniques]]
```

### Smart Tagging

Organize your notes with hashtags:

```markdown
---
title: My Note
tags: [research, ai, productivity]
---

# Content

This note covers #machine-learning and #productivity tips.
```

### Advanced Search

Use powerful search operators:

- `tag:research` - Find notes with the "research" tag
- `folder:projects` - Search within the "projects" folder  
- `"exact phrase"` - Find exact text matches
- `tag:ai "neural networks"` - Combine operators

### Graph View

Visualize your knowledge network:
- **Nodes** represent your notes
- **Edges** show connections via wikilinks or shared tags
- **Colors** indicate folders or primary tags
- **Size** reflects the number of connections
- **Interactive** - click nodes to navigate, drag to explore

### Frontmatter Metadata

Add structured metadata to your notes:

```yaml
---
title: "Custom Title"
tags: [tag1, tag2, tag3]
date: 2025-01-06
author: "Your Name"
aliases: ["Alt Name", "Short Name"]
cssclass: "custom-style"
---
```

## 🔌 Plugin System

MarkItUp features a comprehensive plugin system that allows you to extend functionality and customize your workflow.

### Available Example Plugins

#### Core Plugins

**Enhanced Word Count**
* Detailed word count statistics and reading time estimates
* Configurable reading speed (WPM)
* Character count display option
* Keyboard shortcut: `Cmd+Shift+S` for detailed stats

**Markdown Export**
* Export notes to PDF, HTML, and DOCX formats
* Configurable default export format
* Batch export capabilities
* File system access for saving exports
* Keyboard shortcut: `Cmd+E` for quick export

#### Productivity Plugins

**Daily Notes**
* Automatically create and manage daily notes
* Customizable templates with date variables
* Auto-creation of today's note on startup
* Quick navigation: `Cmd+T` (today), `Cmd+Shift+T` (yesterday)

**Table of Contents**
* Generate and insert table of contents for notes
* Configurable maximum heading depth
* Auto-update TOC when content changes
* Optional section numbering
* Keyboard shortcut: `Cmd+Shift+O` to insert TOC

**Kanban Board**
* Convert task lists into interactive kanban boards
* Customizable column names
* Auto-archive completed tasks option
* Toggle between list and kanban view
* Keyboard shortcut: `Cmd+K` to toggle views

#### Utility Plugins

**Auto Backup**
* Automatic backup to cloud storage or local directory
* Support for Google Drive, Dropbox, GitHub, and local backups
* Configurable backup intervals
* Maximum backup count management
* Manual backup and restore commands

**Citations & Bibliography**
* Manage citations and generate bibliographies
* Support for APA, MLA, Chicago, and Harvard styles
* Insert citations with `@reference` syntax
* Auto-generate bibliography sections
* Keyboard shortcut: `Cmd+Shift+C` to insert citation

#### Theming Plugins

**Advanced Dark Theme**
* Customizable dark theme with accent colors
* Configurable sidebar opacity
* Blue, green, purple, and orange accent options
* Dynamic CSS injection for theming

### Plugin Development

#### Plugin Structure

Each plugin follows a standardized manifest structure:

```typescript
export const examplePlugin: PluginManifest = {
  id: 'plugin-id',
  name: 'Plugin Name',
  version: '1.0.0',
  description: 'Plugin description',
  author: 'Author Name',
  main: 'plugin-file.js',
  
  // Optional: Required permissions
  permissions: [
    {
      type: 'file-system',
      description: 'Required to save files'
    }
  ],
  
  // Optional: Plugin settings
  settings: [
    {
      id: 'setting-id',
      name: 'Setting Name',
      type: 'string', // 'string' | 'number' | 'boolean' | 'select' | 'file'
      default: 'default-value',
      description: 'Setting description'
    }
  ],
  
  // Optional: Custom commands
  commands: [
    {
      id: 'command-id',
      name: 'Command Name',
      description: 'Command description',
      keybinding: 'Cmd+X',
      callback: async function() {
        // Command implementation
      }
    }
  ],
  
  // Optional: Content processors
  processors: [
    {
      id: 'processor-id',
      name: 'Processor Name',
      type: 'transform', // 'transform' | 'export' | 'import'
      process: async (content: string) => {
        // Process content and return modified version
        return content;
      }
    }
  ],
  
  // Lifecycle hooks
  onLoad: async function() {
    console.log('Plugin loaded');
  },
  
  onUnload: async function() {
    console.log('Plugin unloaded');
  }
};
```

#### Plugin API

Plugins have access to a comprehensive API:

```typescript
// Notes management
api.notes.create(name, content, folder)
api.notes.update(id, updates)
api.notes.delete(id)
api.notes.get(id)
api.notes.getAll()
api.notes.search(query)

// UI interactions
api.ui.showNotification(message, type)
api.ui.showModal(title, content)
api.ui.addCommand(command)
api.ui.addView(view)
api.ui.setStatusBarText(text)

// Event system
api.events.on(event, callback)
api.events.off(event, callback)
api.events.emit(event, data)

// Settings management
api.settings.get(key)
api.settings.set(key, value)

// File system (if permitted)
api.fs.readFile(path)
api.fs.writeFile(path, content)
api.fs.exists(path)
```

#### Installing Plugins

1. **Via Plugin Store UI**
   * Open the plugin store from the main menu
   * Browse available plugins or upload a manifest file
   * Click "Install" to add the plugin

2. **Programmatically**
   ```typescript
   const pluginManager = pkm.getPluginManager();
   await pluginManager.loadPlugin(pluginManifest);
   ```

#### Plugin Security

* **Permission System**: Plugins must declare required permissions
* **Sandboxed API**: Controlled access to system functionality
* **Version Compatibility**: Min/max version checking
* **Runtime Validation**: Manifest validation and dependency checking

### Creating Custom Plugins

1. **Define the Plugin Manifest** following the structure above
2. **Implement Required Functions** (onLoad, commands, processors, etc.)
3. **Test the Plugin** in development mode
4. **Package and Distribute** as a JSON manifest file

For detailed plugin development documentation and examples, see the `/src/plugins/example-plugins.ts` file.

## 🧠 Using the PKM Features
```

## 🐳 Deployment

### Docker Compose (Recommended)

```bash
# Copy the example compose file
docker compose up -d
```

### Docker CLI

```bash
docker run --name markitup -p 3000:3000 -v ./markdown:/app/markdown --restart unless-stopped -e PORT=3000 -e HOSTNAME=0.0.0.0 ghcr.io/xclusive36/markitup:latest
```

## 🏆 MarkItUp PKM vs Others

| Feature | MarkItUp PKM | Obsidian | Simple Markdown Editors |
|---------|--------------|----------|-------------------------|
| **Self-hosted** | ✅ | ❌ | Varies |
| **Web-based** | ✅ | ❌ | Varies |
| **Wikilinks** | ✅ | ✅ | ❌ |
| **Graph View** | ✅ | ✅ | ❌ |
| **Advanced Search** | ✅ | ✅ | Basic |
| **Bidirectional Links** | ✅ | ✅ | ❌ |
| **Real-time Collaboration** | 🔄 | ❌ (Desktop only) | Varies |
| **Plugin System** | ✅ | ✅ | Varies |
| **Privacy** | ✅ (Self-hosted) | ⚠️ (Desktop app) | Varies |
| **Cross-platform** | ✅ (Web) | ✅ | Varies |
| **Open Source** | ✅ | ❌ | Varies |
| **LaTeX Math** | ✅ | ✅ | Usually ❌ |
| **Custom Diagrams** | ✅ (TikZ) | ✅ (Plugins) | Usually ❌ |

### Why Choose MarkItUp PKM?

**🌐 Web-Native:** Access your knowledge base from any device with a browser - no app installation required.

**🏠 Complete Privacy:** Self-hosted solution means your data never leaves your control.

**🔗 Built for Connection:** Native support for wikilinks, backlinks, and graph visualization from day one.

**⚡ Modern Stack:** Built with the latest web technologies for speed and reliability.

**🆓 Truly Free:** Open-source with no licensing fees or feature restrictions.

**🚀 Extensible:** Modern architecture designed for easy customization and extension.

## 🔐 Security

* File path validation
* Input sanitization
* Basic CORS protection

## 🤝 Contributing

Contributions are welcome via issues or pull requests.

## 📄 License

MIT – see `LICENSE` file for details.
