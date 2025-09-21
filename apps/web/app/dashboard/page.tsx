'use client';

import useSWR from 'swr';
import { AppShell } from '@/components/app-shell';
import { apiFetch } from '@/lib/api';

interface InventoryResponse {
  total: number;
  items: Array<{ qty: string }>;
}

export default function DashboardPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('polybright_token') : null;
  const { data } = useSWR<InventoryResponse>(
    token ? '/inventory?limit=5' : null,
    (url) => apiFetch(url)
  );

  const totalSkus = data?.total ?? 0;

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <div className="text-sm text-slate-500">Tracked SKUs</div>
          <div className="text-3xl font-bold">{totalSkus}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-slate-500">Pending Orders</div>
          <div className="text-3xl font-bold">3</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-slate-500">Offline Queue</div>
          <div className="text-3xl font-bold">0</div>
        </div>
      </div>
    </AppShell>
  );
}
