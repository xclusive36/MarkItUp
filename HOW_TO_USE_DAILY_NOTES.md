# How to Use Daily Notes Plugin (Without Keyboard Shortcuts)

## 📚 Overview

The Daily Notes plugin creates automatic daily journal entries with templates, streak tracking, and analytics. Since keyboard shortcuts don't work for you, here's how to use all the features through the UI.

---

## 🚀 Getting Started

### Step 1: Install the Plugin

1. **Navigate to Plugin Manager**
   - Go to your app at `http://localhost:3000`
   - Look for a "Plugins" or "Plugin Manager" link in the navigation/header
   - OR go directly to `http://localhost:3000/plugin-manager`

2. **Find Daily Notes Enhanced**
   - Look for "Daily Notes Enhanced" in the plugin list
   - It should show version 3.0.0

3. **Install/Enable**
   - Click the "Install" or "Enable" button
   - The plugin will activate automatically

---

## 📝 Creating Daily Notes (Manual Method)

Since shortcuts don't work, you can create daily notes manually:

### Method 1: Create Via File System

1. **Navigate to the markdown folder**
   - Your notes are stored in `/markdown/Daily Notes/`

2. **Create a new file**
   - Name it with today's date in format: `YYYY-MM-DD.md`
   - Example: `2025-10-15.md`

3. **Add content using a template**
   - Copy one of the templates below (see Template section)
   - The plugin will recognize it as a daily note

### Method 2: Use Command Palette (If Available)

1. **Open Command Palette**
   - Look for a search/command bar (usually Ctrl+K or Cmd+K)
   - OR check for a "Commands" menu item

2. **Search for Daily Notes commands:**
   - Type "daily" or "today"
   - Look for these commands:
     - "Open Today's Note"
     - "Open Yesterday's Note"
     - "Quick Capture to Today"
     - "Show Current Streak"

3. **Click to execute**
   - Selecting a command will run it

### Method 3: Direct File Creation

1. **Use the file creation UI**
   - Click "New Note" or "Create File" button
   - Set the folder to "Daily Notes"
   - Name the file with today's date: `2025-10-15.md`

2. **Paste your chosen template**
   - See templates below

---

## 📋 Available Templates

### 1. Default Journal Template

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

### 2. Minimal Template

```markdown
# 2025-10-15

```

### 3. Productivity Template

```markdown
# 2025-10-15 - Tuesday

## 🎯 Top 3 Priorities
1. [ ] 
2. [ ] 
3. [ ] 

## ⏰ Time Blocks
- 09:00 - 10:00: 
- 10:00 - 12:00: 
- 13:00 - 15:00: 
- 15:00 - 17:00: 

## ✅ Completed Tasks
- [ ] 

## 📝 Notes & Ideas


## 💡 Learnings
- 

---
Energy Level: ⚪⚪⚪⚪⚪
Created: 7:30 PM
```

### 4. Gratitude Journal Template

```markdown
# 2025-10-15 - Tuesday

## 🙏 Three Things I'm Grateful For
1. 
2. 
3. 

## ✨ Positive Moments Today


## 💪 Personal Wins
- 

## 🌱 Growth & Learning


## 💭 Evening Reflection


---
Mood: 😊
Created: 7:30 PM
```

### 5. Developer Log Template

```markdown
# 2025-10-15 - Development Log

## 💻 Projects Worked On
- 

## ✅ Completed
- [ ] 

## 🐛 Bugs Fixed
- 

## 🎯 In Progress
- [ ] 

## 🚧 Blockers


## 💡 Learnings & Discoveries


## 🔗 Resources
- 

## 📋 Tomorrow's Plan
- [ ] 

---
Commits: 0 | PRs: 0 | Code Reviews: 0
Created: 7:30 PM
```

### 6. Writer's Journal Template

```markdown
# 2025-10-15

## ✍️ Writing Session
**Words Written:** 0
**Time Spent:** 
**Projects:** 

## 📖 What I Wrote Today


## 💡 Story Ideas & Inspiration


## 📝 Character Development


## 🎯 Tomorrow's Writing Goals
- [ ] 

## 📚 Reading Notes


---
Total Words This Week: 0
Created: 7:30 PM
```

### 7. Wellness Tracker Template

```markdown
# 2025-10-15 - Wellness Log

## 🏃 Physical Activity
- **Exercise:** 
- **Duration:** 
- **Steps:** 

## 🥗 Nutrition
- **Breakfast:** 
- **Lunch:** 
- **Dinner:** 
- **Water:** 💧💧💧💧💧💧💧💧

## 😴 Sleep
- **Hours:** 
- **Quality:** ⭐⭐⭐⭐⭐

## 🧘 Mental Health
- **Mood:** 😊
- **Stress Level:** ⚪⚪⚪⚪⚪
- **Meditation/Mindfulness:** 

## 💭 Notes


---
Energy: ⚡⚡⚡⚡⚡
Created: 7:30 PM
```

---

## 🎯 Daily Workflow (Without Shortcuts)

### Morning Routine

1. **Open your notes app** (http://localhost:3000)
2. **Navigate to Daily Notes folder**
3. **Check if today's note exists**
   - Look for `2025-10-15.md` (or current date)
4. **If not, create it:**
   - Click "New Note"
   - Name it with today's date
   - Paste your preferred template
5. **Fill in your morning sections:**
   - Today's Goals
   - Priorities
   - Time blocks

### Throughout the Day

**Quick Capture (Without Shortcut):**

1. **Open today's note** (e.g., `2025-10-15.md`)
2. **Scroll to your "Notes" section**
3. **Add a timestamp manually:**
   ```markdown
   **3:45 PM** - Had a great idea for the project...
   ```
4. **Save the note**

### Evening Routine

1. **Open today's note**
2. **Fill in reflection sections:**
   - What went well
   - What could improve
   - Completed tasks
   - Tomorrow's priorities
3. **Save the note**

---

## 📊 Viewing Your Streak & Analytics

### Checking Your Streak

The plugin tracks your streak automatically based on consecutive daily notes.

**To check your streak:**

1. **Count consecutive files** in your Daily Notes folder:
   - Each file named `YYYY-MM-DD.md` counts as a day
   - Count backwards from today to see your streak

2. **Use Command Palette** (if available):
   - Search for "Show Current Streak"
   - Click to see your streak count

### Viewing Analytics

**Manual Method:**
- Look at your Daily Notes folder
- Count total notes
- Observe patterns (which days you journal most)

**If UI is available:**
- Look for an "Analytics" or "Dashboard" view in the plugin settings
- The `DailyNotesDashboard` component shows:
  - Current & longest streaks
  - Total notes
  - Most productive days
  - Monthly trends

---

## 📅 Using the Calendar View

If the calendar UI is integrated:

1. **Find the calendar view:**
   - Look for a calendar icon in the sidebar
   - OR search "calendar" in command palette
   - OR check plugin settings for "Show Calendar"

2. **Navigate months:**
   - Click arrow buttons to go forward/back
   - Click "Today" to jump to current month

3. **Click a date:**
   - Green dates = note exists
   - Gray dates = no note
   - Clicking opens/creates the note for that day

---

## 🔧 Plugin Settings

To configure the Daily Notes plugin:

1. **Go to Plugin Manager**
   - Navigate to plugin settings/configuration area

2. **Find Daily Notes Enhanced settings**

3. **Available Settings:**

   - **Active Template** 
     - Choose which template to use
     - Options: default, minimal, productivity, gratitude, developer, writer, wellness

   - **Daily Notes Folder**
     - Where notes are stored (default: "Daily Notes")

   - **Auto-create Daily Note**
     - Create note automatically on app startup
     - Recommended: Enable this!

   - **Create Weekend Notes**
     - Include Saturday/Sunday
     - Your choice based on journaling habits

   - **Link Consecutive Days**
     - Add navigation links between days
     - Creates [[Previous]] | [[Next]] links

   - **Show Streak Badge**
     - Display streak in header/UI

   - **Daily Reminder Time**
     - Time for notifications (e.g., "09:00")

   - **Enable Analytics**
     - Track patterns and show insights

---

## 💡 Pro Tips (Without Shortcuts)

### 1. Bookmark Your Daily Notes Folder
- Add `/markdown/Daily Notes/` to your file browser favorites
- Quick access every time

### 2. Create a Template File
- Save your favorite template as `_template.md`
- Copy/paste when creating new daily notes

### 3. Use Date-Based Naming
- Always use `YYYY-MM-DD.md` format
- Makes sorting automatic
- Plugin recognizes these as daily notes

### 4. Link Between Notes
- Add links manually: `[[2025-10-14]]` (yesterday)
- Add links manually: `[[2025-10-16]]` (tomorrow)
- Creates a daily note chain

### 5. Set Up Auto-Creation
- Enable "Auto-create Daily Note" in settings
- App creates today's note when you open it
- One less step each morning!

### 6. Review Weekly
- Every Sunday/Monday, browse your notes
- Look for patterns
- Copy incomplete tasks to new week

### 7. Add Tags
- Use tags for themes: `#work` `#personal` `#learning`
- Easier to find notes later

### 8. Keep It Simple
- Don't stress about perfection
- Some days will be minimal, others detailed
- The habit matters more than length

---

## 🗂️ File Organization

Your daily notes are stored like this:

```
markdown/
  Daily Notes/
    2025-10-13.md
    2025-10-14.md
    2025-10-15.md  ← Today
    2025-10-16.md
```

**Tips:**
- One file per day
- Named with ISO date format (YYYY-MM-DD)
- All in the "Daily Notes" folder
- Automatically sorted chronologically

---

## 🎨 Customizing Templates

Want to create your own template?

1. **Write your ideal daily note structure**
2. **Save it as a separate file** (e.g., `my-template.md`)
3. **Copy/paste when creating new daily notes**

**OR use the Template Manager** (if available in UI):
- Navigate to Plugin Settings
- Click "Template Manager"
- Click "Create Custom Template"
- Give it a name and description
- Paste your markdown
- Save and select as active template

---

## ❓ Troubleshooting

### "I created a note but the plugin doesn't recognize it"

**Check:**
- File is in `/markdown/Daily Notes/` folder
- File name format is exactly `YYYY-MM-DD.md`
- Example: `2025-10-15.md` ✅
- Not: `oct-15-2025.md` ❌
- Not: `10-15-2025.md` ❌

### "Auto-create isn't working"

**Solutions:**
- Check plugin is enabled in Plugin Manager
- Verify "Auto-create Daily Note" setting is ON
- Restart the app
- Check console for errors

### "I don't see my streak"

**The streak calculates automatically:**
- Based on consecutive files in Daily Notes folder
- Weekends may not count (depending on settings)
- Check "Create Weekend Notes" setting

### "Can't find the Command Palette"

**Alternative:**
- Create notes manually through file system
- Use the file creation UI
- Navigate to Daily Notes folder directly

### "Templates don't have variables replaced"

**Manual replacement:**
- Replace `{{date}}` with actual date: `2025-10-15`
- Replace `{{time}}` with actual time: `7:30 PM`
- Replace `{{day}}` with day of week: `Tuesday`

---

## 🎯 Quick Reference

| Task | How To Do It (No Shortcuts) |
|------|------------------------------|
| **Create today's note** | 1. Go to Daily Notes folder<br>2. Click "New Note"<br>3. Name it `YYYY-MM-DD.md`<br>4. Paste template |
| **Open yesterday's note** | 1. Go to Daily Notes folder<br>2. Click on yesterday's date file |
| **Quick capture** | 1. Open today's note<br>2. Add content<br>3. Save |
| **View streak** | 1. Count consecutive files<br>OR use Command Palette "Show Streak" |
| **Change template** | 1. Go to Plugin Settings<br>2. Select different template |
| **View all daily notes** | Navigate to `/markdown/Daily Notes/` folder |

---

## 📱 Mobile/Alternative Access

If using a mobile device or alternative interface:

1. **Access your files directly** at `/markdown/Daily Notes/`
2. **Create/edit using any text editor**
3. **Name files with date format**: `YYYY-MM-DD.md`
4. **Copy template from this guide**

---

## 🎉 You're Ready!

The Daily Notes plugin works great even without keyboard shortcuts. The key is:

1. ✅ **Consistent file naming** (`YYYY-MM-DD.md`)
2. ✅ **Store in Daily Notes folder**
3. ✅ **Use templates for structure**
4. ✅ **Enable auto-creation in settings**
5. ✅ **Build the daily habit**

Start with the **Default Template** and customize as you go. Even a few lines per day builds an amazing personal archive over time!

---

**Happy Journaling! 📝✨**

*Need help? Check the plugin settings or refer to the full documentation in `DAILY_NOTES_ENHANCED_V3.md`*
