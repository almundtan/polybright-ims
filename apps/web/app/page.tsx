import type { Metadata } from 'next';
import Link from 'next/link';

const updates = [
  {
    title: 'Inventory that stays in sync',
    copy: 'Track stock, transfers, and adjustments across every branch in one simple view.'
  },
  {
    title: 'Works even when you are offline',
    copy: 'Capture deliveries and counts on mobile and let the system sync when you are back online.'
  },
  {
    title: 'Built for Polybright teams',
    copy: 'Role-based access and guided onboarding keep warehouse, sales, and finance on the same page.'
  }
];

export const metadata: Metadata = {
  title: 'Polybright | Simple inventory home base',
  description:
    'Polybright keeps distributors on top of stock levels with an easy, offline-ready home page you can share with your team.'
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
          <p className="text-xl font-semibold tracking-tight">Polybright</p>
          <Link
            href="/login"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid w-full max-w-4xl gap-8 px-6 py-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Inventory made simple
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Stay on top of every item that powers Polybright.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            Polybright IMS gives your warehouses, field teams, and head office a single source of truth for stock levels.
            It is built to work in Philippine conditions where connectivity is unpredictable and teams are always on the move.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:hello@polybright.com.ph"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Talk to us
            </a>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              Access the app
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {updates.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm shadow-slate-900/5"
            >
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="text-sm text-slate-600">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-900">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-16 text-center text-white">
          <h2 className="text-2xl font-semibold">Need help getting started?</h2>
          <p className="text-sm text-slate-200">
            Send us your current inventory process and we will map out the simplest way to roll Polybright IMS across your branches.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:hello@polybright.com.ph"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Email Polybright
            </a>
            <a
              href="tel:+6321234567"
              className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Call +63 2 123 4567
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/90">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-6 py-6 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Polybright. All rights reserved.</p>
          <span>Serving distribution teams across the Philippines</span>
        </div>
      </footer>
    </main>
  );
}
