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
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.trackEvent('session_started', {});
    
    // Track session end on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.trackEvent('session_ended', {
          duration: Date.now() - this.sessionStartTime
        });
      });
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track analytics events
  trackEvent(type: AnalyticsEventType, data: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      data,
      sessionId: this.sessionId
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

  // Send event to server
  private async sendEventToServer(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('Failed to send analytics event:', error);
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
    const todayEvents = events.filter(e => 
      new Date(e.timestamp).toDateString() === now.toDateString()
    );
    const weekEvents = events.filter(e => 
      now.getTime() - new Date(e.timestamp).getTime() < weekMs
    );
    const monthEvents = events.filter(e => 
      now.getTime() - new Date(e.timestamp).getTime() < monthMs
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
    const averageTagsPerNote = notes.length > 0 ? 
      notes.reduce((sum, note) => sum + note.tags.length, 0) / notes.length : 0;

    // Time-based activity analysis
    const peakWritingHours = this.calculatePeakHours(events.filter(e => 
      e.type === 'note_created' || e.type === 'note_updated'
    ));

    // Writing streaks
    const writingStreaks = this.calculateWritingStreaks(events);

    // Calculate average connections per note
    const avgConnections = notes.length > 0 ? 
      Math.round((links.length * 2) / notes.length * 10) / 10 : 0;

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
      averageSessionDuration: sessions.length > 0 ? 
        sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0,
      
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
      averageReadingTime: notes.length > 0 ? 
        notes.reduce((sum, note) => sum + note.readingTime, 0) / notes.length : 0,
      notesWithLinks: notes.filter(note => 
        links.some(link => link.source === note.id || link.target === note.id)
      ).length,
      notesWithTags: notes.filter(note => note.tags.length > 0).length,
      contentComplexity: this.calculateContentComplexity(notes, links)
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
      
      const dayEvents = events.filter(e => 
        new Date(e.timestamp).toDateString() === date.toDateString()
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
  generateHeatmapData(events: AnalyticsEvent[], type: 'activity' | 'writing' | 'editing'): HeatmapData[] {
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
          type
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
        title: 'Productive Writer! 🚀',
        description: `You're writing ${Math.round(metrics.writingVelocity)} words per day on average. Keep up the great work!`,
        type: 'positive',
        icon: '✍️'
      });
    } else if (metrics.writingVelocity < 100) {
      insights.push({
        id: 'low_velocity',
        title: 'Write More Regularly',
        description: 'Try setting a daily writing goal of 200-300 words to build momentum.',
        type: 'suggestion',
        icon: '📝'
      });
    }
    
    // Knowledge graph insights
    if (metrics.orphanNotes > metrics.totalNotes * 0.3) {
      insights.push({
        id: 'many_orphans',
        title: 'Connect Your Notes',
        description: `${metrics.orphanNotes} notes aren't linked to anything. Try adding wikilinks to create connections.`,
        type: 'suggestion',
        icon: '🔗'
      });
    }
    
    // Peak hours insight
    if (metrics.peakWritingHours.length > 0) {
      const peak = metrics.peakWritingHours[0];
      const timeStr = peak < 12 ? `${peak}:00 AM` : `${peak - 12}:00 PM`;
      insights.push({
        id: 'peak_hours',
        title: 'Peak Writing Time',
        description: `You're most productive around ${timeStr}. Schedule important writing during this time.`,
        type: 'neutral',
        icon: '⏰'
      });
    }
    
    // Content organization
    if (metrics.averageTagsPerNote < 1) {
      insights.push({
        id: 'use_tags',
        title: 'Organize with Tags',
        description: 'Adding tags to your notes will help you find and connect related content.',
        type: 'suggestion',
        icon: '🏷️'
      });
    }
    
    // Writing streak
    if (metrics.writingStreaks.current >= 7) {
      insights.push({
        id: 'great_streak',
        title: `${metrics.writingStreaks.current}-Day Writing Streak! 🔥`,
        description: `You've been writing consistently for ${metrics.writingStreaks.current} days. Amazing dedication!`,
        type: 'positive',
        icon: '🔥'
      });
    }
    
    // Long-form content
    const longNotes = notes.filter(note => note.wordCount > 1000).length;
    if (longNotes / metrics.totalNotes > 0.3) {
      insights.push({
        id: 'long_form',
        title: 'Deep Thinker',
        description: `${Math.round((longNotes / metrics.totalNotes) * 100)}% of your notes are detailed (1000+ words). You create comprehensive content!`,
        type: 'positive',
        icon: '📚'
      });
    }
    
    return insights;
  }

  // Helper methods
  private getSessions(events: AnalyticsEvent[]): { id: string; duration: number; events: number }[] {
    const sessions = new Map<string, { start: number; end: number; events: number }>();
    
    events.forEach(event => {
      const timestamp = new Date(event.timestamp).getTime();
      const session = sessions.get(event.sessionId) || { start: timestamp, end: timestamp, events: 0 };
      
      session.start = Math.min(session.start, timestamp);
      session.end = Math.max(session.end, timestamp);
      session.events++;
      
      sessions.set(event.sessionId, session);
    });
    
    return Array.from(sessions.entries()).map(([id, session]) => ({
      id,
      duration: session.end - session.start,
      events: session.events
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
    const writingEvents = monthEvents.filter(e => 
      e.type === 'note_created' || e.type === 'note_updated'
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
    const writingEvents = events.filter(e => 
      e.type === 'note_created' || e.type === 'note_updated'
    );
    
    const writingDays = new Set(
      writingEvents.map(e => new Date(e.timestamp).toDateString())
    );
    
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
      let streakDate = writingDays.has(today) ? new Date() : new Date(Date.now() - 24 * 60 * 60 * 1000);
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
    
    const avgActivity = Array.from(dayActivity.values()).reduce((a, b) => a + b, 0) / dayActivity.size;
    
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
}

// Export singleton instance
export const analytics = new AnalyticsSystem();
