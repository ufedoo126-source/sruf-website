import type { Product } from "./types";

// Makes sure optional fields are never missing, whatever the database sends back.
export function normalizeProduct(p: Product): Product {
  return {
    ...p,
    price_ngn: Number(p.price_ngn),
    image_urls: p.image_urls ?? [],
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    details: p.details ?? [],
  };
}

// The photo to show for a product, optionally for a chosen colour.
export function coverImage(p: Product, colorName?: string | null): string | null {
  if (colorName) {
    const c = p.colors.find((x) => x.name === colorName);
    if (c && c.images[0]) return c.images[0];
  }
  return p.image_urls[0] ?? p.colors[0]?.images[0] ?? null;
}

// A product is treated as sold out when its Tag says so.
export function isSoldOut(p: Product): boolean {
  return (p.tag ?? "").toLowerCase().includes("sold out");
}