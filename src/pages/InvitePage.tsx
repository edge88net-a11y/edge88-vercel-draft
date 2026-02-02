import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Gift, Zap, Star, ArrowRight, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SEOHead } from '@/components/SEOHead';

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateCode = async () => {
      if (!code) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      try {
        // Look up the referral code
        const { data: referral, error } = await supabase
          .from('referrals')
          .select('referrer_user_id, referral_code')
          .eq('referral_code', code.toUpperCase())
          .eq('status', 'active')
          .maybeSingle();

        if (error || !referral) {
          setIsValid(false);
          setIsLoading(false);
          return;
        }

        // Get referrer's display name from user_profiles (id = user_id)
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('id', referral.referrer_user_id)
          .maybeSingle();

        setReferrerName(profile?.display_name || 'A friend');
        setIsValid(true);

        // Store the code in session for signup
        sessionStorage.setItem('referral_code', code.toUpperCase());
      } catch (err) {
        console.error('Error validating invite code:', err);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateCode();
  }, [code]);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SEOHead 
          title={language === 'cz' ? 'Neplatná pozvánka' : 'Invalid Invitation'}
          noindex
        />
        <div className="glass-card p-8 text-center max-w-md w-full">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/20">
            <Gift className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {language === 'cz' ? 'Neplatný kód' : 'Invalid Code'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'cz' 
              ? 'Tento pozvánkový kód není platný nebo již byl použit.'
              : 'This invitation code is invalid or has already been used.'}
          </p>
          <Link to="/signup">
            <Button className="btn-gradient w-full">
              {language === 'cz' ? 'Zaregistrovat se normálně' : 'Sign Up Normally'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <SEOHead 
        title={language === 'cz' ? 'Byli jste pozváni!' : "You're Invited!"}
        description={language === 'cz' 
          ? 'Připojte se k Edge88 a získejte 7 dní Pro plánu zdarma.'
          : 'Join Edge88 and get 7 days of Pro plan free.'}
        noindex
      />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="glass-card p-8 sm:p-12 text-center max-w-lg w-full relative animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-6">
          <Gift className="h-4 w-4" />
          <span>{language === 'cz' ? 'Exkluzivní pozvánka' : 'Exclusive Invitation'}</span>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent animate-pulse">
          <Zap className="h-10 w-10 text-white" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-black mb-4">
          {language === 'cz' ? 'Byli jste pozváni do' : "You're Invited to"}
          <span className="gradient-text block">Edge88!</span>
        </h1>

        {/* Referrer */}
        <p className="text-lg text-muted-foreground mb-6">
          {language === 'cz' 
            ? `${referrerName} vám dal přístup k AI sportovním predikcím`
            : `${referrerName} gave you access to AI sports predictions`}
        </p>

        {/* Bonus Box */}
        <div className="glass-card p-6 mb-8 bg-gradient-to-br from-success/10 to-primary/5 border-2 border-success/30">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Star className="h-6 w-6 text-warning fill-warning" />
            <span className="text-xl font-bold text-success">
              {language === 'cz' ? '7 dní Pro ZDARMA' : '7 Days Pro FREE'}
            </span>
            <Star className="h-6 w-6 text-warning fill-warning" />
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ {language === 'cz' ? 'Neomezené predikce' : 'Unlimited predictions'}</li>
            <li>✓ {language === 'cz' ? 'Detailní AI analýza' : 'Detailed AI analysis'}</li>
            <li>✓ {language === 'cz' ? 'Telegram notifikace' : 'Telegram notifications'}</li>
          </ul>
        </div>

        {/* CTA */}
        <Link to={`/signup?ref=${code}`}>
          <Button size="lg" className="btn-gradient w-full text-lg h-14 gap-2">
            {language === 'cz' ? 'Vytvořit účet' : 'Create Account'}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>

        {/* Stats */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>500+ {language === 'cz' ? 'uživatelů' : 'users'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span>71% {language === 'cz' ? 'přesnost' : 'accuracy'}</span>
          </div>
        </div>

        {/* Already have account */}
        <p className="mt-6 text-sm text-muted-foreground">
          {language === 'cz' ? 'Již máte účet?' : 'Already have an account?'}{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {language === 'cz' ? 'Přihlásit se' : 'Log in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
