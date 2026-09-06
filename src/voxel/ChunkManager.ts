import { Chunk, ChunkCoords, CHUNK_SIZE } from './Chunk';
import { ChunkMesher } from './ChunkMesher';
import { BlockRegistry } from './BlockRegistry';
import { Logger } from '../utils/Logger';
import * as THREE from 'three';

const logger = new Logger('ChunkManager');

export class ChunkManager {
  private chunks: Map<string, Chunk> = new Map();
  private chunkMesher: ChunkMesher;
  private blockRegistry: BlockRegistry;
  private renderDistance: number = 8;
  private simulationDistance: number = 12;
  private generationDistance: number = 16;
  private maxChunksLoaded: number = 1024;
  private chunkScene: THREE.Group;

  constructor(blockRegistry: BlockRegistry) {
    this.blockRegistry = blockRegistry;
    this.chunkMesher = new ChunkMesher(blockRegistry);
    this.chunkScene = new THREE.Group();
    this.chunkScene.name = 'ChunkScene';
  }

  public getChunkKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  public getOrCreateChunk(x: number, z: number): Chunk {
    const key = this.getChunkKey(x, z);
    let chunk = this.chunks.get(key);

    if (!chunk) {
      chunk = new Chunk(x, z);
      this.chunks.set(key, chunk);
    }

    return chunk;
  }

  public getChunk(x: number, z: number): Chunk | undefined {
    return this.chunks.get(this.getChunkKey(x, z));
  }

  public updateVisibility(playerChunkX: number, playerChunkZ: number): void {
    const visibleChunks = this.getChunksInRange(
      playerChunkX,
      playerChunkZ,
      this.renderDistance
    );

    // Hide chunks outside render distance
    for (const [key, chunk] of this.chunks) {
      const isVisible = visibleChunks.some(
        c => c.coords.x === chunk.coords.x && c.coords.z === chunk.coords.z
      );

      if (chunk.getMesh()) {
        chunk.getMesh()!.visible = isVisible;
      }
    }
  }

  public meshChunk(x: number, z: number): void {
    const chunk = this.getChunk(x, z);
    if (!chunk || !chunk.needsMesh()) return;

    const neighbors = new Map<string, Chunk>();
    neighbors.set('north', this.getOrCreateChunk(x, z - 1));
    neighbors.set('south', this.getOrCreateChunk(x, z + 1));
    neighbors.set('east', this.getOrCreateChunk(x + 1, z));
    neighbors.set('west', this.getOrCreateChunk(x - 1, z));

    const mesh = this.chunkMesher.mesh(chunk, neighbors);

    if (chunk.getMesh()) {
      this.chunkScene.remove(chunk.getMesh()!);
      chunk.dispose();
    }

    if (mesh) {
      mesh.position.set(
        chunk.coords.x * CHUNK_SIZE,
        0,
        chunk.coords.z * CHUNK_SIZE
      );
      this.chunkScene.add(mesh);
      chunk.setMesh(mesh);
    }
  }

  public getChunksInRange(centerX: number, centerZ: number, range: number): Chunk[] {
    const chunks: Chunk[] = [];

    for (let x = centerX - range; x <= centerX + range; x++) {
      for (let z = centerZ - range; z <= centerZ + range; z++) {
        const chunk = this.getOrCreateChunk(x, z);
        chunks.push(chunk);
      }
    }

    return chunks;
  }

  public getVisibleChunks(): Chunk[] {
    return Array.from(this.chunks.values()).filter(c => {
      const mesh = c.getMesh();
      return mesh && mesh.visible;
    });
  }

  public getLoadedChunkCount(): number {
    return this.chunks.size;
  }

  public getScene(): THREE.Group {
    return this.chunkScene;
  }

  public dispose(): void {
    for (const [_, chunk] of this.chunks) {
      chunk.dispose();
    }
    this.chunks.clear();
  }
}
