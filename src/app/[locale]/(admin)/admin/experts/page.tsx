'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Search,
  Check,
  X,
  MoreHorizontal,
  AlertCircle,
  Eye,
  FileText,
  ExternalLink,
  Download,
  Briefcase,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import {
  useAdminExperts,
  useApproveExpert,
  useRejectExpert,
  getExpertDocumentUrl,
  type AdminExpertProfile,
  type ExpertStatus,
} from '@/features/admin/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

// Status tabs for filtering
const STATUS_TABS: Array<{ key: ExpertStatus | 'all'; labelKey: string }> = [
  { key: 'all', labelKey: 'all' },
  { key: 'pending_review', labelKey: 'pending' },
  { key: 'approved', labelKey: 'verified' },
  { key: 'rejected', labelKey: 'rejected' },
];

/**
 * Expert Verification Page
 *
 * Admin page for managing expert verification workflow with:
 * - Table displaying expert profiles with name, business name, category, status
 * - Status badges (pending_review, approved, rejected)
 * - Approve button that updates status to 'approved'
 * - Reject button that opens dialog for rejection reason
 * - Document viewer dialog to view verification documents
 * - Uses Table, Dialog from @/components/ui/
 * - Labels use translations from useTranslations('admin.experts')
 */
export default function ExpertsVerificationPage() {
  const t = useTranslations('admin.experts');
  const tCommon = useTranslations('common');
  const tCategories = useTranslations('experts.categories');

  // State
  const [activeTab, setActiveTab] = useState<ExpertStatus | 'all'>('pending_review');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<AdminExpertProfile | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // API hooks
  const { data, isLoading, error } = useAdminExperts(
    activeTab === 'all' ? undefined : activeTab
  );

  const approveMutation = useApproveExpert();
  const rejectMutation = useRejectExpert();

  // Filter experts by search query
  const filteredExperts = data?.experts.filter((expert) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      expert.business_name.toLowerCase().includes(query) ||
      expert.profile?.full_name?.toLowerCase().includes(query) ||
      expert.profile?.email.toLowerCase().includes(query) ||
      expert.category.toLowerCase().includes(query)
    );
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: ExpertStatus) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending_review':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'draft':
        return 'muted';
      default:
        return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status: ExpertStatus) => {
    switch (status) {
      case 'approved':
        return t('verified');
      case 'pending_review':
        return t('pending');
      case 'rejected':
        return t('rejected');
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  // Get initials from name
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle verify/approve
  const handleVerify = async () => {
    if (!selectedExpert) return;

    try {
      await approveMutation.mutateAsync({
        expertId: selectedExpert.id,
        userId: selectedExpert.user_id,
      });
      toast.success(t('verifySuccess'));
      setVerifyDialogOpen(false);
      setSelectedExpert(null);
    } catch {
      toast.error(tCommon('error'));
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedExpert || !rejectReason.trim()) return;

    try {
      await rejectMutation.mutateAsync({
        expertId: selectedExpert.id,
        userId: selectedExpert.user_id,
        reason: rejectReason,
      });
      toast.success(t('rejectSuccess'));
      setRejectDialogOpen(false);
      setSelectedExpert(null);
      setRejectReason('');
    } catch {
      toast.error(tCommon('error'));
    }
  };

  // Open verify dialog
  const openVerifyDialog = (expert: AdminExpertProfile) => {
    setSelectedExpert(expert);
    setVerifyDialogOpen(true);
  };

  // Open reject dialog
  const openRejectDialog = (expert: AdminExpertProfile) => {
    setSelectedExpert(expert);
    setRejectDialogOpen(true);
  };

  // Open documents dialog
  const openDocumentsDialog = async (expert: AdminExpertProfile) => {
    setSelectedExpert(expert);
    setDocumentsDialogOpen(true);
    setLoadingDocuments(true);
    setDocumentUrls([]);

    try {
      // Get signed URLs for all verification documents
      const urls = await Promise.all(
        expert.verification_documents.map((doc) => getExpertDocumentUrl(doc))
      );
      setDocumentUrls(urls);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error(tCommon('error'));
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Get file name from path
  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  // Get file extension for icon
  const getFileExtension = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    return ext || '';
  };

  // Check if file is an image
  const isImageFile = (path: string) => {
    const ext = getFileExtension(path);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'transition-all',
                activeTab === tab.key &&
                  'bg-violet-600/20 text-violet-400 border-violet-500/30 hover:bg-violet-600/30'
              )}
            >
              {t(tab.labelKey)}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B95A1]" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Experts Table */}
      <div className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-[#8B95A1] font-semibold">Expert</TableHead>
              <TableHead className="text-[#8B95A1] font-semibold hidden sm:table-cell">
                Business
              </TableHead>
              <TableHead className="text-[#8B95A1] font-semibold hidden md:table-cell">
                Category
              </TableHead>
              <TableHead className="text-[#8B95A1] font-semibold">Status</TableHead>
              <TableHead className="text-[#8B95A1] font-semibold hidden lg:table-cell">
                Submitted
              </TableHead>
              <TableHead className="text-[#8B95A1] font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-[#8B95A1]">
                    <AlertCircle className="h-8 w-8" />
                    <p>{tCommon('error')}</p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                      {tCommon('retry')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredExperts && filteredExperts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-[#8B95A1]">
                    <Briefcase className="h-8 w-8" />
                    <p>{tCommon('noResults')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExperts?.map((expert) => (
                <TableRow key={expert.id} className="border-white/5 hover:bg-white/[0.02]">
                  {/* Expert Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarImage src={expert.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-violet-600/20 text-violet-400 text-xs">
                          {getInitials(expert.profile?.full_name || null)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">
                          {expert.profile?.full_name || 'Unnamed Expert'}
                        </p>
                        <p className="text-xs text-[#8B95A1] truncate">
                          {expert.profile?.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Business Name */}
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-[#8B95A1]">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{expert.business_name}</span>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" size="sm">
                      {tCategories(expert.category)}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(expert.status)} size="sm">
                      {getStatusLabel(expert.status)}
                    </Badge>
                  </TableCell>

                  {/* Submitted Date */}
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-[#8B95A1] text-sm">
                      {expert.submitted_at
                        ? format(new Date(expert.submitted_at), 'MMM d, yyyy')
                        : '-'}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Quick actions for pending_review experts */}
                      {expert.status === 'pending_review' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openVerifyDialog(expert)}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            title={t('verify')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openRejectDialog(expert)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title={t('reject')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* Dropdown for more actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="text-[#8B95A1]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            {t('viewProfile')}
                          </DropdownMenuItem>

                          {expert.verification_documents.length > 0 && (
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => openDocumentsDialog(expert)}
                            >
                              <FileText className="h-4 w-4" />
                              {t('viewDocuments')}
                            </DropdownMenuItem>
                          )}

                          {expert.status === 'pending_review' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-emerald-400 focus:text-emerald-400"
                                onClick={() => openVerifyDialog(expert)}
                              >
                                <Check className="h-4 w-4" />
                                {t('verify')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-red-400 focus:text-red-400"
                                onClick={() => openRejectDialog(expert)}
                              >
                                <X className="h-4 w-4" />
                                {t('reject')}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Verify Confirmation Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('verifyConfirm')}</DialogTitle>
            <DialogDescription className="space-y-2">
              <span className="block">
                {selectedExpert?.profile?.full_name || selectedExpert?.profile?.email}
              </span>
              <span className="block text-violet-400">
                {selectedExpert?.business_name}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setVerifyDialogOpen(false)}
              disabled={approveMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleVerify}
              loading={approveMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {t('verify')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('rejectConfirm')}</DialogTitle>
            <DialogDescription className="space-y-2">
              <span className="block">
                {selectedExpert?.profile?.full_name || selectedExpert?.profile?.email}
              </span>
              <span className="block text-violet-400">
                {selectedExpert?.business_name}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              label={t('rejectReason')}
              placeholder={t('rejectReasonPlaceholder')}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}
              disabled={rejectMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              loading={rejectMutation.isPending}
              disabled={!rejectReason.trim()}
            >
              {t('reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents Viewer Dialog */}
      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('viewDocuments')}</DialogTitle>
            <DialogDescription>
              {selectedExpert?.profile?.full_name} - {selectedExpert?.business_name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {loadingDocuments ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedExpert?.verification_documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#8B95A1]">
                <FileText className="h-12 w-12 mb-4" />
                <p>{tCommon('noData')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedExpert?.verification_documents.map((doc, index) => (
                  <div
                    key={doc}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    {/* Document Preview / Icon */}
                    {isImageFile(doc) && documentUrls[index] ? (
                      <div className="h-16 w-16 rounded overflow-hidden bg-white/10 flex-shrink-0 relative">
                        <Image
                          src={documentUrls[index]}
                          alt={getFileName(doc)}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-8 w-8 text-violet-400" />
                      </div>
                    )}

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{getFileName(doc)}</p>
                      <p className="text-sm text-[#8B95A1] uppercase">
                        {getFileExtension(doc) || 'Unknown'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {documentUrls[index] && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => window.open(documentUrls[index], '_blank')}
                            title="View"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = documentUrls[index];
                              link.download = getFileName(doc);
                              link.click();
                            }}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDocumentsDialogOpen(false)}>
              {tCommon('close')}
            </Button>
            {selectedExpert?.status === 'pending_review' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDocumentsDialogOpen(false);
                    openRejectDialog(selectedExpert);
                  }}
                >
                  {t('reject')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setDocumentsDialogOpen(false);
                    openVerifyDialog(selectedExpert);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {t('verify')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
