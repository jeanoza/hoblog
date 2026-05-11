'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Activity, Category, Photo } from '@/lib/types';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories');
      return data;
    },
    staleTime: Infinity,
  });

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
      {photos.length > 0 && (
        <div className={`grid gap-0.5 ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {photos.slice(0, 4).map((photo, i) => (
            <div key={photo.id} className={`relative ${photos.length === 1 ? 'aspect-[4/3]' : 'aspect-square'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
              {i === 3 && photos.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
                  +{photos.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
