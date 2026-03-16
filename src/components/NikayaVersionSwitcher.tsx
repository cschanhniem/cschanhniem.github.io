// Nikaya Version Switcher Component
// Keeps Nikaya translation choice to the curated 3-option set

import { useState } from 'react'
import { ChevronDown, Check, Globe, Sparkles } from 'lucide-react'
import type { NikayaLanguage, NikayaVersionType } from '@/types/nikaya'
import { getNikayaVersionLabel, type NikayaVersionOption } from '@/lib/nikaya-version-options'

interface NikayaVersionSwitcherProps {
    availableVersions: NikayaVersionOption[]
    selectedVersion: { lang: NikayaLanguage; type: NikayaVersionType }
    onVersionChange: (lang: NikayaLanguage, type: NikayaVersionType) => void
    comparisonMode?: boolean
    onComparisonToggle?: (enabled: boolean) => void
    secondVersion?: { lang: NikayaLanguage; type: NikayaVersionType }
    onSecondVersionChange?: (lang: NikayaLanguage, type: NikayaVersionType) => void
}

export function NikayaVersionSwitcher({
    availableVersions,
    selectedVersion,
    onVersionChange,
    comparisonMode = false,
    onComparisonToggle,
    secondVersion,
    onSecondVersionChange
}: NikayaVersionSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSecondOpen, setIsSecondOpen] = useState(false)

    const renderVersionDropdown = (
        selectedLang: NikayaLanguage,
        selectedType: NikayaVersionType,
        onChange: (lang: NikayaLanguage, type: NikayaVersionType) => void,
        isOpenState: boolean,
        setIsOpenState: (open: boolean) => void,
        label: string
    ) => (
        <div className="relative">
            <label className="block text-xs text-muted-foreground mb-1">{label}</label>
            <button
                onClick={() => setIsOpenState(!isOpenState)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {selectedType === 'improved' ? (
                        <Sparkles className="h-4 w-4 text-primary" />
                    ) : (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                        {getNikayaVersionLabel(selectedLang, selectedType)}
                    </span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpenState ? 'rotate-180' : ''}`} />
            </button>

            {isOpenState && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpenState(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 right-0 mt-1 py-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                        {availableVersions.map((version) => (
                            <div key={`${version.lang}:${version.type}`} className="px-1">
                                <button
                                    onClick={() => {
                                        onChange(version.lang, version.type)
                                        setIsOpenState(false)
                                    }}
                                    disabled={!version.available}
                                    className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm rounded-md
                        ${!version.available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}
                        ${selectedLang === version.lang && selectedType === version.type ? 'bg-primary/10 text-primary' : ''}
                      `}
                                >
                                    <div className="flex items-center gap-2">
                                        {version.type === 'improved' ? (
                                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        ) : (
                                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                        <span>{getNikayaVersionLabel(version.lang, version.type)}</span>
                                    </div>
                                    {selectedLang === version.lang && selectedType === version.type ? (
                                        <Check className="h-4 w-4 text-primary" />
                                    ) : null}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )

    return (
        <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
                {/* Primary version selector */}
                <div className="flex-1">
                    {renderVersionDropdown(
                        selectedVersion.lang,
                        selectedVersion.type,
                        onVersionChange,
                        isOpen,
                        setIsOpen,
                        comparisonMode ? 'Bản dịch 1' : 'Chọn bản dịch'
                    )}
                </div>

                {/* Comparison toggle */}
                {onComparisonToggle && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onComparisonToggle(!comparisonMode)}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${comparisonMode
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}
              `}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                            So Sánh
                        </button>
                    </div>
                )}

                {/* Secondary version selector (comparison mode) */}
                {comparisonMode && secondVersion && onSecondVersionChange && (
                    <div className="flex-1">
                        {renderVersionDropdown(
                            secondVersion.lang,
                            secondVersion.type,
                            onSecondVersionChange,
                            isSecondOpen,
                            setIsSecondOpen,
                            'Bản dịch 2'
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
