import { Home, FileText, MessageCircle, Calendar, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function MobileNav({ activeSection, onSectionChange }: MobileNavProps) {
  const navItems = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'support', icon: FileText, label: '지원사업' },
    { id: 'thread', icon: MessageCircle, label: '쓰레드' },
    { id: 'event', icon: Calendar, label: '이벤트' },
    { id: 'club', icon: Users, label: '클럽' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-border/50 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeMobileNav"
                  className="absolute inset-0 bg-primary/10 rounded-2xl mx-1"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  className={`h-6 w-6 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-xs font-semibold ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
