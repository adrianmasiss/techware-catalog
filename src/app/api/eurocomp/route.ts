import { kv } from "@vercel/kv";
import type { NextRequest } from "next/server";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 24;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q    = (searchParams.get("q") ?? "").toLowerCase().trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  let all: Product[] | null = null;
  try {
    all = await kv.get<Product[]>("eurocomp_cache");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }

  if (!Array.isArray(all)) {
    return Response.json({ products: [], total: 0, pages: 0, cached: false });
  }

  const filtered = q
    ? all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.model ?? "").toLowerCase().includes(q)
      )
    : all;

  const total = filtered.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const products = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return Response.json({ products, total, pages, cached: true });
}
