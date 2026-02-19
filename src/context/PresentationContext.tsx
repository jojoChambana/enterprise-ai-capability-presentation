import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import type { ReactElement } from 'react';
import type {
  PresentationData,
  PresentationContextValue,
  Slide,
  SlideContentBlock,
  BlockType,
} from '../types/presentation';
import slidesData from '../data/slides.json';

const PresentationContext = createContext<PresentationContextValue | null>(null);

/** Generates a simple unique ID for slides and blocks. */
const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/** Creates a new block with default values for the given type. */
const createDefaultBlock = (type: BlockType): SlideContentBlock => {
  const id = generateId();
  switch (type) {
    case 'heading':
      return { id, type, level: 2, text: '' };
    case 'bullets':
      return { id, type, items: [''] };
    case 'code':
      return { id, type, language: 'typescript', code: '' };
    case 'image':
      return { id, type, src: '', alt: '', caption: '' };
    case 'embed':
      return { id, type, url: '' };
    case 'paragraph':
      return { id, type, content: '' };
  }
};

/**
 * Hook to consume PresentationContext. Throws if used outside PresentationProvider.
 */
export function usePresentationContext(): PresentationContextValue {
  const ctx = useContext(PresentationContext);
  if (!ctx) {
    throw new Error('usePresentationContext must be used within PresentationProvider');
  }
  return ctx;
}

/**
 * Provides presentation data and all CRUD operations to the component tree.
 */
export function PresentationProvider({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  const [data, setData] = useState<PresentationData>(
    slidesData as PresentationData,
  );

  const addSlide = useCallback((afterIndex?: number): string => {
    const newSlide: Slide = {
      id: generateId(),
      title: 'New Slide',
      speakerNotes: '',
      blocks: [{ id: generateId(), type: 'heading', level: 2, text: 'New Slide' }],
    };
    setData((prev) => {
      const slides = [...prev.slides];
      const insertAt = afterIndex !== undefined ? afterIndex + 1 : slides.length;
      slides.splice(insertAt, 0, newSlide);
      return { ...prev, slides };
    });
    return newSlide.id;
  }, []);

  const removeSlide = useCallback((slideId: string): void => {
    setData((prev) => ({
      ...prev,
      slides: prev.slides.filter((s) => s.id !== slideId),
    }));
  }, []);

  const moveSlide = useCallback(
    (slideId: string, direction: 'up' | 'down'): void => {
      setData((prev) => {
        const slides = [...prev.slides];
        const idx = slides.findIndex((s) => s.id === slideId);
        if (idx < 0) return prev;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= slides.length) return prev;
        [slides[idx], slides[targetIdx]] = [slides[targetIdx], slides[idx]];
        return { ...prev, slides };
      });
    },
    [],
  );

  const updateSlide = useCallback(
    (slideId: string, updates: Partial<Pick<Slide, 'title' | 'speakerNotes'>>): void => {
      setData((prev) => ({
        ...prev,
        slides: prev.slides.map((s) =>
          s.id === slideId ? { ...s, ...updates } : s,
        ),
      }));
    },
    [],
  );

  const addBlock = useCallback(
    (slideId: string, type: BlockType, afterIndex?: number): string => {
      const newBlock = createDefaultBlock(type);
      setData((prev) => ({
        ...prev,
        slides: prev.slides.map((s) => {
          if (s.id !== slideId) return s;
          const blocks = [...s.blocks];
          const insertAt = afterIndex !== undefined ? afterIndex + 1 : blocks.length;
          blocks.splice(insertAt, 0, newBlock);
          return { ...s, blocks };
        }),
      }));
      return newBlock.id;
    },
    [],
  );

  const removeBlock = useCallback((slideId: string, blockId: string): void => {
    setData((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id !== slideId
          ? s
          : { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) },
      ),
    }));
  }, []);

  const moveBlock = useCallback(
    (slideId: string, blockId: string, direction: 'up' | 'down'): void => {
      setData((prev) => ({
        ...prev,
        slides: prev.slides.map((s) => {
          if (s.id !== slideId) return s;
          const blocks = [...s.blocks];
          const idx = blocks.findIndex((b) => b.id === blockId);
          if (idx < 0) return s;
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= blocks.length) return s;
          [blocks[idx], blocks[targetIdx]] = [blocks[targetIdx], blocks[idx]];
          return { ...s, blocks };
        }),
      }));
    },
    [],
  );

  const updateBlock = useCallback(
    (
      slideId: string,
      blockId: string,
      updates: Partial<Omit<SlideContentBlock, 'id' | 'type'>>,
    ): void => {
      setData((prev) => ({
        ...prev,
        slides: prev.slides.map((s) =>
          s.id !== slideId
            ? s
            : {
                ...s,
                blocks: s.blocks.map((b) =>
                  b.id !== blockId ? b : { ...b, ...updates },
                ),
              },
        ),
      }));
    },
    [],
  );

  const importData = useCallback((newData: PresentationData): void => {
    setData(newData);
  }, []);

  const exportData = useCallback((): void => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slides.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  const value: PresentationContextValue = {
    data,
    addSlide,
    removeSlide,
    moveSlide,
    updateSlide,
    addBlock,
    removeBlock,
    moveBlock,
    updateBlock,
    importData,
    exportData,
  };

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
}
