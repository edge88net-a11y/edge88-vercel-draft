import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Terms() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">
          {language === 'cz' ? 'Podmínky služby' : 'Terms of Service'}
        </h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '1. Přijetí podmínek' : '1. Acceptance of Terms'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Používáním služby Edge88 souhlasíte s těmito podmínkami služby. Pokud s těmito podmínkami nesouhlasíte, službu nepoužívejte.'
                : 'By accessing or using Edge88 services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'}
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '2. Popis služby' : '2. Service Description'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'cz'
                ? 'Edge88 poskytuje predikce sportovních událostí založené na AI analýze. Naše predikce jsou pouze informativního charakteru a neměly by být považovány za finanční poradenství.'
                : 'Edge88 provides AI-powered sports predictions and analysis. Our predictions are for informational purposes only and should not be considered financial advice.'}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{language === 'cz' ? 'Predikce jsou generovány pomocí strojového učení' : 'Predictions are generated using machine learning algorithms'}</li>
              <li>{language === 'cz' ? 'Minulé výsledky nezaručují budoucí výkon' : 'Past performance does not guarantee future results'}</li>
              <li>{language === 'cz' ? 'Uživatelé jsou zodpovědní za svá rozhodnutí' : 'Users are responsible for their own decisions'}</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '3. Věková omezení' : '3. Age Restrictions'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Pro používání služby Edge88 musíte být starší 18 let (nebo zákonného věku pro hazardní hry ve vaší jurisdikci). Registrací potvrzujete, že splňujete tuto podmínku.'
                : 'You must be at least 18 years old (or the legal gambling age in your jurisdiction) to use Edge88. By registering, you confirm that you meet this requirement.'}
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '4. Uživatelské účty' : '4. User Accounts'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Jste zodpovědní za udržování důvěrnosti svého účtu a hesla. Okamžitě nás informujte o jakémkoli neoprávněném použití vašeho účtu.'
                : 'You are responsible for maintaining the confidentiality of your account and password. Notify us immediately of any unauthorized use of your account.'}
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '5. Předplatné a platby' : '5. Subscriptions and Payments'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'cz'
                ? 'Předplatné se automaticky obnovuje, pokud jej nezrušíte. Vrácení peněz se řídí našimi zásadami vrácení peněz.'
                : 'Subscriptions auto-renew unless cancelled. Refunds are subject to our refund policy.'}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{language === 'cz' ? 'Měsíční předplatné se obnovuje každých 30 dní' : 'Monthly subscriptions renew every 30 days'}</li>
              <li>{language === 'cz' ? 'Zrušení je možné kdykoli' : 'Cancellation is possible at any time'}</li>
              <li>{language === 'cz' ? 'Žádné vrácení peněz za částečné období' : 'No refunds for partial periods'}</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '6. Omezení odpovědnosti' : '6. Limitation of Liability'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Edge88 nenese odpovědnost za jakékoli ztráty vzniklé v důsledku používání našich predikcí. Sázení zahrnuje riziko a měli byste sázet pouze to, co si můžete dovolit ztratit.'
                : 'Edge88 is not liable for any losses incurred as a result of using our predictions. Betting involves risk and you should only bet what you can afford to lose.'}
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '7. Změny podmínek' : '7. Changes to Terms'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Vyhrazujeme si právo kdykoli změnit tyto podmínky. O významných změnách vás budeme informovat e-mailem nebo oznámením na webu.'
                : 'We reserve the right to modify these terms at any time. We will notify you of significant changes via email or website notice.'}
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'cz' ? '8. Kontakt' : '8. Contact'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'cz'
                ? 'Máte-li dotazy k těmto podmínkám, kontaktujte nás na legal@edge88.net'
                : 'If you have questions about these terms, contact us at legal@edge88.net'}
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
