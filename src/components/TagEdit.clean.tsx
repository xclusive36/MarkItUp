import React from 'react';

interface TagEditProps {
  tag: string;
  notePath: string;
  editingTag: { notePath: string; tag: string } | null;
  editValue: string;
  inputRef: React.RefObject<HTMLInputElement>;
  setEditingTag: (val: { notePath: string; tag: string } | null) => void;
  setEditValue: (val: string) => void;
  handleTagEdit: (notePath: string, tag: string, newValue: string) => void;
}

const tagColors = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
  'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
  'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
];

export const TagEdit: React.FC<TagEditProps> = ({
  tag,
  notePath,
  editingTag,
  editValue,
  inputRef,
  setEditingTag,
  setEditValue,
  handleTagEdit,
}) => {
  const color =
    tagColors[Math.abs(tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % tagColors.length];
  if (editingTag && editingTag.notePath === notePath && editingTag.tag === tag) {
    return (
      <input
        key={tag}
        ref={inputRef}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border border-blue-400 focus:outline-none focus:ring w-16`}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={() => handleTagEdit(notePath, tag, editValue)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleTagEdit(notePath, tag, editValue);
          else if (e.key === 'Escape') setEditingTag(null);
        }}
      />
    );
  }
  return (
    <span
      key={tag}
      className={`${color} px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-all`}
      title="Click to edit tag"
      tabIndex={0}
      onClick={e => {
        e.stopPropagation();
        setEditingTag({ notePath, tag });
        setEditValue(tag);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          setEditingTag({ notePath, tag });
          setEditValue(tag);
        }
      }}
      aria-label={`Edit tag ${tag}`}
    >
      #{tag}
    </span>
  );
};
