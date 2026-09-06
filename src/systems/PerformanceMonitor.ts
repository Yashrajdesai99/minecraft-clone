export class PerformanceMonitor {
  private frameTime: number = 0;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private cpuTime: number = 0;
  private gpuTime: number = 0;
  private memoryUsage: number = 0;
  private drawCalls: number = 0;
  private vertices: number = 0;
  private chunks: number = 0;
  private entities: number = 0;

  public update(deltaTime: number): void {
    this.frameTime = deltaTime;
    this.frameCount++;

    const now = performance.now();
    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;

      if ((performance as any).memory) {
        this.memoryUsage = (performance as any).memory.usedJSHeapSize / 1048576; // MB
      }
    }
  }

  public setStats(
    drawCalls: number,
    vertices: number,
    chunks: number,
    entities: number
  ): void {
    this.drawCalls = drawCalls;
    this.vertices = vertices;
    this.chunks = chunks;
    this.entities = entities;
  }

  public getStats(): any {
    return {
      fps: this.fps,
      frameTime: this.frameTime.toFixed(2),
      drawCalls: this.drawCalls,
      vertices: this.vertices,
      chunks: this.chunks,
      entities: this.entities,
      memoryMB: this.memoryUsage.toFixed(1)
    };
  }
}
