import { Link } from 'react-router-dom';
import { Zap, Twitter, Send, MessageCircle, Mail, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/edge88net', label: 'Twitter' },
  { icon: Send, href: 'https://t.me/edge88', label: 'Telegram' },
  { icon: MessageCircle, href: 'https://discord.gg/edge88', label: 'Discord' },
  { icon: Mail, href: 'mailto:support@edge88.net', label: 'Email' },
];

export function Footer() {
  const { t, language } = useLanguage();

  const footerLinks = {
    product: [
      { label: t.dashboard, href: '/dashboard' },
      { label: t.predictions, href: '/predictions' },
      { label: t.results, href: '/results' },
      { label: t.pricing, href: '/pricing' },
    ],
    company: [
      { label: language === 'cz' ? 'O nás' : 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: language === 'cz' ? 'Kontakt' : 'Contact', href: 'mailto:support@edge88.net' },
    ],
    legal: [
      { label: t.termsOfService, href: '/terms' },
      { label: t.privacyPolicy, href: '/privacy' },
      { label: language === 'cz' ? 'Zodpovědné hraní' : 'Responsible Gambling', href: '/responsible-gambling' },
    ],
  };

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Responsible Gambling Notice */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
          <div className="flex items-center gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <p className="text-muted-foreground">
              <span className="font-medium text-amber-400">18+</span> • {' '}
              {language === 'cz'
                ? 'Sázení může být návykové. Sázejte zodpovědně. Pouze pro zábavu.'
                : 'Gambling can be addictive. Bet responsibly. For entertainment purposes only.'}
              {' '}
              <Link to="/responsible-gambling" className="text-primary hover:underline">
                {language === 'cz' ? 'Více info' : 'Learn more'}
              </Link>
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Edge<span className="gradient-text">88</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {t.footerTagline}
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              {language === 'cz' ? 'Produkt' : 'Product'}
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              {language === 'cz' ? 'Společnost' : 'Company'}
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              {t.legal}
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Edge88. {t.allRightsReserved}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>🇺🇸 🇨🇿 🇬🇧</span>
            <span>•</span>
            <span>{language === 'cz' ? 'Pouze pro zábavu' : 'For entertainment only'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
