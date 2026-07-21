'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import type { ChatMessage } from '@/lib/api';

type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  onNewMessage: (handler: (msg: ChatMessage) => void) => () => void;
  onMessageSaved: (handler: (msg: ChatMessage) => void) => () => void;
  onMessageDeleted: (handler: (data: { threadId: string; messageId: string }) => void) => () => void;
  onNotification: (handler: (n: { type: string; message: string; threadId?: string }) => void) => () => void;
  onTyping: (handler: (data: { userId: string; threadId: string; isTyping: boolean }) => void) => () => void;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  onNewMessage: () => () => {},
  onMessageSaved: () => () => {},
  onMessageDeleted: () => () => {},
  onNotification: () => () => {},
  onTyping: () => () => {},
});

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('asiance_token') : null;
    if (!token) return;

    let s: Socket;

    import('socket.io-client').then(({ io }) => {
      const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
      const baseUrl = api.replace(/\/api$/, '');

      s = io(`${baseUrl}/chat`, {
        auth: { token },
        transports: ['polling', 'websocket'],
        tryAllTransports: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1500,
      });

      s.on('connect', () => setConnected(true));
      s.on('disconnect', () => setConnected(false));

      socketRef.current = s;
      setSocket(s);
    });

    return () => {
      s?.disconnect();
      socketRef.current = null;
    };
  }, []);

  function onNewMessage(handler: (msg: ChatMessage) => void) {
    const s = socketRef.current;
    if (!s) return () => {};
    s.on('new-message', handler);
    return () => s.off('new-message', handler);
  }

  function onMessageSaved(handler: (msg: ChatMessage) => void) {
    const s = socketRef.current;
    if (!s) return () => {};
    s.on('message-saved', handler);
    return () => s.off('message-saved', handler);
  }

  function onMessageDeleted(handler: (data: { threadId: string; messageId: string }) => void) {
    const s = socketRef.current;
    if (!s) return () => {};
    s.on('message-deleted', handler);
    return () => s.off('message-deleted', handler);
  }

  function onNotification(handler: (n: { type: string; message: string; threadId?: string }) => void) {
    const s = socketRef.current;
    if (!s) return () => {};
    s.on('notification', handler);
    return () => s.off('notification', handler);
  }

  function onTyping(handler: (data: { userId: string; threadId: string; isTyping: boolean }) => void) {
    const s = socketRef.current;
    if (!s) return () => {};
    s.on('typing', handler);
    return () => s.off('typing', handler);
  }

  return (
    <SocketContext.Provider value={{ socket, connected, onNewMessage, onMessageSaved, onMessageDeleted, onNotification, onTyping }}>
      {children}
    </SocketContext.Provider>
  );
}
