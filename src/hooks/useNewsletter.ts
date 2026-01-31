import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

export function useNewsletter() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const subscribe = async (email: string): Promise<boolean> => {
    // Validate email
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        title: 'Invalid Email',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ 
          email: email.toLowerCase().trim(),
          source: 'homepage'
        });

      if (error) {
        // Handle duplicate email
        if (error.code === '23505') {
          toast({
            title: '✅ Already Subscribed',
            description: 'You\'re already on our list! Check your inbox tomorrow at 9 AM.',
          });
          return true;
        }
        throw error;
      }

      toast({
        title: '🎉 Welcome to Edge88!',
        description: 'Check your inbox tomorrow at 9 AM for your first free picks!',
      });
      return true;
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: 'Signup Failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { subscribe, isLoading };
}
