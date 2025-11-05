'use client';

import { useState, useEffect } from 'react';

export default function StorageInspectorPage() {
  const [mounted, setMounted] = useState(false);
  const [allStorageKeys, setAllStorageKeys] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setMounted(true);
    if (typeof localStorage !== 'undefined') {
      const keys = [
        'markitup-installed-plugins',
        'markitup-enabled-plugins',
        'markitup-ai-plugins',
        'ultra-simple-test',
        'working-real-plugins',
        'simple-plugin-test',
      ];

      const storage: { [key: string]: string } = {};
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        storage[key] = value || '(empty)';
      });
      setAllStorageKeys(storage);
    }
  }, []);

  const clearAllPluginStorage = () => {
    if (typeof localStorage !== 'undefined') {
      const keys = [
        'markitup-installed-plugins',
        'markitup-enabled-plugins',
        'markitup-ai-plugins',
        'ultra-simple-test',
        'working-real-plugins',
        'simple-plugin-test',
      ];

      keys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Refresh the display
      setAllStorageKeys(
        keys.reduce(
          (acc, key) => {
            acc[key] = '(empty)';
            return acc;
          },
          {} as { [key: string]: string }
        )
      );
    }
  };

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 localStorage Inspector</h1>

      <div className="mb-6">
        <button
          onClick={clearAllPluginStorage}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All Plugin Storage
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Plugin Storage Keys:</h2>

        {Object.entries(allStorageKeys).map(([key, value]) => (
          <div key={key} className="p-4 border rounded-lg">
            <h3 className="font-medium text-lg mb-2">{key}</h3>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">{value}</div>
            <div className="mt-2 text-sm text-gray-600">
              {key === 'markitup-installed-plugins' && '← Used by plugin-manager-simple.ts'}
              {key === 'markitup-enabled-plugins' && '← Used by some components'}
              {key === 'markitup-ai-plugins' && '← Used by plugin-manager-unified.ts'}
              {key === 'ultra-simple-test' && '← Used by ultra-simple test'}
              {key === 'working-real-plugins' && '← Used by working test'}
              {key === 'simple-plugin-test' && '← Used by simple test'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-lg mb-2">🔍 Analysis:</h3>
        <p className="text-sm">
          The debug page shows plugins in <code>markitup-installed-plugins</code> but the main app
          dashboard might be looking at a different storage key. This explains why persistence
          appears to work in debug but not in the main UI.
        </p>
      </div>
    </div>
  );
}
