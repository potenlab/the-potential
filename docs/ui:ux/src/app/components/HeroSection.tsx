import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden py-8 md:py-12">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative container px-4 md:px-8 max-w-5xl mx-auto text-center">
        {/* Logo Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-4"
        >
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-primary/50 rounded-3xl blur-3xl"></div>

            {/* Logo Container */}
            <div className="relative bg-gradient-to-br from-[#0A0A0A] to-[#121212] rounded-3xl p-3 border-2 border-primary/30">
              <svg
                width="36"
                height="36"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_20px_rgba(0,121,255,0.5)]"
              >
                {/* P Shape */}
                <path
                  d="M 20 12 L 20 52 M 20 12 L 40 12 C 48 12 52 16 52 24 C 52 32 48 36 40 36 L 20 36"
                  stroke="#0079FF"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Accent Dot */}
                <circle
                  cx="44"
                  cy="24"
                  r="3"
                  fill="#0079FF"
                  opacity="0.8"
                >
                  <animate
                    attributeName="opacity"
                    values="0.8;1;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[0.95] text-[60px]">
            <span className="text-white text-[48px]">
              연결을 넘어 성과로,
            </span>
            <br />
            <span className="text-primary drop-shadow-[0_0_30px_rgba(0,121,255,0.5)] text-[48px]">
              더포텐셜
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4 text-[16px]"
        >
          창업가들의 실시간 인사이트와 검증된 정보를 한곳에서.
          <br className="hidden md:block" />
          당신의 성장을 가속화하는 창업 커뮤니티 플랫폼
        </motion.p>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex justify-center gap-2 items-center text-sm text-primary/80"
        >
          <Sparkles className="h-4 w-4" />
          <span className="font-semibold">
            지금 1,247명의 창업가가 함께하고 있습니다
          </span>
        </motion.div>
      </div>
    </div>
  );
}