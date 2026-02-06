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
import { Link, useRouter } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * Login Form Component
 *
 * Features:
 * - Email/password authentication
 * - Google OAuth authentication
 * - Form validation with Zod
 * - Internationalized labels and error messages
 * - Customized UI components from design system
 */

interface LoginFormProps {
  /** When provided, the "Sign Up" link calls this instead of navigating */
  onSwitchToSignup?: () => void;
  /** Called after successful login (in addition to router.push) */
  onSuccess?: () => void;
  /** When true, renders without the Card wrapper (for use inside a Dialog) */
  isModal?: boolean;
}

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm({ onSwitchToSignup, onSuccess, isModal }: LoginFormProps = {}) {
  const t = useTranslations('auth.login');
  const tValidation = useTranslations('validation');
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Create validation schema with translated messages
  const loginSchema = React.useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, tValidation('required'))
          .email(tValidation('email')),
        password: z
          .string()
          .min(1, tValidation('required'))
          .min(8, tValidation('minLength', { min: 8 })),
      }),
    [tValidation]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError(t('invalidCredentials'));
        return;
      }

      // Check user role and approval status to determine redirect destination
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, approval_status, company_name, onboarding_completed')
        .eq('id', signInData.user.id)
        .single();

      if (!profile || !profile.onboarding_completed) {
        // Redirect to onboarding if not completed
        router.push('/signup/onboarding');
        onSuccess?.();
        return;
      }

      // Auto-approve if not yet approved
      if (profile.approval_status !== 'approved') {
        await supabase
          .from('profiles')
          .update({ approval_status: 'approved' })
          .eq('id', signInData.user.id);
      }

      // Redirect based on role
      if (profile.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/support-programs');
      }
      onSuccess?.();
      return;
    } catch {
      setError(t('loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (googleError) {
        toast.error(t('googleLoginFailed'));
        setIsGoogleLoading(false);
      }
      // Note: On success, user is redirected by Supabase
    } catch {
      toast.error(t('googleLoginFailed'));
      setIsGoogleLoading(false);
    }
  };

  const headerContent = (
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold tracking-tight text-white">{t('title')}</h2>
      <p className="text-base text-muted">{t('subtitle')}</p>
    </div>
  );

  const bodyContent = (
    <div className="space-y-6">
      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogleLogin}
        loading={isGoogleLoading}
        disabled={isLoading}
        leftIcon={
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        }
      >
        {t('googleLogin')}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#1C1C1E] px-2 text-[#8B95A1]">
            {t('orContinueWith')}
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Message */}
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
          label={t('password')}
          type="password"
          placeholder={t('passwordPlaceholder')}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-[#0079FF] hover:underline"
          >
            {t('forgotPassword')}
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary-glow"
          size="lg"
          className="w-full"
          loading={isLoading}
          disabled={isGoogleLoading}
        >
          {t('submit')}
        </Button>
      </form>
    </div>
  );

  const footerContent = (
    <div className="flex justify-center pt-2">
      <p className="text-sm text-[#8B95A1]">
        {t('noAccount')}{' '}
        {onSwitchToSignup ? (
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-[#0079FF] hover:underline"
          >
            {t('signUp')}
          </button>
        ) : (
          <Link href="/signup" className="text-[#0079FF] hover:underline">
            {t('signUp')}
          </Link>
        )}
      </p>
    </div>
  );

  // Modal mode: render without Card wrapper (Dialog provides the chrome)
  if (isModal) {
    return (
      <div className="space-y-6">
        {headerContent}
        {bodyContent}
        {footerContent}
      </div>
    );
  }

  // Page mode: render with Card wrapper
  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-md">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {bodyContent}
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-[#8B95A1]">
          {t('noAccount')}{' '}
          {onSwitchToSignup ? (
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-[#0079FF] hover:underline"
            >
              {t('signUp')}
            </button>
          ) : (
            <Link href="/signup" className="text-[#0079FF] hover:underline">
              {t('signUp')}
            </Link>
          )}
        </p>
      </CardFooter>
    </Card>
  );
}
