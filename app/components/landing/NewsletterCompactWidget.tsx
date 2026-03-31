import React, { useState, useEffect } from 'react';
import { Mail, ChevronDown, MapPin, Briefcase, Heart, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = getSupabaseBrowserClient();

const villes = ['Toutes les villes', 'Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Maroua', 'Limbé', 'Kribi'];
const domainesAction = ['Tous les domaines', 'Santé', 'Éducation', 'Infrastructure', 'Technologie', 'Agriculture', 'Entrepreneuriat', 'Environnement', 'Culture'];
const typesContribution = ['Tous les types', 'Expertise technique', 'Mentorat', 'Financement / Investissement', 'Bénévolat'];

export function NewsletterCompactWidget() {
  const [ville, setVille] = useState('');
  const [domaine, setDomaine] = useState('');
  const [typeContribution, setTypeContribution] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    async function fetchContent() {
      const { data } = await supabase
        .from('static_contents')
        .select('content')
        .eq('key', 'landing-page')
        .maybeSingle();
      
      if (data?.content) {
        setContent((data.content as any).newsletter);
      }
    }
    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email,
          whatsapp: whatsapp || null,
          ville: ville || null,
          domaine: domaine || null,
          type_contribution: typeContribution || null
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Cet email est déjà inscrit à notre newsletter.');
        } else {
          throw error;
        }
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
        setWhatsapp('');
        setVille('');
        setDomaine('');
        setTypeContribution('');
      }, 5000);
    } catch (err) {
      console.error('Newsletter error:', err);
      toast.error("Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full py-24 bg-[#187A58]">
        <div className="max-w-5xl mx-auto text-center bg-white rounded-2xl p-12 shadow-2xl border border-green-100 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" strokeWidth={2} />
          </div>
          <h3 className="text-neutral-900 mb-3" style={{ fontSize: '24px', fontWeight: 700 }}>Abonnement réussi !</h3>
          <p className="text-neutral-600" style={{ fontSize: '16px' }}>Merci ! Vous recevrez désormais nos alertes personnalisées directement par email.</p>
        </div>
      </div>
    );
  }

  const badge = content?.badge || "Newsletter";
  const title = content?.title || "Restez connecté à jesuisaucameroun.com";
  const subtitle = content?.subtitle || "Recevez des actions de mission personnalisées via des alertes e-mail gratuites.";

  return (
    <div className="w-full relative py-24 overflow-hidden" style={{ backgroundColor: '#187A58' }}>
      <div className="max-w-[1200px] mx-auto px-5 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full" style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}>
            <Mail className="w-5 h-5" style={{ color: '#f8e007' }} strokeWidth={2} />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#f8e007' }}>{badge}</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-white mb-4" style={{ fontSize: '42px', lineHeight: '1.2', fontWeight: 700 }}>
            {title}
          </h2>
          <p className="text-white/95 max-w-3xl mx-auto" style={{ fontSize: '18px' }}>
            {subtitle}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-10 shadow-2xl max-w-5xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="relative flex items-center">
                <MapPin className="absolute left-4 w-5 h-5 pointer-events-none z-20 text-[#A855F7]" strokeWidth={2} />
                <select value={ville} onChange={(e) => setVille(e.target.value)} className="w-full h-14 pl-12 pr-11 bg-white rounded-xl appearance-none focus:ring-2 focus:ring-green-500/40 border-2 border-neutral-200 shadow-sm outline-none">
                  <option value="">Sélectionnez une ville</option>
                  {villes.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                <ChevronDown className="absolute right-4 w-5 h-5 text-neutral-400 pointer-events-none" />
                <label className="absolute -top-2.5 left-4 px-2 bg-white text-[12px] font-bold text-[#003A54]">Votre ville</label>
              </div>

              <div className="relative flex items-center">
                <Briefcase className="absolute left-4 w-5 h-5 pointer-events-none z-20 text-[#F97316]" strokeWidth={2} />
                <select value={domaine} onChange={(e) => setDomaine(e.target.value)} className="w-full h-14 pl-12 pr-11 bg-white rounded-xl appearance-none focus:ring-2 focus:ring-green-500/40 border-2 border-neutral-200 shadow-sm outline-none">
                  <option value="">Tous les domaines</option>
                  {domainesAction.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-4 w-5 h-5 text-neutral-400 pointer-events-none" />
                <label className="absolute -top-2.5 left-4 px-2 bg-white text-[12px] font-bold text-[#003A54]">Domaine d&apos;action</label>
              </div>

              <div className="relative flex items-center">
                <Heart className="absolute left-4 w-5 h-5 pointer-events-none z-20 text-[#EE0003]" strokeWidth={2} />
                <select value={typeContribution} onChange={(e) => setTypeContribution(e.target.value)} className="w-full h-14 pl-12 pr-11 bg-white rounded-xl appearance-none focus:ring-2 focus:ring-green-500/40 border-2 border-neutral-200 shadow-sm outline-none">
                  <option value="">Type de contribution</option>
                  {typesContribution.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-4 w-5 h-5 text-neutral-400 pointer-events-none" />
                <label className="absolute -top-2.5 left-4 px-2 bg-white text-[12px] font-bold text-[#003A54]">Contribution</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="relative md:col-span-5">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemple@email.com" required className="w-full h-14 px-5 bg-white rounded-xl focus:ring-2 focus:ring-green-500/40 border-2 border-neutral-200 shadow-sm outline-none" />
                <label className="absolute -top-2.5 left-4 px-2 bg-white text-[12px] font-bold text-[#003A54]">Email *</label>
              </div>
              <div className="relative md:col-span-4">
                <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+237 6XX XXX XXX" className="w-full h-14 px-5 bg-white rounded-xl focus:ring-2 focus:ring-green-500/40 border-2 border-neutral-200 shadow-sm outline-none" />
                <label className="absolute -top-2.5 left-4 px-2 bg-white text-[12px] font-bold text-[#003A54]">WhatsApp (optionnel)</label>
              </div>
              <button type="submit" disabled={isSubmitting} className="md:col-span-3 h-14 rounded-xl bg-[#1FA566] text-white font-bold hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                M&apos;abonner
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}