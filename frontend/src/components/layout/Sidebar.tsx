'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useCategories, CATEGORIES_QUERY_KEY } from '@/hooks/useCategories';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

interface SidebarProps {
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export function Sidebar({ selectedCategoryId, onSelectCategory }: SidebarProps) {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [newName, setNewName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const { data: categories = [] } = useCategories();

  const createCategory = useMutation({
    mutationFn: (name: string) => api.post('/categories', { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      setNewName('');
      setShowInput(false);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) createCategory.mutate(newName.trim());
  };

  const handleCancel = () => {
    setNewName('');
    setShowInput(false);
  };

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
        <button
          onClick={() => onSelectCategory(null)}
          className={`mb-1 flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
            selectedCategoryId === null
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          All
        </button>

        <div className="mt-3 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Categories
        </div>

        {categories.map((cat) => (
          <div key={cat.id} className="group relative flex items-center">
            <button
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-1 cursor-pointer items-center rounded-lg px-3 py-2 text-sm transition ${
                selectedCategoryId === cat.id
                  ? 'bg-neutral-900 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="mr-2 text-base">
                {cat.name}
              </span>
            </button>
            <button
              onClick={() => deleteCategory.mutate(cat.id)}
              disabled={deleteCategory.isPending}
              className="absolute right-1 hidden cursor-pointer rounded p-1 text-neutral-400 hover:text-red-500 group-hover:flex dark:text-neutral-500 dark:hover:text-red-400"
              aria-label={`Delete ${cat.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        ))}

        <div className="mt-2 px-3">
          {showInput ? (
            <form onSubmit={handleAdd} className="flex items-center gap-1">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                className="flex-1 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400"
              />
              {/* confirm */}
              <button
                type="submit"
                disabled={createCategory.isPending}
                aria-label="Confirm"
                className="cursor-pointer rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              {/* cancel */}
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Cancel"
                className="cursor-pointer rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="mt-1 flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add category
            </button>
          )}
        </div>
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
