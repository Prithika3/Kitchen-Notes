"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  Eye,
  Lock,
  LogOut,
  ShoppingBasket,
  Wallet,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { currentMonth, monthLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Expenses } from "@/components/expenses";
import { ShoppingList } from "@/components/shopping-list";

type Role = "loading" | "editor" | "viewer" | "none";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role>("loading");
  const [email, setEmail] = useState("");
  const [month, setMonth] = useState(currentMonth());

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session) {
        router.replace("/login");
        return;
      }
      setEmail(session.user.email ?? "");
      setReady(true);

      const { data: roleRow } = await supabase
        .from("app_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (roleRow?.role === "editor") setRole("editor");
      else if (roleRow?.role === "viewer") setRole("viewer");
      else setRole("none");
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

  if (!ready || role === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (role === "none") {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle>Waiting for access</CardTitle>
            <CardDescription>
              {email} is signed in, but does not have access yet. Please ask the
              owner to give you access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={signOut}>
              <LogOut /> Sign out
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const canEdit = role === "editor";

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
        <div className="flex items-center gap-2">
          {!canEdit && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Eye className="h-3.5 w-3.5" /> View only
            </span>
          )}
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </div>
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
          <Expenses month={month} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="shopping">
          <ShoppingList month={month} canEdit={canEdit} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
