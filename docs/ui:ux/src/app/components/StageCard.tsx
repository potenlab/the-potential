import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Info, ChevronDown, Trophy, Sparkles } from 'lucide-react';
import { EntrepreneurStage, STAGE_LABELS_BY_TYPE, Stage5Type, isMasterFounder, BusinessType, getStageLabel, getStageDescription } from '../constants/stages';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface StageCardProps {
  currentStage: EntrepreneurStage;
  stage5Type?: Stage5Type; // Stage 5인 경우 투자형/매출형 구분
  compact?: boolean;
}

export function StageCard({ currentStage, stage5Type, compact = false }: StageCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const stageInfo = STAGE_LABELS_BY_TYPE[currentStage];
  const isExitFounder = currentStage === EntrepreneurStage.EXIT;
  const isDominateFounder = currentStage === EntrepreneurStage.DOMINATE;
  const isMaster = isMasterFounder(currentStage);

  // Stage 5 타입별 설명 가져오기 (deprecated - 이제 BusinessType으로 처리)
  const getStageDescription = () => {
    if (currentStage === EntrepreneurStage.DOMINATE && stage5Type) {
      // Stage 5에서 투자형/매출형 구분
      const type = stage5Type === Stage5Type.INVESTMENT ? BusinessType.STARTUP : BusinessType.BUSINESS;
      return STAGE_LABELS_BY_TYPE[currentStage][type === BusinessType.STARTUP ? 'startupDescription' : 'businessDescription'];
    }
    return stageInfo.startupDescription; // 기본값
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: compact ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsDetailOpen(true)}
        className="cursor-pointer"
      >
        <Card 
          className={`bg-gradient-to-br from-card via-card-secondary to-card rounded-3xl border-2 overflow-hidden relative transition-all ${
            isMaster
              ? 'border-primary glow-master' 
              : 'border-primary/40 hover:border-primary/60'
          }`}
          style={{
            boxShadow: isMaster
              ? `0 0 50px ${stageInfo.glowColor}, 0 0 80px ${stageInfo.glowColor}` 
              : '0 0 30px rgba(0, 121, 255, 0.2)',
          }}
        >
          {/* Background Glow */}
          <div 
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl"
            style={{ 
              background: stageInfo.glowColor,
            }}
          />

          <CardContent className={compact ? 'p-4 relative' : 'p-6 relative'}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{stageInfo.icon}</span>
                <div>
                  <p className="text-xs text-muted-foreground">{stageInfo.shortLabel}</p>
                  <h3 className="font-extrabold text-white text-lg">{stageInfo.label}</h3>
                </div>
              </div>

              {/* Exit 특별 배지 */}
              {isExitFounder && (
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Badge className="bg-[#F59E0B] text-black border-0 rounded-2xl px-3 py-1 font-bold">
                    <Crown className="h-3 w-3 mr-1" />
                    인증
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6].map((stage) => {
                  const isActive = stage <= currentStage;
                  const isCurrent = stage === currentStage;
                  const isMasterStage = stage >= 5; // Stage 5, 6은 마스터
                  
                  return (
                    <motion.div
                      key={stage}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: stage * 0.1, duration: 0.3 }}
                      className={`flex-1 h-2 rounded-full transition-all ${
                        isActive && isMasterStage
                          ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500' 
                          : isActive 
                          ? 'bg-gradient-to-r from-primary to-cyan-400' 
                          : 'bg-[#4E5968]'
                      }`}
                      style={{
                        boxShadow: isCurrent && isMasterStage
                          ? `0 0 20px ${stageInfo.glowColor}, 0 0 30px ${stageInfo.glowColor}` 
                          : isCurrent
                          ? `0 0 12px ${stageInfo.glowColor}` 
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
                      stage <= currentStage ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {stage}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            {!compact && (
              <p className="text-sm text-foreground/80 mb-3">
                {getStageDescription()}
              </p>
            )}

            {/* More Info Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-primary">
                <Info className="h-3.5 w-3.5" />
                <span className="font-semibold">자세히 보기</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 바텀 시트 스타일 상세 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-card border-border/50 rounded-3xl max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{stageInfo.icon}</span>
              <div>
                <DialogTitle className="text-2xl font-extrabold text-white">
                  {stageInfo.label}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {stageInfo.shortLabel} • {getStageDescription()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Current Stage Indicator */}
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-card-secondary rounded-2xl p-5 border border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-bold text-primary">현재 단계</span>
              </div>
              
              {/* Stage Progress Visual */}
              <div className="flex items-center gap-2 mb-3">
                {[0, 1, 2, 3, 4, 5, 6].map((stage) => {
                  const isActive = stage <= currentStage;
                  const isCurrent = stage === currentStage;
                  const isMasterStage = stage >= 5; // Stage 5, 6은 마스터
                  
                  return (
                    <div
                      key={stage}
                      className={`flex-1 h-3 rounded-full relative ${
                        isActive && isMasterStage
                          ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500' 
                          : isActive 
                          ? 'bg-gradient-to-r from-primary to-cyan-400' 
                          : 'bg-[#4E5968]'
                      }`}
                      style={{
                        boxShadow: isCurrent && isMasterStage
                          ? `0 0 16px ${stageInfo.glowColor}, 0 0 24px ${stageInfo.glowColor}` 
                          : isCurrent
                          ? `0 0 16px ${stageInfo.glowColor}` 
                          : 'none',
                      }}
                    >
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 bg-white/30 rounded-full"
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <p className="text-sm text-white font-semibold">
                {getStageDescription()}
              </p>
            </div>

            {/* Criteria */}
            <div>
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                이 단계의 특징
              </h4>
              <ul className="space-y-2">
                {stageInfo.criteria.map((criterion, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 text-sm text-foreground/90"
                  >
                    <span className="text-primary mt-0.5">•</span>
                    <span>{criterion}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* All Stages Overview */}
            <div className="bg-card-secondary/50 rounded-2xl p-4">
              <h4 className="font-bold text-white mb-3 text-sm">전체 단계 한눈에 보기</h4>
              <div className="space-y-2">
                {Object.values(STAGE_LABELS_BY_TYPE).map((stage) => {
                  const isCurrentStage = stage.stage === currentStage;
                  
                  return (
                    <div
                      key={stage.stage}
                      className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                        isCurrentStage 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'bg-transparent'
                      }`}
                    >
                      <span className="text-lg">{stage.icon}</span>
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${
                          isCurrentStage ? 'text-primary' : 'text-white'
                        }`}>
                          {stage.shortLabel} • {stage.label}
                        </p>
                      </div>
                      {isCurrentStage && (
                        <Badge className="bg-primary text-white border-0 text-xs px-2 py-0.5 rounded-lg">
                          현재
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exit Founder Special Note */}
            {isExitFounder && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#F59E0B]/20 via-[#F59E0B]/10 to-card-secondary rounded-2xl p-5 border border-[#F59E0B]/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-[#F59E0B]" />
                  <h4 className="font-bold text-white">인증된 연쇄 창업가</h4>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  엑싯 경험을 보유한 연쇄 창업가는 더포텐셜 커뮤니티에서 멘토 역할을 수행하며, 
                  모든 단계의 창업가들과 협업할 수 있습니다.
                </p>
              </motion.div>
            )}

            {/* Dominate Founder Special Note */}
            {isDominateFounder && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#F59E0B]/20 via-[#F59E0B]/10 to-card-secondary rounded-2xl p-5 border border-[#F59E0B]/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-[#F59E0B]" />
                  <h4 className="font-bold text-white">인증된 독점 창업가</h4>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  독점 창업가는 더포텐셜 커뮤니티에서 멘토 역할을 수행하며, 
                  모든 단계의 창업가들과 협업할 수 있습니다.
                </p>
              </motion.div>
            )}

            {/* Master Founder Special Note */}
            {isMaster && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#F59E0B]/20 via-[#F59E0B]/10 to-card-secondary rounded-2xl p-5 border border-[#F59E0B]/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-[#F59E0B]" />
                  <h4 className="font-bold text-white">인증된 마스터 창업가</h4>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  마스터 창업가는 더포텐셜 커뮤니티에서 멘토 역할을 수행하며, 
                  모든 단계의 창업가들과 협업할 수 있습니다.
                </p>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 컴팩트한 인라인 Stage 표시 (프로필 카드 등에서 사용)
export function StageInline({ stage }: { stage: EntrepreneurStage }) {
  const stageInfo = STAGE_LABELS_BY_TYPE[stage];
  const isMaster = isMasterFounder(stage);

  return (
    <div className="flex items-center gap-2">
      <span className="text-base">{stageInfo.icon}</span>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4, 5, 6].map((s) => (
          <div
            key={s}
            className={`w-1.5 h-1.5 rounded-full ${
              s <= stage ? 'bg-primary' : 'bg-[#4E5968]'
            }`}
            style={{
              boxShadow: s === stage ? '0 0 6px rgba(0, 121, 255, 0.6)' : 'none',
            }}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-white">{stageInfo.label}</span>
      {isMaster && (
        <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
      )}
    </div>
  );
}