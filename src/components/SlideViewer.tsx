import { useState, useEffect, useCallback } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { usePresentationContext } from '../context/PresentationContext';
import { BlockRenderer } from './BlockRenderer';

export interface SlideViewerProps {
  /** Called when the user switches to article/scroll view. */
  onSwitchToArticle: () => void;
}

/**
 * Full-screen slide deck viewer with keyboard and button navigation.
 * Supports left/right arrow keys to advance through slides.
 * Includes a toggleable speaker notes panel.
 */
export function SlideViewer({ onSwitchToArticle }: SlideViewerProps): ReactElement {
  const { data } = usePresentationContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notesVisible, setNotesVisible] = useState(false);

  const total = data.slides.length;
  const slide = data.slides[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  // Clamp index when slides are removed in the editor
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(total - 1);
    }
  }, [total, currentIndex]);

  if (!slide) {
    return (
      <div className='min-h-screen bg-slate-900 flex items-center justify-center text-white'>
        <p>
          No slides found.{' '}
          <Link to='/editor' className='underline text-blue-400'>
            Open the editor
          </Link>{' '}
          to create some.
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-900 flex flex-col'>
      {/* ── Header bar ── */}
      <header className='flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700'>
        <span className='text-slate-400 text-sm font-medium truncate max-w-xs'>
          {data.title}
        </span>
        <nav className='flex items-center gap-4' aria-label='Presentation controls'>
          <button
            onClick={() => setNotesVisible((v) => !v)}
            className='text-slate-400 hover:text-white text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 rounded'
            aria-pressed={notesVisible}
            aria-label='Toggle speaker notes'
          >
            Notes {notesVisible ? '▲' : '▼'}
          </button>
          <button
            onClick={onSwitchToArticle}
            className='text-slate-400 hover:text-white text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 rounded'
            aria-label='Switch to article view'
          >
            Article View
          </button>
          <Link
            to='/editor'
            className='text-slate-400 hover:text-white text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 rounded'
          >
            Edit
          </Link>
        </nav>
      </header>

      {/* ── Slide content ── */}
      <main
        className='flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto'
        role='main'
        aria-label={`Slide ${currentIndex + 1} of ${total}: ${slide.title}`}
      >
        <div className='w-full max-w-4xl space-y-6'>
          {slide.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} dark />
          ))}
        </div>
      </main>

      {/* ── Speaker notes panel ── */}
      {notesVisible && (
        <aside
          className='border-t border-slate-700 bg-slate-800 px-8 py-4 max-h-44 overflow-y-auto'
          aria-label='Speaker notes'
        >
          <p className='text-xs text-slate-400 uppercase tracking-wider mb-1 font-medium'>
            Speaker Notes
          </p>
          <p className='text-slate-200 text-sm leading-relaxed'>
            {slide.speakerNotes || <span className='italic text-slate-500'>No notes for this slide.</span>}
          </p>
        </aside>
      )}

      {/* ── Navigation footer ── */}
      <footer className='flex items-center justify-between px-8 py-4 bg-slate-800 border-t border-slate-700'>
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className='px-4 py-2 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 min-w-[44px] min-h-[44px]'
          aria-label='Previous slide'
        >
          ← Previous
        </button>
        <span
          className='text-slate-400 text-sm tabular-nums'
          aria-live='polite'
          aria-label={`Slide ${currentIndex + 1} of ${total}`}
        >
          {currentIndex + 1} / {total}
        </span>
        <button
          onClick={goNext}
          disabled={currentIndex === total - 1}
          className='px-4 py-2 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 min-w-[44px] min-h-[44px]'
          aria-label='Next slide'
        >
          Next →
        </button>
      </footer>
    </div>
  );
}
