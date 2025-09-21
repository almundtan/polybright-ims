'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api';

export interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('polybright_token') : null;
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}
