'use client';

/**
 * Edit Expertise Dialog Component
 *
 * Dialog for editing expertise and skills in the user profile.
 * Uses:
 * - Form, Input, Select from @/components/ui/
 * - react-hook-form for form handling
 * - zod for validation
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, Plus, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Validation schema
const expertiseFormSchema = z.object({
  position: z
    .string()
    .max(100, 'Position must be less than 100 characters')
    .optional()
    .nullable(),
  experience_years: z
    .number()
    .min(0, 'Experience years must be 0 or more')
    .max(50, 'Experience years must be less than 50')
    .optional()
    .nullable(),
  skills: z
    .array(z.string())
    .max(10, 'Maximum 10 skills allowed')
    .optional(),
  industry: z.string().optional().nullable(),
});

type ExpertiseFormValues = z.infer<typeof expertiseFormSchema>;

interface ExpertiseData {
  position?: string | null;
  experience_years?: number | null;
  skills?: string[];
  industry?: string | null;
}

interface EditExpertiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentValues: ExpertiseData;
  profileId: string;
  onSuccess: (updatedValues: ExpertiseData) => void;
  isLoading?: boolean;
}

const INDUSTRIES = [
  'technology',
  'healthcare',
  'finance',
  'education',
  'ecommerce',
  'media',
  'manufacturing',
  'consulting',
  'real_estate',
  'food_beverage',
  'other',
] as const;

export function EditExpertiseDialog({
  open,
  onOpenChange,
  currentValues,
  profileId,
  onSuccess,
  isLoading,
}: EditExpertiseDialogProps) {
  const t = useTranslations('profile');
  const tExperts = useTranslations('experts');
  const tCommon = useTranslations('common');

  const [skillInput, setSkillInput] = React.useState('');
  const [skills, setSkills] = React.useState<string[]>(
    currentValues.skills || []
  );

  const form = useForm<ExpertiseFormValues>({
    resolver: zodResolver(expertiseFormSchema),
    defaultValues: {
      position: currentValues.position || '',
      experience_years: currentValues.experience_years || undefined,
      skills: currentValues.skills || [],
      industry: currentValues.industry || '',
    },
  });

  // Reset form when dialog opens with current values
  React.useEffect(() => {
    if (open) {
      setSkills(currentValues.skills || []);
      form.reset({
        position: currentValues.position || '',
        experience_years: currentValues.experience_years || undefined,
        skills: currentValues.skills || [],
        industry: currentValues.industry || '',
      });
    }
  }, [open, currentValues, form]);

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill) && skills.length < 10) {
      const newSkills = [...skills, skill];
      setSkills(newSkills);
      form.setValue('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(newSkills);
    form.setValue('skills', newSkills);
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (values: ExpertiseFormValues) => {
    try {
      // Note: In a real implementation, expertise data might be stored in a separate table
      // or as extended profile fields. For now, we'll call onSuccess with the values.

      const updatedValues: ExpertiseData = {
        position: values.position || null,
        experience_years: values.experience_years || null,
        skills: skills,
        industry: values.industry || null,
      };

      onSuccess(updatedValues);
      onOpenChange(false);
      toast.success(t('updateSuccess'));
    } catch (error) {
      console.error('Error updating expertise:', error);
      toast.error(t('updateFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {t('sections.expertise')}
          </DialogTitle>
          <DialogDescription>
            Add your professional expertise and skills.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {/* Field 1: Position */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-20" />
              <Skeleton variant="lighter" className="h-10 w-full rounded-xl" />
            </div>

            {/* Field 2: Years of Experience */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-36" />
              <Skeleton variant="lighter" className="h-10 w-full rounded-xl" />
            </div>

            {/* Field 3: Industry */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-20" />
              <Skeleton variant="lighter" className="h-10 w-full rounded-xl" />
            </div>

            {/* Field 4: Skills */}
            <div className="space-y-2">
              <Skeleton variant="lighter" className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton variant="lighter" className="h-10 flex-1 rounded-xl" />
                <Skeleton variant="lighter" className="h-10 w-10 rounded-xl" />
              </div>
              <div className="flex gap-2">
                <Skeleton variant="lighter" className="h-6 w-16 rounded-full" />
                <Skeleton variant="lighter" className="h-6 w-20 rounded-full" />
                <Skeleton variant="lighter" className="h-6 w-14 rounded-full" />
              </div>
            </div>

            {/* Footer */}
            <DialogFooter>
              <Skeleton variant="lighter" className="h-10 w-20" />
              <Skeleton variant="lighter" className="h-10 w-20" />
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.position')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Software Engineer, Product Manager"
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
                name="experience_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter years of experience"
                        min={0}
                        max={50}
                        {...field}
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>{t('sections.skills')}</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={addSkill}
                    disabled={!skillInput.trim() || skills.length >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription className="text-sm text-muted">
                  Add up to 10 skills. Press Enter or click + to add.
                </FormDescription>
                {skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="default"
                        className="gap-1 pr-1.5"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 rounded-full p-0.5 hover:bg-white/10"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {skill}</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </FormItem>

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
