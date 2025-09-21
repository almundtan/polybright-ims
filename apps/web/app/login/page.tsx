'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'admin@polybright.test', password: 'Admin123!' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await login(form.email, form.password);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded bg-white p-8 shadow"
      >
        <h1 className="text-center text-2xl font-semibold">Sign in</h1>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <label className="block">
          <span className="text-sm text-slate-600">Email</span>
          <input
            type="email"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Password</span>
          <input
            type="password"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
