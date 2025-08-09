# AI Integration Setup Guide

This guide will help you set up AI features in your MarkItUp PKM system.

## 🚀 Quick Start

### 1. Get an OpenAI API Key

1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-`)

### 2. Configure AI in MarkItUp

1. Open MarkItUp in your browser
2. Click the Brain icon (🧠) in the top header
3. Click the Settings gear icon in the AI chat panel
4. Paste your OpenAI API key
5. Choose your preferred model:
   - **GPT-3.5 Turbo**: Fast and cost-effective (recommended for most users)
   - **GPT-4**: Most capable but more expensive
   - **GPT-4 Turbo**: Balanced option with larger context window

### 3. Start Chatting!

- Ask questions about your notes
- Get help with writing and editing
- Request summaries of your content
- Find connections between ideas

## 🧠 AI Features

### Context-Aware Conversations

The AI assistant automatically includes relevant context from your knowledge base:

- **Related Notes**: When discussing a specific note, related notes are included
- **Search Integration**: Your search results help inform AI responses
- **Wikilink Awareness**: The AI understands your note connections
- **Tag Recognition**: AI considers your tagging system

### Smart Suggestions

- **Writing Help**: Get suggestions for improving your content
- **Tag Recommendations**: AI suggests relevant tags for your notes
- **Connection Discovery**: Find potential links between your notes
- **Content Expansion**: Generate ideas to develop your thoughts

### Knowledge Graph Integration

- **Graph-Based Context**: AI uses your knowledge graph structure
- **Backlink Analysis**: Considers bidirectional connections
- **Orphan Note Detection**: Helps connect isolated notes
- **Hub Identification**: Recognizes your most connected notes

## ⚙️ Configuration Options

### Basic Settings

- **API Key**: Your OpenAI API key (required)
- **Model**: Choose between GPT-3.5 Turbo, GPT-4, or GPT-4 Turbo
- **Temperature**: Control creativity (0 = focused, 1 = creative)
- **Max Tokens**: Limit response length (default: 1000)

### Context Settings

- **Enable Context**: Include note context in conversations (recommended)
- **Max Context Notes**: Number of related notes to include (default: 5)
- **Context Search Depth**: How deep to search for relevant content

### Usage Tracking

- **Enable Usage Tracking**: Monitor token usage and costs
- **Monthly Limit**: Set spending limits to control costs

## 💰 Cost Management

### Understanding Costs

- **GPT-3.5 Turbo**: ~$0.001 per 1,000 tokens (very affordable)
- **GPT-4**: ~$0.03 per 1,000 tokens (premium pricing)
- **GPT-4 Turbo**: ~$0.01 per 1,000 tokens (balanced)

### Cost-Saving Tips

1. **Start with GPT-3.5 Turbo** for most tasks
2. **Use GPT-4 only when needed** for complex reasoning
3. **Enable usage tracking** to monitor spending
4. **Set monthly limits** to avoid surprises
5. **Use context wisely** - more context = more tokens

### Token Estimation

- Average conversation: 100-500 tokens
- Note analysis: 200-1000 tokens
- With context: +100-300 tokens per note included

## 🔒 Privacy & Security

### Data Handling

- **API Key Storage**: Encrypted locally in your browser
- **Conversation History**: Stored locally, not on external servers
- **Note Content**: Only sent to OpenAI when explicitly included in context
- **No Automatic Sharing**: Your notes are not automatically processed

### Best Practices

1. **Review Context Settings**: Choose what information to share
2. **Use Local Models**: Consider Ollama for sensitive content (future feature)
3. **Regular Cleanup**: Delete old conversations you no longer need
4. **Monitor Usage**: Keep track of what data is being sent

## 🛠 Troubleshooting

### Common Issues

**"AI not configured" Error**
- Ensure you've entered a valid OpenAI API key
- Check that your API key hasn't expired
- Verify your OpenAI account has available credits

**Slow Responses**
- Try switching to GPT-3.5 Turbo for faster responses
- Reduce the number of context notes included
- Check your internet connection

**High Costs**
- Monitor your usage in the AI settings
- Switch to a more cost-effective model
- Reduce context inclusion for routine tasks

**No Context in Responses**
- Ensure "Include note context" is enabled
- Check that you have related notes in your knowledge base
- Verify the AI can find relevant connections

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API key is correctly entered
3. Test with a simple question first
4. Review your OpenAI account status

## 🔮 Future Features

Coming soon to MarkItUp AI:

- **Local AI Models**: Ollama integration for privacy
- **Batch Processing**: Analyze multiple notes at once
- **Custom Prompts**: Create your own AI workflows
- **Export Integration**: AI-powered export features
- **Meeting Transcription**: Audio-to-notes conversion
- **Research Assistant**: Web research integration
- **Citation Management**: Automatic bibliography generation

## 📚 Example Use Cases

### Writing Assistant
```
User: "Help me improve this paragraph about machine learning"
AI: "I can help you refine that paragraph. Based on your other notes about AI and data science, here are some suggestions..."
```

### Knowledge Discovery
```
User: "What connections can you find between my project notes?"
AI: "Looking at your notes, I see several interesting connections between Project Alpha and your research on user experience..."
```

### Content Analysis
```
User: "Summarize my notes about productivity"
AI: "Based on your 12 notes tagged with #productivity, here are the main themes I've identified..."
```

### Research Help
```
User: "I'm writing about climate change. What should I focus on?"
AI: "Considering your existing notes on environmental science, you might want to explore these specific aspects..."
```

---

**Need more help?** Check out the main MarkItUp documentation or open an issue on GitHub.

## 🚀 Phase 2: Advanced AI Features

### Knowledge-Aware AI Features ✅ COMPLETED

#### Advanced Content Analysis
- **Content Analyzer** (`/src/lib/ai/analyzers.ts`)
  - Comprehensive content analysis with readability scoring
  - Knowledge gap identification and suggestions
  - Content improvement recommendations
  - Semantic analysis and categorization

#### Writing Assistant
- **Writing Assistant Component** (`/src/components/WritingAssistant.tsx`)
  - Real-time content analysis and suggestions
  - Writing style improvement recommendations
  - Content expansion and restructuring suggestions
  - Tone and clarity optimization
  - **Access**: PenTool icon in header

#### Knowledge Discovery
- **Knowledge Discovery Component** (`/src/components/KnowledgeDiscovery.tsx`)
  - Intelligent knowledge gap analysis
  - Missing topic identification
  - Orphaned note detection and connection suggestions
  - Automated note creation with AI-generated content
  - **Access**: Compass icon in header

#### API Enhancements
- **Analysis Endpoints**:
  - `/api/ai/analyze` - General content analysis
  - `/api/ai/analyze-knowledge` - Knowledge base analysis
  - `/api/ai/suggest-note` - AI-powered note suggestions

#### Features Implemented:
✅ Advanced content analysis with multiple metrics
✅ Writing improvement suggestions with real-time feedback
✅ Knowledge gap identification and visualization
✅ Intelligent note creation suggestions
✅ Orphaned note detection and connection recommendations
✅ Under-explored topic identification
✅ Content clustering and organization suggestions
✅ Tabbed interface for different analysis types
