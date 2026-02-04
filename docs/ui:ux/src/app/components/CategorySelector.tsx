import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, Sparkles, Info } from 'lucide-react';
import { 
  UserCategory, 
  CATEGORY_INFO, 
  getIdentitySummary,
  IdentityPattern,
} from '../constants/categories';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface CategorySelectorProps {
  onComplete: (categories: UserCategory[], identity: IdentityPattern | null) => void;
  initialCategories?: UserCategory[];
}

export function CategorySelector({ onComplete, initialCategories = [] }: CategorySelectorProps) {
  const [selectedCategories, setSelectedCategories] = useState<UserCategory[]>(initialCategories);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const identitySummary = getIdentitySummary(selectedCategories);

  const toggleCategory = (category: UserCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleContinue = () => {
    if (selectedCategories.length === 0) return;
    
    if (step === 'select') {
      setStep('confirm');
    } else {
      onComplete(selectedCategories, identitySummary);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('select');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-extrabold text-white">
              {step === 'select' ? '당신은 어떤 사업가인가요?' : '이 정체성이 맞나요?'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {step === 'select' 
              ? '해당하는 것을 모두 선택해 주세요. 더 정확한 추천과 협업 기회를 제공합니다.'
              : '선택하신 정보를 확인해 주세요. 언제든 변경할 수 있습니다.'}
          </p>
          
          {/* 프로그레스 인디케이터 */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`h-1 flex-1 rounded-full transition-all ${
              step === 'select' ? 'bg-primary' : 'bg-primary/30'
            }`} />
            <div className={`h-1 flex-1 rounded-full transition-all ${
              step === 'confirm' ? 'bg-primary' : 'bg-muted'
            }`} />
          </div>
        </motion.div>

        {/* Step 1: 카테고리 선택 */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* 선택된 개수 표시 */}
            {selectedCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/10 rounded-3xl p-4 border border-primary/30 mb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-bold text-primary">
                      {selectedCategories.length}개 선택됨
                    </span>
                  </div>
                  
                  {identitySummary && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xl">{identitySummary.icon}</span>
                      <span className="text-sm font-bold text-white">
                        {identitySummary.label}
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 카테고리 카드들 */}
            <div className="grid gap-4">
              {Object.values(CATEGORY_INFO).map((category, index) => {
                const isSelected = selectedCategories.includes(category.id);
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer rounded-3xl transition-all duration-300 ${
                          isSelected
                            ? 'border-2 bg-gradient-to-br from-[#00E5FF]/20 via-[#00E5FF]/10 to-card'
                            : 'border-2 border-border/50 hover:border-border bg-card'
                        }`}
                        style={{
                          borderColor: isSelected ? '#00E5FF' : undefined,
                          boxShadow: isSelected 
                            ? `0 0 40px ${category.glowColor}, 0 0 60px ${category.glowColor}`
                            : '0 0 20px rgba(0, 0, 0, 0.5)',
                        }}
                        onClick={() => toggleCategory(category.id)}
                      >
                        <CardContent className="p-6 relative overflow-hidden">
                          {/* 배경 글로우 */}
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl"
                              style={{ background: category.glowColor }}
                            />
                          )}

                          <div className="flex items-center gap-4 relative">
                            {/* 아이콘 */}
                            <div
                              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all ${
                                isSelected 
                                  ? 'bg-[#00E5FF]/20 scale-110' 
                                  : 'bg-card-secondary'
                              }`}
                            >
                              {category.icon}
                            </div>

                            {/* 텍스트 */}
                            <div className="flex-1">
                              <h3
                                className={`font-extrabold text-xl mb-1 transition-colors ${
                                  isSelected ? 'text-[#00E5FF]' : 'text-white'
                                }`}
                              >
                                {category.label}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {category.description}
                              </p>
                              
                              {/* 예시 태그 */}
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                {category.examples.slice(0, 3).map((example, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded-lg bg-card-secondary text-foreground/70"
                                  >
                                    {example}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* 체크 아이콘 */}
                            <motion.div
                              initial={false}
                              animate={{
                                scale: isSelected ? 1 : 0.8,
                                opacity: isSelected ? 1 : 0.3,
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-[#00E5FF] text-black' 
                                  : 'bg-card-secondary text-muted-foreground'
                              }`}
                            >
                              <Check className="h-5 w-5" strokeWidth={3} />
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* 안내 메시지 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-card-secondary/50 rounded-2xl p-4 border border-border/30 mt-6"
            >
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground/80 leading-relaxed">
                  <p className="font-bold text-white mb-1">💡 Tip</p>
                  <p>
                    여러 개를 선택할수록 더 정확한 지원사업 추천과 협업 기회를 받을 수 있습니다.
                    직장인이면서 크리에이터인 경우, 둘 다 선택해 주세요!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 2: 확인 */}
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* 정체성 요약 카드 */}
            {identitySummary && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-card rounded-3xl border-2 border-primary/40 overflow-hidden relative">
                  {/* 배경 글로우 */}
                  <div 
                    className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl"
                    style={{ background: identitySummary.color, opacity: 0.3 }}
                  />
                  
                  <CardContent className="p-8 relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-6xl">{identitySummary.icon}</div>
                      <div>
                        <Badge className="bg-primary/20 text-primary border-primary/30 rounded-xl px-3 py-1 mb-2">
                          나의 정체성
                        </Badge>
                        <h2 className="text-3xl font-extrabold text-white mb-2">
                          {identitySummary.label}
                        </h2>
                        <p className="text-foreground/80">
                          {identitySummary.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 선택된 카테고리 목록 */}
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                선택한 비즈니스 영역
              </h3>
              <div className="grid gap-3">
                {selectedCategories.map((catId, index) => {
                  const category = CATEGORY_INFO[catId];
                  
                  return (
                    <motion.div
                      key={catId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-card-secondary/50 rounded-2xl border border-border/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{category.icon}</div>
                            <div className="flex-1">
                              <p className="font-bold text-white">{category.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {category.description}
                              </p>
                            </div>
                            <Check className="h-5 w-5 text-[#00E5FF]" strokeWidth={3} />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 예상 혜택 */}
            <div className="bg-gradient-to-br from-card-secondary via-card to-card-secondary rounded-2xl p-6 border border-border/30">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#00E5FF]" />
                받게 될 혜택
              </h4>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-[#00E5FF]">✓</span>
                  <span>
                    선택한 영역에 맞는 <strong className="text-white">맞춤형 지원사업</strong> 추천
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00E5FF]">✓</span>
                  <span>
                    보완적인 비즈니스를 가진 창업가와의 <strong className="text-white">협업 매칭</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00E5FF]">✓</span>
                  <span>
                    같은 정체성을 가진 사람들의 <strong className="text-white">커뮤니티 자동 가입</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00E5FF]">✓</span>
                  <span>
                    선택한 영역별 <strong className="text-white">맞춤형 아티클 & 인사이트</strong>
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* 하단 액션 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent"
        >
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {step === 'confirm' && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="rounded-2xl h-14 px-6 border-border/50 hover:border-border"
              >
                이전
              </Button>
            )}
            
            <Button
              onClick={handleContinue}
              disabled={selectedCategories.length === 0}
              className={`flex-1 rounded-2xl h-14 font-bold text-lg transition-all ${
                selectedCategories.length === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90'
              }`}
              style={{
                boxShadow: selectedCategories.length > 0 
                  ? '0 0 30px rgba(0, 229, 255, 0.5)' 
                  : 'none',
              }}
            >
              {step === 'select' 
                ? selectedCategories.length === 0 
                  ? '최소 1개 이상 선택해 주세요'
                  : '다음'
                : '완료하고 시작하기'}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
