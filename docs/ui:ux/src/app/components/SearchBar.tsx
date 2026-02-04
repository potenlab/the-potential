import { useState } from 'react';
import { Search, TrendingUp, Clock } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const trendingSearches = ['시드 투자', 'CTO 파트너', '초기창업패키지'];
  const recentSearches = ['AI 스타트업', 'SaaS'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-6">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-full max-w-3xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="관심있는 지원사업, 파트너, 클럽을 검색해보세요"
            className="w-full h-14 pl-12 pr-4 bg-card border-2 border-border rounded-2xl text-white placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Trending Searches */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground font-medium">인기 검색:</span>
          {trendingSearches.map((term) => (
            <Badge
              key={term}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all rounded-xl text-sm px-3 py-1"
              onClick={() => handleTrendingClick(term)}
            >
              {term}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}