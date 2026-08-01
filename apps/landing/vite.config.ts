import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        cssCodeSplit: true,
        target: 'esnext',
        minify: 'esbuild',
        assetsInlineLimit: 4096,
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'motion-vendor': ['motion'],
              'lucide-vendor': ['lucide-react'],
              'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            }
          }
        }
      }
    };
});
