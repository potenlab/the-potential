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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Link, useRouter } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';

/**
 * Signup Form Component
 *
 * Features:
 * - Multi-step signup flow: Account -> Profile -> OTP Verification
 * - Email/password registration with Supabase Auth
 * - Profile creation with name and company
 * - OTP email verification
 * - Internationalized labels and error messages
 * - Customized UI components from design system
 */

type SignupStep = 'account' | 'profile' | 'otp';

interface AccountFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ProfileFormData {
  name: string;
  companyName: string;
  position?: string;
}

// OTP resend cooldown in seconds
const OTP_RESEND_COOLDOWN = 60;

export function SignupForm() {
  const t = useTranslations('auth.signup');
  const tOtp = useTranslations('auth.otp');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');
  const router = useRouter();

  // Multi-step state
  const [currentStep, setCurrentStep] = React.useState<SignupStep>('account');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Data collected across steps
  const [accountData, setAccountData] = React.useState<AccountFormData | null>(
    null
  );

  // OTP state
  const [otpValue, setOtpValue] = React.useState('');
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Validation schemas
  const accountSchema = React.useMemo(
    () =>
      z
        .object({
          email: z
            .string()
            .min(1, tValidation('required'))
            .email(tValidation('email')),
          password: z
            .string()
            .min(1, tValidation('required'))
            .min(8, tValidation('minLength', { min: 8 })),
          confirmPassword: z.string().min(1, tValidation('required')),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: tValidation('passwordMismatch'),
          path: ['confirmPassword'],
        }),
    [tValidation]
  );

  const profileSchema = React.useMemo(
    () =>
      z.object({
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

  // Account form
  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
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

  // Step 1: Account submission
  const onAccountSubmit = async (data: AccountFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Store account data and move to profile step
      setAccountData(data);
      setCurrentStep('profile');
    } catch {
      setError(t('signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Profile submission -> Create account + send OTP
  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!accountData) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create user account with Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email: accountData.email,
        password: accountData.password,
        options: {
          data: {
            name: data.name,
            company_name: data.companyName,
            position: data.position || null,
            approval_status: 'pending', // User needs admin approval
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Move to OTP verification step
      setCurrentStep('otp');
      setResendCooldown(OTP_RESEND_COOLDOWN);
    } catch {
      setError(t('signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: OTP verification
  const onOtpSubmit = async () => {
    if (!accountData || otpValue.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: accountData.email,
        token: otpValue,
        type: 'signup',
      });

      if (verifyError) {
        setError(tOtp('invalidCode'));
        return;
      }

      // Redirect to pending approval page or home
      router.push('/home');
    } catch {
      setError(tOtp('invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!accountData || resendCooldown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: accountData.email,
      });

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setResendCooldown(OTP_RESEND_COOLDOWN);
      setOtpValue('');
    } catch {
      setError(t('signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    setError(null);
    if (currentStep === 'profile') {
      setCurrentStep('account');
    } else if (currentStep === 'otp') {
      setCurrentStep('profile');
    }
  };

  // Step indicator component
  const StepIndicator = () => {
    const steps: SignupStep[] = ['account', 'profile', 'otp'];
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

  // Render Account Step
  const renderAccountStep = () => (
    <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
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
        error={accountForm.formState.errors.email?.message}
        {...accountForm.register('email')}
      />

      <Input
        label={t('password')}
        type="password"
        placeholder={t('passwordPlaceholder')}
        autoComplete="new-password"
        error={accountForm.formState.errors.password?.message}
        {...accountForm.register('password')}
      />

      <Input
        label={t('confirmPassword')}
        type="password"
        placeholder={t('confirmPasswordPlaceholder')}
        autoComplete="new-password"
        error={accountForm.formState.errors.confirmPassword?.message}
        {...accountForm.register('confirmPassword')}
      />

      <Button
        type="submit"
        variant="primary-glow"
        size="lg"
        className="w-full"
        loading={isLoading}
      >
        {tCommon('next')}
      </Button>
    </form>
  );

  // Render Profile Step
  const renderProfileStep = () => (
    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20">
          <p className="text-sm text-[#FF453A] text-center">{error}</p>
        </div>
      )}

      <Input
        label={t('name')}
        type="text"
        placeholder={t('namePlaceholder')}
        autoComplete="name"
        error={profileForm.formState.errors.name?.message}
        {...profileForm.register('name')}
      />

      <Input
        label={t('companyName')}
        type="text"
        placeholder={t('companyPlaceholder')}
        autoComplete="organization"
        error={profileForm.formState.errors.companyName?.message}
        {...profileForm.register('companyName')}
      />

      <Input
        label={`${t('position')} (${tCommon('optional')})`}
        type="text"
        placeholder={t('positionPlaceholder')}
        autoComplete="organization-title"
        error={profileForm.formState.errors.position?.message}
        {...profileForm.register('position')}
      />

      <div className="flex gap-3">
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
        <Button
          type="submit"
          variant="primary-glow"
          size="lg"
          className="flex-1"
          loading={isLoading}
        >
          {t('submit')}
        </Button>
      </div>
    </form>
  );

  // Render OTP Step
  const renderOtpStep = () => (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20">
          <p className="text-sm text-[#FF453A] text-center">{error}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={6}
          value={otpValue}
          onChange={(value) => setOtpValue(value)}
          disabled={isLoading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
            <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
            <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
            <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
            <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
            <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
          </InputOTPGroup>
        </InputOTP>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendCooldown > 0 || isLoading}
          className={cn(
            'text-sm transition-colors',
            resendCooldown > 0
              ? 'text-[#8B95A1] cursor-not-allowed'
              : 'text-[#0079FF] hover:underline'
          )}
        >
          {resendCooldown > 0
            ? tOtp('resendIn', { seconds: resendCooldown })
            : tOtp('resend')}
        </button>
      </div>

      <div className="flex gap-3">
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
        <Button
          type="button"
          variant="primary-glow"
          size="lg"
          className="flex-1"
          onClick={onOtpSubmit}
          loading={isLoading}
          disabled={otpValue.length !== 6}
        >
          {tOtp('verify')}
        </Button>
      </div>
    </div>
  );

  // Get step title and subtitle
  const getStepContent = () => {
    switch (currentStep) {
      case 'account':
        return {
          title: t('title'),
          subtitle: t('subtitle'),
        };
      case 'profile':
        return {
          title: t('title'),
          subtitle: t('subtitle'),
        };
      case 'otp':
        return {
          title: tOtp('title'),
          subtitle: tOtp('subtitle', { email: accountData?.email || '' }),
        };
    }
  };

  const stepContent = getStepContent();

  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-md">
      <CardHeader className="text-center space-y-2">
        <StepIndicator />
        <CardTitle className="text-2xl">{stepContent.title}</CardTitle>
        <CardDescription>{stepContent.subtitle}</CardDescription>
      </CardHeader>

      <CardContent>
        {currentStep === 'account' && renderAccountStep()}
        {currentStep === 'profile' && renderProfileStep()}
        {currentStep === 'otp' && renderOtpStep()}
      </CardContent>

      {currentStep === 'account' && (
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
            <Link href="/login" className="text-[#0079FF] hover:underline">
              {t('login')}
            </Link>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
