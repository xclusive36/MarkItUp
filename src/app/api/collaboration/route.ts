import { NextRequest, NextResponse } from 'next/server';
import { CollaborativeSession, Participant } from '../../../lib/types';

// In-memory storage for demo purposes
// In production, you'd use a database
const sessions = new Map<string, CollaborativeSession>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    // Get specific session
    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  } else {
    // Get all sessions
    return NextResponse.json(Array.from(sessions.values()));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, noteId, participant } = await request.json();

    if (!sessionId || !noteId || !participant) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, noteId, participant' },
        { status: 400 }
      );
    }

    let session = sessions.get(sessionId);
    
    if (!session) {
      // Create new session
      session = {
        id: sessionId,
        noteId,
        participants: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };
      sessions.set(sessionId, session);
    }

    // Add participant if not already in session
    const existingParticipant = session.participants.find(p => p.id === participant.id);
    if (!existingParticipant) {
      session.participants.push({
        ...participant,
        lastSeen: new Date().toISOString(),
        isActive: true,
      });
    } else {
      // Update existing participant
      existingParticipant.lastSeen = new Date().toISOString();
      existingParticipant.isActive = true;
    }

    session.lastActivity = new Date().toISOString();

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error handling collaboration session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, participantId, updates } = await request.json();

    if (!sessionId || !participantId) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, participantId' },
        { status: 400 }
      );
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const participant = session.participants.find(p => p.id === participantId);
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Update participant
    Object.assign(participant, updates, {
      lastSeen: new Date().toISOString(),
    });

    session.lastActivity = new Date().toISOString();

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const participantId = searchParams.get('participantId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      );
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (participantId) {
      // Remove specific participant
      session.participants = session.participants.filter(p => p.id !== participantId);
      
      // Remove session if no participants left
      if (session.participants.length === 0) {
        sessions.delete(sessionId);
        return NextResponse.json({ message: 'Session deleted' });
      }
      
      session.lastActivity = new Date().toISOString();
      return NextResponse.json(session);
    } else {
      // Delete entire session
      sessions.delete(sessionId);
      return NextResponse.json({ message: 'Session deleted' });
    }
  } catch (error) {
    console.error('Error deleting session/participant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cleanup inactive sessions (called periodically)
async function cleanupInactiveSessions() {
  const now = Date.now();
  const timeoutDuration = 30 * 60 * 1000; // 30 minutes

  for (const [sessionId, session] of sessions.entries()) {
    const lastActivity = new Date(session.lastActivity).getTime();
    
    if (now - lastActivity > timeoutDuration) {
      sessions.delete(sessionId);
      console.log(`Cleaned up inactive session: ${sessionId}`);
    } else {
      // Mark inactive participants
      session.participants = session.participants.filter(participant => {
        const lastSeen = new Date(participant.lastSeen).getTime();
        const isActive = now - lastSeen < timeoutDuration;
        
        if (isActive) {
          participant.isActive = true;
        }
        
        return isActive;
      });

      // Remove session if no active participants
      if (session.participants.length === 0) {
        sessions.delete(sessionId);
        console.log(`Removed session with no active participants: ${sessionId}`);
      }
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupInactiveSessions, 5 * 60 * 1000);
