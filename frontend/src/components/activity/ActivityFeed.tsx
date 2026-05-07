'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Activity } from '@/lib/types';
import { ActivityCard } from './ActivityCard';

interface ActivityFeedProps {
  categoryId: number | null;
}

const PAGE_SIZE = 10;

export function ActivityFeed({ categoryId }: ActivityFeedProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['activities', categoryId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await api.get<Activity[]>('/activities', {
        params: { skip: pageParam, take: PAGE_SIZE, categoryId: categoryId ?? undefined },
      });
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const activities = data?.pages.flat() ?? [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-neutral-400">
        <p className="text-4xl">📝</p>
        <p className="text-sm">No activities yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
      <div ref={loaderRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
        )}
      </div>
    </div>
  );
}
