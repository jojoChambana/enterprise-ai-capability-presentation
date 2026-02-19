import { useEffect, useCallback } from 'react';
import type { ReactElement } from 'react';

export interface LightboxProps {
  src: string;
  alt?: string;
  caption?: string;
  onClose: () => void;
}

/**
 * Full-screen lightbox overlay for images and diagrams.
 *
 * - Closes on backdrop click, Escape key, or the × button.
 * - Traps scroll on the body while open.
 * - Fades in with a CSS transition (no extra dependencies).
 */
export function Lightbox({ src, alt = '', caption, onClose }: LightboxProps): ReactElement {
  // Prevent body scroll while the lightbox is mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    /* Backdrop */
    <div
      role='dialog'
      aria-modal='true'
      aria-label={alt || 'Image lightbox'}
      onClick={onClose}
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn'
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label='Close lightbox'
        className='absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-4xl leading-none select-none focus:outline-none focus:ring-2 focus:ring-white rounded'
      >
        &times;
      </button>

      {/* Image panel — clicks here do NOT close the lightbox */}
      <div
        onClick={(e) => e.stopPropagation()}
        className='relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3'
      >
        <img
          src={src}
          alt={alt}
          className='max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl'
        />
        {caption && (
          <p className='text-sm text-white/70 text-center px-4'>{caption}</p>
        )}
      </div>
    </div>
  );
}
