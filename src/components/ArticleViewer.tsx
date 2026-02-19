import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { usePresentationContext } from '../context/PresentationContext';
import { BlockRenderer } from './BlockRenderer';
import { useFocusTrap } from '../hooks/useFocusTrap';
import type { Slide } from '../types/presentation';

// ─── TOC Drawer (mobile / tablet) ─────────────────────────────────────────────

interface TocDrawerProps {
  open: boolean;
  onClose: () => void;
  slides: Slide[];
  activeSectionId: string | null;
}

/**
 * Accessible table-of-contents drawer for mobile/tablet breakpoints.
 * Slides in from the right; traps focus while open.
 */
function TocDrawer({
  open,
  onClose,
  slides,
  activeSectionId,
}: TocDrawerProps): ReactElement {
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, drawerRef);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent): void => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden='true'
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel — slides in from the right */}
      <div
        ref={drawerRef}
        role='dialog'
        aria-modal='true'
        aria-label='Table of contents'
        className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-white border-l border-gray-100 flex flex-col shadow-2xl transform transition-transform duration-200 ease-out will-change-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
          <h2 className='font-display text-gray-900 text-base'>Table of Contents</h2>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close table of contents'
            className='w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500'
          >
            <svg width='12' height='12' viewBox='0 0 14 14' fill='currentColor' aria-hidden='true'>
              <path d='M1.707.293A1 1 0 00.293 1.707L5.586 7 .293 12.293a1 1 0 101.414 1.414L7 8.414l5.293 5.293a1 1 0 001.414-1.414L8.414 7l5.293-5.293A1 1 0 0012.293.293L7 5.586 1.707.293z' />
            </svg>
          </button>
        </div>

        <nav aria-label='Article sections' className='flex-1 overflow-y-auto'>
          <ol className='p-3 space-y-0.5'>
            {slides.map((slide, idx) => (
              <li key={slide.id}>
                <a
                  href={`#section-${slide.id}`}
                  onClick={onClose}
                  aria-current={activeSectionId === slide.id ? 'location' : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 ${
                    activeSectionId === slide.id
                      ? 'bg-amber-50 text-amber-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${
                    activeSectionId === slide.id
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className='truncate leading-snug'>
                    {slide.title || 'Untitled'}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </>
  );
}

// ─── TOC Sidebar (desktop xl+) ─────────────────────────────────────────────────

interface TocSidebarProps {
  slides: Slide[];
  activeSectionId: string | null;
}

/**
 * Sticky sidebar table of contents for wide viewports (xl+).
 */
function TocSidebar({ slides, activeSectionId }: TocSidebarProps): ReactElement {
  return (
    <nav
      aria-label='Article sections'
      className='sticky top-[57px] max-h-[calc(100vh-57px)] overflow-y-auto py-10 pr-2'
    >
      <p className='text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3 px-3 font-body'>
        Contents
      </p>
      <ol className='space-y-0.5'>
        {slides.map((slide, idx) => (
          <li key={slide.id}>
            <a
              href={`#section-${slide.id}`}
              aria-current={activeSectionId === slide.id ? 'location' : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-body transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 ${
                activeSectionId === slide.id
                  ? 'text-amber-800 font-semibold bg-amber-50'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className={`font-mono w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0 ${
                activeSectionId === slide.id
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-gray-100 text-gray-300'
              }`}>
                {idx + 1}
              </span>
              <span className='leading-snug truncate'>{slide.title || 'Untitled'}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── ArticleViewer (main export) ───────────────────────────────────────────────

export interface ArticleViewerProps {
  onSwitchToSlides: () => void;
}

/**
 * Scrollable article view of the full presentation.
 * Features: reading progress bar, active section tracking,
 * sticky TOC sidebar (xl+), mobile TOC drawer, back-to-top button.
 */
export function ArticleViewer({ onSwitchToSlides }: ArticleViewerProps): ReactElement {
  const { data } = usePresentationContext();
  const [tocOpen, setTocOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    data.slides[0]?.id ?? null,
  );
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Single scroll listener: progress, back-to-top, and active TOC section
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onScroll = (): void => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;

      setShowBackToTop(scrollTop > 400);
      setReadingProgress(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 100);

      const headerOffset = 80;
      let activeId = data.slides[0]?.id ?? null;
      for (const slide of data.slides) {
        const sectionEl = el.querySelector<HTMLElement>(`#section-${slide.id}`);
        if (sectionEl && sectionEl.offsetTop - headerOffset <= scrollTop) {
          activeId = slide.id;
        }
      }
      setActiveSectionId(activeId);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [data.slides]);

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className='h-[100dvh] bg-white flex flex-col overflow-hidden font-body'>

      {/* Skip link */}
      <a href='#article-content' className='skip-link'>
        Skip to article content
      </a>

      {/* Reading progress bar */}
      <div
        role='progressbar'
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label='Reading progress'
        className='h-[3px] bg-gray-100 shrink-0'
      >
        <div
          className='h-full bg-amber-500 transition-[width] duration-150 ease-out rounded-r-sm'
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* ── Sticky header ── */}
      <header className='flex items-center gap-3 px-4 sm:px-6 h-12 sm:h-14 glass-chrome-light border-b border-gray-100 shadow-sm shrink-0 z-10'>

        <button
          type='button'
          onClick={onSwitchToSlides}
          aria-label='Switch to slide view'
          className='flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 shrink-0'
        >
          <svg width='14' height='14' viewBox='0 0 16 16' fill='currentColor' aria-hidden='true'>
            <path d='M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z' />
          </svg>
          <span className='hidden sm:inline'>Slide View</span>
        </button>

        <span className='flex-1 font-display text-gray-700 text-sm truncate min-w-0'>
          {data.title}
        </span>

        <nav className='flex items-center gap-1' aria-label='Article controls'>
          <button
            type='button'
            onClick={() => setTocOpen(true)}
            aria-label='Open table of contents'
            aria-haspopup='dialog'
            className='xl:hidden flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500'
          >
            <svg width='14' height='11' viewBox='0 0 14 11' fill='currentColor' aria-hidden='true'>
              <rect y='0' width='14' height='2' rx='1' />
              <rect y='4.5' width='10' height='2' rx='1' />
              <rect y='9' width='6' height='2' rx='1' />
            </svg>
            <span className='hidden sm:inline'>Contents</span>
          </button>

          <Link
            to='/editor'
            className='px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500'
          >
            Edit
          </Link>
        </nav>
      </header>

      {/* ── Scrollable body ── */}
      <div ref={scrollContainerRef} className='flex-1 overflow-y-auto'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 xl:flex xl:gap-14'>

          {/* ── Main article content ── */}
          <main
            id='article-content'
            tabIndex={-1}
            className='flex-1 min-w-0 py-10 sm:py-14 max-w-3xl mx-auto xl:mx-0 focus-visible:outline-none'
          >
            {/* Presentation metadata */}
            <div className='mb-12 pb-8 border-b border-gray-100'>
              <h1 className='font-display text-3xl sm:text-4xl text-gray-900 mb-3 leading-tight text-balance'>
                {data.title}
              </h1>
              {(data.author || data.date) && (
                <p className='text-gray-400 text-sm flex items-center gap-2 flex-wrap'>
                  {data.author && <span>{data.author}</span>}
                  {data.author && data.date && (
                    <span className='text-gray-200' aria-hidden='true'>•</span>
                  )}
                  {data.date && <time dateTime={data.date}>{data.date}</time>}
                </p>
              )}
            </div>

            {/* Slides rendered as article sections */}
            {data.slides.map((slide, idx) => (
              <section
                key={slide.id}
                id={`section-${slide.id}`}
                aria-labelledby={`section-heading-${slide.id}`}
                className='mb-14 pb-10 border-b border-gray-50 last:border-0 scroll-mt-20'
              >
                {/* Section label row */}
                <div className='flex items-center gap-3 mb-6'>
                  <span
                    className='flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-semibold font-mono'
                    aria-hidden='true'
                  >
                    {idx + 1}
                  </span>
                  <span
                    id={`section-heading-${slide.id}`}
                    className='text-gray-400 text-sm font-medium truncate'
                  >
                    {slide.title}
                  </span>
                </div>

                {/* Content blocks */}
                <div className='space-y-5'>
                  {slide.blocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} dark={false} />
                  ))}
                </div>

                {/* Speaker notes callout */}
                {slide.speakerNotes && (
                  <aside
                    aria-label={`Presenter notes for section ${idx + 1}`}
                    className='mt-8 pl-4 border-l-4 border-amber-400 bg-amber-50/60 py-3 pr-4 rounded-r-xl'
                  >
                    <p className='text-[10px] text-amber-600 font-semibold uppercase tracking-widest mb-1.5'>
                      Presenter Notes
                    </p>
                    <p className='text-amber-900 text-sm leading-relaxed'>
                      {slide.speakerNotes}
                    </p>
                  </aside>
                )}
              </section>
            ))}
          </main>

          {/* ── TOC sidebar (xl+) ── */}
          <aside className='hidden xl:block w-56 shrink-0' aria-label='Table of contents'>
            <TocSidebar slides={data.slides} activeSectionId={activeSectionId} />
          </aside>
        </div>
      </div>

      {/* ── Back-to-top button ── */}
      {showBackToTop && (
        <button
          type='button'
          onClick={scrollToTop}
          aria-label='Back to top'
          className='fixed bottom-6 right-6 z-30 flex items-center justify-center w-11 h-11 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 animate-fadeIn'
        >
          <svg width='14' height='14' viewBox='0 0 16 16' fill='currentColor' aria-hidden='true'>
            <path d='M8 1a.5.5 0 01.5.5v11.793l3.146-3.147a.5.5 0 01.708.708l-4 4a.5.5 0 01-.708 0l-4-4a.5.5 0 01.708-.708L7.5 13.293V1.5A.5.5 0 018 1z'
              transform='rotate(180 8 8)'
            />
          </svg>
        </button>
      )}

      {/* ── TOC Drawer (mobile / tablet) ── */}
      <TocDrawer
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        slides={data.slides}
        activeSectionId={activeSectionId}
      />
    </div>
  );
}
