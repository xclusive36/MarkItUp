import type { Metadata } from 'next';
import './globals.css';
import { SimpleThemeProvider } from '@/contexts/SimpleThemeContext';
import { CollaborationProvider } from '@/contexts/CollaborationContext';
import { PluginSystemInitializer } from '@/components/PluginSystemInitializer';
import { ToastProvider } from '@/components/ToastProvider';

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
      <body className="antialiased">
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
