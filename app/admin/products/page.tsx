"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SIZE_OPTIONS, resizeImage, slugify } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const inputClass = "w-full border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-white";
const labelClass = "text-muted mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em]";

function ProductForm({
  product,
  categories,
  onSaved,
  onCancel,
}: {
  product: Product | null;
  categories: Category[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(product ? String(product.price_ngn) : "");
  const [tag, setTag] = useState(product?.tag ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? ["S", "M", "L", "XL", "XXL"]);
  const [images, setImages] = useState<string[]>(product?.image_urls ?? []);
  const [active, setActive] = useState(product?.active ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleSize(s: string) {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const blob = await resizeImage(file);
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      } catch (err) {
        setError("Upload failed: " + (err instanceof Error ? err.message : "unknown error"));
      }
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function makeMain(url: string) {
    setImages((prev) => [url, ...prev.filter((u) => u !== url)]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Enter a product name.");
    if (price === "" || Number(price) < 0) return setError("Enter a valid price in naira.");
    if (sizes.length === 0) return setError("Pick at least one size (or One Size).");

    setSaving(true);
    const payload = {
      name: name.trim(),
      category_id: categoryId || null,
      price_ngn: Number(price),
      tag: tag.trim() || null,
      description: description.trim() || null,
      sizes: SIZE_OPTIONS.filter((s) => sizes.includes(s)),
      image_urls: images,
      active,
    };

    const { error: dbErr } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert({
          ...payload,
          slug: slugify(name) + "-" + Math.random().toString(36).slice(2, 6),
        });

    setSaving(false);
    if (dbErr) return setError(dbErr.message);
    onSaved();
  }

  return (
    <form onSubmit={save} className="mb-10 border border-line bg-surface p-6">
      <h2 className="font-display mb-6 text-3xl">{product ? "Edit product" : "New product"}</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Price (₦)</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Tag (optional, e.g. New, Sold out)</label>
          <input value={tag} onChange={(e) => setTag(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Description (optional)</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="mt-4">
        <label className={labelClass}>Available sizes</label>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => toggleSize(s)}
              className={`px-4 py-2 text-sm font-semibold ${
                sizes.includes(s) ? "bg-brand text-white" : "border border-line text-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-muted mt-2 text-xs">For caps or bags, pick only “One Size”.</p>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Photos (the first one is the main photo)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFiles(e.target.files)}
          className="text-muted text-sm"
        />
        {uploading && <p className="text-muted mt-2 text-sm">Uploading…</p>}
        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={url} className="w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-[4/5] w-24 object-cover" />
                <div className="mt-1 flex justify-between text-[11px]">
                  {i === 0 ? (
                    <span className="text-brand-light">Main</span>
                  ) : (
                    <button type="button" onClick={() => makeMain(url)} className="text-muted hover:text-white">
                      Make main
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                    className="text-muted hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="mt-6 flex items-center gap-3 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Show this product on the shop
      </label>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving ? "Saving…" : "Save product"}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  async function load() {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order").order("name"),
    ]);
    if (p.error) setMsg(p.error.message);
    setProducts(((p.data ?? []) as Product[]).map((x) => ({ ...x, price_ngn: Number(x.price_ngn) })));
    setCategories((c.data ?? []) as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(p: Product) {
    const { error } = await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    if (error) setMsg(error.message);
    load();
  }

  async function remove(p: Product) {
    if (!window.confirm(`Delete "${p.name}" for good?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) setMsg(error.message);
    load();
  }

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "No category";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-5xl">Products</h1>
        {!editing && (
          <button onClick={() => setEditing("new")} className="btn-primary">
            + New product
          </button>
        )}
      </div>

      {msg && <p className="mb-4 text-sm text-red-400">{msg}</p>}

      {editing && (
        <ProductForm
          key={editing === "new" ? "new" : editing.id}
          product={editing === "new" ? null : editing}
          categories={categories}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted">No products yet. Click “New product”.</p>
      ) : (
        <ul className="border border-line">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 border-b border-line p-4 last:border-b-0"
            >
              <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden bg-surface-2">
                {p.image_urls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_urls[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-xl text-white/10">SRUF</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {p.name}
                  {!p.active && <span className="text-muted ml-2 text-xs uppercase">Hidden</span>}
                </p>
                <p className="text-muted text-sm">
                  {categoryName(p.category_id)} · {formatPrice(p.price_ngn, "NGN")} · {p.sizes.join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(p)} className="btn-outline btn-sm">
                  Edit
                </button>
                <button onClick={() => toggleActive(p)} className="btn-outline btn-sm">
                  {p.active ? "Hide" : "Show"}
                </button>
                <button onClick={() => remove(p)} className="btn-outline btn-sm">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}