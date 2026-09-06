import { Chunk, CHUNK_SIZE, CHUNK_HEIGHT } from '../voxel/Chunk';
import { NoiseGenerator } from '../utils/NoiseGenerator';
import { BiomeSystem, BiomeData } from './BiomeSystem';
import { Logger } from '../utils/Logger';

const logger = new Logger('TerrainGenerator');

export class TerrainGenerator {
  private noiseGen: NoiseGenerator;
  private biomeSystem: BiomeSystem;
  private seed: number;

  private readonly SEA_LEVEL = 64;
  private readonly SURFACE_LAYER = 3; // blocks from surface to bedrock of dirt
  private readonly CAVE_THRESHOLD = 0.4; // Density threshold for caves
  private readonly ORE_DENSITY = 0.1;

  constructor(seed: number) {
    this.seed = seed;
    this.noiseGen = new NoiseGenerator(seed);
    this.biomeSystem = new BiomeSystem();
  }

  public generateChunk(chunk: Chunk): void {
    const cx = chunk.coords.x;
    const cz = chunk.coords.z;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const worldX = cx * CHUNK_SIZE + x;
        const worldZ = cz * CHUNK_SIZE + z;

        // Get climate
        const temperature = this.noiseGen.getTemperature(worldX, worldZ);
        const humidity = this.noiseGen.getHumidity(worldX, worldZ);
        const biome = this.biomeSystem.getBiome(temperature, humidity);

        // Get terrain height
        const terrainNoise = this.noiseGen.getTerrainHeight(worldX, worldZ);
        const height = Math.floor(
          biome.minHeight +
          (biome.maxHeight - biome.minHeight) * (terrainNoise * 0.5 + 0.5)
        );

        // Generate vertical column
        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          let blockId = 0;

          if (y === 0) {
            blockId = 3; // Bedrock
          } else if (y < height - this.SURFACE_LAYER) {
            // Underground
            const caveNoise = this.noiseGen.getCaveNoise(worldX, y, worldZ);
            if (caveNoise > this.CAVE_THRESHOLD) {
              blockId = 3; // Stone
              blockId = this.generateOres(worldX, y, worldZ, blockId);
            } else {
              blockId = 0; // Cave (air)
            }
          } else if (y < height) {
            // Subsurface
            blockId = biome.subsurfaceBlock;
          } else if (y === height) {
            // Surface
            blockId = biome.surfaceBlock;
          } else if (y <= this.SEA_LEVEL && biome.name !== 'ocean') {
            // Water level
            blockId = 5; // Water
          }

          chunk.setBlock(x, y, z, blockId);
        }
      }
    }
  }

  private generateOres(x: number, y: number, z: number, currentBlock: number): number {
    if (currentBlock !== 3) return currentBlock; // Only in stone

    const rand = this.seededRandom(x, y, z);

    // Iron ore (depth varies)
    if (y > 20 && y < 100 && rand < 0.02) return 8; // Iron ore ID
    // Coal ore (surface biased)
    if (y > 30 && y < 120 && rand > 0.02 && rand < 0.05) return 9; // Coal ore ID
    // Gold ore (deep)
    if (y < 40 && rand > 0.05 && rand < 0.06) return 10; // Gold ore ID
    // Diamond ore (very deep)
    if (y < 20 && rand > 0.06 && rand < 0.065) return 11; // Diamond ore ID

    return currentBlock;
  }

  private seededRandom(x: number, y: number, z: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 43.614 + this.seed) * 43758.5453;
    return n - Math.floor(n);
  }
}
