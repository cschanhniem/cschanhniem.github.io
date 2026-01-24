import { useEffect } from 'react'

let loaded = false

/**
 * Hook to lazily load KaTeX CSS only when needed.
 * Call this in components that render math content.
 */
export function useKatexCSS() {
    useEffect(() => {
        if (loaded) return
        import('katex/dist/katex.min.css')
        loaded = true
    }, [])
}
