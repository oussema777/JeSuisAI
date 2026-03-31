import React from 'react';
import { LinkedinIcon } from 'lucide-react';
import Image from 'next/image';

interface CarteMembreProps {
  photo: string;
  nom: string;
  role: string;
  bio: string;
  linkedinUrl?: string;
}

export function CarteMembre({ photo, nom, role, bio, linkedinUrl }: CarteMembreProps) {
  return (
    <div className="flex flex-col items-center bg-white rounded-xl p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.12)] transition-shadow">
      {/* Photo */}
      <div className="w-[120px] h-[120px] rounded-full overflow-hidden mb-4 bg-neutral-100">
        <Image
          src={photo}
          alt={nom}
          width={120}
          height={120}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Nom */}
      <h3
        className="text-neutral-900 text-center mb-1"
        style={{ fontSize: '16px', fontWeight: 600 }}
      >
        {nom}
      </h3>
      
      {/* Rôle */}
      <p
        className="text-neutral-600 text-center mb-3"
        style={{ fontSize: '14px', fontWeight: 400 }}
      >
        {role}
      </p>
      
      {/* Bio */}
      <p
        className="text-neutral-700 text-center mb-4"
        style={{ fontSize: '13px', fontWeight: 400, lineHeight: '1.6' }}
      >
        {bio}
      </p>
      
      {/* LinkedIn */}
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors"
          aria-label="LinkedIn (nouvelle fenêtre)"
        >
          <LinkedinIcon className="w-5 h-5" strokeWidth={2} />
        </a>
      )}
    </div>
  );
}
