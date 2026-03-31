'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import {
  MapPin, Globe, Download, CheckCircle2,
  TrendingUp, Facebook, Linkedin, Instagram, Video as TiktokIcon,
  Shield
} from 'lucide-react';

// UI Components
import { Bouton } from '../components/ds/Bouton';
import { FilDAriane } from '../components/listing/FilDAriane';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface FicheVilleProps {
  profile: any;
  opportunities: any[];
}

export default function FicheVille({ profile, opportunities }: FicheVilleProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('toutes');

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: 'Accueil', onClick: () => router.push('/') },
              { label: 'Villes Partenaires', onClick: () => router.push('/') },
              { label: profile.nom },
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full relative overflow-hidden" style={{ height: '500px' }}>
        <div className="absolute inset-0">
          <ImageWithFallback
            src={profile.photo_presentation_url || "https://images.unsplash.com/photo-1675140267995-8096bdf130d5"}
            alt={profile.nom}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#004D40]" style={{ opacity: 0.45 }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 lg:px-20 h-full flex items-center">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              <div className="rounded-xl overflow-hidden shadow-2xl bg-white p-4 relative" style={{ width: '220px', height: '220px' }}>
                <ImageWithFallback
                  src={profile.logo_url || "/placeholder-logo.png"}
                  alt={`Logo ${profile.nom}`}
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>

            <div className="flex-1 pt-2">
              <h1 className="text-white mb-3" style={{ fontSize: '56px', lineHeight: '1.1', fontWeight: 600 }}>{profile.nom}</h1>
              <h3 className="text-white mb-8" style={{ fontSize: '28px', lineHeight: '1.2', fontWeight: 400 }}>{profile.ville}, {profile.pays}</h3>
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-6 h-6" />
                <span style={{ fontSize: '18px' }}>Annonces actives: <strong>{opportunities.length}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8 space-y-12">
            {/* Section Mot du Représentant légal */}
            <section>
              <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="rounded-xl overflow-hidden flex-shrink-0 shadow-lg relative" style={{ width: '220px', height: '280px' }}>
                    <ImageWithFallback
                      src={profile.photo_dirigeant_url || "/placeholder-mayor.jpg"}
                      alt={profile.nom_dirigeant}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-700 italic mb-6 text-lg">"{profile.mot_dirigeant}"</p>
                    <h4 className="text-neutral-900 font-bold">{profile.nom_dirigeant}</h4>
                    <p className="text-neutral-600">{profile.poste_dirigeant}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Présentation */}
         <section className="overflow-hidden">
  <h3 className="text-2xl font-bold mb-6">Présentation</h3>
  <p className="text-neutral-700 whitespace-pre-line leading-relaxed break-words">
    {profile.presentation}
  </p>
              <div className="mt-8 bg-white rounded-xl border border-neutral-200 p-6">
                <h4 className="font-bold mb-4">Domaines d'action visés avec la diaspora
</h4><ul className="flex flex-col gap-4">
      {profile.domaines_action?.map((atout: string, i: number) => (
        <li key={i} className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <span className="text-neutral-700 text-sm md:text-base">{atout}</span>
        </li>
      ))}
    </ul>
              </div>
            </section>

            {/* Facilités */}
<section>
  <h3 className="text-2xl font-bold mb-6">Facilités offertes à la diaspora</h3>
  <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6 space-y-4">
    {profile.facilites_offertes && profile.facilites_offertes.length > 0 ? (
      profile.facilites_offertes.map((facilite: string, idx: number) => {
        const isAutres = facilite === 'Autres (précisez)';
        const displayValue = isAutres && profile.facilites_autres ? profile.facilites_autres : facilite;
        
        if (facilite === 'Aucun' && profile.facilites_offertes.length > 1) return null;

        return (
          <div key={idx} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-1 shrink-0" />
            <div>
              <p className="font-bold text-neutral-900">{displayValue}</p>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-neutral-500 italic">Aucune facilité renseignée.</p>
    )}
  </div>
</section>
          </div>

          {/* Sidebar */}
<div className="lg:col-span-4 space-y-6">
  <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
    <h4 className="font-bold mb-6 text-lg">Contact Mairie</h4>
    <div className="space-y-6">

      {/* Statut */}
      {profile.statut && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-neutral-500 font-medium">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Statut</span>
          </div>
          <p className="text-sm text-neutral-900 font-semibold pl-7">
            {profile.statut}
          </p>
        </div>
      )}

      {/* Adresse */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-neutral-500 font-medium">
          <MapPin className="w-5 h-5" />
          <span className="text-sm">Adresse</span>
        </div>
        <p className="text-sm text-neutral-900 font-semibold pl-7">
          {profile.adresse}
        </p>
      </div>

      {/* Site Web */}
      {profile.site_web && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-neutral-500 font-medium">
            <Globe className="w-5 h-5" />
            <span className="text-sm">Site web</span>
          </div>
          <div className="pl-7">
            <a
              href={profile.site_web.startsWith('http') ? profile.site_web : `https://${profile.site_web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 text-sm font-semibold hover:underline break-all"
            >
              {profile.site_web} <span className="sr-only">(nouvelle fenêtre)</span>
            </a>
          </div>
        </div>
      )}

      {/* Social Media */}
      {(profile.facebook || profile.linkedin || profile.tiktok || profile.instagram) && (
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Suivez-nous</p>
          <div className="flex items-center gap-3">
            {profile.facebook && (
              <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-all shadow-sm">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-all shadow-sm">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {profile.tiktok && (
              <a href={profile.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-all shadow-sm">
                <TiktokIcon className="w-5 h-5" />
              </a>
            )}
            {profile.instagram && (
              <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-all shadow-sm">
                <Instagram className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Contributions Recherchées */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-neutral-500 font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20" height="20"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className="lucide lucide-search"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <span className="text-sm">Contributions recherchées chez la diaspora</span>
        </div>

        <div className="pl-7 text-sm text-neutral-900 font-semibold">
          {profile.contributions_recherchees && profile.contributions_recherchees.length > 0 ? (
            profile.contributions_recherchees.join(', ')
          ) : (
            <span className="text-neutral-400 italic font-normal">Non spécifié</span>
          )}
        </div>
      </div>

    </div>
  </div>

  {/* Interlocuteurs */}
  <div className="bg-[#004D40] rounded-xl p-6 shadow-lg text-white">
    <h4 className="mb-5 font-semibold">Vos interlocuteurs diaspora</h4>
    <div className="space-y-4 mb-6">
      {profile.points_focaux_diaspora?.map((pocal: any, idx: number) => (
        <div key={idx} className="flex items-center gap-4">
          <div className="rounded-full bg-white/20 w-12 h-12 flex items-center justify-center font-bold">
            {pocal.nom?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm">{pocal.prenom} {pocal.nom}</p>
            <p className="text-white/70 text-xs">{pocal.fonction}</p>
          </div>
        </div>
      ))}
    </div>
    <Bouton 
      variant="primaire" 
      fullWidth
      onClick={() => {
        const emails = profile.points_focaux_diaspora?.map((p: any) => p.email).filter(Boolean).join(',');
        if (emails) {
          window.location.href = `mailto:${emails}?subject=Contact via Je suis au Cameroun - ${profile.nom}`;
        }
      }}
    >
      Contacter directement
    </Bouton>
  </div>

  {/* Bloc Documents à télécharger */}
  <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm mt-6">
  <h4 className="font-bold mb-6 text-lg">Documents à télécharger</h4>
  <div className="space-y-3">
    {profile.pieces_jointes && profile.pieces_jointes.length > 0 ? (
      profile.pieces_jointes.map((doc: any, idx: number) => (
        <a
          key={idx}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 hover:border-primary/30 hover:bg-slate-50 transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {doc.name || `Document ${idx + 1}`}
            </p>
            <p className="text-xs text-neutral-500 uppercase">
              {doc.type?.split('/')[1] || 'PDF'}
            </p>
          </div>
        </a>
      ))
    ) : (
      <p className="text-neutral-500 text-sm italic text-center py-4">
        Aucun document disponible
      </p>
    )}
  </div>
</div>
</div>

        </div>
      </div>
    </div>
  );
}
