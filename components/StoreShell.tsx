"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { normalizeProduct } from "@/lib/product";
import type { CartLine, Category, Currency, Product } from "@/lib/types";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import MenuDrawer from "@/components/MenuDrawer";
import CartDrawer from "@/components/CartDrawer";
import CheckoutForm from "@/components/CheckoutForm";
import Footer from "@/components/Footer";

const CART_KEY = "sruf-cart";
const CURRENCY_KEY = "sruf-currency";

type StoreContextValue = {
  currency: Currency;
  filter: string;
  setFilter: (f: string) => void;
  goShop: (f: string) => void;
  addToCart: (product: Product, size: string, color: string | null, qty: number) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreShell");
  return ctx;
}

const lineKey = (productId: string, size: string, color: string | null) => `${productId}|${size}|${color ?? ""}`;

export default function StoreShell({
  categories,
  initialFilter = "all",
  children,
}: {
  categories: Category[];
  initialFilter?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [currency, setCurrency] = useState<Currency>("NGN");
  const [filter, setFilter] = useState<string>(initialFilter); // "all" or a category id
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Load the saved currency and bag once. Anything deleted or hidden since is dropped.
  useEffect(() => {
    async function init() {
      try {
        const c = localStorage.getItem(CURRENCY_KEY);
        if (c === "NGN" || c === "USD") setCurrency(c);
      } catch {
        // ignore
      }

      let saved: CartLine[] = [];
      try {
        const raw = localStorage.getItem(CART_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) saved = parsed;
      } catch {
        // ignore a broken saved bag
      }

      saved = saved.filter((l) => l && l.product && l.product.id && l.size && l.qty > 0);
      if (saved.length === 0) {
        setLoaded(true);
        return;
      }

      const ids = [...new Set(saved.map((l) => l.product.id))];
      const { data, error } = await supabase.from("products").select("*").in("id", ids).eq("active", true);
      const fresh = !error && data ? (data as Product[]).map(normalizeProduct) : null;

      const lines: CartLine[] = [];
      for (const l of saved) {
        const color = l.color ?? null;
        const product = fresh ? fresh.find((p) => p.id === l.product.id) : normalizeProduct(l.product);
        if (!product) continue;
        if (!product.sizes.includes(l.size)) continue;
        if (color === null ? product.colors.length > 0 : !product.colors.some((c) => c.name === color)) continue;
        lines.push({ key: lineKey(product.id, l.size, color), product, size: l.size, color, qty: l.qty });
      }
      setCart(lines);
      setLoaded(true);
    }
    init();
  }, []);

  // Save the bag whenever it changes
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, loaded]);

  // Lock page scroll while a drawer is open, and close with Escape
  useEffect(() => {
    document.body.style.overflow = menuOpen || cartOpen || checkoutOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setCartOpen(false);
        setCheckoutOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, cartOpen, checkoutOpen]);

  const count = cart.reduce((n, l) => n + l.qty, 0);
  const totalNGN = cart.reduce((n, l) => n + l.product.price_ngn * l.qty, 0);

  function changeCurrency(c: Currency) {
    setCurrency(c);
    try {
      localStorage.setItem(CURRENCY_KEY, c);
    } catch {
      // ignore
    }
  }

  function goShop(f: string) {
    setMenuOpen(false);
    if (pathname === "/") {
      setFilter(f);
      setTimeout(() => {
        document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    } else {
      router.push(f === "all" ? "/#shop" : `/?cat=${f}#shop`);
    }
  }

  function addToCart(product: Product, size: string, color: string | null, qty: number) {
    const key = lineKey(product.id, size, color);
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { key, product, size, color, qty }];
    });
    setCartOpen(true);
  }

  function changeQty(key: string, delta: number) {
    setCart((prev) =>
      prev.map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0)
    );
  }

  return (
    <StoreContext.Provider value={{ currency, filter, setFilter, goShop, addToCart }}>
      <AnnouncementBar currency={currency} onCurrency={changeCurrency} />
      <Header count={count} onMenu={() => setMenuOpen(true)} onCart={() => setCartOpen(true)} />
      <MenuDrawer
        open={menuOpen}
        categories={categories}
        onClose={() => setMenuOpen(false)}
        onSelect={goShop}
      />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={cart}
        currency={currency}
        totalNGN={totalNGN}
        onChange={changeQty}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />
      {checkoutOpen && cart.length > 0 && (
        <CheckoutForm
          lines={cart}
          currency={currency}
          totalNGN={totalNGN}
          onClose={() => setCheckoutOpen(false)}
        />
      )}

      <main id="top">{children}</main>
      <Footer />
    </StoreContext.Provider>
  );
}