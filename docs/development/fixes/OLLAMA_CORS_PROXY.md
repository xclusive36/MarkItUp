# Ollama CORS Proxy Implementation

## Issue

When testing Ollama connections from the frontend (clicking "Test" button in AI Settings), the browser made direct API calls to the Ollama server, which caused CORS (Cross-Origin Resource Sharing) errors.

**Original behavior:**
```javascript
// Direct call from frontend to Ollama
const response = await fetch(`${ollamaUrl}/api/tags`);
// ❌ CORS error: "No 'Access-Control-Allow-Origin' header"
```

**Workaround required:**
Users had to explicitly configure Ollama to allow the host in their Ollama config, which was:
- Not user-friendly
- Required manual configuration
- Different setup for each deployment

## Solution

Created a backend proxy endpoint that routes Ollama API calls through the Next.js server, eliminating CORS issues entirely.

**New architecture:**
```
Frontend → /api/ai/ollama-proxy → Ollama Server
```

## Implementation

### 1. Created Proxy API Endpoint

**File:** `/src/app/api/ai/ollama-proxy/route.ts`

**Features:**
- ✅ Proxies GET and POST requests to Ollama
- ✅ Supports streaming responses (for model pulling)
- ✅ Validates allowed endpoints (security)
- ✅ Provides helpful error messages
- ✅ No CORS configuration needed

**Supported Ollama Endpoints:**
- `/api/tags` - List installed models
- `/api/version` - Get Ollama version
- `/api/pull` - Download/pull models (with streaming)
- `/api/show` - Get model details
- `/api/delete` - Delete models

**Request Format:**
```typescript
POST /api/ai/ollama-proxy
{
  "ollamaUrl": "http://localhost:11434",
  "endpoint": "/api/tags",
  "method": "GET",
  "data": { ... } // Optional, for POST requests
}
```

**Response Format:**
```typescript
{
  "success": true,
  "data": { ... } // Ollama response data
}
```

**Error Response:**
```typescript
{
  "success": false,
  "error": "Error message",
  "helpText": "Troubleshooting hint" // Optional
}
```

### 2. Updated Frontend Components

**File:** `/src/components/AIChat.tsx`

Updated three functions to use the proxy:

#### fetchOllamaModels()
```typescript
// Before: Direct call
const response = await fetch(`${ollamaUrl}/api/tags`);

// After: Through proxy
const response = await fetch('/api/ai/ollama-proxy', {
  method: 'POST',
  body: JSON.stringify({
    ollamaUrl,
    endpoint: '/api/tags',
    method: 'GET',
  }),
});
```

#### testOllamaConnection()
```typescript
// Tests connection and gets version info
const response = await fetch('/api/ai/ollama-proxy', {
  method: 'POST',
  body: JSON.stringify({
    ollamaUrl,
    endpoint: '/api/tags',
    method: 'GET',
  }),
});

// Also fetches version
const versionResponse = await fetch('/api/ai/ollama-proxy', {
  method: 'POST',
  body: JSON.stringify({
    ollamaUrl,
    endpoint: '/api/version',
    method: 'GET',
  }),
});
```

#### handlePullModel()
```typescript
// Streams model download progress through proxy
const response = await fetch('/api/ai/ollama-proxy', {
  method: 'POST',
  body: JSON.stringify({
    ollamaUrl,
    endpoint: '/api/pull',
    method: 'POST',
    data: { name: modelToPull, stream: true },
  }),
});
```

## Benefits

### 1. No CORS Configuration Required
Users no longer need to configure Ollama with `OLLAMA_ORIGINS` or similar settings.

### 2. Better Error Handling
The proxy provides helpful error messages:
- "Make sure Ollama is running: `ollama serve`"
- "Check the hostname/URL"
- "Check network connection and firewall settings"

### 3. Security
- Validates allowed endpoints (prevents arbitrary requests)
- All requests go through controlled server endpoint
- No direct browser-to-Ollama communication

### 4. Consistent Architecture
Matches the pattern of other AI API calls that go through backend endpoints.

### 5. Future-Proof
Easy to add:
- Rate limiting
- Request logging
- Authentication
- Caching

## Testing

### Test Connection Feature
1. Open AI Settings
2. Select "Ollama (Local)"
3. Enter Ollama URL (e.g., `http://localhost:11434`)
4. Click "Test Connection"
5. ✅ Should connect without CORS errors
6. Should show: "✓ Connected (vX.X.X)! Found N models"

### Fetch Models
1. After successful connection
2. Models dropdown should populate
3. ✅ No CORS errors in console

### Pull Model
1. Enter model name (e.g., `llama3.2`)
2. Click download button
3. ✅ Should stream progress without CORS errors
4. Should show: "pulling manifest: 100%"

### Error Scenarios
1. **Ollama not running:**
   - Should show helpful message about starting Ollama
   
2. **Wrong URL:**
   - Should show clear error about checking hostname
   
3. **Network issues:**
   - Should provide firewall/connection hints

## Technical Details

### Streaming Support
The proxy correctly handles Ollama's streaming responses (used for model pulling):

```typescript
if (endpoint === '/api/pull' && data?.stream) {
  return new NextResponse(ollamaResponse.body, {
    status: ollamaResponse.status,
    headers: {
      'Content-Type': 'application/x-ndjson',
    },
  });
}
```

### Error Detection
Provides specific help based on error type:
- `ECONNREFUSED` → "Make sure Ollama is running"
- `ENOTFOUND` → "Check the hostname/URL"  
- `ETIMEDOUT` → "Check network connection"

## Files Changed

- ✅ `/src/app/api/ai/ollama-proxy/route.ts` - New proxy endpoint
- ✅ `/src/components/AIChat.tsx` - Updated to use proxy

## Migration Notes

**Breaking Changes:** None

**Backwards Compatibility:** Fully compatible - all existing functionality works the same, just without CORS errors.

**No User Action Required:** Users who previously configured CORS in Ollama can remove that configuration (though it won't cause any issues if left in place).

## Date

October 18, 2025
