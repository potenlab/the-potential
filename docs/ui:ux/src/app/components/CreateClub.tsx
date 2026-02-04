import { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Briefcase,
  Heart,
  TrendingUp,
  Handshake,
  Building2,
  Check,
  ChevronRight,
  Lock,
  Globe,
  MessageCircle,
  Target,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { REGION_GROUPS } from '../constants/regions';

interface CreateClubProps {
  onBack: () => void;
  onClubCreated?: (club: any) => void;
}

// 5가지 대분류
const MAIN_CATEGORIES = [
  { id: 'social', label: '사교모임', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'growth', label: '성장·교류', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  { id: 'networking', label: '네트워킹', icon: Handshake, color: 'from-purple-500 to-pink-500' },
  { id: 'region', label: '지역기반', icon: MapPin, color: 'from-green-500 to-emerald-500' },
  { id: 'industry', label: '직종모임', icon: Briefcase, color: 'from-orange-500 to-amber-500' },
];

// 8가지 직종 (직종모임 선택 시)
const INDUSTRIES = [
  { id: 'startup', label: '스타트업', icon: TrendingUp },
  { id: 'selfemployed', label: '자영업', icon: Briefcase },
  { id: 'freelancer', label: '프리랜서', icon: Users },
  { id: 'creator', label: '크리에이터', icon: MessageCircle },
  { id: 'investor', label: '투자자', icon: TrendingUp },
  { id: 'professional', label: '전문직', icon: Briefcase },
  { id: 'smallbiz', label: '소상공인', icon: Building2 },
  { id: 'side', label: '사이드 프로젝트', icon: Target },
];

// REGION_GROUPS용 아이콘 매핑 (CreateClub 전용)
const REGION_ICONS: Record<string, any> = {
  seoul: Building2,
  gyeonggi: Building2,
  regional: MapPin,
};

export function CreateClub({ onBack, onClubCreated }: CreateClubProps) {
  const [step, setStep] = useState<'category' | 'subcategory' | 'details'>('category');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedRegionGroup, setSelectedRegionGroup] = useState<string>(''); // 권역 선택 (서울권/경기권/지방권)
  const [customRegion, setCustomRegion] = useState<string>(''); // 기타 지역 직접 입력
  const [showCustomInput, setShowCustomInput] = useState(false); // 기타 입력 표시
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState('');

  const handleMainCategorySelect = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    
    // 지역기반 또는 직종모임이면 subcategory 단계로
    if (categoryId === 'region' || categoryId === 'industry') {
      setStep('subcategory');
    } else {
      // 다른 카테고리는 바로 details 단계로
      setSelectedSubCategory('');
      setStep('details');
    }
  };

  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId);
    setStep('details');
  };

  const handleCreateClub = () => {
    if (!clubName || !clubDescription) {
      toast.error('클럽 이름과 설명을 모두 입력해주세요.');
      return;
    }

    const newClub = {
      id: Date.now(),
      name: clubName,
      description: clubDescription,
      type: selectedMainCategory === 'region' ? 'region' : selectedMainCategory === 'industry' ? 'interest' : 'interest',
      memberCount: 1,
      category: MAIN_CATEGORIES.find(c => c.id === selectedMainCategory)?.label || '',
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      isPrivate,
      region: selectedMainCategory === 'region' ? selectedSubCategory : undefined,
      createdAt: new Date().toISOString(),
    };

    toast.success('🎉 클럽이 생성되었습니다!', {
      description: '멤버들을 초대해보세요.',
    });

    onClubCreated?.(newClub);
    onBack();
  };

  const getSubCategories = () => {
    if (selectedMainCategory === 'region') return REGION_GROUPS.flatMap(group => group.hubs);
    if (selectedMainCategory === 'industry') return INDUSTRIES;
    return [];
  };

  const selectedMainCategoryData = MAIN_CATEGORIES.find(c => c.id === selectedMainCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (step === 'details') {
              if (selectedMainCategory === 'region' || selectedMainCategory === 'industry') {
                setStep('subcategory');
              } else {
                setStep('category');
              }
            } else if (step === 'subcategory') {
              setStep('category');
            } else {
              onBack();
            }
          }}
          className="h-12 w-12 rounded-2xl hover:bg-card"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">새 클럽 ���들기</h1>
          <p className="text-sm text-muted-foreground">
            {step === 'category' && '클럽 카테고리를 선택해주세요'}
            {step === 'subcategory' && '세부 분류를 선택해주세요'}
            {step === 'details' && '클럽 정보를 입력해주세요'}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2">
        <div className={`h-1 flex-1 rounded-full ${step === 'category' ? 'bg-[#00E5FF]' : 'bg-[#00E5FF]/50'}`} />
        <div className={`h-1 flex-1 rounded-full ${step === 'subcategory' ? 'bg-[#00E5FF]' : step === 'details' ? 'bg-[#00E5FF]/50' : 'bg-white/10'}`} />
        <div className={`h-1 flex-1 rounded-full ${step === 'details' ? 'bg-[#00E5FF]' : 'bg-white/10'}`} />
      </div>

      {/* Step 1: 대분류 선택 */}
      {step === 'category' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MAIN_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedMainCategory === category.id;
              
              return (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => handleMainCategorySelect(category.id)}
                    className={`cursor-pointer transition-all duration-300 rounded-3xl ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#00E5FF]/20 to-[#1A1A1A] border-[#00E5FF] glow-effect'
                        : 'bg-[#1A1A1A] border-border/40 hover:border-[#00E5FF]/50'
                    }`}
                  >
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4">
                        <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {category.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {category.id === 'social' && '친목과 즐거움 중심의 모임'}
                            {category.id === 'growth' && '함께 배우고 성장하는 모임'}
                            {category.id === 'networking' && '비즈니스 연결과 기회 창출'}
                            {category.id === 'region' && '지역 기반 창업가 커뮤니티'}
                            {category.id === 'industry' && '같은 업종 종사자들의 모임'}
                          </p>
                        </div>
                        <ChevronRight className={`h-6 w-6 ${isSelected ? 'text-[#00E5FF]' : 'text-muted-foreground'}`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: 상세 분류 선택 (지역기반/직종모임만) */}
      {step === 'subcategory' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-[#00E5FF]/10 to-[#1A1A1A] border-[#00E5FF]/30 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                {selectedMainCategoryData && (
                  <>
                    {(() => {
                      const Icon = selectedMainCategoryData.icon;
                      return <Icon className="h-5 w-5 text-[#00E5FF]" />;
                    })()}
                    <h3 className="text-lg font-bold text-white">
                      {selectedMainCategoryData.label}
                    </h3>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedMainCategory === 'region' && '활동할 주요 지역을 선택해주세요'}
                {selectedMainCategory === 'industry' && '클럽의 주요 직종을 선택해주세요'}
              </p>
            </CardContent>
          </Card>

          {/* 지역기반인 경우: 2단계 선택 (권역 → 세부 거점) */}
          {selectedMainCategory === 'region' ? (
            <div className="space-y-6">
              {/* Step 1: 권역 선택 */}
              <div>
                <h3 className="text-white font-semibold mb-4">권역 선택</h3>
                <div className="grid grid-cols-3 gap-3">
                  {REGION_GROUPS.map((group) => {
                    const Icon = REGION_ICONS[group.id];
                    const isSelected = selectedRegionGroup === group.id;
                    
                    return (
                      <motion.div
                        key={group.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          onClick={() => setSelectedRegionGroup(group.id)}
                          className={`cursor-pointer transition-all duration-200 rounded-2xl ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#00E5FF]/30 to-[#00E5FF]/10 border-[#00E5FF]'
                              : 'bg-[#1A1A1A] border-border/40 hover:border-[#00E5FF]/50'
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center gap-3 text-center">
                              <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-[#00E5FF]' : 'bg-[#00E5FF]/10'
                              }`}>
                                <Icon className={`h-7 w-7 ${isSelected ? 'text-white' : 'text-[#00E5FF]'}`} />
                              </div>
                              <p className={`font-bold text-lg ${isSelected ? 'text-[#00E5FF]' : 'text-white/90'}`}>
                                {group.label}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: 세부 거점 선택 (권역 선택 후 표시) */}
              {selectedRegionGroup && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-white font-semibold">
                    {REGION_GROUPS.find(g => g.id === selectedRegionGroup)?.label} 세부 거점
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {REGION_GROUPS.find(g => g.id === selectedRegionGroup)?.hubs.map((hub) => {
                      const isSelected = selectedSubCategory === hub.id;
                      
                      return (
                        <motion.div
                          key={hub.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge
                            onClick={() => handleSubCategorySelect(hub.id)}
                            className={`cursor-pointer text-base py-3 px-5 rounded-2xl transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#00E5FF] text-white border-[#00E5FF] hover:bg-[#00E5FF]/90 glow-effect'
                                : 'bg-[#1A1A1A] text-white/80 border-border/40 hover:border-[#00E5FF]/50 hover:text-[#00E5FF]'
                            }`}
                          >
                            {hub.label}
                          </Badge>
                        </motion.div>
                      );
                    })}
                    
                    {/* 기타 (직접 입력) */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        onClick={() => setShowCustomInput(!showCustomInput)}
                        className={`cursor-pointer text-base py-3 px-5 rounded-2xl transition-all duration-200 ${
                          showCustomInput
                            ? 'bg-[#00E5FF] text-white border-[#00E5FF]'
                            : 'bg-[#1A1A1A] text-white/80 border-border/40 hover:border-[#00E5FF]/50 hover:text-[#00E5FF]'
                        }`}
                      >
                        기타 (직접 입력)
                      </Badge>
                    </motion.div>
                  </div>

                  {/* 기타 입력 필드 */}
                  {showCustomInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <Input
                        value={customRegion}
                        onChange={(e) => setCustomRegion(e.target.value)}
                        placeholder="지역을 입력해주세요 (예: 인천/송도)"
                        className="h-12 bg-[#1A1A1A] border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                      />
                      <Button
                        onClick={() => {
                          if (customRegion.trim()) {
                            setSelectedSubCategory(`custom_${customRegion}`);
                            setStep('details');
                          } else {
                            toast.error('지역을 ��력해주세요.');
                          }
                        }}
                        className="w-full rounded-2xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 font-semibold"
                      >
                        확인
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          ) : (
            /* 직종모임인 경우: 기존 그리드 방식 */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INDUSTRIES.map((industry) => {
                const Icon = industry.icon;
                const isSelected = selectedSubCategory === industry.id;
                
                return (
                  <motion.div
                    key={industry.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      onClick={() => handleSubCategorySelect(industry.id)}
                      className={`cursor-pointer transition-all duration-200 rounded-2xl ${
                        isSelected
                          ? 'bg-[#00E5FF] border-[#00E5FF]'
                          : 'bg-[#1A1A1A] border-border/40 hover:border-[#00E5FF]/50'
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-white/20' : 'bg-[#00E5FF]/10'
                          }`}>
                            <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-[#00E5FF]'}`} />
                          </div>
                          <p className={`font-semibold ${isSelected ? 'text-white' : 'text-white/90'}`}>
                            {industry.label}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: 클럽 상세 정보 입력 */}
      {step === 'details' && (
        <div className="space-y-6">
          {/* 선택된 카테고리 표시 */}
          <Card className="bg-gradient-to-br from-[#00E5FF]/10 to-[#1A1A1A] border-[#00E5FF]/30 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                {selectedMainCategoryData && (
                  <>
                    {(() => {
                      const Icon = selectedMainCategoryData.icon;
                      return (
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${selectedMainCategoryData.color} flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      );
                    })()}
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">선택된 카테고리</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-white">
                          {selectedMainCategoryData.label}
                        </p>
                        {selectedSubCategory && (
                          <>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <p className="text-lg font-bold text-[#00E5FF]">
                              {[...REGION_GROUPS.flatMap(group => group.hubs), ...INDUSTRIES].find(s => s.id === selectedSubCategory)?.label}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 클럽 이름 */}
          <div className="space-y-3">
            <Label htmlFor="clubName" className="text-white font-semibold">
              클럽 이름 *
            </Label>
            <Input
              id="clubName"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="예: 강남 스타트업 창업가 모임"
              className="h-14 bg-[#1A1A1A] border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
            />
          </div>

          {/* 클럽 설명 */}
          <div className="space-y-3">
            <Label htmlFor="clubDescription" className="text-white font-semibold">
              클럽 설명 *
            </Label>
            <Textarea
              id="clubDescription"
              value={clubDescription}
              onChange={(e) => setClubDescription(e.target.value)}
              placeholder="클럽의 목적, 주요 활동, 멤버들에게 바라는 점 등을 자유롭게 작성해주세요."
              rows={6}
              className="bg-[#1A1A1A] border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
            />
          </div>

          {/* 태그 */}
          <div className="space-y-3">
            <Label htmlFor="tags" className="text-white font-semibold">
              태그
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="쉼표로 구분하여 입력 (예: 네트워킹, 투자, AI)"
              className="h-14 bg-[#1A1A1A] border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
            />
            {tags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.split(',').map((tag, index) => {
                  const trimmedTag = tag.trim();
                  if (!trimmedTag) return null;
                  return (
                    <Badge key={index} className="bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30 rounded-xl px-3 py-1 border">
                      #{trimmedTag}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* 공개 설정 */}
          <div className="space-y-3">
            <Label className="text-white font-semibold">공개 설정</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card
                onClick={() => setIsPrivate(false)}
                className={`cursor-pointer transition-all duration-200 rounded-2xl ${
                  !isPrivate
                    ? 'bg-[#00E5FF] border-[#00E5FF]'
                    : 'bg-[#1A1A1A] border-border/40 hover:border-[#00E5FF]/50'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      !isPrivate ? 'bg-white/20' : 'bg-[#00E5FF]/10'
                    }`}>
                      <Globe className={`h-5 w-5 ${!isPrivate ? 'text-white' : 'text-[#00E5FF]'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${!isPrivate ? 'text-white' : 'text-white/90'}`}>
                        공개
                      </p>
                      <p className={`text-xs ${!isPrivate ? 'text-white/70' : 'text-muted-foreground'}`}>
                        누구나 가입 가능
                      </p>
                    </div>
                    {!isPrivate && <Check className="h-5 w-5 text-white" />}
                  </div>
                </CardContent>
              </Card>

              <Card
                onClick={() => setIsPrivate(true)}
                className={`cursor-pointer transition-all duration-200 rounded-2xl ${
                  isPrivate
                    ? 'bg-[#00E5FF] border-[#00E5FF]'
                    : 'bg-[#1A1A1A] border-border/40 hover:border-[#00E5FF]/50'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      isPrivate ? 'bg-white/20' : 'bg-[#00E5FF]/10'
                    }`}>
                      <Lock className={`h-5 w-5 ${isPrivate ? 'text-white' : 'text-[#00E5FF]'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${isPrivate ? 'text-white' : 'text-white/90'}`}>
                        비공개
                      </p>
                      <p className={`text-xs ${isPrivate ? 'text-white/70' : 'text-muted-foreground'}`}>
                        승인 후 가입
                      </p>
                    </div>
                    {isPrivate && <Check className="h-5 w-5 text-white" />}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 생성 버튼 */}
          <Button
            onClick={handleCreateClub}
            disabled={!clubName || !clubDescription}
            className="w-full h-14 rounded-2xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed glow-effect"
          >
            <Users className="mr-2 h-5 w-5" />
            클럽 만들기
          </Button>
        </div>
      )}
    </motion.div>
  );
}