'use client';

import { Sparkles } from 'lucide-react';

interface OnboardingStepProps {
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

const BUSINESS_TYPES = [
  { key: 'startup', emoji: '\u{1F680}', label: '스타트업' },
  { key: 'self_employed', emoji: '\u{1F3EA}', label: '자영업' },
  { key: 'employee', emoji: '\u{1F4BC}', label: '직장인/예비' },
  { key: 'freelancer', emoji: '\u{1F4A1}', label: '프리랜서/N잡러' },
  { key: 'creator', emoji: '\u{1F3AC}', label: '크리에이터' },
  { key: 'agency', emoji: '\u{1F3AF}', label: '에이전시' },
  { key: 'professional', emoji: '\u{2696}\u{FE0F}', label: '전문직' },
] as const;

export function Step4BusinessType({ data, onUpdate }: OnboardingStepProps) {
  const selectedType = data.businessType;

  const handleSelect = (key: string) => {
    onUpdate({ businessType: key });
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/[0.03] rounded-[24px] shadow-lg p-[33px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-6 w-6 text-white" />
        <h2 className="text-2xl font-bold text-white">주력 사업 선택</h2>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-[#8b95a1] mb-6">
        현재 가장 주력으로 하는 사업을 선택해주세요
      </p>

      {/* Selection Grid */}
      <div className="grid grid-cols-2 gap-3">
        {BUSINESS_TYPES.map((type) => {
          const isSelected = selectedType === type.key;

          return (
            <button
              key={type.key}
              type="button"
              onClick={() => handleSelect(type.key)}
              className={`
                flex flex-col items-center justify-center gap-2
                rounded-[16px] border py-5 px-3
                transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? 'bg-[rgba(0,112,255,0.5)] border-[#0070ff] shadow-[0px_0px_20px_0px_rgba(0,229,255,0.3)]'
                    : 'bg-black border-white/[0.03]'
                }
              `}
            >
              <span className="text-2xl">{type.emoji}</span>
              <span
                className={`text-sm font-bold transition-all duration-200 ${
                  isSelected
                    ? 'text-[#0070ff]'
                    : 'text-white/80'
                }`}
              >
                {type.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
