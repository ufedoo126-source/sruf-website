import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { normalizeProduct } from "@/lib/product";
import StoreShell from "@/components/StoreShell";
import ProductView from "@/components/ProductView";
import type { Category, Product } from "@/lib/types";

// Always fetch fresh data, so admin changes show up straight away.
export const dynamic = "force-dynamic";

async function getProduct(slug: string): Promise<Product | null> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data ? normalizeProduct(data as Product) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found — SRUF" };

  const image = product.image_urls[0] ?? product.colors[0]?.images[0];
  const description = product.description
    ? product.description.replace(/\s+/g, " ").slice(0, 160)
    : `${product.name} from SRUF.`;

  return {
    title: `${product.name} — SRUF`,
    description,
    openGraph: {
      title: `${product.name} — SRUF`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const catRes = await supabase.from("categories").select("*").order("sort_order").order("name");
  const categories = (catRes.data ?? []) as Category[];
  const category = categories.find((c) => c.id === product.category_id) ?? null;

  let related: Product[] = [];
  if (product.category_id) {
    const relRes = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .order("sort_order")
      .limit(4);
    related = ((relRes.data ?? []) as Product[]).map(normalizeProduct);
  }

  return (
    <StoreShell categories={categories}>
      <ProductView product={product} category={category} related={related} />
    </StoreShell>
  );
}