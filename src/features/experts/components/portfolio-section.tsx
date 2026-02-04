'use client';

/**
 * Portfolio Section Component
 *
 * Displays the expert's portfolio including:
 * - Grid of portfolio items
 * - Thumbnail previews
 * - Links open in new tab
 * - External portfolio URL
 * - Uploaded portfolio files
 *
 * Uses customized UI wrappers from @/components/ui/ and translations.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  Download,
  ArrowUpRight,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { ExpertWithProfile } from '../types';

export interface PortfolioSectionProps {
  /** Expert data with profile information */
  expert: ExpertWithProfile;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get file type icon based on file extension
 */
function getFileIcon(
  filename: string
): React.ComponentType<{ className?: string }> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

  if (imageExtensions.includes(ext)) {
    return ImageIcon;
  }
  return FileText;
}

/**
 * Get file name from URL
 */
function getFileName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('/').pop() || 'file';
  } catch {
    return url.split('/').pop() || 'file';
  }
}

/**
 * Check if URL is an image
 */
function isImageUrl(url: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const ext = url.split('.').pop()?.toLowerCase() || '';
  return imageExtensions.includes(ext);
}

/**
 * Portfolio Link Card Component
 */
function PortfolioLinkCard({
  url,
  index,
}: {
  url: string;
  index: number;
}) {
  const t = useTranslations('experts.profile.portfolioSection');

  // Extract domain for display
  let displayUrl = url;
  try {
    const urlObj = new URL(url);
    displayUrl = urlObj.hostname;
  } catch {
    // Keep original if parsing fails
  }

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        'group flex items-center gap-3 p-4 rounded-2xl',
        'bg-white/[0.03] border border-white/[0.08]',
        'hover:bg-primary/5 hover:border-primary/30',
        'transition-all duration-200'
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        <Link2 className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{displayUrl}</p>
        <p className="text-xs text-muted">{t('externalLink')}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted group-hover:text-primary transition-colors shrink-0" />
    </motion.a>
  );
}

/**
 * Portfolio File Card Component
 */
function PortfolioFileCard({
  fileUrl,
  index,
}: {
  fileUrl: string;
  index: number;
}) {
  const t = useTranslations('experts.profile.portfolioSection');
  const fileName = getFileName(fileUrl);
  const FileIcon = getFileIcon(fileName);
  const isImage = isImageUrl(fileUrl);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'group relative rounded-2xl overflow-hidden',
        'bg-white/[0.03] border border-white/[0.08]',
        'hover:border-primary/30',
        'transition-all duration-200'
      )}
    >
      {/* Thumbnail or Icon */}
      <div className="aspect-[4/3] relative bg-white/[0.02] flex items-center justify-center">
        {isImage ? (
          <img
            src={fileUrl}
            alt={fileName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <FileIcon className="h-12 w-12 text-muted/50" />
        )}

        {/* Hover overlay with action */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            title={t('openLink')}
          >
            <ExternalLink className="h-5 w-5" />
          </a>
          <a
            href={fileUrl}
            download
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            title={t('downloadFile')}
          >
            <Download className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* File name */}
      <div className="p-3">
        <p className="text-sm text-white/80 truncate">{fileName}</p>
      </div>
    </motion.div>
  );
}

/**
 * Portfolio Section Component
 */
export function PortfolioSection({
  expert,
  className,
}: PortfolioSectionProps) {
  const t = useTranslations('experts.profile.portfolioSection');

  const { portfolio_url, portfolio_files } = expert;

  const hasPortfolioUrl = portfolio_url && portfolio_url.trim().length > 0;
  const hasPortfolioFiles = portfolio_files && portfolio_files.length > 0;
  const hasContent = hasPortfolioUrl || hasPortfolioFiles;

  // Determine default tab
  const defaultTab = hasPortfolioUrl ? 'links' : hasPortfolioFiles ? 'files' : 'links';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
    >
      <Card variant="default" padding="md" className={cn('', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="h-5 w-5 text-primary" />
            {t('title')}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {hasContent ? (
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList variant="default" className="mb-4">
                {hasPortfolioUrl && (
                  <TabsTrigger value="links" className="gap-1.5">
                    <Link2 className="h-4 w-4" />
                    {t('links')}
                  </TabsTrigger>
                )}
                {hasPortfolioFiles && (
                  <TabsTrigger value="files" className="gap-1.5">
                    <FileText className="h-4 w-4" />
                    {t('files')}
                    <Badge variant="muted" size="sm">
                      {portfolio_files.length}
                    </Badge>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Links Tab Content */}
              {hasPortfolioUrl && (
                <TabsContent value="links" className="mt-0">
                  <div className="space-y-3">
                    <PortfolioLinkCard url={portfolio_url} index={0} />

                    {/* View Portfolio Button */}
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full mt-4"
                      asChild
                    >
                      <a
                        href={portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        {t('viewProject')}
                      </a>
                    </Button>
                  </div>
                </TabsContent>
              )}

              {/* Files Tab Content */}
              {hasPortfolioFiles && (
                <TabsContent value="files" className="mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {portfolio_files.map((fileUrl, index) => (
                      <PortfolioFileCard
                        key={fileUrl}
                        fileUrl={fileUrl}
                        index={index}
                      />
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <div className="py-8 text-center">
              <FolderOpen className="h-10 w-10 text-muted/30 mx-auto mb-2" />
              <p className="text-sm text-muted italic">{t('noPortfolio')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PortfolioSection;
