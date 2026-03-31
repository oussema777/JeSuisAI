import React from 'react';

interface SlidingTitleProps {
  text: string;
}

export function SlidingTitle({ text }: SlidingTitleProps) {
  // Triple the text to create seamless infinite loop
  const textTripled = [text, text, text];

  return (
    <div 
      className="w-full relative overflow-hidden" 
      style={{ 
        backgroundColor: '#003A54',
        height: '80px',
        borderTop: '3px solid #016B06',
        borderBottom: '3px solid #016B06'
      }}
    >
      {/* Left Fade Overlay */}
      <div 
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: '120px',
          background: 'linear-gradient(to right, #003A54 0%, transparent 100%)'
        }}
      />
      
      {/* Right Fade Overlay */}
      <div 
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: '120px',
          background: 'linear-gradient(to left, #003A54 0%, transparent 100%)'
        }}
      />
      
      {/* Scrolling Content */}
      <div 
        className="flex h-full items-center"
        style={{
          animation: 'scroll-title 30s linear infinite',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = 'paused';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = 'running';
        }}
      >
        {textTripled.map((txt, index) => (
          <div
            key={index}
            className="flex-shrink-0"
            style={{ marginRight: '160px' }}
          >
            <h2
              className="whitespace-nowrap"
              style={{
                fontSize: '32px',
                fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                color: '#FFFFFF',
                letterSpacing: '-0.02em'
              }}
            >
              {txt}
            </h2>
          </div>
        ))}
      </div>

      {/* Inline Styles for Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll-title {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.33%);
            }
          }
        `
      }} />
    </div>
  );
}
