'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';

/**
 * Signup Form Component
 *
 * Features:
 * - Two-step magic link signup flow: Form -> Confirmation
 * - Collects email + profile info (name, company, position)
 * - Sends magic link via Supabase signInWithOtp
 * - Shows confirmation screen with resend option
 * - Internationalized labels and error messages
 * - Customized UI components from design system
 */

interface SignupFormProps {
  /** When provided, the "Log in" link calls this instead of navigating */
  onSwitchToLogin?: () => void;
  /** Called after successful signup (in addition to router.push) */
  onSuccess?: () => void;
  /** When true, renders without the Card wrapper (for use inside a Dialog) */
  isModal?: boolean;
}

type SignupStep = 'form' | 'confirmation';

interface SignupFormData {
  email: string;
  name: string;
  companyName: string;
  position?: string;
}

// Magic link resend cooldown in seconds
const RESEND_COOLDOWN = 60;

export function SignupForm({ onSwitchToLogin, onSuccess, isModal }: SignupFormProps = {}) {
  const t = useTranslations('auth.signup');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');

  // Step state
  const [currentStep, setCurrentStep] = React.useState<SignupStep>('form');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Store submitted email for confirmation screen
  const [submittedEmail, setSubmittedEmail] = React.useState('');

  // Resend cooldown state
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Store form data for resend
  const [formData, setFormData] = React.useState<SignupFormData | null>(null);

  // Validation schema
  const signupSchema = React.useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, tValidation('required'))
          .email(tValidation('email')),
        name: z
          .string()
          .min(1, tValidation('required'))
          .min(2, tValidation('minLength', { min: 2 })),
        companyName: z
          .string()
          .min(1, tValidation('required'))
          .min(2, tValidation('minLength', { min: 2 })),
        position: z.string().optional(),
      }),
    [tValidation]
  );

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      name: '',
      companyName: '',
      position: '',
    },
  });

  // Handle resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Send magic link
  const sendMagicLink = async (data: SignupFormData) => {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: data.name,
          company_name: data.companyName,
          position: data.position || null,
          approval_status: 'pending',
        },
      },
    });

    if (otpError) {
      throw otpError;
    }
  };

  // Form submission
  const onFormSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await sendMagicLink(data);

      // Store data for resend and move to confirmation
      setFormData(data);
      setSubmittedEmail(data.email);
      setCurrentStep('confirmation');
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('signupFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend magic link
  const handleResend = async () => {
    if (!formData || resendCooldown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await sendMagicLink(formData);
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('signupFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step indicator component
  const StepIndicator = () => {
    const steps: SignupStep[] = ['form', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                index <= currentIndex
                  ? 'bg-primary'
                  : 'bg-white/10'
              )}
            />
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 transition-colors',
                  index < currentIndex ? 'bg-primary' : 'bg-white/10'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render Form Step
  const renderFormStep = () => (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20">
          <p className="text-sm text-[#FF453A] text-center">{error}</p>
        </div>
      )}

      <Input
        label={t('email')}
        type="email"
        placeholder={t('emailPlaceholder')}
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label={t('name')}
        type="text"
        placeholder={t('namePlaceholder')}
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label={t('companyName')}
        type="text"
        placeholder={t('companyPlaceholder')}
        autoComplete="organization"
        error={errors.companyName?.message}
        {...register('companyName')}
      />

      <Input
        label={`${t('position')} (${tCommon('optional')})`}
        type="text"
        placeholder={t('positionPlaceholder')}
        autoComplete="organization-title"
        error={errors.position?.message}
        {...register('position')}
      />

      <Button
        type="submit"
        variant="primary-glow"
        size="lg"
        className="w-full"
        loading={isLoading}
      >
        {t('submit')}
      </Button>
    </form>
  );

  // Render Confirmation Step
  const renderConfirmationStep = () => (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20">
          <p className="text-sm text-[#FF453A] text-center">{error}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 text-center">
        {/* Email icon */}
        <div className="w-16 h-16 rounded-full bg-[#0079FF]/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-[#0079FF]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            {t('magicLinkSent')}
          </h3>
          <p className="text-sm text-[#8B95A1]">
            {submittedEmail}
          </p>
          <p className="text-sm text-[#8B95A1]">
            {t('magicLinkDescription')}
          </p>
        </div>

        <p className="text-xs text-[#8B95A1]">
          {t('checkSpam')}
        </p>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isLoading}
          loading={isLoading}
        >
          {resendCooldown > 0
            ? t('resendIn', { seconds: resendCooldown })
            : t('resend')}
        </Button>
      </div>
    </div>
  );

  // Get step title and subtitle
  const getStepContent = () => {
    switch (currentStep) {
      case 'form':
        return {
          title: t('title'),
          subtitle: t('subtitle'),
        };
      case 'confirmation':
        return {
          title: t('magicLinkSent'),
          subtitle: '',
        };
    }
  };

  const stepContent = getStepContent();

  const headerContent = (
    <div className="text-center space-y-2">
      <StepIndicator />
      <h2 className="text-2xl font-bold tracking-tight text-white">{stepContent.title}</h2>
      {stepContent.subtitle && (
        <p className="text-base text-muted">{stepContent.subtitle}</p>
      )}
    </div>
  );

  const stepBody = (
    <>
      {currentStep === 'form' && renderFormStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </>
  );

  const footerContent = currentStep === 'form' ? (
    <div className="flex flex-col items-center gap-4 pt-2">
      {/* Terms agreement text */}
      <p className="text-xs text-[#8B95A1] text-center">
        {t.rich('termsAgreement', {
          terms: (chunks) => (
            <Link href="/terms" className="text-[#0079FF] hover:underline">
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link href="/privacy" className="text-[#0079FF] hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </p>

      {/* Login link */}
      <p className="text-sm text-[#8B95A1]">
        {t('hasAccount')}{' '}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#0079FF] hover:underline"
          >
            {t('login')}
          </button>
        ) : (
          <Link href="/login" className="text-[#0079FF] hover:underline">
            {t('login')}
          </Link>
        )}
      </p>
    </div>
  ) : null;

  // Modal mode: render without Card wrapper (Dialog provides the chrome)
  if (isModal) {
    return (
      <div className="space-y-6">
        {headerContent}
        {stepBody}
        {footerContent}
      </div>
    );
  }

  // Page mode: render with Card wrapper
  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-md">
      <CardHeader className="text-center space-y-2">
        <StepIndicator />
        <CardTitle className="text-2xl">{stepContent.title}</CardTitle>
        {stepContent.subtitle && (
          <CardDescription>{stepContent.subtitle}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {stepBody}
      </CardContent>

      {currentStep === 'form' && (
        <CardFooter className="flex-col gap-4">
          {/* Terms agreement text */}
          <p className="text-xs text-[#8B95A1] text-center">
            {t.rich('termsAgreement', {
              terms: (chunks) => (
                <Link href="/terms" className="text-[#0079FF] hover:underline">
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link href="/privacy" className="text-[#0079FF] hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>

          {/* Login link */}
          <p className="text-sm text-[#8B95A1]">
            {t('hasAccount')}{' '}
            {onSwitchToLogin ? (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#0079FF] hover:underline"
              >
                {t('login')}
              </button>
            ) : (
              <Link href="/login" className="text-[#0079FF] hover:underline">
                {t('login')}
              </Link>
            )}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
