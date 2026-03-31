import { TrendingUp, LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export const StatsCard = ({ icon: Icon, label, value, color }: StatsCardProps) => (
  <div className="bg-white rounded-lg p-4 border border-neutral-200 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <TrendingUp className="w-4 h-4 text-neutral-400" />
    </div>
    <p className="text-2xl font-semibold text-neutral-900 mb-0.5">{value}</p>
    <p className="text-xs text-neutral-600">{label}</p>
  </div>
);
