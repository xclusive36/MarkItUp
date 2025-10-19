# Spaced Repetition Plugin - Testing Checklist

## Phase 2 AI Features Testing

**Version:** 1.1.0  
**Date:** October 18, 2025  
**Tester:** ___________

---

## 🚀 Pre-Testing Setup

### 1. Start the Application
```bash
npm run dev
```

### 2. Configure AI Provider
- [ ] Go to Settings
- [ ] Configure at least one AI provider (OpenAI, Anthropic, Gemini, or Ollama)
- [ ] Verify API key is valid
- [ ] Test with simple prompt to confirm AI is working

### 3. Enable Plugin
- [ ] Open Plugin Manager
- [ ] Find "🎓 Spaced Repetition" in Learning category
- [ ] Enable the plugin
- [ ] Verify keyboard shortcuts are registered

---

## 🧪 Test Suite

### Test 1: AI Generation from Selection

**Setup:**
1. Create or open a note with substantial content
2. Add this test paragraph:
```
The photosynthesis process converts light energy into chemical energy. 
Chloroplasts contain chlorophyll, which captures sunlight. 
Plants produce glucose and oxygen as byproducts of this reaction.
```

**Test Steps:**
- [ ] Select the paragraph above
- [ ] Press `Cmd+Shift+G` (or use Command Palette: "Generate Flashcards from Selection")
- [ ] Wait for AI response (5-10 seconds)

**Expected Results:**
- [ ] AI generates 3-5 flashcards
- [ ] Cards inserted below selection
- [ ] Each card has `Q: ... A: ... #flashcard` format
- [ ] Cards are relevant to selected content
- [ ] No duplicate cards
- [ ] Notification shows success message

**Quality Check:**
- [ ] Questions are clear and specific
- [ ] Answers are accurate and complete
- [ ] One concept per card (atomic)
- [ ] Questions test understanding, not just recall

**Notes:**
```
Provider used: ___________
Cards generated: ___
Quality (1-5): ___
Issues: 
```

---

### Test 2: AI Generation from Full Note

**Setup:**
1. Create a new note called "Test Note - Biology"
2. Add this content:
```markdown
# Cell Biology Overview

## Mitochondria
- Known as the powerhouse of the cell
- Produces ATP through cellular respiration
- Has its own DNA (inherited from mother)

## Cell Membrane
- Semi-permeable barrier
- Controls what enters and exits the cell
- Made of phospholipid bilayer

## Nucleus
- Contains genetic material (DNA)
- Controls cell activities
- Surrounded by nuclear envelope
```

**Test Steps:**
- [ ] Make sure cursor is in the note (no selection)
- [ ] Press `Cmd+Alt+G` (or Command Palette: "Generate Flashcards from Note")
- [ ] Wait for AI response (10-20 seconds)

**Expected Results:**
- [ ] AI generates 5-10 flashcards
- [ ] Cards inserted at end of note under "## 🎓 Generated Flashcards"
- [ ] Cards cover all three sections (mitochondria, membrane, nucleus)
- [ ] Tagged with `#flashcard/ai-generated`
- [ ] Comprehensive coverage of key concepts
- [ ] Success notification appears

**Quality Check:**
- [ ] Balanced coverage across all topics
- [ ] Mix of fact-recall and concept questions
- [ ] No redundant questions
- [ ] Answers match note content

**Notes:**
```
Provider used: ___________
Cards generated: ___
Coverage (1-5): ___
Issues:
```

---

### Test 3: AI Answer Completion

**Setup:**
1. Create a note with incomplete flashcards:
```markdown
# Quick Capture

Q: What is the capital of France? #flashcard

Q: Who wrote "1984"? #flashcard

Q: What is the speed of light? #flashcard
```

**Test Steps:**
- [ ] Open the note with incomplete cards
- [ ] Run Command Palette: "Complete Flashcard Answers"
- [ ] Wait for AI to complete answers

**Expected Results:**
- [ ] AI fills in all three answers
- [ ] Format updated to `Q: ... A: ... #flashcard`
- [ ] Answers are accurate
- [ ] Original questions unchanged
- [ ] Success notification shows count of completed cards

**Quality Check:**
- [ ] France → Paris ✓
- [ ] 1984 → George Orwell ✓
- [ ] Speed of light → ~299,792 km/s ✓

**Notes:**
```
Provider used: ___________
Cards completed: ___
Accuracy (1-5): ___
Issues:
```

---

### Test 4: Flashcard Indexing

**Test Steps:**
- [ ] After generating cards (from Tests 1-3), press `Cmd+Shift+F`
- [ ] Or use Command Palette: "Index Flashcards"
- [ ] Wait for indexing to complete

**Expected Results:**
- [ ] Notification shows "Indexed X flashcards from Y notes"
- [ ] Count matches generated cards
- [ ] No errors in console

**Check IndexedDB:**
- [ ] Open DevTools → Application → IndexedDB
- [ ] Find `spaced-repetition-db` database
- [ ] Check `flashcards` store
- [ ] Verify cards are stored with correct data

**Notes:**
```
Cards indexed: ___
Database size: ___
Issues:
```

---

### Test 5: Review Workflow

**Test Steps:**
- [ ] Press `Cmd+Shift+R` to start review
- [ ] Or use Command Palette: "Start Review Session"

**Expected Results:**
- [ ] Review interface opens as modal
- [ ] First card shows question only
- [ ] "Show Answer" button visible
- [ ] Card shows source note name

**Interaction Test:**
- [ ] Click "Show Answer" (or press Space)
- [ ] Answer reveals with animation
- [ ] Four rating buttons appear: Again, Hard, Good, Easy
- [ ] Click "Good" (or press 3)
- [ ] Next card appears
- [ ] Review at least 5 cards

**Quality Check:**
- [ ] Animations smooth
- [ ] Keyboard shortcuts work (Space, 1-4, Esc)
- [ ] Progress counter updates
- [ ] Cards from all sources appear
- [ ] No UI glitches or errors

**Notes:**
```
Cards reviewed: ___
UI experience (1-5): ___
Issues:
```

---

### Test 6: Statistics Dashboard

**Test Steps:**
- [ ] After reviewing cards, press `Cmd+Shift+S`
- [ ] Or use Command Palette: "Show Statistics"

**Expected Results:**
- [ ] Statistics modal opens
- [ ] Shows total cards count
- [ ] Shows review count
- [ ] Shows retention rate
- [ ] Displays card state distribution (New/Learning/Review/Mature)
- [ ] Shows current streak
- [ ] Visual charts render correctly

**Quality Check:**
- [ ] Numbers match reviewed cards
- [ ] Retention rate reasonable (0-100%)
- [ ] Charts are readable
- [ ] No NaN or infinity values

**Notes:**
```
Total cards: ___
Retention rate: ___%
Issues:
```

---

### Test 7: Multi-Provider Testing

**If you have multiple AI providers configured:**

**Test Steps:**
- [ ] Test generation with OpenAI (if configured)
- [ ] Test generation with Anthropic (if configured)
- [ ] Test generation with Gemini (if configured)
- [ ] Test generation with Ollama (if configured)

**Compare:**
- [ ] Generation speed
- [ ] Card quality
- [ ] Format consistency
- [ ] Error handling

**Notes:**
```
Best quality: ___________
Fastest: ___________
Most reliable: ___________
```

---

### Test 8: Error Handling

**Test Steps:**

**No AI Configured:**
- [ ] Disable all AI providers in settings
- [ ] Try `Cmd+Shift+G`
- [ ] Should show warning: "AI not configured..."

**No Selection:**
- [ ] Don't select any text
- [ ] Try `Cmd+Shift+G`
- [ ] Should show warning about no selection

**Empty Note:**
- [ ] Create empty note
- [ ] Try `Cmd+Alt+G`
- [ ] Should handle gracefully

**No Incomplete Cards:**
- [ ] Run "Complete Answers" on note with all complete cards
- [ ] Should show "No incomplete flashcards found"

**Quality Check:**
- [ ] All errors show helpful messages
- [ ] No crashes or console errors
- [ ] User can recover gracefully

**Notes:**
```
Error messages clear: Yes/No
Any crashes: Yes/No
Issues:
```

---

### Test 9: Edge Cases

**Long Content:**
- [ ] Generate from 1000+ word note
- [ ] Verify AI handles length gracefully
- [ ] Check card quality maintained

**Special Characters:**
- [ ] Test with content containing: `*, _, #, [, ]`
- [ ] Verify parsing works correctly
- [ ] Check flashcards format properly

**Multiple Tags:**
- [ ] Generate cards with custom subtags like `#flashcard/biology/cells`
- [ ] Verify tags preserved

**Existing Flashcards:**
- [ ] Generate cards in note that already has manual flashcards
- [ ] Verify no conflicts
- [ ] Both sets work independently

**Notes:**
```
Issues found:
```

---

### Test 10: End-to-End Workflow

**Complete Learning Flow:**

1. **Capture:**
   - [ ] Read some educational content
   - [ ] Take notes in MarkItUp
   - [ ] Select key sections

2. **Generate:**
   - [ ] Use `Cmd+Shift+G` on selections
   - [ ] Review AI-generated cards
   - [ ] Edit any cards if needed

3. **Index:**
   - [ ] Run `Cmd+Shift+F` to index all cards

4. **Study:**
   - [ ] Start review with `Cmd+Shift+R`
   - [ ] Complete full review session
   - [ ] Rate cards honestly

5. **Track:**
   - [ ] Check stats with `Cmd+Shift+S`
   - [ ] Verify progress tracked

6. **Repeat:**
   - [ ] Come back tomorrow
   - [ ] Review due cards

**Overall Experience:**
- [ ] Workflow feels natural
- [ ] No friction points
- [ ] Value proposition clear
- [ ] Would use regularly

**Notes:**
```
Overall satisfaction (1-5): ___
Biggest pain point: 
Favorite feature:
Improvement suggestions:
```

---

## 🐛 Bug Report Template

If you find any bugs, document them here:

### Bug #1
- **Title:** 
- **Severity:** Critical / High / Medium / Low
- **Steps to Reproduce:**
  1. 
  2. 
  3. 
- **Expected:** 
- **Actual:** 
- **Console Errors:** 
- **Screenshots:** 

---

## 📊 Test Summary

**Date Completed:** ___________  
**Time Spent:** ___ minutes  
**Tests Passed:** ___ / 10  
**Bugs Found:** ___  
**Overall Status:** ✅ Pass / ⚠️ Issues Found / ❌ Fail

**Ready for Phase 3?** Yes / No / With Fixes

**Priority Fixes Needed:**
1. 
2. 
3. 

**Recommendations:**
```

```

---

## 🎯 Next Steps After Testing

### If Tests Pass (✅):
- Move to Phase 2.5 (Polish & Settings UI)
- Or jump to Phase 3 (Advanced Formats)

### If Issues Found (⚠️):
- Document all bugs
- Prioritize critical fixes
- Create fix plan

### If Critical Failures (❌):
- Stop and debug
- Review AI integration
- Check error logs
