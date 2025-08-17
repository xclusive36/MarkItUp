import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Recursively get folder structure and .md files from /markdown
type FolderNode = {
  type: 'folder';
  name: string;
  path: string;
  children: TreeNode[];
};

type FileNode = {
  type: 'file';
  name: string;
  path: string;
};

type TreeNode = FolderNode | FileNode;

function getFolderTree(dirPath: string, base = ''): TreeNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .map(entry => {
      const relPath = path.join(base, entry.name);
      if (entry.isDirectory()) {
        return {
          type: 'folder',
          name: entry.name,
          path: relPath,
          children: getFolderTree(path.join(dirPath, entry.name), relPath),
        };
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        return {
          type: 'file',
          name: entry.name,
          path: relPath,
        };
      }
      return null;
    })
    .filter(Boolean) as TreeNode[];
}

export async function GET() {
  const markdownDir = path.join(process.cwd(), 'markdown');
  const tree = getFolderTree(markdownDir);
  return NextResponse.json(tree);
}
