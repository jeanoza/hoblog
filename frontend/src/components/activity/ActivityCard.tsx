'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Activity, Photo } from '@/lib/types';
import { useCategories } from '@/hooks/useCategories';

interface ActivityCardProps {
  activity: Activity;
}

function PhotoCarousel({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[index].signedUrl}
        alt=""
        className="h-full w-full object-cover transition-opacity duration-200"
      />

      {/* Prev / next buttons */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Previous photo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'difference' }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Next photo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'difference' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/25 px-2 py-1 backdrop-blur-sm">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`cursor-pointer rounded-full transition-all duration-200 ${
                  i === index
                    ? 'h-2 w-2 bg-white'
                    : 'h-1.5 w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { data: categories = [] } = useCategories();

  const { data: photos = [] } = useQuery({
    queryKey: ['photos', activity.id],
    queryFn: async () => {
      const { data } = await api.get<Photo[]>(`/activities/${activity.id}/photos`);
      return data;
    },
  });

  const category = categories.find((c) => c.id === activity.categoryId);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
          {category?.name.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{category?.name ?? 'Unknown'}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">{formatDate(activity.date)}</p>
        </div>
      </div>

      {/* Photos */}
      {photos.length > 0 && <PhotoCarousel photos={photos} />}

      {/* Body */}
      <div className="px-5 py-4">
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{activity.title}</p>
        {activity.note && (
          <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{activity.note}</p>
        )}
      </div>
    </article>
  );
}
