import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_EN: FAQItem[] = [
  {
    question: 'How do the AI predictions work?',
    answer: 'Our AI analyzes 847+ data sources per match including team stats, player performance, injuries, weather, historical matchups, and betting line movements. The model processes this data in real-time to generate confidence-weighted predictions.',
  },
  {
    question: 'Do you guarantee wins?',
    answer: 'No. Sports betting inherently involves risk and no prediction system can guarantee wins. Our 71% accuracy rate is based on historical data across 500+ predictions. We provide data-driven analysis to inform your decisions, not guarantees.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, absolutely. You can cancel your subscription at any time from your account settings. You\'ll keep access until the end of your billing period with no additional charges.',
  },
  {
    question: 'What sports do you cover?',
    answer: 'We cover NHL (hockey), NBA (basketball), soccer (major leagues including EPL, La Liga, Serie A), UFC/MMA, NFL (football), and MLB (baseball). New sports are added regularly based on user demand.',
  },
  {
    question: 'How often are predictions updated?',
    answer: 'Predictions are generated continuously as new data becomes available. Most games receive predictions 24-48 hours before kickoff, with confidence levels updating until game time based on late-breaking news.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes. All payments are processed through Stripe, a PCI Level 1 certified payment processor. We never store your credit card details on our servers.',
  },
];

const FAQ_CZ: FAQItem[] = [
  {
    question: 'Jak fungují AI predikce?',
    answer: 'Naše AI analyzuje 847+ zdrojů dat na zápas včetně statistik týmů, výkonů hráčů, zranění, počasí, historických zápasů a pohybů kurzů. Model zpracovává data v reálném čase a generuje predikce vážené podle jistoty.',
  },
  {
    question: 'Garantujete výhru?',
    answer: 'Ne. Sportovní sázení inherentně zahrnuje riziko a žádný predikční systém nemůže garantovat výhry. Naše 71% přesnost je založena na historických datech z 500+ predikcí. Poskytujeme datovou analýzu pro informované rozhodování, ne garance.',
  },
  {
    question: 'Mohu zrušit předplatné kdykoliv?',
    answer: 'Ano, samozřejmě. Předplatné můžete zrušit kdykoliv v nastavení účtu. Přístup vám zůstane do konce fakturačního období bez dalších poplatků.',
  },
  {
    question: 'Jaké sporty pokrýváte?',
    answer: 'Pokrýváme NHL (hokej), NBA (basketbal), fotbal (hlavní ligy včetně Premier League, La Liga, Serie A), UFC/MMA, NFL (americký fotbal) a MLB (baseball). Nové sporty přidáváme pravidelně podle zájmu uživatelů.',
  },
  {
    question: 'Jak často se predikce aktualizují?',
    answer: 'Predikce jsou generovány průběžně s dostupností nových dat. Většina zápasů obdrží predikce 24-48 hodin před začátkem, s aktualizací úrovně jistoty až do výkopu podle posledních zpráv.',
  },
  {
    question: 'Jsou mé platební údaje v bezpečí?',
    answer: 'Ano. Všechny platby jsou zpracovány přes Stripe, PCI Level 1 certifikovaný platební procesor. Nikdy neukládáme údaje o vaší kreditní kartě na našich serverech.',
  },
];

export function FAQSection() {
  const { language } = useLanguage();
  const faqs = language === 'cz' ? FAQ_CZ : FAQ_EN;
  
  // JSON-LD structured data for FAQ
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-4">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {language === 'cz' ? 'Časté dotazy' : 'Frequently Asked Questions'}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {language === 'cz' 
              ? 'Odpovědi na nejčastější otázky o Edge88'
              : 'Answers to the most common questions about Edge88'}
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="glass-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Still have questions? */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            {language === 'cz' ? 'Máte další otázky?' : 'Still have questions?'}
          </p>
          <a 
            href="mailto:support@edge88.net" 
            className="text-primary hover:underline font-medium"
          >
            {language === 'cz' ? 'Kontaktujte nás →' : 'Contact us →'}
          </a>
        </div>
      </div>

      {/* Inject FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  );
}
