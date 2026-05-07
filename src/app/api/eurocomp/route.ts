import { kv } from "@vercel/kv";
import type { NextRequest } from "next/server";
import type { Product } from "@/lib/types";
import { toCRC, DEFAULT_RATE } from "@/lib/pricing";

const PAGE_SIZE = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q        = (searchParams.get("q") ?? "").toLowerCase().trim();
  const category = (searchParams.get("category") ?? "").toLowerCase().trim();
  const status   = searchParams.get("status") ?? "all"; // all | visible | hidden
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  try {
    const [blobUrl, visibleIds, newIds, rate, syncedAt] = await Promise.all([
      kv.get<string>("eurocomp_blob_url"),
      kv.get<string[]>("eurocomp_visible"),
      kv.get<string[]>("eurocomp_new_ids"),
      kv.get<number>("exchange_rate"),
      kv.get<string>("synced_at"),
    ]);

    if (!blobUrl) {
      return Response.json({ products: [], total: 0, pages: 0, categories: [], cached: false });
    }

    const res = await fetch(blobUrl, { cache: "no-store" });
    const all: Product[] = await res.json();

    const visibleSet = new Set(visibleIds ?? []);
    const newSet     = new Set(newIds ?? []);
    const exchangeRate = rate ?? DEFAULT_RATE;

    let filtered = all;
    if (q)        filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.model ?? "").toLowerCase().includes(q));
    if (category) filtered = filtered.filter((p) => p.category.toLowerCase() === category);
    if (status === "visible") filtered = filtered.filter((p) => visibleSet.has(p.id));
    if (status === "hidden")  filtered = filtered.filter((p) => !visibleSet.has(p.id));

    const total      = filtered.length;
    const pages      = Math.ceil(total / PAGE_SIZE);
    const pageSlice  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const categories = Array.from(new Set(all.map((p) => p.category).filter(Boolean))).sort();

    const products = pageSlice.map((p) => ({
      ...p,
      priceCRC: toCRC(p.priceUsd, exchangeRate),
      visible:  visibleSet.has(p.id),
      isNew:    newSet.has(p.id),
    }));

    return Response.json({ products, total, pages, categories, exchangeRate, syncedAt, cached: true });
  } catch (err) {
    console.error("[eurocomp]", err instanceof Error ? err.message : err);
    return Response.json({ products: [], total: 0, pages: 0, categories: [], cached: false });
  }
}
