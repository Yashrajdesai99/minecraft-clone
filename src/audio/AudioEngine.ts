export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  public async init(): Promise<void> {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.effectsGain = this.audioContext.createGain();

    this.musicGain.connect(this.masterGain);
    this.effectsGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
  }

  public async loadSound(name: string, url: string): Promise<void> {
    if (!this.audioContext) return;

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.sounds.set(name, audioBuffer);
  }

  public playSound(name: string, volume: number = 1.0): void {
    if (!this.audioContext || !this.sounds.has(name)) return;

    const buffer = this.sounds.get(name)!;
    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();

    source.buffer = buffer;
    gain.gain.value = volume;
    gain.connect(this.effectsGain);
    source.connect(gain);
    source.start(0);
  }

  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public setMusicVolume(volume: number): void {
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public setEffectsVolume(volume: number): void {
    if (this.effectsGain) {
      this.effectsGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}
