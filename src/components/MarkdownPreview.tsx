import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

interface MarkdownPreviewProps {
  markdown: string;
  theme: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = (
  { markdown } // theme parameter removed - not used
) => (
  <div className="h-full p-4 lg:p-6 overflow-y-auto">
    <div className="prose prose-sm lg:prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  </div>
);

export default MarkdownPreview;
