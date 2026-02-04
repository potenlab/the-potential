'use client';

/**
 * Experience Section Component
 *
 * Displays the expert's experience and education including:
 * - Timeline component with icons
 * - Work experience history
 * - Education history
 * - Animated reveal on scroll
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Building2,
  Calendar,
  MapPin,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

import type { ExpertWithProfile } from '../types';

export interface ExperienceSectionProps {
  /** Expert data with profile information */
  expert: ExpertWithProfile;
  /** Work experience items (optional - can be passed from profile extension) */
  workExperience?: WorkExperienceItem[];
  /** Education items (optional - can be passed from profile extension) */
  education?: EducationItem[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Work experience item interface
 */
export interface WorkExperienceItem {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string; // null/undefined means current
  description?: string;
  isCurrent?: boolean;
}

/**
 * Education item interface
 */
export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

/**
 * Timeline Item Component
 */
function TimelineItem({
  icon: Icon,
  title,
  subtitle,
  location,
  dateRange,
  description,
  isCurrent,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  location?: string;
  dateRange: string;
  description?: string;
  isCurrent?: boolean;
  index: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative pl-8 pb-6 last:pb-0"
    >
      {/* Timeline line */}
      <div
        className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-gradient-to-b from-primary/40 to-transparent last:hidden"
        aria-hidden="true"
      />

      {/* Timeline dot with icon */}
      <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 border-2 border-primary">
        <Icon className="h-3 w-3 text-primary" />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        {/* Title and Current Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold text-white">{title}</h4>
          {isCurrent && (
            <Badge variant="success" size="sm">
              Current
            </Badge>
          )}
        </div>

        {/* Subtitle (company/institution) */}
        <div className="flex items-center gap-1.5 text-sm text-white/70">
          <Building2 className="h-3.5 w-3.5" />
          <span>{subtitle}</span>
        </div>

        {/* Location and Date */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {dateRange}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-white/60 mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Experience Section Component
 */
export function ExperienceSection({
  expert,
  workExperience = [],
  education = [],
  className,
}: ExperienceSectionProps) {
  const t = useTranslations('experts.profile.experienceSection');

  // Generate demo data based on expert info if none provided
  const displayWorkExperience: WorkExperienceItem[] =
    workExperience.length > 0
      ? workExperience
      : expert.experience_years
        ? [
            {
              id: '1',
              company: expert.business_name || expert.profile.company_name || 'Company',
              position: expert.category
                ? `${expert.category.charAt(0).toUpperCase() + expert.category.slice(1)} Expert`
                : 'Expert',
              startDate: new Date(
                new Date().getFullYear() - (expert.experience_years || 0),
                0
              ).toISOString(),
              isCurrent: true,
              description: expert.service_description || undefined,
            },
          ]
        : [];

  const hasWorkExperience = displayWorkExperience.length > 0;
  const hasEducation = education.length > 0;
  const hasContent = hasWorkExperience || hasEducation;

  /**
   * Format date range for display
   */
  const formatDateRange = (
    startDate: string,
    endDate?: string,
    isCurrent?: boolean
  ): string => {
    const start = new Date(startDate);
    const startYear = start.getFullYear();

    if (isCurrent || !endDate) {
      return `${startYear} - ${t('present')}`;
    }

    const end = new Date(endDate);
    const endYear = end.getFullYear();
    return `${startYear} - ${endYear}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card variant="default" padding="md" className={cn('', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            {t('title')}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {hasContent ? (
            <Accordion
              type="multiple"
              defaultValue={['work', 'education']}
              className="space-y-4"
            >
              {/* Work Experience Section */}
              {hasWorkExperience && (
                <AccordionItem value="work" className="border-white/10">
                  <AccordionTrigger className="text-white hover:no-underline py-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Briefcase className="h-4 w-4 text-primary/70" />
                      {t('workExperience')}
                      <Badge variant="muted" size="sm">
                        {displayWorkExperience.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-0">
                      {displayWorkExperience.map((item, index) => (
                        <TimelineItem
                          key={item.id}
                          icon={Briefcase}
                          title={item.position}
                          subtitle={item.company}
                          location={item.location}
                          dateRange={formatDateRange(
                            item.startDate,
                            item.endDate,
                            item.isCurrent
                          )}
                          description={item.description}
                          isCurrent={item.isCurrent}
                          index={index}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Education Section */}
              {hasEducation && (
                <AccordionItem value="education" className="border-white/10">
                  <AccordionTrigger className="text-white hover:no-underline py-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <GraduationCap className="h-4 w-4 text-primary/70" />
                      {t('education')}
                      <Badge variant="muted" size="sm">
                        {education.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-0">
                      {education.map((item, index) => (
                        <TimelineItem
                          key={item.id}
                          icon={GraduationCap}
                          title={item.degree}
                          subtitle={item.institution}
                          dateRange={formatDateRange(
                            item.startDate,
                            item.endDate
                          )}
                          description={
                            item.field
                              ? `${item.field}${item.description ? ` - ${item.description}` : ''}`
                              : item.description
                          }
                          index={index}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          ) : (
            <div className="py-8 text-center">
              <Briefcase className="h-10 w-10 text-muted/30 mx-auto mb-2" />
              <p className="text-sm text-muted italic">{t('noExperience')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ExperienceSection;
