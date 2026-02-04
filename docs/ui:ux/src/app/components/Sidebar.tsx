import { Home, Briefcase, MessageCircle, FileText, Users, TrendingUp } from 'lucide-react';
import { cn } from './ui/utils';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: '대시보드', icon: Home },
  { id: 'support', label: '지원사업', icon: Briefcase },
  { id: 'thread', label: '쓰레드', icon: MessageCircle },
  { id: 'article', label: '아티클', icon: FileText },
  { id: 'club', label: '프라이빗 클럽', icon: Users },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-80 border-r border-border/50 bg-black h-[calc(100vh-5rem)] sticky top-20">
      <nav className="p-6 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all font-semibold',
                'hover:bg-card',
                isActive && 'bg-gradient-to-r from-primary/10 to-cyan-400/10 border border-primary/20'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-base',
                  isActive ? 'text-primary' : 'text-white'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Quick Stats */}
        <div className="mt-10 p-6 bg-card rounded-3xl border border-border/50">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            이번 주 활동
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">새 지원사업</span>
              <span className="font-bold text-primary text-lg">12개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">쓰레드 참여</span>
              <span className="font-bold text-primary text-lg">8건</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">네트워킹</span>
              <span className="font-bold text-primary text-lg">3명</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}