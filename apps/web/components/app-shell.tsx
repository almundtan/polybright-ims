'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/warehouses', label: 'Warehouses' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/reports/ledger', label: 'Ledger Report' }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col bg-slate-900 text-white md:flex">
        <div className="px-6 py-4 text-xl font-semibold">Polybright IMS</div>
        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  className="block rounded px-3 py-2 text-sm hover:bg-slate-700"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-6 py-4 border-t border-slate-700 text-xs">
          <div>{user.email}</div>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-2 w-full rounded bg-slate-700 px-3 py-2 text-left text-sm"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-white p-6">{children}</main>
    </div>
  );
}
