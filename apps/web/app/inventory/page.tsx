'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { AppShell } from '@/components/app-shell';
import { apiFetch } from '@/lib/api';

interface InventoryEntry {
  id: string;
  qty: string;
  warehouse: { id: string; name: string };
  product: { id: string; name: string; sku: string };
}

interface InventoryResponse {
  items: InventoryEntry[];
  total: number;
}

export default function InventoryPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('polybright_token') : null;
  const [filters, setFilters] = useState({ search: '' });
  const { data } = useSWR<InventoryResponse>(
    token ? '/inventory?limit=20&offset=0' : null,
    (url) => apiFetch(url)
  );

  const filtered = useMemo(() => {
    if (!filters.search) return data?.items ?? [];
    return (data?.items ?? []).filter((item) =>
      item.product.name.toLowerCase().includes(filters.search.toLowerCase())
    );
  }, [data, filters.search]);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Inventory</h1>
      <div className="mt-4 flex items-center justify-between">
        <input
          className="w-full max-w-sm rounded border px-3 py-2"
          placeholder="Search product"
          value={filters.search}
          onChange={(event) => setFilters({ search: event.target.value })}
        />
        <span className="text-sm text-slate-500">{data?.total ?? 0} records</span>
      </div>
      <table className="mt-6 w-full table-auto border text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="border px-3 py-2 text-left">Product</th>
            <th className="border px-3 py-2 text-left">Warehouse</th>
            <th className="border px-3 py-2 text-right">Qty</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.id} className="odd:bg-white even:bg-slate-50">
              <td className="border px-3 py-2">
                <div className="font-medium">{row.product.name}</div>
                <div className="text-xs text-slate-500">SKU: {row.product.sku}</div>
              </td>
              <td className="border px-3 py-2">{row.warehouse.name}</td>
              <td className="border px-3 py-2 text-right">{row.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppShell>
  );
}
