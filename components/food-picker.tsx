"use client";

import { useState } from "react";

import { FOOD_GROUPS } from "@/lib/food-items";
import { cn } from "@/lib/utils";

/** Tap a group (Vegetables, Fruits, Rice...) then tap an item to pick it. */
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
    <div className={cn("space-y-2 rounded-lg bg-muted/60 p-3", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        Quick pick (tap an item)
      </p>

      <div className="flex flex-wrap gap-1.5">
        {FOOD_GROUPS.map((g) => (
          <button
            key={g.name}
            type="button"
            onClick={() => setActive(g.name)}
            aria-pressed={g.name === active}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              g.name === active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent"
            )}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
        {group.items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPick(item, group.name)}
            className="rounded-md border border-border bg-card px-2.5 py-1 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
