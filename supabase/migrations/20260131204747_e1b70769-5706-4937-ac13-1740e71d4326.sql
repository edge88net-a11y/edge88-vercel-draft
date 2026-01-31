-- Enable RLS on users table (note: this is a custom users table, not auth.users)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public can view basic user info, but only owner can update
CREATE POLICY "Anyone can view users" 
ON public.users FOR SELECT USING (true);

-- Fix the update_updated_at_column function search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;