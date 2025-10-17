# Intelligent Link Suggester v3.1 - Quick Start Guide

## 🚀 New in v3.1 (October 16, 2025)

Three powerful new features make this plugin even better!

---

## 1️⃣ Batch Orphan Analysis

**Analyze all unconnected notes at once!**

### How to Use:
1. Open Command Palette
2. Run: **"Show Connection Strength Map"**
3. Look for the "Orphan Notes" section
4. Click: **"🔍 Find Links for All Orphans"**
5. Confirm and wait for analysis
6. Review the summary

### When to Use:
- Monthly knowledge base maintenance
- After importing many new notes
- When you have 5+ orphan notes

### Example Result:
```
✅ 12 notes with link opportunities
📊 Total potential links: 47
Top: "Meeting Notes" - 8 suggestions
```

---

## 2️⃣ Link Context Visualization

**See exactly where links would be inserted!**

### What You'll See:
Every suggestion now includes a blue box showing:
- Text excerpt from your note
- **Bold highlighting** of the matched term
- Arrow pointing to the link target

### Example:
```
💡 LINK CONTEXT:
"...studying **machine learning** algorithms..."
→ Would link to [[Machine Learning]]
```

### Benefits:
- ✅ Make confident decisions
- ✅ Understand AI reasoning
- ✅ No surprises after accepting

---

## 3️⃣ Real-Time Suggestions ⚡

**Get suggestions automatically while typing!**

### Quick Toggle:
Press: **`Cmd+Shift+R`** (Mac) or **`Ctrl+Shift+R`** (Windows/Linux)

### How It Works:
1. Enable real-time suggestions
2. Write your note naturally
3. Stop typing for 3 seconds
4. AI automatically analyzes
5. Suggestion modal appears if opportunities found

### Smart Features:
- ✅ Only analyzes if content > 100 characters
- ✅ Skips minor edits (< 50 chars changed)
- ✅ Uses caching to save API calls
- ✅ Disabled by default (opt-in)

### When to Use:
- ✅ Writing long articles or essays
- ✅ Actively building your knowledge base
- ❌ Quick note-taking (can be distracting)

---

## ⚙️ Settings

### Enable Real-Time Suggestions:
1. Open Plugin Settings
2. Find: **"Intelligent Link Suggester"**
3. Enable: **"Real-Time Suggestions (Experimental)"**

### Adjust Confidence:
- **Higher (0.7-0.9):** Fewer, more accurate suggestions
- **Lower (0.4-0.6):** More suggestions, some less relevant
- **Default (0.6):** Balanced

---

## 🎯 All Commands

| Command | Keybinding | What It Does |
|---------|------------|--------------|
| Find Link Opportunities | `Cmd+Shift+L` | Analyze current note |
| **Toggle Real-Time Suggestions** | `Cmd+Shift+R` | **NEW:** Enable/disable auto-analysis |
| Scan All Notes | None | Find opportunities in entire vault |
| Show Connection Map | None | Visualize knowledge base health |
| Suggest Bridge Note | None | AI suggests note to connect clusters |

---

## 💡 Tips & Tricks

### Batch Analysis Best Practices:
- Run monthly to keep knowledge base connected
- Focus on top 5 orphans with most opportunities
- Use results to prioritize which notes to enhance

### Context Visualization Tips:
- Check context before accepting to ensure correct placement
- Learn from the bold text to understand matching
- Reject if semantic meaning doesn't match

### Real-Time Suggestions Tips:
- Try it for a week to see if it fits your workflow
- Toggle off during brainstorming sessions
- Use manual suggestions (Cmd+Shift+L) for quick notes

---

## 🔥 Quick Workflow

### Daily Note Writing:
1. Toggle real-time suggestions on (`Cmd+Shift+R`)
2. Write naturally, stop typing when done
3. Review auto-suggestions after 3 seconds
4. Accept/reject as appropriate
5. Plugin learns from your choices

### Weekly Maintenance:
1. Run "Show Connection Map"
2. Check orphan notes count
3. If 5+, click "Find Links for All Orphans"
4. Review top opportunities
5. Enhance those notes with links

### Monthly Cleanup:
1. Run "Scan All Notes for Missing Links"
2. Review summary of vault-wide opportunities
3. Focus on notes with 5+ suggestions
4. Run "Suggest Bridge Note" if clusters exist
5. Check Connection Map to see improvement

---

## ❓ FAQ

### Q: Is batch orphan analysis slow?
**A:** About 2 seconds per note. A vault with 10 orphans takes ~20 seconds.

### Q: Will real-time suggestions slow down my typing?
**A:** No! It only analyzes 3 seconds *after* you stop typing, and uses caching.

### Q: Can I customize the context window size?
**A:** Not yet, but it's fixed at 50 characters before/after the match.

### Q: Does this work offline with Ollama?
**A:** Yes! All AI features work with local Ollama models.

### Q: Will this use a lot of AI tokens?
**A:** Results are cached for 5 minutes. Real-time mode respects the cache.

---

## 🐛 Troubleshooting

### Real-time suggestions not working:
1. Check if feature is enabled in settings
2. Verify you have AI configured (OpenAI/Anthropic/Ollama)
3. Make sure you're typing 100+ characters
4. Wait full 3 seconds after stopping

### No context shown in suggestions:
- Context only appears if the plugin found an insertion point
- If no match found in text, no context is shown
- Try lowering the confidence threshold

### Batch analysis shows no opportunities:
- Your orphan notes may genuinely have no related content
- Try lowering minimum confidence in settings
- Check if orphan notes have enough content (100+ chars)

---

## 🎉 Enjoy v3.1!

These enhancements make the Intelligent Link Suggester the most powerful knowledge base assistant available. Experiment with the features and find what works for your workflow!

**Remember:** The plugin learns from your accept/reject patterns, so the more you use it, the better it gets!

---

**Version:** 3.1.0  
**Updated:** October 16, 2025  
**Plugin ID:** `ai-intelligent-link-suggester`
