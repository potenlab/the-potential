'use client';

/**
 * Expertise Section Component
 *
 * Displays the expert's expertise information including:
 * - Category displayed prominently
 * - Expertise areas as Badge chips
 * - Experience years display
 * - Subcategories and specialties
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Briefcase, Award, Sparkles } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import type { ExpertWithProfile, ExpertCategory } from '../types';

export interface ExpertiseSectionProps {
  /** Expert data with profile information */
  expert: ExpertWithProfile;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get category color for badge
 */
function getCategoryColor(
  category: ExpertCategory
): 'default' | 'info' | 'success' | 'warning' {
  const colorMap: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
    marketing: 'default',
    development: 'info',
    design: 'warning',
    legal: 'success',
    finance: 'success',
    hr: 'warning',
    operations: 'default',
    sales: 'info',
    strategy: 'default',
    branding: 'warning',
    product: 'info',
    growth: 'success',
    data: 'info',
    ai: 'info',
    blockchain: 'warning',
  };
  return colorMap[category] || 'default';
}

/**
 * Container animation variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

/**
 * Item animation variants
 */
const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
};

/**
 * Expertise Section Component
 */
export function ExpertiseSection({
  expert,
  className,
}: ExpertiseSectionProps) {
  const t = useTranslations('experts.profile.expertiseSection');
  const tCategories = useTranslations('experts.categories');

  const {
    category,
    subcategories,
    specialty,
    experience_years,
  } = expert;

  // Combine subcategories and specialty for display
  const allExpertiseAreas = [
    ...(subcategories || []),
    ...(specialty || []),
  ].filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicates

  const hasExpertise = allExpertiseAreas.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card variant="default" padding="md" className={cn('', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('title')}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Category and Experience */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Primary Category */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">{t('category')}:</span>
              <Badge variant={getCategoryColor(category)} size="lg">
                <Award className="h-3.5 w-3.5 mr-1" />
                {tCategories(category)}
              </Badge>
            </div>

            {/* Experience Years */}
            {experience_years !== null && experience_years !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant="muted" size="lg">
                  <Briefcase className="h-3.5 w-3.5 mr-1" />
                  {t('yearsExperience', { years: experience_years })}
                </Badge>
              </div>
            )}
          </div>

          {/* Expertise Areas */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-white/80">
              {t('expertiseAreas')}
            </span>

            {hasExpertise ? (
              <motion.div
                className="flex flex-wrap gap-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {allExpertiseAreas.map((area) => (
                  <motion.div key={area} variants={itemVariants}>
                    <Badge
                      variant="outline"
                      size="md"
                      className="text-white/80 hover:bg-white/5 transition-colors cursor-default"
                    >
                      {area}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-sm text-muted italic">{t('noExpertise')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ExpertiseSection;
