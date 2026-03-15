import type { NikayaCollection } from '@/types/nikaya'
import { normalizeSuttaId } from '@/data/nikaya-improved/availability'

export type NikayaLibraryCollectionFilter = NikayaCollection | 'all'

export const NIKAYA_LIBRARY_ROOT_PATH = '/nikaya'

const NIKAYA_COLLECTION_SET = new Set<NikayaCollection>(['dn', 'mn', 'sn', 'an', 'kn'])

export function isNikayaCollection(value: string): value is NikayaCollection {
  return NIKAYA_COLLECTION_SET.has(value as NikayaCollection)
}

export function getNikayaCollectionFromSuttaId(suttaId: string): NikayaCollection | null {
  const normalized = normalizeSuttaId(suttaId)
  if (/^(kp|dhp|ud|iti|snp)/.test(normalized)) {
    return 'kn'
  }
  const match = normalized.match(/^[a-z]+/)
  if (!match) {
    return null
  }

  return isNikayaCollection(match[0]) ? match[0] : null
}

export function getNikayaCollectionPath(collection: NikayaLibraryCollectionFilter): string {
  return collection === 'all' ? NIKAYA_LIBRARY_ROOT_PATH : `${NIKAYA_LIBRARY_ROOT_PATH}/${collection}`
}

export function getNikayaDetailPath(suttaId: string, collection?: NikayaCollection | null): string {
  const normalizedSuttaId = normalizeSuttaId(suttaId)
  const resolvedCollection = collection || getNikayaCollectionFromSuttaId(normalizedSuttaId)

  if (!resolvedCollection) {
    return NIKAYA_LIBRARY_ROOT_PATH
  }

  return `${getNikayaCollectionPath(resolvedCollection)}/${normalizedSuttaId}`
}

export function getNikayaCollectionFromPath(pathname: string): NikayaLibraryCollectionFilter {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 'nikaya') {
    return 'all'
  }

  const collection = segments[1]
  return collection && isNikayaCollection(collection) ? collection : 'all'
}

export function resolveNikayaBackPath(state: unknown, fallback: string): string {
  if (!state || typeof state !== 'object' || !('from' in state)) {
    return fallback
  }

  const from = (state as { from?: unknown }).from
  return typeof from === 'string' && from.startsWith('/') ? from : fallback
}
