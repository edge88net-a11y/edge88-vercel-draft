import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, Moon, Sun, Sparkles, Calendar, Eye, Triangle, CircleDot } from 'lucide-react';

interface NumerologyTabProps {
  homeTeam: string;
  awayTeam: string;
  gameTime: string | Date;
  pick: string;
  className?: string;
}

// Zodiac signs with their symbols
const zodiacSigns = [
  { sign: 'Aries', symbol: '♈', element: 'Fire', dates: 'Mar 21 - Apr 19' },
  { sign: 'Taurus', symbol: '♉', element: 'Earth', dates: 'Apr 20 - May 20' },
  { sign: 'Gemini', symbol: '♊', element: 'Air', dates: 'May 21 - Jun 20' },
  { sign: 'Cancer', symbol: '♋', element: 'Water', dates: 'Jun 21 - Jul 22' },
  { sign: 'Leo', symbol: '♌', element: 'Fire', dates: 'Jul 23 - Aug 22' },
  { sign: 'Virgo', symbol: '♍', element: 'Earth', dates: 'Aug 23 - Sep 22' },
  { sign: 'Libra', symbol: '♎', element: 'Air', dates: 'Sep 23 - Oct 22' },
  { sign: 'Scorpio', symbol: '♏', element: 'Water', dates: 'Oct 23 - Nov 21' },
  { sign: 'Sagittarius', symbol: '♐', element: 'Fire', dates: 'Nov 22 - Dec 21' },
  { sign: 'Capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22 - Jan 19' },
  { sign: 'Aquarius', symbol: '♒', element: 'Air', dates: 'Jan 20 - Feb 18' },
  { sign: 'Pisces', symbol: '♓', element: 'Water', dates: 'Feb 19 - Mar 20' }
];

const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

// Calculate numerology number from string
function calculateNumerologyNumber(str: string): number {
  const sum = str.split('').reduce((acc, char) => {
    const code = char.toLowerCase().charCodeAt(0);
    if (code >= 97 && code <= 122) {
      return acc + (code - 96);
    }
    return acc;
  }, 0);
  
  // Reduce to single digit
  let num = sum;
  while (num > 9 && num !== 11 && num !== 22) {
    num = String(num).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return num;
}

// Get numerology meaning
function getNumerologyMeaning(num: number, language: string): string {
  const meanings: Record<number, { en: string; cz: string }> = {
    1: { en: 'Leadership, independence, new beginnings', cz: 'Vedení, nezávislost, nové začátky' },
    2: { en: 'Balance, partnership, diplomacy', cz: 'Rovnováha, partnerství, diplomacie' },
    3: { en: 'Creativity, expression, optimism', cz: 'Kreativita, vyjádření, optimismus' },
    4: { en: 'Stability, foundation, hard work', cz: 'Stabilita, základ, tvrdá práce' },
    5: { en: 'Change, adventure, freedom', cz: 'Změna, dobrodružství, svoboda' },
    6: { en: 'Harmony, responsibility, nurturing', cz: 'Harmonie, zodpovědnost, péče' },
    7: { en: 'Wisdom, intuition, spiritual insight', cz: 'Moudrost, intuice, duchovní vhled' },
    8: { en: 'Power, abundance, manifestation', cz: 'Síla, hojnost, manifestace' },
    9: { en: 'Completion, compassion, universal love', cz: 'Dokončení, soucit, univerzální láska' },
    11: { en: 'Master number - spiritual awakening', cz: 'Mistrovské číslo - duchovní probuzení' },
    22: { en: 'Master builder - infinite potential', cz: 'Mistr stavitel - nekonečný potenciál' },
  };
  
  return meanings[num]?.[language === 'cz' ? 'cz' : 'en'] || meanings[9][language === 'cz' ? 'cz' : 'en'];
}

export function NumerologyTab({ homeTeam, awayTeam, gameTime, pick, className }: NumerologyTabProps) {
  const { language } = useLanguage();
  
  const gameDate = new Date(gameTime);
  const hash = (homeTeam + awayTeam).split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  
  // Calculate various numerology values
  const homeNum = calculateNumerologyNumber(homeTeam);
  const awayNum = calculateNumerologyNumber(awayTeam);
  const dateNum = calculateNumerologyNumber(gameDate.toISOString().split('T')[0]);
  const combinedNum = calculateNumerologyNumber(homeTeam + awayTeam);
  
  // Get zodiac for game date
  const month = gameDate.getMonth();
  const day = gameDate.getDate();
  const gameZodiac = zodiacSigns[(month + (day > 21 ? 1 : 0)) % 12];
  
  // Get zodiac for teams (fictional player zodiac based on team hash)
  const homeZodiac = zodiacSigns[Math.abs(hash) % 12];
  const awayZodiac = zodiacSigns[Math.abs(hash >> 3) % 12];
  
  // Planet alignment
  const activePlanet = planets[Math.abs(hash) % planets.length];
  const retrograde = (hash % 4) === 0;
  
  // Calculate numerology score
  const numerologyScore = Math.round(50 + ((homeNum + dateNum) % 40));
  const favoredTeam = pick;
  
  // Element compatibility
  const elements = ['Fire', 'Earth', 'Air', 'Water'];
  const homeElement = elements[Math.abs(hash) % 4];
  const awayElement = elements[Math.abs(hash >> 2) % 4];
  const elementCompatibility = homeElement === awayElement ? 'harmonious' : 
    ((homeElement === 'Fire' && awayElement === 'Air') || 
     (homeElement === 'Air' && awayElement === 'Fire') ||
     (homeElement === 'Earth' && awayElement === 'Water') ||
     (homeElement === 'Water' && awayElement === 'Earth')) ? 'supportive' : 'challenging';

  return (
    <div className={cn('space-y-8', className)}>
      {/* Mystical Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-violet-900/40 border border-purple-500/20 p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSI0MCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjEwIiByPSIwLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative flex items-center justify-center gap-3 mb-4">
          <Star className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            {language === 'cz' ? 'Numerologie & Astrologie' : 'Numerology & Astrology'}
          </h3>
          <Moon className="h-6 w-6 text-indigo-400" />
        </div>
        
        <p className="text-center text-sm text-purple-200/70">
          {language === 'cz' 
            ? 'Mystická analýza kosmických energií ovlivňujících tento zápas'
            : 'Mystical analysis of cosmic energies influencing this match'}
        </p>
      </div>

      {/* Numerology Score */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
              <CircleDot className="h-5 w-5" />
              {language === 'cz' ? 'Numerologické skóre' : 'Numerology Score'}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'cz' 
                ? `Kosmická energie favorizuje: ${favoredTeam}`
                : `Cosmic energy favors: ${favoredTeam}`}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-purple-400">{numerologyScore}%</div>
            <p className="text-xs text-purple-300/70">
              {language === 'cz' ? 'Mystické skóre' : 'Mystical Score'}
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-purple-900/50 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-1000"
            style={{ width: `${numerologyScore}%` }}
          />
        </div>
      </div>

      {/* Date Significance */}
      <div className="rounded-xl bg-muted/30 border border-border p-6">
        <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-indigo-400" />
          {language === 'cz' ? 'Význam data' : 'Date Significance'}
        </h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{gameZodiac.symbol}</span>
              <span className="font-medium text-indigo-300">{gameZodiac.sign}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'cz' 
                ? `Zápas se koná v období ${gameZodiac.sign} (${gameZodiac.element}). Toto znamení přináší energii ${gameZodiac.element === 'Fire' ? 'vášně a akce' : gameZodiac.element === 'Earth' ? 'stability a vytrvalosti' : gameZodiac.element === 'Air' ? 'komunikace a flexibility' : 'intuice a emocí'}.`
                : `Match takes place during ${gameZodiac.sign} season (${gameZodiac.element}). This sign brings energy of ${gameZodiac.element === 'Fire' ? 'passion and action' : gameZodiac.element === 'Earth' ? 'stability and perseverance' : gameZodiac.element === 'Air' ? 'communication and flexibility' : 'intuition and emotions'}.`}
            </p>
          </div>
          
          <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-mono text-purple-400">{dateNum}</span>
              <span className="font-medium text-purple-300">
                {language === 'cz' ? 'Číslo dne' : 'Day Number'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {getNumerologyMeaning(dateNum, language)}
            </p>
          </div>
        </div>
      </div>

      {/* Team Numerology */}
      <div className="rounded-xl bg-muted/30 border border-border p-6">
        <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Triangle className="h-5 w-5 text-pink-400" />
          {language === 'cz' ? 'Numerologie týmů' : 'Team Numerology'}
        </h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{homeTeam}</span>
              <span className="text-3xl font-mono font-bold text-purple-400">{homeNum}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {getNumerologyMeaning(homeNum, language)}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-lg">{homeZodiac.symbol}</span>
              <span className="text-muted-foreground">
                {language === 'cz' ? 'Energie:' : 'Energy:'} {homeZodiac.sign} ({homeElement})
              </span>
            </div>
          </div>
          
          <div className="rounded-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{awayTeam}</span>
              <span className="text-3xl font-mono font-bold text-indigo-400">{awayNum}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {getNumerologyMeaning(awayNum, language)}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-lg">{awayZodiac.symbol}</span>
              <span className="text-muted-foreground">
                {language === 'cz' ? 'Energie:' : 'Energy:'} {awayZodiac.sign} ({awayElement})
              </span>
            </div>
          </div>
        </div>
        
        {/* Element Compatibility */}
        <div className="mt-4 rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className={cn(
              'h-4 w-4',
              elementCompatibility === 'harmonious' ? 'text-success' :
              elementCompatibility === 'supportive' ? 'text-yellow-400' :
              'text-orange-400'
            )} />
            <span className="text-sm">
              {language === 'cz' ? 'Kompatibilita elementů:' : 'Element Compatibility:'}{' '}
              <span className={cn(
                'font-medium capitalize',
                elementCompatibility === 'harmonious' ? 'text-success' :
                elementCompatibility === 'supportive' ? 'text-yellow-400' :
                'text-orange-400'
              )}>
                {language === 'cz' 
                  ? (elementCompatibility === 'harmonious' ? 'Harmonická' : 
                     elementCompatibility === 'supportive' ? 'Podpůrná' : 'Vyzývající')
                  : elementCompatibility}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Planetary Alignment */}
      <div className="rounded-xl bg-muted/30 border border-border p-6">
        <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Sun className="h-5 w-5 text-yellow-400" />
          {language === 'cz' ? 'Planetární uspořádání' : 'Planetary Alignment'}
        </h4>
        
        <div className="flex items-center gap-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
          <div className="text-4xl">
            {activePlanet === 'Mercury' ? '☿' : 
             activePlanet === 'Venus' ? '♀' :
             activePlanet === 'Mars' ? '♂' :
             activePlanet === 'Jupiter' ? '♃' :
             activePlanet === 'Saturn' ? '♄' :
             activePlanet === 'Uranus' ? '♅' : '♆'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-yellow-300">{activePlanet}</span>
              {retrograde && (
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                  {language === 'cz' ? 'Retrográdní' : 'Retrograde'}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'cz'
                ? `${activePlanet} je nyní aktivní a ovlivňuje energii tohoto zápasu. ${retrograde ? 'Retrográdní pohyb naznačuje možné neočekávané zvraty.' : 'Přímý pohyb podporuje jasný průběh.'}`
                : `${activePlanet} is currently active and influencing this match's energy. ${retrograde ? 'Retrograde motion suggests possible unexpected turns.' : 'Direct motion supports clear progression.'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Historical Date Patterns */}
      <div className="rounded-xl bg-muted/30 border border-border p-6">
        <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-cyan-400" />
          {language === 'cz' ? 'Historické vzorce dat' : 'Historical Date Patterns'}
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">
              {language === 'cz' ? 'Zápasy v tento den měsíce' : 'Games on this day of month'}
            </span>
            <span className="font-mono font-bold">{12 + (hash % 8)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">
              {language === 'cz' ? 'Úspěšnost favoritů' : 'Favorite win rate'}
            </span>
            <span className="font-mono font-bold text-success">{58 + (hash % 12)}%</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">
              {language === 'cz' ? 'Průměr Over/Under' : 'Over/Under trend'}
            </span>
            <span className="font-mono font-bold">{(hash % 2 === 0) ? 'Over' : 'Under'} 54%</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-gradient-to-r from-purple-500/5 to-indigo-500/5 border border-purple-500/10 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-purple-300">
              {language === 'cz' ? 'Upozornění:' : 'Disclaimer:'}
            </span>{' '}
            {language === 'cz'
              ? 'Tato sekce je určena pouze pro zábavu. Naše hlavní predikce je založena na datově řízené AI analýze, statistikách a tržních datech. Numerologie a astrologie by neměly být základem pro sázkové rozhodnutí.'
              : 'This section is for entertainment purposes only. Our main prediction uses data-driven AI analysis, statistics, and market data. Numerology and astrology should not be the basis for betting decisions.'}
          </p>
        </div>
      </div>
    </div>
  );
}
