'use client';

import React, { useState, useEffect } from 'react';
import { SidebarSuperadmin } from '@/app/components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '@/app/components/superadmin/HeaderSuperadmin';
import {
  Plus,
  Trash2,
  Save,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  Languages,
  Layout,
  PanelBottom,
  Link as LinkIcon,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  ChevronRight,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────
interface NavLink {
  label: string;
  href: string;
}

interface HeaderContent {
  logo_url: string;
  nav_links: NavLink[];
}

interface FooterColumn {
  title: string;
  links: NavLink[];
}

interface CityItem {
  name: string;
  href: string;
}

interface FooterContent {
  logo_url: string;
  description: string;
  columns: {
    plateforme: FooterColumn;
    missions: FooterColumn;
    villes: { title: string; cities: CityItem[] };
    infos: FooterColumn;
  };
  contact: { email: string; phone: string; whatsapp: string };
  social_links: { facebook: string; instagram: string; linkedin: string; tiktok: string };
  copyright: string;
  made_with: string;
}

// ─── Defaults ────────────────────────────────────────────────────
const DEFAULT_HEADER: HeaderContent = {
  logo_url: '/logo_jesuis.png',
  nav_links: [
    { label: 'Première visite', href: '/premiere-visite' },
    { label: 'Organisations membres', href: '/a-propos' },
    { label: 'Trouver une mission', href: '/missions' },
    { label: 'Proposer un projet', href: '/soumettre-projet' },
    { label: 'Soumettre votre profil', href: '/soumettre-profil' },
  ],
};

const DEFAULT_FOOTER: FooterContent = {
  logo_url: 'https://ilab.tn/wp-content/uploads/2026/02/jesuisaucameroun-logo-b.png',
  description: 'La plateforme de mobilisation de la diaspora camerounaise pour le développement local.',
  columns: {
    plateforme: {
      title: 'Plateforme',
      links: [
        { label: 'À propos', href: '/a-propos' },
        { label: 'Comment ça marche', href: '/comment-ca-marche' },
        { label: 'Nos partenaires', href: '/a-propos' },
      ],
    },
    missions: {
      title: 'Missions',
      links: [
        { label: 'Trouver une mission', href: '/missions' },
        { label: 'Proposer un projet', href: '/soumettre-projet' },
        { label: 'Soumettre votre profil', href: '/soumettre-profil' },
        { label: 'Domaines d\'intervention', href: '/missions' },
      ],
    },
    villes: {
      title: 'Nos Villes',
      cities: [
        'AMVC', 'Bafoussam', 'Bamenda', 'Bertoua', 'Douala', 'Ebolowa', 'Edéa',
        'Garoua', 'Kribi', 'Kumba', 'Limbe', 'Maroua', 'Ngaoundéré', 'Nkongsamba', 'Yaoundé',
      ].map(c => ({ name: c, href: '/missions' })),
    },
    infos: {
      title: 'Infos utiles',
      links: [
        { label: 'Centre d\'aide', href: '/contact' },
        { label: 'Contact', href: '/contact' },
        { label: 'Mentions légales', href: '/mentions-legales' },
        { label: 'Protection des données', href: '/protection-donnees' },
      ],
    },
  },
  contact: { email: '', phone: '', whatsapp: '' },
  social_links: { facebook: '', instagram: '', linkedin: '', tiktok: '' },
  copyright: '© 2025 Jesuisaucameroun.com. Tous droits réservés.',
  made_with: 'Fait avec ❤️ pour connecter la diaspora camerounaise',
};

// ─── Component ───────────────────────────────────────────────────
export default function HeaderFooterManagement() {
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState(params.locale as string || 'fr');
  const [header, setHeader] = useState<HeaderContent>(structuredClone(DEFAULT_HEADER));
  const [footer, setFooter] = useState<FooterContent>(structuredClone(DEFAULT_FOOTER));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [footerExpanded, setFooterExpanded] = useState(true);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    fetchContent();
  }, [currentLocale]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('static_contents')
        .select('key, content')
        .in('key', ['header', 'footer'])
        .eq('lang', currentLocale);

      if (error) throw error;

      if (data) {
        const headerRow = data.find(d => d.key === 'header');
        const footerRow = data.find(d => d.key === 'footer');
        if (headerRow?.content) setHeader(headerRow.content as unknown as HeaderContent);
        else setHeader(structuredClone(DEFAULT_HEADER));
        if (footerRow?.content) setFooter(footerRow.content as unknown as FooterContent);
        else setFooter(structuredClone(DEFAULT_FOOTER));
      }
    } catch (err) {
      console.error('Error fetching header/footer:', err);
      toast.error('Erreur lors du chargement du contenu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const now = new Date().toISOString();

      const { error: e1 } = await supabase.from('static_contents').upsert({
        key: 'header',
        lang: currentLocale,
        title: `Header (${currentLocale.toUpperCase()})`,
        content: header as unknown as Record<string, unknown>,
        updated_at: now,
      });
      if (e1) throw e1;

      const { error: e2 } = await supabase.from('static_contents').upsert({
        key: 'footer',
        lang: currentLocale,
        title: `Footer (${currentLocale.toUpperCase()})`,
        content: footer as unknown as Record<string, unknown>,
        updated_at: now,
      });
      if (e2) throw e2;

      toast.success(`Contenu (${currentLocale.toUpperCase()}) enregistré avec succès`);
    } catch (err: any) {
      console.error('Error saving:', err);
      toast.error(`Erreur: ${err.message || "Erreur d'enregistrement"}`);
    } finally {
      setSaving(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────
  const moveInArray = <T,>(arr: T[], index: number, dir: 'up' | 'down'): T[] => {
    const copy = [...arr];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= copy.length) return copy;
    [copy[index], copy[target]] = [copy[target], copy[index]];
    return copy;
  };

  // ─── Sub-components ──────────────────────────────────────────
  const LinkListEditor = ({
    links,
    onChange,
    addLabel = 'Ajouter un lien',
  }: {
    links: NavLink[];
    onChange: (links: NavLink[]) => void;
    addLabel?: string;
  }) => (
    <div className="space-y-2">
      {links.map((link, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <div className="flex flex-col gap-0.5">
            <button onClick={() => onChange(moveInArray(links, i, 'up'))} disabled={i === 0} className="p-0.5 text-neutral-400 hover:text-primary disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
            <button onClick={() => onChange(moveInArray(links, i, 'down'))} disabled={i === links.length - 1} className="p-0.5 text-neutral-400 hover:text-primary disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
          </div>
          <input
            type="text"
            value={link.label}
            onChange={e => { const c = [...links]; c[i] = { ...c[i], label: e.target.value }; onChange(c); }}
            placeholder="Label"
            className="flex-1 h-10 px-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
          />
          <input
            type="text"
            value={link.href}
            onChange={e => { const c = [...links]; c[i] = { ...c[i], href: e.target.value }; onChange(c); }}
            placeholder="/chemin"
            className="flex-1 h-10 px-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm font-mono"
          />
          <button onClick={() => onChange(links.filter((_, j) => j !== i))} className="p-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button
        onClick={() => onChange([...links, { label: '', href: '' }])}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium mt-1"
      >
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );

  const CityListEditor = ({
    cities,
    onChange,
  }: {
    cities: CityItem[];
    onChange: (cities: CityItem[]) => void;
  }) => (
    <div className="space-y-2">
      {cities.map((city, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <div className="flex flex-col gap-0.5">
            <button onClick={() => onChange(moveInArray(cities, i, 'up'))} disabled={i === 0} className="p-0.5 text-neutral-400 hover:text-primary disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
            <button onClick={() => onChange(moveInArray(cities, i, 'down'))} disabled={i === cities.length - 1} className="p-0.5 text-neutral-400 hover:text-primary disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
          </div>
          <input
            type="text"
            value={city.name}
            onChange={e => { const c = [...cities]; c[i] = { ...c[i], name: e.target.value }; onChange(c); }}
            placeholder="Nom de la ville"
            className="flex-1 h-10 px-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
          />
          <input
            type="text"
            value={city.href}
            onChange={e => { const c = [...cities]; c[i] = { ...c[i], href: e.target.value }; onChange(c); }}
            placeholder="/chemin"
            className="w-48 h-10 px-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm font-mono"
          />
          <button onClick={() => onChange(cities.filter((_, j) => j !== i))} className="p-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button
        onClick={() => onChange([...cities, { name: '', href: '/missions' }])}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium mt-1"
      >
        <Plus className="w-4 h-4" /> Ajouter une ville
      </button>
    </div>
  );

  const SectionHeader = ({
    icon: Icon,
    title,
    expanded,
    onToggle,
  }: {
    icon: React.ElementType;
    title: string;
    expanded: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-all"
    >
      <Icon className="w-5 h-5 text-primary" />
      <span className="flex-1 text-left font-bold text-neutral-900">{title}</span>
      <ChevronRight className={`w-5 h-5 text-neutral-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
    </button>
  );

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-neutral-700 mb-2 text-sm font-semibold">{children}</label>
  );

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-page-bg flex">
      <SidebarSuperadmin activePage="contenus-statiques" activeSubPage="header-footer" />

      <main className="flex-1 ml-[260px] p-8 mt-16 lg:mt-0">
        <HeaderSuperadmin pageTitle="En-tête & Pied de page" />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 mt-8 lg:mt-[72px]">
          <div className="flex items-center gap-4">
            {/* Language toggle */}
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-6 h-4 rounded-sm mx-auto"><clipPath id="hf1"><rect width="60" height="30"/></clipPath><g clipPath="url(#hf1)"><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#hf1)"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/></g></svg>
              </button>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 flex items-center gap-3 text-primary">
              <Languages className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Edition : {currentLocale === 'fr' ? 'Français' : 'English'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Enregistrer la version {currentLocale.toUpperCase()}
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-neutral-500">Chargement du contenu...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ═══════ HEADER SECTION ═══════ */}
            <SectionHeader icon={Layout} title="En-tête (Header)" expanded={headerExpanded} onToggle={() => setHeaderExpanded(!headerExpanded)} />
            {headerExpanded && (
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-6">
                <div>
                  <FieldLabel>URL du logo</FieldLabel>
                  <input
                    type="text"
                    value={header.logo_url}
                    onChange={e => setHeader({ ...header, logo_url: e.target.value })}
                    placeholder="/logo_jesuis.png"
                    className="w-full h-11 px-4 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 font-mono text-sm"
                  />
                </div>
                <div>
                  <FieldLabel>Liens de navigation</FieldLabel>
                  <LinkListEditor
                    links={header.nav_links}
                    onChange={nav_links => setHeader({ ...header, nav_links })}
                    addLabel="Ajouter un lien de navigation"
                  />
                </div>
              </div>
            )}

            {/* ═══════ FOOTER SECTION ═══════ */}
            <SectionHeader icon={PanelBottom} title="Pied de page (Footer)" expanded={footerExpanded} onToggle={() => setFooterExpanded(!footerExpanded)} />
            {footerExpanded && (
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-8">
                {/* Logo & Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel>URL du logo footer</FieldLabel>
                    <input
                      type="text"
                      value={footer.logo_url}
                      onChange={e => setFooter({ ...footer, logo_url: e.target.value })}
                      className="w-full h-11 px-4 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      value={footer.description}
                      onChange={e => setFooter({ ...footer, description: e.target.value })}
                      rows={3}
                      className="w-full p-4 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 resize-none text-sm"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-neutral-100" />

                {/* Column: Plateforme */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-primary" />
                    <FieldLabel>Colonne « {footer.columns.plateforme.title || 'Plateforme'} »</FieldLabel>
                  </div>
                  <input
                    type="text"
                    value={footer.columns.plateforme.title}
                    onChange={e => setFooter({ ...footer, columns: { ...footer.columns, plateforme: { ...footer.columns.plateforme, title: e.target.value } } })}
                    placeholder="Titre de la colonne"
                    className="w-64 h-10 px-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm mb-3"
                  />
                  <LinkListEditor
                    links={footer.columns.plateforme.links}
                    onChange={links => setFooter({ ...footer, columns: { ...footer.columns, plateforme: { ...footer.columns.plateforme, links } } })}
                  />
                </div>

                <div className="h-px bg-neutral-100" />

                {/* Column: Missions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <LinkIcon className="w-4 h-4 text-primary" />
                    <FieldLabel>Colonne « {footer.columns.missions.title || 'Missions'} »</FieldLabel>
                  </div>
                  <input
                    type="text"
                    value={footer.columns.missions.title}
                    onChange={e => setFooter({ ...footer, columns: { ...footer.columns, missions: { ...footer.columns.missions, title: e.target.value } } })}
                    placeholder="Titre de la colonne"
                    className="w-64 h-10 px-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm mb-3"
                  />
                  <LinkListEditor
                    links={footer.columns.missions.links}
                    onChange={links => setFooter({ ...footer, columns: { ...footer.columns, missions: { ...footer.columns.missions, links } } })}
                  />
                </div>

                <div className="h-px bg-neutral-100" />

                {/* Column: Villes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-primary" />
                    <FieldLabel>Colonne « {footer.columns.villes.title || 'Nos Villes'} »</FieldLabel>
                  </div>
                  <input
                    type="text"
                    value={footer.columns.villes.title}
                    onChange={e => setFooter({ ...footer, columns: { ...footer.columns, villes: { ...footer.columns.villes, title: e.target.value } } })}
                    placeholder="Titre de la colonne"
                    className="w-64 h-10 px-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm mb-3"
                  />
                  <CityListEditor
                    cities={footer.columns.villes.cities}
                    onChange={cities => setFooter({ ...footer, columns: { ...footer.columns, villes: { ...footer.columns.villes, cities } } })}
                  />
                </div>

                <div className="h-px bg-neutral-100" />

                {/* Column: Infos utiles */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <FieldLabel>Colonne « {footer.columns.infos.title || 'Infos utiles'} »</FieldLabel>
                  </div>
                  <input
                    type="text"
                    value={footer.columns.infos.title}
                    onChange={e => setFooter({ ...footer, columns: { ...footer.columns, infos: { ...footer.columns.infos, title: e.target.value } } })}
                    placeholder="Titre de la colonne"
                    className="w-64 h-10 px-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm mb-3"
                  />
                  <LinkListEditor
                    links={footer.columns.infos.links}
                    onChange={links => setFooter({ ...footer, columns: { ...footer.columns, infos: { ...footer.columns.infos, links } } })}
                  />
                </div>

                <div className="h-px bg-neutral-100" />

                {/* Contact */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <FieldLabel>Informations de contact</FieldLabel>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-neutral-500 text-xs mb-1 font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          value={footer.contact.email}
                          onChange={e => setFooter({ ...footer, contact: { ...footer.contact, email: e.target.value } })}
                          placeholder="contact@example.com"
                          className="w-full h-10 pl-10 pr-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-500 text-xs mb-1 font-medium">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="tel"
                          value={footer.contact.phone}
                          onChange={e => setFooter({ ...footer, contact: { ...footer.contact, phone: e.target.value } })}
                          placeholder="+237 XXX XXX XXX"
                          className="w-full h-10 pl-10 pr-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-500 text-xs mb-1 font-medium">WhatsApp</label>
                      <div className="relative">
                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="tel"
                          value={footer.contact.whatsapp}
                          onChange={e => setFooter({ ...footer, contact: { ...footer.contact, whatsapp: e.target.value } })}
                          placeholder="+237 XXX XXX XXX"
                          className="w-full h-10 pl-10 pr-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-neutral-100" />

                {/* Social Links */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-primary" />
                    <FieldLabel>Réseaux sociaux</FieldLabel>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neutral-500 text-xs mb-1 font-medium">Facebook</label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="url"
                          value={footer.social_links.facebook}
                          onChange={e => setFooter({ ...footer, social_links: { ...footer.social_links, facebook: e.target.value } })}
                          placeholder="https://facebook.com/..."
                          className="w-full h-10 pl-10 pr-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-500 text-xs mb-1 font-medium">Instagram</label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="url"
                          value={footer.social_links.instagram}
                          onChange={e => setFooter({ ...footer, social_links: { ...footer.social_links, instagram: e.target.value } })}
                          placeholder="https://instagram.com/..."
                          className="w-full h-10 pl-10 pr-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-500 text-xs mb-1 font-medium">LinkedIn</label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="url"
                          value={footer.social_links.linkedin}
                          onChange={e => setFooter({ ...footer, social_links: { ...footer.social_links, linkedin: e.target.value } })}
                          placeholder="https://linkedin.com/..."
                          className="w-full h-10 pl-10 pr-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-500 text-xs mb-1 font-medium">TikTok</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="url"
                          value={footer.social_links.tiktok}
                          onChange={e => setFooter({ ...footer, social_links: { ...footer.social_links, tiktok: e.target.value } })}
                          placeholder="https://tiktok.com/..."
                          className="w-full h-10 pl-10 pr-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-neutral-100" />

                {/* Copyright & Made with */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel>Texte de copyright</FieldLabel>
                    <input
                      type="text"
                      value={footer.copyright}
                      onChange={e => setFooter({ ...footer, copyright: e.target.value })}
                      className="w-full h-11 px-4 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
                    />
                  </div>
                  <div>
                    <FieldLabel>Texte « Fait avec ... »</FieldLabel>
                    <input
                      type="text"
                      value={footer.made_with}
                      onChange={e => setFooter({ ...footer, made_with: e.target.value })}
                      className="w-full h-11 px-4 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-neutral-50/50 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Note */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-blue-800 text-sm">
            <strong>Note importante :</strong> Les modifications seront visibles sur le site public dès que vous cliquerez sur &laquo; Enregistrer &raquo;. Le header et le footer sont partagés sur toutes les pages du site.
          </p>
        </div>
      </main>
    </div>
  );
}
