import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface ElementFAQProps {
  question: string;
  reponse?: string | React.ReactNode;
}

export function ElementFAQ({ question, reponse }: ElementFAQProps) {
  const [ouvert, setOuvert] = useState(false);
  
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOuvert(!ouvert)}
        className="w-full flex items-center justify-between py-4 px-0 text-left hover:text-primary transition-colors group"
      >
        <span className="text-neutral-800 group-hover:text-primary" style={{ fontSize: '16px', fontWeight: 500 }}>
          {question}
        </span>
        {ouvert ? (
          <ChevronDown className="w-5 h-5 text-neutral-500 group-hover:text-primary flex-shrink-0 ml-4" strokeWidth={2} />
        ) : (
          <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-primary flex-shrink-0 ml-4" strokeWidth={2} />
        )}
      </button>
      
      {ouvert && reponse && (
        <div className="pb-4 px-0">
          <div className="text-neutral-600" style={{ fontSize: '15px', lineHeight: '1.7', fontWeight: 400 }}>
            {reponse}
          </div>
        </div>
      )}
    </div>
  );
}