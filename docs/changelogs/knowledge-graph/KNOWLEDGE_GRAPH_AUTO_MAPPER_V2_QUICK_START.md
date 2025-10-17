# Knowledge Graph Auto-Mapper v2.0 - Quick Start Guide

## 🚀 Getting Started

The Knowledge Graph Auto-Mapper v2.0 is your AI-powered assistant for organizing and connecting your notes intelligently.

---

## 📋 Prerequisites

Before using the plugin, ensure you have:

1. **AI Service Configured**
   - OpenAI API key, OR
   - Anthropic API key, OR
   - Google Gemini API key, OR
   - Ollama running locally

2. **Multiple Notes**
   - At least 5-10 notes for meaningful analysis
   - Notes with content (not just titles)

3. **Plugin Enabled**
   - Go to Settings → Plugin Manager
   - Find "Knowledge Graph Auto-Mapper"
   - Click "Load"

---

## 🎯 Quick Actions

### 1. Discover Hidden Connections (Cmd+Shift+D)

**What it does:**
Analyzes all your notes to find semantic connections that don't yet exist as wikilinks.

**How to use:**
1. Press `Cmd+Shift+D` or run command "Discover Hidden Connections"
2. Wait for AI analysis (may take 30-60 seconds)
3. Review suggestions in the dialog
4. Click "Yes" to apply the first suggestion
5. Check console for full list

**When to use:**
- After adding several new notes
- Weekly to maintain connections
- When notes feel disconnected

---

### 2. Health Check

**What it does:**
Gives your knowledge graph a comprehensive health report with metrics and recommendations.

**How to use:**
1. Run command "Knowledge Graph Health Check"
2. Review the health score and metrics
3. Note orphan count and clusters
4. Report auto-saves as a markdown note

**Metrics explained:**
- **Health Score**: Overall graph quality (0-100%)
- **Orphan Notes**: Isolated notes with no connections
- **Hub Notes**: Highly connected notes (5+ connections)
- **Clusters**: Groups of interconnected notes

---

### 3. Create MOCs (Maps of Content)

**What it does:**
Identifies groups of related notes that would benefit from a central index note.

**How to use:**
1. Run command "Suggest Maps of Content"
2. Review cluster suggestions
3. Click "Yes" to auto-create the first MOC
4. MOC note is created with all links

**Example MOC:**
```markdown
# Machine Learning MOC

AI-powered knowledge organization suggests these related notes...

## Related Notes

- [[Neural Networks Basics]]
- [[Deep Learning Introduction]]
- [[Backpropagation Explained]]
- [[CNN Architecture]]

## Overview

This is a Map of Content (MOC) that connects related notes about machine learning.
```

---

### 4. Connect Orphan Notes

**What it does:**
Finds isolated notes and suggests relevant connections.

**How to use:**
1. Run command "Connect Orphan Notes"
2. Review which notes are isolated
3. See AI suggestions for connections
4. Manually add links or use suggestions

---

### 5. Find Bridge Note Opportunities

**What it does:**
Identifies gaps between different clusters and suggests topics to bridge them.

**How to use:**
1. Run command "Find Bridge Note Opportunities"
2. Review suggested bridge topics
3. Consider creating notes on suggested topics
4. Link bridge notes to both clusters

---

## ⚙️ Settings Guide

### Recommended Settings for Beginners

```
✅ Auto-Discover Connections: OFF (manual only)
✅ Minimum Similarity Score: 0.7 (70%)
✅ Minimum Cluster Size: 3 notes
✅ Suggest MOCs: ON
✅ Categorize Relationships: ON
✅ Enable Notifications: ON
✅ Enable Analysis Caching: ON
✅ Cache Duration: 30 minutes
✅ Auto-Save Analysis Reports: ON
✅ Confirm Before Applying Changes: ON
```

### Advanced Settings

**Lower similarity threshold:**
- Set to 0.6 for more suggestions (may include weak connections)
- Set to 0.8 for fewer, higher-quality suggestions

**Auto-discover:**
- Turn ON for automatic suggestions when notes change
- Keep OFF if you prefer manual control

**Disable confirmations:**
- Turn OFF "Confirm Before Applying Changes" for faster workflow
- Only recommended for experienced users

---

## 📊 Understanding the Reports

### Health Report Example

```markdown
# 📊 Knowledge Graph Health Report

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Notes | 45 |
| Total Links | 78 |
| Health Score | **73%** |

## Recommendations

1. ⚠️ **High orphan count** - Run "Connect Orphan Notes"
2. ✅ **Good connectivity** - Keep adding wikilinks
```

**What the scores mean:**
- **90-100%**: Excellent - highly connected graph
- **70-89%**: Good - some room for improvement
- **50-69%**: Fair - needs attention
- **Below 50%**: Poor - requires significant work

---

## 💡 Pro Tips

### 1. Weekly Routine
```
Monday morning:
1. Run "Health Check" → Save baseline
2. Run "Discover Connections" → Apply top 5
3. Run "Suggest MOCs" → Create 1-2 if suggested
4. Run "Connect Orphans" → Link isolated notes
```

### 2. After Import Batch
```
After importing 10+ notes:
1. Run "Discover Connections" immediately
2. Create MOCs for new clusters
3. Link to existing note structure
```

### 3. Cache Management
```
When to clear cache:
- After bulk note editing
- If suggestions seem outdated
- When testing different settings
```

### 4. Report Tracking
```
Save weekly reports with dates:
- Compare orphan counts over time
- Track cluster formation
- Measure health score improvement
```

---

## 🔧 Troubleshooting

### "AI service is not configured"
**Solution:** Configure an AI provider in Settings → AI Configuration

### "Graph API is not available"
**Solution:** This is a known limitation. Graph features work for basic operations but some advanced features may not be fully implemented yet.

### "No connections discovered"
**Possible causes:**
1. Notes are too short (< 100 words)
2. Similarity threshold too high (lower it)
3. Notes cover unrelated topics
4. Notes already well-connected

### Slow Performance
**Solutions:**
1. Enable caching (if disabled)
2. Increase cache duration
3. Analyze fewer notes at once
4. Use background analysis (future feature)

---

## 🎓 Learning Path

### Week 1: Discovery
- Run health check to understand current state
- Experiment with connection discovery
- Review but don't apply suggestions yet

### Week 2: Application
- Start applying top connection suggestions
- Create your first MOC
- Connect some orphan notes

### Week 3: Optimization
- Adjust similarity threshold based on results
- Set up auto-discover if desired
- Create custom workflows

### Week 4: Mastery
- Use all commands regularly
- Compare weekly health reports
- Share insights with community

---

## 📈 Success Metrics

Track these over time:

| Week | Health Score | Orphans | Clusters | Notes |
|------|--------------|---------|----------|-------|
| 1 | 45% | 12 | 2 | 30 |
| 2 | 58% | 8 | 3 | 35 |
| 3 | 67% | 5 | 4 | 42 |
| 4 | 73% | 3 | 5 | 45 |

**Goal:** Increase health score, decrease orphans, maintain 3-6 clusters.

---

## 🆘 Support

### Common Questions

**Q: How often should I run the analysis?**
A: Weekly for active users, monthly for casual users.

**Q: Should I apply all suggestions?**
A: No. Review each one. Apply only connections that make sense to you.

**Q: What's a good cluster size?**
A: 5-15 notes per cluster. Smaller = too fragmented. Larger = needs MOC.

**Q: Can I undo applied connections?**
A: Yes, just remove the wikilink from your note.

---

## 🎉 Next Steps

1. ✅ Run your first "Health Check"
2. ✅ Discover some hidden connections
3. ✅ Create your first MOC
4. ✅ Join the community to share insights

---

**Happy knowledge mapping! 🗺️**

*Version 2.0.0*
*Last updated: October 16, 2025*
