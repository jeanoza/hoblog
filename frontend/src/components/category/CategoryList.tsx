'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCategories, CATEGORIES_QUERY_KEY } from '@/hooks/useCategories';
import { Icon } from '@/components/ui/Icon';

interface CategoryListProps {
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export function CategoryList({ selectedCategoryId, onSelectCategory }: CategoryListProps) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: categories = [] } = useCategories();

  const createCategory = useMutation({
    mutationFn: (name: string) => api.post('/categories', { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      setNewName('');
      setShowInput(false);
    },
  });

  const renameCategory = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      api.patch(`/categories/${id}`, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      setEditingId(null);
      setEditName('');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      setDeleteError(null);
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
    onError: () => {
      setDeleteError('이 카테고리를 사용 중인 기록이 있어 삭제할 수 없습니다.');
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) createCategory.mutate(newName.trim());
  };

  const startEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim() && editingId !== null) {
      renameCategory.mutate({ id: editingId, name: editName.trim() });
    }
  };

  return (
    <>
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

      {deleteError && (
        <p className="mb-2 px-3 text-xs text-red-600 dark:text-red-400">{deleteError}</p>
      )}

      {categories.map((cat) => (
        <div key={cat.id} className="group relative flex items-center">
          {editingId === cat.id ? (
            <form onSubmit={handleRename} className="flex flex-1 items-center gap-1 py-1 pl-1 pr-1">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400"
              />
              <button
                type="submit"
                disabled={renameCategory.isPending}
                aria-label="Confirm rename"
                className="cursor-pointer rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <Icon name="check" size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                aria-label="Cancel rename"
                className="cursor-pointer rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <Icon name="x" size={14} strokeWidth={2.5} />
              </button>
            </form>
          ) : (
            <>
              <button
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-1 cursor-pointer items-center rounded-lg px-3 py-2 text-sm transition ${
                  selectedCategoryId === cat.id
                    ? 'bg-neutral-900 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <span className="mr-2 text-base">{cat.name}</span>
              </button>
              <div className="absolute right-1 hidden items-center group-hover:flex">
                <button
                  onClick={() => startEdit(cat.id, cat.name)}
                  aria-label={`Rename ${cat.name}`}
                  className="cursor-pointer rounded p-1 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                >
                  <Icon name="edit" size={12} />
                </button>
                <button
                  onClick={() => deleteCategory.mutate(cat.id)}
                  disabled={deleteCategory.isPending}
                  aria-label={`Delete ${cat.name}`}
                  className="cursor-pointer rounded p-1 text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
                >
                  <Icon name="trash" size={13} />
                </button>
              </div>
            </>
          )}
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
            <button
              type="submit"
              disabled={createCategory.isPending}
              aria-label="Confirm"
              className="cursor-pointer rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <Icon name="check" size={14} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => { setNewName(''); setShowInput(false); }}
              aria-label="Cancel"
              className="cursor-pointer rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <Icon name="x" size={14} strokeWidth={2.5} />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="mt-1 flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          >
            <Icon name="plus" size={14} strokeWidth={2.5} />
            Add category
          </button>
        )}
      </div>
    </>
  );
}
