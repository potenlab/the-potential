import { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Calendar, 
  Lock, 
  Crown,
  MessageCircle,
  TrendingUp,
  UserPlus,
  Share2,
  Settings,
  MoreVertical,
  CheckCircle2,
  Target,
  Award,
  Zap,
  Bell,
  BellOff,
  LogOut,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { UserProfile, UserProfileData } from './UserProfile';

export interface Club {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  tags: string[];
  isPrivate: boolean;
  type: 'stage' | 'region' | 'interest';
  stage?: string;
  region?: string;
  createdAt: string;
}

interface ClubDetailProps {
  club: Club;
  onBack: () => void;
  isMember: boolean;
  onJoinToggle: (id: number) => void;
}

export function ClubDetail({ club, onBack, isMember, onJoinToggle }: ClubDetailProps) {
  const [isNotificationOn, setIsNotificationOn] = useState(true);
  
  // 가입 상태 관리: 'not-joined' | 'pending' | 'joined'
  const [joinStatus, setJoinStatus] = useState<'not-joined' | 'pending' | 'joined'>(
    isMember ? 'joined' : 'not-joined'
  );
  
  // 현재 사용자가 모임장인지 (demo를 위해 true로 설정)
  const [isLeader, setIsLeader] = useState(true);
  
  // 선택된 사용자 프로필
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  
  // 가입 신청자 목록 (모임장만 볼 수 있음)
  const [joinRequests, setJoinRequests] = useState([
    {
      id: 1,
      name: '신청자A',
      title: 'EdTech 스타트업 대표',
      stage: 'Stage 2',
      avatar: 'SA',
      appliedAt: '2시간 전',
      message: '같은 단계의 창업가들과 교류하고 싶습니다!',
    },
    {
      id: 2,
      name: '이준비',
      title: 'FinTech 예비 창업가',
      stage: 'Stage 1',
      avatar: 'LJ',
      appliedAt: '5시간 전',
      message: 'Stage 3 선배님들의 조언을 듣고 싶어서 신청합니다.',
    },
    {
      id: 3,
      name: '박열정',
      title: 'AI 스타트업 CTO',
      stage: 'Stage 3',
      avatar: 'PY',
      appliedAt: '1일 전',
      message: '기술 중심 스타트업 운영 노하우를 공유하고 싶습니다.',
    },
  ]);

  const handleJoinRequest = () => {
    setJoinStatus('pending');
    toast.success('🎉 가입 신청이 완료되었습니다!', {
      description: '모임장의 승인을 기다려주세요.',
    });
  };

  const handleApprove = (requestId: number, userName: string) => {
    setJoinRequests(joinRequests.filter(req => req.id !== requestId));
    toast.success(`${userName}님의 가입을 승인했습니다!`, {
      description: '새로운 멤버를 환영해주세요.',
    });
  };

  const handleReject = (requestId: number, userName: string) => {
    setJoinRequests(joinRequests.filter(req => req.id !== requestId));
    toast.success(`${userName}님의 가입 신청을 거부했습니다.`);
  };

  const handleShare = () => {
    toast.success('링크가 복사되었습니다!', {
      description: '다른 창업가들을 초대해보세요.',
    });
  };

  const handleNotificationToggle = () => {
    setIsNotificationOn(!isNotificationOn);
    toast.success(isNotificationOn ? '알림이 꺼졌습니다' : '🔔 알림이 켜졌습니다!');
  };

  const handleLeave = () => {
    toast.success('클럽에서 나갔습니다');
    onJoinToggle(club.id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stage':
        return <TrendingUp className="h-4 w-4" />;
      case 'region':
        return <MapPin className="h-4 w-4" />;
      case 'interest':
        return <Target className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'stage':
        return '창업단계';
      case 'region':
        return '지역';
      case 'interest':
        return '관심사';
      default:
        return '';
    }
  };

  // 사용자 프로필 보기
  const handleViewProfile = (user: { name: string; title: string; stage: string; avatar: string; isExpert?: boolean }) => {
    setSelectedUser({
      name: user.name,
      title: user.title,
      stage: user.stage,
      avatar: user.avatar,
      isExpert: user.isExpert,
    });
  };

  // 프로필에서 뒤로가기
  const handleBackFromProfile = () => {
    setSelectedUser(null);
  };

  // 프로필이 선택되어 있으면 UserProfile 컴포넌트 표시
  if (selectedUser) {
    return <UserProfile user={selectedUser} onBack={handleBackFromProfile} />;
  }

  // Mock 데이터
  const clubInfo = {
    leader: {
      name: '김창업',
      title: 'AI 스타트업 대표',
      stage: 'Stage 3',
      avatar: 'KC',
    },
    stats: [
      { label: '활성 멤버', value: '42명', icon: Users },
      { label: '이번 주 게시글', value: '18개', icon: MessageCircle },
      { label: '다음주 네트워킹 일정', value: '1월 20일', icon: Calendar },
    ],
    members: [
      { name: '이스타', title: 'SaaS 스타트업 CTO', stage: 'Stage 3', avatar: 'LS' },
      { name: '박벤처', title: '핀테크 스타트업 대표', stage: 'Stage 4', avatar: 'PV', isExpert: true },
      { name: '최혁신', title: 'AI 플랫폼 PM', stage: 'Stage 2', avatar: 'CH' },
      { name: '정엔젤', title: '커머스 스타트업 대표', stage: 'Stage 3', avatar: 'JA' },
      { name: '강펀딩', title: 'IoT 스타트업 CTO', stage: 'Stage 5', avatar: 'KF', isExpert: true },
      { name: '윤프로', title: '헬스케어 스타트업', stage: 'Stage 2', avatar: 'YP' },
    ],
    recentActivity: [
      { user: '박벤처', action: '투자 유치 노하우 공유', time: '2시간 전', isExpert: true },
      { user: '이스타', action: 'SaaS 가격 책정 전략 질문', time: '5시간 전', isExpert: false },
      { user: '강펀딩', action: 'Series A 투자 유치 성공!', time: '1일 전', isExpert: true },
      { user: '최혁신', action: '프로덕트 로드맵 공유', time: '2일 전', isExpert: false },
    ],
    rules: [
      '서로 존중하고 건설적인 피드백을 나눕니다',
      '비즈니스 기밀은 철저히 보호합니다',
      '스팸성 홍보는 금지됩니다',
      '정기 모임(월 1회)에 적극적으로 참여합니다',
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-6"
    >
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-12 w-12 rounded-2xl hover:bg-card"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
        <div className="flex-1">
          <Badge className="bg-primary/10 text-primary border-0 rounded-xl px-3 py-1 font-semibold flex items-center gap-1 w-fit">
            {getTypeIcon(club.type)}
            {getTypeLabel(club.type)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-12 w-12 rounded-2xl hover:bg-card"
          >
            <Share2 className="h-5 w-5 text-white" />
          </Button>
          {isMember && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-2xl hover:bg-card"
                >
                  <MoreVertical className="h-5 w-5 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border rounded-2xl">
                <DropdownMenuItem onClick={handleNotificationToggle} className="rounded-xl cursor-pointer">
                  {isNotificationOn ? (
                    <>
                      <BellOff className="mr-2 h-4 w-4" />
                      알림 끄기
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      알림 켜기
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  클럽 설정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLeave} className="rounded-xl cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  클럽 나가기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Club Header Card */}
      <Card className="bg-gradient-to-br from-primary/20 via-[#1A1A1A] to-[#1A1A1A] border-primary/40 rounded-3xl glow-effect">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
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
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                {club.name}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                {club.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {club.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-muted text-white rounded-xl px-3 py-1">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {clubInfo.stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-card/50 rounded-2xl p-4 border border-border/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          {joinStatus === 'joined' ? (
            <div className="flex gap-3">
              <Button className="flex-1 h-14 rounded-2xl bg-primary text-white hover:bg-primary/90 text-lg font-bold">
                <MessageCircle className="mr-2 h-5 w-5" />
                클럽 채팅 시작하기
              </Button>
            </div>
          ) : joinStatus === 'pending' ? (
            <Button 
              className="w-full h-14 rounded-2xl bg-orange-500/20 text-orange-400 border-2 border-orange-500/50 text-lg font-bold cursor-not-allowed"
              disabled
            >
              <Clock className="mr-2 h-5 w-5" />
              신청 대기 중
            </Button>
          ) : (
            <Button 
              className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-primary/90 text-lg font-bold"
              onClick={handleJoinRequest}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              참여 신청하기
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="bg-[#1A1A1A] border border-border/50 rounded-2xl p-2 h-auto w-full grid grid-cols-2">
          <TabsTrigger value="about" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground py-3 font-semibold">
            소개
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground py-3 font-semibold">
            멤버
          </TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="mt-6 space-y-4">
          {/* Club Info */}
          <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
            <CardContent className="p-6">
              <h3 className="font-bold text-white text-lg mb-4">클럽 정보</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/80">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>생성일: {new Date(club.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Users className="h-5 w-5 text-primary" />
                  <span>멤버 수: {club.memberCount}명</span>
                </div>
                {club.region && (
                  <div className="flex items-center gap-3 text-white/80">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>지역: {club.region}</span>
                  </div>
                )}
                {club.stage && (
                  <div className="flex items-center gap-3 text-white/80">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>창업 단계: {club.stage}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Club Rules */}
          <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
            <CardContent className="p-6">
              <h3 className="font-bold text-white text-lg mb-4">클럽 규칙</h3>
              <div className="space-y-3">
                {clubInfo.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-white/80 leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          {/* Join Requests Section (모임장만 볼 수 있음) */}
          {isLeader && joinRequests.length > 0 && (
            <Card className="bg-gradient-to-br from-primary/10 to-[#1A1A1A] border-primary/30 rounded-3xl mb-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-white text-lg">
                      가입 신청 목록
                    </h3>
                    <Badge className="bg-primary/20 text-primary border-0 rounded-xl px-2 py-0.5 text-sm">
                      {joinRequests.length}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  {joinRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-card/50 rounded-2xl p-5 border border-border/30"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar 
                          className="h-14 w-14 border-2 border-primary/30 cursor-pointer hover:border-primary/60 transition-all"
                          onClick={() => handleViewProfile(request)}
                        >
                          <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-lg">
                            {request.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-white text-lg">{request.name}</p>
                            <Badge variant="outline" className="border-primary/50 text-primary rounded-xl px-2 py-0.5 text-xs">
                              {request.stage}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{request.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{request.appliedAt}</span>
                          </div>
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-card-secondary/50 rounded-xl p-3 mb-4">
                          <p className="text-sm text-white/80 leading-relaxed">
                            "{request.message}"
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(request.id, request.name)}
                          className="flex-1 h-11 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          승인
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id, request.name)}
                          variant="outline"
                          className="flex-1 h-11 rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10 font-semibold"
                        >
                          <X className="mr-2 h-4 w-4" />
                          거부
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Club Leader */}
          <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-yellow-400" />
                <h3 className="font-bold text-white text-lg">클럽 리더</h3>
              </div>
              <div className="flex items-center gap-4">
                <Avatar 
                  className="h-16 w-16 border-2 border-yellow-400/50 cursor-pointer hover:border-yellow-400/80 transition-all"
                  onClick={() => handleViewProfile(clubInfo.leader)}
                >
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-lg">
                    {clubInfo.leader.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white text-lg">{clubInfo.leader.name}</p>
                    <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/30 rounded-xl px-2 py-0.5 text-xs border">
                      리더
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{clubInfo.leader.title}</p>
                  <Badge variant="outline" className="border-primary/50 text-primary rounded-xl px-2 py-0.5 text-xs mt-2">
                    {clubInfo.leader.stage}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="rounded-2xl border-border/50"
                  onClick={() => handleViewProfile(clubInfo.leader)}
                >
                  프로필 보기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-lg">
                  멤버 ({clubInfo.members.length})
                </h3>
                {isMember && (
                  <Button variant="outline" size="sm" className="rounded-2xl border-border/50">
                    <UserPlus className="h-4 w-4 mr-2" />
                    초대하기
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {clubInfo.members.map((member, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-4">
                      <Avatar 
                        className="h-12 w-12 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => handleViewProfile(member)}
                      >
                        <AvatarFallback className={`${
                          member.isExpert 
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                            : 'bg-gradient-to-br from-primary to-blue-600'
                        } text-white font-bold`}>
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-white">{member.name}</p>
                          {member.isExpert && (
                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 rounded-xl px-2 py-0.5 text-xs border flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              고수
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.title}</p>
                        <Badge variant="outline" className="border-primary/50 text-primary rounded-xl px-2 py-0.5 text-xs mt-1">
                          {member.stage}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-2xl" onClick={() => handleViewProfile(member)}>
                        프로필 보기
                      </Button>
                    </div>
                    {index < clubInfo.members.length - 1 && (
                      <Separator className="bg-border/30 my-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom CTA for non-members */}
      {!isMember && (
        <div className="sticky bottom-0 md:bottom-4 bg-black/95 backdrop-blur-xl border-t md:border md:rounded-3xl border-primary/30 p-4 -mx-4 md:mx-0">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">함께 성장할 준비가 되셨나요?</p>
              <p className="text-2xl font-bold text-white">
                {club.memberCount}명의 창업가가 활동중
              </p>
            </div>
            <Button 
              className="h-14 px-8 rounded-2xl bg-primary text-white hover:bg-primary/90 text-lg font-bold"
              onClick={() => {
                onJoinToggle(club.id);
                toast.success('🎉 클럽에 가입되었습니다!', {
                  description: '멤버들과 소통을 시작해보세요.',
                });
              }}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              가입하기
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}