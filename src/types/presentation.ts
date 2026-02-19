/** All supported content block types for a slide. */
export type BlockType = 'heading' | 'bullets' | 'code' | 'image' | 'embed' | 'paragraph';

/** Valid heading levels. */
export type HeadingLevel = 1 | 2 | 3;

/**
 * A single content block within a slide.
 * Different block types use different subsets of the optional fields.
 */
export interface SlideContentBlock {
  id: string;
  type: BlockType;
  // heading
  level?: HeadingLevel;
  text?: string;
  // bullets
  items?: string[];
  // code
  language?: string;
  code?: string;
  // image
  src?: string;
  alt?: string;
  caption?: string;
  // embed
  url?: string;
  // paragraph
  content?: string;
}

/**
 * A single slide in the presentation.
 */
export interface Slide {
  id: string;
  title: string;
  speakerNotes?: string;
  blocks: SlideContentBlock[];
}

/**
 * The complete presentation data structure — top-level shape of slides.json.
 */
export interface PresentationData {
  title: string;
  author: string;
  date: string;
  slides: Slide[];
}

/**
 * Shape of the value provided by PresentationContext.
 */
export interface PresentationContextValue {
  data: PresentationData;
  /** Add a new blank slide. Returns the new slide's ID. */
  addSlide: (afterIndex?: number) => string;
  /** Remove the slide with the given ID. */
  removeSlide: (slideId: string) => void;
  /** Move a slide one position up or down in the deck. */
  moveSlide: (slideId: string, direction: 'up' | 'down') => void;
  /** Partially update slide-level fields (title, speakerNotes). */
  updateSlide: (slideId: string, updates: Partial<Pick<Slide, 'title' | 'speakerNotes'>>) => void;
  /** Add a new block of the given type to a slide. Returns the new block's ID. */
  addBlock: (slideId: string, type: BlockType, afterIndex?: number) => string;
  /** Remove a block from a slide. */
  removeBlock: (slideId: string, blockId: string) => void;
  /** Move a block one position up or down within its slide. */
  moveBlock: (slideId: string, blockId: string, direction: 'up' | 'down') => void;
  /** Partially update a block's content fields (excludes id and type). */
  updateBlock: (
    slideId: string,
    blockId: string,
    updates: Partial<Omit<SlideContentBlock, 'id' | 'type'>>,
  ) => void;
  /** Replace the entire presentation state with new data (used by import). */
  importData: (data: PresentationData) => void;
  /** Trigger a browser download of the current state as slides.json. */
  exportData: () => void;
}
