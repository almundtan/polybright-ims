'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface User {
  id: string;
  orgId: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('polybright_user') : null;
    if (raw) {
      setUser(JSON.parse(raw));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [loading, pathname, router, user]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false
    });
    localStorage.setItem('polybright_token', res.token);
    localStorage.setItem('polybright_user', JSON.stringify(res.user));
    setUser(res.user);
    router.push('/dashboard');
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('polybright_token');
    localStorage.removeItem('polybright_user');
    setUser(null);
    router.push('/login');
  };

  return { user, login, logout, loading };
}
