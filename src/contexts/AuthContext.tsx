import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Profile interface matching user_profiles table
interface Profile {
  id: string;  // This IS the user_id in user_profiles
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  bio: string | null;
  reputation: number | null;
  total_comments: number | null;
  total_upvotes: number | null;
  // Extended fields we store locally (from subscriptions table or defaults)
  subscription_tier?: string | null;
  onboarding_completed?: boolean | null;
  favorite_sports?: string[] | null;
  odds_format?: string | null;
  notifications_enabled?: boolean | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      // Fetch from user_profiles table (id = user_id)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Fetch subscription tier separately
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Return basic profile if user_profiles entry doesn't exist yet
        return {
          id: userId,
          display_name: null,
          avatar_url: null,
          username: null,
          bio: null,
          reputation: 0,
          total_comments: 0,
          total_upvotes: 0,
          subscription_tier: subData?.tier || null,
          onboarding_completed: false,
        };
      }

      return {
        ...profileData,
        subscription_tier: subData?.tier || null,
        onboarding_completed: true, // Assume completed if profile exists
      } as Profile;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            const profileData = await fetchProfile(newSession.user.id);
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        const profileData = await fetchProfile(existingSession.user.id);
        setProfile(profileData);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name },
      },
    });

    if (error) {
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Check your email',
      description: 'We sent you a confirmation link.',
    });
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Welcome back!',
      description: 'You are now signed in.',
    });
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed out',
      description: 'Come back soon!',
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
