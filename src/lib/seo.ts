import { useEffect } from 'react'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/site'

type PageMeta = {
  title: string
  description?: string
  image?: string
  url?: string
  type?: string
  canonical?: string
  jsonLd?: Record<string, unknown>
  jsonLdId?: string
}

function upsertMetaTag(attrs: Record<string, string>) {
  const selector = Object.entries(attrs)
    .map(([key, value]) => `[${key}="${value.replace(/"/g, '\\"')}"]`)
    .join('')

  let tag = document.head.querySelector<HTMLMetaElement>(`meta${selector}`)
  if (!tag) {
    tag = document.createElement('meta')
    Object.entries(attrs).forEach(([key, value]) => tag?.setAttribute(key, value))
    document.head.appendChild(tag)
  }
  return tag
}

function setMetaTag(name: string, content: string) {
  const tag = upsertMetaTag({ name })
  tag.setAttribute('content', content)
}

function setPropertyTag(property: string, content: string) {
  const tag = upsertMetaTag({ property })
  tag.setAttribute('content', content)
}

function setCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

function setJsonLd(data: Record<string, unknown>, id: string) {
  let script = document.head.querySelector<HTMLScriptElement>(`script[data-jsonld="${id}"]`)
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-jsonld', id)
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

export function applyPageMeta(meta: PageMeta) {
  const {
    title,
    description,
    image = DEFAULT_OG_IMAGE,
    url,
    type = 'website',
    canonical,
    jsonLd,
    jsonLdId = 'page'
  } = meta

  document.title = `${title} • ${SITE_NAME}`

  if (description) {
    setMetaTag('description', description)
    setPropertyTag('og:description', description)
    setMetaTag('twitter:description', description)
  }

  const resolvedUrl = url
    ? (url.startsWith('http') ? url : `${SITE_URL}${url}`)
    : `${SITE_URL}${window.location.pathname}`
  const resolvedImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

  setPropertyTag('og:title', title)
  setPropertyTag('og:type', type)
  setPropertyTag('og:url', resolvedUrl)
  setPropertyTag('og:image', resolvedImage)
  setMetaTag('twitter:card', 'summary_large_image')
  setMetaTag('twitter:title', title)
  setMetaTag('twitter:image', resolvedImage)

  setCanonical(canonical || resolvedUrl)

  if (jsonLd) {
    setJsonLd(jsonLd, jsonLdId)
  } else {
    const existing = document.head.querySelector<HTMLScriptElement>(`script[data-jsonld="${jsonLdId}"]`)
    if (existing) {
      existing.remove()
    }
  }
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    applyPageMeta(meta)
  }, [
    meta.title,
    meta.description,
    meta.image,
    meta.url,
    meta.type,
    meta.canonical,
    meta.jsonLd,
    meta.jsonLdId
  ])
}
