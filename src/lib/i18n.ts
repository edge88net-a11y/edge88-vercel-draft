// Internationalization support for EN/CZ

export type Language = 'en' | 'cz';

export interface Translations {
  // Navigation
  home: string;
  dashboard: string;
  predictions: string;
  results: string;
  pricing: string;
  profile: string;
  login: string;
  logout: string;
  getStarted: string;
  signUp: string;
  
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
  or: string;
  and: string;
  of: string;
  
  // Home Page
  heroTitle: string;
  heroSubtitle: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
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
  predictionsMadeToday: string;
  getDailyPicks: string;
  enterEmail: string;
  subscribeToNewsletter: string;
  checkInbox: string;
  startWinningNow: string;
  viewTodaysPicks: string;
  winningBettors: string;
  picksToday: string;
  accuracy: string;
  winStreak: string;
  weeklyAccuracy: string;
  vsLastWeek: string;
  picksThisWeek: string;
  updatedLive: string;
  growingDaily: string;
  userWinnings: string;
  thisMonth: string;
  howItWorks: string;
  startWinningIn3Steps: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  fromSignupToWinning: string;
  successStories: string;
  winnersTrustUs: string;
  joinCommunity: string;
  bankLevelSecurity: string;
  noCreditCard: string;
  cancelAnytime: string;
  readyToWin: string;
  joinWinningTeam: string;
  
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
  losses: string;
  keepItGoing: string;
  accuracyBySport: string;
  recentResults: string;
  noRecentResults: string;
  
  // Predictions
  active: string;
  activePicks: string;
  highConfidence: string;
  locks: string;
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
  signUpToSeeMore: string;
  upgradeToSeeAll: string;
  gameNumber: string;
  gameTime: string;
  
  // Analysis
  viewAnalysis: string;
  hideAnalysis: string;
  fullAnalysis: string;
  whyThisPick: string;
  dataSources: string;
  verifiedSources: string;
  modelVersion: string;
  keyFactors: string;
  injuries: string;
  weather: string;
  sharpMoney: string;
  sentiment: string;
  headToHead: string;
  oddsComparison: string;
  confidenceBreakdown: string;
  analyzedAt: string;
  researchSources: string;
  analyzedSources: string;
  bestOdds: string;
  bestValue: string;
  ago: string;
  minutes: string;
  hours: string;
  research: string;
  odds: string;
  historical: string;
  
  // Event Detail Page
  vs: string;
  ourPick: string;
  venue: string;
  analysis: string;
  timeline: string;
  similarPredictions: string;
  researchStats: string;
  scannedArticles: string;
  expertOpinions: string;
  injuryReports: string;
  analyzedUpdated: string;
  lineMoved: string;
  
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
  tonightsGames: string;
  
  // Results
  verifiedPerformance: string;
  winRate: string;
  totalGraded: string;
  dailyPerformance: string;
  accuracyTrend: string;
  accuracyByConfidence: string;
  sportLeaderboard: string;
  winLossFeed: string;
  noResultsYet: string;
  noResultsDesc: string;
  pending: string;
  win: string;
  loss: string;
  
  // Saved Picks
  savedPicks: string;
  yourPicks: string;
  noSavedPicks: string;
  savePredictions: string;
  trackRecord: string;
  mySavedPicks: string;
  
  // User Menu
  myProfile: string;
  billingSubscription: string;
  currentTier: string;
  paymentMethod: string;
  manageSubscription: string;
  helpFaq: string;
  emailAlerts: string;
  dailyPicksEmail: string;
  notificationPreferences: string;
  
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
  perYear: string;
  features: string;
  monthly: string;
  annual: string;
  savePercent: string;
  moneyBackGuarantee: string;
  choosePlan: string;
  currentPlan: string;
  getStartedFree: string;
  upgradeNow: string;
  contactSales: string;
  freePredictions: string;
  basicAnalysis: string;
  communityAccess: string;
  allPredictions: string;
  fullAnalysisAccess: string;
  prioritySupport: string;
  telegramAlerts: string;
  apiAccess: string;
  customModels: string;
  dedicatedSupport: string;
  whiteLabel: string;
  
  // Footer
  footerTagline: string;
  quickLinks: string;
  legal: string;
  privacyPolicy: string;
  termsOfService: string;
  contact: string;
  allRightsReserved: string;
  product: string;
  company: string;
  about: string;
  responsibleGambling: string;
  forEntertainmentOnly: string;
  learnMore: string;
  gamblingWarning: string;
  
  // Errors
  error: string;
  retry: string;
  somethingWentWrong: string;
  
  // Auth
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  forgotPassword: string;
  rememberMe: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  continueWithGoogle: string;
  orContinueWith: string;
  createAccount: string;
  signInToAccount: string;
  sendResetLink: string;
  backToLogin: string;
  resetLinkSent: string;
  checkEmailForReset: string;
  
  // Settings Page Extra
  applicationLanguage: string;
  chooseLanguage: string;
  enablePush: string;
  instantNotifications: string;
  alertHighConfidence: string;
  toggleTheme: string;
  connectedAccounts: string;
  telegram: string;
  telegramDesc: string;
  connect: string;
  connected: string;
  dangerZone: string;
  deleteAccount: string;
  deleteAccountDesc: string;
  deleteConfirm: string;
  deleteWarning: string;
  cancel: string;
  yesDelete: string;
  saveChanges: string;
  saving: string;
  savedSuccess: string;
  
  // Discussion
  discussion: string;
  loginToComment: string;
  writeComment: string;
  postComment: string;
  reply: string;
  replies: string;
  communitySentiment: string;
  selectYourPick: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    predictions: 'Predictions',
    results: 'Results',
    pricing: 'Pricing',
    profile: 'Profile',
    login: 'Login',
    logout: 'Logout',
    getStarted: 'Get Started',
    signUp: 'Sign Up',
    
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
    or: 'or',
    and: 'and',
    of: 'of',
    
    // Home Page
    heroTitle: 'The Future of Predictions',
    heroSubtitle: 'AI-powered predictions across sports, crypto, and world events. Built for analysts who demand transparency and accuracy.',
    heroTitleLine1: 'The AI Edge That',
    heroTitleLine2: 'Wins Games',
    heroDescription: 'Machine learning + deep analytics = 73% accuracy. Get winning picks for NFL, NBA, NHL, MLB & more.',
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
    predictionsMadeToday: 'predictions made today',
    getDailyPicks: 'Get daily picks free',
    enterEmail: 'Enter your email',
    subscribeToNewsletter: 'Subscribe',
    checkInbox: "Check your inbox for today's picks!",
    startWinningNow: 'Start Winning Now',
    viewTodaysPicks: "View Today's Picks",
    winningBettors: 'winning bettors',
    picksToday: 'picks today',
    accuracy: 'accuracy',
    winStreak: 'win streak',
    weeklyAccuracy: 'Weekly Accuracy',
    vsLastWeek: 'vs last week',
    picksThisWeek: 'Picks This Week',
    updatedLive: 'Updated live',
    growingDaily: 'Growing daily',
    userWinnings: 'User Winnings',
    thisMonth: 'This month',
    howItWorks: 'How It Works',
    startWinningIn3Steps: 'Start Winning in 3 Steps',
    step1Title: 'Sign Up Free',
    step1Desc: 'Create your account in 30 seconds. No credit card required.',
    step2Title: 'Get AI Picks',
    step2Desc: 'Receive daily predictions with confidence scores and deep analysis.',
    step3Title: 'Win More',
    step3Desc: 'Follow the picks, track results, and grow your bankroll.',
    fromSignupToWinning: 'From signup to your first winning pick in under 5 minutes',
    successStories: 'Success Stories',
    winnersTrustUs: 'Winners Trust Us',
    joinCommunity: 'Join the community already profiting with Edge88',
    bankLevelSecurity: 'Bank-level security',
    noCreditCard: 'No credit card needed',
    cancelAnytime: 'Cancel anytime',
    readyToWin: 'Ready to Start Winning?',
    joinWinningTeam: 'Join the winning team today. Start free, upgrade anytime.',
    
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
    losses: 'Losses',
    keepItGoing: 'Keep it going!',
    accuracyBySport: 'Accuracy by Sport',
    recentResults: 'Recent Results',
    noRecentResults: 'No recent results yet',
    
    // Predictions
    active: 'Active',
    activePicks: 'Active Picks',
    highConfidence: 'High Confidence',
    locks: 'Locks',
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
    signUpToSeeMore: 'Sign up free to see more',
    upgradeToSeeAll: 'Upgrade to Pro to see all predictions',
    gameNumber: 'Game',
    gameTime: 'Game Time',
    
    // Analysis
    viewAnalysis: 'View Analysis',
    hideAnalysis: 'Hide Analysis',
    fullAnalysis: 'Full Analysis',
    whyThisPick: 'Why This Pick',
    dataSources: 'Data Sources',
    verifiedSources: 'verified sources',
    modelVersion: 'Model Version',
    keyFactors: 'Key Factors',
    injuries: 'Injuries',
    weather: 'Weather',
    sharpMoney: 'Sharp Money',
    sentiment: 'Sentiment',
    headToHead: 'Head to Head',
    oddsComparison: 'Odds Comparison',
    confidenceBreakdown: 'Confidence Breakdown',
    analyzedAt: 'Analyzed at',
    researchSources: 'Research Sources',
    analyzedSources: 'Analyzed',
    bestOdds: 'Best Odds',
    bestValue: 'Best Value',
    ago: 'ago',
    minutes: 'min',
    hours: 'hours',
    research: 'Research',
    odds: 'Odds',
    historical: 'Historical',
    
    // Event Detail Page
    vs: 'vs',
    ourPick: 'Our Pick',
    venue: 'Venue',
    analysis: 'Analysis',
    timeline: 'Timeline',
    similarPredictions: 'Similar Past Predictions',
    researchStats: 'Research Stats',
    scannedArticles: 'Scanned articles',
    expertOpinions: 'Expert opinions',
    injuryReports: 'Injury reports',
    analyzedUpdated: 'Updated',
    lineMoved: 'Line moved',
    
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
    tonightsGames: "Tonight's Games",
    
    // Results
    verifiedPerformance: 'Verified performance across all predictions',
    winRate: 'Win Rate',
    totalGraded: 'Total Graded',
    dailyPerformance: 'Daily Performance',
    accuracyTrend: 'Accuracy Trend',
    accuracyByConfidence: 'Accuracy by Confidence',
    sportLeaderboard: 'Sport Leaderboard',
    winLossFeed: 'Win/Loss Feed',
    noResultsYet: 'No Results Yet',
    noResultsDesc: 'Predictions are being tracked and will appear here once graded',
    pending: 'Pending',
    win: 'Win',
    loss: 'Loss',
    
    // Saved Picks
    savedPicks: 'Saved Picks',
    yourPicks: 'Your Picks',
    noSavedPicks: 'No saved picks yet',
    savePredictions: 'Save predictions to track your performance',
    trackRecord: 'Track Record',
    mySavedPicks: 'My Saved Picks',
    
    // User Menu
    myProfile: 'My Profile',
    billingSubscription: 'Billing & Subscription',
    currentTier: 'Current tier',
    paymentMethod: 'Payment method',
    manageSubscription: 'Manage Subscription',
    helpFaq: 'Help & FAQ',
    emailAlerts: 'Email Alerts',
    dailyPicksEmail: 'Daily picks email',
    notificationPreferences: 'Notification Preferences',
    
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
    perYear: '/year',
    features: 'Features',
    monthly: 'Monthly',
    annual: 'Annual',
    savePercent: 'Save 20%',
    moneyBackGuarantee: '30-day money-back guarantee',
    choosePlan: 'Choose your plan',
    currentPlan: 'Current Plan',
    getStartedFree: 'Get Started Free',
    upgradeNow: 'Upgrade Now',
    contactSales: 'Contact Sales',
    freePredictions: '3 free predictions daily',
    basicAnalysis: 'Basic analysis',
    communityAccess: 'Community access',
    allPredictions: 'All predictions',
    fullAnalysisAccess: 'Full analysis access',
    prioritySupport: 'Priority support',
    telegramAlerts: 'Telegram alerts',
    apiAccess: 'API access',
    customModels: 'Custom models',
    dedicatedSupport: 'Dedicated support',
    whiteLabel: 'White-label options',
    
    // Footer
    footerTagline: 'The most advanced sports predictions platform, powered by AI.',
    quickLinks: 'Quick Links',
    legal: 'Legal',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contact: 'Contact',
    allRightsReserved: 'All rights reserved.',
    product: 'Product',
    company: 'Company',
    about: 'About',
    responsibleGambling: 'Responsible Gambling',
    forEntertainmentOnly: 'For entertainment only',
    learnMore: 'Learn more',
    gamblingWarning: 'Gambling can be addictive. Bet responsibly. For entertainment purposes only.',
    
    // Errors
    error: 'Error',
    retry: 'Retry',
    somethingWentWrong: 'Something went wrong',
    
    // Auth
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    continueWithGoogle: 'Continue with Google',
    orContinueWith: 'Or continue with',
    createAccount: 'Create Account',
    signInToAccount: 'Sign in to your account',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to login',
    resetLinkSent: 'Reset link sent!',
    checkEmailForReset: 'Check your email for password reset instructions.',
    
    // Settings Page Extra
    applicationLanguage: 'Application Language',
    chooseLanguage: 'Choose your preferred language',
    enablePush: 'Enable Push Notifications',
    instantNotifications: 'Receive instant notifications in your browser',
    alertHighConfidence: 'Alert when new high-confidence predictions drop',
    toggleTheme: 'Toggle between dark and light mode',
    connectedAccounts: 'Connected Accounts',
    telegram: 'Telegram',
    telegramDesc: 'Get picks directly in Telegram',
    connect: 'Connect',
    connected: 'Connected',
    dangerZone: 'Danger Zone',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete your account and all data',
    deleteConfirm: 'Are you sure you want to delete your account?',
    deleteWarning: 'This action cannot be undone. All your data will be permanently deleted.',
    cancel: 'Cancel',
    yesDelete: 'Yes, delete account',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    savedSuccess: 'Saved!',
    
    // Discussion
    discussion: 'Discussion',
    loginToComment: 'Login to join discussion',
    writeComment: 'Write a comment...',
    postComment: 'Post Comment',
    reply: 'Reply',
    replies: 'replies',
    communitySentiment: 'Community Sentiment',
    selectYourPick: 'Select your pick',
  },
  
  cz: {
    // Navigation
    home: 'Domů',
    dashboard: 'Přehled',
    predictions: 'Predikce',
    results: 'Výsledky',
    pricing: 'Ceník',
    profile: 'Profil',
    login: 'Přihlášení',
    logout: 'Odhlásit',
    getStarted: 'Začít',
    signUp: 'Registrace',
    
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
    or: 'nebo',
    and: 'a',
    of: 'z',
    
    // Home Page
    heroTitle: 'Budoucnost predikcí',
    heroSubtitle: 'AI predikce pro sport, krypto a světové události. Vytvořeno pro analytiky, kteří vyžadují transparentnost a přesnost.',
    heroTitleLine1: 'AI výhoda, která',
    heroTitleLine2: 'vyhrává zápasy',
    heroDescription: 'Strojové učení + hloubková analytika = 73% přesnost. Získejte vítězné tipy pro NHL, NBA, MLB a další.',
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
    predictionsMadeToday: 'predikcí dnes',
    getDailyPicks: 'Získejte denní tipy zdarma',
    enterEmail: 'Zadejte svůj email',
    subscribeToNewsletter: 'Přihlásit',
    checkInbox: 'Zkontrolujte si email pro dnešní tipy!',
    startWinningNow: 'Začněte vyhrávat',
    viewTodaysPicks: 'Dnešní tipy',
    winningBettors: 'vítězných sázkaři',
    picksToday: 'tipů dnes',
    accuracy: 'přesnost',
    winStreak: 'vítězná série',
    weeklyAccuracy: 'Týdenní přesnost',
    vsLastWeek: 'oproti minulému týdnu',
    picksThisWeek: 'Tipů tento týden',
    updatedLive: 'Aktualizováno živě',
    growingDaily: 'Roste denně',
    userWinnings: 'Výhry uživatelů',
    thisMonth: 'Tento měsíc',
    howItWorks: 'Jak to funguje',
    startWinningIn3Steps: 'Začněte vyhrávat ve 3 krocích',
    step1Title: 'Registrace zdarma',
    step1Desc: 'Vytvořte si účet za 30 sekund. Bez platební karty.',
    step2Title: 'Získejte AI tipy',
    step2Desc: 'Dostávejte denní predikce s hodnocením jistoty a hloubkovou analýzou.',
    step3Title: 'Vyhrávejte více',
    step3Desc: 'Následujte tipy, sledujte výsledky a rozšiřujte svůj bankroll.',
    fromSignupToWinning: 'Od registrace k prvnímu vítěznému tipu za méně než 5 minut',
    successStories: 'Příběhy úspěchu',
    winnersTrustUs: 'Vítězové nám věří',
    joinCommunity: 'Připojte se ke komunitě, která již profituje s Edge88',
    bankLevelSecurity: 'Bankovní zabezpečení',
    noCreditCard: 'Bez platební karty',
    cancelAnytime: 'Zrušení kdykoliv',
    readyToWin: 'Připraveni vyhrávat?',
    joinWinningTeam: 'Připojte se k vítěznému týmu ještě dnes. Začněte zdarma.',
    
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
    losses: 'Proher',
    keepItGoing: 'Pokračujte!',
    accuracyBySport: 'Přesnost podle sportu',
    recentResults: 'Poslední výsledky',
    noRecentResults: 'Zatím žádné výsledky',
    
    // Predictions
    active: 'Aktivní',
    activePicks: 'Aktivní tipy',
    highConfidence: 'Vysoká jistota',
    locks: 'Jistoty',
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
    signUpToSeeMore: 'Registrujte se zdarma pro více',
    upgradeToSeeAll: 'Upgradujte na Pro pro všechny predikce',
    gameNumber: 'Zápas',
    gameTime: 'Čas zápasu',
    
    // Analysis
    viewAnalysis: 'Zobrazit analýzu',
    hideAnalysis: 'Skrýt analýzu',
    fullAnalysis: 'Kompletní analýza',
    whyThisPick: 'Proč tento tip',
    dataSources: 'Zdroje dat',
    verifiedSources: 'ověřených zdrojů',
    modelVersion: 'Verze modelu',
    keyFactors: 'Klíčové faktory',
    injuries: 'Zranění',
    weather: 'Počasí',
    sharpMoney: 'Sharp peníze',
    sentiment: 'Sentiment',
    headToHead: 'Vzájemné zápasy',
    oddsComparison: 'Porovnání kurzů',
    confidenceBreakdown: 'Rozklad jistoty',
    analyzedAt: 'Analyzováno v',
    researchSources: 'Zdroje výzkumu',
    analyzedSources: 'Analyzováno',
    bestOdds: 'Nejlepší kurzy',
    bestValue: 'Nejlepší hodnota',
    ago: 'před',
    minutes: 'min',
    hours: 'hod',
    research: 'Výzkum',
    odds: 'Kurzy',
    historical: 'Historie',
    
    // Event Detail Page
    vs: 'vs',
    ourPick: 'Náš tip',
    venue: 'Místo',
    analysis: 'Analýza',
    timeline: 'Časová osa',
    similarPredictions: 'Podobné minulé predikce',
    researchStats: 'Statistiky výzkumu',
    scannedArticles: 'Prohledaných článků',
    expertOpinions: 'Názorů expertů',
    injuryReports: 'Zpráv o zraněních',
    analyzedUpdated: 'Aktualizováno',
    lineMoved: 'Linka se posunula',
    
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
    tonightsGames: 'Dnešní zápasy',
    
    // Results
    verifiedPerformance: 'Ověřený výkon napříč všemi predikcemi',
    winRate: 'Míra výher',
    totalGraded: 'Celkem hodnoceno',
    dailyPerformance: 'Denní výkon',
    accuracyTrend: 'Trend přesnosti',
    accuracyByConfidence: 'Přesnost podle jistoty',
    sportLeaderboard: 'Žebříček sportů',
    winLossFeed: 'Přehled výher/proher',
    noResultsYet: 'Zatím žádné výsledky',
    noResultsDesc: 'Predikce jsou sledovány a objeví se zde po vyhodnocení',
    pending: 'Čeká',
    win: 'Výhra',
    loss: 'Prohra',
    
    // Saved Picks
    savedPicks: 'Uložené tipy',
    yourPicks: 'Vaše tipy',
    noSavedPicks: 'Zatím žádné uložené tipy',
    savePredictions: 'Ukládejte predikce pro sledování výkonu',
    trackRecord: 'Bilance',
    mySavedPicks: 'Moje uložené tipy',
    
    // User Menu
    myProfile: 'Můj profil',
    billingSubscription: 'Fakturace a předplatné',
    currentTier: 'Aktuální úroveň',
    paymentMethod: 'Platební metoda',
    manageSubscription: 'Spravovat předplatné',
    helpFaq: 'Nápověda a FAQ',
    emailAlerts: 'E-mailová upozornění',
    dailyPicksEmail: 'Denní tipy emailem',
    notificationPreferences: 'Nastavení oznámení',
    
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
    perYear: '/rok',
    features: 'Funkce',
    monthly: 'Měsíčně',
    annual: 'Ročně',
    savePercent: 'Ušetřete 20%',
    moneyBackGuarantee: '30denní záruka vrácení peněz',
    choosePlan: 'Vyberte si plán',
    currentPlan: 'Aktuální plán',
    getStartedFree: 'Začít zdarma',
    upgradeNow: 'Upgradovat',
    contactSales: 'Kontaktovat prodej',
    freePredictions: '3 predikce denně zdarma',
    basicAnalysis: 'Základní analýza',
    communityAccess: 'Přístup ke komunitě',
    allPredictions: 'Všechny predikce',
    fullAnalysisAccess: 'Plný přístup k analýzám',
    prioritySupport: 'Prioritní podpora',
    telegramAlerts: 'Telegram upozornění',
    apiAccess: 'API přístup',
    customModels: 'Vlastní modely',
    dedicatedSupport: 'Dedikovaná podpora',
    whiteLabel: 'White-label možnosti',
    
    // Footer
    footerTagline: 'Nejpokročilejší platforma pro sportovní predikce, poháněná AI.',
    quickLinks: 'Rychlé odkazy',
    legal: 'Právní',
    privacyPolicy: 'Ochrana soukromí',
    termsOfService: 'Podmínky služby',
    contact: 'Kontakt',
    allRightsReserved: 'Všechna práva vyhrazena.',
    product: 'Produkt',
    company: 'Společnost',
    about: 'O nás',
    responsibleGambling: 'Zodpovědné hraní',
    forEntertainmentOnly: 'Pouze pro zábavu',
    learnMore: 'Více info',
    gamblingWarning: 'Sázení může být návykové. Sázejte zodpovědně. Pouze pro zábavu.',
    
    // Errors
    error: 'Chyba',
    retry: 'Zkusit znovu',
    somethingWentWrong: 'Něco se pokazilo',
    
    // Auth
    email: 'E-mail',
    password: 'Heslo',
    confirmPassword: 'Potvrdit heslo',
    fullName: 'Celé jméno',
    forgotPassword: 'Zapomněli jste heslo?',
    rememberMe: 'Zapamatovat si mě',
    dontHaveAccount: 'Nemáte účet?',
    alreadyHaveAccount: 'Již máte účet?',
    continueWithGoogle: 'Pokračovat přes Google',
    orContinueWith: 'Nebo pokračovat pomocí',
    createAccount: 'Vytvořit účet',
    signInToAccount: 'Přihlaste se ke svému účtu',
    sendResetLink: 'Odeslat odkaz pro reset',
    backToLogin: 'Zpět na přihlášení',
    resetLinkSent: 'Odkaz odeslán!',
    checkEmailForReset: 'Zkontrolujte email pro instrukce k resetování hesla.',
    
    // Settings Page Extra
    applicationLanguage: 'Jazyk aplikace',
    chooseLanguage: 'Vyberte preferovaný jazyk',
    enablePush: 'Povolit push oznámení',
    instantNotifications: 'Dostávejte okamžitá upozornění v prohlížeči',
    alertHighConfidence: 'Upozornění na nové predikce s vysokou jistotou',
    toggleTheme: 'Přepnout mezi tmavým a světlým režimem',
    connectedAccounts: 'Propojené účty',
    telegram: 'Telegram',
    telegramDesc: 'Dostávejte tipy přímo do Telegramu',
    connect: 'Propojit',
    connected: 'Propojeno',
    dangerZone: 'Nebezpečná zóna',
    deleteAccount: 'Smazat účet',
    deleteAccountDesc: 'Trvale smazat váš účet a všechna data',
    deleteConfirm: 'Opravdu chcete smazat svůj účet?',
    deleteWarning: 'Tato akce je nevratná. Všechna vaše data budou trvale odstraněna.',
    cancel: 'Zrušit',
    yesDelete: 'Ano, smazat účet',
    saveChanges: 'Uložit změny',
    saving: 'Ukládání...',
    savedSuccess: 'Uloženo!',
    
    // Discussion
    discussion: 'Diskuse',
    loginToComment: 'Přihlaste se pro diskusi',
    writeComment: 'Napište komentář...',
    postComment: 'Odeslat komentář',
    reply: 'Odpovědět',
    replies: 'odpovědí',
    communitySentiment: 'Názor komunity',
    selectYourPick: 'Vyberte svůj tip',
  },
};

export function getTranslation(lang: Language): Translations {
  return translations[lang];
}
