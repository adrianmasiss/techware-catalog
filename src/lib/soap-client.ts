import type { Product } from "./types";

// ── Error type ───────────────────────────────────────────────────────────────

export class SoapApiError extends Error {
  constructor(
    public readonly code: number,
    message: string
  ) {
    super(message);
    this.name = "SoapApiError";
  }
}

// ── Types for raw SOAP response ──────────────────────────────────────────────

interface SoapItem {
  codigo?: string;
  descripcion?: string;
  precio?: string;
  stock?: string;
  imagen_url?: string;
  marca?: string;
  familia?: string;
}

// ── Raw SOAP request ─────────────────────────────────────────────────────────

const ENDPOINT = "https://eurocompcr.com/webservice.php";
const NS = "urn:server";
const ENC = "http://schemas.xmlsoap.org/soap/encoding/";

// RPC/encoded SOAP — parameters need xsi:type as per WSDL
const XSD_TYPES: Record<string, string> = {
  ws_pid:    "xsd:int",
  ws_cid:    "xsd:int",
  ws_passwd: "xsd:string",
  bid:       "xsd:int",
  icodigo:   "xsd:string",
};

function buildEnvelope(method: string, params: Record<string, string>): string {
  const body = Object.entries(params)
    .map(([k, v]) => {
      const type = XSD_TYPES[k] ?? "xsd:string";
      return `<${k} xsi:type="${type}">${v}</${k}>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="utf-8"?>
<SOAP-ENV:Envelope
  xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:SOAP-ENC="${ENC}"
  xmlns:tns="${NS}"
  SOAP-ENV:encodingStyle="${ENC}">
  <SOAP-ENV:Body>
    <tns:${method}>${body}</tns:${method}>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

export async function probeSoap(method: string, params: Record<string, string>): Promise<number> {
  try {
    const text = await callSoap(method, params);
    const m = text.match(/<result[^>]*>(\d+)<\/result>/);
    return m ? parseInt(m[1], 10) : -1;
  } catch {
    return -99;
  }
}

export async function rawSoap(method: string, params: Record<string, string>): Promise<string> {
  try {
    return await callSoap(method, params);
  } catch (e) {
    return String(e);
  }
}

async function callSoap(method: string, params: Record<string, string>): Promise<string> {
  const envelope = buildEnvelope(method, params);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml;charset=UTF-8",
      SOAPAction: `"${NS}#${method}"`,
    },
    body: envelope,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  return text;
}

// ── XML parser ───────────────────────────────────────────────────────────────

function tagValue(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function allTagValues(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) results.push(m[1].trim());
  return results;
}

function parseXmlResponse(xml: string): Product[] {
  const resultStr = tagValue(xml, "result");
  const code = parseInt(resultStr, 10);
  if (code !== 0) {
    throw new SoapApiError(code, `SiReTT WebService error (code ${code})`);
  }

  // Extract each <item> block
  const itemBlocks = allTagValues(xml, "item");
  if (itemBlocks.length === 0) return [];

  return itemBlocks.map((block) => {
    const raw: SoapItem = {
      codigo:      tagValue(block, "codigo"),
      descripcion: tagValue(block, "descripcion"),
      precio:      tagValue(block, "precio"),
      stock:       tagValue(block, "stock"),
      imagen_url:  tagValue(block, "imagen_url"),
      marca:       tagValue(block, "marca"),
      familia:     tagValue(block, "familia"),
    };
    return mapItem(raw);
  });
}

// ── Field mapping ────────────────────────────────────────────────────────────

function mapItem(raw: SoapItem): Product {
  const codigo      = raw.codigo      ?? "";
  const descripcion = raw.descripcion ?? "";
  const marca       = raw.marca       ? `[${raw.marca}] ` : "";
  const stock       = raw.stock       ? `Stock: ${raw.stock}` : "";

  return {
    id:       codigo || crypto.randomUUID(),
    model:    codigo,
    name:     descripcion,
    desc:     marca + descripcion,
    category: raw.familia  ?? "General",
    price:    raw.precio   ?? "",
    priceNote: stock,
    images:   raw.imagen_url ? [raw.imagen_url] : [],
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function fetchAllBodegaItems(bid: string): Promise<Product[]> {
  const ws_cid    = process.env.SOAP_CID!;
  const ws_passwd = process.env.SOAP_PASSWD!;
  const xml = await callSoap("wsc_request_bodega_all_items", { ws_cid, ws_passwd, bid });
  return parseXmlResponse(xml);
}

export async function fetchItems(): Promise<Product[]> {
  const ws_cid    = process.env.SOAP_CID!;
  const ws_passwd = process.env.SOAP_PASSWD!;
  const xml = await callSoap("wsc_request_items", { ws_cid, ws_passwd });
  return parseXmlResponse(xml);
}

// Provider mode: wsp_ functions use pid/passwd (no ws_ prefix)
export async function fetchProviderItems(_bid: string): Promise<Product[]> {
  const pid    = process.env.SOAP_CID!;
  const passwd = process.env.SOAP_PASSWD!;
  const ws_pid = pid;
  const ws_passwd = passwd;
  console.log("[SOAP] trying wsp_request_items with ws_pid:", ws_pid);
  const xml = await callSoap("wsp_request_items", { ws_pid, ws_passwd });
  return parseXmlResponse(xml);
}
