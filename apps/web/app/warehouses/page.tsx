'use client';

import { FormEvent, useState } from 'react';
import useSWR from 'swr';
import { AppShell } from '@/components/app-shell';
import { apiFetch } from '@/lib/api';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
}

interface ListResponse {
  items: Warehouse[];
}

export default function WarehousesPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('polybright_token') : null;
  const { data, mutate } = useSWR<ListResponse>(
    token ? '/warehouses' : null,
    (url) => apiFetch(url)
  );
  const [form, setForm] = useState({ name: '', code: '', address: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiFetch('/warehouses', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', code: '', address: '' });
      setError(null);
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Warehouses</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded border p-4">
          <h2 className="text-lg font-semibold">Add Warehouse</h2>
          {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Code"
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            required
          />
          <textarea
            className="w-full rounded border px-3 py-2"
            placeholder="Address"
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          />
          <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
            Save
          </button>
        </form>
        <div className="rounded border p-4">
          <h2 className="text-lg font-semibold">Org Warehouses</h2>
          <ul className="mt-4 space-y-2">
            {data?.items.map((warehouse) => (
              <li key={warehouse.id} className="rounded border px-3 py-2">
                <div className="font-medium">{warehouse.name}</div>
                <div className="text-xs text-slate-500">Code: {warehouse.code}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
