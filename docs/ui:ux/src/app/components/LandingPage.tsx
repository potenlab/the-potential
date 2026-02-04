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

interface LandingPageProps {
  onSignUpClick: () => void;
  onLoginClick: () => void;
  onExplore?: () => void;
}

export function LandingPage({ onSignUpClick, onLoginClick, onExplore }: LandingPageProps) {
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
    { number: '100+', label: '프라이빗 클럽' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#00E5FF]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative container px-4 md:px-8 mx-auto pt-32 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 mb-8"
            >
              <Sparkles className="h-4 w-4 text-[#00E5FF]" />
              <span className="text-sm font-semibold text-[#00E5FF]">
                창업가 커뮤니티 플랫폼
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            >
              <span className="text-white">연결을 넘어</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00B8D4] to-[#0097A7]">
                성과로
              </span>
            </motion.h1>

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
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm rounded-3xl border-border/30 text-center">
                <CardContent className="p-8">
                  <div className="text-4xl md:text-5xl font-extrabold text-[#00E5FF] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="container px-4 md:px-8 mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            핵심 기능
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            창업가들이 정말 필요한 기능만 담았습니다
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm rounded-3xl border-border/30 hover:border-[#00E5FF]/30 transition-all duration-300 h-full group">
                  <CardContent className="p-8">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                      style={{
                        background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                        border: `1px solid ${feature.color}30`
                      }}
                    >
                      <Icon className="h-7 w-7" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
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

      {/* Why Section */}
      <div className="container px-4 md:px-8 mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-[#00E5FF]/20 via-card to-card-secondary rounded-3xl border-[#00E5FF]/40 overflow-hidden relative">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#00E5FF]/20 rounded-full blur-3xl" />
            
            <CardContent className="p-12 relative">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">
                왜 더포텐셜인가?
              </h2>
              
              <div className="space-y-4">
                {[
                  '검증된 창업가만 참여하는 신뢰 기반 커뮤니티',
                  '매주 업데이트되는 맞춤형 지원사업 정보',
                  '실시간으로 소통하는 깊이 있는 네트워킹',
                  '프라이빗 클럽을 통한 밀도 높은 협업 기회',
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-6 w-6 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-white">{item}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Final CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container px-4 md:px-8 mx-auto py-20 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          지금 바로 시작하세요
        </h2>
        <p className="text-lg text-muted-foreground mb-12">
          무료로 가입하고, 창업 생태계의 핵심 네트워크에 합류하세요
        </p>
        
        <Button
          onClick={onSignUpClick}
          className="h-16 px-10 rounded-2xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 text-xl font-bold glow-effect group"
          style={{
            boxShadow: '0 0 40px rgba(0, 229, 255, 0.4)'
          }}
        >
          <Sparkles className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
          무료 회원가입
          <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>

      {/* Footer */}
      <div className="border-t border-border/30">
        <div className="container px-4 md:px-8 mx-auto py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 The Potential. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}