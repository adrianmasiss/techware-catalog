"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/types";

interface EurocompProduct extends Product {
  priceCRC: string;
  visible: boolean;
  isNew: boolean;
}

interface ApiResponse {
  products: EurocompProduct[];
  total: number;
  pages: number;
  categories: string[];
  exchangeRate: number;
  syncedAt: string | null;
  cached: boolean;
}

function Toggle({ checked, onChange, loading }: { checked: boolean; onChange: () => void; loading: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ${checked ? "bg-accent" : "bg-white/10"} ${loading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );
}

export default function EurocompManager() {
  const [q, setQ]               = useState("");
  const [debouncedQ, setDQ]     = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus]     = useState("all");
  const [page, setPage]         = useState(1);
  const [data, setData]         = useState<ApiResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [syncing, setSyncing]   = useState(false);
  const [pendingIds, setPending] = useState<Set<string>>(new Set());
  const [rate, setRate]         = useState<number | null>(null);
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput]     = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDQ(q); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [category, status]);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (debouncedQ) params.set("q", debouncedQ);
    if (category)   params.set("category", category);
    if (status !== "all") params.set("status", status);

    fetch(`/api/eurocomp?${params}`)
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        setData(d);
        if (d.exchangeRate) setRate(d.exchangeRate);
      })
      .finally(() => setLoading(false));
  }, [page, debouncedQ, category, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res  = await fetch("/api/sync", { method: "POST" });
      const json = await res.json();
      if (json.ok) fetchData();
      else alert(json.error ?? "Error al sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  const handleToggle = async (product: EurocompProduct) => {
    const newVisible = !product.visible;
    setPending((prev) => new Set(prev).add(product.id));

    // Optimistic update
    setData((prev) => prev ? {
      ...prev,
      products: prev.products.map((p) =>
        p.id === product.id ? { ...p, visible: newVisible } : p
      ),
    } : prev);

    try {
      await fetch("/api/visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, visible: newVisible }),
      });
    } catch {
      // Revert on error
      setData((prev) => prev ? {
        ...prev,
        products: prev.products.map((p) =>
          p.id === product.id ? { ...p, visible: product.visible } : p
        ),
      } : prev);
    } finally {
      setPending((prev) => { const s = new Set(prev); s.delete(product.id); return s; });
    }
  };

  const handleSaveRate = async () => {
    const newRate = parseFloat(rateInput);
    if (isNaN(newRate) || newRate < 100) return;
    await fetch("/api/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rate: newRate }),
    });
    setRate(newRate);
    setEditingRate(false);
    fetchData();
  };

  const syncedDate = data?.syncedAt
    ? new Date(data.syncedAt).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" })
    : null;

  const visibleCount = data?.products.filter((p) => p.visible).length ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Sync info */}
        <div className="flex items-center gap-3 glass-panel px-4 py-2.5 rounded-xl border border-white/5 text-xs text-white/50">
          {syncedDate ? (
            <span>Última sync: <span className="text-white/70 font-medium">{syncedDate}</span></span>
          ) : (
            <span className="text-white/30">Sin sincronizar</span>
          )}
          {data?.cached && (
            <span className="text-white/30">·</span>
          )}
          {data?.cached && (
            <span>{(data.total ?? 0).toLocaleString()} productos</span>
          )}
        </div>

        {/* Exchange rate */}
        <div className="flex items-center gap-2 glass-panel px-4 py-2.5 rounded-xl border border-white/5">
          <span className="text-xs text-white/40">USD/CRC</span>
          {editingRate ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-20 bg-white/5 border border-accent/30 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-accent"
                onKeyDown={(e) => e.key === "Enter" && handleSaveRate()}
                autoFocus
              />
              <button onClick={handleSaveRate} className="text-accent text-xs font-bold hover:text-accent/80">✓</button>
              <button onClick={() => setEditingRate(false)} className="text-white/30 text-xs hover:text-white">✕</button>
            </div>
          ) : (
            <button
              onClick={() => { setEditingRate(true); setRateInput(String(rate ?? 520)); }}
              className="text-xs font-bold text-white hover:text-accent transition-colors"
            >
              ₡{(rate ?? 520).toLocaleString("es-CR")}
              <span className="text-white/30 ml-1 text-[0.6rem]">editar</span>
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-xl border border-accent/40 text-accent hover:bg-accent/10 transition-all disabled:opacity-40"
          >
            {syncing ? (
              <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Sincronizando...</>
            ) : (
              <><svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>Sincronizar</>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="flex-1 min-w-[200px] bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/60 transition-colors"
          placeholder="Buscar por nombre, código o categoría..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#0a0a0b] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent/60 transition-colors appearance-none cursor-pointer"
        >
          <option value="">Todas las categorías</option>
          {(data?.categories ?? []).map((c) => (
            <option key={c} value={c.toLowerCase()}>{c}</option>
          ))}
        </select>
        <div className="flex rounded-xl border border-white/10 overflow-hidden text-xs font-bold uppercase tracking-widest">
          {(["all", "visible", "hidden"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2.5 transition-colors ${status === s ? "bg-accent text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              {s === "all" ? "Todos" : s === "visible" ? "Visibles" : "Ocultos"}
            </button>
          ))}
        </div>
      </div>

      {/* No sync yet */}
      {!data?.cached && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-20">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-9 h-9 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg mb-1">Catálogo no sincronizado</p>
            <p className="text-white/40 text-sm mb-5">Sincronizá para importar los productos de Eurocomp</p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-sm font-bold tracking-widest uppercase px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-alt text-white shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {syncing ? "Sincronizando..." : "↻ Sincronizar ahora"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {data?.cached && (
        <>
          <div className="glass-panel overflow-hidden flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-40 text-white/30 text-sm">Cargando...</div>
            ) : data.products.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-white/30 text-sm">Sin resultados</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      {["Imagen", "Producto", "Categoría", "Precio USD", "Precio ₡ + IVA", "Mostrar"].map((h) => (
                        <th key={h} className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-white/30 px-4 py-4 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {data.products.map((p, i) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.01 }}
                          className={`border-b border-white/5 last:border-0 transition-colors ${p.visible ? "hover:bg-accent/[0.03]" : "hover:bg-white/[0.02]"}`}
                        >
                          <td className="px-4 py-3">
                            {p.image ? (
                              <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-contain bg-white/5 p-1 border border-white/5" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/10 text-[0.5rem] font-bold uppercase">Sin img</div>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-[260px]">
                            <div className="flex items-center gap-2 mb-1">
                              {p.isNew && (
                                <span className="text-[0.55rem] font-black uppercase tracking-widest bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full">Nuevo</span>
                              )}
                            </div>
                            <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{p.name}</p>
                            <p className="text-white/30 text-[0.6rem] font-mono mt-0.5">{p.model}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 whitespace-nowrap">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/50 text-sm font-mono whitespace-nowrap">
                            {p.price ? `$${p.price}` : "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-accent font-bold text-sm">{p.priceCRC || "—"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Toggle
                              checked={p.visible}
                              onChange={() => handleToggle(p)}
                              loading={pendingIds.has(p.id)}
                            />
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all"
              >← Anterior</button>
              <span className="text-xs text-white/30">
                Página <span className="text-white font-bold">{page}</span> de <span className="text-white font-bold">{data.pages}</span>
                <span className="ml-3 text-white/20">({data.total.toLocaleString()} total)</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page >= data.pages}
                className="text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all"
              >Siguiente →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
