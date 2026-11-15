"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, LogOut, ShoppingBasket, Wallet } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { currentMonth, monthLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Expenses } from "@/components/expenses";
import { ShoppingList } from "@/components/shopping-list";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [month, setMonth] = useState(currentMonth());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
      else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-4 pb-16">
      <header className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Kitchen Notes</h1>
            <p className="text-sm text-muted-foreground">{monthLabel(month)}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut /> Sign out
        </Button>
      </header>

      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="month" className="text-sm font-medium">
          Month
        </label>
        <MonthPicker id="month" value={month} onChange={setMonth} />
      </div>

      <Tabs defaultValue="expenses">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">
            <Wallet className="h-4 w-4" /> Expenses
          </TabsTrigger>
          <TabsTrigger value="shopping">
            <ShoppingBasket className="h-4 w-4" /> Monthly list
          </TabsTrigger>
        </TabsList>
        <TabsContent value="expenses">
          <Expenses month={month} />
        </TabsContent>
        <TabsContent value="shopping">
          <ShoppingList month={month} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
