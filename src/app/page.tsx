'use client';

// React and markdown imports
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

// Component imports
import ThemeToggle from '@/components/ThemeToggle';
import LaTeXRenderer from '@/components/LaTeXRenderer';
import TikZRenderer from '@/components/TikZRenderer';
import { useSimpleTheme } from '@/contexts/SimpleThemeContext';

// Styles
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';
import './highlight.css';
import './manual-theme.css';


// Types
interface MarkdownFile {
  name: string;
  folder?: string;
  content: string;
  createdAt: string;
}

interface FolderTree {
  _files: MarkdownFile[];
  _folders: { [folder: string]: FolderTree };
}

// Helper: Build folder tree from savedFiles
function buildFolderTree(files: MarkdownFile[]): FolderTree {
  const tree: FolderTree = { _files: [], _folders: {} };
  files.forEach(file => {
    const folderPath = file.folder ? file.folder.split('/') : [];
    let current = tree;
    for (const folder of folderPath) {
      if (!current._folders[folder]) current._folders[folder] = { _files: [], _folders: {} };
      current = current._folders[folder];
    }
    current._files.push(file);
  });
  return tree;
}

// Helper: Render folder tree recursively
function renderFolderTree(
  tree: FolderTree,
  parentPath = '',
  openFolders: { [folder: string]: boolean },
  theme: string,
  loadFile: (fileName: string) => void,
  deleteFile: (fileName: string) => void,
  setOpenFolders: React.Dispatch<React.SetStateAction<{ [folder: string]: boolean }>>
) {
  const folderEntries = Object.entries(tree._folders || {});
  const files = tree._files || [];
  return (
    <div>
      {/* Folders */}
      {folderEntries.map(([folder, value]: [string, FolderTree]) => {
        const fullPath = parentPath ? `${parentPath}/${folder}` : folder;
        const isOpen = openFolders[fullPath] || false;
        return (
          <div key={fullPath} className="mb-1">
            <button
              onClick={() => setOpenFolders(f => ({ ...f, [fullPath]: !isOpen }))}
              className="flex items-center w-full text-left text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded"
              style={{ backgroundColor: isOpen ? (theme === 'dark' ? '#374151' : '#e5e7eb') : 'transparent' }}
            >
              <span className="mr-1">{isOpen ? '▼' : '▶'}</span>
              {folder}
            </button>
            {isOpen && (
              <div className="ml-4 border-l border-gray-300 dark:border-gray-600 pl-2">
                {renderFolderTree(value, fullPath, openFolders, theme, loadFile, deleteFile, setOpenFolders)}
              </div>
            )}
          </div>
        );
      })}
      {/* Files in this folder */}
      {files.map((file: MarkdownFile) => (
        <div key={file.folder ? `${file.folder}/${file.name}` : file.name} className={`flex items-center justify-between ${parentPath ? 'p-1' : 'p-2'} bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 my-1`}
          style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb', borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb' }}>
          <button
            onClick={() => loadFile(file.folder ? `${file.folder}/${file.name}` : file.name)}
            className={`text-left flex-1 ${parentPath ? 'text-xs' : 'text-sm'} text-blue-600 dark:text-blue-400 hover:underline`}
            style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
          >
            {file.name}
          </button>
          <button
            onClick={() => deleteFile(file.folder ? `${file.folder}/${file.name}` : file.name)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 ml-2"
            style={{ color: theme === 'dark' ? '#f87171' : '#dc2626' }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}


export default function Home() {
  const { theme } = useSimpleTheme();
  // Removed unused mounted state
  const [markdown, setMarkdown] = useState('# Welcome to MarkItUp\n\nStart writing your markdown here...');
  const [fileName, setFileName] = useState('');
  const [folder, setFolder] = useState('');
  const [savedFiles, setSavedFiles] = useState<MarkdownFile[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [openFolders, setOpenFolders] = useState<{ [folder: string]: boolean }>({});

  // ...existing code...

  // Load files on mount
  useEffect(() => {
    fetchSavedFiles();
  }, []);

  // Fetch all saved markdown files
  const fetchSavedFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const files = await response.json();
        setSavedFiles(files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // Save file (with optional overwrite)
  const saveFile = async (forceOverwrite = false) => {
    if (!fileName.trim()) {
      setSaveStatus('Please enter a filename');
      return;
    }
    const fullPath = folder.trim()
      ? `${folder.trim().replace(/\/+$/, '')}/${fileName.trim().replace(/\/+$/, '')}.md`
      : `${fileName.trim().replace(/\/+$/, '')}.md`;
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(fullPath)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: markdown, overwrite: forceOverwrite }),
      });
      if (response.ok) {
        setSaveStatus(forceOverwrite ? 'File overwritten!' : 'File saved successfully!');
        setFileName('');
        setFolder('');
        fetchSavedFiles();
        setTimeout(() => setSaveStatus(''), 3000);
      } else if (response.status === 409) {
        const data = await response.json();
        if (data.requiresOverwrite) {
          if (window.confirm(data.prompt || 'File exists. Overwrite?')) {
            await saveFile(true);
          } else {
            setSaveStatus('File not overwritten.');
          }
        } else {
          setSaveStatus(data.error || 'Error saving file');
        }
      } else {
        setSaveStatus('Error saving file');
      }
    } catch (error) {
      setSaveStatus('Error saving file');
      console.error('Error saving file:', error);
    }
  };

  // Load file by name (can be folder/name)
  const loadFile = async (fileName: string) => {
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(fileName)}`);
      if (response.ok) {
        const file = await response.json();
        setMarkdown(file.content);
        setFileName(file.name.replace('.md', ''));
        setFolder(file.folder || '');
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  // Delete file by name (can be folder/name)
  const deleteFile = async (fileName: string) => {
    if (!window.confirm('Are you sure you want to delete this markdown file? This action cannot be undone.')) return;
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(fileName)}`, { method: 'DELETE' });
      if (response.ok) {
        fetchSavedFiles();
      } else {
        console.error('Failed to delete file:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Reset editor to initial state
  const resetToInitial = () => {
    setMarkdown('# Welcome to MarkItUp\n\nStart writing your markdown here...');
    setFileName('');
    setSaveStatus('');
  };

  // Build folder tree for sidebar
  const folderTree = buildFolderTree(savedFiles);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 main-bg" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 secondary-bg" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white primary-text" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>MarkItUp</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setIsPreview(prev => !prev)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 secondary-bg primary-border" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white primary-text" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>Save File</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="Enter filename..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  }}
                />
                <input
                  type="text"
                  value={folder}
                  onChange={e => setFolder(e.target.value)}
                  placeholder="Enter folder (optional, e.g. notes/personal)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  }}
                />
                <button
                  onClick={() => saveFile()}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                {saveStatus && (
                  <p className={`text-sm ${saveStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{saveStatus}</p>
                )}
                <button
                  onClick={resetToInitial}
                  className="w-full mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Reset Editor
                </button>
              </div>

              <h2 className="text-lg font-semibold mt-8 mb-4 text-gray-900 dark:text-white primary-text" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>Saved Files</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {savedFiles.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>No saved files</p>
                ) : (
                  renderFolderTree(folderTree, '', openFolders, theme, loadFile, deleteFile, setOpenFolders)
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)] secondary-bg primary-border" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              {isPreview ? (
                <div className="h-full p-6 overflow-y-auto">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
                      components={{
                        code(props) {
                          const { className, children } = props;
                          const match = /language-(\w+)/.exec(className || '');
                          const content = String(children).replace(/\n$/, '');

                          if (match) {
                            const lang = match[1];
                            switch (lang) {
                              case 'tikz':
                                return <TikZRenderer content={content} />;
                              case 'latex':
                                return <LaTeXRenderer content={content} displayMode={true} />;
                              default:
                                return (
                                  <div className="relative group">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                    <span className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-bl opacity-75">
                                      {lang}
                                    </span>
                                  </div>
                                );
                            }
                          }

                          // Default code block without language
                          return <code className={className}>{children}</code>;
                        },
                      }}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <textarea
                  value={markdown}
                  onChange={e => setMarkdown(e.target.value)}
                  className="w-full h-full p-6 border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Start writing your markdown here..."
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                    borderColor: 'transparent',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
