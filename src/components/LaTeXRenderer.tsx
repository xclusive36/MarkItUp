'use client';

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    MathJax: {
      typesetPromise: () => Promise<void>;
      tex2svgPromise?: (input: string) => Promise<HTMLElement>;
    };
  }
}

interface LaTeXRendererProps {
  content: string;
  displayMode?: boolean;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ content, displayMode = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current && window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, [content]);

  // Format content based on display mode
  const formattedContent = displayMode && !content.trim().startsWith('$$')
    ? `$$${content.trim()}$$`
    : content.trim();

  return (
    <>
      <Script
        id="mathjax-config"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$']],
                displayMath: [['$$', '$$']],
                packages: ['base', 'ams', 'autoload'],
                processEscapes: true,
                processEnvironments: true
              },
              svg: {
                fontCache: 'global'
              }
            };
          `
        }}
      />
      <Script
        id="mathjax"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (containerRef.current) {
            window.MathJax?.typesetPromise();
          }
        }}
      />
      <div ref={containerRef} className="latex-renderer my-4">
        {formattedContent}
      </div>
    </>
  );
};

export default LaTeXRenderer;
