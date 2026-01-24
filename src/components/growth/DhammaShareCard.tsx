import { useEffect, useMemo, useState } from 'react'
import { Download, Copy, Share2, Sparkles } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { useTranslation } from 'react-i18next'

type DhammaShareCardProps = {
  quote: string
  source: string
  title?: string
  onQuoteChange?: (value: string) => void
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  words.forEach(word => {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth) {
      if (line) lines.push(line)
      line = word
    } else {
      line = testLine
    }
  })
  if (line) lines.push(line)
  return lines
}

export function DhammaShareCard({ quote, source, title, onQuoteChange }: DhammaShareCardProps) {
  const { t } = useTranslation()
  const [imageUrl, setImageUrl] = useState('')

  const safeQuote = quote.trim().slice(0, 280)

  const canvasData = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)
    gradient.addColorStop(0, '#F6E7D1')
    gradient.addColorStop(1, '#EBD0B5')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    ctx.fillStyle = '#3A2F2A'
    ctx.font = '600 52px "Noto Serif", serif'
    const lines = wrapText(ctx, safeQuote, 860)
    const startY = 280
    const lineHeight = 70
    lines.slice(0, 7).forEach((line, i) => {
      ctx.fillText(line, 110, startY + i * lineHeight)
    })

    ctx.font = '400 28px "Inter", sans-serif'
    ctx.fillStyle = '#5C4A3F'
    ctx.fillText(source, 110, 920)

    if (title) {
      ctx.font = '600 26px "Inter", sans-serif'
      ctx.fillStyle = '#7A5B45'
      ctx.fillText(title, 110, 960)
    }

    ctx.font = '700 90px "Noto Serif", serif'
    ctx.fillStyle = '#C79B63'
    ctx.fillText('“', 90, 190)

    return canvas.toDataURL('image/png')
  }, [safeQuote, source, title])

  useEffect(() => {
    setImageUrl(canvasData)
  }, [canvasData])

  const handleDownload = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'nhapluu-dhamma-card.png'
    link.click()
    trackEvent('share_card', { action: 'download', source })
  }

  const handleCopy = async () => {
    if (!navigator.clipboard?.writeText) return
    await navigator.clipboard.writeText(`${safeQuote} - ${source}`)
    trackEvent('share_card', { action: 'copy', source })
  }

  const handleShare = async () => {
    if (!navigator.share || !imageUrl) return
    const blob = await fetch(imageUrl).then(res => res.blob())
    const file = new File([blob], 'nhapluu-dhamma-card.png', { type: 'image/png' })
    await navigator.share({
      title: title || 'NhapLuu',
      text: safeQuote,
      files: [file]
    })
    trackEvent('share_card', { action: 'share', source })
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        {t('growth.shareCard.label')}
      </div>

      {onQuoteChange && (
        <textarea
          value={quote}
          onChange={(e) => onQuoteChange(e.target.value)}
          className="w-full min-h-[90px] px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}

      <div className="rounded-lg overflow-hidden border border-border bg-muted">
        {imageUrl && (
          <img src={imageUrl} alt="Dhamma Share Card" className="w-full h-auto" />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          {t('growth.shareCard.download')}
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80"
        >
          <Copy className="h-4 w-4" />
          {t('growth.shareCard.copy')}
        </button>
        {navigator.share && (
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80"
          >
            <Share2 className="h-4 w-4" />
            {t('growth.shareCard.share')}
          </button>
        )}
      </div>
    </div>
  )
}
