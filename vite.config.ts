import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
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

// https://vite.dev/config/
export default defineConfig({
  base: '/nhapluu',
  plugins: [react(), tailwindcss()],
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
        manualChunks: {
          // Vendor chunks - split large dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', '@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          // Suttas data is likely large - separate chunk
          'data-suttas': [
            './src/data/suttas/index.ts',
          ],
        },
      },
    },
    // Increase warning limit slightly while we optimize
    chunkSizeWarningLimit: 600,
  },
})
