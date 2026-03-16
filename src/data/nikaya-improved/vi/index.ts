// Improved Vietnamese Translations Index
// NhậpLưu 2026 Translation Project

import { mn1 } from './mn-1'
import { mn2 } from './mn-2'
import { mn3 } from './mn-3'
import { mn4 } from './mn-4'
import { mn5 } from './mn-5'
import { an1_1 } from './an-1-1'
import { an1_2 } from './an-1-2'
import { an1_3 } from './an-1-3'
import { an1_4 } from './an-1-4'
import { an1_5 } from './an-1-5'
import { an1_6 } from './an-1-6'
import { an1_7 } from './an-1-7'
import { an1_8 } from './an-1-8'
import { an1_9 } from './an-1-9'
import { an1_10 } from './an-1-10'
import { mn10 } from './mn-10'
import { dn1 } from './dn-1'
import { dn2 } from './dn-2'
import { dn22 } from './dn-22'
import { dn20 } from './dn-20'
import { dn6 } from './dn-6'
import { dn7 } from './dn-7'
import { dn10 } from './dn-10'
import { dn31 } from './dn-31'
import { kp1 } from './kp-1'
import { kp2 } from './kp-2'
import { kp3 } from './kp-3'
import { kp4 } from './kp-4'
import { kp5 } from './kp-5'
import { kp6 } from './kp-6'
import { kp7 } from './kp-7'
import { kp8 } from './kp-8'
import { kp9 } from './kp-9'
import { mn118 } from './mn-118'
import { sn12_2 } from './sn-12-2'
import { sn12_15 } from './sn-12-15'
import { sn22_59 } from './sn-22-59'
import { sn35_28 } from './sn-35-28'
import { sn47_42 } from './sn-47-42'
import { sn56_1 } from './sn-56-1'
import { sn5611 } from './sn-56-11'
import type { ImprovedTranslation } from '@/types/nikaya'

// All improved Vietnamese translations
export const viImproved: Record<string, ImprovedTranslation> = {
    'an1.1': an1_1,
    'an1.2': an1_2,
    'an1.3': an1_3,
    'an1.4': an1_4,
    'an1.5': an1_5,
    'an1.6': an1_6,
    'an1.7': an1_7,
    'an1.8': an1_8,
    'an1.9': an1_9,
    'an1.10': an1_10,
    'mn1': mn1,
    'mn2': mn2,
    'mn3': mn3,
    'mn4': mn4,
    'mn5': mn5,
    'dn1': dn1,
    'dn2': dn2,
    'dn6': dn6,
    'dn7': dn7,
    'dn10': dn10,
    'dn20': dn20,
    'mn10': mn10,
    'dn22': dn22,
    'dn31': dn31,
    'kp1': kp1,
    'kp2': kp2,
    'kp3': kp3,
    'kp4': kp4,
    'kp5': kp5,
    'kp6': kp6,
    'kp7': kp7,
    'kp8': kp8,
    'kp9': kp9,
    'mn118': mn118,
    'sn12.2': sn12_2,
    'sn12.15': sn12_15,
    'sn22.59': sn22_59,
    'sn35.28': sn35_28,
    'sn47.42': sn47_42,
    'sn56.1': sn56_1,
    'sn56.11': sn5611,
}

// Get improved translation by sutta ID
export function getImprovedVi(suttaId: string): ImprovedTranslation | null {
    const normalizedId = suttaId.toLowerCase().replace(/\s+/g, '')
    return viImproved[normalizedId] || null
}
