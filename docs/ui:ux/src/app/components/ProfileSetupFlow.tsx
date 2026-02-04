import { UserCategory, CATEGORY_INFO } from '../constants/categories';
import { getStagesByCategory } from '../constants/stages';
import { REGION_GROUPS } from '../constants/regions';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AtSign, 
  Building2, 
  Briefcase, 
  MapPin, 
  Sparkles, 
  TrendingUp,
  Check, 
  AlertCircle, 
  Loader2,
  X 
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/../utils/supabase/info';

interface ProfileSetupFlowProps {
  userId: string;
  onClose: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

export function ProfileSetupFlow({ userId, onClose, onComplete, onSkip }: ProfileSetupFlowProps) {
  const [step, setStep] = useState<'username' | 'company' | 'role' | 'details'>('username');
  
  // Form state
  const [username, setUsername] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');
  
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  
  // Step 4: 지역 + 직종 + 창업단계
  const [selectedRegionGroup, setSelectedRegionGroup] = useState('');
  const [locationHub, setLocationHub] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<UserCategory | null>(null);
  const [entrepreneurStage, setEntrepreneurStage] = useState(0);

  // Username 중복 체크 (실시간 디바운싱)
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameChecking(true);
      setUsernameError('');

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b941327d/check-username`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ username }),
          }
        );

        const data = await response.json();

        if (data.available) {
          setUsernameAvailable(true);
          setUsernameError('');
        } else {
          setUsernameAvailable(false);
          setUsernameError(data.error || '사용 불가능한 아이디입니다.');
        }
      } catch (error) {
        console.error('Username 체크 에러:', error);
        setUsernameError('아이디 확인 중 오류가 발생했습니다.');
      } finally {
        setUsernameChecking(false);
      }
    }, 500); // 500ms 디바운스

    return () => clearTimeout(timer);
  }, [username]);

  // 현재 단계 번호
  const getStepNumber = () => {
    switch (step) {
      case 'username': return 1;
      case 'company': return 2;
      case 'role': return 3;
      case 'details': return 4;
      default: return 1;
    }
  };

  const currentStepNumber = getStepNumber();
  const totalSteps = 4;

  const handleNext = () => {
    // Step 1: Username 검증
    if (step === 'username') {
      if (!username.trim()) {
        toast.error('고유 ID를 입력해주세요.');
        return;
      }
      if (!usernameAvailable) {
        toast.error('사용 가능한 고유 ID를 입력해주세요.');
        return;
      }
      setStep('company');
      return;
    }

    // Step 2: Company (선택사항이므로 바로 통과)
    if (step === 'company') {
      setStep('role');
      return;
    }

    // Step 3: Role (선택사항이므로 바로 통과)
    if (step === 'role') {
      setStep('details');
      return;
    }
  };

  const handleComplete = async () => {
    // 필수: Username
    if (!username.trim() || !usernameAvailable) {
      toast.error('고유 ID를 확인해주세요.');
      return;
    }

    // 서버에 프로필 정보 업데이트
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b941327d/update-profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            username,
            jobTitle: role,
            company,
            locationHub,
            category: selectedCategory,
            stage: entrepreneurStage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '프로필 업데이트 실패');
      }

      console.log('✅ 프로필 업데이트 성공:', data);
      toast.success('프로필 등록이 완료되었습니다! 🎉');
      onComplete();
    } catch (error) {
      console.error('❌ 프로필 등록 에러:', error);
      toast.error('프로필 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-white mb-1">프로필 등록</h1>
              <p className="text-muted-foreground">나를 소개하고 더 많은 기회를 얻어보세요 ✨</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-2xl hover:bg-[#1A1A1A]"
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>

          {/* 단계 카운터 */}
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00E5FF]/20 to-[#00E5FF]/10 border border-[#00E5FF]/50 rounded-xl">
              <div className="text-xl font-black text-[#00E5FF]">
                {currentStepNumber}
              </div>
              <div className="text-white/40 text-lg font-black">/</div>
              <div className="text-lg font-bold text-white/60">
                {totalSteps}
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8 bg-[#0A0A0A] p-4 rounded-3xl border border-border/40">
            {['username', 'company', 'role', 'details'].map((s, idx) => {
              const stepLabels = {
                username: '고유ID',
                company: '회사명',
                role: '직함/역할',
                details: '상세정보'
              };
              const isActive = step === s;
              const isCompleted = ['username', 'company', 'role', 'details'].indexOf(step) > idx;
              
              return (
                <div key={s} className="flex items-center flex-1">
                  <div 
                    className="flex-1 cursor-pointer group"
                    onClick={() => {
                      // 완료된 단계만 클릭 가능
                      if (isCompleted || isActive) {
                        setStep(s as any);
                      }
                    }}
                  >
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        isActive || isCompleted ? 'bg-[#00E5FF]' : 'bg-[#1A1A1A]'
                      } ${isCompleted || isActive ? 'group-hover:bg-[#00E5FF]/70' : ''}`}
                      style={{
                        boxShadow: isActive ? '0 0 20px rgba(0, 229, 255, 0.6)' : 'none'
                      }}
                    />
                    <p className={`text-xs mt-2 text-center transition-all duration-200 ${
                      isActive ? 'text-[#00E5FF] font-extrabold scale-110' : isCompleted ? 'text-white/60 font-semibold' : 'text-muted-foreground'
                    } ${isCompleted || isActive ? 'group-hover:text-[#00E5FF]' : ''}`}>
                      {stepLabels[s as keyof typeof stepLabels]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Content */}
          <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl mb-6">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: 고유 ID */}
                {step === 'username' && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <AtSign className="h-6 w-6 text-[#00E5FF]" />
                        고유 ID 설정
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        만의 프로필 주소를 만들어보세요 (예: @minssum)
                      </p>

                      <div className="space-y-2">
                        <Label className="text-white font-semibold">
                          고유 ID *
                        </Label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00E5FF] font-bold">
                            @
                          </div>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                            placeholder="minssum"
                            className="h-14 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF] pl-10"
                            maxLength={20}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {usernameChecking && (
                              <Loader2 className="h-5 w-5 text-[#00E5FF] animate-spin" />
                            )}
                            {!usernameChecking && usernameAvailable === true && (
                              <Check className="h-5 w-5 text-green-500" />
                            )}
                            {!usernameChecking && usernameAvailable === false && (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>

                        {/* 상태 메시지 */}
                        {usernameError && (
                          <p className="text-sm text-red-500 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {usernameError}
                          </p>
                        )}
                        {usernameAvailable && !usernameError && (
                          <p className="text-sm text-green-500 flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            사용 가능한 아이디입니다!
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          • 영문 소문자, 숫자, _, - 만 사용 가능<br />
                          • 3-20자 이내로 입력해주세요
                        </p>
                      </div>

                      {/* 미리보기 */}
                      {username && usernameAvailable && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-gradient-to-r from-[#00E5FF]/20 to-[#00E5FF]/10 border border-[#00E5FF]/50 rounded-2xl"
                        >
                          <p className="text-sm text-white/60 mb-1">내 프로필 주소</p>
                          <p className="text-lg font-bold text-[#00E5FF]">
                            thepotential.kr/@{username}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: 회사명 */}
                {step === 'company' && (
                  <motion.div
                    key="company"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-[#00E5FF]" />
                        회사/프로젝트명
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        운영 중인 회사나 프로젝트가 있다면 입력해주세요 (선택사항)
                      </p>

                      <div className="space-y-2">
                        <Label className="text-white font-semibold">
                          회사명
                        </Label>
                        <Input
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="예: 더포텐셜, 포텐메이커스"
                          className="h-14 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: 직함/역할 */}
                {step === 'role' && (
                  <motion.div
                    key="role"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Briefcase className="h-6 w-6 text-[#00E5FF]" />
                        직함/역할
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        현재 맡고 있는 역할을 입력해주세요 (선택사항)
                      </p>

                      <div className="space-y-2">
                        <Label className="text-white font-semibold">
                          직함/역할
                        </Label>
                        <Input
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          placeholder="예: Founder & CEO, Product Designer"
                          className="h-14 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: 상세정보 (지역 + 직종 + 창업단계) */}
                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {/* 지역 선택 */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#00E5FF]" />
                        활동 지역 거점
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        주로 활동하는 지역을 선택해주세요 (선택사항)
                      </p>

                      {/* 권역 선택 */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {REGION_GROUPS.map((group) => {
                          const isSelected = selectedRegionGroup === group.id;
                          return (
                            <Button
                              key={group.id}
                              onClick={() => setSelectedRegionGroup(group.id)}
                              variant="outline"
                              className={`h-12 rounded-2xl ${
                                isSelected
                                  ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                                  : 'bg-black border-border/40 text-white/80 hover:border-[#00E5FF]/50'
                              }`}
                            >
                              {group.label}
                            </Button>
                          );
                        })}
                      </div>

                      {/* 세부 거점 선택 */}
                      {selectedRegionGroup && (
                        <div className="flex flex-wrap gap-2">
                          {REGION_GROUPS.find(g => g.id === selectedRegionGroup)?.hubs.map((hub) => {
                            const isSelected = locationHub === hub.id;
                            return (
                              <Badge
                                key={hub.id}
                                onClick={() => setLocationHub(hub.id)}
                                className={`cursor-pointer py-2 px-4 rounded-2xl ${
                                  isSelected
                                    ? 'bg-[#00E5FF] text-white'
                                    : 'bg-black text-white/80 border-border/40 hover:border-[#00E5FF]/50'
                                }`}
                              >
                                {hub.label}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 직종 선택 */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#00E5FF]" />
                        직종 선택
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        현재 가장 집중하고 있는 분야를 선택해주세요 (선택사항)
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {Object.values(CATEGORY_INFO).map((category) => {
                          const isSelected = selectedCategory === category.id;
                          return (
                            <Button
                              key={category.id}
                              onClick={() => setSelectedCategory(category.id)}
                              variant="outline"
                              className={`h-20 rounded-2xl flex-col gap-2 ${
                                isSelected
                                  ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                                  : 'bg-black border-border/40 text-white/80 hover:border-[#00E5FF]/50'
                              }`}
                            >
                              <span className="text-2xl">{category.icon}</span>
                              <span className="text-sm font-bold">{category.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 창업 단계 */}
                    {selectedCategory && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-[#00E5FF]" />
                          현재 비즈니스 단계
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {CATEGORY_INFO[selectedCategory].label} 기준으로 선택됩니다
                        </p>

                        <div className="space-y-2">
                          {getStagesByCategory(selectedCategory).map((stageInfo, index) => {
                            const isSelected = entrepreneurStage === stageInfo.stage;
                            return (
                              <Button
                                key={stageInfo.stage}
                                onClick={() => setEntrepreneurStage(stageInfo.stage)}
                                variant="outline"
                                className={`w-full h-auto p-4 rounded-2xl text-left flex items-center gap-4 ${
                                  isSelected
                                    ? 'bg-[#00E5FF]/20 border-[#00E5FF]'
                                    : 'bg-black border-border/40 hover:border-[#00E5FF]/50'
                                }`}
                              >
                                <span className="text-2xl">{stageInfo.icon}</span>
                                <div className="flex-1">
                                  <p className={`text-xs font-bold mb-1 ${isSelected ? 'text-[#00E5FF]' : 'text-white/40'}`}>
                                    STAGE {stageInfo.stage}
                                  </p>
                                  <p className={`font-bold ${isSelected ? 'text-[#00E5FF]' : 'text-white'}`}>
                                    {stageInfo.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {stageInfo.description}
                                  </p>
                                </div>
                                {isSelected && (
                                  <Check className="h-6 w-6 text-[#00E5FF]" />
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            {step !== 'username' ? (
              <Button
                onClick={() => {
                  const steps = ['username', 'company', 'role', 'details'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex > 0) {
                    setStep(steps[currentIndex - 1] as any);
                  }
                }}
                variant="outline"
                className="rounded-2xl border-border/40 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 px-8 h-12"
              >
                이전
              </Button>
            ) : (
              <Button
                onClick={onSkip}
                variant="outline"
                className="rounded-2xl border-border/40 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 px-8 h-12"
              >
                나중에 하기
              </Button>
            )}

            {step !== 'details' ? (
              <Button
                onClick={handleNext}
                className="rounded-2xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 px-8 h-12 font-semibold glow-effect"
              >
                다음
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="rounded-2xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 px-8 h-12 font-semibold glow-effect flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                완료
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}