/**
 * Audio Manager - Game Audio & Haptic System
 *
 * Architectural Intent:
 * - Centralized audio management (music, effects, ambient)
 * - Haptic feedback coordination with audio
 * - Performance-optimized audio pooling
 * - Platform-specific audio handling
 * - Audio settings and preferences
 *
 * Key Design Decisions:
 * 1. Web Audio API for web platform
 * 2. Audio pooling for performance
 * 3. Haptic-audio coordination
 * 4. Settings persistence
 * 5. Context-aware audio (game type, phase)
 */

export interface AudioConfig {
  masterVolume: number;      // 0-1
  musicVolume: number;       // 0-1
  sfxVolume: number;         // 0-1
  ambientVolume: number;     // 0-1
  hapticsEnabled: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export interface HapticPattern {
  duration: number;          // ms
  intensity: number;         // 0-1
  delay?: number;           // ms
}

export interface AudioAsset {
  id: string;
  url: string;
  type: 'music' | 'sfx' | 'ambient' | 'ui';
  duration: number;
  loop?: boolean;
}

export interface SoundTrigger {
  eventType: string;
  audio: AudioAsset;
  haptic?: HapticPattern;
  volume?: number;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private config: AudioConfig;
  private audioPool: Map<string, AudioBufferSourceNode[]> = new Map();
  private activeAudio: Map<string, AudioBufferSourceNode> = new Map();
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private soundTriggers: Map<string, SoundTrigger> = new Map();
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private ambientGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;

  constructor(initialConfig?: Partial<AudioConfig>) {
    this.config = {
      masterVolume: 0.8,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      ambientVolume: 0.5,
      hapticsEnabled: true,
      musicEnabled: true,
      sfxEnabled: true,
      ...initialConfig
    };

    this.initializeAudioContext();
    this.setupGainNodes();
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Resume audio context on user interaction
      document.addEventListener('click', () => {
        if (this.audioContext?.state === 'suspended') {
          this.audioContext.resume();
        }
      });
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Setup gain nodes for volume control
   */
  private setupGainNodes(): void {
    if (!this.audioContext) return;

    const destination = this.audioContext.destination;

    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.gain.value = this.config.masterVolume;
    this.masterGainNode.connect(destination);

    this.musicGainNode = this.audioContext.createGain();
    this.musicGainNode.gain.value = this.config.musicVolume;
    this.musicGainNode.connect(this.masterGainNode);

    this.sfxGainNode = this.audioContext.createGain();
    this.sfxGainNode.gain.value = this.config.sfxVolume;
    this.sfxGainNode.connect(this.masterGainNode);

    this.ambientGainNode = this.audioContext.createGain();
    this.ambientGainNode.gain.value = this.config.ambientVolume;
    this.ambientGainNode.connect(this.masterGainNode);
  }

  /**
   * Load audio asset
   */
  async loadAudio(asset: AudioAsset): Promise<boolean> {
    if (!this.audioContext) return false;

    try {
      const response = await fetch(asset.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(asset.id, audioBuffer);
      return true;
    } catch (error) {
      console.error(`Failed to load audio ${asset.id}:`, error);
      return false;
    }
  }

  /**
   * Play sound effect
   */
  playSound(assetId: string, options?: { volume?: number; playbackRate?: number }): void {
    if (!this.audioContext || !this.config.sfxEnabled) return;

    const buffer = this.audioBuffers.get(assetId);
    if (!buffer) {
      console.warn(`Audio asset not found: ${assetId}`);
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gain = this.audioContext.createGain();
    gain.gain.value = options?.volume ?? 1;
    gain.connect(this.sfxGainNode!);

    source.connect(gain);

    if (options?.playbackRate) {
      source.playbackRate.value = options.playbackRate;
    }

    source.start(0);

    // Cleanup when finished
    source.onended = () => {
      this.activeAudio.delete(assetId);
    };

    this.activeAudio.set(assetId, source);
  }

  /**
   * Play background music
   */
  playMusic(assetId: string, fadeInDuration: number = 1000): void {
    if (!this.audioContext || !this.config.musicEnabled) return;

    const buffer = this.audioBuffers.get(assetId);
    if (!buffer) {
      console.warn(`Music asset not found: ${assetId}`);
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.audioContext.createGain();
    gain.gain.value = 0;
    gain.connect(this.musicGainNode!);
    source.connect(gain);

    // Fade in
    const fadeInTime = fadeInDuration / 1000;
    gain.gain.linearRampToValueAtTime(
      this.config.musicVolume,
      this.audioContext.currentTime + fadeInTime
    );

    source.start(0);

    // Store current music
    const currentMusic = this.activeAudio.get('_music');
    if (currentMusic) {
      currentMusic.stop();
    }

    this.activeAudio.set('_music', source);
  }

  /**
   * Stop music with fade out
   */
  stopMusic(fadeOutDuration: number = 1000): void {
    if (!this.audioContext) return;

    const music = this.activeAudio.get('_music');
    if (!music) return;

    const fadeOutTime = fadeOutDuration / 1000;
    this.musicGainNode!.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + fadeOutTime
    );

    setTimeout(() => {
      music.stop();
      this.activeAudio.delete('_music');
    }, fadeOutDuration);
  }

  /**
   * Trigger game event sound and haptics
   */
  triggerEvent(eventType: string): void {
    const trigger = this.soundTriggers.get(eventType);
    if (!trigger) return;

    // Play sound
    this.playSound(trigger.audio.id, { volume: trigger.volume });

    // Trigger haptics
    if (trigger.haptic && this.config.hapticsEnabled) {
      this.triggerHaptic(trigger.haptic);
    }
  }

  /**
   * Trigger haptic feedback
   */
  triggerHaptic(pattern: HapticPattern | HapticPattern[]): void {
    if (!this.config.hapticsEnabled) return;

    const patterns = Array.isArray(pattern) ? pattern : [pattern];

    for (const p of patterns) {
      setTimeout(() => {
        const duration = p.duration;
        const intensity = p.intensity;

        // Use Vibration API
        if (navigator.vibrate) {
          navigator.vibrate(duration * intensity);
        }

        // TODO: Use react-native Vibration on mobile
      }, p.delay ?? 0);
    }
  }

  /**
   * Register sound trigger for game event
   */
  registerSoundTrigger(eventType: string, trigger: SoundTrigger): void {
    this.soundTriggers.set(eventType, trigger);
  }

  /**
   * Update volume
   */
  setVolume(type: 'master' | 'music' | 'sfx' | 'ambient', value: number): void {
    value = Math.max(0, Math.min(1, value));

    if (type === 'master' && this.masterGainNode) {
      this.masterGainNode.gain.value = value;
      this.config.masterVolume = value;
    } else if (type === 'music' && this.musicGainNode) {
      this.musicGainNode.gain.value = value;
      this.config.musicVolume = value;
    } else if (type === 'sfx' && this.sfxGainNode) {
      this.sfxGainNode.gain.value = value;
      this.config.sfxVolume = value;
    } else if (type === 'ambient' && this.ambientGainNode) {
      this.ambientGainNode.gain.value = value;
      this.config.ambientVolume = value;
    }
  }

  /**
   * Toggle audio type
   */
  toggleAudio(type: 'music' | 'sfx' | 'haptics'): void {
    if (type === 'music') {
      this.config.musicEnabled = !this.config.musicEnabled;
      if (!this.config.musicEnabled) {
        this.stopMusic(500);
      }
    } else if (type === 'sfx') {
      this.config.sfxEnabled = !this.config.sfxEnabled;
    } else if (type === 'haptics') {
      this.config.hapticsEnabled = !this.config.hapticsEnabled;
    }
  }

  /**
   * Get current config
   */
  getConfig(): Readonly<AudioConfig> {
    return { ...this.config };
  }

  /**
   * Save audio preferences
   */
  savePreferences(): void {
    localStorage.setItem('audioConfig', JSON.stringify(this.config));
  }

  /**
   * Load audio preferences
   */
  loadPreferences(): void {
    const saved = localStorage.getItem('audioConfig');
    if (saved) {
      Object.assign(this.config, JSON.parse(saved));
      this.applyConfig();
    }
  }

  /**
   * Apply current config
   */
  private applyConfig(): void {
    this.setVolume('master', this.config.masterVolume);
    this.setVolume('music', this.config.musicVolume);
    this.setVolume('sfx', this.config.sfxVolume);
    this.setVolume('ambient', this.config.ambientVolume);
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    for (const source of this.activeAudio.values()) {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    }
    this.activeAudio.clear();
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager();
