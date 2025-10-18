# Ollama API Key Fix

## Issue
The AI Assistant was not working with Ollama because the API endpoint was checking for an API key even though Ollama (self-hosted) doesn't require one.

## Root Cause
In `/src/app/api/ai/route.ts`, the POST endpoint was checking:
```typescript
if (!settings.apiKey) {
  return NextResponse.json(
    { 
      success: false, 
      error: { 
        code: 'NOT_CONFIGURED', 
        message: 'AI service not configured. Please add your API key in settings.' 
      } 
    },
    { status: 400 }
  );
}
```

This check didn't account for Ollama, which doesn't require an API key since it's self-hosted.

## Fix Applied
Updated the API key validation to allow Ollama without an API key:

```typescript
// Check if AI is configured (allow Ollama without API key)
const settings = aiService.getSettings();
if (!settings.apiKey && settings.provider !== 'ollama') {
  return NextResponse.json(
    { 
      success: false, 
      error: { 
        code: 'NOT_CONFIGURED', 
        message: 'AI service not configured. Please add your API key in settings.' 
      } 
    },
    { status: 400 }
  );
}
```

## Files Changed
- `/src/app/api/ai/route.ts` - Updated POST endpoint API key validation

## Testing
To test the fix:

1. **Without Ollama configured:**
   - Open AI Assistant
   - Default provider is OpenAI
   - Should show error: "AI not configured. Please add your API key in settings."
   
2. **With Ollama configured:**
   - Open AI Assistant Settings
   - Change provider to "Ollama (Local)"
   - No API key should be required or displayed
   - Set Ollama URL (default: http://localhost:11434)
   - Select a model from the list
   - Send a message - should work without API key

## Related Components
The frontend already had the correct logic in `AIChat.tsx`:
```typescript
// Check if AI is configured (allow Ollama without API key)
if (!settings?.apiKey && settings?.provider !== 'ollama') {
  setError('AI not configured. Please add your API key in settings.');
  setShowSettings(true);
  return;
}
```

This fix brings the backend API validation in line with the frontend logic.

## Notes on Other AI Endpoints
The following API endpoints are still hardcoded to use OpenAI with environment variables:
- `/src/app/api/ai/analyze/route.ts` - Content analysis
- `/src/app/api/ai/suggest-note/route.ts` - Note suggestions  
- `/src/app/api/ai/analyze-knowledge/route.ts` - Knowledge gap analysis

These are used by separate plugins:
- `WritingAssistant.tsx`
- `ResearchAssistant.tsx`
- `KnowledgeDiscovery.tsx`

These plugins could be updated in the future to support Ollama, but they are separate from the main AI Chat Assistant which now works with Ollama.

## Date
October 18, 2025
