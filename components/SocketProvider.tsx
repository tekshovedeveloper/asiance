'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import type { ChatMessage } from '@/lib/api';
import { usePathname } from 'next/navigation';

type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  onNewMessage: (handler: (msg: ChatMessage) => void) => () => void;
  onMessageSaved: (handler: (msg: ChatMessage) => void) => () => void;
  onMessageDeleted: (handler: (data: { threadId: string; messageId: string }) => void) => () => void;
  onNotification: (handler: (n: { _id?: string; type: string; message: string; threadId?: string; link?: string; createdAt?: string }) => void) => () => void;
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
  const pathname = usePathname();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const syncToken = () => setAuthToken(localStorage.getItem('asiance_token'));
    syncToken();
    window.addEventListener('storage', syncToken);
    window.addEventListener('asiance:auth-changed', syncToken);
    return () => {
      window.removeEventListener('storage', syncToken);
      window.removeEventListener('asiance:auth-changed', syncToken);
    };
  }, [pathname]);

  useEffect(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
    setConnected(false);
    if (!authToken) return;

    let s: Socket;
    let cancelled = false;

    import('socket.io-client').then(({ io }) => {
      if (cancelled) return;
      const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
      const baseUrl = api.replace(/\/api$/, '');

      s = io(`${baseUrl}/chat`, {
        auth: { token: authToken },
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
      cancelled = true;
      s?.disconnect();
    };
  }, [authToken]);

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

  function onNotification(handler: (n: { _id?: string; type: string; message: string; threadId?: string; link?: string; createdAt?: string }) => void) {
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
