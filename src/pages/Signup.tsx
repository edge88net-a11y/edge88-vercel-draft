import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, User, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const benefits = language === 'cz' 
    ? [
        'AI predikce pro všechny sporty',
        'Ověřená přesnost, plně transparentní',
        'Začněte se 3 tipy denně zdarma',
      ]
    : [
        'AI-powered predictions across all sports',
        'Verified accuracy, fully transparent',
        'Start with 3 free picks daily',
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return;
    
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    
    // Note: After email confirmation, the user will be redirected to the app
    // The dashboard will show the onboarding flow if onboarding_completed is false
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Edge<span className="gradient-text">88</span>
          </span>
        </Link>

        {/* Card */}
        <div className="glass-card p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">{t.createFreeAccount}</h1>
            <p className="mt-2 text-muted-foreground">
              {t.startPredicting}
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-6 rounded-xl bg-success/10 p-4">
            <ul className="space-y-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="h-4 w-4" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <Button type="submit" className="btn-gradient w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span>{t.createFreeAccount}</span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t.login}
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing up, you agree to our{' '}
            <a href="#" className="underline hover:text-foreground">{t.termsOfService}</a> and{' '}
            <a href="#" className="underline hover:text-foreground">{t.privacyPolicy}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
