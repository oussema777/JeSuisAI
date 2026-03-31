import { ShieldCheck, Phone, Clock, Send } from 'lucide-react';

interface IndicateursConfianceProps {
  dateMAJ: string;
  annonceurName: string; // Added prop
}

export function IndicateursConfiance({ dateMAJ, annonceurName }: IndicateursConfianceProps) {
  return (
    <div className="flex flex-col gap-3 pt-6 border-t border-neutral-200">
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
        <span className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
          Vérifié par Jesuisaucameroun.com
        </span>
      </div>
      
      {/* Mode de candidature - Figma Task 15 */}
      <div className="flex items-start gap-2">
        <Send className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
        <span className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
          Mode de candidature : formulaire ci-dessous expédié directement à l'annonceur
        </span>
      </div>
      
      <div className="flex items-start gap-2">
        <Phone className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
        <span className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
          Contact direct avec la mairie
        </span>
        {annonceurName && (
<span className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400, color:'#187A58' }}> &nbsp;{annonceurName}
          </span>
        )}
      </div>
      
      <div className="flex items-start gap-2">
        <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
        <span className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
          Mise à jour: {dateMAJ}
        </span>
      </div>
    </div>
  );
}