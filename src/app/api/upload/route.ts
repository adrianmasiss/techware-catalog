import { put } from "@vercel/blob";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: "public" });
  return Response.json({ url: blob.url });
}
