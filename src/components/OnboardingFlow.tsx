import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Check, ArrowRight, ArrowLeft, Sparkles,
  Bell, BellOff, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SPORTS = [
  { id: 'NFL', name: 'NFL', icon: '🏈', description: 'American Football' },
  { id: 'NBA', name: 'NBA', icon: '🏀', description: 'Basketball' },
  { id: 'NHL', name: 'NHL', icon: '🏒', description: 'Hockey' },
  { id: 'MLB', name: 'MLB', icon: '⚾', description: 'Baseball' },
  { id: 'Soccer', name: 'Soccer', icon: '⚽', description: 'Football/Soccer' },
  { id: 'UFC', name: 'UFC', icon: '🥊', description: 'Mixed Martial Arts' },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [oddsFormat, setOddsFormat] = useState<'american' | 'decimal'>('american');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleComplete = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update profile with preferences
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
        title: '🎉 Welcome to Edge88!',
        description: 'Your preferences have been saved. Let\'s get your first picks!',
      });

      onComplete();
      navigate('/predictions');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error saving preferences',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl">
      <div className="w-full max-w-2xl mx-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="glass-card p-8 animate-fade-in">
          {/* Step 1: Choose Sports */}
          {step === 1 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Choose Your Sports</h2>
              <p className="text-muted-foreground mb-8">
                Select the sports you want to receive predictions for
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {SPORTS.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => toggleSport(sport.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
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
                    <span className="text-3xl">{sport.icon}</span>
                    <span className="font-semibold">{sport.name}</span>
                    <span className="text-xs text-muted-foreground">{sport.description}</span>
                  </button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                {selectedSports.length === 0 
                  ? 'Select at least one sport to continue'
                  : `${selectedSports.length} sport${selectedSports.length > 1 ? 's' : ''} selected`
                }
              </p>
            </div>
          )}

          {/* Step 2: Set Preferences */}
          {step === 2 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Set Your Preferences</h2>
              <p className="text-muted-foreground mb-8">
                Customize how you see odds and receive alerts
              </p>

              <div className="space-y-6 max-w-md mx-auto">
                {/* Odds Format */}
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-3 text-left">Odds Format</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setOddsFormat('american')}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-left',
                        oddsFormat === 'american'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="font-semibold">American</div>
                      <div className="text-sm text-muted-foreground">-110, +150</div>
                    </button>
                    <button
                      onClick={() => setOddsFormat('decimal')}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-left',
                        oddsFormat === 'decimal'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="font-semibold">Decimal</div>
                      <div className="text-sm text-muted-foreground">1.91, 2.50</div>
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-3 text-left">Notifications</h3>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all',
                      notificationsEnabled
                        ? 'border-success bg-success/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {notificationsEnabled ? (
                        <Bell className="h-5 w-5 text-success" />
                      ) : (
                        <BellOff className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <div className="font-semibold">
                          {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Get alerts for new picks
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      'h-6 w-11 rounded-full transition-colors',
                      notificationsEnabled ? 'bg-success' : 'bg-muted'
                    )}>
                      <div className={cn(
                        'h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform',
                        notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      )} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ready! */}
          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-success/20 to-primary/20 animate-pulse">
                <Sparkles className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-3xl font-bold mb-2">You're Ready! 🎉</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your personalized predictions are waiting. Get ready to find your edge.
              </p>

              <div className="glass-card p-6 mb-8 max-w-md mx-auto text-left">
                <h3 className="font-semibold mb-4">Your Setup:</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sports</span>
                    <div className="flex gap-1">
                      {selectedSports.slice(0, 3).map(s => {
                        const sport = SPORTS.find(sp => sp.id === s);
                        return <span key={s} className="text-lg">{sport?.icon}</span>;
                      })}
                      {selectedSports.length > 3 && (
                        <span className="text-sm text-muted-foreground">+{selectedSports.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Odds Format</span>
                    <span className="font-medium capitalize">{oddsFormat}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Notifications</span>
                    <span className={cn('font-medium', notificationsEnabled ? 'text-success' : 'text-muted-foreground')}>
                      {notificationsEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={step === 1 && selectedSports.length === 0}
                className="btn-gradient"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={isSubmitting}
                className="btn-gradient"
              >
                {isSubmitting ? 'Saving...' : 'Get My Picks'}
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
