"use client";

import { useEffect, useState } from "react";
import type { CartLine, Category, Currency, Product } from "@/lib/types";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import MenuDrawer from "@/components/MenuDrawer";
import CartDrawer from "@/components/CartDrawer";
import CheckoutForm from "@/components/CheckoutForm";
import SizePicker from "@/components/SizePicker";
import Hero from "@/components/Hero";
import CategoryTiles from "@/components/CategoryTiles";
import ProductGrid from "@/components/ProductGrid";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

type Props = {
  categories: Category[];
  products: Product[];
};

const CART_KEY = "sruf-cart";

export default function Shop({ categories, products }: Props) {
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [filter, setFilter] = useState<string>("all"); // "all" or a category id
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [picking, setPicking] = useState<Product | null>(null);

  // Load the saved bag once. Drop anything that was deleted or hidden since.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as CartLine[];
        const fresh: CartLine[] = [];
        for (const l of saved) {
          const p = products.find((x) => x.id === l.product.id);
          if (p && p.sizes.includes(l.size)) fresh.push({ ...l, product: p });
        }
        setCart(fresh);
      }
    } catch {
      // ignore a broken saved bag
    }
    setLoaded(true);
  }, [products]);

  // Save the bag whenever it changes
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, loaded]);

  // Lock page scroll while a drawer/popup is open, and close with Escape
  useEffect(() => {
    document.body.style.overflow = menuOpen || cartOpen || checkoutOpen || picking ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setCartOpen(false);
        setCheckoutOpen(false);
        setPicking(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, cartOpen, checkoutOpen, picking]);

  const visible = filter === "all" ? products : products.filter((p) => p.category_id === filter);

  const count = cart.reduce((n, l) => n + l.qty, 0);
  const totalNGN = cart.reduce((n, l) => n + l.product.price_ngn * l.qty, 0);

  function goShop(f: string) {
    setFilter(f);
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }

  function addToCart(product: Product, size: string, qty: number) {
    const key = `${product.id}|${size}`;
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { key, product, size, qty }];
    });
    setPicking(null);
    setCartOpen(true);
  }

  function changeQty(key: string, delta: number) {
    setCart((prev) =>
      prev.map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0)
    );
  }

  return (
    <main id="top">
      <AnnouncementBar currency={currency} onCurrency={setCurrency} />
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
      {picking && (
        <SizePicker
          key={picking.id}
          product={picking}
          currency={currency}
          onClose={() => setPicking(null)}
          onConfirm={(size, qty) => addToCart(picking, size, qty)}
        />
      )}
      {checkoutOpen && cart.length > 0 && (
        <CheckoutForm
          lines={cart}
          currency={currency}
          totalNGN={totalNGN}
          onClose={() => setCheckoutOpen(false)}
        />
      )}

      <Hero onExplore={() => goShop("all")} />
      <CategoryTiles categories={categories} onSelect={goShop} />
      <ProductGrid
        products={visible}
        categories={categories}
        filter={filter}
        currency={currency}
        onFilter={setFilter}
        onPick={setPicking}
      />
      <AboutSection />
      <Footer />
    </main>
  );
}