import React from 'react';

interface TitleUnderlineProps {
  width?: string;
  className?: string;
}

export function TitleUnderline({ width = '200px', className = '' }: TitleUnderlineProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div
        style={{ 
          width: width,
          height: '4px',
          backgroundColor: '#f8e007',
          borderRadius: '2px'
        }}
      />
    </div>
  );
}