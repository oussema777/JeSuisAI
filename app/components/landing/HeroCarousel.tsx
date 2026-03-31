import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const heroSlides = [
  {
    id: 1,
    image: 'https://jesuisaupays.com/home-ia/assets/hero-beach-CpJkoZy1.jpg',
    alt: 'Diaspora camerounaise - Collaboration et développement',
  },
  {
    id: 2,
    image: 'https://jesuisaupays.com/wp-content/uploads/2026/01/Cameroun5.jpg',
    alt: 'Infrastructure et projets de développement au Cameroun',
  },
  {
    id: 3,
    image: 'https://jesuisaupays.com/wp-content/uploads/2026/01/Cameroun6.jpg',
    alt: 'Communauté diaspora camerounaise engagée',
  },
  {
    id: 4,
    image: 'https://jesuisaupays.com/wp-content/uploads/2026/01/Cameroun7.jpg',
    alt: 'Partenariat diaspora et développement local',
  },
  {
    id: 5,
    image: 'https://jesuisaupays.com/wp-content/uploads/2026/01/Cameroun8.jpg',
    alt: 'Engagement diaspora camerounaise',
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play carousel - change slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Carousel Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            style={{ objectFit: 'cover' }}
            priority={index === 0}
          />
          
          {/* Dark overlay for text readability - NO BLUR */}
          <div className="absolute inset-0 bg-bg-base/30"></div>
        </div>
      ))}

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Aller à la slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}