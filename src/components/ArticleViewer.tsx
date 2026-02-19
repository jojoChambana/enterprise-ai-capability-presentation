import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { usePresentationContext } from '../context/PresentationContext';
import { BlockRenderer } from './BlockRenderer';

export interface ArticleViewerProps {
  /** Called when the user switches back to slide deck view. */
  onSwitchToSlides: () => void;
}

/**
 * Long-form scrollable article view of the entire presentation.
 * Renders all slides sequentially with speaker notes visible as callouts.
 */
export function ArticleViewer({ onSwitchToSlides }: ArticleViewerProps): ReactElement {
  const { data } = usePresentationContext();

  return (
    <div className='min-h-screen bg-white'>
      {/* ── Sticky header ── */}
      <header className='sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm'>
        <span className='text-gray-700 font-medium text-sm truncate max-w-sm'>
          {data.title}
        </span>
        <nav className='flex items-center gap-4' aria-label='Presentation controls'>
          <button
            onClick={onSwitchToSlides}
            className='text-gray-500 hover:text-gray-900 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded'
            aria-label='Switch to slide view'
          >
            Slide View
          </button>
          <Link
            to='/editor'
            className='text-gray-500 hover:text-gray-900 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded'
          >
            Edit
          </Link>
        </nav>
      </header>

      {/* ── Article body ── */}
      <main className='max-w-3xl mx-auto px-6 py-12'>
        {/* Presentation header */}
        <div className='mb-12 pb-8 border-b border-gray-200'>
          <h1 className='text-4xl font-bold text-gray-900 mb-3'>{data.title}</h1>
          <p className='text-gray-500 text-sm'>
            {data.author} &mdash; {data.date}
          </p>
        </div>

        {/* Slides as article sections */}
        {data.slides.map((slide, idx) => (
          <section
            key={slide.id}
            className='mb-16 pb-12 border-b border-gray-100 last:border-0'
            aria-labelledby={`section-title-${slide.id}`}
          >
            {/* Slide number label */}
            <div className='flex items-center gap-3 mb-6'>
              <span className='inline-block text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded'>
                {idx + 1}
              </span>
              <span
                id={`section-title-${slide.id}`}
                className='text-gray-400 text-sm'
              >
                {slide.title}
              </span>
            </div>

            {/* Block content */}
            <div className='space-y-6'>
              {slide.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} dark={false} />
              ))}
            </div>

            {/* Speaker notes as a callout */}
            {slide.speakerNotes && (
              <aside
                className='mt-8 pl-4 border-l-4 border-amber-300 bg-amber-50 py-3 pr-4 rounded-r-lg'
                aria-label={`Speaker notes for slide ${idx + 1}`}
              >
                <p className='text-xs text-amber-700 font-semibold uppercase tracking-wider mb-1'>
                  Speaker Notes
                </p>
                <p className='text-amber-900 text-sm leading-relaxed'>
                  {slide.speakerNotes}
                </p>
              </aside>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
