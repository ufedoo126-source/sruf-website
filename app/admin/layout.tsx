"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Status = "loading" | "signed-out" | "not-admin" | "ok";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function check() {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setStatus("signed-out");
      return;
    }
    // is_admin() is the database function we created in the SQL step
    const { data } = await supabase.rpc("is_admin");
    setStatus(data === true ? "ok" : "not-admin");
  }

  useEffect(() => {
    check();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    await check();
    setBusy(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setPassword("");
    setStatus("signed-out");
  }

  if (status === "loading") {
    return <div className="text-muted p-10">Loading…</div>;
  }

  if (status === "signed-out") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form onSubmit={login} className="w-full max-w-sm border border-line bg-surface p-8">
          <h1 className="font-display mb-6 text-4xl">SRUF Admin</h1>
          <label className="text-muted mb-1 block text-xs uppercase tracking-[0.2em]">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full border border-line bg-surface-2 px-4 py-3 outline-none focus:border-white"
          />
          <label className="text-muted mb-1 block text-xs uppercase tracking-[0.2em]">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full border border-line bg-surface-2 px-4 py-3 outline-none focus:border-white"
          />
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  if (status === "not-admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p>This account is not an admin.</p>
        <p className="text-muted max-w-sm text-sm">
          Its email must be listed in the admins table in Supabase.
        </p>
        <button onClick={logout} className="btn-outline">
          Sign out
        </button>
      </div>
    );
  }

  const links = [
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/categories", label: "Categories" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-3xl tracking-[0.14em]">SRUF</span>
            <nav className="flex gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                    pathname.startsWith(l.href) ? "bg-brand text-white" : "text-muted hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.18em]">
            <Link href="/" target="_blank" className="text-muted hover:text-white">
              View site
            </Link>
            <button onClick={logout} className="text-muted hover:text-white">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}