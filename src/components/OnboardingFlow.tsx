import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Check, ArrowRight, ArrowLeft, Sparkles,
  Bell, BellOff, Globe, Target, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivePredictions } from '@/hooks/usePredictions';
import { TeamLogo } from '@/components/TeamLogo';
import { getSportEmoji } from '@/lib/sportEmoji';
import { normalizeConfidence } from '@/lib/confidenceUtils';

const SPORTS = [
  { id: 'NHL', name: 'NHL', icon: '🏒', descriptionCz: 'Hokej', descriptionEn: 'Hockey' },
  { id: 'NBA', name: 'NBA', icon: '🏀', descriptionCz: 'Basketbal', descriptionEn: 'Basketball' },
  { id: 'Soccer', name: 'Soccer', icon: '⚽', descriptionCz: 'Fotbal', descriptionEn: 'Football/Soccer' },
  { id: 'UFC', name: 'UFC', icon: '🥊', descriptionCz: 'MMA', descriptionEn: 'Mixed Martial Arts' },
  { id: 'NFL', name: 'NFL', icon: '🏈', descriptionCz: 'Americký fotbal', descriptionEn: 'American Football' },
  { id: 'MLB', name: 'MLB', icon: '⚾', descriptionCz: 'Baseball', descriptionEn: 'Baseball' },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>(['NHL', 'NBA']);
  const [oddsFormat, setOddsFormat] = useState<'american' | 'decimal'>('decimal');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailDailyPicks, setEmailDailyPicks] = useState(true);
  const [emailResults, setEmailResults] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: predictions } = useActivePredictions();

  // Get highest confidence prediction for step 3
  const topPrediction = predictions
    ?.filter(p => p.result === 'pending')
    ?.sort((a, b) => normalizeConfidence(b.confidence) - normalizeConfidence(a.confidence))
    ?.[0];

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const toggleSport = (sportId: string) => {
    setSelectedSports(prev => 
      prev.includes(sportId) 
        ? prev.filter(s => s !== sportId)
        : [...prev, sportId]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          favorite_sports: selectedSports,
          odds_format: oddsFormat,
          notifications_enabled: notificationsEnabled,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: language === 'cz' ? '🎉 Vítejte v Edge88!' : '🎉 Welcome to Edge88!',
        description: language === 'cz' 
          ? 'Vaše preference byly uloženy.'
          : 'Your preferences have been saved.',
      });

      onComplete();
      navigate('/predictions');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: language === 'cz' ? 'Chyba při ukládání' : 'Error saving preferences',
        description: language === 'cz' ? 'Zkuste to prosím znovu.' : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAnalysis = () => {
    if (topPrediction) {
      handleComplete();
      navigate(`/predictions/${topPrediction.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl overflow-y-auto p-4">
      <div className="w-full max-w-2xl mx-auto my-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {language === 'cz' ? `Krok ${step} z ${totalSteps}` : `Step ${step} of ${totalSteps}`}
            </span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="glass-card p-6 sm:p-8 animate-fade-in">
          {/* Step 1: Choose Sports */}
          {step === 1 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {language === 'cz' ? 'Vyberte své sporty' : 'Choose Your Sports'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {language === 'cz' 
                  ? 'Vybereme pro vás nejlepší predikce'
                  : 'We\'ll prioritize predictions for your favorites'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
                {SPORTS.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => toggleSport(sport.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all',
                      selectedSports.includes(sport.id)
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    {selectedSports.includes(sport.id) && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <span className="text-2xl sm:text-3xl">{sport.icon}</span>
                    <span className="font-semibold text-sm sm:text-base">{sport.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {language === 'cz' ? sport.descriptionCz : sport.descriptionEn}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                {selectedSports.length === 0 
                  ? (language === 'cz' ? 'Vyberte alespoň jeden sport' : 'Select at least one sport')
                  : (language === 'cz' 
                      ? `${selectedSports.length} ${selectedSports.length === 1 ? 'sport vybrán' : selectedSports.length < 5 ? 'sporty vybrány' : 'sportů vybráno'}`
                      : `${selectedSports.length} sport${selectedSports.length > 1 ? 's' : ''} selected`)
                }
              </p>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {language === 'cz' ? 'Nastavení' : 'Preferences'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {language === 'cz' 
                  ? 'Přizpůsobte si své zážitky'
                  : 'Customize your experience'}
              </p>

              <div className="space-y-6 max-w-md mx-auto text-left">
                {/* Language */}
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-3">
                    {language === 'cz' ? 'Jazyk' : 'Language'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLanguage('cz')}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all flex items-center gap-2',
                        language === 'cz'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <span className="text-xl">🇨🇿</span>
                      <span className="font-medium">Čeština</span>
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all flex items-center gap-2',
                        language === 'en'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <span className="text-xl">🇬🇧</span>
                      <span className="font-medium">English</span>
                    </button>
                  </div>
                </div>

                {/* Odds Format */}
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-3">
                    {language === 'cz' ? 'Formát kurzů' : 'Odds Format'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setOddsFormat('decimal')}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-left',
                        oddsFormat === 'decimal'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="font-semibold">
                        {language === 'cz' ? 'Desetinné' : 'Decimal'}
                      </div>
                      <div className="text-sm text-muted-foreground">1.91, 2.50</div>
                    </button>
                    <button
                      onClick={() => setOddsFormat('american')}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-left',
                        oddsFormat === 'american'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="font-semibold">
                        {language === 'cz' ? 'Americké' : 'American'}
                      </div>
                      <div className="text-sm text-muted-foreground">-110, +150</div>
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-3">
                    {language === 'cz' ? 'Notifikace' : 'Notifications'}
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setEmailDailyPicks(!emailDailyPicks)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all',
                        emailDailyPicks
                          ? 'border-success bg-success/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <span className="text-sm font-medium">
                        {language === 'cz' ? '✉️ Email denní tipy' : '✉️ Email daily picks'}
                      </span>
                      <div className={cn(
                        'h-5 w-9 rounded-full transition-colors flex items-center px-0.5',
                        emailDailyPicks ? 'bg-success' : 'bg-muted'
                      )}>
                        <div className={cn(
                          'h-4 w-4 rounded-full bg-white transition-transform',
                          emailDailyPicks ? 'translate-x-4' : 'translate-x-0'
                        )} />
                      </div>
                    </button>
                    <button
                      onClick={() => setEmailResults(!emailResults)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all',
                        emailResults
                          ? 'border-success bg-success/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <span className="text-sm font-medium">
                        {language === 'cz' ? '📊 Email výsledky' : '📊 Email results'}
                      </span>
                      <div className={cn(
                        'h-5 w-9 rounded-full transition-colors flex items-center px-0.5',
                        emailResults ? 'bg-success' : 'bg-muted'
                      )}>
                        <div className={cn(
                          'h-4 w-4 rounded-full bg-white transition-transform',
                          emailResults ? 'translate-x-4' : 'translate-x-0'
                        )} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Your First Pick */}
          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-success/20 to-primary/20">
                <Target className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                {language === 'cz' ? '🎯 Váš první tip ZDARMA!' : '🎯 Your First Pick FREE!'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {language === 'cz' 
                  ? 'Tady je náš aktuálně nejjistější tip'
                  : 'Here\'s our highest confidence pick right now'}
              </p>

              {topPrediction ? (
                <div className="glass-card p-6 mb-8 max-w-md mx-auto text-left border-2 border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{getSportEmoji(topPrediction.sport)}</span>
                    <span className="text-sm text-muted-foreground">{topPrediction.league || topPrediction.sport}</span>
                    <span className="ml-auto px-2 py-1 rounded-full text-xs font-bold bg-success/20 text-success">
                      {normalizeConfidence(topPrediction.confidence)}% {language === 'cz' ? 'jistota' : 'confidence'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <TeamLogo teamName={topPrediction.homeTeam} sport={topPrediction.sport} size="md" />
                      <span className="font-medium text-sm">{topPrediction.homeTeam}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{topPrediction.awayTeam}</span>
                      <TeamLogo teamName={topPrediction.awayTeam} sport={topPrediction.sport} size="md" />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm font-medium">
                      {language === 'cz' ? 'Náš tip:' : 'Our pick:'}{' '}
                      <span className="text-primary font-bold">{topPrediction.prediction?.pick || topPrediction.homeTeam}</span>
                    </p>
                  </div>

                  <Button 
                    onClick={handleViewAnalysis} 
                    variant="outline" 
                    className="w-full mt-4 gap-2"
                  >
                    {language === 'cz' ? 'Zobrazit detailní analýzu' : 'View detailed analysis'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="glass-card p-6 mb-8 max-w-md mx-auto text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'cz' 
                      ? 'Právě připravujeme nové predikce...'
                      : 'We\'re preparing fresh predictions...'}
                  </p>
                </div>
              )}

              {/* Summary */}
              <div className="glass-card p-4 max-w-md mx-auto text-left">
                <h3 className="font-semibold mb-3 text-sm">
                  {language === 'cz' ? 'Vaše nastavení:' : 'Your setup:'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{language === 'cz' ? 'Sporty' : 'Sports'}</span>
                    <div className="flex gap-1">
                      {selectedSports.slice(0, 4).map(s => {
                        const sport = SPORTS.find(sp => sp.id === s);
                        return <span key={s} className="text-lg">{sport?.icon}</span>;
                      })}
                      {selectedSports.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{selectedSports.length - 4}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{language === 'cz' ? 'Jazyk' : 'Language'}</span>
                    <span className="font-medium">{language === 'cz' ? '🇨🇿 Čeština' : '🇬🇧 English'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{language === 'cz' ? 'Kurzy' : 'Odds'}</span>
                    <span className="font-medium capitalize">{oddsFormat === 'decimal' ? (language === 'cz' ? 'Desetinné' : 'Decimal') : (language === 'cz' ? 'Americké' : 'American')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <div className="flex items-center gap-2">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack} size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'cz' ? 'Zpět' : 'Back'}
                </Button>
              ) : (
                <div />
              )}
              <Button variant="ghost" onClick={handleSkip} size="sm" className="text-muted-foreground">
                {language === 'cz' ? 'Přeskočit →' : 'Skip →'}
              </Button>
            </div>

            {step < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={step === 1 && selectedSports.length === 0}
                className="btn-gradient"
              >
                {language === 'cz' ? 'Pokračovat' : 'Continue'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={isSubmitting}
                className="btn-gradient"
              >
                {isSubmitting 
                  ? (language === 'cz' ? 'Ukládám...' : 'Saving...')
                  : (language === 'cz' ? 'Přejít na dashboard' : 'Go to Dashboard')}
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
