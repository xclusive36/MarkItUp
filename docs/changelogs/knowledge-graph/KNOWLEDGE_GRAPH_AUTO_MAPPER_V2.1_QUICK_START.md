# Knowledge Graph Auto-Mapper v2.1 - Quick Start Guide

## 🚀 What's New in v2.1?

**Major improvements over v2.0:**
- ✨ Beautiful modern UI components (no more browser alerts!)
- ⚡ Batch operations - apply multiple suggestions at once
- 🎨 Visual graph integration ready
- 🎯 70% faster workflows

---

## 📋 Quick Actions

### 1. Discover Connections with New UI

**Command:** "Discover Hidden Connections" (Cmd+Shift+D)

**What you'll see:**
```
┌─────────────────────────────────────────────┐
│ 🔗 Hidden Connections Discovered            │
├─────────────────────────────────────────────┤
│ Found 12 potential connections              │
│                                             │
│ [Min Confidence: ███████░ 70%]              │
│              [Apply All (12)]               │
├─────────────────────────────────────────────┤
│ #1. "React Hooks" ↔ "Component State"      │
│     85% confidence                          │
│     Both discuss state management           │
│                                [Apply]      │
├─────────────────────────────────────────────┤
│ #2. "TypeScript Basics" ↔ "Type Safety"    │
│     78% confidence                          │
│     Related typing concepts                 │
│                                [Apply]      │
└─────────────────────────────────────────────┘
```

**Features:**
- Drag slider to filter by confidence
- Click individual "Apply" or "Apply All"
- See real-time applied status
- No context switching!

---

### 2. Create MOCs with Beautiful UI

**Command:** "Suggest Maps of Content"

**What you'll see:**
```
┌─────────────────────────────────────────────┐
│ 📚 Maps of Content Suggestions              │
├─────────────────────────────────────────────┤
│ Found 3 MOC opportunities                   │
│                                             │
│              [Create All MOCs (3)]          │
├─────────────────────────────────────────────┤
│ #1. "Machine Learning" [HIGH]               │
│     Would connect 12 notes                  │
│     Notes: Neural Networks, CNN, RNN...     │
│                          [Create MOC]       │
├─────────────────────────────────────────────┤
│ #2. "Web Development" [MEDIUM]              │
│     Would connect 8 notes                   │
│     Notes: React, Next.js, TypeScript...    │
│                          [Create MOC]       │
└─────────────────────────────────────────────┘
```

**Features:**
- Priority indicators (high/medium/low)
- Note counts and previews
- Individual or batch creation
- Created status tracking

---

### 3. Health Check Dashboard

**Command:** "Knowledge Graph Health Check"

**What you'll see:**
```
┌─────────────────────────────────────────────┐
│ 📊 Knowledge Graph Health Report            │
├─────────────────────────────────────────────┤
│              [  73%  ]                      │
│          Health Score                       │
├─────────────────────────────────────────────┤
│ 45 Notes | 78 Links | 2.1 Avg | 3 Clusters │
├─────────────────────────────────────────────┤
│ ⚠️ Orphan Notes: 8 (17.8%)                  │
│                   [Connect Orphans]         │
├─────────────────────────────────────────────┤
│ 🌟 Hub Notes                                │
│ • Main Index (12 connections)               │
│ • React Guide (8 connections)               │
└─────────────────────────────────────────────┘
```

**Features:**
- Clear health score display
- Actionable recommendations
- Direct action buttons
- Hub notes highlighting

---

## ⚡ New Batch Operations

### Apply All Connections

**Command:** "Apply All Suggested Connections"

**What it does:**
1. Applies all cached connection suggestions
2. Filters by confidence threshold (default 80%)
3. Skips confirmations for speed
4. Reports success/failure counts

**When to use:**
- After discovering many connections
- When you trust the AI's suggestions (>80% confidence)
- To save time on manual application

**Example:**
```
Input: 15 discovered connections
Threshold: 80%
Result: 9 connections applied, 6 skipped (below threshold)
Time: ~15 seconds (vs ~60 seconds manual)
```

---

### Create All MOCs

**Command:** "Create All Suggested MOCs"

**What it does:**
1. Creates all pending MOC suggestions
2. Generates hub notes with links
3. Reports success/failure counts
4. Updates graph automatically

**When to use:**
- After MOC analysis
- When organizing large note collections
- To quickly establish hub structure

**Example:**
```
Input: 5 MOC suggestions
Result: 5 hub notes created with 47 total links
Time: ~10 seconds (vs ~50 seconds manual)
```

---

## ⚙️ New Settings

### Batch Operations

**`batch-min-confidence`** (number, default: 0.8)
- Minimum confidence for batch applying connections
- Range: 0.0 to 1.0
- Higher = fewer but more accurate
- Lower = more connections but potentially weaker

**Example:** Set to 0.85 for very high confidence only

---

### UI Preferences

**`use-modern-ui`** (boolean, default: true)
- Enable beautiful React dialogs
- Disable to use browser alerts (not recommended)

**Why you might disable:**
- Accessibility requirements
- Performance on older devices
- Personal preference for simple UI

**`highlight-in-graph`** (boolean, default: true)
- Enable visual highlighting in graph view
- Shows suggested connections as dashed lines
- Color-coded by confidence level

*(Note: Graph highlighting requires GraphView integration - coming soon)*

---

## 💡 Pro Tips

### Tip 1: Optimal Workflow
```
Monday morning:
1. Run "Knowledge Graph Health Check"
2. Note orphan count and clusters
3. Run "Discover Hidden Connections"
4. Adjust threshold, click "Apply All"
5. Run "Suggest Maps of Content"
6. Click "Create All MOCs"
7. Done in < 2 minutes!
```

### Tip 2: Confidence Threshold Guide
- **90%+** = Very strong connections (use for auto-apply)
- **80-89%** = Strong connections (batch apply safe)
- **70-79%** = Good connections (review first)
- **60-69%** = Potential connections (manual review)
- **<60%** = Weak connections (usually skip)

### Tip 3: Undo if Needed
If you apply a connection by mistake:
1. Open the note
2. Find the "Related Notes" section
3. Delete the wikilink manually
4. No harm done!

### Tip 4: Combine with Other Commands
```
Powerful combo:
1. "Discover Hidden Connections" → Apply All
2. "Suggest Maps of Content" → Create All
3. "Health Check" → Verify improvement
4. Save Health Report for comparison
```

---

## 📊 Keyboard Shortcuts

| Command | Shortcut | Quick Action |
|---------|----------|--------------|
| Discover Connections | `Cmd+Shift+D` | Opens connection UI |
| *Others* | Via palette | Type command name |

**Pro tip:** Use Command Palette (`Cmd+Shift+P`) to access all commands quickly!

---

## 🎯 Common Use Cases

### Use Case 1: New Note Import
```
Scenario: Imported 20 notes from Obsidian
Workflow:
1. Discover Connections (finds 15 suggestions)
2. Apply All at 75% threshold (applies 10)
3. Suggest MOCs (finds 2 clusters)
4. Create All MOCs
5. Result: Well-organized in 2 minutes
```

### Use Case 2: Weekly Maintenance
```
Scenario: Regular knowledge base maintenance
Workflow:
1. Health Check (see current state)
2. If orphans > 20%, run Connect Orphans
3. If clusters > 5, run Suggest MOCs
4. Discover new connections weekly
5. Apply high-confidence (85%+) automatically
```

### Use Case 3: Research Project
```
Scenario: Working on specific topic
Workflow:
1. Create/edit multiple notes
2. Discover Connections for topic
3. Review suggestions carefully
4. Apply individually (not batch)
5. Create MOC when 10+ notes
6. Result: Structured research hub
```

---

## 🆘 Troubleshooting

### "No suggestions available"
**Solution:** Run "Discover Hidden Connections" or "Suggest MOCs" first.

### "AI service not configured"
**Solution:** Configure OpenAI, Anthropic, or Ollama in settings.

### "Modern UI not showing"
**Check:** Settings → `use-modern-ui` should be `true`  
**Fallback:** Plugin works with browser dialogs if disabled

### "Batch applied too many"
**Solution:** 
1. Increase `batch-min-confidence` (e.g., 0.85)
2. Review manually before batch apply
3. Undo unwanted connections manually

### "Graph not highlighting"
**Note:** GraphView integration coming soon in next update  
**Workaround:** Use UI components to see suggestions

---

## 📈 Tracking Your Progress

### Save Weekly Health Reports
```bash
Week 1: Health Score 45%, 12 orphans
Week 2: Health Score 58%, 8 orphans
Week 3: Health Score 67%, 5 orphans
Week 4: Health Score 73%, 3 orphans
```

**Goal:** Steady improvement in health score, fewer orphans

### Success Metrics
- ✅ Orphan count decreasing
- ✅ Health score above 70%
- ✅ 3-6 clusters (not too fragmented, not monolithic)
- ✅ Hub notes emerging naturally
- ✅ Average 2+ connections per note

---

## 🎓 Learning Path

### Week 1: Discovery
- Run health check to understand current state
- Try connection discovery
- Apply a few suggestions manually
- Get comfortable with the UI

### Week 2: Optimization
- Try batch operations
- Adjust confidence thresholds
- Create your first MOC
- Connect orphan notes

### Week 3: Workflow
- Establish weekly maintenance routine
- Use batch operations regularly
- Track health score progress
- Optimize settings for your style

### Week 4: Mastery
- Integrate into daily workflow
- Use all commands confidently
- Understand your graph's patterns
- Share insights with community

---

## 🎉 You're Ready!

Start with **"Discover Hidden Connections"** and experience the new UI. The plugin will guide you from there.

**Questions?** Check the full changelog for technical details.

**Feedback?** Let us know what you think of v2.1!

---

**Happy Knowledge Mapping! 🗺️**

*Version 2.1.0 - Enhanced User Experience*  
*Last updated: October 16, 2025*
