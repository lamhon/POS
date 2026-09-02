'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarRange, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterMode = 'today' | 'month' | 'year' | 'custom';

interface DateFilterProps {
  onChange: (startDate: string | null, endDate: string | null) => void;
}

export function DateFilter({ onChange }: DateFilterProps) {
  const [mode, setMode] = useState<FilterMode>('month'); // default to 'month'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handlePresetChange = (selectedMode: FilterMode) => {
    setMode(selectedMode);
    
    if (selectedMode === 'custom') {
      // Don't trigger change immediately, wait for user to select custom dates
      return;
    }

    const now = new Date();
    let start: Date;
    let end: Date;

    switch (selectedMode) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        return;
    }

    onChange(start.toISOString(), end.toISOString());
  };

  useEffect(() => {
    if (mode === 'custom') {
      if (customStart && customEnd) {
        const start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        
        onChange(start.toISOString(), end.toISOString());
      } else {
        onChange(null, null);
      }
    }
  }, [customStart, customEnd, mode]);

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card text-card-foreground shadow-xs md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <CalendarRange className="h-5 w-5 text-muted-foreground shrink-0" />
        <span className="text-sm font-semibold">Filter by Period:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border bg-muted p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handlePresetChange('today')}
            className={cn(
              'h-7 px-3 text-xs cursor-pointer rounded-xs',
              mode === 'today' ? 'bg-background shadow-xs font-semibold' : 'text-muted-foreground hover:bg-transparent'
            )}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handlePresetChange('month')}
            className={cn(
              'h-7 px-3 text-xs cursor-pointer rounded-xs',
              mode === 'month' ? 'bg-background shadow-xs font-semibold' : 'text-muted-foreground hover:bg-transparent'
            )}
          >
            This Month
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handlePresetChange('year')}
            className={cn(
              'h-7 px-3 text-xs cursor-pointer rounded-xs',
              mode === 'year' ? 'bg-background shadow-xs font-semibold' : 'text-muted-foreground hover:bg-transparent'
            )}
          >
            This Year
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handlePresetChange('custom')}
            className={cn(
              'h-7 px-3 text-xs cursor-pointer rounded-xs',
              mode === 'custom' ? 'bg-background shadow-xs font-semibold' : 'text-muted-foreground hover:bg-transparent'
            )}
          >
            Custom Range
          </Button>
        </div>

        {mode === 'custom' && (
          <div className="flex items-center gap-2 mt-2 md:mt-0 animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 py-1 text-xs w-32 border-muted focus:ring-1 cursor-pointer"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">to</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 py-1 text-xs w-32 border-muted focus:ring-1 cursor-pointer"
                min={customStart}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
