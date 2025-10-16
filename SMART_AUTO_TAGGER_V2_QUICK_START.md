# Smart Auto-Tagger V2.0 - Quick Start Guide

Get up and running with Smart Auto-Tagger V2.0 in 5 minutes!

---

## ⚡ 1-Minute Setup

### Step 1: Enable AI Service
1. Open MarkItUp
2. Go to **Settings → AI**
3. Choose your provider:
   - **OpenAI**: Enter API key
   - **Anthropic**: Enter API key
   - **Gemini**: Enter API key
   - **Ollama**: Ensure local instance is running
4. Click **Test Connection**
5. ✅ Confirm success

### Step 2: Activate Plugin
1. Go to **Settings → Plugins**
2. Find **Smart Auto-Tagger**
3. Toggle **Enabled** if not already on
4. ✅ Plugin ready!

---

## 🚀 Quick Actions

### Tag a Single Note (15 seconds)

```
1. Open any note
2. Press Cmd+Shift+T (Mac) or Ctrl+Shift+T (Windows)
3. Review AI suggestions
4. Click "Apply All" or select specific tags
5. Done! ✅
```

**Keyboard Shortcut:** `Cmd+Shift+T` (Mac) / `Ctrl+Shift+T` (Windows)

### Tag All Notes (2-5 minutes)

```
1. Open Command Palette (Cmd+Shift+P)
2. Type "Batch Tag"
3. Select "Batch Tag All Untagged Notes"
4. Confirm the operation
5. Watch progress (pause/resume if needed)
6. Done! ✅
```

**Estimated Time:** ~3 seconds per note

### View Analytics (10 seconds)

```
1. Open Command Palette (Cmd+Shift+P)
2. Type "Analytics"
3. Select "Show Tag Analytics Dashboard"
4. Explore your tagging insights
5. Done! ✅
```

### Undo Last Action (instant)

```
Just press: Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows)
```

---

## 🎯 Common Workflows

### Workflow 1: New User Setup

**Goal:** Tag all existing notes and establish baseline

```
1. Settings → AI → Configure provider ✓
2. Command Palette → "Batch Tag All Untagged Notes" ✓
3. Wait for batch operation to complete ✓
4. Command Palette → "Show Tag Analytics Dashboard" ✓
5. Review coverage score (should be 80%+) ✓
```

**Time:** 5-10 minutes for 100 notes

### Workflow 2: Daily Note Tagging

**Goal:** Tag new notes as you create them

```
1. Write your note ✓
2. Press Cmd+Shift+T when done ✓
3. Review suggestions ✓
4. Apply tags ✓
5. Continue working ✓
```

**Time:** 10-15 seconds per note

### Workflow 3: Weekly Analytics Review

**Goal:** Optimize tagging strategy

```
1. Command Palette → "Show Tag Analytics Dashboard" ✓
2. Check coverage score (aim for 80%+) ✓
3. Review most used tags ✓
4. Check acceptance rate (aim for 70%+) ✓
5. Adjust settings if needed ✓
6. Click "Tag All" for orphaned notes ✓
```

**Time:** 2-3 minutes weekly

### Workflow 4: Batch Re-Tagging

**Goal:** Update tags after changing AI settings

```
1. Settings → Plugins → Smart Auto-Tagger ✓
2. Adjust confidence threshold or max suggestions ✓
3. Command Palette → "Batch Tag All Untagged Notes" ✓
4. Review progress ✓
5. Check analytics to see improvements ✓
```

**Time:** 5-10 minutes

---

## ⚙️ Essential Settings

### Recommended for Beginners

```
Confidence Threshold: 0.7 (default)
Max Suggestions: 5 (default)
Auto-Apply: false (review first)
Enable Notifications: true
Enable Analytics: true
```

### Recommended for Power Users

```
Confidence Threshold: 0.6 (more suggestions)
Max Suggestions: 10 (more options)
Auto-Apply: false (stay in control)
Enable Notifications: true
Excluded Tags: [your unwanted tags]
```

### Recommended for Privacy-Conscious

```
[All defaults, except:]
Enable Analytics: false (no tracking)
```

---

## 🎨 UI Guide

### Tag Suggestions Panel

**What you'll see:**
- 🏷️ **Note name** at the top
- 📊 **Confidence badges** for each tag:
  - 🟢 Green = High (>80%)
  - 🟡 Yellow = Medium (60-80%)
  - 🟠 Orange = Low (<60%)
- 📝 **AI Summary** of note content
- 🔑 **Key Topics** identified
- ☑️ **Checkboxes** for each tag
- 🎛️ **Confidence filter** slider

**Actions:**
- Click checkboxes to select specific tags
- Click "Apply Selected" for chosen tags only
- Click "Apply All" for all visible tags
- Adjust slider to filter by confidence
- Press Escape to close

### Analytics Dashboard

**What you'll see:**
- 📊 **Coverage Score** (large percentage)
- 📈 **4 Key Metrics**:
  - Total Tags
  - Tagged Notes
  - Untagged Notes
  - Acceptance Rate
- 📉 **7-Day Timeline** (bar chart)
- 🏆 **Top 10 Tags** (ranked list)
- 📊 **Suggestion Stats** (accepted/rejected)
- 💡 **Recommendations** (contextual tips)

**Actions:**
- Click "Tag All" to batch tag orphaned notes
- Click "Close" to exit
- (Future: Export to CSV/PDF)

### Batch Progress Tracker

**What you'll see:**
- 📊 **Progress Bar** (0-100%)
- 📈 **Statistics Cards**:
  - ✅ Completed (green)
  - ❌ Errors (red)
  - ⏳ Remaining (blue)
- ⏱️ **Estimated Time Remaining**
- 📋 **Scrollable Note List** with status:
  - ⚪ Pending
  - 🔵 Processing (animated)
  - ✅ Completed
  - ❌ Error

**Actions:**
- Click "Pause" to temporarily stop (yellow button)
- Click "Resume" to continue (green button)
- Click "Stop" to cancel operation (red button)
- Click "Close" when finished

---

## 🐛 Troubleshooting

### Issue: No suggestions appear

**Quick Fixes:**
1. Check AI service is connected (Settings → AI → Test Connection)
2. Ensure note has enough content (>50 words)
3. Lower confidence threshold (Settings → Plugins → Smart Auto-Tagger)
4. Check excluded tags list (might be filtering all suggestions)

### Issue: Batch tagging stuck

**Quick Fixes:**
1. Click "Pause" button
2. Check network connection
3. Verify AI service status
4. Click "Resume" or "Stop"
5. Try again with fewer notes

### Issue: Analytics not showing

**Quick Fixes:**
1. Enable analytics tracking (Settings → Plugins → Smart Auto-Tagger)
2. Tag at least one note first
3. Reload page and try again

### Issue: Undo not working

**Note:** Undo history is session-based. If you reloaded the page, history is cleared.

**Quick Fix:**
- Manually remove tags from note metadata

---

## 💡 Pro Tips

### Tip 1: Use Confidence Filter
- Start with 70% threshold
- Too many bad suggestions? Raise to 80%
- Too few suggestions? Lower to 60%

### Tip 2: Review Analytics Weekly
- Track your coverage score
- Identify underused tags
- Consolidate similar tags

### Tip 3: Leverage Undo
- Don't fear mistakes
- Experiment with different tags
- Undo is instant: Cmd+Shift+Z

### Tip 4: Batch Tag Strategically
- Use pause/resume for breaks
- Process notes during off-hours
- Monitor AI token usage

### Tip 5: Export Analytics
- Backup your analytics data monthly
- Track long-term trends
- Share insights with team

---

## 📊 Success Metrics

### Week 1 Goals
- ✅ 50%+ coverage score
- ✅ All new notes tagged
- ✅ Familiarity with UI

### Month 1 Goals
- ✅ 80%+ coverage score
- ✅ 70%+ acceptance rate
- ✅ Optimized settings

### Long-Term Goals
- ✅ 90%+ coverage score
- ✅ 80%+ acceptance rate
- ✅ Consistent tagging workflow

---

## 🔗 Quick Reference

### Keyboard Shortcuts
- `Cmd/Ctrl + Shift + T` - Suggest tags for current note
- `Cmd/Ctrl + Shift + Z` - Undo last tag action
- `Cmd/Ctrl + Shift + P` - Open command palette
- `Escape` - Close any modal

### Command Palette Commands
- "Suggest Tags for Current Note"
- "Batch Tag All Untagged Notes"
- "Show Tag Analytics Dashboard"
- "Undo Last Tag Action"
- "Review Tag Suggestions"
- "Export Tag Analytics"

### Settings Path
**Settings → Plugins → Smart Auto-Tagger**

### Analytics Path
**Command Palette → "Show Tag Analytics Dashboard"**

---

## 📚 Learn More

- **Full Documentation:** `SMART_AUTO_TAGGER_V2_COMPLETE.md`
- **Changelog:** `SMART_AUTO_TAGGER_V2_CHANGELOG.md`
- **GitHub Issues:** [Report bugs or request features]

---

## 🎉 You're All Set!

Start tagging with:

```
Press Cmd+Shift+T on any note
```

**Happy Tagging! 🏷️**

---

**Version:** 2.0.0  
**Last Updated:** 2024  
**Status:** ✅ Ready to Use
