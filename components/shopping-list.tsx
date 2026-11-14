"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { cn, monthLabel, prevMonth } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Item = {
  id: string;
  name: string;
  quantity: string | null;
  is_bought: boolean;
};

export function ShoppingList({ month }: { month: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("shopping_items")
      .select("id,name,quantity,is_bought")
      .eq("month", month)
      .order("is_bought", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setItems((data ?? []) as Item[]);
    setLoading(false);
  }, [month]);

  useEffect(() => {
    setInfo(null);
    load();
  }, [load]);

  const boughtCount = useMemo(
    () => items.filter((i) => i.is_bought).length,
    [items]
  );

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("shopping_items").insert({
      name: name.trim(),
      quantity: quantity.trim() || null,
      month,
    });
    if (error) setError(error.message);
    else {
      setName("");
      setQuantity("");
      await load();
    }
    setSaving(false);
  }

  async function toggle(item: Item, checked: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_bought: checked } : i))
    );
    const { error } = await supabase
      .from("shopping_items")
      .update({ is_bought: checked })
      .eq("id", item.id);
    if (error) {
      setError(error.message);
      load();
    }
  }

  async function remove(id: string) {
    const previous = items;
    setItems(items.filter((i) => i.id !== id));
    const { error } = await supabase
      .from("shopping_items")
      .delete()
      .eq("id", id);
    if (error) {
      setError(error.message);
      setItems(previous);
    }
  }

  async function copyFromLastMonth() {
    setError(null);
    setInfo(null);
    const { data, error } = await supabase
      .from("shopping_items")
      .select("name,quantity")
      .eq("month", prevMonth(month));
    if (error) {
      setError(error.message);
      return;
    }
    const existing = new Set(items.map((i) => i.name.trim().toLowerCase()));
    const fresh = (data ?? []).filter(
      (d) => !existing.has(d.name.trim().toLowerCase())
    );
    if (fresh.length === 0) {
      setInfo(`Nothing new to copy from ${monthLabel(prevMonth(month))}.`);
      return;
    }
    const { error: insertError } = await supabase
      .from("shopping_items")
      .insert(fresh.map((d) => ({ name: d.name, quantity: d.quantity, month })));
    if (insertError) setError(insertError.message);
    else {
      setInfo(`Copied ${fresh.length} item(s) from ${monthLabel(prevMonth(month))}.`);
      await load();
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Bought this month</CardDescription>
          <CardTitle className="text-3xl">
            {boughtCount} <span className="text-lg font-normal text-muted-foreground">of {items.length}</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add item to buy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addItem} className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="item-name">Item</Label>
              <Input
                id="item-name"
                placeholder="e.g. Rice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-qty">Quantity</Label>
              <Input
                id="item-qty"
                placeholder="e.g. 10 kg"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-3 sm:flex-row">
              <Button type="submit" disabled={saving} className="flex-1">
                <Plus /> {saving ? "Saving..." : "Add item"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={copyFromLastMonth}
                className="flex-1"
              >
                <Copy /> Copy from last month
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {info && <p className="text-sm text-muted-foreground">{info}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shopping list</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing on the list yet. Add items above.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <Checkbox
                    id={`item-${i.id}`}
                    checked={i.is_bought}
                    onCheckedChange={(c) => toggle(i, c === true)}
                  />
                  <label
                    htmlFor={`item-${i.id}`}
                    className={cn(
                      "min-w-0 flex-1 cursor-pointer",
                      i.is_bought && "text-muted-foreground line-through"
                    )}
                  >
                    <span className="font-medium">{i.name}</span>
                    {i.quantity && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {i.quantity}
                      </span>
                    )}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${i.name}`}
                    onClick={() => remove(i.id)}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
