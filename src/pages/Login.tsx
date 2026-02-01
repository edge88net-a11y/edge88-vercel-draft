import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from state, default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (!error) {
      navigate(from, { replace: true });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setResetEmailSent(true);
      toast({
        title: 'Check your email',
        description: 'We sent you a password reset link.',
      });
    }
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
          {forgotPasswordMode ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="mt-2 text-muted-foreground">
                  {resetEmailSent 
                    ? 'Check your email for the reset link' 
                    : 'Enter your email to receive a reset link'}
                </p>
              </div>

              {!resetEmailSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
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

                  <Button type="submit" className="btn-gradient w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="mb-4 text-4xl">📧</div>
                  <p className="text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
              )}

              <p className="mt-6 text-center text-sm text-muted-foreground">
                <button 
                  onClick={() => {
                    setForgotPasswordMode(false);
                    setResetEmailSent(false);
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  Back to login
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold">{t.welcomeBack}</h1>
                <p className="mt-2 text-muted-foreground">
                  Sign in to access your predictions
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium">Password</label>
                    <button 
                      type="button"
                      onClick={() => setForgotPasswordMode(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="btn-gradient w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>{t.login}</span>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-primary hover:underline">
                  {t.signUpFree}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
