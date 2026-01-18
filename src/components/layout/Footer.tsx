import { useTranslation } from 'react-i18next'

declare const __BUILD_TIME__: string
declare const __GIT_HASH__: string

export function Footer() {
  const { t, i18n } = useTranslation()

  const formatBuildDate = () => {
    return new Date(__BUILD_TIME__).toLocaleDateString(
      i18n.language === 'vi' ? 'vi-VN' : 'en-US',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    )
  }

  return (
    <footer className="border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">{t('app.tagline')}</p>
        <p className="text-xs">{t('app.community')}</p>
        <p className="text-[10px] mt-3 opacity-50" title={`Build: ${__BUILD_TIME__}`}>
          v{__GIT_HASH__} • {formatBuildDate()}
        </p>
      </div>
    </footer>
  )
}
