import { motion } from 'motion/react';
import { Sparkles, User, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface WelcomePageProps {
  userName?: string;
  onGetStarted: () => void;
  onSkip: () => void;
  onClose?: () => void;
}

export function WelcomePage({ userName, onGetStarted, onSkip, onClose }: WelcomePageProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-8 right-8 z-50 w-[420px] bg-black border-2 border-primary/40 rounded-3xl overflow-hidden"
      style={{ boxShadow: '0 0 48px rgba(0, 229, 255, 0.4)' }}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* 팝업 콘텐츠 */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-blue-500">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 pr-8">
            <h3 className="text-lg font-bold text-white mb-2">
              {userName ? `${userName}님, 환영합니다!` : '환영합니다!'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              프로필을 설정하고 더포텐셜의 모든 기능을 경험해보세요
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onGetStarted}
                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl"
                style={{ boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)' }}
              >
                <User className="w-4 h-4 mr-1" />
                설정하기
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onSkip}
                className="text-primary hover:text-primary hover:bg-primary/10 font-bold rounded-2xl"
              >
                둘러보기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}