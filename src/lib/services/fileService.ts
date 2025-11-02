import fs from 'fs';
import path from 'path';
import { Note } from '@/lib/types';
import { MarkdownParser } from '@/lib/parser';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

/**
 * FileService - Handles all file system operations for markdown files
 * Provides a clean separation between business logic and API routes
 */
export class FileService {
  private markdownDir: string;

  constructor(markdownDir: string = MARKDOWN_DIR) {
    this.markdownDir = markdownDir;
    this.ensureDirectoryExists();
  }

  /**
   * Ensure the markdown directory exists
   */
  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.markdownDir)) {
      fs.mkdirSync(this.markdownDir, { recursive: true });
    }
  }

  /**
   * Safely join a filename with the markdown directory
   * Prevents path traversal attacks
   */
  private safeJoinPath(filename: string): string | null {
    const filePath = path.resolve(this.markdownDir, filename);
    if (!filePath.startsWith(this.markdownDir)) {
      return null;
    }
    return filePath;
  }

  /**
   * Recursively find all markdown files and convert to Note objects
   */
  private findNotesRecursive(dir: string, folderPrefix: string = ''): Note[] {
    let results: Note[] = [];
    
    if (!fs.existsSync(dir)) {
      return results;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        results = results.concat(
          this.findNotesRecursive(itemPath, path.join(folderPrefix, item))
        );
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(itemPath, 'utf-8');
        const parsed = MarkdownParser.parseNote(content);
        const wordCount = MarkdownParser.calculateWordCount(content);
        const readingTime = MarkdownParser.calculateReadingTime(wordCount);
        
        const note: Note = {
          id: MarkdownParser.generateNoteId(
            item.replace('.md', ''),
            folderPrefix || undefined
          ),
          name: item,
          content,
          folder: folderPrefix || undefined,
          createdAt: stats.ctime.toISOString(),
          updatedAt: stats.mtime.toISOString(),
          tags: parsed.tags,
          metadata: parsed.frontmatter,
          wordCount,
          readingTime,
        };
        
        results.push(note);
      }
    }
    
    return results;
  }

  /**
   * List all markdown files as Note objects
   */
  async listFiles(): Promise<Note[]> {
    const notes = this.findNotesRecursive(this.markdownDir, '');
    
    // Sort by most recently updated
    return notes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Read a single file by filename
   */
  async readFile(filename: string): Promise<Note | null> {
    const filePath = this.safeJoinPath(filename);
    
    if (!filePath || !fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    const parsed = MarkdownParser.parseNote(content);
    const wordCount = MarkdownParser.calculateWordCount(content);
    const readingTime = MarkdownParser.calculateReadingTime(wordCount);

    return {
      id: MarkdownParser.generateNoteId(filename.replace('.md', '')),
      name: filename,
      content,
      createdAt: stats.ctime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      tags: parsed.tags || [],
      metadata: parsed.frontmatter,
      wordCount,
      readingTime,
    };
  }

  /**
   * Check if a file exists
   */
  async fileExists(filename: string): Promise<boolean> {
    const filePath = this.safeJoinPath(filename);
    return filePath ? fs.existsSync(filePath) : false;
  }

  /**
   * Create a new file
   */
  async createFile(
    filename: string,
    content: string,
    folder?: string
  ): Promise<{ success: boolean; message: string; fileName: string; folder: string }> {
    // Ensure the filename ends with .md
    const fileName = filename.endsWith('.md') ? filename : `${filename}.md`;
    
    // Determine target directory
    const targetDir = folder 
      ? path.join(this.markdownDir, folder) 
      : this.markdownDir;
    
    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const filePath = path.join(targetDir, fileName);
    
    // Write file
    fs.writeFileSync(filePath, content, 'utf-8');
    
    return {
      success: true,
      message: 'File created successfully',
      fileName,
      folder: folder || '',
    };
  }

  /**
   * Update an existing file
   */
  async updateFile(
    filename: string,
    content: string,
    overwrite: boolean = false
  ): Promise<{ success: boolean; message: string; requiresOverwrite?: boolean }> {
    const filePath = this.safeJoinPath(filename);
    
    if (!filePath) {
      return { success: false, message: 'Invalid filename' };
    }

    const fileExists = fs.existsSync(filePath);
    
    if (fileExists && !overwrite) {
      return {
        success: false,
        message: 'File already exists',
        requiresOverwrite: true,
      };
    }

    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // Write file
    fs.writeFileSync(filePath, content, 'utf-8');

    return {
      success: true,
      message: fileExists ? 'File overwritten' : 'File created',
    };
  }

  /**
   * Delete a file
   */
  async deleteFile(filename: string): Promise<{ success: boolean; message: string }> {
    const filePath = this.safeJoinPath(filename);
    
    if (!filePath) {
      return { success: false, message: 'Invalid filename' };
    }

    if (!fs.existsSync(filePath)) {
      return { success: false, message: 'File not found' };
    }

    // Delete file
    fs.unlinkSync(filePath);

    // Remove empty parent folders up to MARKDOWN_DIR
    let dir = path.dirname(filePath);
    while (dir !== this.markdownDir) {
      const files = fs.readdirSync(dir);
      
      // Only remove if no files or folders left
      if (files.length === 0) {
        fs.rmdirSync(dir);
        dir = path.dirname(dir);
      } else {
        break;
      }
    }

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}

// Export a singleton instance
export const fileService = new FileService();
