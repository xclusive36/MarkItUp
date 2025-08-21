import { Note } from '@/lib/types';

export type FolderDragItem = {
  type: 'folder';
  folder: string;
};

export type NoteDragItem = {
  type: 'note';
  note: Note;
  fromFolder: string;
};
