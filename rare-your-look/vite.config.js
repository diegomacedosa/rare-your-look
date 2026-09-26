import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: Number(process.env.PORT) || 5173, open: false },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 8192,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Phaser fica num chunk próprio: o código do jogo muda, a engine fica em cache
        manualChunks: { phaser: ['phaser'] },
      },
    },
  },
});
