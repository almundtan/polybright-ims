'use client';

import { FormEvent, useState } from 'react';
import useSWR from 'swr';
import { AppShell } from '@/components/app-shell';
import { apiFetch } from '@/lib/api';
import { useOfflineQueue } from '@/providers/offline-queue-provider';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  uom: string;
}

interface ListResponse {
  items: Product[];
  total: number;
}

export default function ProductsPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('polybright_token') : null;
  const { data, mutate } = useSWR<ListResponse>(
    token ? '/products' : null,
    (url) => apiFetch(url)
  );
  const { enqueue, isOnline } = useOfflineQueue();
  const [form, setForm] = useState({ name: '', sku: '', barcode: '', uom: 'pc' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...form, barcode: form.barcode || undefined };
    try {
      if (isOnline) {
        await apiFetch<Product>('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        await mutate();
      } else {
        await enqueue({ type: 'product.create', payload });
      }
      setForm({ name: '', sku: '', barcode: '', uom: 'pc' });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <span className="text-sm text-slate-500">{isOnline ? 'Online' : 'Offline mode'}</span>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded border p-4">
          <h2 className="text-lg font-semibold">Add Product</h2>
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
            placeholder="SKU"
            value={form.sku}
            onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
            required
          />
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Barcode (optional)"
            value={form.barcode}
            onChange={(event) => setForm((prev) => ({ ...prev, barcode: event.target.value }))}
          />
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Unit of measure"
            value={form.uom}
            onChange={(event) => setForm((prev) => ({ ...prev, uom: event.target.value }))}
            required
          />
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-white"
          >
            Save
          </button>
        </form>
        <div className="rounded border p-4">
          <h2 className="text-lg font-semibold">Inventory SKUs</h2>
          <ul className="mt-4 space-y-2">
            {data?.items.map((product) => (
              <li key={product.id} className="rounded border px-3 py-2">
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-slate-500">SKU: {product.sku}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
