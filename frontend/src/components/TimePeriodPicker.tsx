import { memo, useMemo, useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

type PeriodMode = 'day' | 'month' | 'year';

export interface TimePeriod {
  startDate: string;
  endDate: string;
}

interface TimePeriodPickerProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

function TimePeriodPickerComponent({ value, onChange }: TimePeriodPickerProps) {
  const [mode, setMode] = useState<PeriodMode>('month');
  const [open, setOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  // For month mode
  const [monthValue, setMonthValue] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [yearValue, setYearValue] = useState<string>(() => String(new Date().getFullYear()));
  const [closingDay, setClosingDay] = useState<string>('1');
  // For year mode
  const [yearOnly, setYearOnly] = useState<string>(() => String(new Date().getFullYear()));

  // Reset selection each time the popover opens so the user must pick a fresh range
  useEffect(() => {
    if (open && mode === 'day') {
      setSelectedRange(undefined);
    }
  }, [open, mode]);

  const formattedLabel = useMemo(() => {
    if (mode === 'day') {
      if (selectedRange?.from && selectedRange?.to) {
        return `${format(selectedRange.from, 'dd/MM/yyyy')} - ${format(selectedRange.to, 'dd/MM/yyyy')}`;
      }
      return 'Selecionar intervalo (dia)';
    }
    if (mode === 'month' && value.startDate && value.endDate) {
      return `${monthValue}/${yearValue}`;
    }
    if (mode === 'year' && value.startDate) {
      return yearOnly;
    }
    return 'Selecionar período';
  }, [mode, selectedRange?.from, selectedRange?.to, value.startDate, value.endDate, monthValue, yearValue, yearOnly]);

  const applyDayRange = (range?: DateRange) => {
    const from = range?.from;
    const to = range?.to;
    if (!from || !to) return;
    if (from.getTime() === to.getTime()) return; // enforce two distinct clicks
    onChange({
      startDate: from.toISOString().split('T')[0],
      endDate: to.toISOString().split('T')[0],
    });
    setOpen(false);
  };

  const applyMonth = (month: string, year: string) => {
    const m = parseInt(month, 10) - 1;
    const y = parseInt(year, 10);
    const close = Math.max(1, Math.min(31, parseInt(closingDay, 10)));
    // Start at selected month's closing day
    // Ensure closing day doesn't exceed days in the month
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const actualCloseDay = Math.min(close, daysInMonth);
    const start = new Date(y, m, actualCloseDay);
    // End is the day before next month's closing day
    const nextMonthDays = new Date(y, m + 2, 0).getDate();
    const nextCloseDay = Math.min(close, nextMonthDays);
    const end = new Date(y, m + 1, nextCloseDay - 1);
    onChange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
    setOpen(false);
  };

  const applyYear = (year: string) => {
    const y = parseInt(year, 10);
    const start = new Date(y, 0, 1);
    const end = new Date(y, 11, 31);
    onChange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <div className="space-y-1">
          <Label>Período</Label>
          <Select value={mode} onValueChange={(v: PeriodMode) => setMode(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Data</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formattedLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
              {mode === 'day' && (
                <Calendar
                  mode="range"
                  selected={selectedRange}
                  onSelect={(r) => {
                    setSelectedRange(r);
                    if (r?.from && r?.to && r.from.getTime() !== r.to.getTime()) {
                      applyDayRange(r);
                    }
                  }}
                  className="rounded-md border-0"
                />
              )}
              {mode === 'month' && (
                <div className="p-3 w-[320px]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Mês</Label>
                      <Select value={monthValue} onValueChange={(v) => setMonthValue(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ano</Label>
                      <Select value={yearValue} onValueChange={(v) => setYearValue(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i)).map((y) => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Dia de fechamento</Label>
                      <Select value={closingDay} onValueChange={(v) => setClosingDay(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Dia" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button onClick={() => applyMonth(monthValue, yearValue)}>Aplicar</Button>
                  </div>
                </div>
              )}
              {mode === 'year' && (
                <div className="p-3 w-[220px]">
                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Select value={yearOnly} onValueChange={(v) => setYearOnly(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i)).map((y) => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button onClick={() => applyYear(yearOnly)}>Aplicar</Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

export default memo(TimePeriodPickerComponent);


