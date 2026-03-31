'use client';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const t = useTranslations('Common.pagination');

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };
  
  return (
    <div className="flex items-center justify-center gap-2">
      {/* Bouton Précédent */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        style={{ fontSize: '14px', fontWeight: 500 }}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        {t('previous')}
      </button>
      
      {/* Numéros de page */}
      <div className="flex items-center gap-2">
        {renderPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-neutral-500">
                ...
              </span>
            );
          }
          
          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;
          
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-white font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
              style={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      
      {/* Bouton Suivant */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        style={{ fontSize: '14px', fontWeight: 500 }}
      >
        {t('next')}
        <ChevronRight className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
