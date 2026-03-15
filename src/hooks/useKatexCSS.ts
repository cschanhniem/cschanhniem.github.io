import { useEffect } from 'react'
import katexStylesHref from 'katex/dist/katex.min.css?url'

let loaded = false
const KATEX_STYLESHEET_ID = 'katex-stylesheet'

/**
 * Hook to lazily load KaTeX CSS only when needed.
 * Call this in components that render math content.
 */
export function useKatexCSS() {
  useEffect(() => {
    if (loaded) return

    const existingStylesheet = document.getElementById(KATEX_STYLESHEET_ID)
    if (existingStylesheet instanceof HTMLLinkElement) {
      loaded = true
      return
    }

    const stylesheet = document.createElement('link')
    stylesheet.id = KATEX_STYLESHEET_ID
    stylesheet.rel = 'stylesheet'
    stylesheet.href = katexStylesHref
    document.head.appendChild(stylesheet)
    loaded = true
  }, [])
}
