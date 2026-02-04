import { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Mail, Lock, User, ArrowRight, ArrowLeft, X, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/../utils/supabase/info';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';

interface SignUpFlowProps {
  onClose: () => void;
  onComplete: (userData: any) => void;
  onSwitchToLogin?: () => void; // 로그인 화면으로 전환
}

export function SignUpFlow({ onClose, onComplete, onSwitchToLogin }: SignUpFlowProps) {
  // Form state (간소화 - 기본 정보만)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleComplete = async () => {
    // 유효성 검사
    if (!name.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }

    if (!email.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      toast.error('비밀번호를 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    // 🎯 이메일 중복 체크 (서버에 요청 전 미리 확인)
    try {
      setIsChecking(true);
      console.log('🔍 이메일 중복 체크 시작:', email);

      const checkResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b941327d/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkResponse.json();
      console.log('📧 이메일 체크 결과:', checkData);

      if (checkData.exists) {
        console.log('⚠️ 이미 등록된 이메일:', email);
        
        // 이미 등록된 이메일인 경우 로그인 유도
        toast.error('이미 등록된 이메일입니다.', {
          duration: 5000,
          description: '로그인 페지로 이동하시겠습니까?',
          action: onSwitchToLogin ? {
            label: '로그인하기',
            onClick: () => {
              onClose();
              onSwitchToLogin();
            }
          } : undefined,
        });
        setIsChecking(false);
        return;
      }

      console.log('✅ 사용 가능한 이메일');
    } catch (error) {
      console.error('❌ 이메일 체크 중 오류:', error);
      // 체크 실패 시에도 계속 진행 (서버에서 다시 체크함)
    } finally {
      setIsChecking(false);
    }

    const userData = {
      name,
      email,
      password,
    };

    // 🎯 toast 제거 - App.tsx에서 처리
    onComplete(userData);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold text-white mb-1">회원��입</h1>
                <p className="text-sm text-muted-foreground">
                  더포텐셜 커뮤니티에 오신 것을 환영합니다! 🚀
                </p>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-2xl hover:bg-[#0A0A0A]"
              >
                <X className="h-5 w-5 text-white" />
              </Button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* 이름 */}
              <div className="space-y-2">
                <Label className="text-white font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-[#00E5FF]" />
                  이름 *
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="h-12 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                />
              </div>

              {/* 이메일 */}
              <div className="space-y-2">
                <Label className="text-white font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#00E5FF]" />
                  이메일 *
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                  className="h-12 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                />
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label className="text-white font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#00E5FF]" />
                  비밀번호 *
                </Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요 (최소 6자)"
                  type="password"
                  className="h-12 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                />
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <Label className="text-white font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00E5FF]" />
                  비밀번호 확인 *
                </Label>
                <Input
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  type="password"
                  className="h-12 bg-black border-border/40 rounded-2xl text-white placeholder:text-muted-foreground focus:border-[#00E5FF]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleComplete();
                    }
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 rounded-2xl border-border/40 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 h-12"
              >
                취소
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 rounded-2xl bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 h-12 font-semibold glow-effect flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                가입하기
              </Button>
            </div>

            {/* 안내 문구 */}
            <p className="text-xs text-center text-muted-foreground mt-6">
              가입 후 <span className="text-[#00E5FF]">프로필 등록</span>을 통해 더 많은 기능을 이용할 수 있습니다
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}