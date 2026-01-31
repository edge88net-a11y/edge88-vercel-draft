import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Privacy() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">
          {language === 'cz' ? 'Zásady ochrany osobních údajů' : 'Privacy Policy'}
        </h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '1. Shromažďované údaje' : '1. Information We Collect'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'cz'
                ? 'Shromažďujeme následující typy informací:'
                : 'We collect the following types of information:'}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{language === 'cz' ? 'E-mailová adresa a uživatelské jméno' : 'Email address and username'}</li>
              <li>{language === 'cz' ? 'Platební informace (zpracovávané přes Stripe)' : 'Payment information (processed via Stripe)'}</li>
              <li>{language === 'cz' ? 'Údaje o používání a preference' : 'Usage data and preferences'}</li>
              <li>{language === 'cz' ? 'Uložené tipy a historie' : 'Saved picks and history'}</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '2. Jak používáme vaše údaje' : '2. How We Use Your Data'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'cz'
                ? 'Vaše údaje používáme k:'
                : 'We use your data to:'}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{language === 'cz' ? 'Poskytování a zlepšování našich služeb' : 'Provide and improve our services'}</li>
              <li>{language === 'cz' ? 'Personalizaci vašeho zážitku' : 'Personalize your experience'}</li>
              <li>{language === 'cz' ? 'Zpracování plateb' : 'Process payments'}</li>
              <li>{language === 'cz' ? 'Zasílání aktualizací a upozornění' : 'Send updates and notifications'}</li>
              <li>{language === 'cz' ? 'Analýze a vylepšování predikcí' : 'Analyze and improve predictions'}</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '3. Sdílení údajů' : '3. Data Sharing'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Vaše osobní údaje neprodáváme. Údaje sdílíme pouze s:'
                : 'We do not sell your personal data. We only share data with:'}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>{language === 'cz' ? 'Poskytovateli platebních služeb (Stripe)' : 'Payment processors (Stripe)'}</li>
              <li>{language === 'cz' ? 'Analytickými nástroji (anonymizované údaje)' : 'Analytics tools (anonymized data)'}</li>
              <li>{language === 'cz' ? 'Právními orgány (pokud to vyžaduje zákon)' : 'Legal authorities (when required by law)'}</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '4. Cookies a sledování' : '4. Cookies and Tracking'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Používáme cookies k zajištění funkčnosti webu, zapamatování vašich preferencí a analýze používání. Můžete spravovat nastavení cookies v prohlížeči.'
                : 'We use cookies to ensure website functionality, remember your preferences, and analyze usage. You can manage cookie settings in your browser.'}
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '5. Zabezpečení dat' : '5. Data Security'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Používáme průmyslové standardy pro ochranu vašich dat, včetně šifrování HTTPS, zabezpečeného ukládání hesel a pravidelných bezpečnostních auditů.'
                : 'We use industry-standard security measures to protect your data, including HTTPS encryption, secure password storage, and regular security audits.'}
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '6. Vaše práva (GDPR)' : '6. Your Rights (GDPR)'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'cz'
                ? 'Máte právo na:'
                : 'You have the right to:'}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{language === 'cz' ? 'Přístup k vašim údajům' : 'Access your data'}</li>
              <li>{language === 'cz' ? 'Opravu nepřesných údajů' : 'Correct inaccurate data'}</li>
              <li>{language === 'cz' ? 'Smazání vašich údajů' : 'Delete your data'}</li>
              <li>{language === 'cz' ? 'Export vašich údajů' : 'Export your data'}</li>
              <li>{language === 'cz' ? 'Námitku proti zpracování' : 'Object to processing'}</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '7. Uchovávání údajů' : '7. Data Retention'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Vaše údaje uchováváme po dobu trvání vašeho účtu a dalších 30 dní po jeho zrušení. Platební záznamy uchováváme dle zákonných požadavků.'
                : 'We retain your data for the duration of your account and 30 days after deletion. Payment records are retained as required by law.'}
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '8. Kontakt' : '8. Contact'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Pro dotazy ohledně ochrany osobních údajů nás kontaktujte na privacy@edge88.net'
                : 'For privacy-related inquiries, contact us at privacy@edge88.net'}
            </p>
          </section>

          <p className="text-sm text-muted-foreground text-center mt-8">
            {language === 'cz' ? 'Poslední aktualizace: Leden 2026' : 'Last updated: January 2026'}
          </p>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
