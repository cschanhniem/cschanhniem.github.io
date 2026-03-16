import type { NikayaLanguage } from '@/types/nikaya'
import { normalizeSuttaId } from '@/data/nikaya-improved/availability'

export type NikayaSourceGapStatus = 'verified-source-absence' | 'upstream-content-gap'
export type NikayaSourceGapReasonKey =
    | 'sn36_30MinhChau'
    | 'an11MinhChau'
    | 'an1330English'

export interface NikayaSourceGap {
    lang: NikayaLanguage
    matchId: string
    matchScope: 'route' | 'canonical'
    status: NikayaSourceGapStatus
    reasonKey: NikayaSourceGapReasonKey
}

const VERIFIED_SOURCE_GAPS: NikayaSourceGap[] = [
    {
        lang: 'vi',
        matchId: 'sn36.30',
        matchScope: 'route',
        status: 'verified-source-absence',
        reasonKey: 'sn36_30MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.30-69',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.70-117',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.118-165',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.166-213',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.214-261',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.262-309',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.310-357',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.358-405',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.406-453',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.454-501',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.502-981',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'vi',
        matchId: 'an11.992-1151',
        matchScope: 'canonical',
        status: 'verified-source-absence',
        reasonKey: 'an11MinhChau',
    },
    {
        lang: 'en',
        matchId: 'an1.330',
        matchScope: 'route',
        status: 'upstream-content-gap',
        reasonKey: 'an1330English',
    },
    {
        lang: 'en',
        matchId: 'an1.331',
        matchScope: 'route',
        status: 'upstream-content-gap',
        reasonKey: 'an1330English',
    },
    {
        lang: 'en',
        matchId: 'an1.332',
        matchScope: 'route',
        status: 'upstream-content-gap',
        reasonKey: 'an1330English',
    },
]

export function getNikayaSourceGap(routeId: string, lang: NikayaLanguage, canonicalId?: string | null): NikayaSourceGap | null {
    const normalizedRouteId = normalizeSuttaId(routeId)
    const normalizedCanonicalId = canonicalId ? normalizeSuttaId(canonicalId) : null

    return VERIFIED_SOURCE_GAPS.find((gap) => {
        if (gap.lang !== lang) return false
        if (gap.matchScope === 'route') {
            return gap.matchId === normalizedRouteId
        }

        return Boolean(normalizedCanonicalId) && gap.matchId === normalizedCanonicalId
    }) || null
}
