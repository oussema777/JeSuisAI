'use client';

import { EnTete } from '@/app/components/ds/EnTete';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Facebook, Instagram, Linkedin, Globe, Mail, Phone, MessageCircle } from 'lucide-react';

// ─── Types (mirror admin page) ──────────────────────────────────
interface NavLink { label: string; href: string }
interface HeaderContent { logo_url: string; nav_links: NavLink[] }
interface FooterColumn { title: string; links: NavLink[] }
interface CityItem { name: string; href: string }
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

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Navigation');
  const tFooter = useTranslations('Footer');
  const params = useParams();
  const currentLocale = (params.locale as string) || 'fr';

  const [headerContent, setHeaderContent] = useState<HeaderContent | null>(null);
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase
      .from('static_contents')
      .select('key, content')
      .in('key', ['header', 'footer'])
      .eq('lang', currentLocale)
      .then(({ data }) => {
        if (data) {
          const h = data.find(d => d.key === 'header');
          const f = data.find(d => d.key === 'footer');
          if (h?.content) setHeaderContent(h.content as unknown as HeaderContent);
          if (f?.content) setFooterContent(f.content as unknown as FooterContent);
        }
      });
  }, [currentLocale]);

  // ─── Header: fallback to hardcoded i18n links ────────────────
  const headerLinks = headerContent?.nav_links?.length
    ? headerContent.nav_links.map(l => ({ label: l.label, href: l.href }))
    : [
        { label: t('first_visit'), href: '/premiere-visite' },
        { label: t('members'), href: '/a-propos' },
        { label: t('find_mission'), href: '/missions' },
        { label: t('submit_project'), href: '/soumettre-projet' },
        { label: t('submit_profile'), href: '/soumettre-profil' },
      ];

  // ─── Footer helpers ──────────────────────────────────────────
  const fc = footerContent;
  const footerLogoUrl = fc?.logo_url || 'https://ilab.tn/wp-content/uploads/2026/02/jesuisaucameroun-logo-b.png';
  const footerDescription = fc?.description || tFooter('description');

  const platLinks = fc?.columns?.plateforme?.links;
  const missLinks = fc?.columns?.missions?.links;
  const cities = fc?.columns?.villes?.cities;
  const infoLinks = fc?.columns?.infos?.links;

  const hasSocial = fc?.social_links && Object.values(fc.social_links).some(v => v);
  const hasContact = fc?.contact && (fc.contact.email || fc.contact.phone || fc.contact.whatsapp);

  return (
    <>
      <EnTete liens={headerLinks} />
      {children}

      {/* Footer */}
      <footer className="w-full text-white" style={{ backgroundColor: '#2e7d5f' }}>
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-12">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

            {/* Column 1: Branding */}
            <div className="flex flex-col gap-4 lg:col-span-1">
              <div>
                <div className="mb-4">
                  <Image
                    src={footerLogoUrl}
                    alt="Je suis au Cameroun"
                    width={160}
                    height={40}
                    className="w-[160px] h-auto"
                    unoptimized
                  />
                </div>
                <p className="text-white/80" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>
                  {footerDescription}
                </p>
              </div>

              {/* Contact info below description */}
              {hasContact && (
                <div className="flex flex-col gap-2 mt-2">
                  {fc!.contact.email && (
                    <a href={`mailto:${fc!.contact.email}`} className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontSize: '13px' }}>
                      <Mail className="w-4 h-4" /> {fc!.contact.email}
                    </a>
                  )}
                  {fc!.contact.phone && (
                    <a href={`tel:${fc!.contact.phone}`} className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontSize: '13px' }}>
                      <Phone className="w-4 h-4" /> {fc!.contact.phone}
                    </a>
                  )}
                  {fc!.contact.whatsapp && (
                    <a href={`https://wa.me/${fc!.contact.whatsapp.replace(/[^0-9+]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontSize: '13px' }}>
                      <MessageCircle className="w-4 h-4" /> {fc!.contact.whatsapp}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Column 2: Plateforme */}
            <div className="flex flex-col gap-4">
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f8e007' }}>
                {fc?.columns?.plateforme?.title || tFooter('col_platform')}
              </h4>
              <nav className="flex flex-col gap-2">
                {platLinks && platLinks.length > 0 ? (
                  platLinks.map((l, i) => (
                    <Link key={i} href={l.href} className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>
                      {l.label}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="/a-propos" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('about')}</Link>
                    <Link href="/comment-ca-marche" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('how_it_works')}</Link>
                    <Link href="/a-propos" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('partners')}</Link>
                  </>
                )}
              </nav>
            </div>

            {/* Column 3: Missions */}
            <div className="flex flex-col gap-4">
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f8e007' }}>
                {fc?.columns?.missions?.title || tFooter('col_missions')}
              </h4>
              <nav className="flex flex-col gap-2">
                {missLinks && missLinks.length > 0 ? (
                  missLinks.map((l, i) => (
                    <Link key={i} href={l.href} className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>
                      {l.label}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="/missions" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('find_mission')}</Link>
                    <Link href="/soumettre-projet" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('submit_project')}</Link>
                    <Link href="/soumettre-profil" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('submit_profile')}</Link>
                    <Link href="/missions" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('domains')}</Link>
                  </>
                )}
              </nav>
            </div>

            {/* Column 4: Nos Villes */}
            <div className="flex flex-col gap-4">
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f8e007' }}>
                {fc?.columns?.villes?.title || tFooter('col_cities')}
              </h4>
              <nav className="flex flex-col gap-1.5">
                {cities && cities.length > 0 ? (
                  cities.map((c, i) => (
                    <Link key={i} href={c.href} className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.5' }}>
                      {c.name}
                    </Link>
                  ))
                ) : (
                  ['AMVC', 'Bafoussam', 'Bamenda', 'Bertoua', 'Douala', 'Ebolowa', 'Edéa', 'Garoua', 'Kribi', 'Kumba', 'Limbe', 'Maroua', 'Ngaoundéré', 'Nkongsamba', 'Yaoundé'].map(v => (
                    <Link key={v} href="/missions" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.5' }}>
                      {v}
                    </Link>
                  ))
                )}
              </nav>
            </div>

            {/* Column 5: Infos utiles */}
            <div className="flex flex-col gap-4">
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f8e007' }}>
                {fc?.columns?.infos?.title || tFooter('col_info')}
              </h4>
              <nav className="flex flex-col gap-2">
                {infoLinks && infoLinks.length > 0 ? (
                  infoLinks.map((l, i) => (
                    <Link key={i} href={l.href} className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>
                      {l.label}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="/contact" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('help_center')}</Link>
                    <Link href="/contact" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('contact')}</Link>
                    <Link href="/mentions-legales" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('legal')}</Link>
                    <Link href="/protection-donnees" className="text-white/90 hover:text-white transition-colors" style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}>{tFooter('privacy')}</Link>
                  </>
                )}
              </nav>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8 mt-8 border-t border-white/20">
            <p className="text-white/80" style={{ fontSize: '13px', fontWeight: 400 }}>
              {fc?.copyright || tFooter('rights')}
            </p>

            {/* Social links */}
            {hasSocial && (
              <div className="flex items-center gap-3">
                {fc!.social_links.facebook && (
                  <a href={fc!.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {fc!.social_links.instagram && (
                  <a href={fc!.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {fc!.social_links.linkedin && (
                  <a href={fc!.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {fc!.social_links.tiktok && (
                  <a href={fc!.social_links.tiktok} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}

            <p className="text-white/80 flex items-center gap-1.5" style={{ fontSize: '13px', fontWeight: 400 }}>
              {fc?.made_with || tFooter('made_with')}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
