"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Calendar } from "@/app/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  label?: string;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
  label = "Date de séjour au Cameroun",
}: DatePickerWithRangeProps) {
  const [hasHydrated, setHasHydrated] = React.useState(false);

  React.useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return (
      <div className={cn("grid gap-2", className)}>
        <label className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#187A58' }}>
          <CalendarIcon className="w-4 h-4" strokeWidth={2} style={{ color: '#187A58' }} />
          {label}
        </label>
        <button
          className="h-12 w-full px-3 py-3 bg-white border border-neutral-300 rounded-lg text-left font-normal flex items-center"
          style={{ fontSize: '14px' }}
          disabled
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-neutral-400" />
          <span className="text-neutral-400">Chargement...</span>
        </button>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <label className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 500, color: '#187A58' }}>
        <CalendarIcon className="w-4 h-4" strokeWidth={2} style={{ color: '#187A58' }} />
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            id="date"
            className={cn(
              "h-12 w-full px-3 py-3 bg-white border border-neutral-300 rounded-lg text-left font-normal flex items-center transition-all focus:border-[#187A58] focus:outline-none",
              !date && "text-muted-foreground"
            )}
            style={{ fontSize: '14px' }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <span className="text-neutral-800 font-medium">
                  {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                </span>
              ) : (
                <span className="text-neutral-800 font-medium">
                  {format(date.from, "dd/MM/yyyy")}
                </span>
              )
            ) : (
              <span className="text-neutral-400">Choisir les dates</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 bg-white border border-neutral-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-xl z-[999]" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            locale={fr}
            className="bg-white rounded-md"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
