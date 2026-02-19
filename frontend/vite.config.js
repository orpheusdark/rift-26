import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Falls back to the EC2 backend (same default as .env.example) when VITE_BACKEND_URL is not set.
  // Override by creating a .env file with VITE_BACKEND_URL=<your-backend-url>.
  const backendUrl = env.VITE_BACKEND_URL || 'http://3.87.82.38:8000'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // Proxy /analyze requests through the Vite dev server to avoid CORS issues in development.
        '/analyze': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
