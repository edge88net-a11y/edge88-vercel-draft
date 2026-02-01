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
  
  // Soccer / Football - expanded list
  soccer: '⚽',
  football: '⚽', // International football = soccer
  mls: '⚽',
  epl: '⚽',
  laliga: '⚽',
  'la liga': '⚽',
  bundesliga: '⚽',
  seriea: '⚽',
  'serie a': '⚽',
  ligue1: '⚽',
  'ligue 1': '⚽',
  championsleague: '⚽',
  'champions league': '⚽',
  ucl: '⚽',
  premierleague: '⚽',
  'premier league': '⚽',
  'english premier': '⚽',
  facup: '⚽',
  'fa cup': '⚽',
  carabaocup: '⚽',
  championship: '⚽',
  'scottish premier': '⚽',
  eredivisie: '⚽',
  ligamx: '⚽',
  'liga mx': '⚽',
  copadelrey: '⚽',
  'copa del rey': '⚽',
  uefaeuropa: '⚽',
  'europa league': '⚽',
  conferenceleague: '⚽',
  internationalsoccer: '⚽',
  worldcup: '⚽',
  europeanchampionship: '⚽',
  copaamerica: '⚽',
  
  // UFC / MMA
  ufc: '🥊',
  mma: '🥊',
  boxing: '🥊',
  bellator: '🥊',
  pfl: '🥊',
  
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
  australianopen: '🎾',
  frenchopen: '🎾',
  usopen: '🎾',
  wimbledon: '🎾',
  
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
  indycar: '🏎️',
  
  // Cricket
  cricket: '🏏',
  ipl: '🏏',
  
  // Rugby
  rugby: '🏉',
  sixnations: '🏉',
  
  // eSports
  esports: '🎮',
  csgo: '🎮',
  valorant: '🎮',
  lol: '🎮',
  dota2: '🎮',
  
  // Generic sports category
  sports: '🏆',
};

// NHL team keywords
const NHL_TEAMS = [
  'bruins', 'sabres', 'red wings', 'panthers', 'canadiens', 'senators', 'lightning', 'maple leafs',
  'hurricanes', 'blue jackets', 'devils', 'islanders', 'rangers', 'flyers', 'penguins', 'capitals',
  'blackhawks', 'avalanche', 'stars', 'wild', 'predators', 'blues', 'jets', 'coyotes',
  'ducks', 'flames', 'oilers', 'kings', 'sharks', 'kraken', 'canucks', 'golden knights', 'vegas',
  'tampa bay', 'boston', 'buffalo', 'detroit', 'florida', 'montreal', 'ottawa', 'toronto',
  'carolina', 'columbus', 'new jersey', 'philadelphia', 'pittsburgh', 'washington',
  'chicago', 'colorado', 'dallas', 'minnesota', 'nashville', 'st. louis', 'winnipeg', 'arizona',
  'anaheim', 'calgary', 'edmonton', 'los angeles', 'san jose', 'seattle', 'vancouver',
];

// NBA team keywords
const NBA_TEAMS = [
  'celtics', 'nets', 'knicks', '76ers', 'sixers', 'raptors', 'bulls', 'cavaliers', 'pistons',
  'pacers', 'bucks', 'hawks', 'hornets', 'heat', 'magic', 'wizards', 'nuggets', 'timberwolves',
  'thunder', 'trail blazers', 'jazz', 'warriors', 'clippers', 'lakers', 'suns', 'kings',
  'mavericks', 'rockets', 'grizzlies', 'pelicans', 'spurs',
];

// Soccer team keywords - expanded to include more Premier League teams
const SOCCER_TEAMS = [
  // Premier League
  'manchester united', 'manchester city', 'liverpool', 'chelsea', 'arsenal', 'tottenham',
  'leicester', 'west ham', 'everton', 'wolves', 'wolverhampton', 'newcastle', 'aston villa', 'brighton',
  'crystal palace', 'brentford', 'fulham', 'bournemouth', 'nottingham forest', 'nottingham', 'luton',
  'sheffield united', 'burnley', 'ipswich', 'southampton', 'leeds', 'sunderland',
  // La Liga
  'barcelona', 'real madrid', 'atletico madrid', 'sevilla', 'real sociedad', 'villarreal', 'athletic bilbao',
  // Bundesliga
  'bayern munich', 'borussia dortmund', 'rb leipzig', 'leverkusen', 'eintracht frankfurt',
  // Serie A
  'juventus', 'inter milan', 'ac milan', 'napoli', 'roma', 'lazio', 'atalanta', 'fiorentina',
  // Ligue 1
  'psg', 'paris saint-germain', 'marseille', 'lyon', 'monaco', 'lille',
  // Championship
  'watford', 'blackburn', 'middlesbrough', 'norwich', 'coventry', 'plymouth', 'hull', 'stoke', 'sheffield wednesday',
  'queens park rangers', 'qpr', 'swansea', 'millwall', 'preston', 'bristol city', 'cardiff',
];

// NFL team keywords  
const NFL_TEAMS = [
  'patriots', 'bills', 'dolphins', 'jets', 'ravens', 'bengals', 'browns', 'steelers',
  'texans', 'colts', 'jaguars', 'titans', 'broncos', 'chiefs', 'raiders', 'chargers',
  'cowboys', 'giants', 'eagles', 'commanders', 'redskins', 'bears', 'lions', 'packers', 'vikings',
  'falcons', 'saints', 'panthers', 'buccaneers', 'cardinals', 'rams', '49ers', 'seahawks',
];

// MLB team keywords
const MLB_TEAMS = [
  'yankees', 'red sox', 'orioles', 'rays', 'blue jays', 'white sox', 'guardians', 'tigers',
  'royals', 'twins', 'astros', 'athletics', 'mariners', 'rangers', 'angels', 'mets',
  'phillies', 'braves', 'marlins', 'nationals', 'cubs', 'reds', 'brewers', 'pirates',
  'cardinals', 'dodgers', 'giants', 'padres', 'rockies', 'diamondbacks',
];

/**
 * Infer sport from team names when sport field is missing or UUID
 */
function inferSportFromTeams(homeTeam: string, awayTeam: string): string | null {
  const teams = `${homeTeam} ${awayTeam}`.toLowerCase();
  
  if (NHL_TEAMS.some(t => teams.includes(t))) return 'NHL';
  if (NBA_TEAMS.some(t => teams.includes(t))) return 'NBA';
  if (SOCCER_TEAMS.some(t => teams.includes(t))) return 'Soccer';
  if (NFL_TEAMS.some(t => teams.includes(t))) return 'NFL';
  if (MLB_TEAMS.some(t => teams.includes(t))) return 'MLB';
  
  return null;
}

/**
 * Get the emoji for a sport, case-insensitive
 * @param sport - The sport name or abbreviation
 * @param homeTeam - Optional home team for inference
 * @param awayTeam - Optional away team for inference
 * @returns The emoji for the sport, or 🏆 as fallback
 */
export function getSportEmoji(sport: string | undefined | null, homeTeam?: string, awayTeam?: string): string {
  if (!sport || sport.includes('-')) {
    // sport is missing or is a UUID (contains dashes)
    if (homeTeam && awayTeam) {
      const inferredSport = inferSportFromTeams(homeTeam, awayTeam);
      if (inferredSport) {
        const normalized = inferredSport.toLowerCase().replace(/[^a-z0-9]/g, '');
        return SPORT_EMOJI_MAP[normalized] || '🏆';
      }
    }
    return '🏆';
  }
  
  // Normalize: lowercase, remove spaces and special characters
  const normalized = sport.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return SPORT_EMOJI_MAP[normalized] || '🏆';
}

/**
 * Format sport name with emoji prefix
 * @param sport - The sport name
 * @param homeTeam - Optional home team for inference
 * @param awayTeam - Optional away team for inference
 * @returns Formatted string like "🏒 NHL"
 */
export function formatSportWithEmoji(sport: string | undefined | null, homeTeam?: string, awayTeam?: string): string {
  if (!sport || sport.includes('-')) {
    // Try to infer sport from teams
    if (homeTeam && awayTeam) {
      const inferredSport = inferSportFromTeams(homeTeam, awayTeam);
      if (inferredSport) {
        return `${getSportEmoji(inferredSport)} ${inferredSport}`;
      }
    }
    return '🏆 Unknown';
  }
  return `${getSportEmoji(sport)} ${sport}`;
}

/**
 * Get sport name from teams (for display purposes)
 */
export function getSportFromTeams(homeTeam: string, awayTeam: string): string {
  return inferSportFromTeams(homeTeam, awayTeam) || 'Unknown';
}
