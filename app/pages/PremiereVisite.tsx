import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Heart,
  Users,
  Building2, 
  GraduationCap, 
  Stethoscope, 
  ShoppingBag,
  Leaf,
  Building,
  Briefcase,
  Globe,
  Lightbulb,
  Landmark,
  Shield,
  CheckCircle2,
  Award,
  CheckSquare,
  MessageCircle,
  Handshake,
  DollarSign,
  PiggyBank,
  Network,
  Gift,
  TrendingUp,
  BookOpen,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '../components/ds/Skeleton';
import { FilDAriane } from '../components/listing/FilDAriane';
import { SectionTitleWithPlane } from '../components/landing/SectionTitleWithPlane';
import { CarteTemoignage } from '../components/landing/CarteTemoignage';
import { CarteTemoignageMaire } from '../components/landing/CarteTemoignageMaire';
import { ElementFAQ } from '../components/landing/ElementFAQ';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface PremiereVisiteProps {
  onNavigate: (page: string, data?: any) => void;
}

const supabase = getSupabaseBrowserClient();

const ICON_MAP: Record<string, any> = {
  'Investment': DollarSign,
  'Santé': Stethoscope,
  'Lutte contre la pauvreté': Heart,
  'Soutien  la société civile': Users,
  'Infrastructures': Building,
  'Environnement': Leaf,
  'Education': GraduationCap,
  'Innovation': Sparkles,
  'Recrutement': Briefcase,
  'Tourisme': Landmark,
  'Culture': Lightbulb,
  'Rayonnement': Globe,
  'Droits': Shield,
  'Urgences': AlertCircle,
  'Investissement': TrendingUp,
  'Épargne': PiggyBank,
  'Compétences': BookOpen,
  'Dons': Gift,
  'Réseaux & influence': Network,
  'Achats & tourisme solidaires': ShoppingBag
};

export function PremiereVisite({ onNavigate }: PremiereVisiteProps) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data } = await supabase
          .from('static_contents')
          .select('content')
          .eq('key', 'premiere-visite')
          .maybeSingle();
        
        if (data?.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Error loading Premiere Visite content:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg">
        <Skeleton className="h-72 w-full rounded-none" />
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64 rounded-xl" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <Skeleton className="h-8 w-48 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback to defaults if no content in DB
  const hero = content?.hero || {
    title: "Connecter la diaspora au développement du Cameroun !",
    subtitle: "La première plateforme qui facilite l'engagement citoyen et canalise les compétences de la diaspora vers des projets concrets au service du développement local.",
    stats: [
      { label: "villes membres", value: "14" },
      { label: "Organisations partenaires", value: "10" },
      { label: "Types de missions", value: "45" },
      { label: "actions en cours", value: "246" }
    ]
  };

  const pourquoi = content?.pourquoi || {
    title: "Pour les Camerounais de l'étranger qui n'oublient pas d'où ils viennent…",
    image: "https://jesuisaupays.com/wp-content/uploads/2025/12/Photo1.jpg",
    paragraphs: [
      "Chaque année, plus d'un million de Camerounais du monde retournent en vacances au pays. Beaucoup en profitent pour soutenir leurs familles, leurs villes et leurs communautés par différentes actions : aides matérielles directes, conseils & formations, bénévolat associatif, consultations médicales gratuites...",
      "Ces actions solidaires sont souvent spontanées et mériteraient d'être mieux accompagnées et renforcées, avec le soutien des mairies, ONG et entreprises. Pour ces derniers, cette période est une actions unique pour créer des liens durables et construire des projets d'avenir avec la diaspora, un partenaire clé du développement local.",
      "Jesuisaucameroun.com est née avec cette ambition claire : transformer ces élans de solidarité en actions plus fortes et structurées, en lien avec les mairies, ONG et entreprises locales.",
      "Notre catalogue propose 14 champs d'action et 35 types de contributions possibles, allant de l'investissement et l'épargne, aux compétences, dons, réseaux d'influence, et tourisme solidaire."
    ]
  };

  const defis = content?.defis?.items || [
    "Sélection des acteurs et des missions",
    "Diversité des actions proposées",
    "Filtres de recherche optimisés",
    "Interlocuteur « diaspora » dédié et formé (chez chacun de nos membres)",
    "Suivi qualité",
    "Charte éthique"
  ];

  const champs = content?.champs || [
    "Investissement", "Santé", "Lutte contre la pauvreté", "Soutien à la société civile (femmes, jeunes…)",
    "Infrastructures et urbanisme", "Environnement et propreté", "Education et enfance", "Innovation",
    "Recrutement et formation professionnelle", "Tourisme", "Culture et patrimoine", "Rayonnement international",
    "Droits et citoyenneté", "Urgences humanitaires (catastrophe naturelle…)"
  ];

  const types = content?.types || [
    { title: "Investissement", items: ["Création entreprise", "Prise de participation directe", "Prise de participation dans fonds d'investissement", "Immobilier"] },
    { title: "Épargne", items: ["Épargne bancaire", "Diaspora bond", "Tontine"] },
    { title: "Compétences", items: ["Formation & coaching", "Avis technique", "Études & production technique", "Mentorat", "Offres d'emploi", "Consultation médicale", "Stage"] },
    { title: "Dons", items: ["Dons financiers", "Dons en matériels", "Mécénat"] },
    { title: "Réseaux & influence", items: ["Mission Ambassadeurs", "Mise en relation", "Diplomatie économique", "Relations médias", "Influence diaspora", "Rencontre avec officiels", "Soutien à l'export"] },
    { title: "Achats & tourisme solidaires", items: ["Achats locaux", "Tourisme local", "Sponsoring d'événements"] }
  ];

  const temoignages = content?.temoignages || [
    { id: "1", type: 'contributeur', name: "Dr. Marie Tankou", role: "Médecin, Paris", content: "Grâce à cette plateforme, j'ai pu contribuer à la construction d'un centre de santé dans mon village natal.", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop", emoji: "🏥" },
    { id: "2", type: 'maire', name: "M. Paul Mbarga", role: "Maire de Douala", content: "La diaspora apporte une expertise précieuse et des ressources qui nous manquent.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", emoji: "🤝" },
    { id: "3", type: 'contributeur', name: "Jean-Claude Fotso", role: "Entrepreneur, Montréal", content: "J'ai trouvé ici une façon concrète de redonner à ma communauté.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", emoji: "💡" }
  ];

  const faq = content?.faq || [
    { question: "Qui est à l'origine de cette plateforme ?", answer: "Jesuisaucameroun.com est le fruit d'un partenariat innovant..." },
    { question: "Qu'est-ce que jesuisaucameroun.com ?", answer: "jesuisaucameroun.com fait partie intégrante de la marketplace panafricaine..." }
  ];

  const getIcon = (label: string) => {
    const key = Object.keys(ICON_MAP).find(k => label.includes(k)) || 'Default';
    const IconComp = ICON_MAP[key] || Sparkles;
    return <IconComp className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />;
  };

  const getDefiIcon = (index: number) => {
    const icons = [CheckSquare, Users, Globe, MessageCircle, Award, Handshake];
    const IconComp = icons[index % icons.length];
    return <IconComp className="w-7 h-7" strokeWidth={2} style={{ color: '#016B06' }} />;
  };

  return (
    <div className="min-h-screen bg-page-bg">
      
      {/* Breadcrumb Navigation */}
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: 'Accueil', onClick: () => onNavigate('accueil') },
              { label: 'Première visite' },
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-bg-base via-primary to-bg-base py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-5 md:px-10 lg:px-20 relative z-10 text-center">
          <h1 className="text-white mb-6" style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}>
            {hero.title}
          </h1>
          <p className="text-white/85 mb-12 max-w-3xl mx-auto" style={{ fontSize: '17px', lineHeight: '1.6', fontWeight: 400 }}>
            {hero.subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {hero.stats.map((stat: any, idx: number) => (
              <div key={idx} className="text-center">
                <div className="text-white mb-1" style={{ fontSize: '25px', fontWeight: 600 }}>{stat.value}</div>
                <div className="text-white/80" style={{ fontSize: '13px', fontWeight: 400 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-16">
          
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12">
              <div>
                <h2 className="text-neutral-900 mb-8" style={{ fontSize: '40px', lineHeight: '1.2', fontWeight: 600 }}>
                  {pourquoi.title}
                </h2>
                <div className="relative w-full h-64 mb-8 rounded-2xl overflow-hidden shadow-md">
                  <Image src={pourquoi.image} alt="Pourquoi" fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-6">
                  {pourquoi.paragraphs.map((p: string, idx: number) => (
                    <p key={idx} className="text-neutral-700" style={{ fontSize: '17px', lineHeight: '1.8', fontWeight: 400 }}>{p}</p>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="grid grid-cols-1 gap-6">
                  {defis.map((item: string, idx: number) => (
                    <div key={idx} className="flex flex-col items-start p-5 bg-white rounded-xl shadow-[0px_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 border border-neutral-100">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#016B0615' }}>
                        {getDefiIcon(idx)}
                      </div>
                      <p className="text-neutral-800" style={{ fontSize: '15px', lineHeight: '1.5', fontWeight: 500 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-neutral-900 mb-12 text-center" style={{ fontSize: '40px', lineHeight: '1.2', fontWeight: 600 }}>
              Un catalogue de missions adaptées à la diaspora
            </h2>
            
            <div className="mb-16">
              <h3 className="text-neutral-900 mb-8" style={{ fontSize: '28px', lineHeight: '1.3', fontWeight: 600 }}>Champs d&apos;intervention</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {champs.map((champ: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                    {getIcon(champ)}
                    <span className="text-neutral-800 text-sm font-medium">{champ}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-neutral-900 mb-8" style={{ fontSize: '28px', lineHeight: '1.3', fontWeight: 600 }}>Types de mission</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {types.map((type: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      {getIcon(type.title)}
                      <h4 className="text-neutral-900" style={{ fontSize: '18px', fontWeight: 600 }}>{type.title}</h4>
                    </div>
                    <ul className="space-y-2 text-neutral-700 text-sm">
                      {type.items.map((it: string, i: number) => <li key={i}>• {it}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-20">
            <SectionTitleWithPlane title="Temoignages" subtitle="Ils contribuent activement au développement du pays." align="center" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {temoignages.map((t: any) => (
                t.type === 'maire' ? (
                  <CarteTemoignageMaire key={t.id} emoji={t.emoji} citation={t.content} nom={t.name} titre={t.role} avatar={t.avatar} />
                ) : (
                  <CarteTemoignage key={t.id} variant="utilisateur" avatarColor="teal" emoji={t.emoji} citation={t.content} nom={t.name} titre={t.role} avatar={t.avatar} />
                )
              ))}
            </div>
          </section>

          <section className="w-full py-20 bg-white">
            <div className="max-w-4xl mx-auto">
              <SectionTitleWithPlane title="Questions fréquentes" subtitle="Tout ce que vous devez savoir" align="center" />
              <div className="space-y-0">
                {faq.map((item: any, idx: number) => (
                  <ElementFAQ key={idx} question={item.question} reponse={<>{item.answer}</>} />
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}