'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { ActivityFeed } from '@/components/activity/ActivityFeed';

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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-neutral-100 dark:border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <Sidebar selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />

      <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
        <div className="mx-auto max-w-xl px-4 py-8">
          <ActivityFeed categoryId={selectedCategoryId} />
        </div>
      </main>
    </div>
  );
}
