import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

// Singleton socket — shared across all hook instances
let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['polling', 'websocket'], // polling first — more reliable behind proxies
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 10000,
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('[WS] Conectado:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[WS] Erro de conexão:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[WS] Desconectado:', reason);
    });
  }
  return socket;
}

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface SeatUpdatePayload {
  sessaoId: number;
  reservados: number[];
  liberados: number[];
}

export function useSessaoSocket(
  sessaoId: number | null,
  onUpdate: (payload: SeatUpdatePayload) => void
) {
  const [status, setStatus] = useState<WsStatus>('connecting');
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const s = getSocket();

    // Sync initial status
    setStatus(s.connected ? 'connected' : 'connecting');

    const onConnect    = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onError      = () => setStatus('error');

    s.on('connect',    onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onError);

    return () => {
      s.off('connect',       onConnect);
      s.off('disconnect',    onDisconnect);
      s.off('connect_error', onError);
    };
  }, []);

  useEffect(() => {
    if (!sessaoId) return;

    const s = getSocket();

    const joinRoom = () => {
      s.emit('watch:sessao', sessaoId);
      console.log(`[WS] Watching sessao:${sessaoId}`);
    };

    // Join immediately if already connected, otherwise wait for connect
    if (s.connected) {
      joinRoom();
    } else {
      s.once('connect', joinRoom);
    }

    const handler = (payload: SeatUpdatePayload) => {
      if (Number(payload.sessaoId) === Number(sessaoId)) {
        onUpdateRef.current(payload);
      }
    };

    s.on('assentos:update', handler);

    return () => {
      s.off('assentos:update', handler);
      s.off('connect', joinRoom);
      if (s.connected) {
        s.emit('unwatch:sessao', sessaoId);
      }
    };
  }, [sessaoId]);

  return { status };
}