import { forwardRef } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  theme: string;
}

const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  ({ value, onChange }, ref) => (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full flex-grow h-full min-h-0 p-4 lg:p-6 border-none resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg font-mono text-sm editor-textarea"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        borderColor: 'transparent',
        minHeight: 0,
        height: '100%',
        resize: 'vertical',
      }}
      placeholder="Start writing your markdown here..."
    />
  )
);

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;
