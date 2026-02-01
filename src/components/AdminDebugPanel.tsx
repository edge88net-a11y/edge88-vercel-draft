import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Server, Database, Wifi, AlertCircle, Clock, 
  RefreshCw, Trash2, Copy, Bug, Globe, Monitor, 
  ChevronDown, ChevronUp, Zap, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface HealthStatus {
  isHealthy: boolean;
  responseTime: number;
  lastCheck: Date;
  consecutiveSuccess: number;
}

interface CapturedError {
  timestamp: Date;
  message: string;
  page: string;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}

function StatusDot({ isHealthy }: { isHealthy: boolean }) {
  return (
    <span className={cn(
      "relative flex h-3 w-3",
      isHealthy ? "text-success" : "text-destructive"
    )}>
      {isHealthy && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
      )}
      <span className={cn(
        "relative inline-flex rounded-full h-3 w-3",
        isHealthy ? "bg-success" : "bg-destructive"
      )} />
    </span>
  );
}

export function AdminDebugPanel() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Health statuses
  const [apiHealth, setApiHealth] = useState<HealthStatus | null>(null);
  const [n8nHealth, setN8nHealth] = useState<HealthStatus | null>(null);
  const [dbHealth, setDbHealth] = useState<HealthStatus | null>(null);

  // API test results
  const [testResults, setTestResults] = useState<Record<string, { status: number; data?: any; time: number } | null>>({});

  // Error log
  const [capturedErrors, setCapturedErrors] = useState<CapturedError[]>([]);

  // Database stats
  const [dbStats, setDbStats] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  // Uptime calculation
  const formatUptime = (successCount: number) => {
    const minutes = successCount * 0.25; // 15 seconds per check
    if (minutes < 60) return `${Math.floor(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Health check functions
  const checkApiHealth = useCallback(async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('https://api.edge88.net/api/v1/health');
      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;
      
      setApiHealth(prev => ({
        isHealthy,
        responseTime,
        lastCheck: new Date(),
        consecutiveSuccess: isHealthy ? (prev?.consecutiveSuccess || 0) + 1 : 0,
      }));
    } catch {
      setApiHealth(prev => ({
        isHealthy: false,
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        consecutiveSuccess: 0,
      }));
    }
  }, []);

  const checkN8nHealth = useCallback(async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('https://n8n.edge88.net/healthz', { mode: 'no-cors' });
      const responseTime = Date.now() - startTime;
      
      setN8nHealth(prev => ({
        isHealthy: true, // no-cors always succeeds if reachable
        responseTime,
        lastCheck: new Date(),
        consecutiveSuccess: (prev?.consecutiveSuccess || 0) + 1,
      }));
    } catch {
      setN8nHealth(prev => ({
        isHealthy: false,
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        consecutiveSuccess: 0,
      }));
    }
  }, []);

  const checkDbHealth = useCallback(async () => {
    const startTime = Date.now();
    try {
      const { error } = await supabase.from('sports').select('id').limit(1);
      const responseTime = Date.now() - startTime;
      
      setDbHealth(prev => ({
        isHealthy: !error,
        responseTime,
        lastCheck: new Date(),
        consecutiveSuccess: !error ? (prev?.consecutiveSuccess || 0) + 1 : 0,
      }));
    } catch {
      setDbHealth(prev => ({
        isHealthy: false,
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        consecutiveSuccess: 0,
      }));
    }
  }, []);

  // API test functions
  const testEndpoint = async (endpoint: string, key: string) => {
    setTestResults(prev => ({ ...prev, [key]: null }));
    const startTime = Date.now();
    
    try {
      const response = await fetch(`https://api.edge88.net/api/v1${endpoint}`);
      const data = await response.json();
      const time = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        [key]: { status: response.status, data, time },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [key]: { status: 0, time: Date.now() - startTime },
      }));
    }
  };

  // Fetch database stats
  const fetchDbStats = async () => {
    setLoadingStats(true);
    try {
      const tables = ['predictions', 'games', 'event_comments', 'newsletter_subscribers', 'profiles'];
      const results: Record<string, number> = {};

      for (const table of tables) {
        const { count } = await supabase
          .from(table as any)
          .select('*', { count: 'exact', head: true });
        results[table] = count || 0;
      }

      setDbStats(results);
    } catch (error) {
      console.error('Error fetching DB stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Setup error capturing
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setCapturedErrors(prev => [
        { timestamp: new Date(), message: event.message, page: window.location.pathname },
        ...prev.slice(0, 19),
      ]);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setCapturedErrors(prev => [
        { timestamp: new Date(), message: String(event.reason), page: window.location.pathname },
        ...prev.slice(0, 19),
      ]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Setup health checks
  useEffect(() => {
    checkApiHealth();
    checkN8nHealth();
    checkDbHealth();
    fetchDbStats();

    const interval = setInterval(() => {
      checkApiHealth();
      checkN8nHealth();
      checkDbHealth();
    }, 15000);

    return () => clearInterval(interval);
  }, [checkApiHealth, checkN8nHealth, checkDbHealth]);

  // Quick actions
  const clearCacheAndReload = () => {
    queryClient.clear();
    localStorage.clear();
    window.location.reload();
  };

  const forceRefreshPredictions = () => {
    queryClient.invalidateQueries({ queryKey: ['predictions'] });
    toast({ title: 'Predictions cache cleared', description: 'Data will be refetched.' });
  };

  const testCors = async () => {
    console.log('=== CORS Test Started ===');
    try {
      const response = await fetch('https://api.edge88.net/api/v1/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      const data = await response.json();
      console.log('Response data:', data);
      toast({ title: 'CORS Test Passed', description: 'Check console for details.' });
    } catch (error) {
      console.error('CORS error:', error);
      toast({ title: 'CORS Test Failed', description: String(error), variant: 'destructive' });
    }
  };

  const copyDebugInfo = () => {
    const info = {
      timestamp: new Date().toISOString(),
      user: user?.email,
      plan: profile?.subscription_tier,
      language,
      userAgent: navigator.userAgent,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      apiHealth: apiHealth?.isHealthy ? 'UP' : 'DOWN',
      apiLatency: apiHealth?.responseTime,
      n8nHealth: n8nHealth?.isHealthy ? 'UP' : 'DOWN',
      dbHealth: dbHealth?.isHealthy ? 'UP' : 'DOWN',
      dbLatency: dbHealth?.responseTime,
      cacheSize: queryClient.getQueryCache().getAll().length,
      errors: capturedErrors.length,
    };
    
    navigator.clipboard.writeText(JSON.stringify(info, null, 2));
    toast({ title: 'Debug info copied', description: 'Paste it in your support ticket.' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Bug className="h-6 w-6 text-destructive" />
        <div>
          <h2 className="text-xl font-bold">System Debug Panel</h2>
          <p className="text-sm text-muted-foreground">Admin-only diagnostic tools</p>
        </div>
      </div>

      {/* Service Health */}
      <CollapsibleSection
        title="Service Health"
        icon={<Activity className="h-5 w-5 text-primary" />}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <StatusDot isHealthy={apiHealth?.isHealthy || false} />
              <div>
                <span className="font-medium">API</span>
                <span className="ml-2 text-xs text-muted-foreground">api.edge88.net</span>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-mono">{apiHealth?.responseTime || '--'}ms</div>
              {apiHealth?.consecutiveSuccess ? (
                <div className="text-xs text-muted-foreground">
                  Up for {formatUptime(apiHealth.consecutiveSuccess)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <StatusDot isHealthy={n8nHealth?.isHealthy || false} />
              <div>
                <span className="font-medium">n8n</span>
                <span className="ml-2 text-xs text-muted-foreground">n8n.edge88.net</span>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-mono">{n8nHealth?.responseTime || '--'}ms</div>
              {n8nHealth?.consecutiveSuccess ? (
                <div className="text-xs text-muted-foreground">
                  Up for {formatUptime(n8nHealth.consecutiveSuccess)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <StatusDot isHealthy={dbHealth?.isHealthy || false} />
              <div>
                <span className="font-medium">Database</span>
                <span className="ml-2 text-xs text-muted-foreground">Supabase</span>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-mono">{dbHealth?.responseTime || '--'}ms</div>
              {dbHealth?.consecutiveSuccess ? (
                <div className="text-xs text-muted-foreground">
                  Up for {formatUptime(dbHealth.consecutiveSuccess)}
                </div>
              ) : null}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Auto-refreshing every 15 seconds
          </p>
        </div>
      </CollapsibleSection>

      {/* API Explorer */}
      <CollapsibleSection
        title="API Explorer"
        icon={<Server className="h-5 w-5 text-primary" />}
        defaultOpen={false}
      >
        <div className="space-y-3">
          {[
            { key: 'active', label: '/predictions/active', endpoint: '/predictions/active' },
            { key: 'stats', label: '/predictions/stats', endpoint: '/predictions/stats' },
            { key: 'health', label: '/health', endpoint: '/health' },
          ].map(({ key, label, endpoint }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testEndpoint(endpoint, key)}
                className="flex-1"
              >
                Test {label}
              </Button>
              {testResults[key] && (
                <div className="flex items-center gap-2 text-sm">
                  {testResults[key]!.status === 200 ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="font-mono">{testResults[key]!.status}</span>
                  <span className="text-muted-foreground">{testResults[key]!.time}ms</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Error Log */}
      <CollapsibleSection
        title={`Error Log (${capturedErrors.length})`}
        icon={<AlertCircle className="h-5 w-5 text-destructive" />}
        defaultOpen={false}
      >
        <div className="space-y-2">
          {capturedErrors.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No errors captured</p>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCapturedErrors([])}
                className="mb-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear errors
              </Button>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {capturedErrors.map((error, i) => (
                  <div key={i} className="p-2 rounded bg-destructive/10 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">
                        {error.timestamp.toLocaleTimeString()}
                      </span>
                      <span className="text-muted-foreground">{error.page}</span>
                    </div>
                    <p className="text-destructive font-mono break-all">{error.message}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* App Info */}
      <CollapsibleSection
        title="App Info"
        icon={<Monitor className="h-5 w-5 text-primary" />}
        defaultOpen={false}
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Language</span>
            <span className="font-mono">{language}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">User</span>
            <span className="font-mono text-xs">{user?.email}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-mono">{profile?.subscription_tier || 'free'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Cache Size</span>
            <span className="font-mono">{queryClient.getQueryCache().getAll().length} queries</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Screen</span>
            <span className="font-mono">{window.innerWidth}x{window.innerHeight}</span>
          </div>
          <div className="py-1">
            <span className="text-muted-foreground">User Agent</span>
            <p className="font-mono text-xs mt-1 break-all">{navigator.userAgent}</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Quick Actions */}
      <CollapsibleSection
        title="Quick Actions"
        icon={<Zap className="h-5 w-5 text-primary" />}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={clearCacheAndReload} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Clear & Reload
          </Button>
          <Button variant="outline" size="sm" onClick={forceRefreshPredictions} className="gap-2">
            <Zap className="h-4 w-4" />
            Refresh Predictions
          </Button>
          <Button variant="outline" size="sm" onClick={testCors} className="gap-2">
            <Globe className="h-4 w-4" />
            Test CORS
          </Button>
          <Button variant="outline" size="sm" onClick={copyDebugInfo} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy Debug Info
          </Button>
        </div>
      </CollapsibleSection>

      {/* Database Stats */}
      <CollapsibleSection
        title="Database Stats"
        icon={<Database className="h-5 w-5 text-primary" />}
        defaultOpen={false}
      >
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDbStats}
            disabled={loadingStats}
            className="mb-2"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loadingStats && "animate-spin")} />
            Refresh Stats
          </Button>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(dbStats).map(([table, count]) => (
              <div key={table} className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">{table}</span>
                <span className="font-mono font-bold">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
