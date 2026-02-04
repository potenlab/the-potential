import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Bell, MessageSquare, User, CheckCircle2, LayoutDashboard, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import ThepotentialLogoBlue from '../../imports/ThepotentialLogoBlue';

interface MobileHeaderProps {
  onProfileClick: () => void;
  onTodayTaskClick: () => void;
  onMyDashboardClick: () => void;
  showTodayTasks: boolean;
  showMyDashboard: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function MobileHeader({ onProfileClick, onTodayTaskClick, onMyDashboardClick, showTodayTasks, showMyDashboard, activeSection, onSectionChange }: MobileHeaderProps) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);

  // 🎯 사용자 프로필 데이터 불러오기
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/rest/v1/profiles?id=eq.${user.id}&select=*`,
          {
            headers: {
              'apikey': publicAnonKey,
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setProfileData(data[0]);
          }
        }
      } catch (error) {
        console.error('❌ 프로필 로드 에러:', error);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // 🎯 표시할 이름과 이니셜 계산
  const displayName = profileData?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || '사용자';
  const displayEmail = profileData?.email || user?.email || '';
  const avatarUrl = profileData?.avatar_url || '';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-primary/30 bg-black/95 backdrop-blur-xl md:hidden shadow-[0_4px_24px_rgba(0,121,255,0.15)]">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button 
          onClick={() => onSectionChange('landing')}
          className="flex items-center gap-2 hover:opacity-80 transition-all"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0, 121, 255, 0.4))' }}
        >
          <div className="h-4" style={{ width: '165.33px' }}>
            <ThepotentialLogoBlue />
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-2xl hover:bg-card">
                <Bell className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card border-border rounded-3xl p-2">
              <DropdownMenuLabel className="text-white font-bold text-base px-4 py-3">알림</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">새로운 알림이 없습니다</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-2xl hover:bg-card">
                <MessageSquare className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card border-border rounded-3xl p-2">
              <DropdownMenuLabel className="text-white font-bold text-base px-4 py-3">메시지</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <div className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">새로운 메시지가 없습니다</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-2xl p-0 hover:bg-card">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl} alt="User" />
                  <AvatarFallback className="bg-primary text-white font-bold text-base">{initial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border rounded-3xl p-2 w-56">
              <DropdownMenuLabel className="px-4 py-3">
                <div>
                  <p className="font-bold text-white">{displayName}</p>
                  <p className="text-xs text-muted-foreground">AI 스타트업 대표</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                onClick={onProfileClick} 
                className={`rounded-2xl px-4 py-3 cursor-pointer ${
                  activeSection === 'profile' && !showTodayTasks && !showMyDashboard ? 'bg-primary/10' : ''
                }`}
              >
                <User className={`mr-2 h-4 w-4 ${activeSection === 'profile' && !showTodayTasks && !showMyDashboard ? 'text-primary' : ''}`} />
                <span className={activeSection === 'profile' && !showTodayTasks && !showMyDashboard ? 'text-primary font-semibold' : ''}>
                  내 프로필
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onTodayTaskClick} 
                className={`rounded-2xl px-4 py-3 cursor-pointer ${
                  showTodayTasks ? 'bg-primary/10' : ''
                }`}
              >
                <CheckCircle2 className={`mr-2 h-4 w-4 ${showTodayTasks ? 'text-primary' : ''}`} />
                <span className={showTodayTasks ? 'text-primary font-semibold' : ''}>오늘의 할 일</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onMyDashboardClick} 
                className={`rounded-2xl px-4 py-3 cursor-pointer ${
                  showMyDashboard ? 'bg-primary/10' : ''
                }`}
              >
                <LayoutDashboard className={`mr-2 h-4 w-4 ${showMyDashboard ? 'text-primary' : ''}`} />
                <span className={showMyDashboard ? 'text-primary font-semibold' : ''}>내 상황판</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="rounded-2xl px-4 py-3 cursor-pointer text-destructive">로그아웃</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}