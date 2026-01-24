import { Sprout, Leaf, TreePine, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '@/lib/analytics'

type BodhiGardenProps = {
  practiceDays: number
  currentStreak: number
  onShare?: () => void
}

const stages = [
  { min: 0, max: 6, key: 'seed', icon: Sprout },
  { min: 7, max: 20, key: 'sprout', icon: Leaf },
  { min: 21, max: 48, key: 'sapling', icon: TreePine },
  { min: 49, max: 99, key: 'tree', icon: TreePine },
  { min: 100, max: Number.POSITIVE_INFINITY, key: 'bodhi', icon: Star }
]

export function BodhiGarden({ practiceDays, currentStreak, onShare }: BodhiGardenProps) {
  const { t } = useTranslation()
  const stage = stages.find(s => practiceDays >= s.min && practiceDays <= s.max) || stages[0]
  const nextMilestone = stage.max === Number.POSITIVE_INFINITY ? null : stage.max + 1
  const progressInStage = stage.max === Number.POSITIVE_INFINITY
    ? 1
    : (practiceDays - stage.min) / (stage.max - stage.min + 1)

  const Icon = stage.icon

  const milestones = [7, 21, 49]
  const reachedMilestone = milestones.includes(currentStreak)

  const handleShare = () => {
    trackEvent('share_milestone', { streak: currentStreak })
    onShare?.()
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t('growth.bodhiGarden.label')}
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            {t(`growth.bodhiGarden.stages.${stage.key}.title`)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(`growth.bodhiGarden.stages.${stage.key}.description`)}
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min(100, Math.round(progressInStage * 100))}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{t('growth.bodhiGarden.practiceDays', { count: practiceDays })}</span>
          {nextMilestone && (
            <span>{t('growth.bodhiGarden.nextMilestone', { count: nextMilestone })}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t('growth.bodhiGarden.currentStreak')}</p>
          <p className="text-xl font-semibold text-foreground">{currentStreak}</p>
        </div>
        {reachedMilestone && (
          <button
            onClick={handleShare}
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            {t('growth.bodhiGarden.share')}
          </button>
        )}
      </div>
    </div>
  )
}
