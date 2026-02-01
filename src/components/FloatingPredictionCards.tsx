import { getSportEmoji } from '@/lib/sportEmoji';

interface FloatingCard {
  id: number;
  team: string;
  confidence: number;
  isWin: boolean;
  sport: string;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

const FLOATING_CARDS: FloatingCard[] = [
  { id: 1, team: 'Tampa Bay', confidence: 72, isWin: true, sport: 'NHL', x: 5, y: 15, delay: 0, duration: 20 },
  { id: 2, team: 'Lakers', confidence: 68, isWin: true, sport: 'NBA', x: 85, y: 25, delay: 2, duration: 18 },
  { id: 3, team: 'Chiefs', confidence: 75, isWin: true, sport: 'NFL', x: 10, y: 65, delay: 4, duration: 22 },
  { id: 4, team: 'Man City', confidence: 64, isWin: true, sport: 'Soccer', x: 80, y: 70, delay: 1, duration: 19 },
  { id: 5, team: 'Yankees', confidence: 59, isWin: false, sport: 'MLB', x: 15, y: 40, delay: 3, duration: 21 },
  { id: 6, team: 'Oilers', confidence: 71, isWin: true, sport: 'NHL', x: 75, y: 45, delay: 5, duration: 17 },
];

export function FloatingPredictionCards() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {FLOATING_CARDS.map((card) => (
        <div
          key={card.id}
          className="absolute animate-float-slow"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            animationDelay: `${card.delay}s`,
            animationDuration: `${card.duration}s`,
          }}
        >
          <div 
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg 
              backdrop-blur-sm border 
              ${card.isWin 
                ? 'bg-success/10 border-success/20' 
                : 'bg-destructive/10 border-destructive/20'
              }
              opacity-20 hover:opacity-40 transition-opacity
            `}
          >
            <span className="text-sm">{getSportEmoji(card.sport)}</span>
            <span className={`text-xs font-medium ${card.isWin ? 'text-success' : 'text-destructive'}`}>
              {card.isWin ? '✓' : '✗'}
            </span>
            <span className="text-xs text-muted-foreground">{card.team}</span>
            <span className={`text-xs font-mono font-bold ${card.isWin ? 'text-success' : 'text-destructive'}`}>
              {card.confidence}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
