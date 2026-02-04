import { useState } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Calendar, 
  DollarSign, 
  Building2, 
  MapPin, 
  Clock, 
  ExternalLink,
  FileText,
  Users,
  Target,
  CheckCircle2,
  AlertCircle,
  Share2,
  Download,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export interface SupportProgram {
  id: number;
  title: string;
  organization: string;
  type: string;
  amount: string;
  deadline: string;
  daysLeft: number;
  category: string;
  region: string;
  description: string;
  tags: string[];
  isBookmarked?: boolean;
}

interface SupportProgramDetailProps {
  program: SupportProgram;
  onBack: () => void;
  onBookmarkToggle: (id: number) => void;
  isBookmarked: boolean;
}

export function SupportProgramDetail({ program, onBack, onBookmarkToggle, isBookmarked }: SupportProgramDetailProps) {
  const handleBookmark = () => {
    onBookmarkToggle(program.id);
    toast.success(isBookmarked ? '북마크가 해제되었습니다' : '🔖 지원사업이 북마크되었습니다!', {
      description: isBookmarked ? '' : '마이페이지에서 북마크한 지원사업을 확인할 수 있습니다.',
    });
  };

  const handleShare = () => {
    toast.success('링크가 복사되었습니다!', {
      description: '다른 창업가들과 공유해보세요.',
    });
  };

  const getStatusColor = (daysLeft: number) => {
    if (daysLeft <= 3) return 'text-red-400';
    if (daysLeft <= 7) return 'text-orange-400';
    return 'text-green-400';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '정부지원':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case '지자체':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case '공공기관':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  // Mock 상세 정보
  const detailInfo = {
    purpose: '초기 창업기업의 안정적인 성장을 위한 종합 지원 프로그램으로, 사업화 자금 지원과 함께 전문 멘토링, 교육, 네트워킹 기회를 제공합니다.',
    eligibility: [
      '사업자등록 후 7년 이내 초기 창업기업',
      '대표자가 만 39세 이하 청년 창업자 (가산점)',
      '혁신 기술 기반 또는 새로운 비즈니스 모델 보유',
      '본사가 대한민국 내 소재',
    ],
    support: [
      {
        title: '사업화 자금',
        description: '최대 1억원 (기업당)',
        icon: DollarSign,
      },
      {
        title: '멘토링',
        description: '분야별 전문가 1:1 매칭',
        icon: Users,
      },
      {
        title: '교육 프로그램',
        description: '창업 교육 및 세미나 무료 제공',
        icon: FileText,
      },
      {
        title: '네트워킹',
        description: '투자자/파트너사 연결',
        icon: Target,
      },
    ],
    process: [
      { step: 1, title: '온라인 접수', date: '~ 2026.01.14', status: 'current' },
      { step: 2, title: '서류 심사', date: '2026.01.20 ~ 01.27', status: 'upcoming' },
      { step: 3, title: '발표 심사', date: '2026.02.03 ~ 02.10', status: 'upcoming' },
      { step: 4, title: '최종 선정', date: '2026.02.15', status: 'upcoming' },
    ],
    documents: [
      '사업계획서 (필수)',
      '사업자등록증 사본 (필수)',
      '대표자 신분증 사본 (필수)',
      '재무제표 (해당시)',
      '특허 및 기술 증빙 자료 (해당시)',
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
          <Badge className={`${getTypeColor(program.type)} rounded-xl px-3 py-1 font-semibold border`}>
            {program.type}
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            className="h-12 w-12 rounded-2xl hover:bg-card"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary fill-primary" />
            ) : (
              <Bookmark className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
      </div>

      {/* Title & Organization */}
      <Card className="bg-gradient-to-br from-primary/20 via-[#1A1A1A] to-[#1A1A1A] border-primary/40 rounded-3xl glow-effect">
        <CardContent className="p-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
            {program.title}
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground mb-6">
            <Building2 className="h-5 w-5" />
            <span className="text-lg">{program.organization}</span>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">지원금액</span>
              </div>
              <p className="text-2xl font-bold text-primary">{program.amount}</p>
            </div>

            <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">마감일</span>
              </div>
              <p className="text-xl font-bold text-white mb-1">
                {new Date(program.deadline).toLocaleDateString('ko-KR')}
              </p>
              <p className={`text-sm font-semibold ${getStatusColor(program.daysLeft)}`}>
                D-{program.daysLeft}
              </p>
            </div>

            <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">지역</span>
              </div>
              <p className="text-xl font-bold text-white">{program.region}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            {program.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-muted text-white rounded-xl px-3 py-1">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Button */}
      <Button className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-primary/90 text-lg font-bold">
        지금 바로 신청하기
        <ExternalLink className="ml-2 h-5 w-5" />
      </Button>

      {/* 사업 목적 */}
      <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-extrabold text-white mb-4">사업 목적</h2>
          <p className="text-white/80 leading-relaxed">{detailInfo.purpose}</p>
        </CardContent>
      </Card>

      {/* 지원 대상 */}
      <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-extrabold text-white mb-6">지원 대상</h2>
          <div className="space-y-4">
            {detailInfo.eligibility.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-white/90 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 지원 내용 */}
      <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-extrabold text-white mb-6">지원 내용</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailInfo.support.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-card/50 rounded-2xl p-6 border border-border/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-white text-lg">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 선정 절차 */}
      <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-extrabold text-white mb-6">선정 절차</h2>
          <div className="space-y-6">
            {detailInfo.process.map((item, index) => (
              <div key={index}>
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    item.status === 'current' 
                      ? 'bg-primary text-white' 
                      : 'bg-card text-muted-foreground'
                  }`}>
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-lg">{item.title}</h3>
                      {item.status === 'current' && (
                        <Badge className="bg-primary/10 text-primary border-primary/30 rounded-xl px-3 py-1 font-semibold border">
                          진행중
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
                {index < detailInfo.process.length - 1 && (
                  <div className="ml-5 my-3">
                    <Separator className="bg-border/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 제출 서류 */}
      <Card className="bg-[#1A1A1A] border-border/40 rounded-3xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-extrabold text-white mb-6">제출 서류</h2>
          <div className="space-y-3">
            {detailInfo.documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-card/50 rounded-2xl border border-border/30">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-white/90">{doc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notice */}
      <Card className="bg-orange-500/10 border-orange-500/30 rounded-3xl border">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-orange-400 mb-2">유의사항</h3>
              <ul className="space-y-1 text-sm text-orange-300/90">
                <li>• 허위 서류 제출 시 선정이 취소되며 향후 3년간 지원이 제한됩니다.</li>
                <li>• 중복 지원은 가능하나, 중복 선정 시 하나만 선택해야 합니다.</li>
                <li>• 자세한 내용은 공고문을 반드시 확인하시기 바랍니다.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 md:bottom-4 bg-black/95 backdrop-blur-xl border-t md:border md:rounded-3xl border-primary/30 p-4 -mx-4 md:mx-0">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">마감까지</p>
            <p className={`text-2xl font-bold ${getStatusColor(program.daysLeft)}`}>
              {program.daysLeft}일 남음
            </p>
          </div>
          <Button className="h-14 px-8 rounded-2xl bg-primary text-white hover:bg-primary/90 text-lg font-bold">
            신청하기
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
