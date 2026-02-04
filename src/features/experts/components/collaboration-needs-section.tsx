'use client';

/**
 * Collaboration Needs Section Component
 *
 * Displays the expert's collaboration needs including:
 * - Highlighted card with gradient border
 * - Collaboration needs text
 * - "Looking for" tags if available
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Handshake, MessageSquare, Lightbulb } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import type { ExpertWithProfile } from '../types';

export interface CollaborationNeedsSectionProps {
  /** Expert data with profile information */
  expert: ExpertWithProfile;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Parse collaboration needs text to extract tags/keywords
 * This is a simple heuristic - looks for comma-separated items
 */
function extractTags(text: string | null): string[] {
  if (!text) return [];

  // Try to extract comma-separated items as tags
  const lines = text.split('\n').flatMap((line) => line.split(','));
  const tags: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Only consider short items (< 50 chars) as tags
    if (trimmed.length > 0 && trimmed.length < 50 && !trimmed.includes('.')) {
      tags.push(trimmed);
    }
  }

  return tags.slice(0, 6); // Limit to 6 tags
}

/**
 * Collaboration Needs Section Component
 */
export function CollaborationNeedsSection({
  expert,
  className,
}: CollaborationNeedsSectionProps) {
  const t = useTranslations('experts.profile.collaborationSection');

  const { collaboration_needs } = expert;

  const hasNeeds = collaboration_needs && collaboration_needs.trim().length > 0;
  const tags = extractTags(collaboration_needs);
  const hasTags = tags.length > 0;

  // If we extracted tags, show the remaining text without the tagged portions
  const displayText = collaboration_needs;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      {/* Gradient border wrapper */}
      <div
        className={cn(
          'relative rounded-3xl p-[1px]',
          'bg-gradient-to-br from-primary/50 via-info/30 to-primary/20',
          className
        )}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-info/10 to-transparent blur-xl opacity-50"
          aria-hidden="true"
        />

        <Card
          variant="elevated"
          padding="none"
          className="relative rounded-[calc(1.5rem-1px)] overflow-hidden"
        >
          {/* Background decoration */}
          <div
            className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 bg-info/5 rounded-full blur-2xl"
            aria-hidden="true"
          />

          <CardHeader className="relative z-10 p-5 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Handshake className="h-5 w-5 text-primary" />
              </motion.div>
              {t('title')}
            </CardTitle>
          </CardHeader>

          <CardContent className="relative z-10 p-5 pt-0 space-y-4">
            {hasNeeds ? (
              <>
                {/* Looking For Tags */}
                {hasTags && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-primary/80 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5" />
                      {t('lookingFor')}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge
                            variant="default"
                            size="md"
                            className="bg-primary/15 text-primary border-primary/30"
                          >
                            {tag}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Description */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-muted mt-0.5 shrink-0" />
                    <p className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">
                      {displayText}
                    </p>
                  </div>
                </div>

                {/* Contact CTA hint */}
                <p className="text-xs text-muted/70 italic pt-2">
                  {t('contactToDiscuss')}
                </p>
              </>
            ) : (
              <div className="py-4 text-center">
                <Handshake className="h-10 w-10 text-muted/30 mx-auto mb-2" />
                <p className="text-sm text-muted italic">{t('noNeeds')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default CollaborationNeedsSection;
