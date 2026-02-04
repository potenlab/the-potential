import { useState } from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, TrendingUp, Clock, Search, Eye, Sparkles, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { EmptyState } from './EmptyState';

interface Article {
  id: number;
  title: string;
  summary: string;
  author: string;
  source: string;
  url: string;
  timestamp: string;
  readTime: number;
  category: string;
  tags: string[];
  isBookmarked: boolean;
  views: number;
}

// 🎯 빈 배열로 변경
const mockArticles: Article[] = [];

export function ArticleInsights() {
  const [articles, setArticles] = useState(mockArticles);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleBookmark = (id: number) => {
    setArticles(articles.map(article =>
      article.id === id ? { ...article, isBookmarked: !article.isBookmarked } : article
    ));
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const bookmarkedArticles = filteredArticles.filter(a => a.isBookmarked);
  const trendingArticles = [...filteredArticles].sort((a, b) => b.views - a.views);

  const ArticleCard = ({ article }: { article: Article }) => (
    <Card className="bg-card border-border/50 rounded-3xl hover:border-primary/30 transition-all group">
      <CardContent className="pt-8">
        <div className="flex gap-4">
          <div className="flex-1">
            {/* Category Badge */}
            <Badge className="bg-primary/10 text-primary border-0 rounded-xl mb-4 px-3 py-1 font-semibold">
              {article.category}
            </Badge>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight">
              {article.title}
            </h3>

            {/* Summary */}
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
              {article.summary}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-muted text-white rounded-xl px-3 py-1 text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {article.author[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{article.author}</span>
                </div>
                <span>·</span>
                <span>{article.source}</span>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.readTime}분</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.views.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleBookmark(article.id)}
                  className="rounded-2xl hover:bg-primary/10"
                >
                  {article.isBookmarked ? (
                    <BookmarkCheck className="h-5 w-5 text-primary fill-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
                <Button className="rounded-2xl bg-primary text-white hover:bg-primary/90 font-semibold">
                  읽기
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 md:mb-3">아티클 인사이트</h2>
        <p className="text-muted-foreground text-base md:text-lg">창업과 비즈니스 성장에 도움이 되는 인사이트를 발견하세요</p>
      </div>

      {/* Search */}
      <Card className="bg-card border-border/50 rounded-3xl">
        <CardContent className="pt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="아티클, 태그, 저자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card-secondary border-border/50 rounded-2xl text-white placeholder:text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Topics */}
      <Card className="bg-gradient-to-br from-card to-card-secondary border-primary/20 rounded-3xl">
        <CardContent className="pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-white text-lg">추천 토픽</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['투자유치', 'MVP개발', '팀빌딩', '마케팅', '법률', '재무', '조직문화', '글로벌진출'].map((topic) => (
              <Badge key={topic} className="bg-primary/10 text-primary border-0 rounded-xl px-4 py-2 hover:bg-primary/20 cursor-pointer transition-all font-semibold">
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-card border border-border/50 rounded-2xl p-2 h-auto">
          <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-8 py-3 font-semibold">
            전체 ({filteredArticles.length})
          </TabsTrigger>
          <TabsTrigger value="trending" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-8 py-3 font-semibold">
            인기 아티클
          </TabsTrigger>
          <TabsTrigger value="bookmarked" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-8 py-3 font-semibold">
            북마크 ({bookmarkedArticles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8">
          {filteredArticles.length > 0 ? (
            <div className="space-y-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="아티클이 없습니다"
              description="창업에 도움이 되는 인사이트를 곧 만나보실 수 있습니다"
            />
          )}
        </TabsContent>

        <TabsContent value="trending" className="mt-8">
          {trendingArticles.length > 0 ? (
            <div className="space-y-6">
              {trendingArticles.slice(0, 5).map((article, idx) => (
                <div key={article.id} className="relative">
                  <div className="absolute -left-12 top-8 text-4xl font-extrabold text-primary/20">
                    {idx + 1}
                  </div>
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="인기 아티클이 없습니다"
              description="조회수가 높은 인사이트를 곧 만나보실 수 있습니다"
            />
          )}
        </TabsContent>

        <TabsContent value="bookmarked" className="mt-8">
          {bookmarkedArticles.length > 0 ? (
            <div className="space-y-6">
              {bookmarkedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border/50 rounded-3xl">
              <CardContent className="py-16 text-center">
                <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-white font-semibold text-lg mb-2">북마크한 아티클이 없습니다</p>
                <p className="text-muted-foreground">관심있는 아티클을 북마크해보세요</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}