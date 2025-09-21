'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { AppShell } from '@/components/app-shell';
import { apiFetch } from '@/lib/api';

interface LedgerRow {
  id: string;
  createdAt: string;
  warehouse: string;
  product: string;
  qty: string;
  type: string;
  refType: string;
  refId: string;
}

interface LedgerResponse {
  rows: LedgerRow[];
}

function exportCsv(rows: LedgerRow[]) {
  if (!rows.length) return;
  const header = 'Date,Warehouse,Product,Qty,Type,RefType,RefId';
  const lines = rows.map((row) =>
    [row.createdAt, row.warehouse, row.product, row.qty, row.type, row.refType, row.refId]
      .map((value) => `"${value}"`)
      .join(',')
  );
  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ledger.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function LedgerReportPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('polybright_token') : null;
  const { data } = useSWR<LedgerResponse>(token ? '/reports/ledger' : null, (url) => apiFetch(url));
  const rows = data?.rows ?? [];

  const totals = useMemo(() => {
    return rows.reduce((acc, row) => acc + Number(row.qty), 0);
  }, [rows]);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Stock Ledger</h1>
        <button
          className="rounded bg-slate-900 px-3 py-2 text-white"
          onClick={() => exportCsv(rows)}
        >
          Export CSV
        </button>
      </div>
      <table className="mt-6 w-full table-auto border text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="border px-3 py-2 text-left">Date</th>
            <th className="border px-3 py-2 text-left">Warehouse</th>
            <th className="border px-3 py-2 text-left">Product</th>
            <th className="border px-3 py-2 text-right">Qty</th>
            <th className="border px-3 py-2 text-left">Type</th>
            <th className="border px-3 py-2 text-left">Reference</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="odd:bg-white even:bg-slate-50">
              <td className="border px-3 py-2">{new Date(row.createdAt).toLocaleString()}</td>
              <td className="border px-3 py-2">{row.warehouse}</td>
              <td className="border px-3 py-2">{row.product}</td>
              <td className="border px-3 py-2 text-right">{row.qty}</td>
              <td className="border px-3 py-2">{row.type}</td>
              <td className="border px-3 py-2">{`${row.refType} #${row.refId}`}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="border px-3 py-2 font-medium" colSpan={3}>
              Net Qty
            </td>
            <td className="border px-3 py-2 text-right font-semibold">{totals.toFixed(2)}</td>
            <td className="border px-3 py-2" colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </AppShell>
  );
}
