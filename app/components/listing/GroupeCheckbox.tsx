import React from 'react';
import { Check } from 'lucide-react';

interface OptionCheckbox {
  id: string;
  label: string;
  count?: number;
}

interface GroupeCheckboxProps {
  titre: string;
  options: OptionCheckbox[];
  selectionnees: string[];
  onChange: (selectionnees: string[]) => void;
  afficherPlus?: boolean;
  limiteAffichage?: number;
}

export function GroupeCheckbox({
  titre,
  options,
  selectionnees,
  onChange,
  afficherPlus = false,
  limiteAffichage = 8,
}: GroupeCheckboxProps) {
  const [afficherTout, setAfficherTout] = React.useState(false);
  
  const optionsAffichees = afficherPlus && !afficherTout 
    ? options.slice(0, limiteAffichage)
    : options;
  
  const toggleOption = (id: string) => {
    if (selectionnees.includes(id)) {
      onChange(selectionnees.filter(s => s !== id));
    } else {
      onChange([...selectionnees, id]);
    }
  };
  
  return (
    <div className="flex flex-col">
      <label className="text-neutral-800 mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
        {titre}
      </label>
      
      <div className="flex flex-col gap-3">
        {optionsAffichees.map((option) => {
          const isChecked = selectionnees.includes(option.id);
          
          return (
            <label
              key={option.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOption(option.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isChecked
                      ? 'bg-primary border-primary'
                      : 'bg-white border-neutral-300 group-hover:border-primary'
                  }`}
                >
                  {isChecked && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
              
              <span
                className={`flex-1 transition-colors ${
                  isChecked ? 'text-neutral-800' : 'text-neutral-700 group-hover:text-neutral-900'
                }`}
                style={{ fontSize: '15px', fontWeight: isChecked ? 500 : 400 }}
              >
                {option.label}
              </span>
              
              {option.count !== undefined && (
                <span className="text-neutral-500" style={{ fontSize: '13px', fontWeight: 400 }}>
                  ({option.count})
                </span>
              )}
            </label>
          );
        })}
      </div>
      
      {afficherPlus && options.length > limiteAffichage && (
        <button
          onClick={() => setAfficherTout(!afficherTout)}
          className="text-primary hover:text-primary-dark mt-3 text-left transition-colors"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          {afficherTout ? 'Voir moins' : 'Voir plus'}
        </button>
      )}
    </div>
  );
}
