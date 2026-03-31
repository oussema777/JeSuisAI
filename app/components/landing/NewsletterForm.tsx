import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Bouton } from '../ds/Bouton';

/**
 * NewsletterForm Component
 * 
 * IMPORTANT STYLING NOTE (Brief27 - Figma Task 19):
 * When integrating this newsletter form into pages, the containing <section> 
 * should have a GREEN background (#016B06) to match brand identity.
 * 
 * Example usage:
 * <section className="w-full py-20" style={{ backgroundColor: '#016B06' }}>
 *   <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20">
 *     <NewsletterForm />
 *   </div>
 * </section>
 */

const topics = [
  { id: 'nouvelles-missions', label: 'Nouvelles missions disponibles' },
  { id: 'actualites-villes', label: 'Actualités des villes' },
  { id: 'success-stories', label: 'Success stories de la diaspora' },
  { id: 'evenements', label: 'Événements et rencontres' },
  { id: 'conseils', label: 'Conseils pour contribuer' },
  { id: 'rapports', label: 'Rapports d\'impact mensuel' },
];

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && selectedTopics.length > 0) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center bg-white/10 backdrop-blur-sm rounded-2xl p-12">
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
        <h3 className="text-white mb-4" style={{ fontSize: '25px', fontWeight: 600 }}>
          Merci pour votre inscription !
        </h3>
        <p className="text-white/90" style={{ fontSize: '16px', lineHeight: '1.6' }}>
          Vous recevrez bientôt nos actualités selon vos préférences.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h3 className="text-white mb-3" style={{ fontSize: '31px', fontWeight: 600 }}>
            Restez informé
          </h3>
          <p className="text-white/90 max-w-2xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            Inscrivez-vous à notre newsletter et choisissez les sujets qui vous intéressent
          </p>
        </div>

        {/* Email Input */}
        <div className="mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email"
            required
            className="w-full h-14 px-6 py-4 bg-white rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            style={{ fontSize: '16px', fontWeight: 400 }}
          />
        </div>

        {/* Topics Selection */}
        <div className="mb-8">
          <p className="text-white mb-4" style={{ fontSize: '16px', fontWeight: 600 }}>
            Sélectionnez vos centres d&apos;intérêt :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic) => (
              <label
                key={topic.id}
                className={`flex items-center gap-3 px-5 py-4 rounded-lg cursor-pointer transition-all ${
                  selectedTopics.includes(topic.id)
                    ? 'bg-white text-primary'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic.id)}
                  onChange={() => toggleTopic(topic.id)}
                  className="w-5 h-5 rounded border-2 border-current accent-primary cursor-pointer"
                />
                <span style={{ fontSize: '15px', fontWeight: 500 }}>
                  {topic.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Bouton
            type="submit"
            variant="primaire"
            size="grand"
            className="bg-bg-base hover:bg-primary text-white min-w-[280px]"
            disabled={!email || selectedTopics.length === 0}
          >
            S&apos;inscrire à la newsletter
          </Bouton>
        </div>

        {selectedTopics.length === 0 && email && (
          <p className="text-white/70 text-center mt-4" style={{ fontSize: '14px' }}>
            Veuillez sélectionner au moins un sujet
          </p>
        )}
      </form>
    </div>
  );
}