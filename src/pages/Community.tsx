// CLEANED VERSION - NO FAKE USERS
// This is a placeholder until we have real user data
import { useState } from 'react';
import { Trophy, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Community() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'activity' | 'badges'>('leaderboard');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'cz' ? 'Komunita' : 'Community'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'cz' 
                ? 'Sledujte nejlepší sázkaře a získávejte odznaky'
                : 'Track top bettors and earn badges'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={cn(
            'px-4 py-2 font-medium transition-colors border-b-2',
            activeTab === 'leaderboard' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          {language === 'cz' ? 'Žebříček' : 'Leaderboard'}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={cn(
            'px-4 py-2 font-medium transition-colors border-b-2',
            activeTab === 'activity' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {language === 'cz' ? 'Aktivita' : 'Activity'}
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={cn(
            'px-4 py-2 font-medium transition-colors border-b-2',
            activeTab === 'badges' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          {language === 'cz' ? 'Odznaky' : 'Badges'}
        </button>
      </div>

      {/* Empty States */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {activeTab === 'leaderboard' && (
          <div className="max-w-md">
            <div className="mb-6 w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {language === 'cz' ? 'Buďte první v žebříčku!' : 'Be the first on the leaderboard!'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'cz'
                ? 'Sledujte predikce, vyhrávejte a získejte místo na žebříčku nejlepších sázkarů.'
                : 'Follow predictions, win big, and earn your spot among the top bettors.'}
            </p>
            <Button onClick={() => navigate('/predictions')} size="lg">
              {language === 'cz' ? 'Zobrazit predikce' : 'View Predictions'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="max-w-md">
            <div className="mb-6 w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {language === 'cz' ? 'Žádná aktivita' : 'No Activity Yet'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'cz'
                ? 'Sledujte své první predikce a staňte se součástí komunity.'
                : 'Follow your first predictions and become part of the community.'}
            </p>
            <Button onClick={() => navigate('/predictions')} size="lg">
              {language === 'cz' ? 'Začít' : 'Get Started'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="max-w-md">
            <div className="mb-6 w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {language === 'cz' ? 'Získejte své první odznaky' : 'Earn Your First Badges'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'cz'
                ? 'Sledujte predikce, vyhrávejte a odemykejte exkluzivní odznaky.'
                : 'Follow predictions, win bets, and unlock exclusive badges.'}
            </p>
            <div className="grid gap-3 mb-6 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-2xl">🌟</span>
                <div>
                  <div className="font-semibold">
                    {language === 'cz' ? 'První tip' : 'First Pick'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Sledujte svou první predikci' : 'Follow your first prediction'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-2xl">🔥</span>
                <div>
                  <div className="font-semibold">
                    {language === 'cz' ? 'Série výher' : 'Hot Streak'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Vyhrajte 5 predikcí v řadě' : 'Win 5 predictions in a row'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-2xl">💎</span>
                <div>
                  <div className="font-semibold">
                    {language === 'cz' ? 'Diamantové ruce' : 'Diamond Hands'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'cz' ? 'Vydržte 3 prohry a vraťte se' : 'Stay active during losing streaks'}
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/predictions')} size="lg">
              {language === 'cz' ? 'Začít získávat odznaky' : 'Start Earning Badges'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Coming Soon Badge */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === 'cz' 
              ? 'Plná komunita přichází brzy!' 
              : 'Full community features coming soon!'}
          </span>
        </div>
      </div>
    </div>
  );
}
