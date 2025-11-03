import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SimpleThemeProvider } from '@/contexts/SimpleThemeContext';
import { CollaborationProvider } from '@/contexts/CollaborationContext';
import { PluginSystemInitializer } from '@/components/PluginSystemInitializer';
import { ToastProvider } from '@/components/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'MarkItUp - Personal Knowledge Management',
  description:
    'A powerful Markdown-based personal knowledge management system with AI integration, graph visualization, and advanced search',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MarkItUp',
  },
  applicationName: 'MarkItUp',
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon-192x192.svg" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <ToastProvider>
            <SimpleThemeProvider>
              <CollaborationProvider>
                <PluginSystemInitializer />
                {children}
              </CollaborationProvider>
            </SimpleThemeProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
