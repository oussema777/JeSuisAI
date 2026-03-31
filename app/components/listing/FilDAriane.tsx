import React from 'react';
import { Link } from '@/i18n/routing';
import { ChevronRight } from 'lucide-react';

interface ElementFilDAriane {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface FilDArianeProps {
  elements?: ElementFilDAriane[];
  items?: ElementFilDAriane[];
}

export function FilDAriane({ elements, items }: FilDArianeProps) {
  const breadcrumbItems = elements || items || [];
  
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-2">
      {breadcrumbItems.map((element, index) => {
        const estDernier = index === breadcrumbItems.length - 1;
        
        return (
          <React.Fragment key={index}>
            {element.onClick && !estDernier ? (
              <button
                onClick={element.onClick}
                className="text-neutral-600 hover:text-primary transition-colors"
                style={{ fontSize: '14px', fontWeight: 400 }}
              >
                {element.label}
              </button>
            ) : element.href && !estDernier ? (
              <Link
                href={element.href}
                className="text-neutral-600 hover:text-primary transition-colors"
                style={{ fontSize: '14px', fontWeight: 400 }}
              >
                {element.label}
              </Link>
            ) : (
              <span
                className={estDernier ? 'text-neutral-800' : 'text-neutral-600'}
                style={{ fontSize: '14px', fontWeight: estDernier ? 500 : 400 }}
                aria-current={estDernier ? 'page' : undefined}
              >
                {element.label}
              </span>
            )}
            
            {!estDernier && (
              <ChevronRight className="w-4 h-4 text-neutral-400" strokeWidth={2} />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}