'use client';

/**
 * Profile Page
 *
 * User profile page with:
 * - Profile completeness percentage calculation based on onboarding fields
 * - Editable sections using Dialog-based forms
 * - Changes persist to database via Supabase
 * - Profile photo upload capability
 * - Activity stats with real data from useUserActivity
 * - Displays onboarding data: username, nickname, region, industry, business_type, business_stage
 * - Stacked sections: Profile details, Activity, Bookmarks
 * - Uses Avatar, Badge, Progress, Accordion from @/components/ui/
 * - All labels use translations from useTranslations('profile')
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Camera,
  Edit2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Landmark,
  TrendingUp,
  AtSign,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, SkeletonAvatar } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

import {
  EditAboutDialog,
  EditExpertiseDialog,
  ActivityTab,
  BookmarksTab,
  CollaborationsTab,
} from '@/features/profile/components';

import { useUserActivity } from '@/features/profile/api/queries';

import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

// ---------------------------------------------------------------------------
// Label lookup maps (matching onboarding data)
// ---------------------------------------------------------------------------

const INDUSTRY_LABELS: Record<string, string> = {
  it: 'IT/소프트웨어',
  fintech: '핀테크',
  healthcare: '헬스케어/바이오',
  education: '교육(에듀테크)',
  ecommerce: '이커머스',
  food: '식품/F&B',
  manufacturing: '제조업',
  logistics: '물류/유통',
  realestate: '부동산/프롭테크',
  entertainment: '엔터테인먼트/미디어',
  environment: '환경/에너지',
  fashion: '패션/뷰티',
  travel: '여행/관광',
  agriculture: '농업/애그테크',
  other: '기타',
};

const SUB_INDUSTRY_LABELS: Record<string, Record<string, string>> = {
  it: { saas: 'SaaS', ai_ml: 'AI/ML', blockchain: '블록체인', security: '보안', cloud: '클라우드', data: '데이터', mobile_app: '모바일앱', web_service: '웹서비스', iot: 'IoT', other: '기타' },
  fintech: { payment: '결제', remittance: '송금', lending: '대출', insurance: '보험', investment: '투자', asset_management: '자산관리', cryptocurrency: '가상화폐', other: '기타' },
  healthcare: { digital_health: '디지털 헬스', biotech: '바이오테크', medical_device: '의료기기', pharma: '제약', wellness: '웰니스', other: '기타' },
  education: { k12: 'K-12', university: '대학/성인교육', language: '어학', coding: '코딩교육', corporate: '기업교육', other: '기타' },
  ecommerce: { b2c: 'B2C', b2b: 'B2B', marketplace: '마켓플레이스', social_commerce: '소셜커머스', subscription: '구독커머스', other: '기타' },
  food: { restaurant: '외식업', delivery: '배달/딜리버리', food_tech: '푸드테크', beverage: '음료', catering: '케이터링', other: '기타' },
  manufacturing: { smart_factory: '스마트 팩토리', materials: '소재/부품', robotics: '로봇', electronics: '전자기기', other: '기타' },
  logistics: { delivery: '배송', warehouse: '물류/창고', supply_chain: '공급망관리', distribution: '유통', other: '기타' },
  realestate: { brokerage: '중개', construction: '건설', interior: '인테리어', management: '부동산관리', other: '기타' },
  entertainment: { content: '콘텐츠', gaming: '게임', music: '음악', video: '영상/OTT', publishing: '출판', other: '기타' },
  environment: { renewable_energy: '재생에너지', waste_management: '폐기물 관리', carbon: '탄소/기후', water: '수자원', other: '기타' },
  fashion: { clothing: '의류', beauty: '뷰티/화장품', accessories: '액세서리', sustainable: '지속가능 패션', other: '기타' },
  travel: { accommodation: '숙박', tour: '투어/여행사', transportation: '교통', experience: '체험/액티비티', other: '기타' },
  agriculture: { smart_farm: '스마트팜', distribution: '농산물 유통', livestock: '축산', fishery: '수산', other: '기타' },
  other: { all: '전체' },
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  startup: '스타트업',
  self_employed: '자영업',
  employee: '직장인/예비',
  freelancer: '프리랜서/N잡러',
  creator: '크리에이터',
  agency: '에이전시',
  professional: '전문직',
};

const BUSINESS_STAGE_LABELS: Record<string, Record<string, string>> = {
  startup: { ideation: '아이디어 구상', validation: '시장 검증', mvp: 'MVP 개발', launch_prep: '출시 준비', early_operation: '초기 운영', growth: '성장', expansion: '확장', stabilization: '안정화 / IPO준비' },
  self_employed: { preparation: '창업 준비', store_setup: '매장 오픈 준비', early_operation: '초기 운영', stable_operation: '안정적 운영', revenue_growth: '매출 성장', multi_location: '다점포 확장', franchise: '프랜차이즈/브랜드화' },
  employee: { employed: '직장 재직 중', career_change: '이직/전직 준비', idea_planning: '사업 아이디어 구상', side_project: '부업/사이드 프로젝트', resignation_prep: '퇴사 준비', startup_prep: '창업 준비' },
  freelancer: { starting: '시작 단계', portfolio: '포트폴리오 구축', regular_clients: '고정 클라이언트 확보', income_stable: '수익 안정화', business_expansion: '사업 확장', team_transition: '법인/팀 전환' },
  creator: { content_planning: '콘텐츠 기획', channel_building: '채널 구축', content_production: '콘텐츠 제작/업로드', audience_growth: '구독자/팔로워 성장', monetization: '수익화', brand_expansion: '브랜드 확장' },
  agency: { establishment: '설립 준비', team_building: '팀 빌딩', early_clients: '초기 클라이언트 확보', service_stable: '서비스 안정화', business_expansion: '사업 확장', global_expansion: '대형 프로젝트/글로벌 진출' },
  professional: { license_prep: '자격 준비/수습', experience: '실무 경험 축적', independence_prep: '독립 개업 준비', opening: '개업/초기 운영', client_stable: '고객 확보/안정화', practice_expansion: '사업 확장' },
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getIndustryLabel(key: string | null): string | null {
  if (!key) return null;
  return INDUSTRY_LABELS[key] || key;
}

function getSubIndustryLabel(industry: string | null, subKey: string | null): string | null {
  if (!industry || !subKey) return null;
  return SUB_INDUSTRY_LABELS[industry]?.[subKey] || subKey;
}

function getBusinessTypeLabel(key: string | null): string | null {
  if (!key) return null;
  return BUSINESS_TYPE_LABELS[key] || key;
}

function getBusinessStageLabel(businessType: string | null, stageKey: string | null): string | null {
  if (!businessType || !stageKey) return null;
  return BUSINESS_STAGE_LABELS[businessType]?.[stageKey] || stageKey;
}

function getRegionDisplay(region: string | null, subRegion: string | null): string | null {
  if (!region) return null;
  if (subRegion && subRegion !== '전체') {
    return `${region} ${subRegion}`;
  }
  return region;
}

/**
 * Get initials from a name for avatar fallback
 */
function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Calculate profile completeness percentage based on onboarding fields
 */
function calculateCompleteness(profile: Profile | null): number {
  if (!profile) return 0;

  const fields = [
    { field: profile.full_name, weight: 15 },
    { field: profile.avatar_url, weight: 10 },
    { field: profile.nickname, weight: 10 },
    { field: profile.username, weight: 10 },
    { field: profile.bio, weight: 10 },
    { field: profile.region, weight: 10 },
    { field: profile.industry, weight: 10 },
    { field: profile.business_type, weight: 10 },
    { field: profile.business_stage, weight: 5 },
    { field: profile.company_name, weight: 5 },
    { field: profile.email, weight: 5 },
  ];

  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const achievedWeight = fields
    .filter((f) => {
      if (typeof f.field === 'boolean') return f.field === true;
      return f.field && String(f.field).trim() !== '';
    })
    .reduce((sum, f) => sum + f.weight, 0);

  return Math.min(100, Math.round((achievedWeight / totalWeight) * 100));
}

/**
 * Info Row Component for displaying profile data
 */
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  const displayValue = value || '-';

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted" />}
        <p className="font-medium text-white">{displayValue}</p>
      </div>
    </div>
  );
}

/**
 * Profile Page Component
 */
export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');

  // State
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Dialog states
  const [aboutDialogOpen, setAboutDialogOpen] = React.useState(false);
  const [expertiseDialogOpen, setExpertiseDialogOpen] = React.useState(false);

  // Fetch profile data
  const fetchProfile = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return;
      }

      // Fetch profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profileData) {
        console.error('Error fetching profile:', error);
        return;
      }

      const typedProfile = profileData as Profile;
      setProfile(typedProfile);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch activity stats with real data
  const { data: activityStats } = useUserActivity(profile?.id);

  // Handle avatar upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));

      toast.success('Profile photo updated');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle about section update
  const handleAboutUpdate = (updatedData: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  // Handle expertise update
  const handleExpertiseUpdate = (updatedData: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  // Calculate completeness directly from profile
  const completeness = calculateCompleteness(profile);

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Title skeleton */}
        <div>
          <Skeleton className="h-8 w-48" rounded="md" />
          <Skeleton className="mt-2 h-4 w-80" rounded="md" />
        </div>

        {/* Profile header card skeleton */}
        <Card variant="elevated" padding="lg">
          <CardContent className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar placeholder with glow effect area */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/5 blur-xl scale-110" />
              <SkeletonAvatar size="xl" className="relative border-4 border-card" />
            </div>

            {/* Profile info */}
            <div className="flex-1 text-center md:text-left">
              <Skeleton className="h-7 w-48" rounded="md" />
              <Skeleton className="mt-1 h-4 w-32" rounded="md" />
              <Skeleton className="mt-2 h-4 w-40" rounded="md" />
              <Skeleton className="mt-3 h-6 w-20 rounded-full" />
            </div>

            {/* Completeness card */}
            <div className="w-full md:w-48">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <Skeleton className="h-4 w-24" rounded="md" />
                <Skeleton className="mt-2 h-8 w-16" rounded="md" />
                <Skeleton className="mt-3 h-2 w-full rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity card skeleton */}
        <Card variant="default" padding="lg">
          <Skeleton className="h-6 w-32" rounded="md" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center"
              >
                <Skeleton className="mx-auto h-8 w-12" rounded="md" />
                <Skeleton className="mx-auto mt-1 h-3 w-16" rounded="md" />
              </div>
            ))}
          </div>
        </Card>

        {/* Profile sections skeleton */}
        <Card variant="default" padding="none">
          <div className="flex items-center gap-2 border-b border-white/[0.08] px-6 py-4">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-5 w-24" rounded="md" />
            <div className="flex-1" />
            <Skeleton className="h-5 w-5" rounded="md" />
          </div>
          <div className="flex items-center gap-2 px-6 py-4">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-5 w-24" rounded="md" />
            <div className="flex-1" />
            <Skeleton className="h-5 w-5" rounded="md" />
          </div>
        </Card>

        {/* Activity skeleton */}
        <Card variant="default" padding="lg">
          <Skeleton className="h-6 w-32" rounded="md" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-20 w-full" rounded="xl" />
            <Skeleton className="h-20 w-full" rounded="xl" />
          </div>
        </Card>

        {/* Bookmarks skeleton */}
        <Card variant="default" padding="lg">
          <Skeleton className="h-6 w-32" rounded="md" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-20 w-full" rounded="xl" />
            <Skeleton className="h-20 w-full" rounded="xl" />
          </div>
        </Card>
      </div>
    );
  }

  // No profile state
  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-muted" />
        <p className="text-muted">Profile not found</p>
      </div>
    );
  }

  // Derived display values
  const displayName = profile.nickname || profile.full_name || 'Anonymous User';
  const regionDisplay = getRegionDisplay(profile.region, profile.sub_region);
  const industryLabel = getIndustryLabel(profile.industry);
  const subIndustryLabel = getSubIndustryLabel(profile.industry, profile.sub_industry);
  const businessTypeLabel = getBusinessTypeLabel(profile.business_type);
  const businessStageLabel = getBusinessStageLabel(profile.business_type, profile.business_stage);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl font-bold text-white">{t('title')}</h1>
        <p className="mt-2 text-muted">{t('completenessDescription')}</p>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card variant="elevated" padding="lg">
          <CardContent className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar with upload */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-110" />
              <Avatar size="xl" className="relative border-4 border-card">
                {profile.avatar_url ? (
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={displayName}
                  />
                ) : null}
                <AvatarFallback>
                  {getInitials(profile.nickname || profile.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className={cn(
                  'absolute inset-0 flex items-center justify-center rounded-full',
                  'bg-black/60 opacity-0 transition-opacity duration-200',
                  'group-hover:opacity-100',
                  'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary',
                  uploadingAvatar && 'opacity-100'
                )}
                aria-label={t('avatar.change')}
              >
                {uploadingAvatar ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                aria-label={t('avatar.upload')}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h2 className="text-3xl font-bold text-white">
                  {displayName}
                </h2>
                {profile.approval_status === 'approved' && (
                  <Badge variant="success" size="sm" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {tCommon('approved')}
                  </Badge>
                )}
                {profile.approval_status === 'pending' && (
                  <Badge variant="warning" size="sm">
                    {tCommon('pending')}
                  </Badge>
                )}
              </div>

              {/* Username */}
              {profile.username && (
                <p className="mt-1 text-base text-muted">@{profile.username}</p>
              )}

              {/* Company */}
              {profile.company_name && (
                <p className="mt-1 text-muted">{profile.company_name}</p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="mt-2 text-sm text-white/80">{profile.bio}</p>
              )}

              {/* Tags row: business type, region */}
              <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                {/* Role badge */}
                <Badge variant="default" size="md">
                  {profile.role === 'admin'
                    ? 'Administrator'
                    : profile.role === 'expert'
                      ? 'Expert'
                      : 'Member'}
                </Badge>
                {businessTypeLabel && (
                  <Badge variant="default" size="md">
                    {businessTypeLabel}
                  </Badge>
                )}
                {regionDisplay && (
                  <Badge variant="default" size="md">
                    {regionDisplay}
                  </Badge>
                )}
              </div>
            </div>

            {/* Completeness */}
            <div className="w-full md:w-48">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-base font-medium text-muted">
                  {t('completeness')}
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">
                    {completeness}%
                  </span>
                </div>
                <Progress
                  value={completeness}
                  size="md"
                  indicatorColor={
                    completeness >= 80
                      ? 'success'
                      : completeness >= 50
                        ? 'warning'
                        : 'primary'
                  }
                  className="mt-3"
                />
                {completeness < 100 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 p-0 h-auto text-sm"
                  >
                    {t('completeProfile')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>{t('activity.title')}</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {activityStats?.postCount ?? 0}
                </p>
                <p className="mt-1 text-sm text-muted">{t('activity.posts')}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {activityStats?.commentCount ?? 0}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {t('activity.comments')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {activityStats?.likeCount ?? 0}
                </p>
                <p className="mt-1 text-sm text-muted">{t('activity.likes')}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {activityStats?.bookmarkCount ?? 0}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {t('activity.bookmarks')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card variant="default" padding="none">
          <Accordion type="multiple" defaultValue={['about']} className="w-full">
            {/* About Section */}
            <AccordionItem value="about" className="border-white/[0.08] px-6">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>{t('sections.about')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAboutDialogOpen(true)}
                      leftIcon={<Edit2 className="h-4 w-4" />}
                    >
                      {tCommon('edit')}
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow
                      icon={User}
                      label={t('fields.name')}
                      value={profile.full_name}
                    />
                    <InfoRow
                      icon={AtSign}
                      label="닉네임"
                      value={profile.nickname}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow
                      icon={AtSign}
                      label="사용자명"
                      value={profile.username ? `@${profile.username}` : null}
                    />
                    <InfoRow
                      icon={Building2}
                      label={t('fields.company')}
                      value={profile.company_name}
                    />
                  </div>
                  <InfoRow
                    icon={Mail}
                    label={t('fields.email')}
                    value={profile.email}
                  />
                  {profile.bio && (
                    <InfoRow
                      label={t('fields.bio')}
                      value={profile.bio}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Expertise / Business Info Section */}
            <AccordionItem value="expertise" className="border-white/[0.08] border-b-0 px-6">
              <AccordionTrigger className="text-white hover:no-underline">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span>{t('sections.expertise')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpertiseDialogOpen(true)}
                      leftIcon={<Edit2 className="h-4 w-4" />}
                    >
                      {tCommon('edit')}
                    </Button>
                  </div>
                  {profile.industry ||
                  profile.business_type ||
                  profile.region ? (
                    <div className="space-y-4">
                      {/* Industry */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <InfoRow
                          icon={Landmark}
                          label="사업 분야"
                          value={industryLabel}
                        />
                        <InfoRow
                          label="세부 분야"
                          value={subIndustryLabel}
                        />
                      </div>

                      {/* Business Type & Stage */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <InfoRow
                          icon={Briefcase}
                          label="사업 유형"
                          value={businessTypeLabel}
                        />
                        <InfoRow
                          icon={TrendingUp}
                          label="비즈니스 단계"
                          value={businessStageLabel}
                        />
                      </div>

                      {/* Region */}
                      <InfoRow
                        icon={MapPin}
                        label="활동 지역"
                        value={regionDisplay}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <p className="text-base text-muted">
                        사업/전문 분야 정보가 아직 등록되지 않았습니다.
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 p-0 h-auto"
                        onClick={() => setExpertiseDialogOpen(true)}
                      >
                        정보 등록하기
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </motion.div>

      {/* Collaboration Requests Section (Expert only) */}
      {profile.role === 'expert' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <CollaborationsTab userId={profile.id} />
        </motion.div>
      )}

      {/* Activity Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: profile.role === 'expert' ? 0.5 : 0.4 }}
      >
        <ActivityTab userId={profile.id} />
      </motion.div>

      {/* Bookmarks Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: profile.role === 'expert' ? 0.6 : 0.5 }}
      >
        <BookmarksTab userId={profile.id} />
      </motion.div>

      {/* Edit Dialogs */}
      <EditAboutDialog
        open={aboutDialogOpen}
        onOpenChange={setAboutDialogOpen}
        profile={profile}
        onSuccess={handleAboutUpdate}
      />

      <EditExpertiseDialog
        open={expertiseDialogOpen}
        onOpenChange={setExpertiseDialogOpen}
        profile={profile}
        onSuccess={handleExpertiseUpdate}
      />
    </div>
  );
}
