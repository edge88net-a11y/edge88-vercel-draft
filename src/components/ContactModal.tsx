import { useState } from 'react';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUBJECTS = [
  { value: 'bug', labelEn: 'Bug Report', labelCz: 'Hlášení chyby' },
  { value: 'feature', labelEn: 'Feature Request', labelCz: 'Návrh funkce' },
  { value: 'billing', labelEn: 'Billing Issue', labelCz: 'Problém s fakturací' },
  { value: 'general', labelEn: 'General Question', labelCz: 'Obecný dotaz' },
];

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !subject || !message) {
      toast({
        title: language === 'cz' ? 'Chyba' : 'Error',
        description: language === 'cz' ? 'Vyplňte prosím všechna pole' : 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          email,
          subject,
          message,
          user_id: user?.id || null,
        });

      if (error) throw error;

      toast({
        title: language === 'cz' ? 'Zpráva odeslána!' : 'Message sent!',
        description: language === 'cz' 
          ? 'Ozveme se vám do 24 hodin.' 
          : "We'll get back to you within 24 hours.",
      });
      
      // Reset form and close
      setEmail(user?.email || '');
      setSubject('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: language === 'cz' ? 'Chyba' : 'Error',
        description: language === 'cz' ? 'Nepodařilo se odeslat zprávu' : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md glass-card p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {language === 'cz' ? 'Kontaktujte nás' : 'Contact Us'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'cz' ? 'Rádi vám pomůžeme' : 'We\'re here to help'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              {language === 'cz' ? 'E-mail' : 'Email'}
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              {language === 'cz' ? 'Předmět' : 'Subject'}
            </label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'cz' ? 'Vyberte předmět...' : 'Select a subject...'} />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {language === 'cz' ? s.labelCz : s.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              {language === 'cz' ? 'Zpráva' : 'Message'}
            </label>
            <Textarea
              placeholder={language === 'cz' ? 'Popište váš dotaz nebo problém...' : 'Describe your question or issue...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="btn-gradient w-full gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === 'cz' ? 'Odesílání...' : 'Sending...'}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {language === 'cz' ? 'Odeslat zprávu' : 'Send Message'}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
