'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { Spinner } from '@/components/ui/Spinner';
import { Icon } from '@/components/ui/Icon';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, initialized, fetchMe } = useAuthStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  if (!initialized || isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <Sidebar selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />

      <main className="relative flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
        <div className="mx-auto max-w-xl px-4 py-8">
          <ActivityFeed categoryId={selectedCategoryId} />
        </div>

        {/* FAB */}
        <button
          type="button"
          onClick={() => router.push('/activities/new')}
          className="fixed right-8 bottom-8 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 shadow-lg transition hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-200"
          aria-label="New activity"
        >
          <Icon name="plus" size={22} strokeWidth={2.5} stroke="white" className="dark:stroke-neutral-900" />
        </button>
      </main>
    </div>
  );
}
