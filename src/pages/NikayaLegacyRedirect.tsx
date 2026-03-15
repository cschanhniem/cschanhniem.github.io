import { Navigate, useParams } from 'react-router-dom'
import { getNikayaDetailPath } from '@/lib/nikaya-routes'

export function NikayaLegacyRedirect() {
  const { legacySuttaId } = useParams<{ legacySuttaId: string }>()

  if (!legacySuttaId) {
    return <Navigate to="/nikaya" replace />
  }

  return <Navigate to={getNikayaDetailPath(legacySuttaId)} replace />
}
