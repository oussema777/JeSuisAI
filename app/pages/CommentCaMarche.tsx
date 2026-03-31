'use client';

import {
  Search,
  FileText,
  Edit,
  Handshake,
  Target,
  Lightbulb,
  UserPlus,
  DollarSign,
  Brain,
  Gift,
  Network,
  ShoppingBag,
  Shield,
  Lock,
  Eye,
  HeadphonesIcon,
  Sparkles,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { Bouton } from '../components/ds/Bouton';
import { FilDAriane } from '../components/listing/FilDAriane';
import { CarteEtape } from '../components/commentcamarche/CarteEtape';
import { CarteGarantie } from '../components/commentcamarche/CarteGarantie';
import { CarteTypeContribution } from '../components/commentcamarche/CarteTypeContribution';
import { BlocAstuce } from '../components/commentcamarche/BlocAstuce';
import { BadgeEtape } from '../components/commentcamarche/BadgeEtape';
import { ElementFAQ } from '../components/landing/ElementFAQ';
import { Skeleton } from '../components/ds/Skeleton';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const supabase = getSupabaseBrowserClient();

export default function CommentCaMarche() {
  const tNav = useTranslations('Navigation');
  const tCommon = useTranslations('Common');
  const params = useParams();
  const currentLocale = params.locale as string || 'fr';
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error } = await supabase.from('static_contents').select('content').eq('key', 'comment-ca-marche').eq('lang', currentLocale).maybeSingle();
        if (data?.content) setContent(data.content);
      } catch (err) {
        console.error('Error loading content:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [currentLocale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg">
        <div className="max-w-4xl mx-auto px-5 md:px-10 py-24 space-y-8">
          <Skeleton className="h-16 w-3/4 mx-auto" />
          <Skeleton className="h-24 w-1/2 mx-auto" />
          <Skeleton className="h-48 w-48 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  const hero = content?.hero || {
    title: currentLocale === 'en' ? "How to contribute to the development of Cameroon in 4 simple steps" : "Comment contribuer au développement du Cameroun en 4 étapes simples",
    subtitle: currentLocale === 'en' ? "A transparent and secure process that allows you to make a difference from abroad" : "Un processus transparent et sécurisé qui vous permet de faire la différence depuis l'étranger"
  };

  const steps = content?.steps || [
    {
      number: "1",
      title: currentLocale === 'en' ? "Discover" : "Découvrez",
      description: currentLocale === 'en' ? "Browse actions published by Cameroonian cities and airports. Filter by region, sector of activity or type of contribution." : "Parcourez les actions publiées par les villes et aéroports camerounais. Filtrez par région, secteur d'activité ou type de contribution.",
      time: "~2 min",
      tip: currentLocale === 'en' ? "Use the « Stay dates » filter if you are planning a holiday in Cameroon to find missions on site." : "Utilisez le filtre « Date de séjour » si vous prévoyez des vacances au Cameroun pour trouver des missions sur place.",
      image: "https://images.unsplash.com/photo-1739300293504-234817eead52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwd29tYW4lMjBsYXB0b3AlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2NTc1MjY2MXww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      number: "2",
      title: currentLocale === 'en' ? "Choose" : "Choisissez",
      description: currentLocale === 'en' ? "Select an action that matches your skills, availability and interests. Read all details and requirements." : "Sélectionnez une action qui correspond à vos compétences, votre disponibilité et vos centres d'intérêt. Lisez tous les détails et exigences.",
      time: "~5 min",
      tip: currentLocale === 'en' ? "Don't hesitate to contact the city hall directly if you have any questions before applying." : "N'hésitez pas à contacter directement la mairie si vous avez des questions avant de candidater.",
      image: "https://images.unsplash.com/photo-1615463669098-521a22047a1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDYW1lcm9vbiUyMGNpdHklMjBtb2Rlcm4lMjBidWlsZGluZ3N8ZW58MXx8fHwxNzY1NzUyNjYyfDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      number: "3",
      title: currentLocale === 'en' ? "Apply" : "Candidatez",
      description: currentLocale === 'en' ? "Fill out the application form in a few clicks. Present your profile, motivations and contribution proposal." : "Remplissez le formulaire de candidature en quelques clics. Présentez votre profil, vos motivations et votre proposition de contribution.",
      time: "~8 min",
      tip: currentLocale === 'en' ? "Take care of your motivation message. It's your first impression with the city hall!" : "Soignez votre message de motivation. C'est votre première impression auprès de la mairie !"
    },
    {
      number: "4",
      title: currentLocale === 'en' ? "Contribute" : "Contribuez",
      description: currentLocale === 'en' ? "The city hall will contact you within 7-14 days. Once the details are defined together, you start your mission and make a difference." : "La mairie vous contacte sous 7-14 jours. Une fois les modalités définies ensemble, vous démarrez votre mission et faites la différence.",
      time: "Variable",
      tip: currentLocale === 'en' ? "Stay responsive to emails. Municipalities appreciate contributors who are available and communicative." : "Restez réactif aux emails. Les municipalités apprécient les contributeurs disponibles et communicatifs.",
      image: "https://images.unsplash.com/photo-1745847768380-2caeadbb3b71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kc2hha2UlMjBwYXJ0bmVyc2hpcCUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzY1MTM4MjI3fDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  const ways = content?.ways || {
    existing: {
      title: currentLocale === 'en' ? "Option A: Respond to an existing mission" : "Option A : Répondre à une mission existante",
      description: currentLocale === 'en' ? "Browse the published missions and choose the one that matches your profile. It's the simplest option if you want to respond to an identified need." : "Parcourez les missions publiées et choisissez celle qui correspond à votre profil. C'est l'option la plus simple si vous souhaitez répondre à un besoin identifié.",
      bullets: currentLocale === 'en' ? ["Discover real needs", "Contribute quickly", "Clear framework"] : ["Découvrir les besoins réels", "Contribuer rapidement", "Cadre clair"]
    },
    spontaneous: {
      title: currentLocale === 'en' ? "Option B: Propose your own project" : "Option B : Proposer votre propre projet",
      description: currentLocale === 'en' ? "Do you have a project idea or want to propose your expertise spontaneously? Submit your proposal directly via the spontaneous project form." : "Vous avez une idée de projet ou souhaitez proposer votre expertise spontanément ? Soumettez votre proposition directement via le formulaire de projet spontané.",
      bullets: currentLocale === 'en' ? ["Impactful projects", "Specific expertise", "Tailor-made collaboration"] : ["Projets impactants", "Expertise spécifique", "Collaboration sur-mesure"]
    },
    profile: {
      title: currentLocale === 'en' ? "Option C: Submit your profile" : "Option C : Soumettre votre profil",
      description: currentLocale === 'en' ? "You have a skill and availability that you want to communicate directly to one or more cities in order to trigger new missions (e.g., training youth in AI). Submit your profile directly via the spontaneous profile form." : "Vous avez une compétence et une disponibilité que vous souhaitez communiquer directement à une ou plusieurs villes en vue de susciter de nouvelles missions (par exemple : formation des jeunes à l’IA). Soumettez votre profil directement via le formulaire de profil spontané.",
      bullets: currentLocale === 'en' ? ["Innovative initiatives", "Specific expertise", "Tailor-made collaboration"] : ["Initiatives innovantes", "Expertise spécifique", "Collaboration sur-mesure"]
    }
  };

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
                { label: currentLocale === 'en' ? 'Home' : 'Accueil', href: '/' },
                { label: currentLocale === 'en' ? 'Platform' : 'Plateforme' },
                { label: currentLocale === 'en' ? 'How it works' : 'Comment ça marche' },
            ]}
          />
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="w-full bg-gradient-to-br from-neutral-50 to-white py-24">
        <div className="max-w-4xl mx-auto px-5 md:px-10 lg:px-20 text-center">
          {/* Headline */}
          <h1
            className="text-neutral-900 mb-6"
            style={{ fontSize: '49px', lineHeight: '1.2', fontWeight: 600 }}
          >
            {hero.title}
          </h1>

          {/* Subheadline */}
          <p
            className="text-neutral-700 mb-12 max-w-3xl mx-auto"
            style={{ fontSize: '20px', lineHeight: '1.6', fontWeight: 400 }}
          >
            {hero.subtitle}
          </p>

          {/* Hero Illustration */}
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center">
              <Handshake className="w-24 h-24 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: OVERVIEW STEPS */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <CarteEtape
              numero="1"
              icon={<Search className="w-16 h-16" strokeWidth={2} />}
              titre={steps[0].title}
              description={steps[0].description}
              temps={steps[0].time}
              showConnector={true}
            />

            <CarteEtape
              numero="2"
              icon={<FileText className="w-16 h-16" strokeWidth={2} />}
              titre={steps[1].title}
              description={steps[1].description}
              temps={steps[1].time}
              showConnector={true}
            />

            <CarteEtape
              numero="3"
              icon={<Edit className="w-16 h-16" strokeWidth={2} />}
              titre={steps[2].title}
              description={steps[2].description}
              temps={steps[2].time}
              showConnector={true}
            />

            <CarteEtape
              numero="4"
              icon={<Handshake className="w-16 h-16" strokeWidth={2} />}
              titre={steps[3].title}
              description={steps[3].description}
              temps={steps[3].time}
              showConnector={false}
            />
          </div>
        </div>
      </section>

      {/* SECTION: DETAILED WALKTHROUGH */}
      <section className="w-full py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
          {/* Heading */}
          <h2
            className="text-neutral-900 text-center mb-16"
            style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}
          >
            {currentLocale === 'en' ? 'The process in detail' : 'Le processus en détail'}
          </h2>

          <div className="space-y-24">
            {/* STEP 1 DETAIL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Content */}
              <div className="space-y-6">
                <BadgeEtape numero="1" />

                <h3
                  className="text-neutral-900"
                  style={{ fontSize: '25px', fontWeight: 600 }}
                >
                  {steps[0].title}
                </h3>

                <div
                  className="text-neutral-700 space-y-4"
                  style={{ fontSize: '16px', lineHeight: '1.7', fontWeight: 400 }}
                >
                  <p>
                    Commencez par explorer les missions disponibles sur la plateforme. Vous
                    pouvez :
                  </p>

                  <ul className="space-y-2 ml-5 list-disc">
                    <li>Parcourir toutes les missions sur la page &quot;Missions&quot;</li>
                    <li>
                      Utiliser les filtres pour affiner par région, secteur ou type de contribution
                    </li>
                    <li>Rechercher par mot-clé une action spécifique</li>
                    <li>
                      Consulter les missions &quot;à la une&quot; directement sur la page
                      d&apos;accueil
                    </li>
                  </ul>

                  <p>Chaque action affiche clairement :</p>

                  <ul className="space-y-2 ml-5 list-disc">
                    <li>Le titre et la description du projet</li>
                    <li>La ville ou l&apos;aéroport émetteur</li>
                    <li>Le secteur d&apos;activité concerné</li>
                    <li>
                      Le type de contribution attendu (investissement, compétences, dons, etc.)
                    </li>
                    <li>Les badges &quot;Urgent&quot; ou &quot;Prioritaire&quot; si applicable</li>
                  </ul>
                </div>

                <BlocAstuce texte={steps[0].tip} />
              </div>

              {/* Right - Visual */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                {steps[0].image && (
                  <Image
                    src={steps[0].image}
                    alt={steps[0].title}
                    width={1080}
                    height={720}
                    className="w-full h-full object-cover min-h-[400px]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base/40 to-transparent"></div>
              </div>
            </div>

            {/* STEP 2 DETAIL - REVERSE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Visual (on desktop, appears first due to order) */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl lg:order-1 order-2">
                {steps[1].image && (
                  <Image
                    src={steps[1].image}
                    alt={steps[1].title}
                    width={1080}
                    height={720}
                    className="w-full h-full object-cover min-h-[400px]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
              </div>

              {/* Right - Content */}
              <div className="space-y-6 lg:order-2 order-1">
                <BadgeEtape numero="2" />

                <h3
                  className="text-neutral-900"
                  style={{ fontSize: '25px', fontWeight: 600 }}
                >
                  {steps[1].title}
                </h3>

                <div
                  className="text-neutral-700 space-y-4"
                  style={{ fontSize: '16px', lineHeight: '1.7', fontWeight: 400 }}
                >
                  <p>
                    Une fois qu&apos;une action attire votre attention, cliquez sur
                    &quot;Voir les détails&quot; pour accéder à toutes les informations :
                  </p>

                  <p className="font-semibold text-neutral-900">Informations complètes :</p>
                  <ul className="space-y-2 ml-5 list-disc">
                    <li>Objectifs et impacts recherchés</li>
                    <li>Contributions attendues en détail</li>
                    <li>Conditions de la mission (durée, engagement, niveau requis)</li>
                    <li>Rémunération ou facilités offertes</li>
                    <li>Documents techniques à télécharger</li>
                  </ul>

                  <p className="font-semibold text-neutral-900">Vérification de légitimité :</p>
                  <ul className="space-y-2 ml-5 list-disc">
                    <li>Logo et nom de la mairie émettrice</li>
                    <li>Contact direct du responsable diaspora</li>
                    <li>Badge de vérification &quot;Validé par Jesuisaucameroun.com&quot;</li>
                  </ul>

                  <p>
                    Prenez le temps de lire attentivement pour vous assurer que la mission
                    correspond à votre profil et vos disponibilités.
                  </p>
                </div>

                <BlocAstuce texte={steps[1].tip} />
              </div>
            </div>

            {/* STEP 3 DETAIL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Content */}
              <div className="space-y-6">
                <BadgeEtape numero="3" />

                <h3
                  className="text-neutral-900"
                  style={{ fontSize: '25px', fontWeight: 600 }}
                >
                  {steps[2].title}
                </h3>

                <div
                  className="text-neutral-700 space-y-4"
                  style={{ fontSize: '16px', lineHeight: '1.7', fontWeight: 400 }}
                >
                  <p>
                    Prêt à vous engager ? Cliquez sur &quot;Passer à l&apos;action&quot; pour
                    accéder au formulaire de candidature.
                  </p>

                  <p className="font-semibold text-neutral-900">Informations demandées :</p>
                  <ul className="space-y-2 ml-5 list-disc">
                    <li>Votre profil (nom, prénom, email, téléphone, pays de résidence)</li>
                    <li>Vos compétences et expertise</li>
                    <li>Votre message de motivation (6 lignes minimum)</li>
                    <li>Votre type de contribution proposée</li>
                    <li>Vos disponibilités (dates, durée)</li>
                    <li>Documents complémentaires (CV, portfolio - optionnel)</li>
                  </ul>

                  <p>
                    <span className="font-semibold text-neutral-900">Le formulaire est pré-rempli</span>{' '}
                    avec l&apos;action sélectionnée pour vous faire gagner du temps.
                  </p>

                  <p className="font-semibold text-neutral-900">Après soumission :</p>
                  <ol className="space-y-2 ml-5 list-decimal">
                    <li>Vous recevez immédiatement un email de confirmation</li>
                    <li>La mairie reçoit votre candidature avec toutes vos informations</li>
                    <li>Une page de confirmation vous indique les prochaines étapes</li>
                    <li>
                      Si pas de réponse sous 14 jours, une relance automatique est envoyée
                    </li>
                  </ol>
                </div>

                <BlocAstuce texte={steps[2].tip} />
              </div>

              {/* Right - Visual */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-neutral-100 flex items-center justify-center min-h-[400px]">
                <div className="text-center p-8">
                  <Edit className="w-32 h-32 text-primary/20 mx-auto mb-4" strokeWidth={1} />
                  <p className="text-neutral-500" style={{ fontSize: '14px' }}>
                    Formulaire de candidature
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 4 DETAIL - REVERSE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Visual */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl lg:order-1 order-2">
                {steps[3].image && (
                  <Image
                    src={steps[3].image}
                    alt={steps[3].title}
                    width={1080}
                    height={720}
                    className="w-full h-full object-cover min-h-[400px]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-success/20 to-transparent"></div>
              </div>

              {/* Right - Content */}
              <div className="space-y-6 lg:order-2 order-1">
                <BadgeEtape numero="4" />

                <h3
                  className="text-neutral-900"
                  style={{ fontSize: '25px', fontWeight: 600 }}
                >
                  {steps[3].title}
                </h3>

                <div
                  className="text-neutral-700 space-y-4"
                  style={{ fontSize: '16px', lineHeight: '1.7', fontWeight: 400 }}
                >
                  <p>Félicitations ! Votre candidature est entre les mains de la mairie.</p>

                  <p className="font-semibold text-neutral-900">Délai de réponse :</p>
                  <ul className="space-y-2 ml-5 list-disc">
                    <li>La mairie étudie votre profil sous 7 à 14 jours</li>
                    <li>
                      Vous êtes contacté par email ou téléphone si votre profil correspond
                    </li>
                    <li>
                      Si pas de réponse sous 14 jours, une relance automatique est envoyée par
                      la plateforme
                    </li>
                  </ul>

                  <p className="font-semibold text-neutral-900">Prise de contact :</p>
                  <ul className="space-y-2 ml-5 list-disc">
                    <li>Le responsable diaspora de la mairie vous contacte directement</li>
                    <li>
                      Vous discutez ensemble des modalités pratiques (dates, durée, conditions)
                    </li>
                    <li>Vous définissez les objectifs précis de votre contribution</li>
                  </ul>

                  <p className="font-semibold text-neutral-900">Démarrage de la mission :</p>
                  <ul className="space-y-2 ml-5 list-disc">
                    <li>Une fois tout clarifié, vous commencez votre contribution</li>
                    <li>
                      Vous restez en contact direct avec la mairie tout au long du projet
                    </li>
                    <li>Vous pouvez suivre l&apos;impact de votre action</li>
                  </ul>

                  <p className="font-semibold text-neutral-900">Après votre contribution :</p>
                  <ul className="space-y-2 ml-5 list-disc">
                    <li>
                      Vous pouvez partager votre témoignage sur la plateforme (avec votre accord)
                    </li>
                    <li>Vous recevez des suggestions d&apos;autres actions similaires</li>
                    <li>Vous inspirez d&apos;autres membres de la diaspora à s&apos;engager</li>
                  </ul>
                </div>

                <BlocAstuce texte={steps[3].tip} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: TROIS FAÇONS DE CONTRIBUER */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
          {/* Heading */}
          <h2
            className="text-neutral-900 text-center mb-16"
            style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}
          >
            {currentLocale === 'en' ? 'Three ways to contribute' : 'Trois façons de contribuer'}
          </h2>

          {/* 3-Column Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Répondre à une action */}
            <div className="bg-neutral-50 rounded-xl p-8 flex flex-col border border-neutral-100">
              <div className="w-12 h-12 text-primary mb-6">
                <Target className="w-12 h-12" strokeWidth={2} />
              </div>

              <h3
                className="text-neutral-900 mb-4"
                style={{ fontSize: '20px', fontWeight: 600 }}
              >
                {ways.existing.title}
              </h3>

              <div
                className="text-neutral-700 mb-6 flex-grow"
                style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}
              >
                <p className="mb-4">
                  {ways.existing.description}
                </p>

                <p className="font-semibold text-neutral-900 mb-2">Idéal pour :</p>
                <ul className="space-y-1 ml-5 list-disc italic text-neutral-600">
                  {ways.existing.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
                </ul>
              </div>

              <Link href="/missions" passHref>
                <Bouton
                  variant="secondaire"
                  size="moyen"
                  fullWidth
                >
                  {currentLocale === 'en' ? 'See missions' : 'Voir les missions'}
                </Bouton>
              </Link>
            </div>

            {/* Column 2: Proposer un projet */}
            <div className="bg-neutral-50 rounded-xl p-8 flex flex-col border border-neutral-100">
              <div className="w-12 h-12 text-primary mb-6">
                <Lightbulb className="w-12 h-12" strokeWidth={2} />
              </div>

              <h3
                className="text-neutral-900 mb-4"
                style={{ fontSize: '20px', fontWeight: 600 }}
              >
                {ways.spontaneous.title}
              </h3>

              <div
                className="text-neutral-700 mb-6 flex-grow"
                style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}
              >
                <p className="mb-4">
                  {ways.spontaneous.description}
                </p>

                <p className="font-semibold text-neutral-900 mb-2">Idéal pour :</p>
                <ul className="space-y-1 ml-5 list-disc italic text-neutral-600">
                  {ways.spontaneous.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
                </ul>
              </div>
              <Link href="/soumettre-projet" passHref>
                <Bouton variant="secondaire" size="moyen" fullWidth>
                  {tNav('submit_project')}
                </Bouton>
              </Link>
            </div>

            {/* Column 3: Soumettre votre profil */}
            <div className="bg-primary/8 rounded-xl p-8 flex flex-col border-2 border-primary/20">
              <div className="w-12 h-12 text-primary mb-6">
                <UserPlus className="w-12 h-12" strokeWidth={2} />
              </div>

              <h3
                className="text-neutral-900 mb-4"
                style={{ fontSize: '20px', fontWeight: 600 }}
              >
                {ways.profile.title}
              </h3>

              <div
                className="text-neutral-700 mb-6 flex-grow"
                style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}
              >
                <p className="mb-4">
                  {ways.profile.description}
                </p>

                <p className="font-semibold text-neutral-900 mb-2">Idéal pour :</p>
                <ul className="space-y-1 ml-5 list-disc italic text-neutral-600">
                  {ways.profile.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
                </ul>
              </div>
              <Link href="/soumettre-profil" passHref>
                <Bouton variant="primaire" size="moyen" fullWidth>
                  {tNav('submit_profile')}
                </Bouton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: TYPES DE CONTRIBUTIONS */}
      <section className="w-full py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
          {/* Heading */}
          <h2
            className="text-neutral-900 text-center mb-4"
            style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}
          >
            {currentLocale === 'en' ? 'Different types of contributions' : 'Les différents types de contributions'}
          </h2>

          {/* Subheadline */}
          <p
            className="text-neutral-700 text-center mb-16 max-w-3xl mx-auto"
            style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: 400 }}
          >
            {currentLocale === 'en' ? 'Whatever your situation, there is a way for you to contribute' : 'Quelle que soit votre situation, il existe une façon pour vous de contribuer'}
          </p>

          {/* Contribution Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(content?.contributionTypes || [
              {
                title: "Investissement financier",
                description: "Financement de projets d'infrastructure, équipements, ou création d'entreprises locales.",
                examples: ["Création d'entreprise", 'Participation directe ou fonds', 'Immobilier', 'Épargne bancaire / Diaspora bonds']
              },
              {
                title: "Expertise et compétences",
                description: "Apport de votre savoir-faire professionnel à travers formations, conseils ou missions terrain.",
                examples: ['Formation & coaching', 'Avis technique', 'Études et production technique', 'Mentorat', 'Consultation médicale']
              },
              {
                title: "Dons matériels et financiers",
                description: "Contributions en nature (équipements, matériels) ou financières pour soutenir des causes spécifiques.",
                examples: ['Dons financiers', 'Dons en matériels', 'Parrainage d’événements']
              },
              {
                title: "Réseaux et influence",
                description: "Utilisation de votre réseau professionnel pour créer des actions et partenariats.",
                examples: ['Mise en relation avec partenaires', 'Missions ambassadeurs', 'Relations médias internationaux', 'Diplomatie économique']
              },
              {
                title: "Achats et tourisme solidaires",
                description: "Soutien à l'économie locale à travers vos achats et visites lors de vos séjours au Cameroun.",
                examples: ['Achats produits locaux/artisanat', 'Tourisme local', 'Sponsoring d’événements', 'Soutien à l’export']
              }
            ]).map((ct: any, i: number) => (
              <CarteTypeContribution
                key={i}
                icon={
                  i === 0 ? <DollarSign className="w-12 h-12" strokeWidth={2} /> :
                  i === 1 ? <Brain className="w-12 h-12" strokeWidth={2} /> :
                  i === 2 ? <Gift className="w-12 h-12" strokeWidth={2} /> :
                  i === 3 ? <Network className="w-12 h-12" strokeWidth={2} /> :
                  <ShoppingBag className="w-12 h-12" strokeWidth={2} />
                }
                titre={ct.title}
                description={ct.description}
                exemples={ct.examples}
              />
            ))}

            {/* Placeholder card for grid balance */}
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* SECTION: GARANTIES ET SÉCURITÉ */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
          {/* Heading */}
          <h2
            className="text-neutral-900 text-center mb-16"
            style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}
          >
            {currentLocale === 'en' ? 'Your guarantees and our commitment' : 'Vos garanties et notre engagement'}
          </h2>

          {/* Guarantee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {(content?.guarantees || [
              { title: "actions vérifiées", description: "Toutes les actions proviennent directement de municipalités et aéroports partenaires officiels. Aucune arnaque possible." },
              { title: "Données sécurisées", description: "Vos informations personnelles sont protégées et ne sont partagées qu'avec les municipalités concernées par votre candidature." },
              { title: "Transparence totale", description: "Contact direct avec les responsables locaux, suivi de votre candidature, et relances automatiques en cas de non-réponse." },
              { title: "Support disponible", description: "Notre équipe est disponible pour répondre à vos questions et vous accompagner à chaque étape du processus." },
              { title: "Gratuit à 100%", description: "L'utilisation de la plateforme est entièrement gratuite pour les membres de la diaspora. Aucun frais caché." },
              { title: "Impact mesurable", description: "Nous suivons et documentons l'impact réel de chaque contribution pour améliorer continuellement nos processus." }
            ]).map((g: any, i: number) => (
              <CarteGarantie
                key={i}
                icon={
                  i === 0 ? <Shield className="w-8 h-8" strokeWidth={2} /> :
                  i === 1 ? <Lock className="w-8 h-8" strokeWidth={2} /> :
                  i === 2 ? <Eye className="w-8 h-8" strokeWidth={2} /> :
                  i === 3 ? <HeadphonesIcon className="w-8 h-8" strokeWidth={2} /> :
                  i === 4 ? <Sparkles className="w-8 h-8" strokeWidth={2} /> :
                  <TrendingUp className="w-8 h-8" strokeWidth={2} />
                }
                titre={g.title}
                description={g.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: FAQ PROCESS */}
      <section className="w-full py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-5 md:px-10 lg:px-20">
          {/* Heading */}
          <h2
            className="text-neutral-900 text-center mb-16"
            style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}
          >
            {currentLocale === 'en' ? 'Questions about the process' : 'Questions sur le processus'}
          </h2>

          {/* FAQ List */}
          <div className="space-y-0">
            {(content?.faq || [
              { question: "Combien de temps prend le processus de candidature ?", answer: "Le formulaire de candidature prend environ 8 à 10 minutes à remplir. Après soumission, la mairie prend généralement 7 à 14 jours pour examiner votre profil et vous contacter si votre candidature est retenue." },
              { question: "Puis-je candidater à plusieurs actions en même temps ?", answer: "Oui, absolument ! Vous pouvez candidater à autant d'actions que vous le souhaitez. Cependant, assurez-vous d'avoir la disponibilité nécessaire pour honorer vos engagements si plusieurs candidatures sont acceptées." },
              { question: "Que se passe-t-il si la mairie ne répond pas ?", answer: "Si vous ne recevez pas de réponse sous 14 jours, notre système envoie automatiquement une relance à la mairie. Vous recevez également une notification pour vous tenir informé. Si aucune réponse n'est donnée après 30 jours, nous vous suggérons d'autres actions similaires." }
            ]).map((f: any, i: number) => (
              <ElementFAQ
                key={i}
                question={f.question}
                reponse={f.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: READY TO START CTA */}
      <section className="w-full py-20 bg-primary/10">
        <div className="max-w-3xl mx-auto px-5 md:px-10 lg:px-20 text-center">
          {/* Heading */}
          <h2
            className="text-neutral-900 mb-6"
            style={{ fontSize: '39px', lineHeight: '1.2', fontWeight: 600 }}
          >
            {content?.cta?.title || "Prêt à faire la différence ?"}
          </h2>

          {/* Body */}
          <p
            className="text-neutral-700 mb-8"
            style={{ fontSize: '20px', lineHeight: '1.6', fontWeight: 400 }}
          >
            {content?.cta?.subtitle || "Rejoignez les 1,800+ membres de la diaspora qui contribuent déjà au développement du Cameroun"}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <Link href="/missions" passHref>
            <Bouton
              variant="primaire"
              size="large"
            >
              Découvrir les missions
            </Bouton>
            </Link>
            <Link href="/soumettre-projet" passHref>
            <Bouton variant="secondaire" size="large">
              Proposer mon projet
            </Bouton>
            </Link>
          </div>

          {/* Small text */}
          <p
            className="text-neutral-600"
            style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.5' }}
          >
            {content?.cta?.smallText || "Aucune inscription requise pour explorer. Vous ne fournirez vos informations qu'au moment de candidater."}
          </p>
        </div>
      </section>
    </div>
  );
}
