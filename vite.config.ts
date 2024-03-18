import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import UnoCSS from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS(),],
  resolve: {
    alias: {
      '@': resolve(__dirname, "./src"),
      '@assets': resolve(__dirname, "./src/assets"),
    }
  }
})
