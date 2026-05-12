'use client';

import { useRef } from 'react';

export interface PhotoItem {
  key: string;
  src: string;
  onRemove: () => void;
  isNew?: boolean;
}

interface PhotoPickerProps {
  photos: PhotoItem[];
  onAdd: (files: FileList | null) => void;
}

function RemoveButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

export function PhotoPicker({ photos, onAdd }: PhotoPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onAdd(e.dataTransfer.files);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Photos
      </label>

      {photos.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.key}
              className={`group relative aspect-square overflow-hidden rounded-xl ${
                photo.isNew
                  ? 'ring-2 ring-neutral-400 ring-offset-1 dark:ring-neutral-500'
                  : ''
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt=""
                className="h-full w-full object-cover"
              />
              <RemoveButton onRemove={photo.onRemove} />
            </div>
          ))}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 px-4 py-10 text-neutral-400 transition hover:border-neutral-400 hover:text-neutral-500 dark:border-neutral-700 dark:text-neutral-500 dark:hover:border-neutral-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="text-sm">Click or drag photos here</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onAdd(e.target.files)}
        />
      </div>
    </div>
  );
}
