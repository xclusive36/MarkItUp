# User Guide

Complete guide to using MarkItUp PKM effectively for personal knowledge management.

## 🏁 Getting Started

### First Steps

1. **Open MarkItUp** in your browser at `http://localhost:3000`
2. **Create your first note** by clicking "Create New Note"
3. **Start writing** using Markdown syntax
4. **Connect ideas** with wikilinks `[[Note Name]]`
5. **Organize with tags** using `#tag` syntax

### The MarkItUp Interface

#### Main Navigation
- **📝 Editor**: Create and edit notes
- **🔍 Search**: Find notes and content  
- **📊 Graph**: Visualize connections
- **🏷️ Tags**: Browse by topic
- **📈 Analytics**: Track your progress
- **🧠 AI Assistant**: Get intelligent help
- **⚙️ Settings**: Configure preferences

#### Editor Modes
- **Edit**: Write and modify content
- **Preview**: See rendered markdown
- **Split**: Edit and preview side-by-side

## 📝 Writing and Editing

### Basic Markdown

MarkItUp supports standard Markdown syntax:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
~~Strikethrough~~

- Bullet list
- Second item
  - Nested item

1. Numbered list
2. Second item

[Link text](https://example.com)
![Image](image.jpg)

`Inline code`
```

### Advanced Markdown Features

#### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | More     |
| Row 2    | Data     | More     |
```

#### Task Lists
```markdown
- [x] Completed task
- [ ] Pending task
- [ ] Another task
```

#### Code Blocks
````markdown
```javascript
function hello() {
    console.log("Hello, world!");
}
```
````

### Math Equations

#### Inline Math
```markdown
The formula is $E = mc^2$ where...
```

#### Block Math
```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### Diagrams with TikZ

```markdown
```tikz
\begin{tikzpicture}
\draw (0,0) circle (1cm);
\draw (0,0) -- (1,0);
\end{tikzpicture}
```
```

## 🔗 Linking and Connections

### Wikilinks

Connect notes using double square brackets:

```markdown
This relates to [[My Other Note]] and builds on [[Previous Research]].
```

#### Wikilink Features
- **Auto-completion**: Type `[[` and get suggestions
- **Fuzzy matching**: Partial matches work
- **Broken link detection**: Visual indicators for missing notes
- **Alias support**: `[[Note Name|Display Text]]`

### Backlinks

View all notes that link to the current note:
- **Backlinks panel**: See incoming connections
- **Reference count**: Number of linking notes
- **Context preview**: See surrounding text

### Block References

Reference specific parts of notes:

```markdown
This important point: ^key-insight

Reference it elsewhere: [[Note Name#^key-insight]]
```

## 🏷️ Organization and Tags

### Tagging System

Use hashtags to organize content:

```markdown
This note covers #productivity and #knowledge-management.

#project/work-stuff
#idea/future-enhancement
```

#### Tag Features
- **Nested tags**: Use `/` for hierarchy
- **Tag suggestions**: Auto-complete as you type
- **Tag filtering**: Filter notes by tags
- **Tag analytics**: See tag usage statistics

### Frontmatter

Add structured metadata to notes:

```yaml
---
title: "Custom Title"
tags: [productivity, pkm, tools]
date: 2025-01-06
author: "Your Name"
project: "Knowledge Base"
status: "draft"
---
```

#### Supported Fields
- `title`: Custom note title
- `tags`: Array of tags
- `date`: Creation or modification date
- `author`: Note author
- `aliases`: Alternative names
- `cssclass`: Custom styling

### Folders and Structure

Organize notes in folders:
- **Virtual folders**: Based on metadata
- **Tag-based grouping**: Automatic organization
- **Search filters**: `folder:project` syntax
- **Hierarchical browsing**: Tree-like navigation

## 🔍 Search and Discovery

### Basic Search

Use the search bar to find content:
- **Full-text search**: Search note content
- **Title search**: Find by note names
- **Real-time results**: Instant search results
- **Highlighting**: Search terms highlighted

### Advanced Search Operators

#### Tag Search
```
tag:productivity
tag:project tag:work
```

#### Folder Search
```
folder:projects
folder:notes/drafts
```

#### Exact Phrases
```
"exact phrase here"
"machine learning algorithms"
```

#### Boolean Operators
```
productivity AND knowledge
(AI OR artificial) AND intelligence
NOT deprecated
```

#### Combined Searches
```
tag:research "neural networks" folder:ai
author:john tag:project NOT draft
```

### Search Results

#### Result Types
- **Content matches**: Text found in notes
- **Title matches**: Notes with matching titles
- **Tag matches**: Notes with matching tags
- **Metadata matches**: Frontmatter field matches

#### Result Features
- **Relevance ranking**: Best matches first
- **Context preview**: Surrounding text
- **Jump to match**: Click to open note
- **Filter options**: Refine results

## 📊 Knowledge Graph

### Graph Visualization

The graph view shows your knowledge network:
- **Nodes**: Represent individual notes
- **Edges**: Show connections between notes
- **Colors**: Indicate categories or folders
- **Size**: Reflects connection count

### Graph Interaction

#### Navigation
- **Click nodes**: Open notes
- **Drag nodes**: Rearrange layout
- **Zoom**: Mouse wheel or pinch
- **Pan**: Click and drag background

#### Filtering
- **Tag filter**: Show only tagged notes
- **Folder filter**: Filter by location
- **Connection strength**: Minimum links
- **Date range**: Recent notes only

### Graph Insights

#### Understanding Patterns
- **Hub notes**: Highly connected central topics
- **Clusters**: Related topic groups
- **Orphans**: Isolated notes
- **Bridges**: Notes connecting clusters

#### Graph Metrics
- **Total nodes**: Number of notes
- **Total connections**: Link count
- **Average degree**: Connections per note
- **Clustering coefficient**: Group density

## 🤖 AI-Powered Features

### AI Chat Assistant

Access the AI assistant via the brain icon (🧠):

#### Chat Features
- **Context-aware**: Understands your notes
- **Conversation history**: Maintains session
- **Multiple models**: GPT-3.5 to GPT-4
- **Custom prompts**: Tailored responses

#### Example Queries
```
"Summarize my notes about machine learning"
"Find connections between my project notes"
"Suggest tags for this note about productivity"
"Help me improve this paragraph"
```

### Writing Assistant

Get intelligent writing help:
- **Grammar checking**: Find errors
- **Style suggestions**: Improve clarity
- **Readability analysis**: Optimize for audience
- **Content expansion**: Develop ideas further

### Knowledge Discovery

AI-powered insights about your knowledge base:
- **Gap analysis**: Missing topics
- **Connection suggestions**: Link related ideas
- **Content recommendations**: What to write next
- **Orphan detection**: Isolated notes

### Research Assistant

Enhanced research capabilities:
- **Query expansion**: Better search terms
- **Topic exploration**: Related concepts
- **Source suggestions**: External references
- **Note generation**: AI-created content

## 🤝 Collaboration

### Enabling Collaboration

1. **Open collaboration settings**
2. **Toggle "Enable Collaboration"**
3. **Configure user profile**
4. **Share document links**

### Real-time Editing

#### Collaborative Features
- **Live editing**: See changes instantly
- **User cursors**: Track other users
- **Conflict resolution**: Automatic merging
- **Session management**: Control access

#### Best Practices
- **Communicate changes**: Use comments
- **Avoid simultaneous edits**: Coordinate sections
- **Save frequently**: Maintain synchronization
- **Use clear usernames**: Easy identification

### User Management

#### User Profiles
- **Display name**: How others see you
- **Avatar**: Visual identification
- **Color**: Cursor and highlight color
- **Status**: Active, away, or offline

#### Permissions
- **View only**: Read access
- **Edit**: Modify content
- **Admin**: Manage session
- **Owner**: Full control

## 🔌 Plugin System

### Installing Plugins

#### From Plugin Store
1. **Open plugin store** from main menu
2. **Browse available plugins**
3. **Click "Install"** on desired plugins
4. **Configure settings** as needed

#### Manual Installation
1. **Download plugin manifest** file
2. **Open plugin manager**
3. **Click "Install from file"**
4. **Select manifest file**

### Managing Plugins

#### Plugin Settings
- **Enable/disable**: Toggle plugin activity
- **Configure options**: Customize behavior
- **View permissions**: See access rights
- **Update plugins**: Get latest versions

#### Popular Plugins
- **Word Count**: Writing statistics
- **Export**: PDF/HTML export
- **Daily Notes**: Automatic daily journals
- **Table of Contents**: Generate TOCs
- **Backup**: Automatic backups

### Plugin Development

See the [Plugin Development Guide](PLUGIN_DEVELOPMENT.md) for creating custom plugins.

## 📱 Mobile Usage

### Mobile Interface

MarkItUp works on mobile devices:
- **Responsive design**: Adapts to screen size
- **Touch gestures**: Swipe and tap navigation
- **Mobile keyboard**: Optimized input
- **Offline support**: Work without internet

### Mobile Features

#### Touch Interactions
- **Tap to edit**: Start editing notes
- **Swipe gestures**: Navigate interface
- **Pinch to zoom**: Graph and preview
- **Pull to refresh**: Update content

#### Mobile Optimization
- **Condensed UI**: Space-efficient layout
- **Large touch targets**: Easy interaction
- **Readable fonts**: Optimized sizing
- **Quick actions**: Common tasks accessible

### Progressive Web App (PWA)

Install MarkItUp as a mobile app:
1. **Open in mobile browser**
2. **Tap "Add to Home Screen"**
3. **Access like native app**
4. **Offline functionality**

## ⚙️ Settings and Customization

### General Settings

#### Display Options
- **Theme**: Light, dark, or auto
- **Font family**: Choose typography
- **Font size**: Adjust readability
- **Line height**: Spacing preference

#### Editor Settings
- **Default mode**: Edit, preview, or split
- **Auto-save**: Frequency and behavior
- **Spell check**: Enable/disable
- **Word wrap**: Text wrapping options

### Advanced Settings

#### Performance
- **Graph rendering**: Node limits
- **Search indexing**: Update frequency
- **Memory usage**: Cache settings
- **Lazy loading**: Defer content loading

#### Privacy
- **Analytics**: Usage tracking
- **Crash reporting**: Error collection
- **Data sharing**: External services
- **Local storage**: Browser data

### Keyboard Shortcuts

#### Editor Shortcuts
- `Ctrl/Cmd + S`: Save note
- `Ctrl/Cmd + N`: New note
- `Ctrl/Cmd + F`: Find in note
- `Ctrl/Cmd + /`: Toggle preview

#### Navigation Shortcuts
- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + G`: Open graph
- `Ctrl/Cmd + T`: Open tags
- `Ctrl/Cmd + H`: Go home

#### Formatting Shortcuts
- `Ctrl/Cmd + B`: Bold text
- `Ctrl/Cmd + I`: Italic text
- `Ctrl/Cmd + L`: Insert link
- `Ctrl/Cmd + E`: Insert code

## 📈 Analytics and Insights

### Writing Analytics

Track your writing progress:
- **Daily word count**: Writing output
- **Note creation**: New content frequency
- **Editing patterns**: Modification times
- **Productivity metrics**: Writing velocity

### Knowledge Base Analytics

Understand your knowledge growth:
- **Note count**: Total notes created
- **Connection density**: Link frequency
- **Tag distribution**: Topic coverage
- **Growth patterns**: Knowledge evolution

### Usage Analytics

Monitor system usage:
- **Session duration**: Time spent writing
- **Feature usage**: Most-used functions
- **Search patterns**: Query frequency
- **Error rates**: System stability

## 🔄 Import and Export

### Importing Content

#### Supported Formats
- **Markdown files**: `.md` files
- **Text files**: `.txt` files
- **Obsidian vaults**: Direct import
- **Notion exports**: Page conversion

#### Import Process
1. **Select import source**
2. **Choose format options**
3. **Map metadata fields**
4. **Review and confirm**

### Exporting Content

#### Export Formats
- **Markdown**: Original format
- **HTML**: Web-ready format
- **PDF**: Print-ready documents
- **JSON**: Structured data

#### Export Options
- **Single notes**: Individual files
- **Bulk export**: Multiple notes
- **Filtered export**: Specific criteria
- **Archive export**: Complete backup

## 🛠️ Maintenance and Backup

### Data Backup

#### Automatic Backup
- **Schedule**: Regular intervals
- **Destination**: Local or cloud
- **Versioning**: Multiple snapshots
- **Restoration**: Easy recovery

#### Manual Backup
1. **Export all notes**
2. **Save configuration**
3. **Store safely**
4. **Document location**

### Maintenance Tasks

#### Regular Maintenance
- **Clear cache**: Free up space
- **Rebuild index**: Improve search
- **Check integrity**: Verify data
- **Update software**: Latest features

#### Troubleshooting
- **Performance issues**: Cache clearing
- **Search problems**: Index rebuild
- **Sync errors**: Connection check
- **Data corruption**: Backup restore

## 📚 Best Practices

### Note-Taking Strategies

#### Effective Note Structure
- **Clear titles**: Descriptive names
- **Consistent formatting**: Standard style
- **Logical hierarchy**: Organized headings
- **Rich metadata**: Useful frontmatter

#### Linking Strategies
- **Liberal linking**: Connect freely
- **Bidirectional thinking**: Two-way connections
- **Hub pages**: Central topic notes
- **Progressive summarization**: Layer insights

### Knowledge Management

#### Organizational Principles
- **Atomic notes**: One idea per note
- **Evergreen content**: Timeless insights
- **Regular review**: Revisit and refine
- **Incremental development**: Build gradually

#### Workflow Optimization
- **Daily capture**: Regular input
- **Weekly review**: Process and organize
- **Monthly analysis**: Identify patterns
- **Quarterly cleanup**: Maintain quality

---

**Next Steps**: Explore the [AI Features Guide](AI_FEATURES.md) to enhance your knowledge management with artificial intelligence.
