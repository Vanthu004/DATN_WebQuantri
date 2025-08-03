import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'react-native': 'react-native-web', // Ánh xạ react-native sang react-native-web
    },
  },
  build: {
    rollupOptions: {
      external: ['react-native'], // Giữ external như dự phòng
    },
  },
});