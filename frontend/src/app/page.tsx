'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { ActivityFeed } from '@/components/activity/ActivityFeed';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, fetchMe } = useAuthStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />

      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <div className="mx-auto max-w-xl px-4 py-8">
          <ActivityFeed categoryId={selectedCategoryId} />
        </div>
      </main>
    </div>
  );
}
