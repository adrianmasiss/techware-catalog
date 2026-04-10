import { Product } from "./types";

const STORAGE_KEY = "tw_products";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1775767943608",
    category: "Descansapies",
    name: "Reposapiés ergonómico con ángulo ajustable Basic Living",
    model: "",
    desc: "Reposapiés ergonómico con ángulo ajustable Basic Living. Eleve su comodidad y bienestar con este reposapiés ergonómico, diseñado para brindar alivio a sus pies y piernas mientras promueve una mejor postura. El ángulo ajustable le permite encontrar su posición perfecta, reduciendo la tensión y mejorando su configuración ergonómica en casa o en la oficina. Su superficie texturizada proporciona un suave efecto de masaje, asegurando una comodidad adicional durante todo el día. Con un diseño plano para un fácil almacenamiento, este reposapiés es el complemento perfecto para cualquier espacio.",
    images: [
      "https://cr.epaenlinea.com/media/catalog/product/1/0/100004593.jpg_20250718031749552474.jpeg?optimize=medium&bg-color=255,255,255&fit=bounds&height=300&width=300&canvas=300:300&dpr=2%202x",
      "https://cr.epaenlinea.com/media/catalog/product/1/0/100004593_20250718031749763450.jpeg?optimize=medium&bg-color=255,255,255&fit=bounds&height=300&width=300&canvas=300:300&dpr=2%202x",
      "https://cr.epaenlinea.com/media/catalog/product/1/0/100004593_20250718031750015021.jpeg?optimize=medium&bg-color=255,255,255&fit=bounds&height=300&width=300&canvas=300:300&dpr=2%202x",
    ],
    image: "https://cr.epaenlinea.com/media/catalog/product/1/0/100004593.jpg_20250718031749552474.jpeg?optimize=medium&bg-color=255,255,255&fit=bounds&height=300&width=300&canvas=300:300&dpr=2%202x",
    price: "15.000,00",
    priceNote: "IVA incluido",
    specs: [
      { l: "Características Armado (AltoxAnchoxLargo) (cm)", v: "45 x 33 x 8,8" },
      { l: "Características adicionales", v: "Ángulo ajustable" },
      { l: "Color", v: "Negro" },
      { l: "Material", v: "Plástico" },
    ],
  },
  {
    id: "1775768171729",
    category: "Descansapies",
    name: "Reposapiés para escritorio ergonómico",
    model: "",
    desc: "Transforma tu escritorio con nuestro reposapiés ajustable, diseñado para brindarte el soporte ideal y maximizar tu comodidad durante todo el día. Con una estructura resistente y detalles que favorecen tu bienestar, es el complemento perfecto para mejorar tu postura y productividad.",
    images: [
      "https://ergocr.com/wp-content/uploads/2025/03/Reposapies-1.webp",
      "https://ergocr.com/wp-content/uploads/2025/03/Reposapies-2.webp",
      "https://ergocr.com/wp-content/uploads/2025/03/Reposapies-4.webp",
      "https://ergocr.com/wp-content/uploads/2025/03/Reposapies-5.webp",
      "https://ergocr.com/wp-content/uploads/2025/03/Reposapies-7.webp",
    ],
    image: "https://ergocr.com/wp-content/uploads/2025/03/Reposapies-1.webp",
    price: "32.000,00",
    priceNote: "IVA Incluido",
    specs: [
      { l: "Plataforma inclinable", v: "Ajusta el ángulo de +20° a -20°." },
      { l: "Cobertura suave extraíble", v: "Funda removible y lavable" },
      { l: "Almohadillas antideslizantes", v: "Evita rozaduras y garantiza estabilidad" },
      { l: "Resistencia", v: "Capacidad de carga de hasta 25 kg (55 lb)" },
      { l: "Medidas", v: "44.1 cm (ancho) x 15.8 cm (alto) x 32.7 cm (fondo)" },
    ],
  },
  {
    id: "1775768345929",
    category: "Descansapies",
    name: "Reposapiés para debajo del escritorio StarTech",
    model: "",
    desc: "Este reposapiés ajustable debajo del escritorio ayuda a aumentar tu comodidad y productividad, al mantenerte ergonómicamente posicionado durante todo el día. Es una forma rentable de modificar su estación de trabajo. Puedes personalizar tu reposapiés a tu posición más cómoda ajustando fácilmente la altura y el ángulo en cualquier momento.",
    images: [
      "https://m.media-amazon.com/images/I/81M2yDHJsNL._AC_SX679_.jpg",
      "https://m.media-amazon.com/images/I/81wwPd1pI-L._AC_SX679_.jpg",
    ],
    image: "https://m.media-amazon.com/images/I/81M2yDHJsNL._AC_SX679_.jpg",
    price: "37.500,00",
    priceNote: "IVA Incluido",
    specs: [
      { l: "Talla", v: "94 mm x 360.7 mm x 505.5 mm" },
      { l: "Material", v: "Caucho de aluminio plástico" },
      { l: "Color", v: "Negro" },
      { l: "Dimensiones del producto", v: '18"l. x 14"an. pulgadas' },
    ],
  },
  {
    id: "1775768557564",
    category: "Descansapies",
    name: "Reposapiés Ergonómico Regulable",
    model: "",
    desc: "",
    images: [
      "https://cdn.shopify.com/s/files/1/1161/3498/files/MueblesAlvaradoReposapiesErgonomicoRegulable.jpg?v=1749521607&width=2800&crop=center",
      "https://cdn.shopify.com/s/files/1/1161/3498/files/MueblesAlvaradoReposapiesErgonomicoRegulable_1.jpg?v=1749521896&width=2800&crop=center",
      "https://cdn.shopify.com/s/files/1/1161/3498/files/MueblesAlvaradoReposapiesErgonomicoRegulable_3.jpg?v=1749522037&width=2800&crop=center",
    ],
    image: "https://cdn.shopify.com/s/files/1/1161/3498/files/MueblesAlvaradoReposapiesErgonomicoRegulable.jpg?v=1749521607&width=2800&crop=center",
    price: "25.000,00",
    priceNote: "IVA Incluido",
    specs: [
      { l: "Color", v: "Negro" },
      { l: "Ángulo", v: "0°~30°" },
      { l: "Altura", v: "11-14-17 cm" },
      { l: "Dimensiones de plataforma", v: "46 x 34 cm" },
    ],
  },
  {
    id: "1775769464765",
    category: "Parlantes",
    name: "PARLANTE JBL RGB PARTYBOX ENCORE 2 BLUETOOTH IPX4 CON DOS MICROFONOS INCLUIDO",
    model: "",
    desc: "",
    images: [
      "https://extremetechcr.com/wp-content/uploads/2025/07/EVGA-3.jpg",
      "https://extremetechcr.com/wp-content/uploads/2025/07/HYPERX.jpg",
      "https://extremetechcr.com/wp-content/uploads/2025/07/nzxt-1.jpg",
      "https://extremetechcr.com/wp-content/uploads/2025/07/razer-1.jpg",
    ],
    image: "https://extremetechcr.com/wp-content/uploads/2025/07/EVGA-3.jpg",
    price: "215.000,00",
    priceNote: "IVA Incluido",
    specs: [
      { l: "Marca", v: "JBL" },
      { l: "Color", v: "Negro" },
      { l: "Dimensiones", v: "319,5 x 338,6 x 263 mm" },
      { l: "Peso", v: "6,4 kg" },
      { l: "Transductores", v: "1x Woofer de 5,25 pulgadas (135 mm), 2 x Tweeters de cúpula de 1 pulgada (25 mm)" },
      { l: "Potencia de salida", v: "100 W RMS" },
      { l: "Bluetooth", v: "Si" },
      { l: "Tiempo de reproducción de música", v: "hasta 15 horas (varía según el nivel de volumen)" },
      { l: "Longitud del cable", v: "2,0 m / 6,6 pies" },
      { l: "Micrófono Batería recargable", v: "Si" },
      { l: "Tiempo de reproducción del micrófono", v: "Hasta 10 horas" },
    ],
  },
  {
    id: "1775769793653",
    category: "Parlantes",
    name: "PARLANTE MOONKI MS-P112B 150W BLUETOOTH CON DOS MICROFONOS INALÁMBRICOS",
    model: "",
    desc: "En la parte posterior del parlante se ubican sus controles, entradas y pantalla LED. Mientras tanto, la configuración de dos vías se da mediante el woofer de 12¨ y el tweeter de 1¨ que viabilizan los sonidos graves y agudos, respectivamente. Este sobresaliente altavoz exhibe doble entrada para micrófono y guitarra de 6,5 mm, entrada auxiliar RCA y salida de línea, corriente continua y corriente alterna de 12V. También incluye dos micrófonos inalámbricos.",
    images: [
      "https://www.intelec.co.cr/wp-content/uploads/2025/04/MS-P112B-1024x1024.webp",
      "https://www.intelec.co.cr/wp-content/uploads/2025/04/MS-P112B-2-1024x1024.webp",
      "https://www.intelec.co.cr/wp-content/uploads/2025/04/MS-P112B-3-1024x1024.webp",
      "https://www.intelec.co.cr/wp-content/uploads/2025/04/MS-P112B-4.webp",
    ],
    image: "https://www.intelec.co.cr/wp-content/uploads/2025/04/MS-P112B-1024x1024.webp",
    price: "140.000,00",
    priceNote: "IVA Incluido",
    specs: [
      { l: "Tipo", v: "Altavoz activo profesional de 2 vías con Bluetooth y batería recargable" },
      { l: "Conectividad", v: "Bluetooth" },
      { l: "Incluye", v: "2 micrófonos inalámbricos" },
      { l: "Dimensiones", v: "15,75 x 13,78 x 24,21 pulgadas" },
      { l: "Peso unitario", v: "18,4 kg" },
    ],
  },
  {
    id: "1775770011965",
    category: "Parlantes",
    name: "PARLANTE JBL AUTHENTICS 500 270W BLUETOOTH / WIFI / 3.5MM",
    model: "",
    desc: "– Tipo de conexión: Bluetooth 5.3, Wi-Fi (2.4 GHz/5 GHz), jack 3.5 mm, Ethernet.\n– Potencia de salida: 270W máx. (3.1 canales con Dolby Atmos).\n– Resistencia: No resistente al agua.\n– Batería: No aplica (funciona con corriente directa).\n– Sonido: Alta fidelidad con sistema 3.1, Dolby Atmos® Music.\n– Portabilidad: No portátil, ideal para uso fijo en interiores.\n– Compatibilidad: Dispositivos móviles, plataformas de streaming, asistentes de voz, AirPlay, Chromecast, Alexa MRM, JBL One App.",
    images: [
      "https://cyberteamcr.com/wp-content/uploads/2026/03/16131_10933-2.jpg",
      "https://coolboxpe.vtexassets.com/arquivos/ids/346301/JBLAUTH500BLKAM_1.jpg?v=638437203451500000",
      "https://coolboxpe.vtexassets.com/arquivos/ids/346958-800-800?v=639052305722700000&width=800&height=800&aspect=true",
    ],
    image: "https://cyberteamcr.com/wp-content/uploads/2026/03/16131_10933-2.jpg",
    price: "310.000,00",
    priceNote: "IVA Incluido",
    specs: [
      { l: "Sistema de sonido", v: "3.1 canales con Dolby Atmos" },
      { l: "Potencia total", v: "270 W" },
      { l: "Conectividad", v: "Bluetooth 5.3, Wi-Fi (2.4 GHz/5 GHz), USB tipo C, 3.5 mm" },
      { l: "Compatibilidad con formatos", v: "MP3, WAV" },
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
