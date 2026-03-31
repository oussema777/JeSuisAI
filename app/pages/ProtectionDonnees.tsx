'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Shield } from 'lucide-react';
import { Skeleton } from '../components/ds/Skeleton';
import { FilDAriane } from '../components/listing/FilDAriane';
import { Link } from '@/i18n/routing';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const supabase = getSupabaseBrowserClient();

export default function ProtectionDonnees() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data } = await supabase
          .from('static_contents')
          .select('content')
          .eq('key', 'cgu')
          .maybeSingle();
        
        if (data?.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Error loading Data Protection content:', err);
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
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-24 rounded-xl" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const title = content?.title || "Protection des données personnelles";
  const subtitle = content?.subtitle || "Notre engagement pour la sécurité de vos informations";
  const intro = content?.intro || "Respecter votre droit à la protection, à la sécurité et à la confidentialité de vos données, est notre priorité.";
  const sections = content?.sections || [
    {
      title: "Collecte des données",
      content: "En règle générale, nous collectons des données personnelles lorsque vous nous rentrons en contact, c'est-à-dire lorsque vous visitez notre site Web et vous nous sollicitez pour une demande d'informations. Vos données sont collectées grâce à vos communications avec nous. Il peut s'agir d'informations que vous saisissez dans un formulaire de contact, par exemple.",
      note: "Important : nous n'utilisons pas de cookies sur notre site web."
    }
  ];

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Breadcrumb Navigation */}
      <div className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 py-4">
          <FilDAriane
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Protection des données' },
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
              <Shield className="w-7 h-7 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-neutral-900 mb-2" style={{ fontSize: '32px', lineHeight: '1.2', fontWeight: 600 }}>
                {title}
              </h1>
              <p className="text-neutral-700" style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: 400 }}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full py-12">
        <div className="max-w-4xl mx-auto px-5 md:px-10">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 md:p-12">
            
            {/* Introduction - Highlighted */}
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-6 mb-10">
              <p className="text-neutral-900" style={{ fontSize: '17px', lineHeight: '1.7', fontWeight: 500 }}>
                {intro}
              </p>
            </div>

            {/* Dynamic Sections */}
            {sections.map((section: any, idx: number) => (
              <section key={idx} className="mb-10">
                <h2 className="text-neutral-900 mb-4 pb-3 border-b border-neutral-200" style={{ fontSize: '24px', lineHeight: '1.3', fontWeight: 600 }}>
                  {section.title}
                </h2>
                <div className="space-y-4">
                  <p className="text-neutral-700 whitespace-pre-line" style={{ fontSize: '16px', lineHeight: '1.7', fontWeight: 400 }}>
                    {section.content}
                  </p>
                  {section.note && (
                    <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg p-4">
                      <p className="text-neutral-900" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 600 }}>
                        {section.note}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            ))}

            {/* Contact Footer */}
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <div className="bg-neutral-50 rounded-lg p-6">
                <h3 className="text-neutral-900 mb-3" style={{ fontSize: '18px', lineHeight: '1.4', fontWeight: 600 }}>
                  Des questions sur vos données ?
                </h3>
                <p className="text-neutral-700 mb-4" style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: 400 }}>
                  Pour toute demande concernant vos données personnelles, consultez nos{' '}
                  <Link href="/mentions-legales">
                  <button
                    className="text-primary hover:underline"
                    style={{ fontWeight: 500 }}
                  >
                    mentions légales
                  </button>
                  </Link>
                  {' '}ou{' '}
                  <Link href="/contact">
                  <button
                    className="text-primary hover:underline"
                    style={{ fontWeight: 500 }}
                  >
                    contactez-nous
                  </button>
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
