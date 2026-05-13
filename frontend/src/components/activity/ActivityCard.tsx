'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Activity, Photo } from '@/lib/types';
import { useCategories } from '@/hooks/useCategories';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Lightbox } from '@/components/ui/Lightbox';
import { Icon } from '@/components/ui/Icon';

interface ActivityCardProps {
  activity: Activity;
}

function PhotoCarousel({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  const urls = photos.map((p) => p.signedUrl);

  return (
    <>
    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[index].signedUrl}
        alt=""
        onClick={() => setLightboxIndex(index)}
        className="h-full w-full cursor-zoom-in object-cover transition-opacity duration-200"
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
            <Icon name="chevron-left" size={16} strokeWidth={2.5} stroke="white" style={{ mixBlendMode: 'difference' }} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Next photo"
          >
            <Icon name="chevron-right" size={16} strokeWidth={2.5} stroke="white" style={{ mixBlendMode: 'difference' }} />
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

    {lightboxIndex !== null && (
      <Lightbox
        images={urls}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    )}
    </>
  );
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: photos = [] } = useQuery({
    queryKey: ['photos', activity.id],
    queryFn: async () => {
      const { data } = await api.get<Photo[]>(`/activities/${activity.id}/photos`);
      return data;
    },
  });

  const deleteActivity = useMutation({
    mutationFn: () => api.delete(`/activities/${activity.id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openMenu = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.top + window.scrollY,
      left: rect.right + 4,
    });
    setMenuOpen((o) => !o);
  };

  // const category = categories.find((c) => c.id === activity.categoryId);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
          {activity.title.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{activity.title ?? 'Unknown'}</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">{formatDate(activity.date)}</p>
        </div>

        {/* Context menu trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={openMenu}
          className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          aria-label="More options"
        >
          <Icon name="dots-vertical" size={15} />
        </button>

        {/* Context menu portal */}
        {menuOpen && typeof document !== 'undefined' && createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed z-50 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                router.push(`/activities/${activity.id}/edit`);
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              <Icon name="edit" size={14} />
              Edit
            </button>
            <div className="mx-3 border-t border-neutral-100 dark:border-neutral-600" />
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <Icon name="trash" size={14} />
              Delete
            </button>
          </div>,
          document.body
        )}
      </div>

      {/* Photos */}
      {photos.length > 0 && <PhotoCarousel photos={photos} />}

      {/* Body */}
      <div className="px-5 py-4">
        {activity.note && (
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{activity.note}</p>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete activity"
        description="This action cannot be undone. The activity will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          setConfirmOpen(false);
          deleteActivity.mutate();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}
