'use client';

/**
 * Create Event Modal Component
 *
 * Modal form for creating new events with:
 * - Title (required)
 * - Description
 * - Event type (event, ad, announcement)
 * - Category (optional)
 * - Image upload (with preview)
 * - External URL
 * - Event date (for events)
 * - Location (for events)
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Image as ImageIcon,
  Tag,
  Megaphone,
  X,
  Upload,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import {
  uploadEventImage,
  validateFile,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
} from '@/lib/supabase/storage';

import { useCreateEventMutation, useUpdateEventMutation } from '../api/queries';
import type { EventType, EventCategory, UserEventFormData, UserEventWithAuthor } from '../types';

/**
 * Form validation schema
 */
const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional(),
  event_type: z.enum(['event', 'ad', 'announcement']),
  category: z.string().optional(),
  external_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  event_date: z.string().optional(),
  location: z.string().max(255).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

/**
 * Event type options
 */
const EVENT_TYPE_OPTIONS: Array<{ value: EventType; icon: React.ElementType }> = [
  { value: 'event', icon: Calendar },
  { value: 'ad', icon: Tag },
  { value: 'announcement', icon: Megaphone },
];

/**
 * Category options (same as support programs)
 */
const CATEGORY_OPTIONS: EventCategory[] = [
  'funding',
  'mentoring',
  'education',
  'networking',
  'space',
  'other',
];

/**
 * Image preview state
 */
interface ImagePreview {
  file: File | null;
  url: string;
  isExisting: boolean;
}

/**
 * Props for CreateEventModal
 */
export interface CreateEventModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onOpenChange: (open: boolean) => void;
  /** Event to edit (for edit mode) */
  editEvent?: UserEventWithAuthor | null;
  /** Callback when event is created/updated successfully */
  onSuccess?: () => void;
}

/**
 * Create Event Modal Component
 */
export function CreateEventModal({
  open,
  onOpenChange,
  editEvent,
  onSuccess,
}: CreateEventModalProps) {
  const t = useTranslations('events');
  const tForm = useTranslations('events.form');
  const tTypes = useTranslations('events.types');
  const tCategories = useTranslations('supportPrograms.categories');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const isEditMode = !!editEvent;

  // Mutations
  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation();

  // Image upload state
  const [imagePreview, setImagePreview] = React.useState<ImagePreview | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

  // Form setup
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      event_type: 'event',
      category: '',
      external_url: '',
      event_date: '',
      location: '',
    },
  });

  // Reset form when modal opens/closes or editEvent changes
  React.useEffect(() => {
    if (open) {
      if (editEvent) {
        form.reset({
          title: editEvent.title,
          description: editEvent.description || '',
          event_type: editEvent.event_type,
          category: editEvent.category || '',
          external_url: editEvent.external_url || '',
          event_date: editEvent.event_date
            ? new Date(editEvent.event_date).toISOString().slice(0, 16)
            : '',
          location: editEvent.location || '',
        });
        // Set existing image preview if available
        if (editEvent.image_url) {
          setImagePreview({
            file: null,
            url: editEvent.image_url,
            isExisting: true,
          });
        } else {
          setImagePreview(null);
        }
      } else {
        form.reset({
          title: '',
          description: '',
          event_type: 'event',
          category: '',
          external_url: '',
          event_date: '',
          location: '',
        });
        setImagePreview(null);
      }
    }
  }, [open, editEvent, form]);

  // Cleanup object URL on unmount
  React.useEffect(() => {
    return () => {
      if (imagePreview?.file && !imagePreview.isExisting) {
        URL.revokeObjectURL(imagePreview.url);
      }
    };
  }, [imagePreview]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    // Revoke previous object URL if exists
    if (imagePreview?.file && !imagePreview.isExisting) {
      URL.revokeObjectURL(imagePreview.url);
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setImagePreview({ file, url, isExisting: false });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    if (imagePreview?.file && !imagePreview.isExisting) {
      URL.revokeObjectURL(imagePreview.url);
    }
    setImagePreview(null);
  };

  // Upload image to Supabase Storage
  const uploadImage = async (): Promise<string | undefined> => {
    // If no image or using existing image, return the existing URL
    if (!imagePreview) return undefined;
    if (imagePreview.isExisting) return imagePreview.url;
    if (!imagePreview.file) return undefined;

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Upload to Supabase Storage
    const result = await uploadEventImage(imagePreview.file, user.id);

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload image');
    }

    return result.url;
  };

  // Handle form submission
  const onSubmit = async (values: EventFormValues) => {
    try {
      setIsUploading(true);

      // Get current user for ownership verification
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Defensive check: verify ownership in edit mode
      if (isEditMode && editEvent && editEvent.author_id !== user.id) {
        toast.error('You can only edit your own events');
        console.error('Ownership verification failed: user does not own this event');
        return;
      }

      // Upload image first if there's a new one
      let imageUrl: string | undefined;
      try {
        imageUrl = await uploadImage();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload image';
        toast.error(message);
        return;
      }

      const formData: UserEventFormData = {
        title: values.title,
        description: values.description || undefined,
        event_type: values.event_type,
        category: (values.category as EventCategory) || undefined,
        image_url: imageUrl,
        external_url: values.external_url || undefined,
        event_date: values.event_date || undefined,
        location: values.location || undefined,
      };

      if (isEditMode && editEvent) {
        await updateMutation.mutateAsync({
          id: editEvent.id,
          formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by mutation hook
      console.error('Failed to save event:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const selectedEventType = form.watch('event_type');
  const showEventFields = selectedEventType === 'event';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>
            {isEditMode ? tForm('editTitle') : tForm('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? tForm('editDescription') : tForm('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form
          id="event-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
          style={{ scrollbarGutter: 'stable' }}
        >
          {/* Event Type Selection */}
          <div className="space-y-2">
            <Label>{tForm('eventType')}</Label>
            <div className="flex gap-2">
              {EVENT_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = form.watch('event_type') === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => form.setValue('event_type', option.value)}
                  >
                    <Icon className="h-4 w-4" />
                    {tTypes(option.value)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {tForm('title')} <span className="text-error">*</span>
            </Label>
            <Input
              id="title"
              placeholder={tForm('titlePlaceholder')}
              {...form.register('title')}
              error={form.formState.errors.title ? tValidation('required') : undefined}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{tForm('description')}</Label>
            <Textarea
              id="description"
              placeholder={tForm('descriptionPlaceholder')}
              rows={4}
              {...form.register('description')}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">{tForm('category')}</Label>
            <Select
              value={form.watch('category') || '_none'}
              onValueChange={(value) => form.setValue('category', value === '_none' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={tForm('categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">{tCategories('all')}</SelectItem>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>
                    {tCategories(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event-specific fields */}
          {showEventFields && (
            <>
              {/* Event Date */}
              <div className="space-y-2">
                <Label htmlFor="event_date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {tForm('eventDate')}
                </Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  {...form.register('event_date')}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {tForm('location')}
                </Label>
                <Input
                  id="location"
                  placeholder={tForm('locationPlaceholder')}
                  {...form.register('location')}
                />
              </div>
            </>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {tForm('image')}
            </Label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative rounded-lg overflow-hidden border border-white/10 bg-card-secondary">
                <Image
                  src={imagePreview.url}
                  alt="Event image preview"
                  width={400}
                  height={200}
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={cn(
                    'absolute top-2 right-2 p-1.5 rounded-full',
                    'bg-black/70 text-white hover:bg-black/90',
                    'transition-colors focus:outline-none focus:ring-2 focus:ring-primary'
                  )}
                  aria-label={tForm('removeImage')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Upload Button */}
            {!imagePreview && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 p-6',
                  'border-2 border-dashed border-white/20 rounded-lg',
                  'bg-card-secondary/50 cursor-pointer',
                  'hover:border-primary/50 hover:bg-card-secondary transition-colors'
                )}
              >
                <Upload className="h-8 w-8 text-muted" />
                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    {tForm('uploadImage')}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {tForm('imageHint', { maxSize: MAX_IMAGE_SIZE_MB })}
                  </p>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              onChange={handleImageSelect}
              className="hidden"
              aria-label={tForm('uploadImage')}
            />
          </div>

          {/* External URL */}
          <div className="space-y-2">
            <Label htmlFor="external_url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              {tForm('externalUrl')}
            </Label>
            <Input
              id="external_url"
              type="url"
              placeholder={tForm('externalUrlPlaceholder')}
              {...form.register('external_url')}
              error={form.formState.errors.external_url ? tValidation('url') : undefined}
            />
          </div>

        </form>

        {/* Footer - outside scrollable area */}
        <DialogFooter className="gap-2 px-6 py-4 border-t border-white/10 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form="event-form"
            variant="primary"
            loading={isPending}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {tForm('uploading')}
              </>
            ) : isEditMode ? (
              tCommon('save')
            ) : (
              tCommon('create')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateEventModal;
