export type Currency = "NGN" | "USD";

export type Category = {
  id: string;
  name: string;
  slug: string;
  blurb: string | null;
  sort_order: number;
};

// One colour a design comes in, with its own photos.
export type ProductColor = {
  name: string;
  hex: string; // swatch colour, e.g. "#000000"
  images: string[];
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null; // the write-up
  details: string[]; // e.g. "Material: 100% cotton"
  price_ngn: number;
  image_urls: string[];
  sizes: string[];
  colors: ProductColor[];
  tag: string | null;
  active: boolean;
};

// One line in the bag = one product in one size and colour.
export type CartLine = {
  key: string; // product id + size + colour
  product: Product;
  size: string;
  color: string | null;
  qty: number;
};