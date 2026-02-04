import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Briefcase,
  Award,
  Target,
  ChevronRight,
  Coffee,
  MessageCircle,
  Users,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Rocket,
  Zap,
  Heart,
  Star,
  DollarSign,
  CheckCircle2,
  Check,
  Edit,
  ChevronDown,
  Building2,
  X,
  Bookmark,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { EntrepreneurStage, BusinessType, BusinessInfo } from '../constants/stages';
import { StageCard } from './StageCard';
import { Stage5Type } from '../constants/stages';
import { BusinessSwitcher } from './BusinessSwitcher';
import { UserCategory } from '../constants/categories';
import { CategoryChips, CategoryHeader } from './CategoryChips';
import { CategorySelector } from './CategorySelector';
import { BookmarkSection } from './BookmarkSection';
import { EditProfile } from './EditProfile';
import { 
  BUSINESS_TYPE_INFO, 
  getStageLabel, 
  calculateInfluenceScore,
  calculateTotalInfluence,
  getInfluenceLevel,
} from '../constants/stages';
import { useAuth } from '../contexts/AuthContext';
import { 
  ProfileEmptyState, 
  BusinessInfoEmpty, 
  ExperienceEmpty, 
  PortfolioEmpty, 
  ExpertiseEmpty, 
  LookingForEmpty 
} from './ProfileEmptyState';
import { projectId, publicAnonKey } from '@/../utils/supabase/info';
import { toast } from 'sonner';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export function BusinessProfile({ showTodayTasks = false }: { showTodayTasks?: boolean }) {
  const { user } = useAuth(); // 현재 로그인한 사용자 정보
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [proposalType, setProposalType] = useState<'collaboration' | 'coffee'>('collaboration');
  const [fortuneIndex, setFortuneIndex] = useState(0);
  const [currentDate] = useState(new Date());
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('biz-1'); // 선택된 비즈니스
  const [showCompletionCard, setShowCompletionCard] = useState(true); // 프로필 완성 카드 표시 여부
  const [showEditProfile, setShowEditProfile] = useState(false); // 프로필 수정 모드
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [profileData, setProfileData] = useState<any>(null); // 프로필 데이터
  const [hasProfile, setHasProfile] = useState(false); // 프로필 존재 여부

  // 사용자 데이터 불러오기
  useEffect(() => {
    const loadProfile = async () => {
      console.log('👤 현재 로그인한 사용자:', user);
      
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Supabase에서 사용자 프로필 가져오기
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b941327d/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-user-id': user.id,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('❌ 프로필 로드 실패:', response.status);
          setHasProfile(false);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('✅ 프로필 데이터 로드:', data);

        // 프로필 데이터가 있는지 확인 (필수 필드 체크)
        const hasValidProfile = data && (
          data.company_name || 
          data.title_role || 
          data.location_hub ||
          data.entrepreneur_stage ||
          (data.businesses && data.businesses.length > 0)
        );

        if (hasValidProfile) {
          // DB 데이터를 UI 형식으로 변환
          setProfileData({
            name: data.display_name || user.email?.split('@')[0] || '사용자',
            email: user.email || '',
            title: data.title_role || '',
            company: data.company_name || '',
            location: data.location_hub || '',
            locationHub: data.location_hub || '',
            avatar: data.avatar_url || user.user_metadata?.avatar_url || '',
            isAvailable: data.is_available ?? true,
            bio: data.bio || '',
            profileCompleteness: 0, // TODO: 계산 로직 추가
            entrepreneurStage: data.entrepreneur_stage || EntrepreneurStage.IDEA,
            categories: data.categories || [],
            stats: data.stats || {
              following: 0,
              followers: 0,
              clubs: 0,
            },
            expertise: data.expertise || [],
            lookingFor: [],
            experience: [],
            portfolio: [],
          });
          setHasProfile(true);
        } else {
          console.log('📝 프로필 정보가 비어있음');
          setHasProfile(false);
        }
      } catch (error) {
        console.error('❌ 프로필 로드 에러:', error);
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // profile을 profileData로 대체
  const profile = profileData;

  // 오늘의 사업 운세
  const businessFortunes = [
    {
      icon: Rocket,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      title: '성장운',
      score: 92,
      message: '오늘은 중요한 의사결정을 내리기 좋은 날입니다. 투자 미팅이나 파트너십 제안을 적극 진해보세요.',
      lucky: '투자 유치',
    },
    {
      icon: Users,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      title: '네트워킹운',
      score: 88,
      message: '새로운 인연이 비즈니스 기회로 이어질 수 있는 날입니다. 커피챗 요청에 적극 응답해보세요.',
      lucky: '협업 제안',
    },
    {
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      title: '실행운',
      score: 85,
      message: '계획했던 일을 실행에 옮기기 좋은 날입니다. 미뤄두었 프��젝트를 시작해보세요.',
      lucky: 'MVP 개발',
    },
    {
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10',
      title: '팀워크운',
      score: 90,
      message: '팀원들과의 소통이 원활한 날입니다. 중요한 회의나 브레인스토밍을 진행해보세요.',
      lucky: '팀 빌딩',
    },
  ];

  const todayFortune = businessFortunes[fortuneIndex % businessFortunes.length];
  const FortuneIcon = todayFortune.icon;

  // 오늘의 파트너 추천
  const recommendedPartners = [
    {
      name: '김개발',
      title: 'Full-stack 개발자',
      avatar: '',
      matchScore: 95,
      reason: 'AI/ML 경험 5년차',
      tags: ['Python', 'React', 'AWS'],
    },
    {
      name: '이마케터',
      title: 'Growth Marketer',
      avatar: '',
      matchScore: 88,
      reason: 'B2B SaaS 마케팅 전문',
      tags: ['SEO', 'Content', 'Analytics'],
    },
  ];

  // 오늘의 지원사업 추천
  const recommendedProgram = {
    title: '예비창업패키지 2025',
    organization: '중소벤처기업부',
    dDay: 8,
    budget: '최대 1억원',
    matchScore: 92,
    reason: '업종, 대상 연령 모두 부합',
  };

  const refreshFortune = () => {
    setFortuneIndex((prev) => prev + 1);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };
    return date.toLocaleDateString('ko-KR', options);
  };

  // Mock data - 실제로는 props나 API에서 가져옴
  // const profile = {
  //   name: '김창업',
  //   title: 'AI 타트업 대표',
  //   company: '더인사이트랩',
  //   location: '서울 강남구',
  //   locationHub: 'gangnam', // 거점 정보 추가
  //   avatar: '',
  //   isAvailable: true,
  //   bio: '5년차 시리즈 창업가입니다. AI/ML 기반 SaaS 제품을 개발하고 있으며, 시리즈 C 투자를 유치하여 시장 내 압도적인 점유율을 확보했습니다. IPO를 준비 중이며, 같은 고민을 하는 창업가들과 경험을 나누고 싶습니다.',
  //   profileCompleteness: 85,
  //   entrepreneurStage: EntrepreneurStage.DOMINATE, // Stage 5: 시장 지배 (시리즈 C 이상)
  //   stage5Type: Stage5Type.INVESTMENT, // 투자형
  //   categories: [UserCategory.STARTUP, UserCategory.AGENCY, UserCategory.FREELANCER] as UserCategory[], // 멀티 비즈니스 오너
  //   stats: {
  //     following: 145,
  //     followers: 238,
  //     clubs: 5,
  //   },
  //   expertise: [
  //     'AI/ML',
  //     'SaaS',
  //     'Product Management',
  //     'Growth Marketing',
  //     'Fundraising',
  //   ],
  //   lookingFor: [
  //     { icon: '👨‍💻', title: 'CTO 파트너', description: 'Python/ML 전문 개발자' },
  //     { icon: '📊', title: '초기 마케팅 전문가', description: 'B2B SaaS 경험자 우대' },
  //     { icon: '💰', title: '엔젤 투자자', description: '시드 라운드 준비중' },
  //   ],
  //   experience: [
  //     {
  //       year: '2024 - 현재',
  //       title: '더인사이트랩 (The Insight Lab)',
  //       role: 'Founder & CEO',
  //       description: 'AI 기반 비즈니스 인텔리전스 SaaS',
  //       achievement: 'Pre-seed 투자 유치 (5억원)',
  //     },
  //     {
  //       year: '2021 - 2023',
  //       title: '퍼스트스타트업',
  //       role: 'Co-founder & CPO',
  //       description: '소상공인 대상 마케팅 자동화 플랫폼',
  //       achievement: '엑싯 (Series A 단계, 인수합병)',
  //     },
  //     {
  //       year: '2019 - 2021',
  //       title: '대기업 IT 전략팀',
  //       role: 'Product Manager',
  //       description: '신규 사업 기획 및 디지털 전환 프로젝트 리드',
  //       achievement: '3개 프젝트 성공적 론칭',
  //     },
  //   ],
  //   portfolio: [
  //     { title: '더인사이트랩 홈페이지', url: 'theinsightlab.io' },
  //     { title: 'LinkedIn', url: 'linkedin.com/in/kimchangup' },
  //     { title: 'Brunch', url: 'brunch.co.kr/@kimchangup' },
  //   ],
  // };

  // 멀티 비즈니스 데이터 (하이브리드 창업가 예시)
  const businesses: BusinessInfo[] = [
    {
      id: 'biz-1',
      name: 'F&B 무인화 솔루션 SaaS',
      type: BusinessType.STARTUP,
      stage: EntrepreneurStage.LAUNCH, // Stage 2: PMF 검���
      description: '매장 운영의 모든 것을 자동화하는 AI 기반 통합 솔루션',
      industry: '푸드테크',
      foundedYear: 2023,
      isPrimary: true,
    },
    {
      id: 'biz-2',
      name: '프리미엄 고기 전문점',
      type: BusinessType.BUSINESS,
      stage: EntrepreneurStage.DOMINATE, // Stage 5: 전국 브랜드
      description: '전국 7개 지점 운영 중인 프랜차이즈 본사, 완전 자동화 시스템 구축 완료',
      industry: '외식업',
      foundedYear: 2018,
      isPrimary: false,
    },
  ];

  // 선택된 비즈니스
  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || businesses[0];
  
  // 영향력 점수 계산
  const totalInfluence = calculateTotalInfluence(businesses);
  const influenceLevel = getInfluenceLevel(totalInfluence);

  const handleProposal = (type: 'collaboration' | 'coffee') => {
    setProposalType(type);
    setIsProposalOpen(true);
  };

  // 프로필 저장 핸들러
  const handleSaveProfile = (updatedProfile: any) => {
    console.log('💾 프로필 저장 시도:', updatedProfile);
    
    // 서버에 프로필 저장
    const saveToServer = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b941327d/profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-user-id': user?.id || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            display_name: updatedProfile.name,
            email: updatedProfile.email,
            title_role: updatedProfile.title,
            company_name: updatedProfile.company,
            location_hub: updatedProfile.locationHub,
            avatar_url: updatedProfile.avatar,
            bio: updatedProfile.bio,
            entrepreneur_stage: updatedProfile.entrepreneurStage,
            categories: updatedProfile.categories || [],
            expertise: updatedProfile.expertise || [],
          }),
        });

        if (!response.ok) {
          console.error('❌ 프로필 저장 실패:', response.status);
          toast.error('프로필 저장에 실패했습니다.');
          return;
        }

        const data = await response.json();
        console.log('✅ 프로필 저장 성공:', data);

        // 로컬 상태 업데이트
        setProfileData({
          name: updatedProfile.name,
          email: updatedProfile.email,
          title: updatedProfile.title,
          company: updatedProfile.company,
          location: updatedProfile.locationHub,
          locationHub: updatedProfile.locationHub,
          avatar: updatedProfile.avatar,
          bio: updatedProfile.bio,
          entrepreneurStage: updatedProfile.entrepreneurStage,
          categories: updatedProfile.categories || [],
          expertise: updatedProfile.expertise || [],
          isAvailable: true,
          profileCompleteness: 0,
          stats: profile?.stats || { following: 0, followers: 0, clubs: 0 },
          lookingFor: profile?.lookingFor || [],
          experience: profile?.experience || [],
          portfolio: profile?.portfolio || [],
        });
        
        setHasProfile(true);
        setShowEditProfile(false);
        toast.success('프로필이 저장되었습니다!');
      } catch (error) {
        console.error('❌ 프로필 저장 에러:', error);
        toast.error('프로필 저장 중 오류가 발생했습니다.');
      }
    };

    saveToServer();
  };

  const completionItems = [
    { label: '기본 정보', completed: true },
    { label: '전문 분야', completed: true },
    { label: '협업 니즈', completed: true },
    { label: '이력 & 경험', completed: true },
    { label: '포트폴리오', completed: false },
  ];

  // EditProfile 화면이 열려있으면 EditProfile 표시
  if (showEditProfile) {
    // profile이 없으면 기본 프로필 데이터 생성
    const editableProfile = profile || {
      name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || '사용자',
      email: user?.email || '',
      title: '',
      company: '',
      location: '',
      locationHub: '',
      avatar: user?.user_metadata?.avatar_url || '',
      bio: '',
      entrepreneurStage: EntrepreneurStage.IDEA,
      stage5Type: undefined,
      expertise: [],
      categories: [],
    };

    return (
      <EditProfile
        profile={editableProfile}
        onSave={handleSaveProfile}
        onCancel={() => setShowEditProfile(false)}
      />
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 프로필이 없을 때 Empty State 표시
  if (!hasProfile && !showTodayTasks) {
    return (
      <ProfileEmptyState
        onSetupClick={() => setShowEditProfile(true)}
        userName={user?.user_metadata?.display_name || user?.email?.split('@')[0]}
      />
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-6"
    >
      {/* Today's To-Do - 오늘의 할 일 */}
      {showTodayTasks && (
        <motion.div variants={itemVariants} id="today-tasks">
          <Card className="bg-gradient-to-br from-primary/20 via-card to-card-secondary rounded-3xl border-primary/40 glow-effect overflow-hidden relative">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />

            <CardContent className="p-8 relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-extrabold text-white">오늘의 할 일</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(currentDate)}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/30 rounded-xl px-3 py-1">
                  1개 추천
                </Badge>
              </div>

              <div className="space-y-4">
                {/* 1. 오늘의 사업 운세 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card-secondary/70 rounded-2xl p-5 border border-primary/20"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${todayFortune.bgColor}`}>
                      <FortuneIcon className={`h-6 w-6 ${todayFortune.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <h3 className="font-bold text-white">오늘의 사업 운세</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={refreshFortune}
                          className="h-8 w-8 rounded-xl hover:bg-card"
                        >
                          <RefreshCw className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={fortuneIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-white">{todayFortune.title}</span>
                            <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${todayFortune.score}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-primary to-cyan-400"
                              />
                            </div>
                            <span className="text-sm font-bold text-primary">{todayFortune.score}</span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                            {todayFortune.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">
                              행운 키워드: <span className="font-bold text-primary">{todayFortune.lucky}</span>
                            </span>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* 2. 오늘의 파트너 추천 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card-secondary/70 rounded-2xl p-5 border border-emerald-400/20"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-bold text-white">오늘의 파트너 추천</h3>
                    <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/30 rounded-xl text-xs px-2 py-0.5">
                      AI 매칭
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {recommendedPartners.slice(0, 2).map((partner, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + idx * 0.05 }}
                        whileHover={{ x: 2 }}
                        className="flex items-center gap-3 p-3 bg-card/50 rounded-xl cursor-pointer hover:bg-card transition-all"
                      >
                        <Avatar className="h-10 w-10 border-2 border-emerald-400/20">
                          <AvatarImage src={partner.avatar} alt={partner.name} />
                          <AvatarFallback className="bg-emerald-400/20 text-emerald-400 font-bold text-sm">
                            {partner.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-white text-sm truncate">{partner.name}</p>
                            <Badge className="bg-emerald-400/10 text-emerald-400 border-0 text-xs px-2 py-0">
                              {partner.matchScore}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{partner.title}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full h-9 rounded-xl mt-3 text-sm text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-400"
                  >
                    더 많은 추천 보기
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>

                {/* 3. 오늘의 지원사업 추천 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-cyan-400/10 to-card-secondary rounded-2xl p-5 border border-cyan-400/20"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-cyan-400" />
                    <h3 className="font-bold text-white">오늘의 지원사업 추천</h3>
                    <Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/30 rounded-xl text-xs px-2 py-0.5">
                      매칭도 {recommendedProgram.matchScore}%
                    </Badge>
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{recommendedProgram.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{recommendedProgram.organization}</p>
                    </div>
                    <Badge className="bg-primary text-white border-0 px-3 py-1 rounded-xl text-sm font-bold">
                      D-{recommendedProgram.dDay}
                    </Badge>
                  </div>

                  <div className="bg-card/50 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-white">{recommendedProgram.budget}</span>
                    </div>
                    <p className="text-xs text-foreground/80">
                      <span className="text-cyan-400 font-semibold">추천 이유:</span> {recommendedProgram.reason}
                    </p>
                  </div>

                  <Button className="w-full h-9 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-500">
                    자세히 보기
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 프로필 관련 섹션들은 showTodayTasks가 false일 때만 표시 */}
      {!showTodayTasks && (
        <>
          {/* Profile Header */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-[#0A0A0A] via-card to-card-secondary rounded-3xl border-border/50 overflow-hidden relative">
              {/* Background Glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
              
              {/* 프로필 수정 버튼 - 카드 우측 상단 */}
              <div className="absolute top-6 right-6 z-10">
                <Button
                  onClick={() => setShowEditProfile(true)}
                  variant="outline"
                  className="rounded-2xl border-[#00E5FF]/30 hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 text-[#00E5FF] font-semibold h-10 px-5 backdrop-blur-sm bg-black/50"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  프로필 수정
                </Button>
              </div>
              
              <CardContent className="p-8 relative">
                {/* Avatar & Basic Info */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                        {profile.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Availability Indicator */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-4 border-card flex items-center justify-center ${
                        profile.isAvailable ? 'bg-emerald-400' : 'bg-muted'
                      }`}
                    >
                      <span className="text-xs">✓</span>
                    </motion.div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h1 className="text-3xl font-extrabold text-white mb-1">{profile.name}</h1>
                        
                        {/* 비즈니스 드롭다운 (멀티 비즈니스인 경우) */}
                        {businesses.length > 1 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-auto p-0 hover:bg-transparent group mb-1"
                              >
                                <div className="flex items-center gap-2">
                                  <p className="text-lg text-primary font-bold group-hover:text-[#00E5FF] transition-colors">
                                    {selectedBusiness.name}
                                  </p>
                                  <ChevronDown className="h-4 w-4 text-primary group-hover:text-[#00E5FF] transition-colors" />
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="w-96 p-4 bg-card border-border/50 rounded-2xl"
                              align="start"
                            >
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground mb-3 px-2">운영 중인 비즈니스</p>
                                {businesses.map((biz) => {
                                  const bizInfo = BUSINESS_TYPE_INFO[biz.type];
                                  const stageLabel = getStageLabel(biz.stage, biz.type);
                                  const isSelected = selectedBusinessId === biz.id;
                                  
                                  return (
                                    <motion.div
                                      key={biz.id}
                                      whileHover={{ x: 2 }}
                                      onClick={() => setSelectedBusinessId(biz.id)}
                                      className={`p-4 rounded-2xl cursor-pointer transition-all ${
                                        isSelected 
                                          ? 'bg-primary/10 border-2 border-primary/40' 
                                          : 'bg-card-secondary/50 border-2 border-transparent hover:border-border'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <p className={`font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>
                                              {biz.name}
                                            </p>
                                            {biz.isPrimary && (
                                              <Badge className="bg-primary/20 text-primary border-0 text-xs px-2 py-0">
                                                주력
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground mb-2">{biz.description}</p>
                                          <div className="flex items-center gap-2">
                                            <Badge 
                                              className="text-xs px-2 py-0.5 rounded-lg"
                                              style={{
                                                backgroundColor: `${bizInfo.color}20`,
                                                color: bizInfo.color,
                                                border: `1px solid ${bizInfo.color}40`,
                                              }}
                                            >
                                              {bizInfo.icon} {bizInfo.label}
                                            </Badge>
                                            <Badge className="bg-card text-foreground border-border text-xs px-2 py-0.5 rounded-lg">
                                              {stageLabel}
                                            </Badge>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <Check className="h-5 w-5 text-primary flex-shrink-0" strokeWidth={3} />
                                        )}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <p className="text-lg text-primary font-bold mb-1">{profile.company}</p>
                        )}
                        
                        <p className="text-sm text-muted-foreground">{profile.title}</p>
                      </div>
                      
                      {profile.isAvailable && (
                        <Badge className="bg-emerald-400/20 text-emerald-400 border-emerald-400/30 rounded-xl px-3 py-1">
                          협업 가능
                        </Badge>
                      )}
                    </div>

                    {/* Identity Badge - 정체성 배지 */}
                    <div className="mt-3 mb-4">
                      <CategoryHeader categories={profile.categories} />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {profile.stats.followers}명 연결
                      </span>
                      {businesses.length > 1 && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {businesses.length}개 비즈니스
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-foreground/90 leading-relaxed mb-6 bg-card-secondary/50 rounded-2xl p-4">
                  {profile.bio}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-card-secondary/50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-extrabold text-cyan-400 mb-1">{profile.stats.following}</p>
                    <p className="text-xs text-muted-foreground">팔로잉</p>
                  </div>
                  <div className="bg-card-secondary/50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-extrabold text-emerald-400 mb-1">{profile.stats.followers}</p>
                    <p className="text-xs text-muted-foreground">팔로워</p>
                  </div>
                  <div className="bg-card-secondary/50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-extrabold text-orange-400 mb-1">{profile.stats.clubs}</p>
                    <p className="text-xs text-muted-foreground">참여 클럽</p>
                  </div>
                  <div className="bg-gradient-to-br from-primary/20 to-card-secondary/50 rounded-2xl p-4 text-center border border-primary/30">
                    <p className="text-2xl font-extrabold mb-1" style={{ color: influenceLevel.color }}>
                      {totalInfluence}
                    </p>
                    <p className="text-xs text-muted-foreground">영향력</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stage Card - 창업 단계 (멀티 비즈니스) */}
          {/* TODO: 나중에 Status 통합 뷰로 업그레이드 예정 */}
          {/* <motion.div variants={itemVariants}>
            <BusinessSwitcher 
              businesses={businesses}
              onBusinessSelect={(id) => setSelectedBusinessId(id)}
              onAddBusiness={() => console.log('Add new business')}
            />
          </motion.div> */}

          {/* Expertise & Skills */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#0A0A0A] rounded-3xl border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-extrabold text-white">전문 분야 & 기술 스택</h2>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((skill, idx) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge className="bg-primary/10 text-primary border-primary/30 rounded-2xl px-4 py-2 text-sm font-bold hover:bg-primary/20 transition-colors cursor-pointer">
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Looking For - 핵심 섹션 */}
          {/* 오늘의 할일에서 제거됨 - 프로필 페이지에만 표시 */}

          {/* Experience Timeline */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#0A0A0A] rounded-3xl border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-extrabold text-white">이력 & 경험</h2>
                </div>
                
                <div className="space-y-6">
                  {profile.experience.map((exp, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative pl-8 border-l-2 border-primary/20 last:border-l-0"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full bg-primary border-4 border-[#0A0A0A]" />
                      
                      <div className="mb-1">
                        <span className="text-xs font-bold text-primary">{exp.year}</span>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-1">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{exp.role}</p>
                      <p className="text-sm text-foreground/80 mb-2">{exp.description}</p>
                      {exp.achievement && (
                        <div className="flex items-center gap-2 text-sm">
                          <Rocket className="h-4 w-4 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">{exp.achievement}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Portfolio Links */}
          <motion.div variants={itemVariants}>
            <Card className="bg-[#0A0A0A] rounded-3xl border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-extrabold text-white">포트폴리오</h2>
                </div>
                
                <div className="space-y-2">
                  {profile.portfolio.map((item, idx) => (
                    <motion.a
                      key={idx}
                      href={`https://${item.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 bg-[#121212] rounded-2xl hover:bg-[#1A1A1A] transition-all group"
                    >
                      <div>
                        <p className="font-semibold text-white mb-1">{item.title}</p>
                        <p className="text-xs text-primary">{item.url}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Buttons - Web View */}
          <motion.div 
            variants={itemVariants}
            className="mt-8"
          >
            <Card className="bg-card/50 backdrop-blur border-border/50 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleProposal('coffee')}
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-white font-bold"
                  >
                    <Coffee className="mr-2 h-5 w-5" />
                    커피챗 신청
                  </Button>
                  <Button
                    onClick={() => handleProposal('collaboration')}
                    className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 glow-effect"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    협업 제안하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Collaboration Proposal Modal */}
          <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
            <DialogContent className="bg-card border-border/50 rounded-3xl max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
                  {proposalType === 'collaboration' ? (
                    <>
                      <MessageCircle className="h-6 w-6 text-primary" />
                      협업 제안하기
                    </>
                  ) : (
                    <>
                      <Coffee className="h-6 w-6 text-primary" />
                      커피챗 신청하기
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {proposalType === 'collaboration' 
                    ? `${profile.name}님에게 협업을 제안해보세요. 구체적일수록 긍정적인 답변을 받을 확률이 높아요.`
                    : `${profile.name}님과 가볍게 커피 한잔 하며 이야기를 나눠보세요.`
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="topic" className="text-white font-semibold mb-2 block">
                    {proposalType === 'collaboration' ? '제안 주제' : '대화 주제'}
                  </Label>
                  <Input
                    id="topic"
                    placeholder={proposalType === 'collaboration' 
                      ? '예: AI 기반 SaaS 공동 개발 제안'
                      : '예: 초기 스타트업 고민 나누기'
                    }
                    className="h-12 rounded-2xl bg-input-background border-border text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white font-semibold mb-2 block">
                    메시지
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={proposalType === 'collaboration'
                      ? '구체적인 협업 내용, 제안 배경, 기대하는 시너지 등을 작성해주세요.'
                      : '만나서 이야기하고 싶은 내용을 간단히 작성해주세요.'
                    }
                    rows={6}
                    className="rounded-2xl bg-input-background border-border text-white resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="contact" className="text-white font-semibold mb-2 block">
                    연락처
                  </Label>
                  <Input
                    id="contact"
                    type="email"
                    placeholder="your.email@example.com"
                    className="h-12 rounded-2xl bg-input-background border-border text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsProposalOpen(false)}
                    className="flex-1 h-12 rounded-2xl border-border hover:bg-card-secondary"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={() => {
                      // TODO: 제안 전송 로직
                      setIsProposalOpen(false);
                    }}
                    className="flex-1 h-12 rounded-2xl bg-primary text-black font-bold hover:bg-primary/90"
                  >
                    전송하기
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </motion.div>
  );
}