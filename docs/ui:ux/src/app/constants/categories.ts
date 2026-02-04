import { BusinessType } from './stages';

// 유저 카테고리 정의 (7종 - 중복 선택 가능)
export enum UserCategory {
  STARTUP = 'startup',           // IT/기술/플랫폼 기반 및 투자 지향형
  SELF_EMPLOYED = 'self_employed', // 오프라인 매장, 일반 제조, 유통 등 매출 중심
  EMPLOYED = 'employed',          // 직장인/예비창업자
  FREELANCER = 'freelancer',      // 프리랜서/N잡러
  CREATOR = 'creator',            // 유튜브, SNS 등 팬덤과 콘텐츠 기반
  AGENCY = 'agency',              // 디자인, 마케팅, 개발 등 대행 및 솔루션
  PROFESSIONAL = 'professional',  // 세무, 법률, 노무 등 국가 공인 자격증 보유
}

// 카테고리별 상세 정보
export interface CategoryInfo {
  id: UserCategory;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  color: string;        // 메인 컬러
  activeColor: string;  // 선택 시 컬러 (#00E5FF Electric Blue)
  glowColor: string;    // 글로우 효과
  keywords: string[];   // 검색 및 필터링용
  examples: string[];   // 예시
}

export const CATEGORY_INFO: Record<UserCategory, CategoryInfo> = {
  [UserCategory.STARTUP]: {
    id: UserCategory.STARTUP,
    label: '스타트업',
    shortLabel: '스타트업',
    description: 'IT/기술/플랫폼 기반 및 투자 지향형',
    icon: '🚀',
    color: '#0079FF',
    activeColor: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    keywords: ['스타트업', 'IT', '기술', '플랫폼', '투자', '벤처', 'VC', '시리즈A'],
    examples: ['SaaS 플랫폼', '핀테크', '에듀테크', '헬스케어 스타트업'],
  },
  [UserCategory.SELF_EMPLOYED]: {
    id: UserCategory.SELF_EMPLOYED,
    label: '자영업',
    shortLabel: '자영업',
    description: '오프라인 매장, 일반 제조, 유통 등 매출 중심',
    icon: '🏪',
    color: '#10B981',
    activeColor: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    keywords: ['자영업', '오프라인', '매장', '제조', '유통', '카페', '음식점', 'BEP'],
    examples: ['카페', '음식점', '제조업', '소매점'],
  },
  [UserCategory.EMPLOYED]: {
    id: UserCategory.EMPLOYED,
    label: '직장인/예비',
    shortLabel: '직장인',
    description: '현재 소속이 있으며 창업을 준비 중인 단계',
    icon: '💼',
    color: '#6366F1',
    activeColor: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    keywords: ['직장인', '예비창업', '사이드프로젝트', '준비', 'N잡', '부업'],
    examples: ['사이드 프로젝트', '주말 창업', '퇴사 준비'],
  },
  [UserCategory.FREELANCER]: {
    id: UserCategory.FREELANCER,
    label: '프리랜서/N잡러',
    shortLabel: 'N잡러',
    description: '1인 지식 기업가 및 다각화된 수익 모델 보유',
    icon: '💡',
    color: '#F59E0B',
    activeColor: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    keywords: ['프리랜서', 'N잡', '1인기업', '지식노동', '다중수익', '포트폴리오'],
    examples: ['개발자', '디자이너', '작가', '컨설턴트'],
  },
  [UserCategory.CREATOR]: {
    id: UserCategory.CREATOR,
    label: '크리에이터',
    shortLabel: '크리에이터',
    description: '유튜브, SNS 등 팬덤과 콘텐츠 기반 비즈니스',
    icon: '🎬',
    color: '#EC4899',
    activeColor: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    keywords: ['크리에이터', '유튜브', 'SNS', '인플루언서', '콘텐츠', '팬덤', '구독자'],
    examples: ['유튜버', '인스타그래머', '틱토커', '블로거'],
  },
  [UserCategory.AGENCY]: {
    id: UserCategory.AGENCY,
    label: '에이전시',
    shortLabel: '에이전시',
    description: '디자인, 마케팅, 개발 등 대행 및 솔루션 제공',
    icon: '🎯',
    color: '#8B5CF6',
    activeColor: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    keywords: ['에이전시', '대행', '솔루션', 'B2B', '마케팅', '디자인', '개발'],
    examples: ['마케팅 에이전시', '디자인 스튜디오', '개발 대행사'],
  },
  [UserCategory.PROFESSIONAL]: {
    id: UserCategory.PROFESSIONAL,
    label: '전문직',
    shortLabel: '전문직',
    description: '세무, 법률, 노무 등 국가 공인 자격증 보유 전문가',
    icon: '⚖️',
    color: '#14B8A6',
    activeColor: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    keywords: ['전문직', '자격증', '세무사', '변호사', '노무사', '회계사', '전문가'],
    examples: ['세무사', '변호사', '노무사', '회계사'],
  },
};

// 정체성 조합 패턴 (Identity Combination Patterns)
export interface IdentityPattern {
  categories: UserCategory[];
  label: string;
  description: string;
  icon: string;
  color: string;
}

// 2개 이상 선택 시 정체성 요약 로직
export const IDENTITY_PATTERNS: IdentityPattern[] = [
  // 2개 조합
  {
    categories: [UserCategory.STARTUP, UserCategory.AGENCY],
    label: '빌더형 창업가',
    description: '제품과 서비스를 모두 제공하는 하이브리드 사업가',
    icon: '🛠️',
    color: '#0079FF',
  },
  {
    categories: [UserCategory.EMPLOYED, UserCategory.CREATOR],
    label: 'N잡러 크리에이터',
    description: '직장과 콘텐츠 비즈니스를 병행하는 멀티 플레이어',
    icon: '🎭',
    color: '#EC4899',
  },
  {
    categories: [UserCategory.STARTUP, UserCategory.SELF_EMPLOYED],
    label: '하이브리드 창업가',
    description: '안정적 현금흐름으로 혁신을 시도하는 전략가',
    icon: '⚡',
    color: '#8B5CF6',
  },
  {
    categories: [UserCategory.FREELANCER, UserCategory.CREATOR],
    label: '크리에이티브 기업가',
    description: '콘텐츠와 전문성을 결합한 1인 미디어 기업',
    icon: '🎨',
    color: '#F59E0B',
  },
  {
    categories: [UserCategory.PROFESSIONAL, UserCategory.AGENCY],
    label: '전문 솔루션 제공자',
    description: '전문 자격과 비즈니스를 결합한 B2B 전문가',
    icon: '💼',
    color: '#14B8A6',
  },
  {
    categories: [UserCategory.STARTUP, UserCategory.FREELANCER],
    label: '솔로 창업가',
    description: '작게 시작해 크게 성장하는 린 스타트업 실천가',
    icon: '🌱',
    color: '#10B981',
  },
  {
    categories: [UserCategory.SELF_EMPLOYED, UserCategory.CREATOR],
    label: '로컬 인플루언서',
    description: '오프라인 비즈니스를 온라인으로 확장하는 창업가',
    icon: '📍',
    color: '#EC4899',
  },
  // 3개 이상 조합
  {
    categories: [UserCategory.STARTUP, UserCategory.AGENCY, UserCategory.FREELANCER],
    label: '멀티 비즈니스 오너',
    description: '여러 비즈니스 모델을 동시에 운영하는 포트폴리오 창업가',
    icon: '🎯',
    color: '#8B5CF6',
  },
  {
    categories: [UserCategory.EMPLOYED, UserCategory.FREELANCER, UserCategory.CREATOR],
    label: '풀타임 N잡러',
    description: '다양한 수익원을 구축한 멀티 인컴 전문가',
    icon: '💰',
    color: '#F59E0B',
  },
];

// 유저 선택 카테고리에 맞는 정체성 찾기
export function getIdentitySummary(selectedCategories: UserCategory[]): IdentityPattern | null {
  if (selectedCategories.length < 2) return null;

  // 정확히 일치하는 패턴 찾기
  const exactMatch = IDENTITY_PATTERNS.find((pattern) => {
    return (
      pattern.categories.length === selectedCategories.length &&
      pattern.categories.every((cat) => selectedCategories.includes(cat))
    );
  });

  if (exactMatch) return exactMatch;

  // 부분 일치 패턴 찾기 (2개 이상 포함)
  const partialMatch = IDENTITY_PATTERNS.find((pattern) => {
    const matchCount = pattern.categories.filter((cat) => selectedCategories.includes(cat)).length;
    return matchCount >= 2;
  });

  if (partialMatch) return partialMatch;

  // 기본 패턴 (카테고리 개수 기반)
  if (selectedCategories.length >= 3) {
    return {
      categories: selectedCategories,
      label: '멀티 포트폴리오 창업가',
      description: `${selectedCategories.length}가지 비즈니스 영역을 아우르는 다재다능한 사업가`,
      icon: '🌟',
      color: '#0079FF',
    };
  }

  return null;
}

// 카테고리 조합에 따른 추천 지원사업 필터
export function getRecommendedProgramFilters(categories: UserCategory[]): {
  targetAudience: string[];
  businessTypes: string[];
  keywords: string[];
} {
  const allKeywords: string[] = [];
  const businessTypes: string[] = [];

  categories.forEach((cat) => {
    const info = CATEGORY_INFO[cat];
    allKeywords.push(...info.keywords);

    // 비즈니스 타입 추출
    if (cat === UserCategory.STARTUP) {
      businessTypes.push('스타트업', 'IT', '기술창업');
    } else if (cat === UserCategory.SELF_EMPLOYED) {
      businessTypes.push('소상공인', '자영업', '일반창업');
    } else if (cat === UserCategory.CREATOR) {
      businessTypes.push('콘텐츠', '크리에이터', '1인미디어');
    }
  });

  return {
    targetAudience: categories.map((cat) => CATEGORY_INFO[cat].label),
    businessTypes: [...new Set(businessTypes)],
    keywords: [...new Set(allKeywords)],
  };
}

// 협업 제안 매칭 로직
export function getCollaborationScore(
  userCategories: UserCategory[],
  targetCategories: UserCategory[]
): {
  score: number; // 0-100
  matchType: 'perfect' | 'complementary' | 'similar' | 'different';
  reason: string;
} {
  const intersection = userCategories.filter((cat) => targetCategories.includes(cat));
  const union = [...new Set([...userCategories, ...targetCategories])];

  // 완전 일치
  if (intersection.length === userCategories.length && intersection.length === targetCategories.length) {
    return {
      score: 100,
      matchType: 'perfect',
      reason: '완전히 동일한 비즈니스 영역',
    };
  }

  // 보완적 관계 (서로 다르지만 시너지)
  const complementaryPairs = [
    [UserCategory.STARTUP, UserCategory.AGENCY],
    [UserCategory.CREATOR, UserCategory.PROFESSIONAL],
    [UserCategory.FREELANCER, UserCategory.STARTUP],
    [UserCategory.SELF_EMPLOYED, UserCategory.CREATOR],
  ];

  const isComplementary = complementaryPairs.some(([a, b]) => {
    return (
      (userCategories.includes(a) && targetCategories.includes(b)) ||
      (userCategories.includes(b) && targetCategories.includes(a))
    );
  });

  if (isComplementary) {
    return {
      score: 85,
      matchType: 'complementary',
      reason: '서로 보완적인 비즈니스 관계',
    };
  }

  // 유사 관계 (일부 겹침)
  if (intersection.length > 0) {
    const similarityScore = (intersection.length / union.length) * 100;
    return {
      score: Math.round(similarityScore),
      matchType: 'similar',
      reason: `${intersection.length}개 영역 공통`,
    };
  }

  // 완전 다름
  return {
    score: 30,
    matchType: 'different',
    reason: '새로운 시각을 제공할 수 있는 관계',
  };
}

// DB 스키마 (참고용 - 실제 구현은 Supabase)
export interface UserCategoryRelation {
  userId: string;
  categoryId: UserCategory;
  createdAt: Date;
  isPrimary: boolean; // 메인 정체성 여부
}

export interface UserProfile {
  id: string;
  categories: UserCategory[]; // 선택한 카테고리 배열
  primaryCategory?: UserCategory; // 메인 카테고리 (1개)
  identitySummary?: IdentityPattern; // 자동 생성된 정체성
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 카테고리에 따라 비즈니스 타입(투자형/매출형) 결정
 * 이 함수로 Stage 레이블을 다르게 표시할 수 있습니다
 */
export function getBusinessTypeByCategory(category: UserCategory): BusinessType {
  // 투자형: 스타트업
  if (category === UserCategory.STARTUP) {
    return BusinessType.STARTUP;
  }
  
  // 매출형: 자영업, 크리에이터, 에이전시, 프리랜서
  if (
    category === UserCategory.SELF_EMPLOYED ||
    category === UserCategory.CREATOR ||
    category === UserCategory.AGENCY ||
    category === UserCategory.FREELANCER ||
    category === UserCategory.PROFESSIONAL
  ) {
    return BusinessType.BUSINESS;
  }
  
  // 직장인/예비는 하이브리드로 간주 (둘 다 표시)
  return BusinessType.HYBRID;
}