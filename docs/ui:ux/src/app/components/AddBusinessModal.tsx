import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, TrendingUp, Plus } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { UserCategory, CATEGORY_INFO, getIdentitySummary } from '../constants/categories';
import { EntrepreneurStage, Stage5Type } from '../constants/stages';
import { toast } from 'sonner';

const STAGE_OPTIONS = [
  { value: EntrepreneurStage.IDEA, label: 'Stage 0 - 아이디어 단계' },
  { value: EntrepreneurStage.MVP, label: 'Stage 1 - 아이디어 검증' },
  { value: EntrepreneurStage.LAUNCH, label: 'Stage 2 - MVP 출시' },
  { value: EntrepreneurStage.GROWTH, label: 'Stage 3 - 초기 성장' },
  { value: EntrepreneurStage.SCALE, label: 'Stage 4 - 본격 확장' },
  { value: EntrepreneurStage.DOMINATE, label: 'Stage 5 - 시장 지배' },
  { value: EntrepreneurStage.EXIT, label: 'Stage 6 - IPO/Exit' },
];

const STAGE5_TYPE_OPTIONS = [
  { value: Stage5Type.INVESTMENT, label: '투자형 (시리즈 C 이상)' },
  { value: Stage5Type.REVENUE, label: '매출형 (전국 브랜드)' },
];

interface AddBusinessModalProps {
  existingCategories: UserCategory[]; // 이미 추가된 직종들
  onClose: () => void;
  onAdd: (category: UserCategory, stage: EntrepreneurStage, stage5Type?: Stage5Type) => void;
}

export function AddBusinessModal({ existingCategories, onClose, onAdd }: AddBusinessModalProps) {
  const [step, setStep] = useState<'category' | 'stage'>('category');
  const [selectedCategory, setSelectedCategory] = useState<UserCategory | null>(null);
  const [entrepreneurStage, setEntrepreneurStage] = useState(EntrepreneurStage.IDEA);
  const [stage5Type, setStage5Type] = useState<Stage5Type | undefined>();

  // 아직 추가하지 않은 카테고리만 필터링
  const availableCategories = Object.values(CATEGORY_INFO).filter(
    (cat) => !existingCategories.includes(cat.id)
  );

  const identitySummary = getIdentitySummary(selectedCategory ? [selectedCategory] : []);

  const handleAdd = () => {
    if (!selectedCategory) {
      toast.error('직종을 선택해주세요.');
      return;
    }

    onAdd(
      selectedCategory,
      entrepreneurStage,
      entrepreneurStage === EntrepreneurStage.DOMINATE ? stage5Type : undefined
    );
    toast.success(`${CATEGORY_INFO[selectedCategory].label} 사업이 추가되었습니다! 🎉`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-3xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
                <Plus className="h-8 w-8 text-[#00E5FF]" />
                사업 추가하기
              </h1>
              <p className="text-muted-foreground">
                새로운 사업 분야와 창업 단계를 선택하세요
              </p>
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

          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${
              step === 'category' ? 'bg-[#00E5FF]' : 'bg-[#00E5FF]'
            }`} style={{ boxShadow: step === 'category' ? '0 0 20px rgba(0, 229, 255, 0.6)' : 'none' }} />
            <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${
              step === 'stage' ? 'bg-[#00E5FF]' : 'bg-[#1A1A1A]'
            }`} style={{ boxShadow: step === 'stage' ? '0 0 20px rgba(0, 229, 255, 0.6)' : 'none' }} />
          </div>

          {/* Content */}
          <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl mb-6">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: 직종 선택 */}
                {step === 'category' && (
                  <motion.div
                    key="category"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-[#00E5FF]" />
                        추가할 사업 분야를 선택하세요
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        현재 진행 중인 다른 사업이 있다면 추가해보세요
                      </p>

                      {availableCategories.length === 0 ? (
                        <div className="text-center py-12 bg-black/50 rounded-2xl border border-border/40">
                          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            모든 사업 분야가 이미 추가되었습니다
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* 카테고리 선택 카드 */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            {availableCategories.map((category) => {
                              const isSelected = selectedCategory === category.id;
                              
                              return (
                                <motion.div
                                  key={category.id}
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => setSelectedCategory(category.id)}
                                  className="cursor-pointer"
                                >
                                  <Card
                                    className={`transition-all duration-200 rounded-3xl overflow-hidden ${
                                      isSelected
                                        ? 'bg-gradient-to-br from-[#00E5FF]/30 to-[#00E5FF]/10 border-2 border-[#00E5FF] shadow-lg shadow-[#00E5FF]/20'
                                        : 'bg-gradient-to-br from-[#1A1A1A] to-black border border-border/40 hover:border-[#00E5FF]/50'
                                    }`}
                                    style={{
                                      boxShadow: isSelected ? `0 0 30px ${category.glowColor}` : 'none'
                                    }}
                                  >
                                    <CardContent className="p-6">
                                      <div className="flex items-start justify-between mb-4">
                                        <div className={`text-4xl ${isSelected ? 'animate-bounce' : ''}`}>
                                          {category.icon}
                                        </div>
                                        {isSelected && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-[#00E5FF] rounded-full h-6 w-6 flex items-center justify-center"
                                          >
                                            <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                          </motion.div>
                                        )}
                                      </div>
                                      
                                      <h4 className={`font-extrabold text-lg mb-2 ${
                                        isSelected ? 'text-[#00E5FF]' : 'text-white'
                                      }`}>
                                        {category.label}
                                      </h4>
                                      
                                      <p className={`text-xs leading-relaxed ${
                                        isSelected ? 'text-white/90' : 'text-muted-foreground'
                                      }`}>
                                        {category.description}
                                      </p>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* 정체성 요약 카드 */}
                          {selectedCategory && identitySummary && (
                            <motion.div
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className="relative"
                            >
                              <Card className="bg-gradient-to-br from-[#00E5FF]/20 via-[#00E5FF]/10 to-transparent border-[#00E5FF]/50 rounded-3xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/20 to-transparent blur-xl" />
                                
                                <CardContent className="p-6 relative z-10">
                                  <div className="flex items-start gap-4">
                                    <div className="text-5xl">
                                      {identitySummary.icon}
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-5 w-5 text-[#00E5FF]" />
                                        <h4 className="font-bold text-white">추가될 정체성</h4>
                                      </div>
                                      
                                      <p className="text-2xl font-extrabold text-[#00E5FF] mb-2">
                                        {identitySummary.label}
                                      </p>
                                      <p className="text-sm text-white/80 leading-relaxed">
                                        {identitySummary.description}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: 창업 단계 선택 */}
                {step === 'stage' && (
                  <motion.div
                    key="stage"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-[#00E5FF]" />
                        창업 단계 선택
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        이 사업의 현재 단계를 선택해주세요
                      </p>

                      <div className="space-y-3">
                        {STAGE_OPTIONS.map((option) => {
                          const isSelected = entrepreneurStage === option.value;
                          
                          return (
                            <motion.div
                              key={option.value}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setEntrepreneurStage(option.value)}
                              className="cursor-pointer"
                            >
                              <Card
                                className={`transition-all duration-200 rounded-2xl ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#00E5FF]/30 to-[#00E5FF]/10 border-[#00E5FF]'
                                    : 'bg-black border-border/40 hover:border-[#00E5FF]/50'
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-3 w-3 rounded-full ${
                                      isSelected ? 'bg-[#00E5FF]' : 'bg-border'
                                    }`} />
                                    <p className={`font-semibold ${isSelected ? 'text-[#00E5FF]' : 'text-white'}`}>
                                      {option.label}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Stage 5 세부 타입 선택 */}
                      {entrepreneurStage === EntrepreneurStage.DOMINATE && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 mt-6"
                        >
                          <h4 className="text-white font-semibold">Stage 5 세부 타입</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {STAGE5_TYPE_OPTIONS.map((option) => {
                              const isSelected = stage5Type === option.value;
                              
                              return (
                                <motion.div
                                  key={option.value}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Card
                                    onClick={() => setStage5Type(option.value)}
                                    className={`cursor-pointer transition-all duration-200 rounded-2xl ${
                                      isSelected
                                        ? 'bg-[#00E5FF] border-[#00E5FF]'
                                        : 'bg-black border-border/40 hover:border-[#00E5FF]/50'
                                    }`}
                                  >
                                    <CardContent className="p-4">
                                      <p className={`text-center font-semibold ${
                                        isSelected ? 'text-white' : 'text-white/80'
                                      }`}>
                                        {option.label}
                                      </p>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            {step === 'category' ? (
              <Button
                onClick={onClose}
                variant="outline"
                className="rounded-2xl border-border/40 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 px-8 h-12"
              >
                취소
              </Button>
            ) : (
              <Button
                onClick={() => setStep('category')}
                variant="outline"
                className="rounded-2xl border-border/40 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 px-8 h-12"
              >
                이전
              </Button>
            )}

            {step === 'category' ? (
              <Button
                onClick={() => setStep('stage')}
                disabled={!selectedCategory || availableCategories.length === 0}
                className="rounded-2xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 px-8 h-12 font-semibold glow-effect disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </Button>
            ) : (
              <Button
                onClick={handleAdd}
                className="rounded-2xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 px-8 h-12 font-semibold glow-effect flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                사업 추가
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
