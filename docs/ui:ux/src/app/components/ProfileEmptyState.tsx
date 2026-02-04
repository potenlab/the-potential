import { motion } from 'motion/react';
import { 
  User, 
  Briefcase, 
  Award, 
  Target, 
  Rocket,
  Sparkles,
  ArrowRight,
  Building2,
  MapPin,
  Users
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface ProfileEmptyStateProps {
  onSetupClick: () => void;
  userName?: string;
}

// 전체 프로필이 비어있을 때
export function ProfileEmptyState({ onSetupClick, userName }: ProfileEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[500px] px-4"
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex p-5 rounded-full bg-primary/10 mb-6 border-2 border-primary/20"
          style={{ boxShadow: '0 0 32px rgba(0, 229, 255, 0.3)' }}
        >
          <User className="w-12 h-12 text-primary" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-3">
          {userName ? `${userName}님,` : '안녕하세요,'}
        </h2>
        
        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 mb-3">
          프로필을 완성해주세요
        </p>

        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          프로필을 설정하면 맞춤형 지원사업 추천과<br />
          창업가 네트워킹 기회를 받을 수 있습니다
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <EmptyFeatureCard icon={Briefcase} title="비즈니스" />
          <EmptyFeatureCard icon={MapPin} title="활동 지역" />
          <EmptyFeatureCard icon={Target} title="전문 분야" />
          <EmptyFeatureCard icon={Users} title="네트워킹" />
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            size="lg"
            onClick={onSetupClick}
            className="w-full bg-primary hover:bg-primary/90 text-black font-bold px-8 py-6 rounded-3xl text-base group"
            style={{ boxShadow: '0 0 24px rgba(0, 229, 255, 0.4)' }}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            프로필 설정 시작하기
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// 개��� 기능 카드 (작은 버전)
function EmptyFeatureCard({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="p-4 bg-card/50 border border-primary/20 rounded-2xl"
      style={{ boxShadow: '0 0 16px rgba(0, 229, 255, 0.05)' }}
    >
      <div className="inline-flex p-2 rounded-xl bg-primary/10 mb-2">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="text-xs font-bold text-white">{title}</p>
    </motion.div>
  );
}