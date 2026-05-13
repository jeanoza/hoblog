'use client';

import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestions = [] } = useQuery({
    queryKey: ['tags', 'search', input],
    queryFn: async () => {
      const { data } = await api.get<string[]>(`/tags/search?q=${encodeURIComponent(input)}`);
      return data;
    },
    enabled: input.trim().length > 0,
    staleTime: 10_000,
  });

  const filtered = suggestions.filter((s) => !tags.includes(s));

  const add = (name: string) => {
    const normalized = name.trim().toLowerCase();
    if (!normalized || tags.includes(normalized)) return;
    onChange([...tags, normalized]);
    setInput('');
  };

  const remove = (name: string) => onChange(tags.filter((t) => t !== name));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      remove(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Tags
      </label>

      {/* Input area */}
      <div
        className="flex min-h-[46px] cursor-text flex-wrap gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 transition focus-within:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-within:border-neutral-400"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-0.5 text-sm font-medium text-indigo-500 dark:text-indigo-400"
          >
            #{tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="text-indigo-300 hover:text-indigo-500 dark:text-indigo-600 dark:hover:text-indigo-400"
              aria-label={`Remove ${tag}`}
            >
              <Icon name="x" size={11} />
            </button>
          </span>
        ))}

        {/* Text input + dropdown wrapper */}
        <div className="relative min-w-[120px] flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={tags.length === 0 ? 'Add tags…' : ''}
            className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
          />

          {open && filtered.length > 0 && (
            <ul className="absolute left-0 top-full z-20 mt-1 max-h-48 w-52 overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
              {filtered.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={() => add(s)}
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-1 text-xs text-neutral-400">Enter or comma to add a new tag</p>
    </div>
  );
}
