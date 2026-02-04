import { ArrowRight, MessageCircle, TrendingUp, Sparkles, Heart, FileText, Calendar, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { EmptyState } from './EmptyState';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Section 1: 실시간 쓰레드 */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              🔥 실시간 쓰레드
            </h2>
            <p className="text-xs text-muted-foreground mt-1">지금 가장 핫한 창업가들의 고민</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('thread')}
            className="text-primary hover:bg-primary/10 rounded-2xl h-9 px-3"
          >
            전체보기
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <EmptyState
          icon={MessageCircle}
          title="아직 쓰레드가 없습니다"
          description="창업가들과 고민을 나누고 인사이트를 공유해보세요"
          action={{
            label: '쓰레드 둘러보기',
            onClick: () => onNavigate('thread')
          }}
        />
      </motion.div>

      {/* Divider */}
      <div className="border-t border-border/30"></div>

      {/* Section 2: 인사이트 아티클 */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              📚 인사이트 아티클
            </h2>
            <p className="text-xs text-muted-foreground mt-1">읽어볼 만한 콘텐츠</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('article')}
            className="text-primary hover:bg-primary/10 rounded-2xl h-9 px-3"
          >
            전체보기
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <EmptyState
          icon={FileText}
          title="아직 아티클이 없습니다"
          description="창업에 도움이 되는 인사이트를 발견해보세요"
          action={{
            label: '아티클 둘러보기',
            onClick: () => onNavigate('article')
          }}
        />
      </motion.div>

      {/* Divider */}
      <div className="border-t border-border/30"></div>

      {/* Quick Navigation Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 rounded-3xl cursor-pointer hover:border-primary/40 transition-all"
            onClick={() => onNavigate('support')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 rounded-2xl bg-primary/20">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">지원사업</p>
                  <p className="text-xs text-muted-foreground">맞춤형 정부지원사업 찾기</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 rounded-3xl cursor-pointer hover:border-cyan-500/40 transition-all"
            onClick={() => onNavigate('event')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 rounded-2xl bg-cyan-500/20">
                  <Calendar className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">이벤트</p>
                  <p className="text-xs text-muted-foreground">네트워킹 행사 참여하기</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 rounded-3xl cursor-pointer hover:border-purple-500/40 transition-all"
            onClick={() => onNavigate('club')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 rounded-2xl bg-purple-500/20">
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">클럽</p>
                  <p className="text-xs text-muted-foreground">관심사 기반 커뮤니티</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}