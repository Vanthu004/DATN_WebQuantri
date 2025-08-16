import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': '/src',
      'react-native': 'react-native-web',
    },
  },
  build: {
    rollupOptions: {
      external: ['react-native'],
    },
  },
});