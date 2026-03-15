import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vite"
import { execSync } from "child_process"

// Get git commit hash at build time
function getGitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

function getManualChunk(id: string): string | undefined {
  const normalizedId = id.replace(/\\/g, '/')

  if (normalizedId.includes('/node_modules/react/')
    || normalizedId.includes('/node_modules/react-dom/')
    || normalizedId.includes('/node_modules/react-router-dom/')) {
    return 'vendor-react'
  }

  if (normalizedId.includes('/node_modules/lucide-react/')
    || normalizedId.includes('/node_modules/@radix-ui/react-slot/')
    || normalizedId.includes('/node_modules/class-variance-authority/')
    || normalizedId.includes('/node_modules/clsx/')
    || normalizedId.includes('/node_modules/tailwind-merge/')) {
    return 'vendor-ui'
  }

  if (normalizedId.includes('/node_modules/recharts/')) {
    return 'vendor-charts'
  }

  if (normalizedId.includes('/node_modules/react-to-print/')) {
    return 'vendor-print'
  }

  if (normalizedId.includes('/node_modules/react-markdown/')
    || normalizedId.includes('/node_modules/remark-gfm/')
    || normalizedId.includes('/node_modules/remark-math/')
    || normalizedId.includes('/node_modules/rehype-katex/')
    || normalizedId.includes('/node_modules/katex/')) {
    return 'vendor-markdown'
  }

  if (normalizedId.endsWith('/src/data/suttas/index.ts')) {
    return 'data-suttas'
  }

  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'NhapLuu - Stream Entry',
        short_name: 'NhapLuu',
        description: 'Nền tảng thực hành Phật giáo - Buddhist practice platform',
        theme_color: '#E6A23C',
        background_color: '#FAFAFA',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  define: {
    // Inject build-time variables
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __GIT_HASH__: JSON.stringify(getGitHash()),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: getManualChunk,
      },
    },
    // Lower threshold after optimizations
    chunkSizeWarningLimit: 500,
  },
})
