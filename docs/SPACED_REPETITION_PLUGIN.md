# Spaced Repetition Plugin Documentation

## 🎓 Overview

The Spaced Repetition plugin brings powerful flashcard-based learning to MarkItUp using the scientifically-proven FSRS (Free Spaced Repetition Scheduler) algorithm. Transform your notes into an effective learning system that optimizes long-term retention.

## ✨ Features

### Core Features
- **FSRS Algorithm** - State-of-the-art spaced repetition scheduling
- **Markdown-Native** - Create flashcards directly in your notes with `#flashcard` tags
- **Block References** - Support for `^block-id` granular referencing
- **Auto-Detection** - Automatically finds flashcards when indexing notes
- **Review Interface** - Beautiful, intuitive card review UI
- **Statistics Dashboard** - Track learning progress and retention
- **Keyboard Shortcuts** - Fast workflow with Cmd+Shift+F/R/S
- **Context Preservation** - Shows surrounding content during review

### Advanced Features
- **Multiple Card States** - New, Learning, Review, Relearning
- **Smart Scheduling** - Optimal intervals based on your performance
- **Retention Tracking** - Monitor your learning effectiveness
- **Streak Counting** - Gamify your learning with daily streaks
- **Session Statistics** - Review performance summaries
- **Auto-Indexing** - Optional automatic flashcard detection on save

## 🚀 Quick Start

### 1. Enable the Plugin

1. Go to **Settings** → **Plugins**
2. Find **Spaced Repetition (Flashcards)**
3. Click **Enable**

### 2. Create Your First Flashcard

Add this to any note:

```markdown
Q: What is the capital of France? A: Paris #flashcard
```

### 3. Index Your Notes

Press **Cmd+Shift+F** or run command **"Index Current Note for Flashcards"**

### 4. Start Reviewing

Press **Cmd+Shift+R** or run command **"Start Flashcard Review"**

### 5. Track Progress

Press **Cmd+Shift+S** or run command **"Show Flashcard Statistics"**

## 📝 Creating Flashcards

### Basic Q&A Format

The simplest and most explicit format:

```markdown
Q: What algorithm does FSRS stand for? A: Free Spaced Repetition Scheduler #flashcard
```

**Advantages:**
- Clear and unambiguous
- Easy to parse
- No AI generation needed

### Subtags for Organization

Organize cards by topic:

```markdown
Q: What is React? A: A JavaScript library for building UIs #flashcard/programming

Q: What is photosynthesis? A: Process plants use to convert sunlight to energy #flashcard/biology
```

Browse cards by subtag during review!

### Block-Referenced Flashcards

Link to specific blocks in your notes:

```markdown
The Pythagorean theorem states that a² + b² = c². #flashcard ^pythagorean-theorem

See [[Math Notes#^pythagorean-theorem]] for the full explanation.
```

### Multi-line Flashcards

For complex answers:

```markdown
Q: What are the SOLID principles?
A:
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion
#flashcard/design-patterns
```

### Context-Rich Cards

The plugin automatically captures surrounding text for context:

```markdown
## Quantum Mechanics

Quantum mechanics describes nature at the smallest scales. Key concepts include:

Q: What is wave-particle duality? A: The concept that particles exhibit both wave and particle properties #flashcard/physics

This principle was demonstrated by the double-slit experiment.
```

During review, you'll see the heading and surrounding paragraphs!

## 🎯 The FSRS Algorithm

### What is FSRS?

FSRS (Free Spaced Repetition Scheduler) is a modern, scientifically-validated algorithm that:

- Predicts memory stability and retrievability
- Calculates optimal review intervals
- Adapts to your individual learning patterns
- Outperforms traditional SM-2 algorithm (used in Anki before v23)

### Card States

**🆕 New** - Never reviewed before
- First review available immediately
- Moved to Learning after first review

**📚 Learning** - Recently introduced
- Short intervals (minutes to days)
- Requires multiple successful reviews

**✅ Review** - Successfully learned
- Long intervals (days to months)
- Mature cards

**🔄 Relearning** - Forgotten and being relearned
- Shorter intervals than Review
- Returns to Review after successful reviews

### Rating System

After seeing the answer, rate how well you remembered:

**1 - Again** (Red)
- Completely forgot
- Card resets to Learning/Relearning
- Very short interval (< 10 minutes)

**2 - Hard** (Orange)
- Struggled to remember
- Shorter interval than normal
- Card difficulty increases

**3 - Good** (Green)
- Remembered correctly
- Standard interval increase
- Most common rating

**4 - Easy** (Blue)
- Instantly recalled
- Longer interval than normal
- Card difficulty decreases

### Scheduling Parameters

The algorithm tracks these metrics per card:

- **Stability** - How long the memory lasts
- **Difficulty** - Intrinsic card difficulty (1-10)
- **Retrievability** - Current recall probability
- **Interval** - Days until next review
- **Lapses** - Times forgotten
- **Reps** - Total reviews

## ⌨️ Keyboard Shortcuts

### Global Commands

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Cmd+Shift+F` | Index Current Note | Scan note for flashcards |
| `Cmd+Shift+R` | Start Review | Open review interface |
| `Cmd+Shift+S` | Show Statistics | View learning stats |

### During Review

| Key | Action |
|-----|--------|
| `Space` | Show Answer |
| `1` | Rate: Again (forgot) |
| `2` | Rate: Hard (struggled) |
| `3` | Rate: Good (correct) |
| `4` | Rate: Easy (instant) |
| `Esc` | Close review |

## 📊 Statistics Dashboard

The statistics dashboard shows:

### Key Metrics
- **Total Cards** - All flashcards in database
- **Due Today** - Cards scheduled for today
- **Retention Rate** - % of cards passed (last 30 days)
- **Streak** - Consecutive days reviewed

### Card States Distribution
- Visual breakdown by state (New, Learning, Review, Relearning)
- Progress bars showing proportions

### Additional Details
- **Average Ease** - Average difficulty (inverse)
- **Total Reviews** - Lifetime review count
- **Last Review** - Most recent review date

## ⚙️ Settings

### Auto-Index on Save
**Default:** `true`

Automatically detect and index flashcards when saving notes.

- **Enabled**: New flashcards indexed automatically
- **Disabled**: Manual indexing required (Cmd+Shift+F)

### Daily Review Limit
**Default:** `20`

Maximum number of cards to review per day.

- Prevents overwhelming review sessions
- Balances learning and retention

### New Cards Per Day
**Default:** `10`

Maximum new cards introduced per day.

- Controls learning pace
- Prevents information overload

### Target Retention Rate
**Default:** `90%`

Target percentage of correct recalls.

- Affects interval calculations
- Higher = shorter intervals (more reviews)
- Lower = longer intervals (fewer reviews)

### Show Context in Review
**Default:** `true`

Display surrounding note content during review.

- Helps with contextual learning
- Useful for complex topics
- Can be toggled if distracting

## 🎯 Best Practices

### Creating Effective Flashcards

**1. Atomic Concepts**
❌ Bad: `Q: What are OOP and FP? A: Object-Oriented and Functional Programming`
✅ Good: Two separate cards for each concept

**2. Clear Questions**
❌ Bad: `Q: What about React? A: It's a library`
✅ Good: `Q: What is React? A: A JavaScript library for building UIs`

**3. Use Context**
Link related notes with [[wikilinks]] and ^block-ids

**4. Consistent Formatting**
Use Q: A: format for clarity and reliable parsing

**5. Organize with Subtags**
`#flashcard/topic` groups related cards

### Review Strategies

**Daily Routine**
- Review at the same time daily
- Start with due cards, then new cards
- Aim for your daily limits (don't overdo it)

**Rating Honestly**
- **Again** - Only if you truly forgot
- **Hard** - If you struggled or hesitated
- **Good** - Your default for correct recalls
- **Easy** - Only if instant and effortless

**Managing Difficulty**
- Difficult cards appear more frequently
- Easy cards space out quickly
- The algorithm adapts to you

**Maintaining Streaks**
- Review at least one card daily
- Short sessions are better than skipping
- Use statistics to track progress

## 📱 Workflow Examples

### For Students

```markdown
# Biology - Cell Structure

Q: What is the powerhouse of the cell? A: Mitochondria #flashcard/biology

Q: What organelle handles protein synthesis? A: Ribosomes #flashcard/biology

Q: What is the function of the cell membrane? A: Controls what enters and leaves the cell #flashcard/biology
```

**Workflow:**
1. Create flashcards during lectures/reading
2. Index notes after class (Cmd+Shift+F)
3. Review daily (Cmd+Shift+R)
4. Track progress weekly (Cmd+Shift+S)

### For Developers

```markdown
# React Hooks

Q: What does useState return? A: An array with [state, setState] #flashcard/react

Q: When does useEffect run? A: After every render by default (unless deps specified) #flashcard/react

Q: What's the difference between useMemo and useCallback? A: useMemo memoizes values, useCallback memoizes functions #flashcard/react
```

**Workflow:**
1. Add flashcards while learning new tech
2. Auto-index on save (enable in settings)
3. Review during coffee breaks
4. Focus on subtags for specific topics

### For Language Learning

```markdown
# French Vocabulary

Q: Comment allez-vous? A: How are you? #flashcard/french

Q: Merci beaucoup A: Thank you very much #flashcard/french

Q: Où est la bibliothèque? A: Where is the library? #flashcard/french
```

**Workflow:**
1. Create cards from study materials
2. Review multiple times daily (short sessions)
3. Track retention rate for improvement
4. Combine with [[Pronunciation Notes]]

## 🔧 Troubleshooting

### Flashcards Not Detected

**Problem:** Indexed but no cards found

**Solutions:**
- Check `#flashcard` tag is present
- Ensure Q: and A: format is correct (colon + space)
- Try manual indexing (Cmd+Shift+F)
- Check browser console for errors

### Reviews Not Scheduling

**Problem:** Cards not appearing when due

**Solutions:**
- Check Statistics Dashboard (are there due cards?)
- Verify cards aren't in "New" state (need first review)
- Clear browser cache and re-index
- Check daily limits in settings

### Poor Retention Rate

**Problem:** Forgetting too many cards

**Solutions:**
- Review more honestly (use "Hard" when struggling)
- Create simpler, more atomic cards
- Add more context to complex cards
- Review daily for consistency
- Lower target retention rate (easier intervals)

### Database Issues

**Problem:** Data not persisting

**Solutions:**
- Check browser supports IndexedDB
- Clear site data and re-index
- Export cards before clearing (coming soon)
- Disable incognito/private mode

## 🚀 Advanced Usage

### Integration with AI Features

Use MarkItUp's AI providers to:

**Generate Flashcards:**
```markdown
[[Note Content]]

AI: Generate flashcards from this content #flashcard/ai-generated
```

**Improve Cards:**
Ask AI to:
- Simplify complex questions
- Add context to answers
- Create cloze deletions
- Generate related cards

### Bulk Operations

**Index All Notes:**
Run "Index All Notes for Flashcards" command

**Benefits:**
- Import existing notes as flashcards
- Quickly build large decks
- Find cards you forgot to tag

**Note:** This may take time for large vaults (100+ notes)

### Block References Deep Dive

**Why use ^block-ids:**
- Precise references to specific content
- Navigate directly from flashcard to source
- Update source without breaking references

**Example:**
```markdown
# Main Note

Key concept here. ^key-concept

# Flashcard Note

Q: What's the key concept? A: See [[Main Note#^key-concept]] #flashcard
```

## 📈 Performance & Limits

**Tested Limits:**
- 10,000+ cards indexed successfully
- 100+ cards reviewed per session
- Minimal performance impact on note rendering
- IndexedDB storage: ~50MB typical usage

**Recommendations:**
- Keep daily limits reasonable (20-30 cards)
- Index notes incrementally, not all at once
- Use subtags for large decks (easier filtering)
- Regular reviews better than cramming

## 🔮 Coming Soon

### Planned Features
- **Cloze Deletions** - `The {capital} of France is Paris`
- **Image Flashcards** - Visual learning support
- **Deck Export/Import** - Share flashcard sets
- **Mobile Optimization** - Touch-friendly review interface
- **Study Mode** - Focus on specific subtags
- **Heatmap Visualization** - Review calendar
- **Card Editing** - Modify flashcards without note editing
- **AI Generation** - Auto-create cards from notes
- **Spaced Repetition Presets** - Different algorithms (SM-2, FSRS-5)

### Community Requests
Vote on features in [GitHub Discussions](https://github.com/xclusive36/MarkItUp/discussions)

## 🆘 Support

**Found a bug?**
- Check console for errors (F12 → Console)
- Open GitHub issue with reproduction steps
- Include browser and MarkItUp version

**Need help?**
- See [Flashcard Examples.md](../markdown/Flashcard%20Examples.md)
- Ask in GitHub Discussions
- Check plugin settings for misconfigurations

**Feature requests:**
- Open GitHub issue with [Feature Request] tag
- Describe use case and benefits
- Vote on existing requests

## 📚 Further Reading

**FSRS Algorithm:**
- [FSRS GitHub](https://github.com/open-spaced-repetition/fsrs4anki)
- [Research Paper](https://www.nature.com/articles/s41539-024-00249-3)
- [Algorithm Comparison](https://github.com/open-spaced-repetition/fsrs-vs-sm17)

**Spaced Repetition Science:**
- [Forgetting Curve](https://en.wikipedia.org/wiki/Forgetting_curve)
- [Spacing Effect](https://en.wikipedia.org/wiki/Spacing_effect)
- [Testing Effect](https://en.wikipedia.org/wiki/Testing_effect)

**Related Tools:**
- [Anki](https://apps.ankiweb.net/) - Popular SRS software
- [SuperMemo](https://www.supermemo.com/) - Original SRS system
- [RemNote](https://www.remnote.com/) - Note-taking with SRS

---

**Version:** 1.0.0  
**Last Updated:** October 18, 2025  
**Plugin ID:** spaced-repetition

Built with ❤️ for the MarkItUp community
