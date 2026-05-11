'use client';

import { useThemeStore } from '@/store/theme.store';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? (
        <span className="text-lg leading-none" aria-hidden>
          ☀️
        </span>
      ) : (
        <span className="text-lg leading-none" aria-hidden>
          🌙
        </span>
      )}
    </button>
  );
}
