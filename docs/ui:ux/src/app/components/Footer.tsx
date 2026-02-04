import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface FooterProps {
  onAboutClick: () => void;
}

export function Footer({ onAboutClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-black/50 backdrop-blur-sm mt-20">
      <div className="container px-4 md:px-8 py-8 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 로고 & 설명 */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <Sparkles className="h-5 w-5 text-[#00E5FF]" />
              <span className="text-xl font-extrabold text-white">더포텐셜</span>
            </div>
            <p className="text-sm text-muted-foreground">
              창업가들의 신뢰 기반 정보 공유 플랫폼
            </p>
          </div>

          {/* 링크 */}
          <div className="flex items-center gap-6">
            <button
              onClick={onAboutClick}
              className="text-sm text-muted-foreground hover:text-[#00E5FF] transition-colors"
            >
              소개
            </button>
            <a
              href="mailto:contact@thepotential.kr"
              className="text-sm text-muted-foreground hover:text-[#00E5FF] transition-colors"
            >
              문의
            </a>
            <a
              href="/terms"
              className="text-sm text-muted-foreground hover:text-[#00E5FF] transition-colors"
            >
              이용약관
            </a>
            <a
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-[#00E5FF] transition-colors"
            >
              개인정보처리방침
            </a>
          </div>

          {/* 저작권 */}
          <div className="text-xs text-muted-foreground">
            © {currentYear} The Potential. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
