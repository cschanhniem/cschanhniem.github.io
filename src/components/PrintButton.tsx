import { useReactToPrint } from 'react-to-print'
import { Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PrintButtonProps {
    contentRef: React.RefObject<HTMLDivElement | null>
    title?: string
    className?: string
}

export function PrintButton({ contentRef, title, className = '' }: PrintButtonProps) {
    const { t } = useTranslation()

    // We need a stable reference to the function, but useReactToPrint returns a function directly
    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle: title || 'document',
        onPrintError: (error) => console.error('Print failed:', error),
    })

    return (
        <button
            onClick={() => handlePrint()}
            className={`p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground ${className}`}
            title={t('common.exportPdf') || 'Xuất PDF'}
            aria-label={t('common.exportPdf') || 'Xuất PDF'}
        >
            <Printer className="h-5 w-5" />
        </button>
    )
}
