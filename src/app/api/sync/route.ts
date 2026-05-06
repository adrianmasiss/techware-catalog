import { kv } from "@vercel/kv";
import { fetchItems } from "@/lib/soap-client";
import type { NextRequest } from "next/server";

async function runSync() {
  const cid    = process.env.SOAP_CID;
  const passwd = process.env.SOAP_PASSWD;

  if (!cid || !passwd) {
    return Response.json({ error: "SOAP not configured" }, { status: 500 });
  }

  const products = await fetchItems();
  if (products.length === 0) {
    return Response.json({ error: "SOAP returned 0 products" }, { status: 502 });
  }
  await kv.set("eurocomp_cache", products);
  return Response.json({ ok: true, synced: products.length });
}

// Called by Vercel Cron (GET + Authorization header)
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  return runSync();
}

// Called manually (POST, no auth required on local)
export async function POST() {
  return runSync();
}
