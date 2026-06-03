import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve('..'), '');
  const backendPort = env.PORT || '5000';
  const backendTarget = `http://127.0.0.1:${backendPort}`;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
