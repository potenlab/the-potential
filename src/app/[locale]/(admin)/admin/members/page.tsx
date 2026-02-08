'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  Check,
  X,
  MoreHorizontal,
  AlertCircle,
  UserCheck,
  UserX,
  Eye,
  Ban,
  Unlock,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import {
  useMembers,
  useApproveMember,
  useRejectMember,
  useSuspendMember,
  useUnsuspendMember,
  useDeleteMember,
  type PendingMember,
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
import type { Database } from '@/types/database';

type ApprovalStatus = Database['public']['Enums']['approval_status'];

const STATUS_TABS: Array<{ key: ApprovalStatus | 'all'; labelKey: string }> = [
  { key: 'all', labelKey: 'all' },
  { key: 'pending', labelKey: 'pending' },
  { key: 'approved', labelKey: 'approved' },
  { key: 'rejected', labelKey: 'rejected' },
  { key: 'suspended', labelKey: 'suspended' },
];

/**
 * Member Approval List Page
 *
 * Admin page for managing member approvals with:
 * - Table displaying members with name, email, company, created_at
 * - Status badges (pending, approved, rejected, suspended)
 * - Approve button that updates approval_status to 'approved'
 * - Reject button that opens dialog for rejection reason
 * - User notified on status change (via toast for now, full notifications in task 6.5)
 * - Uses Table from @/components/ui/
 * - Labels use translations from useTranslations('admin.members')
 */
export default function MembersPage() {
  const t = useTranslations('admin.members');
  const tCommon = useTranslations('common');

  // State
  const [activeTab, setActiveTab] = useState<ApprovalStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<PendingMember | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // API hooks
  const { data: members, isLoading, error } = useMembers({
    status: activeTab,
    search: searchQuery,
  });

  const approveMutation = useApproveMember();
  const rejectMutation = useRejectMember();
  const suspendMutation = useSuspendMember();
  const unsuspendMutation = useUnsuspendMember();
  const deleteMutation = useDeleteMember();

  // Get status badge variant
  const getStatusBadgeVariant = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'suspended':
        return 'muted';
      default:
        return 'default';
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

  // Handle approve
  const handleApprove = async () => {
    if (!selectedMember) return;

    try {
      await approveMutation.mutateAsync(selectedMember.id);
      toast.success(t('approveSuccess'));
      setApproveDialogOpen(false);
      setSelectedMember(null);
    } catch {
      toast.error(tCommon('error'));
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedMember || !rejectReason.trim()) return;

    try {
      await rejectMutation.mutateAsync({
        memberId: selectedMember.id,
        reason: rejectReason,
      });
      toast.success(t('rejectSuccess'));
      setRejectDialogOpen(false);
      setSelectedMember(null);
      setRejectReason('');
    } catch {
      toast.error(tCommon('error'));
    }
  };

  // Handle suspend
  const handleSuspend = async (member: PendingMember) => {
    try {
      await suspendMutation.mutateAsync(member.id);
      toast.success(t('suspendSuccess'));
    } catch {
      toast.error(tCommon('error'));
    }
  };

  // Handle unsuspend
  const handleUnsuspend = async (member: PendingMember) => {
    try {
      await unsuspendMutation.mutateAsync(member.id);
      toast.success(t('approveSuccess'));
    } catch {
      toast.error(tCommon('error'));
    }
  };

  // Open approve dialog
  const openApproveDialog = (member: PendingMember) => {
    setSelectedMember(member);
    setApproveDialogOpen(true);
  };

  // Open reject dialog
  const openRejectDialog = (member: PendingMember) => {
    setSelectedMember(member);
    setRejectDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (member: PendingMember) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedMember) return;

    try {
      await deleteMutation.mutateAsync(selectedMember.id);
      toast.success(t('deleteSuccess'));
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    } catch {
      toast.error(tCommon('error'));
    }
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

      {/* Members Table */}
      <div className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-[#8B95A1] font-semibold">
                {t('search').replace(t('searchPlaceholder'), 'Member')}
              </TableHead>
              <TableHead className="text-[#8B95A1] font-semibold hidden sm:table-cell">
                Email
              </TableHead>
              <TableHead className="text-[#8B95A1] font-semibold hidden md:table-cell">
                Company
              </TableHead>
              <TableHead className="text-[#8B95A1] font-semibold">Status</TableHead>
              <TableHead className="text-[#8B95A1] font-semibold hidden lg:table-cell">
                Joined
              </TableHead>
              <TableHead className="text-[#8B95A1] font-semibold text-right">
                Actions
              </TableHead>
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
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-28" />
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
            ) : members && members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-[#8B95A1]">
                    <UserCheck className="h-8 w-8" />
                    <p>{tCommon('noResults')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              members?.map((member) => (
                <TableRow key={member.id} className="border-white/5 hover:bg-white/[0.02]">
                  {/* Member Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="bg-violet-600/20 text-violet-400 text-xs">
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">
                          {member.full_name || 'Unnamed User'}
                        </p>
                        <p className="text-xs text-[#8B95A1] truncate sm:hidden">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-[#8B95A1]">{member.email}</span>
                  </TableCell>

                  {/* Company */}
                  <TableCell className="hidden md:table-cell">
                    <span className="text-[#8B95A1]">{member.company_name || '-'}</span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(member.approval_status)} size="sm">
                      {t(member.approval_status)}
                    </Badge>
                  </TableCell>

                  {/* Joined Date */}
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-[#8B95A1] text-sm">
                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Quick actions for pending members */}
                      {member.approval_status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openApproveDialog(member)}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            title={t('approve')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openRejectDialog(member)}
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

                          {member.approval_status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-emerald-400 focus:text-emerald-400"
                                onClick={() => openApproveDialog(member)}
                              >
                                <UserCheck className="h-4 w-4" />
                                {t('approve')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-red-400 focus:text-red-400"
                                onClick={() => openRejectDialog(member)}
                              >
                                <UserX className="h-4 w-4" />
                                {t('reject')}
                              </DropdownMenuItem>
                            </>
                          )}

                          {member.approval_status === 'approved' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-orange-400 focus:text-orange-400"
                                onClick={() => handleSuspend(member)}
                              >
                                <Ban className="h-4 w-4" />
                                {t('suspend')}
                              </DropdownMenuItem>
                            </>
                          )}

                          {member.approval_status === 'suspended' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-emerald-400 focus:text-emerald-400"
                                onClick={() => handleUnsuspend(member)}
                              >
                                <Unlock className="h-4 w-4" />
                                {t('unsuspend')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-red-400 focus:text-red-400"
                                onClick={() => openDeleteDialog(member)}
                              >
                                <Trash2 className="h-4 w-4" />
                                {t('delete')}
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

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('approveConfirm')}</DialogTitle>
            <DialogDescription>
              {selectedMember?.full_name || selectedMember?.email}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={approveMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              loading={approveMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {t('approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('rejectConfirm')}</DialogTitle>
            <DialogDescription>
              {selectedMember?.full_name || selectedMember?.email}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('deleteConfirm')}</DialogTitle>
            <DialogDescription>
              {selectedMember?.full_name || selectedMember?.email}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
