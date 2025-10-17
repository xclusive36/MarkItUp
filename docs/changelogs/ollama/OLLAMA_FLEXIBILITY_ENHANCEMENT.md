# Ollama Flexibility Enhancement

## Overview
Enhanced the Ollama AI provider integration to support custom server URLs and dynamic model discovery, making the implementation more flexible and adaptable to different deployment scenarios.

## Changes Made

### 1. Type System Updates (`src/lib/ai/types.ts`)
- **Added `ollamaUrl` field** to `AISettings` interface (optional, defaults to `http://localhost:11434`)
- **Fixed type safety**: Changed `AIError.details` from `any` to `Record<string, unknown>`

### 2. Ollama Provider Enhancement (`src/lib/ai/providers/ollama.ts`)
- **Dynamic Model Discovery**: 
  - Replaced hardcoded model list with API-based discovery
  - Added `fetchAvailableModels()` method that calls Ollama's `/api/tags` endpoint
  - Implemented model caching to reduce API calls
  
- **Model Formatting**:
  - `formatModelName()`: Converts model names (e.g., "llama3.2:latest" → "Llama 3.2")
  - `formatSize()`: Displays model sizes in human-readable format (GB)
  - `estimateMaxTokens()`: Estimates max tokens based on model name patterns

- **New Methods**:
  - `refreshModels()`: Clears cache and re-fetches models from server
  - Updated `listAvailableModels()`: Returns model IDs from dynamically fetched list

### 3. AI Service Integration (`src/lib/ai/ai-service.ts`)
- **Custom URL Support**: OllamaProvider now receives URL from settings
  ```typescript
  const ollamaUrl = this.settings.ollamaUrl || 'http://localhost:11434';
  this.providers.set('ollama', new OllamaProvider(ollamaUrl));
  ```
- **Default Settings**: Added `ollamaUrl: 'http://localhost:11434'` to default settings

### 4. User Interface (`src/components/AIChat.tsx`)
- **New State Management**:
  - `ollamaModels`: Stores dynamically fetched models
  - `loadingModels`: Loading indicator for model fetch
  - `modelError`: Error messages from Ollama connection failures

- **Ollama URL Input**:
  - Added text input field for custom Ollama server URL
  - Shows helpful placeholder and instructions
  - Real-time validation and error display

- **Dynamic Model Selection**:
  - Models automatically fetched when Ollama provider is selected
  - Refresh button to manually reload models
  - Loading state with spinner during model fetch
  - Error handling with user-friendly messages
  - Automatic model selection when list updates

- **Improved UX**:
  - Shows "No models found" message with pull instructions
  - Disables model dropdown when loading or no models available
  - Visual feedback for all connection states

## Usage

### Setting Custom Ollama URL
1. Open AI Chat settings
2. Select "Ollama (Local)" as provider
3. Enter your custom URL in the "Ollama Server URL" field (e.g., `http://192.168.1.100:11434`)
4. Models will automatically be fetched from the server

### Model Management
- Models are fetched automatically when you:
  - Select Ollama as provider
  - Change the Ollama URL
- Click "↻ Refresh" button to manually reload models
- If no models found, follow the instructions to pull one: `ollama pull llama3.2`

## Benefits

1. **Flexibility**: Support for remote Ollama servers and custom ports
2. **Accuracy**: Shows only actually installed models (no hardcoded list)
3. **User-Friendly**: Clear error messages and helpful instructions
4. **Performance**: Model list caching to reduce API calls
5. **Reliability**: Graceful error handling for connection issues

## Technical Details

### Ollama API Integration
The implementation uses Ollama's REST API:
- **Endpoint**: `GET /api/tags`
- **Response Format**:
  ```json
  {
    "models": [
      {
        "name": "llama3.2:latest",
        "size": 3825819519,
        "modified_at": "2024-10-17T..."
      }
    ]
  }
  ```

### Model Detection Patterns
Max token estimation based on model name:
- `codellama`: 16,384 tokens
- `llama3`: 8,192 tokens
- `mistral`: 8,192 tokens
- `gemma`: 8,192 tokens
- `phi`: 4,096 tokens
- Default: 4,096 tokens

## Future Enhancements

Potential improvements:
1. Test connection button for Ollama URL
2. Model download/pull directly from UI
3. Show model details (size, parameters, quantization)
4. Save multiple Ollama server presets
5. Auto-discovery of Ollama servers on local network

## Migration Notes

Existing users will automatically get the default URL (`http://localhost:11434`). No action required unless using a custom Ollama setup.

Settings are backward compatible - the `ollamaUrl` field is optional and will default appropriately if not present.
