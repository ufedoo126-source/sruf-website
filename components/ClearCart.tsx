"use client";

import { useEffect } from "react";

// Empties the saved bag once an order is paid.
export default function ClearCart() {
  useEffect(() => {
    try {
      localStorage.removeItem("sruf-cart");
    } catch {
      // ignore
    }
  }, []);
  return null;
}