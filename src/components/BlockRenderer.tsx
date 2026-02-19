import { useEffect, useRef, useMemo } from 'react';
import type { ReactElement } from 'react';
import { ImageBlock } from './ImageBlock';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
// Language components (order matters — dependencies first)
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';
import type { SlideContentBlock } from '../types/presentation';

interface CodeBlockProps {
  code: string;
  language: string;
}

/** Renders a syntax-highlighted code block using Prism.js. */
function CodeBlock({ code, language }: CodeBlockProps): ReactElement {
  const codeRef = useRef<HTMLElement>(null);

  const resolvedLang = useMemo(
    () => (Prism.languages[language] ? language : 'plaintext'),
    [language],
  );

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, resolvedLang]);

  return (
    <div className='my-4 rounded-lg overflow-hidden border border-slate-700'>
      <div className='flex items-center px-4 py-2 bg-slate-800 border-b border-slate-700'>
        <span className='text-slate-400 text-xs font-mono'>{language}</span>
      </div>
      <pre className='!mt-0 !rounded-none overflow-x-auto text-sm'>
        <code ref={codeRef} className={`language-${resolvedLang}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}

export interface BlockRendererProps {
  block: SlideContentBlock;
  /** When true, uses dark-mode text colours (for slide/preview view). */
  dark?: boolean;
}

/**
 * Renders a single SlideContentBlock based on its type.
 * Shared by SlideViewer, ArticleViewer, and the editor's live preview.
 *
 * Uses DM Serif Display for headings and DM Sans for body text
 * to create an executive editorial aesthetic.
 */
export function BlockRenderer({
  block,
  dark = false,
}: BlockRendererProps): ReactElement | null {
  /* Dark mode = navy/gold slide view; light mode = white article view */
  const textPrimary = dark ? 'text-cream' : 'text-gray-900';
  const textSecondary = dark ? 'text-gray-300' : 'text-gray-700';

  switch (block.type) {
    case 'heading': {
      const base = `font-display font-bold leading-tight ${textPrimary}`;
      if (block.level === 1)
        return (
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl ${base} mb-4 text-balance`}>
            {block.text}
          </h1>
        );
      if (block.level === 3)
        return (
          <h3 className={`text-xl sm:text-2xl md:text-3xl ${base} mb-3`}>
            {block.text}
          </h3>
        );
      return (
        <h2 className={`text-2xl sm:text-3xl md:text-4xl ${base} mb-4 heading-accent`}>
          {block.text}
        </h2>
      );
    }

    case 'bullets':
      return (
        <ul
          className={`space-y-3 ${textSecondary} text-base sm:text-lg md:text-xl font-body`}
          role='list'
        >
          {(block.items ?? []).map((item, idx) => (
            <li
              key={idx}
              className='leading-relaxed flex gap-3 items-start'
            >
              <span
                className={`mt-2.5 w-1.5 h-1.5 rounded-full shrink-0 ${dark ? 'bg-gold' : 'bg-amber-500'}`}
                aria-hidden='true'
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'code':
      return <CodeBlock code={block.code ?? ''} language={block.language ?? 'plaintext'} />;

    case 'image':
      return (
        <ImageBlock
          src={block.src}
          alt={block.alt}
          caption={block.caption}
          dark={dark}
        />
      );

    case 'embed':
      return (
        <div className='relative w-full my-4' style={{ paddingTop: '56.25%' }}>
          <iframe
            src={block.url ?? ''}
            className='absolute inset-0 w-full h-full rounded-lg'
            title='Embedded content'
            allowFullScreen
          />
        </div>
      );

    case 'paragraph':
      return (
        <p className={`text-base sm:text-lg md:text-xl leading-relaxed font-body ${textSecondary}`}>
          {block.content}
        </p>
      );

    default:
      return null;
  }
}
