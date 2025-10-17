# Content Structurer & Analyzer - Quick Start Guide 🚀

**Plugin Version:** 3.0.0  
**Plugin ID:** `ai-content-structurer`  
**AI Required:** Yes (OpenAI, Anthropic, Gemini, or Ollama)

---

## ⚡ 5-Minute Quick Start

### 1. **Install & Enable**
- Plugin is pre-installed in MarkItUp
- Verify AI is configured (Brain icon → Settings)
- Plugin auto-loads when AI is available

### 2. **Try Your First Command**

**Have some messy text?**
```
1. Select a wall of text (100+ words without headings)
2. Command palette → "Break Wall of Text into Sections"
3. See instant structure with headings ✨
```

**Writing an essay?**
```
1. Open your essay
2. Run "Find Logical Flow Problems"
3. Get a flow score + specific issues to fix
```

---

## 🎯 Common Use Cases

### **"I Brain-Dumped My Thoughts"**

**Problem:** 2000 words of stream-of-consciousness  
**Solution:**
1. Select all text
2. "Break Wall of Text into Sections" → Adds structure
3. "Add Smart Headings" → Refines headings
4. "Improve Content Flow" → Optimizes order

**Result:** Organized document in 3 commands

---

### **"Is My Essay Any Good?"**

**Problem:** Need to check argument quality  
**Solution:**
1. "Find Logical Flow Problems" → Check structure
2. "Check Argument Strength" → Find weak points
3. "Find Redundant Sections" → Cut fluff

**Result:** Actionable feedback before submission

---

### **"I Need to Write a Paper"**

**Problem:** Have research notes, need academic paper  
**Solution:**
1. Enable "Academic Mode" in settings
2. "Convert to Academic Structure" → Instant template
3. "Find Citation Gaps" → Know what to cite

**Result:** Proper paper structure with citation markers

---

### **"My Bullets Need Paragraphs"** (Classic v2.0)

**Problem:** Have outline, need full text  
**Solution:**
1. Select bullet points
2. `Cmd+Shift+E` (or "Expand Selected Bullet Points")
3. Preview → Accept

**Result:** Full paragraphs from bullets

---

## 🎛️ Key Settings

### **Recommended for Most Users**
```
Analysis Depth: Standard
Academic Mode: Off (unless writing papers)
Detect Redundancy: On
Suggest Transitions: On
Show Preview: On
```

### **For Academic Writing**
```
Analysis Depth: Deep
Academic Mode: On
Target Readability: Advanced
Check Arguments: On
```

### **For Quick Feedback**
```
Analysis Depth: Quick
Show Preview: Off (trust the AI)
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Command |
|----------|---------|
| `Cmd+Shift+E` | Expand Selected Bullet Points |
| `Cmd+Shift+M` | Expand More (add detail) |
| `Cmd+Shift+B` | Compress to Bullet Points |
| `Cmd+Shift+H` | View History (undo) |

*All other commands via Command Palette*

---

## 📊 Understanding Analysis Reports

### **Flow Analysis**
```
Flow Score: 68/100
├─ 🔴 High Priority Issues (fix first)
├─ 🟡 Medium Priority Issues
└─ 🟢 Low Priority Issues (polish)
```

**Good Score:** 75+  
**Needs Work:** Below 60

### **Argument Strength**
```
Argument Strength: 72/100
├─ Claims without evidence
├─ Logical fallacies detected
└─ Weak supporting points
```

**Strong:** 80+  
**Needs Support:** Below 65

---

## 🔄 Workflows

### **Academic Paper Workflow**
```
1. Brain dump research notes
2. "Convert to Academic Structure"
3. Fill in sections
4. "Find Citation Gaps"
5. Add citations
6. "Check Argument Strength"
7. Strengthen weak points
8. "Find Logical Flow Problems"
9. Final polish
```

### **Blog Post Workflow**
```
1. Write stream-of-consciousness
2. "Create Outline from Narrative" (see structure)
3. Or "Break Wall of Text into Sections" (keep prose)
4. "Find Redundant Sections"
5. "Improve Content Flow"
6. "Add Smart Headings" (refine)
```

### **Note Organization Workflow**
```
1. Have messy PKM note
2. "Break Wall of Text into Sections"
3. "Add Smart Headings"
4. Link to other notes (use Link Suggester plugin)
5. Tag appropriately
```

---

## 💡 Pro Tips

### **1. Use Preview Mode**
Always preview changes before accepting. You can edit the AI's output before applying.

### **2. Combine Commands**
- Break into sections → Add headings → Improve flow
- Find flow issues → Fix manually → Check arguments

### **3. Enable History**
Keep history enabled so you can undo any transformation.

### **4. Academic Mode**
Only enable when actually writing academic papers. It's stricter.

### **5. Quick Scan First**
Use "Quick" analysis depth for fast feedback, "Deep" for final review.

---

## 🎓 Command Reference

### **Structure Analysis** (Find Problems)
| Command | What It Does | When to Use |
|---------|-------------|-------------|
| Find Logical Flow Problems | Detects awkward transitions | Essay feels disjointed |
| Check Argument Strength | Finds weak reasoning | Persuasive writing |
| Find Citation Gaps | Identifies uncited claims | Academic writing |

### **Content Restructuring** (Fix Problems)
| Command | What It Does | When to Use |
|---------|-------------|-------------|
| Break into Sections | Adds structure to walls of text | Brain dump organization |
| Add Smart Headings | Suggests heading placement | Document has no headings |
| Improve Content Flow | Reorders for better logic | Ideas are in wrong order |
| Find Redundant Sections | Detects repetition | Document feels repetitive |

### **Transformations** (Change Format)
| Command | What It Does | When to Use |
|---------|-------------|-------------|
| Create Outline from Narrative | Narrative → Outline | Extract structure |
| Convert to Academic Structure | Notes → Academic paper | Research paper prep |
| Expand Bullet Points | Bullets → Paragraphs | Outline to prose |
| Compress to Bullet Points | Paragraphs → Bullets | Simplify content |

---

## ❓ Troubleshooting

### **"AI service not configured"**
- Click Brain icon (🧠) in header
- Go to Settings
- Add OpenAI, Anthropic, Gemini, or Ollama API key

### **"No suggestions found"**
- Try "Deep Analysis" instead of "Quick"
- Make sure document has enough content (100+ words)
- Some well-structured documents don't need fixes!

### **"Changes didn't apply"**
- Check if you accepted in preview
- Try "View History" to see if it's there
- Content may have been manually edited since

### **"Takes too long"**
- Use "Quick" analysis for faster results
- Large documents (5000+ words) take longer
- Consider analyzing sections separately

---

## 🆚 When to Use What

### **Flow Problems vs Redundancy**
- **Flow:** Order is wrong, transitions missing
- **Redundancy:** Same idea repeated multiple times

### **Break into Sections vs Add Headings**
- **Break:** Has no structure at all
- **Add Headings:** Has paragraphs but no headings

### **Expand vs Improve Flow**
- **Expand:** Need more detail/length
- **Improve Flow:** Restructure existing content

---

## 🎉 Success Stories

### **"Turned My Mess into a B+ Essay"**
> "I had 1500 words of thoughts. Ran Break into Sections, then Check Arguments. Fixed 3 major flow issues and 2 weak claims. Got a B+ instead of my usual C+."

### **"Academic Paper in 3 Hours**
> "Had 20 pages of research notes. Convert to Academic ran the structure, Find Citation Gaps showed me what to cite. Saved me a full day."

### **"Finally Organized My PKM**
> "500 notes with no structure. Batch processed them with Break into Sections. Now I can actually find things."

---

## 📚 Learn More

- **Full Feature List:** See `CONTENT_STRUCTURER_V3_CHANGELOG.md`
- **Implementation Details:** See `CONTENT_STRUCTURER_PIVOT.md`
- **AI Setup:** See `docs/AI_FEATURES.md`

---

**Ready to structure your thoughts? Start with "Break Wall of Text into Sections"** 🚀

*Part of MarkItUp PKM - Making knowledge management intelligent*
