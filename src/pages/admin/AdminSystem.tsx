import { useState, useEffect } from 'react';
import { Server, Clock, AlertTriangle, Activity, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useSystemHealth } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SystemInfo {
  lastPredictionTime: string | null;
  totalApiCalls: number;
  errors: { timestamp: string; message: string; type: string }[];
}

export default function AdminSystem() {
  const { health, checkHealth } = useSystemHealth();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function fetchSystemInfo() {
      try {
        // Get last prediction timestamp
        const { data: lastPrediction } = await supabase
          .from('predictions')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get data freshness info
        const { data: freshness } = await supabase
          .from('data_freshness')
          .select('*')
          .order('last_updated', { ascending: false })
          .limit(5);

        // Build error log from freshness data
        const errors = (freshness || [])
          .filter((f) => f.status === 'error')
          .map((f) => ({
            timestamp: f.last_updated || '',
            message: f.error_message || 'Unknown error',
            type: f.data_type || 'system',
          }));

        setSystemInfo({
          lastPredictionTime: lastPrediction?.created_at || null,
          totalApiCalls: 0, // Would need API tracking
          errors,
        });
      } catch (err) {
        console.error('Error fetching system info:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSystemInfo();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkHealth();
    setRefreshing(false);
  };

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  return (
    <AdminLayout title="System Monitor" description="API health and system status">
      {/* Health Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {/* API Health */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">API Server</p>
                <p className="text-xs text-muted-foreground">api.edge88.net</p>
              </div>
            </div>
            {getStatusIcon(health.api.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span
                className={cn(
                  'font-medium capitalize',
                  health.api.status === 'healthy' && 'text-success',
                  health.api.status === 'degraded' && 'text-warning',
                  health.api.status === 'down' && 'text-destructive'
                )}
              >
                {health.api.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Response Time</span>
              <span className="font-mono">
                {health.api.latency > 0 ? `${health.api.latency}ms` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Database Health */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Database</p>
                <p className="text-xs text-muted-foreground">Supabase PostgreSQL</p>
              </div>
            </div>
            {getStatusIcon(health.database.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span
                className={cn(
                  'font-medium capitalize',
                  health.database.status === 'healthy' && 'text-success',
                  health.database.status === 'degraded' && 'text-warning',
                  health.database.status === 'down' && 'text-destructive'
                )}
              >
                {health.database.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Connection</span>
              <span className="font-medium text-success">Active</span>
            </div>
          </div>
        </div>

        {/* n8n Workflows */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">n8n Workflows</p>
                <p className="text-xs text-muted-foreground">Automation</p>
              </div>
            </div>
            {getStatusIcon(health.n8n.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span
                className={cn(
                  'font-medium capitalize',
                  health.n8n.status === 'healthy' && 'text-success',
                  health.n8n.status === 'degraded' && 'text-warning',
                  health.n8n.status === 'down' && 'text-destructive'
                )}
              >
                {health.n8n.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Last Prediction</h3>
          </div>
          {loading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <p className="text-lg font-mono">
              {systemInfo?.lastPredictionTime
                ? format(new Date(systemInfo.lastPredictionTime), 'MMM d, yyyy HH:mm:ss')
                : 'No predictions yet'}
            </p>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <RefreshCw className={cn('h-5 w-5 text-muted-foreground', refreshing && 'animate-spin')} />
              <h3 className="font-semibold">Health Check</h3>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              Refresh
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Auto-refreshes every 30 seconds
          </p>
        </div>
      </div>

      {/* Error Log */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-semibold">Error Log</h3>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : systemInfo?.errors && systemInfo.errors.length > 0 ? (
            <div className="space-y-3">
              {systemInfo.errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4"
                >
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{error.message}</p>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{error.type}</span>
                      <span>
                        {error.timestamp
                          ? format(new Date(error.timestamp), 'MMM d, HH:mm')
                          : 'Unknown time'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="mb-3 h-10 w-10 text-success" />
              <p className="font-medium">No errors recorded</p>
              <p className="text-sm text-muted-foreground">System is running smoothly</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
