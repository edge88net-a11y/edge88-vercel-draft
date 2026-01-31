import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

interface SportData {
  sport: string;
  accuracy: number;
  roi: number;
}

interface SportPerformanceChartProps {
  data: SportData[];
}

export function SportPerformanceChart({ data }: SportPerformanceChartProps) {
  const getBarColor = (accuracy: number) => {
    if (accuracy >= 65) return 'hsl(var(--success))';
    if (accuracy >= 55) return 'hsl(48 96% 53%)'; // yellow-400
    return 'hsl(25 95% 53%)'; // orange-400
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <XAxis
          type="number"
          domain={[50, 80]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis
          type="category"
          dataKey="sport"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number, name: string) => [
            name === 'accuracy' ? `${value.toFixed(1)}%` : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`,
            name === 'accuracy' ? 'Accuracy' : 'ROI',
          ]}
        />
        <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
