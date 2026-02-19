import { useState, useRef } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { usePresentationContext } from '../../context/PresentationContext';
import { SlideEditor } from './SlideEditor';
import { BlockRenderer } from '../BlockRenderer';
import type { PresentationData } from '../../types/presentation';

/**
 * Main editor panel.
 * Left sidebar: slide list with add/remove/reorder.
 * Center: SlideEditor for the selected slide.
 * Right panel: live dark-mode preview of the selected slide.
 */
export function EditorPanel(): ReactElement {
  const { data, addSlide, removeSlide, moveSlide, importData, exportData } =
    usePresentationContext();

  const [selectedId, setSelectedId] = useState<string>(
    data.slides[0]?.id ?? '',
  );
  const [previewOpen, setPreviewOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSlide = data.slides.find((s) => s.id === selectedId);
  const selectedIndex = data.slides.findIndex((s) => s.id === selectedId);

  const handleAddSlide = (): void => {
    const newId = addSlide(selectedIndex >= 0 ? selectedIndex : undefined);
    setSelectedId(newId);
  };

  const handleRemoveSlide = (slideId: string): void => {
    if (data.slides.length <= 1) {
      alert('Cannot remove the last slide.');
      return;
    }
    const idx = data.slides.findIndex((s) => s.id === slideId);
    removeSlide(slideId);
    const remaining = data.slides.filter((s) => s.id !== slideId);
    const nextIdx = Math.max(0, idx - 1);
    if (remaining[nextIdx]) {
      setSelectedId(remaining[nextIdx].id);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event): void => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as PresentationData;
        if (!Array.isArray(parsed.slides)) {
          throw new Error('Invalid format: slides must be an array');
        }
        importData(parsed);
        setSelectedId(parsed.slides[0]?.id ?? '');
      } catch (err) {
        alert(
          `Import failed: ${err instanceof Error ? err.message : 'Invalid JSON file.'}`,
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col'>
      {/* ── Top bar ── */}
      <header className='flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm'>
        <div className='flex items-center gap-3'>
          <Link
            to='/'
            className='text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded'
          >
            ← Presentation
          </Link>
          <span className='text-gray-300 select-none'>|</span>
          <h1 className='text-gray-700 font-semibold text-sm'>Slide Editor</h1>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setPreviewOpen((v) => !v)}
            className='text-sm text-gray-500 hover:text-gray-800 px-2 py-1 rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500'
            aria-pressed={previewOpen}
          >
            {previewOpen ? 'Hide Preview' : 'Show Preview'}
          </button>

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            id='import-file-input'
            type='file'
            accept='.json,application/json'
            onChange={handleImport}
            className='hidden'
            aria-label='Import slides JSON file'
          />
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            className='px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500'
          >
            Import JSON
          </button>
          <button
            type='button'
            onClick={exportData}
            className='px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-200'
          >
            Export JSON
          </button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className='flex flex-1 overflow-hidden min-h-0'>
        {/* ── Slide list sidebar ── */}
        <aside
          className='w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto'
          aria-label='Slide list'
        >
          <div className='p-3 border-b border-gray-100'>
            <button
              type='button'
              onClick={handleAddSlide}
              className='w-full text-sm py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-200'
              aria-label='Add a new slide after the current one'
            >
              + Add Slide
            </button>
          </div>

          <ul role='list' className='flex-1 p-2 space-y-1'>
            {data.slides.map((slide, idx) => (
              <li key={slide.id}>
                <div
                  className={`group flex items-center gap-1 rounded px-2 py-1.5 cursor-pointer transition-colors ${
                    slide.id === selectedId
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => setSelectedId(slide.id)}
                  role='button'
                  tabIndex={0}
                  aria-selected={slide.id === selectedId}
                  aria-label={`Select slide ${idx + 1}: ${slide.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(slide.id);
                    }
                  }}
                >
                  <span className='text-xs text-gray-400 font-mono w-5 shrink-0 text-center'>
                    {idx + 1}
                  </span>
                  <span className='flex-1 text-xs text-gray-700 truncate'>
                    {slide.title || 'Untitled'}
                  </span>

                  {/* Reorder buttons */}
                  <div className='flex flex-col opacity-0 group-hover:opacity-100 transition-opacity'>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlide(slide.id, 'up');
                      }}
                      disabled={idx === 0}
                      className='w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed text-xs rounded transition-colors'
                      aria-label={`Move slide ${idx + 1} up`}
                    >
                      ▲
                    </button>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSlide(slide.id, 'down');
                      }}
                      disabled={idx === data.slides.length - 1}
                      className='w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed text-xs rounded transition-colors'
                      aria-label={`Move slide ${idx + 1} down`}
                    >
                      ▼
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSlide(slide.id);
                    }}
                    className='opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded text-xs transition-all ml-0.5'
                    aria-label={`Remove slide ${idx + 1}`}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Editor column ── */}
        <div className='flex-1 overflow-y-auto p-6 min-w-0'>
          {selectedSlide ? (
            <div className='max-w-2xl'>
              <SlideEditor slide={selectedSlide} />
            </div>
          ) : (
            <div className='flex items-center justify-center h-full text-gray-400'>
              Select a slide to edit
            </div>
          )}
        </div>

        {/* ── Live preview column ── */}
        {previewOpen && selectedSlide && (
          <aside
            className='w-96 shrink-0 border-l border-gray-200 bg-slate-900 overflow-y-auto flex flex-col'
            aria-label='Live preview'
          >
            <div className='px-4 py-2 border-b border-slate-700 shrink-0'>
              <p className='text-xs text-slate-400 uppercase tracking-wider font-medium'>
                Preview
              </p>
            </div>
            <div className='flex-1 p-6 space-y-5'>
              {selectedSlide.blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} dark />
              ))}
              {selectedSlide.blocks.length === 0 && (
                <p className='text-slate-600 text-sm italic text-center mt-8'>
                  No blocks yet
                </p>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
