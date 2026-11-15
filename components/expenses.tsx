"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { formatMoney, monthRange, todayISO } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  spent_on: string;
};

const CATEGORIES = [
  "Groceries",
  "Vegetables & Fruits",
  "Milk & Dairy",
  "Spices",
  "Oil & Rice",
  "Gas",
  "Other",
];

export function Expenses({ month }: { month: string }) {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { start, end } = monthRange(month);
    const { data, error } = await supabase
      .from("expenses")
      .select("id,title,amount,category,spent_on")
      .gte("spent_on", start)
      .lt("spent_on", end)
      .order("spent_on", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else
      setItems(
        (data ?? []).map((d) => ({ ...d, amount: Number(d.amount) })) as Expense[]
      );
    setLoading(false);
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.amount, 0),
    [items]
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => map.set(i.category, (map.get(i.category) ?? 0) + i.amount));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  async function addExpense(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!title.trim() || !(value >= 0) || amount === "") return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("expenses").insert({
      title: title.trim(),
      amount: value,
      category,
      spent_on: date,
    });
    if (error) setError(error.message);
    else {
      setTitle("");
      setAmount("");
      await load();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    const previous = items;
    setItems(items.filter((i) => i.id !== id));
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setItems(previous);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total spent this month</CardDescription>
          <CardTitle className="text-3xl">{formatMoney(total)}</CardTitle>
        </CardHeader>
        {byCategory.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {byCategory.map(([cat, sum]) => (
                <span
                  key={cat}
                  className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  {cat}: {formatMoney(sum)}
                </span>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addExpense} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="exp-title">What did you buy?</Label>
              <Input
                id="exp-title"
                placeholder="e.g. Vegetables"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-amount">Amount</Label>
              <Input
                id="exp-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-date">Date</Label>
              <DatePicker id="exp-date" value={date} onChange={setDate} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="exp-cat">Category</Label>
              <select
                id="exp-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="sm:col-span-2" disabled={saving}>
              <Plus /> {saving ? "Saving..." : "Add expense"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No expenses for this month yet.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{i.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.category} · {i.spent_on}
                    </p>
                  </div>
                  <span className="font-semibold">{formatMoney(i.amount)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${i.title}`}
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
