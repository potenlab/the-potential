import { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Heart,
  Star,
  Target,
  Rocket,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function DailyInsights() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [fortuneIndex, setFortuneIndex] = useState(0);

  // 오늘의 사업 운세
  const businessFortunes = [
    {
      icon: Rocket,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      title: '성장운',
      score: 92,
      message: '오늘은 중요한 의사결정을 내리기 좋은 날입니다. 투자 미팅이나 파트너십 제안을 적극 추진해보세요.',
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
      message: '계획했던 일을 실행에 옮기기 좋은 날입니다. 미뤄두었던 프로젝트를 시작해보세요.',
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
      lookingFor: 'CTO 파트너',
    },
    {
      name: '이마케터',
      title: 'Growth Marketer',
      avatar: '',
      matchScore: 88,
      reason: 'B2B SaaS 마케팅 전문',
      tags: ['SEO', 'Content', 'Analytics'],
      lookingFor: '초기 마케팅',
    },
    {
      name: '박투자',
      title: '엔젤 투자자',
      avatar: '',
      matchScore: 82,
      reason: 'AI 스타트업 관심',
      tags: ['Seed', 'AI', 'SaaS'],
      lookingFor: '투자 기회',
    },
  ];

  // 오늘의 지원사업 추천
  const recommendedPrograms = [
    {
      title: '예비창업패키지 2025',
      organization: '중소벤처기업부',
      dDay: 8,
      budget: '최대 1억원',
      matchScore: 92,
      reason: '업종, 대상 연령 모두 부합',
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Daily Fortune */}
      <Card className="bg-gradient-to-br from-primary/20 via-card to-card-secondary rounded-3xl border-primary/40 glow-effect overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />

        <CardContent className="p-8 relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-extrabold text-white">오늘의 사업 운세</h2>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(currentDate)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshFortune}
              className="h-10 w-10 rounded-2xl hover:bg-card-secondary"
            >
              <RefreshCw className="h-5 w-5 text-white" />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={fortuneIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-card-secondary/70 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-2xl ${todayFortune.bgColor}`}
                  >
                    <FortuneIcon className={`h-8 w-8 ${todayFortune.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-white mb-1">
                      {todayFortune.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${todayFortune.score}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${
                            todayFortune.score >= 90
                              ? 'from-primary to-cyan-400'
                              : 'from-primary/70 to-primary'
                          }`}
                        />
                      </div>
                      <span className="text-lg font-extrabold text-primary">
                        {todayFortune.score}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-foreground/90 leading-relaxed mb-4">{todayFortune.message}</p>

                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm text-white">
                    오늘의 행운 키워드:{' '}
                    <span className="font-bold text-primary">{todayFortune.lucky}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-4 gap-3">
            {businessFortunes.map((fortune, idx) => {
              const Icon = fortune.icon;
              const isActive = idx === fortuneIndex % businessFortunes.length;
              return (
                <button
                  key={idx}
                  onClick={() => setFortuneIndex(idx)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isActive
                      ? `${fortune.bgColor} border-transparent`
                      : 'bg-card-secondary/30 border-border/30 hover:border-border'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 mx-auto mb-2 ${isActive ? fortune.color : 'text-muted-foreground'}`}
                  />
                  <p
                    className={`text-xs font-bold ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                  >
                    {fortune.title}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Partner Recommendations */}
      <Card className="bg-card rounded-3xl border-border/50">
        <CardContent className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-extrabold text-white">오늘의 파트너 추천</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            AI가 분석한 나와 가장 잘 맞는 파트너를 추천해드려요
          </p>

          <div className="space-y-3">
            {recommendedPartners.map((partner, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ x: 4 }}
                className="bg-card-secondary/50 rounded-2xl p-5 border border-border/30 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    <AvatarImage src={partner.avatar} alt={partner.name} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {partner.name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-white">{partner.name}</h3>
                        <p className="text-sm text-muted-foreground">{partner.title}</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/30 rounded-xl px-3 py-1">
                        매칭 {partner.matchScore}%
                      </Badge>
                    </div>

                    <p className="text-sm text-foreground/80 mb-3">
                      <span className="text-primary font-semibold">추천 이유:</span>{' '}
                      {partner.reason}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {partner.tags.map((tag, tagIdx) => (
                          <Badge
                            key={tagIdx}
                            variant="outline"
                            className="rounded-xl text-xs border-border/50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl mt-4 border-border hover:bg-card-secondary text-white font-semibold"
          >
            더 많은 추천 보기
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Today's Program Recommendation */}
      <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card rounded-3xl border-emerald-500/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            <h2 className="text-2xl font-extrabold text-white">오늘의 지원사업 추천</h2>
          </div>

          {recommendedPrograms.map((program, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card-secondary/70 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Badge className="bg-emerald-400 text-black border-0 px-3 py-1 rounded-xl mb-3 text-xs font-bold">
                    매칭도 {program.matchScore}%
                  </Badge>
                  <h3 className="text-xl font-bold text-white mb-1">{program.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{program.organization}</p>
                </div>
                <Badge className="bg-primary text-white border-0 px-3 py-1.5 rounded-xl text-sm font-bold">
                  D-{program.dDay}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">지원금:</span>
                  <span className="font-bold text-white">{program.budget}</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 rounded-2xl p-4 mb-4">
                <p className="text-sm text-foreground/90">
                  <span className="text-emerald-400 font-semibold">AI 추천 이유:</span>{' '}
                  {program.reason}
                </p>
              </div>

              <Button className="w-full h-12 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600">
                자세히 보기
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
