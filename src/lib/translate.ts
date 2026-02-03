/**
 * Simple translation utility for Edge88
 * Translates backend English text to Czech for the Czech frontend
 */

// Sport names
const sportNames: Record<string, string> = {
  'NFL': 'NFL',
  'NBA': 'NBA',
  'NHL': 'NHL',
  'MLB': 'MLB',
  'Soccer': 'Fotbal',
  'EPL': 'Premier League',
  'La Liga': 'La Liga',
  'Serie A': 'Serie A',
  'Bundesliga': 'Bundesliga',
  'UFC': 'UFC',
  'MMA': 'MMA',
  'Baseball': 'Baseball',
  'Basketball': 'Basketbal',
  'Hockey': 'Hokej',
  'Football': 'Americký fotbal',
};

// Prediction types
const predictionTypes: Record<string, string> = {
  'Moneyline': 'Výhra',
  'Spread': 'Handicap',
  'Over/Under': 'Přes/Pod',
  'Prop': 'Speciální sázka',
  'Total': 'Celkem',
};

// Common terms
const commonTerms: Record<string, string> = {
  'vs': 'vs',
  'Home': 'Domácí',
  'Away': 'Hosté',
  'Win': 'Výhra',
  'Loss': 'Prohra',
  'Pending': 'Čeká se',
  'Live': 'Živě',
  'Finished': 'Ukončeno',
  'Today': 'Dnes',
  'Tomorrow': 'Zítra',
  'This Week': 'Tento týden',
  'Lock': 'Lock',
  'High Value': 'Vysoká hodnota',
  'Hot Pick': 'Horký tip',
  'Strong home form': 'Silná domácí forma',
  'Sharp money moving': 'Sharp money se pohybuje',
  'Key matchup factors': 'Klíčové faktory',
  'Value opportunity': 'Hodnotová příležitost',
  'Historical trends support': 'Historické trendy podporují',
  'traveling': 'na cestě',
  'model confidence': 'důvěra modelu',
  'favor our pick': 'favorizují náš tip',
  'No data available': 'Není k dispozici',
  'Loading': 'Načítání',
  'Loading...': 'Načítání...',
  'Analysis': 'Analýza',
  'Details': 'Detail',
  'Save': 'Uložit',
  'Saved': 'Uloženo',
  'Share': 'Sdílet',
  'Add to slip': 'Na tiket',
  'Remove': 'Odebrat',
  'Sign In': 'Přihlásit se',
  'Sign Up': 'Registrovat',
  'Sign Out': 'Odhlásit',
  'Premium': 'Premium',
  'Free': 'Zdarma',
  'Filter': 'Filtr',
  'Sort': 'Řadit',
  'All Sports': 'Všechny sporty',
  'All': 'Vše',
  'Active': 'Aktivní',
  'Finished': 'Ukončeno',
  'Error': 'Chyba',
  'Success': 'Úspěch',
  'Close': 'Zavřít',
  'Cancel': 'Zrušit',
  'Confirm': 'Potvrdit',
  'Settings': 'Nastavení',
  'Account': 'Účet',
  'Logout': 'Odhlásit',
  'Login': 'Přihlásit',
  'Email': 'E-mail',
  'Password': 'Heslo',
  'Username': 'Uživatelské jméno',
  'Profile': 'Profil',
  'Dashboard': 'Přehled',
  'Predictions': 'Predikce',
  'Statistics': 'Statistiky',
  'Help': 'Nápověda',
  'Contact': 'Kontakt',
  'About': 'O nás',
  'Terms': 'Podmínky',
  'Privacy': 'Soukromí',
  'Subscribe': 'Předplatit',
  'Upgrade': 'Upgradovat',
  'Back': 'Zpět',
  'Next': 'Další',
  'Previous': 'Předchozí',
  'Search': 'Hledat',
  'Search...': 'Hledat...',
  'No results': 'Žádné výsledky',
  'Try again': 'Zkusit znovu',
  'Refresh': 'Obnovit',
  'Copy': 'Kopírovat',
  'Copied': 'Zkopírováno',
  'Download': 'Stáhnout',
  'Upload': 'Nahrát',
  'Delete': 'Smazat',
  'Edit': 'Upravit',
  'View': 'Zobrazit',
  'Open': 'Otevřít',
  'New': 'Nové',
  'Recent': 'Nedávné',
  'Popular': 'Populární',
  'Trending': 'Trendy',
  'Recommended': 'Doporučené',
  'Featured': 'Doporučujeme',
  'More': 'Více',
  'Less': 'Méně',
  'Show more': 'Zobrazit více',
  'Show less': 'Zobrazit méně',
  'Read more': 'Číst více',
  'Collapse': 'Sbalit',
  'Expand': 'Rozbalit',
  'Yes': 'Ano',
  'No': 'Ne',
  'Maybe': 'Možná',
  'Select': 'Vybrat',
  'Selected': 'Vybráno',
  'Choose': 'Zvolit',
  'Options': 'Možnosti',
  'Preferences': 'Předvolby',
  'Language': 'Jazyk',
  'Theme': 'Téma',
  'Light': 'Světlý',
  'Dark': 'Tmavý',
  'Auto': 'Automaticky',
  'Notifications': 'Notifikace',
  'Enable': 'Povolit',
  'Disable': 'Zakázat',
  'On': 'Zapnuto',
  'Off': 'Vypnuto',
  'Online': 'Online',
  'Offline': 'Offline',
  'Connected': 'Připojeno',
  'Disconnected': 'Odpojeno',
  'Syncing': 'Synchronizace',
  'Synced': 'Synchronizováno',
  'Updated': 'Aktualizováno',
  'Update': 'Aktualizovat',
  'Version': 'Verze',
  'Beta': 'Beta',
  'Coming soon': 'Již brzy',
  'Soon': 'Brzy',
  'Yesterday': 'Včera',
  'Last week': 'Minulý týden',
  'Last month': 'Minulý měsíc',
  'All time': 'Celkem',
  'Total': 'Celkem',
  'Average': 'Průměr',
  'Best': 'Nejlepší',
  'Worst': 'Nejhorší',
  'Highest': 'Nejvyšší',
  'Lowest': 'Nejnižší',
  'Streak': 'Série',
  'Current': 'Aktuální',
  'Record': 'Rekord',
  'Rank': 'Pořadí',
  'Score': 'Skóre',
  'Points': 'Body',
  'Wins': 'Výhry',
  'Losses': 'Prohry',
  'Draws': 'Remízy',
  'Accuracy': 'Přesnost',
  'Confidence': 'Jistota',
  'Value': 'Hodnota',
  'Odds': 'Kurzy',
  'Payout': 'Výplata',
  'Profit': 'Zisk',
  'Return': 'Návratnost',
  'Risk': 'Riziko',
  'Stake': 'Sázka',
  'Bet': 'Sázka',
  'Pick': 'Tip',
  'Picks': 'Tipy',
  'Ticket': 'Tiket',
  'Slip': 'Tiket',
  'Betting Slip': 'Sázkový tiket',
  'Clear': 'Vymazat',
  'Clear all': 'Vymazat vše',
  'Place bet': 'Vsadit',
  'Add': 'Přidat',
  'Added': 'Přidáno',
  'Follow': 'Sledovat',
  'Following': 'Sledováno',
  'Unfollow': 'Přestat sledovat',
};

// Key analysis terms for partial translation
const analysisTerms: Record<string, string> = {
  'FORM': 'FORMA',
  'H2H': 'H2H',
  'INJURIES': 'ZRANĚNÍ',
  'WEATHER': 'POČASÍ',
  'SHARP MONEY': 'SHARP MONEY',
  'SENTIMENT': 'SENTIMENT',
  'Form': 'Forma',
  'Head to head': 'Vzájemné zápasy',
  'Injuries': 'Zranění',
  'Weather': 'Počasí',
  'Last 5 games': 'Posledních 5 zápasů',
  'wins': 'výhry',
  'losses': 'prohry',
  'draws': 'remízy',
  'goals scored': 'vstřelené góly',
  'goals conceded': 'obdržené góly',
  'clean sheets': 'čistá konta',
};

/**
 * Translate sport name to Czech
 */
export function translateSport(sport: string, language: 'en' | 'cz'): string {
  if (language === 'en') return sport;
  return sportNames[sport] || sport;
}

/**
 * Translate prediction type to Czech
 */
export function translatePredictionType(type: string, language: 'en' | 'cz'): string {
  if (language === 'en') return type;
  return predictionTypes[type] || type;
}

/**
 * Translate common term to Czech
 */
export function translateTerm(term: string, language: 'en' | 'cz'): string {
  if (language === 'en') return term;
  return commonTerms[term] || term;
}

/**
 * Partial translation of analysis text
 * Replaces key English terms with Czech equivalents
 */
export function partialTranslateAnalysis(text: string, language: 'en' | 'cz'): string {
  if (language === 'en' || !text) return text;

  let translated = text;

  // Replace analysis terms
  Object.entries(analysisTerms).forEach(([en, cz]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, cz);
  });

  return translated;
}

/**
 * Get Czech summary for English analysis
 * Returns a short Czech summary that can be shown above English text
 */
export function getCzechSummary(prediction: any): string {
  const confidence = Math.round((prediction.confidence || 0) * 100);
  const pick = prediction.prediction?.pick || prediction.predicted_winner || 'tip';
  const type = translatePredictionType(prediction.prediction?.type || 'Moneyline', 'cz');

  let summary = `${type}: ${pick}`;

  if (confidence >= 80) {
    summary += ' — LOCK (velmi vysoká jistota)';
  } else if (confidence >= 70) {
    summary += ' — vysoká jistota';
  } else if (confidence >= 60) {
    summary += ' — střední jistota';
  }

  return summary;
}

/**
 * Translate entire text blob (for short texts only)
 */
export function translate(text: string, language: 'en' | 'cz'): string {
  if (language === 'en') return text;

  let translated = text;

  // Replace all known terms
  Object.entries({ ...commonTerms, ...sportNames, ...predictionTypes, ...analysisTerms }).forEach(
    ([en, cz]) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      translated = translated.replace(regex, cz);
    }
  );

  return translated;
}
