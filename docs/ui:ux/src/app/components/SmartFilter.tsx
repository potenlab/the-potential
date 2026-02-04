import { useState } from 'react';
import { Filter, X, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export function SmartFilter() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filterCategories = [
    {
      title: '지원 대상',
      options: [
        { id: 'early', label: '초기 창업자 (3년 이내)', count: 45 },
        { id: 'pre', label: '예비 창업자', count: 23 },
        { id: 'serial', label: '시리얼 창업가', count: 12 },
        { id: 'youth', label: '청년 창업가 (39세 이하)', count: 38 },
      ],
    },
    {
      title: '지원 분야',
      options: [
        { id: 'ict', label: 'ICT / AI', count: 52 },
        { id: 'bio', label: '바이오 / 헬스케어', count: 18 },
        { id: 'fintech', label: '핀테크', count: 15 },
        { id: 'ecommerce', label: '이커머스', count: 24 },
        { id: 'saas', label: 'SaaS', count: 31 },
      ],
    },
    {
      title: '지원금 규모',
      options: [
        { id: 'under50', label: '5천만원 이하', count: 28 },
        { id: '50to100', label: '5천만원 ~ 1억원', count: 34 },
        { id: '100to300', label: '1억원 ~ 3억원', count: 18 },
        { id: 'over300', label: '3억원 이상', count: 8 },
      ],
    },
    {
      title: '마감일',
      options: [
        { id: 'week', label: '1주일 이내', count: 12 },
        { id: 'month', label: '1개월 이내', count: 34 },
        { id: 'quarter', label: '3개월 이내', count: 52 },
      ],
    },
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const applyFilters = () => {
    // TODO: Apply filters logic
    setIsOpen(false);
  };

  return (
    <>
      {/* Filter Trigger Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-11 px-4 rounded-2xl border-border hover:bg-card text-white font-semibold relative"
          >
            <Filter className="mr-2 h-4 w-4" />
            필터
            {selectedFilters.length > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-white border-0 text-xs">
                {selectedFilters.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-card border-border/50 rounded-3xl max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Filter className="h-6 w-6 text-primary" />
              스마트 필터
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              나에게 꼭 맞는 지원사업만 골라보세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {filterCategories.map((category, catIdx) => (
              <div key={catIdx}>
                <h3 className="font-bold text-white mb-3 text-sm">{category.title}</h3>
                <div className="space-y-2">
                  {category.options.map((option) => {
                    const isSelected = selectedFilters.includes(option.id);
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => toggleFilter(option.id)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary/40'
                            : 'bg-card-secondary/50 border-border/30 hover:border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                          </div>
                          <span
                            className={`font-semibold text-sm ${
                              isSelected ? 'text-white' : 'text-muted-foreground'
                            }`}
                          >
                            {option.label}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            isSelected
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : 'bg-muted/20 text-muted-foreground border-muted'
                          } rounded-xl text-xs`}
                        >
                          {option.count}
                        </Badge>
                      </motion.button>
                    );
                  })}
                </div>
                {catIdx < filterCategories.length - 1 && (
                  <Separator className="my-6 bg-border/50" />
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 sticky bottom-0 bg-card pb-2">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex-1 h-12 rounded-2xl border-border hover:bg-card-secondary"
            >
              초기화
            </Button>
            <Button
              onClick={applyFilters}
              className="flex-1 h-12 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90"
            >
              {selectedFilters.length > 0
                ? `${selectedFilters.length}개 필터 적용`
                : '필터 적용'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Filters Display */}
      {selectedFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filterCategories.map((category) =>
            category.options
              .filter((opt) => selectedFilters.includes(opt.id))
              .map((opt) => (
                <Badge
                  key={opt.id}
                  className="bg-primary/10 text-primary border-primary/30 rounded-xl px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-primary/20"
                  onClick={() => toggleFilter(opt.id)}
                >
                  {opt.label}
                  <X className="h-3 w-3" />
                </Badge>
              ))
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-3 rounded-xl text-xs text-muted-foreground hover:text-white"
          >
            전체 해제
          </Button>
        </div>
      )}
    </>
  );
}
