'use client';

import { useAuthStore } from '@/store/auth.store';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { CategoryList } from '@/components/category/CategoryList';

interface SidebarProps {
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export function Sidebar({ selectedCategoryId, onSelectCategory }: SidebarProps) {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="flex h-screen w-68 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start justify-between gap-2 border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Hoblog</h1>
          {user && <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">{user.name}</p>}
        </div>
        <ThemeToggle className="shrink-0" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <CategoryList
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={onSelectCategory}
        />
      </nav>

      <div className="border-t border-neutral-200 px-4 py-4 dark:border-neutral-800">
        <button
          onClick={() => void logout()}
          className="w-full cursor-pointer rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
