'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Activity, Photo, Tag } from '@/lib/types';
import { FormInput } from '@/components/ui/FormInput';
import { SelectInput } from '@/components/ui/SelectInput';
import { DateInput } from '@/components/ui/DateInput';
import { FormTextarea } from '@/components/ui/FormTextarea';
import { PhotoPicker, type PhotoItem } from '@/components/ui/PhotoPicker';
import { TagInput } from '@/components/tag/TagInput';
import { useCategories } from '@/hooks/useCategories';
import { Spinner } from '@/components/ui/Spinner';
import { Icon } from '@/components/ui/Icon';

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
  initialTags: string[];
}

function EditForm({ activityId, initial, initialPhotos, initialTags }: EditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(initial.title);
  const [note, setNote] = useState(initial.note ?? '');
  const [date, setDate] = useState(initial.date.split('T')[0]);
  const [categoryId, setCategoryId] = useState<number | ''>(initial.categoryId);
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>(initialPhotos);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);
  const [newPhotos, setNewPhotos] = useState<PhotoPreview[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags);
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

      // tag diff: add new, remove deleted
      const toAdd = tags.filter((t) => !initialTags.includes(t));
      const toRemove = initialTags.filter((t) => !tags.includes(t));

      const { data: activityTags } = await api.get<Tag[]>(`/activities/${activityId}/tags`);
      const tagIdByName = Object.fromEntries(activityTags.map((t) => [t.name, t.id]));

      await Promise.all([
        ...toAdd.map((name) => api.post(`/activities/${activityId}/tags`, { name })),
        ...toRemove
          .filter((name) => tagIdByName[name] !== undefined)
          .map((name) => api.delete(`/activities/${activityId}/tags/${tagIdByName[name]}`)),
      ]);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
      void queryClient.invalidateQueries({ queryKey: ['photos', activityId] });
      void queryClient.invalidateQueries({ queryKey: ['tags', 'activity', activityId] });
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
            <Icon name="arrow-left" size={18} />
          </button>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Edit activity</h1>
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

          <TagInput tags={tags} onChange={setTags} />

          <PhotoPicker
            photos={[
              ...existingPhotos.map((photo): PhotoItem => ({
                key: `existing-${photo.id}`,
                src: photo.signedUrl,
                onRemove: () => removeExistingPhoto(photo.id),
              })),
              ...newPhotos.map((p, i): PhotoItem => ({
                key: `new-${i}`,
                src: p.previewUrl,
                onRemove: () => removeNewPhoto(i),
                isNew: true,
              })),
            ]}
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

  const { data: tagData, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags', 'activity', activityId],
    queryFn: async () => {
      const { data } = await api.get<Tag[]>(`/activities/${activityId}/tags`);
      return data;
    },
  });

  if (activityLoading || photosLoading || tagsLoading || !activity || !photos || !tagData) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Spinner />
      </div>
    );
  }

  return (
    <EditForm
      activityId={activityId}
      initial={activity}
      initialPhotos={photos}
      initialTags={tagData.map((t) => t.name)}
    />
  );
}
