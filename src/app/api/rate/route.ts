import { kv } from "@vercel/kv";
import { DEFAULT_RATE } from "@/lib/pricing";

export async function GET() {
  const rate = await kv.get<number>("exchange_rate") ?? DEFAULT_RATE;
  return Response.json({ rate });
}

export async function POST(request: Request) {
  const { rate } = await request.json() as { rate: number };
  if (!rate || rate < 100 || rate > 2000) {
    return Response.json({ error: "Tipo de cambio inválido" }, { status: 400 });
  }
  await kv.set("exchange_rate", rate);
  return Response.json({ ok: true, rate });
}
