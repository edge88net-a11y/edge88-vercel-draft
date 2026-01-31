import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { DailyAccuracy } from '@/hooks/usePredictions';

interface CalendarHeatmapProps {
  data: DailyAccuracy[];
  days?: number;
}

export function CalendarHeatmap({ data, days = 90 }: CalendarHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Create a map of date -> accuracy
    const dataMap = new Map<string, DailyAccuracy>();
    data.forEach((d) => {
      const dateKey = new Date(d.date).toISOString().split('T')[0];
      dataMap.set(dateKey, d);
    });

    // Generate last N days
    const result: (DailyAccuracy | null)[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      result.push(dataMap.get(dateKey) || null);
    }

    return result;
  }, [data, days]);

  const getColor = (day: DailyAccuracy | null) => {
    if (!day || day.predictions === 0) return 'bg-muted/30';
    
    const accuracy = day.accuracy;
    if (accuracy >= 75) return 'bg-success';
    if (accuracy >= 65) return 'bg-success/70';
    if (accuracy >= 55) return 'bg-yellow-400/70';
    if (accuracy >= 45) return 'bg-orange-400/70';
    return 'bg-destructive/70';
  };

  const getTooltip = (day: DailyAccuracy | null, index: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (!day || day.predictions === 0) {
      return `${dateStr}: No predictions`;
    }
    return `${dateStr}: ${day.accuracy.toFixed(0)}% (${day.wins}W-${day.losses}L)`;
  };

  // Split into weeks for GitHub-style layout
  const weeks: (DailyAccuracy | null)[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => {
              const globalIndex = weekIndex * 7 + dayIndex;
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    'h-4 w-4 rounded-sm transition-all hover:scale-125 cursor-pointer',
                    getColor(day)
                  )}
                  title={getTooltip(day, globalIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Last {days} days</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="h-3 w-3 rounded-sm bg-destructive/70" />
            <div className="h-3 w-3 rounded-sm bg-orange-400/70" />
            <div className="h-3 w-3 rounded-sm bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-sm bg-success/70" />
            <div className="h-3 w-3 rounded-sm bg-success" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
