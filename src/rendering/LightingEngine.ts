import * as THREE from 'three';
import { Logger } from '../utils/Logger';

const logger = new Logger('LightingEngine');

export interface LightData {
  blockLight: number; // 0-15
  sunLight: number; // 0-15
}

export class LightingEngine {
  private lightMap: Map<string, LightData> = new Map();
  private propagationQueue: Set<string> = new Set();

  public getLightKey(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }

  public getLight(x: number, y: number, z: number): LightData {
    const key = this.getLightKey(x, y, z);
    return this.lightMap.get(key) || { blockLight: 0, sunLight: 15 };
  }

  public setBlockLight(x: number, y: number, z: number, level: number): void {
    const key = this.getLightKey(x, y, z);
    const light = this.getLight(x, y, z);
    light.blockLight = Math.max(0, Math.min(15, level));
    this.lightMap.set(key, light);
    this.propagationQueue.add(key);
  }

  public setSunLight(x: number, y: number, z: number, level: number): void {
    const key = this.getLightKey(x, y, z);
    const light = this.getLight(x, y, z);
    light.sunLight = Math.max(0, Math.min(15, level));
    this.lightMap.set(key, light);
    this.propagationQueue.add(key);
  }

  public propagateLight(): void {
    while (this.propagationQueue.size > 0) {
      const queue = Array.from(this.propagationQueue);
      this.propagationQueue.clear();

      for (const key of queue) {
        const [x, y, z] = key.split(',').map(Number);
        const light = this.getLight(x, y, z);

        // Propagate to neighbors
        if (light.blockLight > 1) {
          this.spreadLight(x + 1, y, z, light.blockLight - 1, 'block');
          this.spreadLight(x - 1, y, z, light.blockLight - 1, 'block');
          this.spreadLight(x, y + 1, z, light.blockLight - 1, 'block');
          this.spreadLight(x, y - 1, z, light.blockLight - 1, 'block');
          this.spreadLight(x, y, z + 1, light.blockLight - 1, 'block');
          this.spreadLight(x, y, z - 1, light.blockLight - 1, 'block');
        }
      }
    }
  }

  private spreadLight(x: number, y: number, z: number, level: number, type: string): void {
    const key = this.getLightKey(x, y, z);
    const light = this.getLight(x, y, z);

    if (type === 'block' && light.blockLight < level) {
      light.blockLight = level;
      this.lightMap.set(key, light);
      this.propagationQueue.add(key);
    }
  }
}
