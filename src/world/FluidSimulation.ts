import * as THREE from 'three';
import { Chunk } from '../voxel/Chunk';
import { Logger } from '../utils/Logger';

const logger = new Logger('FluidSimulation');

export class FluidSimulation {
  private fluidQueue: Set<string> = new Set();
  private fluidMap: Map<string, number> = new Map();
  private tickCounter: number = 0;
  private tickInterval: number = 2; // Simulate every 2 ticks

  public getFluidKey(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }

  public setFluid(x: number, y: number, z: number, level: number): void {
    const key = this.getFluidKey(x, y, z);
    if (level > 0) {
      this.fluidMap.set(key, level);
      this.fluidQueue.add(key);
    } else {
      this.fluidMap.delete(key);
    }
  }

  public getFluidLevel(x: number, y: number, z: number): number {
    return this.fluidMap.get(this.getFluidKey(x, y, z)) || 0;
  }

  public update(chunks: Chunk[]): void {
    this.tickCounter++;
    if (this.tickCounter < this.tickInterval) return;

    this.tickCounter = 0;

    const queue = Array.from(this.fluidQueue);
    this.fluidQueue.clear();

    for (const key of queue) {
      const [x, y, z] = key.split(',').map(Number);
      const level = this.fluidMap.get(key) || 0;

      if (level === 0) continue;

      // Flow down if possible
      const below = this.getFluidLevel(x, y - 1, z);
      if (below === 0) {
        this.setFluid(x, y - 1, z, level);
      } else if (below < level) {
        this.setFluid(x, y - 1, z, Math.min(8, below + 1));
      }

      // Flow horizontally
      if (level > 1) {
        const horizontalLevel = level - 1;
        this.setFluid(x + 1, y, z, Math.max(this.getFluidLevel(x + 1, y, z), horizontalLevel));
        this.setFluid(x - 1, y, z, Math.max(this.getFluidLevel(x - 1, y, z), horizontalLevel));
        this.setFluid(x, y, z + 1, Math.max(this.getFluidLevel(x, y, z + 1), horizontalLevel));
        this.setFluid(x, y, z - 1, Math.max(this.getFluidLevel(x, y, z - 1), horizontalLevel));
      }
    }
  }
}
