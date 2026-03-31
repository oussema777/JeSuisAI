import React from 'react';
import Image from 'next/image';

interface SectionTitleWithPlaneProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  showPlane?: boolean;
}

export function SectionTitleWithPlane({ title, subtitle, align = 'center', showPlane = true }: SectionTitleWithPlaneProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const containerClass = align === 'center' ? 'items-center' : 'items-start';
  const titleAlign = align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <div className={`flex flex-col ${containerClass} mb-12`}>
      <div className={`${alignClass}`}>
        {/* Airplane inline with title - NEW RED PLANE IMAGE - HIDDEN ON MOBILE */}
        <div className={`flex ${titleAlign} items-center gap-4 mb-4`}>
          {showPlane && (
            <div className="hidden sm:block flex-shrink-0">
              <Image
                src="https://jesuisaupays.com/wp-content/uploads/2026/01/2.png" 
                alt="Red plane icon"
                width={200}
                height={50}
                className="w-auto object-contain"
                style={{ height: '50px', maxWidth: '200px' }}
              />
            </div>
          )}
          <h2 
            className="text-neutral-900" 
            style={{ fontSize: 'clamp(24px, 5vw, 39px)', lineHeight: '1.2', fontWeight: 600 }}
          >
            {title}
          </h2>
        </div>
        
        {subtitle && (
          <p className="text-neutral-700 max-w-2xl" style={{ fontSize: '17px', lineHeight: '1.6', fontWeight: 400 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}