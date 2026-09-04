import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  // Keep EXPO_PUBLIC_* available during the migration while VITE_* is canonical.
  envPrefix: ['VITE_', 'EXPO_PUBLIC_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
  },
});
