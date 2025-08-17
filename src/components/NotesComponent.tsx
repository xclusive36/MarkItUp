import React, { useEffect, useState } from 'react';
import { ArrowLeft, Folder as FolderIcon, Clock } from 'lucide-react';

function FolderTree({ nodes, noteDetails }: { nodes: any[]; noteDetails: Record<string, any> }) {
  if (!nodes) return null;
  // Click handler for notes
  const handleNoteClick = (notePath: string) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('setCurrentView', { detail: { view: 'editor', notePath } });
      window.dispatchEvent(event);
    }
  };
  return (
    <ul className="pl-4">
      {nodes.map(node => (
        <li key={node.path} className="mb-2">
          {node.type === 'folder' ? (
            <>
              <span className="font-semibold">📁 {node.name}</span>
              {node.children && <FolderTree nodes={node.children} noteDetails={noteDetails} />}
            </>
          ) : (
            <div
              className="p-2 lg:p-3 rounded-lg cursor-pointer transition-colors border bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
              onClick={() => handleNoteClick(node.path)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs lg:text-sm font-medium truncate text-gray-900 dark:text-white">
                    {noteDetails[node.path]?.name || node.name.replace('.md', '')}
                  </h4>
                  {noteDetails[node.path]?.folder && (
                    <p className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <FolderIcon className="w-3 h-3" />
                      {noteDetails[node.path].folder}
                    </p>
                  )}
                  {noteDetails[node.path]?.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {noteDetails[node.path].tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 lg:gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {noteDetails[node.path]?.readingTime
                        ? `${noteDetails[node.path].readingTime}m`
                        : '--'}
                    </span>
                    <span className="hidden lg:inline">
                      {noteDetails[node.path]?.wordCount
                        ? `${noteDetails[node.path].wordCount} words`
                        : '-- words'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

const NotesComponent = () => {
  const [tree, setTree] = useState<any[] | null>(null);
  const [noteDetails, setNoteDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notes')
      .then(res => res.json())
      .then(async data => {
        // API now returns an array, not {tree: ...}
        const treeData = Array.isArray(data) ? data : [];
        setTree(treeData);
        // Fetch all note details in parallel
        const notePaths: string[] = [];
        const collectPaths = (nodes: any[]) => {
          nodes.forEach(node => {
            if (node.type === 'file') notePaths.push(node.path);
            if (node.type === 'folder' && node.children) collectPaths(node.children);
          });
        };
        collectPaths(treeData);
        const detailsArr = await Promise.all(
          notePaths.map(async path => {
            const res = await fetch(`/api/files/${encodeURIComponent(path)}`);
            if (!res.ok) return null;
            const meta = await res.json();
            const last = path.split('/').pop() || '';
            return {
              path,
              name: meta.name || last.replace('.md', ''),
              folder: path.includes('/') ? path.split('/').slice(0, -1).join('/') : '',
              tags: meta.tags || [],
              wordCount: meta.wordCount || 0,
              readingTime: meta.readingTime || '',
              updatedAt: meta.updatedAt || '',
            };
          })
        );
        const detailsMap: Record<string, any> = {};
        detailsArr.forEach(d => {
          if (d) detailsMap[d.path] = d;
        });
        setNoteDetails(detailsMap);
        setLoading(false);
      });
  }, []);

  // Back button handler: dispatch event to setCurrentView('editor')
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('setCurrentView', { detail: 'editor' });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center justify-center px-3 py-1.5 text-sm rounded-md transition-colors shadow-sm font-medium"
        style={{
          backgroundColor:
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
              ? '#2563eb'
              : '#3b82f6',
          color: '#ffffff',
        }}
        title="Return to Editor"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold mb-4">Notes</h1>
        {loading ? (
          <div>Loading...</div>
        ) : tree && tree.length > 0 ? (
          <FolderTree nodes={tree} noteDetails={noteDetails} />
        ) : (
          <div>No notes found.</div>
        )}
      </div>
    </div>
  );
};

export default NotesComponent;
