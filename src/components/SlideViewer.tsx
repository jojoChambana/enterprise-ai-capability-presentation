import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { usePresentationContext } from '../context/PresentationContext';
import { BlockRenderer } from './BlockRenderer';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useSwipe } from '../hooks/useSwipe';

// ─── Keyboard shortcuts reference data ────────────────────────────────────────

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['→', '↓', 'Space'], description: 'Next slide' },
  { keys: ['←', '↑'], description: 'Previous slide' },
  { keys: ['F'], description: 'Toggle fullscreen' },
  { keys: ['N'], description: 'Toggle speaker notes' },
  { keys: ['G'], description: 'Open slide navigator' },
  { keys: ['?'], description: 'Keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close panel / exit fullscreen' },
];

// ─── Shared SVG icons ─────────────────────────────────────────────────────────

function IconClose({ size = 12 }: { size?: number }): ReactElement {
  return (
    <svg width={size} height={size} viewBox='0 0 14 14' fill='currentColor' aria-hidden='true'>
      <path d='M1.707.293A1 1 0 00.293 1.707L5.586 7 .293 12.293a1 1 0 101.414 1.414L7 8.414l5.293 5.293a1 1 0 001.414-1.414L8.414 7l5.293-5.293A1 1 0 0012.293.293L7 5.586 1.707.293z' />
    </svg>
  );
}

function IconChevronLeft(): ReactElement {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor' aria-hidden='true'>
      <path d='M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z' />
    </svg>
  );
}

function IconChevronRight(): ReactElement {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor' aria-hidden='true'>
      <path d='M4.646 1.646a.5.5 0 000 .708L10.293 8 4.646 13.646a.5.5 0 00.708.708l6-6a.5.5 0 000-.708l-6-6a.5.5 0 00-.708 0z' />
    </svg>
  );
}

// ─── SlideNavDrawer ───────────────────────────────────────────────────────────

interface SlideNavDrawerProps {
  open: boolean;
  onClose: () => void;
  slides: { id: string; title: string }[];
  currentIndex: number;
  onSelect: (idx: number) => void;
}

/**
 * Accessible flyout drawer showing the slide navigator / table of contents.
 * Traps focus while open; closes on Escape or backdrop click.
 */
function SlideNavDrawer({
  open,
  onClose,
  slides,
  currentIndex,
  onSelect,
}: SlideNavDrawerProps): ReactElement {
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
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role='dialog'
        aria-modal='true'
        aria-label='Slide navigator'
        className={`fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] bg-navy-800 border-r border-gold-subtle flex flex-col shadow-2xl transform transition-transform duration-200 ease-out will-change-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gold-subtle'>
          <h2 className='font-display text-gold text-base tracking-wide'>Contents</h2>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close slide navigator'
            className='w-8 h-8 flex items-center justify-center text-slate-400 hover:text-gold hover:bg-navy-700 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
          >
            <IconClose size={13} />
          </button>
        </div>

        {/* Slide list */}
        <nav aria-label='Slide list' className='flex-1 overflow-y-auto'>
          <ol className='p-3 space-y-0.5'>
            {slides.map((slide, idx) => (
              <li key={slide.id}>
                <button
                  type='button'
                  onClick={() => { onSelect(idx); onClose(); }}
                  aria-current={idx === currentIndex ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                    idx === currentIndex
                      ? 'bg-gold/10 text-gold border-l-[3px] border-gold'
                      : 'text-slate-300 hover:bg-navy-700 hover:text-cream border-l-[3px] border-transparent'
                  }`}
                >
                  <span
                    className={`text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${
                      idx === currentIndex
                        ? 'bg-gold text-navy-900 font-bold'
                        : 'bg-navy-700 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className='text-sm truncate leading-snug font-body'>
                    {slide.title || 'Untitled'}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Drawer footer */}
        <div className='px-5 py-3 border-t border-gold-subtle'>
          <p className='text-xs text-slate-500 font-body'>
            Use arrow keys or swipe to navigate
          </p>
        </div>
      </div>
    </>
  );
}

// ─── ShortcutsModal ───────────────────────────────────────────────────────────

interface ShortcutsModalProps {
  onClose: () => void;
}

/**
 * Accessible modal overlay listing all keyboard shortcuts.
 */
function ShortcutsModal({ onClose }: ShortcutsModalProps): ReactElement {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, modalRef);

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden='true'
        className='fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fadeIn'
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'
        role='presentation'
      >
        <div
          ref={modalRef}
          role='dialog'
          aria-modal='true'
          aria-labelledby='shortcuts-heading'
          className='pointer-events-auto bg-navy-800 border border-gold-subtle rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fadeIn'
        >
          <div className='flex items-center justify-between mb-5'>
            <h2 id='shortcuts-heading' className='font-display text-cream'>
              Keyboard Shortcuts
            </h2>
            <button
              type='button'
              onClick={onClose}
              aria-label='Close keyboard shortcuts'
              className='w-8 h-8 flex items-center justify-center text-slate-400 hover:text-gold hover:bg-navy-700 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
            >
              <IconClose size={13} />
            </button>
          </div>

          <dl className='space-y-3'>
            {SHORTCUTS.map(({ keys, description }) => (
              <div key={description} className='flex items-center justify-between gap-4'>
                <dt className='text-slate-300 text-sm font-body'>{description}</dt>
                <dd className='flex items-center gap-1 shrink-0'>
                  {keys.map((k) => (
                    <kbd
                      key={k}
                      className='inline-flex items-center justify-center px-2 py-0.5 text-xs font-mono bg-navy-700 border border-gold-subtle text-slate-200 rounded-md min-w-[1.75rem] text-center'
                    >
                      {k}
                    </kbd>
                  ))}
                </dd>
              </div>
            ))}
          </dl>

          <p className='mt-5 text-xs text-slate-500 border-t border-gold-subtle pt-4 font-body'>
            Shortcuts are disabled while typing in a text field.
          </p>
        </div>
      </div>
    </>
  );
}

// ─── MoreMenu (mobile flyout) ─────────────────────────────────────────────────

interface MoreMenuProps {
  containerRef: { current: HTMLElement | null };
  notesVisible: boolean;
  isFullscreen: boolean;
  onNotes: () => void;
  onArticle: () => void;
  onFullscreen: () => void;
  onShortcuts: () => void;
  onClose: () => void;
}

/**
 * Mobile-only flyout menu for presentation controls.
 * Closes on outside click or Escape.
 */
function MoreMenu({
  containerRef,
  notesVisible,
  isFullscreen,
  onNotes,
  onArticle,
  onFullscreen,
  onShortcuts,
  onClose,
}: MoreMenuProps): ReactElement {
  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const esc = (e: KeyboardEvent): void => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    window.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('keydown', esc);
    };
  }, [containerRef, onClose]);

  const item =
    'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-slate-200 hover:bg-navy-700 transition-colors focus-visible:outline-none focus-visible:bg-navy-700 font-body';

  return (
    <div
      role='menu'
      aria-label='Presentation options'
      className='absolute top-full right-0 mt-2 w-52 bg-navy-800 border border-gold-subtle rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-fadeIn'
    >
      <button role='menuitem' type='button' onClick={() => { onNotes(); onClose(); }} className={item} aria-pressed={notesVisible}>
        <span className='w-4 text-center text-gold text-xs'>{notesVisible ? '✓' : ''}</span>
        {notesVisible ? 'Hide Notes' : 'Show Notes'}
      </button>
      <button role='menuitem' type='button' onClick={() => { onArticle(); onClose(); }} className={item}>
        <span className='w-4' aria-hidden='true' />
        Article View
      </button>
      <button role='menuitem' type='button' onClick={() => { onFullscreen(); onClose(); }} className={item}>
        <span className='w-4' aria-hidden='true' />
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>
      <button role='menuitem' type='button' onClick={() => { onShortcuts(); onClose(); }} className={item}>
        <span className='w-4' aria-hidden='true' />
        Keyboard Shortcuts
      </button>
      <div role='separator' className='my-1 border-t border-gold-subtle' />
      <Link
        to='/editor'
        role='menuitem'
        onClick={onClose}
        className={item + ' block'}
      >
        <span className='w-4' aria-hidden='true' />
        Edit Presentation
      </Link>
    </div>
  );
}

// ─── SlideViewer (main export) ────────────────────────────────────────────────

export interface SlideViewerProps {
  onSwitchToArticle: () => void;
}

/**
 * Primary slide-deck viewer with executive editorial styling.
 * Features: keyboard navigation, swipe gestures, speaker notes panel,
 * slide navigator drawer, fullscreen toggle, and responsive layout.
 */
export function SlideViewer({ onSwitchToArticle }: SlideViewerProps): ReactElement {
  const { data } = usePresentationContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notesVisible, setNotesVisible] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const moreContainerRef = useRef<HTMLDivElement>(null);

  const total = data.slides.length;
  const slide = data.slides[currentIndex];
  const progress = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;

  // ── Navigation ────────────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard shortcuts — disabled while a modal/drawer is open or typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (navOpen || shortcutsOpen || moreMenuOpen) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          goPrev();
          break;
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'n':
        case 'N':
          setNotesVisible((v) => !v);
          break;
        case 'g':
        case 'G':
          setNavOpen(true);
          break;
        case '?':
          setShortcutsOpen(true);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, navOpen, shortcutsOpen, moreMenuOpen]);

  // Clamp index when slides are removed in the editor
  useEffect(() => {
    if (currentIndex >= total && total > 0) setCurrentIndex(total - 1);
  }, [total, currentIndex]);

  // ── Fullscreen ────────────────────────────────────────────────────────────

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = (): void => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Touch / swipe ─────────────────────────────────────────────────────────

  const { onTouchStart, onTouchEnd } = useSwipe(goNext, goPrev);

  // ── Empty state ───────────────────────────────────────────────────────────

  if (!slide) {
    return (
      <div className='min-h-screen bg-navy-900 flex items-center justify-center text-cream font-body'>
        <p>
          No slides found.{' '}
          <Link
            to='/editor'
            className='underline text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded'
          >
            Open the editor
          </Link>{' '}
          to create some.
        </p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Skip-to-content link — visible only on keyboard focus */}
      <a href='#slide-content' className='skip-link'>
        Skip to slide content
      </a>

      {/* Polite screen-reader announcer for slide changes */}
      <div
        role='status'
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
      >
        Slide {currentIndex + 1} of {total}: {slide.title}
      </div>

      {/* Root container — fills dynamic viewport */}
      <div className='h-[100dvh] bg-navy-900 flex flex-col overflow-hidden font-body'>

        {/* ── Gold gradient progress bar ── */}
        <div
          role='progressbar'
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Slide ${currentIndex + 1} of ${total}`}
          className='h-[3px] bg-navy-800 shrink-0'
        >
          <div
            className='h-full progress-gold transition-[width] duration-300 ease-out rounded-r-sm'
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── Header chrome ── */}
        <header className='flex items-center gap-2 px-3 sm:px-5 h-12 sm:h-14 glass-chrome border-b border-gold-subtle shrink-0 no-print'>

          {/* Slide navigator toggle */}
          <button
            type='button'
            onClick={() => setNavOpen(true)}
            aria-label='Open slide navigator'
            aria-haspopup='dialog'
            aria-expanded={navOpen}
            className='flex items-center justify-center w-9 h-9 rounded-xl border border-gold-subtle text-gold hover:text-gold-light hover:bg-navy-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold shrink-0'
          >
            <svg width='18' height='13' viewBox='0 0 18 13' fill='currentColor' aria-hidden='true'>
              <rect y='0' width='18' height='2.2' rx='1.1' />
              <rect y='5.4' width='13' height='2.2' rx='1.1' />
              <rect y='10.8' width='8' height='2.2' rx='1.1' />
            </svg>
          </button>

          {/* Presentation title (desktop) */}
          <span className='hidden sm:block font-display text-gold text-sm tracking-wide truncate flex-1 min-w-0'>
            {data.title}
          </span>

          {/* Slide counter (mobile, centred) */}
          <span
            className='sm:hidden flex-1 text-center text-slate-400 text-sm tabular-nums'
            aria-hidden='true'
          >
            {currentIndex + 1} / {total}
          </span>

          {/* Confidential badge (desktop) */}
          <span className='hidden md:inline-block badge-confidential' aria-label='Confidential'>
            Confidential
          </span>

          {/* Desktop controls */}
          <nav
            className='hidden sm:flex items-center gap-1'
            aria-label='Presentation controls'
          >
            <button
              type='button'
              onClick={() => setNotesVisible((v) => !v)}
              aria-pressed={notesVisible}
              aria-label={notesVisible ? 'Hide speaker notes' : 'Show speaker notes'}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                notesVisible
                  ? 'bg-gold/20 text-gold'
                  : 'text-slate-400 hover:text-gold hover:bg-navy-700'
              }`}
            >
              Notes
            </button>

            <button
              type='button'
              onClick={onSwitchToArticle}
              aria-label='Switch to article view'
              className='px-3 py-1.5 text-xs text-slate-400 hover:text-gold hover:bg-navy-700 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
            >
              Article
            </button>

            <button
              type='button'
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
              className='flex items-center justify-center w-8 h-8 text-slate-400 hover:text-gold hover:bg-navy-700 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
            >
              {isFullscreen ? (
                <svg width='14' height='14' viewBox='0 0 14 14' fill='currentColor' aria-hidden='true'>
                  <path d='M5 0H0v5h2V2h3V0zM9 0v2h3v3h2V0H9zM0 9v5h5v-2H2V9H0zm12 3H9v2h5V9h-2v3z'/>
                </svg>
              ) : (
                <svg width='14' height='14' viewBox='0 0 14 14' fill='currentColor' aria-hidden='true'>
                  <path d='M0 0v5h2V2h3V0H0zm9 0v2h3v3h2V0H9zM0 9v5h5v-2H2V9H0zm12 0v3H9v2h5V9h-2z'/>
                </svg>
              )}
            </button>

            <button
              type='button'
              onClick={() => setShortcutsOpen(true)}
              aria-label='Show keyboard shortcuts'
              title='Keyboard shortcuts (?)'
              className='flex items-center justify-center w-8 h-8 text-slate-400 hover:text-gold hover:bg-navy-700 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold text-xs font-semibold'
            >
              ?
            </button>

            <Link
              to='/editor'
              className='px-3 py-1.5 text-xs text-slate-400 hover:text-gold hover:bg-navy-700 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
            >
              Edit
            </Link>
          </nav>

          {/* Mobile ⋯ more menu */}
          <div ref={moreContainerRef} className='sm:hidden relative shrink-0'>
            <button
              type='button'
              onClick={() => setMoreMenuOpen((v) => !v)}
              aria-label='More options'
              aria-haspopup='menu'
              aria-expanded={moreMenuOpen}
              className='flex items-center justify-center w-9 h-9 text-slate-400 hover:text-gold hover:bg-navy-700 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
            >
              <svg width='4' height='16' viewBox='0 0 4 16' fill='currentColor' aria-hidden='true'>
                <circle cx='2' cy='2' r='2' />
                <circle cx='2' cy='8' r='2' />
                <circle cx='2' cy='14' r='2' />
              </svg>
            </button>

            {moreMenuOpen && (
              <MoreMenu
                containerRef={moreContainerRef}
                notesVisible={notesVisible}
                isFullscreen={isFullscreen}
                onNotes={() => setNotesVisible((v) => !v)}
                onArticle={onSwitchToArticle}
                onFullscreen={toggleFullscreen}
                onShortcuts={() => setShortcutsOpen(true)}
                onClose={() => setMoreMenuOpen(false)}
              />
            )}
          </div>
        </header>

        {/* ── Slide content ── */}
        <main
          id='slide-content'
          tabIndex={-1}
          aria-label={`Slide ${currentIndex + 1} of ${total}: ${slide.title}`}
          className='flex-1 overflow-y-auto flex flex-col items-center min-h-0 focus-visible:outline-none'
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            key={currentIndex}
            className='slide-content w-full max-w-4xl px-4 sm:px-10 py-6 sm:py-10 space-y-4 sm:space-y-6 my-auto'
          >
            {slide.blocks
              .filter((block) => !block.articleOnly)
              .map((block) => (
                <BlockRenderer key={block.id} block={block} dark />
              ))}
          </div>
        </main>

        {/* ── Speaker notes panel ── */}
        {notesVisible && (
          <aside
            aria-label='Speaker notes'
            className='shrink-0 border-t border-gold-subtle bg-navy-800/90 backdrop-blur-sm px-4 sm:px-8 py-3 max-h-36 sm:max-h-44 overflow-y-auto no-print'
          >
            <p className='text-[10px] text-gold-dim uppercase tracking-widest font-semibold mb-1.5'>
              Speaker Notes
            </p>
            <p className='text-slate-300 text-sm leading-relaxed font-body'>
              {slide.speakerNotes ?? (
                <span className='italic text-slate-500'>No notes for this slide.</span>
              )}
            </p>
          </aside>
        )}

        {/* ── Navigation footer ──
             3-column grid keeps the centre nav pinned regardless of
             left / right content width.  1fr | auto | 1fr ensures the
             auto-sized centre column is always dead-centre. */}
        <footer className='grid grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6 py-2 sm:py-3 glass-chrome border-t border-gold-subtle shrink-0 gap-x-2 no-print'>

          {/* Left cell: slide title on desktop, empty on mobile */}
          <div className='min-w-0'>
            <span className='hidden sm:block text-xs text-slate-500 truncate font-body'>
              {slide.title}
            </span>
          </div>

          {/* Centre cell: always centred nav buttons + counter */}
          <div className='flex items-center gap-2 justify-self-center'>
            <button
              type='button'
              onClick={goPrev}
              disabled={currentIndex === 0}
              aria-label='Previous slide'
              className='flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-navy-700 border border-gold-subtle text-slate-300 hover:text-gold hover:border-gold-dim disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
            >
              <IconChevronLeft />
            </button>

            <span
              className='text-slate-400 text-xs sm:text-sm tabular-nums min-w-[3.5rem] text-center'
              aria-hidden='true'
            >
              <span className='text-gold font-semibold'>{currentIndex + 1}</span>
              {' / '}
              {total}
            </span>

            <button
              type='button'
              onClick={goNext}
              disabled={currentIndex === total - 1}
              aria-label='Next slide'
              className='flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-navy-700 border border-gold-subtle text-slate-300 hover:text-gold hover:border-gold-dim disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
            >
              <IconChevronRight />
            </button>
          </div>

          {/* Right cell: dot indicators (mobile) + keyboard hints (desktop) */}
          <div className='flex items-center gap-2 justify-self-end'>
            {/* Dot indicators — mobile only, ≤15 slides */}
            {total <= 15 && (
              <div
                className='flex sm:hidden items-center gap-1'
                role='tablist'
                aria-label='Slide indicators'
              >
                {data.slides.map((s, idx) => (
                  <button
                    key={s.id}
                    type='button'
                    role='tab'
                    aria-selected={idx === currentIndex}
                    aria-label={`Go to slide ${idx + 1}: ${s.title}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                      idx === currentIndex
                        ? 'w-4 h-1.5 bg-gold'
                        : 'w-1.5 h-1.5 bg-navy-600 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Keyboard hints (desktop) */}
            <div className='hidden md:flex items-center gap-1.5 kbd-hint text-slate-500 text-xs' aria-hidden='true'>
              <kbd>←</kbd><kbd>→</kbd>
              <span className='text-slate-600 mx-0.5'>navigate</span>
              <kbd>N</kbd>
              <span className='text-slate-600 mx-0.5'>notes</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Portaled overlays ── */}
      <SlideNavDrawer
        open={navOpen}
        onClose={() => setNavOpen(false)}
        slides={data.slides}
        currentIndex={currentIndex}
        onSelect={setCurrentIndex}
      />

      {shortcutsOpen && (
        <ShortcutsModal onClose={() => setShortcutsOpen(false)} />
      )}
    </>
  );
}
