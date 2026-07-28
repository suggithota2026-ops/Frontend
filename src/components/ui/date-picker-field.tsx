import { useMemo, useState } from "react";
import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerFieldProps = {
  id?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string; // YYYY-MM-DD
  className?: string;
};

type PanelMode = "days" | "months" | "years";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const parseValue = (value?: string) => {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export function DatePickerField({
  id,
  value,
  onChange,
  placeholder = "Select date",
  min,
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>("days");
  const selected = useMemo(() => parseValue(value), [value]);
  const minDate = useMemo(() => parseValue(min), [min]);
  const [viewMonth, setViewMonth] = useState(() => selected || new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    });
  }, [viewMonth]);

  const monthOptions = useMemo(() => {
    const year = viewMonth.getFullYear();
    return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  }, [viewMonth]);

  const yearOptions = useMemo(() => {
    const currentYear = viewMonth.getFullYear();
    const startYear = currentYear - (currentYear % 12);
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  }, [viewMonth]);

  const headerLabel = useMemo(() => {
    if (panelMode === "years") {
      return `${yearOptions[0]} – ${yearOptions[yearOptions.length - 1]}`;
    }
    if (panelMode === "months") {
      return String(viewMonth.getFullYear());
    }
    return format(viewMonth, "MMMM, yyyy");
  }, [panelMode, viewMonth, yearOptions]);

  const selectedYear = (selected || viewMonth).getFullYear();
  const selectedMonth = (selected || viewMonth).getMonth();

  const handleHeaderClick = () => {
    if (panelMode === "days") setPanelMode("months");
    else if (panelMode === "months") setPanelMode("years");
  };

  const handleStepUp = () => {
    if (panelMode === "days") setViewMonth((m) => addMonths(m, 1));
    else if (panelMode === "months") setViewMonth((m) => addYears(m, 1));
    else setViewMonth((m) => addYears(m, 12));
  };

  const handleStepDown = () => {
    if (panelMode === "days") setViewMonth((m) => subMonths(m, 1));
    else if (panelMode === "months") setViewMonth((m) => subYears(m, 1));
    else setViewMonth((m) => subYears(m, 12));
  };

  const handleDayClick = (day: Date) => {
    if (minDate && isBefore(day, minDate) && !isSameDay(day, minDate)) return;
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  };

  const clearDate = () => {
    onChange("");
    setPanelMode("days");
  };

  const goToday = () => {
    const today = new Date();
    if (minDate && isBefore(today, minDate) && !isSameDay(today, minDate)) {
      setViewMonth(today);
      setPanelMode("days");
      return;
    }
    setViewMonth(today);
    setPanelMode("days");
    onChange(format(today, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setViewMonth(selected || new Date());
          setPanelMode("days");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-10 w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {selected ? format(selected, "dd-MM-yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] overflow-hidden rounded-lg border border-slate-200 bg-white p-0 shadow-lg"
        align="start"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          {panelMode === "days" ? (
            <button
              type="button"
              className="flex items-center gap-1 rounded px-1.5 py-1 text-[13px] font-medium text-slate-800 hover:bg-slate-100"
              onClick={handleHeaderClick}
            >
              <span className="text-[#1a73e8]">{format(viewMonth, "MMMM")}</span>
              <span>, {viewMonth.getFullYear()}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1 rounded px-1.5 py-1 text-[13px] font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-60"
              onClick={handleHeaderClick}
              disabled={panelMode === "years"}
            >
              {headerLabel}
              {panelMode !== "years" && (
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              )}
            </button>
          )}
          <div className="flex flex-col">
            <button
              type="button"
              className="flex h-4 w-6 items-center justify-center text-slate-600 hover:text-slate-900"
              onClick={handleStepUp}
              aria-label="Next"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="flex h-4 w-6 items-center justify-center text-slate-600 hover:text-slate-900"
              onClick={handleStepDown}
              aria-label="Previous"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {panelMode === "years" ? (
          <div className="grid grid-cols-3 gap-1 p-3">
            {yearOptions.map((year) => {
              const isSelected = year === selectedYear;
              const isViewing = year === viewMonth.getFullYear();
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    setViewMonth(new Date(year, viewMonth.getMonth(), 1));
                    setPanelMode("months");
                  }}
                  className={cn(
                    "rounded px-2 py-2 text-xs font-medium",
                    isSelected
                      ? "bg-[#1a73e8] text-white ring-2 ring-slate-900"
                      : isViewing
                        ? "bg-[#e8f0fe] text-slate-800"
                        : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {year}
                </button>
              );
            })}
          </div>
        ) : panelMode === "months" ? (
          <div className="grid grid-cols-3 gap-1 p-3">
            {monthOptions.map((month) => {
              const isSelected =
                month.getMonth() === selectedMonth &&
                month.getFullYear() === selectedYear;
              const isViewing =
                month.getMonth() === viewMonth.getMonth() &&
                month.getFullYear() === viewMonth.getFullYear();
              return (
                <button
                  key={month.toISOString()}
                  type="button"
                  onClick={() => {
                    setViewMonth(month);
                    setPanelMode("days");
                  }}
                  className={cn(
                    "rounded px-2 py-2 text-xs font-medium",
                    isSelected
                      ? "bg-[#1a73e8] text-white ring-2 ring-slate-900"
                      : isViewing
                        ? "bg-[#e8f0fe] text-slate-800"
                        : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {format(month, "MMM")}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 px-2 pt-2 text-center text-[11px] font-medium text-slate-500">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-0.5 px-2 pb-2">
              {days.map((day) => {
                const inMonth = isSameMonth(day, viewMonth);
                const isSelected = selected ? isSameDay(day, selected) : false;
                const today = isToday(day);
                const disabled =
                  !!minDate && isBefore(day, minDate) && !isSameDay(day, minDate);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "mx-auto flex h-8 w-8 items-center justify-center rounded text-[13px] transition-colors",
                      disabled && "cursor-not-allowed opacity-30",
                      !inMonth && !disabled && "text-slate-300",
                      inMonth && !isSelected && !disabled && "text-slate-800 hover:bg-slate-100",
                      isSelected &&
                        "bg-[#1a73e8] font-medium text-white hover:bg-[#1557b0] ring-2 ring-slate-900 ring-offset-0",
                      today && !isSelected && "font-semibold text-[#1a73e8]"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
          <button
            type="button"
            onClick={clearDate}
            className="text-[13px] font-medium text-[#1a73e8] hover:underline"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={goToday}
            className="text-[13px] font-medium text-[#1a73e8] hover:underline"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
