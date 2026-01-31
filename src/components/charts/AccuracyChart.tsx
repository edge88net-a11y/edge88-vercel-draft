import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DailyAccuracy } from '@/hooks/usePredictions';

interface AccuracyChartProps {
  data: DailyAccuracy[];
}

export function AccuracyChart({ data }: AccuracyChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[40, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
        />
        <Area
          type="monotone"
          dataKey="accuracy"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#accuracyGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
