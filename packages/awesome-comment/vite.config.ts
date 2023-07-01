import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __AUTH0_DOMAIN__: process.env.AUTH0_DOMAIN,
    __AUTH0_CLIENT_ID__: process.env.AUTH0_CLIENT_ID,
  },
  plugins: [vue()],
})
