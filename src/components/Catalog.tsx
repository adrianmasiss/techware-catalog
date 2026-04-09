"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/types";
import { loadProducts } from "@/lib/store";

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");

    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: Product[]) => {
        const filtered = cat
          ? data.filter((p) => (p.category || "").toLowerCase() === cat.toLowerCase())
          : data;
        setProducts(filtered.length > 0 ? filtered : data);
      })
      .catch(() => {
        let local = loadProducts();
        if (cat) {
          const f = local.filter((p) => (p.category || "").toLowerCase() === cat.toLowerCase());
          if (f.length > 0) local = f;
        }
        setProducts(local);
      })
      .finally(() => setMounted(true));
  }, []);

  useEffect(() => {
    setCurrentImageIndex(0); // Reset image index on slide change
    setDescExpanded(false); // Reset desc state on slide change
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextSlide();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevSlide();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, products.length]);

  const nextSlide = () => {
    if (currentIndex < products.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!mounted) return null;

  if (products.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-white/50 bg-void">Cargando catálogo...</div>;
  }

  const product = products[currentIndex];
  // Determine images array and fallback
  const images = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : []);
    
  const currentImg = images[currentImageIndex] || "";

  const slideVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir * 100, scale: 0.95 }),
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.8 } },
    exit: (dir: number) => ({ opacity: 0, x: dir * -100, scale: 0.95, transition: { duration: 0.6 } })
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-void overflow-x-hidden overflow-y-auto flex flex-col justify-between selection:bg-accent/30 font-sans text-white">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-accent-alt/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 right-[-10vw] w-[50vw] h-[50vw] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 w-full px-4 lg:px-12 py-3 lg:py-4 flex justify-between items-center bg-black/40 backdrop-blur-xl border-b border-accent/20 shadow-[0_4px_30px_rgba(249,115,22,0.1)] shrink-0">
        <div className="flex items-center gap-4">
          <img 
            src="/logo1.png" 
            alt="TechWare Logo" 
            className="h-9 md:h-11 w-auto object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:scale-105 transition-transform" 
          />
        </div>
        <div className="flex items-center gap-4 text-[0.7rem] font-bold tracking-widest uppercase text-accent bg-accent/10 border border-accent/30 rounded-2xl px-6 py-2 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
          <span>Colección</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
          <span className="text-white text-xs">
            {String(currentIndex + 1).padStart(2, '0')} 
            <span className="text-white/20 mx-2">/</span> 
            {String(products.length).padStart(2, '0')}
          </span>
        </div>
      </header>

      {/* Main Content Carousel */}
      <main className="relative z-10 flex-1 w-full max-w-[90rem] mx-auto px-4 sm:px-8 lg:px-12 py-3 md:py-1 flex flex-col justify-start md:pt-4 lg:pt-8 min-h-[70vh]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full flex md:justify-between items-center gap-4 md:gap-8 lg:gap-12 md:flex-row flex-col-reverse"
          >
            {/* Left: Text & Specs */}
            <div className="flex-1 flex flex-col items-start w-full max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gradient-accent text-[0.6rem] font-bold tracking-[0.3em] uppercase bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  {product.category}
                </span>
                <span className="text-white/40 text-[0.6rem] font-bold tracking-[0.3em] uppercase px-2">
                  {product.model}
                </span>
              </div>
              
              <h1 className="font-black text-3xl sm:text-4xl md:text-[2.8rem] lg:text-[3.2rem] text-white leading-[1.05] tracking-tight mb-2 md:mb-3 drop-shadow-2xl">
                {product.name}
              </h1>
              
              <div className="mb-3 md:mb-4 w-full max-w-xl">
                <p className={`text-[#a1a1aa] text-sm md:text-base leading-relaxed font-light transition-all duration-300 ${!descExpanded ? 'line-clamp-3 lg:line-clamp-4' : ''}`}>
                  {product.desc}
                </p>
                {product.desc && product.desc.length > 150 && (
                  <button 
                    onClick={() => setDescExpanded(!descExpanded)} 
                    className="text-accent text-[0.65rem] font-bold uppercase tracking-[0.2em] mt-3 hover:text-accent-alt transition-colors flex items-center gap-2"
                  >
                    {descExpanded ? '- Ver menos' : '+ Ver más'}
                  </button>
                )}
              </div>

              {/* Specs Bento Grid (Conditionally Rendered) */}
              {product.specs && product.specs.length > 0 && (
                <div className="grid grid-cols-2 gap-2 md:gap-3 w-full mb-3 lg:mb-4">
                  {product.specs.map((spec, i) => (
                    <div key={i} className="glass-panel p-3 md:p-3 2xl:p-4 flex flex-col justify-start hover:bg-white/5 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 border border-white/10 hover:border-accent/30 rounded-2xl">
                      <div className="text-accent/90 text-[0.6rem] md:text-[0.65rem] font-bold tracking-[0.15em] uppercase mb-1 flex items-start gap-2 opacity-80">
                         <span className="w-1.5 h-1.5 rounded-full bg-accent mt-[0.3rem] shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                        <span className="leading-relaxed line-clamp-2">{spec.l}</span>
                      </div>
                      <div className="text-white text-xs md:text-sm font-medium leading-snug ml-3.5">
                        {spec.v}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing & CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between w-full p-3 glass-panel bg-white/[0.02] border-l-4 border-l-accent border-y-0 border-r-0 rounded-l-none pl-5 pr-3 mt-2 md:mt-auto gap-3 sm:gap-0">
                {product.price ? (
                  <div className="flex flex-col w-full sm:w-auto">
                    <span className="text-2xl md:text-3xl font-black text-white drop-shadow-md tracking-tight">
                      {product.price}
                    </span>
                    {product.priceNote && (
                      <span className="text-[0.65rem] text-white/40 uppercase tracking-[0.2em] mt-1">
                        {product.priceNote}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-white/40 text-sm font-bold uppercase tracking-widest">
                    Previa consulta
                  </div>
                )}
                
                <a
                  href={`https://wa.me/50685397235?text=Me%20interes%C3%B3%20${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-white font-bold tracking-[0.1em] uppercase text-xs transition-all duration-300 shadow-[0_4px_20px_rgba(37,211,102,0.3)] bg-[#25D366] hover:bg-[#1DA851] hover:shadow-[0_8px_25px_rgba(37,211,102,0.5)] transform hover:-translate-y-1"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.553-1.46A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.767-6.262-2.064l-.438-.334-2.694.864.88-2.631-.366-.462A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                  </svg>
                  Me interesa
                </a>
              </div>
            </div>

            {/* Right: Floating Product Image & Thumbnails */}
            <div className="flex-1 flex flex-col justify-center items-center w-full relative h-[35vh] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] max-h-[500px] shrink-0 mb-4 md:mb-0">
              {currentImg ? (
                <>
                  <div className="relative w-full h-[95%] flex items-center justify-center group overflow-visible">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-white/[0.03] blur-3xl rounded-full mix-blend-screen pointer-events-none group-hover:bg-white/[0.06] transition-all duration-700" />
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -10 }}
                        transition={{ duration: 0.4 }}
                        src={currentImg}
                        alt={product.name}
                        onClick={() => setFullScreenImage(currentImg)}
                        className="relative z-10 w-[85%] lg:w-[95%] h-auto max-h-full object-contain object-center drop-shadow-2xl animate-float cursor-pointer flex-1"
                        style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5)) drop-shadow(0 0px 10px rgba(255,255,255,0.05))" }}
                      />
                    </AnimatePresence>
                  </div>
                  
                  {/* Thumbnails if > 1 image */}
                  {images.length > 1 && (
                    <div className="flex gap-3 mt-4 z-20">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-12 h-12 rounded-xl border p-1 overflow-hidden transition-all duration-300 ${idx === currentImageIndex ? 'border-accent bg-accent/10 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-white/10 glass-panel hover:border-white/30'}`}
                        >
                           <img src={img} alt={`Vista ${idx+1}`} className="w-full h-full object-contain drop-shadow-md" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-40 h-40 rounded-full border border-white/5 flex items-center justify-center text-white/10 uppercase tracking-widest text-xs font-bold glass-panel bg-transparent">
                  Sin imagen
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation Controls */}
      <footer className="relative z-20 w-full px-4 lg:px-12 py-3 lg:py-4 flex justify-between items-center max-w-[90rem] mx-auto shrink-0 pb-6 lg:pb-4">
        <button
          onClick={prevSlide}
          disabled={currentIndex <= 0}
          className="glass-button p-3 rounded-full disabled:opacity-20 disabled:cursor-not-allowed group w-12 h-12 flex items-center justify-center border-white/10 hover:border-white/30"
        >
          <svg className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex gap-2.5 items-center">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out cursor-pointer ${
                i === currentIndex ? "w-12 bg-gradient-to-r from-accent to-accent-alt" : "w-4 bg-white/10 hover:bg-white/25 hover:w-6"
              }`}
              aria-label={`Ir al producto ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentIndex >= products.length - 1}
          className="glass-button p-3 rounded-full disabled:opacity-20 disabled:cursor-not-allowed group w-12 h-12 flex items-center justify-center border-white/10 hover:border-white/30"
        >
           <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </footer>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setFullScreenImage(null)}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setFullScreenImage(null); }}
              className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xl transition-all border border-white/20"
            >
              ✕
            </button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              src={fullScreenImage}
              alt="Vista completa"
              className="w-full h-full max-h-[85vh] object-contain drop-shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
