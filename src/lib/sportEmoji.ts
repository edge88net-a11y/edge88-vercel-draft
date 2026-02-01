/**
 * Sport emoji mapping utility
 * Use getSportEmoji() for consistent sport icons across the app
 */

const SPORT_EMOJI_MAP: Record<string, string> = {
  // NHL / Hockey
  nhl: '🏒',
  hockey: '🏒',
  icehockey: '🏒',
  'ice hockey': '🏒',
  
  // NBA / Basketball
  nba: '🏀',
  basketball: '🏀',
  ncaab: '🏀',
  
  // Soccer / Football
  soccer: '⚽',
  football: '⚽', // International football = soccer
  mls: '⚽',
  epl: '⚽',
  laliga: '⚽',
  bundesliga: '⚽',
  seriea: '⚽',
  ligue1: '⚽',
  championsleague: '⚽',
  ucl: '⚽',
  
  // UFC / MMA
  ufc: '🥊',
  mma: '🥊',
  boxing: '🥊',
  
  // NFL / American Football
  nfl: '🏈',
  americanfootball: '🏈',
  'american football': '🏈',
  ncaaf: '🏈',
  cfb: '🏈',
  
  // MLB / Baseball
  mlb: '⚾',
  baseball: '⚾',
  
  // Tennis
  tennis: '🎾',
  atp: '🎾',
  wta: '🎾',
  
  // Prediction markets
  polymarket: '📊',
  kalshi: '📈',
  
  // Golf
  golf: '⛳',
  pga: '⛳',
  
  // F1 / Racing
  f1: '🏎️',
  formula1: '🏎️',
  nascar: '🏎️',
  racing: '🏎️',
};

/**
 * Get the emoji for a sport, case-insensitive
 * @param sport - The sport name or abbreviation
 * @returns The emoji for the sport, or 🏆 as fallback
 */
export function getSportEmoji(sport: string | undefined | null): string {
  if (!sport) return '🏆';
  
  // Normalize: lowercase, remove spaces and special characters
  const normalized = sport.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return SPORT_EMOJI_MAP[normalized] || '🏆';
}

/**
 * Format sport name with emoji prefix
 * @param sport - The sport name
 * @returns Formatted string like "🏒 NHL"
 */
export function formatSportWithEmoji(sport: string | undefined | null): string {
  if (!sport) return '🏆 Unknown';
  return `${getSportEmoji(sport)} ${sport}`;
}
