'use client';

import { TrendingUp, Check } from 'lucide-react';

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

type StageOption = { key: string; title: string; description: string };

const STAGES_BY_TYPE: Record<string, StageOption[]> = {
  startup: [
    { key: 'ideation', title: '아이디어 구상', description: '사업 아이디어를 구체화하는 단계' },
    { key: 'validation', title: '시장 검증', description: '아이디어의 시장성을 검증하는 단계' },
    { key: 'mvp', title: 'MVP 개발', description: '최소 기능 제품을 개발하는 단계' },
    { key: 'launch_prep', title: '출시 준비', description: '제품/서비스 출시를 준비하는 단계' },
    { key: 'early_operation', title: '초기 운영', description: '출시 후 초기 시장 진입 단계' },
    { key: 'growth', title: '성장', description: '사용자와 매출이 성장하는 단계' },
    { key: 'expansion', title: '확장', description: '사업을 확장하고 스케일업하는 단계' },
    { key: 'stabilization', title: '안정화 / IPO준비', description: '안정적인 운영 단계' },
  ],
  self_employed: [
    { key: 'preparation', title: '창업 준비', description: '사업 계획 및 자금 준비 단계' },
    { key: 'store_setup', title: '매장 오픈 준비', description: '매장 확보 및 인테리어 단계' },
    { key: 'early_operation', title: '초기 운영', description: '오픈 후 초기 안정화 단계' },
    { key: 'stable_operation', title: '안정적 운영', description: '매출과 고객이 안정된 단계' },
    { key: 'revenue_growth', title: '매출 성장', description: '매출을 적극적으로 확대하는 단계' },
    { key: 'multi_location', title: '다점포 확장', description: '추가 매장을 확장하는 단계' },
    { key: 'franchise', title: '프랜차이즈/브랜드화', description: '브랜드화 또는 프랜차이즈 전환 단계' },
  ],
  employee: [
    { key: 'employed', title: '직장 재직 중', description: '현재 회사에 재직하는 단계' },
    { key: 'career_change', title: '이직/전직 준비', description: '새로운 직장을 준비하는 단계' },
    { key: 'idea_planning', title: '사업 아이디어 구상', description: '창업 아이디어를 구체화하는 단계' },
    { key: 'side_project', title: '부업/사이드 프로젝트', description: '본업 외 수익 활동을 하는 단계' },
    { key: 'resignation_prep', title: '퇴사 준비', description: '독립을 위해 퇴사를 준비하는 단계' },
    { key: 'startup_prep', title: '창업 준비', description: '본격적으로 창업을 준비하는 단계' },
  ],
  freelancer: [
    { key: 'starting', title: '시작 단계', description: '프리랜서로 첫 발을 내딛는 단계' },
    { key: 'portfolio', title: '포트폴리오 구축', description: '작업물과 경력을 쌓는 단계' },
    { key: 'regular_clients', title: '고정 클라이언트 확보', description: '안정적인 고객을 확보하는 단계' },
    { key: 'income_stable', title: '수익 안정화', description: '안정적인 수입을 유지하는 단계' },
    { key: 'business_expansion', title: '사업 확장', description: '서비스 영역을 넓히는 단계' },
    { key: 'team_transition', title: '법인/팀 전환', description: '팀 또는 법인으로 성장하는 단계' },
  ],
  creator: [
    { key: 'content_planning', title: '콘텐츠 기획', description: '콘텐츠 방향성을 설정하는 단계' },
    { key: 'channel_building', title: '채널 구축', description: '플랫폼과 채널을 세팅하는 단계' },
    { key: 'content_production', title: '콘텐츠 제작/업로드', description: '콘텐츠를 꾸준히 만드는 단계' },
    { key: 'audience_growth', title: '구독자/팔로워 성장', description: '팬층을 확대하는 단계' },
    { key: 'monetization', title: '수익화', description: '콘텐츠로 수익을 창출하는 단계' },
    { key: 'brand_expansion', title: '브랜드 확장', description: '개인 브랜드를 확장하는 단계' },
  ],
  agency: [
    { key: 'establishment', title: '설립 준비', description: '에이전시 설립을 준비하는 단계' },
    { key: 'team_building', title: '팀 빌딩', description: '핵심 인력을 확보하는 단계' },
    { key: 'early_clients', title: '초기 클라이언트 확보', description: '첫 고객을 확보하는 단계' },
    { key: 'service_stable', title: '서비스 안정화', description: '서비스 프로세스를 정립하는 단계' },
    { key: 'business_expansion', title: '사업 확장', description: '서비스 영역과 팀을 확장하는 단계' },
    { key: 'global_expansion', title: '대형 프로젝트/글로벌 진출', description: '대규모 프로젝트 수행 및 글로벌 진출 단계' },
  ],
  professional: [
    { key: 'license_prep', title: '자격 준비/수습', description: '자격증 취득 및 수습 단계' },
    { key: 'experience', title: '실무 경험 축적', description: '실무 역량을 쌓는 단계' },
    { key: 'independence_prep', title: '독립 개업 준비', description: '독립 개업을 준비하는 단계' },
    { key: 'opening', title: '개업/초기 운영', description: '독립 후 초기 운영 단계' },
    { key: 'client_stable', title: '고객 확보/안정화', description: '고객을 확보하고 안정화하는 단계' },
    { key: 'practice_expansion', title: '사업 확장', description: '사무소/병원 등을 확장하는 단계' },
  ],
};

// Fallback for when no business type is selected
const DEFAULT_STAGES: StageOption[] = [
  { key: 'ideation', title: '아이디어 구상', description: '사업 아이디어를 구체화하는 단계' },
  { key: 'validation', title: '시장 검증', description: '아이디어의 시장성을 검증하는 단계' },
  { key: 'mvp', title: 'MVP 개발', description: '최소 기능 제품을 개발하는 단계' },
  { key: 'launch_prep', title: '출시 준비', description: '제품/서비스 출시를 준비하는 단계' },
  { key: 'early_operation', title: '초기 운영', description: '출시 후 초기 시장 진입 단계' },
  { key: 'growth', title: '성장', description: '사용자와 매출이 성장하는 단계' },
  { key: 'expansion', title: '확장', description: '사업을 확장하고 스케일업하는 단계' },
  { key: 'stabilization', title: '안정화 / IPO준비', description: '안정적인 운영 단계' },
];

export function Step5BusinessStage({ data, onUpdate }: OnboardingStepProps) {
  const selectedStage = data.businessStage;
  const stages = STAGES_BY_TYPE[data.businessType] || DEFAULT_STAGES;

  const handleSelect = (key: string) => {
    onUpdate({ businessStage: key });
  };

  return (
    <div
      className="bg-[#1a1a1a] border border-white/[0.03] rounded-[24px] shadow"
      style={{ padding: '33px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-6 w-6 text-white" />
        <h2 className="text-2xl font-bold text-white">현재 비즈니스 단계</h2>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-[#8b95a1] mb-6">
        현재 비즈니스의 발전 단계를 선택해주세요 <span>(선택사항)</span>
      </p>

      {/* Stage List */}
      <div className="flex flex-col gap-3">
        {stages.map((stage) => {
          const isSelected = selectedStage === stage.key;

          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => handleSelect(stage.key)}
              className={`
                relative h-[90px] rounded-[16px] text-left transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? 'bg-[rgba(0,112,255,0.5)] border border-[#0070ff] shadow-[0px_0px_20px_0px_rgba(0,229,255,0.3)]'
                    : 'bg-black border border-white/[0.03]'
                }
              `}
            >
              {/* Content */}
              <div
                className="flex flex-col gap-1"
                style={{
                  paddingLeft: isSelected ? '16px' : '20px',
                  paddingTop: '21px',
                }}
              >
                <span
                  className={`font-bold text-base ${
                    isSelected ? 'text-[#0070ff]' : 'text-white'
                  }`}
                >
                  {stage.title}
                </span>
                <span className="font-medium text-sm text-[#8b95a1]">
                  {stage.description}
                </span>
              </div>

              {/* Check Icon (selected only) */}
              {isSelected && (
                <Check
                  className="absolute text-[#0070ff]"
                  size={16}
                  style={{ right: '16px', top: '22px' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
