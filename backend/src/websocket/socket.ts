import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Client watches a specific session
    socket.on('watch:sessao', (sessaoId: number) => {
      const room = `sessao:${sessaoId}`;
      socket.join(room);
      console.log(`[WS] ${socket.id} joined room ${room}`);
    });

    socket.on('unwatch:sessao', (sessaoId: number) => {
      const room = `sessao:${sessaoId}`;
      socket.leave(room);
      console.log(`[WS] ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

/**
 * Broadcasts seat status changes to all watchers of a session.
 * event: 'assentos:update'
 * payload: { sessaoId, reservados: number[], liberados: number[] }
 */
export function broadcastSessaoUpdate(
  sessaoId: number,
  reservados: number[],
  liberados: number[] = []
): void {
  const room = `sessao:${sessaoId}`;
  getIO().to(room).emit('assentos:update', { sessaoId, reservados, liberados });
  console.log(`[WS] Broadcast sessao:${sessaoId} → reservados=${reservados}, liberados=${liberados}`);
}