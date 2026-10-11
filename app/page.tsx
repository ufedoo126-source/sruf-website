import { supabase } from "@/lib/supabase";
import Shop from "@/components/Shop";
import type { Category, Product } from "@/lib/types";

// Always fetch fresh data, so admin changes show up straight away.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [catRes, prodRes] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .order("created_at", { ascending: false }),
  ]);

  const categories = (catRes.data ?? []) as Category[];
  const products = ((prodRes.data ?? []) as Product[]).map((p) => ({
    ...p,
    price_ngn: Number(p.price_ngn),
  }));

  return <Shop categories={categories} products={products} />;
}