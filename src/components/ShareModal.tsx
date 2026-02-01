import { useState, useRef } from 'react';
import { X, Copy, Check, Share2, Download, MessageCircle, Send, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReferrals } from '@/hooks/useReferrals';
import { APIPrediction } from '@/hooks/usePredictions';
import html2canvas from 'html2canvas';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: APIPrediction;
}

export function ShareModal({ isOpen, onClose, prediction }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const { language, t } = useLanguage();
  const { referralStats } = useReferrals();
  const shareCardRef = useRef<HTMLDivElement>(null);

  const referralCode = referralStats?.referralCode || 'EDGE88';
  const shareUrl = `https://edge88.app/predictions/${prediction.id}?ref=${referralCode}`;
  
  const shareText = language === 'cz'
    ? `🎯 Podívejte se na tento AI tip: ${prediction.prediction.pick} s ${prediction.confidence}% jistotou - Edge88`
    : `🎯 Check out this AI pick: ${prediction.prediction.pick} at ${prediction.confidence}% confidence - Edge88`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
  };

  const handleTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleGenerateImage = async () => {
    if (!shareCardRef.current) return;
    
    setGeneratingImage(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#0d1117',
        scale: 2,
        width: 540,
        height: 540,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `edge88-pick-${prediction.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setGeneratingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          {language === 'cz' ? 'Sdílet predikci' : 'Share Prediction'}
        </h3>

        {/* Share buttons grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={handleWhatsApp}
            className="h-14 flex-col gap-1 bg-[#25D366] hover:bg-[#20bd5a] text-white"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">WhatsApp</span>
          </Button>

          <Button
            onClick={handleTelegram}
            className="h-14 flex-col gap-1 bg-[#0088cc] hover:bg-[#0077b3] text-white"
          >
            <Send className="h-5 w-5" />
            <span className="text-xs">Telegram</span>
          </Button>

          <Button
            onClick={handleTwitter}
            className="h-14 flex-col gap-1 bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
          >
            <Twitter className="h-5 w-5" />
            <span className="text-xs">Twitter/X</span>
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="h-14 flex-col gap-1 border-primary/30"
          >
            {copied ? <Check className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
            <span className="text-xs">{copied ? (language === 'cz' ? 'Zkopírováno!' : 'Copied!') : (language === 'cz' ? 'Kopírovat' : 'Copy Link')}</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase">
            {language === 'cz' ? 'Nebo sdílet jako obrázek' : 'Or share as image'}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Share card preview */}
        <div 
          ref={shareCardRef}
          className="rounded-xl bg-gradient-to-br from-background to-card border border-border p-5 mb-4"
          style={{ width: '270px', height: '270px', margin: '0 auto' }}
        >
          <div className="text-center h-full flex flex-col justify-between">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <span className="font-bold text-lg">Edge88</span>
            </div>

            {/* Sport emoji */}
            <div className="text-4xl mb-2">⚽</div>

            {/* Teams */}
            <div className="text-sm text-muted-foreground mb-2">
              {prediction.homeTeam} vs {prediction.awayTeam}
            </div>

            {/* Pick */}
            <div className="mb-2">
              <div className="text-xs text-primary mb-1">
                {language === 'cz' ? 'Náš tip' : 'Our Pick'}
              </div>
              <div className="font-bold text-lg text-success line-clamp-2">
                {prediction.prediction.pick}
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="px-3 py-1 rounded-full bg-success/20 text-success font-bold text-sm">
                {prediction.confidence}% {language === 'cz' ? 'jistota' : 'confidence'}
              </div>
            </div>

            {/* Watermark */}
            <div className="text-xs text-muted-foreground">
              edge88.app
            </div>
          </div>
        </div>

        {/* Download button */}
        <Button
          onClick={handleGenerateImage}
          disabled={generatingImage}
          className="w-full btn-gradient gap-2"
        >
          <Download className="h-4 w-4" />
          {generatingImage 
            ? (language === 'cz' ? 'Generování...' : 'Generating...') 
            : (language === 'cz' ? 'Stáhnout obrázek (1080×1080)' : 'Download Image (1080×1080)')}
        </Button>

        {/* Referral note */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          {language === 'cz' 
            ? '🎁 Sdílené odkazy obsahují váš referral kód!'
            : '🎁 Shared links include your referral code!'}
        </p>
      </div>
    </div>
  );
}
