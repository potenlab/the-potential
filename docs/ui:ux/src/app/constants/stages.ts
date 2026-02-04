import { UserCategory } from './categories';

// 창업 단계 정의
export enum EntrepreneurStage {
  IDEA = 0,           // 아이디어 구상 (예비 창업자)
  MVP = 1,            // MVP 개발 및 검증 단계
  LAUNCH = 2,         // 초기 출시 및 시장 반응 확인 (PMF 찾기)
  GROWTH = 3,         // 매출 발생 및 초기 투자 유치 (시드~시리즈 A)
  SCALE = 4,          // 비즈니스 확장 및 스케일업 (시리즈 B 이상)
  DOMINATE = 5,       // 시장 지배 및 시스템 완성 (시리즈 C 이상 / 전국 브랜드)
  EXIT = 6,           // 엑싯(Exit) 경험자 또는 연쇄 창업가
}

// 비즈니스 유형 정의
export enum BusinessType {
  STARTUP = 'startup',     // 스타트업 (투자형)
  BUSINESS = 'business',   // 자영업 / 일반 사업 (매출형)
  HYBRID = 'hybrid',       // 하이브리드 (두 가지 모두)
}

// Stage 5 타입 구분 (deprecated - 이제 BusinessType으로 통합)
export enum Stage5Type {
  INVESTMENT = 'investment', // 투자형
  REVENUE = 'revenue',       // 매출형
}

// 비즈니스 정보 인터페이스
export interface BusinessInfo {
  id: string;
  name: string;
  type: BusinessType;
  stage: EntrepreneurStage; // 0-6 integer 값
  description: string;
  industry: string;
  foundedYear: number;
  isPrimary: boolean; // 메인 사업 여부
}

// 하이브리드 유저를 위한 인터페이스
export interface HybridProfile {
  startupStage: EntrepreneurStage; // 스타트업 트랙 Stage
  businessStage: EntrepreneurStage; // 자영업 트랙 Stage
}

// 타입별 스테이지 레이블 매핑 테이블
export interface StageLabel {
  stage: EntrepreneurStage;
  startupLabel: string;      // 스타트업 (투자형)
  businessLabel: string;     // 자영업 (매출형)
  commonKeyword: string;     // 공통 키워드
  startupDescription: string;
  businessDescription: string;
  icon: string;
  color: string;
  glowColor: string;
  // StageCard 호환성을 위한 추가 필드
  label: string;             // 기본 레이블 (스타트업 기준)
  shortLabel: string;        // 짧은 레이블 (Stage 0, Stage 1 등)
  description: string;       // 기본 설명 (스타트업 기준)
  criteria: string[];        // 단계별 특징
}

export const STAGE_LABELS_BY_TYPE: Record<EntrepreneurStage, StageLabel> = {
  [EntrepreneurStage.IDEA]: {
    stage: EntrepreneurStage.IDEA,
    startupLabel: '예비 창업자',
    businessLabel: '예비 사장님',
    commonKeyword: '준비',
    startupDescription: '아이디어 구체화 및 시장 조사',
    businessDescription: '창업 준비 및 입지 분석',
    icon: '💡',
    color: '#9CA3AF',
    glowColor: 'rgba(156, 163, 175, 0.3)',
    label: '예비 창업자',
    shortLabel: 'Stage 0',
    description: '아이디어 구체화 및 시장 조사',
    criteria: ['비즈니스 아이디어 구상', '시장 조사 및 타겟 분석', '사업 계획서 작성', '초기 자금 계획'],
  },
  [EntrepreneurStage.MVP]: {
    stage: EntrepreneurStage.MVP,
    startupLabel: '제품 출시',
    businessLabel: '오픈 및 첫 매출',
    commonKeyword: '시작',
    startupDescription: 'MVP 출시 및 초기 유저 확보',
    businessDescription: '정식 오픈 및 첫 매출 발생',
    icon: '🔨',
    color: '#60A5FA',
    glowColor: 'rgba(96, 165, 250, 0.3)',
    label: '제품 출시',
    shortLabel: 'Stage 1',
    description: 'MVP 출시 및 초기 유저 확보',
    criteria: ['MVP 또는 정식 오픈 완료', '첫 고객/유저 확보', '피드백 수집 시작', '비즈니스 모델 검증'],
  },
  [EntrepreneurStage.LAUNCH]: {
    stage: EntrepreneurStage.LAUNCH,
    startupLabel: 'PMF 검증',
    businessLabel: '단골 확보',
    commonKeyword: '생존',
    startupDescription: 'PMF 확인 및 핵심 지표 검증',
    businessDescription: '단골 고객 확보 및 BEP 도전',
    icon: '🚀',
    color: '#0079FF',
    glowColor: 'rgba(0, 121, 255, 0.3)',
    label: 'PMF 검증',
    shortLabel: 'Stage 2',
    description: 'PMF 확인 및 핵심 지표 검증',
    criteria: ['제품-시장 적합성 확인', '핵심 지표(KPI) 검증', '반복 구매 고객 확보', '손익분기점 도전'],
  },
  [EntrepreneurStage.GROWTH]: {
    stage: EntrepreneurStage.GROWTH,
    startupLabel: '투자 유치',
    businessLabel: '순수익 달성',
    commonKeyword: '안정',
    startupDescription: '시드~시리즈 A 투자 유치',
    businessDescription: '안정적인 순수익 달성',
    icon: '📈',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    label: '투자 유치',
    shortLabel: 'Stage 3',
    description: '시드~시리즈 A 투자 유치',
    criteria: ['시드 또는 시리즈 A 투자 유치', '안정적인 순수익 달성', '팀 확장 시작', '비즈니스 모델 안정화'],
  },
  [EntrepreneurStage.SCALE]: {
    stage: EntrepreneurStage.SCALE,
    startupLabel: '공격적 성장',
    businessLabel: '직영점 확장',
    commonKeyword: '확장',
    startupDescription: '시리즈 B~C 투자 및 팀 확대',
    businessDescription: '2·3호점 및 직영점 확장',
    icon: '⚡',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    label: '공격적 성장',
    shortLabel: 'Stage 4',
    description: '시리즈 B~C 투자 및 팀 확대',
    criteria: ['시리즈 B 이상 투자', '지점 확장 또는 규모 확대', '조직 체계화', '시장 점유율 확대'],
  },
  [EntrepreneurStage.DOMINATE]: {
    stage: EntrepreneurStage.DOMINATE,
    startupLabel: '예비 유니콘',
    businessLabel: '전국 브랜드',
    commonKeyword: '성숙',
    startupDescription: '시장 지배 및 IPO 준비',
    businessDescription: '전국구 브랜드 및 시스템 자동화',
    icon: '🏆',
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    label: '예비 유니콘',
    shortLabel: 'Stage 5',
    description: '시장 지배 및 IPO 준비',
    criteria: ['시리즈 C 이상 또는 IPO 준비', '전국구 브랜드 구축', '시스템 자동화 완료', '시장 선도 기업'],
  },
  [EntrepreneurStage.EXIT]: {
    stage: EntrepreneurStage.EXIT,
    startupLabel: '엑싯 성공',
    businessLabel: '사업가 전환',
    commonKeyword: '완성',
    startupDescription: 'M&A 또는 IPO 성공',
    businessDescription: '사업 매각 및 자산가 전환',
    icon: '👑',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    label: '엑싯 성공',
    shortLabel: 'Stage 6',
    description: 'M&A 또는 IPO 성공',
    criteria: ['M&A 또는 IPO 성공', '사업 매각 완료', '연쇄 창업가 또는 투자자 전환', '멘토 역할 수행'],
  },
};

// 타입에 맞는 Stage 레이블 가져오기
export function getStageLabel(stage: EntrepreneurStage, type: BusinessType): string {
  const stageLabel = STAGE_LABELS_BY_TYPE[stage];
  
  if (type === BusinessType.STARTUP) {
    return stageLabel.startupLabel;
  } else if (type === BusinessType.BUSINESS) {
    return stageLabel.businessLabel;
  } else {
    // HYBRID는 컨텍스트에 따라 호출 시 명시
    return stageLabel.commonKeyword;
  }
}

// 타입에 맞는 Stage 설명 가져오기
export function getStageDescription(stage: EntrepreneurStage, type: BusinessType): string {
  const stageLabel = STAGE_LABELS_BY_TYPE[stage];
  
  if (type === BusinessType.STARTUP) {
    return stageLabel.startupDescription;
  } else if (type === BusinessType.BUSINESS) {
    return stageLabel.businessDescription;
  } else {
    return `${stageLabel.startupDescription} / ${stageLabel.businessDescription}`;
  }
}

// 매칭 알고리즘을 위한 유틸리티
export function getRecommendedStages(currentStage: EntrepreneurStage): EntrepreneurStage[] {
  const recommended: EntrepreneurStage[] = [currentStage];
  
  // 동일 단계와 한 단계 위/아래 추천
  if (currentStage > 0) {
    recommended.push(currentStage - 1);
  }
  if (currentStage < 6) {
    recommended.push(currentStage + 1);
  }
  
  // Stage 6 (Exit)은 모든 단계와 매칭 가능
  if (currentStage === EntrepreneurStage.EXIT) {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  
  return recommended;
}

export function isExitFounder(stage: EntrepreneurStage): boolean {
  return stage === EntrepreneurStage.EXIT;
}

export function isMasterFounder(stage: EntrepreneurStage): boolean {
  return stage === EntrepreneurStage.DOMINATE || stage === EntrepreneurStage.EXIT;
}

// 비즈니스 타입별 아이콘 및 색상
export const BUSINESS_TYPE_INFO = {
  [BusinessType.STARTUP]: {
    icon: '🚀',
    label: '스타트업',
    bgColor: 'from-primary/20 via-primary/10 to-card',
    borderColor: 'border-primary/40',
    textColor: 'text-primary',
    description: '투자 기반 고성장 비즈니스',
  },
  [BusinessType.BUSINESS]: {
    icon: '🏪',
    label: '자영업/일반 사업',
    bgColor: 'from-emerald-500/20 via-emerald-500/10 to-card',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    description: '매출 기반 수익형 비즈니스',
  },
};

// 영향력 점수 계산 (Stage 가중치)
export function calculateInfluenceScore(stage: EntrepreneurStage): number {
  const stageWeights: Record<EntrepreneurStage, number> = {
    [EntrepreneurStage.IDEA]: 10,
    [EntrepreneurStage.MVP]: 20,
    [EntrepreneurStage.LAUNCH]: 35,
    [EntrepreneurStage.GROWTH]: 50,
    [EntrepreneurStage.SCALE]: 70,
    [EntrepreneurStage.DOMINATE]: 90,
    [EntrepreneurStage.EXIT]: 100,
  };
  
  return stageWeights[stage] || 0;
}

// 멀티 비즈니스 영향력 점수 합산
export function calculateTotalInfluence(businesses: BusinessInfo[]): number {
  if (businesses.length === 0) return 0;
  
  // 각 비즈니스의 영향력 점수 합산
  const totalScore = businesses.reduce((sum, business) => {
    return sum + calculateInfluenceScore(business.stage);
  }, 0);
  
  // 평균 내고 보너스 추가 (멀티 비즈니스 운영 보너스)
  const averageScore = totalScore / businesses.length;
  const multiBusinessBonus = businesses.length > 1 ? 15 : 0;
  
  return Math.min(100, Math.round(averageScore + multiBusinessBonus));
}

// 영향력 등급 판정
export function getInfluenceLevel(score: number): {
  level: string;
  color: string;
  icon: string;
  description: string;
} {
  if (score >= 90) {
    return {
      level: '레전드',
      color: '#F59E0B',
      icon: '👑',
      description: '생태계를 이끄는 리더',
    };
  } else if (score >= 70) {
    return {
      level: '마스터',
      color: '#EC4899',
      icon: '🏆',
      description: '검증된 성공 창업가',
    };
  } else if (score >= 50) {
    return {
      level: '전문가',
      color: '#8B5CF6',
      icon: '⚡',
      description: '성장하는 사업가',
    };
  } else if (score >= 30) {
    return {
      level: '실행가',
      color: '#10B981',
      icon: '📈',
      description: '실행력을 갖춘 창업가',
    };
  } else {
    return {
      level: '도전자',
      color: '#0079FF',
      icon: '🚀',
      description: '새로운 도전을 시작한 창업가',
    };
  }
}

/**
 * 직종별 Stage 상세 레이블 매핑
 * 각 직종마다 Stage 0-6의 의미가 다르게 표현됨
 */
export interface CategoryStageLabel {
  stage: EntrepreneurStage;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const STAGE_LABELS_BY_CATEGORY: Record<UserCategory, CategoryStageLabel[]> = {
  // 🚀 스타트업
  [UserCategory.STARTUP]: [
    {
      stage: EntrepreneurStage.IDEA,
      label: '아이디어 구상',
      description: '비즈니스 아이디어 구체화 및 시장 조사',
      icon: '💡',
      color: '#9CA3AF',
    },
    {
      stage: EntrepreneurStage.MVP,
      label: 'MVP 출시',
      description: '최소 기능 제품 개발 및 초기 유저 확보',
      icon: '🔨',
      color: '#60A5FA',
    },
    {
      stage: EntrepreneurStage.LAUNCH,
      label: 'PMF 확인',
      description: '제품-시장 적합성 검증 및 핵심 지표 확인',
      icon: '🚀',
      color: '#0079FF',
    },
    {
      stage: EntrepreneurStage.GROWTH,
      label: '시드~시리즈 A 투자',
      description: '초기 투자 유치 및 본격 성장 시작',
      icon: '📈',
      color: '#10B981',
    },
    {
      stage: EntrepreneurStage.SCALE,
      label: '시리즈 B~C 확장',
      description: '공격적 성장 및 시장 점유율 확대',
      icon: '⚡',
      color: '#8B5CF6',
    },
    {
      stage: EntrepreneurStage.DOMINATE,
      label: '예비 유니콘',
      description: '시장 지배 및 IPO 준비 단계',
      icon: '🏆',
      color: '#EC4899',
    },
    {
      stage: EntrepreneurStage.EXIT,
      label: '엑싯 (M&A/상장)',
      description: '기업 인수합병 또는 상장 성공',
      icon: '👑',
      color: '#F59E0B',
    },
  ],

  // 🏪 자영업
  [UserCategory.SELF_EMPLOYED]: [
    {
      stage: EntrepreneurStage.IDEA,
      label: '업종 선정',
      description: '창업 아이템 선정 및 입지 분석',
      icon: '💡',
      color: '#9CA3AF',
    },
    {
      stage: EntrepreneurStage.MVP,
      label: '사업자 등록 / 첫 매출',
      description: '정식 오픈 및 첫 매출 발생',
      icon: '🔨',
      color: '#60A5FA',
    },
    {
      stage: EntrepreneurStage.LAUNCH,
      label: '단골 확보 / BEP 도전',
      description: '단골 고객 확보 및 손익분기점 도전',
      icon: '🚀',
      color: '#0079FF',
    },
    {
      stage: EntrepreneurStage.GROWTH,
      label: '안정적 순수익',
      description: '안정적인 순수익 구조 확립',
      icon: '📈',
      color: '#10B981',
    },
    {
      stage: EntrepreneurStage.SCALE,
      label: '2·3호점 확장',
      description: '추가 지점 확장 및 규모 확대',
      icon: '⚡',
      color: '#8B5CF6',
    },
    {
      stage: EntrepreneurStage.DOMINATE,
      label: '전국구 브랜드',
      description: '전국 단위 브랜드 및 시스템 완성',
      icon: '🏆',
      color: '#EC4899',
    },
    {
      stage: EntrepreneurStage.EXIT,
      label: '사업 매각',
      description: '사업 매각 및 자산가 전환',
      icon: '👑',
      color: '#F59E0B',
    },
  ],

  // 💼 직장인 (예비)
  [UserCategory.EMPLOYED]: [
    {
      stage: EntrepreneurStage.IDEA,
      label: '아이디어 구상',
      description: '창업 아이템 구상 및 시장 리서치',
      icon: '💡',
      color: '#9CA3AF',
    },
    {
      stage: EntrepreneurStage.MVP,
      label: '시장 조사 / 학습',
      description: '시장 조사 및 필요 역량 학습',
      icon: '🔨',
      color: '#60A5FA',
    },
    {
      stage: EntrepreneurStage.LAUNCH,
      label: 'BM 수립',
      description: '비즈니스 모델 수립 및 사업 계획서 작성',
      icon: '🚀',
      color: '#0079FF',
    },
    {
      stage: EntrepreneurStage.GROWTH,
      label: 'MVP 기획 / 팀 빌딩',
      description: 'MVP 기획 및 공동 창업자 모집',
      icon: '📈',
      color: '#10B981',
    },
    {
      stage: EntrepreneurStage.SCALE,
      label: '지원 사업 준비',
      description: '정부 지원 사업 및 초기 자금 확보',
      icon: '⚡',
      color: '#8B5CF6',
    },
    {
      stage: EntrepreneurStage.DOMINATE,
      label: '서비스 출시',
      description: '베타 또는 정식 서비스 출시 완료',
      icon: '🏆',
      color: '#EC4899',
    },
    {
      stage: EntrepreneurStage.EXIT,
      label: '퇴사 준비 완료',
      description: '전업 창업 준비 및 퇴사 결정',
      icon: '👑',
      color: '#F59E0B',
    },
  ],

  // 💡 프리랜서
  [UserCategory.FREELANCER]: [
    {
      stage: EntrepreneurStage.IDEA,
      label: '스킬 연마',
      description: '전문 스킬 학습 및 포트폴리오 준비',
      icon: '💡',
      color: '#9CA3AF',
    },
    {
      stage: EntrepreneurStage.MVP,
      label: '첫 프로젝트 완료',
      description: '첫 유료 프로젝트 수주 및 완료',
      icon: '🔨',
      color: '#60A5FA',
    },
    {
      stage: EntrepreneurStage.LAUNCH,
      label: '고정 거래처 확보',
      description: '정기적 프로젝트를 주는 거래처 확보',
      icon: '🚀',
      color: '#0079FF',
    },
    {
      stage: EntrepreneurStage.GROWTH,
      label: '단가 인상 / 상품화',
      description: '단가 인상 및 디지털 상품 개발',
      icon: '📈',
      color: '#10B981',
    },
    {
      stage: EntrepreneurStage.SCALE,
      label: 'N잡 확장',
      description: '다중 수익원 확보 및 수익 다변화',
      icon: '⚡',
      color: '#8B5CF6',
    },
    {
      stage: EntrepreneurStage.DOMINATE,
      label: '업계 1위 브랜딩',
      description: '해당 분야 최고 전문가로 인정받음',
      icon: '🏆',
      color: '#EC4899',
    },
    {
      stage: EntrepreneurStage.EXIT,
      label: '시스템 수익 완성',
      description: '자동화된 수익 구조 완성',
      icon: '👑',
      color: '#F59E0B',
    },
  ],

  // 🎬 크리에이터
  [UserCategory.CREATOR]: [
    {
      stage: EntrepreneurStage.IDEA,
      label: '테마 선정 / 채널 개설',
      description: '콘텐츠 테마 선정 및 채널 오픈',
      icon: '💡',
      color: '#9CA3AF',
    },
    {
      stage: EntrepreneurStage.MVP,
      label: '첫 바이럴',
      description: '첫 바이럴 콘텐츠 및 구독자 확보',
      icon: '🔨',
      color: '#60A5FA',
    },
    {
      stage: EntrepreneurStage.LAUNCH,
      label: '팬덤 형성',
      description: '충성도 높은 팬층 형성',
      icon: '🚀',
      color: '#0079FF',
    },
    {
      stage: EntrepreneurStage.GROWTH,
      label: '첫 광고 수익',
      description: '광고 및 협찬 수익 발생',
      icon: '📈',
      color: '#10B981',
    },
    {
      stage: EntrepreneurStage.SCALE,
      label: 'MCN 계약',
      description: 'MCN 소속 또는 멀티 채널 확장',
      icon: '⚡',
      color: '#8B5CF6',
    },
    {
      stage: EntrepreneurStage.DOMINATE,
      label: '자체 브랜드 (PB) 출시',
      description: '자체 상품 또는 브랜드 런칭',
      icon: '🏆',
      color: '#EC4899',
    },
    {
      stage: EntrepreneurStage.EXIT,
      label: '미디어 그룹화',
      description: '미디어 기업 또는 그룹 설립',
      icon: '👑',
      color: '#F59E0B',
    },
  ],

  // 🎯 에이전시
  [UserCategory.AGENCY]: [
    {
      stage: EntrepreneurStage.IDEA,
      label: '제안서 기획',
      description: '서비스 기획 및 제안서 작성',
      icon: '💡',
      color: '#9CA3AF',
    },
    {
      stage: EntrepreneurStage.MVP,
      label: '첫 수주',
      description: '첫 프로젝트 수주 및 완료',
      icon: '🔨',
      color: '#60A5FA',
    },
    {
      stage: EntrepreneurStage.LAUNCH,
      label: '레퍼런스 확보',
      description: '포트폴리오 및 레퍼런스 구축',
      icon: '🚀',
      color: '#0079FF',
    },
    {
      stage: EntrepreneurStage.GROWTH,
      label: '팀 빌딩 / 프로세스화',
      description: '팀 구성 및 업무 프로세스 정립',
      icon: '📈',
      color: '#10B981',
    },
    {
      stage: EntrepreneurStage.SCALE,
      label: '법인 전환 / 대형 수주',
      description: '법인 전환 및 대형 프로젝트 수주',
      icon: '⚡',
      color: '#8B5CF6',
    },
    {
      stage: EntrepreneurStage.DOMINATE,
      label: '자체 솔루션 런칭',
      description: '자체 SaaS 또는 솔루션 개발',
      icon: '🏆',
      color: '#EC4899',
    },
    {
      stage: EntrepreneurStage.EXIT,
      label: '사업 매각',
      description: '회사 매각 또는 인수합병',
      icon: '👑',
      color: '#F59E0B',
    },
  ],

  // ⚖️ 전문직
  [UserCategory.PROFESSIONAL]: [
    {
      stage: EntrepreneurStage.IDEA,
      label: '실무 수습',
      description: '자격증 취득 및 실무 경험 쌓기',
      icon: '💡',
      color: '#9CA3AF',
    },
    {
      stage: EntrepreneurStage.MVP,
      label: '개업 / 첫 수임',
      description: '독립 개업 및 첫 고객 수임',
      icon: '🔨',
      color: '#60A5FA',
    },
    {
      stage: EntrepreneurStage.LAUNCH,
      label: '전문 분야 확립',
      description: '특화 분야 확립 및 전문성 강화',
      icon: '🚀',
      color: '#0079FF',
    },
    {
      stage: EntrepreneurStage.GROWTH,
      label: '안정적 수임 구조',
      description: '안정적인 고객 확보 및 수익 구조',
      icon: '📈',
      color: '#10B981',
    },
    {
      stage: EntrepreneurStage.SCALE,
      label: '조직 확장',
      description: '파트너 영입 및 조직 확대',
      icon: '⚡',
      color: '#8B5CF6',
    },
    {
      stage: EntrepreneurStage.DOMINATE,
      label: '업계 권위자',
      description: '해당 분야 최고 전문가로 인정',
      icon: '🏆',
      color: '#EC4899',
    },
    {
      stage: EntrepreneurStage.EXIT,
      label: '전문 법인 설립',
      description: '대형 법인 설립 또는 합류',
      icon: '👑',
      color: '#F59E0B',
    },
  ],
};

/**
 * 선택한 카테고리에 맞는 Stage 레이블 가져오기
 */
export function getStagesByCategory(category: UserCategory): CategoryStageLabel[] {
  return STAGE_LABELS_BY_CATEGORY[category] || STAGE_LABELS_BY_CATEGORY[UserCategory.STARTUP];
}