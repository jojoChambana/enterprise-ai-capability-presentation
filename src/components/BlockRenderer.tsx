import { useEffect, useRef, useMemo } from 'react';
import type { ReactElement } from 'react';
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

  // Determine if Prism has this language loaded
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
 */
export function BlockRenderer({
  block,
  dark = false,
}: BlockRendererProps): ReactElement | null {
  const textPrimary = dark ? 'text-white' : 'text-gray-900';
  const textSecondary = dark ? 'text-gray-200' : 'text-gray-700';
  const textMuted = dark ? 'text-gray-400' : 'text-gray-500';

  switch (block.type) {
    case 'heading': {
      const cls = `font-bold ${textPrimary}`;
      if (block.level === 1)
        return (
          <h1 className={`text-4xl md:text-5xl lg:text-6xl ${cls} mb-4 leading-tight`}>
            {block.text}
          </h1>
        );
      if (block.level === 3)
        return (
          <h3 className={`text-2xl md:text-3xl ${cls} mb-3`}>{block.text}</h3>
        );
      return (
        <h2 className={`text-3xl md:text-4xl ${cls} mb-4`}>{block.text}</h2>
      );
    }

    case 'bullets':
      return (
        <ul className={`list-disc list-outside ml-6 space-y-2 ${textSecondary} text-lg md:text-xl`}>
          {(block.items ?? []).map((item, idx) => (
            <li key={idx} className='leading-relaxed'>
              {item}
            </li>
          ))}
        </ul>
      );

    case 'code':
      return <CodeBlock code={block.code ?? ''} language={block.language ?? 'plaintext'} />;

    case 'image':
      return (
        <figure className='my-4'>
          {block.src && (
            <img
              src={block.src}
              alt={block.alt ?? ''}
              className='max-w-full rounded-lg shadow-lg mx-auto'
            />
          )}
          {block.caption && (
            <figcaption className={`text-center text-sm mt-2 ${textMuted}`}>
              {block.caption}
            </figcaption>
          )}
        </figure>
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
        <p className={`text-lg md:text-xl leading-relaxed ${textSecondary}`}>
          {block.content}
        </p>
      );

    default:
      return null;
  }
}
