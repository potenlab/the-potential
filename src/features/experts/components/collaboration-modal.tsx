'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCollaborationRequest } from '../api/queries';
import type { ExpertWithProfile } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

/**
 * Collaboration Modal Component
 *
 * Modal for sending collaboration proposals to experts.
 * Uses react-hook-form with zod validation.
 *
 * Features:
 * - Form validates required fields
 * - Project title (required)
 * - Project description (required, min 50 chars)
 * - Expected timeline
 * - Budget range (optional)
 * - Contact preference (email/phone/messaging)
 * - Shows loading state during submission
 * - Shows success message on complete
 * - Closes modal after success
 */

export interface CollaborationModalProps {
  /** The expert receiving the collaboration request */
  expert: ExpertWithProfile;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal open state changes */
  onOpenChange: (open: boolean) => void;
}

// Form data interface
interface CollaborationFormData {
  projectTitle: string;
  description: string;
  timeline: string;
  budget: string;
  contactPreference: 'email' | 'phone' | 'messaging';
}

export function CollaborationModal({
  expert,
  open,
  onOpenChange,
}: CollaborationModalProps) {
  const t = useTranslations('experts.collaboration');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const [isSuccess, setIsSuccess] = React.useState(false);

  const createCollaboration = useCreateCollaborationRequest();

  // Create validation schema with translated messages
  const collaborationSchema = React.useMemo(
    () =>
      z.object({
        projectTitle: z
          .string()
          .min(1, tValidation('required'))
          .max(200, tValidation('maxLength', { max: 200 })),
        description: z
          .string()
          .min(1, tValidation('required'))
          .min(50, tValidation('minLength', { min: 50 }))
          .max(5000, tValidation('maxLength', { max: 5000 })),
        timeline: z.string().min(1, tValidation('required')),
        budget: z.string(),
        contactPreference: z.enum(['email', 'phone', 'messaging'] as const),
      }),
    [tValidation]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CollaborationFormData>({
    resolver: zodResolver(collaborationSchema),
    defaultValues: {
      projectTitle: '',
      description: '',
      timeline: '',
      budget: '',
      contactPreference: 'email',
    },
  });

  const contactPreference = watch('contactPreference');

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      // Reset after close animation
      const timer = setTimeout(() => {
        reset();
        setIsSuccess(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open, reset]);

  const onSubmit: SubmitHandler<CollaborationFormData> = async (data) => {
    try {
      // Build message with all form data
      const message = [
        data.description,
        '',
        `Timeline: ${data.timeline}`,
        data.budget ? `Budget: ${data.budget}` : '',
        `Preferred contact: ${data.contactPreference}`,
      ]
        .filter(Boolean)
        .join('\n');

      await createCollaboration.mutateAsync({
        expert_profile_id: expert.id,
        recipient_id: expert.user_id,
        type: 'collaboration',
        subject: data.projectTitle,
        message: message,
        contact_info: data.contactPreference,
      });

      setIsSuccess(true);

      // Close modal after showing success message
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch {
      // Error is handled by the mutation
    }
  };

  const expertName = expert.profile?.full_name || expert.business_name;
  const expertInitials = expertName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('subtitle', { name: expertName })}
          </DialogDescription>
        </DialogHeader>

        {/* Expert Info Preview */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <Avatar size="lg">
            <AvatarImage
              src={expert.profile?.avatar_url || undefined}
              alt={expertName || ''}
            />
            <AvatarFallback>{expertInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{expertName}</p>
            <p className="text-sm text-muted truncate">
              {expert.profile?.company_name || expert.business_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" size="sm">
                {expert.category}
              </Badge>
              {expert.is_available && (
                <Badge variant="success" size="sm">
                  {tCommon('verified')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">{t('success')}</p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Message from Mutation */}
            {createCollaboration.error && (
              <div className="p-3 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20">
                <p className="text-sm text-[#FF453A] text-center">
                  {t('failed')}
                </p>
              </div>
            )}

            {/* Project Title */}
            <Input
              label={t('projectTitle')}
              placeholder={t('projectTitlePlaceholder')}
              error={errors.projectTitle?.message}
              {...register('projectTitle')}
            />

            {/* Project Description */}
            <Textarea
              label={t('description')}
              placeholder={t('descriptionPlaceholder')}
              error={errors.description?.message}
              className="min-h-[150px]"
              {...register('description')}
            />

            {/* Timeline */}
            <Input
              label={t('timeline')}
              placeholder={t('timelinePlaceholder')}
              error={errors.timeline?.message}
              {...register('timeline')}
            />

            {/* Budget (Optional) */}
            <Input
              label={`${t('budget')} (${tCommon('optional')})`}
              placeholder={t('budgetPlaceholder')}
              error={errors.budget?.message}
              {...register('budget')}
            />

            {/* Contact Preference */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                {t('contactPreference')}
              </label>
              <Select
                value={contactPreference}
                onValueChange={(value) =>
                  setValue(
                    'contactPreference',
                    value as 'email' | 'phone' | 'messaging'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    {t('contactOptions.email')}
                  </SelectItem>
                  <SelectItem value="phone">
                    {t('contactOptions.phone')}
                  </SelectItem>
                  <SelectItem value="messaging">
                    {t('contactOptions.messaging')}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.contactPreference && (
                <p className="text-sm font-medium text-[#FF453A]">
                  {errors.contactPreference.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createCollaboration.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary-glow"
                loading={createCollaboration.isPending}
              >
                {t('submit')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
