import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full">
        <div className="glass-card p-8 text-center border border-border">
          {/* Cancel Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <XCircle className="h-12 w-12 text-muted-foreground" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2">
            {language === 'cz' ? 'Platba zrušena' : 'Payment Cancelled'}
          </h1>

          <p className="text-muted-foreground mb-6">
            {language === 'cz'
              ? 'Žádná platba nebyla provedena. Můžete se kdykoli vrátit.'
              : 'No payment was made. You can come back anytime.'}
          </p>

          {/* Info Box */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-muted-foreground">
              {language === 'cz'
                ? 'Máte dotazy? Kontaktujte nás na support@edge88.net nebo navštivte naše FAQ.'
                : 'Have questions? Contact us at support@edge88.net or visit our FAQ.'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/pricing')}
              className="w-full btn-gradient gap-2"
              size="lg"
            >
              <CreditCard className="h-4 w-4" />
              {language === 'cz' ? 'Zpět na ceník' : 'Back to Pricing'}
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === 'cz' ? 'Pokračovat zdarma' : 'Continue Free'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
