'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Activity, Photo } from '@/lib/types';
import { DatePicker } from '@/components/ui/DatePicker';
import { useCategories } from '@/hooks/useCategories';
import { Spinner } from '@/components/ui/Spinner';

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

interface EditFormProps {
  activityId: number;
  initial: Activity;
  initialPhotos: Photo[];
}

function EditForm({ activityId, initial, initialPhotos }: EditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial.title);
  const [note, setNote] = useState(initial.note ?? '');
  const [date, setDate] = useState(initial.date.split('T')[0]);
  const [categoryId, setCategoryId] = useState<number | ''>(initial.categoryId);
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>(initialPhotos);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);
  const [newPhotos, setNewPhotos] = useState<PhotoPreview[]>([]);
  const [error, setError] = useState('');

  const { data: categories = [] } = useCategories();

  const submit = useMutation({
    mutationFn: async () => {
      await api.patch(`/activities/${activityId}`, {
        title,
        note: note.trim() || null,
        date,
        categoryId,
      });

      await Promise.all(
        deletedPhotoIds.map((photoId) =>
          api.delete(`/activities/${activityId}/photos/${photoId}`)
        )
      );

      const nextOrder = existingPhotos.filter((p) => !deletedPhotoIds.includes(p.id)).length;
      await Promise.all(newPhotos.map((p, i) => uploadPhoto(activityId, p, nextOrder + i)));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
      void queryClient.invalidateQueries({ queryKey: ['photos', activityId] });
      router.replace('/');
    },
    onError: (e: Error) => {
      setError(e.message || 'Failed to save. Please try again.');
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const added = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setNewPhotos((prev) => [...prev, ...added]);
  };

  const removeExistingPhoto = (photoId: number) => {
    setDeletedPhotoIds((prev) => [...prev, photoId]);
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
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
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Edit activity</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you do?"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400"
            />
          </div>

          {/* Category + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400"
              >
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Date <span className="text-red-400">*</span>
              </label>
              <DatePicker value={date} onChange={setDate} />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How was it?"
              rows={4}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-400"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Photos
            </label>

            {(existingPhotos.length > 0 || newPhotos.length > 0) && (
              <div className="mb-3 grid grid-cols-4 gap-2">
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.signedUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(photo.id)}
                      className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}

                {newPhotos.map((p, i) => (
                  <div key={`new-${i}`} className="group relative aspect-square overflow-hidden rounded-xl ring-2 ring-neutral-400 ring-offset-1 dark:ring-neutral-500">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.previewUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(i)}
                      className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 px-4 py-10 text-neutral-400 transition hover:border-neutral-400 hover:text-neutral-500 dark:border-neutral-700 dark:text-neutral-500 dark:hover:border-neutral-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-sm">Click or drag photos here</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          </div>

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

export default function EditActivityPage() {
  const params = useParams<{ id: string }>();
  const activityId = Number(params.id);

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      const { data } = await api.get<Activity>(`/activities/${activityId}`);
      return data;
    },
  });

  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['photos', activityId],
    queryFn: async () => {
      const { data } = await api.get<Photo[]>(`/activities/${activityId}/photos`);
      return data;
    },
  });

  if (activityLoading || photosLoading || !activity || !photos) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Spinner />
      </div>
    );
  }

  return <EditForm activityId={activityId} initial={activity} initialPhotos={photos} />;
}
