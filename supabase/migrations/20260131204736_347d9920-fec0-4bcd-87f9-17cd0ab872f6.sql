-- Enable RLS on remaining tables with public read access
ALTER TABLE public.odds_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_weather ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sharp_money_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Public read policies for odds and research data
CREATE POLICY "Anyone can view odds history" 
ON public.odds_history FOR SELECT USING (true);

CREATE POLICY "Anyone can view research" 
ON public.research FOR SELECT USING (true);

CREATE POLICY "Anyone can view game research" 
ON public.game_research FOR SELECT USING (true);

CREATE POLICY "Anyone can view game weather" 
ON public.game_weather FOR SELECT USING (true);

CREATE POLICY "Anyone can view sharp money moves" 
ON public.sharp_money_moves FOR SELECT USING (true);

-- Users can only view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);