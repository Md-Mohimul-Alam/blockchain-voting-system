const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');

// Vite Configuration
module.exports = defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss'), // ✅ Updated Tailwind PostCSS plugin
        require('autoprefixer'),
      ],
    },
  },
});
