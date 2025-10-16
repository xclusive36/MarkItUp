import React from 'react';
import LinkSuggestionsPanel from '../components/LinkSuggestionsPanel';
import BridgeNoteSuggestionPanel from '../components/BridgeNoteSuggestionPanel';
import ConnectionMapPanel from '../components/ConnectionMapPanel';

/**
 * INTEGRATION GUIDE FOR INTELLIGENT LINK SUGGESTER V3.0
 *
 * This file shows how to integrate the new React UI components
 * into the intelligent-link-suggester plugin using the PluginAPI.
 */

// ============================================================================
// EXAMPLE 1: Showing Link Suggestions
// ============================================================================

export async function showLinkSuggestions(
  api: any,
  noteId: string,
  suggestions: Array<{
    noteId: string;
    noteName: string;
    reason: string;
    confidence: number;
    isBidirectional?: boolean;
  }>
) {
  const note = api.notes.get(noteId);

  // Use api.ui.showModal to display the component
  await api.ui.showModal(
    'Link Suggestions',
    <LinkSuggestionsPanel
      noteName={note.name}
      suggestions={suggestions}
      onAccept={suggestion => {
        // Handle accept
        console.log('Accepted:', suggestion);
        // Insert link into note
        insertWikilink(api, noteId, suggestion.noteName);
        // Record decision for learning
        recordDecision(api, 'accept', noteId, suggestion);
      }}
      onReject={suggestion => {
        // Handle reject
        console.log('Rejected:', suggestion);
        // Record decision for learning
        recordDecision(api, 'reject', noteId, suggestion);
      }}
      onAcceptAll={() => {
        // Handle accept all
        suggestions.forEach(s => {
          insertWikilink(api, noteId, s.noteName);
          recordDecision(api, 'accept', noteId, s);
        });
        api.ui.showNotification(`Added ${suggestions.length} links`, 'info');
      }}
      onClose={() => {
        // Modal will close automatically
      }}
      onPreview={async (noteId: string) => {
        // Load and return preview content
        const note = api.notes.get(noteId);
        return note ? note.content.slice(0, 500) : 'Preview not available';
      }}
    />
  );
}

// ============================================================================
// EXAMPLE 2: Showing Bridge Note Suggestion
// ============================================================================

export async function showBridgeNoteSuggestion(
  api: any,
  suggestion: {
    title: string;
    purpose: string;
    contentOutline: string;
    suggestedTags: string[];
    suggestedLinks: string[];
    connectsClusters: string[][];
    improvementScore: number;
  },
  totalClusters: number
) {
  await api.ui.showModal(
    'Bridge Note Suggestion',
    <BridgeNoteSuggestionPanel
      suggestion={suggestion}
      totalClusters={totalClusters}
      onAccept={async () => {
        // Create the bridge note
        const content = `# ${suggestion.title}

> ${suggestion.purpose}

${suggestion.contentOutline}

## Related Notes
${suggestion.suggestedLinks.map(link => `- [[${link}]]`).join('\n')}

---
Tags: ${suggestion.suggestedTags.map(tag => `#${tag}`).join(' ')}
`;

        await api.notes.create(suggestion.title, content);
        api.ui.showNotification(`Bridge note "${suggestion.title}" created!`, 'info');
      }}
      onReject={() => {
        // User declined
        api.ui.showNotification('Bridge note suggestion declined', 'info');
      }}
      onClose={() => {
        // Modal closes
      }}
    />
  );
}

// ============================================================================
// EXAMPLE 3: Showing Connection Map
// ============================================================================

export async function showConnectionMap(
  api: any,
  hubNotes: Array<{ id: string; name: string; connections: number }>,
  orphanNotes: Array<{ id: string; name: string }>,
  totalNotes: number,
  totalLinks: number,
  averageConnections: number
) {
  await api.ui.showModal(
    'Connection Map',
    <ConnectionMapPanel
      totalNotes={totalNotes}
      totalLinks={totalLinks}
      averageConnections={averageConnections}
      hubNotes={hubNotes}
      orphanNotes={orphanNotes}
      onFindLinksForOrphan={(noteId: string) => {
        // Switch to that note and find opportunities
        api.ui.openNote(noteId);
        // Trigger find link opportunities for that note
        // (This would call your existing findLinkOpportunities method)
      }}
      onClose={() => {
        // Modal closes
      }}
    />
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Insert a wikilink into note content
 */
function insertWikilink(api: any, noteId: string, targetNoteName: string) {
  const note = api.notes.get(noteId);
  if (!note) return;

  let updatedContent = note.content;

  // Find where to insert (look for mentions of the target)
  const insertionPoint = findInsertionPoint(updatedContent, targetNoteName);

  if (insertionPoint) {
    updatedContent = insertLinkAtPosition(updatedContent, insertionPoint, targetNoteName);
  } else {
    // Append to Related Notes section
    if (!updatedContent.includes('## Related Notes')) {
      updatedContent += `\n\n## Related Notes\n- [[${targetNoteName}]]`;
    } else {
      updatedContent = updatedContent.replace(
        '## Related Notes',
        `## Related Notes\n- [[${targetNoteName}]]`
      );
    }
  }

  api.notes.update(noteId, { content: updatedContent });
}

/**
 * Find insertion point for wikilink
 */
function findInsertionPoint(
  content: string,
  noteName: string
): { position: number; matchedText: string } | null {
  const regex = new RegExp(`\\b${escapeRegex(noteName)}\\b`, 'i');
  const match = regex.exec(content);

  if (match) {
    return {
      position: match.index,
      matchedText: match[0],
    };
  }

  return null;
}

/**
 * Insert link at position
 */
function insertLinkAtPosition(
  content: string,
  point: { position: number; matchedText: string },
  noteName: string
): string {
  const before = content.substring(0, point.position);
  const after = content.substring(point.position + point.matchedText.length);
  return `${before}[[${noteName}]]${after}`;
}

/**
 * Escape regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Record user decision for learning
 */
function recordDecision(
  api: any,
  decision: 'accept' | 'reject',
  sourceNoteId: string,
  suggestion: { noteName: string; confidence: number }
) {
  try {
    const learningKey = 'intelligent-link-suggester-learning';
    const stored = localStorage.getItem(learningKey);
    const learning = stored
      ? JSON.parse(stored)
      : {
          acceptedLinks: [],
          rejectedLinks: [],
          patterns: {},
        };

    if (decision === 'accept') {
      learning.acceptedLinks.push({
        source: sourceNoteId,
        target: suggestion.noteName,
        confidence: suggestion.confidence,
        timestamp: Date.now(),
      });
    } else {
      learning.rejectedLinks.push({
        source: sourceNoteId,
        target: suggestion.noteName,
        confidence: suggestion.confidence,
        timestamp: Date.now(),
      });
    }

    // Keep only last 100 entries
    if (learning.acceptedLinks.length > 100) {
      learning.acceptedLinks = learning.acceptedLinks.slice(-100);
    }
    if (learning.rejectedLinks.length > 100) {
      learning.rejectedLinks = learning.rejectedLinks.slice(-100);
    }

    localStorage.setItem(learningKey, JSON.stringify(learning));
  } catch (error) {
    // Ignore storage errors
  }
}

/**
 * Apply learning to filter suggestions
 */
export function applyLearning(
  suggestions: Array<{ noteId: string; noteName: string; confidence: number }>,
  enableLearning: boolean
): Array<{ noteId: string; noteName: string; confidence: number }> {
  if (!enableLearning) return suggestions;

  try {
    const learningKey = 'intelligent-link-suggester-learning';
    const stored = localStorage.getItem(learningKey);
    if (!stored) return suggestions;

    const learning = JSON.parse(stored);

    // Filter out suggestions that have been rejected multiple times
    return suggestions.filter(suggestion => {
      const similarRejections = learning.rejectedLinks.filter(
        (rej: any) => rej.target === suggestion.noteName && rej.confidence > suggestion.confidence
      );

      // If rejected 3+ times, filter it out
      return similarRejections.length < 3;
    });
  } catch (error) {
    return suggestions;
  }
}

// ============================================================================
// USAGE IN PLUGIN
// ============================================================================

/**
 * Example: How to use in your plugin's findLinkOpportunities method
 */
export async function exampleFindLinkOpportunities(api: any) {
  const currentNoteId = api.notes.getActiveNoteId();
  if (!currentNoteId) return;

  const note = api.notes.get(currentNoteId);
  if (!note) return;

  // Analyze content with AI
  const analysis = await api.ai.analyzeContent(note.content, note.id);

  // Get suggestions
  let suggestions = analysis.suggestedConnections;

  // Apply learning
  const settings = api.settings.get('ai-intelligent-link-suggester') || {};
  suggestions = applyLearning(suggestions, settings['enable-learning'] !== false);

  // Add bidirectional flags
  const enrichedSuggestions = suggestions.map((s: any) => ({
    ...s,
    isBidirectional: checkIfBidirectional(api, currentNoteId, s.noteId),
  }));

  // Show UI
  await showLinkSuggestions(api, currentNoteId, enrichedSuggestions);
}

/**
 * Check if link would be bidirectional
 */
function checkIfBidirectional(api: any, currentNoteId: string, targetNoteId: string): boolean {
  if (!api.graph) return false;

  const targetLinks = api.graph.getLinks(targetNoteId);
  return targetLinks.some((link: any) => link.target === currentNoteId);
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  showLinkSuggestions,
  showBridgeNoteSuggestion,
  showConnectionMap,
  applyLearning,
};
