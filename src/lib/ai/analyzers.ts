import { Note, Link, Tag } from '../types';
import { AIService } from './ai-service';

export interface ContentAnalysis {
  summary: string;
  keyTopics: string[];
  suggestedTags: string[];
  suggestedConnections: Array<{
    noteId: string;
    noteName: string;
    reason: string;
    confidence: number;
    connectionType: 'semantic' | 'topical' | 'structural';
  }>;
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: number;
  readabilityScore: number;
  writingStyle: {
    tone: string;
    formality: 'formal' | 'informal' | 'mixed';
    perspective: 'first-person' | 'second-person' | 'third-person' | 'mixed';
  };
  improvements: Array<{
    type: 'clarity' | 'structure' | 'style' | 'content';
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface KnowledgeGapAnalysis {
  missingTopics: string[];
  underExploredAreas: Array<{
    topic: string;
    currentNoteCount: number;
    suggestedExpansion: string;
  }>;
  orphanNotes: Array<{
    noteId: string;
    noteName: string;
    suggestedConnections: string[];
  }>;
  clusteringOpportunities: Array<{
    theme: string;
    relatedNotes: string[];
    suggestedStructure: string;
  }>;
}

export interface WritingAssistance {
  suggestions: Array<{
    type: 'grammar' | 'style' | 'clarity' | 'structure' | 'content';
    original: string;
    suggestion: string;
    explanation: string;
    position: { start: number; end: number };
  }>;
  expandablePoints: Array<
    | string
    | {
        // Cloud provider format
        point?: string;
        suggestions?: string[];
        relatedNotes?: string[];
        // Ollama simple format
        id?: number;
        text?: string;
        // Ollama suggestion format
        type?: string;
        suggestion?: string;
        explanation?: string;
        originalText?: string;
        position?: string;
      }
  >;
  strengthenArguments: Array<
    | string
    | {
        argument?: string;
        supportingEvidence?: string[];
        counterarguments?: string[];
        // Ollama simple format
        id?: number;
        text?: string;
      }
  >;
}

export class AIAnalyzer {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  async analyzeContent(content: string, _noteId?: string): Promise<ContentAnalysis> {
    // noteId unused
    const prompt = `Analyze this content comprehensively and provide a JSON response with the following structure:

{
  "summary": "Brief summary of the content",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "suggestedConnections": [
    {
      "noteId": "suggested-note-id",
      "noteName": "Suggested Note Name",
      "reason": "Why this connection makes sense",
      "confidence": 0.8,
      "connectionType": "semantic"
    }
  ],
  "sentiment": "neutral",
  "complexity": 7,
  "readabilityScore": 8,
  "writingStyle": {
    "tone": "informative",
    "formality": "formal",
    "perspective": "third-person"
  },
  "improvements": [
    {
      "type": "clarity",
      "suggestion": "Consider breaking long sentences into shorter ones",
      "priority": "medium"
    }
  ]
}

Content to analyze:
${content}`;

    try {
      const provider = (this.aiService as any).getCurrentProvider();
      const response = await provider.complete(prompt, {
        model: 'gpt-4',
        temperature: 0.3,
      });

      // Parse JSON response
      const analysis = this.parseAnalysisResponse(response);
      return analysis;
    } catch (error) {
      console.error('Content analysis error:', error);
      return this.getDefaultAnalysis();
    }
  }

  async generateWritingAssistance(
    content: string,
    context?: {
      relatedNotes: Note[];
      targetAudience?: string;
      purpose?: string;
    }
  ): Promise<WritingAssistance> {
    const contextInfo = context
      ? `
Context:
- Related notes: ${context.relatedNotes.map(n => n.name).join(', ')}
- Target audience: ${context.targetAudience || 'General'}
- Purpose: ${context.purpose || 'Informational'}
`
      : '';

    const prompt = `As a writing assistant, analyze this content and provide specific suggestions for improvement. Focus on clarity, structure, and engagement.

${contextInfo}

Please provide a JSON response with this structure:
{
  "suggestions": [
    {
      "type": "clarity",
      "original": "Original text that needs improvement",
      "suggestion": "Improved version",
      "explanation": "Why this is better",
      "position": {"start": 0, "end": 20}
    }
  ],
  "expandablePoints": [
    {
      "point": "Key point that could be expanded",
      "suggestions": ["Expansion idea 1", "Expansion idea 2"],
      "relatedNotes": ["Note that relates to this point"]
    }
  ],
  "strengthenArguments": [
    {
      "argument": "Main argument in the text",
      "supportingEvidence": ["Evidence suggestion 1", "Evidence suggestion 2"],
      "counterarguments": ["Potential counterargument to address"]
    }
  ]
}

Content:
${content}`;

    try {
      const provider = (this.aiService as any).getCurrentProvider();
      const response = await provider.complete(prompt, {
        model: 'gpt-4',
        temperature: 0.4,
      });

      return this.parseWritingAssistanceResponse(response);
    } catch (error) {
      console.error('Writing assistance error:', error);
      return { suggestions: [], expandablePoints: [], strengthenArguments: [] };
    }
  }

  async analyzeKnowledgeGaps(
    notes: Note[],
    links: Link[],
    tags: Tag[]
  ): Promise<KnowledgeGapAnalysis> {
    // Analyze note topics and connections
    const notesSummary = notes.slice(0, 20).map(note => ({
      name: note.name,
      tags: note.tags,
      wordCount: note.wordCount,
      hasConnections: links.some(link => link.source === note.id || link.target === note.id),
    }));

    const prompt = `Analyze this knowledge base and identify gaps and opportunities for improvement.

Knowledge Base Summary:
- Total notes: ${notes.length}
- Total connections: ${links.length}
- Total tags: ${tags.length}

Sample notes:
${JSON.stringify(notesSummary, null, 2)}

Tag distribution:
${tags
  .slice(0, 10)
  .map(tag => `${tag.name}: ${tag.count} notes`)
  .join('\n')}

Please provide a JSON response analyzing knowledge gaps:
{
  "missingTopics": ["topic1", "topic2"],
  "underExploredAreas": [
    {
      "topic": "topic name",
      "currentNoteCount": 2,
      "suggestedExpansion": "How to expand this area"
    }
  ],
  "orphanNotes": [
    {
      "noteId": "note-id",
      "noteName": "Note Name",
      "suggestedConnections": ["other note names that could connect"]
    }
  ],
  "clusteringOpportunities": [
    {
      "theme": "common theme",
      "relatedNotes": ["note1", "note2"],
      "suggestedStructure": "How to organize these notes"
    }
  ]
}`;

    try {
      const provider = (this.aiService as any).getCurrentProvider();
      const response = await provider.complete(prompt, {
        model: 'gpt-4',
        temperature: 0.3,
      });

      return this.parseKnowledgeGapResponse(response, notes);
    } catch (error) {
      console.error('Knowledge gap analysis error:', error);
      return {
        missingTopics: [],
        underExploredAreas: [],
        orphanNotes: [],
        clusteringOpportunities: [],
      };
    }
  }

  async generateNoteSuggestions(
    topic: string,
    context: {
      existingNotes: Note[];
      relatedTags: string[];
      userInterests: string[];
    }
  ): Promise<{
    title: string;
    content: string;
    suggestedTags: string[];
    suggestedConnections: string[];
  }> {
    const prompt = `Generate a comprehensive note about "${topic}" based on the user's existing knowledge base.

Context:
- Existing related notes: ${context.existingNotes.map(n => n.name).join(', ')}
- Related tags: ${context.relatedTags.join(', ')}
- User interests: ${context.userInterests.join(', ')}

Create a note that:
1. Builds on existing knowledge
2. Fills gaps in understanding
3. Connects to existing notes
4. Uses the user's established tagging pattern

Provide response in JSON format:
{
  "title": "Suggested note title",
  "content": "Full markdown content for the note",
  "suggestedTags": ["tag1", "tag2"],
  "suggestedConnections": ["existing note names to link to"]
}`;

    try {
      const provider = (this.aiService as any).getCurrentProvider();
      const response = await provider.complete(prompt, {
        model: 'gpt-4',
        temperature: 0.6,
      });

      return this.parseNoteSuggestionResponse(response);
    } catch (error) {
      console.error('Note suggestion error:', error);
      return {
        title: `Notes on ${topic}`,
        content: `# ${topic}\n\n[Add your thoughts about ${topic} here]`,
        suggestedTags: [topic.toLowerCase()],
        suggestedConnections: [],
      };
    }
  }

  private parseAnalysisResponse(response: string): ContentAnalysis {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);

      return {
        summary: parsed.summary || '',
        keyTopics: parsed.keyTopics || [],
        suggestedTags: parsed.suggestedTags || [],
        suggestedConnections: parsed.suggestedConnections || [],
        sentiment: parsed.sentiment || 'neutral',
        complexity: parsed.complexity || 5,
        readabilityScore: parsed.readabilityScore || 5,
        writingStyle: parsed.writingStyle || {
          tone: 'neutral',
          formality: 'mixed',
          perspective: 'mixed',
        },
        improvements: parsed.improvements || [],
      };
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      return this.getDefaultAnalysis();
    }
  }

  private parseWritingAssistanceResponse(response: string): WritingAssistance {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);

      return {
        suggestions: parsed.suggestions || [],
        expandablePoints: parsed.expandablePoints || [],
        strengthenArguments: parsed.strengthenArguments || [],
      };
    } catch (error) {
      console.error('Failed to parse writing assistance response:', error);
      return { suggestions: [], expandablePoints: [], strengthenArguments: [] };
    }
  }

  private parseKnowledgeGapResponse(response: string, notes: Note[]): KnowledgeGapAnalysis {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);

      // Map orphan notes to actual note IDs
      const orphanNotes = (parsed.orphanNotes || []).map((orphan: any) => {
        const matchingNote = notes.find(
          note =>
            note.name.toLowerCase().includes(orphan.noteName.toLowerCase()) ||
            orphan.noteName.toLowerCase().includes(note.name.toLowerCase())
        );

        return {
          noteId: matchingNote?.id || `unknown-${orphan.noteName}`,
          noteName: orphan.noteName,
          suggestedConnections: orphan.suggestedConnections || [],
        };
      });

      return {
        missingTopics: parsed.missingTopics || [],
        underExploredAreas: parsed.underExploredAreas || [],
        orphanNotes,
        clusteringOpportunities: parsed.clusteringOpportunities || [],
      };
    } catch (error) {
      console.error('Failed to parse knowledge gap response:', error);
      return {
        missingTopics: [],
        underExploredAreas: [],
        orphanNotes: [],
        clusteringOpportunities: [],
      };
    }
  }

  private parseNoteSuggestionResponse(response: string): {
    title: string;
    content: string;
    suggestedTags: string[];
    suggestedConnections: string[];
  } {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);

      return {
        title: parsed.title || 'New Note',
        content: parsed.content || '# New Note\n\nAdd content here...',
        suggestedTags: parsed.suggestedTags || [],
        suggestedConnections: parsed.suggestedConnections || [],
      };
    } catch (error) {
      console.error('Failed to parse note suggestion response:', error);
      return {
        title: 'New Note',
        content: '# New Note\n\nAdd content here...',
        suggestedTags: [],
        suggestedConnections: [],
      };
    }
  }

  private cleanJsonResponse(response: string): string {
    // Remove markdown code blocks and clean up the response
    let cleaned = response.trim();

    // Remove markdown code block markers
    cleaned = cleaned.replace(/```json\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/g, '');

    // Find the first { and last } to extract just the JSON
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return cleaned;
  }

  private getDefaultAnalysis(): ContentAnalysis {
    return {
      summary: 'Content analysis not available',
      keyTopics: [],
      suggestedTags: [],
      suggestedConnections: [],
      sentiment: 'neutral',
      complexity: 5,
      readabilityScore: 5,
      writingStyle: {
        tone: 'neutral',
        formality: 'mixed',
        perspective: 'mixed',
      },
      improvements: [],
    };
  }
}
