import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'

// The browser sees the API on the page's own origin, so CORS does not apply. Without this, a POST
// from another device (e.g. http://192.168.0.7:5173) carries an Origin the API does not allow: 403.
function sameOriginProxy(target: string): ProxyOptions {
  return { target, configure: (proxy) => proxy.on('proxyReq', (request) => request.removeHeader('origin')) }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const authEmulator = env.FIREBASE_AUTH_EMULATOR_TARGET || 'http://localhost:9099'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/v1': sameOriginProxy(env.API_PROXY_TARGET || 'http://localhost:8081'),
        // Firebase Auth emulator: the browser calls it through this server, so it works
        // from other devices on the network (a phone's "localhost" is the phone itself).
        '/identitytoolkit.googleapis.com': authEmulator,
        '/securetoken.googleapis.com': authEmulator,
        '/emulator': authEmulator,
      },
    },
  }
})
