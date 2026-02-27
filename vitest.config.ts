import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import path from 'path';
import { config } from "dotenv";

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@utils': path.resolve(__dirname, './src/lib/utils'),
      '@auth': path.resolve(__dirname, './src/lib/auth'),
      '@db': path.resolve(__dirname, './src/lib/db'),
      '@schemas': path.resolve(__dirname, './src/lib/schemas'),
    },
    env:{
      ...config({path:"./.env"}).parsed, 
    },
  },
});