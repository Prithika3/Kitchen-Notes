"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

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

const DEFAULT_CATEGORY = "Other";

export function Expenses({ month }: { month: string }) {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Categories typed earlier (used as suggestions)
  const [savedCategories, setSavedCategories] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState(todayISO());
  const [updating, setUpdating] = useState(false);

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from("expenses").select("category");
    const unique = Array.from(
      new Set((data ?? []).map((d) => String(d.category).trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    setSavedCategories(unique);
  }, []);

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
    setEditingId(null);
    load();
  }, [load]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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
      category: category.trim() || DEFAULT_CATEGORY,
      spent_on: date,
    });
    if (error) setError(error.message);
    else {
      setTitle("");
      setAmount("");
      setCategory("");
      await Promise.all([load(), loadCategories()]);
    }
    setSaving(false);
  }

  function startEdit(i: Expense) {
    setError(null);
    setEditingId(i.id);
    setEditTitle(i.title);
    setEditAmount(String(i.amount));
    setEditCategory(i.category);
    setEditDate(i.spent_on);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const value = Number(editAmount);
    if (!editTitle.trim() || editAmount === "" || !(value >= 0)) return;
    setUpdating(true);
    setError(null);
    const { error } = await supabase
      .from("expenses")
      .update({
        title: editTitle.trim(),
        amount: value,
        category: editCategory.trim() || DEFAULT_CATEGORY,
        spent_on: editDate,
      })
      .eq("id", editingId);
    if (error) setError(error.message);
    else {
      setEditingId(null);
      await Promise.all([load(), loadCategories()]);
    }
    setUpdating(false);
  }

  async function remove(id: string) {
    const previous = items;
    setItems(items.filter((i) => i.id !== id));
    if (editingId === id) setEditingId(null);
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setItems(previous);
    } else {
      loadCategories();
    }
  }

  return (
    <div className="space-y-4">
      {/* Suggestions for the category boxes (your own earlier categories) */}
      <datalist id="category-options">
        {savedCategories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

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
              <Label htmlFor="exp-cat">Category (type your own)</Label>
              <Input
                id="exp-cat"
                list="category-options"
                placeholder="e.g. Vegetables, Milk, Gas"
                maxLength={40}
                autoComplete="off"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
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
              {items.map((i) =>
                editingId === i.id ? (
                  <li key={i.id} className="py-3">
                    <form
                      onSubmit={saveEdit}
                      className="grid gap-3 rounded-lg bg-muted/60 p-3 sm:grid-cols-2"
                    >
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`edit-title-${i.id}`}>
                          What did you buy?
                        </Label>
                        <Input
                          id={`edit-title-${i.id}`}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-amount-${i.id}`}>Amount</Label>
                        <Input
                          id={`edit-amount-${i.id}`}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-date-${i.id}`}>Date</Label>
                        <DatePicker
                          id={`edit-date-${i.id}`}
                          value={editDate}
                          onChange={setEditDate}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`edit-cat-${i.id}`}>Category</Label>
                        <Input
                          id={`edit-cat-${i.id}`}
                          list="category-options"
                          placeholder="e.g. Vegetables, Milk, Gas"
                          maxLength={40}
                          autoComplete="off"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 sm:col-span-2">
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={updating}
                        >
                          {updating ? "Saving..." : "Save changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={cancelEdit}
                          disabled={updating}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </li>
                ) : (
                  <li key={i.id} className="flex items-center gap-2 py-3">
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
                      aria-label={`Edit ${i.title}`}
                      onClick={() => startEdit(i)}
                    >
                      <Pencil className="text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${i.title}`}
                      onClick={() => remove(i.id)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </li>
                )
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
