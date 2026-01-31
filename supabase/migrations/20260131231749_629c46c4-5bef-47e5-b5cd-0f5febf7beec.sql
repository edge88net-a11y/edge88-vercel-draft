-- Create newsletter_subscribers table for email captures
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  source VARCHAR(50) DEFAULT 'homepage'
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for signups)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Only service role can read/manage subscribers
CREATE POLICY "Service role can manage subscribers" 
ON public.newsletter_subscribers 
FOR ALL 
USING (auth.role() = 'service_role');

-- Add onboarding_completed field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS favorite_sports TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS odds_format VARCHAR(20) DEFAULT 'american',
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;