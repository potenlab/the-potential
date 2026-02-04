'use client';

/**
 * PostComposer Component
 *
 * A composer for creating new posts in the Thread feed.
 * Features:
 * - Text input with 5000 character limit
 * - Character count indicator
 * - Image upload with preview
 * - Empty submit disabled
 * - Uses translations from thread.compose namespace
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePost } from '../api/queries';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Constants
const MAX_CHARACTER_COUNT = 5000;
const MAX_IMAGES = 4;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;

interface ImagePreview {
  file: File;
  url: string;
}

export function PostComposer() {
  const t = useTranslations('thread.compose');
  const [content, setContent] = React.useState('');
  const [images, setImages] = React.useState<ImagePreview[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const createPost = useCreatePost();

  // Character count calculations
  const characterCount = content.length;
  const isOverLimit = characterCount > MAX_CHARACTER_COUNT;
  const isNearLimit = characterCount > MAX_CHARACTER_COUNT * 0.9;
  const isEmpty = content.trim().length === 0 && images.length === 0;
  const canSubmit = !isEmpty && !isOverLimit && !createPost.isPending && !isUploading;

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImagePreview[] = [];

    for (const file of Array.from(files)) {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max ${MAX_IMAGE_SIZE_MB}MB)`);
        continue;
      }

      // Check image limit
      if (images.length + newImages.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        break;
      }

      const url = URL.createObjectURL(file);
      newImages.push({ file, url });
    }

    setImages((prev) => [...prev, ...newImages]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      // Revoke the object URL to free memory
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Upload images to Supabase Storage
  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, image.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('post-media').getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    try {
      setIsUploading(true);

      // Upload images first
      const mediaUrls = await uploadImages();

      // Create the post
      await createPost.mutateAsync({
        content: content.trim(),
        media_urls: mediaUrls,
      });

      // Clear form on success
      setContent('');
      images.forEach((img) => URL.revokeObjectURL(img.url));
      setImages([]);

      // Show success toast
      toast.success(t('success'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('failed');
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Textarea */}
      <div className="relative">
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder={t('placeholder')}
          className={cn(
            'min-h-[120px] resize-none pr-4 pb-8',
            isOverLimit && 'border-error focus:border-error focus:ring-error'
          )}
          aria-label={t('placeholder')}
          aria-describedby="character-count"
        />

        {/* Character count indicator */}
        <div
          id="character-count"
          className={cn(
            'absolute bottom-3 right-4 text-sm font-medium',
            isOverLimit ? 'text-error' : isNearLimit ? 'text-warning' : 'text-muted'
          )}
          aria-live="polite"
        >
          {t('characterCount', { current: characterCount, max: MAX_CHARACTER_COUNT })}
        </div>
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div
              key={image.url}
              className="relative group rounded-2xl overflow-hidden border border-white/8"
            >
              <Image
                src={image.url}
                alt={`Preview ${index + 1}`}
                width={120}
                height={120}
                className="object-cover w-[120px] h-[120px]"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className={cn(
                  'absolute top-2 right-2 p-1 rounded-full',
                  'bg-black/70 text-white hover:bg-black/90',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary'
                )}
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Image upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            multiple
            onChange={handleImageSelect}
            className="hidden"
            aria-label={t('attachImage')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES || createPost.isPending || isUploading}
            aria-label={t('attachImage')}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>

          {/* Image count indicator */}
          {images.length > 0 && (
            <span className="text-sm text-muted">
              {images.length}/{MAX_IMAGES}
            </span>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary-glow"
          size="md"
          disabled={!canSubmit}
          loading={createPost.isPending || isUploading}
        >
          {createPost.isPending || isUploading ? t('posting') : t('submit')}
        </Button>
      </div>
    </form>
  );
}
