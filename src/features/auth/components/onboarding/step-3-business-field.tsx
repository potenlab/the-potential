'use client';

import { Landmark } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Step 3: Business Field
 *
 * Collects the user's primary industry and sub-industry.
 * The sub-industry dropdown is dependent on the selected industry and stays
 * disabled until an industry is chosen.
 */

// ---------------------------------------------------------------------------
// Data constants
// ---------------------------------------------------------------------------

interface IndustryOption {
  key: string;
  label: string;
}

const INDUSTRIES: IndustryOption[] = [
  { key: 'it', label: 'IT/소프트웨어' },
  { key: 'fintech', label: '핀테크' },
  { key: 'healthcare', label: '헬스케어/바이오' },
  { key: 'education', label: '교육(에듀테크)' },
  { key: 'ecommerce', label: '이커머스' },
  { key: 'food', label: '식품/F&B' },
  { key: 'manufacturing', label: '제조업' },
  { key: 'logistics', label: '물류/유통' },
  { key: 'realestate', label: '부동산/프롭테크' },
  { key: 'entertainment', label: '엔터테인먼트/미디어' },
  { key: 'environment', label: '환경/에너지' },
  { key: 'fashion', label: '패션/뷰티' },
  { key: 'travel', label: '여행/관광' },
  { key: 'agriculture', label: '농업/애그테크' },
  { key: 'other', label: '기타' },
];

const SUB_INDUSTRY_MAP: Record<string, { key: string; label: string }[]> = {
  it: [
    { key: 'saas', label: 'SaaS' },
    { key: 'ai_ml', label: 'AI/ML' },
    { key: 'blockchain', label: '블록체인' },
    { key: 'security', label: '보안' },
    { key: 'cloud', label: '클라우드' },
    { key: 'data', label: '데이터' },
    { key: 'mobile_app', label: '모바일앱' },
    { key: 'web_service', label: '웹서비스' },
    { key: 'iot', label: 'IoT' },
    { key: 'other', label: '기타' },
  ],
  fintech: [
    { key: 'payment', label: '결제' },
    { key: 'remittance', label: '송금' },
    { key: 'lending', label: '대출' },
    { key: 'insurance', label: '보험' },
    { key: 'investment', label: '투자' },
    { key: 'asset_management', label: '자산관리' },
    { key: 'cryptocurrency', label: '가상화폐' },
    { key: 'other', label: '기타' },
  ],
  healthcare: [
    { key: 'digital_health', label: '디지털 헬스' },
    { key: 'biotech', label: '바이오테크' },
    { key: 'medical_device', label: '의료기기' },
    { key: 'pharma', label: '제약' },
    { key: 'wellness', label: '웰니스' },
    { key: 'other', label: '기타' },
  ],
  education: [
    { key: 'k12', label: 'K-12' },
    { key: 'university', label: '대학/성인교육' },
    { key: 'language', label: '어학' },
    { key: 'coding', label: '코딩교육' },
    { key: 'corporate', label: '기업교육' },
    { key: 'other', label: '기타' },
  ],
  ecommerce: [
    { key: 'b2c', label: 'B2C' },
    { key: 'b2b', label: 'B2B' },
    { key: 'marketplace', label: '마켓플레이스' },
    { key: 'social_commerce', label: '소셜커머스' },
    { key: 'subscription', label: '구독커머스' },
    { key: 'other', label: '기타' },
  ],
  food: [
    { key: 'restaurant', label: '외식업' },
    { key: 'delivery', label: '배달/딜리버리' },
    { key: 'food_tech', label: '푸드테크' },
    { key: 'beverage', label: '음료' },
    { key: 'catering', label: '케이터링' },
    { key: 'other', label: '기타' },
  ],
  manufacturing: [
    { key: 'smart_factory', label: '스마트 팩토리' },
    { key: 'materials', label: '소재/부품' },
    { key: 'robotics', label: '로봇' },
    { key: 'electronics', label: '전자기기' },
    { key: 'other', label: '기타' },
  ],
  logistics: [
    { key: 'delivery', label: '배송' },
    { key: 'warehouse', label: '물류/창고' },
    { key: 'supply_chain', label: '공급망관리' },
    { key: 'distribution', label: '유통' },
    { key: 'other', label: '기타' },
  ],
  realestate: [
    { key: 'brokerage', label: '중개' },
    { key: 'construction', label: '건설' },
    { key: 'interior', label: '인테리어' },
    { key: 'management', label: '부동산관리' },
    { key: 'other', label: '기타' },
  ],
  entertainment: [
    { key: 'content', label: '콘텐츠' },
    { key: 'gaming', label: '게임' },
    { key: 'music', label: '음악' },
    { key: 'video', label: '영상/OTT' },
    { key: 'publishing', label: '출판' },
    { key: 'other', label: '기타' },
  ],
  environment: [
    { key: 'renewable_energy', label: '재생에너지' },
    { key: 'waste_management', label: '폐기물 관리' },
    { key: 'carbon', label: '탄소/기후' },
    { key: 'water', label: '수자원' },
    { key: 'other', label: '기타' },
  ],
  fashion: [
    { key: 'clothing', label: '의류' },
    { key: 'beauty', label: '뷰티/화장품' },
    { key: 'accessories', label: '액세서리' },
    { key: 'sustainable', label: '지속가능 패션' },
    { key: 'other', label: '기타' },
  ],
  travel: [
    { key: 'accommodation', label: '숙박' },
    { key: 'tour', label: '투어/여행사' },
    { key: 'transportation', label: '교통' },
    { key: 'experience', label: '체험/액티비티' },
    { key: 'other', label: '기타' },
  ],
  agriculture: [
    { key: 'smart_farm', label: '스마트팜' },
    { key: 'distribution', label: '농산물 유통' },
    { key: 'livestock', label: '축산' },
    { key: 'fishery', label: '수산' },
    { key: 'other', label: '기타' },
  ],
  other: [
    { key: 'all', label: '전체' },
  ],
};

// ---------------------------------------------------------------------------
// Component
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

export function Step3BusinessField({ data, onUpdate }: OnboardingStepProps) {
  const subIndustries = data.industry
    ? SUB_INDUSTRY_MAP[data.industry] ?? []
    : [];
  const isSubDisabled = !data.industry;

  const handleIndustryChange = (value: string) => {
    // Reset sub-industry whenever the main industry changes
    onUpdate({ industry: value, subIndustry: '' });
  };

  const handleSubIndustryChange = (value: string) => {
    onUpdate({ subIndustry: value });
  };

  return (
    <div className="w-full bg-[#1a1a1a] border border-white/[0.03] rounded-[24px] shadow-lg p-[33px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Landmark className="size-7 text-white" />
        <h2 className="text-[24px] font-bold text-white leading-tight">
          사업하는 주 분야를 설정해주세요
        </h2>
      </div>

      {/* Subtitle */}
      <p className="text-[14px] text-[#8b95a1] mb-8">
        주 사업 분야를 설정해주시면 추후 정보를 제공해드려요.
      </p>

      {/* Business Field Dropdowns */}
      <div className="space-y-3">
        <Label className="text-[14px] font-semibold text-white">
          사업 분야
        </Label>

        <div className="grid grid-cols-2 gap-[12px]">
          {/* Main Category (대분류) */}
          <Select value={data.industry} onValueChange={handleIndustryChange}>
            <SelectTrigger
              className="bg-black border border-white/[0.03] rounded-[16px] h-[56px] text-white cursor-pointer"
            >
              <SelectValue placeholder="대분류" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((item) => (
                <SelectItem key={item.key} value={item.key}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sub Category (소분류) */}
          <Select
            value={data.subIndustry}
            onValueChange={handleSubIndustryChange}
            disabled={isSubDisabled}
          >
            <SelectTrigger
              className={`bg-black border border-white/[0.03] rounded-[16px] h-[56px] text-white cursor-pointer ${
                isSubDisabled ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <SelectValue placeholder="소분류" />
            </SelectTrigger>
            <SelectContent>
              {subIndustries.map((item) => (
                <SelectItem key={item.key} value={item.key}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
