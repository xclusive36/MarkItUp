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
| **Plugin System** | 🔄 (Planned) | ✅ | Varies |
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
