# API Reference

Complete reference for MarkItUp PKM APIs and integrations.

## 🌐 REST API

MarkItUp PKM provides a comprehensive REST API for external integrations and automation.

### Base URL

```
http://localhost:3000/api
```

For production deployments, replace `localhost:3000` with your domain.

### Authentication

Currently, MarkItUp PKM uses simple authentication. For production deployments, consider implementing proper authentication.

```bash
# API requests include optional headers
Authorization: Bearer your-api-token
Content-Type: application/json
```

## 📄 Files API

### List Files

Get a list of all markdown files.

```http
GET /api/files
```

**Response:**
```json
{
  "files": [
    {
      "name": "getting-started.md",
      "path": "/markdown/getting-started.md",
      "size": 1024,
      "modified": "2025-01-06T12:00:00.000Z",
      "created": "2025-01-06T12:00:00.000Z"
    }
  ]
}
```

### Get File Content

Retrieve the content of a specific file.

```http
GET /api/files/{filename}
```

**Parameters:**
- `filename` (string): Name of the file (e.g., "getting-started.md")

**Response:**
```json
{
  "name": "getting-started.md",
  "content": "# Getting Started\n\nWelcome to MarkItUp...",
  "metadata": {
    "title": "Getting Started",
    "tags": ["guide", "tutorial"],
    "created": "2025-01-06T12:00:00.000Z",
    "modified": "2025-01-06T12:00:00.000Z"
  }
}
```

### Create File

Create a new markdown file.

```http
POST /api/files
```

**Request Body:**
```json
{
  "name": "new-note.md",
  "content": "# New Note\n\nThis is a new note.",
  "metadata": {
    "title": "New Note",
    "tags": ["new"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "File created successfully",
  "file": {
    "name": "new-note.md",
    "path": "/markdown/new-note.md"
  }
}
```

### Update File

Update an existing file's content.

```http
PUT /api/files/{filename}
```

**Request Body:**
```json
{
  "content": "# Updated Content\n\nThis is updated content.",
  "metadata": {
    "title": "Updated Note",
    "tags": ["updated"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "File updated successfully"
}
```

### Delete File

Delete a markdown file.

```http
DELETE /api/files/{filename}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## 🔍 Search API

### Search Content

Search across all notes and content.

```http
GET /api/search?q={query}&limit={limit}&offset={offset}
```

**Parameters:**
- `q` (string): Search query
- `limit` (number, optional): Number of results (default: 20)
- `offset` (number, optional): Pagination offset (default: 0)

**Search Operators:**
- `tag:productivity` - Search by tag
- `folder:projects` - Search by folder
- `"exact phrase"` - Exact phrase matching
- `author:john` - Search by author

**Response:**
```json
{
  "query": "productivity",
  "total": 15,
  "results": [
    {
      "file": "productivity-tips.md",
      "title": "Productivity Tips",
      "excerpt": "Here are some great productivity tips...",
      "score": 0.95,
      "matches": [
        {
          "field": "content",
          "text": "productivity tips for better work",
          "start": 45,
          "end": 75
        }
      ]
    }
  ]
}
```

## 🏷️ Tags API

### List Tags

Get all tags in the knowledge base.

```http
GET /api/tags
```

**Response:**
```json
{
  "tags": [
    {
      "name": "productivity",
      "count": 12,
      "notes": [
        "productivity-tips.md",
        "time-management.md"
      ]
    },
    {
      "name": "technology",
      "count": 8,
      "notes": [
        "ai-trends.md",
        "web-development.md"
      ]
    }
  ]
}
```

### Get Tag Details

Get detailed information about a specific tag.

```http
GET /api/tags/{tagName}
```

**Response:**
```json
{
  "name": "productivity",
  "count": 12,
  "notes": [
    {
      "file": "productivity-tips.md",
      "title": "Productivity Tips",
      "excerpt": "Tips for being more productive...",
      "modified": "2025-01-06T12:00:00.000Z"
    }
  ],
  "relatedTags": ["efficiency", "workflow", "time-management"]
}
```

## 📊 Graph API

### Get Knowledge Graph

Retrieve the knowledge graph data.

```http
GET /api/graph
```

**Query Parameters:**
- `includeOrphans` (boolean): Include notes with no connections
- `minConnections` (number): Minimum connections for inclusion
- `tags` (string): Comma-separated tags to filter by

**Response:**
```json
{
  "nodes": [
    {
      "id": "productivity-tips.md",
      "label": "Productivity Tips",
      "type": "note",
      "connections": 5,
      "tags": ["productivity", "tips"],
      "folder": "guides"
    }
  ],
  "edges": [
    {
      "source": "productivity-tips.md",
      "target": "time-management.md",
      "type": "wikilink",
      "weight": 1
    }
  ],
  "stats": {
    "totalNodes": 150,
    "totalEdges": 320,
    "avgConnections": 2.13,
    "clusters": 8
  }
}
```

## 🤖 AI API

### AI Chat

Send messages to the AI assistant.

```http
POST /api/ai
```

**Request Body:**
```json
{
  "message": "Summarize my notes about productivity",
  "context": {
    "includeNotes": true,
    "maxNotes": 5,
    "tags": ["productivity"]
  },
  "model": "gpt-3.5-turbo",
  "temperature": 0.7
}
```

**Response:**
```json
{
  "response": "Based on your productivity notes, here are the key themes...",
  "model": "gpt-3.5-turbo",
  "tokens": {
    "prompt": 150,
    "completion": 75,
    "total": 225
  },
  "context": {
    "notesUsed": 3,
    "relevantNotes": [
      "productivity-tips.md",
      "time-management.md"
    ]
  }
}
```

### Analyze Content

Get AI analysis of note content.

```http
POST /api/ai/analyze
```

**Request Body:**
```json
{
  "content": "# My Research Note\n\nThis note discusses...",
  "analysisType": "comprehensive",
  "includeContext": true
}
```

**Response:**
```json
{
  "analysis": {
    "summary": "This note discusses research methodologies...",
    "keyPoints": [
      "Research methods are important",
      "Data analysis techniques"
    ],
    "suggestedTags": ["research", "methodology", "data"],
    "readabilityScore": 75,
    "sentiment": "neutral",
    "topics": ["research", "analysis", "methodology"]
  },
  "suggestions": {
    "improvements": [
      "Consider adding more examples",
      "Expand the conclusion section"
    ],
    "relatedNotes": [
      "data-analysis.md",
      "research-methods.md"
    ]
  }
}
```

### Knowledge Analysis

Analyze the entire knowledge base.

```http
POST /api/ai/analyze-knowledge
```

**Response:**
```json
{
  "overview": {
    "totalNotes": 150,
    "totalWords": 45000,
    "avgWordsPerNote": 300,
    "topTopics": ["productivity", "technology", "research"]
  },
  "gaps": [
    {
      "topic": "Project Management",
      "confidence": 0.85,
      "suggestedContent": "Consider adding notes about agile methodologies"
    }
  ],
  "clusters": [
    {
      "name": "Productivity Cluster",
      "notes": 25,
      "centrality": 0.75,
      "keyNotes": ["productivity-tips.md", "time-management.md"]
    }
  ],
  "recommendations": [
    "Create more connections between technology and productivity notes",
    "Expand the research methodology section"
  ]
}
```

### Suggest Note

Get AI suggestions for new notes.

```http
POST /api/ai/suggest-note
```

**Request Body:**
```json
{
  "context": "productivity and time management",
  "noteType": "guide",
  "length": "medium"
}
```

**Response:**
```json
{
  "suggestion": {
    "title": "Deep Work Techniques for Developers",
    "content": "# Deep Work Techniques for Developers\n\n## Introduction\n\nDeep work is the ability to focus...",
    "tags": ["productivity", "deep-work", "development"],
    "relatedNotes": ["productivity-tips.md", "focus-techniques.md"],
    "rationale": "This note would fill a gap in your productivity collection by focusing specifically on deep work techniques."
  }
}
```

## 📈 Analytics API

### Get Analytics

Retrieve analytics data about your knowledge base.

```http
GET /api/analytics
```

**Query Parameters:**
- `period` (string): Time period (day, week, month, year)
- `metrics` (string): Comma-separated metrics to include

**Response:**
```json
{
  "overview": {
    "totalNotes": 150,
    "totalWords": 45000,
    "totalConnections": 320,
    "activePlugins": 8
  },
  "growth": {
    "notesThisWeek": 5,
    "wordsThisWeek": 2500,
    "connectionsThisWeek": 12
  },
  "activity": {
    "mostActiveDay": "Tuesday",
    "peakHour": 14,
    "averageSessionLength": 45
  },
  "content": {
    "topTags": [
      {"name": "productivity", "count": 25},
      {"name": "technology", "count": 18}
    ],
    "longestNote": {
      "file": "comprehensive-guide.md",
      "words": 2500
    },
    "mostConnected": {
      "file": "main-concepts.md",
      "connections": 15
    }
  }
}
```

### Track Event

Track custom analytics events.

```http
POST /api/analytics
```

**Request Body:**
```json
{
  "event": "note_created",
  "data": {
    "filename": "new-note.md",
    "wordCount": 150,
    "tags": ["new", "draft"]
  },
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "evt_123456789"
}
```

## 🤝 Collaboration API

### WebSocket Events

Real-time collaboration uses WebSocket connections with the following events:

#### Connect to Session

```javascript
// Client-side WebSocket connection
const socket = io('/collaboration');

socket.emit('join-session', {
  sessionId: 'session-123',
  user: {
    id: 'user-456',
    name: 'John Doe',
    color: '#3b82f6'
  }
});
```

#### Document Operations

```javascript
// Send document changes
socket.emit('operation', {
  sessionId: 'session-123',
  operation: {
    type: 'insert',
    position: 150,
    content: 'Hello world',
    author: 'user-456'
  }
});

// Receive document changes
socket.on('operation', (data) => {
  // Apply operation to document
  applyOperation(data.operation);
});
```

#### User Presence

```javascript
// Send cursor position
socket.emit('cursor', {
  sessionId: 'session-123',
  position: 150,
  selection: { start: 150, end: 165 }
});

// Receive other users' cursors
socket.on('cursor', (data) => {
  updateUserCursor(data.userId, data.position);
});
```

### REST Collaboration API

#### Create Session

```http
POST /api/collaboration
```

**Request Body:**
```json
{
  "documentId": "my-note.md",
  "permissions": {
    "read": true,
    "write": true,
    "admin": false
  }
}
```

**Response:**
```json
{
  "sessionId": "session-123",
  "shareLink": "https://your-domain.com/collaborate/session-123",
  "expiresAt": "2025-01-07T12:00:00.000Z"
}
```

#### Get Session Info

```http
GET /api/collaboration/{sessionId}
```

**Response:**
```json
{
  "sessionId": "session-123",
  "documentId": "my-note.md",
  "participants": [
    {
      "userId": "user-456",
      "name": "John Doe",
      "status": "active",
      "joinedAt": "2025-01-06T12:00:00.000Z"
    }
  ],
  "permissions": {
    "read": true,
    "write": true,
    "admin": false
  }
}
```

## 🔧 System API

### Health Check

Check system health and status.

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-06T12:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": "healthy",
    "filesystem": "healthy",
    "memory": "healthy"
  }
}
```

### Metrics

Get system performance metrics.

```http
GET /api/metrics
```

**Response:**
```json
{
  "system": {
    "memoryUsage": {
      "used": 256,
      "total": 1024,
      "percentage": 25
    },
    "cpuUsage": 15.5,
    "uptime": 3600
  },
  "application": {
    "activeUsers": 5,
    "totalRequests": 1250,
    "averageResponseTime": 150,
    "errorRate": 0.01
  }
}
```

## 🔌 Plugin API

### List Plugins

Get information about installed plugins.

```http
GET /api/plugins
```

**Response:**
```json
{
  "plugins": [
    {
      "id": "word-count",
      "name": "Enhanced Word Count",
      "version": "1.0.0",
      "enabled": true,
      "settings": {
        "readingSpeed": 200,
        "showCharacters": true
      }
    }
  ]
}
```

### Plugin Settings

Get or update plugin settings.

```http
GET /api/plugins/{pluginId}/settings
PUT /api/plugins/{pluginId}/settings
```

**Request Body (PUT):**
```json
{
  "readingSpeed": 250,
  "showCharacters": false
}
```

## 📚 Client Libraries

### JavaScript/TypeScript

```typescript
// MarkItUp API Client
class MarkItUpClient {
  constructor(private baseUrl: string, private apiKey?: string) {}

  async getFiles(): Promise<FileInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/files`);
    return response.json();
  }

  async getFile(filename: string): Promise<FileContent> {
    const response = await fetch(`${this.baseUrl}/api/files/${filename}`);
    return response.json();
  }

  async createFile(file: CreateFileRequest): Promise<CreateFileResponse> {
    const response = await fetch(`${this.baseUrl}/api/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(file)
    });
    return response.json();
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResults> {
    const params = new URLSearchParams({ q: query, ...options });
    const response = await fetch(`${this.baseUrl}/api/search?${params}`);
    return response.json();
  }
}

// Usage
const client = new MarkItUpClient('http://localhost:3000');
const files = await client.getFiles();
```

### Python

```python
import requests
from typing import List, Dict, Any

class MarkItUpClient:
    def __init__(self, base_url: str, api_key: str = None):
        self.base_url = base_url
        self.api_key = api_key
    
    def get_files(self) -> List[Dict[str, Any]]:
        response = requests.get(f"{self.base_url}/api/files")
        return response.json()["files"]
    
    def get_file(self, filename: str) -> Dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/files/{filename}")
        return response.json()
    
    def create_file(self, file_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/api/files",
            json=file_data
        )
        return response.json()
    
    def search(self, query: str, **options) -> Dict[str, Any]:
        params = {"q": query, **options}
        response = requests.get(f"{self.base_url}/api/search", params=params)
        return response.json()

# Usage
client = MarkItUpClient("http://localhost:3000")
files = client.get_files()
```

## 🔒 Security Considerations

### Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Search endpoints**: 50 requests per 15 minutes
- **AI endpoints**: 20 requests per 15 minutes

### CORS Configuration

Configure CORS for web applications:

```bash
CORS_ORIGIN=https://your-domain.com
CORS_METHODS=GET,POST,PUT,DELETE
CORS_HEADERS=Content-Type,Authorization
```

### API Key Authentication

For production use, implement API key authentication:

```bash
# Environment configuration
API_KEY_REQUIRED=true
API_KEYS=key1,key2,key3
```

```http
# Request headers
Authorization: Bearer your-api-key
```

## 📖 Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "The specified file was not found",
    "details": {
      "filename": "missing-file.md"
    }
  },
  "timestamp": "2025-01-06T12:00:00.000Z",
  "requestId": "req_123456789"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Codes

- `FILE_NOT_FOUND` - Requested file doesn't exist
- `INVALID_FORMAT` - Invalid file format or content
- `PERMISSION_DENIED` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `VALIDATION_ERROR` - Request validation failed

---

**Need help with the API?** Check out our [examples repository](https://github.com/xclusive36/MarkItUp-examples) or open an issue on GitHub.
