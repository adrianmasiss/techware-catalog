import type { Product, Spec } from "./types";

export class SoapApiError extends Error {
  constructor(public readonly code: number, message: string) {
    super(message);
    this.name = "SoapApiError";
  }
}

interface SoapItem {
  codigo?: string;
  descripcion?: string;
  desc_corta?: string;
  precio?: string;
  currency_code?: string;
  stock?: string;
  image_url?: string;
  image_url_1?: string;
  image_url_2?: string;
  image_url_3?: string;
  image_url_4?: string;
  image_url_5?: string;
  marca?: string;
  modelo?: string;
  familia?: string;
  FamiliaPadre?: string;
  caracteristicas?: string;
  presentacion?: string;
}

const ENDPOINT = "https://eurocompcr.com/webservice.php";
const IMAGE_BASE = "https://eurocompcr.com/";
const DEFAULT_BID = process.env.SOAP_BID ?? "1";

function buildEnvelope(method: string, params: Record<string, string>): string {
  const body = Object.entries(params)
    .map(([k, v]) => `<${k}>${v}</${k}>`)
    .join("");
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://eurocompcr.com/webservice">
  <soapenv:Header/>
  <soapenv:Body>
    <web:${method}>${body}</web:${method}>
  </soapenv:Body>
</soapenv:Envelope>`;
}

async function callSoap(method: string, params: Record<string, string>): Promise<string> {
  const envelope = buildEnvelope(method, params);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/xml;charset=UTF-8", SOAPAction: '""' },
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

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return IMAGE_BASE + path;
}

function parseCaracteristicas(text: string): Spec[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^[-\s]+/, "").trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) {
        return { l: line.slice(0, idx).trim(), v: line.slice(idx + 1).trim() };
      }
      return { l: line, v: "" };
    });
}

function parseXmlResponse(xml: string): Product[] {
  const resultStr = tagValue(xml, "result");
  const code = parseInt(resultStr, 10);
  if (code !== 0) {
    throw new SoapApiError(code, `WebService error (code ${code})`);
  }

  const itemBlocks = allTagValues(xml, "item");
  if (itemBlocks.length === 0) return [];

  return itemBlocks.map((block) => {
    const raw: SoapItem = {
      codigo:         tagValue(block, "codigo"),
      descripcion:    tagValue(block, "descripcion"),
      desc_corta:     tagValue(block, "desc_corta"),
      precio:         tagValue(block, "precio"),
      currency_code:  tagValue(block, "currency_code"),
      stock:          tagValue(block, "stock"),
      image_url:      tagValue(block, "image_url"),
      image_url_1:    tagValue(block, "image_url_1"),
      image_url_2:    tagValue(block, "image_url_2"),
      image_url_3:    tagValue(block, "image_url_3"),
      image_url_4:    tagValue(block, "image_url_4"),
      image_url_5:    tagValue(block, "image_url_5"),
      marca:          tagValue(block, "marca"),
      modelo:         tagValue(block, "modelo"),
      familia:        tagValue(block, "familia"),
      FamiliaPadre:   tagValue(block, "FamiliaPadre"),
      caracteristicas: tagValue(block, "caracteristicas"),
      presentacion:   tagValue(block, "presentacion"),
    };
    return mapItem(raw);
  });
}

// ── Field mapping ────────────────────────────────────────────────────────────

function mapItem(raw: SoapItem): Product {
  const images = [
    raw.image_url,
    raw.image_url_1,
    raw.image_url_2,
    raw.image_url_3,
    raw.image_url_4,
    raw.image_url_5,
  ]
    .filter((v): v is string => Boolean(v))
    .map(resolveImage)
    .filter(Boolean) as string[];

  const currency = raw.currency_code ?? "USD";
  const price = raw.precio ? `${raw.precio} ${currency}` : "";
  const stock = raw.stock ? `Stock: ${raw.stock}` : "";

  const desc = raw.desc_corta || raw.descripcion || "";

  return {
    id:        raw.codigo || crypto.randomUUID(),
    model:     raw.modelo || raw.codigo || "",
    name:      raw.descripcion ?? "",
    desc,
    category:  raw.familia ?? raw.FamiliaPadre ?? "General",
    price,
    priceNote: stock,
    images,
    image:     images[0],
    specs:     parseCaracteristicas(raw.caracteristicas ?? ""),
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function fetchItems(): Promise<Product[]> {
  const ws_cid    = process.env.SOAP_CID!;
  const ws_passwd = process.env.SOAP_PASSWD!;
  const bid       = DEFAULT_BID;
  const xml = await callSoap("wsc_request_bodega_all_items", { ws_cid, ws_passwd, bid });
  return parseXmlResponse(xml);
}
