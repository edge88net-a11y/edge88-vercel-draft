import { Users, BarChart3, Activity, Database, RefreshCw, TrendingUp, Calendar } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStats, useSystemHealth } from '@/hooks/useAdminData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function StatusDot({ status }: { status: 'healthy' | 'degraded' | 'down' }) {
  return (
    <span
      className={cn(
        'inline-block h-3 w-3 rounded-full',
        status === 'healthy' && 'bg-success shadow-[0_0_8px_hsl(var(--success))]',
        status === 'degraded' && 'bg-warning shadow-[0_0_8px_hsl(var(--warning))]',
        status === 'down' && 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]'
      )}
    />
  );
}

export default function AdminOverview() {
  const { stats, loading } = useAdminStats();
  const { health, checkHealth } = useSystemHealth();

  return (
    <AdminLayout title="Overview" description="System status and key metrics">
      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <BarChart3 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Predictions</p>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.totalPredictions || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Predictions</p>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.todaysPredictions || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Accuracy</p>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.overallAccuracy?.toFixed(1) || 0}%</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            System Health
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkHealth}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          {/* API Status */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <StatusDot status={health.api.status} />
              <div>
                <p className="font-medium">API</p>
                <p className="text-xs text-muted-foreground">api.edge88.net</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-muted-foreground">
                {health.api.latency > 0 ? `${health.api.latency}ms` : '--'}
              </p>
            </div>
          </div>

          {/* Database Status */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <StatusDot status={health.database.status} />
              <div>
                <p className="font-medium">Database</p>
                <p className="text-xs text-muted-foreground">Supabase</p>
              </div>
            </div>
            <Database className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* n8n Status */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <StatusDot status={health.n8n.status} />
              <div>
                <p className="font-medium">n8n Workflows</p>
                <p className="text-xs text-muted-foreground">Automation</p>
              </div>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
