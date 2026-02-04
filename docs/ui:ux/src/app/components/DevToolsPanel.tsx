import { useState, useEffect, useRef } from 'react';
import { Terminal, X, ChevronDown, ChevronUp, Trash2, AlertCircle, Info, CheckCircle, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface LogEntry {
  id: number;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: string;
  stack?: string;
}

export function DevToolsPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  useEffect(() => {
    // 기존 콘솔 메서드 백업
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    };

    // 로그 추가 함수
    const addLog = (type: LogEntry['type'], args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      const timestamp = new Date().toLocaleTimeString('ko-KR', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
      });

      setLogs(prev => [...prev, {
        id: logIdRef.current++,
        type,
        message,
        timestamp,
        stack: type === 'error' ? (args[0]?.stack || '') : undefined,
      }]);
    };

    // 콘솔 메서드 오버라이드
    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args);
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      addLog('info', args);
    };

    // 전역 에러 핸들러
    const handleError = (event: ErrorEvent) => {
      addLog('error', [event.error || event.message]);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLog('error', [`Unhandled Promise Rejection: ${event.reason}`]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 초기 로그
    console.info('🔧 DevTools Panel initialized');
    console.info('🌐 현재 URL:', window.location.href);
    console.info('🌐 Origin:', window.location.origin);
    console.info('🌐 Hostname:', window.location.hostname);
    console.info('');
    console.info('📌 Google OAuth 설정 방법:');
    console.info('1. Supabase 대시보드 > Authentication > Providers로 이동');
    console.info('2. Google Provider를 활성화');
    console.info('3. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성');
    console.info('4. 승인된 리디렉션 URI에 Supabase Callback URL 추가');
    console.info('5. Client ID와 Client Secret을 Supabase에 입력');
    console.info('📖 자세한 가이드: https://supabase.com/docs/guides/auth/social-login/auth-google');
    console.info('');

    // 클린업
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // 자동 스크롤
  useEffect(() => {
    if (logContainerRef.current && !isMinimized) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isMinimized]);

  const clearLogs = () => {
    setLogs([]);
    console.info('🧹 Logs cleared');
  };

  const handleEmergencyLogout = async () => {
    console.log('🚨 긴급 로그아웃 시작...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ 로그아웃 에러:', error);
        toast.error('로그아웃 실패: ' + error.message);
      } else {
        console.log('✅ 로그아웃 성공!');
        toast.success('로그아웃되었습니다!');
        // 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (err) {
      console.error('❌ 로그아웃 예외:', err);
      toast.error('로그아웃 중 오류 발생');
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />;
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400 bg-red-950/30 border-red-900/50';
      case 'warn':
        return 'text-yellow-400 bg-yellow-950/30 border-yellow-900/50';
      case 'info':
        return 'text-blue-400 bg-blue-950/30 border-blue-900/50';
      default:
        return 'text-gray-300 bg-gray-950/30 border-gray-800/50';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] h-12 px-4 rounded-full bg-[#1A1A1A] border border-[#00E5FF]/30 text-white shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 flex items-center gap-2 group"
        style={{
          boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)'
        }}
      >
        <Terminal className="h-5 w-5 text-[#00E5FF]" />
        <span className="text-sm font-medium">DevTools</span>
        {logs.filter(l => l.type === 'error').length > 0 && (
          <span className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {logs.filter(l => l.type === 'error').length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div 
      className={`fixed left-4 z-[9999] bg-[#0A0A0A] border border-[#00E5FF]/30 rounded-3xl shadow-2xl backdrop-blur-xl transition-all duration-300 ${
        isMinimized ? 'bottom-4' : 'bottom-4'
      }`}
      style={{
        width: '480px',
        height: isMinimized ? 'auto' : '400px',
        boxShadow: '0 0 40px rgba(0, 229, 255, 0.4), 0 10px 50px rgba(0, 0, 0, 0.8)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#00E5FF]/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] flex items-center justify-center">
            <Terminal className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">개발자 도구</h3>
            <p className="text-gray-400 text-xs">
              {logs.length}개 로그 
              {logs.filter(l => l.type === 'error').length > 0 && (
                <span className="text-red-400 ml-2">
                  · {logs.filter(l => l.type === 'error').length}개 에러
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEmergencyLogout}
            className="h-8 px-3 rounded-full bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-all flex items-center justify-center gap-1.5 border border-red-900/50"
            title="긴급 로그아웃"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">로그아웃</span>
          </button>
          <button
            onClick={clearLogs}
            className="h-8 w-8 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-all flex items-center justify-center"
            title="로그 지우기"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-all flex items-center justify-center"
            title={isMinimized ? "펼치기" : "접기"}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full bg-gray-900 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center"
            title="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Logs */}
      {!isMinimized && (
        <div 
          ref={logContainerRef}
          className="overflow-y-auto p-4 space-y-2"
          style={{ height: 'calc(400px - 73px)' }}
        >
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              콘솔 로그가 여기에 표시됩니다
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-xl border ${getLogColor(log.type)} transition-all hover:brightness-110`}
              >
                <div className="flex items-start gap-3">
                  {getLogIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 font-mono">{log.timestamp}</span>
                      <span className={`text-xs font-bold uppercase ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warn' ? 'text-yellow-400' :
                        log.type === 'info' ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>
                        {log.type}
                      </span>
                    </div>
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {log.message}
                    </pre>
                    {log.stack && (
                      <pre className="text-xs font-mono text-gray-500 mt-2 whitespace-pre-wrap break-words">
                        {log.stack}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}