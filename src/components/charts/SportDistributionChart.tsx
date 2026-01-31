import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface SportDistributionData {
  sport: string;
  count: number;
}

interface SportDistributionChartProps {
  data: SportDistributionData[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(48 96% 53%)', // yellow
  'hsl(25 95% 53%)', // orange
  'hsl(280 87% 65%)', // purple
  'hsl(190 95% 39%)', // cyan
];

export function SportDistributionChart({ data }: SportDistributionChartProps) {
  const { t } = useLanguage();
  
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="count"
          animationBegin={0}
          animationDuration={1200}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value: number, name: string) => [
            `${value} (${((value / total) * 100).toFixed(0)}%)`,
            name
          ]}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value: string) => (
            <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>
              {value}
            </span>
          )}
        />
        {/* Center text */}
        <text
          x="50%"
          y="45%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fill: 'hsl(var(--foreground))', fontSize: '24px', fontWeight: 'bold' }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fill: 'hsl(var(--muted-foreground))', fontSize: '11px' }}
        >
          {t.totalPredictions || 'Total'}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
