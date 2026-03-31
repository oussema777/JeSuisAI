'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/routing';
import { Bouton } from '../components/ds/Bouton';
import { FilDAriane } from '../components/listing/FilDAriane';
import { SectionTitleWithPlane } from '../components/landing/SectionTitleWithPlane';
import { PartenairesSlider } from '../components/landing/PartenairesSlider';
import { MemberCard } from '../components/landing/MemberCard';
import { EcosystemCard } from '../components/landing/EcosystemCard';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Skeleton } from '../components/ds/Skeleton';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const supabase = getSupabaseBrowserClient();

export default function APropos() {
  const tCommon = useTranslations('Common');
  const tNav = useTranslations('Navigation');
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const router = useRouter();
  const [content, setContent] = useState<any>(null);
  const [globalOrganisations, setGlobalOrganisations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllContent() {
      try {
        const [pageRes, globalRes] = await Promise.all([
          supabase.from('static_contents').select('content').eq('key', 'a-propos').eq('lang', currentLocale).maybeSingle(),
          supabase.from('static_contents').select('content').eq('key', 'organisations-global').eq('lang', currentLocale).maybeSingle()
        ]);
        
        if (pageRes.data?.content) {
          setContent(pageRes.data.content);
        }
        if (globalRes.data?.content) {
          setGlobalOrganisations(globalRes.data.content);
        }
      } catch (err) {
        console.error('Error loading A Propos content:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg">
        <Skeleton className="h-80 w-full rounded-none" />
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 space-y-8">
          <Skeleton className="h-8 w-64 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const onNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const hero = content?.hero || {
    title: currentLocale === 'en' ? "Jesuisaucameroun.com, above all a community!" : "Jesuisaucameroun.com, avant tout une communauté !",
    subtitle: currentLocale === 'en' ? "With cities, NGOs and companies that believe in Cameroonians abroad" : "Avec les villes, ONG et entreprises qui croient aux Camerounais de l'étranger"
  };

  const ecosystem = content?.ecosystem || {
    title: currentLocale === 'en' ? "Major Cameroonian cities leading the way" : "Les grandes villes camerounaises en chef de file",
    description: currentLocale === 'en' ? "Alongside Douala and the member cities of the Association of Mayors of Cameroonian Cities (AMVC), leaders, jesuisaucameroun.com brings together an ecosystem of stakeholders committed to making the stay of the diaspora a useful time for local development." : "Aux côtés de Douala et des villes membres de l'Association des Maires de Villes du Cameroun (AMVC), chefs de file, jesuisaucameroun.com rassemble un écosystème d'acteurs engagés pour faire du séjour de la diaspora un temps utile pour le développement local.",
    cards: [
      { icon: 'building2', label: currentLocale === 'en' ? "Local authorities" : "Collectivités locales", description: currentLocale === 'en' ? "Mobilizing diaspora contributions to local development through concrete projects." : "Mobiliser les contributions des diasporas au développement local à travers des projets concrets." },
      { icon: 'plane', label: currentLocale === 'en' ? "International airports" : "Aéroports internationaux", description: currentLocale === 'en' ? "Strategic hubs to connect the diaspora on arrival and departure from the country." : "Hubs stratégiques pour connecter la diaspora à son arrivée et son départ du pays." },
      { icon: 'heart', label: currentLocale === 'en' ? "NGOs and associations" : "ONG et associations", description: currentLocale === 'en' ? "Connecting the diaspora as donors or volunteers on social and environmental causes." : "Connecter la diaspora en tant que donateurs ou bénévoles sur des causes sociales et environnementales." },
      { icon: 'building', label: currentLocale === 'en' ? "Companies" : "Entreprises", description: currentLocale === 'en' ? "Boosting CSR programs and fostering mentoring between diaspora professionals and local talents." : "Dynamiser les programmes RSE et favoriser le mentorat entre professionnels de la diaspora et talents locaux." }
    ]
  };

  const motPresident = content?.motPresident || {
    section_title: currentLocale === 'en' ? "Message from the President of the Association of Mayors of Cameroonian Cities" : "Mot du Président de l'Association des Maires de Villes du Cameroun",
    quote_title: currentLocale === 'en' ? "« The diaspora, a key partner in the development of Cameroonian cities! »" : "« La diaspora, un partenaire clé du développement des villes camerounaises ! »",
    quote_paragraphs: currentLocale === 'en' ? [
      "Cameroonians abroad are a strength for our country. Beyond remittances to families, their expertise, their network and their willingness to contribute to the development of their home cities are major assets. We, mayors of the cities of Cameroon, are determined to create a framework of trust to welcome these contributions.",
      "The « jesuisaucameroun » platform is part of this ambition by facilitating direct connection between the needs of our territories and the generosity of our compatriots abroad. Together, let's build the Cameroon of tomorrow."
    ] : [
      "Les Camerounais de l'étranger sont une force pour notre pays. Au-delà des transferts de fonds vers les familles, leur expertise, leur réseau et leur volonté de contribuer au développement de leurs villes d'origine sont des atouts majeurs. Nous, maires des villes du Cameroun, sommes déterminés à créer un cadre de confiance pour accueillir ces contributions.",
      "La plateforme « jesuisaucameroun » s'inscrit dans cette ambition en facilitant la mise en relation directe entre les besoins de nos territoires et la générosité de nos compatriotes de l'étranger. Ensemble, construisons le Cameroun de demain."
    ],
    name: "Dr Mbassa Ndine Roger",
    role: currentLocale === 'en' ? "Mayor of Douala" : "Maire de Douala",
    photo: "https://jesuisaupays.com/wp-content/uploads/2026/01/maire.jpg"
  };

  const membresTitle = globalOrganisations?.title || content?.membres?.title || (currentLocale === 'en' ? "Member cities and organizations" : "Villes et organisations membres");
  
  // Robust check for members list: check globalOrganisations first, then content, then fallback list
  const getMembres = () => {
    if (globalOrganisations?.membres && globalOrganisations.membres.length > 0) {
      return globalOrganisations.membres;
    }
    if (content?.membres?.items && content.membres.items.length > 0) {
      return content.membres.items;
    }
    return [
      { name: "Association des Maires de Villes du Cameroun", type: 'organisation' },
      { name: "Bafoussam", type: 'ville' },
      { name: "Bamenda", type: 'ville' },
      { name: "Bertoua", type: 'ville' },
      { name: "Douala", type: 'ville' },
      { name: "Ebolowa", type: 'ville' },
      { name: "Edéa", type: 'ville' },
      { name: "Garoua", type: 'ville' },
      { name: "Kribi", type: 'ville' },
      { name: "Kumba", type: 'ville' },
      { name: "Limbe", type: 'ville' },
      { name: "Maroua", type: 'ville' },
      { name: "Ngaoundéré", type: 'ville' },
      { name: "Nkongsamba", type: 'ville' },
      { name: "Yaoundé", type: 'ville' }
    ];
  };

  const membresItems = getMembres();

  const cta = content?.cta || {
    title: currentLocale === 'en' ? "Ready to contribute to the development of Cameroon?" : "Prêt à contribuer au développement du Cameroun ?",
    body: currentLocale === 'en' ? "Whether you are an entrepreneur, professional, student or simply attached to your roots, there is a place for you in our community." : "Que vous soyez entrepreneur, professionnel, étudiant ou simplement attaché à vos racines, il y a une place pour vous dans notre communauté."
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: currentLocale === 'en' ? 'Home' : 'Accueil', onClick: () => onNavigate(''), href: '/' },
              { label: currentLocale === 'en' ? 'Platform' : 'Plateforme' },
              { label: tNav('members')},
            ]}
          />
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="w-full bg-gradient-to-br from-bg-base via-primary to-bg-base py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-5 md:px-10 lg:px-20 relative z-10 text-center">
          <h1 className="text-white mb-6" style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}>
            {hero.title}
          </h1>
          <p className="text-white/85 max-w-3xl mx-auto" style={{ fontSize: '17px', lineHeight: '1.6', fontWeight: 400 }}>
            {hero.subtitle}
          </p>
        </div>
      </section>

      {/* SECTION: Ecosystem */}
      <section className="w-full py-20 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
          <div className="mb-8 text-center">
            <SectionTitleWithPlane title={ecosystem.title} subtitle="" align="center" />
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <p className="text-center text-neutral-700" style={{ fontSize: '16px', lineHeight: '1.7', fontWeight: 400 }}>
              {ecosystem.description}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {ecosystem.cards.map((card: any, idx: number) => (
              <EcosystemCard key={idx} icon={card.icon} label={card.label} description={card.description} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Mot du Président */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-10 lg:px-20">
          <h2 className="text-neutral-900 text-center mb-10" style={{ fontSize: '32px', lineHeight: '1.2', fontWeight: 600 }}>
            {motPresident.section_title}
          </h2>

          <div className="bg-gradient-to-br from-primary/5 via-white to-primary/3 rounded-2xl p-6 md:p-10 shadow-lg border border-primary/10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                    <Image src={motPresident.photo} alt={motPresident.name} fill unoptimized className="object-cover" sizes="256px" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-primary italic" style={{ fontSize: '20px', lineHeight: '1.4', fontWeight: 600 }}>
                  {motPresident.quote_title}
                </h3>

                <div className="space-y-3">
                  {motPresident.quote_paragraphs.map((p: string, idx: number) => (
                    <p key={idx} className="text-neutral-700" style={{ fontSize: '15px', lineHeight: '1.7', fontWeight: 400 }}>{p}</p>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-200">
                  <p className="text-neutral-900" style={{ fontSize: '16px', lineHeight: '1.4', fontWeight: 600 }}>{motPresident.name}</p>
                  <p className="text-primary" style={{ fontSize: '14px', lineHeight: '1.4', fontWeight: 500 }}>{motPresident.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Membres */}
      <section className="w-full py-16 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
          <SectionTitleWithPlane title={membresTitle} subtitle="" align="center" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-12">
            {membresItems.map((item: any, idx: number) => (
              <MemberCard 
                key={idx} 
                name={item.name} 
                isOrganisation={item.type === 'organisation' || item.isOrganisation} 
              />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
          <SectionTitleWithPlane 
            title={content?.partenaires?.title || "Partenaires stratégiques"} 
            subtitle="" 
            align="center" 
          />
          <PartenairesSlider logos={content?.partenaires?.items} />
        </div>
      </section>

      {/* SECTION: CTA */}
      <section className="w-full py-20 bg-primary/10">
        <div className="max-w-3xl mx-auto px-5 md:px-10 lg:px-20 text-center">
          <h2 className="text-neutral-900 mb-6" style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}>
            {cta.title}
          </h2>
          <p className="text-neutral-700 mb-8" style={{ fontSize: '20px', lineHeight: '1.7', fontWeight: 400 }}>
            {cta.body}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Bouton variant="primaire" size="large" onClick={() => onNavigate('missions')}>{tNav('find_mission')}</Bouton>
            <Bouton variant="secondaire" size="large">{currentLocale === 'en' ? 'Contact the team' : 'Contacter l\'équipe'}</Bouton>
          </div>
        </div>
      </section>
    </div>
  );
}
