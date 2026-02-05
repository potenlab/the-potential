'use client';

/**
 * Collaborations Tab Component
 *
 * Displays collaboration requests received by expert users:
 * - Pending: requests awaiting response with Accept/Decline actions
 * - All: all requests regardless of status
 *
 * Includes loading skeletons, empty states, and toast feedback.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import {
  Coffee,
  Handshake,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';

import {
  useReceivedCollaborationRequests,
  profileQueryKeys,
} from '../api/queries';
import type { ReceivedCollaborationRequest } from '../api/queries';
import { useRespondToCollaboration } from '@/features/experts/api/queries';
import { useQueryClient } from '@tanstack/react-query';

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

function timeAgo(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

// ============================================================================
// SKELETON
// ============================================================================

function CollaborationItemSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" rounded="md" />
          <Skeleton className="h-3 w-24" rounded="md" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-48" rounded="md" />
      <Skeleton className="h-4 w-full" rounded="md" />
      <Skeleton className="h-3 w-20" rounded="md" />
    </div>
  );
}

function CollaborationListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CollaborationItemSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// STATUS BADGE
// ============================================================================

function StatusBadge({
  status,
  t,
}: {
  status: ReceivedCollaborationRequest['status'];
  t: ReturnType<typeof useTranslations<'profile'>>;
}) {
  const config: Record<
    ReceivedCollaborationRequest['status'],
    { variant: 'warning' | 'success' | 'error' | 'muted'; icon: React.ElementType; label: string }
  > = {
    pending: {
      variant: 'warning',
      icon: Clock,
      label: t('collaborationsTab.pendingStatus'),
    },
    accepted: {
      variant: 'success',
      icon: CheckCircle,
      label: t('collaborationsTab.accepted'),
    },
    declined: {
      variant: 'error',
      icon: XCircle,
      label: t('collaborationsTab.declined'),
    },
    cancelled: {
      variant: 'muted',
      icon: Ban,
      label: t('collaborationsTab.cancelled'),
    },
  };

  const { variant, icon: Icon, label } = config[status];

  return (
    <Badge variant={variant} size="sm" className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// ============================================================================
// TYPE BADGE
// ============================================================================

function TypeBadge({
  type,
  t,
}: {
  type: 'coffee_chat' | 'collaboration';
  t: ReturnType<typeof useTranslations<'profile'>>;
}) {
  if (type === 'coffee_chat') {
    return (
      <Badge variant="default" size="sm" className="gap-1">
        <Coffee className="h-3 w-3" />
        {t('collaborationsTab.coffeeChat')}
      </Badge>
    );
  }
  return (
    <Badge variant="default" size="sm" className="gap-1">
      <Handshake className="h-3 w-3" />
      {t('collaborationsTab.collaboration')}
    </Badge>
  );
}

// ============================================================================
// COLLABORATION REQUEST ITEM
// ============================================================================

function CollaborationRequestItem({
  request,
  showActions,
  onAccept,
  onDecline,
  isResponding,
}: {
  request: ReceivedCollaborationRequest;
  showActions: boolean;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  isResponding: boolean;
}) {
  const t = useTranslations('profile');

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
      {/* Header: Sender + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Avatar size="sm">
            {request.sender?.avatar_url ? (
              <AvatarImage
                src={request.sender.avatar_url}
                alt={request.sender.full_name || ''}
              />
            ) : null}
            <AvatarFallback>
              {getInitials(request.sender?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-white truncate">
                {request.sender?.full_name || 'Anonymous'}
              </p>
              {request.sender?.company_name && (
                <span className="text-xs text-muted truncate">
                  {request.sender.company_name}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <TypeBadge type={request.type} t={t} />
              <StatusBadge status={request.status} t={t} />
            </div>
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="mt-3">
        <p className="text-sm font-medium text-white">{request.subject}</p>
      </div>

      {/* Message preview */}
      <p className="mt-1 text-sm text-gray-300 line-clamp-2">
        {truncate(request.message, 200)}
      </p>

      {/* Footer: Time + Actions */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted">
          {t('collaborationsTab.receivedAt')} {timeAgo(request.created_at)}
        </span>

        {showActions && request.status === 'pending' && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDecline(request.id)}
              disabled={isResponding}
              className="text-xs"
            >
              {t('collaborationsTab.decline')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAccept(request.id)}
              disabled={isResponding}
              className="text-xs"
            >
              {t('collaborationsTab.accept')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CollaborationsTabProps {
  userId: string;
  className?: string;
}

export function CollaborationsTab({ userId, className }: CollaborationsTabProps) {
  const t = useTranslations('profile');
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useReceivedCollaborationRequests(userId);
  const respondMutation = useRespondToCollaboration();

  const pendingRequests = React.useMemo(
    () => requests?.filter((r) => r.status === 'pending') ?? [],
    [requests]
  );

  const handleAccept = (requestId: number) => {
    respondMutation.mutate(
      { request_id: requestId, status: 'accepted' },
      {
        onSuccess: () => {
          toast.success(t('collaborationsTab.respondSuccess'));
          queryClient.invalidateQueries({
            queryKey: profileQueryKeys.collaborations(userId),
          });
        },
        onError: () => {
          toast.error(t('collaborationsTab.respondFailed'));
        },
      }
    );
  };

  const handleDecline = (requestId: number) => {
    respondMutation.mutate(
      { request_id: requestId, status: 'declined' },
      {
        onSuccess: () => {
          toast.success(t('collaborationsTab.respondSuccess'));
          queryClient.invalidateQueries({
            queryKey: profileQueryKeys.collaborations(userId),
          });
        },
        onError: () => {
          toast.error(t('collaborationsTab.respondFailed'));
        },
      }
    );
  };

  const pendingCount = pendingRequests.length;
  const allCount = requests?.length ?? 0;

  return (
    <div className={cn('space-y-4', className)}>
      <Tabs defaultValue="pending">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('collaborationsTab.pending')}
            {pendingCount > 0 && (
              <Badge variant="warning" size="sm">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            {t('collaborationsTab.all')}
            {allCount > 0 && (
              <Badge variant="default" size="sm">
                {allCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="mt-4">
          {isLoading ? (
            <CollaborationListSkeleton />
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <CollaborationRequestItem
                  key={request.id}
                  request={request}
                  showActions={true}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  isResponding={respondMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="default"
              icon={Handshake}
              title={t('collaborationsTab.noPendingRequests')}
              description={t('collaborationsTab.noPendingDescription')}
              size="sm"
              bordered
            />
          )}
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all" className="mt-4">
          {isLoading ? (
            <CollaborationListSkeleton />
          ) : requests && requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((request) => (
                <CollaborationRequestItem
                  key={request.id}
                  request={request}
                  showActions={true}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  isResponding={respondMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="default"
              icon={Handshake}
              title={t('collaborationsTab.noRequests')}
              description={t('collaborationsTab.noRequestsDescription')}
              size="sm"
              bordered
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
