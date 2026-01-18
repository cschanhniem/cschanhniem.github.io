import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '@/hooks/useAppState'
import { useToast } from '@/components/ui/toast'
import { MeditationTimer } from '@/components/practice/MeditationTimer'
import { MeditationLogger } from '@/components/practice/MeditationLogger'
import { Timer, BookText, CheckSquare, BrainCircuit, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function Practice() {
  const { t, i18n } = useTranslation()
  const { state, addMeditationSession, deleteMeditationSession, addPreceptsRecord } = useAppState()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<'timer' | 'log' | 'precepts' | 'guide'>('timer')

  const [preceptsType, setPreceptsType] = useState<'five' | 'eight'>('five')
  const [precepts, setPrecepts] = useState<{ [key: number]: boolean }>({})

  const preceptsList = preceptsType === 'five' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7, 8]

  const handleTimerComplete = (duration: number, quality?: number, notes?: string, ambientSound?: string) => {
    addMeditationSession({
      date: new Date().toISOString(),
      duration,
      type: 'anapanasati',
      quality: (quality || 3) as 1 | 2 | 3 | 4 | 5,
      notes,
      ambientSound: ambientSound as 'rain' | 'forest' | 'temple' | 'stream' | undefined
    })
    addToast(t('practice.timer.sessionSaved'), 'success')
  }

  const handleSavePrecepts = () => {
    addPreceptsRecord({
      date: new Date().toISOString(),
      type: preceptsType,
      precepts
    })
    setPrecepts({})
    addToast(t('practice.precepts.saved'), 'success')
  }

  const tabs = [
    { id: 'timer', name: t('practice.tabs.timer'), icon: Timer },
    { id: 'log', name: t('practice.tabs.log'), icon: BookText },
    { id: 'precepts', name: t('practice.tabs.precepts'), icon: CheckSquare },
    { id: 'guide', name: t('practice.tabs.guide'), icon: BrainCircuit }
  ]

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {t('practice.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('practice.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`
                  flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {activeTab === 'timer' && (
          <div className="md:col-span-2">
            <MeditationTimer onComplete={handleTimerComplete} />
          </div>
        )}

        {activeTab === 'log' && (
          <div className="md:col-span-2">
            <MeditationLogger
              onAdd={addMeditationSession}
              sessions={state.meditationSessions}
              onDelete={deleteMeditationSession}
            />
          </div>
        )}

        {activeTab === 'precepts' && (
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('practice.precepts.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('practice.precepts.description')}
                </p>
              </div>

              {/* Type Selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('practice.precepts.type')}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPreceptsType('five')}
                    className={`
                      flex-1 py-3 px-4 rounded-md font-medium transition-colors
                      ${preceptsType === 'five'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    {t('practice.precepts.five')}
                  </button>
                  <button
                    onClick={() => setPreceptsType('eight')}
                    className={`
                      flex-1 py-3 px-4 rounded-md font-medium transition-colors
                      ${preceptsType === 'eight'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    {t('practice.precepts.eight')}
                  </button>
                </div>
              </div>

              {/* Precepts Checklist */}
              <div className="space-y-3">
                {preceptsList.map((num) => (
                  <label key={num} className="flex items-start space-x-3 p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80">
                    <input
                      type="checkbox"
                      checked={precepts[num] || false}
                      onChange={(e) => setPrecepts({ ...precepts, [num]: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {num}. {t(`practice.precepts.list.${num}`)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t(`practice.precepts.list.${num}_pali`)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={handleSavePrecepts}
                className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90"
              >
                {t('practice.precepts.save')}
              </button>

              {/* Recent Records */}
              <div className="border-t border-border pt-6">
                <h4 className="font-semibold text-foreground mb-3">{t('practice.precepts.history')}</h4>
                {state.preceptsRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('practice.precepts.noRecords')}</p>
                ) : (
                  <div className="space-y-2">
                    {state.preceptsRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {record.type === 'five' ? t('practice.precepts.five') : t('practice.precepts.eight')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(record.date)}
                          </div>
                        </div>
                        <div className="text-sm text-primary font-medium">
                          {Object.values(record.precepts).filter(Boolean).length}/{record.type === 'five' ? 5 : 8} {t('practice.precepts.preceptsWord')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="md:col-span-2 space-y-4">
            <Link to="/thien-dinh/thu-gian" className="block">
              <div className="bg-card hover:bg-muted/50 transition-colors border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 group">
                <div className="p-4 bg-primary/10 rounded-full flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-foreground mb-2">{t('practice.guide.wakeful.title')}</h3>
                  <p className="text-muted-foreground mb-4 md:mb-0">
                    {t('practice.guide.wakeful.description')}
                  </p>
                </div>
                <Button className="flex-shrink-0" variant="outline">
                  {t('practice.guide.wakeful.start')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
