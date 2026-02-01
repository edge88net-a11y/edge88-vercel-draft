import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  // Track scroll for subtle enhancement (but NOT for sticky behavior)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Public nav links
  const navLinks = [
    { href: '/#how-it-works', label: 'How It Works', labelCz: 'Jak to funguje', isAnchor: true },
    { href: '/blog', label: 'Blog', labelCz: 'Blog' },
    { href: '/pricing', label: 'Pricing', labelCz: 'Ceník' },
  ];

  // Handle anchor link clicks for smooth scrolling
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      
      if (location.pathname === '/' || path === '/') {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setIsOpen(false);
        }
      }
    }
  };

  // If user is logged in, redirect to dashboard
  if (user) {
    return null; // AppLayout handles logged-in users
  }

  return (
    <>
      {/* Main Navbar - NOT fixed, scrolls with page */}
      <nav 
        className={cn(
          "relative z-50 border-b transition-all duration-300",
          "bg-[hsl(230,25%,5%)]/80 backdrop-blur-xl",
          "border-white/[0.05]"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                <Zap className="h-5 w-5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-60" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#e6edf3]">
                Edge<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">88</span>
              </span>
            </Link>

            {/* Desktop Navigation - Text only links */}
            <div className="hidden md:flex md:items-center md:gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href || 
                  (link.href.startsWith('/#') && location.pathname === '/');
                const linkLabel = language === 'cz' ? link.labelCz : link.label;
                
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={(e) => link.isAnchor && handleAnchorClick(e, link.href)}
                    className={cn(
                      "relative text-sm font-medium transition-colors duration-200 py-2",
                      "group",
                      isActive
                        ? "text-cyan-400"
                        : "text-[#e6edf3]/70 hover:text-[#e6edf3]"
                    )}
                  >
                    {linkLabel}
                    {/* Hover underline animation */}
                    <span className={cn(
                      "absolute bottom-0 left-0 h-0.5 bg-cyan-400 transition-all duration-300",
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    )} />
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex md:items-center md:gap-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-1 text-sm">
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "transition-colors duration-200",
                    language === 'en' ? "text-cyan-400 font-medium" : "text-[#e6edf3]/50 hover:text-[#e6edf3]/70"
                  )}
                >
                  EN
                </button>
                <span className="text-[#e6edf3]/30">|</span>
                <button
                  onClick={() => setLanguage('cz')}
                  className={cn(
                    "transition-colors duration-200",
                    language === 'cz' ? "text-cyan-400 font-medium" : "text-[#e6edf3]/50 hover:text-[#e6edf3]/70"
                  )}
                >
                  CZ
                </button>
              </div>

              {loading ? (
                <div className="h-9 w-20 animate-pulse rounded-full bg-white/5" />
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="text-sm font-medium text-[#e6edf3]/70 hover:text-[#e6edf3] transition-colors duration-200"
                  >
                    {t.login}
                  </Link>
                  <Link to="/signup">
                    <Button 
                      size="sm" 
                      className={cn(
                        "rounded-full px-5 font-semibold",
                        "bg-gradient-to-r from-cyan-500 to-blue-600",
                        "hover:from-cyan-400 hover:to-blue-500",
                        "shadow-[0_0_20px_hsl(186,80%,50%,0.3)]",
                        "hover:shadow-[0_0_30px_hsl(186,80%,50%,0.5)]",
                        "transition-all duration-300",
                        "animate-subtle-pulse"
                      )}
                    >
                      {t.signUp} →
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: Sign Up + Hamburger */}
            <div className="flex items-center gap-3 md:hidden">
              <Link to="/signup">
                <Button 
                  size="sm" 
                  className={cn(
                    "rounded-full px-4 text-xs font-semibold",
                    "bg-gradient-to-r from-cyan-500 to-blue-600",
                    "shadow-[0_0_15px_hsl(186,80%,50%,0.3)]"
                  )}
                >
                  {t.signUp}
                </Button>
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-2 text-[#e6edf3]/70 transition-colors hover:bg-white/5 hover:text-[#e6edf3]"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[hsl(230,25%,5%)]/98 backdrop-blur-xl md:hidden">
          <div className="flex flex-col h-full pt-20 px-6">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                const linkLabel = language === 'cz' ? link.labelCz : link.label;
                
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={(e) => {
                      if (link.isAnchor) handleAnchorClick(e, link.href);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center py-4 text-2xl font-medium transition-colors",
                      "border-b border-white/[0.05]",
                      isActive
                        ? "text-cyan-400"
                        : "text-[#e6edf3] hover:text-cyan-400"
                    )}
                  >
                    {linkLabel}
                  </Link>
                );
              })}
            </div>

            {/* Language Toggle - Mobile */}
            <div className="flex items-center gap-4 py-6 border-b border-white/[0.05]">
              <span className="text-[#e6edf3]/50 text-sm">{language === 'cz' ? 'Jazyk' : 'Language'}:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm transition-all",
                    language === 'en' 
                      ? "bg-cyan-500/20 text-cyan-400 font-medium" 
                      : "text-[#e6edf3]/50"
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('cz')}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm transition-all",
                    language === 'cz' 
                      ? "bg-cyan-500/20 text-cyan-400 font-medium" 
                      : "text-[#e6edf3]/50"
                  )}
                >
                  CZ
                </button>
              </div>
            </div>

            {/* Auth Buttons - Mobile */}
            <div className="flex flex-col gap-3 mt-6">
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="lg" className="w-full border-white/10 text-[#e6edf3]">
                  {t.login}
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)}>
                <Button 
                  size="lg" 
                  className={cn(
                    "w-full rounded-full font-semibold",
                    "bg-gradient-to-r from-cyan-500 to-blue-600"
                  )}
                >
                  {t.signUp} →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Subtle pulse animation for CTA */}
      <style>{`
        @keyframes subtle-pulse {
          0%, 100% { box-shadow: 0 0 20px hsl(186 80% 50% / 0.3); }
          50% { box-shadow: 0 0 30px hsl(186 80% 50% / 0.5); }
        }
        .animate-subtle-pulse {
          animation: subtle-pulse 5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
