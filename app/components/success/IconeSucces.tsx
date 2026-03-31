import React from 'react';
import { Check } from 'lucide-react';

export function IconeSucces() {
  return (
    <div className="flex justify-center">
      <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
        <Check className="w-10 h-10 text-success" strokeWidth={3} />
      </div>
    </div>
  );
}
