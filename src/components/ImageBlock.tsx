import { useState } from 'react';
import type { ReactElement } from 'react';
import { Lightbox } from './Lightbox';

export interface ImageBlockProps {
  src?: string;
  alt?: string;
  caption?: string;
  dark?: boolean;
}

/**
 * Renders an image with an accessible zoom trigger that opens a full-screen
 * Lightbox.  Extracted from BlockRenderer so `useState` is called at the top
 * level of a real component (not inside a switch case).
 */
export function ImageBlock({
  src,
  alt,
  caption,
  dark = false,
}: ImageBlockProps): ReactElement | null {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const textMuted = dark ? 'text-gray-400' : 'text-gray-500';

  // Resolve root-relative paths against the Vite base URL so the app works
  // both on localhost and on GitHub Pages sub-path deployments.
  const resolvedSrc = src?.startsWith('/')
    ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${src}`
    : src;

  if (!resolvedSrc) return null;

  return (
    <>
      <figure className='my-4'>
        <button
          type='button'
          onClick={() => setLightboxOpen(true)}
          className='block mx-auto rounded-lg cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 focus-visible:outline-offset-2'
          aria-label={`Expand image${alt ? `: ${alt}` : ''}`}
        >
          <img
            src={resolvedSrc}
            alt={alt ?? ''}
            className='max-w-full max-h-[60vh] w-auto object-contain rounded-lg shadow-lg hover:opacity-90 transition-opacity'
          />
        </button>
        {caption && (
          <figcaption className={`text-center text-sm mt-2 ${textMuted}`}>
            {caption}
          </figcaption>
        )}
      </figure>

      {lightboxOpen && (
        <Lightbox
          src={resolvedSrc}
          alt={alt}
          caption={caption}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
