'use client';

import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';

interface DatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
  className?: string;
}

function toDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string {
  if (!value) return 'Pick a date';
  const d = toDate(value);
  if (!d) return value;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(toDate(value) ?? new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = toDate(value);

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm text-neutral-900 outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-neutral-400">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={value ? '' : 'text-neutral-400'}>{formatDisplay(value)}</span>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <DayPicker
            mode="single"
            selected={selected}
            month={month}
            onMonthChange={setMonth}
            onSelect={(day) => {
              if (day) {
                onChange(toISODate(day));
                setOpen(false);
              }
            }}
            classNames={{
              root: 'text-sm',
              months: 'flex flex-col',
              month: 'space-y-3',
              month_caption: 'flex items-center justify-between px-1 pb-1',
              caption_label: 'text-sm font-semibold text-neutral-900 dark:text-neutral-100',
              nav: 'flex items-center gap-1',
              button_previous: 'cursor-pointer rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition',
              button_next: 'cursor-pointer rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition',
              month_grid: 'w-full border-collapse',
              weekdays: 'flex',
              weekday: 'w-9 text-center text-[11px] font-medium text-neutral-400 dark:text-neutral-500 pb-1',
              weeks: 'flex flex-col gap-0.5',
              week: 'flex',
              day: 'w-9 h-9 text-center',
              day_button: 'w-9 h-9 cursor-pointer rounded-lg text-sm font-normal text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
              selected: '[&>button]:bg-neutral-900 [&>button]:text-white [&>button]:hover:bg-neutral-700 dark:[&>button]:bg-neutral-100 dark:[&>button]:text-neutral-900 dark:[&>button]:hover:bg-neutral-200',
              today: '[&>button]:font-bold [&>button]:text-neutral-900 dark:[&>button]:text-neutral-100',
              outside: '[&>button]:text-neutral-300 dark:[&>button]:text-neutral-600',
              disabled: '[&>button]:opacity-30 [&>button]:cursor-not-allowed',
            }}
          />
        </div>
      )}
    </div>
  );
}
