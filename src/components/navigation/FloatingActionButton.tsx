'use client';

import { useRouter } from 'next/navigation';

export default function FloatingActionButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/editor/new')}
      className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
      title="New Note (Cmd/Ctrl+E)"
    >
      <svg
        className="w-6 h-6 transition-transform group-hover:rotate-90"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}
