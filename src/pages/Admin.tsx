import { useState, useEffect } from 'react';
import { Shield, Users, BarChart3, Settings, Database, Activity, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  activeSubscribers: number;
}

const Admin = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        // Fetch user count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch prediction count
        const { count: predictionCount } = await supabase
          .from('predictions')
          .select('*', { count: 'exact', head: true });

        // Fetch active subscribers
        const { count: subscriberCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        setStats({
          totalUsers: userCount || 0,
          totalPredictions: predictionCount || 0,
          activeSubscribers: subscriberCount || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminStats();
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-destructive/20 to-primary/20">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Logged in as {user?.email}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
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
                    <p className="text-2xl font-bold">{stats?.totalPredictions || 0}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Subscribers</p>
                    <p className="text-2xl font-bold">{stats?.activeSubscribers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                    <Database className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Database Status</p>
                    <p className="text-2xl font-bold text-success">Healthy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="glass-card overflow-hidden">
              <div className="border-b border-border p-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Admin Actions
                </h2>
              </div>
              <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Button variant="outline" className="justify-start gap-2">
                  <Users className="h-4 w-4" />
                  Manage Users
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Database className="h-4 w-4" />
                  Database Tools
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
