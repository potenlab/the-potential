import { useState } from 'react';
import { 
  ArrowLeft, 
  Award, 
  MapPin, 
  Briefcase, 
  Calendar,
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Mail,
  Linkedin,
  Globe,
  Building2,
  Target,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';

export interface UserProfileData {
  name: string;
  title: string;
  stage: string;
  avatar: string;
  isExpert?: boolean;
  bio?: string;
  region?: string;
  industry?: string;
  company?: string;
  foundedDate?: string;
  website?: string;
  linkedin?: string;
  email?: string;
  interests?: string[];
  achievements?: string[];
  stats?: {
    threads: number;
    comments: number;
    likes: number;
    clubs: number;
  };
}

interface UserProfileProps {
  user: UserProfileData;
  onBack: () => void;
}

export function UserProfile({ user, onBack }: UserProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data
  const profileData: UserProfileData = {
    ...user,
    bio: user.bio || '스타트업 생태계에서 혁신을 만들어가고 있습니다. 함께 성장하고 싶은 창업가들과 네트워킹하는 것을 좋아합니다.',
    region: user.region || '서울',
    industry: user.industry || 'AI/ML',
    company: user.company || 'AI 스타트업',
    foundedDate: user.foundedDate || '2023.03',
    website: user.website || 'https://example.com',
    linkedin: user.linkedin || 'linkedin.com/in/example',
    email: user.email || 'contact@example.com',
    interests: user.interests || ['AI', '스타트업', '투자유치', '그로스해킹'],
    achievements: user.achievements || [
      '🏆 2024 스타트업 경진대회 대상',
      '💰 시드 라운드 5억 유치',
      '📈 MAU 10만 달성',
    ],
    stats: user.stats || {
      threads: 42,
      comments: 128,
      likes: 256,
      clubs: 5,
    },
  };

  // Mock recent threads
  const recentThreads = [
    {
      id: 1,
      content: 'AI 스타트업 초기 고객 확보 전략에 대해 공유합니다. 처음에는 정말 막막했는데...',
      timestamp: '2일 전',
      likes: 28,
      comments: 12,
    },
    {
      id: 2,
      content: '투자 유치 과정에서 가장 중요했던 것은 트랙션이었습니다. 숫자로 증명하는 것의 중요성...',
      timestamp: '5일 전',
      likes: 45,
      comments: 18,
    },
    {
      id: 3,
      content: '오늘 네트워킹 이벤트에서 만난 멘토님의 조언이 정말 인상적이었습니다.',
      timestamp: '1주일 전',
      likes: 32,
      comments: 9,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="rounded-2xl hover:bg-card/50 text-white -ml-2"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        뒤로가기
      </Button>

      {/* Profile Header */}
      <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20" />
        
        <CardContent className="p-6 -mt-16">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar className={`h-32 w-32 border-4 ${
                profileData.isExpert 
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                  : 'border-primary/50 shadow-lg shadow-primary/20'
              }`}>
                <AvatarFallback className={`${
                  profileData.isExpert 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-br from-primary to-blue-600'
                } text-white font-bold text-5xl`}>
                  {profileData.avatar}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{profileData.name}</h1>
                    {profileData.isExpert && (
                      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 rounded-xl px-3 py-1 font-semibold border flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        고수
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-white/80 mb-2">{profileData.title}</p>
                  <Badge variant="outline" className="border-primary/50 text-primary rounded-xl px-3 py-1 font-semibold">
                    {profileData.stage}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`rounded-2xl px-6 font-semibold ${
                      isFollowing 
                        ? 'bg-card border border-border/50 text-white hover:bg-card/80' 
                        : 'bg-primary text-white hover:bg-primary/90 glow-effect'
                    }`}
                  >
                    {isFollowing ? '팔로잉' : '팔로우'}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-border/50 px-6 font-semibold"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    메시지
                  </Button>
                </div>
              </div>

              {/* Bio */}
              <p className="text-white/70 leading-relaxed mb-4">{profileData.bio}</p>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm text-white/60">
                {profileData.region && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{profileData.region}</span>
                  </div>
                )}
                {profileData.industry && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span>{profileData.industry}</span>
                  </div>
                )}
                {profileData.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>{profileData.company}</span>
                  </div>
                )}
                {profileData.foundedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>설립: {profileData.foundedDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-white mb-1">{profileData.stats?.threads}</p>
            <p className="text-sm text-muted-foreground">쓰레드</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-white mb-1">{profileData.stats?.comments}</p>
            <p className="text-sm text-muted-foreground">댓글</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-white mb-1">{profileData.stats?.likes}</p>
            <p className="text-sm text-muted-foreground">좋아요</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-white mb-1">{profileData.stats?.clubs}</p>
            <p className="text-sm text-muted-foreground">클럽</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="bg-[#1A1A1A] border border-border/50 rounded-2xl p-2 h-auto w-full grid grid-cols-3">
          <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground py-3 font-semibold">
            활동
          </TabsTrigger>
          <TabsTrigger value="about" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground py-3 font-semibold">
            소개
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground py-3 font-semibold">
            연락처
          </TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6 space-y-4">
          <h3 className="font-bold text-white text-lg mb-4">최근 쓰레드</h3>
          {recentThreads.map((thread) => (
            <Card key={thread.id} className="bg-[#1A1A1A] border-border/40 rounded-3xl hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="p-6">
                <p className="text-white/90 leading-relaxed mb-4">{thread.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{thread.timestamp}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{thread.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{thread.comments}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="mt-6 space-y-4">
          {/* Interests */}
          <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
            <CardContent className="p-6">
              <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                관심사
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileData.interests?.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/30 rounded-xl px-3 py-1 font-semibold border">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
            <CardContent className="p-6">
              <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                주요 성과
              </h3>
              <div className="space-y-3">
                {profileData.achievements?.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-white/80 leading-relaxed">{achievement}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-6">
          <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
            <CardContent className="p-6">
              <h3 className="font-bold text-white text-lg mb-6">연락처 정보</h3>
              <div className="space-y-4">
                {profileData.email && (
                  <div className="flex items-center gap-4 p-4 bg-card/50 rounded-2xl">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">이메일</p>
                      <p className="text-white font-semibold">{profileData.email}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-2xl border-border/50">
                      복사
                    </Button>
                  </div>
                )}

                {profileData.website && (
                  <div className="flex items-center gap-4 p-4 bg-card/50 rounded-2xl">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">웹사이트</p>
                      <p className="text-white font-semibold">{profileData.website}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-2xl border-border/50">
                      방문
                    </Button>
                  </div>
                )}

                {profileData.linkedin && (
                  <div className="flex items-center gap-4 p-4 bg-card/50 rounded-2xl">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Linkedin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">LinkedIn</p>
                      <p className="text-white font-semibold">{profileData.linkedin}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-2xl border-border/50">
                      방문
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
