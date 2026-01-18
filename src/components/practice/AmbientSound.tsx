import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Volume2, VolumeX, Droplets, Trees, Music, Waves } from 'lucide-react'

export type AmbientSoundType = 'none' | 'rain' | 'forest' | 'temple' | 'stream'

interface AmbientSoundProps {
  isPlaying: boolean
  onSoundChange?: (sound: AmbientSoundType) => void
}

// Web Audio API sound generators
class AmbientSoundEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private noiseNode: AudioBufferSourceNode | null = null
  private oscillators: OscillatorNode[] = []
  private intervalId: number | null = null
  private currentSound: AmbientSoundType = 'none'

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = 0.3
    }
    return this.audioContext
  }

  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(volume, this.audioContext!.currentTime, 0.1)
    }
  }

  stop() {
    if (this.noiseNode) {
      this.noiseNode.stop()
      this.noiseNode = null
    }
    this.oscillators.forEach(osc => {
      try { osc.stop() } catch { /* ignore */ }
    })
    this.oscillators = []
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.currentSound = 'none'
  }

  private createNoiseBuffer(type: 'white' | 'pink' | 'brown'): AudioBuffer {
    const ctx = this.audioContext!
    const bufferSize = ctx.sampleRate * 2 // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
        b6 = white * 0.115926
      }
    } else { // brown
      let lastOut = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = data[i]
        data[i] *= 3.5
      }
    }
    return buffer
  }

  playRain() {
    this.stop()
    const ctx = this.init()
    this.currentSound = 'rain'

    // Pink noise filtered for rain
    const noiseBuffer = this.createNoiseBuffer('pink')
    this.noiseNode = ctx.createBufferSource()
    this.noiseNode.buffer = noiseBuffer
    this.noiseNode.loop = true

    // Bandpass filter for rain sound
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1000
    filter.Q.value = 0.5

    // Second filter for more natural sound
    const filter2 = ctx.createBiquadFilter()
    filter2.type = 'lowpass'
    filter2.frequency.value = 4000

    const gain = ctx.createGain()
    gain.gain.value = 0.4

    this.noiseNode.connect(filter)
    filter.connect(filter2)
    filter2.connect(gain)
    gain.connect(this.masterGain!)

    this.noiseNode.start()

    // Add occasional louder drops
    this.intervalId = window.setInterval(() => {
      if (this.currentSound !== 'rain') return
      const dropOsc = ctx.createOscillator()
      const dropGain = ctx.createGain()
      dropOsc.frequency.value = 100 + Math.random() * 200
      dropOsc.type = 'sine'
      dropGain.gain.setValueAtTime(0, ctx.currentTime)
      dropGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01)
      dropGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      dropOsc.connect(dropGain)
      dropGain.connect(this.masterGain!)
      dropOsc.start()
      dropOsc.stop(ctx.currentTime + 0.1)
    }, 200 + Math.random() * 300)
  }

  playForest() {
    this.stop()
    const ctx = this.init()
    this.currentSound = 'forest'

    // Soft wind - brown noise
    const windBuffer = this.createNoiseBuffer('brown')
    this.noiseNode = ctx.createBufferSource()
    this.noiseNode.buffer = windBuffer
    this.noiseNode.loop = true

    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'lowpass'
    windFilter.frequency.value = 500

    const windGain = ctx.createGain()
    windGain.gain.value = 0.15

    this.noiseNode.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(this.masterGain!)
    this.noiseNode.start()

    // Bird sounds - occasional chirps
    this.intervalId = window.setInterval(() => {
      if (this.currentSound !== 'forest') return
      if (Math.random() > 0.3) return // Only 30% chance

      const birdOsc = ctx.createOscillator()
      const birdGain = ctx.createGain()

      const baseFreq = 1500 + Math.random() * 2000
      birdOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
      birdOsc.frequency.linearRampToValueAtTime(baseFreq * 1.2, ctx.currentTime + 0.05)
      birdOsc.frequency.linearRampToValueAtTime(baseFreq * 0.9, ctx.currentTime + 0.1)
      birdOsc.type = 'sine'

      birdGain.gain.setValueAtTime(0, ctx.currentTime)
      birdGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02)
      birdGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)

      birdOsc.connect(birdGain)
      birdGain.connect(this.masterGain!)
      birdOsc.start()
      birdOsc.stop(ctx.currentTime + 0.15)
      this.oscillators.push(birdOsc)
    }, 2000 + Math.random() * 3000)
  }

  playTemple() {
    this.stop()
    const ctx = this.init()
    this.currentSound = 'temple'

    // Very soft drone
    const drone = ctx.createOscillator()
    drone.frequency.value = 110
    drone.type = 'sine'

    const droneGain = ctx.createGain()
    droneGain.gain.value = 0.03

    drone.connect(droneGain)
    droneGain.connect(this.masterGain!)
    drone.start()
    this.oscillators.push(drone)

    // Periodic soft bells
    const playBell = () => {
      if (this.currentSound !== 'temple') return

      const frequencies = [523, 659, 784] // C5, E5, G5
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.frequency.value = freq
        osc.type = 'sine'

        const startTime = ctx.currentTime + i * 0.02
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.06, startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 4)

        osc.connect(gain)
        gain.connect(this.masterGain!)
        osc.start(startTime)
        osc.stop(startTime + 4)
      })
    }

    playBell()
    this.intervalId = window.setInterval(playBell, 15000) // Every 15 seconds
  }

  playStream() {
    this.stop()
    const ctx = this.init()
    this.currentSound = 'stream'

    // White noise filtered for water
    const waterBuffer = this.createNoiseBuffer('white')
    this.noiseNode = ctx.createBufferSource()
    this.noiseNode.buffer = waterBuffer
    this.noiseNode.loop = true

    // Multiple filters for water texture
    const filter1 = ctx.createBiquadFilter()
    filter1.type = 'bandpass'
    filter1.frequency.value = 2000
    filter1.Q.value = 1

    const filter2 = ctx.createBiquadFilter()
    filter2.type = 'highpass'
    filter2.frequency.value = 200

    // LFO for wave motion
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.3
    lfoGain.gain.value = 500
    lfo.connect(lfoGain)
    lfoGain.connect(filter1.frequency)
    lfo.start()
    this.oscillators.push(lfo)

    const gain = ctx.createGain()
    gain.gain.value = 0.2

    this.noiseNode.connect(filter1)
    filter1.connect(filter2)
    filter2.connect(gain)
    gain.connect(this.masterGain!)

    this.noiseNode.start()
  }

  play(type: AmbientSoundType) {
    switch (type) {
      case 'rain':
        this.playRain()
        break
      case 'forest':
        this.playForest()
        break
      case 'temple':
        this.playTemple()
        break
      case 'stream':
        this.playStream()
        break
      default:
        this.stop()
    }
  }

  fadeOut(duration: number = 2) {
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setTargetAtTime(0, this.audioContext.currentTime, duration / 3)
      setTimeout(() => this.stop(), duration * 1000)
    }
  }
}

// Singleton instance
let soundEngine: AmbientSoundEngine | null = null

export function useAmbientSound() {
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none')
  const [volume, setVolumeState] = useState(0.3)
  const engineRef = useRef<AmbientSoundEngine | null>(null)

  useEffect(() => {
    if (!soundEngine) {
      soundEngine = new AmbientSoundEngine()
    }
    engineRef.current = soundEngine

    // Load saved preference
    const saved = localStorage.getItem('nhapluu_ambient_sound')
    const savedVolume = localStorage.getItem('nhapluu_ambient_volume')
    if (saved) setCurrentSound(saved as AmbientSoundType)
    if (savedVolume) setVolumeState(parseFloat(savedVolume))

    return () => {
      // Don't stop on unmount - let it continue
    }
  }, [])

  const play = useCallback((type: AmbientSoundType) => {
    setCurrentSound(type)
    localStorage.setItem('nhapluu_ambient_sound', type)
    engineRef.current?.play(type)
  }, [])

  const stop = useCallback(() => {
    setCurrentSound('none')
    engineRef.current?.stop()
  }, [])

  const fadeOut = useCallback((duration?: number) => {
    engineRef.current?.fadeOut(duration)
    setTimeout(() => setCurrentSound('none'), (duration || 2) * 1000)
  }, [])

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol)
    localStorage.setItem('nhapluu_ambient_volume', vol.toString())
    engineRef.current?.setVolume(vol)
  }, [])

  return { currentSound, volume, play, stop, fadeOut, setVolume }
}

export function AmbientSoundSelector({ isPlaying, onSoundChange }: AmbientSoundProps) {
  const { t } = useTranslation()
  const { currentSound, volume, play, stop, setVolume } = useAmbientSound()

  useEffect(() => {
    if (!isPlaying && currentSound !== 'none') {
      // Keep playing but could fade out when timer stops
    }
  }, [isPlaying, currentSound])

  const sounds: { type: AmbientSoundType; icon: typeof Droplets; label: string }[] = [
    { type: 'none', icon: VolumeX, label: t('practice.ambient.none') },
    { type: 'rain', icon: Droplets, label: t('practice.ambient.rain') },
    { type: 'forest', icon: Trees, label: t('practice.ambient.forest') },
    { type: 'temple', icon: Music, label: t('practice.ambient.temple') },
    { type: 'stream', icon: Waves, label: t('practice.ambient.stream') },
  ]

  const handleSoundSelect = (type: AmbientSoundType) => {
    if (type === 'none') {
      stop()
    } else {
      play(type)
    }
    onSoundChange?.(type)
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Volume2 className="h-4 w-4" />
        {t('practice.ambient.title')}
      </label>

      <div className="flex flex-wrap gap-2">
        {sounds.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => handleSoundSelect(type)}
            className={`
              flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all
              ${currentSound === type
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {currentSound !== 'none' && (
        <div className="flex items-center gap-3 pt-2">
          <VolumeX className="h-4 w-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
