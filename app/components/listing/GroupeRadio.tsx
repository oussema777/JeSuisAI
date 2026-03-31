import React from 'react';

interface OptionRadio {
  id: string;
  label: string;
}

interface GroupeRadioProps {
  titre: string;
  options: OptionRadio[];
  selectionne: string;
  onChange: (id: string) => void;
  name: string;
}

export function GroupeRadio({
  titre,
  options,
  selectionne,
  onChange,
  name,
}: GroupeRadioProps) {
  return (
    <div className="flex flex-col">
      <label className="text-neutral-800 mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
        {titre}
      </label>
      
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isChecked = selectionne === option.id;
          
          return (
            <label
              key={option.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative flex-shrink-0">
                <input
                  type="radio"
                  name={name}
                  checked={isChecked}
                  onChange={() => onChange(option.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isChecked
                      ? 'bg-white border-primary'
                      : 'bg-white border-neutral-300 group-hover:border-primary'
                  }`}
                >
                  {isChecked && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
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
            </label>
          );
        })}
      </div>
    </div>
  );
}
