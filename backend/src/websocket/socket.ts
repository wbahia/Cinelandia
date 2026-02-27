import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  // Accepted origins — env var supports comma-separated list for multiple frontends
    const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:5173';
    const origins = rawOrigins.split(',').map(o => o.trim());

    io = new SocketIOServer(httpServer, {
        cors: {
            origin: (requestOrigin, callback) => {
                // Allow requests with no origin (e.g. mobile apps, curl)
                if (!requestOrigin) return callback(null, true);

                // In development, allow all localhost ports
                if (process.env.NODE_ENV !== 'production') {
                if (requestOrigin.startsWith('http://localhost') || requestOrigin.startsWith('http://127.0.0.1')) {
                    return callback(null, true);
                }
                }

                if (origins.includes(requestOrigin)) {
                return callback(null, true);
                }

                console.warn(`[WS] CORS blocked origin: ${requestOrigin}`);
                callback(new Error(`Origin ${requestOrigin} not allowed`));
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
        // Allow both WebSocket and long-polling fallback
        transports: ['websocket', 'polling'],
        allowEIO3: true,
    });

    io.on('connection', (socket: Socket) => {
        console.log(`[WS] Client connected: ${socket.id} (origin: ${socket.handshake.headers.origin})`);

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

        socket.on('disconnect', (reason) => {
            console.log(`[WS] Client disconnected: ${socket.id} — reason: ${reason}`);
        });

        socket.on('error', (err) => {
            console.error(`[WS] Socket error: ${socket.id}`, err);
        });
    });

    return io;
}

export function getIO(): SocketIOServer {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
}

export function broadcastSessaoUpdate(
    sessaoId: number,
    reservados: number[],
    liberados: number[] = []
    ): void {
    const room = `sessao:${sessaoId}`;
    getIO().to(room).emit('assentos:update', { sessaoId, reservados, liberados });
    console.log(`[WS] Broadcast sessao:${sessaoId} → reservados=[${reservados}] liberados=[${liberados}]`);
}