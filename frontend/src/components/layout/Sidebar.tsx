'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';
import { useAuthStore } from '@/store/auth.store';
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

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories');
      return data;
    },
  });

  const createCategory = useMutation({
    mutationFn: (name: string) => api.post('/categories', { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewName('');
      setShowInput(false);
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) createCategory.mutate(newName.trim());
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
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
          className={`mb-1 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
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
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition ${
              selectedCategoryId === cat.id
                ? 'bg-neutral-900 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
          >
            <span className="mr-2 text-base">●</span>
            {cat.name}
          </button>
        ))}

        <div className="mt-2 px-3">
          {showInput ? (
            <form onSubmit={handleAdd} className="flex gap-1">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                className="flex-1 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400"
              />
              <button
                type="submit"
                className="rounded-md bg-neutral-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Add
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            >
              <span className="text-lg leading-none">+</span> Add category
            </button>
          )}
        </div>
      </nav>

      <div className="border-t border-neutral-200 px-4 py-4 dark:border-neutral-800">
        <button
          onClick={() => void logout()}
          className="w-full rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
