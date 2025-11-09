'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  emailVerified: boolean;
}

interface QuotaInfo {
  allowed: boolean;
  current: number;
  limit: number | null;
  remaining: number;
  message: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [quotas, setQuotas] = useState<{
    notes?: QuotaInfo;
    storage?: QuotaInfo;
    ai_requests?: QuotaInfo;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserData = async () => {
    try {
      // Fetch user info
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      // Note: We would need to create a quotas endpoint to get this data
      // For now, using placeholder
      setQuotas({
        notes: { allowed: true, current: 0, limit: 100, remaining: 100, message: '' },
        storage: { allowed: true, current: 0, limit: 104857600, remaining: 104857600, message: '' },
        ai_requests: { allowed: true, current: 0, limit: 20, remaining: 20, message: '' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 sm:px-0">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Account Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {user?.name || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="text-gray-900 dark:text-white font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className="text-gray-900 dark:text-white font-medium capitalize">
                  {user?.plan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email Verified:</span>
                <span
                  className={`font-medium ${user?.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}
                >
                  {user?.emailVerified ? 'Yes' : 'Not verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Quotas */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Usage & Quotas
            </h2>
            <div className="space-y-6">
              {/* Notes Quota */}
              {quotas.notes && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Notes</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {quotas.notes.current} /{' '}
                      {quotas.notes.limit === null ? '∞' : quotas.notes.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: quotas.notes.limit
                          ? `${(quotas.notes.current / quotas.notes.limit) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Storage Quota */}
              {quotas.storage && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Storage</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatBytes(quotas.storage.current)} /{' '}
                      {quotas.storage.limit === null ? '∞' : formatBytes(quotas.storage.limit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: quotas.storage.limit
                          ? `${(quotas.storage.current / quotas.storage.limit) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* AI Requests Quota */}
              {quotas.ai_requests && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">AI Requests (Daily)</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {quotas.ai_requests.current} /{' '}
                      {quotas.ai_requests.limit === null ? '∞' : quotas.ai_requests.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: quotas.ai_requests.limit
                          ? `${(quotas.ai_requests.current / quotas.ai_requests.limit) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
