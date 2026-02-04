import { useState } from 'react';
import { Bookmark, FileText, Briefcase, Users, MessageCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback } from './ui/avatar';

// Mock 북마크 데이터
const mockBookmarkedThreads = [
  {
    id: 1,
    author: '박스타트',
    role: 'SaaS 스타트업 대표',
    content: '첫 직원 채용 시 가장 중요하게 봐야 할 점은 뭘까요? 스타트업 초기라 조직문화도 아직 확립되지 않았고...',
    timestamp: '2시간 전',
    tags: ['채용', '조직문화'],
  },
  {
    id: 2,
    author: '최성장',
    role: 'AI 스타트업 대표',
    content: '시리즈A 투자 받기 전 꼭 준비해야 할 것들을 정리해봤어요. 1) 명확한 비즈니스 모델 2) 트랙션 증명...',
    timestamp: '1일 전',
    tags: ['투자', '시리즈A'],
  },
];

const mockBookmarkedArticles = [
  {
    id: 1,
    title: 'AI 스타트업 생존 전략: 2024년을 이끄는 핵심 트렌드',
    author: '김인사이트',
    readTime: '8분',
    category: 'AI/ML',
    excerpt: 'AI 스타트업이 성공하기 위한 핵심 전략과 2024년 트렌드를 심층 분석합니다...',
  },
  {
    id: 2,
    title: '스타트업 창업자를 위한 법인 설립 완벽 가이드',
    author: '이법무',
    readTime: '12분',
    category: '법무/세무',
    excerpt: '법인 설립부터 정관 작성, 세무 신고까지 창업자가 알아야 할 모든 것...',
  },
];

const mockBookmarkedPrograms = [
  {
    id: 1,
    title: 'K-Startup 초기창업패키지',
    organization: '창업진흥원',
    dueDate: '2024.02.15',
    amount: '최대 1억원',
    category: '초기',
  },
  {
    id: 2,
    title: 'Seoul Global Challenge',
    organization: '서울시',
    dueDate: '2024.02.28',
    amount: '최대 3억원',
    category: '확장',
  },
];

const mockBookmarkedUsers = [
  {
    id: 1,
    name: '박성공',
    role: 'SaaS 스타트업 대표',
    company: '테크솔루션즈',
    stage: 'Stage 4',
    badge: '고수',
  },
  {
    id: 2,
    name: '이혁신',
    role: 'AI 스타트업 CTO',
    company: 'AI이노베이션',
    stage: 'Stage 5',
    badge: '고수',
  },
];

export function BookmarkSection() {
  const [activeTab, setActiveTab] = useState('threads');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Bookmark className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">북마크</h2>
          <p className="text-muted-foreground">저장한 콘텐츠를 모아보세요</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card-secondary rounded-2xl p-1 w-full grid grid-cols-4 gap-1">
          <TabsTrigger 
            value="threads" 
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            쓰레드
          </TabsTrigger>
          <TabsTrigger 
            value="articles" 
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            아티클
          </TabsTrigger>
          <TabsTrigger 
            value="programs" 
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            지원사업
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            유저
          </TabsTrigger>
        </TabsList>

        {/* 쓰레드 탭 */}
        <TabsContent value="threads" className="space-y-4 mt-6">
          {mockBookmarkedThreads.length > 0 ? (
            mockBookmarkedThreads.map((thread) => (
              <Card key={thread.id} className="bg-[#1A1A1A] border-border/40 rounded-3xl hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {thread.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-white">{thread.author}</p>
                        <span className="text-xs text-muted-foreground">·</span>
                        <p className="text-sm text-muted-foreground">{thread.role}</p>
                        <span className="text-xs text-muted-foreground">·</span>
                        <p className="text-sm text-muted-foreground">{thread.timestamp}</p>
                      </div>
                      <p className="text-white/90 leading-relaxed mb-3">{thread.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {thread.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-muted text-white rounded-xl px-3 py-1">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState icon={MessageCircle} message="북마크한 쓰레드가 없습니다" />
          )}
        </TabsContent>

        {/* 아티클 탭 */}
        <TabsContent value="articles" className="space-y-4 mt-6">
          {mockBookmarkedArticles.length > 0 ? (
            mockBookmarkedArticles.map((article) => (
              <Card key={article.id} className="bg-[#1A1A1A] border-border/40 rounded-3xl hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-primary/10 text-primary border-primary/30 rounded-xl px-3 py-1 font-semibold border">
                      {article.category}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{article.readTime} 읽기</p>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{article.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{article.excerpt}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>{article.author}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState icon={FileText} message="북마크한 아티클이 없습니다" />
          )}
        </TabsContent>

        {/* 지원사업 탭 */}
        <TabsContent value="programs" className="space-y-4 mt-6">
          {mockBookmarkedPrograms.length > 0 ? (
            mockBookmarkedPrograms.map((program) => (
              <Card key={program.id} className="bg-[#1A1A1A] border-border/40 rounded-3xl hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30 rounded-xl px-3 py-1 font-semibold border">
                      {program.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-red-500/10 text-red-400 rounded-xl px-3 py-1">
                      마감 {program.dueDate}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{program.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">{program.organization}</p>
                    <p className="text-primary font-semibold">{program.amount}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState icon={Briefcase} message="북마크한 지원사업이 없습니다" />
          )}
        </TabsContent>

        {/* 유저 탭 */}
        <TabsContent value="users" className="space-y-4 mt-6">
          {mockBookmarkedUsers.length > 0 ? (
            mockBookmarkedUsers.map((user) => (
              <Card key={user.id} className="bg-[#1A1A1A] border-border/40 rounded-3xl hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{user.name}</h3>
                        {user.badge && (
                          <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 rounded-xl px-2 py-0.5 text-xs font-semibold border">
                            👑 {user.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-1">{user.role}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-muted text-white rounded-xl px-2 py-0.5 text-xs">
                          {user.company}
                        </Badge>
                        <Badge className="bg-primary/10 text-primary rounded-xl px-2 py-0.5 text-xs">
                          {user.stage}
                        </Badge>
                      </div>
                    </div>
                    <Button className="rounded-2xl bg-primary text-white hover:bg-primary/90 font-semibold">
                      프로필 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState icon={Users} message="북마크한 유저가 없습니다" />
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
      <CardContent className="py-16 text-center">
        <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">{message}</p>
        <p className="text-sm text-muted-foreground mt-2">관심 있는 콘텐츠를 북마크하고 나중에 다시 확인하세요</p>
      </CardContent>
    </Card>
  );
}
