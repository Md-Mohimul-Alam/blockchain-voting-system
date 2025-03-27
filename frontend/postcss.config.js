import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss(),  // Use the correct Tailwind plugin
    autoprefixer,   // Autoprefixer for cross-browser support
  ],
};
