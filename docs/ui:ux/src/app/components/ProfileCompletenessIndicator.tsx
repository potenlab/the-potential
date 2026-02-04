import { CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileCompletenessIndicatorProps {
  completeness: number;
  onClick?: () => void;
}

export function ProfileCompletenessIndicator({ completeness, onClick }: ProfileCompletenessIndicatorProps) {
  if (completeness >= 100) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-green-500/10 border border-green-500/30 cursor-default"
      >
        <CheckCircle className="h-4 w-4 text-green-400" />
        <span className="text-xs font-semibold text-green-400">프로필 완성</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all"
    >
      <AlertCircle className="h-4 w-4 text-primary" />
      <span className="text-xs font-semibold text-primary">{completeness}% 완성</span>
      <div className="relative w-16 h-1.5 bg-black/30 rounded-full overflow-hidden ml-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completeness}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-cyan-400 rounded-full"
        />
      </div>
    </motion.button>
  );
}
