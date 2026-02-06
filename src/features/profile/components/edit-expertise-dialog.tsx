'use client';

/**
 * Edit Expertise Dialog Component
 *
 * Dialog for editing business/expertise profile fields that match the onboarding data:
 * - industry + sub_industry (from onboarding step 3)
 * - business_type (from onboarding step 4)
 * - business_stage (from onboarding step 5)
 * - region + sub_region (from onboarding step 2)
 *
 * All fields persist to the Supabase `profiles` table.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase } from 'lucide-react';
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
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';

import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

// ---------------------------------------------------------------------------
// Data maps (same as onboarding)
// ---------------------------------------------------------------------------

const INDUSTRIES = [
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
] as const;

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
  other: [{ key: 'all', label: '전체' }],
};

const BUSINESS_TYPES = [
  { key: 'startup', label: '스타트업' },
  { key: 'self_employed', label: '자영업' },
  { key: 'employee', label: '직장인/예비' },
  { key: 'freelancer', label: '프리랜서/N잡러' },
  { key: 'creator', label: '크리에이터' },
  { key: 'agency', label: '에이전시' },
  { key: 'professional', label: '전문직' },
] as const;

type StageOption = { key: string; title: string };

const STAGES_BY_TYPE: Record<string, StageOption[]> = {
  startup: [
    { key: 'ideation', title: '아이디어 구상' },
    { key: 'validation', title: '시장 검증' },
    { key: 'mvp', title: 'MVP 개발' },
    { key: 'launch_prep', title: '출시 준비' },
    { key: 'early_operation', title: '초기 운영' },
    { key: 'growth', title: '성장' },
    { key: 'expansion', title: '확장' },
    { key: 'stabilization', title: '안정화 / IPO준비' },
  ],
  self_employed: [
    { key: 'preparation', title: '창업 준비' },
    { key: 'store_setup', title: '매장 오픈 준비' },
    { key: 'early_operation', title: '초기 운영' },
    { key: 'stable_operation', title: '안정적 운영' },
    { key: 'revenue_growth', title: '매출 성장' },
    { key: 'multi_location', title: '다점포 확장' },
    { key: 'franchise', title: '프랜차이즈/브랜드화' },
  ],
  employee: [
    { key: 'employed', title: '직장 재직 중' },
    { key: 'career_change', title: '이직/전직 준비' },
    { key: 'idea_planning', title: '사업 아이디어 구상' },
    { key: 'side_project', title: '부업/사이드 프로젝트' },
    { key: 'resignation_prep', title: '퇴사 준비' },
    { key: 'startup_prep', title: '창업 준비' },
  ],
  freelancer: [
    { key: 'starting', title: '시작 단계' },
    { key: 'portfolio', title: '포트폴리오 구축' },
    { key: 'regular_clients', title: '고정 클라이언트 확보' },
    { key: 'income_stable', title: '수익 안정화' },
    { key: 'business_expansion', title: '사업 확장' },
    { key: 'team_transition', title: '법인/팀 전환' },
  ],
  creator: [
    { key: 'content_planning', title: '콘텐츠 기획' },
    { key: 'channel_building', title: '채널 구축' },
    { key: 'content_production', title: '콘텐츠 제작/업로드' },
    { key: 'audience_growth', title: '구독자/팔로워 성장' },
    { key: 'monetization', title: '수익화' },
    { key: 'brand_expansion', title: '브랜드 확장' },
  ],
  agency: [
    { key: 'establishment', title: '설립 준비' },
    { key: 'team_building', title: '팀 빌딩' },
    { key: 'early_clients', title: '초기 클라이언트 확보' },
    { key: 'service_stable', title: '서비스 안정화' },
    { key: 'business_expansion', title: '사업 확장' },
    { key: 'global_expansion', title: '대형 프로젝트/글로벌 진출' },
  ],
  professional: [
    { key: 'license_prep', title: '자격 준비/수습' },
    { key: 'experience', title: '실무 경험 축적' },
    { key: 'independence_prep', title: '독립 개업 준비' },
    { key: 'opening', title: '개업/초기 운영' },
    { key: 'client_stable', title: '고객 확보/안정화' },
    { key: 'practice_expansion', title: '사업 확장' },
  ],
};

const DEFAULT_STAGES: StageOption[] = [
  { key: 'ideation', title: '아이디어 구상' },
  { key: 'validation', title: '시장 검증' },
  { key: 'mvp', title: 'MVP 개발' },
  { key: 'launch_prep', title: '출시 준비' },
  { key: 'early_operation', title: '초기 운영' },
  { key: 'growth', title: '성장' },
  { key: 'expansion', title: '확장' },
  { key: 'stabilization', title: '안정화 / IPO준비' },
];

const PROVINCES = [
  '서울', '경기', '부산', '인천', '대구', '대전', '광주', '울산', '세종',
  '강원', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도',
  '제주', '해외',
] as const;

const DISTRICT_MAP: Record<string, string[]> = {
  서울: [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
    '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구',
  ],
  경기: ['전체'], 부산: ['전체'], 인천: ['전체'], 대구: ['전체'], 대전: ['전체'],
  광주: ['전체'], 울산: ['전체'], 세종: ['전체'], 강원: ['전체'],
  충청북도: ['전체'], 충청남도: ['전체'], 전라북도: ['전체'], 전라남도: ['전체'],
  경상북도: ['전체'], 경상남도: ['전체'], 제주: ['전체'], 해외: ['전체'],
};

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const expertiseFormSchema = z.object({
  industry: z.string().optional().nullable(),
  sub_industry: z.string().optional().nullable(),
  business_type: z.string().optional().nullable(),
  business_stage: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  sub_region: z.string().optional().nullable(),
});

type ExpertiseFormValues = z.infer<typeof expertiseFormSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditExpertiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onSuccess: (updatedProfile: Partial<Profile>) => void;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditExpertiseDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
  isLoading,
}: EditExpertiseDialogProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');

  const form = useForm<ExpertiseFormValues>({
    resolver: zodResolver(expertiseFormSchema),
    defaultValues: {
      industry: profile.industry || '',
      sub_industry: profile.sub_industry || '',
      business_type: profile.business_type || '',
      business_stage: profile.business_stage || '',
      region: profile.region || '',
      sub_region: profile.sub_region || '',
    },
  });

  const watchedIndustry = form.watch('industry');
  const watchedBusinessType = form.watch('business_type');
  const watchedRegion = form.watch('region');

  // Derived options
  const subIndustries = watchedIndustry ? SUB_INDUSTRY_MAP[watchedIndustry] ?? [] : [];
  const businessStages = watchedBusinessType
    ? STAGES_BY_TYPE[watchedBusinessType] ?? DEFAULT_STAGES
    : DEFAULT_STAGES;
  const districts = watchedRegion ? DISTRICT_MAP[watchedRegion] ?? [] : [];

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        industry: profile.industry || '',
        sub_industry: profile.sub_industry || '',
        business_type: profile.business_type || '',
        business_stage: profile.business_stage || '',
        region: profile.region || '',
        sub_region: profile.sub_region || '',
      });
    }
  }, [open, profile, form]);

  const onSubmit = async (values: ExpertiseFormValues) => {
    try {
      const updateData: Partial<Profile> = {
        industry: values.industry || null,
        sub_industry: values.sub_industry || null,
        business_type: values.business_type || null,
        business_stage: values.business_stage || null,
        region: values.region || null,
        sub_region: values.sub_region || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      onSuccess(updateData);
      onOpenChange(false);
      toast.success(t('updateSuccess'));
    } catch (error) {
      console.error('Error updating expertise:', error);
      toast.error(t('updateFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {t('sections.expertise')}
          </DialogTitle>
          <DialogDescription>
            사업 분야 및 활동 지역 정보를 수정하세요.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton variant="lighter" className="h-4 w-20" />
                <Skeleton variant="lighter" className="h-10 w-full rounded-xl" />
              </div>
            ))}
            <DialogFooter>
              <Skeleton variant="lighter" className="h-10 w-20" />
              <Skeleton variant="lighter" className="h-10 w-20" />
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Industry */}
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사업 분야</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset sub_industry when industry changes
                        form.setValue('sub_industry', '');
                      }}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="대분류 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRIES.map((item) => (
                          <SelectItem key={item.key} value={item.key}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sub Industry */}
              <FormField
                control={form.control}
                name="sub_industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>세부 분야</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={subIndustries.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="소분류 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subIndustries.map((item) => (
                          <SelectItem key={item.key} value={item.key}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Type */}
              <FormField
                control={form.control}
                name="business_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사업 유형</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset business_stage when type changes
                        form.setValue('business_stage', '');
                      }}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="사업 유형 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUSINESS_TYPES.map((item) => (
                          <SelectItem key={item.key} value={item.key}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Stage */}
              <FormField
                control={form.control}
                name="business_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비즈니스 단계</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="비즈니스 단계 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessStages.map((item) => (
                          <SelectItem key={item.key} value={item.key}>
                            {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Region */}
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>활동 지역</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset sub_region when region changes
                        form.setValue('sub_region', '');
                      }}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="시/도 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sub Region */}
              <FormField
                control={form.control}
                name="sub_region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>세부 지역</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={districts.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="구/군 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
