import React from 'react';

interface CameroonFlagProps {
  width?: number;
  height?: number;
  className?: string;
}

export function CameroonFlag({ width = 32, height = 24, className = '' }: CameroonFlagProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 900 600"
      className={className}
      role="img"
      aria-label="Drapeau du Cameroun"
    >
      {/* Green stripe (left) */}
      <rect x="0" y="0" width="300" height="600" fill="#007A5E" />
      
      {/* Red stripe (center) */}
      <rect x="300" y="0" width="300" height="600" fill="#CE1126" />
      
      {/* Yellow stripe (right) */}
      <rect x="600" y="0" width="300" height="600" fill="#FCD116" />
      
      {/* Yellow star in center */}
      <g transform="translate(450, 300)">
        <polygon
          points="0,-80 23.5,-24.7 82.5,-24.7 33.5,19.4 56.3,74.7 0,30.6 -56.3,74.7 -33.5,19.4 -82.5,-24.7 -23.5,-24.7"
          fill="#FCD116"
        />
      </g>
    </svg>
  );
}
