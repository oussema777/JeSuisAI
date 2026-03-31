import React from 'react';

interface TitleWithEffectProps {
  children: string;
  variant?: 'h1' | 'h2';
  className?: string;
  accentColor?: 'primary' | 'yellow' | 'red';
}

export function TitleWithEffect({ 
  children, 
  variant = 'h2',
  className = '',
  accentColor = 'primary'
}: TitleWithEffectProps) {
  // Split the title to get the first word
  const words = children.split(' ');
  const firstWord = words[0];
  const restOfTitle = words.slice(1).join(' ');
  
  // Get the appropriate accent color
  const accentColorMap = {
    primary: 'bg-primary',
    yellow: 'bg-accent-yellow',
    red: 'bg-accent-red',
  };
  
  const accentBg = accentColorMap[accentColor] || accentColorMap.primary;
  
  // Determine styles based on variant
  const fontSize = variant === 'h1' ? '49px' : '39px';
  const lineHeight = variant === 'h1' ? '1.2' : '1.2';
  
  return (
    <div className={`relative inline-block ${className}`}>
      {variant === 'h1' ? (
        <h1 style={{ fontSize, lineHeight, fontWeight: 600 }} className="relative z-10">
          <span className="relative inline-block">
            {/* Slanted background effect */}
            <span 
              className={`absolute -left-3 -top-1 -bottom-1 -right-2 ${accentBg} opacity-15 -skew-x-6 rounded-md`}
              style={{ transform: 'skewX(-8deg)' }}
            ></span>
            <span className="relative z-10">{firstWord}</span>
          </span>
          {' '}
          {restOfTitle}
        </h1>
      ) : (
        <h2 style={{ fontSize, lineHeight, fontWeight: 600 }} className="relative z-10">
          <span className="relative inline-block">
            {/* Slanted background effect */}
            <span 
              className={`absolute -left-3 -top-1 -bottom-1 -right-2 ${accentBg} opacity-15 -skew-x-6 rounded-md`}
              style={{ transform: 'skewX(-8deg)' }}
            ></span>
            <span className="relative z-10">{firstWord}</span>
          </span>
          {' '}
          {restOfTitle}
        </h2>
      )}
    </div>
  );
}
