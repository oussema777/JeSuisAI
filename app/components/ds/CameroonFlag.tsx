import React from 'react';

interface CameroonFlagProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function CameroonFlag({ size = 'medium', className = '' }: CameroonFlagProps) {
  const sizeMap = {
    small: 'w-6 h-4',
    medium: 'w-8 h-6',
    large: 'w-12 h-8',
  };

  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Green stripe (left) */}
      <rect width="300" height="600" fill="#007A5E" />
      
      {/* Red stripe (center) */}
      <rect x="300" width="300" height="600" fill="#CE1126" />
      
      {/* Yellow stripe (right) */}
      <rect x="600" width="300" height="600" fill="#FCD116" />
      
      {/* Yellow star in center */}
      <g transform="translate(450, 300)">
        <path
          d="M 0,-80 L 23.5,-24.7 L 81.9,-24.7 L 35.4,12.4 L 58.8,67.6 L 0,30.5 L -58.8,67.6 L -35.4,12.4 L -81.9,-24.7 L -23.5,-24.7 Z"
          fill="#FCD116"
          stroke="#000000"
          strokeWidth="3"
        />
      </g>
    </svg>
  );
}
