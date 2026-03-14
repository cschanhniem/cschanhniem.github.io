export type DhammaLibrarySection = 'suttas' | 'teachings'

export const DHAMMA_LIBRARY_ROOT_PATH = '/phap-bao'
export const DHAMMA_LIBRARY_SUTTAS_PATH = '/phap-bao/kinh-tang'
export const DHAMMA_LIBRARY_TEACHINGS_PATH = '/phap-bao/giao-phap'

export function getDhammaLibraryPath(section: DhammaLibrarySection): string {
    return section === 'teachings' ? DHAMMA_LIBRARY_TEACHINGS_PATH : DHAMMA_LIBRARY_SUTTAS_PATH
}

export function getDhammaLibrarySection(pathname: string): DhammaLibrarySection {
    return pathname.startsWith(DHAMMA_LIBRARY_TEACHINGS_PATH) || pathname.startsWith('/giao-phap/')
        ? 'teachings'
        : 'suttas'
}

export function isDhammaLibraryRoute(pathname: string): boolean {
    return (
        pathname === DHAMMA_LIBRARY_ROOT_PATH ||
        pathname.startsWith(`${DHAMMA_LIBRARY_ROOT_PATH}/`) ||
        pathname.startsWith('/giao-phap/')
    )
}

export function resolveDhammaBackPath(state: unknown, fallback: string): string {
    if (!state || typeof state !== 'object' || !('from' in state)) {
        return fallback
    }

    const from = (state as { from?: unknown }).from
    return typeof from === 'string' && from.startsWith('/') ? from : fallback
}
