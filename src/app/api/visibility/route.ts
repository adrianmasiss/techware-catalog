import { kv } from "@vercel/kv";

export async function GET() {
  const ids = await kv.get<string[]>("eurocomp_visible") ?? [];
  return Response.json({ ids });
}

export async function PATCH(request: Request) {
  const { id, visible } = await request.json() as { id: string; visible: boolean };

  const current = await kv.get<string[]>("eurocomp_visible") ?? [];
  const set = new Set(current);

  if (visible) set.add(id);
  else         set.delete(id);

  const updated = Array.from(set);
  await kv.set("eurocomp_visible", updated);

  return Response.json({ ok: true, visibleCount: updated.length });
}
