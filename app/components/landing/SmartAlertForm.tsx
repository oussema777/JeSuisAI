import React, { useState } from 'react';
import { Bell, CheckCircle2, ChevronDown } from 'lucide-react';
import { Bouton } from '../ds/Bouton';

const villes = [
  'Toutes les villes',
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Garoua',
  'Bamenda',
  'Maroua',
  'Limbé',
  'Kribi',
];

const domainesAction = [
  'Tous les domaines',
  'Santé',
  'Éducation',
  'Infrastructure',
  'Technologie',
  'Agriculture',
  'Entrepreneuriat',
  'Environnement',
  'Culture',
];

const typesContribution = [
  { id: 'expertise', label: 'Expertise technique' },
  { id: 'mentorat', label: 'Mentorat' },
  { id: 'financement', label: 'Financement / Investissement' },
  { id: 'benevolat', label: 'Bénévolat' },
];

export function SmartAlertForm() {
  const [ville, setVille] = useState('');
  const [domaine, setDomaine] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showTypesDropdown, setShowTypesDropdown] = useState(false);

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-sm rounded-2xl p-12">
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
        <h3 className="text-white mb-4" style={{ fontSize: '25px', fontWeight: 600 }}>
          Alerte configurée avec succès !
        </h3>
        <p className="text-white/90" style={{ fontSize: '16px', lineHeight: '1.6' }}>
          Nous vous enverrons un email dès qu'une action correspondant à vos critères sera disponible.
        </p>
      </div>
    );
  }

  const getTypesLabel = () => {
    if (selectedTypes.length === 0) return 'Type de contribution';
    if (selectedTypes.length === 1) {
      return typesContribution.find((t) => t.id === selectedTypes[0])?.label || 'Type de contribution';
    }
    return `${selectedTypes.length} types sélectionnés`;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h3 className="text-white mb-3" style={{ fontSize: '31px', fontWeight: 600 }}>
            Restez connecté avec la diaspora
          </h3>
          <p className="text-white/90 max-w-2xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
            Dites-nous ce que vous cherchez, nous vous enverrons un email quand cela arrive
          </p>
        </div>

        {/* Smart Alert Bar - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Dropdown 1: Votre ville */}
          <div className="relative">
            <select
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full h-14 px-4 pr-10 bg-white rounded-lg text-neutral-800 appearance-none focus:outline-none focus:ring-2 focus:ring-white/50 transition-all cursor-pointer"
              style={{ fontSize: '15px', fontWeight: 400 }}
            >
              <option value="">Votre ville</option>
              {villes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" strokeWidth={2} />
          </div>

          {/* Dropdown 2: Domaine d'action */}
          <div className="relative">
            <select
              value={domaine}
              onChange={(e) => setDomaine(e.target.value)}
              className="w-full h-14 px-4 pr-10 bg-white rounded-lg text-neutral-800 appearance-none focus:outline-none focus:ring-2 focus:ring-white/50 transition-all cursor-pointer"
              style={{ fontSize: '15px', fontWeight: 400 }}
            >
              <option value="">Domaine d'action</option>
              {domainesAction.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" strokeWidth={2} />
          </div>

          {/* Dropdown 3: Type de contribution (Multi-select) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTypesDropdown(!showTypesDropdown)}
              className="w-full h-14 px-4 pr-10 bg-white rounded-lg text-neutral-800 text-left focus:outline-none focus:ring-2 focus:ring-white/50 transition-all flex items-center"
              style={{ fontSize: '15px', fontWeight: 400 }}
            >
              <span className={selectedTypes.length === 0 ? 'text-neutral-500' : ''}>
                {getTypesLabel()}
              </span>
            </button>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" strokeWidth={2} />
            
            {/* Multi-select Dropdown */}
            {showTypesDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-10 overflow-hidden">
                {typesContribution.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => toggleType(type.id)}
                      className="w-4 h-4 rounded border-2 border-neutral-300 accent-primary cursor-pointer"
                    />
                    <span className="text-neutral-800" style={{ fontSize: '14px', fontWeight: 400 }}>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Input 4: Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
              className="w-full h-14 px-4 bg-white rounded-lg text-neutral-800 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              style={{ fontSize: '15px', fontWeight: 400 }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Bouton
            type="submit"
            variant="primaire"
            size="grand"
            className="bg-white text-primary hover:bg-white/90 min-w-[200px]"
            disabled={!email}
          >
            M'abonner
          </Bouton>
        </div>
      </form>
    </div>
  );
}
