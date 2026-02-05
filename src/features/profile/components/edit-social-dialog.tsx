'use client';

/**
 * Edit Social Links Dialog Component
 *
 * Dialog for editing social links and website in the user profile.
 * Uses:
 * - Form, Input from @/components/ui/
 * - react-hook-form for form handling
 * - zod for validation
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, Linkedin, Twitter, Github } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Validation schema
const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''))
  .nullable();

const socialFormSchema = z.object({
  website: urlSchema,
  linkedin: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) =>
        !val ||
        val === '' ||
        val.includes('linkedin.com') ||
        !val.includes('http'),
      'Please enter a valid LinkedIn URL or username'
    ),
  twitter: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) =>
        !val ||
        val === '' ||
        val.startsWith('@') ||
        val.includes('twitter.com') ||
        val.includes('x.com') ||
        !val.includes('http'),
      'Please enter a valid Twitter handle or URL'
    ),
  github: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) =>
        !val ||
        val === '' ||
        val.includes('github.com') ||
        !val.includes('http'),
      'Please enter a valid GitHub URL or username'
    ),
});

type SocialFormValues = z.infer<typeof socialFormSchema>;

interface SocialLinks {
  website?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  github?: string | null;
}

interface EditSocialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentValues: SocialLinks;
  profileId: string;
  onSuccess: (updatedValues: SocialLinks) => void;
  isLoading?: boolean;
}

export function EditSocialDialog({
  open,
  onOpenChange,
  currentValues,
  profileId,
  onSuccess,
  isLoading,
}: EditSocialDialogProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');

  const form = useForm<SocialFormValues>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: {
      website: currentValues.website || '',
      linkedin: currentValues.linkedin || '',
      twitter: currentValues.twitter || '',
      github: currentValues.github || '',
    },
  });

  // Reset form when dialog opens with current values
  React.useEffect(() => {
    if (open) {
      form.reset({
        website: currentValues.website || '',
        linkedin: currentValues.linkedin || '',
        twitter: currentValues.twitter || '',
        github: currentValues.github || '',
      });
    }
  }, [open, currentValues, form]);

  const onSubmit = async (values: SocialFormValues) => {
    try {
      // Note: In a real implementation, these would be stored in a profile_metadata
      // table or as JSONB columns. For now, we'll just call onSuccess with the values.
      // The parent component can handle storage.

      const updatedValues: SocialLinks = {
        website: values.website || null,
        linkedin: values.linkedin || null,
        twitter: values.twitter || null,
        github: values.github || null,
      };

      onSuccess(updatedValues);
      onOpenChange(false);
      toast.success(t('updateSuccess'));
    } catch (error) {
      console.error('Error updating social links:', error);
      toast.error(t('updateFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Social & Links
          </DialogTitle>
          <DialogDescription>
            Add your social profiles and website to help others connect with you.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {/* Field 1: Website */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-20" />
              <Skeleton variant="lighter" className="h-10 w-full rounded-xl" />
            </div>

            {/* Field 2: LinkedIn */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-20" />
              <Skeleton variant="lighter" className="h-10 w-full rounded-xl" />
              <Skeleton variant="lighter" className="h-3 w-40" />
            </div>

            {/* Field 3: Twitter */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-16" />
              <Skeleton variant="lighter" className="h-10 w-full rounded-xl" />
              <Skeleton variant="lighter" className="h-3 w-36" />
            </div>

            {/* Field 4: GitHub */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-16" />
              <Skeleton variant="lighter" className="h-10 w-full rounded-xl" />
              <Skeleton variant="lighter" className="h-3 w-40" />
            </div>

            {/* Footer skeleton */}
            <div className="flex justify-end gap-2">
              <Skeleton variant="lighter" className="h-10 w-20" />
              <Skeleton variant="lighter" className="h-10 w-20" />
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.website')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://yourwebsite.com"
                        leftIcon={<Globe className="h-4 w-4" />}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.linkedin')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="linkedin.com/in/username"
                        leftIcon={<Linkedin className="h-4 w-4" />}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted">
                      Full URL or just your username
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.twitter')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@username"
                        leftIcon={<Twitter className="h-4 w-4" />}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted">
                      Your Twitter/X handle
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.github')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="github.com/username"
                        leftIcon={<Github className="h-4 w-4" />}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted">
                      Full URL or just your username
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={form.formState.isSubmitting}
                >
                  {tCommon('save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
