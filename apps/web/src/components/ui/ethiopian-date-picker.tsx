'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  gregorianToEthiopian,
  ethiopianToGregorian,
  getEthiopianMonthDays,
  ETHIOPIAN_MONTHS,
  type EthiopianDate,
} from '@/lib/ethiopian-calendar';
import { cn } from '@/lib/utils';

type CalendarMode = 'gregorian' | 'ethiopian';

interface EthiopianDatePickerProps {
  value?: string | null;
  onChange: (isoDate: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function EthiopianDatePicker({ value, onChange, placeholder = 'Select date', className, disabled }: EthiopianDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CalendarMode>('gregorian');
  const ref = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();

  const [viewDate, setViewDate] = useState(() => selectedDate || today);
  const [ethViewYear, setEthViewYear] = useState(() => {
    const eth = gregorianToEthiopian(selectedDate || today);
    return eth.year;
  });
  const [ethViewMonth, setEthViewMonth] = useState(() => {
    const eth = gregorianToEthiopian(selectedDate || today);
    return eth.month;
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (date: Date) => {
    onChange(date.toISOString());
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  const formatDisplay = () => {
    if (!selectedDate) return placeholder;
    const eth = gregorianToEthiopian(selectedDate);
    const greg = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (mode === 'ethiopian') {
      return `${eth.monthName} ${eth.day}, ${eth.year}`;
    }
    return greg;
  };

  // Gregorian calendar grid
  const renderGregorianGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = lastDay.getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-white">{GREGORIAN_MONTHS[month]} {year}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS_SHORT.map(d => (
            <div key={d} className="text-[10px] font-medium text-white/30 py-1">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const date = new Date(year, month, day);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            return (
              <button
                key={day}
                onClick={() => handleSelect(date)}
                className={cn(
                  'h-7 w-7 rounded-md text-xs transition-colors mx-auto',
                  isSelected ? 'bg-[#1C8C7D] text-white font-semibold' :
                  isToday ? 'border border-[#1C8C7D] text-[#1C8C7D]' :
                  'text-white/70 hover:bg-white/[0.08]'
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Ethiopian calendar grid
  const renderEthiopianGrid = () => {
    const daysInMonth = getEthiopianMonthDays(ethViewMonth, ethViewYear);
    const firstDayGreg = ethiopianToGregorian({ year: ethViewYear, month: ethViewMonth, day: 1, monthName: '', dayName: '' });
    const startWeekday = firstDayGreg.getDay() === 0 ? 6 : firstDayGreg.getDay() - 1;

    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const selectedEth = selectedDate ? gregorianToEthiopian(selectedDate) : null;
    const todayEth = gregorianToEthiopian(today);

    return (
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
            if (ethViewMonth === 1) { setEthViewMonth(13); setEthViewYear(ethViewYear - 1); }
            else setEthViewMonth(ethViewMonth - 1);
          }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-white">{ETHIOPIAN_MONTHS[ethViewMonth - 1]} {ethViewYear}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
            if (ethViewMonth === 13) { setEthViewMonth(1); setEthViewYear(ethViewYear + 1); }
            else setEthViewMonth(ethViewMonth + 1);
          }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS_SHORT.map(d => (
            <div key={d} className="text-[10px] font-medium text-white/30 py-1">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const ethDate: EthiopianDate = { year: ethViewYear, month: ethViewMonth, day, monthName: ETHIOPIAN_MONTHS[ethViewMonth - 1], dayName: '' };
            const gregDate = ethiopianToGregorian(ethDate);
            const isSelected = selectedEth && selectedEth.year === ethViewYear && selectedEth.month === ethViewMonth && selectedEth.day === day;
            const isToday = todayEth.year === ethViewYear && todayEth.month === ethViewMonth && todayEth.day === day;
            return (
              <button
                key={day}
                onClick={() => handleSelect(gregDate)}
                className={cn(
                  'h-7 w-7 rounded-md text-xs transition-colors mx-auto',
                  isSelected ? 'bg-[#1C8C7D] text-white font-semibold' :
                  isToday ? 'border border-[#1C8C7D] text-[#1C8C7D]' :
                  'text-white/70 hover:bg-white/[0.08]'
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          'flex items-center gap-2 w-full rounded-lg border px-3 py-2 text-sm text-left transition-colors',
          'border-white/[0.08] bg-white/[0.04] text-white hover:border-white/[0.15]',
          disabled && 'opacity-50 cursor-not-allowed',
          !selectedDate && 'text-white/30'
        )}
      >
        <Calendar className="h-4 w-4 shrink-0 text-white/40" />
        <span className="flex-1 truncate">{formatDisplay()}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-[280px] rounded-xl border border-white/[0.08] bg-[#12161B] p-3 shadow-xl">
          {/* Calendar mode toggle */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setMode(mode === 'gregorian' ? 'ethiopian' : 'gregorian')}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-white/70 hover:text-white transition-colors"
            >
              <Globe className="h-3 w-3" />
              {mode === 'gregorian' ? 'Ethiopian' : 'Gregorian'}
            </button>
            {selectedDate && (
              <button onClick={handleClear} className="text-[11px] text-red-400 hover:underline">
                Clear
              </button>
            )}
          </div>

          {/* Dual date display */}
          {selectedDate && (
            <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 space-y-0.5">
              <div className="text-[11px] text-white/40">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-[11px] text-[#1C8C7D] font-medium">
                {(() => { const e = gregorianToEthiopian(selectedDate); return `${e.monthName} ${e.day}, ${e.year} E.C.`; })()}
              </div>
            </div>
          )}

          {mode === 'gregorian' ? renderGregorianGrid() : renderEthiopianGrid()}
        </div>
      )}
    </div>
  );
}
