import type { ReactElement } from 'react';
import { usePresentationContext } from '../../context/PresentationContext';
import type { SlideContentBlock } from '../../types/presentation';

const LANGUAGES = [
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'python',
  'bash',
  'json',
  'css',
  'markdown',
  'plaintext',
];

export interface BlockEditorProps {
  slideId: string;
  block: SlideContentBlock;
}

const inputCls =
  'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

/**
 * Shared toggle for marking a block as article-only (hidden in slide view).
 */
function ArticleOnlyToggle({
  blockId,
  checked,
  onChange,
}: {
  blockId: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}): ReactElement {
  return (
    <label
      htmlFor={`article-only-${blockId}`}
      className='flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 cursor-pointer group'
    >
      <input
        id={`article-only-${blockId}`}
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
      />
      <span className='text-xs text-gray-500 group-hover:text-gray-700 transition-colors'>
        Article view only
        <span className='text-gray-400 ml-1'>(hidden in slide view)</span>
      </span>
    </label>
  );
}

/**
 * Type-specific inline editor for a single content block.
 * Renders different form controls depending on block.type.
 */
export function BlockEditor({ slideId, block }: BlockEditorProps): ReactElement {
  const { updateBlock } = usePresentationContext();

  const update = (
    updates: Partial<Omit<SlideContentBlock, 'id' | 'type'>>,
  ): void => updateBlock(slideId, block.id, updates);

  /** Shared article-only toggle rendered after each block editor. */
  const articleOnlyToggle = (
    <ArticleOnlyToggle
      blockId={block.id}
      checked={!!block.articleOnly}
      onChange={(value) => update({ articleOnly: value })}
    />
  );

  switch (block.type) {
    case 'heading':
      return (
        <div className='space-y-2'>
          <div>
            <label htmlFor={`level-${block.id}`} className={labelCls}>
              Level
            </label>
            <select
              id={`level-${block.id}`}
              value={block.level ?? 2}
              onChange={(e) =>
                update({ level: Number(e.target.value) as 1 | 2 | 3 })
              }
              className={inputCls}
            >
              <option value={1}>H1 — Title</option>
              <option value={2}>H2 — Section</option>
              <option value={3}>H3 — Subsection</option>
            </select>
          </div>
          <div>
            <label htmlFor={`text-${block.id}`} className={labelCls}>
              Text
            </label>
            <input
              id={`text-${block.id}`}
              type='text'
              value={block.text ?? ''}
              onChange={(e) => update({ text: e.target.value })}
              className={inputCls}
              placeholder='Heading text…'
            />
          </div>
          {articleOnlyToggle}
        </div>
      );

    case 'paragraph':
      return (
        <div>
          <label htmlFor={`content-${block.id}`} className={labelCls}>
            Content
          </label>
          <textarea
            id={`content-${block.id}`}
            value={block.content ?? ''}
            onChange={(e) => update({ content: e.target.value })}
            rows={4}
            className={`${inputCls} resize-y`}
            placeholder='Paragraph text…'
          />
          {articleOnlyToggle}
        </div>
      );

    case 'bullets':
      return (
        <div className='space-y-2'>
          <p className={labelCls}>Bullet Items</p>
          {(block.items ?? []).map((item, idx) => (
            <div key={idx} className='flex items-center gap-2'>
              <input
                type='text'
                value={item}
                onChange={(e) => {
                  const items = [...(block.items ?? [])];
                  items[idx] = e.target.value;
                  update({ items });
                }}
                className={`${inputCls} flex-1`}
                placeholder={`Item ${idx + 1}…`}
                aria-label={`Bullet item ${idx + 1}`}
              />
              <button
                type='button'
                onClick={() => {
                  const items = (block.items ?? []).filter((_, i) => i !== idx);
                  update({ items });
                }}
                className='shrink-0 w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
                aria-label={`Remove item ${idx + 1}`}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type='button'
            onClick={() => update({ items: [...(block.items ?? []), ''] })}
            className='text-xs text-blue-600 hover:text-blue-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded'
          >
            + Add Item
          </button>
          {articleOnlyToggle}
        </div>
      );

    case 'code':
      return (
        <div className='space-y-2'>
          <div>
            <label htmlFor={`lang-${block.id}`} className={labelCls}>
              Language
            </label>
            <select
              id={`lang-${block.id}`}
              value={block.language ?? 'typescript'}
              onChange={(e) => update({ language: e.target.value })}
              className={inputCls}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`code-${block.id}`} className={labelCls}>
              Code
            </label>
            <textarea
              id={`code-${block.id}`}
              value={block.code ?? ''}
              onChange={(e) => update({ code: e.target.value })}
              rows={8}
              className={`${inputCls} font-mono text-xs resize-y`}
              placeholder='Enter code here…'
              spellCheck={false}
              autoComplete='off'
              autoCorrect='off'
            />
          </div>
          {articleOnlyToggle}
        </div>
      );

    case 'image':
      return (
        <div className='space-y-2'>
          <div>
            <label htmlFor={`src-${block.id}`} className={labelCls}>
              Image URL
            </label>
            <input
              id={`src-${block.id}`}
              type='url'
              value={block.src ?? ''}
              onChange={(e) => update({ src: e.target.value })}
              className={inputCls}
              placeholder='https://…'
            />
          </div>
          <div>
            <label htmlFor={`alt-${block.id}`} className={labelCls}>
              Alt Text
            </label>
            <input
              id={`alt-${block.id}`}
              type='text'
              value={block.alt ?? ''}
              onChange={(e) => update({ alt: e.target.value })}
              className={inputCls}
              placeholder='Describe the image for screen readers…'
            />
          </div>
          <div>
            <label htmlFor={`caption-${block.id}`} className={labelCls}>
              Caption (optional)
            </label>
            <input
              id={`caption-${block.id}`}
              type='text'
              value={block.caption ?? ''}
              onChange={(e) => update({ caption: e.target.value })}
              className={inputCls}
              placeholder='Image caption…'
            />
          </div>
          {articleOnlyToggle}
        </div>
      );

    case 'embed':
      return (
        <div>
          <label htmlFor={`url-${block.id}`} className={labelCls}>
            Embed URL
          </label>
          <input
            id={`url-${block.id}`}
            type='url'
            value={block.url ?? ''}
            onChange={(e) => update({ url: e.target.value })}
            className={inputCls}
            placeholder='https://…'
          />
          <p className='mt-1 text-xs text-gray-400'>
            Renders as a 16:9 iframe. Use embeddable URLs (YouTube, Figma, etc.).
          </p>
          {articleOnlyToggle}
        </div>
      );

    default:
      return (
        <p className='text-xs text-gray-400 italic'>Unknown block type.</p>
      );
  }
}
