-- Create referrals table
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL,
    referred_user_id UUID,
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    tips_earned INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    converted_at TIMESTAMP WITH TIME ZONE
);

-- Create affiliate_clicks table
CREATE TABLE public.affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    casino_name VARCHAR(100) NOT NULL,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create win_streaks table for tracking
CREATE TABLE public.win_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    current_streak INTEGER DEFAULT 0,
    best_streak_month INTEGER DEFAULT 0,
    best_streak_all_time INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.win_streaks ENABLE ROW LEVEL SECURITY;

-- Referrals policies
CREATE POLICY "Users can view their own referrals"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Authenticated users can create referrals"
ON public.referrals FOR INSERT
WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Anyone can view referral codes for signup"
ON public.referrals FOR SELECT
USING (true);

CREATE POLICY "Users can update their own referrals"
ON public.referrals FOR UPDATE
USING (auth.uid() = referrer_user_id);

-- Affiliate clicks policies
CREATE POLICY "Anyone can insert affiliate clicks"
ON public.affiliate_clicks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view affiliate clicks"
ON public.affiliate_clicks FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Win streaks policies (public read for display)
CREATE POLICY "Anyone can view win streaks"
ON public.win_streaks FOR SELECT
USING (true);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to ensure user has a referral code
CREATE OR REPLACE FUNCTION ensure_user_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code VARCHAR(10);
    code_exists BOOLEAN;
BEGIN
    -- Generate unique code
    LOOP
        new_code := generate_referral_code();
        SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    -- Insert referral record for new user
    INSERT INTO public.referrals (referrer_user_id, referral_code, status)
    VALUES (NEW.id, new_code, 'active')
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger to create referral code on profile creation
CREATE TRIGGER create_referral_code_on_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION ensure_user_referral_code();

-- Insert initial win streak record
INSERT INTO public.win_streaks (current_streak, best_streak_month, best_streak_all_time)
VALUES (7, 12, 15);