import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔧 AuthContext 초기화 시작...');
    
    // 초기 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📦 초기 세션:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session) {
        console.log('✅ 로그인된 사용자:', session.user.email);
      } else {
        console.log('❌ 로그인되지 않음');
      }
    });

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth State Change:', event);
      console.log('📦 �� 세션:', session);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (event === 'SIGNED_IN') {
        console.log('✅ 로그인 성공!', session?.user.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 로그아웃 완료');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 토큰 갱신됨');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};