import { PerlinNoise } from './PerlinNoise';

export class NoiseGenerator {
  private perlin: PerlinNoise;
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
    this.perlin = new PerlinNoise(seed);
  }

  // Generate layered noise for terrain height
  public getTerrainHeight(x: number, z: number): number {
    let height = 0;
    let amplitude = 1.0;
    let frequency = 1.0;
    let maxValue = 0;

    // Octave-based noise
    for (let i = 0; i < 5; i++) {
      height += this.perlin.noise(x * frequency * 0.01, z * frequency * 0.01, this.seed) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return height / maxValue;
  }

  // Generate cave noise (3D)
  public getCaveNoise(x: number, y: number, z: number): number {
    let noise = 0;
    let amplitude = 1.0;
    let frequency = 1.0;
    let maxValue = 0;

    for (let i = 0; i < 3; i++) {
      noise += this.perlin.noise(
        x * frequency * 0.02,
        y * frequency * 0.02,
        z * frequency * 0.02
      ) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return noise / maxValue;
  }

  // Biome temperature
  public getTemperature(x: number, z: number): number {
    return this.perlin.noise(x * 0.005, z * 0.005, this.seed) * 0.5 + 0.5;
  }

  // Biome humidity
  public getHumidity(x: number, z: number): number {
    return this.perlin.noise(x * 0.007, z * 0.007, this.seed + 100) * 0.5 + 0.5;
  }
}
