#!/usr/bin/env node
// Corre el sync contra el servidor local (sin límite de tiempo de Vercel).
// Uso: npm run sync
// Requiere que el servidor esté corriendo: npm run dev

const url = process.env.SYNC_URL ?? "http://localhost:3000/api/sync";

console.log(`⏳ Sincronizando catálogo Eurocomp desde ${url}...`);
const start = Date.now();

fetch(url, { method: "POST" })
  .then(async (res) => {
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (json.ok) {
      console.log(`✅ Sync completado en ${elapsed}s`);
      console.log(`   Productos: ${json.synced.toLocaleString()}`);
      console.log(`   Nuevos:    ${json.new}`);
      console.log(`   SOAP tardó: ${json.soap_ms}ms`);
    } else {
      console.error(`❌ Error (${res.status}):`, json.error ?? json.raw);
    }
  })
  .catch((err) => {
    console.error("❌ No se pudo conectar. ¿Está corriendo el servidor? (npm run dev)");
    console.error("  ", err.message);
  });
