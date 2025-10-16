# Intelligent Link Suggester - Quick Start Guide

## What Does It Do?

The Intelligent Link Suggester uses AI to help you build a connected knowledge base by:

- 🔍 Finding notes that should be linked together
- ✏️ Inserting wikilinks right where concepts are mentioned
- 🌉 Suggesting "bridge notes" to connect isolated topics
- 📊 Showing you how connected your knowledge base is

## Getting Started

### Prerequisites

- AI must be configured in MarkItUp settings (OpenAI, Anthropic, Gemini, or Ollama)
- At least a few notes in your vault

### Step 1: Find Links in Current Note

1. Open any note
2. Press `Cmd+Shift+L` (or use command palette: "Find Link Opportunities")
3. Check the console for suggestions
4. Links are automatically inserted inline if auto-insert is enabled

### Step 2: Scan Your Entire Vault

1. Use command palette: "Scan All Notes for Missing Links"
2. Confirm the operation (may consume AI tokens)
3. See which notes have the most linking opportunities
4. Focus on those notes first

### Step 3: Connect Isolated Topics

1. Use command palette: "Suggest Bridge Note"
2. Review the AI's analysis of your knowledge clusters
3. See the suggested bridge note to connect them
4. Accept to create the note automatically

## Commands Reference

| Command | Keybinding | What It Does |
|---------|------------|--------------|
| Find Link Opportunities | `Cmd+Shift+L` | Analyze current note for potential links |
| Scan All Notes | None | Find link opportunities across all notes |
| Show Connection Map | None | Visualize your knowledge base connectivity |
| Suggest Bridge Note | None | AI suggests a note to connect isolated clusters |

## Settings

### Minimum Confidence (0-1)
- Default: `0.6`
- Higher = fewer but more accurate suggestions
- Lower = more suggestions, some may be less relevant

### Max Link Suggestions
- Default: `10`
- Maximum suggestions per note
- Prevents overwhelming output

### Max Links Per Paragraph
- Default: `2`
- Prevents over-linking
- Maintains readability

### Auto-Insert Links
- Default: `false` (disabled)
- When enabled: Automatically inserts high-confidence links (>90%)
- When disabled: Shows suggestions only

### Highlight Bidirectional Opportunities
- Default: `true`
- Shows when a suggested note already links back to you
- Creates stronger connections

## Tips & Best Practices

### 1. Start Small
- Run "Find Link Opportunities" on a few notes first
- Get comfortable with the suggestions before scanning all notes

### 2. Review Before Auto-Insert
- Keep auto-insert disabled initially
- Review suggestions to understand the AI's logic
- Enable auto-insert once you trust the suggestions

### 3. Use Bridge Notes Strategically
- Run "Suggest Bridge Note" when you notice isolated topic areas
- Bridge notes create hubs that improve discoverability
- Great for synthesis and connecting disparate ideas

### 4. Regular Maintenance
- Run "Scan All Notes" monthly
- Check "Connection Map" to track improvement
- Focus on orphan notes (notes with no connections)

### 5. Adjust Confidence Threshold
- If too many irrelevant suggestions: Increase min-confidence to 0.7-0.8
- If too few suggestions: Decrease min-confidence to 0.4-0.5
- Sweet spot is usually 0.5-0.7

## Understanding Suggestions

### Confidence Scores
- **90-100%**: Very strong connection, safe to auto-insert
- **70-89%**: Strong connection, worth reviewing
- **60-69%**: Moderate connection, may need context
- **Below 60%**: Filtered out (unless you lower threshold)

### Bidirectional Badges
- **↔️**: This note already links back to you
- Creating this link forms a bidirectional connection
- Bidirectional links are stronger for navigation

### Connection Types
- **Semantic**: Similar meanings/concepts
- **Topical**: Same subject area
- **Structural**: Related in note structure/hierarchy

## Examples

### Example 1: Simple Link Insertion

**Before:**
```markdown
I've been reading about machine learning algorithms.
```

**After running Find Link Opportunities:**
```markdown
I've been reading about [[Machine Learning]] algorithms.
```

### Example 2: Bridge Note

**Scenario:** You have notes about "Exercise" and "Nutrition" but nothing connecting them.

**AI Suggests:**
```
Title: "Health & Wellness Foundations"
Purpose: Connect fitness and diet knowledge
Links: [[Exercise Routines]], [[Nutrition Basics]], [[Mental Health]]
```

### Example 3: Connection Map

```
Total Notes: 50
Total Links: 75
Average Connections: 1.5 per note

Hub Notes:
1. "Personal Knowledge Management" - 12 connections
2. "Software Development" - 8 connections

Orphan Notes:
1. "Random Thought"
2. "Meeting Notes 2024-01"
```

## Troubleshooting

### "AI service is not configured"
- Go to Settings → AI Configuration
- Add API key for OpenAI, Anthropic, Gemini, or configure Ollama
- Restart MarkItUp if needed

### "No link opportunities found"
- Your note may be well-connected already
- Try lowering the minimum confidence threshold
- Check if your note has enough content to analyze

### Links inserted in wrong places
- Adjust "Max Links Per Paragraph" to prevent over-linking
- Disable auto-insert and review suggestions manually
- Check if note names match actual concepts in text

### Scan takes too long
- This is normal for large vaults (100+ notes)
- Results are cached for 5 minutes
- Consider scanning specific folders instead (feature coming soon)

### Bridge note suggestions don't make sense
- Your vault may be well-connected
- The AI works best with 20+ notes
- Clusters need to be truly disconnected

## Performance Notes

- **Caching**: Analysis results cached for 5 minutes
- **Batch Processing**: Scan processes 5 notes at a time
- **Token Usage**: Each note analysis consumes ~100-500 AI tokens
- **Speed**: Cached results return instantly, new analysis takes 1-3 seconds

## Advanced Usage

### Workflow for New Note
1. Write your note naturally
2. Run "Find Link Opportunities" when done
3. Review inline suggestions
4. Add any missed connections manually
5. Your note is now part of the knowledge graph

### Workflow for Vault Maintenance
1. Monthly: Run "Scan All Notes"
2. Check "Connection Map" for orphans
3. Run "Find Link Opportunities" on orphan notes
4. Quarterly: Run "Suggest Bridge Note"
5. Create bridges to unify knowledge clusters

### Integration with Other Plugins
- Use with Table of Contents plugin for navigation
- Combine with Daily Notes for temporal connections
- Pair with Smart Auto-Tagger for comprehensive metadata

## Feedback & Support

- Check console output for detailed information
- Suggestions are logged with reasons and confidence
- Enable notifications in settings for real-time feedback

## Coming Soon (Future Features)

- Real-time suggestions while typing
- Interactive UI panel (not just console)
- Accept/reject individual suggestions
- Learn from your linking patterns
- Export suggestions to markdown
- Visual graph highlighting

---

**Version**: 2.0.0  
**Last Updated**: October 16, 2025  
**Plugin ID**: `ai-intelligent-link-suggester`
