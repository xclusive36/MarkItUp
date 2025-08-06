import { ParsedNote, ParsedLink, FrontMatter, Block } from './types';

export class MarkdownParser {
  private static readonly WIKILINK_REGEX = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g;
  private static readonly TAG_REGEX = /#([a-zA-Z0-9_/-]+)/g;
  private static readonly BLOCK_ID_REGEX = /\^([a-zA-Z0-9_-]+)$/gm;
  private static readonly FRONTMATTER_REGEX = /^---\n(.*?)\n---\n/s;

  static parseNote(content: string): ParsedNote {
    const frontmatter = this.parseFrontmatter(content);
    const contentWithoutFrontmatter = this.removeFrontmatter(content);
    const links = this.parseLinks(contentWithoutFrontmatter);
    const tags = this.parseTags(contentWithoutFrontmatter);
    const blocks = this.parseBlocks(contentWithoutFrontmatter);

    // Merge frontmatter tags with inline tags
    const allTags = [...new Set([
      ...(frontmatter.tags || []),
      ...tags
    ])];

    return {
      frontmatter,
      content: contentWithoutFrontmatter,
      links,
      tags: allTags,
      blocks
    };
  }

  private static parseFrontmatter(content: string): FrontMatter {
    const match = content.match(this.FRONTMATTER_REGEX);
    if (!match) return {};

    try {
      const yamlContent = match[1];
      const frontmatter: FrontMatter = {};
      
      // Simple YAML parser for common frontmatter fields
      const lines = yamlContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const colonIndex = trimmed.indexOf(':');
        if (colonIndex === -1) continue;

        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          // Parse array of tags
          frontmatter.tags = value
            .slice(1, -1)
            .split(',')
            .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
            .filter(tag => tag.length > 0);
        } else if (key === 'aliases' && value.startsWith('[') && value.endsWith(']')) {
          // Parse array of aliases
          frontmatter.aliases = value
            .slice(1, -1)
            .split(',')
            .map(alias => alias.trim().replace(/^["']|["']$/g, ''))
            .filter(alias => alias.length > 0);
        } else {
          // Simple string value
          frontmatter[key] = value.replace(/^["']|["']$/g, '');
        }
      }

      return frontmatter;
    } catch (error) {
      console.error('Error parsing frontmatter:', error);
      return {};
    }
  }

  private static removeFrontmatter(content: string): string {
    return content.replace(this.FRONTMATTER_REGEX, '');
  }

  private static parseLinks(content: string): ParsedLink[] {
    const links: ParsedLink[] = [];
    let match;

    // Parse wikilinks [[Note Name|Display Text]]
    const wikilinkRegex = new RegExp(this.WIKILINK_REGEX);
    while ((match = wikilinkRegex.exec(content)) !== null) {
      links.push({
        type: 'wikilink',
        target: match[1].trim(),
        displayText: match[3] || match[1].trim(),
        start: match.index,
        end: match.index + match[0].length
      });
    }

    // Parse markdown links [Display Text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      // Only include if it looks like an internal link (no http/https)
      if (!match[2].startsWith('http')) {
        links.push({
          type: 'markdown',
          target: match[2],
          displayText: match[1],
          start: match.index,
          end: match.index + match[0].length
        });
      }
    }

    return links;
  }

  private static parseTags(content: string): string[] {
    const tags: string[] = [];
    let match;

    const tagRegex = new RegExp(this.TAG_REGEX);
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  private static parseBlocks(content: string): Block[] {
    const blocks: Block[] = [];
    const lines = content.split('\n');
    let currentBlock: Block | null = null;
    let lineStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineEnd = lineStart + line.length + 1; // +1 for newline

      // Check for block ID at end of line
      const blockIdMatch = line.match(/\^([a-zA-Z0-9_-]+)$/);
      
      // Determine block type
      let blockType: Block['type'] = 'paragraph';
      let level: number | undefined;

      if (line.match(/^#{1,6}\s/)) {
        blockType = 'heading';
        level = line.match(/^(#{1,6})/)?.[1].length;
      } else if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
        blockType = 'list';
      } else if (line.match(/^```/) || line.match(/^    /)) {
        blockType = 'code';
      } else if (line.match(/^>/)) {
        blockType = 'quote';
      }

      // If this line starts a new block or has a block ID
      if (blockIdMatch || (currentBlock && currentBlock.type !== blockType)) {
        // Finish current block
        if (currentBlock) {
          blocks.push(currentBlock);
        }

        // Start new block
        currentBlock = {
          id: blockIdMatch?.[1] || `block-${blocks.length}`,
          content: line,
          start: lineStart,
          end: lineEnd,
          type: blockType,
          level
        };
      } else if (currentBlock) {
        // Continue current block
        currentBlock.content += '\n' + line;
        currentBlock.end = lineEnd;
      } else {
        // Start first block
        currentBlock = {
          id: `block-${blocks.length}`,
          content: line,
          start: lineStart,
          end: lineEnd,
          type: blockType,
          level
        };
      }

      lineStart = lineEnd;
    }

    // Add final block
    if (currentBlock) {
      blocks.push(currentBlock);
    }

    return blocks;
  }

  static generateNoteId(name: string, folder?: string): string {
    const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const folderPrefix = folder ? folder.replace(/[^a-zA-Z0-9_/-]/g, '_').toLowerCase() + '/' : '';
    return folderPrefix + cleanName;
  }

  static extractTitle(content: string, filename: string): string {
    // Try to get title from frontmatter
    const parsed = this.parseNote(content);
    if (parsed.frontmatter.title) {
      return parsed.frontmatter.title;
    }

    // Try to get title from first heading
    const lines = parsed.content.split('\n');
    for (const line of lines) {
      const headingMatch = line.match(/^#\s+(.+)/);
      if (headingMatch) {
        return headingMatch[1].trim();
      }
    }

    // Fall back to filename
    return filename.replace(/\.md$/, '');
  }

  static calculateWordCount(content: string): number {
    const plainText = content
      .replace(/^---[\s\S]*?---\n/, '') // Remove frontmatter
      .replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, '$3' || '$1') // Replace wikilinks with display text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace markdown links with display text
      .replace(/#[a-zA-Z0-9_/-]+/g, '') // Remove tags
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/[#*_~`>-]/g, '') // Remove markdown formatting
      .trim();

    return plainText.split(/\s+/).filter(word => word.length > 0).length;
  }

  static calculateReadingTime(wordCount: number): number {
    // Average reading speed: 200-250 words per minute
    // We'll use 225 WPM as the average
    return Math.ceil(wordCount / 225);
  }

  static replaceWikilinks(content: string, linkResolver: (target: string) => string | null): string {
    return content.replace(this.WIKILINK_REGEX, (match, target, pipe, displayText) => {
      const resolvedPath = linkResolver(target.trim());
      if (resolvedPath) {
        const text = displayText || target.trim();
        return `[${text}](${resolvedPath})`;
      }
      // If link can't be resolved, leave as wikilink but mark as broken
      return `<span class="broken-link">${match}</span>`;
    });
  }
}
