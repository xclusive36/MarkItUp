'use client';

import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Markdown } from 'tiptap-markdown';

const lowlight = createLowlight(common);
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  CheckSquare,
  Code2,
  Minus,
} from 'lucide-react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: string;
}

const MenuBar = ({ editor, theme }: { editor: Editor | null; theme: string }) => {
  if (!editor) {
    return null;
  }

  const buttonClass = `p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  const activeClass = 'bg-blue-100 dark:bg-blue-900';

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div
      className="flex flex-wrap gap-1 p-2 border-b"
      style={{
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
      }}
    >
      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={buttonClass}
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={buttonClass}
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${buttonClass} ${editor.isActive('bold') ? activeClass : ''}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${buttonClass} ${editor.isActive('italic') ? activeClass : ''}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`${buttonClass} ${editor.isActive('strike') ? activeClass : ''}`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`${buttonClass} ${editor.isActive('code') ? activeClass : ''}`}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${buttonClass} ${editor.isActive('heading', { level: 1 }) ? activeClass : ''}`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${buttonClass} ${editor.isActive('heading', { level: 2 }) ? activeClass : ''}`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${buttonClass} ${editor.isActive('heading', { level: 3 }) ? activeClass : ''}`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${buttonClass} ${editor.isActive('bulletList') ? activeClass : ''}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${buttonClass} ${editor.isActive('orderedList') ? activeClass : ''}`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`${buttonClass} ${editor.isActive('taskList') ? activeClass : ''}`}
        title="Task List"
      >
        <CheckSquare className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Block Elements */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${buttonClass} ${editor.isActive('blockquote') ? activeClass : ''}`}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`${buttonClass} ${editor.isActive('codeBlock') ? activeClass : ''}`}
        title="Code Block"
      >
        <Code2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={buttonClass}
        title="Horizontal Rule"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Links & Media */}
      <button onClick={addLink} className={buttonClass} title="Add Link">
        <LinkIcon className="w-4 h-4" />
      </button>
      <button onClick={addImage} className={buttonClass} title="Add Image">
        <ImageIcon className="w-4 h-4" />
      </button>
      <button onClick={insertTable} className={buttonClass} title="Insert Table">
        <TableIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ value, onChange, theme }) => {
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        breaks: false,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm lg:prose dark:prose-invert max-w-none focus:outline-none p-4 lg:p-6 [&_a]:no-underline [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a:hover]:underline [&_a::before]:content-none',
      },
    },
    onUpdate: ({ editor }) => {
      // Get markdown content from editor
      const storage = editor.storage as unknown as Record<string, { getMarkdown?: () => string }>;
      const markdown = storage.markdown?.getMarkdown?.() || '';
      onChange(markdown);
    },
  });

  // Update editor content when value prop changes (but not from editor itself)
  React.useEffect(() => {
    if (!editor) return;

    // Get current markdown content from editor
    const storage = editor.storage as unknown as Record<string, { getMarkdown?: () => string }>;
    const currentMarkdown = storage.markdown?.getMarkdown?.() || '';

    // Only update if the external value is different from what's in the editor
    if (value !== currentMarkdown) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div
      className="h-full flex flex-col border rounded-lg overflow-hidden"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      }}
    >
      <MenuBar editor={editor} theme={theme} />
      <div
        className="flex-grow overflow-y-auto"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#111827',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default WysiwygEditor;
