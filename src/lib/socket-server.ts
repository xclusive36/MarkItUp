import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  CollaborativeSession,
  Participant,
  CollaborativeOperation,
  // CollaborativeEvent, // Commented out: not used
  CursorPosition,
  SelectionRange,
} from './types';

interface ServerToClientEvents {
  'session-joined': (session: CollaborativeSession) => void;
  'participant-joined': (participant: Participant) => void;
  'participant-left': (participantId: string) => void;
  'operation-received': (operation: CollaborativeOperation) => void;
  'cursor-moved': (participantId: string, cursor: CursorPosition) => void;
  'selection-changed': (participantId: string, selection: SelectionRange) => void;
  'document-saved': (timestamp: number) => void;
  error: (error: string) => void;
}

interface ClientToServerEvents {
  'join-session': (
    sessionId: string,
    participant: Omit<Participant, 'id' | 'lastSeen' | 'isActive'>
  ) => void;
  'leave-session': (sessionId: string) => void;
  'send-operation': (operation: Omit<CollaborativeOperation, 'id' | 'timestamp'>) => void;
  'move-cursor': (cursor: CursorPosition) => void;
  'change-selection': (selection: SelectionRange) => void;
  'save-document': (content: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  participantId?: string;
  sessionId?: string;
}

export class CollaborativeSocketServer {
  private io: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
  private sessions = new Map<string, CollaborativeSession>();
  private operations = new Map<string, CollaborativeOperation[]>(); // sessionId -> operations

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin:
          process.env.NODE_ENV === 'production'
            ? process.env.FRONTEND_URL
            : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on(
      'connection',
      (
        socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
      ) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on(
          'join-session',
          (
            sessionId: string,
            participantData: Omit<Participant, 'id' | 'lastSeen' | 'isActive'>
          ) => {
            this.handleJoinSession(socket, sessionId, participantData);
          }
        );

        socket.on('leave-session', (sessionId: string) => {
          this.handleLeaveSession(socket, sessionId);
        });

        socket.on(
          'send-operation',
          (operationData: Omit<CollaborativeOperation, 'id' | 'timestamp'>) => {
            this.handleOperation(socket, operationData);
          }
        );

        socket.on('move-cursor', (cursor: CursorPosition) => {
          this.handleCursorMove(socket, cursor);
        });

        socket.on('change-selection', (selection: SelectionRange) => {
          this.handleSelectionChange(socket, selection);
        });

        socket.on('save-document', (content: string) => {
          this.handleDocumentSave(socket, content);
        });

        socket.on('disconnect', () => {
          this.handleDisconnect(socket);
        });
      }
    );
  }

  private handleJoinSession(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    sessionId: string,
    participantData: Omit<Participant, 'id' | 'lastSeen' | 'isActive'>
  ) {
    const participantId = this.generateParticipantId();
    const participant: Participant = {
      ...participantData,
      id: participantId,
      lastSeen: new Date().toISOString(),
      isActive: true,
    };

    // Store participant info in socket data
    socket.data.participantId = participantId;
    socket.data.sessionId = sessionId;

    // Join the session room
    socket.join(sessionId);

    // Get or create session
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        noteId: sessionId, // Assuming sessionId is the noteId
        participants: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };
      this.sessions.set(sessionId, session);
      this.operations.set(sessionId, []);
    }

    // Add participant to session
    session.participants.push(participant);
    session.lastActivity = new Date().toISOString();

    // Notify all participants about the new participant
    socket.to(sessionId).emit('participant-joined', participant);

    // Send session info to the joining participant
    socket.emit('session-joined', session);

    console.log(`Participant ${participantId} joined session ${sessionId}`);
  }

  private handleLeaveSession(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    sessionId: string
  ) {
    const participantId = socket.data.participantId;
    if (!participantId) return;

    socket.leave(sessionId);

    const session = this.sessions.get(sessionId);
    if (session) {
      // Remove participant from session
      session.participants = session.participants.filter(p => p.id !== participantId);
      session.lastActivity = new Date().toISOString();

      // Notify other participants
      socket.to(sessionId).emit('participant-left', participantId);

      // Clean up empty sessions
      if (session.participants.length === 0) {
        this.sessions.delete(sessionId);
        this.operations.delete(sessionId);
      }
    }

    socket.data.participantId = undefined;
    socket.data.sessionId = undefined;

    console.log(`Participant ${participantId} left session ${sessionId}`);
  }

  private handleOperation(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    operationData: Omit<CollaborativeOperation, 'id' | 'timestamp'>
  ) {
    const { sessionId, participantId } = socket.data;
    if (!sessionId || !participantId) return;

    const operation: CollaborativeOperation = {
      ...operationData,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      authorId: participantId,
    };

    // Store operation
    const operations = this.operations.get(sessionId) || [];
    operations.push(operation);
    this.operations.set(sessionId, operations);

    // Update session activity
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date().toISOString();
    }

    // Broadcast operation to other participants
    socket.to(sessionId).emit('operation-received', operation);

    console.log(`Operation ${operation.id} received in session ${sessionId}`);
  }

  private handleCursorMove(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    cursor: CursorPosition
  ) {
    const { sessionId, participantId } = socket.data;
    if (!sessionId || !participantId) return;

    // Update participant cursor in session
    const session = this.sessions.get(sessionId);
    if (session) {
      const participant = session.participants.find(p => p.id === participantId);
      if (participant) {
        participant.cursor = cursor;
        participant.lastSeen = new Date().toISOString();
      }
    }

    // Broadcast cursor position to other participants
    socket.to(sessionId).emit('cursor-moved', participantId, cursor);
  }

  private handleSelectionChange(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    selection: SelectionRange
  ) {
    const { sessionId, participantId } = socket.data;
    if (!sessionId || !participantId) return;

    // Update participant selection in session
    const session = this.sessions.get(sessionId);
    if (session) {
      const participant = session.participants.find(p => p.id === participantId);
      if (participant) {
        participant.selection = selection;
        participant.lastSeen = new Date().toISOString();
      }
    }

    // Broadcast selection to other participants
    socket.to(sessionId).emit('selection-changed', participantId, selection);
  }

  private handleDocumentSave(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    _content: string // content parameter unused in stub
  ) {
    const { sessionId } = socket.data;
    if (!sessionId) return;

    // Here you would typically save the document to your file system or database
    // For now, we'll just broadcast the save event
    const timestamp = Date.now();
    this.io.to(sessionId).emit('document-saved', timestamp);

    console.log(`Document saved in session ${sessionId}`);
  }

  private handleDisconnect(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
  ) {
    const { sessionId, participantId } = socket.data;
    if (sessionId && participantId) {
      this.handleLeaveSession(socket, sessionId);
    }
    console.log(`Client disconnected: ${socket.id}`);
  }

  private generateParticipantId(): string {
    return `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getSession(sessionId: string): CollaborativeSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getOperations(sessionId: string): CollaborativeOperation[] {
    return this.operations.get(sessionId) || [];
  }

  public getAllSessions(): CollaborativeSession[] {
    return Array.from(this.sessions.values());
  }
}

// Export singleton instance
let socketServer: CollaborativeSocketServer | null = null;

export function initializeSocketServer(httpServer: HTTPServer): CollaborativeSocketServer {
  if (!socketServer) {
    socketServer = new CollaborativeSocketServer(httpServer);
  }
  return socketServer;
}

export function getSocketServer(): CollaborativeSocketServer | null {
  return socketServer;
}
