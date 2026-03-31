'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Sun, Cloud, CloudRain } from 'lucide-react';

interface WidgetMeteoProps {
  ville?: string;
  temperature?: number;
  condition?: 'ensoleille' | 'nuageux' | 'pluvieux';
}

// Cities to cycle through
const cities = [
  { name: 'Yaoundé', temp: 28, condition: 'ensoleille' as const },
  { name: 'Douala', temp: 30, condition: 'nuageux' as const },
  { name: 'Garoua', temp: 34, condition: 'ensoleille' as const },
];

export function WidgetMeteo({ 
  ville, 
  temperature,
  condition
}: WidgetMeteoProps) {
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  
  // Cycle through cities every 5 seconds if no manual props provided
  useEffect(() => {
    if (!ville) {
      const interval = setInterval(() => {
        setCurrentCityIndex((prevIndex) => (prevIndex + 1) % cities.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [ville]);
  
  // Use manual props if provided, otherwise use cycling cities
  const currentCity = ville || cities[currentCityIndex].name;
  const currentTemp = temperature || cities[currentCityIndex].temp;
  const currentCondition = condition || cities[currentCityIndex].condition;
  
  const getWeatherIcon = () => {
    switch (currentCondition) {
      case 'ensoleille':
        return <Sun className="w-5 h-5 text-accent-yellow" strokeWidth={2} />;
      case 'nuageux':
        return <Cloud className="w-5 h-5 text-neutral-400" strokeWidth={2} />;
      case 'pluvieux':
        return <CloudRain className="w-5 h-5 text-info" strokeWidth={2} />;
      default:
        return <Sun className="w-5 h-5 text-accent-yellow" strokeWidth={2} />;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Location section */}
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-white" strokeWidth={2} />
        <span className="text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
          {currentCity}
        </span>
      </div>
      
      {/* Weather section */}
      <div className="flex items-center gap-2">
        {getWeatherIcon()}
        <span className="text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
          {currentTemp}°C
        </span>
      </div>
    </div>
  );
}