# AI Assistant Enhancements - PKM-Specific Features

## Overview

The AI Assistant has been enhanced with powerful PKM (Personal Knowledge Management) specific features that make it uniquely valuable for MarkItUp users. Instead of just being another chatbot, it now deeply integrates with your knowledge base to provide proactive assistance.

## 🚀 What's New

### Quick Commands

The AI Assistant now supports slash commands for instant PKM operations:

#### `/connections` or `/connect`
**Find related notes based on content similarity**

```
Usage: /connections
```

- Analyzes the current note's content
- Scans your entire knowledge base for connections
- Returns top 5 related notes with confidence scores
- Explains why each connection is relevant

**Example Output:**
```markdown
🔍 Analyzing your knowledge graph to find connections...

**Found Connections:**

• **[[React Hooks]]** (85% match)
  This note discusses useState and useEffect, which are directly referenced in your current note about React component patterns.

• **[[JavaScript ES6 Features]]** (78% match)
  Contains relevant information about arrow functions and destructuring that relate to your React code examples.
```

#### `/gaps` or `/missing`
**Identify knowledge gaps in current note**

```
Usage: /gaps
```

- Analyzes what's missing from your current note
- Compares with related notes to find unexplored topics
- Suggests questions to explore
- Helps you deepen your understanding

**Example Output:**
```markdown
🧩 Identifying knowledge gaps...

**Knowledge Gaps Identified:**

1. **State Management Libraries**
   You mention React state but don't discuss Redux or Context API.
   *Questions to explore:*
   - When should you use Redux vs built-in state?
   - How does Context API compare to prop drilling?

2. **Performance Optimization**
   Your note covers basic hooks but not memo, useMemo, or useCallback.
   *Questions to explore:*
   - When do performance hooks actually matter?
   - What are the trade-offs of over-optimization?
```

#### `/tag` or `/tags`
**Suggest relevant tags for current note**

```
Usage: /tag
```

- Analyzes note content using AI
- Suggests tags based on your existing tag system
- Shows confidence scores for each suggestion
- Provides reasoning for tag recommendations

**Example Output:**
```markdown
🏷️ Analyzing content for tag suggestions...

**Suggested Tags:**

• #react (95%)
  Primary topic of the note, mentioned 12 times with detailed examples.

• #frontend (88%)
  Discusses UI components and browser-specific rendering concepts.

• #javascript (82%)
  Contains ES6 syntax and JavaScript programming patterns.

💡 *Copy and paste the tags you want to add to your note.*
```

#### `/link` or `/links`
**Suggest wikilinks to other notes**

```
Usage: /link
```

- Scans your note for concepts that exist in other notes
- Suggests where to add [[wikilinks]]
- Shows confidence for each suggestion
- Helps build your knowledge graph

**Example Output:**
```markdown
🔗 Finding linkable concepts...

**Suggested Wikilinks:**

• Replace "state management" with [[State Management]] (90%)

• Replace "component lifecycle" with [[React Component Lifecycle]] (85%)

• Replace "hooks" with [[React Hooks]] (92%)

💡 *Manually add these [[wikilinks]] to your note.*
```

#### `/expand <text>`
**Expand a section with more detail**

```
Usage: /expand <text to expand>
```

- Takes a brief statement or bullet point
- Generates 2-3x more detailed content
- Maintains your writing style and tone
- Uses context from your current note

**Example:**
```
Input: /expand Machine learning is a subset of AI

Output:
✨ Expanding your content...

**Expanded Version:**

Machine learning represents a significant subset of artificial intelligence 
that focuses on enabling systems to learn and improve from experience without 
being explicitly programmed. Unlike traditional AI approaches that rely on 
rule-based programming, machine learning algorithms build mathematical models 
based on sample data, known as training data, to make predictions or decisions.

This approach has revolutionized how we tackle complex problems where defining 
explicit rules would be impractical or impossible. For instance, teaching a 
computer to recognize images of cats by describing all possible features would 
be nearly impossible, but machine learning can learn these patterns from 
thousands of example images.

The field encompasses various techniques including supervised learning, 
unsupervised learning, and reinforcement learning, each suited to different 
types of problems and data availability.

💡 *Copy this expanded text to your note.*
```

#### `/summarize` or `/summary`
**Summarize current note**

```
Usage: /summarize
```

- Creates a concise summary of your note
- Highlights key points and main ideas
- Useful for quick reviews or creating note previews
- Structured in 2-3 clear paragraphs

**Example Output:**
```markdown
📝 Creating summary...

**Summary:**

This note explores React Hooks, a feature introduced in React 16.8 that allows 
you to use state and other React features without writing class components. The 
primary hooks discussed are useState for managing component state and useEffect 
for handling side effects like data fetching and subscriptions.

The key advantage of hooks is that they let you reuse stateful logic between 
components without changing your component hierarchy. This solves the problems 
of wrapper hell and makes code more readable. The note includes practical 
examples of converting class components to functional components using hooks.

Common patterns covered include custom hooks for shared logic, the rules of 
hooks (only call at top level, only call from React functions), and best 
practices for dependency arrays in useEffect to avoid infinite loops and stale 
closures.
```

#### `/help` or `/?`
**Show available commands**

```
Usage: /help
```

Displays a complete list of available commands with descriptions.

## 🎯 Key Benefits

### 1. **Context-Aware**
Unlike ChatGPT, the AI Assistant has access to your entire knowledge base:
- Knows what notes you have
- Understands your tagging system
- Can see connections between your ideas
- Respects your writing style and organization

### 2. **PKM-Focused**
Commands are designed specifically for knowledge management:
- Build your knowledge graph
- Identify blind spots
- Maintain consistency
- Discover hidden connections

### 3. **Proactive Assistance**
Instead of just answering questions, it:
- Suggests connections you might have missed
- Points out gaps in your knowledge
- Helps maintain your note system
- Automates tedious linking and tagging tasks

### 4. **Privacy-Respecting**
- All analysis happens through your configured AI provider
- You control which provider to use (OpenAI, Anthropic, Gemini, or local Ollama)
- No data sent to third parties beyond your chosen provider
- Local Ollama option for complete privacy

## 💡 Usage Tips

### Best Practices

1. **Open the relevant note first** - Most commands work best when you have a note open
2. **Start with `/connections`** - Great way to discover related content
3. **Use `/gaps` for deep work** - Identify what to research next
4. **Batch tag with `/tag`** - Quickly organize multiple notes
5. **Use `/expand` for first drafts** - Turn bullet points into full paragraphs

### Workflow Examples

#### **Organizing a New Note**
```
1. Write your rough draft
2. Run /tag to get tag suggestions
3. Run /link to find connection opportunities
4. Add the suggested wikilinks
5. Run /connections to see what else is related
```

#### **Deep Research Session**
```
1. Review existing note on topic
2. Run /gaps to identify what's missing
3. Research the identified gaps
4. Use /expand to develop brief notes into full sections
5. Run /connections to link to related work
```

#### **Knowledge Base Maintenance**
```
1. Open an old note
2. Run /connections to find new relationships
3. Use /link to suggest modern connections
4. Run /tag to update tags based on current system
5. Use /summarize to add a note preview
```

## 🔧 Technical Details

### How It Works

1. **File Access**: Commands read notes from the `/markdown` directory
2. **AI Processing**: Uses your configured AI provider (OpenAI, Anthropic, Gemini, or Ollama)
3. **Context Building**: Automatically includes relevant context for better results
4. **JSON Responses**: AI returns structured data that's formatted nicely for display

### API Endpoints

The following API endpoints power the quick commands:

- `POST /api/ai/connections` - Find related notes
- `POST /api/ai/gaps` - Identify knowledge gaps
- `POST /api/ai/tags` - Generate tag suggestions
- `POST /api/ai/links` - Suggest wikilinks
- `POST /api/ai/expand` - Expand text with context
- `POST /api/ai/summarize` - Summarize note content

### Cost Considerations

- Commands use between 100-500 tokens each
- Average cost: $0.001-$0.005 per command (OpenAI GPT-3.5)
- Use Ollama (local) for zero-cost operation
- Commands are optimized to minimize token usage

## 🚧 Future Enhancements

### Planned Features

1. **Inline Link Suggestions** - Real-time wikilink suggestions while typing
2. **Smart Auto-Tagger** - Automatic tagging as you write
3. **Orphan Note Connector** - Weekly digest of disconnected notes
4. **Meeting Notes Processor** - Convert transcripts to structured notes
5. **Reading Notes Analyzer** - Process articles into atomic notes

### Plugin System Integration

These features will also be available as plugins:
- Can be enabled/disabled individually
- Configurable settings per feature
- Keyboard shortcuts for quick access
- Integration with editor context menus

## 📊 Analytics

All command usage is tracked in analytics:
- Command frequency
- Success rates
- Token usage per command
- Cost tracking

View your usage in the Analytics Dashboard.

## 🆘 Troubleshooting

### "No note is currently open"
- Make sure you have a markdown file open in the editor
- The current note ID must be passed to the AI Chat component

### "AI provider not configured"
- Go to AI Settings (gear icon in chat)
- Enter your API key for OpenAI, Anthropic, or Gemini
- Or configure Ollama URL for local AI

### "Failed to find connections"
- Ensure you have multiple notes in your knowledge base
- Check that your AI provider API key is valid
- Try a simpler command first to verify setup

### Commands are slow
- This is normal - AI processing takes 2-5 seconds
- Consider switching to GPT-3.5 Turbo for faster responses
- Ollama responses depend on your hardware

### Commands return empty results
- You may not have enough notes for connections/gaps analysis
- Try commands with different notes
- Ensure note has sufficient content (>100 words recommended)

## 📚 Learn More

- [AI Integration Guide](./AI_FEATURES.md) - Full AI setup documentation
- [Plugin Development](./PLUGIN_DEVELOPMENT.md) - Build your own AI-powered plugins
- [API Reference](./API_REFERENCE.md) - API documentation for developers

---

**Version:** 1.0.0  
**Last Updated:** October 21, 2025  
**Status:** ✅ Production Ready
