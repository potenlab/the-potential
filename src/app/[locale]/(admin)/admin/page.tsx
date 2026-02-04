import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, FileText, Flag } from 'lucide-react';

interface AdminDashboardPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Admin Dashboard Page
 *
 * Shows overview of admin tasks and statistics.
 * This is a placeholder page - task 6.2+ will implement full functionality.
 */
export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminDashboardContent />;
}

function AdminDashboardContent() {
  const t = useTranslations('admin');

  const stats = [
    {
      key: 'pendingApprovals',
      value: '--',
      icon: Users,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
    },
    {
      key: 'newMembers',
      value: '--',
      icon: UserCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      key: 'totalPosts',
      value: '--',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      key: 'activeUsers',
      value: '--',
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
        {stats.map((stat) => {
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
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Placeholder */}
      <Card variant="default" padding="lg">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg font-semibold text-white">
            {t('dashboard.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10">
            <p className="text-sm text-[#8B95A1]">
              Activity data will be displayed here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
