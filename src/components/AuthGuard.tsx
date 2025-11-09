'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if auth is disabled (development mode)
        const disableAuth = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

        if (disableAuth) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // Call the auth check endpoint
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);

          // Redirect to login if not authenticated and not already on auth pages
          if (!pathname.startsWith('/auth/')) {
            router.push('/auth/login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);

        // Redirect to login on error
        if (!pathname.startsWith('/auth/')) {
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated and not on auth pages
  if (!isAuthenticated && !pathname.startsWith('/auth/')) {
    return null;
  }

  return <>{children}</>;
}
