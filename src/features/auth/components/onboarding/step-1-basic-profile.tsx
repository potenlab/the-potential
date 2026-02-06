'use client';

import * as React from 'react';
import { User, Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';

/**
 * Step 1: Basic Profile - Onboarding (Step 1/5)
 *
 * Collects: avatar image, username, nickname, bio
 * Design: Dark card with bg-[#1a1a1a], rounded-[24px]
 */

export interface OnboardingStepProps {
  data: {
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
  };
  onUpdate: (updates: Partial<OnboardingStepProps['data']>) => void;
}

// Username validation: lowercase letters, numbers, underscore, hyphen; 3-20 chars
const USERNAME_REGEX = /^[a-z0-9_-]{0,20}$/;
const USERNAME_MIN = 3;
const USERNAME_MAX = 20;
const BIO_MAX = 200;

export function Step1BasicProfile({ data, onUpdate }: OnboardingStepProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = React.useState(false);

  // Debounced username availability check
  React.useEffect(() => {
    if (data.username.length < USERNAME_MIN) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', data.username)
        .maybeSingle();

      // If the found profile is the current user, it's fine
      const { data: { user } } = await supabase.auth.getUser();
      const isSelf = existing?.id === user?.id;

      setUsernameAvailable(existing === null || isSelf);
      setCheckingUsername(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      setCheckingUsername(false);
    };
  }, [data.username]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    // Revoke previous preview URL to avoid memory leak
    if (data.avatarPreview) {
      URL.revokeObjectURL(data.avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    onUpdate({
      avatarFile: file,
      avatarPreview: previewUrl,
    });
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    // Only allow valid characters
    if (USERNAME_REGEX.test(value)) {
      onUpdate({ username: value });
    }
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ nickname: e.target.value });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= BIO_MAX) {
      onUpdate({ bio: value });
    }
  };

  const usernameError = React.useMemo(() => {
    if (data.username.length === 0) return null;
    if (data.username.length < USERNAME_MIN) {
      return `최소 ${USERNAME_MIN}자 이상 입력해주세요`;
    }
    if (!USERNAME_REGEX.test(data.username)) {
      return '영문 소문자, 숫자, _, - 만 사용 가능합니다';
    }
    if (usernameAvailable === false) {
      return '이미 사용 중인 사용자 이름입니다';
    }
    return null;
  }, [data.username, usernameAvailable]);

  return (
    <div className="bg-[#1a1a1a] border border-white/[0.03] rounded-[24px] shadow-lg p-[33px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl" role="img" aria-label="sparkles">
            ✨
          </span>
          <h2 className="text-2xl font-bold text-white">기본 프로필</h2>
        </div>
        <p className="text-sm text-[#8b95a1]">
          나를 표현할 기본 정보를 설정해보세요
        </p>
      </div>

      {/* Profile Image Section */}
      <div className="flex flex-col items-center mb-8">
        {/* Avatar Circle */}
        <button
          type="button"
          onClick={handleAvatarClick}
          className="relative w-[70px] h-[70px] rounded-full border-2 border-[#0070ff] bg-gradient-to-b from-[rgba(0,229,255,0.2)] to-[rgba(0,229,255,0.1)] flex items-center justify-center overflow-hidden cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0079FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
          aria-label="프로필 이미지 선택"
        >
          {data.avatarPreview ? (
            <img
              src={data.avatarPreview}
              alt="프로필 미리보기"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-7 h-7 text-[#8b95a1]" />
          )}
        </button>

        <span className="text-sm text-[#8b95a1] mt-3 mb-3">프로필 이미지</span>

        {/* Upload Button */}
        <button
          type="button"
          onClick={handleAvatarClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.4)] rounded-[16px] text-sm font-medium text-[#0070ff] cursor-pointer transition-colors hover:bg-[rgba(0,229,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0079FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
        >
          <Upload className="w-4 h-4" />
          이미지 업로드
        </button>

        <p className="text-xs text-[#8b95a1] mt-2">
          • JPG, PNG 형식 / 최대 5MB
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleAvatarChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Username Field */}
      <div className="space-y-2 mb-6">
        <Label className="text-sm font-semibold text-white">
          사용자 이름 (고유 ID) <span className="text-[#FF453A]">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#0070ff] select-none pointer-events-none">
            @
          </span>
          <input
            type="text"
            value={data.username}
            onChange={handleUsernameChange}
            placeholder="username"
            maxLength={USERNAME_MAX}
            className={`flex h-[56px] w-full rounded-[16px] bg-black border px-4 pl-[40px] pr-[44px] text-base text-white placeholder:text-[#8b95a1] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0079FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] ${
              usernameError
                ? 'border-[#FF453A] bg-[#FF453A]/5'
                : usernameAvailable === true
                  ? 'border-[#30D158] bg-[#30D158]/5'
                  : 'border-white/[0.03] hover:border-white/20 focus:border-[#0079FF]'
            }`}
            aria-invalid={!!usernameError}
            aria-describedby="username-helper"
          />
          {/* Availability indicator */}
          {data.username.length >= USERNAME_MIN && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              {checkingUsername ? (
                <Loader2 className="w-5 h-5 text-[#8b95a1] animate-spin" />
              ) : usernameAvailable === true ? (
                <CheckCircle2 className="w-5 h-5 text-[#30D158]" />
              ) : usernameAvailable === false ? (
                <XCircle className="w-5 h-5 text-[#FF453A]" />
              ) : null}
            </span>
          )}
        </div>
        {usernameError ? (
          <p className="text-sm text-[#FF453A]">{usernameError}</p>
        ) : usernameAvailable === true ? (
          <p className="text-sm text-[#30D158]">사용 가능한 사용자 이름입니다</p>
        ) : (
          <p id="username-helper" className="text-xs text-[#8b95a1]">
            • 영문 소문자, 숫자, _, - 만 사용 가능 &nbsp;• 3-20자 이내
          </p>
        )}
      </div>

      {/* Nickname Field */}
      <div className="space-y-2 mb-6">
        <Label className="text-sm font-semibold text-white">
          닉네임 <span className="text-[#FF453A]">*</span>
        </Label>
        <input
          type="text"
          value={data.nickname}
          onChange={handleNicknameChange}
          placeholder="닉네임을 입력해주세요"
          className="flex h-[56px] w-full rounded-[16px] bg-black border border-white/[0.03] px-4 text-base text-white placeholder:text-[#8b95a1] transition-colors duration-200 hover:border-white/20 focus:border-[#0079FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0079FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
          aria-describedby="nickname-helper"
        />
        <p id="nickname-helper" className="text-xs text-[#8b95a1]">
          • 다른 사람들에게 표시될 이름입니다
        </p>
      </div>

      {/* Bio Field */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-white">소개</Label>
        <textarea
          value={data.bio}
          onChange={handleBioChange}
          placeholder={`나를 소개해주세요\n예시:\nAI 스타트업을 준비하고 있습니다\n좋은 인연을 만들고 싶어요!`}
          maxLength={BIO_MAX}
          className="flex w-full h-[130px] rounded-[16px] bg-black border border-white/[0.03] p-4 text-base text-white placeholder:text-[#8b95a1] transition-colors duration-200 resize-none hover:border-white/20 focus:border-[#0079FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0079FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]"
          aria-describedby="bio-helper"
        />
        <div className="flex items-center justify-between">
          <p id="bio-helper" className="text-xs text-[#8b95a1]">
            • 최대 200자까지 입력 가능합니다
          </p>
          <span className="text-xs text-[#8b95a1]">
            {data.bio.length}/{BIO_MAX}
          </span>
        </div>
      </div>
    </div>
  );
}
