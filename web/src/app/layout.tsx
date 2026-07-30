import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/toast/ToastContainer';
import { SessionProvider } from '@/contexts/SessionContext';

export const metadata: Metadata = {
  title: 'Next.js Application Template',
  description:
    'A template for building Next.js applications with external REST APIs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <ToastProvider>
            <main className="min-h-screen">{children}</main>
            <ToastContainer />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
