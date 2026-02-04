import { useState } from 'react';
import { Calendar, Plus, Search, TrendingUp, Clock, Eye, MessageCircle, Heart, Share2, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EmptyState } from './EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { motion } from 'motion/react';
import { EventPostDetail } from './EventPostDetail';
import { CreateEventPost } from './CreateEventPost';

export interface EventPost {
  id: number;
  category: '행사' | '홍보' | '설문조사' | '서비스소개';
  title: string;
  content: string;
  author: string;
  authorRole: string;
  timestamp: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  isHot: boolean;
  eventDate?: string;
  eventLocation?: string;
  eventLink?: string;
}

// 🎯 빈 배열로 변경
export const mockPosts: EventPost[] = [];

export function EventBoard() {
  const [posts, setPosts] = useState(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'latest'>('latest');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<EventPost | null>(null);
  const [currentPageAll, setCurrentPageAll] = useState(1);
  const [currentPageEvent, setCurrentPageEvent] = useState(1);
  const [currentPagePromo, setCurrentPagePromo] = useState(1);
  const [currentPageSurvey, setCurrentPageSurvey] = useState(1);
  const [currentPageService, setCurrentPageService] = useState(1);
  
  const itemsPerPage = 6;

  // If creating a post, show the create page
  if (isCreating) {
    return (
      <CreateEventPost
        onBack={() => setIsCreating(false)}
        onSubmit={(newPostData) => {
          const post: EventPost = {
            id: posts.length + 1,
            ...newPostData,
            author: '김창업',
            authorRole: 'AI 스타트업 대표',
            timestamp: '방금 전',
            views: 0,
            likes: 0,
            comments: 0,
            isHot: false,
          };
          setPosts([post, ...posts]);
          setIsCreating(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // If a post is selected, show the detail view
  if (selectedPost) {
    return <EventPostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.likes - a.likes;
    } else {
      return b.id - a.id;
    }
  });

  const allPosts = sortedPosts;
  const eventPosts = sortedPosts.filter(p => p.category === '행사');
  const promoPosts = sortedPosts.filter(p => p.category === '홍보');
  const surveyPosts = sortedPosts.filter(p => p.category === '설문조사');
  const servicePosts = sortedPosts.filter(p => p.category === '서비스소개');

  const getCategoryColor = (category: EventPost['category']) => {
    switch (category) {
      case '행사':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case '홍보':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case '설문조사':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case '서비스소개':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    }
  };

  const PostCard = ({ post }: { post: EventPost }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        setSelectedPost(post);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <Card className="bg-card border-border/50 rounded-3xl hover:border-primary/30 transition-all cursor-pointer group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className={`rounded-xl px-3 py-1 font-semibold border ${getCategoryColor(post.category)}`}>
                {post.category}
              </Badge>
              {post.isHot && (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/30 rounded-xl px-3 py-1 font-semibold border">
                  🔥 HOT
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2">
            {post.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.content}
          </p>
        </CardHeader>

        <CardContent>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-muted text-white rounded-xl px-3 py-1 text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Author & Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">{post.author[0]}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{post.author}</p>
                <p className="text-xs text-muted-foreground">{post.authorRole} · {post.timestamp}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-muted-foreground hover:text-red-400 transition-colors">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{post.comments}</span>
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 md:mb-3">이벤트 게시판</h2>
          <p className="text-muted-foreground text-base md:text-lg">행사, 홍보, 설문조사, 서비스를 자유롭게 공유하세요</p>
        </div>
        <Button
          className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-8 font-semibold glow-effect"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          게시글 작성
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="bg-card border-border/50 rounded-3xl">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="게시글, 태그 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card-secondary border-border/50 rounded-2xl text-white placeholder:text-muted-foreground"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 h-12 bg-card-secondary border-border/50 rounded-2xl text-white">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-2xl">
                <SelectItem value="latest">최신</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-card border border-border/50 rounded-2xl p-2 h-auto flex-wrap gap-2">
          <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-6 py-3 font-semibold">
            전체 ({allPosts.length})
          </TabsTrigger>
          <TabsTrigger value="event" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-6 py-3 font-semibold">
            🎉 행사 ({eventPosts.length})
          </TabsTrigger>
          <TabsTrigger value="promo" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-6 py-3 font-semibold">
            📢 홍보 ({promoPosts.length})
          </TabsTrigger>
          <TabsTrigger value="survey" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-6 py-3 font-semibold">
            📊 설문조사 ({surveyPosts.length})
          </TabsTrigger>
          <TabsTrigger value="service" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-6 py-3 font-semibold">
            💡 서비스소개 ({servicePosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8">
          {allPosts.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="등록된 게시글이 없습니다"
              description="첫 번째 게시글을 작성해보세요!"
              action={{
                label: '게시글 작성하기',
                onClick: () => setIsCreating(true)
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {allPosts.slice((currentPageAll - 1) * itemsPerPage, currentPageAll * itemsPerPage).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              {Math.ceil(allPosts.length / itemsPerPage) > 1 && (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => setCurrentPageAll(currentPageAll - 1)}
                    disabled={currentPageAll === 1}
                    className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-4 font-semibold"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => setCurrentPageAll(currentPageAll + 1)}
                    disabled={currentPageAll * itemsPerPage >= allPosts.length}
                    className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-4 font-semibold"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="event" className="mt-8">
          {eventPosts.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="등록된 행사가 없습니다"
              description="네트워킹 행사를 공유해보세요!"
              action={{
                label: '행사 등록하기',
                onClick: () => setIsCreating(true)
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {eventPosts.slice((currentPageEvent - 1) * itemsPerPage, currentPageEvent * itemsPerPage).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => setCurrentPageEvent(currentPageEvent - 1)}
                  disabled={currentPageEvent === 1}
                  className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-4 font-semibold"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => setCurrentPageEvent(currentPageEvent + 1)}
                  disabled={currentPageEvent * itemsPerPage >= eventPosts.length}
                  className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-4 font-semibold"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="promo" className="mt-8">
          {promoPosts.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="등록된 홍보글이 없습니다"
              description="서비스나 제품을 홍보해보세요!"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {promoPosts.slice((currentPagePromo - 1) * itemsPerPage, currentPagePromo * itemsPerPage).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => setCurrentPagePromo(currentPagePromo - 1)}
                  disabled={currentPagePromo === 1}
                  className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-4 font-semibold"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => setCurrentPagePromo(currentPagePromo + 1)}
                  disabled={currentPagePromo * itemsPerPage >= promoPosts.length}
                  className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-4 font-semibold"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="survey" className="mt-8">
          {surveyPosts.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="등록된 설문조사가 없습니다"
              description="창업가들의 의견을 모아보세요!"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {surveyPosts.slice((currentPageSurvey - 1) * itemsPerPage, currentPageSurvey * itemsPerPage).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => setCurrentPageSurvey(currentPageSurvey - 1)}
                  disabled={currentPageSurvey === 1}
                  className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-4 font-semibold"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => setCurrentPageSurvey(currentPageSurvey + 1)}
                  disabled={currentPageSurvey * itemsPerPage >= surveyPosts.length}
                  className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-4 font-semibold"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="service" className="mt-8">
          {servicePosts.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="등록된 서비스 소개가 없습니다"
              description="스타트업 서비스를 소개해보세요!"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {servicePosts.slice((currentPageService - 1) * itemsPerPage, currentPageService * itemsPerPage).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => setCurrentPageService(currentPageService - 1)}
                  disabled={currentPageService === 1}
                  className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-4 font-semibold"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => setCurrentPageService(currentPageService + 1)}
                  disabled={currentPageService * itemsPerPage >= servicePosts.length}
                  className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-4 font-semibold"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}