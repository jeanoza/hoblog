import type { Tag } from '@/lib/types';

interface TagListProps {
  tags: Tag[];
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5 py-2 px-5">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="text-sm font-medium text-indigo-500 dark:text-indigo-400"
        >
          #{tag.name}
        </span>
      ))}
    </div>
  );
}
