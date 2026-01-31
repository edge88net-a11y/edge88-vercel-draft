// Internationalization support for EN/CZ

export type Language = 'en' | 'cz';

export interface Translations {
  // Navigation
  dashboard: string;
  predictions: string;
  results: string;
  pricing: string;
  login: string;
  logout: string;
  getStarted: string;
  
  // Common
  loading: string;
  refresh: string;
  viewAll: string;
  save: string;
  saved: string;
  follow: string;
  following: string;
  search: string;
  filter: string;
  sortBy: string;
  
  // Home Page
  heroTitle: string;
  heroSubtitle: string;
  startPredicting: string;
  viewPredictions: string;
  trustedBy: string;
  analysts: string;
  whyEdge88: string;
  whyEdge88Subtitle: string;
  todaysTopPicks: string;
  highestConfidence: string;
  provenResults: string;
  realTimeStats: string;
  simplePricing: string;
  startFreeUpgrade: string;
  startPredictingToday: string;
  joinThousands: string;
  createFreeAccount: string;
  
  // Features
  aiPowered: string;
  aiPoweredDesc: string;
  transparent: string;
  transparentDesc: string;
  multiMarket: string;
  multiMarketDesc: string;
  
  // Stats
  overallAccuracy: string;
  totalPredictions: string;
  averageROI: string;
  activeAnalysts: string;
  activePredictions: string;
  accuracyRate: string;
  roi: string;
  currentStreak: string;
  wins: string;
  keepItGoing: string;
  accuracyBySport: string;
  recentResults: string;
  noRecentResults: string;
  
  // Predictions
  active: string;
  aiPoweredPicks: string;
  sport: string;
  confidence: string;
  type: string;
  moneyline: string;
  spread: string;
  overUnder: string;
  prop: string;
  lock: string;
  high: string;
  medium: string;
  low: string;
  all: string;
  showing: string;
  unlocked: string;
  autoRefresh: string;
  noPredictions: string;
  noPredictionsDesc: string;
  adjustFilters: string;
  unlockAll: string;
  upgradeToPro: string;
  signUpFree: string;
  
  // Analysis
  viewAnalysis: string;
  fullAnalysis: string;
  dataSources: string;
  verifiedSources: string;
  modelVersion: string;
  keyFactors: string;
  injuries: string;
  weather: string;
  sharpMoney: string;
  sentiment: string;
  oddsComparison: string;
  confidenceBreakdown: string;
  
  // Dashboard
  welcomeBack: string;
  performanceOverview: string;
  accuracyOverTime: string;
  last30Days: string;
  performanceBySport: string;
  allTime: string;
  noChartData: string;
  noSportData: string;
  liveUpdates: string;
  noActivePredictions: string;
  checkBackSoon: string;
  
  // Saved Picks
  savedPicks: string;
  yourPicks: string;
  noSavedPicks: string;
  savePredictions: string;
  trackRecord: string;
  
  // Settings
  settings: string;
  notifications: string;
  emailNotifications: string;
  pushNotifications: string;
  newPredictions: string;
  resultsUpdates: string;
  weeklyDigest: string;
  language: string;
  theme: string;
  darkMode: string;
  lightMode: string;
  
  // Pricing
  free: string;
  pro: string;
  elite: string;
  enterprise: string;
  popular: string;
  perMonth: string;
  features: string;
  
  // Footer
  footerTagline: string;
  quickLinks: string;
  legal: string;
  privacyPolicy: string;
  termsOfService: string;
  contact: string;
  allRightsReserved: string;
  
  // Errors
  error: string;
  retry: string;
  somethingWentWrong: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    predictions: 'Predictions',
    results: 'Results',
    pricing: 'Pricing',
    login: 'Login',
    logout: 'Logout',
    getStarted: 'Get Started',
    
    // Common
    loading: 'Loading...',
    refresh: 'Refresh',
    viewAll: 'View All',
    save: 'Save',
    saved: 'Saved',
    follow: 'Follow',
    following: 'Following',
    search: 'Search',
    filter: 'Filters',
    sortBy: 'Sort by',
    
    // Home Page
    heroTitle: 'The Future of Predictions',
    heroSubtitle: 'AI-powered predictions across sports, crypto, and world events. Built for analysts who demand transparency and accuracy.',
    startPredicting: 'Start Predicting',
    viewPredictions: 'View Predictions',
    trustedBy: 'Trusted by',
    analysts: 'analysts',
    whyEdge88: 'Why Edge88?',
    whyEdge88Subtitle: 'Cutting-edge technology meets transparent tracking',
    todaysTopPicks: "Today's Top Picks",
    highestConfidence: 'Highest confidence predictions for today',
    provenResults: 'Proven Results',
    realTimeStats: 'Real-time stats from our verified predictions',
    simplePricing: 'Simple Pricing',
    startFreeUpgrade: "Start free, upgrade when you're ready",
    startPredictingToday: 'Start Predicting Today',
    joinThousands: 'Join thousands of analysts using AI to gain an edge. Start free, no credit card required.',
    createFreeAccount: 'Create Free Account',
    
    // Features
    aiPowered: 'AI-Powered',
    aiPoweredDesc: 'Our models analyze millions of data points per prediction, including player stats, weather, injuries, and market sentiment.',
    transparent: 'Transparent',
    transparentDesc: 'Every prediction is timestamped before game start. Track our historical accuracy and verify every pick.',
    multiMarket: 'Multi-Market',
    multiMarketDesc: 'Coverage across NFL, NBA, NHL, MLB, Soccer, UFC, and prediction markets like Polymarket and Kalshi.',
    
    // Stats
    overallAccuracy: 'Overall Accuracy',
    totalPredictions: 'Total Predictions',
    averageROI: 'Average ROI',
    activeAnalysts: 'Active Analysts',
    activePredictions: 'Active Predictions',
    accuracyRate: 'Accuracy Rate',
    roi: 'ROI',
    currentStreak: 'Current Streak',
    wins: 'Wins',
    keepItGoing: 'Keep it going!',
    accuracyBySport: 'Accuracy by Sport',
    recentResults: 'Recent Results',
    noRecentResults: 'No recent results yet',
    
    // Predictions
    active: 'Active',
    aiPoweredPicks: 'AI-powered picks across all major sports',
    sport: 'Sport',
    confidence: 'Confidence',
    type: 'Type',
    moneyline: 'Moneyline',
    spread: 'Spread',
    overUnder: 'Over/Under',
    prop: 'Prop',
    lock: 'Lock 75%+',
    high: 'High 65%+',
    medium: 'Medium 55%+',
    low: 'Low',
    all: 'All',
    showing: 'Showing',
    unlocked: 'unlocked',
    autoRefresh: 'Auto-refresh in 30s',
    noPredictions: 'No predictions found',
    noPredictionsDesc: 'Try adjusting your filters to see more predictions',
    adjustFilters: 'Adjust filters',
    unlockAll: 'Unlock All',
    upgradeToPro: 'Upgrade to Pro',
    signUpFree: 'Sign Up Free',
    
    // Analysis
    viewAnalysis: 'View Analysis',
    fullAnalysis: 'Full Analysis',
    dataSources: 'Data Sources',
    verifiedSources: 'verified sources',
    modelVersion: 'Model Version',
    keyFactors: 'Key Factors',
    injuries: 'Injuries',
    weather: 'Weather',
    sharpMoney: 'Sharp Money',
    sentiment: 'Sentiment',
    oddsComparison: 'Odds Comparison',
    confidenceBreakdown: 'Confidence Breakdown',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    performanceOverview: "Here's your performance overview and today's predictions",
    accuracyOverTime: 'Accuracy Over Time',
    last30Days: 'Last 30 days',
    performanceBySport: 'Performance by Sport',
    allTime: 'All time',
    noChartData: 'No chart data available',
    noSportData: 'No sport data available',
    liveUpdates: 'Live Updates',
    noActivePredictions: 'No active predictions',
    checkBackSoon: 'Check back soon for new picks',
    
    // Saved Picks
    savedPicks: 'Saved Picks',
    yourPicks: 'Your Picks',
    noSavedPicks: 'No saved picks yet',
    savePredictions: 'Save predictions to track your performance',
    trackRecord: 'Track Record',
    
    // Settings
    settings: 'Settings',
    notifications: 'Notifications',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    newPredictions: 'New Predictions',
    resultsUpdates: 'Results Updates',
    weeklyDigest: 'Weekly Digest',
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    
    // Pricing
    free: 'Free',
    pro: 'Pro',
    elite: 'Elite',
    enterprise: 'Enterprise',
    popular: 'Most Popular',
    perMonth: '/month',
    features: 'Features',
    
    // Footer
    footerTagline: 'The most advanced sports predictions platform, powered by AI.',
    quickLinks: 'Quick Links',
    legal: 'Legal',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contact: 'Contact',
    allRightsReserved: 'All rights reserved.',
    
    // Errors
    error: 'Error',
    retry: 'Retry',
    somethingWentWrong: 'Something went wrong',
  },
  
  cz: {
    // Navigation
    dashboard: 'Přehled',
    predictions: 'Predikce',
    results: 'Výsledky',
    pricing: 'Ceník',
    login: 'Přihlášení',
    logout: 'Odhlásit',
    getStarted: 'Začít',
    
    // Common
    loading: 'Načítání...',
    refresh: 'Obnovit',
    viewAll: 'Zobrazit vše',
    save: 'Uložit',
    saved: 'Uloženo',
    follow: 'Sledovat',
    following: 'Sleduji',
    search: 'Hledat',
    filter: 'Filtry',
    sortBy: 'Řadit podle',
    
    // Home Page
    heroTitle: 'Budoucnost predikcí',
    heroSubtitle: 'AI predikce pro sport, krypto a světové události. Vytvořeno pro analytiky, kteří vyžadují transparentnost a přesnost.',
    startPredicting: 'Začít predikovat',
    viewPredictions: 'Zobrazit predikce',
    trustedBy: 'Důvěřuje',
    analysts: 'analytiků',
    whyEdge88: 'Proč Edge88?',
    whyEdge88Subtitle: 'Špičková technologie s transparentním sledováním',
    todaysTopPicks: 'Dnešní top tipy',
    highestConfidence: 'Predikce s nejvyšší jistotou pro dnešek',
    provenResults: 'Ověřené výsledky',
    realTimeStats: 'Statistiky v reálném čase z ověřených predikcí',
    simplePricing: 'Jednoduchý ceník',
    startFreeUpgrade: 'Začněte zdarma, upgradujte když budete připraveni',
    startPredictingToday: 'Začněte predikovat ještě dnes',
    joinThousands: 'Připojte se k tisícům analytiků využívajících AI pro získání výhody. Začněte zdarma, bez platební karty.',
    createFreeAccount: 'Vytvořit účet zdarma',
    
    // Features
    aiPowered: 'Poháněno AI',
    aiPoweredDesc: 'Naše modely analyzují miliony datových bodů na predikci, včetně statistik hráčů, počasí, zranění a tržního sentimentu.',
    transparent: 'Transparentní',
    transparentDesc: 'Každá predikce má časové razítko před začátkem zápasu. Sledujte naši historickou přesnost a ověřte každý tip.',
    multiMarket: 'Více trhů',
    multiMarketDesc: 'Pokrytí NFL, NBA, NHL, MLB, fotbalu, UFC a predikčních trhů jako Polymarket a Kalshi.',
    
    // Stats
    overallAccuracy: 'Celková přesnost',
    totalPredictions: 'Celkem predikcí',
    averageROI: 'Průměrná návratnost',
    activeAnalysts: 'Aktivních analytiků',
    activePredictions: 'Aktivní predikce',
    accuracyRate: 'Míra přesnosti',
    roi: 'Návratnost',
    currentStreak: 'Aktuální série',
    wins: 'Výher',
    keepItGoing: 'Pokračujte!',
    accuracyBySport: 'Přesnost podle sportu',
    recentResults: 'Poslední výsledky',
    noRecentResults: 'Zatím žádné výsledky',
    
    // Predictions
    active: 'Aktivní',
    aiPoweredPicks: 'AI tipy pro všechny hlavní sporty',
    sport: 'Sport',
    confidence: 'Jistota',
    type: 'Typ',
    moneyline: 'Vítěz',
    spread: 'Handicap',
    overUnder: 'Více/Méně',
    prop: 'Speciální',
    lock: 'Jistota 75%+',
    high: 'Vysoká 65%+',
    medium: 'Střední 55%+',
    low: 'Nízká',
    all: 'Vše',
    showing: 'Zobrazeno',
    unlocked: 'odemčeno',
    autoRefresh: 'Auto-obnovení za 30s',
    noPredictions: 'Žádné predikce nenalezeny',
    noPredictionsDesc: 'Zkuste upravit filtry pro zobrazení více predikcí',
    adjustFilters: 'Upravit filtry',
    unlockAll: 'Odemknout vše',
    upgradeToPro: 'Upgradovat na Pro',
    signUpFree: 'Registrace zdarma',
    
    // Analysis
    viewAnalysis: 'Zobrazit analýzu',
    fullAnalysis: 'Kompletní analýza',
    dataSources: 'Zdroje dat',
    verifiedSources: 'ověřených zdrojů',
    modelVersion: 'Verze modelu',
    keyFactors: 'Klíčové faktory',
    injuries: 'Zranění',
    weather: 'Počasí',
    sharpMoney: 'Sharp peníze',
    sentiment: 'Sentiment',
    oddsComparison: 'Porovnání kurzů',
    confidenceBreakdown: 'Rozklad jistoty',
    
    // Dashboard
    welcomeBack: 'Vítejte zpět',
    performanceOverview: 'Přehled vašeho výkonu a dnešní predikce',
    accuracyOverTime: 'Přesnost v čase',
    last30Days: 'Posledních 30 dní',
    performanceBySport: 'Výkon podle sportu',
    allTime: 'Celkem',
    noChartData: 'Žádná data grafu',
    noSportData: 'Žádná sportovní data',
    liveUpdates: 'Živé aktualizace',
    noActivePredictions: 'Žádné aktivní predikce',
    checkBackSoon: 'Brzy se vraťte pro nové tipy',
    
    // Saved Picks
    savedPicks: 'Uložené tipy',
    yourPicks: 'Vaše tipy',
    noSavedPicks: 'Zatím žádné uložené tipy',
    savePredictions: 'Ukládejte predikce pro sledování výkonu',
    trackRecord: 'Bilance',
    
    // Settings
    settings: 'Nastavení',
    notifications: 'Oznámení',
    emailNotifications: 'E-mailová oznámení',
    pushNotifications: 'Push oznámení',
    newPredictions: 'Nové predikce',
    resultsUpdates: 'Aktualizace výsledků',
    weeklyDigest: 'Týdenní souhrn',
    language: 'Jazyk',
    theme: 'Vzhled',
    darkMode: 'Tmavý režim',
    lightMode: 'Světlý režim',
    
    // Pricing
    free: 'Zdarma',
    pro: 'Pro',
    elite: 'Elite',
    enterprise: 'Enterprise',
    popular: 'Nejpopulárnější',
    perMonth: '/měsíc',
    features: 'Funkce',
    
    // Footer
    footerTagline: 'Nejpokročilejší platforma pro sportovní predikce, poháněná AI.',
    quickLinks: 'Rychlé odkazy',
    legal: 'Právní',
    privacyPolicy: 'Ochrana soukromí',
    termsOfService: 'Podmínky služby',
    contact: 'Kontakt',
    allRightsReserved: 'Všechna práva vyhrazena.',
    
    // Errors
    error: 'Chyba',
    retry: 'Zkusit znovu',
    somethingWentWrong: 'Něco se pokazilo',
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang];
}
