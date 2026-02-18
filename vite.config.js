import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VITE_API_URL } from './src/helper';

console.log(VITE_API_URL);
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: VITE_API_URL,
        // target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
