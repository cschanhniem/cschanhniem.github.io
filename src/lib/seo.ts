import { useEffect } from 'react'
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_ROBOTS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site'

type JsonLdBlock = Record<string, unknown> | Record<string, unknown>[]

type PageMeta = {
  title: string
  description?: string
  image?: string
  imageAlt?: string
  url?: string
  type?: string
  canonical?: string
  jsonLd?: JsonLdBlock
  jsonLdId?: string
  robots?: string
  author?: string
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

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function resolveAbsoluteUrl(url?: string) {
  if (!url) {
    return `${SITE_URL}${normalizePathname(window.location.pathname)}`
  }

  if (url.startsWith('http')) {
    return url
  }

  return `${SITE_URL}${normalizePathname(url)}`
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
    imageAlt = DEFAULT_OG_IMAGE_ALT,
    url,
    type = 'website',
    canonical,
    jsonLd,
    jsonLdId = 'page',
    robots = DEFAULT_ROBOTS,
    author,
  } = meta

  document.title = `${title} • ${SITE_NAME}`

  if (description) {
    setMetaTag('description', description)
    setPropertyTag('og:description', description)
    setMetaTag('twitter:description', description)
  }

  const resolvedUrl = resolveAbsoluteUrl(url)
  const resolvedImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

  setPropertyTag('og:title', title)
  setPropertyTag('og:type', type)
  setPropertyTag('og:url', resolvedUrl)
  setPropertyTag('og:image', resolvedImage)
  setPropertyTag('og:image:alt', imageAlt)
  setPropertyTag('og:image:type', DEFAULT_OG_IMAGE_TYPE)
  setPropertyTag('og:image:width', DEFAULT_OG_IMAGE_WIDTH)
  setPropertyTag('og:image:height', DEFAULT_OG_IMAGE_HEIGHT)
  setPropertyTag('og:site_name', SITE_NAME)
  setPropertyTag('og:locale', SITE_LOCALE)
  setMetaTag('twitter:card', 'summary_large_image')
  setMetaTag('twitter:title', title)
  setMetaTag('twitter:image', resolvedImage)
  setMetaTag('twitter:image:alt', imageAlt)
  setMetaTag('robots', robots)
  setMetaTag('googlebot', robots)

  if (author) {
    setMetaTag('author', author)
    setPropertyTag('article:author', author)
  }

  setCanonical(canonical || resolvedUrl)

  if (jsonLd) {
    const normalized = Array.isArray(jsonLd) ? jsonLd : [jsonLd]
    setJsonLd(
      {
        '@context': 'https://schema.org',
        '@graph': normalized,
      },
      jsonLdId
    )
  } else {
    const existing = document.head.querySelector<HTMLScriptElement>(`script[data-jsonld="${jsonLdId}"]`)
    if (existing) {
      existing.remove()
    }
  }
}

export function usePageMeta(meta: PageMeta) {
  const { title, description, image, imageAlt, url, type, canonical, jsonLd, jsonLdId, robots, author } = meta

  useEffect(() => {
    applyPageMeta({ title, description, image, imageAlt, url, type, canonical, jsonLd, jsonLdId, robots, author })
  }, [title, description, image, imageAlt, url, type, canonical, jsonLd, jsonLdId, robots, author])
}
