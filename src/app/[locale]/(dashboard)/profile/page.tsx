'use client';

/**
 * My Page (마이페이지)
 *
 * Two-column layout:
 * - Left sidebar: avatar, name, username, bio, edit/share buttons
 * - Right content: basic info cards, activity tabs, interests tabs, settings
 */

import * as React from 'react';
import {
  Camera,
  Settings,
  MapPin,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';
import { supabase } from '@/lib/supabase/client';
import { Skeleton, SkeletonAvatar } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import {
  EditAboutDialog,
  EditExpertiseDialog,
  ActivityTab,
  BookmarksTab,
} from '@/features/profile/components';

import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

// ---------------------------------------------------------------------------
// Label lookup maps
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
// Helpers
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
  if (subRegion && subRegion !== '전체') return `${region} ${subRegion}`;
  return region;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getBusinessStageNumber(businessType: string | null, stageKey: string | null): string | null {
  if (!businessType || !stageKey) return null;
  const stages = BUSINESS_STAGE_LABELS[businessType];
  if (!stages) return null;
  const keys = Object.keys(stages);
  const idx = keys.indexOf(stageKey);
  if (idx === -1) return null;
  return String(idx + 1).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// Info Card
// ---------------------------------------------------------------------------

function InfoCard({
  icon,
  iconColor,
  iconBg,
  label,
  sublabel,
  cardBg,
  cardBorder,
  textColor,
}: {
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  label: string | null;
  sublabel?: string | null;
  cardBg?: string;
  cardBorder?: string;
  textColor?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border p-5 text-center min-h-[140px]',
        cardBg || 'bg-white/[0.02]',
        cardBorder || 'border-white/[0.08]'
      )}
    >
      {icon && (
        <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-full', iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
      )}
      <p className={cn('text-base font-bold', textColor || 'text-white')}>
        {label || '-'}
      </p>
      {sublabel && (
        <p className="mt-0.5 text-sm text-[#8b95a1]">
          ({sublabel})
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Dialog states
  const [aboutDialogOpen, setAboutDialogOpen] = React.useState(false);
  const [expertiseDialogOpen, setExpertiseDialogOpen] = React.useState(false);

  // Fetch profile
  const fetchProfile = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profileData) return;
      setProfile(profileData as Profile);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith('image/')) { toast.error('이미지 파일만 업로드 가능합니다'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('5MB 이하 이미지만 업로드 가능합니다'); return; }

    try {
      setUploadingAvatar(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);
      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      toast.success('프로필 사진이 업데이트되었습니다');
    } catch {
      toast.error('사진 업로드에 실패했습니다');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAboutUpdate = (updatedData: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const handleExpertiseUpdate = (updatedData: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const handleShareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('프로필 링크가 복사되었습니다');
    } catch {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-[280px] shrink-0">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div className="flex flex-col items-center">
                <SkeletonAvatar size="xl" />
                <Skeleton className="mt-4 h-6 w-24" rounded="md" />
                <Skeleton className="mt-2 h-4 w-20" rounded="md" />
                <Skeleton className="mt-4 h-4 w-full" rounded="md" />
                <Skeleton className="mt-2 h-4 w-3/4" rounded="md" />
                <div className="mt-6 flex w-full gap-3">
                  <Skeleton className="h-10 flex-1" rounded="xl" />
                  <Skeleton className="h-10 flex-1" rounded="xl" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-8">
            <Skeleton className="h-8 w-32" rounded="md" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[140px]" rounded="2xl" />
              ))}
            </div>
            <Skeleton className="h-6 w-24" rounded="md" />
            <Skeleton className="h-[200px] w-full" rounded="2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-muted" />
        <p className="text-muted">프로필을 찾을 수 없습니다</p>
      </div>
    );
  }

  // Derived values
  const displayName = profile.nickname || profile.full_name || '사용자';
  const regionDisplay = getRegionDisplay(profile.region, profile.sub_region);
  const industryLabel = getIndustryLabel(profile.industry);
  const subIndustryLabel = getSubIndustryLabel(profile.industry, profile.sub_industry);
  const businessTypeLabel = getBusinessTypeLabel(profile.business_type);
  const businessStageLabel = getBusinessStageLabel(profile.business_type, profile.business_stage);
  const stageNumber = getBusinessStageNumber(profile.business_type, profile.business_stage);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ============================================================ */}
        {/* LEFT SIDEBAR */}
        {/* ============================================================ */}
        <div className="w-full lg:w-[280px] shrink-0">
          <div className="sticky top-28 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="relative group">
                <Avatar size="xl">
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={displayName} />
                  ) : null}
                  <AvatarFallback>
                    {getInitials(profile.nickname || profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className={cn(
                    'absolute inset-0 flex items-center justify-center rounded-full',
                    'bg-black/60 opacity-0 transition-opacity duration-200',
                    'group-hover:opacity-100 focus:opacity-100',
                    uploadingAvatar && 'opacity-100'
                  )}
                  aria-label="프로필 사진 변경"
                >
                  {uploadingAvatar ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Name */}
              <h2 className="mt-4 text-xl font-bold text-white">{displayName}</h2>

              {/* Username */}
              {profile.username && (
                <p className="mt-1 text-sm text-[#8b95a1]">@{profile.username}</p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-sm leading-relaxed text-[#8b95a1] text-center">
                  {profile.bio}
                </p>
              )}

              {/* Buttons */}
              <div className="mt-6 flex w-full gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl border-white/10 text-white hover:bg-white/5"
                  onClick={() => setAboutDialogOpen(true)}
                >
                  프로필 수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl border-white/10 text-white hover:bg-white/5"
                  onClick={handleShareProfile}
                >
                  프로필 공유
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT CONTENT */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 space-y-10">
          {/* Title + Settings */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">마이페이지</h1>
            <button
              onClick={() => setExpertiseDialogOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-[#8b95a1] transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="설정"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {/* ======================================================== */}
          {/* 기본 정보 */}
          {/* ======================================================== */}
          <section>
            <h3 className="mb-4 text-lg font-bold text-white">기본 정보</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Business Type - accent card */}
              <InfoCard
                icon={null}
                label={businessTypeLabel ? `사업유형 : ${businessTypeLabel}` : '사업유형 미설정'}
                sublabel={businessTypeLabel ? '사업유형에 캐릭터 추후' : null}
                cardBg="bg-red-500/10"
                cardBorder="border-red-500/20"
                textColor="text-red-400"
              />

              {/* Business Stage */}
              <InfoCard
                icon={<div className="h-4 w-4 rounded-full bg-pink-400" />}
                iconBg="bg-transparent"
                iconColor=""
                label={businessStageLabel ? `비즈니스 단계 Stage ${stageNumber}` : '비즈니스 단계 미설정'}
              />

              {/* Region */}
              <InfoCard
                icon={<MapPin className="h-5 w-5" />}
                iconBg="bg-orange-500/10"
                iconColor="text-orange-400"
                label={regionDisplay}
              />

              {/* Industry */}
              <InfoCard
                icon={<Globe className="h-5 w-5" />}
                iconBg="bg-cyan-500/10"
                iconColor="text-cyan-400"
                label={industryLabel || '사업분야 미설정'}
                sublabel={subIndustryLabel || '세부분야'}
              />
            </div>
          </section>

          {/* ======================================================== */}
          {/* 내 활동 */}
          {/* ======================================================== */}
          <section>
            <h3 className="mb-4 text-lg font-bold text-white">내 활동</h3>
            <ActivityTab userId={profile.id} />
          </section>

          {/* ======================================================== */}
          {/* 내 관심 */}
          {/* ======================================================== */}
          <section>
            <h3 className="mb-4 text-lg font-bold text-white">내 관심</h3>
            <BookmarksTab userId={profile.id} />
          </section>
        </div>
      </div>

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
