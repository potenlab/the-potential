import { useState } from 'react';
import { Search, Filter, Bookmark, BookmarkCheck, Calendar, DollarSign, Building2, Clock, ExternalLink, LayoutGrid, List, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SmartFilter } from './SmartFilter';
import { SupportProgramDetail, SupportProgram } from './SupportProgramDetail';
import { EmptyState } from './EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// 🎯 빈 배열로 변경
const supportPrograms: SupportProgram[] = [];

export function SupportPrograms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<SupportProgram | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // 🎯 빈 상태 표시
  if (supportPrograms.length === 0) {
    return (
      <div className="max-w-7xl mx-auto min-h-[calc(100vh-200px)] flex items-center justify-center">
        <EmptyState
          icon={TrendingUp}
          title="등록된 지원사업이 없습니다"
          description="맞춤형 정부 지원사업이 곧 업데이트될 예정입니다"
        />
      </div>
    );
  }

  const toggleBookmark = (id: number) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  // 상세 페이지가 열려있으면 상세 페이지 표시
  if (selectedProgram) {
    return (
      <SupportProgramDetail
        program={selectedProgram}
        onBack={() => setSelectedProgram(null)}
        onBookmarkToggle={toggleBookmark}
        isBookmarked={bookmarks.includes(selectedProgram.id)}
      />
    );
  }

  const filteredPrograms = supportPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || program.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const bookmarkedPrograms = filteredPrograms.filter(p => bookmarks.includes(p.id));
  const allPrograms = filteredPrograms;
  const deadlinePrograms = allPrograms.filter(p => p.daysLeft <= 7);

  // Pagination helpers
  const getPaginationButtons = (currentPage: number, totalPages: number) => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  const Pagination = ({ 
    currentPage, 
    setCurrentPage, 
    totalItems 
  }: { 
    currentPage: number; 
    setCurrentPage: (page: number) => void; 
    totalItems: number;
  }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-2xl text-white hover:bg-card disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {getPaginationButtons(currentPage, totalPages).map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="text-muted-foreground px-2">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage(page as number)}
              className={`rounded-2xl min-w-[40px] ${
                currentPage === page
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'text-white hover:bg-card'
              }`}
            >
              {page}
            </Button>
          )
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-2xl text-white hover:bg-card disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  const ProgramCard = ({ program }: { program: typeof supportPrograms[0] }) => (
    <Card 
      className="bg-[#1A1A1A] border-border/40 rounded-3xl hover:border-primary/30 transition-all group cursor-pointer"
      onClick={() => setSelectedProgram(program)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 rounded-xl">
                {program.type}
              </Badge>
              <Badge variant="outline" className="border-border/50 text-muted-foreground rounded-xl">
                {program.category}
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2">
              {program.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {program.organization}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(program.id);
            }}
            className="rounded-2xl hover:bg-primary/10"
          >
            {bookmarks.includes(program.id) ? (
              <BookmarkCheck className="h-5 w-5 text-primary fill-primary" />
            ) : (
              <Bookmark className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {program.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {program.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-muted text-white rounded-xl px-3 py-1">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">지원금액</p>
              <p className="font-bold text-primary text-lg">{program.amount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">마감일</p>
              <p className="font-semibold text-orange-400 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                D-{program.daysLeft}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProgramListItem = ({ program }: { program: typeof supportPrograms[0] }) => (
    <Card 
      className="bg-[#1A1A1A] border-border/40 rounded-3xl hover:border-primary/30 transition-all group cursor-pointer"
      onClick={() => setSelectedProgram(program)}
    >
      <CardContent className="py-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 rounded-xl">
                {program.type}
              </Badge>
              <Badge variant="outline" className="border-border/50 text-muted-foreground rounded-xl">
                {program.category}
              </Badge>
              <div className="flex flex-wrap gap-2">
                {program.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-muted text-white rounded-xl px-2 py-0.5 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2">
              {program.title}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4" />
              {program.organization}
            </p>
            <p className="text-sm text-muted-foreground">
              {program.description}
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">지원금액</p>
              <p className="font-bold text-primary text-lg whitespace-nowrap">{program.amount}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">마감일</p>
              <p className="font-semibold text-orange-400 flex items-center gap-1 whitespace-nowrap">
                <Clock className="h-4 w-4" />
                D-{program.daysLeft}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(program.id);
              }}
              className="rounded-2xl hover:bg-primary/10"
            >
              {bookmarks.includes(program.id) ? (
                <BookmarkCheck className="h-5 w-5 text-primary fill-primary" />
              ) : (
                <Bookmark className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 md:mb-3">지원사업 큐레이션</h2>
        <p className="text-muted-foreground text-base md:text-lg">내게 맞는 정부 및 민간 지원사업을 찾아보세요</p>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border/50 rounded-3xl">
        <CardContent className="pt-8">
          <div className="flex items-center gap-4 mb-4">
            <SmartFilter />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="지원사업 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-[#1A1A1A] border border-border/50 rounded-2xl text-white placeholder:text-muted-foreground hover:border-primary/50 transition-all"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 bg-[#1A1A1A] border border-border/50 rounded-2xl text-white hover:border-primary/50 transition-all">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                <SelectItem value="초기창업">초기창업</SelectItem>
                <SelectItem value="청년창업">청년창업</SelectItem>
                <SelectItem value="글로벌">글로벌</SelectItem>
                <SelectItem value="기술창업">기술창업</SelectItem>
                <SelectItem value="소셜벤처">소셜벤처</SelectItem>
                <SelectItem value="여성창업">여성창업</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-8">
          <TabsList className="bg-card border border-border/50 rounded-2xl p-2 h-auto">
            <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-8 py-3 font-semibold">
              전체 ({allPrograms.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-8 py-3 font-semibold">
              북마크 ({bookmarkedPrograms.length})
            </TabsTrigger>
            <TabsTrigger value="deadline" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-8 py-3 font-semibold">
              마감임박
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-2xl p-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-xl ${
                viewMode === 'grid'
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'text-muted-foreground hover:text-white hover:bg-card'
              }`}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              카드
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-xl ${
                viewMode === 'list'
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'text-muted-foreground hover:text-white hover:bg-card'
              }`}
            >
              <List className="h-4 w-4 mr-2" />
              리스트
            </Button>
          </div>
        </div>

        <TabsContent value="all">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {allPrograms
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {allPrograms
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((program) => (
                  <ProgramListItem key={program.id} program={program} />
                ))}
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={allPrograms.length}
          />
        </TabsContent>

        <TabsContent value="bookmarked">
          {bookmarkedPrograms.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bookmarkedPrograms
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarkedPrograms
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((program) => (
                    <ProgramListItem key={program.id} program={program} />
                  ))}
              </div>
            )
          ) : (
            <Card className="bg-card border-border/50 rounded-3xl">
              <CardContent className="py-16 text-center">
                <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-white font-semibold text-lg mb-2">북마크한 지원사업이 없습니다</p>
                <p className="text-muted-foreground">관심있는 지원사업을 북마크해보세요</p>
              </CardContent>
            </Card>
          )}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={bookmarkedPrograms.length}
          />
        </TabsContent>

        <TabsContent value="deadline">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {deadlinePrograms
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {deadlinePrograms
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((program) => (
                  <ProgramListItem key={program.id} program={program} />
                ))}
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={deadlinePrograms.length}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}