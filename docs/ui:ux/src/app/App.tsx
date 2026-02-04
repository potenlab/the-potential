import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '@/lib/supabase';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
import { MobileNav } from './components/MobileNav';
import { HeroSection } from './components/HeroSection';
import { SearchBar } from './components/SearchBar';
import { Dashboard } from './components/Dashboard';
import { MyDashboard } from './components/MyDashboard';
import { SupportPrograms } from './components/SupportPrograms';
import { ThreadFeed } from './components/ThreadFeed';
import { ArticleInsights } from './components/ArticleInsights';
import { EventBoard } from './components/EventBoard';
import { PrivateClubs } from './components/PrivateClubs';
import { BusinessProfile } from './components/BusinessProfile';
import { SearchResults } from './components/SearchResults';
import { BookmarkSection } from './components/BookmarkSection';
import { DevToolsPanel } from './components/DevToolsPanel';
import { SignUpFlow } from './components/SignUpFlow';
import { ProfileSetupFlow } from './components/ProfileSetupFlow';
import { GoogleAuth } from './components/GoogleAuth';
import { LandingPage } from './components/LandingPage';
import { WelcomePage } from './components/WelcomePage';
import { Footer } from './components/Footer';
import { AboutPage } from './components/AboutPage';
import { Button } from './components/ui/button';

export interface BookmarkedItem {
  id: number | string;
  type: 'thread' | 'article' | 'support' | 'user';
  data: any;
  timestamp: string;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [showTodayTasks, setShowTodayTasks] = useState(false);
  const [showMyDashboard, setShowMyDashboard] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [showWelcomePage, setShowWelcomePage] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  // 🔐 Magic Link 인증 처리 - 더 이상 필요 없음 (6자리 인증번호 사용)
  // useEffect 제거됨

  // 🎯 사용자 프로필 로드 및 완성도 체크
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        console.log('🔍 프로필 로드 시작:', user.id);

        // Supabase에서 사용자 프로필 가져오기
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b941327d/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-user-id': user.id,
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 프로필 API 응답 상태:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ 프로필 로드 성공:', data);
          
          // 🎯 프로필이 없는 경우 (구글 로그인 후 처음 접속)
          if (!data.profile) {
            console.log('⚠️ 프로필 없음 - OAuth 사용자 동기화 시작');
            
            // 구글 로그인 사용자 정보 동기화
            const syncResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b941327d/sync-oauth-user`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                email: user.email,
                displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
                avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
              }),
            });

            if (syncResponse.ok) {
              const syncData = await syncResponse.json();
              console.log('✅ OAuth 사용자 동기화 성공:', syncData);
              
              setUserProfile(syncData.profile);
              const completeness = calculateProfileCompleteness(syncData.profile);
              setProfileCompleteness(completeness);

              // 새로운 사용자면 WelcomePage 표시
              if (syncData.isNewUser) {
                setShowWelcomePage(true);
              }
            } else {
              const error = await syncResponse.json();
              console.error('❌ OAuth 사용자 동기화 실패:', error);
            }
          } else {
            // 프로필이 있는 경우
            setUserProfile(data.profile);

            // 프로필 완성도 계산
            const completeness = calculateProfileCompleteness(data.profile);
            setProfileCompleteness(completeness);
            console.log('📊 프로필 완성도:', completeness + '%');

            // 🎯 첫 로그인이거나 프로필이 비어있으면 WelcomePage 표시
            if (completeness < 30) {
              console.log('👋 WelcomePage 표시 (완성도 < 30%)');
              setShowWelcomePage(true);
            }
          }
        } else {
          const error = await response.json();
          console.error('❌ 프로필 로드 실패:', error);
        }
      } catch (error) {
        console.error('❌ 프로필 로드 중 오류:', error);
      }
    };

    loadUserProfile();
  }, [user]);

  // 프로필 완성도 계산 함수
  const calculateProfileCompleteness = (profile: any) => {
    if (!profile) return 0;

    let completeness = 0;
    const weights = {
      display_name: 15,
      unique_handle: 15,
      avatar_url: 10,
      location_hub: 10,
      businesses: 25,
      company_name: 15,
      title_role: 10,
    };

    if (profile.display_name) completeness += weights.display_name;
    if (profile.unique_handle) completeness += weights.unique_handle;
    if (profile.avatar_url) completeness += weights.avatar_url;
    if (profile.location_hub) completeness += weights.location_hub;
    if (profile.businesses && profile.businesses.length > 0) completeness += weights.businesses;
    if (profile.company_name) completeness += weights.company_name;
    if (profile.title_role) completeness += weights.title_role;

    return completeness;
  };

  const handleProfileClick = () => {
    setActiveSection('profile');
    setShowTodayTasks(false); // 오늘의 할 일 섹션 숨김
    setShowMyDashboard(false); //  상황판 섹션 숨김
    // 페이지 최상단으로 스크롤
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleTodayTaskClick = () => {
    setActiveSection('profile');
    setShowTodayTasks(true); // 오늘의 할 일 섹션 표시
    setShowMyDashboard(false); // 내 상황판 섹션 숨김
    // 먼저 페이지 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'instant' });
    // 프로필 페이지로 이동  "오늘의 할 일" 섹션으로 스크롤
    setTimeout(() => {
      const element = document.getElementById('today-tasks');
      if (element) {
        const headerOffset = 100; // 헤더 높이 + 여백
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 300);
  };

  const handleMyDashboardClick = () => {
    setActiveSection('home');
    setShowMyDashboard(true); // 내 상황판 섹션 표시
    setShowTodayTasks(false); // 오늘의 할 일 섹션 숨김
    setShowBookmarks(false); // 북마크 섹션 숨김
    // 페이지 최상단으로 스크롤
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleBookmarkClick = () => {
    setActiveSection('profile');
    setShowBookmarks(true); // 북마크 섹션 표시
    setShowTodayTasks(false); // 오늘의 할 일 섹션 숨김
    setShowMyDashboard(false); // 내 상황판 섹션 숨김
    // 페이지 최상단으로 스크롤
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setShowMyDashboard(false); // 다른 섹션으로 이동 시 내 상황판 숨김
    setShowTodayTasks(false); // 다른 섹션으로 이동 시 오늘의 할 일 숨김
    setShowBookmarks(false); // 다른 섹션으로 이동 시 북마크 숨김
    setShowSearchResults(false); // 다른 섹션으로 이동 시 검색 결과 숨김
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseSearch = () => {
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const renderContent = () => {
    // 검색 결과가 있으면 검색 결과 표시
    if (showSearchResults) {
      return <SearchResults searchQuery={searchQuery} onClose={handleCloseSearch} />;
    }

    // 북마크 표시
    if (showBookmarks) {
      return <BookmarkSection />;
    }

    switch (activeSection) {
      case 'landing':
        return <LandingPage 
          onSignUpClick={() => setShowSignUp(true)} 
          onLoginClick={() => setShowLogin(true)} 
          onExplore={() => setActiveSection('home')}
        />;
      case 'about':
        return <AboutPage 
          onSignUpClick={() => setShowSignUp(true)} 
          onLoginClick={() => setShowLogin(true)} 
          onExplore={() => setActiveSection('home')}
        />;
      case 'home':
        return showMyDashboard ? <MyDashboard onNavigate={setActiveSection} /> : <Dashboard onNavigate={setActiveSection} />;
      case 'support':
        return <SupportPrograms />;
      case 'thread':
        return <ThreadFeed onLoginClick={() => {
          console.log('🔐 ThreadFeed에서 로그인 요청');
          setShowLogin(true);
        }} />;
      case 'article':
        return <ArticleInsights />;
      case 'event':
        return <EventBoard />;
      case 'club':
        return <PrivateClubs />;
      case 'profile':
        return <BusinessProfile showTodayTasks={showTodayTasks} />;
      default:
        return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 🎯 비로그인 상태: 랜딩 페이지 또는 둘러보기 모드
  if (!user) {
    // activeSection이 'landing'이 아니면 둘러보기 모드로 콘텐츠 표시
    if (activeSection !== 'landing') {
      return (
        <div className="min-h-screen bg-black">
          {/* 헤더 - 기존 컴포넌트 사용 */}
          {activeSection !== 'landing' && activeSection !== 'about' && (
            <>
              <Header 
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                onProfileClick={() => setShowLogin(true)} // 비로그인 상태에서는 로그인 유도
                onTodayTaskClick={() => setShowLogin(true)}
                showTodayTasks={false}
                onMyDashboardClick={() => setShowLogin(true)}
                showMyDashboard={false}
                onBookmarkClick={() => setShowLogin(true)}
                showBookmarks={false}
                onLoginClick={() => {
                  console.log('🔐 App.tsx에서 setShowLogin(true) 호출');
                  setShowLogin(true);
                }}
              />
              <MobileHeader 
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                onProfileClick={() => setShowLogin(true)}
                onTodayTaskClick={() => setShowLogin(true)}
                showTodayTasks={false}
                onMyDashboardClick={() => setShowLogin(true)}
                showMyDashboard={false}
              />
              <MobileNav 
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
              />
            </>
          )}

          {/* Hero Section + SearchBar - 홈에서만 표시 */}
          {activeSection === 'home' && !showSearchResults && (
            <>
              {/* Desktop */}
              <div className="hidden md:block">
                {/* Hero Section */}
                <HeroSection />
                
                {/* SearchBar */}
                <div className="pb-12">
                  <div className="container px-8 max-w-4xl mx-auto">
                    <div className="relative">
                      <SearchBar onSearch={handleSearch} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile - Compact Hero */}
              <div className="md:hidden pt-8 pb-6 px-4">
                <div className="text-center">
                  <h1 className="text-2xl font-extrabold mb-2 leading-tight">
                    <span className="text-white">연결을 넘어 성과로,</span>
                    <br />
                    <span className="text-primary">더포텐셜</span>
                  </h1>
                  <p className="text-sm text-muted-foreground mb-4">
                    창업가들의 실시간 인사이트를 한곳에서
                  </p>
                </div>
              </div>
            </>
          )}

          <main className={showSearchResults ? "" : "container px-4 md:px-8 pt-4 md:pt-8 pb-24 md:pb-12 max-w-7xl mx-auto"}>
            {renderContent()}
          </main>

          {/* 회원가입 플로팅 버튼 */}
          <button
            onClick={() => setShowSignUp(true)}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 h-16 w-16 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-white shadow-2xl hover:shadow-[#00E5FF]/50 transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center group"
            style={{
              boxShadow: '0 0 40px rgba(0, 229, 255, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5)'
            }}
          >
            <UserPlus className="h-7 w-7 group-hover:scale-110 transition-transform" />
          </button>

          <Footer onAboutClick={() => setActiveSection('about')} />

          {/* 로그인/회원가입 모달들 */}
          {showSignUp && (
            <SignUpFlow
              onClose={() => setShowSignUp(false)}
              onSwitchToLogin={() => {
                setShowSignUp(false);
                setShowLogin(true);
              }}
              onComplete={async (userData) => {
                console.log('🎯 [Step 1] 회원가입 완료 - 받은 데이터:', userData);
                
                try {
                  // 🎯 새로운 DB 구조에 맞춰 데이터 변환
                  const signupPayload = {
                    email: userData.email,
                    password: userData.password,
                    display_name: userData.name,
                    avatar_url: userData.avatar,
                    location_hub: userData.locationHub,
                    businesses: userData.entrepreneurStage !== undefined ? [{
                      id: `biz_${Date.now()}`,
                      user_id: '', // 서버에서 자동 설정
                      category_id: userData.categories?.[0] || 'startup',
                      stage_level: userData.entrepreneurStage,
                      is_main: true
                    }] : undefined,
                    // devInfo는 나중에 포텐메이커스에서 추가 예정
                    devInfo: undefined
                  };

                  console.log('🎯 [Step 2] 서버로 전송할 데이터:', signupPayload);
                  console.log(`🎯 [Step 3] 서버 URL: https://${projectId}.supabase.co/functions/v1/make-server-b941327d/signup`);

                  // 서버에 회원가입 요청
                  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b941327d/signup`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`,
                    },
                    body: JSON.stringify(signupPayload),
                  });

                  console.log('🎯 [Step 4] 서버 응답 상태:', response.status, response.statusText);

                  const data = await response.json();
                  console.log('🎯 [Step 5] 서버 응답 데이터:', data);

                  if (!response.ok) {
                    console.error('❌ [Step 6] 서버 에러 발생:', data);
                    
                    // 이미 존재하는 이메일인 경우 로그인 유도
                    if (response.status === 409 || data.code === 'email_exists') {
                      toast.error(data.error || '이미 등록된 이메일입니다.', {
                        duration: 5000,
                        action: {
                          label: '로그인하기',
                          onClick: () => {
                            setShowSignUp(false);
                            setShowLogin(true);
                          }
                        }
                      });
                      return;
                    }
                    
                    throw new Error(data.error || '회원가입에 실패했습니다');
                  }

                  console.log('✅ [Step 7] 회원가입 성공! 사용자 정보:', data.user);
                  
                  // 🎯 자동 로그인: 서버에서 받은 세션 설정
                  if (data.session && !data.needLogin) {
                    console.log('🔐 [Step 8] 자동 로그인 처리 중... 세션:', data.session);
                    await supabase.auth.setSession({
                      access_token: data.session.access_token,
                      refresh_token: data.session.refresh_token,
                    });
                    console.log('✅ [Step 9] 자동 로그인 완료!');
                    
                    // 🎯 회원가입 완료 토스트 먼저 표시
                    toast.success('회원가입이 완료되었습니다! 프로필을 등록해주세요 🎉', {
                      duration: 3000,
                    });
                    
                    // 🎯 회원가입 완료 → 프로필 설정 플로우로 즉시 이동
                    setShowSignUp(false);
                    setNewUserId(data.user.id);
                    
                    // 약간의 딜레이 후 프로필 설정 화면 표시 (부드러운 전환)
                    setTimeout(() => {
                      setShowProfileSetup(true);
                      console.log('✅ [Step 10] 프로필 설정 화면 표시');
                    }, 300);
                  } else {
                    console.log('⚠️ [Step 8] 자동 로그인 실패 - 수동 로그인 필요');
                    // 자동 로그인 실패 시 수동 로그인 유도
                    toast.success('회원가입이 완료되었습니다! 로그인해주세요.', {
                      duration: 4000,
                      action: {
                        label: '로그인',
                        onClick: () => {
                          setShowSignUp(false);
                          setShowLogin(true);
                        }
                      }
                    });
                    setShowSignUp(false);
                  }
                } catch (error: any) {
                  console.error('❌ [ERROR] 회원가입 처리 중 오류:', error);
                  console.error('❌ [ERROR] 에러 상세:', {
                    message: error.message,
                    stack: error.stack
                  });
                  if (error.message !== '이미 등록된 이메일입니다.') {
                    toast.error(error.message || '회원가입 중 오류가 발생했습니다');
                  }
                }
              }}
            />
          )}

          {showLogin && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-24 overflow-y-auto">
              <div className="relative my-auto">
                <button
                  onClick={() => setShowLogin(false)}
                  className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-card border border-border text-white hover:bg-red-500/20 hover:border-red-500 transition-all flex items-center justify-center z-10"
                >
                  ✕
                </button>
                <GoogleAuth 
                  modal={true} 
                  onClose={() => setShowLogin(false)}
                  onSignUpClick={() => {
                    setShowLogin(false);
                    setShowSignUp(true);
                  }}
                />
              </div>
            </div>
          )}

          {showProfileSetup && newUserId && (
            <ProfileSetupFlow
              userId={newUserId}
              onClose={() => setShowProfileSetup(false)}
              onComplete={() => {
                // 🎉 프로필 설정 완료!
                setShowProfileSetup(false);
                setNewUserId(null);
                
                // 🎯 내 상황판으로 이동 (페이지 새로고침하여 최신 데이터 반영)
                toast.success('프로필 설정이 완료되었습니다! 내 상황판으로 이동합니다 🎉', {
                  duration: 2000,
                });
                
                // 약간의 딜레이 후 페이지 새로고침 (로그인 상태 유지)
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }}
              onSkip={() => {
                // 스킵했을 때도 페이지 새로고침
                setShowProfileSetup(false);
                setNewUserId(null);
                
                toast.info('나중에 프로필을 완성할 수 있습니다.');
                
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
            />
          )}

          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
              },
            }}
          />
        </div>
      );
    }

    // activeSection이 'landing'이면 랜딩 페이지 표시
    return (
      <>
        <LandingPage 
          onSignUpClick={() => setShowSignUp(true)}
          onLoginClick={() => setShowLogin(true)}
          onExplore={() => setActiveSection('home')}
        />

        {/* 회원가입 플로우 모달 */}
        {showSignUp && (
          <SignUpFlow
            onClose={() => setShowSignUp(false)}
            onSwitchToLogin={() => {
              setShowSignUp(false);
              setShowLogin(true);
            }}
            onComplete={async (userData) => {
              console.log('🎯 [Step 1] 회원가입 완료 - 받은 데이터:', userData);
              
              try {
                // 🎯 새로운 DB 구조에 맞춰 데이터 변환
                const signupPayload = {
                  email: userData.email,
                  password: userData.password,
                  display_name: userData.name,
                  avatar_url: userData.avatar,
                  location_hub: userData.locationHub,
                  businesses: userData.entrepreneurStage !== undefined ? [{
                    id: `biz_${Date.now()}`,
                    user_id: '', // 서버에서 자동 설정
                    category_id: userData.categories?.[0] || 'startup',
                    stage_level: userData.entrepreneurStage,
                    is_main: true
                  }] : undefined,
                  // devInfo는 나중에 포텐메이커스에서 추가 예정
                  devInfo: undefined
                };

                console.log('🎯 [Step 2] 서버로 전송할 데이터:', signupPayload);
                console.log(`🎯 [Step 3] 서버 URL: https://${projectId}.supabase.co/functions/v1/make-server-b941327d/signup`);

                // 서버에 회원가입 요청
                const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b941327d/signup`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`,
                  },
                  body: JSON.stringify(signupPayload),
                });

                console.log('🎯 [Step 4] 서버 응답 상태:', response.status, response.statusText);

                const data = await response.json();
                console.log('🎯 [Step 5] 서버 응답 데이터:', data);

                if (!response.ok) {
                  console.error('❌ [Step 6] 서버 에러 발생:', data);
                  
                  // 이미 존재하는 이메일인 경우 로그인 유도
                  if (response.status === 409 || data.code === 'email_exists') {
                    toast.error(data.error || '이미 등록된 이메일입니다.', {
                      duration: 5000,
                      action: {
                        label: '로그인하기',
                        onClick: () => {
                          setShowSignUp(false);
                          setShowLogin(true);
                        }
                      }
                    });
                    return;
                  }
                  
                  throw new Error(data.error || '회원가입에 실패했습니다');
                }

                console.log('✅ [Step 7] 회원가입 성공! 사용자 정보:', data.user);
                
                // 🎯 자동 로그인: 서버에서 받은 세션 설정
                if (data.session && !data.needLogin) {
                  console.log('🔐 [Step 8] 자동 로그인 처리 중... 세션:', data.session);
                  await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                  });
                  console.log('✅ [Step 9] 자동 로그인 완료!');
                  
                  // 🎯 회원가입 완료 토스트 먼저 표시
                  toast.success('회원가입이 완료되었습니다! 프로필을 등록해주세요 🎉', {
                    duration: 3000,
                  });
                  
                  // 🎯 회원가입 완료 → 프로필 설정 플로우로 즉시 이동
                  setShowSignUp(false);
                  setNewUserId(data.user.id);
                  
                  // 약간의 딜레이 후 프로필 설정 화면 표시 (부드러운 전환)
                  setTimeout(() => {
                    setShowProfileSetup(true);
                    console.log('✅ [Step 10] 프로필 설정 화면 표시');
                  }, 300);
                } else {
                  console.log('⚠️ [Step 8] 자동 로그인 실패 - 수동 로그인 필요');
                  // 자동 로그인 실패 시 수동 로그 유도
                  toast.success('회원가입이 완료되었습니다! 로그인해주세요.', {
                    duration: 4000,
                    action: {
                      label: '로그인',
                      onClick: () => {
                        setShowSignUp(false);
                        setShowLogin(true);
                      }
                    }
                  });
                  setShowSignUp(false);
                }
              } catch (error: any) {
                console.error('❌ [ERROR] 회원가입 처리 중 오류:', error);
                console.error('❌ [ERROR] 에러 상세:', {
                  message: error.message,
                  stack: error.stack
                });
                if (error.message !== '이미 등록된 이메일입니다.') {
                  toast.error(error.message || '회원가입 중 오류가 발생했습니다');
                }
              }
            }}
          />
        )}

        {/* 로그인 플로우 모달 */}
        {showLogin && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-24 overflow-y-auto">
            <div className="relative my-auto">
              <button
                onClick={() => setShowLogin(false)}
                className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-card border border-border text-white hover:bg-red-500/20 hover:border-red-500 transition-all flex items-center justify-center z-10"
              >
                ✕
              </button>
              <GoogleAuth 
                modal={true} 
                onClose={() => setShowLogin(false)}
                onSignUpClick={() => {
                  setShowLogin(false);
                  setShowSignUp(true);
                }}
              />
            </div>
          </div>
        )}

        {/* 프로필 설정 플로우 모달 */}
        {showProfileSetup && newUserId && (
          <ProfileSetupFlow
            userId={newUserId}
            onClose={() => setShowProfileSetup(false)}
            onComplete={() => {
              // 🎉 프로필 설정 완료!
              setShowProfileSetup(false);
              setNewUserId(null);
              
              // 🎯 내 상황판으로 이동 (페이지 새로고침하여 최신 데이터 반영)
              toast.success('프로필 설정이 완료되었습니다! 내 상황판으로 이동합니다 🎉', {
                duration: 2000,
              });
              
              // 약간의 딜레이 후 페이지 새로고침 (로그인 상태 유지)
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }}
            onSkip={() => {
              // 스킵했을 때도 페이지 새로고침
              setShowProfileSetup(false);
              setNewUserId(null);
              
              toast.info('나중에 프로필을 완성할 수 있습니다.');
              
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }}
          />
        )}

        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
            },
          }}
        />
      </>
    );
  }

  // 🎯 로그인된 상태: 메인 앱 표시
  return (
    <div className="min-h-screen bg-black">
      {/* 🎯 Welcome Page - 첫 로그인 시 표시 */}
      {showWelcomePage && (
        <WelcomePage 
          userName={userProfile?.display_name || user?.email?.split('@')[0] || '새로운 사용자'}
          onGetStarted={() => {
            setShowWelcomePage(false);
            // 프로필 페이지로 이동
            handleProfileClick();
          }}
          onSkip={() => {
            setShowWelcomePage(false);
            // 메인 홈(Dashboard)으로 이동
            setActiveSection('dashboard');
          }}
        />
      )}

      {/* 헤더는 랜딩 페이지가 아닐 때만 표시 */}
      {activeSection !== 'landing' && activeSection !== 'about' && (
        <>
          <Header 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onProfileClick={handleProfileClick}
            onTodayTaskClick={handleTodayTaskClick}
            showTodayTasks={showTodayTasks}
            onMyDashboardClick={handleMyDashboardClick}
            showMyDashboard={showMyDashboard}
            onBookmarkClick={handleBookmarkClick}
            showBookmarks={showBookmarks}
          />
          <MobileHeader 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onProfileClick={handleProfileClick}
            onTodayTaskClick={handleTodayTaskClick}
            showTodayTasks={showTodayTasks}
            onMyDashboardClick={handleMyDashboardClick}
            showMyDashboard={showMyDashboard}
          />
          <MobileNav 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </>
      )}
      
      {/* Hero Section + SearchBar - 홈서만 표시 */}
      {activeSection === 'home' && !showMyDashboard && !showSearchResults && (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            {/* Hero Section */}
            <HeroSection />
            
            {/* SearchBar */}
            <div className="pb-12">
              <div className="container px-8 max-w-4xl mx-auto">
                <div className="relative">
                  <SearchBar onSearch={handleSearch} />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile - Compact Hero */}
          <div className="md:hidden pt-8 pb-6 px-4">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold mb-2 leading-tight">
                <span className="text-white">연결을 넘어 성과로,</span>
                <br />
                <span className="text-primary">더포텐셜</span>
              </h1>
              <p className="text-sm text-muted-foreground mb-4">
                창업가들의 실시간 인사이트를 한곳에서
              </p>
            </div>
          </div>
        </>
      )}
      
      <main className={activeSection === 'landing' || activeSection === 'about' || showSearchResults ? "" : "container px-4 md:px-8 pt-4 md:pt-8 pb-24 md:pb-12 max-w-7xl mx-auto"}>
        {renderContent()}
      </main>

      {/* 회원가입 플로팅 버튼 */}
      <button
        onClick={() => setShowSignUp(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 h-16 w-16 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-white shadow-2xl hover:shadow-[#00E5FF]/50 transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center group"
        style={{
          boxShadow: '0 0 40px rgba(0, 229, 255, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5)'
        }}
      >
        <UserPlus className="h-7 w-7 group-hover:scale-110 transition-transform" />
      </button>

      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
          },
        }}
      />

      {/* 개발자 도구 패널 */}
      <DevToolsPanel />
      
      {/* Footer */}
      <Footer onAboutClick={() => setActiveSection('about')} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;