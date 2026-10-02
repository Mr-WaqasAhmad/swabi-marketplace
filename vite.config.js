import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    cssCodeSplit: true,           // ✅ CSS code splitting
    cssMinify: true,               // ✅ CSS minify
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'react-vendor'
            if (id.includes('react-dom')) return 'react-vendor'
            if (id.includes('react/')) return 'react-vendor'
            if (id.includes('@tanstack')) return 'query-vendor'
            if (id.includes('zod')) return 'form-vendor'
            if (id.includes('react-hook-form')) return 'form-vendor'
            if (id.includes('@hookform')) return 'form-vendor'
            if (id.includes('lucide-react')) return 'icons-vendor'
            return 'vendor'
          }
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
