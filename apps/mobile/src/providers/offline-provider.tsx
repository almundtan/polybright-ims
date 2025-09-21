import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import { API_BASE } from '../constants';
import { useAuth } from '../hooks/use-auth';

interface OfflineMutation {
  id: string;
  type: string;
  payload: string;
}

interface OfflineContextValue {
  pending: OfflineMutation[];
  enqueue: (record: { type: string; payload: unknown }) => Promise<void>;
  flush: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

const db = SQLite.openDatabaseSync('polybright.db');

db.execSync('CREATE TABLE IF NOT EXISTS mutations (id TEXT PRIMARY KEY, type TEXT, payload TEXT)');

export const OfflineProvider = ({ children }: { children: React.ReactNode }) => {
  const [pending, setPending] = useState<OfflineMutation[]>([]);
  const { token } = useAuth();

  const reload = useCallback(() => {
    const rows = db.getAllSync<OfflineMutation>('SELECT * FROM mutations ORDER BY id DESC');
    setPending(rows ?? []);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const enqueue = useCallback(async ({ type, payload }: { type: string; payload: unknown }) => {
    const id = Date.now().toString();
    db.runSync('INSERT INTO mutations (id, type, payload) VALUES (?,?,?)', id, type, JSON.stringify(payload));
    reload();
  }, [reload]);

  const flush = useCallback(async () => {
    if (!pending.length || !token) return;
    await axios.post(
      `${API_BASE}/sync/push`,
      {
        clientId: 'expo-device',
        lastSyncedAt: new Date(Date.now() - 60_000).toISOString(),
        mutations: pending.map((item) => ({ type: item.type, payload: JSON.parse(item.payload) }))
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    db.runSync('DELETE FROM mutations');
    reload();
  }, [pending, reload, token]);

  useEffect(() => {
    const interval = setInterval(() => {
      void flush();
    }, 30000);
    return () => clearInterval(interval);
  }, [flush]);

  const value = useMemo(() => ({ pending, enqueue, flush }), [pending, enqueue, flush]);

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOfflineQueue = () => {
  const ctx = React.useContext(OfflineContext);
  if (!ctx) throw new Error('useOfflineQueue must be used within OfflineProvider');
  return ctx;
};
