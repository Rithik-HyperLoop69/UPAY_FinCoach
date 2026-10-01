import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@designcodeio/threeui/style.css': path.resolve(__dirname, './src/shaders/threeui.css'),
      '@designcodeio/threeui': path.resolve(__dirname, './src/shaders/shader-buttons/ShaderButtons.tsx'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
