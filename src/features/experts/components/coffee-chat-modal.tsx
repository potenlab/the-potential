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
 * Coffee Chat Modal Component
 *
 * Simpler modal for requesting a casual conversation with an expert.
 * Uses react-hook-form with zod validation.
 *
 * Features:
 * - Topic/purpose of the chat (required)
 * - Brief message (optional, 500 char max)
 * - Preferred meeting format (video call, phone, in-person)
 * - Preferred time slots (morning, afternoon, evening)
 * - Shows loading state during submission
 * - Shows success message on complete
 * - Closes modal after success
 * - Creates request with type 'coffee_chat'
 */

export interface CoffeeChatModalProps {
  /** The expert receiving the coffee chat request */
  expert: ExpertWithProfile;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal open state changes */
  onOpenChange: (open: boolean) => void;
}

// Form data interface
interface CoffeeChatFormData {
  topic: string;
  message?: string;
  meetingFormat: 'video_call' | 'phone' | 'in_person';
  preferredTime: 'morning' | 'afternoon' | 'evening';
}

export function CoffeeChatModal({
  expert,
  open,
  onOpenChange,
}: CoffeeChatModalProps) {
  const t = useTranslations('experts.coffeeChat');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const [isSuccess, setIsSuccess] = React.useState(false);

  const createCollaboration = useCreateCollaborationRequest();

  // Create validation schema with translated messages
  const coffeeChatSchema = React.useMemo(
    () =>
      z.object({
        topic: z
          .string()
          .min(1, tValidation('required'))
          .max(200, tValidation('maxLength', { max: 200 })),
        message: z
          .string()
          .max(500, tValidation('maxLength', { max: 500 }))
          .optional()
          .or(z.literal('')),
        meetingFormat: z.enum(['video_call', 'phone', 'in_person'] as const),
        preferredTime: z.enum(['morning', 'afternoon', 'evening'] as const),
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
  } = useForm<CoffeeChatFormData>({
    resolver: zodResolver(coffeeChatSchema),
    defaultValues: {
      topic: '',
      message: '',
      meetingFormat: 'video_call',
      preferredTime: 'afternoon',
    },
  });

  const meetingFormat = watch('meetingFormat');
  const preferredTime = watch('preferredTime');

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

  const onSubmit: SubmitHandler<CoffeeChatFormData> = async (data) => {
    try {
      // Build message with all form data
      const message = [
        data.message || '',
        '',
        `Meeting format: ${data.meetingFormat.replace('_', ' ')}`,
        `Preferred time: ${data.preferredTime}`,
      ]
        .filter(Boolean)
        .join('\n');

      await createCollaboration.mutateAsync({
        expert_profile_id: expert.id,
        recipient_id: expert.user_id,
        type: 'coffee_chat',
        subject: data.topic,
        message: message,
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
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
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

            {/* Topic */}
            <Input
              label={t('topic')}
              placeholder={t('topicPlaceholder')}
              error={errors.topic?.message}
              {...register('topic')}
            />

            {/* Brief Message (Optional) */}
            <Textarea
              label={`${t('message')} (${tCommon('optional')})`}
              placeholder={t('messagePlaceholder')}
              error={errors.message?.message}
              className="min-h-[100px]"
              {...register('message')}
            />

            {/* Meeting Format */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                {t('meetingFormat')}
              </label>
              <Select
                value={meetingFormat}
                onValueChange={(value) =>
                  setValue(
                    'meetingFormat',
                    value as 'video_call' | 'phone' | 'in_person'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video_call">
                    {t('formatOptions.videoCall')}
                  </SelectItem>
                  <SelectItem value="phone">
                    {t('formatOptions.phone')}
                  </SelectItem>
                  <SelectItem value="in_person">
                    {t('formatOptions.inPerson')}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.meetingFormat && (
                <p className="text-sm font-medium text-[#FF453A]">
                  {errors.meetingFormat.message}
                </p>
              )}
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                {t('preferredTime')}
              </label>
              <Select
                value={preferredTime}
                onValueChange={(value) =>
                  setValue(
                    'preferredTime',
                    value as 'morning' | 'afternoon' | 'evening'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">
                    {t('timeOptions.morning')}
                  </SelectItem>
                  <SelectItem value="afternoon">
                    {t('timeOptions.afternoon')}
                  </SelectItem>
                  <SelectItem value="evening">
                    {t('timeOptions.evening')}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.preferredTime && (
                <p className="text-sm font-medium text-[#FF453A]">
                  {errors.preferredTime.message}
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
