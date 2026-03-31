import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Bouton } from '../ds/Bouton';

interface PaginationProps {
  pageActuelle: number;
  totalPages: number;
  onChangementPage: (page: number) => void;
}

export function Pagination({ pageActuelle, totalPages, onChangementPage }: PaginationProps) {
  const genererNumeroPages = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // Nombre de pages à afficher de chaque côté de la page actuelle
    
    // Toujours afficher la première page
    pages.push(1);
    
    // Calculer la plage autour de la page actuelle
    const rangeStart = Math.max(2, pageActuelle - delta);
    const rangeEnd = Math.min(totalPages - 1, pageActuelle + delta);
    
    // Ajouter "..." si nécessaire après la première page
    if (rangeStart > 2) {
      pages.push('...');
    }
    
    // Ajouter les pages de la plage
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Ajouter "..." si nécessaire avant la dernière page
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }
    
    // Toujours afficher la dernière page si elle existe et est différente de 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pages = genererNumeroPages();
  
  return (
    <div className="flex items-center justify-center gap-2">
      {/* Bouton Précédent */}
      <Bouton
        variant="tertiaire"
        size="petit"
        onClick={() => onChangementPage(pageActuelle - 1)}
        disabled={pageActuelle === 1}
        icon={<ChevronLeft className="w-4 h-4" strokeWidth={2} />}
      >
        Précédent
      </Bouton>
      
      {/* Numéros de page */}
      <div className="flex items-center gap-2">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-neutral-500"
                style={{ fontSize: '15px', fontWeight: 400 }}
              >
                ...
              </span>
            );
          }
          
          const estPageActuelle = page === pageActuelle;
          
          return (
            <button
              key={page}
              onClick={() => onChangementPage(page as number)}
              className={`min-w-[40px] h-10 px-3 rounded-lg flex items-center justify-center transition-all ${
                estPageActuelle
                  ? 'bg-primary text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
              style={{ fontSize: '15px', fontWeight: estPageActuelle ? 600 : 500 }}
              aria-label={`Page ${page}`}
              aria-current={estPageActuelle ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>
      
      {/* Bouton Suivant */}
      <Bouton
        variant="tertiaire"
        size="petit"
        onClick={() => onChangementPage(pageActuelle + 1)}
        disabled={pageActuelle === totalPages}
        iconPosition="right"
        icon={<ChevronRight className="w-4 h-4" strokeWidth={2} />}
      >
        Suivant
      </Bouton>
    </div>
  );
}
