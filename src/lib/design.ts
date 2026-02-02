export const colors = {
  win: '#10b981',
  loss: '#ef4444',
  live: '#f59e0b',
  accent: '#06b6d4',
  gold: '#fbbf24',
  bg: {
    primary: '#0a0e1a',
    card: '#111827',
    cardHover: '#1a2332',
    surface: '#0d1525',
  },
  glow: {
    cyan: '0 0 20px rgba(6, 182, 212, 0.3)',
    emerald: '0 0 20px rgba(16, 185, 129, 0.3)',
    red: '0 0 20px rgba(239, 68, 68, 0.3)',
    gold: '0 0 20px rgba(251, 191, 36, 0.3)',
  }
};

export const animations = {
  countUp: { duration: 1.5, ease: 'easeOut' },
  fadeIn: { duration: 0.3, ease: 'easeInOut' },
  slideUp: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  pulse: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  glow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};
