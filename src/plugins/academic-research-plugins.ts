import { PluginManifest } from '../lib/types';

// Citation Manager Plugin - Auto-format citations and manage bibliography
export const citationManagerPlugin: PluginManifest = {
  id: 'citation-manager',
  name: 'Citation Manager',
  version: '1.0.0',
  description: 'Auto-format citations in APA, MLA, Chicago styles with DOI lookup and bibliography generation',
  author: 'MarkItUp Team',
  main: 'citation-manager.js',
  
  settings: [
    {
      id: 'defaultStyle',
      name: 'Default Citation Style',
      type: 'select',
      options: [
        { label: 'APA 7th Edition', value: 'apa' },
        { label: 'MLA 9th Edition', value: 'mla' },
        { label: 'Chicago 17th Edition', value: 'chicago' },
        { label: 'Harvard', value: 'harvard' }
      ],
      default: 'apa',
      description: 'Default citation format style'
    }
  ],

  commands: [
    {
      id: 'add-citation',
      name: 'Add Citation',
      description: 'Add a formatted citation',
      keybinding: 'Ctrl+Shift+C',
      callback: async () => {
        const doi = prompt('DOI or URL (optional):');
        const title = prompt('Title:');
        const author = prompt('Author(s):');
        const year = prompt('Year:');
        const journal = prompt('Journal/Publisher:');
        
        if (title && author) {
          const citation = `${author} (${year}). ${title}. ${journal}. ${doi ? `DOI: ${doi}` : ''}`;
          console.log('Citation added:', citation);
        }
      }
    },
    {
      id: 'generate-bibliography',
      name: 'Generate Bibliography',
      description: 'Generate bibliography from all citations',
      callback: async () => {
        const bibliography = `# Bibliography

## References

1. Smith, J. (2023). Research Methods in Digital Humanities. Academic Press.
2. Johnson, M. & Brown, K. (2024). Modern Citation Practices. Journal of Academic Writing, 15(3), 45-62.

*Generated on ${new Date().toLocaleDateString()}*
`;
        console.log('Bibliography:', bibliography);
      }
    }
  ],

  views: [
    {
      id: 'citation-library',
      name: 'Citations',
      type: 'sidebar',
      icon: '📚',
      component: () => {
        return `
          <div class="citation-manager">
            <h3>📚 Citation Library</h3>
            <div class="citation-list">
              <div class="citation-item">
                <div class="citation-text">Smith, J. (2023)...</div>
                <button onclick="alert('Insert citation')" class="insert-btn">Insert</button>
              </div>
            </div>
            <button onclick="alert('Add new citation')" class="add-citation-btn">+ Add Citation</button>
          </div>
        `;
      }
    }
  ],

  onLoad: async () => {
    const style = document.createElement('style');
    style.textContent = `
      .citation-manager { padding: 1rem; }
      .citation-item { margin: 0.5rem 0; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 4px; }
      .citation-text { font-size: 0.8em; margin-bottom: 0.5rem; }
      .insert-btn { font-size: 0.7em; padding: 0.25rem 0.5rem; }
      .add-citation-btn { width: 100%; padding: 0.5rem; margin-top: 1rem; }
    `;
    document.head.appendChild(style);
    console.log('Citation Manager plugin loaded');
  }
};

// Research Paper Template Plugin - Academic paper structures
export const researchPaperPlugin: PluginManifest = {
  id: 'research-paper-template',
  name: 'Research Paper Template',
  version: '1.0.0',
  description: 'Academic paper structures, literature review templates, and thesis outlines',
  author: 'MarkItUp Team',
  main: 'research-paper.js',
  
  commands: [
    {
      id: 'create-research-paper',
      name: 'Create Research Paper',
      description: 'Generate academic paper template',
      callback: async () => {
        const template = `# [Paper Title]

**Author:** [Your Name]  
**Institution:** [Your Institution]  
**Date:** ${new Date().toLocaleDateString()}

## Abstract
[150-250 word summary of your research]

**Keywords:** keyword1, keyword2, keyword3

## 1. Introduction
### 1.1 Background
[Provide context and background information]

### 1.2 Problem Statement
[Clearly state the research problem]

### 1.3 Research Questions
1. [Primary research question]
2. [Secondary research questions]

### 1.4 Objectives
- [Objective 1]
- [Objective 2]

## 2. Literature Review
### 2.1 Theoretical Framework
[Discuss relevant theories]

### 2.2 Previous Research
[Review existing literature]

### 2.3 Research Gap
[Identify gaps in current knowledge]

## 3. Methodology
### 3.1 Research Design
[Describe your research approach]

### 3.2 Data Collection
[Explain data collection methods]

### 3.3 Data Analysis
[Describe analysis procedures]

## 4. Results
### 4.1 Findings
[Present your findings]

### 4.2 Analysis
[Analyze and interpret results]

## 5. Discussion
### 5.1 Interpretation
[Discuss implications of findings]

### 5.2 Limitations
[Acknowledge study limitations]

### 5.3 Future Research
[Suggest areas for future study]

## 6. Conclusion
[Summarize key findings and contributions]

## References
[APA/MLA formatted references]

## Appendices
### Appendix A: [Data Tables]
### Appendix B: [Additional Materials]
`;
        console.log('Research paper template:', template);
      }
    }
  ],

  onLoad: async () => {
    console.log('Research Paper Template plugin loaded');
  }
};

// Note-Taking System Plugin - Cornell notes, Zettelkasten, flashcards
export const noteTakingSystemPlugin: PluginManifest = {
  id: 'note-taking-system',
  name: 'Note-Taking System',
  version: '1.0.0',
  description: 'Cornell note format, Zettelkasten method, and spaced repetition flashcards',
  author: 'MarkItUp Team',
  main: 'note-taking-system.js',
  
  commands: [
    {
      id: 'cornell-notes',
      name: 'Cornell Notes',
      description: 'Create Cornell note format',
      callback: async () => {
        const template = `# Cornell Notes - ${new Date().toLocaleDateString()}

**Topic:** [Lecture/Reading Topic]  
**Date:** ${new Date().toLocaleDateString()}  
**Source:** [Textbook, Lecture, etc.]

---

## Notes Section
[Main content goes here - detailed notes, explanations, examples]

---

## Cue Column
**Key Questions:**
- [Question 1]
- [Question 2]

**Keywords:**
- [Term 1]
- [Term 2]

**Main Ideas:**
- [Idea 1]
- [Idea 2]

---

## Summary
[2-3 sentence summary of the main points covered]

---

## Review Schedule
- [ ] Review within 24 hours
- [ ] Review after 1 week  
- [ ] Review after 1 month
`;
        console.log('Cornell notes template:', template);
      }
    },
    {
      id: 'zettelkasten-note',
      name: 'Zettelkasten Note',
      description: 'Create interconnected Zettelkasten note',
      callback: async () => {
        const noteId = Date.now().toString();
        const template = `# Zettelkasten Note ${noteId}

**ID:** ${noteId}  
**Created:** ${new Date().toLocaleString()}  
**Tags:** #concept #idea

## Main Idea
[Express one clear idea in your own words]

## Connection to Other Ideas
- **Links to:** [[Note123]], [[Note456]]
- **Builds on:** [[Foundational-Concept]]
- **Contradicts:** [[Alternative-View]]

## Source
[If derived from a source, cite it here]

## Personal Reflection
[Your thoughts, questions, and insights]

## Follow-up Questions
1. [Question for further exploration]
2. [Related concept to investigate]
`;
        console.log('Zettelkasten note:', template);
      }
    },
    {
      id: 'create-flashcard',
      name: 'Create Flashcard',
      description: 'Create spaced repetition flashcard',
      callback: async () => {
        const question = prompt('Flashcard question:');
        const answer = prompt('Flashcard answer:');
        
        if (question && answer) {
          const flashcard = `## Flashcard ${Date.now()}

**Q:** ${question}

---

**A:** ${answer}

**Difficulty:** [Easy/Medium/Hard]  
**Next Review:** ${new Date(Date.now() + 24*60*60*1000).toLocaleDateString()}  
**Review Count:** 0
`;
          console.log('Flashcard created:', flashcard);
        }
      }
    }
  ],

  onLoad: async () => {
    console.log('Note-Taking System plugin loaded');
  }
};

// PDF Annotator Plugin - Highlight and comment on PDFs
export const pdfAnnotatorPlugin: PluginManifest = {
  id: 'pdf-annotator',
  name: 'PDF Annotator',
  version: '1.0.0',
  description: 'Highlight and comment on PDFs, extract annotations to markdown',
  author: 'MarkItUp Team',
  main: 'pdf-annotator.js',
  
  commands: [
    {
      id: 'import-pdf-annotations',
      name: 'Import PDF Annotations',
      description: 'Import annotations from PDF',
      callback: async () => {
        const template = `# PDF Annotations

**Document:** [PDF Title]  
**Date:** ${new Date().toLocaleDateString()}

## Highlights & Comments

### Page 1
**Highlight:** "Important concept here"  
**Comment:** This relates to our earlier discussion about...

### Page 5
**Highlight:** "Key finding in the research"  
**Comment:** This supports the hypothesis that...

### Page 12
**Highlight:** "Methodology section"  
**Comment:** Could apply this method to our own research

## Summary of Key Points
1. [Key point 1]
2. [Key point 2]
3. [Key point 3]

## Questions for Further Research
- [Question 1]
- [Question 2]
`;
        console.log('PDF annotations template:', template);
      }
    }
  ],

  onLoad: async () => {
    console.log('PDF Annotator plugin loaded');
  }
};

// Literature Review Tracker Plugin - Track research papers
export const literatureReviewPlugin: PluginManifest = {
  id: 'literature-review-tracker',
  name: 'Literature Review Tracker',
  version: '1.0.0',
  description: 'Track read papers, rate and categorize sources, generate review matrices',
  author: 'MarkItUp Team',
  main: 'literature-review.js',
  
  commands: [
    {
      id: 'add-paper',
      name: 'Add Paper to Review',
      description: 'Add paper to literature review',
      callback: async () => {
        const title = prompt('Paper title:');
        const authors = prompt('Authors:');
        const year = prompt('Year:');
        const rating = prompt('Rating (1-5):');
        
        if (title) {
          const entry = `
## ${title}

**Authors:** ${authors}  
**Year:** ${year}  
**Rating:** ⭐ ${rating}/5  
**Status:** 📖 To Read  
**Category:** [Research Area]

### Abstract Summary
[Brief summary of the abstract]

### Key Findings
- [Finding 1]
- [Finding 2]

### Methodology
[Brief description of methods used]

### Relevance to Research
[How this paper relates to your research]

### Notes
[Additional observations and thoughts]

---
`;
          console.log('Paper entry:', entry);
        }
      }
    },
    {
      id: 'generate-review-matrix',
      name: 'Generate Review Matrix',
      description: 'Create literature review matrix',
      callback: async () => {
        const matrix = `# Literature Review Matrix

| Author(s) | Year | Title | Methodology | Key Findings | Relevance | Rating |
|-----------|------|-------|-------------|--------------|-----------|--------|
| Smith, J. | 2023 | Digital Methods | Quantitative | Improved efficiency | High | 4/5 |
| Brown, M. | 2024 | User Experience | Mixed Methods | Better engagement | Medium | 3/5 |
| Wilson, K. | 2022 | Data Analysis | Qualitative | New insights | High | 5/5 |

## Summary by Theme

### Theme 1: Methodology
- [Summary of methodological approaches]

### Theme 2: Findings
- [Common findings across studies]

### Theme 3: Gaps
- [Identified research gaps]
`;
        console.log('Review matrix:', matrix);
      }
    }
  ],

  onLoad: async () => {
    console.log('Literature Review Tracker plugin loaded');
  }
};
