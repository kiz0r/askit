import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import * as Path from 'node:path';
import babel from '@rolldown/plugin-babel';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  plugins: [
    devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    viteReact(),
    babel({
      presets: [reactCompilerPreset()]
    })
  ],
  envPrefix: 'PUBLIC_',
  resolve: {
    alias: {
      '@': Path.resolve(__dirname, './src'),
    },
  },
  server: {
    strictPort: true,
  },
})
