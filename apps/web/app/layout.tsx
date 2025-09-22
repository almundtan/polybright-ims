import type { Metadata } from 'next';
import '@/styles/globals.css';
import { OfflineQueueProvider } from '@/providers/offline-queue-provider';

export const metadata: Metadata = {
  title: 'Polybright IMS',
  description: 'Offline-first inventory management for Polybright.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <OfflineQueueProvider>
          <div className="min-h-screen bg-slate-50">{children}</div>
        </OfflineQueueProvider>
      </body>
    </html>
  );
}
