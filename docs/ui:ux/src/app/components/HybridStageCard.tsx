import { useState } from 'react';
import { motion } from 'motion/react';
import { Info, TrendingUp, Rocket, Store } from 'lucide-react';
import { EntrepreneurStage, STAGE_LABELS_BY_TYPE, HybridProfile } from '../constants/stages';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface HybridStageCardProps {
  hybridProfile: HybridProfile;
  compact?: boolean;
}

export function HybridStageCard({ hybridProfile, compact = false }: HybridStageCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const startupStageLabel = STAGE_LABELS_BY_TYPE[hybridProfile.startupStage];
  const businessStageLabel = STAGE_LABELS_BY_TYPE[hybridProfile.businessStage];

  return (
    <>
      <motion.div
        whileHover={{ scale: compact ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsDetailOpen(true)}
        className="cursor-pointer"
      >
        <Card 
          className="bg-gradient-to-br from-card via-card-secondary to-card rounded-3xl border-2 border-primary/40 hover:border-primary/60 overflow-hidden relative transition-all"
          style={{
            boxShadow: '0 0 40px rgba(0, 121, 255, 0.25), 0 0 60px rgba(16, 185, 129, 0.15)',
          }}
        >
          {/* 배경 그라데이션 */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />

          <CardContent className="p-6 relative">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-extrabold text-white">하이브리드 창업가</h3>
              </div>
              <Badge className="bg-gradient-to-r from-primary/20 to-emerald-500/20 text-white border-primary/30 rounded-xl px-3 py-1 font-bold">
                듀얼 트랙
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              실제로 돈을 벌면서(자영업), 새로운 혁신을 시도(스타트업)하는 전문가
            </p>

            {/* 스타트업 트랙 (상단 바 - Blue) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  <span className="font-bold text-white">스타트업 트랙</span>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/30 rounded-xl text-xs px-2 py-1">
                  Stage {hybridProfile.startupStage}
                </Badge>
              </div>

              {/* 7단계 프로그레스 바 (블루) */}
              <div className="mb-2">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6].map((stage) => {
                    const isActive = stage <= hybridProfile.startupStage;
                    const isCurrent = stage === hybridProfile.startupStage;
                    const isMasterStage = stage >= 5;
                    
                    return (
                      <motion.div
                        key={stage}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: stage * 0.1, duration: 0.3 }}
                        className={`flex-1 h-2.5 rounded-full transition-all ${
                          isActive && isMasterStage
                            ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500' 
                            : isActive 
                            ? 'bg-gradient-to-r from-primary to-cyan-400' 
                            : 'bg-[#4E5968]'
                        }`}
                        style={{
                          boxShadow: isCurrent 
                            ? `0 0 16px ${startupStageLabel.glowColor}` 
                            : 'none',
                        }}
                      />
                    );
                  })}
                </div>
                
                {/* Stage Numbers */}
                <div className="flex items-center justify-between mt-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((stage) => (
                    <span 
                      key={stage}
                      className={`text-[10px] font-bold transition-colors ${
                        stage <= hybridProfile.startupStage ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>

              {/* 현재 단계 설명 */}
              <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{startupStageLabel.icon}</span>
                  <span className="font-bold text-primary">{startupStageLabel.startupLabel}</span>
                </div>
                <p className="text-xs text-foreground/80">{startupStageLabel.startupDescription}</p>
              </div>
            </div>

            {/* 구분선 */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

            {/* 비즈니스 트랙 (하단 바 - Cyan/Green) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-white">비즈니스 트랙 (자영업)</span>
                </div>
                <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/30 rounded-xl text-xs px-2 py-1">
                  Stage {hybridProfile.businessStage}
                </Badge>
              </div>

              {/* 7단계 프로그레스 바 (그린) */}
              <div className="mb-2">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6].map((stage) => {
                    const isActive = stage <= hybridProfile.businessStage;
                    const isCurrent = stage === hybridProfile.businessStage;
                    const isMasterStage = stage >= 5;
                    
                    return (
                      <motion.div
                        key={stage}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: stage * 0.1 + 0.7, duration: 0.3 }}
                        className={`flex-1 h-2.5 rounded-full transition-all ${
                          isActive && isMasterStage
                            ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500' 
                            : isActive 
                            ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' 
                            : 'bg-[#4E5968]'
                        }`}
                        style={{
                          boxShadow: isCurrent 
                            ? `0 0 16px ${businessStageLabel.glowColor}` 
                            : 'none',
                        }}
                      />
                    );
                  })}
                </div>
                
                {/* Stage Numbers */}
                <div className="flex items-center justify-between mt-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((stage) => (
                    <span 
                      key={stage}
                      className={`text-[10px] font-bold transition-colors ${
                        stage <= hybridProfile.businessStage ? 'text-emerald-400' : 'text-muted-foreground'
                      }`}
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>

              {/* 현재 단계 설명 */}
              <div className="bg-emerald-400/10 rounded-2xl p-4 border border-emerald-400/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{businessStageLabel.icon}</span>
                  <span className="font-bold text-emerald-400">{businessStageLabel.businessLabel}</span>
                </div>
                <p className="text-xs text-foreground/80">{businessStageLabel.businessDescription}</p>
              </div>
            </div>

            {/* 하단 정보 */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>자세한 정보를 보려면 클릭하세요</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 상세 정보 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-card border-border/50 rounded-3xl max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              하이브리드 창업가 상세 정보
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              두 가지 비즈니스 모델을 동시에 운영하는 전문가
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* 스타트업 트랙 전체 정보 */}
            <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-white">스타트업 트랙</h3>
                <Badge className="bg-primary text-white border-0 rounded-xl px-2 py-1 text-sm">
                  Stage {hybridProfile.startupStage}
                </Badge>
              </div>

              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5, 6].map((stage) => {
                  const label = STAGE_LABELS_BY_TYPE[stage];
                  const isCompleted = stage <= hybridProfile.startupStage;
                  const isCurrent = stage === hybridProfile.startupStage;

                  return (
                    <div
                      key={stage}
                      className={`p-4 rounded-xl transition-all ${
                        isCurrent 
                          ? 'bg-primary/20 border-2 border-primary' 
                          : isCompleted
                          ? 'bg-card-secondary/50 border border-primary/10'
                          : 'bg-card-secondary/30 border border-border/30 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{label.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isCurrent ? 'text-primary' : 'text-white'}`}>
                              Stage {stage}: {label.startupLabel}
                            </span>
                            {isCurrent && (
                              <Badge className="bg-primary text-white border-0 rounded-lg text-xs px-2 py-0.5">
                                현재
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{label.startupDescription}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 비즈니스 트랙 전체 정보 */}
            <div className="bg-emerald-400/10 rounded-2xl p-6 border border-emerald-400/20">
              <div className="flex items-center gap-2 mb-4">
                <Store className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">비즈니스 트랙 (자영업)</h3>
                <Badge className="bg-emerald-400 text-black border-0 rounded-xl px-2 py-1 text-sm">
                  Stage {hybridProfile.businessStage}
                </Badge>
              </div>

              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5, 6].map((stage) => {
                  const label = STAGE_LABELS_BY_TYPE[stage];
                  const isCompleted = stage <= hybridProfile.businessStage;
                  const isCurrent = stage === hybridProfile.businessStage;

                  return (
                    <div
                      key={stage}
                      className={`p-4 rounded-xl transition-all ${
                        isCurrent 
                          ? 'bg-emerald-400/20 border-2 border-emerald-400' 
                          : isCompleted
                          ? 'bg-card-secondary/50 border border-emerald-400/10'
                          : 'bg-card-secondary/30 border border-border/30 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{label.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                              Stage {stage}: {label.businessLabel}
                            </span>
                            {isCurrent && (
                              <Badge className="bg-emerald-400 text-black border-0 rounded-lg text-xs px-2 py-0.5">
                                현재
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{label.businessDescription}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 하이브리드 장점 */}
            <div className="bg-gradient-to-br from-primary/10 via-emerald-400/10 to-card rounded-2xl p-6 border border-primary/20">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-xl">💎</span>
                하이브리드 창업가의 강점
              </h4>
              <ul className="space-y-2 text-sm text-foreground/90">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>안정적인 현금흐름으로 스타트업의 실험을 지속할 수 있습니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>두 분야의 경험으로 더 넓은 네트워크와 인사이트를 제공할 수 있습니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>실전 비즈니스 감각과 혁신 마인드를 동시에 보유하고 있습니다</span>
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
