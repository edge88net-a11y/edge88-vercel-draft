import { useState } from 'react';
import { Sparkles, ChevronDown, Moon, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface MysticalAnalysisProps {
  homeTeam: string;
  awayTeam: string;
  gameDate: Date;
  predictedWinner: string;
  className?: string;
}

// Calculate "life path" number from team name
function getNameNumber(name: string): number {
  const sum = name.split('').reduce((acc, char) => {
    const code = char.toLowerCase().charCodeAt(0) - 96;
    return acc + (code > 0 && code < 27 ? code : 0);
  }, 0);
  return (sum % 9) + 1;
}

// Get zodiac sign based on date
function getZodiacSign(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  const signs = [
    { name: 'Capricorn', emoji: '♑', start: [12, 22], end: [1, 19] },
    { name: 'Aquarius', emoji: '♒', start: [1, 20], end: [2, 18] },
    { name: 'Pisces', emoji: '♓', start: [2, 19], end: [3, 20] },
    { name: 'Aries', emoji: '♈', start: [3, 21], end: [4, 19] },
    { name: 'Taurus', emoji: '♉', start: [4, 20], end: [5, 20] },
    { name: 'Gemini', emoji: '♊', start: [5, 21], end: [6, 20] },
    { name: 'Cancer', emoji: '♋', start: [6, 21], end: [7, 22] },
    { name: 'Leo', emoji: '♌', start: [7, 23], end: [8, 22] },
    { name: 'Virgo', emoji: '♍', start: [8, 23], end: [9, 22] },
    { name: 'Libra', emoji: '♎', start: [9, 23], end: [10, 22] },
    { name: 'Scorpio', emoji: '♏', start: [10, 23], end: [11, 21] },
    { name: 'Sagittarius', emoji: '♐', start: [11, 22], end: [12, 21] },
  ];
  
  for (const sign of signs) {
    if (sign.name === 'Capricorn') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return sign.emoji + ' ' + sign.name;
      }
    } else {
      const [sm, sd] = sign.start;
      const [em, ed] = sign.end;
      if ((month === sm && day >= sd) || (month === em && day <= ed)) {
        return sign.emoji + ' ' + sign.name;
      }
    }
  }
  
  return '♑ Capricorn';
}

// Get zodiac sign in Czech
function getZodiacSignCz(sign: string): string {
  const translations: Record<string, string> = {
    'Capricorn': 'Kozoroh',
    'Aquarius': 'Vodnář',
    'Pisces': 'Ryby',
    'Aries': 'Beran',
    'Taurus': 'Býk',
    'Gemini': 'Blíženci',
    'Cancer': 'Rak',
    'Leo': 'Lev',
    'Virgo': 'Panna',
    'Libra': 'Váhy',
    'Scorpio': 'Štír',
    'Sagittarius': 'Střelec',
  };
  
  const parts = sign.split(' ');
  const signName = parts[1];
  return parts[0] + ' ' + (translations[signName] || signName);
}

// Get element for zodiac sign
function getElement(zodiac: string): { name: string; emoji: string; meaning: { en: string; cz: string } } {
  const signName = zodiac.split(' ')[1];
  const elements: Record<string, { name: string; emoji: string; meaning: { en: string; cz: string } }> = {
    'Aries': { name: 'Fire', emoji: '🔥', meaning: { en: 'Passion, energy, drive', cz: 'Vášeň, energie, síla' } },
    'Leo': { name: 'Fire', emoji: '🔥', meaning: { en: 'Passion, energy, drive', cz: 'Vášeň, energie, síla' } },
    'Sagittarius': { name: 'Fire', emoji: '🔥', meaning: { en: 'Passion, energy, drive', cz: 'Vášeň, energie, síla' } },
    'Taurus': { name: 'Earth', emoji: '🌍', meaning: { en: 'Stability, grounding', cz: 'Stabilita, uzemnění' } },
    'Virgo': { name: 'Earth', emoji: '🌍', meaning: { en: 'Stability, grounding', cz: 'Stabilita, uzemnění' } },
    'Capricorn': { name: 'Earth', emoji: '🌍', meaning: { en: 'Stability, grounding', cz: 'Stabilita, uzemnění' } },
    'Gemini': { name: 'Air', emoji: '💨', meaning: { en: 'Communication, intellect', cz: 'Komunikace, intelekt' } },
    'Libra': { name: 'Air', emoji: '💨', meaning: { en: 'Communication, intellect', cz: 'Komunikace, intelekt' } },
    'Aquarius': { name: 'Air', emoji: '💨', meaning: { en: 'Communication, intellect', cz: 'Komunikace, intelekt' } },
    'Cancer': { name: 'Water', emoji: '🌊', meaning: { en: 'Intuition, emotion', cz: 'Intuice, emoce' } },
    'Scorpio': { name: 'Water', emoji: '🌊', meaning: { en: 'Intuition, emotion', cz: 'Intuice, emoce' } },
    'Pisces': { name: 'Water', emoji: '🌊', meaning: { en: 'Intuition, emotion', cz: 'Intuice, emoce' } },
  };
  
  return elements[signName] || { name: 'Fire', emoji: '🔥', meaning: { en: 'Passion, energy', cz: 'Vášeň, energie' } };
}

// Get numerology meaning
function getNumerologyMeaning(num: number, lang: 'en' | 'cz'): string {
  const meanings: Record<number, { en: string; cz: string }> = {
    1: { en: 'Leadership, new beginnings', cz: 'Vedení, nové začátky' },
    2: { en: 'Balance, partnership', cz: 'Rovnováha, partnerství' },
    3: { en: 'Creativity, expression', cz: 'Kreativita, vyjádření' },
    4: { en: 'Stability, foundation', cz: 'Stabilita, základ' },
    5: { en: 'Change, adventure', cz: 'Změna, dobrodružství' },
    6: { en: 'Harmony, responsibility', cz: 'Harmonie, zodpovědnost' },
    7: { en: 'Wisdom, introspection', cz: 'Moudrost, introspekce' },
    8: { en: 'Power, abundance', cz: 'Síla, hojnost' },
    9: { en: 'Completion, wisdom', cz: 'Dokončení, moudrost' },
  };
  
  return meanings[num]?.[lang] || meanings[1][lang];
}

// Get moon phase
function getMoonPhase(date: Date): { phase: string; emoji: string; nameCz: string } {
  const synodic = 29.53058867;
  const refDate = new Date('2000-01-06').getTime(); // Known new moon
  const daysSince = (date.getTime() - refDate) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % synodic) + synodic) % synodic;
  
  if (phase < 1.84566) return { phase: 'New Moon', emoji: '🌑', nameCz: 'Nov' };
  if (phase < 5.53699) return { phase: 'Waxing Crescent', emoji: '🌒', nameCz: 'Dorůstající srpek' };
  if (phase < 9.22831) return { phase: 'First Quarter', emoji: '🌓', nameCz: 'První čtvrt' };
  if (phase < 12.91963) return { phase: 'Waxing Gibbous', emoji: '🌔', nameCz: 'Dorůstající' };
  if (phase < 16.61096) return { phase: 'Full Moon', emoji: '🌕', nameCz: 'Úplněk' };
  if (phase < 20.30228) return { phase: 'Waning Gibbous', emoji: '🌖', nameCz: 'Couvající' };
  if (phase < 23.99361) return { phase: 'Last Quarter', emoji: '🌗', nameCz: 'Poslední čtvrt' };
  if (phase < 27.68493) return { phase: 'Waning Crescent', emoji: '🌘', nameCz: 'Couvající srpek' };
  return { phase: 'New Moon', emoji: '🌑', nameCz: 'Nov' };
}

export function MysticalAnalysis({ homeTeam, awayTeam, gameDate, predictedWinner, className }: MysticalAnalysisProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { language } = useLanguage();
  
  const homeNumber = getNameNumber(homeTeam);
  const awayNumber = getNameNumber(awayTeam);
  const dateNumber = ((gameDate.getDate() + gameDate.getMonth() + 1) % 9) + 1;
  const luckyNumber = ((homeNumber + awayNumber + dateNumber) % 10) || 10;
  
  const zodiac = getZodiacSign(gameDate);
  const zodiacDisplay = language === 'cz' ? getZodiacSignCz(zodiac) : zodiac;
  const element = getElement(zodiac);
  const moonPhase = getMoonPhase(gameDate);
  
  // Determine cosmic alignment
  const alignment = homeNumber > awayNumber ? 'home' : 'away';
  const alignedTeam = alignment === 'home' ? homeTeam : awayTeam;
  const cosmicMatch = alignedTeam.toLowerCase() === predictedWinner.toLowerCase().split(' ')[0] || 
                      predictedWinner.toLowerCase().includes(alignedTeam.toLowerCase().split(' ')[0]);
  
  const items = language === 'cz' ? [
    { emoji: zodiac.split(' ')[0], text: `Zápas pod znamením ${zodiacDisplay.split(' ')[1]}` },
    { emoji: moonPhase.emoji, text: `Fáze měsíce: ${moonPhase.nameCz}` },
    { emoji: '🔢', text: `Numerologické číslo zápasu: ${dateNumber} (${getNumerologyMeaning(dateNumber, 'cz')})` },
    { emoji: element.emoji, text: `Živel: ${element.name === 'Fire' ? 'Oheň' : element.name === 'Water' ? 'Voda' : element.name === 'Earth' ? 'Země' : 'Vzduch'} - ${element.meaning.cz}` },
    { emoji: '🔮', text: `Kosmická energie favorizuje: ${alignedTeam}` },
    { emoji: '⚡', text: `${homeTeam} vibruje na čísle ${homeNumber}, ${awayTeam} na ${awayNumber}` },
    { emoji: '🎰', text: `Šťastné číslo: ${luckyNumber}` },
  ] : [
    { emoji: zodiac.split(' ')[0], text: `Match under ${zodiac.split(' ')[1]}` },
    { emoji: moonPhase.emoji, text: `Moon phase: ${moonPhase.phase}` },
    { emoji: '🔢', text: `Game numerology: ${dateNumber} (${getNumerologyMeaning(dateNumber, 'en')})` },
    { emoji: element.emoji, text: `Element: ${element.name} - ${element.meaning.en}` },
    { emoji: '🔮', text: `Cosmic energy favors: ${alignedTeam}` },
    { emoji: '⚡', text: `${homeTeam} vibrates at ${homeNumber}, ${awayTeam} at ${awayNumber}` },
    { emoji: '🎰', text: `Lucky number: ${luckyNumber}` },
  ];
  
  const verdict = cosmicMatch 
    ? (language === 'cz' ? '✨ Hvězdy se shodují s AI predikcí!' : '✨ Stars align with AI prediction!')
    : (language === 'cz' ? '⚡ Hvězdy naznačují překvapení...' : '⚡ Stars hint at surprise...');
  
  return (
    <div className={cn('rounded-2xl overflow-hidden', className)}>
      {/* Header - Gradient purple/gold theme */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-purple-900/50 via-purple-800/40 to-amber-900/30 hover:from-purple-900/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-foreground">
              🔮 {language === 'cz' ? 'Mystická analýza' : 'Mystical Analysis'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === 'cz' ? 'Numerologie & Astrologie' : 'Numerology & Astrology'}
            </p>
          </div>
        </div>
        <ChevronDown className={cn(
          'h-5 w-5 text-muted-foreground transition-transform duration-300',
          isOpen && 'rotate-180'
        )} />
      </button>
      
      {/* Content */}
      <div className={cn(
        'overflow-hidden transition-all duration-300 bg-gradient-to-b from-purple-900/20 to-transparent',
        isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="p-4 md:p-5 space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-xl shrink-0">{item.emoji}</span>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
          
          {/* Verdict */}
          <div className={cn(
            'mt-4 p-3 rounded-xl text-center font-semibold',
            cosmicMatch 
              ? 'bg-success/10 border border-success/30 text-success' 
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
          )}>
            {verdict}
          </div>
          
          {/* Disclaimer */}
          <p className="text-[10px] text-muted-foreground/60 text-center pt-2">
            {language === 'cz' 
              ? '⚠️ Toto je pouze pro zábavu a nemá žádnou prediktivní hodnotu.' 
              : '⚠️ This is for entertainment only and has no predictive value.'}
          </p>
        </div>
      </div>
    </div>
  );
}
