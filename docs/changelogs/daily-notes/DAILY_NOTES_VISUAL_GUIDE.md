# Daily Notes - Visual Quick Start Guide

## 🎯 Goal: Journal Daily Without Using Keyboard Shortcuts

---

## Step 1: Access Your Notes

```
Navigate to: http://localhost:3000
```

**Look for:**
- "Daily Notes" folder in sidebar
- OR "Files" section
- OR navigate to `/markdown/Daily Notes/`

---

## Step 2: Create Today's Note

### Option A: Manual Creation

```
1. Click "New Note" or "Create File" button
2. Set folder: Daily Notes
3. Set name: 2025-10-15.md  (use today's date!)
4. Click Create
```

### Option B: If Auto-Create is Enabled

```
1. Open the app
2. Note is automatically created!
3. Look for today's date in Daily Notes folder
```

---

## Step 3: Choose Your Template

Copy and paste ONE of these templates into your note:

### 🎯 Default (Recommended for Beginners)

```markdown
# 2025-10-15

## Today's Goals
- [ ] 

## Notes


## Reflection
### What went well?


### What could be improved?


## Tomorrow's Priorities
- [ ] 

---
Created: 7:30 PM
```

### ⚡ Minimal (Fastest)

```markdown
# 2025-10-15

[Start writing here]
```

### 💼 Productivity (Task-Focused)

```markdown
# 2025-10-15

## 🎯 Top 3 Priorities
1. [ ] 
2. [ ] 
3. [ ] 

## ✅ Completed
- [ ] 

## 📝 Notes

```

---

## Step 4: Fill It In!

**Morning:** Set your goals and priorities

**Throughout Day:** Add notes as things happen

**Evening:** Reflect on what went well

---

## 📅 Daily Workflow

### Every Morning:

```
1. Open app (http://localhost:3000)
2. Navigate to Daily Notes folder
3. Open today's note (2025-10-15.md)
4. Fill in "Today's Goals" section
5. Save
```

### During the Day:

```
1. Open today's note when you have thoughts
2. Add to "Notes" section with timestamp:
   
   **3:45 PM** - Had a meeting about the project...
   
3. Save
```

### Every Evening:

```
1. Open today's note
2. Check off completed goals
3. Fill in "Reflection" section
4. Add "Tomorrow's Priorities"
5. Save
```

---

## 🔥 Building Your Streak

### What is a Streak?

A streak is consecutive days where you create a daily note.

**Example:**
```
Daily Notes/
  2025-10-13.md  ✅
  2025-10-14.md  ✅
  2025-10-15.md  ✅  ← 3-day streak!
```

### How to Build a Streak:

```
1. Create a note every day
2. Name it with the date (YYYY-MM-DD.md)
3. Put it in Daily Notes folder
4. Add any content (even 1 sentence!)
5. Repeat tomorrow
```

### Checking Your Streak:

**Manual Method:**
```
1. Go to Daily Notes folder
2. Look at your files
3. Count backwards from today
4. Stop when you find a missing day
```

**Command Palette Method** (if available):
```
1. Open Command Palette (Ctrl+K or search icon)
2. Type "streak"
3. Click "Show Current Streak"
```

---

## 📊 Viewing Your Progress

### File List View:

```
Daily Notes/
  2025-10-01.md
  2025-10-02.md
  2025-10-03.md
  ...
  2025-10-15.md  ← You're here!
  
Total: 15 notes this month
```

### Analytics View (if available):

Look for:
- Dashboard or Analytics link in plugin settings
- Shows total notes, streaks, patterns
- Graphs of your activity

---

## 🛠️ Enable Auto-Creation

### Why Enable It?

Instead of creating a note every day, the app does it for you!

### How to Enable:

```
1. Go to Plugin Manager or Settings
2. Find "Daily Notes Enhanced"
3. Look for settings:
   ✅ Auto-create Daily Note: ON
   ✅ Create Weekend Notes: ON (your choice)
4. Save settings
```

### What Happens:

```
Every time you open the app:
→ Checks if today's note exists
→ If not, creates it automatically
→ Uses your selected template
→ Ready for you to write!
```

---

## 📂 File Naming Rules

### ✅ CORRECT:

```
2025-10-15.md  ← Year-Month-Day with dashes
2025-10-16.md
2025-10-17.md
```

### ❌ INCORRECT:

```
oct-15-2025.md     ← Wrong format
10-15-2025.md      ← Month first (US style)
15-10-2025.md      ← Day first (EU style)
2025_10_15.md      ← Underscores instead of dashes
20251015.md        ← No separators
```

### Why This Matters:

- Plugin recognizes YYYY-MM-DD.md format
- Files sort chronologically automatically
- Streaks calculate correctly
- Analytics work properly

---

## 💡 Common Workflows

### Workflow 1: Morning Planner

```
7:00 AM - Open app
        → Open today's note
        → Set 3 top priorities
        → Add time blocks
        → Save and close
        
Throughout day - Check off tasks

9:00 PM - Review what got done
        → Reflect on the day
        → Plan tomorrow
```

### Workflow 2: Evening Journaler

```
Throughout day - Collect thoughts mentally

9:00 PM - Open app
        → Open today's note  
        → Brain dump everything
        → Organize thoughts
        → Add gratitude
        → Save
```

### Workflow 3: Quick Capture All Day

```
Whenever something happens:
  → Open today's note
  → Add timestamped entry
  → Save
  
Example:
  **9:15 AM** - Meeting went well
  **2:30 PM** - Had a breakthrough idea
  **6:45 PM** - Finished the project!
```

---

## 🎨 Template Customization

### Want to Create Your Own Template?

1. **Write your ideal structure:**
   ```markdown
   # {{date}}
   
   ## My Custom Sections
   
   ### Work
   
   ### Personal
   
   ### Learning
   ```

2. **Save as reference file:**
   - Name it `_my-template.md`
   - Keep in Daily Notes folder
   - Copy when creating new notes

3. **OR use Template Manager:**
   - Go to Plugin Settings
   - Click "Manage Templates"
   - Click "Create Custom Template"
   - Give it a name
   - Paste your markdown
   - Save and select as active

---

## 🔍 Finding Old Notes

### By Date:

```
1. Go to Daily Notes folder
2. Scroll to the date you want
3. Files are sorted chronologically
4. Click to open
```

### By Search:

```
1. Use app's search function
2. Search for keywords you remember
3. Filter by "Daily Notes" folder
4. Results show matching notes
```

### By Month:

```
Daily Notes/
  2025-09-*.md  ← September notes
  2025-10-*.md  ← October notes
```

---

## ❓ Quick Troubleshooting

### "I don't see Daily Notes folder"

**Solution:**
```
1. Create it manually: /markdown/Daily Notes/
2. OR enable the plugin in Plugin Manager
3. OR restart the app
```

### "My streak isn't counting"

**Check:**
```
✓ Files are named YYYY-MM-DD.md
✓ Files are in Daily Notes folder
✓ No missing days between notes
✓ Weekend setting matches your habit
```

### "Auto-create not working"

**Check:**
```
✓ Plugin is enabled
✓ Setting is ON in plugin config
✓ Restart app
✓ Check browser console for errors
```

### "Templates don't work"

**Remember:**
```
Templates are just markdown text.
Just copy, paste, and replace {{date}} manually:
  {{date}} → 2025-10-15
  {{time}} → 7:30 PM
  {{day}} → Tuesday
```

---

## 📱 Mobile/Alternative Tips

### Using a Phone:

```
1. Access your notes folder directly
2. Create files with date names
3. Type/dictate your content
4. No keyboard shortcuts needed!
```

### Using Text Editor:

```
1. Navigate to /markdown/Daily Notes/
2. Create file: 2025-10-15.md
3. Copy template from this guide
4. Edit and save
```

---

## ✅ Success Checklist

Before you start journaling, make sure:

- [ ] Plugin is installed and enabled
- [ ] Daily Notes folder exists
- [ ] You know how to create a new note
- [ ] You've chosen a template to use
- [ ] Auto-create is enabled (optional but helpful)
- [ ] You understand the file naming (YYYY-MM-DD.md)
- [ ] You have this guide bookmarked!

---

## 🎯 Your First Week Challenge

### Day 1 (Today):
- [ ] Create today's note
- [ ] Add at least 3 sentences
- [ ] Save it

### Day 2-7:
- [ ] Create note each day
- [ ] Write something (any length!)
- [ ] Build your 7-day streak!

### End of Week:
- [ ] Review all 7 notes
- [ ] Count your streak (7!)
- [ ] Celebrate! 🎉

---

## 🌟 Remember:

> **Consistency beats perfection!**
> 
> Better to write 2 sentences every day
> than wait for the perfect moment.

### Start small:
- Day 1: Just the date and one thought
- Day 2: Add one goal
- Day 3: Add a reflection
- Day 4+: Expand naturally

The habit is more important than the length!

---

## 📚 Resources

- **Full Guide:** `DAILY_NOTES_ENHANCED_V3.md`
- **Quick Reference:** `DAILY_NOTES_QUICK_REFERENCE.md`
- **This Guide:** `HOW_TO_USE_DAILY_NOTES.md`

---

**You've got this! Start journaling today! 📝✨**

*Remember: No shortcuts needed - just create the file, paste a template, and start writing!*
