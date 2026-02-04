import { useState } from 'react';
import { Users, MapPin, Calendar, Lock, Plus, Search, UserPlus, MessageCircle, Crown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EmptyState } from './EmptyState';
import { ClubDetail, Club as ClubType } from './ClubDetail';
import { CreateClub } from './CreateClub';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface Club {
  id: number;
  name: string;
  description: string;
  type: 'stage' | 'region' | 'interest';
  memberCount: number;
  category: string;
  tags: string[];
  isPrivate: boolean;
  stage?: string;
  region?: string;
  createdAt: string;
}

// 🎯 빈 배열로 변경
const mockClubs: Club[] = [];

export function PrivateClubs() {
  const [clubs, setClubs] = useState(mockClubs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [joinedClubs, setJoinedClubs] = useState<number[]>([1, 2, 3]);
  const [showCreateClub, setShowCreateClub] = useState(false);

  const toggleJoin = (id: number) => {
    setJoinedClubs(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleClubCreated = (newClub: Club) => {
    // 새로운 클럽을 리스트에 추가
    setClubs(prev => [newClub, ...prev]);
    // 생성한 클럽에 자동으로 가입
    setJoinedClubs(prev => [...prev, newClub.id]);
    setShowCreateClub(false);
  };

  // 클럽 만들기 화면 표시
  if (showCreateClub) {
    return (
      <CreateClub
        onBack={() => setShowCreateClub(false)}
        onClubCreated={handleClubCreated}
      />
    );
  }

  // 상세 페이지가 열려있으면 상세 페이지 표시
  if (selectedClub) {
    return (
      <ClubDetail
        club={selectedClub}
        onBack={() => setSelectedClub(null)}
        isMember={joinedClubs.includes(selectedClub.id)}
        onJoinToggle={toggleJoin}
      />
    );
  }

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const myClubs = filteredClubs.filter(c => c.isPrivate);
  const allClubs = filteredClubs;

  const getTypeIcon = (type: Club['type']) => {
    switch (type) {
      case 'region':
        return <MapPin className="h-4 w-4" />;
      case 'interest':
        return <MessageCircle className="h-4 w-4" />;
      case 'stage':
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: Club['type']) => {
    switch (type) {
      case 'region':
        return '지역';
      case 'interest':
        return '관심사';
      case 'stage':
        return '단계';
    }
  };

  const ClubCard = ({ club }: { club: Club }) => (
    <Card 
      className="bg-[#1A1A1A] border-border/40 rounded-3xl hover:border-primary/30 transition-all group cursor-pointer"
      onClick={() => setSelectedClub(club)}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/10 text-primary border-0 rounded-xl px-3 py-1 font-semibold flex items-center gap-1">
                {getTypeIcon(club.type)}
                {getTypeLabel(club.type)}
              </Badge>
              {club.isPrivate && (
                <Badge variant="outline" className="border-border/50 text-muted-foreground rounded-xl px-3 py-1 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  비공개
                </Badge>
              )}
              <Badge variant="secondary" className="bg-muted text-white rounded-xl px-3 py-1">
                {club.category}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-extrabold text-white group-hover:text-primary transition-colors mb-3">
              {club.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {club.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {club.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-muted text-white rounded-xl px-3 py-1 text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold text-white">{club.memberCount}명</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>멤버 현황</span>
              <span>{Math.round((club.memberCount / 100) * 100)}% 참여</span>
            </div>
            <div className="h-2 bg-card-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all"
                style={{ width: `${(club.memberCount / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 md:mb-3">클럽</h2>
          <p className="text-muted-foreground text-base md:text-lg">비슷한 관심사를 가진 창업가들과 깊이있는 네트워킹을 시작하세요</p>
        </div>
        <Button 
          onClick={() => setShowCreateClub(true)}
          className="rounded-2xl bg-primary text-white hover:bg-primary/90 px-8 font-semibold glow-effect"
        >
          <Plus className="mr-2 h-5 w-5" />
          새 클럽 만들기
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border/50 rounded-3xl">
        <CardContent className="pt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="클럽, 카테고리, 태그 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card-secondary border-border/50 rounded-2xl text-white placeholder:text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="my" className="w-full">
        <TabsList className="bg-card border border-border/50 rounded-2xl p-2 h-auto">
          <TabsTrigger value="my" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-8 py-3 font-semibold">
            내 클럽 ({myClubs.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-8 py-3 font-semibold">
            전체 클럽 ({allClubs.length})
          </TabsTrigger>
          <TabsTrigger value="recommended" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-8 py-3 font-semibold">
            추천 클럽
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="mt-8">
          {myClubs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border/50 rounded-3xl">
              <CardContent className="py-16 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-white font-semibold text-lg mb-2">아직 가입한 클럽이 없습니다</p>
                <p className="text-muted-foreground mb-6">관심있는 클럽에 가입하여 네트워킹을 시작해보세요</p>
                <Button className="rounded-2xl bg-primary text-white hover:bg-primary/90 font-semibold">
                  클럽 둘러보기
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-8">
          {allClubs.length === 0 ? (
            <EmptyState
              icon={Users}
              title="등록된 클럽이 없습니다"
              description="첫 번째 클럽을 만들어보세요!"
              action={{
                label: '클럽 만들기',
                onClick: () => setShowCreateClub(true)
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {allClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="mt-8">
          {allClubs.length === 0 ? (
            <EmptyState
              icon={Users}
              title="추천할 클럽이 없습니다"
              description="클럽이 생성되면 맞춤 추천을 받을 수 있습니다"
            />
          ) : (
            <>
              <Card className="bg-gradient-to-br from-card to-card-secondary border-primary/20 rounded-3xl mb-6">
                <CardContent className="pt-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-6 w-6 text-primary" />
                    <h3 className="font-bold text-white text-xl">맞춤 추천 클럽</h3>
                  </div>
                  <p className="text-muted-foreground">회원님의 프로필과 관심사를 기반으로 추천드립니다</p>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {allClubs.filter(c => !c.isPrivate).slice(0, 4).map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}