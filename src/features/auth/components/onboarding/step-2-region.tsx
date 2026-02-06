'use client';

import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

/**
 * Step 2 - Region Selection
 *
 * Collects user's activity region (province + district).
 * Second dropdown is disabled until a province is selected.
 * Selecting a new province resets the district.
 */

// ---------------------------------------------------------------------------
// Region & District Data
// ---------------------------------------------------------------------------

const PROVINCES = [
  '서울',
  '경기',
  '부산',
  '인천',
  '대구',
  '대전',
  '광주',
  '울산',
  '세종',
  '강원',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주',
  '해외',
] as const;

const DISTRICT_MAP: Record<string, string[]> = {
  서울: [
    '강남구',
    '강동구',
    '강북구',
    '강서구',
    '관악구',
    '광진구',
    '구로구',
    '금천구',
    '노원구',
    '도봉구',
    '동대문구',
    '동작구',
    '마포구',
    '서대문구',
    '서초구',
    '성동구',
    '성북구',
    '송파구',
    '양천구',
    '영등포구',
    '용산구',
    '은평구',
    '종로구',
    '중구',
    '중랑구',
  ],
  경기: ['전체'],
  부산: ['전체'],
  인천: ['전체'],
  대구: ['전체'],
  대전: ['전체'],
  광주: ['전체'],
  울산: ['전체'],
  세종: ['전체'],
  강원: ['전체'],
  충청북도: ['전체'],
  충청남도: ['전체'],
  전라북도: ['전체'],
  전라남도: ['전체'],
  경상북도: ['전체'],
  경상남도: ['전체'],
  제주: ['전체'],
  해외: ['전체'],
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Step2Region({ data, onUpdate }: OnboardingStepProps) {
  const districts = data.region ? DISTRICT_MAP[data.region] ?? [] : [];
  const isDistrictEnabled = data.region !== '';

  const handleRegionChange = (value: string) => {
    // Reset sub-region whenever province changes
    onUpdate({ region: value, subRegion: '' });
  };

  const handleSubRegionChange = (value: string) => {
    onUpdate({ subRegion: value });
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/[0.03] rounded-[24px] shadow p-[33px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="size-6 text-white" />
        <h2 className="text-[24px] font-bold text-white leading-tight">
          활동하시는 지역을 설정해주세요
        </h2>
      </div>

      {/* Subtitle */}
      <p className="text-[14px] text-[#8b95a1] mb-8">
        주활동지역을 설정해주시면 추후 정보를 제공해드려요.
      </p>

      {/* Region Dropdowns */}
      <div className="space-y-3">
        <Label className="text-[14px] font-semibold text-white">
          활동 지역
        </Label>

        <div className="grid grid-cols-2 gap-[12px]">
          {/* Province / City */}
          <Select value={data.region} onValueChange={handleRegionChange}>
            <SelectTrigger
              className="bg-black border border-white/[0.03] rounded-[16px] h-[56px] text-white data-[placeholder]:text-[#8b95a1] cursor-pointer"
            >
              <SelectValue placeholder="시/도" />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* District */}
          <div
            className={
              isDistrictEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'
            }
          >
            <Select
              value={data.subRegion}
              onValueChange={handleSubRegionChange}
              disabled={!isDistrictEnabled}
            >
              <SelectTrigger
                className="bg-black border border-white/[0.03] rounded-[16px] h-[56px] text-white data-[placeholder]:text-[#8b95a1] cursor-pointer"
              >
                <SelectValue placeholder="구/군" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
