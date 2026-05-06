import { kv } from "@vercel/kv";
import { DEFAULT_PRODUCTS } from "@/lib/store";
import { toCRC, DEFAULT_RATE } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export async function GET() {
  try {
    const [blobUrl, visibleIds, rate] = await Promise.all([
      kv.get<string>("eurocomp_blob_url"),
      kv.get<string[]>("eurocomp_visible"),
      kv.get<number>("exchange_rate"),
    ]);

    if (blobUrl && Array.isArray(visibleIds) && visibleIds.length > 0) {
      const res = await fetch(blobUrl, { next: { revalidate: 3600 } });
      const all: Product[] = await res.json();
      const visibleSet    = new Set(visibleIds);
      const exchangeRate  = rate ?? DEFAULT_RATE;

      const products = all
        .filter((p) => visibleSet.has(p.id))
        .map((p) => ({
          ...p,
          price:     toCRC(p.priceUsd, exchangeRate),
          priceNote: "IVA incluido",
        }));

      return Response.json(products);
    }
  } catch {}

  // Fallback: manually curated products
  try {
    const products = await kv.get<Product[]>("products");
    if (Array.isArray(products) && products.length > 0) return Response.json(products);
  } catch {}

  return Response.json(DEFAULT_PRODUCTS);
}

export async function POST(request: Request) {
  try {
    const products = await request.json();
    await kv.set("products", products);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
