import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Plus, Building2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BusinessInfo, 
  BusinessType, 
  BUSINESS_TYPE_INFO, 
  STAGE_LABELS_BY_TYPE,
  getStageLabel,
  getStageDescription,
  calculateInfluenceScore,
  calculateTotalInfluence,
  getInfluenceLevel,
  HybridProfile,
} from '../constants/stages';
import { StageCard } from './StageCard';
import { HybridStageCard } from './HybridStageCard';

interface BusinessSwitcherProps {
  businesses: BusinessInfo[];
  onBusinessSelect?: (businessId: string) => void;
  onAddBusiness?: () => void;
}

export function BusinessSwitcher({ 
  businesses, 
  onBusinessSelect,
  onAddBusiness 
}: BusinessSwitcherProps) {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    businesses.find(b => b.isPrimary)?.id || businesses[0]?.id || null
  );

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
  const totalInfluence = calculateTotalInfluence(businesses);
  const influenceLevel = getInfluenceLevel(totalInfluence);

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
    onBusinessSelect?.(businessId);
  };

  return (
    <div className="space-y-4">
      {/* 영향력 점수 카드 */}
      {businesses.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-card via-card-secondary to-card rounded-3xl border-2 border-primary/40 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-white">통합 영향력 점수</h3>
                </div>
                <Badge 
                  className="px-3 py-1 rounded-xl border-0 font-bold"
                  style={{ 
                    backgroundColor: `${influenceLevel.color}20`,
                    color: influenceLevel.color,
                  }}
                >
                  {influenceLevel.level}
                </Badge>
              </div>

              <div className="flex items-end gap-3 mb-2">
                <span className="text-5xl font-extrabold" style={{ color: influenceLevel.color }}>
                  {totalInfluence}
                </span>
                <span className="text-2xl font-bold text-muted-foreground mb-1">/ 100</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-2xl">{influenceLevel.icon}</span>
                <span>{influenceLevel.description}</span>
              </div>

              {/* 멀티 비즈니스 보너스 표시 */}
              <div className="mt-4 p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <p className="text-xs text-primary font-semibold">
                  🎁 멀티 비즈니스 보너스 +15점 적용됨
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 비즈니스 카드 리스트 (토스 스타일) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-muted-foreground">
            내 사업 ({businesses.length})
          </h3>
          {onAddBusiness && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddBusiness}
              className="h-8 rounded-xl text-primary hover:bg-primary/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              사업 추가
            </Button>
          )}
        </div>

        {businesses.map((business, index) => {
          const typeInfo = BUSINESS_TYPE_INFO[business.type];
          const stageInfo = STAGE_LABELS_BY_TYPE[business.stage];
          const stageLabel = getStageLabel(business.stage, business.type);
          const stageDescription = getStageDescription(business.stage, business.type);
          const influenceScore = calculateInfluenceScore(business.stage);
          const isSelected = selectedBusinessId === business.id;

          return (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBusinessSelect(business.id)}
            >
              <Card 
                className={`bg-gradient-to-br ${typeInfo.bgColor} rounded-3xl border-2 transition-all cursor-pointer overflow-hidden relative ${
                  isSelected 
                    ? `${typeInfo.borderColor} glow-effect` 
                    : 'border-border/30 hover:border-border/50'
                }`}
                style={{
                  boxShadow: isSelected 
                    ? `0 0 30px ${stageInfo.glowColor}` 
                    : 'none',
                }}
              >
                {/* 선택된 카드 표시 */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
                )}

                {/* 배경 글로우 */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30"
                  style={{ backgroundColor: stageInfo.color }}
                />

                <CardContent className="p-6 relative">
                  {/* 상단: 타입 배지 & 영향력 점수 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <Badge className={`${typeInfo.textColor} bg-transparent border-0 px-0 text-sm font-bold`}>
                          {typeInfo.label}
                        </Badge>
                        {business.isPrimary && (
                          <Badge className="ml-2 bg-primary/20 text-primary border-primary/30 text-xs px-2 py-0.5 rounded-lg">
                            메인
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-extrabold" style={{ color: stageInfo.color }}>
                        {influenceScore}
                      </div>
                      <div className="text-xs text-muted-foreground">영향력</div>
                    </div>
                  </div>

                  {/* 사업명 & 설명 */}
                  <div className="mb-4">
                    <h3 className="text-xl font-extrabold text-white mb-1">
                      {business.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {business.industry} · {new Date().getFullYear() - business.foundedYear + 1}년차
                    </p>
                    <p className="text-sm text-foreground/80 line-clamp-2">
                      {business.description}
                    </p>
                  </div>

                  {/* Stage 인디케이터 */}
                  <div className="bg-card-secondary/50 rounded-2xl p-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground">현재 단계</span>
                      <span className="text-xs font-bold" style={{ color: stageInfo.color }}>
                        {stageInfo.shortLabel}
                      </span>
                    </div>
                    
                    {/* 7단계 프로그레스 바 */}
                    <div className="flex items-center gap-1 mb-2">
                      {[0, 1, 2, 3, 4, 5, 6].map((stage) => {
                        const isActive = stage <= business.stage;
                        const isMasterStage = stage >= 5;
                        
                        return (
                          <div
                            key={stage}
                            className={`flex-1 h-1.5 rounded-full transition-all ${
                              isActive && isMasterStage
                                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500'
                                : isActive 
                                ? 'bg-gradient-to-r from-primary to-cyan-400'
                                : 'bg-[#4E5968]'
                            }`}
                            style={{
                              boxShadow: stage === business.stage 
                                ? `0 0 8px ${stageInfo.glowColor}` 
                                : 'none',
                            }}
                          />
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stageInfo.icon}</span>
                      <span className="text-sm font-bold text-white">{stageLabel}</span>
                    </div>
                  </div>

                  {/* 하단: 자세히 보기 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {typeInfo.description}
                    </span>
                    <ChevronRight 
                      className={`h-5 w-5 transition-colors ${
                        isSelected ? typeInfo.textColor : 'text-muted-foreground'
                      }`} 
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* 선택된 비즈니스 상세 (펼쳐짐) */}
      <AnimatePresence mode="wait">
        {selectedBusiness && selectedBusiness.type !== BusinessType.HYBRID && (
          <motion.div
            key={selectedBusiness.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StageCard 
              currentStage={selectedBusiness.stage} 
              stage5Type={selectedBusiness.stage5Type}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 사업 추가 안내 */}
      {businesses.length === 1 && onAddBusiness && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-card-secondary/50 to-card rounded-3xl border-2 border-dashed border-border/50 cursor-pointer hover:border-primary/30 transition-all"
            onClick={onAddBusiness}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">추가 사업을 등록하세요</h3>
                  <p className="text-sm text-muted-foreground">
                    자영업과 스타트업을 함께 운영 중이신가요? 멀티 비즈니스 보너스를 받아보세요!
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}