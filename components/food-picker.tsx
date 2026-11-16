"use client";

import { useState } from "react";

import { FOOD_GROUPS } from "@/lib/food-items";
import { cn } from "@/lib/utils";

/** Tap a group (Vegetables, Fruits, Rice...) then tap a picture to pick the item. */
export function FoodPicker({
  onPick,
  className,
}: {
  onPick: (item: string, group: string) => void;
  className?: string;
}) {
  const [active, setActive] = useState(FOOD_GROUPS[0].name);
  const group = FOOD_GROUPS.find((g) => g.name === active) ?? FOOD_GROUPS[0];

  return (
    <div className={cn("space-y-3 rounded-lg bg-muted/60 p-3", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        Quick pick (tap a picture)
      </p>

      <div className="flex flex-wrap gap-1.5">
        {FOOD_GROUPS.map((g) => (
          <button
            key={g.name}
            type="button"
            onClick={() => setActive(g.name)}
            aria-pressed={g.name === active}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              g.name === active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent"
            )}
          >
            <span aria-hidden="true">{g.emoji}</span>
            {g.name}
          </button>
        ))}
      </div>

      <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
        {group.items.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onPick(item.name, group.name)}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card px-1 py-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
          >
            <span className="text-3xl leading-none" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="text-center text-xs font-medium leading-tight">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
