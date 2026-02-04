import { useState } from 'react';
import {
  Users,
  Lock,
  MapPin,
  Calendar,
  MessageCircle,
  UserPlus,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Coffee,
  Shield,
  Crown,
  X,
  Send,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Separator } from './ui/separator';

interface PrivateClubDetailProps {
  onClose?: () => void;
}

export function PrivateClubDetail({ onClose }: PrivateClubDetailProps) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  // Mock data
  const club = {
    name: 'AI 스타트업 대표 모임',
    type: 'private',
    category: 'SaaS / AI',
    location: '강남역 인근',
    memberCount: 24,
    maxMembers: 30,
    description:
      'AI/ML 기반 SaaS 제품을 만들고 있는 초기 스타트업 대표들의 프라이빗 모임입니다. 매월 오프라인 밋업을 통해 실질적인 고민을 나누고, 비즈니스 협업 기회를 만들어갑니다.',
    benefits: [
      '월 1회 정기 오프라인 밋업',
      '비공개 쓰레드 & 정보 공유',
      '시리즈 창업가 멘토링',
      '투자자 네트워킹 기회',
    ],
    admin: {
      name: '김운영',
      title: 'AI 플랫폼 대표',
      avatar: '',
    },
    members: [
      { name: '이창업', company: 'AI SaaS', avatar: '' },
      { name: '박대표', company: 'ML 플랫폼', avatar: '' },
      { name: '최파운더', company: '데이터 분석', avatar: '' },
      { name: '정시작', company: 'AI 챗봇', avatar: '' },
    ],
    upcomingMeeting: {
      title: '2월 정기 밋업 - PMF 찾기',
      date: '2025.02.20 (목) 19:00',
      location: '강남역 스타트업 라운지',
      attendees: 18,
      maxAttendees: 25,
    },
    threads: [
      {
        id: 1,
        author: '이창업',
        avatar: '',
        content: '시리즈 A 투자 유치 과정에서 가장 어려웠던 점이 뭐였나요? 저는 지금 밸류에이션 협상이 제일 어렵네요...',
        time: '2시간 전',
        likes: 12,
        comments: 8,
        isPrivate: true,
      },
      {
        id: 2,
        author: '박대표',
        avatar: '',
        content: '다음주 밋업 때 간단한 피칭 연습 해보면 어떨까요? 서로 피드백 주고받으면 좋을 것 같아요',
        time: '5시간 전',
        likes: 24,
        comments: 15,
        isPrivate: true,
      },
    ],
  };

  const handleJoinRequest = () => {
    // TODO: 가입 신청 로직
    setIsJoinModalOpen(false);
    // Toast notification
    alert('가입 신청이 클럽 운영자에게 전달되었습니다!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-32"
    >
      {/* Hero Section - Private Club Badge */}
      <Card className="bg-gradient-to-br from-purple-500/20 via-card to-card-secondary rounded-3xl border-purple-500/40 glow-effect overflow-hidden relative">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />

        <CardContent className="p-8 relative">
          {/* Private Badge */}
          <div className="flex items-start justify-between mb-6">
            <Badge className="bg-purple-500 text-white border-0 px-4 py-2 rounded-2xl text-sm font-extrabold flex items-center gap-2">
              <Lock className="h-4 w-4" />
              PRIVATE CLUB
            </Badge>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-2xl hover:bg-card-secondary"
              >
                <X className="h-5 w-5 text-white" />
              </Button>
            )}
          </div>

          {/* Title & Category */}
          <h1 className="text-4xl font-extrabold text-white mb-2">{club.name}</h1>
          <p className="text-lg text-purple-400 font-bold mb-8">{club.category}</p>

          {/* Description */}
          <p className="text-foreground/90 leading-relaxed mb-8 bg-card-secondary/50 rounded-2xl p-6">
            {club.description}
          </p>

          {/* Club Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card-secondary/70 rounded-2xl p-5 text-center">
              <Users className="h-7 w-7 text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">멤버</p>
              <p className="text-xl font-extrabold text-white">
                {club.memberCount}/{club.maxMembers}
              </p>
            </div>
            <div className="bg-card-secondary/70 rounded-2xl p-5 text-center">
              <MapPin className="h-7 w-7 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">위치</p>
              <p className="text-sm font-bold text-white">{club.location}</p>
            </div>
            <div className="bg-card-secondary/70 rounded-2xl p-5 text-center">
              <Shield className="h-7 w-7 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">등급</p>
              <p className="text-sm font-bold text-white">프리미엄</p>
            </div>
          </div>

          {/* Club Admin */}
          <div className="mt-6 pt-6 border-t border-border/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-purple-400">
                <AvatarImage src={club.admin.avatar} alt={club.admin.name} />
                <AvatarFallback className="bg-purple-400/20 text-purple-400 font-bold">
                  {club.admin.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white">{club.admin.name}</p>
                  <Crown className="h-4 w-4 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground">{club.admin.title} · 클럽 운영자</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Club Benefits */}
      <Card className="bg-card rounded-3xl border-border/50">
        <CardContent className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-extrabold text-white">클럽 혜택</h2>
          </div>

          <div className="space-y-3">
            {club.benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-4 p-5 bg-card-secondary/50 rounded-2xl"
              >
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="font-semibold text-white">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Meeting */}
      <Card className="bg-gradient-to-br from-primary/10 via-card to-card rounded-3xl border-primary/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-extrabold text-white">다가오는 모임</h2>
          </div>

          <div className="bg-card-secondary/70 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">{club.upcomingMeeting.title}</h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-white font-semibold">{club.upcomingMeeting.date}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <span className="text-white font-semibold">{club.upcomingMeeting.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-5 w-5 text-orange-400" />
                <span className="text-white font-semibold">
                  {club.upcomingMeeting.attendees}/{club.upcomingMeeting.maxAttendees}명 참여 예정
                </span>
              </div>
            </div>

            {/* Participation Vote */}
            <div className="bg-card/70 rounded-2xl p-5">
              <p className="text-sm font-semibold text-white mb-4">참여 의사를 밝혀주세요</p>
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-12 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  참여할게요
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-border hover:bg-card-secondary text-white font-bold"
                >
                  다음에 참여
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                💡 참여 의사를 밝히면 일정이 자동으로 캘린더에 추가돼요
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Private Threads */}
      <Card className="bg-card rounded-3xl border-border/50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-extrabold text-white">비밀 쓰레드</h2>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30 rounded-xl px-3 py-1">
              멤버 전용
            </Badge>
          </div>

          <div className="space-y-4">
            {club.threads.map((thread, idx) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card-secondary/50 rounded-2xl p-6 border border-border/30 hover:border-primary/30 transition-all"
              >
                {/* Author */}
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={thread.avatar} alt={thread.author} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                      {thread.author[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{thread.author}</p>
                      <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs px-2 py-0.5">
                        멤버
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{thread.time}</p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-foreground/90 leading-relaxed mb-4">{thread.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{thread.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span>{thread.comments}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {!isJoined && (
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-500/10 to-primary/10 rounded-2xl border border-purple-500/20 text-center">
              <Lock className="h-12 w-12 text-purple-400 mx-auto mb-3" />
              <p className="text-white font-bold mb-2">멤버 전용 콘텐츠입니다</p>
              <p className="text-sm text-muted-foreground">
                클럽에 가입하면 모든 비밀 쓰레드를 볼 수 있어요
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members */}
      <Card className="bg-card rounded-3xl border-border/50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-extrabold text-white">클럽 멤버</h2>
            </div>
            <span className="text-sm font-bold text-primary">{club.memberCount}명</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {club.members.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-4 bg-card-secondary/50 rounded-2xl"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {member.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-white text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fixed Bottom CTA */}
      {!isJoined && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-8 pb-8 bg-gradient-to-t from-black via-black/95 to-transparent pt-8">
          <div className="max-w-7xl mx-auto">
            <Button
              onClick={() => setIsJoinModalOpen(true)}
              className="w-full h-14 rounded-2xl bg-purple-500 text-white font-bold hover:bg-purple-600 glow-effect"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              클럽 가입 신청하기
            </Button>
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="bg-card border-border/50 rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-purple-400" />
              클럽 가입 신청
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {club.admin.name} 운영자에게 내 프로필과 함께 가입 메시지가 전달됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-5 bg-card-secondary/50 rounded-2xl">
              <p className="text-sm font-semibold text-white mb-2">내 프로필</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-white font-bold">김</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-white">김창업</p>
                  <p className="text-xs text-muted-foreground">AI 스타트업 대표</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block text-sm">
                가입 메시지 (선택)
              </label>
              <Textarea
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="클럽에 가입하고 싶은 이유나 간단한 자기소개를 작성해주세요"
                rows={5}
                className="rounded-2xl bg-input-background border-border text-white resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsJoinModalOpen(false)}
                className="flex-1 h-12 rounded-2xl border-border hover:bg-card-secondary"
              >
                취소
              </Button>
              <Button
                onClick={handleJoinRequest}
                className="flex-1 h-12 rounded-2xl bg-purple-500 text-white font-bold hover:bg-purple-600"
              >
                <Send className="mr-2 h-4 w-4" />
                신청하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
