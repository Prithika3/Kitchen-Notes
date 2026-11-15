"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn, monthLabel, todayISO } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const pad = (n: number) => String(n).padStart(2, "0");

function parseISO(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function usePopover() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
}

// Pink theme for the pickers
const triggerClass =
  "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-pink-300 bg-white px-3 py-2 text-left text-base font-medium text-slate-900 ring-offset-background transition-colors hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 md:text-sm";

const popoverClass =
  "absolute left-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-pink-200 bg-white p-3 text-slate-900 shadow-lg shadow-pink-200/60";

const navButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-md text-pink-600 transition-colors hover:bg-pink-100 hover:text-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400";

const cellBase =
  "flex w-full items-center justify-center rounded-md text-sm font-medium text-slate-900 transition-colors hover:bg-pink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400";

const cellToday = "border border-pink-500 font-semibold text-pink-700";

const cellSelected =
  "bg-pink-600 font-semibold text-white hover:bg-pink-600";

const footerLink =
  "rounded-md px-2 py-1 text-sm font-medium text-pink-600 hover:bg-pink-100";

const footerMuted =
  "rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-pink-50";

type PickerProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
};

/** Pretty calendar picker. value / onChange use "YYYY-MM-DD". */
export function DatePicker({ value, onChange, id, className }: PickerProps) {
  const { open, setOpen, ref } = usePopover();
  const selected = parseISO(value);
  const [view, setView] = React.useState({
    y: selected.getFullYear(),
    m: selected.getMonth(),
  });

  function toggle() {
    if (!open) setView({ y: selected.getFullYear(), m: selected.getMonth() });
    setOpen(!open);
  }

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  const lead = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const today = todayISO();
  const heading = new Date(view.y, view.m, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={triggerClass}
      >
        <span>
          {selected.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <CalendarDays className="h-4 w-4 text-pink-600" />
      </button>

      {open && (
        <div role="dialog" aria-label="Choose a date" className={popoverClass}>
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shift(-1)}
              className={navButtonClass}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-slate-900">{heading}</span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shift(1)}
              className={navButtonClass}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                className="py-1 text-xs font-semibold text-pink-600"
              >
                {d}
              </span>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <span key={`e${i}`} />;
              const iso = `${view.y}-${pad(view.m + 1)}-${pad(day)}`;
              const isSelected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={cn(
                    cellBase,
                    "h-9",
                    isToday && !isSelected && cellToday,
                    isSelected && cellSelected
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between border-t border-pink-100 pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(today);
                setOpen(false);
              }}
              className={footerLink}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={footerMuted}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Pretty month picker. value / onChange use "YYYY-MM". */
export function MonthPicker({ value, onChange, id, className }: PickerProps) {
  const { open, setOpen, ref } = usePopover();
  const [selYear, selMonth] = value.split("-").map(Number);
  const [year, setYear] = React.useState(selYear);

  function toggle() {
    if (!open) setYear(selYear);
    setOpen(!open);
  }

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        id={id}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(triggerClass, "w-auto min-w-[11rem]")}
      >
        <span>{monthLabel(value)}</span>
        <CalendarDays className="h-4 w-4 text-pink-600" />
      </button>

      {open && (
        <div role="dialog" aria-label="Choose a month" className={popoverClass}>
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous year"
              onClick={() => setYear((y) => y - 1)}
              className={navButtonClass}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-slate-900">{year}</span>
            <button
              type="button"
              aria-label="Next year"
              onClick={() => setYear((y) => y + 1)}
              className={navButtonClass}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((name, i) => {
              const iso = `${year}-${pad(i + 1)}`;
              const isSelected = year === selYear && i + 1 === selMonth;
              const isCurrent = iso === thisMonth;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={cn(
                    cellBase,
                    "h-10",
                    isCurrent && !isSelected && cellToday,
                    isSelected && cellSelected
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between border-t border-pink-100 pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(thisMonth);
                setOpen(false);
              }}
              className={footerLink}
            >
              This month
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={footerMuted}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
