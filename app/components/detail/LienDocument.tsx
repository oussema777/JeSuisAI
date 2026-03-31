import React from 'react';
import { FileText, Download } from 'lucide-react';

interface LienDocumentProps {
  nom: string;
  taille: string;
  url?: string;
}

export function LienDocument({ nom, taille, url = '#' }: LienDocumentProps) {
  return (
    <a
      href={url}
      download
      className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        
        <div className="flex flex-col">
          <span className="text-neutral-800 group-hover:text-primary transition-colors" style={{ fontSize: '15px', fontWeight: 500 }}>
            {nom}
          </span>
          <span className="text-neutral-500" style={{ fontSize: '13px', fontWeight: 400 }}>
            {taille}
          </span>
        </div>
      </div>
      
      <Download className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" strokeWidth={2} />
    </a>
  );
}
