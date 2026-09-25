import { defineConfig } from 'vite';

export default defineConfig({
  // Caminhos relativos: o build funciona em GitHub Pages, Netlify, Vercel ou numa subpasta qualquer.
  base: './',
  server: {
    // respeita a porta do ambiente (útil quando 5173 já está ocupada)
    port: Number(process.env.PORT) || 5173,
    open: false,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    cssCodeSplit: true, // CSS de cada cena vai junto do chunk lazy da cena
    assetsInlineLimit: 4096,
  },
});
