'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Scale, Building2, Server, Camera } from 'lucide-react';
import { Skeleton } from '../components/ds/Skeleton';
import { FilDAriane } from '../components/listing/FilDAriane';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const supabase = getSupabaseBrowserClient();

export default function MentionsLegales() {
  const router = useRouter();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data } = await supabase
          .from('static_contents')
          .select('content')
          .eq('key', 'mentions-legales')
          .maybeSingle();
        
        if (data?.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Error loading Mentions Legales content:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg">
        <div className="max-w-4xl mx-auto px-5 py-12 space-y-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const editeur = content?.editeur || {
    name: "Impact Diaspora",
    address: "13006 Marseille",
    line2: "France - Sénégal",
    url: "https://www.impactdiaspora.fr"
  };

  const directeur = content?.directeur || {
    name: "Mr Samir BOUZIDI",
    email: "info@africandiaspora.best"
  };

  const hebergement = content?.hebergement || {
    name: "OVH France",
    address: "Siège social: 2, rue Kellermann, 59100 Roubaix, France.",
    url: "https://www.ovhcloud.com"
  };

  const credits = content?.credits || [
    { name: "Freepik", url: "https://www.freepik.com" },
    { name: "Unsplash", url: "https://unsplash.com" }
  ];

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Breadcrumb Navigation */}
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Mentions légales' },
            ]}
          />
        </div>
      </div>

      {/* Page Header */}
      <div className="w-full bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-8">
          <Link href="/">
          <button
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            Retour à l'accueil
          </button>
          </Link>

          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Scale className="w-7 h-7 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-neutral-900 mb-2" style={{ fontSize: '32px', lineHeight: '1.2', fontWeight: 600 }}>
                Mentions légales
              </h1>
              <p className="text-neutral-700" style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: 400 }}>
                Informations légales et éditoriales
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full py-12">
        <div className="max-w-4xl mx-auto px-5 md:px-10">
          <div className="space-y-6">
            
            {/* Section: Éditeur */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <h2 className="text-neutral-900" style={{ fontSize: '22px', lineHeight: '1.3', fontWeight: 600 }}>
                  Éditeur
                </h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-neutral-900" style={{ fontSize: '17px', lineHeight: '1.5', fontWeight: 600 }}>
                    {editeur.name}
                  </p>
                  <p className="text-neutral-700" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                    {editeur.address}
                  </p>
                  <p className="text-neutral-700" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                    {editeur.line2}
                  </p>
                </div>
                <div>
                  <a
                    href={editeur.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    style={{ fontSize: '15px', fontWeight: 500 }}
                  >
                    {editeur.url.replace('https://', '')} <span className="sr-only">(nouvelle fenêtre)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Section: Directeur de la publication */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
              <h2 className="text-neutral-900 mb-6" style={{ fontSize: '22px', lineHeight: '1.3', fontWeight: 600 }}>
                Directeur de la publication
              </h2>
              
              <div className="space-y-3">
                <p className="text-neutral-700" style={{ fontSize: '16px', lineHeight: '1.7', fontWeight: 400 }}>
                  Le Directeur de la publication est{' '}
                  <span className="text-neutral-900" style={{ fontWeight: 600 }}>
                    {directeur.name}
                  </span>
                </p>
                <div className="bg-neutral-50 rounded-lg p-4 inline-block">
                  <p className="text-neutral-700" style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
                    Email :{' '}
                    <a
                      href={`mailto:${directeur.email}`}
                      className="text-primary hover:underline"
                      style={{ fontWeight: 500 }}
                    >
                      {directeur.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Section: Hébergement */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <h2 className="text-neutral-900" style={{ fontSize: '22px', lineHeight: '1.3', fontWeight: 600 }}>
                  Hébergement
                </h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-neutral-900" style={{ fontSize: '17px', lineHeight: '1.5', fontWeight: 600 }}>
                    {hebergement.name}
                  </p>
                  <p className="text-neutral-700 mt-2" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                    {hebergement.address}
                  </p>
                </div>
                <div>
                  <a
                    href={hebergement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    style={{ fontSize: '15px', fontWeight: 500 }}
                  >
                    {hebergement.url.replace('https://', '')} <span className="sr-only">(nouvelle fenêtre)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Section: Crédits photos */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <h2 className="text-neutral-900" style={{ fontSize: '22px', lineHeight: '1.3', fontWeight: 600 }}>
                  Crédits photos
                </h2>
              </div>
              
              <div className="space-y-3">
                {credits.map((credit: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-neutral-700" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                      ©
                    </span>
                    <a
                      href={credit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      style={{ fontSize: '15px', fontWeight: 500 }}
                    >
                      {credit.name} <span className="sr-only">(nouvelle fenêtre)</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-6">
              <p className="text-neutral-700" style={{ fontSize: '14px', lineHeight: '1.7', fontWeight: 400 }}>
                Pour toute question concernant ces mentions légales ou la protection de vos données personnelles, veuillez consulter notre{' '}
                <Link href="/protection-donnees">
                <button
                  className="text-primary hover:underline"
                  style={{ fontWeight: 500 }}
                >
                  politique de protection des données
                </button>
                </Link>
                {' '}ou{' '}
                <Link href="/contact">
                <button
                  className="text-primary hover:underline"
                  style={{ fontWeight: 500 }}
                >
                  nous contacter
                </button>
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
