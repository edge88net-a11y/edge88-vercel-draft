import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const tierConfig = {
  starter: {
    icon: '🎯',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  pro: {
    icon: '⚡',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  elite: {
    icon: '💎',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<{ tier: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  // Poll for subscription
  useEffect(() => {
    if (!user) return;

    let attempts = 0;
    const maxAttempts = 20; // 10 seconds max

    const pollSubscription = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setSubscription(data);
        setLoading(false);
        return true;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setLoading(false);
        return true;
      }
      return false;
    };

    const interval = setInterval(async () => {
      const found = await pollSubscription();
      if (found) clearInterval(interval);
    }, 500);

    pollSubscription();

    return () => clearInterval(interval);
  }, [user]);

  // Countdown redirect
  useEffect(() => {
    if (loading) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, navigate]);

  const tier = subscription?.tier || 'pro';
  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.pro;

  const features = {
    en: {
      starter: [
        'Access to 10 picks per day',
        'NHL + NBA coverage',
        'Email notifications active',
      ],
      pro: [
        'Unlimited predictions unlocked',
        'All sports coverage',
        'Real-time Telegram alerts',
        'Detailed AI analysis',
      ],
      elite: [
        'Everything in Pro',
        'Real-time Telegram alerts',
        'Mystical analysis unlocked',
        'Custom model training',
      ],
    },
    cz: {
      starter: [
        'Přístup k 10 tipům denně',
        'NHL + NBA pokrytí',
        'Email notifikace aktivní',
      ],
      pro: [
        'Neomezené predikce odemčeny',
        'Pokrytí všech sportů',
        'Real-time Telegram upozornění',
        'Detailní AI analýzy',
      ],
      elite: [
        'Vše z Pro plánu',
        'Real-time Telegram upozornění',
        'Mystická analýza odemčena',
        'Vlastní model trénink',
      ],
    },
  };

  const featureList = features[language as 'en' | 'cz']?.[tier as keyof typeof features.en] || features.en.pro;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full">
        <div className={`glass-card p-8 text-center border-2 ${config.borderColor}`}>
          {loading ? (
            <div className="py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">
                {language === 'cz' ? 'Ověřujeme platbu...' : 'Verifying payment...'}
              </p>
            </div>
          ) : (
            <>
              {/* Success Icon */}
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${config.bgColor}`}>
                <CheckCircle className={`h-12 w-12 ${config.color}`} />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-2">
                {language === 'cz' ? '✅ Platba úspěšná!' : '✅ Payment Successful!'}
              </h1>

              {/* Plan Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor} ${config.borderColor} border mb-6`}>
                <span className="text-xl">{config.icon}</span>
                <span className={`font-bold ${config.color}`}>{tier.toUpperCase()}</span>
              </div>

              <p className="text-muted-foreground mb-6">
                {language === 'cz' ? 'Děkujeme za důvěru!' : 'Thank you for your trust!'}
              </p>

              {/* Features List */}
              <div className="text-left bg-muted/30 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  {language === 'cz' ? 'Co máte odemčeno:' : "What's unlocked:"}
                </p>
                <ul className="space-y-2">
                  {featureList.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Auto-redirect notice */}
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'cz'
                  ? `Automatické přesměrování za ${countdown}s...`
                  : `Auto-redirecting in ${countdown}s...`}
              </p>

              {/* CTA Button */}
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full btn-gradient gap-2"
                size="lg"
              >
                {language === 'cz' ? 'Přejít na dashboard' : 'Go to Dashboard'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
