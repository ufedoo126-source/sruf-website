import { supabase } from "@/lib/supabase";
import { normalizeProduct } from "@/lib/product";
import StoreShell from "@/components/StoreShell";
import HomeContent from "@/components/HomeContent";
import type { Category, Product } from "@/lib/types";

// Always fetch fresh data, so admin changes show up straight away.
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const sp = await searchParams;

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
  const products = ((prodRes.data ?? []) as Product[]).map(normalizeProduct);

  const initialFilter = sp.cat && categories.some((c) => c.id === sp.cat) ? sp.cat : "all";

  return (
    <StoreShell categories={categories} initialFilter={initialFilter}>
      <HomeContent categories={categories} products={products} />
    </StoreShell>
  );
}