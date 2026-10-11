"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/admin";
import type { Category } from "@/lib/types";

const inputClass = "w-full border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-white";

export default function CategoriesAdmin() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", blurb: "", sort_order: 0 });

  async function load() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) setMsg(error.message);
    setItems((data ?? []) as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      slug: slugify(name),
      blurb: blurb.trim() || null,
      sort_order: items.length + 1,
    });
    if (error) {
      setMsg(error.message.includes("duplicate") ? "A category with that name already exists." : error.message);
      return;
    }
    setName("");
    setBlurb("");
    load();
  }

  function startEdit(c: Category) {
    setEditId(c.id);
    setDraft({ name: c.name, blurb: c.blurb ?? "", sort_order: c.sort_order });
  }

  async function saveEdit(id: string) {
    setMsg("");
    const { error } = await supabase
      .from("categories")
      .update({
        name: draft.name.trim(),
        blurb: draft.blurb.trim() || null,
        sort_order: Number(draft.sort_order) || 0,
      })
      .eq("id", id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setEditId(null);
    load();
  }

  async function remove(c: Category) {
    if (!window.confirm(`Delete "${c.name}"? Products in it will stay but have no category.`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) setMsg(error.message);
    load();
  }

  return (
    <div>
      <h1 className="font-display mb-6 text-5xl">Categories</h1>

      {msg && <p className="mb-4 text-sm text-red-400">{msg}</p>}

      <form onSubmit={add} className="mb-10 grid gap-3 border border-line bg-surface p-4 md:grid-cols-[1fr_2fr_auto]">
        <input
          required
          placeholder="Category name (e.g. Joggers)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Short line under the name (optional)"
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          className={inputClass}
        />
        <button type="submit" className="btn-primary btn-sm">
          Add category
        </button>
      </form>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted">No categories yet.</p>
      ) : (
        <ul className="border border-line">
          {items.map((c) => (
            <li key={c.id} className="border-b border-line p-4 last:border-b-0">
              {editId === c.id ? (
                <div className="grid gap-3 md:grid-cols-[1fr_2fr_90px_auto]">
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    value={draft.blurb}
                    onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
                    className={inputClass}
                    aria-label="Order"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(c.id)} className="btn-primary btn-sm">
                      Save
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-outline btn-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-muted text-sm">
                      {c.blurb || "No description"} · position {c.sort_order}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(c)} className="btn-outline btn-sm">
                      Edit
                    </button>
                    <button onClick={() => remove(c)} className="btn-outline btn-sm">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-muted mt-4 text-xs">
        Position decides the order in the menu and tiles (1 appears first).
      </p>
    </div>
  );
}