'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/Icon';

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const prev = useCallback(() => {
    onIndexChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onIndexChange]);

  const next = useCallback(() => {
    onIndexChange((index + 1) % images.length);
  }, [index, images.length, onIndexChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 cursor-pointer rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <Icon name="x" size={22} />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
          {index + 1} / {images.length}
        </div>
      )}

      {/* Image */}
      <div
        className="h-[80vh] w-[80vw] overflow-hidden rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt=""
          className="h-full w-full object-contain"
        />
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Previous photo"
          >
            <Icon name="chevron-left" size={24} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Next photo"
          >
            <Icon name="chevron-right" size={24} />
          </button>
        </>
      )}
    </div>,
    document.body
  );
}
