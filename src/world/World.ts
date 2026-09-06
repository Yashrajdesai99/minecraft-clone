import { ChunkManager } from '../voxel/ChunkManager';
import { BlockRegistry } from '../voxel/BlockRegistry';
import { TerrainGenerator } from './TerrainGenerator';
import { StructureGenerator } from './StructureGenerator';
import { CaveGenerator } from './CaveGenerator';
import { WeatherSystem } from './WeatherSystem';
import { Chunk, ChunkCoords } from '../voxel/Chunk';
import { Logger } from '../utils/Logger';

const logger = new Logger('World');

export class World {
  private blockRegistry: BlockRegistry;
  private chunkManager: ChunkManager;
  private terrainGenerator: TerrainGenerator;
  private structureGenerator: StructureGenerator;
  private caveGenerator: CaveGenerator;
  private weatherSystem: WeatherSystem;
  private seed: number = Math.floor(Math.random() * 2147483647);
  private lastPlayerChunkPos: ChunkCoords = { x: 0, z: 0 };
  private meshingQueue: Set<string> = new Set();
  private loadedChunks: Set<string> = new Set();
  private generatingChunks: Set<string> = new Set();

  constructor(seed?: number) {
    this.blockRegistry = new BlockRegistry();
    this.chunkManager = new ChunkManager(this.blockRegistry);
    
    if (seed) {
      this.seed = seed;
    }
    
    this.terrainGenerator = new TerrainGenerator(this.seed);
    this.structureGenerator = new StructureGenerator(this.seed);
    this.caveGenerator = new CaveGenerator(this.seed);
    this.weatherSystem = new WeatherSystem(this.seed);
  }

  public async init(): Promise<void> {
    logger.info(`Initializing world with seed: ${this.seed}`);
    // Generate initial chunks around spawn
    this.generateChunksAround(0, 0, 4);
  }

  public update(playerChunkPos: ChunkCoords, deltaTime: number): void {
    // Update weather
    this.weatherSystem.update(deltaTime);

    // Check if player moved to a different chunk
    if (
      playerChunkPos.x !== this.lastPlayerChunkPos.x ||
      playerChunkPos.z !== this.lastPlayerChunkPos.z
    ) {
      this.onPlayerChunkChanged(playerChunkPos);
    }

    // Update chunk visibility
    this.chunkManager.updateVisibility(playerChunkPos.x, playerChunkPos.z);

    // Process meshing queue (limited per frame)
    let meshesThisFrame = 0;
    const maxMeshesPerFrame = 3;

    for (const key of this.meshingQueue) {
      if (meshesThisFrame >= maxMeshesPerFrame) break;

      const [x, z] = key.split(',').map(Number);
      this.chunkManager.meshChunk(x, z);
      this.meshingQueue.delete(key);
      meshesThisFrame++;
    }
  }

  private onPlayerChunkChanged(chunkPos: ChunkCoords): void {
    this.lastPlayerChunkPos = { ...chunkPos };

    // Generate nearby chunks
    this.generateChunksAround(chunkPos.x, chunkPos.z, 8);

    // Queue remeshing for chunks around player
    for (let x = chunkPos.x - 2; x <= chunkPos.x + 2; x++) {
      for (let z = chunkPos.z - 2; z <= chunkPos.z + 2; z++) {
        const chunk = this.chunkManager.getChunk(x, z);
        if (chunk) {
          this.meshingQueue.add(`${x},${z}`);
        }
      }
    }
  }

  private generateChunksAround(centerX: number, centerZ: number, range: number): void {
    for (let x = centerX - range; x <= centerX + range; x++) {
      for (let z = centerZ - range; z <= centerZ + range; z++) {
        const key = this.chunkManager.getChunkKey(x, z);
        if (!this.loadedChunks.has(key) && !this.generatingChunks.has(key)) {
          this.generatingChunks.add(key);
          const chunk = this.chunkManager.getOrCreateChunk(x, z);
          this.terrainGenerator.generateChunk(chunk);
          this.caveGenerator.generateCaves(chunk);
          this.loadedChunks.add(key);
          this.generatingChunks.delete(key);
          this.meshingQueue.add(key);
        }
      }
    }
  }

  public getBlock(x: number, y: number, z: number): number {
    const chunkX = Math.floor(x / 16);
    const chunkZ = Math.floor(z / 16);
    const localX = x - chunkX * 16;
    const localZ = z - chunkZ * 16;

    const chunk = this.chunkManager.getChunk(chunkX, chunkZ);
    if (!chunk) return 0;

    return chunk.getBlock(localX, y, localZ);
  }

  public setBlock(x: number, y: number, z: number, id: number): boolean {
    const chunkX = Math.floor(x / 16);
    const chunkZ = Math.floor(z / 16);
    const localX = x - chunkX * 16;
    const localZ = z - chunkZ * 16;

    const chunk = this.chunkManager.getChunk(chunkX, chunkZ);
    if (!chunk) return false;

    const success = chunk.setBlock(localX, y, localZ, id);
    if (success) {
      this.meshingQueue.add(this.chunkManager.getChunkKey(chunkX, chunkZ));
      // Also queue neighbor chunks if on boundary
      if (localX === 0) this.meshingQueue.add(this.chunkManager.getChunkKey(chunkX - 1, chunkZ));
      if (localX === 15) this.meshingQueue.add(this.chunkManager.getChunkKey(chunkX + 1, chunkZ));
      if (localZ === 0) this.meshingQueue.add(this.chunkManager.getChunkKey(chunkX, chunkZ - 1));
      if (localZ === 15) this.meshingQueue.add(this.chunkManager.getChunkKey(chunkX, chunkZ + 1));
    }
    return success;
  }

  public getVisibleChunks(): Chunk[] {
    return this.chunkManager.getVisibleChunks();
  }

  public getChunkManager(): ChunkManager {
    return this.chunkManager;
  }

  public getBlockRegistry(): BlockRegistry {
    return this.blockRegistry;
  }

  public getLoadedChunkCount(): number {
    return this.chunkManager.getLoadedChunkCount();
  }

  public getVisibleChunkCount(): number {
    return this.getVisibleChunks().length;
  }

  public getSeed(): number {
    return this.seed;
  }

  public getWeather(): any {
    return this.weatherSystem.getWeather();
  }

  public save(): void {
    logger.info('Saving world...');
    // TODO: Implement save system
  }

  public dispose(): void {
    this.chunkManager.dispose();
  }
}
