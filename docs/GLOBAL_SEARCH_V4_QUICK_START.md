# Global Search V4 - Quick Start Guide

## 🚀 Quick Start (30 seconds)

### Option 1: Use Without AI (Works Immediately)

1. Press `Ctrl+Shift+F` (`Cmd+Shift+F` on Mac)
2. Type your search query
3. Browse results

**All V3 features work without any AI configuration!**

### Option 2: Enable AI Features (2 minutes setup)

#### Using Ollama (Free, Local, No API Key)

```bash
# 1. Install Ollama
brew install ollama  # macOS
# or download from https://ollama.ai

# 2. Pull a model
ollama pull llama3.2

# 3. In MarkItUp:
Click Brain icon (🧠) → Settings
Provider: Ollama
URL: http://localhost:11434
Model: llama3.2
Save

# 4. In Global Search:
Click "AI On" button
Start using AI features!
```

#### Using Cloud AI (OpenAI, Anthropic, Gemini)

```
1. Get API key from your provider
2. Click Brain icon (🧠) → Settings
3. Choose provider
4. Enter API key
5. Save
6. In Global Search: Click "AI On"
```

## 🎯 AI Features At-A-Glance

| Feature | Button | What It Does | Example |
|---------|--------|--------------|---------|
| **AI Toggle** | "AI On/Off" | Enable/disable all AI features | Click to turn AI on/off |
| **Natural Language** | "NL" | Search using plain English | "React notes from last week" |
| **Smart Suggestions** | Auto | AI suggests related searches | "Also try: async programming" |
| **Query Correction** | Auto | Fixes typos and improves queries | "Did you mean: javascript?" |
| **Semantic Refinement** | Refine | Understands meaning, not just text | Finds "async/await" when refining for "asynchronous" |

## 📝 Common Use Cases

### Daily Quick Searches (AI Off)

```
Ctrl+Shift+F
Type: "meeting notes"
Result: Instant, no AI delay
```

### Research & Discovery (AI On)

```
Ctrl+Shift+F
Click "AI On"
Type: "machine learning concepts I haven't reviewed"
AI parses to: keywords + filters
Click AI suggestions to explore related topics
```

### Natural Language Queries (AI On + NL)

```
Ctrl+Shift+F
Click "AI On" → Click "NL"
Type: "long untagged JavaScript files"
AI auto-applies:
- Keywords: JavaScript
- Filters: No tags, Word count > 1000
```

### Fix Typos Automatically (AI On)

```
Type: "reactjs componant"
AI suggests: "Did you mean: react component?"
Click to apply
```

## ⚡ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+F` | Open Global Search |
| `↑` / `↓` | Navigate results |
| `Enter` | Open selected result |
| `Esc` | Close panel |
| Type to search | Auto-search (300ms delay) |

## 🔧 Settings & Configuration

### AI Provider Comparison

| Provider | Cost | Setup | Privacy | Speed |
|----------|------|-------|---------|-------|
| **Ollama** | FREE | Easy | 100% Local | Fast |
| OpenAI | $$ | Easy | Cloud | Fast |
| Anthropic | $$ | Easy | Cloud | Fast |
| Gemini | $ | Easy | Cloud | Fast |

### Recommended Settings

**For Privacy:**
- Provider: Ollama
- Model: llama3.2
- Toggle AI on/off as needed

**For Power:**
- Provider: OpenAI/Claude
- Model: GPT-4/Claude 3.5 Sonnet
- Keep AI on for research

**For Speed:**
- Keep AI off for quick lookups
- Enable only when doing research

## 💡 Tips & Tricks

### When to Use AI

✅ **Use AI when:**
- Exploring new topics
- Complex research queries
- Finding related content
- Uncertain about exact terms

❌ **Don't use AI when:**
- Quick lookups
- You know the exact note name
- Speed is critical
- Simple keyword searches

### Power User Shortcuts

1. **Toggle AI Based on Need**: Quick searches = AI off, Research = AI on
2. **Learn from Suggestions**: See what AI suggests, learn better search terms
3. **Combine Features**: Use NL mode + manual filters for precision
4. **Experiment**: Try different AI providers for different tasks

### Privacy Best Practices

1. **Sensitive Notes**: Use Ollama (local processing)
2. **Toggle Control**: Disable AI for confidential searches
3. **Review Settings**: Know what's being sent to AI
4. **Monitor Usage**: Check AI provider dashboard

## 🐛 Troubleshooting

### "AI not configured" message

**Solution**: Click Brain icon → Settings → Configure AI provider

### AI features not appearing

**Checklist**:
- ✅ AI provider configured in Settings?
- ✅ API key entered (if not Ollama)?
- ✅ Ollama running (if using Ollama)?
- ✅ Clicked "AI On" button in Global Search?

### Slow search with AI enabled

**Normal**: AI processing adds 500ms-2s
**Solution**: Toggle AI off for quick searches

### AI suggestions not accurate

**Normal**: AI learns from context
**Solution**: 
- Provide more results (broader initial search)
- Try different AI provider/model
- Use manual filters for precision

### Natural Language mode not parsing correctly

**Solution**:
- Try simpler phrasing
- Use keywords as fallback
- Check parsed query panel
- Adjust manually if needed

## 📚 Learn More

- **Full Documentation**: `docs/changelogs/general/GLOBAL_SEARCH_V4_AI_ENHANCEMENTS.md`
- **V3 Features**: `docs/changelogs/general/GLOBAL_SEARCH_V3_ENHANCEMENTS.md`
- **Ollama Setup**: `docs/AI_OLLAMA_NO_API_KEY.md`
- **AI Features**: `docs/AI_FEATURES.md`

## 🎉 Summary

**Global Search V4 = V3 + Optional AI**

- ✅ All V3 features work without AI
- ✅ AI features are completely optional
- ✅ Toggle on/off based on your needs
- ✅ Works with any AI provider (including free local Ollama)
- ✅ Privacy-first design
- ✅ No degradation when AI is off

**Start simple, add AI when you need it!**

---

**Questions?** Check the full documentation or open an issue on GitHub.
