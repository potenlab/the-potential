import { useState } from 'react';
import { LogOut, Mail, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { motion } from 'motion/react';

interface GoogleAuthProps {
  modal?: boolean;
  onClose?: () => void;
  onSignUpClick?: () => void;
}

export function GoogleAuth({ modal = false, onClose, onSignUpClick }: GoogleAuthProps) {
  const [loading, setLoading] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const { user } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      console.log('🔐 Google 로그인 시작...');
      console.log('🌐 현재 URL:', window.location.origin);
      console.log('🌐 현재 전체 URL:', window.location.href);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('📝 Supabase Response:', { data, error });

      if (error) {
        console.error('❌ Google login error:', error);
        toast.error(`로그인 오류: ${error.message}`);
        throw error;
      }

      if (data?.url) {
        console.log('✅ Redirecting to:', data.url);
        toast.success('Google 로그인 페이지로 이동합니다...');
        window.location.href = data.url;
      } else {
        console.warn('⚠️ No redirect URL received');
        toast.error('로그인 URL을 받지 못했습니다. Supabase 설정을 확인하세요.');
      }
    } catch (error: any) {
      console.error('❌ Error logging in with Google:', error);
      toast.error(error?.message || 'Google 로그인 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('로그아웃 중 오류가 발생했습니다');
    }
  };

  const handleSendMagicLink = async () => {
    try {
      setLoading(true);
      
      if (!email || !email.includes('@')) {
        toast.error('올바른 이메일 주소를 입력해주세요');
        return;
      }

      console.log('📧 인증번호 발송 요청:', email);
      
      // 서버에 인증번호 발송 요청
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b941327d/send-magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ 인증번호 발송 실패:', data);
        toast.error(data.error || '인증번호 발송에 실패했습니다');
        return;
      }

      console.log('✅ 인증번호 발송 성공:', data);
      toast.success('인증번호를 이메일로 발송했습니다! 📧\n이메일을 확인해주세요.');
      
      // 인증번호 입력 화면으로 전환
      setCodeSent(true);
    } catch (error: any) {
      console.error('❌ 인증번호 발송 실패:', error);
      toast.error('인증번호 발송에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      
      if (!verificationCode || verificationCode.length !== 6) {
        toast.error('6자리 인증번호를 입력해주세요');
        return;
      }

      console.log('🔐 인증번호 검증 요청:', { email, code: verificationCode });
      
      // 서버에 인증번호 검증 요청
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b941327d/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ 인증번호 검증 실패:', data);
        toast.error(data.error || '인증번호가 일치하지 않습니다');
        return;
      }

      console.log('✅ 인증번호 검증 성공:', data);
      
      // 임시 비밀번호로 자동 로그인
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.tempPassword,
      });
      
      if (signInError) {
        console.error('❌ 자동 로그인 실패:', signInError);
        toast.error('로그인 처리에 실패했습니다');
        return;
      }
      
      console.log('✅ 자동 로그인 성공!', signInData);
      toast.success('로그인 성공! 🎉');
      
      // 모달 닫기
      if (onClose) {
        setTimeout(() => {
          onClose();
          window.location.reload(); // 페이지 새로고침
        }, 1000);
      }
    } catch (error: any) {
      console.error('❌ 인증번호 검증 실패:', error);
      toast.error('인증번호 검증에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (modal) {
    return (
      <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl w-full max-w-md">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">로그인</h2>
            <p className="text-muted-foreground text-sm">
              {showEmailLogin ? '이메일로 로그인하세요' : 'Google 계정으로 간편하게 시작하세요'}
            </p>
          </div>

          {!showEmailLogin ? (
            <>
              <Button
                onClick={() => setShowEmailLogin(true)}
                className="w-full h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-black font-bold hover:scale-105 transition-all shadow-lg"
                style={{
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)'
                }}
              >
                <Mail className="h-5 w-5 mr-3" />
                이메일로 로그인
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#1A1A1A] px-4 text-muted-foreground">또는</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                variant="outline"
                className="w-full h-14 rounded-2xl bg-white text-black hover:bg-gray-100 font-semibold text-base shadow-lg border-0"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? '로그인 중...' : 'Google로 시작하기'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {!codeSent ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#00E5FF]" />
                        이메일 주소
                      </Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="h-12 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                        disabled={codeSent}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendMagicLink();
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        입력하신 이메일로 6자리 인증번호를 보내드립니다
                      </p>
                    </div>

                    <Button
                      onClick={handleSendMagicLink}
                      disabled={loading || !email}
                      className="w-full h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-black font-bold hover:scale-105 transition-all shadow-lg"
                      style={{
                        boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)'
                      }}
                    >
                      {loading ? '전송 중...' : '인증번호 받기'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white font-semibold flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#00E5FF]" />
                        인증번호
                      </Label>
                      <Input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setVerificationCode(value);
                        }}
                        placeholder="000000"
                        className="h-14 bg-black border-border/40 rounded-2xl text-white text-center text-2xl font-mono tracking-widest placeholder:text-muted-foreground focus:border-[#00E5FF]"
                        maxLength={6}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && verificationCode.length === 6) {
                            handleVerifyCode();
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="text-[#00E5FF]">{email}</span>로 발송된 6자리 인증번호를 입력해주세요
                      </p>
                    </div>

                    <Button
                      onClick={handleVerifyCode}
                      disabled={loading || verificationCode.length !== 6}
                      className="w-full h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-black font-bold hover:scale-105 transition-all shadow-lg"
                      style={{
                        boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)'
                      }}
                    >
                      {loading ? '인증 중...' : '로그인'}
                    </Button>

                    <Button
                      onClick={() => {
                        setCodeSent(false);
                        setVerificationCode('');
                      }}
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-white text-sm"
                      disabled={loading}
                    >
                      다른 이메일로 시도
                    </Button>
                  </>
                )}
              </div>

              {!codeSent && (
                <Button
                  onClick={() => {
                    setShowEmailLogin(false);
                    setEmail('');
                    setCodeSent(false);
                    setVerificationCode('');
                  }}
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-white"
                >
                  ← 뒤로 가기
                </Button>
              )}
            </>
          )}

          <div className="text-xs text-muted-foreground text-center pt-2">
            로그인 시 <span className="text-[#00E5FF]">서비스 이용약관</span> 및{' '}
            <span className="text-[#00E5FF]">개인정보처리방침</span>에 동의하게 됩니다
          </div>

          {onSignUpClick && (
            <div className="text-center pt-4 border-t border-border/40">
              <p className="text-sm text-muted-foreground mb-2">
                아직 계정이 없으신가요?
              </p>
              <Button
                onClick={() => {
                  if (onClose) onClose();
                  onSignUpClick();
                }}
                variant="ghost"
                className="w-full text-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 font-semibold"
              >
                회원가입하기 →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card border-border/50 rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-lg">{user.user_metadata?.full_name || '사용자'}</p>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="rounded-2xl border-border/50 text-white hover:bg-card-secondary"
              >
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen p-6"
    >
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-5xl font-extrabold text-white mb-4 glow-text">
            The Potential
          </h1>
          <p className="text-muted-foreground text-lg">
            창업가 커뮤니티에 오신 것을 환영합니다
          </p>
        </div>

        <Card className="bg-card border-border/50 rounded-3xl">
          <CardContent className="pt-8 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">로그인</h2>
              <p className="text-muted-foreground">
                Google 계정으로 간편하게 시작하세요
              </p>
            </div>

            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-white text-black hover:bg-gray-100 font-semibold text-base shadow-lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? '로그인 중...' : 'Google로 시작하'}
            </Button>

            <div className="text-xs text-muted-foreground pt-4">
              로그인 시 <span className="text-primary">서비스 이용약관</span> 및{' '}
              <span className="text-primary">개인정보처리방침</span>에 동의하게 됩니다
            </div>
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-sm">
          초기 스타트업 창업가, 예비 창업가, 연쇄 창업가를 위한<br />
          신뢰 기반의 정보 공유 플랫폼
        </p>
      </div>
    </motion.div>
  );
}