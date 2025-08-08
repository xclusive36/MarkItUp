# Collaborative Editing Documentation

## Overview

MarkItUp's collaborative editing feature enables real-time multi-user editing of markdown documents with conflict resolution, user presence indicators, and seamless synchronization across all connected clients.

## Features

### Core Functionality
- **Real-time synchronization** using YJS (Yama.js) for conflict-free replicated data types (CRDTs)
- **WebSocket communication** via Socket.IO for low-latency messaging
- **Operational transformation** for handling concurrent edits
- **User presence indicators** showing active collaborators
- **Cursor and selection tracking** for awareness of other users' actions
- **Automatic conflict resolution** with configurable strategies

### User Experience
- **Live participant list** with avatars and names
- **Colored cursors and selections** for each user
- **Connection status indicators** (connected/disconnecting/disconnected)
- **Auto-save functionality** with configurable intervals
- **Session management** with timeout handling

## Architecture

### Client-Side Components

#### `CollaborativeEditor`
Main editing component that integrates YJS and Socket.IO for real-time collaboration.

```typescript
<CollaborativeEditor
  noteId="document-123"
  initialContent="# Hello World"
  participant={{
    name: "John Doe",
    email: "john@example.com",
    color: "#3B82F6"
  }}
  settings={collaborationSettings}
  onContentChange={handleContentChange}
  onSave={handleSave}
/>
```

#### `CollaborationSettings`
Configuration interface for collaboration preferences.

```typescript
<CollaborationSettings
  settings={settings}
  onSettingsChange={updateSettings}
/>
```

#### `UserProfile`
User profile management for collaboration identity.

```typescript
<UserProfile onClose={handleCloseProfile} />
```

### Server-Side Components

#### Custom Next.js Server (`server.js`)
Extends Next.js with Socket.IO support for real-time communication.

#### Socket.IO Event Handlers
- `join-session`: User joins a collaborative session
- `leave-session`: User leaves a session
- `send-operation`: Document operation broadcast
- `move-cursor`: Cursor position updates
- `change-selection`: Text selection changes
- `save-document`: Document save events

#### API Routes
- `GET /api/collaboration`: Get session information
- `POST /api/collaboration`: Create/join session
- `PUT /api/collaboration`: Update participant data
- `DELETE /api/collaboration`: Leave session or delete session

### Data Synchronization

#### YJS Integration
```typescript
// Document synchronization
const yjsDoc = new Y.Doc();
const yText = yjsDoc.getText('content');

// WebSocket provider for sync
const provider = new WebsocketProvider(wsUrl, noteId, yjsDoc);

// Listen for changes
yText.observe((event) => {
  const content = yText.toString();
  onContentChange(content);
});
```

#### Conflict Resolution Strategies
1. **Operational Transform** (Recommended)
   - Transforms operations based on concurrent changes
   - Maintains causal consistency
   - Handles complex conflict scenarios

2. **Last Write Wins**
   - Simple timestamp-based resolution
   - May lose some edits in heavy conflict scenarios
   - Suitable for documents with minimal concurrent editing

3. **Manual Merge**
   - Presents conflicts to users for manual resolution
   - Preserves all changes for user review
   - Best for critical documents where no data loss is acceptable

## Configuration

### Collaboration Settings

```typescript
interface CollaborativeSettings {
  enableCollaboration: boolean;
  autoSaveInterval: number; // milliseconds
  conflictResolutionStrategy: 'last-write-wins' | 'operational-transform' | 'merge';
  showOtherCursors: boolean;
  showOtherSelections: boolean;
  maxParticipants: number;
  sessionTimeout: number; // milliseconds
}
```

### Default Configuration
```typescript
const defaultSettings: CollaborativeSettings = {
  enableCollaboration: false,
  autoSaveInterval: 30000, // 30 seconds
  conflictResolutionStrategy: 'operational-transform',
  showOtherCursors: true,
  showOtherSelections: true,
  maxParticipants: 10,
  sessionTimeout: 1800000, // 30 minutes
};
```

## Usage Guide

### Setting Up Collaboration

1. **Enable Collaboration**
   ```typescript
   const { settings, updateSettings } = useCollaboration();
   updateSettings({ enableCollaboration: true });
   ```

2. **Configure User Profile**
   ```typescript
   const { setCurrentUser } = useCollaboration();
   setCurrentUser({
     name: "Alice Smith",
     email: "alice@example.com",
     color: "#10B981",
     avatar: "https://example.com/avatar.jpg"
   });
   ```

3. **Start Collaborative Session**
   ```typescript
   <CollaborativeEditor
     noteId={documentId}
     initialContent={documentContent}
     participant={currentUser}
     settings={settings}
     onContentChange={handleContentChange}
     onSave={handleSave}
   />
   ```

### Managing Sessions

#### Joining a Session
Users automatically join sessions when opening a document with collaboration enabled.

#### Session Lifecycle
- **Creation**: First user to open a document creates the session
- **Joining**: Subsequent users join the existing session
- **Activity**: Session remains active while users are connected
- **Cleanup**: Sessions are automatically cleaned up after inactivity timeout

#### Participant Management
- Users can see all active participants
- Inactive users are automatically removed after timeout
- Maximum participant limits can be configured

### Integration with Existing Components

#### With Main Editor
```typescript
import { CollaborationProvider } from '../contexts/CollaborationContext';
import { CollaborativeEditor } from '../components/CollaborativeEditor';

export default function EditorPage() {
  return (
    <CollaborationProvider>
      <div className="editor-container">
        <CollaborativeEditor
          noteId={noteId}
          initialContent={content}
          participant={user}
          settings={settings}
          onContentChange={setContent}
          onSave={saveDocument}
        />
      </div>
    </CollaborationProvider>
  );
}
```

#### With Plugin System
Collaborative editing integrates with the plugin system through events:

```typescript
// Plugin can listen to collaboration events
pluginAPI.events.on('collaboration:user-joined', (participant) => {
  // Handle new user joining
});

pluginAPI.events.on('collaboration:operation', (operation) => {
  // Handle document operations
});
```

## Security Considerations

### Authentication
- User identity verification (implement according to your auth system)
- Session authorization (ensure users can access documents)
- Rate limiting for Socket.IO connections

### Data Protection
- Encrypt WebSocket connections (WSS in production)
- Validate all incoming operations
- Sanitize user-generated content

### Access Control
- Document-level permissions
- Participant limits per session
- Admin controls for session management

### Security Best Practices
```typescript
// Example: Validate user permissions before joining session
socket.on('join-session', async (sessionId, participantData) => {
  const user = await authenticateUser(socket.handshake.auth.token);
  const hasAccess = await checkDocumentAccess(user.id, sessionId);
  
  if (!hasAccess) {
    socket.emit('error', 'Access denied');
    return;
  }
  
  // Proceed with session join
});
```

## Performance Optimization

### Client-Side
- **Debounced operations**: Reduce frequency of small edits
- **Efficient diff calculation**: Minimize operation size
- **Connection pooling**: Reuse WebSocket connections
- **Local caching**: Cache document state locally

### Server-Side
- **Operation batching**: Group small operations
- **Memory management**: Clean up inactive sessions
- **Load balancing**: Distribute sessions across servers
- **Database optimization**: Efficient storage for history

### Network Optimization
```typescript
// Debounced operation sending
const debouncedSendOperation = debounce((operation) => {
  socket.emit('send-operation', operation);
}, 100);
```

## Monitoring and Debugging

### Logging
```typescript
// Client-side logging
console.log('Collaboration event:', {
  type: 'user-joined',
  sessionId,
  participantId,
  timestamp: Date.now()
});

// Server-side logging
console.log(`Session ${sessionId}: ${participants.length} active participants`);
```

### Metrics to Track
- Active sessions count
- Participants per session
- Operation frequency
- Connection stability
- Conflict resolution events

### Debugging Tools
- Browser dev tools for WebSocket inspection
- Socket.IO debug mode: `localStorage.debug = 'socket.io-client:socket'`
- YJS debugging: Enable YJS debug logs
- Network tab for operation monitoring

## Troubleshooting

### Common Issues

#### Connection Problems
```typescript
// Check WebSocket connection
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  // Implement retry logic
});
```

#### Sync Issues
```typescript
// YJS sync status
provider.on('sync', (isSynced) => {
  console.log('Sync status:', isSynced);
});
```

#### Performance Issues
- Monitor operation frequency
- Check for memory leaks in long sessions
- Optimize diff calculation algorithms

### Recovery Strategies
- **Connection recovery**: Automatic reconnection with exponential backoff
- **State recovery**: Reload document state from server
- **Conflict recovery**: Manual conflict resolution interface

## Future Enhancements

### Planned Features
- **Voice/video integration** for real-time communication
- **Document history** with version branching
- **Advanced permissions** (read-only, comment-only, edit)
- **Real-time comments** and suggestions
- **Presence awareness** improvements

### Integration Opportunities
- **GitHub integration** for version control
- **Slack/Discord** notifications for collaboration events
- **AI assistance** for collaborative writing
- **Mobile app** support

## API Reference

### Events

#### Client to Server
```typescript
interface ClientToServerEvents {
  'join-session': (sessionId: string, participant: ParticipantData) => void;
  'leave-session': (sessionId: string) => void;
  'send-operation': (operation: OperationData) => void;
  'move-cursor': (cursor: CursorPosition) => void;
  'change-selection': (selection: SelectionRange) => void;
  'save-document': (content: string) => void;
}
```

#### Server to Client
```typescript
interface ServerToClientEvents {
  'session-joined': (session: CollaborativeSession) => void;
  'participant-joined': (participant: Participant) => void;
  'participant-left': (participantId: string) => void;
  'operation-received': (operation: CollaborativeOperation) => void;
  'cursor-moved': (participantId: string, cursor: CursorPosition) => void;
  'selection-changed': (participantId: string, selection: SelectionRange) => void;
  'document-saved': (timestamp: number) => void;
  'error': (error: string) => void;
}
```

### Type Definitions

See `src/lib/types.ts` for complete type definitions including:
- `CollaborativeSession`
- `Participant`
- `CollaborativeOperation`
- `CursorPosition`
- `SelectionRange`
- `CollaborativeSettings`

## Examples

### Basic Setup
```typescript
import { CollaborationProvider, useCollaboration } from '../contexts/CollaborationContext';
import { CollaborativeEditor } from '../components/CollaborativeEditor';

function App() {
  return (
    <CollaborationProvider>
      <DocumentEditor />
    </CollaborationProvider>
  );
}

function DocumentEditor() {
  const { settings, currentUser } = useCollaboration();
  
  return (
    <CollaborativeEditor
      noteId="my-document"
      initialContent="# Collaborative Document"
      participant={currentUser}
      settings={settings}
      onContentChange={(content) => console.log('Content updated:', content)}
      onSave={(content) => console.log('Document saved:', content)}
    />
  );
}
```

### Custom Integration
```typescript
// Custom hook for collaboration
function useDocumentCollaboration(documentId: string) {
  const { settings, currentUser } = useCollaboration();
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!settings.enableCollaboration) return;
    
    // Initialize collaboration
    const socket = io();
    
    socket.emit('join-session', documentId, currentUser);
    
    socket.on('session-joined', (session) => {
      setParticipants(session.participants);
      setIsConnected(true);
    });
    
    return () => socket.disconnect();
  }, [documentId, settings.enableCollaboration]);
  
  return { participants, isConnected };
}
```

This collaborative editing system provides a robust foundation for real-time document collaboration with room for future enhancements and customization based on specific use cases.
