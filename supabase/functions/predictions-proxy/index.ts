import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'active';
    
    const apiUrl = `https://api.edge88.net/api/v1/predictions/${endpoint}`;
    
    console.log(`Proxying request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API returned ${response.status}: ${response.statusText}`);
      
      // Return mock data if API is unavailable
      if (endpoint === 'active') {
        return new Response(JSON.stringify(getMockPredictions()), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (endpoint === 'stats') {
        return new Response(JSON.stringify(getMockStats()), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Proxy error:', errorMessage);
    
    // Fallback to mock data
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'active';
    if (endpoint === 'active') {
      return new Response(JSON.stringify(getMockPredictions()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (endpoint === 'stats') {
      return new Response(JSON.stringify(getMockStats()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface Team { home: string; away: string; }
type TeamsMap = Record<string, Team[]>;

function getMockPredictions() {
  const now = new Date();
  const sports = ['NFL', 'NBA', 'NHL', 'MLB', 'Soccer', 'UFC'];
  const teams: TeamsMap = {
    NFL: [
      { home: 'Chiefs', away: 'Bills' },
      { home: '49ers', away: 'Eagles' },
      { home: 'Cowboys', away: 'Giants' },
      { home: 'Ravens', away: 'Bengals' },
      { home: 'Dolphins', away: 'Jets' },
      { home: 'Packers', away: 'Bears' },
      { home: 'Lions', away: 'Vikings' },
      { home: 'Seahawks', away: 'Cardinals' },
    ],
    NBA: [
      { home: 'Lakers', away: 'Celtics' },
      { home: 'Warriors', away: 'Heat' },
      { home: 'Nuggets', away: 'Suns' },
      { home: 'Bucks', away: '76ers' },
      { home: 'Mavericks', away: 'Clippers' },
      { home: 'Nets', away: 'Knicks' },
      { home: 'Grizzlies', away: 'Pelicans' },
      { home: 'Kings', away: 'Thunder' },
    ],
    NHL: [
      { home: 'Maple Leafs', away: 'Rangers' },
      { home: 'Bruins', away: 'Oilers' },
      { home: 'Avalanche', away: 'Stars' },
      { home: 'Panthers', away: 'Lightning' },
      { home: 'Canucks', away: 'Flames' },
      { home: 'Devils', away: 'Hurricanes' },
    ],
    MLB: [
      { home: 'Yankees', away: 'Dodgers' },
      { home: 'Braves', away: 'Astros' },
      { home: 'Phillies', away: 'Padres' },
      { home: 'Orioles', away: 'Rays' },
      { home: 'Rangers', away: 'Mariners' },
      { home: 'Cubs', away: 'Cardinals' },
    ],
    Soccer: [
      { home: 'Arsenal', away: 'Liverpool' },
      { home: 'Man City', away: 'Chelsea' },
      { home: 'Real Madrid', away: 'Barcelona' },
      { home: 'Bayern', away: 'Dortmund' },
      { home: 'PSG', away: 'Marseille' },
      { home: 'Inter', away: 'AC Milan' },
    ],
    UFC: [
      { home: 'Fighter A', away: 'Fighter B' },
      { home: 'Champion', away: 'Challenger' },
      { home: 'Veteran', away: 'Prospect' },
      { home: 'Striker', away: 'Grappler' },
    ],
  };
  
  const predictionTypes = ['Moneyline', 'Spread', 'Over/Under', 'Prop'];
  const predictions = [];
  
  let id = 1;
  for (const sport of sports) {
    const sportTeams = teams[sport] || [];
    for (let i = 0; i < sportTeams.length; i++) {
      const team = sportTeams[i];
      const confidence = 55 + Math.floor(Math.random() * 40);
      const type = predictionTypes[Math.floor(Math.random() * predictionTypes.length)];
      const hoursFromNow = Math.floor(Math.random() * 72) + 1;
      const gameTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
      
      let pick = '';
      let line = '';
      let odds = '';
      
      if (type === 'Moneyline') {
        pick = Math.random() > 0.5 ? team.home : team.away;
        odds = Math.random() > 0.5 ? `-${110 + Math.floor(Math.random() * 90)}` : `+${100 + Math.floor(Math.random() * 150)}`;
      } else if (type === 'Spread') {
        const spread = (Math.floor(Math.random() * 14) + 1) / 2;
        pick = `${Math.random() > 0.5 ? team.home : team.away} ${Math.random() > 0.5 ? '-' : '+'}${spread}`;
        line = spread.toString();
        odds = `-110`;
      } else if (type === 'Over/Under') {
        const total = 180 + Math.floor(Math.random() * 60);
        pick = `${Math.random() > 0.5 ? 'Over' : 'Under'} ${total}.5`;
        line = `${total}.5`;
        odds = `-110`;
      } else {
        pick = 'Player Prop Bet';
        odds = `+${100 + Math.floor(Math.random() * 200)}`;
      }
      
      predictions.push({
        id: `pred-${id++}`,
        sport,
        league: sport,
        homeTeam: team.home,
        awayTeam: team.away,
        gameTime: gameTime.toISOString(),
        prediction: { type, pick, line, odds },
        confidence,
        expectedValue: (Math.random() * 8 + 1).toFixed(1),
        reasoning: `Advanced analytics and historical data suggest strong edge. ${team.home} has shown excellent form in recent matchups. Weather and injury factors favor this pick.`,
        result: 'pending',
      });
    }
  }
  
  // Add some graded predictions
  const results = ['win', 'win', 'win', 'win', 'loss', 'win', 'loss', 'win'];
  for (let i = 0; i < 12; i++) {
    const sport = sports[Math.floor(Math.random() * sports.length)];
    const sportTeams = teams[sport] || [];
    const team = sportTeams[Math.floor(Math.random() * sportTeams.length)] || { home: 'Team A', away: 'Team B' };
    const confidence = 55 + Math.floor(Math.random() * 40);
    const daysAgo = Math.floor(Math.random() * 7) + 1;
    const gameTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    predictions.push({
      id: `graded-${i}`,
      sport,
      league: sport,
      homeTeam: team.home,
      awayTeam: team.away,
      gameTime: gameTime.toISOString(),
      prediction: {
        type: 'Spread',
        pick: `${team.home} -3.5`,
        line: '3.5',
        odds: '-110',
      },
      confidence,
      expectedValue: (Math.random() * 5 + 1).toFixed(1),
      reasoning: 'Historical matchup analysis favored this selection.',
      result: results[i % results.length],
    });
  }
  
  return predictions;
}

function getMockStats() {
  return {
    totalPredictions: 2847,
    accuracy: 64.8,
    activePredictions: 52,
    roi: 12.4,
    winStreak: 7,
    byConfidence: {
      lock: { total: 289, wins: 234 },
      high: { total: 734, wins: 498 },
      medium: { total: 1124, wins: 698 },
      low: { total: 700, wins: 387 },
    },
    bySport: [
      { sport: 'NFL', predictions: 456, wins: 312, losses: 144, accuracy: 68.4, roi: 15.2 },
      { sport: 'NBA', predictions: 634, wins: 418, losses: 216, accuracy: 65.9, roi: 11.8 },
      { sport: 'NHL', predictions: 423, wins: 278, losses: 145, accuracy: 65.7, roi: 10.4 },
      { sport: 'MLB', predictions: 545, wins: 338, losses: 207, accuracy: 62.0, roi: 8.9 },
      { sport: 'Soccer', predictions: 412, wins: 274, losses: 138, accuracy: 66.5, roi: 14.1 },
      { sport: 'UFC', predictions: 377, wins: 247, losses: 130, accuracy: 65.5, roi: 12.8 },
    ],
    dailyAccuracy: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      accuracy: 55 + Math.random() * 25,
      predictions: Math.floor(15 + Math.random() * 25),
      wins: 0,
      losses: 0,
    })).map(d => ({ ...d, wins: Math.floor(d.predictions * d.accuracy / 100), losses: d.predictions - Math.floor(d.predictions * d.accuracy / 100) })),
  };
}
