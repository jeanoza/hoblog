'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { Spinner } from '@/components/ui/Spinner';
import { Icon } from '@/components/ui/Icon';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, initialized, fetchMe } = useAuthStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 md:hidden dark:border-neutral-800 dark:bg-neutral-950">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label="Open menu"
          >
            <Icon name="menu" size={22} />
          </button>
          <h1 className="truncate text-base font-bold text-neutral-900 dark:text-neutral-100">Hoblog</h1>
          <ThemeToggle className="shrink-0" />
        </header>

        <main className="relative min-h-0 flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
          <div className="mx-auto max-w-xl px-4 py-8">
            <ActivityFeed categoryId={selectedCategoryId} />
          </div>

          <button
            type="button"
            onClick={() => router.push('/activities/new')}
            className="fixed right-4 bottom-4 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 shadow-lg transition hover:bg-neutral-700 md:right-8 md:bottom-8 dark:bg-neutral-100 dark:hover:bg-neutral-200"
            aria-label="New activity"
          >
            <Icon name="plus" size={22} strokeWidth={2.5} stroke="white" className="dark:stroke-neutral-900" />
          </button>
        </main>
      </div>
    </div>
  );
}
