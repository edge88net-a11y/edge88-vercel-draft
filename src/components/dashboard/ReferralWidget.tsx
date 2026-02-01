import { useState } from 'react';
import { Copy, Check, Share2, Gift, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export function ReferralWidget() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { referralStats, isLoading } = useReferrals();
  const [copied, setCopied] = useState(false);

  const referralCode = referralStats?.referralCode || '';
  const referralUrl = `edge88.net/invite/${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${referralUrl}`);
      setCopied(true);
      toast({
        title: language === 'cz' ? '📋 Zkopírováno!' : '📋 Copied!',
        description: language === 'cz' 
          ? 'Odkaz byl zkopírován do schránky'
          : 'Link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTelegram = () => {
    const text = language === 'cz' 
      ? `🎯 Připoj se ke mně na Edge88 - AI sportovní predikce s 71% přesností! Získej 7 dní Pro zdarma: https://${referralUrl}`
      : `🎯 Join me on Edge88 - AI sports predictions with 71% accuracy! Get 7 days Pro free: https://${referralUrl}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(`https://${referralUrl}`)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Edge88 - AI Sports Predictions',
          text: language === 'cz' 
            ? 'Připoj se ke mně na Edge88 a získej AI tipy na sázky zdarma!'
            : 'Join me on Edge88 and get free AI betting tips!',
          url: `https://${referralUrl}`,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-4 sm:p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-10 w-full mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          {language === 'cz' ? 'Pozvěte přátele' : 'Invite Friends'}
        </h3>
        <Link to="/referral" className="text-xs text-primary hover:underline flex items-center gap-1">
          {language === 'cz' ? 'Více' : 'More'}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Code display */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border mb-3">
        <p className="text-xs text-muted-foreground mb-1">
          {language === 'cz' ? 'Váš kód:' : 'Your code:'}
        </p>
        <div className="flex items-center justify-between gap-2">
          <code className="font-mono font-bold text-lg tracking-wide text-primary">
            {referralCode || '---'}
          </code>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-8 px-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {referralUrl}
        </p>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy}
          className="flex-1 gap-1.5 h-9"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">
            {copied 
              ? (language === 'cz' ? 'Zkopírováno' : 'Copied')
              : (language === 'cz' ? 'Kopírovat' : 'Copy')}
          </span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShareTelegram}
          className="flex-1 gap-1.5 h-9"
        >
          📱
          <span className="hidden sm:inline">Telegram</span>
        </Button>
        <Button 
          size="sm" 
          onClick={handleNativeShare}
          className="btn-gradient flex-1 gap-1.5 h-9"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {language === 'cz' ? 'Sdílet' : 'Share'}
          </span>
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">
            {language === 'cz' ? 'Pozváno:' : 'Invited:'}
          </span>
          <span className="font-bold text-foreground">{referralStats?.totalReferred || 0}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Gift className="h-3.5 w-3.5 text-success" />
          <span className="text-muted-foreground">
            {language === 'cz' ? 'Bonus:' : 'Bonus:'}
          </span>
          <span className="font-bold text-success">
            +{referralStats?.tipsEarned || 0} {language === 'cz' ? 'tipů' : 'tips'}
          </span>
        </div>
      </div>

      {/* Milestone hint */}
      {(referralStats?.totalReferred || 0) < 5 && (
        <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/10 text-xs text-center">
          <span className="text-muted-foreground">
            {language === 'cz' 
              ? `Pozvěte ${5 - (referralStats?.totalReferred || 0)} dalších pro 1 měsíc Pro!`
              : `Invite ${5 - (referralStats?.totalReferred || 0)} more for 1 month Pro!`}
          </span>
        </div>
      )}
    </div>
  );
}
