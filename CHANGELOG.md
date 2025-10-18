# Changelog

All notable changes to MarkItUp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
