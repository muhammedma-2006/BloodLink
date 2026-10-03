import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from process.env and .env files
  const env = loadEnv(mode, process.cwd(), '');

  // Extract backend URL across various common naming schemes
  const apiUrl =
    env.VITE_API_URL ||
    env.VITE_BACKEND_URL ||
    env.VITE_BACKEND_LINK ||
    env.VITE_BACKEND_LINKS ||
    env.VITE_SERVER_URL ||
    env.VITE_API_BASE ||
    env.BACKEND_URL ||
    env.BACKEND_LINKS ||
    env.BACKEND_LINK ||
    env.API_URL ||
    env.API_BASE_URL ||
    '';

  return {
    plugins: [react()],
    define: {
      '__BLOODLINK_API_URL__': JSON.stringify(apiUrl.trim()),
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
});
