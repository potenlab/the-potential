'use client';

/**
 * Admin Dashboard Page
 *
 * Shows overview of admin tasks and statistics with real data from Supabase.
 * Features:
 * - Stats cards: Pending approvals, new members this month, total posts, active users
 * - Recent activity feed: New signups, new posts, expert applications
 * - Auto-refreshes every 60 seconds
 * - Loading and error states
 */

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, FileText, Flag, UserPlus, PenSquare, Briefcase, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useDashboardStats,
  useRecentActivity,
  type RecentActivityItem,
} from '@/features/admin/api/use-dashboard-stats';

/**
 * Format a timestamp into a relative time string
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get icon and color for activity type
 */
function getActivityIcon(type: RecentActivityItem['type']) {
  switch (type) {
    case 'new_member':
      return { icon: UserPlus, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' };
    case 'new_post':
      return { icon: PenSquare, color: 'text-blue-400', bgColor: 'bg-blue-400/10' };
    case 'expert_application':
      return { icon: Briefcase, color: 'text-amber-400', bgColor: 'bg-amber-400/10' };
    case 'expert_approved':
      return { icon: CheckCircle2, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' };
    case 'expert_rejected':
      return { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-400/10' };
    default:
      return { icon: Flag, color: 'text-violet-400', bgColor: 'bg-violet-400/10' };
  }
}

/**
 * Stats Card Skeleton for loading state
 */
function StatsCardSkeleton() {
  return (
    <Card variant="default" padding="md">
      <CardContent className="p-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 shrink-0" rounded="xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-24" rounded="md" />
            <Skeleton className="h-7 w-16" rounded="md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Activity Item Skeleton for loading state
 */
function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <Skeleton className="h-8 w-8 shrink-0" rounded="lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-32" rounded="md" />
        <Skeleton className="h-3 w-48" rounded="md" />
      </div>
      <Skeleton className="h-3 w-12" rounded="md" />
    </div>
  );
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin');

  // Fetch dashboard stats
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  // Fetch recent activity
  const {
    data: activities,
    isLoading: activitiesLoading,
    isError: activitiesError,
    refetch: refetchActivity,
  } = useRecentActivity();

  const statCards = [
    {
      key: 'pendingApprovals',
      value: stats?.pendingApprovals ?? 0,
      icon: Users,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
    },
    {
      key: 'newMembers',
      value: stats?.newMembers ?? 0,
      icon: UserCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      key: 'totalPosts',
      value: stats?.totalPosts ?? 0,
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      key: 'activeUsers',
      value: stats?.activeUsers ?? 0,
      icon: Flag,
      color: 'text-violet-400',
      bgColor: 'bg-violet-400/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t('dashboard.overview')}
        </h1>
        <p className="mt-1 text-sm text-[#8B95A1]">
          Welcome to the admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : statsError ? (
          <div className="col-span-full">
            <Card variant="default" padding="md">
              <CardContent className="p-0 flex items-center justify-center gap-3">
                <p className="text-sm text-red-400">Failed to load stats</p>
                <Button variant="ghost" size="sm" onClick={() => refetchStats()}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.key} variant="default" padding="md">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}
                    >
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-[#8B95A1]">
                        {t(`dashboard.${stat.key}`)}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Recent Activity */}
      <Card variant="default" padding="lg">
        <CardHeader className="px-0 pt-0 pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            {t('dashboard.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {activitiesLoading ? (
            <div className="divide-y divide-white/[0.06]">
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
            </div>
          ) : activitiesError ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10">
              <p className="text-sm text-red-400">Failed to load recent activity</p>
              <Button variant="ghost" size="sm" onClick={() => refetchActivity()}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : !activities || activities.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10">
              <p className="text-sm text-[#8B95A1]">
                No recent activity
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {activities.map((activity) => {
                const { icon: ActivityIcon, color, bgColor } = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bgColor}`}
                    >
                      <ActivityIcon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {activity.title}
                      </p>
                      <p className="truncate text-xs text-[#8B95A1]">
                        {activity.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[#8B95A1]">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
