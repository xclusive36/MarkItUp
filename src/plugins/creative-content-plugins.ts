import { PluginManifest } from '../lib/types';

// Story Planner Plugin - Character development and plot outlines
export const storyPlannerPlugin: PluginManifest = {
  id: 'story-planner',
  name: 'Story Planner',
  version: '1.0.0',
  description: 'Character development sheets, plot outline templates, and world-building tools',
  author: 'MarkItUp Team',
  main: 'story-planner.js',
  
  commands: [
    {
      id: 'create-character',
      name: 'Create Character',
      description: 'Create character development sheet',
      callback: async () => {
        const name = prompt('Character name:');
        const role = prompt('Role (protagonist/antagonist/supporting):');
        
        if (name) {
          const character = `# Character Profile: ${name}

## Basic Information
**Name:** ${name}  
**Role:** ${role || 'Character'}  
**Age:** [Age]  
**Gender:** [Gender]  
**Occupation:** [Job/Role in story]

## Physical Description
**Height:** [Height]  
**Build:** [Physical build]  
**Hair:** [Hair color and style]  
**Eyes:** [Eye color]  
**Distinguishing Features:** [Scars, tattoos, etc.]

## Personality
### Core Traits
- [Trait 1]
- [Trait 2] 
- [Trait 3]

### Strengths
- [Strength 1]
- [Strength 2]

### Weaknesses/Flaws
- [Flaw 1]
- [Flaw 2]

### Fears
- [Fear 1]
- [Fear 2]

## Background
### Family & Relationships
**Parents:** [Parents' info]  
**Siblings:** [Siblings' info]  
**Romantic Interest:** [Love interest]  
**Friends:** [Close friends]  
**Enemies:** [Antagonists]

### History
**Childhood:** [Formative experiences]  
**Education:** [Educational background]  
**Career:** [Professional history]  
**Trauma:** [Significant negative events]

## Character Arc
### Starting Point
[How the character begins the story]

### Character Growth
[How they change throughout the story]

### Resolution
[Where they end up]

## Dialogue Style
### Speech Patterns
[How they speak - formal/casual/dialect]

### Catchphrases
- "[Catchphrase 1]"
- "[Catchphrase 2]"

## Goals and Motivations
### Primary Goal
[What they want most]

### Internal Motivation
[Why they want it]

### External Obstacles
[What stands in their way]

## Role in Plot
### Function
[Their purpose in the story]

### Key Scenes
- [Important scene 1]
- [Important scene 2]

## Notes
[Additional character notes and ideas]
`;
          console.log('Character profile:', character);
        }
      }
    },
    {
      id: 'plot-outline',
      name: 'Plot Outline',
      description: 'Create story plot outline',
      callback: async () => {
        const title = prompt('Story title:');
        const genre = prompt('Genre:');
        
        if (title) {
          const outline = `# Plot Outline: ${title}

**Genre:** ${genre || '[Genre]'}  
**Target Length:** [Word count/page count]  
**Target Audience:** [Age group/demographic]

## Story Premise
**Logline:** [One sentence summary]  
**Hook:** [What draws readers in]  
**Theme:** [Central message/idea]

## Three-Act Structure

### Act I: Setup (25%)
#### Opening Scene
- **Setting:** [Time and place]
- **Characters Introduced:** [Main characters]
- **Inciting Incident:** [Event that starts the story]

#### Plot Point 1
[Event that launches the main story]

### Act II: Confrontation (50%)
#### Rising Action
- **Obstacle 1:** [First major challenge]
- **Obstacle 2:** [Second major challenge]
- **Subplot A:** [Secondary storyline]
- **Subplot B:** [Secondary storyline]

#### Midpoint
[Major revelation or turning point]

#### Plot Point 2
[Crisis that leads to climax]

### Act III: Resolution (25%)
#### Climax
[The big confrontation/moment of truth]

#### Falling Action
[Immediate aftermath of climax]

#### Resolution
[How conflicts are resolved]

## Character Arcs
### Protagonist Arc
- **Starting Point:** [Initial state]
- **Change:** [How they grow]
- **End Point:** [Final state]

### Antagonist Arc
- **Motivation:** [Why they oppose protagonist]
- **Methods:** [How they create conflict]
- **Fate:** [What happens to them]

## Key Scenes
1. **Opening Scene:** [Brief description]
2. **Inciting Incident:** [Brief description]
3. **First Plot Point:** [Brief description]
4. **Midpoint:** [Brief description]
5. **Second Plot Point:** [Brief description]
6. **Climax:** [Brief description]
7. **Resolution:** [Brief description]

## Subplots
### Subplot A: [Title]
- **Purpose:** [Why this subplot exists]
- **Characters:** [Who's involved]
- **Resolution:** [How it ends]

## World-Building Notes
### Setting Details
- **Time Period:** [When the story takes place]
- **Location:** [Where the story happens]
- **Society:** [Social structure/rules]
- **Technology Level:** [Available technology]

### Rules of the World
- [Rule 1]
- [Rule 2]
- [Rule 3]

## Research Notes
- [Research topic 1]
- [Research topic 2]

## Writing Schedule
- **Start Date:** [When you'll begin writing]
- **Target Completion:** [When you want to finish]
- **Daily/Weekly Goal:** [Words per day/week]
`;
          console.log('Plot outline:', outline);
        }
      }
    },
    {
      id: 'world-building',
      name: 'World Building',
      description: 'Create world-building template',
      callback: async () => {
        const worldName = prompt('World/Setting name:');
        
        if (worldName) {
          const world = `# World-Building: ${worldName}

## Geography
### Physical Features
- **Climate:** [Overall climate patterns]
- **Terrain:** [Mountains, forests, deserts, etc.]
- **Bodies of Water:** [Oceans, rivers, lakes]
- **Natural Resources:** [What the land provides]

### Regions/Locations
#### [Region 1 Name]
- **Description:** [What it looks like]
- **Climate:** [Local weather patterns]
- **Population:** [Who lives there]
- **Government:** [How it's ruled]
- **Culture:** [Local customs]

#### [Region 2 Name]
- **Description:** [What it looks like]
- **Climate:** [Local weather patterns]
- **Population:** [Who lives there]
- **Government:** [How it's ruled]
- **Culture:** [Local customs]

## History
### Timeline
- **[Year/Era]:** [Major historical event]
- **[Year/Era]:** [Major historical event]
- **[Year/Era]:** [Major historical event]

### Significant Events
#### [Event Name]
- **When:** [Time period]
- **What Happened:** [Description]
- **Impact:** [How it shaped the world]

## Societies and Cultures
### [Culture/Society Name]
- **Values:** [What they prize]
- **Customs:** [Important traditions]
- **Social Structure:** [Class system]
- **Religion:** [Beliefs and practices]
- **Technology Level:** [Advancement level]
- **Language:** [How they communicate]

## Magic/Supernatural Elements
### Magic System
- **How Magic Works:** [Rules and limitations]
- **Who Can Use Magic:** [Requirements]
- **Cost of Magic:** [What it costs to use]
- **Types of Magic:** [Different categories]

### Supernatural Beings
#### [Being Type]
- **Appearance:** [What they look like]
- **Abilities:** [What they can do]
- **Behavior:** [How they act]
- **Relationship with Humans:** [Friendly/hostile]

## Technology and Economy
### Technology Level
[Overall advancement - medieval, modern, futuristic]

### Transportation
[How people and goods move around]

### Communication
[How information travels]

### Currency and Trade
- **Currency:** [What they use for money]
- **Major Exports:** [What regions trade]
- **Trade Routes:** [Important commercial paths]

## Politics and Government
### [Government Type]
- **Structure:** [How it's organized]
- **Leaders:** [Who's in charge]
- **Laws:** [Important rules]
- **Military:** [Armed forces]

### Conflicts
#### [Conflict Name]
- **Parties Involved:** [Who's fighting]
- **Cause:** [Why they're fighting]
- **Status:** [Current state]

## Daily Life
### Common People
- **Typical Day:** [How ordinary people live]
- **Food:** [What they eat]
- **Housing:** [Where they live]
- **Work:** [Common occupations]
- **Entertainment:** [How they have fun]

## Languages
### [Language Name]
- **Speakers:** [Who speaks it]
- **Writing System:** [How it's written]
- **Sample Phrases:** [Common words/phrases]

## Religion and Mythology
### [Religion Name]
- **Deities:** [Gods/goddesses]
- **Beliefs:** [Core tenets]
- **Practices:** [Rituals and ceremonies]
- **Clergy:** [Religious leaders]
- **Holy Sites:** [Important locations]

## Flora and Fauna
### Unique Species
#### [Species Name]
- **Description:** [What it looks like]
- **Habitat:** [Where it lives]
- **Behavior:** [How it acts]
- **Uses:** [How people interact with it]

## Notes and Ideas
[Additional thoughts and concepts]
`;
          console.log('World-building template:', world);
        }
      }
    }
  ],

  onLoad: async () => {
    console.log('Story Planner plugin loaded');
  }
};

// Screenplay Format Plugin - Industry-standard formatting
export const screenplayFormatPlugin: PluginManifest = {
  id: 'screenplay-format',
  name: 'Screenplay Format',
  version: '1.0.0',
  description: 'Industry-standard screenplay formatting with character dialogue tracking',
  author: 'MarkItUp Team',
  main: 'screenplay-format.js',
  
  commands: [
    {
      id: 'create-screenplay',
      name: 'Create Screenplay',
      description: 'Create screenplay template',
      callback: async () => {
        const title = prompt('Screenplay title:');
        const author = prompt('Author name:');
        
        if (title) {
          const screenplay = `# ${title}

**Written by**  
${author || '[Author Name]'}

---

FADE IN:

EXT. [LOCATION] - [TIME OF DAY]

[Action/description of the scene. Keep it concise and visual. Only describe what the camera can see.]

CHARACTER NAME
(direction/parenthetical)
This is how dialogue is formatted. Keep it natural and character-specific.

CHARACTER NAME (CONT'D)
Use (CONT'D) when the same character continues speaking after action or direction.

[More action description.]

ANOTHER CHARACTER
(excited)
Dialogue should reveal character and advance the plot. Avoid exposition dumps.

INT. [DIFFERENT LOCATION] - [TIME]

[New scene description.]

CHARACTER NAME (O.S.)
O.S. means "off screen" - the character is present but not visible.

CHARACTER NAME (V.O.)
V.O. means "voice over" - narration or internal thoughts.

FADE OUT.

THE END

---

## Screenplay Formatting Guidelines

### Scene Headers (Sluglines)
- Always start with INT. or EXT.
- Include location and time of day
- Examples: INT. COFFEE SHOP - DAY
            EXT. CITY STREET - NIGHT

### Character Names
- Always in ALL CAPS when introducing
- Centered above dialogue
- Consistent throughout script

### Dialogue
- Centered under character name
- Natural and character-specific
- Avoid long monologues

### Action Lines
- Left-aligned
- Present tense
- Only what camera sees
- Keep concise

### Parentheticals
- Use sparingly
- Only for important direction
- Examples: (whispers), (angry), (to John)

### Page Count Rule
- 1 page ≈ 1 minute of screen time
- Feature films: 90-120 pages
- Short films: 5-30 pages

## Character List
- [Character 1]: [Brief description]
- [Character 2]: [Brief description]
- [Character 3]: [Brief description]

## Logline
[One sentence summary of the story]

## Synopsis
[One paragraph summary of the plot]
`;
          console.log('Screenplay template:', screenplay);
        }
      }
    }
  ],

  onLoad: async () => {
    console.log('Screenplay Format plugin loaded');
  }
};

// Poetry Tools Plugin - Rhyme schemes and poetry forms
export const poetryToolsPlugin: PluginManifest = {
  id: 'poetry-tools',
  name: 'Poetry Tools',
  version: '1.0.0',
  description: 'Rhyme scheme helpers, meter analysis, and poetry form templates',
  author: 'MarkItUp Team',
  main: 'poetry-tools.js',
  
  commands: [
    {
      id: 'sonnet-template',
      name: 'Sonnet Template',
      description: 'Create Shakespearean sonnet template',
      callback: async () => {
        const template = `# Sonnet - [Title]

**Form:** Shakespearean Sonnet  
**Rhyme Scheme:** ABAB CDCD EFEF GG  
**Meter:** Iambic Pentameter

## Structure Guide
- **Lines 1-4 (Quatrain 1):** Introduce the theme or problem
- **Lines 5-8 (Quatrain 2):** Develop or complicate the theme
- **Lines 9-12 (Quatrain 3):** Take a different approach or turn
- **Lines 13-14 (Couplet):** Resolve or conclude with a twist

---

[Line 1 - A rhyme]  
[Line 2 - B rhyme]  
[Line 3 - A rhyme]  
[Line 4 - B rhyme]

[Line 5 - C rhyme]  
[Line 6 - D rhyme]  
[Line 7 - C rhyme]  
[Line 8 - D rhyme]

[Line 9 - E rhyme]  
[Line 10 - F rhyme]  
[Line 11 - E rhyme]  
[Line 12 - F rhyme]

[Line 13 - G rhyme]  
[Line 14 - G rhyme]

## Meter Check
**Iambic Pentameter Pattern:** da-DUM da-DUM da-DUM da-DUM da-DUM

Example: "Shall I compare thee to a summer's day?"
Pattern: da-DUM da-DUM da-DUM da-DUM da-DUM

## Rhyme Words Bank
**A words:** [list words that rhyme]  
**B words:** [list words that rhyme]  
**C words:** [list words that rhyme]  
**D words:** [list words that rhyme]  
**E words:** [list words that rhyme]  
**F words:** [list words that rhyme]  
**G words:** [list words that rhyme]
`;
        console.log('Sonnet template:', template);
      }
    },
    {
      id: 'haiku-template',
      name: 'Haiku Template',
      description: 'Create haiku template',
      callback: async () => {
        const template = `# Haiku - [Title]

**Form:** Traditional Haiku  
**Syllable Pattern:** 5-7-5  
**Season Reference:** [Season word if applicable]

---

[5 syllables - Line 1]  
[7 syllables - Line 2]  
[5 syllables - Line 3]

## Guidelines
- **Nature Focus:** Traditional haiku reference nature
- **Present Moment:** Capture a single moment in time
- **Sensory Details:** Use concrete, sensory imagery
- **Seasonal Reference:** Include a season word (kigo)
- **Cutting Word:** Create a pause or break (kireji)

## Seasonal Words (Kigo)
**Spring:** cherry blossoms, rain, morning mist, new leaves  
**Summer:** cicadas, heat, thunderstorm, fireflies  
**Autumn:** falling leaves, harvest moon, wind, geese  
**Winter:** snow, ice, bare branches, frost

## Syllable Counter
Line 1: _ _ _ _ _ (5)  
Line 2: _ _ _ _ _ _ _ (7)  
Line 3: _ _ _ _ _ (5)
`;
        console.log('Haiku template:', template);
      }
    },
    {
      id: 'free-verse-template',
      name: 'Free Verse Template',
      description: 'Create free verse poetry template',
      callback: async () => {
        const template = `# Free Verse Poem - [Title]

**Form:** Free Verse  
**Focus:** [Theme or subject]

---

[Your poem here - no set rhyme or meter]

## Free Verse Guidelines
- **No Fixed Form:** Freedom from traditional rhyme and meter
- **Natural Rhythm:** Follow the natural rhythm of speech
- **Line Breaks:** Use for emphasis and pacing
- **Imagery:** Strong, vivid images
- **White Space:** Use spacing for effect

## Techniques to Consider
- **Enjambment:** Lines that continue without pause
- **Repetition:** Repeated words or phrases for emphasis
- **Alliteration:** Repeated consonant sounds
- **Assonance:** Repeated vowel sounds
- **Metaphor:** Implied comparisons
- **Simile:** Direct comparisons using "like" or "as"

## Revision Notes
- [Note 1]
- [Note 2]
- [Note 3]
`;
        console.log('Free verse template:', template);
      }
    }
  ],

  onLoad: async () => {
    console.log('Poetry Tools plugin loaded');
  }
};

// Content Calendar Plugin - Editorial calendar and content planning
export const contentCalendarPlugin: PluginManifest = {
  id: 'content-calendar',
  name: 'Content Calendar',
  version: '1.0.0',
  description: 'Editorial calendar, content ideation, and publishing schedule',
  author: 'MarkItUp Team',
  main: 'content-calendar.js',
  
  commands: [
    {
      id: 'create-content-calendar',
      name: 'Create Content Calendar',
      description: 'Generate monthly content calendar',
      callback: async () => {
        const month = prompt('Month (1-12):') || new Date().getMonth() + 1;
        const year = prompt('Year:') || new Date().getFullYear();
        
        const calendar = `# Content Calendar - ${month}/${year}

## Monthly Theme
**Focus:** [Monthly theme or campaign]  
**Goals:** [Content goals for the month]  
**Target Audience:** [Primary audience]

## Weekly Breakdown

### Week 1 (${month}/1-7)
**Theme:** [Weekly sub-theme]

| Date | Platform | Content Type | Topic | Status |
|------|----------|--------------|-------|--------|
| ${month}/1 | Blog | How-to Article | [Topic] | 📝 Draft |
| ${month}/2 | Instagram | Infographic | [Topic] | 💡 Idea |
| ${month}/3 | Twitter | Thread | [Topic] | ✅ Published |
| ${month}/4 | YouTube | Tutorial | [Topic] | 🎬 Recording |

### Week 2 (${month}/8-14)
**Theme:** [Weekly sub-theme]

| Date | Platform | Content Type | Topic | Status |
|------|----------|--------------|-------|--------|
| ${month}/8 | Blog | List Article | [Topic] | 📝 Draft |
| ${month}/9 | LinkedIn | Professional Post | [Topic] | 💡 Idea |
| ${month}/10 | Instagram | Carousel | [Topic] | 🎨 Design |
| ${month}/11 | Podcast | Interview | [Topic] | 📅 Scheduled |

### Week 3 (${month}/15-21)
**Theme:** [Weekly sub-theme]

| Date | Platform | Content Type | Topic | Status |
|------|----------|--------------|-------|--------|
| ${month}/15 | Blog | Opinion Piece | [Topic] | 💡 Idea |
| ${month}/16 | TikTok | Short Video | [Topic] | 🎬 Recording |
| ${month}/17 | Email | Newsletter | [Topic] | 📝 Draft |
| ${month}/18 | Instagram | Story Series | [Topic] | 📱 Planning |

### Week 4 (${month}/22-28)
**Theme:** [Weekly sub-theme]

| Date | Platform | Content Type | Topic | Status |
|------|----------|--------------|-------|--------|
| ${month}/22 | Blog | Case Study | [Topic] | 📊 Research |
| ${month}/23 | Twitter | Live Tweet | [Topic] | 📅 Scheduled |
| ${month}/24 | YouTube | Q&A Video | [Topic] | 📝 Script |
| ${month}/25 | LinkedIn | Article | [Topic] | ✍️ Writing |

## Content Buckets
### Educational (40%)
- How-to guides
- Tutorials
- Tips and tricks
- Industry insights

### Entertainment (30%)
- Behind-the-scenes
- Personal stories
- Humor/memes
- Trends

### Promotional (20%)
- Product features
- Customer testimonials
- Company news
- Case studies

### Community (10%)
- User-generated content
- Q&As
- Polls and surveys
- Community highlights

## Content Ideas Bank
### Evergreen Topics
- [Topic 1]
- [Topic 2]
- [Topic 3]

### Trending Topics
- [Current trend 1]
- [Current trend 2]
- [Current trend 3]

### Seasonal Content
- [Seasonal idea 1]
- [Seasonal idea 2]
- [Seasonal idea 3]

## Performance Tracking
### Goals
- **Website Traffic:** [Target number] monthly visitors
- **Social Engagement:** [Target] average engagement rate
- **Email Subscribers:** [Target] new subscribers
- **Lead Generation:** [Target] qualified leads

### Metrics to Track
- Page views
- Time on page
- Social shares
- Comments
- Email open rates
- Click-through rates

## Notes
- [Important notes and reminders]
- [Upcoming campaigns or events]
- [Content creation deadlines]
`;
        console.log('Content calendar:', calendar);
      }
    },
    {
      id: 'content-idea-generator',
      name: 'Content Idea Generator',
      description: 'Generate content ideas',
      callback: async () => {
        const niche = prompt('Your niche/industry:');
        const format = prompt('Content format (blog/video/social):');
        
        if (niche) {
          const ideas = `# Content Ideas for ${niche}

**Format:** ${format || 'Mixed'}  
**Generated:** ${new Date().toLocaleDateString()}

## How-To Content
1. How to [solve common problem] in ${niche}
2. How to get started with [topic] as a beginner
3. How to avoid common mistakes in [process]
4. How to choose the right [tool/service] for [need]
5. How to optimize [process] for better results

## List Posts
1. 10 Essential [tools/resources] for ${niche}
2. 5 Mistakes to Avoid When [doing something]
3. 15 [industry] Terms Every Beginner Should Know
4. 7 Trends Shaping the Future of ${niche}
5. 12 Experts to Follow in ${niche}

## Behind-the-Scenes
1. A Day in the Life of a [profession]
2. My Workspace Setup for Maximum Productivity
3. The Tools I Use Daily in My ${niche} Work
4. Mistakes I Made When Starting in ${niche}
5. What I Wish I Knew Before [starting/learning]

## Case Studies & Stories
1. How I [achieved result] in [timeframe]
2. Client Success Story: [transformation]
3. What I Learned from My Biggest Failure
4. Before and After: [project/transformation]
5. The Real Cost of [service/product]

## Industry Analysis
1. Current State of ${niche} in 2025
2. Predictions for ${niche} in the Next 5 Years
3. How [technology/trend] is Changing ${niche}
4. Comparing [tool A] vs [tool B] for ${niche}
5. Why [common practice] is Outdated

## Q&A Content
1. Answering the Most Common ${niche} Questions
2. Myths vs. Facts About ${niche}
3. Reader Q&A: Your ${niche} Questions Answered
4. Ask Me Anything About ${niche}
5. Debunking 5 Common ${niche} Misconceptions

## Seasonal/Timely
1. ${niche} Trends for [Current Year]
2. Year-End Review: What Changed in ${niche}
3. New Year Resolutions for ${niche} Professionals
4. [Holiday] and Your ${niche} Business
5. Back-to-School [topic] for ${niche}

## Engagement Posts
1. What's Your Biggest Challenge in ${niche}?
2. Share Your Best ${niche} Tip
3. Would You Rather: ${niche} Edition
4. Caption This [image related to niche]
5. Fill in the Blank: The Best Part About ${niche} is ___

## Content Series Ideas
1. "${niche} 101" - Beginner series
2. "Tool Tuesday" - Weekly tool reviews
3. "Mistake Monday" - Common errors to avoid
4. "Feature Friday" - Highlighting community members
5. "Wisdom Wednesday" - Expert insights
`;
          console.log('Content ideas:', ideas);
        }
      }
    }
  ],

  onLoad: async () => {
    console.log('Content Calendar plugin loaded');
  }
};
