import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { UserCategory, CATEGORY_INFO, getIdentitySummary } from '../constants/categories';
import { Badge } from './ui/badge';

interface CategoryChipsProps {
  categories: UserCategory[];
  showIdentity?: boolean;  // 정체성 요약 표시 여부
  compact?: boolean;       // 작은 사이즈
  maxDisplay?: number;     // 최대 표시 개수 (나머지는 +N으로)
}

export function CategoryChips({ 
  categories, 
  showIdentity = true, 
  compact = false,
  maxDisplay = 5,
}: CategoryChipsProps) {
  const identitySummary = getIdentitySummary(categories);
  const displayCategories = categories.slice(0, maxDisplay);
  const remainingCount = categories.length - maxDisplay;

  if (categories.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        카테고리 미설정
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 정체성 요약 (2개 이상 선택 시) */}
      {showIdentity && identitySummary && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex"
        >
          <Badge 
            className="bg-gradient-to-r from-primary/20 via-[#00E5FF]/20 to-primary/20 text-white border-primary/30 rounded-2xl px-3 py-1.5 font-bold"
            style={{
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
            }}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xl mr-1.5">{identitySummary.icon}</span>
            {identitySummary.label}
          </Badge>
        </motion.div>
      )}

      {/* 카테고리 칩들 */}
      <div className="flex items-center gap-2 flex-wrap">
        {displayCategories.map((categoryId, index) => {
          const category = CATEGORY_INFO[categoryId];
          
          return (
            <motion.div
              key={categoryId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Badge
                className={`border border-border/50 rounded-xl font-semibold transition-all hover:scale-105 ${
                  compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
                }`}
                style={{
                  backgroundColor: `${category.color}15`,
                  borderColor: `${category.color}40`,
                  color: category.color,
                }}
              >
                <span className={compact ? 'text-sm mr-1' : 'text-base mr-1.5'}>
                  {category.icon}
                </span>
                {category.shortLabel}
              </Badge>
            </motion.div>
          );
        })}

        {/* 남은 개수 표시 */}
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: maxDisplay * 0.05 }}
          >
            <Badge
              className={`bg-card-secondary text-muted-foreground border border-border/30 rounded-xl font-semibold ${
                compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
              }`}
            >
              +{remainingCount}
            </Badge>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// 단일 카테고리 칩 (인라인 표시용)
export function CategoryChip({ 
  category, 
  size = 'md' 
}: { 
  category: UserCategory; 
  size?: 'sm' | 'md' | 'lg';
}) {
  const categoryInfo = CATEGORY_INFO[category];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <Badge
      className={`border border-border/50 rounded-xl font-semibold transition-all hover:scale-105 ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${categoryInfo.color}15`,
        borderColor: `${categoryInfo.color}40`,
        color: categoryInfo.color,
      }}
    >
      <span className={`${iconSizes[size]} mr-1.5`}>
        {categoryInfo.icon}
      </span>
      {categoryInfo.shortLabel}
    </Badge>
  );
}

// 프로필 헤더용 카테고리 표시 (간결 버전)
export function CategoryHeader({ categories }: { categories: UserCategory[] }) {
  if (categories.length === 0) return null;

  const identitySummary = getIdentitySummary(categories);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {identitySummary ? (
        // 정체성 요약만 표시
        <Badge 
          className="bg-gradient-to-r from-primary/20 to-[#00E5FF]/20 text-white border-primary/30 rounded-2xl px-4 py-1.5 font-bold"
          style={{
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
          }}
        >
          <span className="text-xl mr-2">{identitySummary.icon}</span>
          {identitySummary.label}
        </Badge>
      ) : (
        // 단일 카테고리일 경우 그냥 표시
        categories.map((categoryId) => {
          const category = CATEGORY_INFO[categoryId];
          return (
            <Badge
              key={categoryId}
              className="px-4 py-1.5 text-sm rounded-2xl font-bold border"
              style={{
                backgroundColor: `${category.color}20`,
                borderColor: `${category.color}50`,
                color: category.color,
              }}
            >
              <span className="text-lg mr-2">{category.icon}</span>
              {category.label}
            </Badge>
          );
        })
      )}
    </div>
  );
}

// 카테고리 통계 카드 (대시보드용)
export function CategoryStats({ 
  categories,
  totalUsers,
}: { 
  categories: UserCategory[];
  totalUsers: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {categories.map((categoryId) => {
        const category = CATEGORY_INFO[categoryId];
        // 임시 데이터 (실제로는 API에서 가져와야 함)
        const userCount = Math.floor(Math.random() * totalUsers * 0.3);
        const percentage = ((userCount / totalUsers) * 100).toFixed(1);

        return (
          <motion.div
            key={categoryId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            className="bg-card-secondary/50 rounded-2xl p-4 border border-border/30"
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <p className="text-xs text-muted-foreground mb-1">{category.label}</p>
            <p className="text-xl font-bold text-white">{userCount}</p>
            <p className="text-xs text-primary">{percentage}%</p>
          </motion.div>
        );
      })}
    </div>
  );
}
