import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      'react-hook-form': fileURLToPath(
        new URL('../../node_modules/react-hook-form/dist/index.cjs.js', import.meta.url),
      ),
      '@supabase/supabase-js': fileURLToPath(
        new URL('../../node_modules/@supabase/supabase-js/dist/index.cjs', import.meta.url),
      ),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})