import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: './dist', // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
  },
});
