import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import tailwindcss from '@tailwindcss/postcss';
import path from 'path'

// Vite Configuration
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
        '@': path.resolve(__dirname, './src'),  // Ensuring '@' points to the src folder
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss, // ✅ Corrected Tailwind PostCSS plugin usage
        autoprefixer,
      ],
    },
  },
});
