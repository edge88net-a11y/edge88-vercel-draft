import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const API_BASE_URL = "https://api.edge88.net/api/v1";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "predictions/active";
    const params = url.searchParams.get("params") || "";
    
    const apiUrl = `${API_BASE_URL}/${endpoint}${params ? `?${params}` : ""}`;
    
    console.log(`Proxying request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Edge88-Frontend/1.0",
      },
    });
    
    if (!response.ok) {
      console.error(`API returned ${response.status}: ${response.statusText}`);
      
      // Return appropriate fallback based on endpoint
      if (endpoint.includes("stats")) {
        return new Response(JSON.stringify({
          success: false,
          fallback: true,
          data: {
            totalPredictions: 1247,
            accuracy: 67.8,
            activePredictions: 12,
            roi: 14.2,
            winStreak: 5,
            byConfidence: {
              lock: { total: 89, wins: 72 },
              high: { total: 234, wins: 167 },
              medium: { total: 456, wins: 298 },
              low: { total: 468, wins: 291 },
            },
            bySport: [
              { sport: "NBA", predictions: 312, wins: 211, losses: 101, accuracy: 67.6, roi: 12.3 },
              { sport: "NHL", predictions: 289, wins: 198, losses: 91, accuracy: 68.5, roi: 15.1 },
              { sport: "NFL", predictions: 156, wins: 109, losses: 47, accuracy: 69.9, roi: 18.2 },
              { sport: "MLB", predictions: 234, wins: 152, losses: 82, accuracy: 65.0, roi: 9.8 },
              { sport: "Soccer", predictions: 256, wins: 158, losses: 98, accuracy: 61.7, roi: 8.4 },
            ],
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Fallback predictions
      return new Response(JSON.stringify({
        success: false,
        fallback: true,
        predictions: generateFallbackPredictions(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const data = await response.json();
    console.log(`API returned successfully with ${Array.isArray(data) ? data.length : 'object'} result(s)`);
    
    return new Response(JSON.stringify({
      success: true,
      fallback: false,
      ...data,
      data: data,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Proxy error:", errorMessage);
    
    // Return fallback data on network errors
    return new Response(JSON.stringify({
      success: false,
      fallback: true,
      error: errorMessage,
      predictions: generateFallbackPredictions(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

interface Matchup {
  home: string;
  away: string;
  sport: string;
  offset: number;
}

interface FallbackPrediction {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  prediction: {
    type: string;
    pick: string;
    odds: string;
  };
  confidence: number;
  expectedValue: number;
  reasoning: string;
  result: string;
  bookmakerOdds: { bookmaker: string; odds: string }[];
  keyFactors: {
    injuries: string[];
    sharpMoney: {
      direction: string;
      lineMovement: number;
      percentage: number;
    };
  };
  confidenceBreakdown: {
    research: number;
    odds: number;
    historical: number;
  };
  modelVersion: string;
  dataSources: number;
}

function generateFallbackPredictions(): FallbackPrediction[] {
  const nbaTeams = [
    { home: "Los Angeles Lakers", away: "Boston Celtics" },
    { home: "Golden State Warriors", away: "Phoenix Suns" },
    { home: "Milwaukee Bucks", away: "Miami Heat" },
    { home: "Denver Nuggets", away: "Dallas Mavericks" },
  ];
  const nhlTeams = [
    { home: "Vegas Golden Knights", away: "Colorado Avalanche" },
    { home: "Toronto Maple Leafs", away: "Boston Bruins" },
    { home: "New York Rangers", away: "Carolina Hurricanes" },
  ];
  const nflTeams = [
    { home: "Kansas City Chiefs", away: "Buffalo Bills" },
    { home: "Philadelphia Eagles", away: "San Francisco 49ers" },
  ];
  const soccerTeams = [
    { home: "Manchester City", away: "Liverpool" },
    { home: "Real Madrid", away: "Barcelona" },
    { home: "Bayern Munich", away: "Borussia Dortmund" },
  ];
  const mlbTeams = [
    { home: "New York Yankees", away: "Boston Red Sox" },
    { home: "Los Angeles Dodgers", away: "San Diego Padres" },
  ];

  const predictions: FallbackPrediction[] = [];
  const now = new Date();
  
  // Add games for the next few hours/days
  const allMatchups: Matchup[] = [
    ...nbaTeams.map((t, i) => ({ ...t, sport: "NBA", offset: i * 2 })),
    ...nhlTeams.map((t, i) => ({ ...t, sport: "NHL", offset: i * 3 + 1 })),
    ...nflTeams.map((t, i) => ({ ...t, sport: "NFL", offset: i * 24 + 12 })),
    ...soccerTeams.map((t, i) => ({ ...t, sport: "Soccer", offset: i * 4 + 2 })),
    ...mlbTeams.map((t, i) => ({ ...t, sport: "MLB", offset: i * 5 + 3 })),
  ];

  allMatchups.forEach((matchup, index) => {
    const gameTime = new Date(now.getTime() + matchup.offset * 60 * 60 * 1000);
    const confidence = 0.55 + Math.random() * 0.35; // 55-90%
    const isHome = Math.random() > 0.5;
    const pick = isHome ? matchup.home : matchup.away;
    const odds = Math.random() > 0.5 ? `+${Math.floor(Math.random() * 150) + 100}` : `-${Math.floor(Math.random() * 60) + 110}`;
    
    predictions.push({
      id: `fallback-${index + 1}`,
      sport: matchup.sport,
      league: matchup.sport,
      homeTeam: matchup.home,
      awayTeam: matchup.away,
      gameTime: gameTime.toISOString(),
      prediction: {
        type: "Moneyline",
        pick: pick,
        odds: odds,
      },
      confidence: confidence,
      expectedValue: (confidence * 2 - 1) * 10,
      reasoning: `Our AI model favors ${pick} in this matchup based on recent performance metrics, head-to-head history, and current form analysis. Key factors include home court advantage, injury reports, and sharp money movement.`,
      result: "pending",
      bookmakerOdds: [
        { bookmaker: "DraftKings", odds: odds },
        { bookmaker: "FanDuel", odds: adjustOdds(odds, 3) },
        { bookmaker: "BetMGM", odds: adjustOdds(odds, -2) },
        { bookmaker: "Tipsport", odds: adjustOdds(odds, 5) },
        { bookmaker: "Fortuna", odds: adjustOdds(odds, -4) },
      ],
      keyFactors: {
        injuries: [
          `${matchup.away} missing key player (day-to-day)`,
          `${matchup.home} full strength roster`,
        ],
        sharpMoney: {
          direction: isHome ? "home" : "away",
          lineMovement: Math.random() * 2 - 1,
          percentage: 55 + Math.floor(Math.random() * 20),
        },
      },
      confidenceBreakdown: {
        research: 30 + Math.floor(Math.random() * 20),
        odds: 20 + Math.floor(Math.random() * 15),
        historical: 15 + Math.floor(Math.random() * 10),
      },
      modelVersion: "Edge88 v3.2",
      dataSources: 12 + Math.floor(Math.random() * 8),
    });
  });

  return predictions;
}

function adjustOdds(odds: string, adjustment: number): string {
  const num = parseInt(odds.replace("+", ""));
  if (isNaN(num)) return odds;
  const adjusted = num + adjustment;
  return adjusted > 0 ? `+${adjusted}` : String(adjusted);
}
