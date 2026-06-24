import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'MindFeed',
        short_name: 'MindFeed',
        description: 'Μάθε κάτι ουσιαστικό κάθε μέρα. Anti-doom-scroll γνώση.',
        theme_color: '#7C3AED',
        background_color: '#0d0d0f',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // The API is deliberately NOT cached by the service worker. A NetworkFirst
        // rule with networkTimeoutSeconds:5 used to intercept every /api/ call and
        // abort it after 5s — but Render's free tier cold-starts in ~22s, so the SW
        // killed the feed request long before the backend woke and (with no cache on
        // a first load) surfaced "feed didn't load". Letting API calls bypass the SW
        // hands control to the client's own 45s timeout + retry logic in api/client.js,
        // which is built to ride out cold starts.
      },
    }),
  ],
})
