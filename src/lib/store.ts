import { Product } from "./types";

const STORAGE_KEY = "tw_products";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    category: "Audio Premium",
    name: "JBL PartyBox Encore 2",
    model: "JBLPBENCR2",
    desc: "Parlante portátil de alto rendimiento con sonido JBL Original Pro. Incluye micrófono inalámbrico digital para eventos profesionales.",
    images: ["https://m.media-amazon.com/images/I/61tsa7-GXNL._AC_SL1500_.jpg"],
    price: "$349",
    priceNote: "precio sugerido",
    specs: [
      { l: "Potencia", v: "100W RMS" },
      { l: "Batería", v: "10 horas" },
      { l: "Bluetooth", v: "5.1" },
      { l: "Resistencia", v: "IPX4" },
      { l: "Peso", v: "6.8 kg" },
      { l: "Micrófono", v: "Incluido" },
    ],
  },
  {
    id: "2",
    category: "Audio Hi-Fi",
    name: "JBL Authentics 500",
    model: "JBLAUTH500",
    desc: "Parlante inteligente Wi-Fi con diseño retro. Sonido Dolby Atmos inmersivo con asistentes de voz integrados.",
    images: ["https://m.media-amazon.com/images/I/61-tJqFPXzL._AC_SL1500_.jpg"],
    price: "$579",
    priceNote: "precio sugerido",
    specs: [
      { l: "Potencia", v: "270W" },
      { l: "Drivers", v: "7 unidades" },
      { l: "Wi-Fi", v: "Dual-band" },
      { l: "Audio", v: "Dolby Atmos" },
      { l: "Asistentes", v: "Alexa + Google" },
      { l: "Diseño", v: "Retro Quadrex" },
    ],
  },
  {
    id: "3",
    category: "Audio Portátil",
    name: "JBL Flip 6",
    model: "JBLFLIP6",
    desc: "Sonido potente en formato ultra-portátil con resistencia total al agua y polvo.",
    images: ["https://m.media-amazon.com/images/I/71V-v3JDTHL._AC_SL1500_.jpg"],
    price: "$129",
    priceNote: "precio sugerido",
    specs: [
      { l: "Potencia", v: "30W" },
      { l: "Batería", v: "12 horas" },
      { l: "Resistencia", v: "IP67" },
      { l: "Bluetooth", v: "5.1" },
      { l: "Peso", v: "550g" },
      { l: "PartyBoost", v: "Sí" },
    ],
  },
];

const migrateProduct = (p: any): Product => {
  return {
    ...p,
    images: p.images ? p.images : (p.image ? [p.image] : []),
    specs: p.specs || [],
  };
};

export function loadProducts(): Product[] {
  if (typeof window === "undefined") return DEFAULT_PRODUCTS.map(migrateProduct);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.map(migrateProduct);
      }
    }
  } catch {}
  return DEFAULT_PRODUCTS.map(migrateProduct);
}

export function saveProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
