# Content Outliner → Content Structurer Pivot Plan 🎯

**Date:** October 16, 2025  
**Current Version:** 2.0.0 (Content Outliner & Expander)  
**Target Version:** 3.0.0 (Content Structurer & Analyzer)  
**Status:** 🚀 In Progress

---

## 🎭 The Pivot Strategy

### Why Pivot Instead of New Plugin?

1. ✅ **80% infrastructure reuse** - All React components, settings, history system already built
2. ✅ **Proven foundation** - v2.0 is stable and well-architected
3. ✅ **User continuity** - Existing features preserved, just enhanced
4. ✅ **Faster delivery** - 1-2 weeks vs 3-4 weeks for new plugin
5. ✅ **Lower risk** - Building on tested codebase

### What Changes?

| Aspect | Before (v2.0) | After (v3.0) |
|--------|---------------|--------------|
| **Name** | Content Outliner & Expander | Content Structurer & Analyzer |
| **ID** | `ai-content-outliner-expander` | `ai-content-structurer` |
| **Focus** | Expand/compress content | Analyze and restructure content |
| **Commands** | 8 commands (expansion-focused) | 14+ commands (structure-focused) |
| **Use Case** | Outliner-first writers | Everyone who writes |
| **Value Prop** | Transform bullets ↔ paragraphs | Organize and improve any content |

---

## 🎯 Feature Roadmap

### ✅ **PRESERVED Features (v2.0)**
All existing functionality stays - these are proven and working:

1. ✨ **Expand Selected Bullet Points** - Convert bullets to paragraphs
2. 🔍 **Expand More (Progressive)** - Add depth to expanded content
3. 📄 **Expand This Section** - Section-by-section expansion
4. 📝 **Generate Draft from Outline** - Full document generation
5. 📝 **Compress to Bullet Points** - Paragraphs back to bullets
6. 📊 **Suggest Structure Improvements** - AI structure analysis
7. 📜 **View Expansion History** - Undo functionality
8. 🔄 **Batch Expand All Sections** - Bulk operations

**Why keep them?** They work, users may use them, and they're already built.

---

### 🆕 **NEW Features (v3.0)**

#### **Category 1: Deep Structure Analysis** 🔍

##### 1. **Analyze Document Structure** (Enhanced)
*Upgrade existing `suggest-structure-improvements`*

**Current:** Basic structure suggestions with categories  
**New:** Comprehensive analysis with scoring

```typescript
NEW CAPABILITIES:
- Coherence Score (0-100): Measures logical flow
- Readability Score: Grade level, complexity
- Structure Health: Sections, headings, balance
- Missing Elements: Intro, conclusion, transitions
- Redundancy Detection: Duplicate ideas
- Argument Strength: For persuasive/academic writing
```

**Output Format:**
```
📊 DOCUMENT HEALTH: 72/100

Structure Analysis:
✅ Clear heading hierarchy (H1 → H2 → H3)
⚠️ Section 3 too long (800 words) - suggest split
❌ Missing conclusion
⚠️ Weak transition between sections 2 and 3

Coherence Score: 68/100
- Ideas flow logically in sections 1-2
- Section 3 introduces unrelated concept
- Recommend reordering or bridge paragraph

Readability: Grade 11 (target: Grade 8-10 for general audience)
```

##### 2. **Find Logical Flow Problems** (NEW)
*Command: `find-flow-issues`*

**Purpose:** Identify where document doesn't flow smoothly

```typescript
DETECTS:
- Abrupt topic changes
- Missing transitions
- Ideas in wrong order
- Disconnected paragraphs
- Circular arguments
```

**Example Output:**
```
🔀 Flow Issues Detected (4):

1. HIGH PRIORITY: Line 45 → 67
   "Discussion of costs jumps to technical specs without transition"
   Suggest: Add bridge paragraph explaining relationship

2. MEDIUM: Lines 120-135
   "Three paragraphs repeat same point about user experience"
   Suggest: Merge into single, stronger paragraph

3. LOW: Line 89
   "Conclusion mentioned before all points presented"
   Suggest: Move to end or rephrase as preview
```

##### 3. **Check Argument Strength** (NEW)
*Command: `analyze-arguments`*

**Purpose:** Find weak reasoning, missing evidence, logical fallacies

```typescript
ANALYZES:
- Claims without evidence
- Logical fallacies (ad hominem, straw man, etc.)
- Weak supporting points
- Missing counterarguments
- Bias indicators
```

**Use Cases:**
- Essays and persuasive writing
- Research papers
- Blog posts making claims
- Technical proposals

---

#### **Category 2: Content Restructuring** 🔀

##### 4. **Break Wall of Text into Sections** (NEW)
*Command: `break-into-sections`*

**Problem Solved:** User dumps brain into 2000-word paragraph

**What It Does:**
1. Analyzes content for topic shifts
2. Suggests logical section breaks
3. Proposes heading names
4. Shows preview of restructured content

**Before:**
```markdown
In this article I want to talk about many things related to PKM 
systems and how they work and why they're important. First of all 
we need to understand that PKM stands for Personal Knowledge 
Management and it's a methodology for... [continues for 2000 words]
```

**After:**
```markdown
## Introduction to PKM Systems

In this article, we'll explore Personal Knowledge Management (PKM) 
systems and their importance in modern knowledge work.

## What is PKM?

PKM stands for Personal Knowledge Management - a methodology for...

## Why PKM Matters

The importance of PKM systems has grown significantly because...

## Core Components

A robust PKM system typically includes...
```

##### 5. **Add Smart Headings** (NEW)
*Command: `suggest-headings`*

**Purpose:** Automatically detect topic changes and suggest H2/H3 headings

**Algorithm:**
1. Semantic analysis of paragraphs
2. Detect topic shifts
3. Generate descriptive headings
4. Maintain hierarchy (H1 → H2 → H3)

##### 6. **Improve Content Flow** (NEW)
*Command: `improve-flow`*

**Purpose:** Restructure content for better logical progression

**Actions:**
- Reorder paragraphs for better flow
- Add transition sentences
- Group related ideas
- Move tangents to appendix/footnotes

**Example:**
```
🔄 Flow Improvements Suggested:

1. Move paragraph 5 after paragraph 2
   Reason: Introduces concept needed earlier

2. Add transition: "Building on this foundation..."
   Between: Section 2 → Section 3

3. Move aside: "Technical note about performance"
   To: Footnote or sidebar
```

##### 7. **Find and Merge Redundant Sections** (NEW)
*Command: `find-redundancy`*

**Purpose:** Detect repeated ideas and suggest consolidation

**Detects:**
- Same point made multiple times
- Overlapping sections
- Duplicate examples
- Circular explanations

---

#### **Category 3: Reverse Transformations** 🔄

##### 8. **Structured Outline from Narrative** (NEW)
*Command: `create-outline-from-text`*

**Opposite of expansion** - Take stream-of-consciousness and organize it

**Before (Narrative):**
```markdown
So I was thinking about how users interact with our system and 
I realized there are several key patterns. Some users prefer the 
command palette while others like clicking. We should support both...
```

**After (Outline):**
```markdown
## User Interaction Patterns

### Discovery Methods
- Command palette users (keyboard-first)
- Visual navigation users (click-first)
- Hybrid approach users

### Design Implications
- Must support both paradigms
- Keyboard shortcuts for all actions
- Clear visual affordances

### Recommendations
- Default to visual mode for new users
- Teach command palette progressively
- Analytics to track preference distribution
```

##### 9. **Academic Structure Converter** (NEW)
*Command: `convert-to-academic`*

**Purpose:** Restructure casual notes into academic format

**Transforms:**
```
Casual Notes → Academic Paper Structure
- Random thoughts → Introduction
- Ideas → Literature Review
- Observations → Methodology
- Results → Findings
- Thoughts → Discussion
- Wrap-up → Conclusion
```

**Adds:**
- Abstract placeholder
- Proper section headings
- Citation placeholders [?]
- Figure/table references

---

#### **Category 4: Academic & Research Support** 🎓

##### 10. **Find Citation Gaps** (NEW)
*Command: `find-citation-needs`*

**Purpose:** Identify claims that need citations

**Detects:**
- Factual claims without sources
- Statistics without attribution
- Quotes without references
- Controversial statements needing support

**Output:**
```
📚 Citation Needs (7):

1. Line 23: "85% of users prefer dark mode"
   → Needs source for statistic

2. Line 67: "Research shows that..."
   → Vague reference, needs specific citation

3. Line 103: Direct quote appears uncited
   → Add author and year
```

##### 11. **Academic Structure Analyzer** (NEW)
*Setting: Enable Academic Mode*

**When enabled, structure analysis checks for:**
- Abstract quality
- Introduction completeness
- Literature review depth
- Methodology clarity
- Results/discussion separation
- Conclusion strength
- References formatting

---

## 🎨 New Settings (v3.0)

Add to existing settings:

```typescript
NEW SETTINGS:
{
  id: 'analysis-depth',
  name: 'Structure Analysis Depth',
  type: 'select',
  options: [
    { label: 'Quick Scan', value: 'quick' },
    { label: 'Standard Analysis', value: 'standard' },
    { label: 'Deep Analysis', value: 'deep' },
  ],
  default: 'standard',
  description: 'How thoroughly to analyze document structure'
},
{
  id: 'academic-mode',
  name: 'Academic Mode',
  type: 'boolean',
  default: false,
  description: 'Enable academic paper structure checking and citation analysis'
},
{
  id: 'target-readability',
  name: 'Target Readability Level',
  type: 'select',
  options: [
    { label: 'Grade 6-8 (General Public)', value: 'simple' },
    { label: 'Grade 9-12 (High School)', value: 'standard' },
    { label: 'College Level', value: 'advanced' },
    { label: 'Academic/Professional', value: 'expert' },
  ],
  default: 'standard',
  description: 'Target audience reading level for analysis'
},
{
  id: 'check-arguments',
  name: 'Argument Analysis',
  type: 'boolean',
  default: false,
  description: 'Analyze logical reasoning and argument strength'
},
{
  id: 'detect-redundancy',
  name: 'Detect Redundancy',
  type: 'boolean',
  default: true,
  description: 'Flag repeated ideas and duplicate content'
},
{
  id: 'suggest-transitions',
  name: 'Suggest Transitions',
  type: 'boolean',
  default: true,
  description: 'Recommend transition sentences between sections'
},
```

---

## 🏗️ Implementation Phases

### **Phase 1: Rebrand & Prepare** (Day 1)
- [x] Create this migration plan
- [ ] Update plugin manifest (ID, name, version, description)
- [ ] Update file names if needed
- [ ] Update all documentation comments
- [ ] Create changelog for v3.0

### **Phase 2: New Commands - Structure Analysis** (Days 2-3)
- [ ] Implement `find-flow-issues` command
- [ ] Implement `analyze-arguments` command
- [ ] Implement `find-citation-needs` command
- [ ] Enhance existing `suggest-structure-improvements`

### **Phase 3: New Commands - Restructuring** (Days 4-5)
- [ ] Implement `break-into-sections` command
- [ ] Implement `suggest-headings` command
- [ ] Implement `improve-flow` command
- [ ] Implement `find-redundancy` command

### **Phase 4: Reverse Transformations** (Days 6-7)
- [ ] Implement `create-outline-from-text` command
- [ ] Implement `convert-to-academic` command
- [ ] Add academic mode toggle

### **Phase 5: Settings & Polish** (Days 8-9)
- [ ] Add new settings
- [ ] Update settings UI
- [ ] Enhance notifications with new metrics
- [ ] Test all features

### **Phase 6: Documentation & Launch** (Day 10)
- [ ] Write comprehensive user guide
- [ ] Create example documents
- [ ] Update README to feature new plugin
- [ ] Create migration notes for v2.0 users
- [ ] Add to docs/PLUGIN_SYSTEM.md

---

## 📊 Success Metrics

### **How we'll know this pivot worked:**

1. **Usage Increase**
   - Target: 5x more command invocations per user
   - Tracking: Analytics on command usage

2. **Feature Adoption**
   - v2.0: Most used was "expand bullets" (~70% of usage)
   - v3.0: Goal is 50%+ usage on new structure commands

3. **Documentation Presence**
   - Add to README.md feature list
   - Featured in docs/AI_FEATURES.md
   - Mentioned in docs/USER_GUIDE.md

4. **User Feedback**
   - "This helped me organize my thoughts"
   - "Fixed my essay structure"
   - "Found gaps I didn't notice"

---

## 🎯 Key Differentiators

### **Why Content Structurer > Content Outliner**

| Old (Outliner) | New (Structurer) |
|----------------|------------------|
| Outliner-first workflow | Any writing workflow |
| Expand bullets → paragraphs | Analyze and fix any content |
| Niche use case | Universal need |
| Replaces what AI chat can do | Does what AI chat can't |
| Linear transformation | Intelligent reorganization |
| 8 commands | 14+ commands |

---

## 🚀 Launch Positioning

### **Marketing Message:**

> **Content Structurer & Analyzer v3.0**
> 
> Your AI writing partner for organizing and refining content. Whether you're 
> writing an essay, research paper, blog post, or documentation, Content Structurer 
> helps you:
> 
> - 📊 **Analyze** document structure and find flow problems
> - 🔀 **Restructure** content for better organization
> - 💪 **Strengthen** arguments and identify gaps
> - 🎓 **Academic support** for papers and research
> - ✨ **Transform** between outlines and narratives
> 
> Everyone can write. Not everyone can organize their thoughts.
> That's what we're here for.

---

## 📝 Migration Notes for v2.0 Users

**What stays the same:**
- All your existing commands work exactly as before
- Settings are preserved
- History is maintained
- Keyboard shortcuts unchanged

**What's new:**
- 6+ new commands for structure analysis
- Enhanced structure suggestions with scoring
- Academic mode for research writing
- Better flow detection
- Argument analysis tools

**What's renamed:**
- Plugin name (functionality identical)
- Plugin ID in settings (auto-migrated)

---

## 🎉 Expected Impact

**From this pivot, we expect:**

1. **Higher adoption** - Universal need vs niche workflow
2. **Featured placement** - In README and main docs
3. **Differentiation** - Unique capability vs AI chat
4. **User retention** - Tool they use daily, not occasionally
5. **Ecosystem value** - Complements Link Suggester as second "power plugin"

---

**Next Step:** Begin Phase 1 - Rebrand and prepare the codebase.

Let's make this happen! 🚀
