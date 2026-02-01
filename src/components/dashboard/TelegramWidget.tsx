import { Link } from 'react-router-dom';
import { MessageCircle, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useActivePredictions } from '@/hooks/usePredictions';
import { getSportEmoji } from '@/lib/sportEmoji';
import { formatDistanceToNow } from 'date-fns';
import { cs, enUS } from 'date-fns/locale';

export function TelegramWidget() {
  const { language } = useLanguage();
  const { data: predictions, isLoading } = useActivePredictions();

  // Get latest 3 predictions to simulate Telegram posts
  const latestPicks = predictions
    ?.filter(p => p.prediction?.pick)
    .sort((a, b) => new Date(b.gameTime).getTime() - new Date(a.gameTime).getTime())
    .slice(0, 3) || [];

  const telegramChannelUrl = 'https://t.me/edge88picks';

  return (
    <div className="glass-card overflow-hidden h-full">
      <div className="border-b border-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-[#0088cc]" />
          <span className="text-sm font-medium">@edge88picks</span>
        </div>
        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
      </div>

      <div className="p-3 space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </>
        ) : latestPicks.length > 0 ? (
          latestPicks.map((pick) => {
            const sportEmoji = getSportEmoji(pick.sport);
            const confidence = typeof pick.confidence === 'number' 
              ? pick.confidence 
              : parseInt(String(pick.confidence)) || 65;
            const odds = pick.prediction?.odds || '1.91';
            const timeAgo = formatDistanceToNow(new Date(pick.gameTime), {
              addSuffix: false,
              locale: language === 'cz' ? cs : enUS,
            });

            return (
              <Link
                key={pick.id}
                to={`/predictions/${pick.id}`}
                className="block p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border-l-2 border-[#0088cc]"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">
                    {sportEmoji} {pick.sport?.toUpperCase() || 'SPORT'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo}</span>
                  </div>
                </div>
                <p className="text-sm font-medium truncate mb-1">
                  {pick.awayTeam} vs {pick.homeTeam}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-primary">🎯 {pick.prediction?.pick}</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-success font-mono">{confidence}%</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="font-mono">{odds}</span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            {language === 'cz' ? 'Žádné nedávné tipy' : 'No recent picks'}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <a href={telegramChannelUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="w-full gap-2 text-[#0088cc] border-[#0088cc]/30 hover:bg-[#0088cc]/10">
            <ExternalLink className="h-3 w-3" />
            {language === 'cz' ? 'Otevřít kanál' : 'Open Channel'}
          </Button>
        </a>
      </div>
    </div>
  );
}
