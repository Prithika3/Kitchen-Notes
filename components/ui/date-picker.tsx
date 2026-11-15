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

const triggerClass =
  "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-base ring-offset-background transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm";

const popoverClass =
  "absolute left-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border bg-card p-3 text-card-foreground shadow-lg";

const navButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
        <CalendarDays className="h-4 w-4 text-primary" />
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
            <span className="text-sm font-semibold">{heading}</span>
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
                className="py-1 text-xs font-medium text-muted-foreground"
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
                    "flex h-9 w-full items-center justify-center rounded-md text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isToday && !isSelected && "border border-primary text-primary",
                    isSelected &&
                      "bg-primary font-semibold text-primary-foreground hover:bg-primary"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between border-t pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(today);
                setOpen(false);
              }}
              className="rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-accent"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
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
        <CalendarDays className="h-4 w-4 text-primary" />
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
            <span className="text-sm font-semibold">{year}</span>
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
                    "h-10 rounded-md text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isCurrent &&
                      !isSelected &&
                      "border border-primary text-primary",
                    isSelected &&
                      "bg-primary font-semibold text-primary-foreground hover:bg-primary"
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between border-t pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(thisMonth);
                setOpen(false);
              }}
              className="rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-accent"
            >
              This month
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
