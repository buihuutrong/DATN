import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8888,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8686', // Địa chỉ backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});