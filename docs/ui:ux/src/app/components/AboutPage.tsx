import { motion } from 'motion/react';
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  Briefcase, 
  Target,
  ArrowRight,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface AboutPageProps {
  onSignUpClick: () => void;
  onLoginClick: () => void;
  onExplore?: () => void;
}

export function AboutPage({ onSignUpClick, onLoginClick, onExplore }: AboutPageProps) {
  const features = [
    {
      icon: Target,
      title: '지원사업 큐레이션',
      description: '매주 100+개의 지원사업 중 당신에게 딱 맞는 기회를 추천합니다',
      color: '#00E5FF'
    },
    {
      icon: Users,
      title: '실시간 쓰레드',
      description: '창업가들의 생생한 경험과 고민을 나누는 커뮤니티',
      color: '#FF3D71'
    },
    {
      icon: TrendingUp,
      title: '아티클 인사이트',
      description: '핵심만 담은 스타트업 트렌드와 비즈니스 전략',
      color: '#FFD600'
    },
    {
      icon: Briefcase,
      title: '프라이빗 클럽',
      description: '관심사 기반 소모임에서 깊이 있는 네트워킹',
      color: '#00E676'
    },
  ];

  const stats = [
    { number: '1,000+', label: '활동 중인 창업가' },
    { number: '500+', label: '큐레이션된 지원사업' },
    { number: '50+', label: '프라이빗 클럽' },
  ];

  const benefits = [
    '신뢰할 수 있는 정보만 큐레이션',
    '실제 창업가들의 검증된 인사이트',
    '비즈니스 협업 기회 발굴',
    '시간 절약과 효율적인 의사결정'
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/10 via-transparent to-transparent" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />
        
        <div className="relative container px-4 md:px-8 mx-auto py-20 md:py-32">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Logo */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <Sparkles className="h-12 w-12 text-[#00E5FF]" />
              <h1 className="text-5xl md:text-7xl font-black text-white">
                더포텐셜
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
            >
              연결을 넘어 <span className="text-[#00E5FF]">성과</span>로
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed"
            >
              초기 스타트업 창업가들을 위한<br className="md:hidden" />
              <span className="text-white font-semibold"> 신뢰 기반 정보 공유</span>와 
              <span className="text-white font-semibold"> 실시간 네트워킹</span> 플랫폼
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                onClick={onExplore || onLoginClick}
                variant="outline"
                className="h-14 px-8 rounded-2xl border-border/50 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 text-lg font-semibold"
              >
                둘러보기
              </Button>

              <Button
                onClick={onSignUpClick}
                className="h-14 px-8 rounded-2xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 text-lg font-bold glow-effect group"
                style={{
                  boxShadow: '0 0 40px rgba(0, 229, 255, 0.4)'
                }}
              >
                <Zap className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                무료로 시작하기
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container px-4 md:px-8 mx-auto py-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/30 backdrop-blur border-border/50 rounded-3xl hover:border-[#00E5FF]/30 transition-all">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl md:text-5xl font-black text-[#00E5FF] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container px-4 md:px-8 mx-auto py-20"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              핵심 기능
            </h2>
            <p className="text-lg text-muted-foreground">
              창업가의 성장을 돕는 4가지 필수 도구
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/30 backdrop-blur border-border/50 rounded-3xl hover:border-[#00E5FF]/30 transition-all h-full group">
                    <CardContent className="p-8">
                      <div 
                        className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: `${feature.color}15`,
                        }}
                      >
                        <Icon className="h-7 w-7" style={{ color: feature.color }} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Benefits Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container px-4 md:px-8 mx-auto py-20"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              왜 더포텐셜인가요?
            </h2>
          </motion.div>

          <Card className="bg-card/30 backdrop-blur border-border/50 rounded-3xl">
            <CardContent className="p-8 md:p-12">
              <div className="grid gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <CheckCircle2 className="h-6 w-6 text-[#00E5FF] flex-shrink-0 mt-1" />
                    <p className="text-lg text-white font-medium">
                      {benefit}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container px-4 md:px-8 mx-auto py-20 pb-32"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-[#00E5FF]/10 to-transparent backdrop-blur border-[#00E5FF]/30 rounded-3xl overflow-hidden">
            <CardContent className="p-12 md:p-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                지금 바로 시작하세요
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                1,000명 이상의 창업가들이 함께하고 있습니다
              </p>
              <Button
                onClick={onSignUpClick}
                className="h-16 px-12 rounded-2xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 text-xl font-bold glow-effect"
                style={{
                  boxShadow: '0 0 60px rgba(0, 229, 255, 0.5)'
                }}
              >
                <Zap className="h-6 w-6 mr-3" />
                무료로 가입하기
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
