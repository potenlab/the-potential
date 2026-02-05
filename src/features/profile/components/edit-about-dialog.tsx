'use client';

/**
 * Edit About Dialog Component
 *
 * Dialog for editing the "About" section of the user profile.
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
import { User, Building2 } from 'lucide-react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';

import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Validation schema
const aboutFormSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  company_name: z
    .string()
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
});

type AboutFormValues = z.infer<typeof aboutFormSchema>;

interface EditAboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onSuccess: (updatedProfile: Partial<Profile>) => void;
  isLoading?: boolean;
}

export function EditAboutDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
  isLoading,
}: EditAboutDialogProps) {
  const t = useTranslations('profile');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutFormSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      company_name: profile.company_name || '',
      bio: '',
    },
  });

  // Reset form when dialog opens with current profile values
  React.useEffect(() => {
    if (open) {
      form.reset({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        bio: '',
      });
    }
  }, [open, profile, form]);

  const onSubmit = async (values: AboutFormValues) => {
    try {
      const updateData: Partial<Profile> = {
        full_name: values.full_name,
        company_name: values.company_name || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      onSuccess(updateData);
      onOpenChange(false);
      toast.success(t('updateSuccess'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('updateFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t('sections.about')}
          </DialogTitle>
          <DialogDescription>
            {t('completenessDescription')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {/* Field 1: Name */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-20" />
              <Skeleton variant="lighter" className="h-10 w-full rounded-xl" />
            </div>

            {/* Field 2: Company */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-28" />
              <Skeleton variant="lighter" className="h-10 w-full rounded-xl" />
            </div>

            {/* Field 3: Bio */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-16" />
              <Skeleton variant="lighter" className="h-[100px] w-full rounded-xl" />
            </div>

            {/* Footer buttons */}
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
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.name')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        leftIcon={<User className="h-4 w-4" />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.company')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your company name"
                        leftIcon={<Building2 className="h-4 w-4" />}
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
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.bio')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
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
