'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';
import { FormInput } from '@/components/ui/FormInput';
import { SelectInput } from '@/components/ui/SelectInput';
import { DateInput } from '@/components/ui/DateInput';
import { FormTextarea } from '@/components/ui/FormTextarea';
import { PhotoPicker, type PhotoItem } from '@/components/ui/PhotoPicker';

interface PhotoPreview {
  file: File;
  previewUrl: string;
}

interface UploadUrlResponse {
  uploadUrl: string;
  destination: string;
  publicUrl: string;
}

async function uploadPhoto(activityId: number, photo: PhotoPreview, order: number): Promise<void> {
  const { data } = await api.post<UploadUrlResponse>(
    `/activities/${activityId}/photos/upload-url`,
    { contentType: photo.file.type }
  );
  await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': photo.file.type },
    body: photo.file,
  });
  await api.post(`/activities/${activityId}/photos`, { url: data.publicUrl, order });
}

export default function NewActivityPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [error, setError] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories');
      return data;
    },
    staleTime: Infinity,
  });

  const submit = useMutation({
    mutationFn: async () => {
      const { data: activity } = await api.post<{ id: number }>('/activities', {
        title,
        note: note.trim() || null,
        date,
        categoryId,
      });
      await Promise.all(photos.map((p, i) => uploadPhoto(activity.id, p, i)));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
      router.replace('/');
    },
    onError: (e: Error) => {
      setError(e.message || 'Failed to save. Please try again.');
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title is required'); return; }
    if (!categoryId) { setError('Category is required'); return; }
    submit.mutate();
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">New activity</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <FormInput
            label="Title"
            value={title}
            onChange={setTitle}
            placeholder="What did you do?"
            required
          />

          {/* Category + Date */}
          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              label="Category"
              value={categoryId}
              onChange={(v) => setCategoryId(v ? Number(v) : '')}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              required
            />
            <DateInput label="Date" value={date} onChange={setDate} required />
          </div>

          <FormTextarea
            label="Note"
            value={note}
            onChange={setNote}
            placeholder="How was it?"
          />

          <PhotoPicker
            photos={photos.map((p, i): PhotoItem => ({
              key: String(i),
              src: p.previewUrl,
              onRemove: () => removePhoto(i),
            }))}
            onAdd={handleFiles}
          />

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submit.isPending}
              className="flex-1 cursor-pointer rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {submit.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
