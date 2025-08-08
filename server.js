const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { WebSocketServer } = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// When using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Setup Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
    },
  });

  // Setup YJS WebSocket Server for real-time document synchronization
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    console.log('YJS WebSocket connection established');
    setupWSConnection(ws, req);
  });

  // Collaborative editing state
  const sessions = new Map();
  const operations = new Map();

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-session', (sessionId, participantData) => {
      const participantId = generateParticipantId();
      const participant = {
        ...participantData,
        id: participantId,
        lastSeen: new Date().toISOString(),
        isActive: true,
      };

      socket.data = { participantId, sessionId };
      socket.join(sessionId);

      let session = sessions.get(sessionId);
      if (!session) {
        session = {
          id: sessionId,
          noteId: sessionId,
          participants: [],
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };
        sessions.set(sessionId, session);
        operations.set(sessionId, []);
      }

      session.participants.push(participant);
      session.lastActivity = new Date().toISOString();

      socket.to(sessionId).emit('participant-joined', participant);
      socket.emit('session-joined', session);

      console.log(`Participant ${participantId} joined session ${sessionId}`);
    });

    socket.on('leave-session', (sessionId) => {
      const { participantId } = socket.data || {};
      if (!participantId) return;

      socket.leave(sessionId);
      
      const session = sessions.get(sessionId);
      if (session) {
        session.participants = session.participants.filter(p => p.id !== participantId);
        session.lastActivity = new Date().toISOString();

        socket.to(sessionId).emit('participant-left', participantId);

        if (session.participants.length === 0) {
          sessions.delete(sessionId);
          operations.delete(sessionId);
        }
      }

      socket.data = {};
      console.log(`Participant ${participantId} left session ${sessionId}`);
    });

    socket.on('send-operation', (operationData) => {
      const { sessionId, participantId } = socket.data || {};
      if (!sessionId || !participantId) return;

      const operation = {
        ...operationData,
        id: generateOperationId(),
        timestamp: Date.now(),
        authorId: participantId,
      };

      const sessionOperations = operations.get(sessionId) || [];
      sessionOperations.push(operation);
      operations.set(sessionId, sessionOperations);

      const session = sessions.get(sessionId);
      if (session) {
        session.lastActivity = new Date().toISOString();
      }

      socket.to(sessionId).emit('operation-received', operation);
      console.log(`Operation ${operation.id} received in session ${sessionId}`);
    });

    socket.on('move-cursor', (cursor) => {
      const { sessionId, participantId } = socket.data || {};
      if (!sessionId || !participantId) return;

      const session = sessions.get(sessionId);
      if (session) {
        const participant = session.participants.find(p => p.id === participantId);
        if (participant) {
          participant.cursor = cursor;
          participant.lastSeen = new Date().toISOString();
        }
      }

      socket.to(sessionId).emit('cursor-moved', participantId, cursor);
    });

    socket.on('change-selection', (selection) => {
      const { sessionId, participantId } = socket.data || {};
      if (!sessionId || !participantId) return;

      const session = sessions.get(sessionId);
      if (session) {
        const participant = session.participants.find(p => p.id === participantId);
        if (participant) {
          participant.selection = selection;
          participant.lastSeen = new Date().toISOString();
        }
      }

      socket.to(sessionId).emit('selection-changed', participantId, selection);
    });

    socket.on('save-document', (content) => {
      const { sessionId } = socket.data || {};
      if (!sessionId) return;

      const timestamp = Date.now();
      io.to(sessionId).emit('document-saved', timestamp);
      console.log(`Document saved in session ${sessionId}`);
    });

    socket.on('disconnect', () => {
      const { sessionId, participantId } = socket.data || {};
      if (sessionId && participantId) {
        const session = sessions.get(sessionId);
        if (session) {
          session.participants = session.participants.filter(p => p.id !== participantId);
          session.lastActivity = new Date().toISOString();

          socket.to(sessionId).emit('participant-left', participantId);

          if (session.participants.length === 0) {
            sessions.delete(sessionId);
            operations.delete(sessionId);
          }
        }
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  function generateParticipantId() {
    return `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup inactive sessions
  function cleanupInactiveSessions() {
    const now = Date.now();
    const timeoutDuration = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of sessions.entries()) {
      const lastActivity = new Date(session.lastActivity).getTime();
      
      if (now - lastActivity > timeoutDuration) {
        sessions.delete(sessionId);
        operations.delete(sessionId);
        console.log(`Cleaned up inactive session: ${sessionId}`);
      }
    }
  }

  // Run cleanup every 5 minutes
  setInterval(cleanupInactiveSessions, 5 * 60 * 1000);

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running on http://${hostname}:${port}`);
    });
});
