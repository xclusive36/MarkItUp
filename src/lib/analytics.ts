// Advanced Analytics System for MarkItUp PKM
import { Note, Link, Tag, SearchResult } from './types';

// Analytics Data Types
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  data: Record<string, any>;
  sessionId: string;
  userId?: string;
}

export type AnalyticsEventType =
  | 'note_created'
  | 'note_updated'
  | 'note_deleted'
  | 'note_viewed'
  | 'note_edited'
  | 'search_performed'
  | 'search_completed'
  | 'search_error'
  | 'global_search_opened'
  | 'link_clicked'
  | 'wikilink_created'
  | 'tag_added'
  | 'tag_removed'
  | 'graph_viewed'
  | 'export_performed'
  | 'session_started'
  | 'session_ended'
  | 'mode_switched'
  | 'theme_changed'
  | 'collaboration_joined'
  | 'collaboration_left'
  | 'ai_chat'
  | 'ai_error'
  | 'ai_analysis'
  | 'ai_settings_changed';

export interface AnalyticsMetrics {
  // Writing & Content Metrics
  totalNotes: number;
  totalWords: number;
  totalCharacters: number;
  averageNoteLength: number;
  writingVelocity: number; // words per day

  // Activity Metrics
  dailyActiveTime: number; // minutes
  weeklyActiveTime: number;
  monthlyActiveTime: number;
  sessionsCount: number;
  averageSessionDuration: number;

  // Knowledge Graph Metrics
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  backlinks: number;
  orphanNotes: number;
  hubNotes: string[]; // Most connected notes
  avgConnections: number;

  // Search & Discovery
  searchesPerformed: number;
  averageSearchResultsClicked: number;
  popularSearchTerms: { term: string; count: number }[];

  // Content Organization
  tagsUsed: number;
  averageTagsPerNote: number;
  foldersUsed: number;
  mostUsedTags: { tag: string; count: number }[];

  // Productivity Insights
  peakWritingHours: number[];
  productiveDays: string[];
  writingStreaks: { current: number; longest: number };

  // Content Quality
  averageReadingTime: number;
  notesWithLinks: number;
  notesWithTags: number;
  contentComplexity: number; // Based on reading time, links, etc.
}

export interface TimeSeriesData {
  date: string;
  value: number;
  type: 'words' | 'notes' | 'sessions' | 'searches' | 'links';
}

export interface HeatmapData {
  hour: number;
  day: number;
  value: number;
  type: 'activity' | 'writing' | 'editing';
}

export interface InsightType {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'neutral' | 'suggestion';
  icon: string;
  data?: Record<string, any>;
}

export class AnalyticsSystem {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private sessionStartTime: number;
  private lastActivityTime: number;
  private sessionTimeoutId?: NodeJS.Timeout;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MIN_SESSION_DURATION = 10 * 1000; // 10 seconds (ignore hot reloads)
  private isUnloading = false; // Track page unload state

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();

    // Only start session tracking in browser (not during SSR)
    if (typeof window !== 'undefined') {
      this.initializeSessionTracking();
    }
  }

  private initializeSessionTracking(): void {
    // Check for existing session
    const existingSessionId = sessionStorage.getItem('markitup_session_id');
    const existingSessionStart = sessionStorage.getItem('markitup_session_start');
    const lastActivity = sessionStorage.getItem('markitup_last_activity');

    const now = Date.now();

    if (existingSessionId && existingSessionStart && lastActivity) {
      const timeSinceLastActivity = now - parseInt(lastActivity);

      // Resume existing session if within timeout
      if (timeSinceLastActivity < this.SESSION_TIMEOUT) {
        this.sessionId = existingSessionId;
        this.sessionStartTime = parseInt(existingSessionStart);
        console.debug('📊 Resumed existing analytics session:', this.sessionId);
      } else {
        // Previous session timed out, start new one
        this.startNewSession();
      }
    } else {
      // No existing session, start new one
      this.startNewSession();
    }

    // Update activity timestamp
    this.updateActivity();

    // Track activity on user interactions
    this.setupActivityTracking();

    // Track unload state
    window.addEventListener('beforeunload', () => {
      this.isUnloading = true;
      this.endSession();
    });

    // Check for inactivity timeout
    this.startInactivityTimer();
  }

  private startNewSession(): void {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();

    // Store in sessionStorage
    sessionStorage.setItem('markitup_session_id', this.sessionId);
    sessionStorage.setItem('markitup_session_start', this.sessionStartTime.toString());
    sessionStorage.setItem('markitup_last_activity', this.lastActivityTime.toString());

    this.trackEvent('session_started', {
      timestamp: new Date().toISOString(),
    });

    console.debug('📊 Started new analytics session:', this.sessionId);
  }

  private updateActivity(): void {
    this.lastActivityTime = Date.now();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('markitup_last_activity', this.lastActivityTime.toString());
    }

    // Reset inactivity timer
    this.startInactivityTimer();
  }

  private setupActivityTracking(): void {
    // Track various user activities to update last activity time
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const activityHandler = () => {
      this.updateActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, activityHandler, { passive: true });
    });
  }

  private startInactivityTimer(): void {
    // Clear existing timer
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }

    // Set new timer
    this.sessionTimeoutId = setTimeout(() => {
      this.endSession(true);
    }, this.SESSION_TIMEOUT);
  }

  private endSession(isTimeout: boolean = false): void {
    const sessionDuration = Date.now() - this.sessionStartTime;

    // Only end session if it lasted longer than minimum duration
    // This prevents noise from dev hot reloads
    if (sessionDuration >= this.MIN_SESSION_DURATION) {
      this.trackEvent('session_ended', {
        duration: sessionDuration,
        reason: isTimeout ? 'timeout' : 'unload',
      });

      console.debug(
        '📊 Ended analytics session:',
        this.sessionId,
        `(${Math.round(sessionDuration / 1000)}s)`
      );
    } else {
      console.debug('📊 Ignored short session (likely hot reload):', sessionDuration + 'ms');
    }

    // Clear session data on timeout, keep on unload for potential resume
    if (isTimeout && typeof window !== 'undefined') {
      sessionStorage.removeItem('markitup_session_id');
      sessionStorage.removeItem('markitup_session_start');
      sessionStorage.removeItem('markitup_last_activity');
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track analytics events
  trackEvent(type: AnalyticsEventType, data: Record<string, unknown> = {}): void {
    // Update activity on any event (except session_ended to avoid recursion)
    if (type !== 'session_ended' && typeof window !== 'undefined') {
      this.updateActivity();
    }

    // Sanitize data to prevent circular references
    const sanitizedData = this.sanitizeData(data);

    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      data: sanitizedData,
      sessionId: this.sessionId,
    };

    this.events.push(event);

    // Store in localStorage for immediate access
    if (typeof window !== 'undefined') {
      try {
        const storedEvents = JSON.parse(localStorage.getItem('markitup_analytics') || '[]');
        storedEvents.push(event);

        // Keep only last 1000 events in localStorage
        if (storedEvents.length > 1000) {
          storedEvents.splice(0, storedEvents.length - 1000);
        }

        localStorage.setItem('markitup_analytics', JSON.stringify(storedEvents));

        // Also send to server (non-blocking)
        this.sendEventToServer(event).catch(error => {
          console.warn('Failed to send analytics event to server:', error);
        });
      } catch (error) {
        console.warn('Failed to store analytics event:', error);
      }
    }
  }

  // Sanitize data to remove circular references and DOM elements
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const seen = new WeakSet();

    const sanitize = (obj: any): any => {
      // Handle primitives
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }

      // Handle DOM elements (only check in browser environment)
      if (typeof window !== 'undefined') {
        if (obj instanceof Element || obj instanceof Node) {
          return '[DOM Element]';
        }
      }

      // Detect DOM-like objects by checking for nodeType property
      if (obj.nodeType !== undefined) {
        return '[DOM Element]';
      }

      // Handle circular references
      if (seen.has(obj)) {
        return '[Circular Reference]';
      }

      seen.add(obj);

      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
      }

      // Handle objects
      const sanitized: Record<string, any> = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          try {
            sanitized[key] = sanitize(obj[key]);
          } catch (error) {
            sanitized[key] = '[Error serializing]';
          }
        }
      }

      return sanitized;
    };

    return sanitize(data);
  }

  // Send event to server
  private async sendEventToServer(event: AnalyticsEvent): Promise<void> {
    // Don't send events during page unload to avoid incomplete requests
    if (this.isUnloading) {
      console.debug('Skipping analytics event during page unload');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug('Failed to send analytics event:', error);
      }
    }
  }

  // Get stored events
  getStoredEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem('markitup_analytics') || '[]');
    } catch (error) {
      console.warn('Failed to retrieve analytics events:', error);
      return [];
    }
  }

  // Calculate comprehensive metrics
  calculateMetrics(notes: Note[], links: Link[], tags: Tag[]): AnalyticsMetrics {
    const events = this.getStoredEvents();
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    // Filter events by time periods
    const todayEvents = events.filter(
      e => new Date(e.timestamp).toDateString() === now.toDateString()
    );
    const weekEvents = events.filter(e => now.getTime() - new Date(e.timestamp).getTime() < weekMs);
    const monthEvents = events.filter(
      e => now.getTime() - new Date(e.timestamp).getTime() < monthMs
    );

    // Basic content metrics
    const totalWords = notes.reduce((sum, note) => sum + note.wordCount, 0);
    const totalCharacters = notes.reduce((sum, note) => sum + note.content.length, 0);

    // Activity metrics
    const sessions = this.getSessions(events);
    const dailyActiveTime = this.calculateActiveTime(todayEvents);
    const weeklyActiveTime = this.calculateActiveTime(weekEvents);
    const monthlyActiveTime = this.calculateActiveTime(monthEvents);

    // Link analysis
    const internalLinks = links.filter(l => l.type === 'wikilink' || l.type === 'backlink').length;
    const externalLinks = links.length - internalLinks;
    const backlinks = links.filter(l => l.type === 'backlink').length;

    // Note connectivity analysis
    const noteConnections = new Map<string, number>();
    links.forEach(link => {
      noteConnections.set(link.source, (noteConnections.get(link.source) || 0) + 1);
      noteConnections.set(link.target, (noteConnections.get(link.target) || 0) + 1);
    });

    const orphanNotes = notes.filter(note => !noteConnections.has(note.id)).length;
    const hubNotes = Array.from(noteConnections.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([noteId]) => noteId);

    // Search metrics
    const searchEvents = events.filter(e => e.type === 'search_performed');
    const searchTerms = new Map<string, number>();
    searchEvents.forEach(event => {
      const term = event.data.query?.toLowerCase() || '';
      if (term) {
        searchTerms.set(term, (searchTerms.get(term) || 0) + 1);
      }
    });

    // Tag metrics
    const totalTagsUsed = new Set(notes.flatMap(note => note.tags)).size;
    const averageTagsPerNote =
      notes.length > 0 ? notes.reduce((sum, note) => sum + note.tags.length, 0) / notes.length : 0;

    // Time-based activity analysis
    const peakWritingHours = this.calculatePeakHours(
      events.filter(e => e.type === 'note_created' || e.type === 'note_updated')
    );

    // Writing streaks
    const writingStreaks = this.calculateWritingStreaks(events);

    // Calculate average connections per note
    const avgConnections =
      notes.length > 0 ? Math.round(((links.length * 2) / notes.length) * 10) / 10 : 0;

    return {
      // Content metrics
      totalNotes: notes.length,
      totalWords,
      totalCharacters,
      averageNoteLength: notes.length > 0 ? totalWords / notes.length : 0,
      writingVelocity: this.calculateWritingVelocity(monthEvents),

      // Activity metrics
      dailyActiveTime,
      weeklyActiveTime,
      monthlyActiveTime,
      sessionsCount: sessions.length,
      averageSessionDuration:
        sessions.length > 0
          ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
          : 0,

      // Graph metrics
      totalLinks: links.length,
      internalLinks,
      externalLinks,
      backlinks,
      orphanNotes,
      hubNotes,
      avgConnections,

      // Search metrics
      searchesPerformed: searchEvents.length,
      averageSearchResultsClicked: this.calculateAverageSearchClicks(events),
      popularSearchTerms: Array.from(searchTerms.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([term, count]) => ({ term, count })),

      // Organization metrics
      tagsUsed: totalTagsUsed,
      averageTagsPerNote,
      foldersUsed: new Set(notes.map(note => note.folder).filter(Boolean)).size,
      mostUsedTags: tags.slice(0, 10).map(tag => ({ tag: tag.name, count: tag.count })),

      // Productivity insights
      peakWritingHours,
      productiveDays: this.calculateProductiveDays(monthEvents),
      writingStreaks,

      // Quality metrics
      averageReadingTime:
        notes.length > 0
          ? notes.reduce((sum, note) => sum + note.readingTime, 0) / notes.length
          : 0,
      notesWithLinks: notes.filter(note =>
        links.some(link => link.source === note.id || link.target === note.id)
      ).length,
      notesWithTags: notes.filter(note => note.tags.length > 0).length,
      contentComplexity: this.calculateContentComplexity(notes, links),
    };
  }

  // Generate time series data for charts
  generateTimeSeriesData(
    events: AnalyticsEvent[],
    type: 'words' | 'notes' | 'sessions' | 'searches' | 'links',
    days: number = 30
  ): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayEvents = events.filter(
        e => new Date(e.timestamp).toDateString() === date.toDateString()
      );

      let value = 0;
      switch (type) {
        case 'notes':
          value = dayEvents.filter(e => e.type === 'note_created').length;
          break;
        case 'words':
          value = dayEvents
            .filter(e => e.type === 'note_updated' || e.type === 'note_created')
            .reduce((sum, e) => sum + (e.data.wordCount || 0), 0);
          break;
        case 'sessions':
          value = new Set(dayEvents.map(e => e.sessionId)).size;
          break;
        case 'searches':
          value = dayEvents.filter(e => e.type === 'search_performed').length;
          break;
        case 'links':
          value = dayEvents.filter(e => e.type === 'wikilink_created').length;
          break;
      }

      data.push({ date: dateStr, value, type });
    }

    return data;
  }

  // Generate heatmap data for activity patterns
  generateHeatmapData(
    events: AnalyticsEvent[],
    type: 'activity' | 'writing' | 'editing'
  ): HeatmapData[] {
    const data: HeatmapData[] = [];
    const activityMap = new Map<string, number>();

    events.forEach(event => {
      if (
        (type === 'writing' && (event.type === 'note_created' || event.type === 'note_updated')) ||
        (type === 'editing' && event.type === 'note_edited') ||
        type === 'activity'
      ) {
        const date = new Date(event.timestamp);
        const hour = date.getHours();
        const day = date.getDay();
        const key = `${day}-${hour}`;

        activityMap.set(key, (activityMap.get(key) || 0) + 1);
      }
    });

    // Generate complete heatmap grid
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        data.push({
          hour,
          day,
          value: activityMap.get(key) || 0,
          type,
        });
      }
    }

    return data;
  }

  // Generate insights based on analytics data
  generateInsights(metrics: AnalyticsMetrics, notes: Note[]): InsightType[] {
    const insights: InsightType[] = [];

    // Writing velocity insights
    if (metrics.writingVelocity > 500) {
      insights.push({
        id: 'high_velocity',
        title: '🚀 Excellent Writing Pace!',
        description: `You're averaging ${Math.round(metrics.writingVelocity)} words per day. You're a writing machine!`,
        type: 'positive',
        icon: '🚀',
      });
    } else if (metrics.writingVelocity < 100 && metrics.totalNotes > 5) {
      insights.push({
        id: 'low_velocity',
        title: 'Build Writing Momentum',
        description:
          'Try setting a daily writing goal of 200-300 words. Small consistent efforts lead to big results!',
        type: 'suggestion',
        icon: '📝',
      });
    }

    // Writing streak insights
    if (metrics.writingStreaks.current >= 7) {
      insights.push({
        id: 'great_streak',
        title: `🔥 ${metrics.writingStreaks.current}-Day Streak!`,
        description: `You've been writing consistently for ${metrics.writingStreaks.current} days. ${metrics.writingStreaks.current >= 30 ? "You're unstoppable!" : 'Keep going!'}`,
        type: 'positive',
        icon: '🔥',
      });
    } else if (metrics.writingStreaks.longest >= 7 && metrics.writingStreaks.current === 0) {
      insights.push({
        id: 'lost_streak',
        title: 'Rebuild Your Streak',
        description: `Your longest streak was ${metrics.writingStreaks.longest} days. Start a new one today!`,
        type: 'suggestion',
        icon: '💪',
      });
    }

    // Knowledge graph insights
    const connectionDensity = (metrics.totalLinks / Math.max(metrics.totalNotes, 1)) * 100;
    if (connectionDensity > 50) {
      insights.push({
        id: 'strong_network',
        title: '🌟 Highly Connected Network',
        description: `Your notes have a ${connectionDensity.toFixed(1)}% connection density. Your knowledge graph is thriving!`,
        type: 'positive',
        icon: '🌟',
      });
    } else if (metrics.orphanNotes > metrics.totalNotes * 0.3) {
      insights.push({
        id: 'many_orphans',
        title: 'Strengthen Your Network',
        description: `${metrics.orphanNotes} notes (${((metrics.orphanNotes / Math.max(metrics.totalNotes, 1)) * 100).toFixed(0)}%) are orphaned. Link related notes using [[wikilinks]].`,
        type: 'suggestion',
        icon: '🔗',
      });
    }

    // Hub notes recognition
    if (metrics.hubNotes.length > 0 && metrics.totalNotes > 10) {
      const topHub = notes.find(n => n.id === metrics.hubNotes[0]);
      insights.push({
        id: 'hub_recognition',
        title: '📚 Knowledge Hubs Detected',
        description: `"${topHub?.name || 'Your top note'}" is a central hub. Great starting point for exploration!`,
        type: 'neutral',
        icon: '�',
      });
    }

    // Peak hours insight
    if (metrics.peakWritingHours.length > 0) {
      const peak = metrics.peakWritingHours[0];
      const timeStr =
        peak < 12 ? `${peak === 0 ? 12 : peak}:00 AM` : `${peak === 12 ? 12 : peak - 12}:00 PM`;
      insights.push({
        id: 'peak_hours',
        title: '⏰ Optimal Writing Time',
        description: `You're most productive around ${timeStr}. Schedule deep work during these golden hours!`,
        type: 'neutral',
        icon: '⏰',
      });
    }

    // Content organization insights
    if (metrics.averageTagsPerNote < 1 && metrics.totalNotes > 5) {
      insights.push({
        id: 'use_tags',
        title: 'Unlock Better Organization',
        description:
          'Adding tags helps you find related content. Try tagging by topic, project, or status.',
        type: 'suggestion',
        icon: '🏷️',
      });
    } else if (metrics.tagsUsed > 20 && metrics.totalNotes > 30) {
      insights.push({
        id: 'good_organization',
        title: '🎯 Well-Organized System',
        description: `You're using ${metrics.tagsUsed} tags effectively. Your content is discoverable!`,
        type: 'positive',
        icon: '🎯',
      });
    }

    // Content quality insights
    const linkPercentage = (metrics.notesWithLinks / Math.max(metrics.totalNotes, 1)) * 100;
    if (linkPercentage > 70) {
      insights.push({
        id: 'high_linking',
        title: '⭐ Excellent Linking Practice',
        description: `${linkPercentage.toFixed(0)}% of your notes have links. You're building a web of knowledge!`,
        type: 'positive',
        icon: '⭐',
      });
    } else if (linkPercentage < 30 && metrics.totalNotes > 10) {
      insights.push({
        id: 'increase_linking',
        title: 'Add More Connections',
        description: `Only ${linkPercentage.toFixed(0)}% of notes have links. Link related ideas!`,
        type: 'suggestion',
        icon: '🔗',
      });
    }

    // Milestone insights
    if (metrics.totalNotes >= 100 && metrics.totalNotes < 105) {
      insights.push({
        id: 'milestone_100',
        title: '🎉 100 Notes Milestone!',
        description: `You've created ${metrics.totalNotes} notes! Your knowledge base is growing strong.`,
        type: 'positive',
        icon: '🎉',
      });
    } else if (metrics.totalNotes >= 500 && metrics.totalNotes < 505) {
      insights.push({
        id: 'milestone_500',
        title: '🏆 500 Notes Achievement!',
        description: `${metrics.totalNotes} notes! Impressive knowledge repository.`,
        type: 'positive',
        icon: '🏆',
      });
    }

    if (metrics.totalWords >= 50000 && metrics.totalWords < 51000) {
      insights.push({
        id: 'word_milestone',
        title: '📖 50K Words Written!',
        description: `${metrics.totalWords.toLocaleString()} words - that's novel-length content!`,
        type: 'positive',
        icon: '📖',
      });
    }

    // Activity insights
    if (metrics.sessionsCount > 100) {
      insights.push({
        id: 'active_user',
        title: '💎 Power User Status',
        description: `${metrics.sessionsCount} sessions. You're committed to your knowledge journey!`,
        type: 'positive',
        icon: '�',
      });
    }

    // Long-form content
    const longNotes = notes.filter(note => note.wordCount && note.wordCount > 1000).length;
    if (longNotes / Math.max(metrics.totalNotes, 1) > 0.3) {
      insights.push({
        id: 'long_form',
        title: '📝 Comprehensive Content',
        description: `${Math.round((longNotes / Math.max(metrics.totalNotes, 1)) * 100)}% of notes are detailed (1000+ words). Deep thinker!`,
        type: 'positive',
        icon: '📝',
      });
    }

    // No insights yet
    if (insights.length === 0 && metrics.totalNotes < 5) {
      insights.push({
        id: 'getting_started',
        title: '🌱 Just Getting Started',
        description: 'Create more notes and connect them to unlock personalized insights!',
        type: 'neutral',
        icon: '🌱',
      });
    }

    return insights;
  }

  // Helper methods
  private getSessions(
    events: AnalyticsEvent[]
  ): { id: string; duration: number; events: number }[] {
    const sessions = new Map<string, { start: number; end: number; events: number }>();

    events.forEach(event => {
      const timestamp = new Date(event.timestamp).getTime();
      const session = sessions.get(event.sessionId) || {
        start: timestamp,
        end: timestamp,
        events: 0,
      };

      session.start = Math.min(session.start, timestamp);
      session.end = Math.max(session.end, timestamp);
      session.events++;

      sessions.set(event.sessionId, session);
    });

    return Array.from(sessions.entries()).map(([id, session]) => ({
      id,
      duration: session.end - session.start,
      events: session.events,
    }));
  }

  private calculateActiveTime(events: AnalyticsEvent[]): number {
    // Estimate active time based on event frequency
    // Assumption: User is active for 1 minute per event, max 60 minutes per hour
    const eventsByHour = new Map<string, number>();

    events.forEach(event => {
      const date = new Date(event.timestamp);
      const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      eventsByHour.set(hourKey, (eventsByHour.get(hourKey) || 0) + 1);
    });

    let totalMinutes = 0;
    for (const count of eventsByHour.values()) {
      totalMinutes += Math.min(count, 60); // Max 60 minutes per hour
    }

    return totalMinutes;
  }

  private calculateWritingVelocity(monthEvents: AnalyticsEvent[]): number {
    const writingEvents = monthEvents.filter(
      e => e.type === 'note_created' || e.type === 'note_updated'
    );

    const totalWords = writingEvents.reduce((sum, e) => sum + (e.data.wordCount || 0), 0);
    const days = 30; // Approximate monthly period

    return totalWords / days;
  }

  private calculatePeakHours(events: AnalyticsEvent[]): number[] {
    const hourCounts = new Array(24).fill(0);

    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour]++;
    });

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
  }

  private calculateWritingStreaks(events: AnalyticsEvent[]): { current: number; longest: number } {
    const writingEvents = events.filter(
      e => e.type === 'note_created' || e.type === 'note_updated'
    );

    const writingDays = new Set(writingEvents.map(e => new Date(e.timestamp).toDateString()));

    const sortedDays = Array.from(writingDays).sort();
    if (sortedDays.length === 0) return { current: 0, longest: 0 };

    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currDate = new Date(sortedDays[i]);
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak from today backwards
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (writingDays.has(today) || writingDays.has(yesterday)) {
      // Work backwards from today to find current streak
      let streakDate = writingDays.has(today)
        ? new Date()
        : new Date(Date.now() - 24 * 60 * 60 * 1000);
      currentStreak = 0;

      while (writingDays.has(streakDate.toDateString())) {
        currentStreak++;
        streakDate = new Date(streakDate.getTime() - 24 * 60 * 60 * 1000);
      }
    } else {
      currentStreak = 0;
    }

    return { current: currentStreak, longest: longestStreak };
  }

  private calculateProductiveDays(monthEvents: AnalyticsEvent[]): string[] {
    const dayActivity = new Map<string, number>();

    monthEvents.forEach(event => {
      const dayStr = new Date(event.timestamp).toDateString();
      dayActivity.set(dayStr, (dayActivity.get(dayStr) || 0) + 1);
    });

    const avgActivity =
      Array.from(dayActivity.values()).reduce((a, b) => a + b, 0) / dayActivity.size;

    return Array.from(dayActivity.entries())
      .filter(([, activity]) => activity > avgActivity * 1.5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([day]) => day);
  }

  private calculateAverageSearchClicks(events: AnalyticsEvent[]): number {
    const searchSessions = new Map<string, { searches: number; clicks: number }>();

    events.forEach(event => {
      if (event.type === 'search_performed' || event.type === 'link_clicked') {
        const session = searchSessions.get(event.sessionId) || { searches: 0, clicks: 0 };

        if (event.type === 'search_performed') session.searches++;
        if (event.type === 'link_clicked') session.clicks++;

        searchSessions.set(event.sessionId, session);
      }
    });

    const totalSessions = Array.from(searchSessions.values());
    if (totalSessions.length === 0) return 0;

    const totalClicks = totalSessions.reduce((sum, s) => sum + s.clicks, 0);
    const totalSearches = totalSessions.reduce((sum, s) => sum + s.searches, 0);

    return totalSearches > 0 ? totalClicks / totalSearches : 0;
  }

  private calculateContentComplexity(notes: Note[], links: Link[]): number {
    if (notes.length === 0) return 0;

    const totalComplexity = notes.reduce((sum, note) => {
      let complexity = 0;

      // Word count contributes to complexity
      complexity += Math.min(note.wordCount / 100, 10);

      // Links contribute to complexity
      const noteLinks = links.filter(l => l.source === note.id || l.target === note.id);
      complexity += noteLinks.length * 0.5;

      // Tags contribute slightly
      complexity += note.tags.length * 0.2;

      return sum + complexity;
    }, 0);

    return totalComplexity / notes.length;
  }

  // Export analytics data
  exportAsMarkdown(metrics: AnalyticsMetrics, insights: InsightType[]): string {
    const now = new Date().toISOString().split('T')[0];
    let markdown = `# Analytics Report - ${now}\n\n`;

    // Overview section
    markdown += `## 📊 Overview\n\n`;
    markdown += `- **Total Notes:** ${metrics.totalNotes}\n`;
    markdown += `- **Total Words:** ${metrics.totalWords.toLocaleString()}\n`;
    markdown += `- **Total Links:** ${metrics.totalLinks}\n`;
    markdown += `- **Average Note Length:** ${Math.round(metrics.averageNoteLength)} words\n`;
    markdown += `- **Writing Velocity:** ${Math.round(metrics.writingVelocity)} words/day\n\n`;

    // Writing Streaks
    markdown += `## 🔥 Writing Streaks\n\n`;
    markdown += `- **Current Streak:** ${metrics.writingStreaks.current} days\n`;
    markdown += `- **Longest Streak:** ${metrics.writingStreaks.longest} days\n\n`;

    // Activity Metrics
    markdown += `## ⚡ Activity\n\n`;
    markdown += `- **Sessions:** ${metrics.sessionsCount}\n`;
    markdown += `- **Average Session:** ${Math.round(metrics.averageSessionDuration / 60000)} minutes\n`;
    markdown += `- **Daily Active Time:** ${Math.round(metrics.dailyActiveTime)} minutes\n`;
    markdown += `- **Weekly Active Time:** ${Math.round(metrics.weeklyActiveTime)} minutes\n\n`;

    // Knowledge Graph
    markdown += `## 🌐 Knowledge Graph\n\n`;
    markdown += `- **Internal Links:** ${metrics.internalLinks}\n`;
    markdown += `- **External Links:** ${metrics.externalLinks}\n`;
    markdown += `- **Orphan Notes:** ${metrics.orphanNotes}\n`;
    markdown += `- **Average Connections:** ${metrics.avgConnections}\n`;
    if (metrics.hubNotes.length > 0) {
      markdown += `- **Top Hub Notes:** ${metrics.hubNotes.slice(0, 3).join(', ')}\n`;
    }
    markdown += `\n`;

    // Organization
    markdown += `## 🏷️ Organization\n\n`;
    markdown += `- **Tags Used:** ${metrics.tagsUsed}\n`;
    markdown += `- **Average Tags per Note:** ${metrics.averageTagsPerNote.toFixed(1)}\n`;
    markdown += `- **Notes with Tags:** ${metrics.notesWithTags} (${Math.round((metrics.notesWithTags / Math.max(metrics.totalNotes, 1)) * 100)}%)\n`;
    markdown += `- **Notes with Links:** ${metrics.notesWithLinks} (${Math.round((metrics.notesWithLinks / Math.max(metrics.totalNotes, 1)) * 100)}%)\n\n`;

    // Most Used Tags
    if (metrics.mostUsedTags.length > 0) {
      markdown += `### Most Used Tags\n\n`;
      metrics.mostUsedTags.slice(0, 10).forEach(({ tag, count }) => {
        markdown += `- **${tag}:** ${count} notes\n`;
      });
      markdown += `\n`;
    }

    // Search Activity
    if (metrics.searchesPerformed > 0) {
      markdown += `## 🔍 Search Activity\n\n`;
      markdown += `- **Total Searches:** ${metrics.searchesPerformed}\n`;
      if (metrics.popularSearchTerms.length > 0) {
        markdown += `\n### Popular Search Terms\n\n`;
        metrics.popularSearchTerms.slice(0, 5).forEach(({ term, count }) => {
          markdown += `- **"${term}":** ${count} searches\n`;
        });
      }
      markdown += `\n`;
    }

    // Productivity Insights
    if (metrics.peakWritingHours.length > 0) {
      markdown += `## ⏰ Peak Productivity Hours\n\n`;
      const formatHour = (hour: number) => {
        if (hour === 0) return '12:00 AM';
        if (hour < 12) return `${hour}:00 AM`;
        if (hour === 12) return '12:00 PM';
        return `${hour - 12}:00 PM`;
      };
      metrics.peakWritingHours.forEach(hour => {
        markdown += `- ${formatHour(hour)}\n`;
      });
      markdown += `\n`;
    }

    // Insights
    if (insights.length > 0) {
      markdown += `## 💡 Insights\n\n`;
      insights.forEach(insight => {
        markdown += `### ${insight.icon} ${insight.title}\n\n`;
        markdown += `${insight.description}\n\n`;
      });
    }

    markdown += `---\n\n`;
    markdown += `*Generated by MarkItUp Analytics on ${new Date().toLocaleString()}*\n`;

    return markdown;
  }

  exportAsCSV(events: AnalyticsEvent[]): string {
    let csv = 'Event ID,Type,Timestamp,Session ID,Data\n';

    events.forEach(event => {
      const dataStr = JSON.stringify(event.data).replace(/"/g, '""');
      csv += `"${event.id}","${event.type}","${event.timestamp}","${event.sessionId}","${dataStr}"\n`;
    });

    return csv;
  }

  exportAsJSON(
    metrics: AnalyticsMetrics,
    events: AnalyticsEvent[],
    insights: InsightType[]
  ): string {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        metrics,
        insights,
        events,
      },
      null,
      2
    );
  }

  // Clear all analytics data
  clearAllData(): void {
    if (typeof window === 'undefined') return;

    try {
      // Clear localStorage events
      localStorage.removeItem('markitup_analytics');

      // Clear session data
      sessionStorage.removeItem('markitup_session_id');
      sessionStorage.removeItem('markitup_session_start');
      sessionStorage.removeItem('markitup_last_activity');

      // Reset in-memory events
      this.events = [];

      // Start a new session
      this.startNewSession();

      console.log('📊 Analytics data cleared successfully');
    } catch (error) {
      console.error('Failed to clear analytics data:', error);
      throw error;
    }
  }

  // Get data size for display
  getDataSize(): { events: number; sizeMB: number } {
    if (typeof window === 'undefined') return { events: 0, sizeMB: 0 };

    try {
      const data = localStorage.getItem('markitup_analytics') || '[]';
      const events = JSON.parse(data);
      const sizeBytes = new Blob([data]).size;
      const sizeMB = sizeBytes / (1024 * 1024);

      return {
        events: events.length,
        sizeMB: parseFloat(sizeMB.toFixed(3)),
      };
    } catch (error) {
      console.error('Failed to get data size:', error);
      return { events: 0, sizeMB: 0 };
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsSystem();
