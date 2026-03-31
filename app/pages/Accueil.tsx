'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Plane } from 'lucide-react';

// Component Imports
import { MissionsVedette } from '../components/landing/MissionsVedette';
import { SectionTitleWithPlane } from '../components/landing/SectionTitleWithPlane';
import { Bouton } from '../components/ds/Bouton';
import { ElementFAQ } from '../components/landing/ElementFAQ';
import { BarreRechercheRedesign } from '../components/landing/BarreRechercheRedesign';
import { CarteTemoignage } from '../components/landing/CarteTemoignage';
import { CarteTemoignageMaire } from '../components/landing/CarteTemoignageMaire';
import { PartenairesSlider } from '../components/landing/PartenairesSlider';
import { NewsletterCompactWidget } from '../components/landing/NewsletterCompactWidget';
import { CountUpNumber } from '../components/ds/CountUpNumber';
import { WidgetMeteo } from '../components/ds/WidgetMeteo';
import { WaveSeparator } from '../components/ds/WaveSeparator';
import { PourquoiJeSuisAuCameroun } from '../components/landing/PourquoiJeSuisAuCameroun';
import { Nos6DefisCard } from '../components/landing/Nos6DefisCard';
import { NotreCommunauteSection } from '../components/landing/NotreCommunauteSection';
import { CommunauteEtMembresSection } from '../components/landing/CommunauteEtMembresSection';

interface AccueilProps {
  landingContent: any;
  faqItems: any[];
  missions: any[];
}

export function Accueil({ landingContent, faqItems, missions }: AccueilProps) {
  const router = useRouter();

  // Default values
  const heroContent = landingContent?.hero || {
    badge: "🌴 Vacances au Cameroun 2025",
    title: "Camerounais de la diaspora",
    subtitle: "En vacances au pays, transformez votre séjour en impact concret. Rejoignez une communauté engagée.",
    bg_image: "https://jesuisaupays.com/home-ia/assets/hero-beach-CpJkoZy1.jpg"
  };

  const statsContent = landingContent?.stats || {
    count: 246,
    text_before: "Aujourd'hui,",
    text_after: "bonnes actions vous attendent !",
    dot_color: "#F7BB10"
  };

  const pourquoiContent = landingContent?.pourquoi || {
    badge: "Pourquoi je suis au Cameroun ?",
    title: "Une diaspora engagée pour le développement",
    image: "https://jesuisaupays.com/home-ia/assets/diaspora-engaged-Dbfcbnc3.jpg",
    description: "Chaque année, plus d'un million de Camerounais du monde retournent en vacances au pays. Beaucoup en profitent pour soutenir leurs familles, leurs villes et leurs communautés par différentes actions : aides matérielles directes, conseils & formations, bénévolat associatif, consultations médicales gratuites… Ces actions solidaires sont souvent spontanées et mériteraient d'être mieux accompagnées et renforcées, avec le soutien des mairies, ONG et entreprises. Pour ces derniers, cette période est une action unique pour créer des liens durables et construire des projets d'avenir avec la diaspora, un partenaire clé du développement local."
  };

  const defisContent = landingContent?.defis || {
    title: "Nos 7 défis pour gagner la confiance de la diaspora",
    items: [
      "Sélection des acteurs et des missions",
      "Diversité des actions proposées",
      "Filtres de recherche optimisés",
      "Interlocuteur « diaspora » dédié et formé",
      "Suivi qualité",
      "Charte éthique",
      "Transparence et redevabilité"
    ]
  };

  const missionsContent = landingContent?.missions || {
    title: "Missions à la une",
    subtitle: "Découvrez les dernières actions proposées par nos villes et organisations membres."
  };

  const temoignagesContent = landingContent?.temoignages || {
    title: "Ils n'oublient pas d'où ils viennent",
    subtitle: "Ils ont réussi à l'étranger et contribuent activement au développement du Cameroun.",
    bg_image: "https://jesuisaupays.com/home-ia/assets/testimonials-bg-CrSLpMuz.jpg",
    items: []
  };

  // If items are empty, use default mock items
  const temoignageItems = temoignagesContent.items && temoignagesContent.items.length > 0 
    ? temoignagesContent.items 
    : [
      {
        id: "1",
        type: 'contributeur',
        name: "Dr. Marie Tankou",
        role: "Médecin, Paris",
        content: "Grâce à cette plateforme, j'ai pu contribuer à la construction d'un centre de santé dans mon village natal. Une expérience enrichissante qui a changé des vies.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
        emoji: "🏥"
      },
      {
        id: "2",
        type: 'maire',
        name: "M. Paul Mbarga",
        role: "Maire de Douala",
        content: "La diaspora apporte une expertise précieuse et des ressources qui nous manquent. Cette collaboration a permis de lancer 12 projets structurants en 2 ans.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        emoji: "🤝"
      },
      {
        id: "3",
        type: 'contributeur',
        name: "Jean-Claude Fotso",
        role: "Entrepreneur, Montréal",
        content: "J'ai trouvé ici une façon concrète de redonner à ma communauté. Le mentorat que j'offre aux jeunes entrepreneurs a déjà créé 15 emplois.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        emoji: "💡"
      }
    ];

  const partenairesContent = landingContent?.partenaires || {
    title: "Engagés à nos côtés",
    subtitle: "Sans eux, nous ne serions pas là (liste évolutive)",
    items: [
      { nom: 'Partenaire 1', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-1.png' },
      { nom: 'Partenaire 2', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-2.png' },
      { nom: 'Partenaire 3', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-3.png' },
      { nom: 'Partenaire 4', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-4.png' },
      { nom: 'Partenaire 5', logo: 'https://jesuisaupays.com/wp-content/uploads/2025/12/Logo-5.png' }
    ]
  };

  const handleNavigation = (page: string, data?: any) => {
    const route = page === 'missions' ? '/missions' : `/${page}`;
    router.push(route);
  };

  const handleSearch = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
    if (filters.dateFin) params.append('dateFin', filters.dateFin);
    if (filters.ville) params.append('ville', filters.ville);
    if (filters.domaine) params.append('domaine', filters.domaine);
    if (filters.budget) params.append('budget', filters.budget);
    if (filters.duree) params.append('duree', filters.duree);
    if (filters.missionType && filters.missionType !== 'all') params.append('missionType', filters.missionType);
    
    if (filters.typeContribution && filters.typeContribution.length > 0) {
      params.append('typeContribution', filters.typeContribution.join(','));
    }

    router.push(`/missions?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* SECTION 1: Hero - Beach Background with Palm Trees */}
      <section className="w-full relative overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
        {/* Background Image - Optimized with next/image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroContent.bg_image}
            alt="Plage du Cameroun"
            fill
            priority
            unoptimized
            className="object-cover object-center"
            style={{ filter: 'brightness(0.7)' }}
            sizes="100vw"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 relative z-10 pt-6 sm:pt-12 pb-4 sm:pb-8 h-full flex flex-col justify-center">
          {/* Yellow Badge "Vos vacances au Cameroun" */}
          <div className="flex justify-center mb-4 sm:mb-8">
            <div
              className="inline-flex items-center gap-2 px-5 sm:px-10 py-2 sm:py-3.5 rounded-full shadow-xl backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(247, 187, 16, 0.85)' }}
            >
              {/* Red Dot */}
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse"
                style={{ backgroundColor: '#EE0003' }}
              />
              {/* Text */}
              <span
                style={{
                  fontSize: 'clamp(12px, 3.5vw, 17px)', 
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: '0.5px',
                }}
              >
                {heroContent.badge}
              </span>
            </div>
          </div>

          {/* Text Container */}
          <div className="max-w-5xl mx-auto mb-4 sm:mb-8 w-full">
            <div className="px-2 sm:px-8 py-2 sm:py-6">
              {/* Main Title */}
              <h1
                className="text-white text-center mb-4 sm:mb-6"
                style={{
                  fontSize: 'clamp(26px, 8vw, 68px)', 
                  lineHeight: '1.15',
                  fontWeight: 700,
                  textShadow: '2px 2px 16px rgba(0,0,0,0.8)',
                  letterSpacing: '-0.5px',
                }}
              >
                {heroContent.title}
              </h1>

              {/* Subtitle */}
              <p
                className="text-white text-center max-w-2xl mx-auto"
                style={{
                  fontSize: 'clamp(13px, 4vw, 22px)', 
                  lineHeight: '1.6',
                  fontWeight: 400,
                  textShadow: '1px 1px 10px rgba(0,0,0,0.8)',
                  opacity: 0.98,
                }}
              >
                {heroContent.subtitle}
              </p>
            </div>
          </div>

          {/* Red Stats Banner */}
          <div className="mb-6 sm:mb-8 w-full">
            <div
              className="max-w-4xl mx-auto px-4 sm:px-8 py-3 sm:py-5 rounded-2xl shadow-lg"
              style={{ backgroundColor: 'rgba(238, 0, 3, 0.7)' }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-4">
                {/* Left side: Yellow dot + Stats Text */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                  {/* Yellow Dot */}
                  <div
                    className="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statsContent.dot_color }}
                  />
                  {/* Text */}
                  <span
                    className="text-white font-semibold text-center"
                    style={{ fontSize: 'clamp(14px, 4.5vw, 24px)' }}
                  >
                    {statsContent.text_before}{' '}
                    <span style={{ color: statsContent.dot_color, fontWeight: 700 }}>
                      <CountUpNumber end={statsContent.count} duration={2} />
                    </span>{' '}
                    {statsContent.text_after}
                  </span>
                </div>

                {/* Right side: Location + Weather - Hidden on small mobile */}
                <div className="hidden sm:flex items-center gap-4">
                  <WidgetMeteo />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Redesign */}
          <div className="mb-4 sm:mb-6 relative w-full z-30">
            <BarreRechercheRedesign
              onSearch={handleSearch}
            />
          </div>

          {/* Additional spacing before wave separator - Responsive */}
          <div className="h-[40px] sm:h-[100px] lg:h-[140px]" />
        </div>

        {/* Wave Separator - Full width positioned at bottom of hero section */}
        <div className="absolute bottom-0 left-0 right-0 w-full z-20">
          <WaveSeparator color="#FFFFFF" />
        </div>
      </section>

      {/* SECTION 2: Pourquoi Je suis au Cameroun + Champs d'intervention - TWO COLUMN LAYOUT */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* LEFT COLUMN: Pourquoi je suis au cameroun */}
            <div className="space-y-6">
              <PourquoiJeSuisAuCameroun content={pourquoiContent} />
            </div>

            {/* RIGHT COLUMN: Champs d'intervention */}
            <div>
              <Nos6DefisCard content={defisContent} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Notre Communauté - Light background */}
      <NotreCommunauteSection content={landingContent?.communaute} />

      {/* SECTION 4: Communauté et Membres - Description + Categories */}
      <CommunauteEtMembresSection content={landingContent?.membres} />

      {/* SECTION 5: Missions à la une */}
      <section className="w-full py-20 bg-neutral-50">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
          {/* Header with title and CTA */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-4">
            <SectionTitleWithPlane
              title={missionsContent.title}
              subtitle={missionsContent.subtitle}
              align="left"
            />
            <div className="flex-shrink-0 md:mt-8">
              <Bouton
                variant="primaire"
                size="moyen"
                onClick={() => handleNavigation('missions')}
              >
                Toutes les missions
              </Bouton>
            </div>
          </div>

          {/* Missions Grid */}
          <MissionsVedette missions={missions} onNavigate={handleNavigation} showImage={false} />
        </div>
      </section>

      {/* SECTION 6: Témoignages contributeurs avec fond vert et image */}
      <section
        className="w-full py-24 relative overflow-hidden"
        style={{ backgroundColor: '#3d7e68' }}
      >
        {/* Background image overlay - Only render if src exists */}
        {temoignagesContent.bg_image && (
          <div className="absolute inset-0 z-0">
             <Image
               src={temoignagesContent.bg_image}
               alt="Background"
               fill
               unoptimized
               className="object-cover opacity-20"
               sizes="100vw"
             />
          </div>
        )}

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Plane className="w-5 h-5 hidden sm:block" style={{ color: '#F7BB10' }} />
              <span
                style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}
              >
                Témoignages
              </span>
              <Plane className="w-5 h-5 hidden sm:block" style={{ color: '#F7BB10' }} />
            </div>
            <h2
              style={{
                fontSize: '42px',
                lineHeight: '1.2',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '16px',
              }}
            >
              {temoignagesContent.title}
            </h2>
            <p
              style={{
                fontSize: '17px',
                lineHeight: '1.6',
                fontWeight: 400,
                color: '#FFFFFF',
                opacity: 0.95,
              }}
            >
              {temoignagesContent.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {temoignageItems.map((item: any, idx: number) => (
              item.type === 'maire' ? (
                <CarteTemoignageMaire
                  key={item.id}
                  emoji={item.emoji}
                  citation={item.content}
                  nom={item.name}
                  titre={item.role}
                  avatar={item.avatar}
                />
              ) : (
                <CarteTemoignage
                  key={item.id}
                  variant="utilisateur"
                  avatarColor={idx % 2 === 0 ? "teal" : "yellow"}
                  emoji={item.emoji}
                  citation={item.content}
                  nom={item.name}
                  titre={item.role}
                  avatar={item.avatar}
                />
              )
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Engagés à nos côtés */}
      <section className="w-full pt-20 pb-8 bg-neutral-50">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
          <SectionTitleWithPlane
            title={partenairesContent.title}
            subtitle={partenairesContent.subtitle}
            align="center"
          />

          {/* Logo Slider */}
          <PartenairesSlider logos={partenairesContent.items} />
        </div>
      </section>

      {/* SECTION 8: Newsletter */}
      <NewsletterCompactWidget />

      {/* SECTION 9: FAQ - Moved after Newsletter */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <SectionTitleWithPlane
            title="Questions fréquentes"
            subtitle="Tout ce que vous devez savoir sur Je suis au Cameroun"
            align="center"
          />

          <div className="space-y-0">
            {faqItems.length > 0 ? (
              faqItems.map((item, idx) => (
                <ElementFAQ
                  key={idx}
                  question={item.question}
                  reponse={<>{item.answer}</>}
                />
              ))
            ) : (
              <>
                <ElementFAQ
                  question="Qui est à l'origine de cette plateforme ?"
                  reponse={
                    <>
                      Jesuisaucameroun.com est le fruit d&apos;un partenariat innovant
                      entre l&apos;Association des Maires de Villes du Cameroun
                      (AMVC), les aéroports et la startup Impact Diaspora
                      (www.impactdiaspora.fr) basée en France et Sénégal. C&apos;est
                      la même formule qui sera appliquée dans les 28 pays africains
                      où la plateforme programme de se lancer.
                    </>
                  }
                />

                <ElementFAQ
                  question="Qu'est-ce que jesuisaucameroun.com ?"
                  reponse={
                    <>
                      jesuisaucameroun.com fait partie intégrante de la marketplace
                      panafricaine (jesuisaupays.com) où les villes, entreprises et
                      ONG africaines sollicitent la diaspora pour leurs besoins en
                      développement. Je suisaucameroun.com cible particulièrement la
                      diaspora lorsque celle-ci est en vacances dans le pays
                      d&apos;origine d&apos;où le partenariat avec les aéroports. La
                      plateforme assure la mise en relation entre la diaspora et les
                      annonceurs, tout en garantissant un environnement sécurisé
                      pour les deux parties.
                    </>
                  }
                />

                <ElementFAQ
                  question="Comment fonctionne la plateforme ?"
                  reponse={
                    <>
                      Les annonceurs (villes, ONG et entreprises) sont formés pour
                      intégrer directement leurs offres sur la plateforme. Celles-ci
                      sont validées et corrigées via un double contrôle humain et
                      IA. Dès leur publication, les actions qui couvrent 13 champs
                      d&apos;action sont accessibles par la diaspora qui peut
                      aussitôt interagir. Les demandes et sollicitations de la
                      diaspora sont directement reçues et gérées par les points
                      focaux dédiés chez les annonceurs.
                    </>
                  }
                />

                <ElementFAQ
                  question="Est-ce que c'est gratuit ?"
                  reponse={
                    <>
                      Pour la diaspora, tout est gratuit ! En ce qui concerne les
                      annonceurs, la gratuité est offerte seulement pour les ONG
                      d&apos;une certaine taille (et un impact certain), proposées
                      par les villes. Les villes, ONG internationales et entreprises
                      doivent s&apos;acquitter d&apos;un loyer annuel. Néanmoins, des
                      bailleurs ou sponsors peuvent prendre en charge ces
                      cotisations pour le compte des associations voire des villes.
                      C&apos;est ce modèle tarifaire qui sera testé lors du projet
                      pilote jesuisaucameroun.com.
                    </>
                  }
                />

                <ElementFAQ
                  question="Les annonceurs et les projets sont-ils sérieux ?"
                  reponse={
                    <>
                      Les annonceurs sont rigoureusement sélectionnés et formés aux
                      exigences de la diaspora. Un mail automatique est adressé au
                      contributeur, 15 jours après sa demande on-line, afin de
                      s&apos;assurer que l&apos;annonceur a bien repris contact avec
                      lui. En fonction des résultats, les décideurs (Maires,
                      Président ONG, DG entreprises...) sont sensibilisés et en
                      l&apos;absence de mesures correctives, la suspension des
                      publications est envisageable.
                    </>
                  }
                />

                <ElementFAQ
                  question="Comment puis-je être sûr que ma proposition arrive à destination ?"
                  reponse={
                    <>
                      Toutes les demandes de la diaspora sont acheminées directement
                      sur l&apos;email du point focal diaspora de l&apos;annonceur
                      ciblé. Dans certains cas, le cabinet du Maire (ou d&apos;un
                      décideur) peut demander à recevoir une copie pour suivi
                      qualité. Et nous suivons régulièrement le traitement des
                      demandes par les annonceurs via un email qualité automatique
                      adressé aux contributeurs.
                    </>
                  }
                />

                <ElementFAQ
                  question="Dois-je être au Cameroun pour contribuer ?"
                  reponse={
                    <>
                      Non pas nécessairement ! Si vous êtes loin, il suffit
                      d&apos;activer le filtre « missions à distance » dans le moteur
                      de recherche général.
                    </>
                  }
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}