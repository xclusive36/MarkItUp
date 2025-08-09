# MarkItUp PKM – Personal Knowledge Management System

*A powerful, self-hosted Personal Knowledge Management system that rivals Obsidian. Built with Next.js and TypeScript, MarkItUp transforms markdown editing into a comprehensive second brain for organizing, linking, and discovering your thoughts.*

![Screenshot](docs/screenshot.png)

## 🚀 Quick Start

```bash
git clone https://github.com/xclusive36/MarkItUp.git
cd MarkItUp
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start building your knowledge base!

## ✨ Key Features

### 🧠 Personal Knowledge Management
- **Wikilinks & Bidirectional Linking** - Connect notes with `[[Note Name]]` syntax
- **Interactive Graph View** - Visualize your knowledge network
- **Advanced Search** - Full-text search with operators (`tag:`, `folder:`, exact phrases)
- **Smart Tagging** - Organize with `#tags` and automatic indexing
- **Real-time Analytics** - Track your knowledge growth

### 🤖 AI-Powered Intelligence
- **Context-Aware AI Chat** - AI assistant that understands your knowledge graph
- **Writing Assistant** - Advanced content analysis and improvement suggestions
- **Knowledge Discovery** - AI-powered gap analysis and content recommendations
- **Research Assistant** - Semantic search with intelligent note creation
- **Multi-Provider Support** - OpenAI integration with plans for local AI

### 🤝 Real-time Collaboration
- **Multi-user Editing** - Real-time collaborative editing with conflict resolution
- **Live Presence** - See other users' cursors and selections
- **WebSocket Sync** - Low-latency synchronization via Socket.IO
- **Session Sharing** - Easy document sharing with secure links

### 🔌 Extensible Plugin System
- **Rich Plugin API** - Custom functionality, commands, and processors
- **Settings Management** - Configurable plugin settings with persistence
- **Content Processors** - Transform content during import/export
- **Event System** - Plugin communication through events

### � Advanced Markdown Features
- **Multi-mode Editor** - Edit, preview, or split-view modes
- **LaTeX Math** - Inline `$math$` and block `$$math$$` equations
- **TikZ Diagrams** - Create vector graphics directly in markdown
- **GitHub Flavored Markdown** - Tables, task lists, and more

## 📚 Documentation

| Topic | Description |
|-------|-------------|
| [🎯 Features](docs/FEATURES.md) | Complete feature overview and capabilities |
| [⚙️ Installation](docs/INSTALLATION.md) | Detailed setup and configuration guide |
| [📖 User Guide](docs/USER_GUIDE.md) | How to use PKM features effectively |
| [🤖 AI Features](docs/AI_FEATURES.md) | AI setup and advanced capabilities |
| [🤝 Collaboration](docs/COLLABORATION.md) | Real-time editing and sharing |
| [🔌 Plugin System](docs/PLUGIN_SYSTEM.md) | Using and developing plugins |
| [🐳 Deployment](docs/DEPLOYMENT.md) | Docker and production hosting |
| [🔧 API Reference](docs/API_REFERENCE.md) | Technical documentation |
| [⚖️ Comparison](docs/COMPARISON.md) | MarkItUp vs Obsidian and others |

## 🏆 Why MarkItUp PKM?

**🌐 Web-Native:** Access from any device with a browser - no app installation required

**🏠 Complete Privacy:** Self-hosted solution means your data never leaves your control

**🔗 Built for Connection:** Native wikilinks, backlinks, and graph visualization

**⚡ Modern Stack:** Built with Next.js 15 and TypeScript for speed and reliability

**🆓 Truly Free:** Open-source with no licensing fees or feature restrictions

**🚀 Extensible:** Modern plugin architecture for unlimited customization

## 🐳 Quick Deploy

### Docker Compose (Recommended)
```bash
docker compose up -d
```

### Docker CLI
```bash
docker run --name markitup -p 3000:3000 \
  -v ./markdown:/app/markdown \
  --restart unless-stopped \
  ghcr.io/xclusive36/markitup:latest
```

## 🤝 Contributing

We welcome contributions! Please see our [contribution guidelines](CONTRIBUTING.md) for details.

- 🐛 **Bug Reports:** [Open an issue](https://github.com/xclusive36/MarkItUp/issues)
- 💡 **Feature Requests:** [Start a discussion](https://github.com/xclusive36/MarkItUp/discussions)
- 🔧 **Pull Requests:** Fork, develop, and submit PRs

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**⭐ Star this repo if you find MarkItUp useful!**

Built with ❤️ by the MarkItUp community
