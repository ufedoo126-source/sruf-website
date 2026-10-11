export type Currency = "NGN" | "USD";

export type Category = {
  id: string;
  name: string;
  slug: string;
  blurb: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price_ngn: number;
  image_urls: string[];
  sizes: string[];
  tag: string | null;
  active: boolean;
};

// One line in the bag = one product in one size.
export type CartLine = {
  key: string; // product id + size, so Medium and Large are separate lines
  product: Product;
  size: string;
  qty: number;
};