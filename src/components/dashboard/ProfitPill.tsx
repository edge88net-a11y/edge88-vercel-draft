interface ProfitPillProps {
  label: string;
  amount: number | null | undefined;
}

export function ProfitPill({ label, amount }: ProfitPillProps) {
  const isPositive = amount !== null && amount !== undefined && amount >= 0;
  const hasData = amount !== null && amount !== undefined;
  
  const displayAmount = hasData
    ? `${amount >= 0 ? '+' : ''}${Math.abs(amount).toLocaleString('cs-CZ')} Kč`
    : 'Čekáme na výsledky...';

  return (
    <div
      className={`rounded-xl border p-4 text-center transition-all duration-300 hover:scale-[1.02] ${
        !hasData
          ? 'border-border/50 bg-muted/50'
          : isPositive
            ? 'border-success/30 bg-success/10'
            : 'border-destructive/30 bg-destructive/10'
      }`}
    >
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div
        className={`text-lg font-bold font-mono ${
          !hasData ? 'text-muted-foreground' : isPositive ? 'text-success' : 'text-destructive'
        }`}
      >
        {displayAmount} {hasData && (isPositive ? '📈' : '📉')}
      </div>
    </div>
  );
}
