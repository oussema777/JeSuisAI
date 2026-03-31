import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface CarteMetriqueProps {
  icon: React.ReactNode;
  nombre: string;
  label: string;
  changement?: string;
  changeType?: 'positive' | 'negative' | 'alert' | 'neutral';
  iconColor?: string;
  onClick?: () => void;
}

export function CarteMetrique({
  icon,
  nombre,
  label,
  changement,
  changeType = 'neutral',
  iconColor = 'text-primary',
  onClick,
}: CarteMetriqueProps) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    alert: 'text-orange-600',
    neutral: 'text-neutral-600',
  };

  const changeIcons = {
    positive: <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />,
    negative: <TrendingDown className="w-3.5 h-3.5" strokeWidth={2} />,
    alert: <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />,
    neutral: null,
  };

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {/* Icon */}
      <div className={`w-8 h-8 ${iconColor} mb-4`}>{icon}</div>

      {/* Number */}
      <div
        className={iconColor}
        style={{ fontSize: '39px', lineHeight: '1', fontWeight: 600 }}
      >
        {nombre}
      </div>

      {/* Label */}
      <div
        className="text-neutral-700 mt-2"
        style={{ fontSize: '14px', fontWeight: 500, lineHeight: '1.4' }}
      >
        {label}
      </div>

      {/* Change indicator */}
      {changement && (
        <div className={`flex items-center gap-1 mt-3 ${changeColors[changeType]}`}>
          {changeIcons[changeType]}
          <span style={{ fontSize: '13px', fontWeight: 500 }}>{changement}</span>
        </div>
      )}
    </div>
  );
}
