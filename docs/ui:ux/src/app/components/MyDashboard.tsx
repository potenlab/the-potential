import { ArrowRight, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface MyDashboardProps {
  onNavigate: (section: string) => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export function MyDashboard({ onNavigate }: MyDashboardProps) {
  // Mock data
  const supportPrograms = [
    {
      title: '초기창업패키지 2025',
      org: '중소벤처기업부',
      amount: '최대 1억원',
      deadline: '3일',
      tags: ['초기창업', '정부지원'],
    },
    {
      title: '서울시 청년창업지원',
      org: '서울산업진흥원',
      amount: '최대 5천만원',
      deadline: '7일',
      tags: ['서울', '청년'],
    },
    {
      title: 'K-Startup 챌린지',
      org: '창업진흥원',
      amount: '최대 3억원',
      deadline: '14일',
      tags: ['글로벌', '스케일업'],
    },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 md:mb-3">내 상황판</h2>
        <p className="text-muted-foreground text-base md:text-lg">나에게 맞는 정보를 한눈에 확인하세요</p>
      </div>

      {/* Welcome Back Section */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#121212] rounded-[2rem] p-8 border border-primary/20 shadow-lg">
          {/* Gradient Orb */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold text-primary tracking-wider">WELCOME BACK</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">
              안녕하세요, 창업님!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
              오늘도 성장하는 하루를 만들어가세요.<br/>
              새로운 기회를 확인해보세요.
            </p>
            <Button 
              onClick={() => onNavigate('support')}
              className="h-12 px-6 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              지원사업 둘러보기
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 나에게 맞는 지원사업 Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">나에게 맞는 지원사업</h2>
            <p className="text-sm text-muted-foreground mt-1">마감 임박한 공고를 확인하세요</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('support')}
            className="text-primary hover:bg-primary/10 rounded-2xl h-10 px-4 font-semibold"
          >
            전체보기
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="overflow-x-auto -mx-4 md:-mx-0 px-4 md:px-0 pb-2 scrollbar-hide">
          <div className="flex gap-4 md:gap-6 w-max md:w-auto md:grid md:grid-cols-3">
            {supportPrograms.map((program, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="w-[300px] md:w-auto bg-[#0A0A0A] border-border rounded-3xl hover:border-primary/40 transition-all cursor-pointer shadow-lg">
                  <CardContent className="p-6">
                    {/* Deadline Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-primary/10 text-primary border-0 rounded-xl px-3 py-1.5 font-bold">
                        <Clock className="h-3 w-3 mr-1" />
                        D-{program.deadline}
                      </Badge>
                      <span className="text-lg font-extrabold text-primary">{program.amount}</span>
                    </div>

                    {/* Title & Org */}
                    <h3 className="font-bold text-white mb-2 text-lg leading-tight">{program.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{program.org}</p>

                    {/* Tags */}
                    <div className="flex gap-2 flex-wrap">
                      {program.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="bg-[#121212] text-white border-0 rounded-xl text-xs px-2 py-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
