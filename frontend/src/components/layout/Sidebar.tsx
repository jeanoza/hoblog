'use client';

import { useAuthStore } from '@/store/auth.store';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { CategoryList } from '@/components/category/CategoryList';
import { Icon } from '@/components/ui/Icon';

interface SidebarProps {
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ selectedCategoryId, onSelectCategory, open, onClose }: SidebarProps) {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleSelectCategory = (id: number | null) => {
    onSelectCategory(id);
    onClose();
  };

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-40 flex h-screen w-68 max-w-[min(17rem,85vw)] flex-col border-r border-neutral-200 bg-white transition-transform duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-950',
        'md:static md:z-auto md:max-w-none md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2 border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Hoblog</h1>
          {user && <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">{user.name}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 md:hidden dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label="Close menu"
          >
            <Icon name="x" size={20} />
          </button>
          <div className="hidden md:contents">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <CategoryList
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
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
