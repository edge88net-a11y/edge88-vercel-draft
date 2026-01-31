import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface ConfidenceLevel {
  label: string;
  total: number;
  wins: number;
  icon: string;
}

interface ConfidenceAccuracyChartProps {
  data: ConfidenceLevel[];
}

export function ConfidenceAccuracyChart({ data }: ConfidenceAccuracyChartProps) {
  const chartData = data.map((level) => ({
    name: level.label,
    icon: level.icon,
    accuracy: level.total > 0 ? (level.wins / level.total) * 100 : 0,
    record: `${level.wins}-${level.total - level.wins}`,
    total: level.total,
  }));

  const getBarColor = (accuracy: number) => {
    if (accuracy >= 70) return 'hsl(var(--success))';
    if (accuracy >= 60) return 'hsl(48 96% 53%)'; // yellow-400
    return 'hsl(25 95% 53%)'; // orange-400
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
        <XAxis
          type="number"
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
          width={75}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number, name: string, props: any) => [
            `${value.toFixed(1)}% (${props.payload.record})`,
            'Accuracy'
          ]}
        />
        <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry.accuracy)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
