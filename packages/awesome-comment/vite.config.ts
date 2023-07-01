import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(function ({ command }) {
  const apiUrl = command === 'build'
    ? 'https://api.awesome-comment.com'
    : 'http://localhost:3000';

  return {
    define: {
      __API_URL__: JSON.stringify(apiUrl),
    },
    plugins: [vue()],
  };
});
