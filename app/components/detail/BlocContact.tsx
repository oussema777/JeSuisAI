import React from 'react';
import { User, Mail, Phone, MessageCircle } from 'lucide-react';

interface BlocContactProps {
  nom: string;
  email: string;
  telephone: string;
  whatsapp?: string;
}

export function BlocContact({ nom, email, telephone, whatsapp }: BlocContactProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h4 className="text-neutral-800 mb-4" style={{ fontSize: '16px', lineHeight: '1.4', fontWeight: 600 }}>
        Personne responsable
      </h4>
      
      <div className="flex flex-col gap-3">
        {/* Nom */}
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-neutral-500 flex-shrink-0" strokeWidth={2} />
          <span className="text-neutral-800" style={{ fontSize: '15px', fontWeight: 500 }}>
            {nom}
          </span>
        </div>
        
        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <a
            href={`mailto:${email}`}
            className="text-primary hover:text-primary-dark transition-colors break-all"
            style={{ fontSize: '15px', fontWeight: 400 }}
          >
            {email}
          </a>
        </div>
        
        {/* Téléphone */}
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-neutral-500 flex-shrink-0" strokeWidth={2} />
          <a
            href={`tel:${telephone}`}
            className="text-neutral-800 hover:text-primary transition-colors"
            style={{ fontSize: '15px', fontWeight: 400 }}
          >
            {telephone}
          </a>
        </div>
        
        {/* WhatsApp */}
        {whatsapp && (
          <div className="pt-3 mt-3 border-t border-neutral-200">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
              style={{ fontSize: '15px', fontWeight: 500 }}
            >
              <MessageCircle className="w-5 h-5" strokeWidth={2} />
              Contacter sur WhatsApp <span className="sr-only">(nouvelle fenêtre)</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
