import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: '/partner/',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'Taaza Bites Partner',
          short_name: 'TB Partner',
          description: 'Delivery Partner App for Taaza Bites',
          theme_color: '#059669',
          background_color: '#F8FAF9',
          display: 'standalone',
          icons: [
            {
              src: 'icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.ADMIN_UPSTREAM || 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
      hmr:
        process.env.DISABLE_HMR === 'true'
          ? false
          : { clientPort: Number(process.env.GATEWAY_PORT || 3002) },
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
