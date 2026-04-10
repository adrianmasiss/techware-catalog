import { kv } from "@vercel/kv";
import { DEFAULT_PRODUCTS } from "@/lib/store";

export async function GET() {
  try {
    const products = await kv.get("products");
    if (Array.isArray(products) && products.length > 0) {
      return Response.json(products);
    }
    return Response.json(DEFAULT_PRODUCTS);
  } catch {
    return Response.json(DEFAULT_PRODUCTS);
  }
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
