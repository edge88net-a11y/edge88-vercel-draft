import { TrendingUp } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAccuracyData } from '@/hooks/useAdminData';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = {
  primary: 'hsl(217, 91%, 60%)',
  success: 'hsl(145, 80%, 42%)',
  warning: 'hsl(45, 100%, 51%)',
  accent: 'hsl(180, 70%, 45%)',
};

export default function AdminAccuracy() {
  const { data, loading } = useAccuracyData();

  return (
    <AdminLayout title="Accuracy Analytics" description="Performance metrics and trends">
      {/* Overall Accuracy Hero */}
      <div className="mb-8 glass-card p-8 text-center">
        <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
          Overall Accuracy
        </p>
        {loading ? (
          <Skeleton className="mx-auto h-24 w-48" />
        ) : (
          <div className="flex items-center justify-center gap-4">
            <span className="text-7xl font-bold text-success font-mono">
              {data?.overall?.toFixed(1) || '0'}%
            </span>
            <TrendingUp className="h-12 w-12 text-success" />
          </div>
        )}
        <p className="mt-4 text-muted-foreground">
          Based on all graded predictions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accuracy by Sport */}
        <div className="glass-card p-6">
          <h3 className="mb-6 text-lg font-semibold">Accuracy by Sport</h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.bySport || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 18%)" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(230, 10%, 50%)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="sport"
                  tick={{ fill: 'hsl(0, 0%, 98%)' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(230, 20%, 10%)',
                    border: '1px solid hsl(230, 15%, 18%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                  {(data?.bySport || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.accuracy >= 70
                          ? COLORS.success
                          : entry.accuracy >= 60
                          ? COLORS.warning
                          : COLORS.primary
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Accuracy Over Time */}
        <div className="glass-card p-6">
          <h3 className="mb-6 text-lg font-semibold">Accuracy Over Time</h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.overTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 18%)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(230, 10%, 50%)', fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fill: 'hsl(230, 10%, 50%)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(230, 20%, 10%)',
                    border: '1px solid hsl(230, 15%, 18%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke={COLORS.accent}
                  strokeWidth={3}
                  dot={{
                    fill: COLORS.accent,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: COLORS.accent,
                    strokeWidth: 2,
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sport Stats Table */}
      <div className="mt-6 glass-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold">Sport Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Sport</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Accuracy</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Total Predictions</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Performance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-2 w-32" /></td>
                  </tr>
                ))
              ) : (
                (data?.bySport || []).map((sport) => (
                  <tr key={sport.sport} className="border-b border-border">
                    <td className="px-6 py-4 font-medium">{sport.sport}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-mono font-bold ${
                          sport.accuracy >= 70
                            ? 'text-success'
                            : sport.accuracy >= 60
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {sport.accuracy.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{sport.total}</td>
                    <td className="px-6 py-4">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${sport.accuracy}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
