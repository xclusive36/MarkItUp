import React from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  theme: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, theme }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full flex-grow h-full min-h-0 p-4 lg:p-6 border-none resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg font-mono text-sm editor-textarea"
    style={{
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#f9fafb' : '#111827',
      borderColor: 'transparent',
      minHeight: 0,
      height: '100%',
      resize: 'vertical',
    }}
    placeholder="Start writing your markdown here..."
  />
);

export default MarkdownEditor;
