interface SpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClass = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
} as const;

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-neutral-100 dark:border-t-transparent ${sizeClass[size]} ${className}`}
    />
  );
}
