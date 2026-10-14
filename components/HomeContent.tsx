"use client";

import { useStore } from "@/components/StoreShell";
import Hero from "@/components/Hero";
import CategoryTiles from "@/components/CategoryTiles";
import ProductGrid from "@/components/ProductGrid";
import AboutSection from "@/components/AboutSection";
import type { Category, Product } from "@/lib/types";

export default function HomeContent({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const { currency, filter, setFilter, goShop } = useStore();

  const visible = filter === "all" ? products : products.filter((p) => p.category_id === filter);

  return (
    <>
      <Hero onExplore={() => goShop("all")} />
      <CategoryTiles categories={categories} onSelect={goShop} />
      <ProductGrid
        products={visible}
        categories={categories}
        filter={filter}
        currency={currency}
        onFilter={setFilter}
      />
      <AboutSection />
    </>
  );
}