import { kv } from "@vercel/kv";
import { put } from "@vercel/blob";
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

  // Upload full catalog to Vercel Blob (overwrites previous)
  const blob = await put("eurocomp-catalog.json", JSON.stringify(products), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });

  // Detect new products vs previous sync
  const prevIds = await kv.get<string[]>("eurocomp_all_ids") ?? [];
  const prevSet = new Set(prevIds);
  const newIds  = products.filter((p) => !prevSet.has(p.id)).map((p) => p.id);

  const now = new Date().toISOString();
  await Promise.all([
    kv.set("eurocomp_blob_url", blob.url),
    kv.set("eurocomp_all_ids",  products.map((p) => p.id)),
    kv.set("eurocomp_new_ids",  newIds),
    kv.set("synced_at",         now),
  ]);

  return Response.json({ ok: true, synced: products.length, new: newIds.length, synced_at: now });
}

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

export async function POST() {
  return runSync();
}
