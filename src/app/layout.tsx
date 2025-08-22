import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SimpleThemeProvider } from '@/contexts/SimpleThemeContext';
import { CollaborationProvider } from '@/contexts/CollaborationContext';
import { PluginSystemInitializer } from '@/components/PluginSystemInitializer';
import { ToastProvider } from '@/components/ToastProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'MarkItUp - Markdown Editor',
  description: 'A powerful markdown editor with live preview and file management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ToastProvider>
          <SimpleThemeProvider>
            <CollaborationProvider>
              <PluginSystemInitializer />
              {children}
            </CollaborationProvider>
          </SimpleThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
