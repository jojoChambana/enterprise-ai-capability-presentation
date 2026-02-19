import { useRef, useCallback } from 'react';

/**
 * Returns `onTouchStart` / `onTouchEnd` React event handlers that detect
 * horizontal swipe gestures.  The gesture only fires when the horizontal
 * displacement exceeds `threshold` AND dominates the vertical displacement,
 * so normal vertical scrolling is never interrupted.
 */
export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 48,
): {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
} {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent): void => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent): void => {
      if (startX.current === null || startY.current === null) return;
      const dx = startX.current - e.changedTouches[0].clientX;
      const dy = Math.abs(startY.current - e.changedTouches[0].clientY);
      if (Math.abs(dx) > threshold && Math.abs(dx) > dy) {
        if (dx > 0) onSwipeLeft();
        else onSwipeRight();
      }
      startX.current = null;
      startY.current = null;
    },
    [onSwipeLeft, onSwipeRight, threshold],
  );

  return { onTouchStart, onTouchEnd };
}
