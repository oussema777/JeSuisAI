import React from 'react';

interface CardWithColorfulBorderProps {
  children: React.ReactNode;
  className?: string;
  borderHeight?: number;
}

/**
 * Card with colorful top border (Cameroon flag colors: Teal, Yellow, Red)
 * Can be reused across the platform for consistent branding
 */
export function CardWithColorfulBorder({ 
  children, 
  className = '',
  borderHeight = 6 
}: CardWithColorfulBorderProps) {
  return (
    <div className={`w-full bg-white rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.15)] ${className}`}>
      {/* Colorful top border - Smooth gradient blending Teal, Yellow, Red */}
      <div 
        className="w-full rounded-t-2xl overflow-hidden" 
        style={{
          height: `${borderHeight}px`,
          background: 'linear-gradient(to right, #187A58, #f8e007, #EE0003)',
        }}
      />
      
      {/* Card content */}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}