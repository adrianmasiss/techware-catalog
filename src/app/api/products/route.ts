import type { NextRequest } from "next/server";
import { fetchItems, SoapApiError } from "@/lib/soap-client";

export async function GET(_request: NextRequest) {
  const cid = process.env.SOAP_CID;
  const passwd = process.env.SOAP_PASSWD;
  const bid = process.env.SOAP_BID ?? "1";

  if (!cid || !passwd) {
    return Response.json(
      { error: "Service not configured" },
      { status: 500 }
    );
  }

  try {
    const products = await fetchItems();
    return Response.json(products);
  } catch (err) {
    if (err instanceof SoapApiError) {
      return Response.json(
        { error: "SOAP API error", code: err.code, message: err.message },
        { status: 500 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error("Unexpected SOAP error:", err);
    return Response.json(
      { error: "Upstream error", detail: message },
      { status: 502 }
    );
  }
}
