'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface OfflineMutation {
  id: string;
  type: string;
  payload: unknown;
}

interface OfflineQueueContextValue {
  enqueue: (mutation: Omit<OfflineMutation, 'id'>) => Promise<void>;
  pending: OfflineMutation[];
  isOnline: boolean;
}

const OfflineQueueContext = createContext<OfflineQueueContextValue | undefined>(undefined);

const STORAGE_KEY = 'polybright_offline_queue_v1';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api';

async function pushMutations(mutations: OfflineMutation[]) {
  if (!mutations.length) return true;

  const token = localStorage.getItem('polybright_token');

  const res = await fetch(`${API_BASE}/sync/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({
      clientId: 'web-client',
      lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      mutations: mutations.map(({ type, payload }) => ({ type, payload }))
    })
  });

  if (!res.ok) {
    throw new Error('Failed to push mutations');
  }
  return true;
}

export const OfflineQueueProvider = ({ children }: { children: React.ReactNode }) => {
  const [pending, setPending] = useState<OfflineMutation[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as OfflineMutation[]) : [];
    } catch (error) {
      console.warn('Failed to load offline queue', error);
      return [];
    }
  });
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncOnlineState = () => setIsOnline(navigator.onLine);
    syncOnlineState();
    window.addEventListener('online', syncOnlineState);
    window.addEventListener('offline', syncOnlineState);
    return () => {
      window.removeEventListener('online', syncOnlineState);
      window.removeEventListener('offline', syncOnlineState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  }, [pending]);

  const flush = useCallback(async () => {
    if (!isOnline || !pending.length) return;
    try {
      await pushMutations(pending);
      setPending([]);
    } catch (error) {
      console.warn('Flush failed', error);
    }
  }, [pending, isOnline]);

  useEffect(() => {
    if (!isOnline) return;
    const controller = new AbortController();
    const flushInterval = setInterval(() => {
      void flush();
    }, 15000);

    void flush();

    return () => {
      clearInterval(flushInterval);
      controller.abort();
    };
  }, [flush, isOnline]);

  const createId = useCallback(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  const enqueue = useCallback(async (mutation: Omit<OfflineMutation, 'id'>) => {
    const newMutation = { ...mutation, id: createId() };
    if (isOnline) {
      try {
        await pushMutations([newMutation]);
        return;
      } catch (error) {
        console.warn('Instant mutation failed, storing offline', error);
      }
    }
    setPending((current) => [...current, newMutation]);
  }, [createId, isOnline]);

  const value = useMemo(() => ({ enqueue, pending, isOnline }), [enqueue, pending, isOnline]);

  return <OfflineQueueContext.Provider value={value}>{children}</OfflineQueueContext.Provider>;
};

export const useOfflineQueue = () => {
  const ctx = useContext(OfflineQueueContext);
  if (!ctx) throw new Error('useOfflineQueue must be used within OfflineQueueProvider');
  return ctx;
};
