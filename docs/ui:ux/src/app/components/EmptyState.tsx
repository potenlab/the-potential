import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div 
        className="mb-6 p-6 rounded-3xl bg-card border-2 border-primary/20"
        style={{ boxShadow: '0 0 24px rgba(0, 229, 255, 0.15)' }}
      >
        <Icon className="w-16 h-16 text-primary" />
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-3">
        {title}
      </h3>
      
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        {description}
      </p>
      
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="px-8 py-4 bg-primary text-white font-bold rounded-3xl hover:bg-primary/90 transition-all"
          style={{ boxShadow: '0 0 24px rgba(0, 229, 255, 0.4)' }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
