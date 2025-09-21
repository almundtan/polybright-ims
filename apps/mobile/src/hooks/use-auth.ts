import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import { API_BASE } from '../constants';

interface User {
  id: string;
  orgId: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const db = SQLite.openDatabaseSync('polybright.db');

db.execSync('CREATE TABLE IF NOT EXISTS session (token TEXT, user TEXT)');

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const row = db.getAllSync<{ token: string; user: string }>('SELECT token, user FROM session LIMIT 1');
    if (row?.length) {
      setToken(row[0].token);
      setUser(JSON.parse(row[0].user));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post<{ token: string; user: User }>(`${API_BASE}/auth/login`, {
      email,
      password
    });
    db.runSync('DELETE FROM session');
    db.runSync('INSERT INTO session (token, user) VALUES (?, ?)', res.data.token, JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    db.runSync('DELETE FROM session');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, token, login, logout }), [login, logout, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
