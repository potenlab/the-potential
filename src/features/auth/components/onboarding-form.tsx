'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/supabase/storage';
import { Step1BasicProfile } from './onboarding/step-1-basic-profile';
import { Step2Region } from './onboarding/step-2-region';
import { Step3BusinessField } from './onboarding/step-3-business-field';
import { Step4BusinessType } from './onboarding/step-4-business-type';
import { Step5BusinessStage } from './onboarding/step-5-business-stage';

/**
 * 5-Step Onboarding Orchestrator
 *
 * Manages the multi-step profile setup flow:
 * 1. Basic Profile (avatar, username, nickname, bio)
 * 2. Activity Region (province + district)
 * 3. Business Field (industry + sub-industry)
 * 4. Business Type (single selection from 7 types)
 * 5. Business Stage (single selection from 8 stages)
 *
 * Features:
 * - Step counter badge (1/5, 2/5, etc.)
 * - 5-segment progress bar with step labels
 * - Previous / Next / Skip / Complete navigation
 * - Final submission: upload avatar, update profiles, redirect
 */

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  '고유ID',
  '활동 지역',
  '사업 분야',
  '상세정보',
  '비즈니스 단계',
] as const;

export interface OnboardingData {
  avatarFile: File | null;
  avatarPreview: string | null;
  username: string;
  nickname: string;
  bio: string;
  region: string;
  subRegion: string;
  industry: string;
  subIndustry: string;
  businessType: string;
  businessStage: string;
}

const INITIAL_DATA: OnboardingData = {
  avatarFile: null,
  avatarPreview: null,
  username: '',
  nickname: '',
  bio: '',
  region: '',
  subRegion: '',
  industry: '',
  subIndustry: '',
  businessType: '',
  businessStage: '',
};

export function OnboardingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [data, setData] = React.useState<OnboardingData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Pre-populate avatar and nickname from Google auth metadata
  React.useEffect(() => {
    async function loadUserMetadata() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const metadata = user.user_metadata || {};
      const googleAvatarUrl =
        metadata.avatar_url || metadata.picture || null;
      const fullName =
        metadata.full_name || metadata.name || '';

      setData((prev) => ({
        ...prev,
        // Only set if not already filled by the user
        avatarPreview: prev.avatarPreview || googleAvatarUrl,
        nickname: prev.nickname || fullName,
      }));
    }

    loadUserMetadata();
  }, []);

  const handleUpdate = React.useCallback(
    (updates: Partial<OnboardingData>) => {
      setData((prev) => {
        // Reset businessStage when businessType changes (options differ per type)
        if ('businessType' in updates && updates.businessType !== prev.businessType) {
          return { ...prev, ...updates, businessStage: '' };
        }
        return { ...prev, ...updates };
      });
    },
    []
  );

  // Validation per step
  const isStepValid = React.useMemo(() => {
    switch (currentStep) {
      case 1:
        // Username (3-20 chars) and nickname are required
        return (
          data.username.length >= 3 &&
          data.username.length <= 20 &&
          data.nickname.trim().length > 0
        );
      case 2:
        // Region is required
        return data.region !== '';
      case 3:
        // Industry is required
        return data.industry !== '';
      case 4:
        // Business type is optional (can skip)
        return true;
      case 5:
        // Business stage is optional (can skip)
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);

  const canSkip = currentStep >= 4; // Steps 4 and 5 are optional

  const goNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      // Upload avatar if selected
      let avatarUrl: string | null = null;
      if (data.avatarFile) {
        const result = await uploadFile('avatars', data.avatarFile, user.id);
        if (result.success && result.url) {
          avatarUrl = result.url;
        }
      }

      // Build update payload
      const profileUpdate: Record<string, unknown> = {
        username: data.username || null,
        nickname: data.nickname || null,
        bio: data.bio || null,
        region: data.region || null,
        sub_region: data.subRegion || null,
        industry: data.industry || null,
        sub_industry: data.subIndustry || null,
        business_type: data.businessType || null,
        business_stage: data.businessStage || null,
        onboarding_completed: true,
        approval_status: 'approved' as const,
      };

      if (avatarUrl) {
        profileUpdate.avatar_url = avatarUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (updateError) {
        // Check for unique username constraint (code 23505 = unique_violation)
        const isUsernameConflict =
          updateError.code === '23505' ||
          updateError.message?.includes('profiles_username_unique_idx') ||
          updateError.message?.includes('unique');
        if (isUsernameConflict) {
          setError('이미 사용 중인 사용자 이름입니다. 다른 이름을 선택해주세요.');
          setCurrentStep(1);
          return;
        }
        setError('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      // Redirect to support programs
      router.push('/support-programs');
    } catch {
      setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextOrSubmit = () => {
    if (currentStep === TOTAL_STEPS) {
      handleSubmit();
    } else {
      goNext();
    }
  };

  // Step components
  const stepProps = { data, onUpdate: handleUpdate };

  return (
    <div className="w-full max-w-[680px] mx-auto">
      {/* Step Counter Badge */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#0070ff]/10 border border-[#0070ff]/20 text-sm font-medium text-[#0070ff]">
          {currentStep}/{TOTAL_STEPS}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < currentStep ? 'bg-[#0070ff]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={`text-[11px] transition-colors duration-300 ${
                i < currentStep ? 'text-[#0070ff]' : 'text-[#8b95a1]'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20">
          <p className="text-sm text-[#FF453A] text-center">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="mb-6">
        {currentStep === 1 && <Step1BasicProfile {...stepProps} />}
        {currentStep === 2 && <Step2Region {...stepProps} />}
        {currentStep === 3 && <Step3BusinessField {...stepProps} />}
        {currentStep === 4 && <Step4BusinessType {...stepProps} />}
        {currentStep === 5 && <Step5BusinessStage {...stepProps} />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1 rounded-[16px] h-[56px] border-white/10 text-white hover:bg-white/5"
            onClick={goPrevious}
            disabled={isSubmitting}
          >
            이전
          </Button>
        )}

        {canSkip && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="rounded-[16px] h-[56px] text-[#8b95a1] hover:text-white hover:bg-white/5"
            onClick={handleNextOrSubmit}
            disabled={isSubmitting}
          >
            건너뛰기
          </Button>
        )}

        <Button
          type="button"
          variant="primary-glow"
          size="lg"
          className="flex-1 rounded-[16px] h-[56px]"
          onClick={handleNextOrSubmit}
          disabled={
            (!isStepValid && !canSkip) || isSubmitting
          }
          loading={isSubmitting}
        >
          {currentStep === TOTAL_STEPS
            ? isSubmitting
              ? '저장 중...'
              : '완료'
            : '다음'}
        </Button>
      </div>
    </div>
  );
}
