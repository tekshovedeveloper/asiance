import type { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocketUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
  return api.replace(/\/api$/, '');
}

export function getSocket(): Socket | null {
  return socket;
}

export async function connectChatSocket(token: string): Promise<Socket> {
  if (socket?.connected) return socket;

  const { io } = await import('socket.io-client');
  const baseUrl = getSocketUrl();

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(`${baseUrl}/chat`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
