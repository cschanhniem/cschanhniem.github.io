import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Check, Volume2, Clock } from 'lucide-react'
import { AmbientSoundSelector, useAmbientSound, type AmbientSoundType } from './AmbientSound'

interface MeditationTimerProps {
  onComplete: (duration: number, quality?: number, notes?: string, ambientSound?: AmbientSoundType) => void
}

/**
 * Creates a meditation bell sound using Web Audio API
 * Generates a gentle, resonant bell tone typical of meditation timers
 */
function playMeditationBell() {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

  // Create multiple oscillators for a richer bell sound
  const frequencies = [528, 396, 639] // Solfeggio frequencies for harmony

  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Bell-like waveform
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

    // Envelope: quick attack, long decay (bell-like)
    const startTime = audioContext.currentTime + (index * 0.05)
    const volume = 0.3 / (index + 1) // Decreasing volume for harmonics

    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01) // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 3) // Long decay

    oscillator.start(startTime)
    oscillator.stop(startTime + 3)
  })

  // Add a higher pitched "ting" for clarity
  const tingOsc = audioContext.createOscillator()
  const tingGain = audioContext.createGain()

  tingOsc.connect(tingGain)
  tingGain.connect(audioContext.destination)

  tingOsc.type = 'sine'
  tingOsc.frequency.setValueAtTime(1056, audioContext.currentTime) // High C

  tingGain.gain.setValueAtTime(0, audioContext.currentTime)
  tingGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.005)
  tingGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2)

  tingOsc.start(audioContext.currentTime)
  tingOsc.stop(audioContext.currentTime + 2)
}

export function MeditationTimer({ onComplete }: MeditationTimerProps) {
  const { t } = useTranslation()
  const [duration, setDuration] = useState(25) // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60) // seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [bellEnabled, setBellEnabled] = useState(true)
  const [prepCountdown, setPrepCountdown] = useState(0) // 0, 1, 2, or 3 minutes
  const [isPreparing, setIsPreparing] = useState(false)
  const [prepTimeLeft, setPrepTimeLeft] = useState(0)

  // Quality tracking state
  const [showQuality, setShowQuality] = useState(false)
  const [quality, setQuality] = useState(3)
  const [notes, setNotes] = useState('')

  // Ambient sound
  const { currentSound, fadeOut: fadeOutSound } = useAmbientSound()
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>('none')

  const intervalRef = useRef<number | undefined>(undefined)

  // Memoized bell function
  const ringBell = useCallback(() => {
    if (bellEnabled) {
      playMeditationBell()
    }
  }, [bellEnabled])

  useEffect(() => {
    setTimeLeft(duration * 60)
  }, [duration])

  // Preparation countdown
  useEffect(() => {
    if (isPreparing && prepTimeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setPrepTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPreparing(false)
            setIsRunning(true)
            ringBell() // Bell to start meditation
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (isPreparing && prepTimeLeft === 0) {
      setIsPreparing(false)
      setIsRunning(true)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPreparing, prepTimeLeft, ringBell])

  // Main timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsCompleted(true)
            setShowQuality(true)
            // Play meditation bell sound when timer completes
            ringBell()
            // Fade out ambient sound over 3 seconds
            if (currentSound !== 'none') {
              fadeOutSound(3)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, ringBell, currentSound, fadeOutSound])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    // Track which sound was selected at start
    setSelectedSound(currentSound)
    if (prepCountdown > 0) {
      setIsPreparing(true)
      setPrepTimeLeft(prepCountdown * 60)
    } else {
      setIsRunning(true)
    }
  }

  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setIsPreparing(false)
    setTimeLeft(duration * 60)
    setPrepTimeLeft(0)
    setIsCompleted(false)
    setShowQuality(false)
    setQuality(3)
    setNotes('')
    setSelectedSound('none')
  }

  const handleComplete = () => {
    onComplete(duration, quality, notes, selectedSound)
    handleReset()
  }

  const progress = isPreparing
    ? ((prepCountdown * 60 - prepTimeLeft) / (prepCountdown * 60)) * 100
    : ((duration * 60 - timeLeft) / (duration * 60)) * 100

  const presets = [5, 10, 15, 20, 25, 30, 45, 60]
  const prepOptions = [0, 1, 2, 3]

  return (
    <div className="bg-card rounded-lg border border-border p-8">
      <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
        {t('practice.timer.title')}
      </h3>

      {/* Duration Selector */}
      {!isRunning && !isCompleted && !isPreparing && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground">
              {t('practice.timer.duration')}
            </label>
            <button
              onClick={() => setBellEnabled(!bellEnabled)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                bellEnabled
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
              title={bellEnabled ? t('practice.timer.bellOn') : t('practice.timer.bellOff')}
            >
              <Volume2 className="h-3 w-3" />
              {bellEnabled ? t('practice.timer.bellOn') : t('practice.timer.bellOff')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((min) => (
              <button
                key={min}
                onClick={() => setDuration(min)}
                className={`
                  py-2 px-4 rounded-md text-sm font-medium transition-colors
                  ${duration === min
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                {min} {t('practice.timer.min')}
              </button>
            ))}
          </div>

          {/* Preparation countdown selector */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Clock className="h-4 w-4" />
              {t('practice.timer.prepTime')}
            </label>
            <div className="flex gap-2">
              {prepOptions.map((min) => (
                <button
                  key={min}
                  onClick={() => setPrepCountdown(min)}
                  className={`
                    flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
                    ${prepCountdown === min
                      ? 'bg-primary/20 text-primary border border-primary'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {min === 0 ? t('practice.timer.noPrep') : `${min} ${t('practice.timer.min')}`}
                </button>
              ))}
            </div>
          </div>

          {/* Ambient Sound Selector */}
          <AmbientSoundSelector isPlaying={isRunning || isPreparing} />
        </div>
      )}

      {/* Timer Display */}
      <div className="relative mb-6">
        <svg className="w-full h-64" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 80}`}
            strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
            transform="rotate(-90 100 100)"
            className={`transition-all duration-1000 ${isPreparing ? 'text-yellow-500' : 'text-primary'}`}
          />
          {/* Time text */}
          <text
            x="100"
            y="90"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-4xl font-bold fill-current text-foreground"
          >
            {isPreparing ? formatTime(prepTimeLeft) : formatTime(timeLeft)}
          </text>
          {isPreparing && (
            <text
              x="100"
              y="120"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm fill-current text-muted-foreground"
            >
              {t('practice.timer.preparing')}
            </text>
          )}
        </svg>
      </div>

      {/* Quality Rating (shown after completion) */}
      {showQuality && (
        <div className="mb-6 p-4 bg-muted rounded-lg space-y-4">
          <h4 className="font-medium text-foreground text-center">{t('practice.timer.howWasSession')}</h4>

          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setQuality(star)}
                className={`text-3xl transition-transform hover:scale-110 ${
                  star <= quality ? 'text-yellow-500' : 'text-muted-foreground/30'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {quality === 1 && t('practice.timer.quality.1')}
            {quality === 2 && t('practice.timer.quality.2')}
            {quality === 3 && t('practice.timer.quality.3')}
            {quality === 4 && t('practice.timer.quality.4')}
            {quality === 5 && t('practice.timer.quality.5')}
          </p>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('practice.timer.notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('practice.timer.notesPlaceholder')}
              className="w-full p-3 rounded-md border border-border bg-background text-foreground text-sm resize-none"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!isRunning && !isCompleted && !isPreparing && (
          <Button onClick={handleStart} className="bg-primary text-primary-foreground">
            <Play className="mr-2 h-4 w-4" />
            {t('practice.timer.start')}
          </Button>
        )}
        {isPreparing && (
          <Button onClick={() => { setIsPreparing(false); setIsRunning(true); setPrepTimeLeft(0); }} variant="outline">
            {t('practice.timer.skipPrep')}
          </Button>
        )}
        {isRunning && (
          <Button onClick={handlePause} variant="outline">
            <Pause className="mr-2 h-4 w-4" />
            {t('practice.timer.pause')}
          </Button>
        )}
        {(isRunning || isPreparing || timeLeft < duration * 60) && !isCompleted && (
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            {t('practice.timer.reset')}
          </Button>
        )}
        {isCompleted && (
          <Button onClick={handleComplete} className="bg-primary text-primary-foreground">
            <Check className="mr-2 h-4 w-4" />
            {t('practice.timer.complete')}
          </Button>
        )}
      </div>

      {/* Test Bell Button (only when not running) */}
      {!isRunning && !isCompleted && !isPreparing && bellEnabled && (
        <div className="mt-4 text-center">
          <button
            onClick={ringBell}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
          >
            🔔 {t('practice.timer.testBell')}
          </button>
        </div>
      )}

      {/* Instructions */}
      {!showQuality && (
        <div className="mt-6 p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground text-center">
            {t('practice.timer.instructions')}
          </p>
        </div>
      )}
    </div>
  )
}
