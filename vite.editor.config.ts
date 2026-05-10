import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  root: 'src/editor',
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
