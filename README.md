# MarkItUp PKM – Personal Knowledge Management System

*A powerful, self-hosted Personal Knowledge Management system that rivals Obsidian. Built with Next.js and TypeScript, MarkItUp transforms markdown editing into a comprehensive second brain for organizing, linking, and discovering your thoughts.*

![Screenshot](docs/screenshot.png)

## 🆕 What's New

### v4.0.0 - November 2025 🚀

- 🔐 User Authentication & Authorization (major release)
  - All core routes now run under authenticated context
  - Optional guest mode can be enabled for local/self-hosted scenarios
  - Clear 401/403 handling and improved error messages
- 🧭 Unified AI Settings
  - Centralized AI Assistant settings apply across chat, analysis, and plugins
  - Plugin Manager settings page now points to the AI Assistant for provider/API configuration
- 🧩 Plugin Manager UX
  - Deprecated duplicate API key inputs removed from Plugin System settings
  - Context notice added to guide users to AI Assistant settings
- 🛡️ Security Headers & CSP
  - Broader default connect-src to support self-hosted Docker/LAN Ollama without custom allowlists
  - Permissions-Policy cleaned up to remove deprecated flags
- 🤖 Ollama & AI Robustness
  - More resilient JSON parsing for AI analysis responses
  - Enhanced proxy diagnostics for containerized setups
- 🔧 DevX
  - `.env.example` added to the repo for easier setup
  - See [docs/MIGRATION_4_0.md](docs/MIGRATION_4_0.md) and AUTHENTICATION_SETUP.md for required environment variables and migration notes

> Breaking changes: If you relied on unauthenticated access, review [docs/MIGRATION_4_0.md](docs/MIGRATION_4_0.md) and AUTHENTICATION_SETUP.md to configure auth or enable guest mode.

### v3.6.0 - October 2025 🛑

- **🛑 AI Chat Stop Button** - Take control of streaming responses:
  - ⏹️ **Stop Generation** - Halt streaming output mid-generation with dedicated stop button
  - 💾 **Save Partial Content** - Automatically saves partial responses with user-stopped indicator
  - 🔄 **Dynamic UI** - Button transforms between Send, Loading, and Stop states
  - ⌨️ **Keyboard Support** - ESC key to cancel during streaming
  - 🚫 **Smart Error Handling** - Gracefully handles aborted requests without false errors
  - 🔒 **Context Preserved** - Note context injection now working perfectly with Ollama
  - 📡 **AbortController Pattern** - Standard Fetch API cancellation for reliable control

### v3.5.1 - October 2025 🎓

- **📚 Spaced Repetition Plugin v1.2.1** - Professional flashcard system with major enhancements:
  - 🎨 **Enhanced Modal Interface** - Beautiful full-screen review with 3D card flip animations
  - 📊 **Interactive Dashboard** - Statistics with gradient cards and animated progress charts
  - 🧩 **Cloze Deletions** - Fill-in-the-blank style cards with `{deletion}` syntax
  - 💾 **Export/Import** - Save and share flashcard decks in JSON or CSV formats
  - ⌨️ **Keyboard Shortcuts** - Efficient review workflow (Space, 1-4 for ratings)
  - 🎯 **Session Summaries** - Track accuracy and progress after each review session
  - 🤖 **Improved AI Generation** - Fixed Ollama integration with enhanced response parsing
  - 🧠 **FSRS Algorithm** - Scientific spaced repetition scheduling for optimal retention

### v3.5.0 - October 2025 🎉

- **🌐 Universal Multi-Provider AI Support** - All AI features now work with any provider:
  - ✅ **Ollama Support Everywhere** - Writing Assistant, Research Assistant, Knowledge Discovery now work with local Ollama
  - 🔑 **No API Key for Ollama** - Self-hosted AI works without configuration across all features
  - 🔄 **Unified Provider Settings** - One configuration applies to all AI features (chat, analysis, suggestions)
  - 🌍 **Provider Flexibility** - Switch between OpenAI, Anthropic, Gemini, or Ollama for any feature
  - 🛡️ **CORS-Free Ollama** - New proxy endpoint eliminates CORS errors when connecting to Ollama
  - 📡 **Seamless Testing** - Test Ollama connection, fetch models, and pull models without browser errors
  - 💬 **Improved Error Messages** - Clear, provider-agnostic guidance with helpful setup instructions
  - 🔒 **Privacy-First Option** - Use 100% local AI (Ollama) for all features including content analysis

### v3.4.0 - October 2025

- **🤖 Google Gemini Feature Parity** - Gemini provider enhanced to match OpenAI/Anthropic:
  - 🌊 **Streaming Support** - Real-time token streaming with Server-Sent Events (SSE)
  - 📊 **Performance Tracking** - Comprehensive metrics (response time, tokens/sec, success rate)
  - 🔍 **Connection Health Checks** - API validation and available models discovery
  - ⚙️ **Advanced Options** - Fine-tuned control (top_k, top_p, safety_settings, stop_sequences)
  - 💰 **Enhanced Cost Tracking** - Separate input/output token cost calculation
  - 📚 **Complete Documentation** - Full guides, quick start, and test suite
  - 🎯 **Production Ready** - Fully backward compatible, zero breaking changes

### v3.3.0 - October 2025

- **🎨 Enhanced UI/UX** - Refined interface for better workflow:
  - 📐 **Right Panel Collapsed by Default** - More screen space for your content on startup
  - 🔄 **Consistent Chevron Icons** - Unified expand/collapse controls across both sidebars
  - ⚡ **Improved Layout Balance** - Better default workspace configuration

### v3.2 - October 2025

- **🔗 Intelligent Link Suggester v3.2** - The most advanced link suggestion system in the PKM space:
  - 📜 **Suggestion History & Undo** - Track all link decisions with one-click undo (Cmd+Shift+H)
  - 📥 **Export Suggestions Report** - Download link opportunities as markdown with confidence scores
  - ⚙️ **Custom Debounce Timing** - Configure real-time delay (1-10 seconds) for your typing speed
  - 📊 **Visual Status Indicator** - Floating status showing when real-time analysis is active
  - 🚀 **Batch Orphan Analysis** - Find link opportunities across all unconnected notes at once
  - 💡 **Link Context Visualization** - See exactly where and why links are suggested with visual excerpts
  - ⚡ **Real-Time Suggestions** - Optional auto-analysis while typing (Cmd+Shift+R to toggle)
  - 🧠 **Pattern Learning** - System learns from your accept/reject decisions to improve suggestions
  - 🌉 **Bridge Note Generation** - AI suggests notes to connect isolated knowledge clusters

### Previous Updates

- **✨ WYSIWYG Editor** - Rich text editing with TipTap, toggle between markdown and visual editing
- **🤖 Multi-Provider AI** - Choose from 4 AI providers: OpenAI, Anthropic Claude, Google Gemini, or Ollama (local)
- **🐳 Optimized Docker Builds** - Improved build process with system fonts for faster deployment

## 🚀 Quick Start

```bash
git clone https://github.com/xclusive36/MarkItUp.git
cd MarkItUp
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start building your knowledge base!

## ✨ Key Features

### 📚 Core Knowledge Management

- **Bidirectional Linking** - Connect notes with `[[wikilinks]]` and automatic backlinks
- **Knowledge Graph** - Visual exploration with 3D force-directed layouts
- **Advanced Search** - Full-text search with operators (`tag:`, `folder:`, exact phrases)
- **Semantic Search** - AI-powered vector search finds related content by meaning, not just keywords:
  - 🧠 **Browser-Based ML** - Client-side embeddings using Transformers.js (no server required!)
  - 🔍 **Similarity Discovery** - Find related notes based on semantic similarity
  - 📊 **Progress Tracking** - Real-time indexing with visual progress indicators
  - 💾 **IndexedDB Storage** - Efficient persistent storage for embeddings
  - ⚡ **Fast Search** - Sub-100ms queries for typical collections
  - 🎯 **Mode Toggle** - Switch between keyword and semantic search instantly
  - 🔒 **100% Private** - All processing happens locally in your browser
  - ⚙️ **Configurable** - Batch size, auto-indexing, and more in settings
- **Smart Tagging** - Organize with `#tags` and automatic indexing
- **Real-time Analytics** - Track your knowledge growth

### 🤖 AI-Powered Intelligence

**All AI features work with your choice of provider (OpenAI, Anthropic, Gemini, or Ollama):**

- **Intelligent Link Suggester** - AI finds connection opportunities in your knowledge base:
  - 🔍 Context-aware wikilink suggestions with confidence scoring
  - 🚀 Batch orphan analysis for vault-wide optimization
  - 💡 Visual context preview shows where links will be inserted
  - ⚡ Real-time suggestions while typing (optional)
  - 🧠 Pattern learning adapts to your preferences
  - 🌉 Bridge note suggestions to connect isolated clusters
  - 📊 Knowledge base health visualization
- **Context-Aware AI Chat** - AI assistant that understands your knowledge graph
- **Writing Assistant** - Advanced content analysis and improvement suggestions
- **Knowledge Discovery** - AI-powered gap analysis and content recommendations
- **Research Assistant** - Semantic search with intelligent note creation
- **Multi-Provider Support** - Choose once, use everywhere: OpenAI (GPT-4, GPT-3.5), Anthropic (Claude 3.5), Google Gemini (1.5 Pro/Flash), or Ollama (local AI)

#### 🏠 Ollama Local AI (Privacy-First)

MarkItUp features the most comprehensive Ollama integration in any PKM system:

- **🌊 Real-Time Streaming** - Progressive response display with Server-Sent Events
- **📊 Model Management** - Download, delete, and refresh models directly from the UI
- **🔌 Connection Testing** - One-click server verification with detailed status (no CORS errors!)
- **⚙️ Advanced Parameters** - Fine-tune context window, GPU layers, repeat penalty, and more
- **📦 Enhanced Model Details** - View size, parameter count (7B/13B/70B), and quantization levels
- **💾 Zero Cost** - No API keys, no usage limits, completely free local AI
- **🔒 Complete Privacy** - All data stays on your machine, no external API calls
- **🚀 Model Library** - Browse and install popular models (Llama 3.2, Mistral, CodeLlama, etc.)
- **🎯 Custom Servers** - Connect to remote Ollama instances with saved presets
- **📈 Performance Metrics** - Track tokens/second, response times, and model efficiency
- **🛡️ Seamless Integration** - Built-in CORS proxy for error-free connections (no Ollama config needed!)

**Getting Started with Ollama:**

1. Install Ollama: `brew install ollama` (macOS) or visit [ollama.ai](https://ollama.ai)
2. Start server: `ollama serve`
3. Pull a model: `ollama pull llama3.2` or use MarkItUp's UI
4. Select "Ollama (Local)" in AI Settings - no API key needed!

**Why Choose Ollama?**

- 100% private - ideal for sensitive knowledge bases
- Offline capable after model download
- No monthly costs or token limits
- Full control over AI infrastructure
- Supports 50+ open-source models

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

### 📝 Advanced Markdown Features

- **WYSIWYG Editor** - Rich text editing with TipTap, seamless markdown conversion
- **Multi-mode Editor** - Edit, preview, split-view, or WYSIWYG modes
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

**⚡ Modern Stack:** Built with Next.js 16 and TypeScript for speed and reliability

**🆓 Truly Free:** Open-source with no licensing fees or feature restrictions

**🚀 Extensible:** Modern plugin architecture for unlimited customization

### 🤖 AI Provider Comparison

MarkItUp offers the most flexible AI integration in any PKM system:

| Feature | OpenAI | Anthropic | Gemini | **Ollama** |
|---------|--------|-----------|--------|------------|
| **Streaming** | ✅ | ✅ | ✅ | ✅ |
| **API Key Required** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ **None** |
| **Cost** | $0.002-0.03/1K tokens | $0.003-0.015/1K tokens | $0.000075-0.00125/1K tokens | 🆓 **Free** |
| **Context Window** | 128K tokens | 200K tokens | 🚀 **1M tokens** | Varies by model |
| **Model Management** | ❌ | ❌ | ❌ | ✅ **Yes** |
| **Advanced Options** | ✅ | ✅ | ✅ | ✅ **8+ params** |
| **Privacy (Local)** | ❌ Cloud | ❌ Cloud | ❌ Cloud | ✅ **100% Local** |
| **Connection Health** | ✅ | ❌ | ✅ | ✅ **Yes** |
| **Offline Mode** | ❌ | ❌ | ❌ | ✅ **Yes** |
| **Performance Tracking** | ✅ | ✅ | ✅ | ✅ **Yes** |
| **Usage Limits** | Pay per use | Pay per use | Pay per use | ✅ **Unlimited** |

**Choose the right provider for your needs:**

- **OpenAI** - Most capable general-purpose AI (GPT-4)
- **Anthropic** - Long context windows, ethical AI (Claude 3.5)
- **Gemini** - Most cost-effective with massive 1M token context (Gemini 1.5 Pro/Flash)
- **Ollama** - Complete privacy, zero cost, offline capable (50+ models)

## 🔮 Future Enhancements

We're constantly improving MarkItUp. Here's what's on the roadmap:

### 🔗 Intelligent Link Suggester Enhancements

- **Batch Accept for Orphans** - One-click to apply all suggestions to unconnected notes
- **Priority Scoring** - AI ranks orphans by importance and potential impact
- **Pause/Resume Batch Analysis** - Better control over long-running operations
- **Analytics Dashboard** - Acceptance rate trends, confidence distribution, most-suggested notes
- **Batch Undo** - Undo last N suggestions, by note, or by date range
- **Smart Notifications** - Desktop alerts when analysis completes with summary

### 📚 Knowledge Base Features

- **Advanced Graph View** - 3D visualization, clustering, and interactive filtering
- **Template System** - Quick note creation with customizable templates
- **Folder-based Contexts** - Different AI personalities per folder
- **Version History** - Git-style versioning with diff viewer
- **Advanced Search Operators** - Regex support, proximity search, and more
- **Citation Management** - BibTeX integration and automatic bibliography

### 🤖 AI Enhancements

- **Multi-Note Context** - AI analyzes relationships across multiple notes
- **Smart Summarization** - Automatic note summaries and highlights
- **Content Outliner** - AI-powered document structure suggestions
- **Knowledge Graph Auto-Mapper** - Automatic relationship detection
- **Writing Style Analysis** - Consistency checking and style suggestions
- **Language Translation** - Real-time note translation

### 🤝 Collaboration Features

- **Comment Threads** - Inline discussions on specific content
- **Change Tracking** - Detailed edit history with user attribution
- **Role-Based Permissions** - Fine-grained access control
- **Workspace Sharing** - Team workspaces with shared knowledge bases
- **Review Workflow** - Approval process for collaborative editing

### 🔌 Plugin Ecosystem

- **Plugin Marketplace** - Discover and install community plugins
- **Visual Plugin Builder** - No-code plugin creation interface
- **Plugin Analytics** - Usage statistics and performance monitoring
- **Plugin Testing Framework** - Automated testing for plugin developers
- **Hot Module Reloading** - Develop plugins without restart

### 📱 Platform Extensions

- **Mobile Apps** - Native iOS and Android applications
- **Desktop App** - Electron-based desktop client
- **Browser Extension** - Clip web content directly to MarkItUp
- **Email Integration** - Forward emails as notes
- **API Webhooks** - Integration with third-party services

### 🎨 Customization

- **Advanced Theme Builder** - Visual theme editor with preview
- **Custom Font Support** - Upload and use custom fonts
- **Layout Presets** - Save and share custom workspace layouts
- **Keyboard Shortcuts Editor** - Fully customizable keybindings
- **CSS Snippets** - User stylesheets for advanced customization

### 📊 Analytics & Insights

- **Knowledge Map** - Visualize topic coverage and gaps
- **Writing Analytics** - Track productivity and habits
- **Link Quality Score** - Measure knowledge base connectivity
- **Reading Time Estimates** - Automatic reading duration calculation
- **Progress Tracking** - Goals and milestones for knowledge building

### Want to Contribute?

Vote on features, suggest new ones, or help build them! Join the discussion:

- 💬 [GitHub Discussions](https://github.com/xclusive36/MarkItUp/discussions)
- 🐛 [Feature Requests](https://github.com/xclusive36/MarkItUp/issues/new?labels=enhancement)
- 🤝 [Contributing Guide](CONTRIBUTING.md)

## 🐳 Quick Deploy

### Docker Compose (Recommended)

**⚠️ REQUIRED (v4.0.0+): Generate secure secrets before deploying:**

```bash
# Generate JWT_SECRET (copy the output)
openssl rand -base64 32

# Generate ENCRYPTION_KEY (copy the output)  
openssl rand -hex 16
```

**Then update your `docker-compose.yml`:**

```yaml
version: "3.8"

services:
  markitup:
    container_name: markitup
    ports:
      - 3000:3000
    volumes:
      # Markdown files storage - folder created automatically if it doesn't exist
      # This bind mount persists your notes on the host filesystem
      - ./markdown:/app/markdown
    environment:
      - PORT=3000
      - HOSTNAME=0.0.0.0
      - NODE_ENV=production
      # REQUIRED: Replace with your generated secrets
      - JWT_SECRET=your-generated-jwt-secret-here
      - ENCRYPTION_KEY=your-generated-encryption-key-here
      # Optional: Disable auth for testing (NOT FOR PRODUCTION)
      # - DISABLE_AUTH=false
    restart: unless-stopped
    image: ghcr.io/xclusive36/markitup:latest
```

```bash
docker compose up -d
```

**Note:** Docker will automatically create the `./markdown` folder on your host if it doesn't exist. The application then creates user-specific subfolders (`user_<id>`) inside it when users log in or create their first note.

> **Important:** The `markdown` folder on your host must have full write permissions for the container user (UID 1001:nodejs). If you get a permission error when creating notes or user folders, run:

```sh
# Option 1: Set full write permissions (easier, works for all users)
chmod -R 777 ./markdown

# Option 2: Set ownership to container user (more secure)
sudo chown -R 1001:1001 ./markdown
```

### Docker CLI

```bash
# Generate secrets first
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)

# Run container with required secrets
docker run --name markitup -p 3000:3000 \
  -v ./markdown:/app/markdown \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  -e NODE_ENV=production \
  -e JWT_SECRET="$JWT_SECRET" \
  -e ENCRYPTION_KEY="$ENCRYPTION_KEY" \
  --restart unless-stopped \
  ghcr.io/xclusive36/markitup:latest
```

**Note:** Docker will automatically create the `./markdown` folder on your host if it doesn't exist. The application then creates user-specific subfolders (`user_<id>`) inside it when users log in or create their first note.

> **Important:** The `markdown` folder on your host must have full write permissions for the container user (UID 1001:nodejs). If you get a permission error when creating notes or user folders, run:

```sh
# Option 1: Set full write permissions (easier, works for all users)
chmod -R 777 ./markdown

# Option 2: Set ownership to container user (more secure)
sudo chown -R 1001:1001 ./markdown
```

This ensures the container can write notes to the `markdown` directory.
Change the User and Group to your needs. 65532 is for user and group 'Nobody' for example

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
