export class TimeSystem {
  private deltaTime: number = 0;
  private fixedDeltaTime: number = 1 / 60; // 60 ticks per second
  private gameTime: number = 0; // In seconds
  private worldTime: number = 0; // In game ticks
  private dayTime: number = 0; // 0-24000 (Minecraft-like)
  private paused: boolean = false;
  private tick: number = 0;

  // Day/night cycle: 20 minutes per day
  private readonly TICKS_PER_DAY = 24000;
  private readonly TICK_DURATION = (20 * 60) / 24000; // seconds

  public update(deltaTime: number): void {
    if (this.paused) return;

    this.deltaTime = deltaTime;
    this.gameTime += deltaTime;
    this.worldTime += deltaTime / this.fixedDeltaTime;
    
    // Update day/night cycle
    this.dayTime = (this.dayTime + deltaTime / this.TICK_DURATION) % this.TICKS_PER_DAY;
    this.tick = Math.floor(this.worldTime);
  }

  public getDeltaTime(): number {
    return this.deltaTime;
  }

  public getFixedDeltaTime(): number {
    return this.fixedDeltaTime;
  }

  public getGameTime(): number {
    return this.gameTime;
  }

  public getWorldTime(): number {
    return this.worldTime;
  }

  public getDayTime(): number {
    return this.dayTime;
  }

  public getTick(): number {
    return this.tick;
  }

  public isDay(): boolean {
    return this.dayTime > 0 && this.dayTime < 12000;
  }

  public isNight(): boolean {
    return this.dayTime >= 12000 || this.dayTime < 0;
  }

  public pause(): void {
    this.paused = true;
  }

  public unpause(): void {
    this.paused = false;
  }

  public isPaused(): boolean {
    return this.paused;
  }
}
