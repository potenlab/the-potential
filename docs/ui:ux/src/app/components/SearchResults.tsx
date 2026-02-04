import { Search, TrendingUp, Users, FileText, Calendar, Target } from 'lucide-react';
import { Badge } from './ui/badge';

interface SearchResultsProps {
  searchQuery: string;
  onClose: () => void;
}

export function SearchResults({ searchQuery, onClose }: SearchResultsProps) {
  // Mock data for search results
  const allSupportPrograms = [
    {
      id: 1,
      title: '초기창업패키지',
      organization: '중소벤처기업부',
      amount: '최대 1억원',
      deadline: '2026.02.28',
      tags: ['예비창업', '사업화'],
    },
    {
      id: 2,
      title: '시드팁스',
      organization: 'TIPS운영사',
      amount: '최대 5억원',
      deadline: '2026.03.15',
      tags: ['시드', 'R&D'],
    },
    {
      id: 3,
      title: 'AI 스타트업 육성 프로그램',
      organization: '과학기술정보통신부',
      amount: '최대 2억원',
      deadline: '2026.02.01',
      tags: ['AI', '기술개발'],
    },
  ];

  const allClubs = [
    {
      id: 1,
      name: 'AI 스타트업 클럽',
      members: 127,
      description: 'AI/ML 기반 스타트업 창업가들의 기술 공유',
      isPrivate: true,
    },
    {
      id: 2,
      name: 'SaaS 빌더스',
      members: 89,
      description: 'B2B SaaS 서비스 개발자 & 창업가 커뮤니티',
      isPrivate: false,
    },
    {
      id: 3,
      name: 'CTO 네트워크',
      members: 156,
      description: '스타트업 기술 리더들의 교류 및 협업',
      isPrivate: true,
    },
  ];

  const allThreads = [
    {
      id: 1,
      author: '김민수',
      stage: 'Stage 3',
      content: '시드 투자 유치 과정에서 겪은 시행착오들 공유합니다',
      likes: 42,
      comments: 18,
      timeAgo: '3시간 전',
    },
    {
      id: 2,
      author: '이지원',
      stage: 'Stage 4',
      content: 'CTO 파트너 찾기 전에 꼭 확인해야 할 체크리스트',
      likes: 67,
      comments: 23,
      timeAgo: '5시간 전',
    },
    {
      id: 3,
      author: '박성훈',
      stage: 'Stage 2',
      content: 'AI 기반 SaaS 프로덕트 개발 로드맵 공유',
      likes: 31,
      comments: 12,
      timeAgo: '1일 전',
    },
  ];

  const allArticles = [
    {
      id: 1,
      title: '2026년 스타트업 투자 트렌드 분석',
      author: '박성훈',
      readTime: '8분',
      views: 1247,
      publishedAt: '2일 전',
    },
    {
      id: 2,
      title: 'Y Combinator 합격 비결 5가지',
      author: '최유진',
      readTime: '12분',
      views: 2103,
      publishedAt: '4일 전',
    },
    {
      id: 3,
      title: 'CTO 없이 MVP 만들기 - 노코드 활용법',
      author: '김개발',
      readTime: '15분',
      views: 1856,
      publishedAt: '1주 전',
    },
    {
      id: 4,
      title: 'SaaS 스타트업 초기 고객 확보 전략',
      author: '이마케팅',
      readTime: '10분',
      views: 1432,
      publishedAt: '1주 전',
    },
  ];

  // Filter based on search query
  const query = searchQuery.toLowerCase();
  
  const supportPrograms = allSupportPrograms.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.organization.toLowerCase().includes(query) ||
    p.tags.some(tag => tag.toLowerCase().includes(query))
  );

  const clubs = allClubs.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.description.toLowerCase().includes(query)
  );

  const threads = allThreads.filter(t =>
    t.content.toLowerCase().includes(query) ||
    t.author.toLowerCase().includes(query)
  );

  const articles = allArticles.filter(a =>
    a.title.toLowerCase().includes(query) ||
    a.author.toLowerCase().includes(query)
  );

  const totalResults = supportPrograms.length + clubs.length + threads.length + articles.length;

  return (
    <div className="w-full min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-border">
        <div className="container px-4 md:px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-white">
                검색 결과
              </h1>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              닫기
            </button>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">검색어:</span>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
              {searchQuery}
            </Badge>
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="container px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-12">
        {totalResults === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">검색 결과가 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              "{searchQuery}"에 대한 결과를 찾을 수 없습니��.<br />
              다른 키워드로 검색해보세요.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-all"
            >
              돌아가기
            </button>
          </div>
        ) : (
          <>
            {/* Support Programs */}
            {supportPrograms.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-white">지원사업</h2>
                  <Badge variant="secondary" className="ml-2">
                    {supportPrograms.length}
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {supportPrograms.map((program) => (
                    <div
                      key={program.id}
                      className="bg-card border-2 border-border rounded-3xl p-6 hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                            {program.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{program.organization}</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/30">
                          {program.amount}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {program.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        마감: {program.deadline}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Clubs */}
            {clubs.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-white">클럽</h2>
                  <Badge variant="secondary" className="ml-2">
                    {clubs.length}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      className="bg-card border-2 border-border rounded-3xl p-6 hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                          {club.name}
                        </h3>
                        {club.isPrivate && (
                          <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-500">
                            비공개
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{club.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{club.members}명</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Threads */}
            {threads.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-white">쓰레드</h2>
                  <Badge variant="secondary" className="ml-2">
                    {threads.length}
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="bg-card border-2 border-border rounded-3xl p-6 hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{thread.author[0]}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{thread.author}</p>
                            <Badge variant="outline" className="text-xs">
                              {thread.stage}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{thread.timeAgo}</p>
                        </div>
                      </div>
                      <p className="text-white mb-4 group-hover:text-primary/90 transition-colors">
                        {thread.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>좋아요 {thread.likes}</span>
                        <span>댓글 {thread.comments}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Articles */}
            {articles.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-white">아티클</h2>
                  <Badge variant="secondary" className="ml-2">
                    {articles.length}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-card border-2 border-border rounded-3xl p-6 hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                        <span>•</span>
                        <span>{article.publishedAt}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        조회수 {article.views.toLocaleString()}회
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}