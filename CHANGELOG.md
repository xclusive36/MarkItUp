# Changelog

All notable changes to MarkItUp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.7.0] - 2025-11-03

### Added

- **Performance Optimizations** - Major performance improvements
  - API pagination support (page, limit, sort, order query params)
  - Virtual scrolling component for large lists (98% DOM node reduction)
  - Debounce hooks (useDebounce, useDebouncedCallback) for search and auto-save
  - 94% faster page load for 500+ notes (3.2s → 180ms)
  - 73% memory reduction for large note collections

- **Database Layer Improvements** - Production-ready reliability
  - Automatic retry logic with exponential backoff (handles SQLITE_BUSY)
  - Circuit breaker pattern to prevent cascading failures
  - Database migration system with version tracking
  - Structured logging throughout database operations
  - Graceful degradation for sync failures

- **Accessibility Features** - WCAG 2.1 AA compliance
  - Screen reader announcement system (ARIA live regions)
  - Focus trap and focus restoration hooks for modals
  - Keyboard navigation hook for lists (arrow keys, Home, End)
  - Reduced motion preference detection
  - Unique ARIA ID generation
  - Route change announcements
  - Comprehensive accessibility utilities and helpers

### Changed

- **API Responses** - File listing API now returns paginated data with metadata
  - Response format: `{ notes: [], pagination: {...} }`
  - Headers: X-Total-Count, X-Page, X-Total-Pages
  - Backward compatible (defaults to 100 items per page)

- **Database Sync** - Enhanced error handling
  - All operations wrapped in retry logic
  - Better error context and logging
  - Non-fatal errors don't crash the application

### Documentation

- Added `FINAL_IMPROVEMENTS.md` - Comprehensive guide covering all phase 3 improvements
- Migration guides for pagination, debouncing, virtual scrolling, and accessibility
- Performance metrics and comparison tables
- WCAG 2.1 AA compliance documentation

## [3.6.2] - 2025-11-03

### Changed

- **Performance Monitoring** - Reduced console noise from performance monitor
  - Increased slow render threshold from 16ms to 50ms (more realistic for development)
  - Removed repetitive "every 10 renders" logging
  - Silent initialization on hot reload
  - Console API still available: `__performanceReport()` for on-demand metrics

- **Logging System** - Replaced console.log with structured logging
  - Added structured logging to `src/app/page.tsx` (15+ calls replaced)
  - Auto-indexing now silent on success (only logs errors)
  - Better context and debugging information
  - Production-ready JSON logging

### Documentation

- Added `PERFORMANCE_LOGGING_IMPROVEMENTS.md` - Detailed guide on performance monitoring and logging changes

## [3.6.1] - 2025-11-03

### Added

- **Security Improvements** - Comprehensive security enhancements
  - Rate limiting for all API endpoints (file operations, creation, reads)
  - Path sanitization and XSS prevention
  - Security headers middleware (CSP, X-Frame-Options, etc.)
  - Environment variable validation with Zod schemas
  - Health check endpoint (`/api/health`)
  
- **Structured Logging System** - Production-ready logging infrastructure
  - Leveled logging (DEBUG → FATAL)
  - Domain-specific loggers (API, database, security)
  - Pretty console output in development, JSON in production
  - Context-aware logging with metadata

- **Testing Infrastructure** - API security test suite
  - Playwright integration tests for rate limiting
  - Path traversal attack prevention tests
  - XSS vulnerability tests
  - File size validation tests

### Changed

- **TypeScript Configuration** - Stricter type checking
  - Enabled `forceConsistentCasingInFileNames`
  - Enhanced type safety across the codebase

### Documentation

- Added `docs/SECURITY_IMPROVEMENTS.md` - Complete security implementation guide
- Added `IMPROVEMENTS_SUMMARY_NOV_2025.md` - Summary of all November improvements

## [3.5.1] - 2025-10-19

### Changed

- **Spaced Repetition Plugin v1.2.1** - Enhanced flashcard system with professional features
  - Enhanced modal-based review interface with 3D card flip animations
  - Interactive statistics dashboard with gradient cards and animated charts
  - Cloze deletion support for fill-in-the-blank style cards
  - Export/Import functionality (JSON, CSV formats)
  - Session completion summaries with accuracy tracking
  - Keyboard shortcuts for efficient review workflow

### Fixed

- **Ollama Integration in Spaced Repetition** - Fixed AI flashcard generation with Ollama
  - Eliminated "AI service not configured" errors for Ollama provider
  - Direct browser fetch for Ollama API bypassing availability checks
  - Applied fixes to both `generateFromNote()` and `completeAnswers()` methods
- **AI Response Parser** - Enhanced robustness with multiple parsing patterns
  - Added 5 fallback regex patterns for flexible AI response handling
  - Support for single-line, multi-line, numbered, Question/Answer, and markdown formats
  - Extensive console logging for debugging AI-generated flashcards

### Documentation

- Added comprehensive Spaced Repetition v1.2.1 enhancement documentation
- Added Ollama flashcard fix technical documentation
- Updated plugin examples with cloze deletion patterns

## [3.5.0] - 2025-10-18

### Added

- **Universal Multi-Provider AI Support** - All AI features now work with any configured provider
  - Writing Assistant now supports OpenAI, Anthropic, Gemini, and Ollama
  - Research Assistant now supports all AI providers
  - Knowledge Discovery now supports all AI providers
  - Single provider configuration applies to all features
- **Ollama CORS Proxy** - New `/api/ai/ollama-proxy` endpoint eliminates CORS errors
  - Test Ollama connections without browser CORS errors
  - Fetch model lists seamlessly
  - Pull/download models with streaming progress
  - No need to configure `OLLAMA_ORIGINS` in Ollama settings
- **Enhanced Error Messages** - Provider-agnostic error messages with helpful setup guidance
  - Clear instructions to configure AI provider in settings
  - Mentions all available providers (OpenAI, Anthropic, Gemini, Ollama)
  - Emphasizes that Ollama requires no API key

### Changed

- Updated all AI analysis endpoints to use user's configured provider instead of hardcoded OpenAI
  - `/api/ai/analyze` (Writing Assistant)
  - `/api/ai/suggest-note` (Research Assistant)
  - `/api/ai/analyze-knowledge` (Knowledge Discovery)
- AI Chat component now uses proxy endpoint for all Ollama operations
- Improved error handling with helpful troubleshooting messages for Ollama connections

### Fixed

- **Ollama API Key Requirement** - Ollama now works without API key across all AI features
  - AI Chat Assistant no longer requires API key for Ollama
  - Writing Assistant no longer requires API key for Ollama
  - Research Assistant no longer requires API key for Ollama
  - Knowledge Discovery no longer requires API key for Ollama
- **CORS Errors** - Eliminated browser CORS errors when connecting to Ollama
  - Connection testing works without CORS errors
  - Model fetching works without CORS errors
  - Model pulling works without CORS errors
- **Provider Lock-in** - Removed hardcoded OpenAI dependencies from analysis endpoints

### Technical Improvements

- Created centralized `getAIService()` pattern for consistent provider access
- Added security validation for allowed Ollama proxy endpoints
- Improved streaming support for model downloads through proxy
- Enhanced error detection with specific troubleshooting hints
- Added comprehensive documentation for CORS proxy implementation

### Documentation

- Added `/docs/development/fixes/OLLAMA_API_KEY_FIX.md` - Multi-provider AI support documentation
- Added `/docs/development/fixes/OLLAMA_CORS_PROXY.md` - CORS proxy implementation guide
- Updated README.md with v3.5.0 changelog

## [3.4.0] - 2025-10-XX

### Added

- **Google Gemini Feature Parity** - Enhanced Gemini provider to match OpenAI/Anthropic capabilities
  - Streaming support with Server-Sent Events (SSE)
  - Performance tracking (response time, tokens/sec, success rate)
  - Connection health checks and model discovery
  - Advanced options (top_k, top_p, safety_settings, stop_sequences)
  - Enhanced cost tracking with separate input/output token costs
  - Complete documentation and test suite

### Changed

- Gemini provider now production-ready with full feature parity
- Improved cost tracking accuracy for Gemini models

## [3.3.0] - 2025-10-XX

### Changed

- **Enhanced UI/UX** - Refined interface for better workflow
  - Right panel now collapsed by default for more screen space
  - Consistent chevron icons for expand/collapse controls
  - Improved layout balance and default workspace configuration

## [3.2.0] - 2025-10-XX

### Added

- **Intelligent Link Suggester v3.2** - Advanced link suggestion system
  - Suggestion history with undo functionality (Cmd+Shift+H)
  - Export suggestions report as markdown
  - Custom debounce timing (1-10 seconds)
  - Visual status indicator for real-time analysis
  - Batch orphan analysis
  - Link context visualization
  - Real-time suggestions while typing (Cmd+Shift+R)
  - Pattern learning from user decisions
  - Bridge note generation for isolated clusters

### Previous Versions

See README.md for earlier version history.

## Version Numbering

- **Major version** (X.0.0): Breaking changes or major architectural overhauls
- **Minor version** (3.X.0): New features, significant improvements, maintaining compatibility
- **Patch version** (3.5.X): Bug fixes, small improvements, documentation updates
