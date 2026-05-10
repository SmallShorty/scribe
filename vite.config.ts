import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import { fileURLToPath, URL } from 'node:url'
import manifest from './manifest.json'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    crx({ manifest }),
  ],
  build: {
    rollupOptions: {
      input: {
        editor: fileURLToPath(new URL('./src/editor/index.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        loadPaths: [srcPath],
      },
    },
  },
})
