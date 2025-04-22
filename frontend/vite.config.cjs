// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',  // Ensure the alias @ points to the src folder
    },
  },
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss'), // ✅ Updated Tailwind PostCSS plugin
        require('autoprefixer'),
      ],
    },
  },
})
