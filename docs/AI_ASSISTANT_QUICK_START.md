# AI Assistant Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Configure AI Provider

1. Click the **Brain icon** (🧠) in the header to open AI Assistant
2. Click the **Settings gear** icon in the chat panel
3. Choose your AI provider and configure:

**Option A: OpenAI (Recommended for beginners)**
- Enter your OpenAI API key
- Select `gpt-3.5-turbo` (fast and affordable)
- Click Save

**Option B: Local Ollama (Privacy + Free)**
- Install Ollama: `https://ollama.ai`
- Run: `ollama pull llama3.2`
- In settings, select "Ollama" and set URL to `http://localhost:11434`

### Step 2: Open a Note

- Open any markdown file from your knowledge base
- The AI Assistant will have context about this note

### Step 3: Try Quick Commands

Type these commands in the AI chat:

```
/help          → See all available commands
/tag           → Get tag suggestions
/connections   → Find related notes
```

## 💡 Most Useful Commands

### 🔗 Build Your Knowledge Graph
```
/connections
```
Finds related notes you should link to. Example:
- You're writing about "React Hooks"
- AI finds "JavaScript Basics" and "Component Patterns" are related
- Shows why each connection matters

### 🏷️ Organize with Tags
```
/tag
```
Analyzes your note and suggests relevant tags. Example:
- Content mentions state management, UI components, lifecycle
- Suggests: #react #frontend #javascript
- Explains why each tag fits

### 🔗 Add Wikilinks
```
/link
```
Finds phrases that should link to existing notes. Example:
- You wrote "component lifecycle methods"
- AI suggests: Replace with [[React Component Lifecycle]]
- Shows all linkable concepts

### 🧩 Find Knowledge Gaps
```
/gaps
```
Identifies what's missing from your note. Example:
- You discuss React state but not state management libraries
- AI suggests: "Explore Redux, Context API, and when to use each"
- Provides questions to guide your research

### ✨ Expand Brief Notes
```
/expand React hooks simplify state management
```
Turns bullet points into full paragraphs. Example:
- Input: "React hooks simplify state management"
- Output: 2-3 detailed paragraphs explaining hooks, benefits, examples

### 📝 Summarize Long Notes
```
/summarize
```
Creates concise summary of current note. Great for:
- Quick reviews
- Note previews
- Sharing main ideas

## 🎯 Workflow Examples

### When Starting a New Topic
```
1. Write rough notes
2. /tag → Add suggested tags
3. /link → Find concepts to link
4. /connections → Discover related content
```

### When Reviewing Old Notes
```
1. Open an older note
2. /connections → Find new relationships
3. /gaps → Identify what to add
4. /link → Update with modern connections
```

### When Doing Deep Research
```
1. Review existing note
2. /gaps → See what's missing
3. Research those gaps
4. /expand → Develop bullet points into sections
5. /tag → Organize with tags
```

## ⚡ Pro Tips

### Best Practices
1. **Always have a note open** - Commands need context
2. **Start with /connections** - Great way to explore your knowledge base
3. **Use /gaps for learning** - Identifies blind spots
4. **Batch operations** - Run /tag and /link together
5. **Review before applying** - AI suggestions aren't always perfect

### Keyboard Efficiency
- **Cmd+K** → Open command palette (future)
- **/** in chat → Start a quick command
- **Tab** → Autocomplete (future)

### Cost Control
- **Use GPT-3.5 Turbo** - 10x cheaper than GPT-4, still great
- **Or use Ollama** - Completely free, runs locally
- **Commands are optimized** - Typically $0.001-$0.005 each

### Privacy
- **Local Ollama** - Zero data leaves your machine
- **API providers** - Only sends note content when you run commands
- **No automatic scanning** - Everything is opt-in

## 🔧 Troubleshooting

### Command Not Working?
✅ **Check**: Is a note currently open?  
✅ **Check**: Is your AI provider configured?  
✅ **Try**: `/help` command first to verify setup

### No Results?
✅ **Ensure**: You have multiple notes (need 3+ for connections)  
✅ **Ensure**: Note has content (100+ words recommended)  
✅ **Try**: Different note or command

### Slow Responses?
✅ **Normal**: AI processing takes 2-5 seconds  
✅ **Speed up**: Switch to GPT-3.5 Turbo  
✅ **Alternative**: Use local Ollama (speed depends on hardware)

## 📚 Next Steps

### Learn More
- Read [Full AI Assistant Documentation](./AI_ASSISTANT_ENHANCEMENTS.md)
- Explore [AI Features Guide](./AI_FEATURES.md)
- Check [API Reference](./API_REFERENCE.md)

### Advanced Usage
- Set up custom prompts (future)
- Create AI-powered plugins
- Integrate with external knowledge bases

## 💬 Regular Chat Still Works

Type anything without "/" for normal conversation:

```
Tell me about React hooks
Explain component lifecycle
What's the best way to manage state?
```

The AI Assistant is both:
- 🤖 **Command tool** for PKM operations (`/commands`)
- 💬 **Chat assistant** for questions (regular text)

---

**Need Help?**  
Type `/help` in the AI Assistant or check the [Full Documentation](./AI_ASSISTANT_ENHANCEMENTS.md)

**Last Updated:** October 21, 2025
