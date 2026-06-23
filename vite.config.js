import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['eventemitter3'],
    esbuildOptions: {
      mainFields: ['module', 'main'],
    },
  },
  build: {
    commonjsOptions: {
      include: [/eventemitter3/, /node_modules/],
    },
  },
});