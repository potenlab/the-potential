'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  Plus,
  Trash2,
  FileText,
  Briefcase,
  FolderOpen,
  ClipboardCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

/**
 * Expert Registration Form
 *
 * Multi-step form for expert registration with:
 * - Step 1: Basic Info (category, expertise, experience)
 * - Step 2: Business Info (name, registration number)
 * - Step 3: Portfolio & Documents (URLs, file uploads)
 * - Step 4: Review & Submit
 */

type ExpertCategory = Database['public']['Enums']['expert_category'];

type RegistrationStep = 'basic' | 'business' | 'portfolio' | 'review';

const STEPS: RegistrationStep[] = ['basic', 'business', 'portfolio', 'review'];

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

interface UploadedFile {
  name: string;
  path: string;
  size: number;
}

// Korean business registration number format: 000-00-00000
const BUSINESS_NUMBER_REGEX = /^\d{3}-\d{2}-\d{5}$/;

export default function ExpertRegistrationPage() {
  const t = useTranslations('experts.registration');
  const tCategories = useTranslations('experts.categories');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');

  // Multi-step state
  const [currentStep, setCurrentStep] = React.useState<RegistrationStep>('basic');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // File uploads state
  const [businessCertificates, setBusinessCertificates] = React.useState<UploadedFile[]>([]);
  const [portfolioFiles, setPortfolioFiles] = React.useState<UploadedFile[]>([]);

  // Portfolio URLs state (dynamic array)
  const [portfolioUrls, setPortfolioUrls] = React.useState<string[]>(['']);

  // Form validation schema
  const formSchema = React.useMemo(
    () =>
      z.object({
        // Step 1
        category: z.enum([
          'marketing',
          'development',
          'design',
          'legal',
          'finance',
          'hr',
          'operations',
          'strategy',
          'other',
        ] as const),
        expertiseAreas: z.string().min(1, tValidation('required')),
        experienceYears: z
          .number({ message: tValidation('required') })
          .min(0, tValidation('min', { min: 0 }))
          .max(50, tValidation('max', { max: 50 })),
        hourlyRate: z.number().optional(),
        bio: z
          .string()
          .min(1, tValidation('required'))
          .min(50, tValidation('minLength', { min: 50 })),
        collaborationNeeds: z
          .string()
          .min(1, tValidation('required'))
          .min(20, tValidation('minLength', { min: 20 })),

        // Step 2
        businessName: z
          .string()
          .min(1, tValidation('required'))
          .min(2, tValidation('minLength', { min: 2 })),
        businessRegistrationNumber: z
          .string()
          .min(1, tValidation('required'))
          .regex(BUSINESS_NUMBER_REGEX, tValidation('businessNumber')),

        // Step 4
        termsAgreed: z.boolean().refine((val) => val === true, {
          message: t('termsRequired'),
        }),
      }),
    [t, tValidation]
  );

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'marketing',
      expertiseAreas: '',
      experienceYears: 0,
      hourlyRate: undefined,
      bio: '',
      collaborationNeeds: '',
      businessName: '',
      businessRegistrationNumber: '',
      termsAgreed: false,
    },
    mode: 'onChange',
  });

  // Get current step index
  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Validate current step
  const validateStep = async (step: RegistrationStep): Promise<boolean> => {
    let fieldsToValidate: (keyof FormSchema)[] = [];

    switch (step) {
      case 'basic':
        fieldsToValidate = [
          'category',
          'expertiseAreas',
          'experienceYears',
          'bio',
          'collaborationNeeds',
        ];
        break;
      case 'business':
        fieldsToValidate = ['businessName', 'businessRegistrationNumber'];
        break;
      case 'portfolio':
        // Portfolio step is optional validation
        return true;
      case 'review':
        fieldsToValidate = ['termsAgreed'];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  // Go to next step
  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
      setError(null);
    }
  };

  // Go to previous step
  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
      setError(null);
    }
  };

  // File upload handler
  const handleFileUpload = async (
    files: FileList | null,
    type: 'certificate' | 'portfolio'
  ) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const uploadedFiles: UploadedFile[] = [];

      for (const file of Array.from(files)) {
        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          setError(t('fileTypeError'));
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          setError(t('fileSizeError'));
          continue;
        }

        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${type}/${fileName}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('expert-documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          setError(uploadError.message);
          continue;
        }

        uploadedFiles.push({
          name: file.name,
          path: filePath,
          size: file.size,
        });
      }

      // Update state based on file type
      if (type === 'certificate') {
        setBusinessCertificates((prev) => [...prev, ...uploadedFiles]);
      } else {
        setPortfolioFiles((prev) => [...prev, ...uploadedFiles]);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = async (
    file: UploadedFile,
    type: 'certificate' | 'portfolio'
  ) => {
    try {
      // Delete from storage
      await supabase.storage.from('expert-documents').remove([file.path]);

      // Update state
      if (type === 'certificate') {
        setBusinessCertificates((prev) => prev.filter((f) => f.path !== file.path));
      } else {
        setPortfolioFiles((prev) => prev.filter((f) => f.path !== file.path));
      }
    } catch (err) {
      console.error('File removal error:', err);
    }
  };

  // Portfolio URL handlers
  const addPortfolioUrl = () => {
    setPortfolioUrls((prev) => [...prev, '']);
  };

  const removePortfolioUrl = (index: number) => {
    setPortfolioUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePortfolioUrl = (index: number, value: string) => {
    setPortfolioUrls((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Submit form
  const onSubmit = async (data: FormSchema) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Parse expertise areas from comma-separated string
      const expertiseAreasArray = data.expertiseAreas
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Filter valid portfolio URLs
      const validPortfolioUrls = portfolioUrls.filter((url) => url.trim().length > 0);

      // Collect all document paths
      const verificationDocs = businessCertificates.map((f) => f.path);
      const portfolioFilePaths = portfolioFiles.map((f) => f.path);

      // Create expert profile
      const { error: insertError } = await supabase.from('expert_profiles').insert({
        user_id: user.id,
        category: data.category,
        specialty: expertiseAreasArray,
        experience_years: data.experienceYears,
        hourly_rate: data.hourlyRate || null,
        bio: data.bio,
        collaboration_needs: data.collaborationNeeds,
        business_name: data.businessName,
        business_registration_number: data.businessRegistrationNumber,
        portfolio_url: validPortfolioUrls[0] || null,
        portfolio_files: [...portfolioFilePaths],
        verification_documents: verificationDocs,
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(t('submitFailed'));
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Submit error:', err);
      setError(t('submitFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Category options
  const categoryOptions: { value: ExpertCategory; label: string }[] = [
    { value: 'marketing', label: tCategories('marketing') },
    { value: 'development', label: tCategories('development') },
    { value: 'design', label: tCategories('design') },
    { value: 'legal', label: tCategories('legal') },
    { value: 'finance', label: tCategories('finance') },
    { value: 'hr', label: tCategories('hr') },
    { value: 'operations', label: tCategories('operations') },
    { value: 'strategy', label: tCategories('strategy') },
    { value: 'other', label: tCategories('all') },
  ];

  // Step icons
  const StepIcon = ({ step }: { step: RegistrationStep }) => {
    const icons = {
      basic: Briefcase,
      business: FileText,
      portfolio: FolderOpen,
      review: ClipboardCheck,
    };
    const Icon = icons[step];
    return <Icon className="h-5 w-5" />;
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
          <CardContent className="space-y-6 py-8">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">{t('submitSuccess')}</h2>
              <p className="text-muted">{t('pendingDescription')}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              {tCommon('confirm')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
          <p className="text-muted">{t('subtitle')}</p>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <Progress value={progress} size="md" indicatorColor="primary" glow />
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <button
                key={step}
                onClick={() => {
                  if (index < currentStepIndex) {
                    setCurrentStep(step);
                  }
                }}
                disabled={index > currentStepIndex}
                className={cn(
                  'flex flex-col items-center gap-1 text-xs transition-colors',
                  index === currentStepIndex
                    ? 'text-primary'
                    : index < currentStepIndex
                      ? 'text-white cursor-pointer hover:text-primary'
                      : 'text-muted cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors',
                    index === currentStepIndex
                      ? 'border-primary bg-primary/10'
                      : index < currentStepIndex
                        ? 'border-primary bg-primary text-black'
                        : 'border-white/10 bg-card'
                  )}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <StepIcon step={step} />
                  )}
                </div>
                <span className="hidden sm:block">
                  {t(`steps.${step === 'basic' ? 'basicInfo' : step === 'business' ? 'businessInfo' : step === 'portfolio' ? 'portfolioInfo' : 'review'}`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{tCommon('error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card variant="elevated" padding="lg">
            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 'basic' && (
                <>
                  <CardHeader className="p-0">
                    <CardTitle>{t('steps.basicInfo')}</CardTitle>
                    <CardDescription>
                      {t('step', { current: 1, total: 4 })}
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-4">
                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white">
                        {t('category')} <span className="text-error">*</span>
                      </label>
                      <Select
                        value={form.watch('category')}
                        onValueChange={(value) =>
                          form.setValue('category', value as ExpertCategory)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('categoryPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.category && (
                        <p className="text-sm text-error">
                          {form.formState.errors.category.message}
                        </p>
                      )}
                    </div>

                    {/* Expertise Areas */}
                    <Input
                      label={`${t('expertiseAreas')} *`}
                      placeholder={t('expertiseAreasPlaceholder')}
                      helperText={t('expertiseAreasHelp')}
                      error={form.formState.errors.expertiseAreas?.message}
                      {...form.register('expertiseAreas')}
                    />

                    {/* Experience Years */}
                    <Input
                      label={`${t('experienceYears')} *`}
                      type="number"
                      min={0}
                      max={50}
                      placeholder={t('experienceYearsPlaceholder')}
                      error={form.formState.errors.experienceYears?.message}
                      {...form.register('experienceYears', { valueAsNumber: true })}
                    />

                    {/* Hourly Rate (Optional) */}
                    <Input
                      label={`${t('hourlyRate')} (${tCommon('optional')})`}
                      type="number"
                      min={0}
                      placeholder={t('hourlyRatePlaceholder')}
                      error={form.formState.errors.hourlyRate?.message}
                      {...form.register('hourlyRate', { valueAsNumber: true })}
                    />

                    {/* Bio */}
                    <Textarea
                      label={`${t('bio')} *`}
                      placeholder={t('bioPlaceholder')}
                      error={form.formState.errors.bio?.message}
                      className="min-h-[150px]"
                      {...form.register('bio')}
                    />

                    {/* Collaboration Needs */}
                    <Textarea
                      label={`${t('collaborationNeeds')} *`}
                      placeholder={t('collaborationNeedsPlaceholder')}
                      error={form.formState.errors.collaborationNeeds?.message}
                      {...form.register('collaborationNeeds')}
                    />
                  </div>
                </>
              )}

              {/* Step 2: Business Info */}
              {currentStep === 'business' && (
                <>
                  <CardHeader className="p-0">
                    <CardTitle>{t('steps.businessInfo')}</CardTitle>
                    <CardDescription>
                      {t('step', { current: 2, total: 4 })}
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-4">
                    {/* Business Name */}
                    <Input
                      label={`${t('businessName')} *`}
                      placeholder={t('businessNamePlaceholder')}
                      error={form.formState.errors.businessName?.message}
                      {...form.register('businessName')}
                    />

                    {/* Business Registration Number */}
                    <Input
                      label={`${t('businessNumber')} *`}
                      placeholder={t('businessNumberPlaceholder')}
                      helperText={t('businessNumberHelp')}
                      error={form.formState.errors.businessRegistrationNumber?.message}
                      {...form.register('businessRegistrationNumber')}
                    />
                  </div>
                </>
              )}

              {/* Step 3: Portfolio & Documents */}
              {currentStep === 'portfolio' && (
                <>
                  <CardHeader className="p-0">
                    <CardTitle>{t('steps.portfolioInfo')}</CardTitle>
                    <CardDescription>
                      {t('step', { current: 3, total: 4 })}
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-6">
                    {/* Portfolio URLs */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-white">
                        {t('portfolioUrls')}
                      </label>
                      {portfolioUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={t('portfolioUrlsPlaceholder')}
                            value={url}
                            onChange={(e) => updatePortfolioUrl(index, e.target.value)}
                            className="flex-1"
                          />
                          {portfolioUrls.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePortfolioUrl(index)}
                            >
                              <Trash2 className="h-4 w-4 text-error" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPortfolioUrl}
                        leftIcon={<Plus className="h-4 w-4" />}
                      >
                        {t('addPortfolioUrl')}
                      </Button>
                    </div>

                    {/* Business Certificate Upload */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-white">
                        {t('businessCertificate')}
                      </label>
                      <p className="text-sm text-muted">
                        {t('businessCertificateDescription')}
                      </p>
                      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          multiple
                          className="hidden"
                          id="certificate-upload"
                          onChange={(e) =>
                            handleFileUpload(e.target.files, 'certificate')
                          }
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="certificate-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="h-8 w-8 text-muted" />
                          <span className="text-sm text-muted">
                            {isUploading ? tCommon('loading') : t('uploadFile')}
                          </span>
                        </label>
                      </div>
                      {businessCertificates.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-white">
                            {t('uploadedFiles')}
                          </p>
                          {businessCertificates.map((file) => (
                            <div
                              key={file.path}
                              className="flex items-center justify-between p-3 bg-card rounded-xl"
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-white truncate max-w-[200px]">
                                  {file.name}
                                </span>
                                <span className="text-muted">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleRemoveFile(file, 'certificate')}
                              >
                                <X className="h-4 w-4 text-error" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Portfolio Files Upload */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-white">
                        {t('portfolioFiles')}
                      </label>
                      <p className="text-sm text-muted">
                        {t('portfolioFilesDescription')}
                      </p>
                      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          multiple
                          className="hidden"
                          id="portfolio-upload"
                          onChange={(e) =>
                            handleFileUpload(e.target.files, 'portfolio')
                          }
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="portfolio-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="h-8 w-8 text-muted" />
                          <span className="text-sm text-muted">
                            {isUploading ? tCommon('loading') : t('uploadFile')}
                          </span>
                        </label>
                      </div>
                      {portfolioFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-white">
                            {t('uploadedFiles')}
                          </p>
                          {portfolioFiles.map((file) => (
                            <div
                              key={file.path}
                              className="flex items-center justify-between p-3 bg-card rounded-xl"
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-white truncate max-w-[200px]">
                                  {file.name}
                                </span>
                                <span className="text-muted">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleRemoveFile(file, 'portfolio')}
                              >
                                <X className="h-4 w-4 text-error" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Review */}
              {currentStep === 'review' && (
                <>
                  <CardHeader className="p-0">
                    <CardTitle>{t('reviewTitle')}</CardTitle>
                    <CardDescription>{t('reviewDescription')}</CardDescription>
                  </CardHeader>

                  <div className="space-y-6">
                    {/* Basic Info Summary */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">
                          {t('steps.basicInfo')}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep('basic')}
                        >
                          {t('editSection')}
                        </Button>
                      </div>
                      <div className="bg-card rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted">{t('category')}</span>
                          <span className="text-white">
                            {categoryOptions.find((c) => c.value === form.watch('category'))?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">{t('expertiseAreas')}</span>
                          <span className="text-white">{form.watch('expertiseAreas')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">{t('experienceYears')}</span>
                          <span className="text-white">
                            {form.watch('experienceYears')} {tCommon('years')}
                          </span>
                        </div>
                        {form.watch('hourlyRate') && (
                          <div className="flex justify-between">
                            <span className="text-muted">{t('hourlyRate')}</span>
                            <span className="text-white">
                              {form.watch('hourlyRate')?.toLocaleString()} KRW
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Info Summary */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">
                          {t('steps.businessInfo')}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep('business')}
                        >
                          {t('editSection')}
                        </Button>
                      </div>
                      <div className="bg-card rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted">{t('businessName')}</span>
                          <span className="text-white">{form.watch('businessName')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">{t('businessNumber')}</span>
                          <span className="text-white">
                            {form.watch('businessRegistrationNumber')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Portfolio Summary */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">
                          {t('steps.portfolioInfo')}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep('portfolio')}
                        >
                          {t('editSection')}
                        </Button>
                      </div>
                      <div className="bg-card rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted">{t('portfolioUrls')}</span>
                          <span className="text-white">
                            {portfolioUrls.filter((u) => u.trim()).length} URL(s)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">{t('businessCertificate')}</span>
                          <span className="text-white">
                            {businessCertificates.length} file(s)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">{t('portfolioFiles')}</span>
                          <span className="text-white">
                            {portfolioFiles.length} file(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1 h-5 w-5 rounded border-white/20 bg-card text-primary focus:ring-primary focus:ring-offset-0"
                          {...form.register('termsAgreed')}
                        />
                        <span className="text-sm text-muted">{t('termsAgreement')}</span>
                      </label>
                      {form.formState.errors.termsAgreed && (
                        <p className="text-sm text-error">
                          {form.formState.errors.termsAgreed.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Description */}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{t('submitDescription')}</AlertDescription>
                    </Alert>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {currentStepIndex > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    {tCommon('back')}
                  </Button>
                )}
                {currentStepIndex < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    variant="primary-glow"
                    size="lg"
                    className="flex-1"
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    {tCommon('next')}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary-glow"
                    size="lg"
                    className="flex-1"
                    loading={isLoading}
                  >
                    {t('submit')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
