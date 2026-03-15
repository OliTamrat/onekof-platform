'use client';

import * as React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  className?: string;
  error?: string;
  helpText?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder,
  minDate,
  maxDate,
  required,
  className,
  error,
  helpText,
}: DatePickerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9FADBC] pointer-events-none z-10" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={minDate}
          max={maxDate}
          required={required}
          placeholder={placeholder}
          className={cn(
            'flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors',
            'bg-[#1B1F23] border-[#2C333A] text-white placeholder-[#9FADBC]',
            'pl-10', // Space for calendar icon
            'focus:border-[#0065FF] focus:outline-none focus:ring-1 focus:ring-[#0065FF]',
            'hover:bg-[#22272B]',
            '[color-scheme:dark]', // Makes the date picker use dark theme
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
        />
      </div>

      {helpText && !error && (
        <p className="text-xs text-[#9FADBC]">{helpText}</p>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

// Date Range Picker for start/end dates
interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  startLabel?: string;
  endLabel?: string;
  required?: boolean;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  required,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        label={startLabel}
        required={required}
        maxDate={endDate} // Can't start after end date
        helpText="When does this begin?"
      />
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        label={endLabel}
        required={required}
        minDate={startDate} // Can't end before start date
        helpText="Target completion date"
      />
    </div>
  );
}
