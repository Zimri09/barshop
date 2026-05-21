import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      'react-hook-form': fileURLToPath(
        new URL('../../node_modules/react-hook-form/dist/index.cjs.js', import.meta.url),
      ),
      '@supabase/supabase-js': fileURLToPath(
        new URL('../../node_modules/@supabase/supabase-js/dist/index.cjs', import.meta.url),
      ),
    },
  },
})