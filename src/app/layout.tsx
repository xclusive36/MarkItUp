import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SimpleThemeProvider } from '@/contexts/SimpleThemeContext';
import { CollaborationProvider } from '@/contexts/CollaborationContext';
import { PluginSystemInitializer } from '@/components/PluginSystemInitializer';
import { ToastProvider } from '@/components/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BrowserCompatibility } from '@/components/BrowserCompatibility';

export const metadata: Metadata = {
  title: 'MarkItUp - Personal Knowledge Management',
  description:
    'A powerful Markdown-based personal knowledge management system with AI integration, graph visualization, and advanced search',
  manifest: '/manifest.json',
  keywords: [
    'markdown',
    'knowledge management',
    'PKM',
    'note-taking',
    'AI',
    'graph visualization',
    'second brain',
    'obsidian alternative',
  ],
  authors: [{ name: 'MarkItUp Team' }],
  creator: 'MarkItUp',
  publisher: 'MarkItUp',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://github.com/xclusive36/MarkItUp',
    title: 'MarkItUp - Personal Knowledge Management',
    description:
      'Self-hosted PKM system with AI-powered features, bidirectional linking, and knowledge graph visualization',
    siteName: 'MarkItUp',
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'MarkItUp Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MarkItUp - Personal Knowledge Management',
    description:
      'Self-hosted PKM system with AI-powered features, bidirectional linking, and knowledge graph visualization',
    images: ['/icon-512x512.png'],
  },
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
        <BrowserCompatibility />
        <ErrorBoundary>
          <ToastProvider>
            <SimpleThemeProvider>
              <CollaborationProvider>
                {process.env.NODE_ENV === 'development' ? (
                  <React.StrictMode>
                    <PluginSystemInitializer />
                    {children}
                  </React.StrictMode>
                ) : (
                  <>
                    <PluginSystemInitializer />
                    {children}
                  </>
                )}
              </CollaborationProvider>
            </SimpleThemeProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
