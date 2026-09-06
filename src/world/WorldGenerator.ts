import { Chunk, CHUNK_SIZE, CHUNK_HEIGHT } from '../voxel/Chunk';
import { SimplexNoise } from '../utils/SimplexNoise';
import { Logger } from '../utils/Logger';

const logger = new Logger('WorldGenerator');

export class WorldGenerator {
  private noise: SimplexNoise;
  private seed: number = 12345;

  constructor(seed: number = 12345) {
    this.seed = seed;
    this.noise = new SimplexNoise(() => this.seededRandom());
  }

  public generateChunk(chunk: Chunk): void {
    const cx = chunk.coords.x;
    const cz = chunk.coords.z;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const worldX = cx * CHUNK_SIZE + x;
        const worldZ = cz * CHUNK_SIZE + z;

        // Generate height
        const height = this.getHeight(worldX, worldZ);

        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          let blockId = 0;

          if (y === 0) {
            blockId = 1; // Bedrock layer (represented as grass for now)
          } else if (y < height - 3) {
            blockId = 3; // Stone
          } else if (y < height) {
            blockId = 2; // Dirt
          } else if (y === height) {
            blockId = 1; // Grass
          }
          // else air (blockId = 0)

          chunk.setBlock(x, y, z, blockId);
        }
      }
    }
  }

  private getHeight(x: number, z: number): number {
    const baseHeight = 64;
    const scale1 = 0.01;
    const scale2 = 0.02;
    const scale3 = 0.005;

    const noise1 = this.noise.noise(x * scale1, z * scale1) * 30;
    const noise2 = this.noise.noise(x * scale2, z * scale2) * 20;
    const noise3 = this.noise.noise(x * scale3, z * scale3) * 50;

    return Math.floor(baseHeight + noise1 + noise2 + noise3);
  }

  private seededRandom(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}
