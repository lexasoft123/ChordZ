import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import path from 'node:path'

export default defineConfig({
  base: './',
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: { build: { outDir: 'dist-electron', rollupOptions: { external: ['electron'] } } },
      },
      preload: {
        input: 'electron/preload.ts',
        // The plugin emits CommonJS; .mjs would make Electron load it as ESM.
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
              output: { format: 'cjs', entryFileNames: 'preload.cjs' },
            },
          },
        },
      },
      renderer: {},
    }),
  ],
  server: { port: 5173 },
})
