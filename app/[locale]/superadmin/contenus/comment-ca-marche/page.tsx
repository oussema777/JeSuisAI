'use client';

import React, { useState, useEffect } from 'react';
import { SidebarSuperadmin } from '@/app/components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '@/app/components/superadmin/HeaderSuperadmin';
import { 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Layout,
  List,
  HelpCircle,
  ShieldCheck,
  Target,
  Type,
  Image as ImageIcon,
  Languages
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  time?: string;
  tip?: string;
  image?: string;
  details?: string[];
  info_list?: string[];
}

interface ContributionType {
  id: string;
  title: string;
  description: string;
  examples: string[];
}

interface Guarantee {
  id: string;
  title: string;
  description: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface CommentContent {
  hero: {
    title: string;
    subtitle: string;
  };
  steps: Step[];
  ways: {
    existing: {
      title: string;
      description: string;
      bullets: string[];
    };
    spontaneous: {
      title: string;
      description: string;
      bullets: string[];
    };
    profile: {
      title: string;
      description: string;
      bullets: string[];
    };
  };
  contributionTypes: ContributionType[];
  guarantees: Guarantee[];
  faq: FAQItem[];
  cta: {
    title: string;
    subtitle: string;
    smallText: string;
  };
}

const DEFAULT_CONTENT: CommentContent = {
  hero: {
    title: "Comment contribuer au développement du Cameroun en 4 étapes simples",
    subtitle: "Un processus transparent et sécurisé qui vous permet de faire la différence depuis l'étranger"
  },
  steps: [
    {
      id: "1",
      number: "1",
      title: "Découvrez",
      description: "Parcourez les actions publiées par les villes et aéroports camerounais. Filtrez par région, secteur d'activité ou type de contribution.",
      time: "~2 min",
      tip: "Utilisez le filtre « Date de séjour » si vous prévoyez des vacances au Cameroun pour trouver des missions sur place.",
      image: "https://images.unsplash.com/photo-1739300293504-234817eead52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwd29tYW4lMjBsYXB0b3AlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2NTc1MjY2MXww&ixlib=rb-4.1.0&q=80&w=1080",
      details: [
        "Parcourir toutes les missions sur la page \"Missions\"",
        "Utiliser les filtres pour affiner par région, secteur ou type de contribution",
        "Rechercher par mot-clé une action spécifique",
        "Consulter les missions \"à la une\" directement sur la page d'accueil"
      ],
      info_list: [
        "Le titre et la description du projet",
        "La ville ou l'aéroport émetteur",
        "Le secteur d'activité concerné",
        "Le type de contribution attendu",
        "Les badges \"Urgent\" ou \"Prioritaire\""
      ]
    },
    {
      id: "2",
      number: "2",
      title: "Choisissez",
      description: "Sélectionnez une action qui correspond à vos compétences, votre disponibilité et vos centres d'intérêt. Lisez tous les détails et exigences.",
      time: "~5 min",
      tip: "N'hésitez pas à contacter directement la mairie si vous avez des questions avant de candidater.",
      image: "https://images.unsplash.com/photo-1615463669098-521a22047a1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDYW1lcm9vbiUyMGNpdHklMjBtb2Rlcm4lMjBidWlsZGluZ3N8ZW58MXx8fHwxNzY1NzUyNjYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      details: [
        "Objectifs et impacts recherchés",
        "Contributions attendues en détail",
        "Conditions de la mission (durée, engagement, niveau requis)",
        "Rémunération ou facilités offertes",
        "Documents techniques à télécharger"
      ],
      info_list: [
        "Logo et nom de la mairie émettrice",
        "Contact direct du responsable diaspora",
        "Badge de vérification \"Validé par Jesuisaucameroun.com\""
      ]
    },
    {
      id: "3",
      number: "3",
      title: "Candidatez",
      description: "Remplissez le formulaire de candidature en quelques clics. Présentez votre profil, vos motivations et votre proposition de contribution.",
      time: "~8 min",
      tip: "Soignez votre message de motivation. C'est votre première impression auprès de la mairie !",
      details: [
        "Votre profil (nom, prénom, email, téléphone, pays de résidence)",
        "Vos compétences et expertise",
        "Votre message de motivation (6 lignes minimum)",
        "Votre type de contribution proposée",
        "Vos disponibilités (dates, durée)",
        "Documents complémentaires (CV, portfolio - optionnel)"
      ],
      info_list: [
        "Vous recevez immédiatement un email de confirmation",
        "La mairie reçoit votre candidature avec toutes vos informations",
        "Une page de confirmation vous indique les prochaines étapes",
        "Si pas de réponse sous 14 jours, une relance automatique est envoyée"
      ]
    },
    {
      id: "4",
      number: "4",
      title: "Contribuez",
      description: "La mairie vous contacte sous 7-14 jours. Une fois les modalités définies ensemble, vous démarrez votre mission et faites la différence.",
      time: "Variable",
      tip: "Restez réactif aux emails. Les municipalités apprécient les contributeurs disponibles et communicatifs.",
      image: "https://images.unsplash.com/photo-1745847768380-2caeadbb3b71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kc2hha2UlMjBwYXJ0bmVyc2hpcCUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzY1MTM4MjI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      details: [
        "La mairie étudie votre profil sous 7 à 14 jours",
        "Le responsable diaspora vous contacte pour les modalités",
        "Vous définissez les objectifs précis",
        "Démarrage et suivi d'impact"
      ],
      info_list: [
        "Partager votre témoignage",
        "Inspirer d'autres membres",
        "Recevoir d'autres suggestions"
      ]
    }
  ],
  ways: {
    existing: {
      title: "Option A : Répondre à une mission existante",
      description: "Parcourez les missions publiées et choisissez celle qui correspond à votre profil. C'est l'option la plus simple si vous souhaitez répondre à un besoin identifié.",
      bullets: ["Découvrir les besoins réels", "Contribuer rapidement", "Cadre clair"]
    },
    spontaneous: {
      title: "Option B : Proposer votre propre projet",
      description: "Vous avez une idée de projet ou souhaitez proposer votre expertise spontanément ? Soumettez votre proposition directement via le formulaire de projet spontané.",
      bullets: ["Projets impactants", "Expertise spécifique", "Collaboration sur-mesure"]
    },
    profile: {
      title: "Option C : Soumettre votre profil",
      description: "Vous avez une compétence et une disponibilité que vous souhaitez communiquer directement à une ou plusieurs villes en vue de susciter de nouvelles missions (par exemple : formation des jeunes à l’IA). Soumettez votre profil directement via le formulaire de profil spontané.",
      bullets: ["Initiatives innovantes", "Expertise spécifique", "Collaboration sur-mesure"]
    }
  },
  contributionTypes: [
    {
      id: "1",
      title: "Investissement financier",
      description: "Financement de projets d'infrastructure, équipements, ou création d'entreprises locales.",
      examples: ["Création d'entreprise", "Participation directe ou fonds", "Immobilier", "Épargne bancaire / Diaspora bonds"]
    },
    {
      id: "2",
      title: "Expertise et compétences",
      description: "Apport de votre savoir-faire professionnel à travers formations, conseils ou missions terrain.",
      examples: ["Formation & coaching", "Avis technique", "Études et production technique", "Mentorat", "Consultation médicale"]
    },
    {
      id: "3",
      title: "Dons matériels et financiers",
      description: "Contributions en nature (équipements, matériels) ou financières pour soutenir des causes spécifiques.",
      examples: ["Dons financiers", "Dons en matériels", "Parrainage d'événements"]
    },
    {
      id: "4",
      title: "Réseaux et influence",
      description: "Utilisation de votre réseau professionnel pour créer des actions et partenariats.",
      examples: ["Mise en relation avec partenaires", "Missions ambassadeurs", "Relations médias internationaux", "Diplomatie économique"]
    },
    {
      id: "5",
      title: "Achats et tourisme solidaires",
      description: "Soutien à l'économie locale à travers vos achats et visites lors de vos séjours au Cameroun.",
      examples: ["Achats produits locaux/artisanat", "Tourisme local", "Sponsoring d'événements", "Soutien à l'export"]
    }
  ],
  guarantees: [
    { id: "1", title: "actions vérifiées", description: "Toutes les actions proviennent directement de municipalités et aéroports partenaires officiels. Aucune arnaque possible." },
    { id: "2", title: "Données sécurisées", description: "Vos informations personnelles sont protégées et ne sont partagées qu'avec les municipalités concernées." },
    { id: "3", title: "Transparence totale", description: "Contact direct avec les responsables locaux, suivi de votre candidature, et relances automatiques." },
    { id: "4", title: "Support disponible", description: "Notre équipe est disponible pour répondre à vos questions et vous accompagner à chaque étape." },
    { id: "5", title: "Gratuit à 100%", description: "L'utilisation de la plateforme est entièrement gratuite pour les membres de la diaspora. Aucun frais caché." },
    { id: "6", title: "Impact mesurable", description: "Nous suivons et documentons l'impact réel de chaque contribution pour améliorer continuellement nos processus." }
  ],
  faq: [
    { id: "1", question: "Combien de temps prend le processus de candidature ?", answer: "Le formulaire de candidature prend environ 8 à 10 minutes à remplir. Après soumission, la mairie prend généralement 7 à 14 jours pour examiner votre profil et vous contacter si votre candidature est retenue." },
    { id: "2", question: "Puis-je candidater à plusieurs actions en même temps ?", answer: "Oui, absolument ! Vous pouvez candidater à autant d'actions que vous le souhaitez. Cependant, assurez-vous d'avoir la disponibilité nécessaire pour honorer vos engagements si plusieurs candidatures sont acceptées." },
    { id: "3", question: "Que se passe-t-il si la mairie ne répond pas ?", answer: "Si vous ne recevez pas de réponse sous 14 jours, notre système envoie automatiquement une relance à la mairie. Vous recevez également une notification pour vous tenir informé. Si aucune réponse n'est donnée après 30 jours, nous vous suggérons d'autres actions similaires." },
    { id: "4", question: "Est-ce que je peux annuler ma candidature ?", answer: "Oui, vous pouvez retirer votre candidature à tout moment avant que la mairie ne vous contacte. Une fois le contact établi, nous vous encourageons à communiquer directement avec la mairie pour discuter de tout changement." },
    { id: "5", question: "Puis-je contribuer si je ne peux pas me rendre au Cameroun ?", answer: "Oui ! De nombreuses contributions peuvent se faire à distance : financement, expertise technique, mentorat en ligne, mise en relation avec votre réseau, etc. Les actions indiquent clairement si une présence physique est requise ou non." },
    { id: "6", question: "Comment puis-je suivre l'évolution de ma candidature ?", answer: "Après soumission, vous recevez un email de confirmation avec un numéro de suivi. Vous êtes notifié par email à chaque étape importante : réception par la mairie, mise en examen, décision finale, et éventuelles demandes d'informations complémentaires." },
    { id: "7", question: "Y a-t-il des frais pour utiliser la plateforme ?", answer: "Non, l'utilisation de Jesuisaucameroun.com est entièrement gratuite pour les membres de la diaspora. Aucun frais d'inscription, de candidature ou de transaction. Nous sommes financés par nos partenaires institutionnels." },
    { id: "8", question: "Que faire si j'ai besoin d'aide pendant le processus ?", answer: "Notre équipe support est disponible par email (contact@jesuisaucameroun.com) ou téléphone (+237 XXX XX XX XX) du lundi au vendredi, de 8h à 17h. Nous répondons généralement sous 24 heures ouvrées." }
  ],
  cta: {
    title: "Prêt à faire la différence ?",
    subtitle: "Rejoignez les 1,800+ membres de la diaspora qui contribuent déjà au développement du Cameroun",
    smallText: "Aucune inscription requise pour explorer. Vous ne fournirez vos informations qu'au moment de candidater."
  }
};

export default function CommentCaMarcheManagement() {
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState(params.locale as string || 'fr');
  const [content, setContent] = useState<CommentContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ hero: true });

  const supabase = getSupabaseBrowserClient();

  useEffect(() => { fetchContent(); }, [currentLocale]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('static_contents').select('content').eq('key', 'comment-ca-marche').eq('lang', currentLocale).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.content) {
        setContent({ ...DEFAULT_CONTENT, ...data.content });
      } else {
        setContent(DEFAULT_CONTENT);
      }
    } catch (err) {
      console.error('Error fetching:', err);
      toast.error('Erreur lors du chargement');
    } finally { setLoading(false); }
  };

  const toggleSection = (section: string) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.from('static_contents').upsert({
        key: 'comment-ca-marche', 
        lang: currentLocale,
        title: `Comment ça marche (${currentLocale.toUpperCase()})`, 
        content: content, 
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      toast.success(`Contenu (${currentLocale.toUpperCase()}) mis à jour`);
    } catch (err: any) {
      console.error('Error saving:', err);
      toast.error(`Erreur: ${err.message || "Erreur d'enregistrement"}`);
    } finally { setSaving(false); }
  };

  const SectionHeader = ({ id, title, icon: Icon }: { id: string, title: string, icon: any }) => (
    <button onClick={() => toggleSection(id)} className="w-full px-6 py-4 bg-white border border-neutral-200 shadow-sm rounded-xl flex items-center justify-between hover:bg-neutral-50 transition-all mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${openSections[id] ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-500'}`}><Icon className="w-5 h-5" /></div>
        <h2 className={`font-bold ${openSections[id] ? 'text-primary' : 'text-neutral-900'}`}>{title}</h2>
      </div>
      {openSections[id] ? <ChevronUp className="text-neutral-400" /> : <ChevronDown className="text-neutral-400" />}
    </button>
  );

  if (loading) return <div className="min-h-screen bg-page-bg flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="comment-ca-marche" />
      <main className="flex-1 ml-[260px] pb-20">
        <HeaderSuperadmin pageTitle="Configuration Comment ça marche" />
        
        <div className="p-8 mt-16 lg:mt-[72px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-1 flex gap-1 shadow-sm">
                <button 
                  onClick={() => setCurrentLocale('fr')}
                  className={`px-6 py-2 rounded-lg text-lg transition-all ${currentLocale === 'fr' ? 'bg-primary shadow-md' : 'opacity-50 hover:bg-neutral-50 hover:opacity-100'}`}
                  title="Version Française"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-6 h-4 rounded-sm mx-auto"><rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ED2939"/></svg>
                </button>
                <button 
                  onClick={() => setCurrentLocale('en')}
                  className={`px-6 py-2 rounded-lg text-lg transition-all ${currentLocale === 'en' ? 'bg-primary shadow-md' : 'opacity-50 hover:bg-neutral-50 hover:opacity-100'}`}
                  title="English Version"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-6 h-4 rounded-sm mx-auto"><clipPath id="d1"><rect width="60" height="30"/></clipPath><g clipPath="url(#d1)"><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#d1)"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/></g></svg>
                </button>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 flex items-center gap-3 text-primary">
                <Languages className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  Edition : {currentLocale === 'fr' ? 'Français' : 'English'}
                </p>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-primary text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Enregistrer la version {currentLocale.toUpperCase()}
            </button>
          </div>

          <div className="space-y-4 max-w-5xl">
            {/* HERO */}
            <div>
              <SectionHeader id="hero" title="En-tête (Hero)" icon={Layout} />
              {openSections['hero'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
                  <div><label className="block text-sm font-bold mb-1">Titre</label><textarea value={content.hero.title} onChange={(e) => setContent({...content, hero: {...content.hero, title: e.target.value}})} className="w-full p-4 border border-neutral-200 rounded-xl" /></div>
                  <div><label className="block text-sm font-bold mb-1">Sous-titre</label><textarea value={content.hero.subtitle} onChange={(e) => setContent({...content, hero: {...content.hero, subtitle: e.target.value}})} className="w-full p-4 border border-neutral-200 rounded-xl" /></div>
                </div>
              )}
            </div>

            {/* STEPS */}
            <div>
              <SectionHeader id="steps" title="Les 4 Étapes" icon={List} />
              {openSections['steps'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-8">
                  {content.steps.map((step, idx) => (
                    <div key={step.id} className="p-6 border border-neutral-100 rounded-2xl bg-neutral-50/30 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">étape {step.number}</div>
                        <input type="text" value={step.title} onChange={(e) => {
                          const newSteps = [...content.steps]; newSteps[idx].title = e.target.value; setContent({...content, steps: newSteps});
                        }} className="flex-1 h-10 px-4 border border-neutral-200 rounded-lg font-bold" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Temps estimé</label>
                          <input type="text" value={step.time} onChange={(e) => {
                            const newSteps = [...content.steps]; newSteps[idx].time = e.target.value; setContent({...content, steps: newSteps});
                          }} className="w-full h-10 px-4 border border-neutral-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Image URL</label>
                          <input type="text" value={step.image} onChange={(e) => {
                            const newSteps = [...content.steps]; newSteps[idx].image = e.target.value; setContent({...content, steps: newSteps});
                          }} className="w-full h-10 px-4 border border-neutral-200 rounded-lg" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Description courte</label>
                        <textarea value={step.description} onChange={(e) => {
                          const newSteps = [...content.steps]; newSteps[idx].description = e.target.value; setContent({...content, steps: newSteps});
                        }} className="w-full p-3 border border-neutral-200 rounded-lg h-20" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Astuce (Bloc orange)</label>
                        <input type="text" value={step.tip} onChange={(e) => {
                          const newSteps = [...content.steps]; newSteps[idx].tip = e.target.value; setContent({...content, steps: newSteps});
                        }} className="w-full h-10 px-4 border border-neutral-200 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WAYS */}
            <div>
              <SectionHeader id="ways" title="Trois façons de contribuer" icon={Target} />
              {openSections['ways'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-primary">Option A</h3>
                      <input type="text" value={content.ways.existing.title} onChange={(e) => setContent({...content, ways: {...content.ways, existing: {...content.ways.existing, title: e.target.value}}})} className="w-full h-10 px-3 border border-neutral-200 rounded-lg font-semibold" />
                      <textarea value={content.ways.existing.description} onChange={(e) => setContent({...content, ways: {...content.ways, existing: {...content.ways.existing, description: e.target.value}}})} className="w-full p-3 border border-neutral-200 rounded-lg h-32 text-sm" />
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-neutral-500">Points clés (un par ligne)</label>
                        <textarea 
                          value={content.ways.existing.bullets.join('\n')} 
                          onChange={(e) => setContent({...content, ways: {...content.ways, existing: {...content.ways.existing, bullets: e.target.value.split('\n').filter(b => b.trim() !== '')}}})} 
                          className="w-full p-3 border border-neutral-200 rounded-lg h-24 text-sm" 
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold text-primary">Option B</h3>
                      <input type="text" value={content.ways.spontaneous.title} onChange={(e) => setContent({...content, ways: {...content.ways, spontaneous: {...content.ways.spontaneous, title: e.target.value}}})} className="w-full h-10 px-3 border border-neutral-200 rounded-lg font-semibold" />
                      <textarea value={content.ways.spontaneous.description} onChange={(e) => setContent({...content, ways: {...content.ways, spontaneous: {...content.ways.spontaneous, description: e.target.value}}})} className="w-full p-3 border border-neutral-200 rounded-lg h-32 text-sm" />
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-neutral-500">Points clés (un par ligne)</label>
                        <textarea 
                          value={content.ways.spontaneous.bullets.join('\n')} 
                          onChange={(e) => setContent({...content, ways: {...content.ways, spontaneous: {...content.ways.spontaneous, bullets: e.target.value.split('\n').filter(b => b.trim() !== '')}}})} 
                          className="w-full p-3 border border-neutral-200 rounded-lg h-24 text-sm" 
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold text-primary">Option C</h3>
                      <input type="text" value={content.ways.profile.title} onChange={(e) => setContent({...content, ways: {...content.ways, profile: {...content.ways.profile, title: e.target.value}}})} className="w-full h-10 px-3 border border-neutral-200 rounded-lg font-semibold" />
                      <textarea value={content.ways.profile.description} onChange={(e) => setContent({...content, ways: {...content.ways, profile: {...content.ways.profile, description: e.target.value}}})} className="w-full p-3 border border-neutral-200 rounded-lg h-32 text-sm" />
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-neutral-500">Points clés (un par ligne)</label>
                        <textarea 
                          value={content.ways.profile.bullets.join('\n')} 
                          onChange={(e) => setContent({...content, ways: {...content.ways, profile: {...content.ways.profile, bullets: e.target.value.split('\n').filter(b => b.trim() !== '')}}})} 
                          className="w-full p-3 border border-neutral-200 rounded-lg h-24 text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TYPES */}
            <div>
              <SectionHeader id="types" title="Types de contributions" icon={Type} />
              {openSections['types'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
                  {content.contributionTypes.map((type, idx) => (
                    <div key={type.id} className="p-6 border border-neutral-100 rounded-2xl bg-neutral-50/30 space-y-4">
                      <input type="text" value={type.title} onChange={(e) => {
                        const newT = [...content.contributionTypes]; newT[idx].title = e.target.value; setContent({...content, contributionTypes: newT});
                      }} className="w-full h-10 px-4 border border-neutral-200 rounded-lg font-bold" />
                      <textarea value={type.description} onChange={(e) => {
                        const newT = [...content.contributionTypes]; newT[idx].description = e.target.value; setContent({...content, contributionTypes: newT});
                      }} className="w-full p-3 border border-neutral-200 rounded-lg h-20 text-sm" />
                      
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-neutral-500">Exemples (un par ligne)</label>
                        <textarea 
                          value={type.examples.join('\n')} 
                          onChange={(e) => {
                            const newT = [...content.contributionTypes]; 
                            newT[idx].examples = e.target.value.split('\n').filter(ex => ex.trim() !== ''); 
                            setContent({...content, contributionTypes: newT});
                          }} 
                          className="w-full p-3 border border-neutral-200 rounded-lg h-24 text-sm" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GUARANTEES */}
            <div>
              <SectionHeader id="guarantees" title="Garanties et Engagement" icon={ShieldCheck} />
              {openSections['guarantees'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {content.guarantees.map((g, idx) => (
                      <div key={g.id} className="p-4 border border-neutral-100 rounded-xl bg-neutral-50/30">
                        <input type="text" value={g.title} onChange={(e) => {
                          const newG = [...content.guarantees]; newG[idx].title = e.target.value; setContent({...content, guarantees: newG});
                        }} className="w-full h-9 px-3 mb-2 border border-neutral-200 rounded-lg text-sm font-bold" />
                        <textarea value={g.description} onChange={(e) => {
                          const newG = [...content.guarantees]; newG[idx].description = e.target.value; setContent({...content, guarantees: newG});
                        }} className="w-full p-2 border border-neutral-200 rounded-lg h-16 text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FAQ */}
            <div>
              <SectionHeader id="faq" title="Questions sur le processus (FAQ)" icon={HelpCircle} />
              {openSections['faq'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
                  <div className="flex justify-end"><button onClick={() => setContent({...content, faq: [...content.faq, {id: Date.now().toString(), question: '', answer: ''}]})} className="text-primary font-bold text-sm flex items-center gap-1"><Plus size={16} /> Ajouter</button></div>
                  {content.faq.map((item, idx) => (
                    <div key={item.id} className="p-4 border border-neutral-100 rounded-xl bg-neutral-50/30 space-y-2 relative group">
                      <button onClick={() => setContent({...content, faq: content.faq.filter(f => f.id !== item.id)})} className="absolute top-2 right-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      <input type="text" value={item.question} onChange={(e) => {
                        const newF = [...content.faq]; newF[idx].question = e.target.value; setContent({...content, faq: newF});
                      }} className="w-full h-10 px-3 border border-neutral-200 rounded-lg text-sm font-bold" placeholder="Question" />
                      <textarea value={item.answer} onChange={(e) => {
                        const newF = [...content.faq]; newF[idx].answer = e.target.value; setContent({...content, faq: newF});
                      }} className="w-full p-3 border border-neutral-200 rounded-lg h-20 text-sm" placeholder="Réponse" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div>
              <SectionHeader id="cta" title="Appel à l'action final" icon={ImageIcon} />
              {openSections['cta'] && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
                  <div><label className="block text-sm font-bold mb-1">Titre</label><input type="text" value={content.cta.title} onChange={(e) => setContent({...content, cta: {...content.cta, title: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" /></div>
                  <div><label className="block text-sm font-bold mb-1">Sous-titre</label><textarea value={content.cta.subtitle} onChange={(e) => setContent({...content, cta: {...content.cta, subtitle: e.target.value}})} className="w-full p-4 border border-neutral-200 rounded-xl h-24" /></div>
                  <div><label className="block text-sm font-bold mb-1">Petit texte (bas)</label><input type="text" value={content.cta.smallText} onChange={(e) => setContent({...content, cta: {...content.cta, smallText: e.target.value}})} className="w-full h-11 px-4 border border-neutral-200 rounded-xl" /></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
