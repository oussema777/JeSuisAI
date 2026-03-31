import React from 'react';

interface WaveSeparatorProps {
  color?: string;
  className?: string;
  flip?: boolean;
}

/**
 * Wave separator component for smooth section transitions
 * Can be flipped for different orientations
 */
export function WaveSeparator({ 
  color = '#FFFFFF', 
  className = '',
  flip = false 
}: WaveSeparatorProps) {
  return (
    <div 
      className={`w-full ${className}`}
      style={{
        transform: flip ? 'scaleY(-1)' : 'none',
        lineHeight: 0,
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1440 200" 
        preserveAspectRatio="none"
        className="w-full h-auto"
        style={{ display: 'block', height: '120px' }}
      >
        {/* Multi-layered waves for depth */}
        
        {/* Back wave - lighter/semi-transparent */}
        <path 
          d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,90.7C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z" 
          fill={color}
          opacity="0.3"
        />
        
        {/* Middle wave - medium opacity */}
        <path 
          d="M0,128L48,133.3C96,139,192,149,288,144C384,139,480,117,576,112C672,107,768,117,864,128C960,139,1056,149,1152,149.3C1248,149,1344,139,1392,133.3L1440,128L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z" 
          fill={color}
          opacity="0.5"
        />
        
        {/* Front wave - solid */}
        <path 
          d="M0,160L48,154.7C96,149,192,139,288,144C384,149,480,171,576,170.7C672,171,768,149,864,138.7C960,128,1056,128,1152,138.7C1248,149,1344,171,1392,181.3L1440,192L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z" 
          fill={color}
        />
      </svg>
    </div>
  );
}