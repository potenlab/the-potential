import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Camera,
  MapPin,
  Briefcase,
  Building2,
  TrendingUp,
  Save,
  User,
  Mail,
  Sparkles,
  Check,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { UserCategory, CATEGORY_INFO, getIdentitySummary } from '../constants/categories';
import { getStagesByCategory } from '../constants/stages';
import { REGION_GROUPS, getHubLabel, getRegionGroupByHub } from '../constants/regions';
import { toast } from 'sonner';

interface EditProfileProps {
  profile: {
    name: string;
    email?: string;
    title: string;
    company: string;
    location: string;
    locationHub?: string;
    avatar: string;
    bio: string;
    entrepreneurStage: number;
    expertise: string[];
    categories?: UserCategory[];
  };
  onSave: (updatedProfile: any) => void;
  onCancel: () => void;
}

export function EditProfile({ profile, onSave, onCancel }: EditProfileProps) {
  const [step, setStep] = useState<'basic' | 'location' | 'category' | 'stage'>('basic');
  
  // Form state
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email || '');
  const [title, setTitle] = useState(profile.title);
  const [company, setCompany] = useState(profile.company);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  
  // 상세 정보: 지역 + 직종 + 창업단계
  const [selectedRegionGroup, setSelectedRegionGroup] = useState('');
  const [locationHub, setLocationHub] = useState(profile.locationHub || '');
  const [selectedCategory, setSelectedCategory] = useState<UserCategory | null>(
    profile.categories?.[0] || null
  );
  const [entrepreneurStage, setEntrepreneurStage] = useState(profile.entrepreneurStage);

  // Initialize region group from locationHub (한 번만 실행)
  useEffect(() => {
    if (profile.locationHub && !selectedRegionGroup) {
      const regionGroup = getRegionGroupByHub(profile.locationHub);
      setSelectedRegionGroup(regionGroup);
    }
  }, []); // 초기 마운트 시에만 실행

  // identitySummary 계산
  const identitySummary = selectedCategory ? getIdentitySummary([selectedCategory]) : null;

  // 사진 변경 핸들러
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          toast.success('프로필 사진이 변경되었습니다!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('이름을 입력해주세요.');
      setStep('basic');
      return;
    }

    if (!locationHub) {
      toast.error('활동 지역을 선택해주세요.');
      setStep('location');
      return;
    }

    if (selectedCategory === null) {
      toast.error('주력 직종을 선택해주세요.');
      setStep('category');
      return;
    }

    const updatedProfile = {
      name,
      email,
      title,
      company,
      bio,
      avatar,
      categories: selectedCategory ? [selectedCategory] : [],
      locationHub,
      entrepreneurStage,
      expertise: profile.expertise, // 기존 expertise 유지
    };

    onSave(updatedProfile);
    toast.success('프로필이 업데이트되었습니다!');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-white mb-1">프로필 수정</h1>
              <p className="text-muted-foreground">나를 더 잘 표현할 수 있도록 프로필을 업데이트하세요</p>
            </div>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-2xl hover:bg-[#1A1A1A]"
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mb-8">
            {['basic', 'location', 'category', 'stage'].map((s, idx) => {
              const stepLabels = {
                basic: '기본 정보',
                location: '활동 지역',
                category: '주력 직종',
                stage: '창업 단계'
              };
              
              const stepOrder = { basic: 0, location: 1, category: 2, stage: 3 };
              const currentStepIndex = stepOrder[step as keyof typeof stepOrder];
              const thisStepIndex = stepOrder[s as keyof typeof stepOrder];
              
              const isActive = step === s;
              const isCompleted = thisStepIndex < currentStepIndex;
              
              return (
                <div key={s} className="flex items-center flex-1">
                  <div 
                    className="flex-1 cursor-pointer group"
                    onClick={() => setStep(s as any)}
                  >
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-[#00E5FF]' : isCompleted ? 'bg-[#00E5FF]/40' : 'bg-[#1A1A1A]'
                      } group-hover:bg-[#00E5FF]/70`}
                      style={{
                        boxShadow: isActive ? '0 0 20px rgba(0, 229, 255, 0.6)' : 'none'
                      }}
                    />
                    <p className={`text-sm mt-2 text-center transition-all duration-200 ${
                      isActive ? 'text-[#00E5FF] font-extrabold' : isCompleted ? 'text-white/60 font-semibold' : 'text-muted-foreground'
                    } group-hover:text-[#00E5FF]`}>
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
                {/* Step 1: 기본 정보 */}
                {step === 'basic' && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-8">기본 정보</h3>
                      
                      {/* 프로필 사진 */}
                      <div className="flex items-center gap-6 mb-8">
                        <Avatar className="h-24 w-24 border-4 border-[#00E5FF]/20">
                          <AvatarImage src={avatar} alt={name} />
                          <AvatarFallback className="bg-[#00E5FF]/10 text-[#00E5FF] text-2xl font-bold">
                            {name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            className="rounded-2xl border-border/40 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            사진 변경
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            JPG, PNG 형식, 최대 5MB
                          </p>
                        </div>
                      </div>

                      {/* 이름 */}
                      <div className="space-y-3 mb-5">
                        <Label className="text-white font-semibold flex items-center gap-2">
                          <User className="h-4 w-4 text-[#00E5FF]" />
                          이름 *
                        </Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="이름을 입력하세요"
                          className="h-12 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                        />
                      </div>

                      {/* 이메일 */}
                      <div className="space-y-3 mb-5">
                        <Label className="text-white font-semibold flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#00E5FF]" />
                          이메일
                        </Label>
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          type="email"
                          className="h-12 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                        />
                      </div>

                      {/* 회사명 */}
                      <div className="space-y-3 mb-5">
                        <Label className="text-white font-semibold flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#00E5FF]" />
                          회사/프로젝트명
                        </Label>
                        <Input
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="회사명을 입력하세요"
                          className="h-12 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                        />
                      </div>

                      {/* 직함 */}
                      <div className="space-y-3 mb-5">
                        <Label className="text-white font-semibold flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-[#00E5FF]" />
                          직함/역할
                        </Label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="예: Founder & CEO"
                          className="h-12 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                        />
                      </div>

                      {/* 자기소개 */}
                      <div className="space-y-3">
                        <Label className="text-white font-semibold">자기소개</Label>
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="자신을 소개하고 어떤 협업을 원하는지 설명해주세요"
                          className="min-h-32 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF] resize-none"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                          {bio.length} / 500자
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: 활동 지역 */}
                {step === 'location' && (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-[#00E5FF]" />
                        활동 지역
                      </h3>

                      {/* 지역 거점 */}
                      <div className="mb-8">
                        <Label className="text-white font-semibold mb-4 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-[#00E5FF]" />
                          활동 지역 거점 *
                        </Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          주로 활동하는 지역을 선택해주요
                        </p>

                        {/* 권역 선택 */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {REGION_GROUPS.map((group) => {
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
                                      : 'bg-black border-border/40 hover:border-[#00E5FF]/50'
                                  }`}
                                >
                                  <CardContent className="p-4">
                                    <p className={`font-bold text-center text-sm ${isSelected ? 'text-[#00E5FF]' : 'text-white/90'}`}>
                                      {group.label}
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>
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
                                  variant={isSelected ? "default" : "outline"}
                                  className={`cursor-pointer px-4 py-2 rounded-xl transition-all duration-200 ${
                                    isSelected
                                      ? 'bg-[#00E5FF] text-black border-[#00E5FF] hover:bg-[#00E5FF]/90'
                                      : 'border-border/40 text-white/80 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10'
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3 mr-1" />}
                                  {hub.label}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: 주력 직종 */}
                {step === 'category' && (
                  <motion.div
                    key="category"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-[#00E5FF]" />
                        주력 직종
                      </h3>

                      {/* 주력 직종 선택 (1개만) */}
                      <div className="mb-8">
                        <Label className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-[#00E5FF]" />
                          주력 직종 *
                        </Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          현재 주력하는 직종을 1개 선택해주세요
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                            const isSelected = selectedCategory === key;
                            
                            return (
                              <motion.div
                                key={key}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card
                                  onClick={() => setSelectedCategory(key as UserCategory)}
                                  className={`cursor-pointer transition-all duration-200 rounded-2xl ${
                                    isSelected
                                      ? 'bg-gradient-to-br from-[#00E5FF]/30 to-[#00E5FF]/10 border-[#00E5FF]'
                                      : 'bg-black border-border/40 hover:border-[#00E5FF]/50'
                                  }`}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-xl text-2xl ${
                                        isSelected ? 'bg-[#00E5FF]/20' : 'bg-white/5'
                                      }`}>
                                        {info.icon}
                                      </div>
                                      <div className="flex-1">
                                        <p className={`font-bold text-sm ${
                                          isSelected ? 'text-[#00E5FF]' : 'text-white/90'
                                        }`}>
                                          {info.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {info.description}
                                        </p>
                                      </div>
                                      {isSelected && (
                                        <Check className="h-5 w-5 text-[#00E5FF]" />
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: 창업 단계 */}
                {step === 'stage' && (
                  <motion.div
                    key="stage"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-[#00E5FF]" />
                        창업 단계
                      </h3>

                      {/* 창업 단계 (직종 선택 시에만 표시) */}
                      {selectedCategory && (
                        <div>
                          <Label className="text-white font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-[#00E5FF]" />
                            창업 단계 *
                          </Label>
                          <p className="text-sm text-muted-foreground mb-4">
                            현재 진행 중인 단계를 선택해주세요
                          </p>

                          <div className="space-y-2">
                            {getStagesByCategory(selectedCategory).map((stage) => {
                              const isSelected = entrepreneurStage === stage.stage;
                              
                              return (
                                <motion.div
                                  key={stage.stage}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                >
                                  <Card
                                    onClick={() => setEntrepreneurStage(stage.stage)}
                                    className={`cursor-pointer transition-all duration-200 rounded-2xl ${
                                      isSelected
                                        ? 'bg-gradient-to-br from-[#00E5FF]/30 to-[#00E5FF]/10 border-[#00E5FF]'
                                        : 'bg-black border-border/40 hover:border-[#00E5FF]/50'
                                    }`}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className={`font-bold ${
                                            isSelected ? 'text-[#00E5FF]' : 'text-white/90'
                                          }`}>
                                            {stage.label}
                                          </p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {stage.description}
                                          </p>
                                        </div>
                                        {isSelected && (
                                          <Check className="h-5 w-5 text-[#00E5FF]" />
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            {(step === 'location' || step === 'category' || step === 'stage') && (
              <Button
                onClick={() => {
                  if (step === 'location') setStep('basic');
                  else if (step === 'category') setStep('location');
                  else if (step === 'stage') setStep('category');
                }}
                variant="outline"
                className="rounded-2xl border-border/40 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 px-8 h-12"
              >
                이전
              </Button>
            )}

            <div className="flex-1" />

            {step === 'basic' ? (
              <Button
                onClick={() => setStep('location')}
                className="bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 rounded-2xl px-8 h-12 font-bold"
              >
                다음
              </Button>
            ) : step === 'location' ? (
              <Button
                onClick={() => setStep('category')}
                className="bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 rounded-2xl px-8 h-12 font-bold"
              >
                다음
              </Button>
            ) : step === 'category' ? (
              <Button
                onClick={() => setStep('stage')}
                className="bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 rounded-2xl px-8 h-12 font-bold"
              >
                다음
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 rounded-2xl px-8 h-12 font-bold"
              >
                <Save className="h-5 w-5 mr-2" />
                저장
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}