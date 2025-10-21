'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Settings,
  Trash2,
  Plus,
  Brain,
  Loader2,
  AlertCircle,
  History,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';
import { AIMessage, ChatSession, AISettings } from '@/lib/ai/types';
import { analytics } from '@/lib/analytics';
import VectorSearchSettings from './VectorSearchSettings';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentNoteId?: string;
  currentNoteContent?: string;
  currentNoteName?: string;
  className?: string;
}

export default function AIChat({
  isOpen,
  onClose,
  currentNoteId,
  currentNoteContent,
  currentNoteName,
  className = '',
}: AIChatProps) {
  const { theme } = useSimpleTheme();

  // Chat state
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [settings, setSettings] = useState<AISettings | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadSessions();
      loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Focus textarea when opening
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/ai?action=sessions');
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
        // If no current session, create a new one or use the most recent
        if (!currentSession && data.data.length > 0) {
          setCurrentSession(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSettings = async () => {
    try {
      // First try to load from localStorage (since we save there)
      const savedSettings = localStorage.getItem('markitup-ai-settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          console.log('[AIChat] Loaded settings from localStorage:', parsed);
          setSettings(parsed);
          return;
        } catch (parseError) {
          console.error('[AIChat] Failed to parse localStorage settings:', parseError);
        }
      }

      // Fall back to API if localStorage doesn't have settings
      const response = await fetch('/api/ai?action=settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalTokens: 0,
      totalCost: 0,
      noteContext: currentNoteId,
    };

    setCurrentSession(newSession);
    setShowSessions(false);

    analytics.trackEvent('ai_chat', {
      action: 'new_session',
      noteContext: !!currentNoteId,
    });
  };

  const handleQuickCommand = async (command: string) => {
    const cmd = command.toLowerCase().split(' ')[0];
    const args = command.slice(cmd.length).trim();

    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add command to chat
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: command,
      timestamp: new Date().toISOString(),
    };

    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
      });
    }

    setIsLoading(true);
    setError(null);

    try {
      let responseContent = '';

      switch (cmd) {
        case '/connections':
        case '/connect':
          if (!currentNoteId) {
            responseContent = '⚠️ No note is currently open. Open a note to find connections.';
          } else {
            responseContent = '🔍 Analyzing your knowledge graph to find connections...\n\n';
            // Call the AI service to find connections
            const response = await fetch('/api/ai/connections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ noteId: currentNoteId }),
            });
            const data = await response.json();

            if (data.success && data.connections?.length > 0) {
              responseContent += '**Found Connections:**\n\n';
              data.connections.forEach(
                (conn: { noteName: string; reason: string; confidence: number }) => {
                  responseContent += `• **[[${conn.noteName}]]** (${Math.round(conn.confidence * 100)}% match)\n  ${conn.reason}\n\n`;
                }
              );
            } else {
              responseContent +=
                'No strong connections found. Try linking related concepts manually.';
            }
          }
          break;

        case '/gaps':
        case '/missing':
          if (!currentNoteId) {
            responseContent =
              '⚠️ No note is currently open. Open a note to identify knowledge gaps.';
          } else {
            responseContent = '🧩 Identifying knowledge gaps...\n\n';
            const response = await fetch('/api/ai/gaps', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ noteId: currentNoteId }),
            });
            const data = await response.json();

            if (data.success && data.gaps?.length > 0) {
              responseContent += '**Knowledge Gaps Identified:**\n\n';
              data.gaps.forEach(
                (
                  gap: { topic: string; reason: string; suggestedQuestions: string[] },
                  idx: number
                ) => {
                  responseContent += `${idx + 1}. **${gap.topic}**\n   ${gap.reason}\n`;
                  if (gap.suggestedQuestions?.length > 0) {
                    responseContent += '   *Questions to explore:*\n';
                    gap.suggestedQuestions.forEach((q: string) => {
                      responseContent += `   - ${q}\n`;
                    });
                  }
                  responseContent += '\n';
                }
              );
            } else {
              responseContent += 'No significant knowledge gaps detected.';
            }
          }
          break;

        case '/tag':
        case '/tags':
          if (!currentNoteId) {
            responseContent = '⚠️ No note is currently open. Open a note to suggest tags.';
          } else {
            responseContent = '🏷️ Analyzing content for tag suggestions...\n\n';
            const response = await fetch('/api/ai/tags', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ noteId: currentNoteId }),
            });
            const data = await response.json();

            if (data.success && data.tags?.length > 0) {
              responseContent += '**Suggested Tags:**\n\n';
              data.tags.forEach((tag: { tag: string; confidence: number; reason: string }) => {
                responseContent += `• #${tag.tag} (${Math.round(tag.confidence * 100)}%)\n  ${tag.reason}\n\n`;
              });
              responseContent += '\n💡 *Copy and paste the tags you want to add to your note.*';
            } else {
              responseContent += 'Could not generate tag suggestions.';
            }
          }
          break;

        case '/link':
        case '/links':
          if (!currentNoteId) {
            responseContent = '⚠️ No note is currently open. Open a note to suggest links.';
          } else {
            responseContent = '🔗 Finding linkable concepts...\n\n';
            const response = await fetch('/api/ai/links', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ noteId: currentNoteId }),
            });
            const data = await response.json();

            if (data.success && data.suggestions?.length > 0) {
              responseContent += '**Suggested Wikilinks:**\n\n';
              data.suggestions.forEach(
                (link: { text: string; targetNote: string; confidence: number }) => {
                  responseContent += `• Replace "${link.text}" with [[${link.targetNote}]] (${Math.round(link.confidence * 100)}%)\n\n`;
                }
              );
              responseContent += '\n💡 *Manually add these [[wikilinks]] to your note.*';
            } else {
              responseContent += 'No link suggestions found.';
            }
          }
          break;

        case '/expand':
          if (!args) {
            responseContent =
              '⚠️ Usage: `/expand <text to expand>`\n\nExample: `/expand Machine learning is a subset of AI`';
          } else {
            responseContent = '✨ Expanding your content...\n\n';
            const response = await fetch('/api/ai/expand', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: args,
                noteId: currentNoteId,
              }),
            });
            const data = await response.json();

            if (data.success && data.expanded) {
              responseContent += '**Expanded Version:**\n\n';
              responseContent += data.expanded;
              responseContent += '\n\n💡 *Copy this expanded text to your note.*';
            } else {
              responseContent += 'Failed to expand content.';
            }
          }
          break;

        case '/summarize':
        case '/summary':
          if (!currentNoteId) {
            responseContent = '⚠️ No note is currently open. Open a note to summarize it.';
          } else {
            responseContent = '📝 Creating summary...\n\n';
            const response = await fetch('/api/ai/summarize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ noteId: currentNoteId }),
            });
            const data = await response.json();

            if (data.success && data.summary) {
              responseContent += '**Summary:**\n\n';
              responseContent += data.summary;
            } else {
              responseContent += 'Failed to generate summary.';
            }
          }
          break;

        case '/help':
        case '/?':
          responseContent = `**🤖 AI Assistant Quick Commands**

• \`/connections\` - Find related notes based on content
• \`/gaps\` - Identify knowledge gaps in current note
• \`/tag\` - Suggest relevant tags for current note
• \`/link\` - Suggest wikilinks to other notes
• \`/expand <text>\` - Expand a section with more detail
• \`/summarize\` - Summarize current note
• \`/help\` - Show this help message

**💡 Tips:**
- These commands work best with the current note open
- Commands use AI to analyze your knowledge base
- Results are context-aware based on your notes

**Regular Chat:**
Just type naturally without "/" to have a conversation!`;
          break;

        default:
          responseContent = `❓ Unknown command: ${cmd}\n\nType \`/help\` to see available commands.`;
      }

      // Add AI response
      const aiMessage: AIMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
      };

      setCurrentSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, aiMessage],
          updatedAt: new Date().toISOString(),
        };
      });

      analytics.trackEvent('ai_chat', {
        action: 'quick_command',
        command: cmd,
      });
    } catch (error) {
      console.error('Quick command error:', error);
      setError(error instanceof Error ? error.message : 'Command failed');

      // Add error message
      const errorMessage: AIMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: `❌ Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };

      setCurrentSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, errorMessage],
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);

    // Save the partial message if we have one
    if (streamingMessage && currentSession) {
      const assistantMessage: AIMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: streamingMessage + '\n\n[Generation stopped by user]',
        timestamp: new Date().toISOString(),
        model: settings?.model || 'unknown',
      };

      setCurrentSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          updatedAt: new Date().toISOString(),
        };
      });

      setStreamingMessage('');
      loadSessions();
    }
  };

  const sendMessage = async () => {
    console.log('[AIChat] sendMessage called', {
      hasMessage: !!message.trim(),
      isLoading,
      provider: settings?.provider,
      hasSettings: !!settings,
      currentNoteId,
    });

    if (!message.trim() || isLoading) return;

    // Check if AI is configured (allow Ollama without API key)
    if (!settings?.apiKey && settings?.provider !== 'ollama') {
      setError(
        'AI provider not configured. Please configure in settings: OpenAI/Anthropic/Gemini (API key required) or Ollama (local, no API key needed).'
      );
      setShowSettings(true);
      return;
    }

    const trimmedMessage = message.trim();

    // Check for quick commands
    if (trimmedMessage.startsWith('/')) {
      await handleQuickCommand(trimmedMessage);
      return;
    }

    const useStreaming = settings?.provider === 'ollama' && settings?.enableStreaming !== false;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
      });
    } else {
      // Create new session
      const newSession: ChatSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: message.length > 50 ? message.substring(0, 47) + '...' : message,
        messages: [userMessage],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalTokens: 0,
        totalCost: 0,
        noteContext: currentNoteId,
      };
      setCurrentSession(newSession);
    }

    const currentMessage = message.trim();
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // For Ollama, use direct browser connection (server can't reach it)
      if (settings?.provider === 'ollama') {
        console.log('[AIChat] Using Ollama provider');
        const ollamaUrl = (settings?.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
        const model = settings?.model || 'llama3.2';

        // Build context from current note if available
        let noteContextMessage = '';
        if (currentNoteId && currentNoteContent) {
          noteContextMessage = `\n\n[Current Note Context: "${currentNoteName || currentNoteId}"]\n${currentNoteContent.slice(0, 1500)}\n[End of Note Context]\n\n`;
          console.log('[AIChat] Added note context to message, length:', noteContextMessage.length);
        }

        // Build messages for Ollama
        const ollamaMessages = [
          {
            role: 'system',
            content:
              'You are a helpful AI assistant integrated into MarkItUp, a personal knowledge management system.' +
              (noteContextMessage
                ? ' The user has a note open, and its content is provided for context.'
                : ''),
          },
          // Include previous messages from current session
          ...(currentSession?.messages || []).map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: noteContextMessage + currentMessage,
          },
        ];

        if (useStreaming) {
          // Direct streaming to Ollama
          setIsStreaming(true);
          setStreamingMessage('');

          // Create abort controller for this request
          abortControllerRef.current = new AbortController();

          const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              messages: ollamaMessages,
              stream: true,
            }),
            signal: abortControllerRef.current.signal,
          });

          if (!response.ok || !response.body) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullContent = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);

                if (data.message?.content) {
                  fullContent += data.message.content;
                  setStreamingMessage(fullContent);
                }

                if (data.done) {
                  // Finalize the message
                  const assistantMessage: AIMessage = {
                    id: `ai_${Date.now()}`,
                    role: 'assistant',
                    content: fullContent,
                    timestamp: new Date().toISOString(),
                    model,
                  };

                  setCurrentSession(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      messages: [...prev.messages, assistantMessage],
                      updatedAt: new Date().toISOString(),
                    };
                  });

                  setStreamingMessage('');
                  setIsStreaming(false);
                  loadSessions();
                }
              } catch (e) {
                console.warn('Failed to parse Ollama streaming chunk:', e);
              }
            }
          }
        } else {
          // Non-streaming Ollama request
          const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              messages: ollamaMessages,
              stream: false,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          const assistantMessage: AIMessage = {
            id: `ai_${Date.now()}`,
            role: 'assistant',
            content: data.message?.content || '',
            timestamp: new Date().toISOString(),
            model,
          };

          setCurrentSession(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [...prev.messages, assistantMessage],
              updatedAt: new Date().toISOString(),
            };
          });

          loadSessions();
        }
      } else if (useStreaming) {
        // Streaming mode for Ollama
        setIsStreaming(true);
        setStreamingMessage('');

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentMessage,
            sessionId: currentSession?.id,
            noteContext: currentNoteId,
            includeContext: true,
            stream: true,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.content) {
                  fullContent += data.content;
                  setStreamingMessage(fullContent);
                }

                if (data.done) {
                  // Finalize the message
                  const assistantMessage: AIMessage = {
                    id: `ai_${Date.now()}`,
                    role: 'assistant',
                    content: fullContent,
                    timestamp: new Date().toISOString(),
                    tokens: data.usage?.totalTokens,
                    model: data.model,
                  };

                  setCurrentSession(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      messages: [...prev.messages, assistantMessage],
                      updatedAt: new Date().toISOString(),
                      totalTokens: prev.totalTokens + (data.usage?.totalTokens || 0),
                      totalCost: prev.totalCost + (data.usage?.estimatedCost || 0),
                    };
                  });

                  setStreamingMessage('');
                  setIsStreaming(false);
                  loadSessions();
                }
              } catch (e) {
                console.warn('Failed to parse streaming chunk:', e);
              }
            }
          }
        }
      } else {
        // Non-streaming mode (default for all providers)
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentMessage,
            sessionId: currentSession?.id,
            noteContext: currentNoteId,
            includeContext: true,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Add assistant response to current session
          const assistantMessage: AIMessage = {
            id: data.data.id,
            role: 'assistant',
            content: data.data.content,
            timestamp: data.data.timestamp,
            tokens: data.data.usage.totalTokens,
            model: data.data.model,
          };

          setCurrentSession(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [...prev.messages, assistantMessage],
              updatedAt: new Date().toISOString(),
              totalTokens: prev.totalTokens + data.data.usage.totalTokens,
              totalCost: prev.totalCost + data.data.usage.estimatedCost,
            };
          });

          loadSessions();
        } else {
          setError(data.error?.message || 'Failed to send message');
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      // Don't show error if user aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted by user');
        return;
      }

      setError(error instanceof Error ? error.message : 'Failed to connect to AI service');
      setIsStreaming(false);
      setStreamingMessage('');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!window.confirm('Delete this conversation? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/ai?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
        }

        analytics.trackEvent('ai_chat', {
          action: 'delete_session',
        });
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 ${className}`}
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      }}
    >
      {/* Header */}
      <div
        className="flex flex-col border-b border-gray-200 dark:border-gray-700"
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2
              className="font-semibold text-gray-900 dark:text-white"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              AI Assistant
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Chat History"
            >
              <History className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={createNewSession}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Note context indicator */}
        {currentNoteId && (
          <div
            className="px-4 pb-3 flex items-center gap-2 text-xs"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Context: Note {currentNoteId.replace('.md', '')}</span>
          </div>
        )}
      </div>

      {/* Sessions sidebar */}
      {showSessions && (
        <div
          className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform -translate-x-full z-10"
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          }}
        >
          <div
            className="p-4 border-b border-gray-200 dark:border-gray-700"
            style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="font-medium text-gray-900 dark:text-white"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                Chat History
              </h3>
              <button
                onClick={() => setShowSessions(false)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length === 0 ? (
              <p
                className="text-sm text-center py-8"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                No conversations yet
              </p>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors group ${
                    currentSession?.id === session.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setCurrentSession(session);
                    setShowSessions(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-medium text-sm truncate"
                        style={{
                          color:
                            currentSession?.id === session.id
                              ? theme === 'dark'
                                ? '#93c5fd'
                                : '#1d4ed8'
                              : theme === 'dark'
                                ? '#f9fafb'
                                : '#111827',
                        }}
                      >
                        {session.title}
                      </h4>
                      <p
                        className="text-xs mt-1"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                      {session.noteContext && (
                        <div className="flex items-center gap-1 mt-1">
                          <LinkIcon className="w-3 h-3 text-gray-400" />
                          <span
                            className="text-xs"
                            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                          >
                            Linked to note
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <AISettingsPanel
          settings={settings}
          onSettingsChange={newSettings => {
            setSettings(newSettings);
            setShowSettings(false);
            // Reload settings to ensure they're persisted
            loadSettings();
          }}
          onClose={() => setShowSettings(false)}
          theme={theme}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Brain className="w-12 h-12 text-gray-400 mb-4" />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              AI Assistant Ready
            </h3>
            <p className="text-sm mb-4" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              {currentNoteId
                ? 'I have access to your current note. Ask questions or use commands!'
                : 'Open a note to enable context-aware assistance'}
            </p>
            <div
              className="text-xs space-y-1 mb-4"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              <p>
                <strong>Quick Commands:</strong>
              </p>
              <p>
                • Type{' '}
                <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">/help</code> to
                see all commands
              </p>
              <p>
                • Try <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">/tag</code>
                ,{' '}
                <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                  /connections
                </code>
                , or <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">/gaps</code>
              </p>
            </div>
            {currentNoteId && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                }}
              >
                <LinkIcon className="w-4 h-4" />
                <span>📝 Note context active</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {currentSession.messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} theme={theme} />
            ))}
            {/* Streaming message display */}
            {isStreaming && streamingMessage && (
              <div className="flex justify-start">
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                  }`}
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-1" />
                    <div className="whitespace-pre-wrap break-words text-sm">
                      {streamingMessage}
                      <span className="inline-block w-1 h-4 bg-current animate-pulse ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          className="mx-4 p-3 rounded-lg border border-red-200 dark:border-red-800 mb-4"
          style={{
            backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
            borderColor: theme === 'dark' ? '#7f1d1d' : '#fecaca',
          }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="p-4 border-t border-gray-200 dark:border-gray-700"
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
      >
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading || isStreaming}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
              minHeight: '38px',
              maxHeight: '120px',
            }}
            rows={1}
          />
          <button
            onClick={isStreaming ? stopGeneration : sendMessage}
            disabled={(!message.trim() && !isStreaming) || (isLoading && !isStreaming)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={isStreaming ? 'Stop generation' : 'Send message'}
          >
            {isStreaming ? (
              <X className="w-4 h-4" />
            ) : isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Chat message component
function ChatMessage({ message, theme }: { message: AIMessage; theme: string }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : theme === 'dark'
              ? 'bg-gray-700 text-gray-100'
              : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        {message.tokens && (
          <div
            className={`text-xs mt-1 opacity-70 ${
              isUser ? 'text-blue-100' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {message.tokens} tokens • {message.model}
          </div>
        )}
      </div>
    </div>
  );
}

// Settings panel component
function AISettingsPanel({
  settings,
  onSettingsChange,
  onClose,
  theme,
}: {
  settings: AISettings | null;
  onSettingsChange: (settings: AISettings) => void;
  onClose: () => void;
  theme: string;
}) {
  const [formData, setFormData] = useState(
    settings || {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: '',
      maxTokens: 1000,
      temperature: 0.7,
      enableContext: true,
      maxContextNotes: 5,
      contextSearchDepth: 10,
      enableUsageTracking: true,
      monthlyLimit: 10.0,
      enableLocalFallback: false,
      ollamaUrl: 'http://localhost:11434',
      ollamaAdvancedOptions: {
        num_ctx: 2048,
        repeat_penalty: 1.1,
        num_gpu: 0,
      },
    }
  );

  const [ollamaModels, setOllamaModels] = useState<
    { value: string; label: string; description?: string }[]
  >([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    message: string;
  } | null>(null);
  const [pullingModel, setPullingModel] = useState(false);
  const [pullProgress, setPullProgress] = useState<string>('');
  const [modelToPull, setModelToPull] = useState('');
  const [showAdvancedOllama, setShowAdvancedOllama] = useState(false);

  // V3.0 Enhancement states
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [showModelLibrary, setShowModelLibrary] = useState(false);
  const [showAutoDiscovery, setShowAutoDiscovery] = useState(false);
  const [showVectorSearchSettings, setShowVectorSearchSettings] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoveredServers, setDiscoveredServers] = useState<
    Array<{
      url: string;
      name?: string;
      version?: string;
      modelCount?: number;
      responseTime: number;
    }>
  >([]);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [modelLibrary, setModelLibrary] = useState<
    Array<{
      name: string;
      displayName: string;
      description: string;
      tags: string[];
      size?: string;
      parameterSize?: string;
      isInstalled: boolean;
    }>
  >([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [contextUsage, setContextUsage] = useState<{
    used: number;
    limit: number;
    percentage: number;
    warning: boolean;
  } | null>(null);

  // Sync formData with settings when settings change
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const fetchOllamaModels = useCallback(async () => {
    setLoadingModels(true);
    setModelError(null);

    try {
      // Normalize URL: remove trailing slash
      const ollamaUrl = (formData.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');

      // Try direct connection first
      let data: {
        models?: Array<{
          name: string;
          size?: number;
          details?: { parameter_size?: string; quantization_level?: string };
        }>;
      } | null = null;

      try {
        const directResponse = await fetch(`${ollamaUrl}/api/tags`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (directResponse.ok) {
          data = await directResponse.json();
        } else {
          throw new Error('Direct connection failed, trying proxy...');
        }
      } catch {
        // Fall back to proxy endpoint
        const response = await fetch('/api/ai/ollama-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ollamaUrl,
            endpoint: '/api/tags',
            method: 'GET',
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to connect to Ollama server');
        }

        data = result.data;
      }

      if (!data) {
        throw new Error('No data received from Ollama server');
      }

      const models = data.models || [];

      if (models.length === 0) {
        setModelError('No models found. Please pull a model first (e.g., ollama pull llama3.2)');
        setOllamaModels([]);
      } else {
        setOllamaModels(
          models.map(
            (model: {
              name: string;
              size?: number;
              details?: { parameter_size?: string; quantization_level?: string };
            }) => {
              const sizeGB = model.size ? (model.size / (1024 * 1024 * 1024)).toFixed(1) : null;
              const paramSize = model.details?.parameter_size || '';
              const quant = model.details?.quantization_level || '';

              let description = '';
              if (paramSize) description += paramSize;
              if (sizeGB) description += ` - ${sizeGB}GB`;
              if (quant) description += ` (${quant})`;

              return {
                value: model.name,
                label: model.name,
                description: description || undefined,
              };
            }
          )
        );

        // If current model is not in the list, set to the first available model
        if (!models.find((m: { name: string }) => m.name === formData.model)) {
          setFormData(prev => ({ ...prev, model: models[0].name }));
        }
      }
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      setModelError(error instanceof Error ? error.message : 'Failed to fetch models from Ollama');
      setOllamaModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, [formData.ollamaUrl, formData.model]);

  // Test Ollama connection
  const testOllamaConnection = useCallback(async () => {
    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      // Normalize URL: remove trailing slash
      const ollamaUrl = (formData.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');

      // Try direct connection first (works when browser can reach Ollama)
      let result: {
        success: boolean;
        data?: { models?: unknown[]; version?: string };
        error?: string;
        helpText?: string;
      };

      try {
        console.log('🔍 Testing direct connection to:', ollamaUrl);
        const directResponse = await fetch(`${ollamaUrl}/api/tags`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('✅ Direct response status:', directResponse.status);
        if (directResponse.ok) {
          const data = await directResponse.json();
          console.log('✅ Direct connection successful:', data);
          result = { success: true, data };
        } else {
          console.warn('⚠️ Direct connection failed with status:', directResponse.status);
          throw new Error('Direct connection failed, trying proxy...');
        }
      } catch (directError) {
        // Fall back to proxy endpoint if direct connection fails (CORS or network issues)
        console.log('⚠️ Direct connection failed, trying proxy...', directError);
        const response = await fetch('/api/ai/ollama-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ollamaUrl,
            endpoint: '/api/tags',
            method: 'GET',
          }),
        });

        result = await response.json();
        console.log('📡 Proxy response:', result);
      }

      if (result.success && result.data) {
        const data = result.data;
        const modelCount = data.models?.length || 0;

        // Try to get version info for more details
        let versionInfo = '';
        try {
          // Try direct connection for version
          let versionData: { version?: string } | null = null;

          try {
            const directVersionResponse = await fetch(`${ollamaUrl}/api/version`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (directVersionResponse.ok) {
              versionData = await directVersionResponse.json();
            }
          } catch {
            // Fall back to proxy
            const versionResponse = await fetch('/api/ai/ollama-proxy', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ollamaUrl,
                endpoint: '/api/version',
                method: 'GET',
              }),
            });

            const versionResult = await versionResponse.json();
            if (versionResult.success && versionResult.data) {
              versionData = versionResult.data;
            }
          }

          if (versionData && versionData.version) {
            versionInfo = ` (v${versionData.version})`;
          }
        } catch {
          // Version endpoint might not exist
        }

        setConnectionStatus({
          connected: true,
          message: `✓ Connected${versionInfo}! Found ${modelCount} model${modelCount !== 1 ? 's' : ''}`,
        });

        // Auto-save settings on successful connection
        try {
          // Normalize the Ollama URL before saving
          const normalizedSettings = {
            ...formData,
            ollamaUrl:
              formData.ollamaUrl && !formData.ollamaUrl.match(/^https?:\/\//)
                ? `http://${formData.ollamaUrl}`
                : formData.ollamaUrl,
          };

          // Save to server
          await fetch('/api/ai?action=settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(normalizedSettings),
          });

          // ALSO save directly to localStorage (since server-side localStorage doesn't work)
          localStorage.setItem('markitup-ai-settings', JSON.stringify(normalizedSettings));
          console.log('[AIChat] Auto-saved Ollama settings to localStorage:', normalizedSettings);
        } catch (error) {
          console.error('[AIChat] Failed to auto-save settings:', error);
        }

        // Auto-fetch models if connected
        if (modelCount > 0) {
          fetchOllamaModels();
        }
      } else {
        setConnectionStatus({
          connected: false,
          message: result.helpText ? `✗ ${result.error} → ${result.helpText}` : `✗ ${result.error}`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionStatus({
        connected: false,
        message: `✗ ${errorMessage}`,
      });
    } finally {
      setTestingConnection(false);
    }
  }, [formData.ollamaUrl, fetchOllamaModels]);

  // Pull a model from Ollama
  const handlePullModel = useCallback(async () => {
    if (!modelToPull.trim()) return;

    setPullingModel(true);
    setPullProgress('Starting download...');

    try {
      // Normalize URL: remove trailing slash
      const ollamaUrl = (formData.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');

      // Try direct connection first (works when browser can reach Ollama)
      let response: Response;

      try {
        response = await fetch(`${ollamaUrl}/api/pull`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modelToPull, stream: true }),
        });

        if (!response.ok) {
          throw new Error('Direct connection failed, trying proxy...');
        }
      } catch {
        // Fall back to proxy endpoint
        response = await fetch('/api/ai/ollama-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ollamaUrl,
            endpoint: '/api/pull',
            method: 'POST',
            data: { name: modelToPull, stream: true },
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.status) {
                if (data.total && data.completed) {
                  const percent = ((data.completed / data.total) * 100).toFixed(0);
                  setPullProgress(`${data.status}: ${percent}%`);
                } else {
                  setPullProgress(data.status);
                }
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      setPullProgress('✓ Download complete!');
      setModelToPull('');

      // Refresh models after successful pull
      setTimeout(() => {
        fetchOllamaModels();
        setPullingModel(false);
        setPullProgress('');
      }, 2000);
    } catch (error) {
      setPullProgress(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => {
        setPullingModel(false);
        setPullProgress('');
      }, 3000);
    }
  }, [modelToPull, formData.ollamaUrl, fetchOllamaModels]);

  // V3.0 Enhancement Functions
  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) return;

    const newPreset = {
      id: `preset_${Date.now()}`,
      name: presetName.trim(),
      url: formData.ollamaUrl || 'http://localhost:11434',
      description: presetDescription.trim() || undefined,
      createdAt: new Date().toISOString(),
      isDefault: (formData.ollamaPresets || []).length === 0,
    };

    const updatedPresets = [...(formData.ollamaPresets || []), newPreset];
    setFormData({ ...formData, ollamaPresets: updatedPresets, activeOllamaPreset: newPreset.id });
    setPresetName('');
    setPresetDescription('');
  }, [presetName, presetDescription, formData]);

  const handleLoadPreset = useCallback(
    (presetId: string) => {
      const preset = formData.ollamaPresets?.find(p => p.id === presetId);
      if (preset) {
        setFormData({ ...formData, ollamaUrl: preset.url, activeOllamaPreset: presetId });
        // Update lastUsed
        const updatedPresets = formData.ollamaPresets?.map(p =>
          p.id === presetId ? { ...p, lastUsed: new Date().toISOString() } : p
        );
        setFormData({
          ...formData,
          ollamaPresets: updatedPresets,
          ollamaUrl: preset.url,
          activeOllamaPreset: presetId,
        });
      }
    },
    [formData]
  );

  const handleDeletePreset = useCallback(
    (presetId: string) => {
      const updatedPresets = formData.ollamaPresets?.filter(p => p.id !== presetId);
      setFormData({
        ...formData,
        ollamaPresets: updatedPresets,
        activeOllamaPreset:
          formData.activeOllamaPreset === presetId ? undefined : formData.activeOllamaPreset,
      });
    },
    [formData]
  );

  const handleDiscoverServers = useCallback(async () => {
    setDiscovering(true);
    setDiscoveredServers([]);

    try {
      // Simulate server discovery (in real implementation, use OllamaProvider.discoverServers())
      const commonUrls = ['http://localhost:11434', 'http://127.0.0.1:11434'];

      const results = await Promise.all(
        commonUrls.map(async url => {
          try {
            const startTime = Date.now();
            const response = await fetch(`${url}/api/tags`, {
              method: 'GET',
              signal: AbortSignal.timeout(3000),
            });

            if (response.ok) {
              const data = await response.json();
              const responseTime = Date.now() - startTime;

              // Try to get version
              let version: string | undefined;
              try {
                const versionResponse = await fetch(`${url}/api/version`);
                if (versionResponse.ok) {
                  const versionData = await versionResponse.json();
                  version = versionData.version;
                }
              } catch {
                // Ignore
              }

              return {
                url,
                name: `Ollama Server (${new URL(url).hostname})`,
                version,
                modelCount: data.models?.length || 0,
                responseTime,
              };
            }
          } catch {
            // Server not available
          }
          return null;
        })
      );

      const found = results.filter((r): r is NonNullable<typeof r> => r !== null);
      setDiscoveredServers(found);
    } catch (error) {
      console.error('Error discovering servers:', error);
    } finally {
      setDiscovering(false);
    }
  }, []);

  const handleLoadModelLibrary = useCallback(async () => {
    setLoadingLibrary(true);
    try {
      // Curated model library (in real implementation, use OllamaProvider.getModelLibrary())
      const installedModels = ollamaModels.map(m => m.value);

      const library = [
        {
          name: 'llama3.2',
          displayName: 'Llama 3.2',
          description: "Meta's latest Llama model, excellent general-purpose AI",
          tags: ['general', 'chat', 'recommended'],
          size: '2.0 GB',
          parameterSize: '3B',
          isInstalled: installedModels.includes('llama3.2'),
        },
        {
          name: 'codellama',
          displayName: 'Code Llama',
          description: 'Specialized for code generation and programming',
          tags: ['code', 'programming'],
          size: '3.8 GB',
          parameterSize: '7B',
          isInstalled: installedModels.includes('codellama'),
        },
        {
          name: 'mistral',
          displayName: 'Mistral 7B',
          description: 'Efficient and powerful for general tasks',
          tags: ['general', 'efficient'],
          size: '4.1 GB',
          parameterSize: '7B',
          isInstalled: installedModels.includes('mistral'),
        },
        {
          name: 'phi3',
          displayName: 'Phi-3',
          description: "Microsoft's compact but capable model",
          tags: ['general', 'compact'],
          size: '2.3 GB',
          parameterSize: '3.8B',
          isInstalled: installedModels.includes('phi3'),
        },
      ];

      setModelLibrary(library);
    } catch (error) {
      console.error('Error loading model library:', error);
    } finally {
      setLoadingLibrary(false);
    }
  }, [ollamaModels]);

  const handleInstallFromLibrary = useCallback(
    async (modelName: string) => {
      setModelToPull(modelName);
      await handlePullModel();
    },
    [handlePullModel]
  );

  // Update context usage when session changes
  // TODO: Integrate with session state properly
  useEffect(() => {
    if (formData.provider === 'ollama') {
      // Placeholder for context tracking
      // Will be activated when integrated with message history
      setContextUsage(null);
    }
  }, [formData.provider]);

  // Fetch Ollama models when provider is Ollama or URL changes
  useEffect(() => {
    if (formData.provider === 'ollama') {
      fetchOllamaModels();
    }
  }, [formData.provider, fetchOllamaModels]);

  // Model options based on selected provider
  const getModelOptions = () => {
    switch (formData.provider) {
      case 'openai':
        return [
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast & Affordable)' },
          { value: 'gpt-4', label: 'GPT-4 (Most Capable)' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Balanced)' },
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Best)' },
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Powerful)' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (Balanced)' },
          { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
        ];
      case 'gemini':
        return [
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Most Capable)' },
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
          { value: 'gemini-pro', label: 'Gemini Pro (Balanced)' },
        ];
      case 'ollama':
        // Return dynamically fetched models if available, otherwise return empty
        if (ollamaModels.length > 0) {
          return ollamaModels;
        }
        return [];
      default:
        return [{ value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }];
    }
  };

  const handleProviderChange = (newProvider: string) => {
    // Set default model for the new provider
    const defaultModels: Record<string, string> = {
      openai: 'gpt-3.5-turbo',
      anthropic: 'claude-3-5-sonnet-20241022',
      gemini: 'gemini-1.5-flash',
      ollama: '', // Will be set when models are fetched
    };

    setFormData({
      ...formData,
      provider: newProvider,
      model: defaultModels[newProvider] || 'gpt-3.5-turbo',
      apiKey: newProvider === 'ollama' ? '' : formData.apiKey,
      ollamaUrl:
        newProvider === 'ollama'
          ? formData.ollamaUrl || 'http://localhost:11434'
          : formData.ollamaUrl,
    });
  };

  const handleSave = async () => {
    try {
      // Save to server
      const response = await fetch('/api/ai?action=settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // ALSO save directly to localStorage (since server-side localStorage doesn't work)
        localStorage.setItem('markitup-ai-settings', JSON.stringify(formData));
        console.log('[AIChat] Saved settings to localStorage:', formData);

        onSettingsChange(formData);
        analytics.trackEvent('ai_settings_changed', {
          provider: formData.provider,
          model: formData.model,
          enableContext: formData.enableContext,
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <div
      className="absolute inset-0 bg-white dark:bg-gray-800 z-20 flex flex-col"
      style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
    >
      <div
        className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
      >
        <h3
          className="font-medium text-gray-900 dark:text-white"
          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
        >
          AI Settings
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            AI Provider
          </label>
          <select
            value={formData.provider}
            onChange={e => handleProviderChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
            }}
          >
            <option value="openai">OpenAI (GPT-3.5, GPT-4) - API Key Required</option>
            <option value="anthropic">Anthropic (Claude) - API Key Required</option>
            <option value="gemini">Google Gemini - API Key Required</option>
            <option value="ollama">Ollama (Local) - No API Key Needed!</option>
          </select>
          {formData.provider === 'ollama' && (
            <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <span>✓</span>
              <span>
                Ollama runs locally on your machine - no API keys, no cloud fees, complete privacy!
              </span>
            </p>
          )}
          {formData.provider !== 'ollama' && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>ℹ</span>
              <span>
                This provider requires an API key. Consider Ollama for local, free AI without API
                keys.
              </span>
            </p>
          )}
        </div>

        {formData.provider !== 'ollama' && (
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              API Key
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder={`Enter your ${formData.provider === 'openai' ? 'OpenAI' : formData.provider === 'anthropic' ? 'Anthropic' : 'Google'} API key`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                color: theme === 'dark' ? '#f9fafb' : '#111827',
                borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
              }}
            />
          </div>
        )}

        {formData.provider === 'ollama' && (
          <>
            {/* Server Presets */}
            {formData.ollamaPresets && formData.ollamaPresets.length > 0 && (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  🖥️ Saved Server Presets
                </label>
                <div className="flex gap-2 flex-wrap">
                  {formData.ollamaPresets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          ollamaUrl: preset.url,
                          activeOllamaPreset: preset.id,
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        formData.activeOllamaPreset === preset.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-sm font-medium"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  Ollama Server URL
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const name = prompt('Enter a name for this server preset:');
                      if (name) {
                        const newPreset = {
                          id: `preset_${Date.now()}`,
                          name,
                          url: formData.ollamaUrl || 'http://localhost:11434',
                          createdAt: new Date().toISOString(),
                        };
                        setFormData({
                          ...formData,
                          ollamaPresets: [...(formData.ollamaPresets || []), newPreset],
                          activeOllamaPreset: newPreset.id,
                        });
                      }
                    }}
                    className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                    title="Save current URL as preset"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={testOllamaConnection}
                    disabled={testingConnection}
                    className="text-xs px-3 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50 transition-colors font-medium"
                  >
                    {testingConnection ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Testing...
                      </span>
                    ) : (
                      '🔌 Test'
                    )}
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={formData.ollamaUrl || 'http://localhost:11434'}
                onChange={e => setFormData({ ...formData, ollamaUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                  color: theme === 'dark' ? '#f9fafb' : '#111827',
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                }}
              />
              {connectionStatus && (
                <p
                  className={`text-xs mt-1 font-medium ${
                    connectionStatus.connected
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {connectionStatus.message}
                </p>
              )}
              <p
                className="text-xs mt-1"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                Enter your custom Ollama server URL or save as preset for quick access
              </p>
            </div>

            {/* Streaming Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-300 dark:border-gray-600">
              <div>
                <label
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  htmlFor="streaming-toggle"
                >
                  🌊 Enable Streaming
                </label>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  See AI responses in real-time as they're generated
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="streaming-toggle"
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.enableStreaming !== false}
                  onChange={e => setFormData({ ...formData, enableStreaming: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Model Pull Interface */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-sm font-medium"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  📥 Download New Model
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modelToPull}
                  onChange={e => setModelToPull(e.target.value)}
                  placeholder="e.g., llama3.2, mistral, codellama"
                  disabled={pullingModel}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  }}
                />
                <button
                  onClick={handlePullModel}
                  disabled={pullingModel || !modelToPull.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  {pullingModel ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pull'}
                </button>
              </div>
              {pullProgress && (
                <p
                  className="text-xs mt-2 font-medium"
                  style={{ color: theme === 'dark' ? '#93c5fd' : '#1e40af' }}
                >
                  {pullProgress}
                </p>
              )}
            </div>

            {/* Advanced Ollama Settings */}
            <div>
              <button
                onClick={() => setShowAdvancedOllama(!showAdvancedOllama)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  ⚙️ Advanced Ollama Options
                </span>
                <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  {showAdvancedOllama ? '▼' : '▶'}
                </span>
              </button>
              {showAdvancedOllama && (
                <div className="mt-2 space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Context Window (num_ctx): {formData.ollamaAdvancedOptions?.num_ctx || 2048}
                    </label>
                    <input
                      type="range"
                      min="512"
                      max="32768"
                      step="512"
                      value={formData.ollamaAdvancedOptions?.num_ctx || 2048}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          ollamaAdvancedOptions: {
                            ...formData.ollamaAdvancedOptions,
                            num_ctx: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      Repeat Penalty: {formData.ollamaAdvancedOptions?.repeat_penalty || 1.1}
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="2.0"
                      step="0.1"
                      value={formData.ollamaAdvancedOptions?.repeat_penalty || 1.1}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          ollamaAdvancedOptions: {
                            ...formData.ollamaAdvancedOptions,
                            repeat_penalty: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      GPU Layers (num_gpu): {formData.ollamaAdvancedOptions?.num_gpu || 0}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.ollamaAdvancedOptions?.num_gpu || 0}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          ollamaAdvancedOptions: {
                            ...formData.ollamaAdvancedOptions,
                            num_gpu: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full px-2 py-1 border rounded text-sm"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                        color: theme === 'dark' ? '#f9fafb' : '#111827',
                        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                      }}
                    />
                    <p
                      className="text-xs mt-1"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Set to 0 for auto-detection, or specify layers for GPU acceleration
                    </p>
                  </div>
                </div>
              )}
            </div>

            {modelError && (
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
                  borderColor: theme === 'dark' ? '#7f1d1d' : '#fecaca',
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{modelError}</p>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm" style={{ color: theme === 'dark' ? '#93c5fd' : '#1e40af' }}>
                💡 Make sure Ollama is installed and running. Use the download feature above to pull
                models directly from the UI!
              </p>
            </div>
          </>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              className="block text-sm font-medium"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Model
            </label>
            {formData.provider === 'ollama' && (
              <button
                onClick={fetchOllamaModels}
                disabled={loadingModels}
                className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
                title="Refresh models from Ollama"
              >
                {loadingModels ? <Loader2 className="w-3 h-3 animate-spin inline" /> : '↻ Refresh'}
              </button>
            )}
          </div>
          <select
            value={formData.model}
            onChange={e => setFormData({ ...formData, model: e.target.value })}
            disabled={
              formData.provider === 'ollama' && (loadingModels || ollamaModels.length === 0)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
              color: theme === 'dark' ? '#f9fafb' : '#111827',
              borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
            }}
          >
            {loadingModels && formData.provider === 'ollama' ? (
              <option>Loading models...</option>
            ) : getModelOptions().length === 0 && formData.provider === 'ollama' ? (
              <option>No models found</option>
            ) : (
              getModelOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                  {option.description ? ` - ${option.description}` : ''}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableContext"
            checked={formData.enableContext}
            onChange={e => setFormData({ ...formData, enableContext: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label
            htmlFor="enableContext"
            className="text-sm"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Include note context in conversations
          </label>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Max Context Notes: {formData.maxContextNotes}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.maxContextNotes}
            onChange={e => setFormData({ ...formData, maxContextNotes: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Temperature: {formData.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={formData.temperature}
            onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Focused</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Vector Search Settings Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowVectorSearchSettings(!showVectorSearchSettings)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <span
              className="text-sm font-medium"
              style={{ color: theme === 'dark' ? '#d8b4fe' : '#7e22ce' }}
            >
              🧠 Vector Search Settings
            </span>
            <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              {showVectorSearchSettings ? '▼' : '▶'}
            </span>
          </button>

          {showVectorSearchSettings && (
            <div className="mt-4">
              <VectorSearchSettings />
            </div>
          )}
        </div>
      </div>

      <div
        className="p-4 border-t border-gray-200 dark:border-gray-700"
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
      >
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
