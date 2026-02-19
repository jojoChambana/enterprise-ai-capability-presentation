import type { ReactElement } from 'react';
import { usePresentationContext } from '../../context/PresentationContext';
import type { Slide, BlockType } from '../../types/presentation';
import { BlockEditor } from './BlockEditor';

const BLOCK_TYPE_OPTIONS: { type: BlockType; label: string }[] = [
  { type: 'heading', label: 'Heading' },
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'bullets', label: 'Bullet List' },
  { type: 'code', label: 'Code Block' },
  { type: 'image', label: 'Image' },
  { type: 'embed', label: 'Embed' },
];

export interface SlideEditorProps {
  slide: Slide;
}

/**
 * Editor form for a single slide.
 * Handles slide title, speaker notes, and the full block list.
 */
export function SlideEditor({ slide }: SlideEditorProps): ReactElement {
  const { updateSlide, addBlock, removeBlock, moveBlock } =
    usePresentationContext();

  return (
    <div className='space-y-6'>
      {/* ── Slide title ── */}
      <div>
        <label
          htmlFor='slide-title'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Slide Title
        </label>
        <input
          id='slide-title'
          type='text'
          value={slide.title}
          onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
          className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
          placeholder='Slide title…'
        />
      </div>

      {/* ── Speaker notes ── */}
      <div>
        <label
          htmlFor='speaker-notes'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Speaker Notes
          <span className='ml-1 text-xs font-normal text-gray-400'>
            (toggleable in slide view, always visible in article view)
          </span>
        </label>
        <textarea
          id='speaker-notes'
          value={slide.speakerNotes ?? ''}
          onChange={(e) =>
            updateSlide(slide.id, { speakerNotes: e.target.value })
          }
          rows={3}
          className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-white'
          placeholder='Notes for the presenter…'
        />
      </div>

      {/* ── Content blocks ── */}
      <div>
        <h2 className='text-sm font-medium text-gray-700 mb-3'>
          Content Blocks
          <span className='ml-2 text-xs font-normal text-gray-400'>
            ({slide.blocks.length})
          </span>
        </h2>

        {slide.blocks.length === 0 && (
          <p className='text-sm text-gray-400 italic py-4 text-center border border-dashed border-gray-200 rounded-lg'>
            No blocks yet. Add one below.
          </p>
        )}

        <div className='space-y-3'>
          {slide.blocks.map((block, idx) => (
            <div
              key={block.id}
              className='border border-gray-200 rounded-lg bg-white shadow-sm'
            >
              {/* Block header */}
              <div className='flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg'>
                <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  {block.type}
                </span>
                <div className='flex items-center gap-1'>
                  <button
                    type='button'
                    onClick={() => moveBlock(slide.id, block.id, 'up')}
                    disabled={idx === 0}
                    className='w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed rounded transition-colors text-xs'
                    aria-label={`Move block ${idx + 1} up`}
                  >
                    ▲
                  </button>
                  <button
                    type='button'
                    onClick={() => moveBlock(slide.id, block.id, 'down')}
                    disabled={idx === slide.blocks.length - 1}
                    className='w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed rounded transition-colors text-xs'
                    aria-label={`Move block ${idx + 1} down`}
                  >
                    ▼
                  </button>
                  <button
                    type='button'
                    onClick={() => removeBlock(slide.id, block.id)}
                    className='ml-1 px-2 py-0.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors'
                    aria-label={`Remove block ${idx + 1}`}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Block editor */}
              <div className='p-3'>
                <BlockEditor slideId={slide.id} block={block} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add block ── */}
      <div>
        <p className='text-sm font-medium text-gray-700 mb-2'>Add Block</p>
        <div className='flex flex-wrap gap-2'>
          {BLOCK_TYPE_OPTIONS.map(({ type, label }) => (
            <button
              key={type}
              type='button'
              onClick={() => addBlock(slide.id, type)}
              className='text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500'
              aria-label={`Add ${label} block to slide`}
            >
              + {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
