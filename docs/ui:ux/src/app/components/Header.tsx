import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Home, FileText, MessageCircle, Calendar, Users, Bell, MessageSquare, User, CheckCircle2, LayoutDashboard, Bookmark, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
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

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onProfileClick: () => void;
  onTodayTaskClick: () => void;
  onMyDashboardClick: () => void;
  onBookmarkClick?: () => void;
  onLoginClick?: () => void;
  showTodayTasks: boolean;
  showMyDashboard: boolean;
  showBookmarks?: boolean;
}

export function Header({ activeSection, onSectionChange, onProfileClick, onTodayTaskClick, onMyDashboardClick, onBookmarkClick, onLoginClick, showTodayTasks, showMyDashboard, showBookmarks }: HeaderProps) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);

  // 🎯 사용자 프로필 데이터 불러오기
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        // Supabase에서 직접 profiles 테이블 조회
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
            console.log('✅ 프로필 데이터 로드:', data[0]);
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

  const navItems = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'support', icon: FileText, label: '지원사업' },
    { id: 'thread', icon: MessageCircle, label: '쓰레드' },
    { id: 'event', icon: Calendar, label: '이벤트' },
    { id: 'club', icon: Users, label: '클럽' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/30 bg-black/95 backdrop-blur-xl hidden md:block shadow-[0_4px_24px_rgba(0,121,255,0.15)]">
      <div className="container flex h-20 items-center justify-between px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <button 
          onClick={() => onSectionChange('landing')}
          className="flex items-center gap-3 hover:opacity-80 transition-all cursor-pointer"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0, 121, 255, 0.4))' }}
        >
          <div className="h-[19.2px]" style={{ width: '198.4px' }}>
            <ThepotentialLogoBlue />
          </div>
        </button>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`relative px-6 py-2.5 rounded-2xl font-semibold transition-all ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-white hover:bg-card'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/20"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                
                <span className="relative flex items-center gap-2">
                  <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {!user ? (
            // 로그인하지 않은 경우 - 로그인 버튼만 표시
            <Button
              onClick={() => {
                console.log('🔐 Header 로그인 버튼 클릭');
                console.log('🔐 onLoginClick 존재 여부:', !!onLoginClick);
                if (onLoginClick) {
                  onLoginClick();
                } else {
                  console.error('❌ onLoginClick이 전달되지 않았습니다');
                }
              }}
              className="h-11 px-6 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-black font-bold hover:scale-105 transition-all shadow-lg"
              style={{
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)'
              }}
            >
              <LogIn className="h-5 w-5 mr-2" />
              로그인
            </Button>
          ) : (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-2xl hover:bg-card">
                    <Bell className="h-5 w-5 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 bg-card border-border rounded-3xl p-2">
                  <DropdownMenuLabel className="text-white font-bold text-lg px-4 py-3">알림</DropdownMenuLabel>
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
                  <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-2xl hover:bg-card">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 bg-card border-border rounded-3xl p-2">
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
                  <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0 hover:bg-card">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={avatarUrl} alt="User" />
                      <AvatarFallback className="bg-primary text-white font-bold text-lg">{initial}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border rounded-3xl p-2">
                  <DropdownMenuLabel className="px-4 py-3">
                    <div>
                      <p className="font-bold text-white">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {displayEmail}
                      </p>
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
                  <DropdownMenuItem 
                    onClick={onBookmarkClick} 
                    className={`rounded-2xl px-4 py-3 cursor-pointer ${
                      showBookmarks ? 'bg-primary/10' : ''
                    }`}
                  >
                    <Bookmark className={`mr-2 h-4 w-4 ${showBookmarks ? 'text-primary' : ''}`} />
                    <span className={showBookmarks ? 'text-primary font-semibold' : ''}>북마크</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="rounded-2xl px-4 py-3 cursor-pointer text-destructive">로그아웃</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}