# TechWare — Catálogo Premium

Catálogo interactivo de productos con efecto page-flip 3D y panel de administración.

## Stack

- **Next.js 16** — App Router, SSG
- **TypeScript** — Tipado estricto
- **Tailwind CSS v4** — Utilidades + tema custom
- **Framer Motion** — Animaciones fluidas
- **localStorage** — Persistencia de productos

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Catálogo tipo libro (vista del cliente) |
| `/admin` | Panel de administración con tabla |

## Deploy en Vercel

### Opción 1: Desde GitHub (recomendado)

1. Subí el proyecto a un repo en GitHub:
   ```bash
   gh repo create techware-catalog --private --source=. --push
   ```
2. Andá a [vercel.com/new](https://vercel.com/new)
3. Importá el repositorio
4. Vercel detecta Next.js automáticamente — clic en **Deploy**
5. Listo. Tu catálogo está en `tu-proyecto.vercel.app`

### Opción 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

## Links para compartir

Una vez deployado (ej: `techware.vercel.app`):

- **Cliente:** `techware.vercel.app` → Solo ve el catálogo
- **Admin:** `techware.vercel.app/admin` → Gestión de productos

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000
