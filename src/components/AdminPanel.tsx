"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Spec } from "@/lib/types";
import { loadProducts } from "@/lib/store";
import Link from "next/link";

function ProductForm({
  product,
  onSave,
  onClose,
  existingCategories,
}: {
  product: Product | null;
  onSave: (p: Product) => void;
  onClose: () => void;
  existingCategories: string[];
}) {
  const [cat, setCat] = useState(product?.category || "");
  const [isNewCategory, setIsNewCategory] = useState(cat === "" || existingCategories.length === 0 || !existingCategories.includes(cat));
  const [name, setName] = useState(product?.name || "");
  const [model, setModel] = useState(product?.model || "");
  const [desc, setDesc] = useState(product?.desc || "");
  const [images, setImages] = useState<string[]>(product?.images?.length ? product.images : (product?.image ? [product.image] : [""]));
  const [price, setPrice] = useState(product?.price || "");
  const [priceNote, setPriceNote] = useState(product?.priceNote || "");
  const [specs, setSpecs] = useState<Spec[]>(product?.specs || []);
  const [imgOk, setImgOk] = useState<boolean[]>([]);

  useEffect(() => {
    const checks = images.map((img) => {
      return new Promise<boolean>((resolve) => {
        if (!img) return resolve(false);
        const imageObj = new Image();
        imageObj.onload = () => resolve(true);
        imageObj.onerror = () => resolve(false);
        imageObj.src = img;
      });
    });
    Promise.all(checks).then(setImgOk);
  }, [images]);

  const handleSave = () => {
    if (!name.trim()) {
      alert("El nombre es requerido.");
      return;
    }
    
    // Filter out empty images
    const finalImages = images.filter((img) => img.trim() !== "");
    
    onSave({
      id: product?.id || Date.now().toString(),
      category: cat.trim(),
      name: name.trim(),
      model: model.trim(),
      desc: desc.trim(),
      images: finalImages,
      // Fallback for backwards compatibility with parts of the app that haven't been fully migrated
      image: finalImages.length > 0 ? finalImages[0] : "",
      price: price.trim(),
      priceNote: priceNote.trim(),
      specs: specs.filter((s) => s.l || s.v),
    });
  };

  const inputClass =
    "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-white font-medium transition-all duration-300 focus:outline-none focus:border-accent/60 focus:bg-white/[0.06] placeholder:text-white/20";
  const labelClass =
    "block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-white/40 mb-2";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all font-bold"
        >
          ✕
        </button>
        
        <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4 pr-10">
          {product ? "Editar Producto" : "Nuevo Producto"}
        </h3>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre del Producto</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. JBL Pulse 5" />
            </div>
            <div>
              <label className={labelClass}>Modelo / SKU</label>
              <input className={inputClass} value={model} onChange={(e) => setModel(e.target.value)} placeholder="JBLPULSE5" />
            </div>
          </div>
          
          <div>
            <label className={labelClass}>Categoría (Colección)</label>
            {isNewCategory ? (
              <div className="flex gap-2">
                <input className={`${inputClass} flex-1`} value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Ej. Audio Premium" />
                {existingCategories.length > 0 && (
                  <button 
                    onClick={() => { setIsNewCategory(false); setCat(existingCategories[0]); }} 
                    className="glass-button px-4 rounded-xl border border-white/10 hover:bg-white/5 text-[0.65rem] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                  >
                    Usar Existente
                  </button>
                )}
              </div>
            ) : (
              <select 
                className={`${inputClass} appearance-none bg-[#0a0a0b] cursor-pointer`} 
                value={cat} 
                onChange={(e) => {
                  if (e.target.value === "NEW_CATEGORY_TRIGGER") {
                    setIsNewCategory(true);
                    setCat("");
                  } else {
                    setCat(e.target.value);
                  }
                }}
              >
                {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="NEW_CATEGORY_TRIGGER" className="text-accent">+ Crear Nueva Categoría...</option>
              </select>
            )}
          </div>

          <div>
            <label className={labelClass}>Descripción Curada</label>
            <textarea className={`${inputClass} min-h-[80px] resize-y`} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe por qué este producto es increíble..." />
          </div>

          <div className="pt-2">
            <h4 className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-white/60 mb-4">Múltiples Imágenes (URLs Transparente PNG/WEBP)</h4>
            <div className="space-y-3 mb-4">
              {images.map((img, i) => (
                <div key={i} className="group">
                  <div className="flex gap-3 items-center">
                    <input
                      className={`${inputClass} !py-2.5`}
                      value={img}
                      onChange={(e) => {
                        const n = [...images];
                        n[i] = e.target.value;
                        setImages(n);
                      }}
                      placeholder="https://..."
                    />
                    <button
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-lg flex items-center justify-center shrink-0 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 opacity-50 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                  {img && (
                    <div className="mt-2 flex items-center gap-4 bg-white/5 p-2 rounded-lg border border-white/5 w-[calc(100%-3rem)]">
                      {imgOk[i] ? (
                        <img src={img} alt="" className="w-10 h-10 object-contain rounded-md drop-shadow-md" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center text-[0.6rem] text-white/20">Error</div>
                      )}
                      <span className="text-[0.6rem] text-white/30 font-medium tracking-widest uppercase">
                        {imgOk[i] ? "Vista Previa OK" : "La imagen no cargó"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setImages([...images, ""])}
              className="w-full text-xs font-bold text-accent bg-accent/5 border border-dashed border-accent/20 px-4 py-3 rounded-xl hover:bg-accent/10 transition-all duration-300 uppercase tracking-widest"
            >
              + Añadir Otra Imagen
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Precio (opcional)</label>
              <input className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$349" />
            </div>
            <div>
              <label className={labelClass}>Nota del Precio (opcional)</label>
              <input className={inputClass} value={priceNote} onChange={(e) => setPriceNote(e.target.value)} placeholder="IVA Incluido" />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <h4 className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-white/60 mb-4">Especificaciones Técnicas (Opcionales)</h4>
            <div className="space-y-3 mb-4">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-3 items-center group">
                  <input
                    className={`${inputClass} !py-2.5`}
                    value={s.l}
                    onChange={(e) => {
                      const n = [...specs];
                      n[i] = { ...n[i], l: e.target.value };
                      setSpecs(n);
                    }}
                    placeholder="Ej. Batería"
                  />
                  <input
                    className={`${inputClass} !py-2.5`}
                    value={s.v}
                    onChange={(e) => {
                      const n = [...specs];
                      n[i] = { ...n[i], v: e.target.value };
                      setSpecs(n);
                    }}
                    placeholder="Ej. 12 horas"
                  />
                  <button
                    onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                    className="w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-lg flex items-center justify-center shrink-0 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 opacity-50 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSpecs([...specs, { l: "", v: "" }])}
              className="w-full text-xs font-bold text-accent-alt bg-accent-alt/5 border border-dashed border-accent-alt/20 px-4 py-3 rounded-xl hover:bg-accent-alt/10 transition-all duration-300 uppercase tracking-widest"
            >
              + Añadir Dato Técnico
            </button>
          </div>
        </div>

        <div className="flex gap-4 justify-end mt-10">
          <button onClick={onClose} className="text-xs font-bold tracking-[0.15em] uppercase px-8 py-3.5 rounded-xl border border-white/10 text-white/50 hover:bg-white/5 hover:text-white transition-all duration-300">
            Cancelar
          </button>
          <button onClick={handleSave} className="text-xs font-bold tracking-[0.15em] uppercase px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-alt text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all duration-300">
            Guardar Producto
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LinkCard({ title, url, origin }: { title: string, url: string, origin: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `${origin}${url}`;
  
  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col gap-2 rounded-xl border border-white/5 hover:border-accent/30 transition-colors group">
      <div className="flex justify-between items-center">
        <span className="text-[0.65rem] font-bold text-white uppercase tracking-[0.1em]">{title}</span>
        <button 
          onClick={copyToClipboard}
          className={`text-[0.6rem] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent group-hover:border-white/10'}`}
        >
          {copied ? (
            <>✓ Copiado</>
          ) : (
            <>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copiar
            </>
          )}
        </button>
      </div>
      <div className="text-[0.6rem] font-mono text-white/30 truncate select-all">{fullUrl.replace(/^https?:\/\//, '')}</div>
    </div>
  );
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [originUrl, setOriginUrl] = useState("");

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts(loadProducts()));
    setMounted(true);
    setOriginUrl(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  const save = (updated: Product[]) => {
    setProducts(updated);
    fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  const handleSave = (p: Product) => {
    const existing = products.findIndex((x) => x.id === p.id);
    const updated = [...products];
    if (existing >= 0) updated[existing] = p;
    else updated.push(p);
    save(updated);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    save(products.filter((p) => p.id !== deleting));
    setDeleting(null);
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-[100dvh] w-full bg-void selection:bg-accent/30 font-sans text-white pb-20">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none fixed" />
      <div className="absolute top-[-20vw] left-[-10vw] w-[60vw] h-[60vw] bg-accent/5 rounded-full blur-[140px] pointer-events-none fixed animate-pulse-slow" />
      
      {/* Global Header */}
      <header className="relative z-20 w-full px-4 lg:px-12 py-3 lg:py-4 flex items-center bg-black/40 backdrop-blur-xl border-b border-accent/20 shadow-[0_4px_30px_rgba(249,115,22,0.1)] mb-8 md:mb-12 shrink-0">
        <img 
          src="/logo1.png" 
          alt="TechWare Logo" 
          className="h-9 md:h-11 w-auto object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:scale-105 transition-transform" 
        />
      </header>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight text-gradient">
              Centro de Gestión
            </h1>
            <p className="text-sm font-medium tracking-widest text-[#a1a1aa] mt-2 uppercase">
              Control total sobre tu catálogo electrónico
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="glass-button text-xs font-bold tracking-[0.15em] uppercase px-6 py-3.5 rounded-xl border border-white/10 text-white flex items-center gap-2 hover:bg-white/5"
            >
               <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Vista Previa
            </Link>
            <button
              onClick={() => setEditing("new")}
              className="text-xs font-bold tracking-[0.15em] uppercase px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-alt text-white shadow-lg shadow-accent/20 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300"
            >
              + Nuevo Producto
            </button>
          </div>
        </header>

        {/* Magical Links Section */}
        {products.length > 0 && originUrl && (
          <div className="mb-10">
            <h2 className="text-[0.7rem] font-bold tracking-[0.2em] text-white/50 uppercase mb-4 pl-3 border-l-2 border-accent flex items-center gap-2">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              Tus Enlaces para Clientes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <LinkCard title="Catálogo Completo" url="/" origin={originUrl} />
              {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map((cat, idx) => (
                <LinkCard key={idx} title={`Solo ${cat}`} url={`/?category=${encodeURIComponent(cat)}`} origin={originUrl} />
              ))}
            </div>
          </div>
        )}

        <div className="glass-panel overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-24 px-6">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sin base de datos</h3>
              <p className="text-sm text-white/40 mb-6 font-medium">Añade tu primer producto para que empiece la magia en la pantalla principal.</p>
              <button onClick={() => setEditing("new")} className="text-xs font-bold tracking-widest text-accent uppercase border-b border-accent pb-1 hover:text-accent/80">Comenzar AHORA →</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    {["", "Cover", "Producto", "Categoría", "Status", "Precio", "Acciones"].map((h, i) => (
                      <th
                        key={i}
                        className="text-[0.6rem] font-bold tracking-[0.25em] uppercase text-white/30 px-6 py-5 border-b border-white/5"
                        style={i === 0 ? { width: 40 } : i === 1 ? { width: 80 } : undefined}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {products.map((p, i) => (
                      <motion.tr
                        layout
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors duration-300 group"
                        draggable
                        onDragStart={(e) => {
                          (e as unknown as DragEvent).dataTransfer?.setData("text/plain", String(i));
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const from = parseInt((e as unknown as DragEvent).dataTransfer?.getData("text/plain") || "0");
                          if (from !== i) {
                            const updated = [...products];
                            const [moved] = updated.splice(from, 1);
                            updated.splice(i, 0, moved);
                            save(updated);
                          }
                        }}
                      >
                        <td className="px-6 py-4">
                          <span className="text-white/10 cursor-grab active:cursor-grabbing text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            ⣿
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.image ? (
                            <img src={p.image} alt="" className="w-16 h-16 rounded-xl object-contain bg-white/[0.03] p-1 border border-white/5 drop-shadow-md" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-[0.5rem] uppercase tracking-widest text-white/10 font-bold">
                              No Img
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-base text-white tracking-tight">{p.name}</div>
                          <div className="text-[0.65rem] uppercase tracking-widest text-white/40 mt-1">{p.model}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[0.6rem] uppercase tracking-widest text-white/70 font-semibold">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                             <span className="text-xs text-white/60 font-medium">Activo</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-accent text-lg">
                            {p.price || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditing(p)}
                              className="glass-button w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-white"
                              title="Editar"
                            >
                              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleting(p.id)}
                              className="glass-button w-10 h-10 rounded-xl flex items-center justify-center text-red-400/50 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                              title="Eliminar"
                            >
                              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {editing && (
          <ProductForm
            product={editing === "new" ? null : editing}
            onSave={handleSave}
            onClose={() => setEditing(null)}
            existingCategories={Array.from(new Set(products.map(p => p.category).filter(Boolean)))}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-10 text-center max-w-[400px] w-full shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">¿Eliminar producto?</h4>
              <p className="text-sm text-white/40 mb-8 font-medium">Esta acción eliminará el producto del catálogo permanentemente y no se podrá deshacer.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setDeleting(null)}
                  className="w-full text-xs font-bold tracking-widest uppercase py-3.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-xs font-bold tracking-widest uppercase py-3.5 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-400 hover:-translate-y-0.5 transition-all"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
